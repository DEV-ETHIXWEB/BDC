# Reviews: how they get on the site

Clinton's message was "I've had several reviews done but I don't see any on the webpage." He was
right, and the page literally said *"There are no reviews on this page yet."* That is fixed. His
three Google reviews now appear on the home page, the contact page, his own page and the reviews
page, with the 5.0 rating shown and marked up for Google.

## Where they come from

Two sources, and the site merges them.

**1. `src/data/reviews.ts` — typed in by hand.** What is live right now. Transcribed from the
Google Business Profile dashboard on 16 October 2026: 5.0 from 3 reviews.

**2. `/api/reviews` — live from Google.** Already built, already deployed, currently dormant
because two environment variables are missing. Set them and new reviews appear on their own,
with no code change and no deploy. Reviews from Google are de-duplicated against the hand-typed
list by reviewer name, so nobody ever shows twice.

### Switching the live feed on

Two variables in Vercel, both type **Secret**, never prefixed `PUBLIC_`:

| Variable | Where to get it |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console → enable **Places API (New)** → create an API key. Restrict it to that one API. |
| `GOOGLE_PLACE_ID` | Open the Business Profile on Google Maps, press Share, and copy the link. Or use Google's Place ID Finder: https://developers.google.com/maps/documentation/places/web-service/place-id — search the business and copy the ID beginning `ChIJ`. |

The endpoint caches for six hours, so it costs roughly four Google calls a day whatever the
traffic. Check it worked by opening `/api/reviews`: `configured` should flip from `false` to
`true`.

Once that is on, this file's hand-typed list can stay as a safety net or be emptied. Leaving it
costs nothing because of the de-duplication.

## Adding a review by hand

For anything Google cannot see, a Facebook recommendation, an email, a text message:

```ts
{
  name: 'Dave R.',
  text: 'Exactly what they wrote. Do not tidy it up.',
  rating: 5,
  when: 'September 2026',
  source: 'Facebook',
}
```

Then update `REVIEW_SUMMARY` in the same file so the rating and the count still match what the
Google profile shows. The markup is generated from that object, so the two cannot drift.

## The one rule

Every review must be something a real guest actually wrote.

This is not caution for its own sake. Invented testimonials break the FTC's rule on fake reviews,
which carries a penalty per violation, and Google removes reviews and suspends Business Profiles
for review manipulation. For a guide service the real cost is not the fine, it is the profile that
the whole local search presence depends on.

Making a short list *look* generous is a different thing and is entirely fair: the wall loops the
real reviews so three of them read as a continuous stream, and the only number stated anywhere is
the true one.

## Two things worth knowing

**Ryan Taylor's review is cut short.** The Business Profile dashboard truncated it at
"...as it was...". Only the visible part is published, with an ellipsis, because the rest of a
guest's sentence is not ours to write. Open that review on Google, copy the full text, and paste
it over the short version.

**Lance Mcculloch shares Clinton's surname.** His five stars count toward the 5.0 and the total of
three, because that is what Google shows. He is deliberately not given a review card: a reviewer
with the owner's surname reads as a family member to anyone paying attention, and Google's own
policy treats reviews from people with a conflict of interest as ineligible. Counting it is
honest; featuring it would invite the wrong question.

## What actually moves this forward

Three reviews is thin, and the first ten matter most for local ranking. Review signals are roughly
a fifth of local pack weight, and steady recent reviews count for more than a big old total. The
highest-value thing Clinton can do is ask every guest at the end of the trip, while they are still
holding the fish.

A direct link to the review form is worth having on his phone: open the Business Profile, press
**Ask for reviews**, and Google generates a short link to send by text.
