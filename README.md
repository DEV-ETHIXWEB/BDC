# BDC Guide Service

Website for BDC Guide Service, Oregon salmon, steelhead and Dungeness crab charters with Captain Clinton McCulloch.
Live domain: https://www.bdcguideservices.com

Built with **Astro** (static, SEO-first) and **React Aria Components** (Adobe's headless layer under Spectrum 2) for the
interactive parts only. Design system: [docs/design-system.md](docs/design-system.md). **Launch status, blockers and handover: [docs/HANDOVER.md](docs/HANDOVER.md).** Tests: [qa/README.md](qa/README.md).

## Commands
| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22.12+) |
| `npm run dev` | Dev server at http://localhost:4321 (also serves `/dev/styleguide`) |
| `npm run build` | Build to `dist/` (39 static pages, AVIF/WebP images) |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check (`astro check`) |
| `npm run lint` | ESLint |

## Deploy (static, any host)
Publish `dist/`: build command `npm run build`, output directory `dist`.
`vercel.json`, `public/_headers` and `public/_redirects` are generated from `config/` on every build (headers, 301 redirects, immutable caching). A Content-Security-Policy is generated from the built pages after the build. Set the environment variables in `.env.example` on the host. Vercel steps (including the optional `REQUIRE_FORM_ENDPOINT` build guard) are in [docs/HANDOVER.md](docs/HANDOVER.md#6-deploy-on-vercel).
The domain is set in `astro.config.mjs` (`site`) and `src/data/site.ts`; canonicals, sitemap and robots.txt follow it.
Every URL from the previous site's sitemap exists at the same address (trip pages, articles, the article index, the captain profile and all 16 photo pages), so search rankings carry over and no redirects are needed. `python qa/old_site_parity.py` checks it.

## What is in the site
- Custom "river survey" design in the logo palette (deep navy, forest green, cream); custom 79-icon set in `src/components/icons/paths.ts`.
- Home: animated hero, offer tickets, trip board, captain story, river chart, fishing-season calendar, species field guide, gallery strip, FAQ.
- Trips: `/oregon-fishing-charter-rates` (live-price trip planner) and six trip pages under `/oregon-fishing-charter-rates/<slug>`.
- Species, captain, gallery (with lightbox) and 16 photo pages, reviews, reports, FAQ, contact, articles and the author profile, legal pages, 404.
- A one-row "Request a trip" bar in the home hero (trip, date, name, phone), visible without scrolling on desktop and phone.
- An "Ask the captain" contact form at the bottom of every page (the trip pages and Contact Us carry the full trip-request form instead).
- Chat assistant (answers only from real site data, honest phone/email fallback, small clay "Powered by ETHIXWEB" badge) and an accessibility panel (text size,
  contrast, links, motion, dyslexia font, larger cursor).
- SEO: unique titles/descriptions, canonicals, Open Graph/Twitter, JSON-LD (business, trips, FAQ, breadcrumbs), sitemap, robots.
- Page transitions, scroll reveals and parallax (all off under `prefers-reduced-motion` and with JavaScript disabled).

## Things you edit (all in `src/data`)
- `site.ts`: phone, email, address, nav, footer links.
- `trips.ts`: the six trips, prices, official descriptions, SEO titles.
- `policies.ts`: the client's booking terms and the cited regulations. `seasons.ts`: the single source for fishing seasons.
- `coupons.ts`: the offer tickets. Add a `code` once a real promo is approved. No discounts are invented.
- `content.ts`: species and FAQs (FAQs also feed FAQPage structured data and the chat assistant).
- `photos.ts`: photo registry. Masters live in `src/assets/photos` (rebuilt from the old site's originals by `scripts/process-photos.py`); `PHOTO_META` records the largest size each can be shown sharply. `photo-pages.ts`: the 16 photo pages (old URLs, titles, meta text). `articles.ts`: the two articles.
- `src/pages/oregon-fishing-charter-reviews.astro`: add real reviews to the `reviews` array. No rating markup is emitted until there are real reviews.
- Forms (trip request and the site-wide contact form): set `PUBLIC_FORM_ENDPOINT` (Formspree, Basin, etc.) at build time to POST requests. Without it the build still succeeds (with a warning) and each form opens the visitor's email app pre-filled and says it is not sent yet.

## Before going live
1. Have the terms of service and privacy policy reviewed by a lawyer; add real deposit, cancellation and weather policies.
2. Confirm the booking flow (existing booking link vs the form) and set the form endpoint.
3. Add real reviews and any approved promo codes.
4. Add analytics only after updating the privacy policy.
