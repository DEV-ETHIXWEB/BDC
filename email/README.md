# Email templates

Two templates, both in the site's colours with the crest at the top.

| File | Goes to | When |
| --- | --- | --- |
| `confirmation-to-guest.html` / `.txt` | the visitor | the moment they submit any form on the site |
| `lead-to-captain.html` / `.txt` | Captain Clinton | the same moment, as the lead |

Each has an HTML part and a plain-text part. Send **both** as a `multipart/alternative`
message: clients that block HTML fall back to the text, and sending HTML alone is one of
the strongest spam signals there is.

## Template variables

Placeholders use `{{name}}` and `{{#if name}}…{{else}}…{{/if}}`, which is what SMTP2GO's
template editor understands. Every field below is already POSTed by the site's forms, so
nothing in `src/` has to change to feed these.

| Field | Booking form | Quick request (home hero) | Contact form |
| --- | --- | --- | --- |
| `name` | yes | yes | yes |
| `phone` | yes | yes | optional |
| `email` | yes | **no** | yes |
| `trip` | yes | yes | yes |
| `guests` | yes | no | no |
| `date` | yes | yes | no |
| `message` | optional | no | yes |
| `topics` | no | no | yes |
| `page` | no | yes | yes |

Anything missing is wrapped in `{{#if}}`, so a quick request with no email address renders
without the Email row and without the "Reply by email" button. Both templates were rendered
against a full payload and a minimal one; neither leaves a stray placeholder on the page.

> The guest confirmation needs `email` to have somewhere to go. The quick-request bar on the
> home page does not collect one, so **only the captain's lead fires for that form** unless
> you add an email field to it first.

## Suggested subject lines

- Guest: `We have your request, {{name}}`
- Captain: `New trip request: {{name}} — {{trip}}`

## Wiring up SMTP2GO later

1. **Verify the sending domain.** In SMTP2GO add `bdcguideservices.com` as a sender domain and
   publish the CNAME records it gives you for DKIM, plus an SPF record. Do not send from
   `clinton.mcculloch5150@gmail.com` as the `From` address — Gmail's DMARC policy will have it
   rejected or binned. Send from something like `bookings@bdcguideservices.com` and set
   `reply_to` to his Gmail so replies still land in his inbox.
2. **Add both templates** under *Templates* in the SMTP2GO dashboard, pasting the HTML part and
   the text part. Note the two template IDs.
3. **Point the site at a handler.** `PUBLIC_FORM_ENDPOINT` in `.env` currently has no value, so
   the forms fall back to opening the visitor's mail app and say plainly that nothing was sent.
   Set it to a small endpoint (a serverless function is enough) that receives the form JSON and
   makes two calls to `https://api.smtp2go.com/v3/email/send`:

   ```jsonc
   {
     "api_key": "…",
     "sender": "BDC Guide Service <bookings@bdcguideservices.com>",
     "to": ["{{guest email}}"],              // or the captain's address for the lead
     "reply_to": "clinton.mcculloch5150@gmail.com",
     "template_id": "…",
     "template_data": { "name": "…", "phone": "…", "trip": "…", "date": "…", "guests": "…", "message": "…" }
   }
   ```

   Return a 2xx only once SMTP2GO accepts it. The forms treat a confirmed 2xx as "sent" and
   anything else as an error, which is what keeps the site from ever claiming a delivery that
   did not happen.
4. **Keep the API key server-side.** Anything named `PUBLIC_*` is compiled into the browser
   bundle. The SMTP2GO key must live on the endpoint, never in this repo and never in a
   `PUBLIC_` variable.
5. **Send a live test** to a Gmail, an Outlook and an iCloud address before going live.

## Previewing a change

```bash
npm run build && npx astro preview --port 4371 &   # serves /icon-512.png for the crest
node email/preview.mjs                              # writes rendered samples next to the templates
```

## If the season copy changes

The guest email prints the fishing year. Those months are mirrored from
`src/data/seasons.ts` — if the captain revises a season there, update the table in
`confirmation-to-guest.html` and `confirmation-to-guest.txt` to match. Everything else in the
emails (phone, prices, links) is mirrored from `src/data/site.ts` and `src/data/trips.ts`.

## Notes on the HTML

Table-based layout, inline styles, 600px wide, no web fonts, bulletproof VML buttons for
Outlook, a hidden preheader line, and `@media` rules that stack the columns under 620px.
Both files are well under Gmail's 102 KB clipping limit. The crest is loaded from
`https://www.bdcguideservices.com/icon-512.png`, so **the site must be deployed for the logo
to appear** — the file is served from `public/icon-512.png`.
