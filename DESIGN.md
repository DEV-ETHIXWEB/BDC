# BDC Guide Service: design brief (READ FIRST)

Owner feedback on v1: "looks like a template, ~20% done", icons not perfect, photos blurry, must be flawless on
EVERY device (phone, tablet, laptop, desktop, ultrawide), wants premium animation and a custom-built feel.
Goal: every page must feel hand-built for an Oregon river guide. Not a SaaS card kit.

## Concept: "River survey"
A field-guide / nautical-survey aesthetic drawn from the crest: contour lines and flowing river lines, chart
annotations, specimen-tag trip tickets, a real fishing-season calendar, blueprint boat drawings, tide-table style
data rows. Big condensed type (Barlow Condensed) with confident scale contrast; Figtree body.
Spend boldness in ONE memorable moment per page; keep the rest disciplined. Vary section rhythm: never two
adjacent sections with the same layout, no repeated identical rounded-card grids, no generic eyebrow+H2+grid pattern.
Avoid: all-caps tracked eyebrows above every heading, numbered 01/02/03 markers on non-sequences, gradient-wash
decoration, one shadow on every card, "→" appended to every link.

## Palette (from the logo; do not add other hues)
navy-950 #061a26, navy-900 #0b2434, navy-800 #0d2e3b, navy-700 #153f52, navy-600 #1f5468, rim #24457a,
pine-800 #234a34, pine-700 #2c5a3f, pine-600 #3a6f4f, pine-500 #4f8a63, pine-200 #bfd6c5,
cream-50 #fdfbf3, cream-100 #faf6e8, cream-200 #f1ebd3, cream-300 #e3dbbc, steel #809296. Tokens live in
src/styles/global.css as CSS variables. Header, coupons, footer and hero are DEEP navy. Cream is the page paper.

## Real facts only (never invent)
Phone (503) 826-7294, clinton.mcculloch5150@gmail.com, meet at 9018 Southeast Bridge Crk Ct, Happy Valley, OR 97015.
Trips/prices/boats in src/data/trips.ts; species+FAQ in src/data/content.ts; rivers in src/data/site.ts.
No fake reviews, ratings, discounts, or stats. Season facts: steelhead Jan-Apr, spring/early-summer Chinook
(more in fall), crab Oct-Dec, trips scheduled from 3rd week of September.

## File ownership (ONLY edit files you own; append-only to shared data)
- core: src/styles/global.css, src/layouts/Base.astro, Header.astro, Footer.astro, Wave.astro, src/scripts/*, astro.config.mjs
- images: src/assets/photos/*, src/data/photos.ts, scripts in /tmp scratch
- icons: src/components/icons/paths.ts, Icon.astro, react/Icon.tsx
- home-top: src/components/home/Hero.astro, Offers.astro, Trips.astro, src/components/TripCard.astro, Coupon.astro, src/styles/home-top.css
- home-mid: src/components/home/Story.astro, Rivers.astro, Calendar.astro, Species.astro, src/styles/home-mid.css
- home-bottom: src/components/home/GalleryStrip.astro, HomeFaq.astro, Cta.astro, CtaBand.astro, react/Faq.tsx,
  pages oregon-fishing-charter-photos, -reviews, oregon-fishing-reports, src/styles/gallery.css
- trips: pages oregon-fishing-charter-rates, trips/[slug], react/BookingForm.tsx, src/styles/trips.css
- pages: pages oregon-fishing-species, captain-clinton-mcculloch-of-oregon, contact-us, fishing-faqs, things-to-do-in-oregon,
  oregon-fishing-license, terms, privacy, sitemap, 404; PageHero.astro; src/components/art/* (boat blueprints etc.); src/styles/pages.css
- widgets: react/Chatbot.tsx, A11yPanel.tsx, MobileMenu.tsx, brain.ts, src/styles/widgets.css
- src/pages/index.astro composes home components; only the lead edits it.
New CSS goes in your own src/styles/<area>.css, imported from your component/page frontmatter
(`import '../styles/x.css'`). Never edit global.css unless you are core. Prefix your class names with your area
(e.g. .ht-hero, .hm-rivers) to avoid collisions. Use only CSS variables from global.css.

## Motion contract (core implements src/scripts/motion.ts + CSS; everyone just uses the attributes)
- data-reveal="up|fade|mask|scale|line"  element animates in when scrolled into view
- data-stagger on a parent: children with data-reveal get 70ms staggered delays
- data-parallax="0.12" gentle vertical parallax speed on an element (transform only)
- data-count="45" data-count-suffix="+" numbers count up when visible
- data-magnetic on buttons: subtle magnetic hover
- Split headline: <h1 data-split> reveals by line/word with a mask.
Rules: transform/opacity only; 60fps; every effect off under prefers-reduced-motion and html[data-motion=reduce];
content must be fully visible with JS disabled (progressive enhancement: hidden state applied only when
html.js-motion is set). Astro View Transitions (ClientRouter) give page transitions; components that need JS must
re-init on `astro:page-load`.

## Responsive contract (every device)
Test widths: 320, 375, 390, 430, 600, 768, 820, 1024, 1180, 1280, 1440, 1728, 1920, 2560. Mobile-first. Fluid type
and spacing via clamp(). Container --maxw 1240px, max 1440px on >=1600. Touch targets >=44px. No horizontal scroll
at any width. Tablet portrait (768-1024) must have its own considered layout, not stretched mobile. Ultrawide must not
look empty or stretched. Use container queries where a component lives in different widths. Images: srcset+sizes,
aspect-ratio set (no CLS), lazy except LCP. Hover effects only under @media (hover:hover).

## Images
Sources are 250-960px phone photos; real detail is limited. Never display a photo larger than its `maxDisplay` in
src/data/photos.ts meta (images agent supplies it). Prefer art-direction crops, tight framing on subject, and a
subtle unified grade over blowing images up. Small sources belong in smaller frames (polaroid/specimen-tag style).

## Icons
Icon names come from src/components/icons/paths.ts (keep every existing name; add new ones freely). Icons are
custom, optically balanced, 24 grid, consistent stroke, duotone. Use <Icon name=... /> (Astro) / <Icon/> (React).

## Definition of done (per area)
1 `npm run build` passes. 2 Screenshot at 390, 820, 1280, 1920 looks intentional, no overflow, no CLS.
3 axe clean, one h1, headings in order. 4 Motion respects reduced-motion. 5 Copy is real, active voice, sentence case.
6 You critique your own screenshots and iterate at least twice before reporting.
Dev server: http://localhost:4322 (astro dev, HMR). Playwright venv: see report instructions in your prompt.
