# BDC Guide Service: design system

## Concept: "River survey"
A field-guide / nautical-survey aesthetic drawn from the crest: contour lines and flowing river lines, chart annotations,
specimen-tag trip tickets, a fishing-season calendar, blueprint boat drawings and tide-table style data rows. Barlow Condensed
for display type, Figtree for body. One bold moment per page; the rest stays disciplined. Adjacent sections never share a layout.

## Palette (taken from the logo)
Updated 2026-09-27 for the new circular chrome-and-blue crest (was the flat navy/forest-green/cream shield). Same token
names in `src/styles/global.css`, new values, so every component that referenced a token picked up the new hue automatically.

| Token | Hex |
| --- | --- |
| navy-950 / 900 / 800 / 700 / 600 | #04101f / #071b33 / #0c2c52 / #123f74 / #1a56a0 |
| rim | #2166c9 |
| pine-800 / 700 / 600 / 500 / 200 | #0a3f52 / #0c5670 / #0e6f90 / #22a4cf / #bfe6f2 |
| cream-50 / 100 / 200 / 300 | #fbfcfe / #f3f7fb / #e7eef5 / #d3e0ea |
| steel | #7a8b9c |
| brass (highlight on dark surfaces: coupon codes, "now booking" tag) | #7fe3ff |
| focus ring | #357fdb |

`pine-*` is a cyan-teal accent (not green) that pairs with the navy family; it is the site's only other hue besides navy and
the cream paper. Header, offer tickets, footer and hero are deep navy-blue; cream/near-white is the page paper.

## Content rules
Business facts live in `src/data` (`site.ts`, `trips.ts`, `content.ts`, `coupons.ts`). Do not hard-code phone, email, address or
prices in components. Do not add reviews, ratings, discounts or statistics that the business has not approved.

## Styles
`global.css` holds tokens, layout utilities, buttons, header, footer and the motion contract. Each area has its own file
(`home-top.css`, `home-mid.css`, `gallery.css`, `trips.css`, `pages.css`, `widgets.css`) with a class prefix (`.ht-`, `.hm-`, `.gb-`,
`.tp-`, `.pg-`, `.wd-`). Use only variables from `global.css`.

## Motion contract (`src/scripts/motion.ts`)
- `data-reveal="up|fade|mask|scale|line"`: animates in when scrolled into view (`scale` and `mask` never fully hide an element, so photos paint immediately)
- `data-stagger` on a parent: children with `data-reveal` get staggered delays
- `data-parallax="0.12"`, `data-count="45"` (+ `data-count-suffix`), `data-magnetic`, `<h1 data-split>`
- Transform/opacity only. Everything is off under `prefers-reduced-motion` and `html[data-motion=reduce]`, and content is fully visible
  with JavaScript disabled (hidden states apply only when `html.js-motion` is set).
- Page transitions use Astro's `ClientRouter`; scripts that need to re-run must listen for `astro:page-load`.

## Responsive contract
Mobile first, fluid type and spacing with `clamp()`. Verified widths: 320, 375, 390, 430, 600, 768, 820, 1024, 1180, 1280, 1440, 1728,
1920, 2560. No horizontal scroll at any width, touch targets at least 44px, hover effects only under `@media (hover: hover)`.
Images use `srcset` + `sizes` with explicit aspect ratios, lazy loading except the LCP image.

## Images
Masters live in `src/assets/photos` and were upscaled with Real-ESRGAN from small phone photos, so real detail is limited.
`PHOTO_META` in `src/data/photos.ts` records the largest size each photo can be shown sharply; never display a photo larger than that.
Prefer tight crops over enlarging.

## Icons
`src/components/icons/paths.ts` is the single source for the custom icon set (24px grid, 1.75 stroke, duotone).
Use `<Icon name="..." />` in Astro and React.
