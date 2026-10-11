# Growth actions: what is done, what needs Clinton

Written against an SEO and marketing plan reviewed on 11 October 2026. Every claim in that plan
was checked against the live site before anything was changed. Three of its findings were wrong,
and acting on them would have made the site worse, so they are recorded here with the evidence.

## Done in this pass

| Item | What changed |
| --- | --- |
| Home H1 had no keywords | It read "Explore like never before", which says nothing and ranks for nothing. It now reads "Salmon, steelhead and crab." The badge above it already says "Oregon fishing charters", so naming the three species complements it rather than repeating it. Measured at 8 viewports first: it costs exactly the same vertical space as the old line, so the request bar sits where it did. |
| The blog was unreachable | `/article` was in no navigation anywhere. "Articles" is now in the main nav and the mobile drawer. Verified at 18 widths: 7 items fit from 1100px up with no overlap and no change to header height. |
| Posts did not link to trips | The crab section of the season post now links to the crabbing charter, the steelhead section to the drift boat trip, and the boat post links all six trips by name. A reader at the crab paragraph lands on the crab trip, not a rates index. |

## Three findings in that plan that were wrong

**"The FAQ answers may not be visible to search engines."** `FAQPage` structured data is already
present on both `/fishing-faqs` and `/`. Nothing to fix.

**"Gallery captions call crab and steelhead photos Clackamas River."** They do not. Captions
describe only what is in frame: "Two anglers, one fish", "Channel marker", "Sonar on board".
This is deliberate, and `docs/HANDOVER.md` requires it, because a caption naming a river is a
claim nobody has verified. Rewriting them to name rivers would break that rule.

**"His homepage covers everything, so nothing ranks for anything specific. Build separate pages
for Dungeness crabbing charters."** Six dedicated trip pages already exist, two of them for
crabbing, plus a target species page. This is largely already built.

## Needs a decision from Clinton before it can be built

Each of these is blocked on information only he has. None of it should be invented.

**Social links.** The site has none, and the plan is right that it should. Needs the actual
Facebook and Instagram URLs. A guessed handle that 404s is worse than no link.

**Gift certificates.** The plan is right that December gift searches are real and he has no
offer. A page needs: the price or denominations, how long it stays valid, whether it is
transferable, how it is redeemed, and what happens if it is unused. These are business and
possibly legal terms, not copy.

**Deposit to hold a date.** Same problem. `docs/HANDOVER.md` already lists booking, deposit and
waiver as open blockers.

**River pages.** The plan suggests a page each for Clackamas, Sandy, Columbia and Willamette
steelhead and Chinook. The rivers are already named in the FAQ, but a page per river needs real
substance per river: access points, what the water does through the season, how the trip differs.
Generating that from nothing produces thin doorway pages, which Google penalises. This is worth
doing properly with half an hour of his time per river.

**Shad and sturgeon months.** `src/data/seasons.ts` flags both as unconfirmed, and the site says
so in those words. The plan says to confirm or remove them. He asked for both species to be
added, so removing them contradicts him: what is needed is the months.

## Client-side work, no code involved

Already covered in the Google Business Profile guidance given separately: categories "Fishing
charter" and "Fishing guide", the seven rivers as service area, weekly photos, weekly posts, and
a review request to every past client. The review request matters most, because the site has a
working Google review feed waiting on reviews that do not exist yet.

Beyond that: Facebook and Instagram posting, Oregon and Washington fishing groups, an email or
text list for "steelhead dates open" in November and "spring Chinook dates open" in January, and
tackle shop and lodging partnerships. All of it is his to do, and all of it is sound.

## The domain question

The plan flags a split between `bdcguideservices.com` and `bestdayscatching.com`. This is real
and already diagnosed: `bestdayscatching.com` is the live site, and `bdcguideservices.com` still
serves the previous site. Two sites with the same content split the search authority. The fix is
a 301 from the old domain to the new one, which needs access to the old domain's DNS or host.

## One thing worth a look

Every photo page URL begins `clackamas-`, including `dungeness-crab-bucket-clackamas-2297`.
Dungeness crab are caught in coastal bays, not in the Clackamas. The slug carries a claim the
captions were careful not to make. These URLs came from the previous site and are part of the
37 URL parity test, so changing them breaks that and needs a redirect plan. Flagging rather than
touching it.
