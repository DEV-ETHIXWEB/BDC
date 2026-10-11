# Adding an article

Articles live as plain text files in `src/content/blog/`. You add one by adding a file. No
code, no developer.

## Steps

1. Create a file in `src/content/blog/` named after the web address you want. Use lowercase
   words joined by hyphens, ending in `.md`. For example
   `best-month-for-winter-steelhead.md` becomes
   `https://www.bestdayscatching.com/article/best-month-for-winter-steelhead`.
2. Paste this block at the very top of the file. It has to be the first thing in the file,
   including the two lines of three dashes.

   ```
   ---
   title: Best month for winter steelhead
   description: One or two sentences that show up on Google and on the articles page.
   published: 2026-10-11
   icon: steelhead
   tag: Trip prep
   ---
   ```

3. Write the article underneath it, in normal sentences. Start a heading with `## ` and leave
   a blank line between paragraphs. That is the whole format.
4. Commit the file. The site rebuilds and the article appears on `/article`, in the sitemap
   and in Google, newest first.

## The fields

| Field | Required | What it does |
| --- | --- | --- |
| `title` | yes | The headline. Keep it under 70 characters so Google does not cut it off. |
| `description` | yes | The sentence under the headline on `/article`, and the text Google shows in search results. Keep it under about 160 characters. |
| `published` | yes | The date, written `YYYY-MM-DD`. Articles are listed newest first. |
| `updated` | no | Date of a later revision, same format. Shows as "Updated ..." under the byline. |
| `icon` | no | The small picture on the article card. Defaults to a document. |
| `tag` | no | The little label above the headline. Defaults to "From the captain". |
| `draft` | no | Write `draft: true` to keep an unfinished article off the site. It stays out of `/article`, out of the sitemap, and tells Google not to index it. Delete the line when you are ready to publish. |

## Icon names

Pick whichever fits: `fish`, `salmon`, `steelhead`, `crab`, `dungenessCrab`, `boat`,
`driftBoat`, `anchor`, `lifeJacket`, `net`, `cooler`, `rod`, `hook`, `lure`, `map`,
`compass`, `mountain`, `sun`, `sunrise`, `cloudRain`, `wind`, `thermometer`, `tide`, `wave`,
`users`, `calendar`, `clock`, `license`, `report`, `camera`, `star`, `shieldCheck`.

## Formatting

```
## A heading

A normal paragraph. Leave a blank line before the next one.

- a bullet
- another bullet

**Bold text** and *italic text*.

[A link to the rates page](/oregon-fishing-charter-rates)
```

An "On this page" menu appears by itself once an article has more than two `##` headings.

## Two things to watch

**Only write what is true and already settled.** Seasons, prices, what is included, group
sizes and licence rules are all published elsewhere on the site and have to match. If an
article says something the rest of the site does not, the article is the thing that is wrong.
When in doubt, leave it out.

**Dates with no quotes are fine.** `published: 2026-10-11` and `published: "2026-10-11"` both
work.

## If something is wrong

The build fails loudly and names the file and the field, for example
`published must be YYYY-MM-DD`. Fix that field and commit again. A broken article never
reaches the live site.
