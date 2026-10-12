# SEO: what is implemented, and what is deliberately not

Audited against the criteria in the `claude-seo` skill set (local SEO, schema, GEO/AI search,
technical). `qa/seo_audit.py` enforces the result: 38 checks, run as part of every QA round.

## The shape of this business

The skill set asks you to classify the business first, because the checks differ. This is a
**Service Area Business**, not brick-and-mortar: Captain Clinton publishes no street address, and
the meeting point is given at booking because it changes with the season and the river. So the
physical-address and embedded-map checks do not apply, and `areaServed` carries the geography
instead. Vertical is closest to **home services**: service area, licensed and insured, one captain.

## Implemented

### Crawl and indexing

| Change | Why |
| --- | --- |
| `<lastmod>` on all 40 sitemap URLs | There were none. A crawler had no way to tell a page changed yesterday from one untouched for a year. Dates come from the last commit that touched each page's source file, or the post's own `updated:`. Build time was rejected: it would claim every page changed on every deploy, which is false and teaches Google to ignore the field. |
| Image sitemap, 17 entries | People search for pictures of fish. The gallery is real catch photos with honest alt text, and the page sitemap carries page URLs only. Generated after the build, because Astro content-hashes images and the real URLs only exist once it has run. |
| Titles trimmed to 60 chars, descriptions to 160 | 4 titles and 6 descriptions were being cut off mid-sentence in results. The layout's brand-suffix rule capped at 65; Google truncates nearer 60. |
| Explicit AI crawler permissions in `robots.txt` | `User-agent: *` already allowed them, so this changes nothing today. It records the decision, so a future tightening of the wildcard cannot silently cost AI visibility. Each bot controls a different surface: `Google-Extended` is Gemini grounding, `OAI-SearchBot` is ChatGPT citability, `Claude-SearchBot` is Claude's. |
| `/llms.txt` | Generated from the same data as the pages, so it cannot drift. See the honesty note below. |

### Schema

Already strong before this pass, and verified rather than changed: `LocalBusiness` +
`SportsActivityLocation` with a stable `@id`, `BreadcrumbList` on every page, `TouristTrip` per
trip with `provider` pointing at the business, `Article` per post, `WebSite`, `FAQPage`.

Added: `dateModified` on posts, from the last commit that touched the Markdown. Recency is one of
the strongest AI-citation signals, and a date that quietly tracked the build would be a lie told on
every deploy.

`FAQPage` is kept although Google retired FAQ rich results for all sites on 7 May 2026. It no
longer earns a SERP feature, but it is still valid machine-readable Q&A and costs nothing.

### AI search (GEO)

Roughly 44% of AI citations come from the first 30% of a page, and the opening block is what gets
quoted. Three pages opened with nothing quotable:

- Target species was "What's biting, when, and how we catch it."
- FAQs was "Everything you need to know before your trip."
- Captain was "Over 45 years fishing the waters of Oregon."

All three now open with specific, self-contained facts drawn from `seasons.ts`, `trips.ts` and the
FAQs. **The length was measured, not guessed.** A first attempt at 32-39 words pushed the request
bar below the fold: on a phone the species page lost 155px and the bar ended up 48px out of sight.
That would have traded a booking for a citation. The shipped ledes are 13-20 words and leave the
bar above the fold at every width tested.

## Deliberately not done

Each of these would raise a score and damage the business.

**`aggregateRating` in schema.** There are no reviews yet. Marking up a rating that does not exist
is fabricated structured data, against Google's guidelines, and grounds for a manual action.
The review feed is built and waiting; the fix is to ask past guests, not to invent stars.

**`geo` coordinates.** The skill recommends them with five decimal places. Captain Clinton asked
for the address to be removed from the site. Precise coordinates would put it back in a form that
is machine-readable and harder to retract. `areaServed` carries the geography without doing that.

**`openingHoursSpecification`.** Nobody has told us his hours. "Businesses open at search time rank
higher" is a real factor, so this is worth filling in, but only with real hours from him.

**Per-river location pages.** The skill rates dedicated service pages the #1 local organic factor,
and six trip pages already exist. Per-river pages would need real substance per river: access
points, how the water behaves through the season, how the trip differs. Generated from nothing they
become doorway pages, which is the exact pattern Google penalised in the March 2024 core update.
Worth doing properly with half an hour of the captain's time per river.

### About `llms.txt`

It is here because it is free and harmless. It is **not** a ranking lever: Google has said AI-text
files like this are not used by Search, and no major AI provider has confirmed reading one. Anyone
selling it as an SEO win is overselling. The work that actually earns AI citations is the rest of
this document: server-rendered HTML, clean headings, direct answers near the top of the page, and
correct schema.

## What moves the needle next, in order

1. **Reviews.** Review signals are about 20% of local pack weight, the first ten matter most, and
   the site already has a working Google feed with nothing to show. Ask every past guest. This is
   the single biggest gap and no amount of code closes it.
2. **Google Business Profile.** Primary category is the strongest single local-pack factor, and the
   wrong one is the strongest negative. Separate guidance has been provided.
3. **The domain split.** `bdcguideservices.com` still serves the previous site. Two sites with the
   same content divide the authority between them. A 301 to `bestdayscatching.com` fixes it.
4. **Publishing cadence.** Content under three months old is roughly three times more likely to be
   cited in an AI answer. The blog now takes a Markdown file; see `docs/WRITING-ARTICLES.md`.
