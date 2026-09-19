# BDC Guide Service

Website for BDC Guide Service, Oregon salmon, steelhead and Dungeness crab charters with Captain Clinton McCulloch.
Live domain: https://www.bdcguideservices.com

Built with **Astro** (static, SEO-first) and **React Aria Components** (Adobe's headless layer under Spectrum 2) for the
interactive parts only. Design concept, palette, motion and responsive rules are in [DESIGN.md](DESIGN.md).

## Commands
| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22.12+) |
| `npm run dev` | Dev server at http://localhost:4321 (also serves `/dev/styleguide`) |
| `npm run build` | Build to `dist/` (21 static pages, AVIF/WebP images) |
| `npm run preview` | Serve the production build locally |

## Deploy (static, any host)
Publish `dist/`: build command `npm run build`, output directory `dist`.
`vercel.json` (Vercel) and `public/_headers` (Netlify, Cloudflare Pages) set security headers and immutable asset caching.
The domain is set in `astro.config.mjs` (`site`) and `src/data/site.ts`; canonicals, sitemap and robots.txt follow it.
Old URLs from the previous site are kept so existing search rankings carry over.

## What is in the site
- Custom "river survey" design in the logo palette (deep navy, forest green, cream); custom 79-icon set in `src/components/icons/paths.ts`.
- Home: animated hero, offer tickets, trip board, captain story, river chart, fishing-season calendar, species field guide, gallery strip, FAQ.
- Trips: `/oregon-fishing-charter-rates` (live-price trip planner) and six trip pages under `/trips/<slug>`.
- Species, captain, gallery (with lightbox), reviews, reports, FAQ, contact, guides, legal pages, 404.
- Chat assistant (answers only from real site data, honest phone/email fallback) and an accessibility panel (text size,
  contrast, links, motion, dyslexia font, larger cursor).
- SEO: unique titles/descriptions, canonicals, Open Graph/Twitter, JSON-LD (business, trips, FAQ, breadcrumbs), sitemap, robots.
- Page transitions, scroll reveals and parallax (all off under `prefers-reduced-motion` and with JavaScript disabled).

## Things you edit (all in `src/data`)
- `site.ts`: phone, email, address, nav, footer links, booking URL.
- `trips.ts`: the six trips, prices, copy, SEO titles.
- `coupons.ts`: the offer tickets. Add a `code` once a real promo is approved. No discounts are invented.
- `content.ts`: species and FAQs (FAQs also feed FAQPage structured data and the chat assistant).
- `photos.ts`: photo registry. Masters live in `src/assets/photos`; `PHOTO_META` records the largest size each can be shown sharply.
- `src/pages/oregon-fishing-charter-reviews.astro`: add real reviews to the `reviews` array. No rating markup is emitted until there are real reviews.
- Booking form: set `PUBLIC_FORM_ENDPOINT` (Formspree, Basin, etc.) at build time to POST requests. Without it, the form opens the visitor's email app pre-filled.

## Before going live
1. Have the terms of service and privacy policy reviewed by a lawyer; add real deposit, cancellation and weather policies.
2. Confirm the booking flow (existing booking link vs the form) and set the form endpoint.
3. Add real reviews and any approved promo codes.
4. Add analytics only after updating the privacy policy.
