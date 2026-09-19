# BDC Guide Service: design system

## Concept: "River survey"
A field-guide / nautical-survey aesthetic drawn from the crest: contour lines and flowing river lines, chart annotations,
specimen-tag trip tickets, a fishing-season calendar, blueprint boat drawings and tide-table style data rows. Barlow Condensed
for display type, Figtree for body. One bold moment per page; the rest stays disciplined. Adjacent sections never share a layout.

## Palette (taken from the logo)
| Token | Hex |
| --- | --- |
| navy-950 / 900 / 800 / 700 / 600 | #061a26 / #0b2434 / #0d2e3b / #153f52 / #1f5468 |
| rim | #24457a |
| pine-800 / 700 / 600 / 500 / 200 | #234a34 / #2c5a3f / #3a6f4f / #4f8a63 / #bfd6c5 |
| cream-50 / 100 / 200 / 300 | #fdfbf3 / #faf6e8 / #f1ebd3 / #e3dbbc |
| steel | #809296 |

Tokens are CSS variables in `src/styles/global.css`. Header, offer tickets, footer and hero are deep navy; cream is the page paper.
No other hues.

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
