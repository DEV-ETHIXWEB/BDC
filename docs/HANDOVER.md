# BDC Guide Service: handover and launch readiness

Prepared against the EthixWeb Full-Stack Project Ready Checklist (SOP v2). Site: https://www.bdcguideservices.com

## Verdict: NOT READY FOR LAUNCH

The code, content and test gates pass (section 3). The site is **not** launch-ready because the items in section 1 are unresolved.
Every one of them needs an account, a decision or a fact that only the client or the EthixWeb owner can provide. None can be closed by code alone.

## 1. Launch blockers

| # | Blocker | Why it blocks | Owner |
| --- | --- | --- | --- |
| 1 | **Form delivery is unverified.** No form service is connected (`PUBLIC_FORM_ENDPOINT` is unset). | Without it the booking form can only open the visitor's mail app and cannot confirm a lead arrived. The form now says so honestly ("Your request is not sent yet"), but a launch needs real delivery. Create a form-service account (Formspree, Basin, Getform or similar), set `PUBLIC_FORM_ENDPOINT`, enable its spam filter and an allowed-domain list, then send a **real test lead** and confirm the email arrives. Set `REQUIRE_FORM_ENDPOINT=1` on the production host so a missing value fails the build. | Dev + Client (account) |
| 2 | **Public street address conflict.** The old FAQ says guests meet at `9018 Southeast Bridge Crk Ct, Happy Valley, OR 97015`. The old site's structured data on every page said `9018 Southeast Scotts Way, Clackamas` (map point in Milwaukie). | NAP (name, address, phone) must match everywhere and be correct. Confirm the one public address, whether it is a residence, and the meeting point per trip. Then update `src/data/site.ts` and the FAQ answer in `src/data/content.ts`. The address is currently published in the footer, contact page, FAQ, JSON-LD and a map link. | Client |
| 3 | **Booking, deposit, payment and waiver process.** The old site ran on a booking platform (Guidesly) that handled bookings, deposits, payments and a guest waiver (`Generic-Fishing-Waiver`). The new site is a request form only. | The deposit amount is not stated anywhere (the platform shows 0%). Decide what happens at DNS cutover: keep the platform booking link, or build a new flow including a waiver step. | Client + Dev |
| 4 | **Crab trip regulations.** The client's crab page says trips run "along the Oregon Coast" from October to December. ODFW's shellfish summary (page updated Jan 5, 2024) says *Ocean waters are closed for crab Oct. 16 - Nov. 30*; bays, estuaries and jetties are open all year. | Advertising trips inside a closure is a legal and safety risk. The client must state where crab trips actually run. The site currently repeats the client's dates and does not name a location. | Client |
| 5 | **Legal text review.** Terms are the client's own published booking terms (deposit, balance, cancellation, tipping). They contain no liability, waiver or insurance language. The privacy policy describes what this site actually does. | Have a lawyer review both before launch. | Client |
| 6 | **Production deployment not yet done.** Domain, DNS, SSL and live behaviour are untested on a real host (the Vercel build itself is verified, section 6). | Deploy, then run the smoke test in section 6 on the real URL. | Dev |
| 7 | **Client approvals** (section 2) | Final copy, photos and facts must be approved. | Client |

## 2. Facts and content that need the client's approval

These are places where the client's own sources disagree or where the site cannot verify a claim. The site avoids stating anything it cannot source.

- **Experience:** the captain page says "over 45 years fishing the waters of Oregon". The same page's platform attribute reads "3 Years of Experience" (an automatic value from a 2023 profile date). The site says "fishing", never "guiding", for the 45 years.
- **Winter steelhead months:** several client pages say January through April; the two drift-boat trip pages say December through March. The site uses January to April on season charts and gives no months on the drift-boat trip pages.
- **Salmon months:** the client describes them only in words (spring and early summer; fall). The bars on the calendars are approximate and labelled so. The client's platform calendar is all zeros (unconfigured).
- **Boat engines:** the captain's bio says twin Yamaha, 150 HP main and 9.9 HP kicker; the platform boat table says 2 x 150 HP. The site uses the bio text.
- **Crab trip guest cap:** the Willy Predator crab rate allows up to 5 guests (the boat seats 6). The site uses 5 for that trip.
- **Photos:** nobody has confirmed who is in each photo, the species, river or boat, or whether guests consented. Captions describe only what is visible. One stock photo (a shrimp trawler that was the platform's default image) was removed. The captain page uses a scenery photo because the portrait could not be confirmed as Clinton.
- **Superlatives:** "Rated #1 by Customers" and "top rated" (in old meta descriptions) were removed. There are no reviews on the site to support them.
- **Publishing a personal Gmail** (`clinton.mcculloch5150@gmail.com`) as the contact email.
- **Phone reports:** the old reports page promised reports by phone; the site only says to call or email for current conditions.
- **Trips are "shared trips" with a 2-guest minimum** (from the client's rate cards).

## 3. What was verified (evidence)

All tests ran against the **production build** (`npm run build`, served with `astro preview`). Scripts are in `qa/` (see `qa/README.md`).

| Area | Result |
| --- | --- |
| Build | `npm run build` succeeds, 21 static pages + 18 redirect pages; the only console notice is the intentional "form service not set" warning |
| Types / lint | `astro check`: 0 errors, 0 warnings. `eslint src`: exit 0. `npm audit`: 0 vulnerabilities |
| Links / SEO (static) | 0 broken internal links or assets; every page has one h1, a unique title (20-70 chars), a description (60-170 chars), a canonical that matches its clean URL, Open Graph and Twitter tags; sitemap matches the real pages; JSON-LD parses on every page; NAP consistent between visible text and structured data |
| Responsive + accessibility | 238 checks (17 pages x 14 widths from 320 to 2560 px): 0 horizontal overflow, 0 broken images, 0 console errors, layout shift at most 0.065, 0 axe violations (WCAG 2 A/AA + best practice, checked at 320, 768 and 1280) |
| Browsers | Chromium, Firefox, WebKit (Safari engine); iPhone 14, iPhone SE, Pixel 7, Galaxy S9+, iPad: no console/network errors on 17 pages each, no overflow, 404 status correct, chat, accessibility panel, FAQ, mobile menu, gallery lightbox and form validation work |
| Security | No secrets or tracking IDs in the tree or git history; 0 third-party requests and 0 cookies; 0 script executions across chat, form and 1,120 hostile-URL tests; strict Content-Security-Policy (script hashes, no external origins) with 0 violations in 3 engines including soft navigation; `X-Frame-Options: DENY`, HSTS, nosniff, Referrer-Policy, Permissions-Policy |
| Forms | Without a form service: honest "not sent yet" state, mailto link with the details, copy and edit fallbacks. With a service (mocked): success only on a confirmed response, a 500 shows an error and allows retry, five rapid submits send one request, honeypot sends none, CSP allows only the configured origin |
| Images | Every image is served at or above the pixel size the screen needs, retina included (0 soft images across 8 pages and 4 device profiles); photos are upscaled masters (see `docs/design-system.md`) |
| Performance | Lighthouse on 8 pages: **Accessibility, Best Practices and SEO 100 on every run** (mobile and desktop). Performance: desktop 99-100; mobile 84-97 under Lighthouse's simulated slow-4G profile (home 89, gallery 84, others 87-97). Layout shift and blocking time are near zero; LCP is the limit on mobile (2.5-4.1 s simulated). Real-device numbers are not measured |

**Known console notices:** Safari's engine logs two informational "CSS preloaded but not used" messages during page-transition navigation (no errors, no user impact). The deliberate 404 test page logs one "404" resource message.

**Not tested:** real form delivery to an inbox; live host header and cache behaviour; DNS and SSL; the production URL; real phones (emulation only); analytics (none installed); error monitoring (none installed).

## 4. Architecture

Static Astro 7 site with React 19 islands (React Aria Components). Business facts live in `src/data` (`site.ts`, `trips.ts`, `content.ts`, `policies.ts`, `seasons.ts`, `coupons.ts`, `photos.ts`). Nothing else may hard-code phone, prices or addresses.

```
src/pages         routes (URLs match the old site, see section 5)
src/components    Astro components; react/ holds the interactive islands (chat, form, menu, accessibility panel)
src/data          single source of truth for business facts
src/styles        global.css (tokens) + one file per area (prefixes ht-, hm-, gb-, tp-, pg-, wd-)
src/scripts       motion runtime, custom hydration directive
config/           redirects.mjs and headers.mjs (source for host config)
scripts/          check-env, generate-host-config (prebuild), postbuild-csp (postbuild)
qa/               Playwright test scripts
docs/             design-system.md, this file
```

Build pipeline: `prebuild` checks env vars and generates `vercel.json`, `public/_headers`, `public/_redirects` from `config/`; `astro build`; `postbuild` computes the CSP from the built pages, writes it to `dist/_headers` and into a `<meta>` tag on every page.

### Environment variables (names only; see `.env.example`)

| Name | Required | Purpose |
| --- | --- | --- |
| `PUBLIC_FORM_ENDPOINT` | **Yes for launch** | https URL of the form service. Embedded in the browser bundle by design: never put a secret in it. Use the service's allowed-domain list and spam filter |
| `REQUIRE_FORM_ENDPOINT` | Optional | Fails the build if the endpoint is missing or not https (automatic on Vercel Production) |
| `ALLOW_MAILTO_FORM` | Optional | Set to `1` to deploy on Vercel Production without a form service on purpose |
| `PUBLIC_NOINDEX` | Set to `1` on non-Vercel staging | Adds noindex and a disallow-all robots.txt (Vercel Preview does this automatically) |

No API keys, database, auth or server code exist. CORS, CSRF, rate limiting, webhooks and multi-tenant access are not applicable; abuse limits belong to the form service.

## 5. URLs and redirects

Trip pages and articles keep the old site's URLs, so existing rankings carry over:

`/oregon-fishing-charter-rates/{oregon-fishing-charter-full-day-drift-trip, full-day-oregon-river-fishing-charter, oregon-fishing-charter-half-day-trip, oregon-fishing-charter-half-day-drift-boat-trip, oregon-crabbing-charter-bdc-guide-service, oregon-crabbing-charter-5-hour-adventure}`, `/article/get-your-valid-oregon-fishing-license`, `/article/things-to-do-in-oregon`, plus the old top-level pages.

`config/redirects.mjs` maps the remaining old URLs (16 gallery photo pages, `/profile/clinton-mcculloch`, `/article`) with real 301s for Vercel, Netlify and Cloudflare Pages and a static fallback in Astro. A redirect that differs only by letter case (`/Oregon-fishing-Charter-rates`) is deliberately omitted: it overwrites the real page on case-insensitive file systems.

## 6. Deploy on Vercel

Verified with Vercel's own CLI (`vercel build`, v59) on a clean export of the repo, and `vercel.json` validated against Vercel's published schema (0 errors). The compiled config has 18 permanent redirects (308), clean URLs for all 39 pages (including the page-plus-folder pairs), all security headers, immutable caching for `/_astro/*`, and a real 404 for unknown URLs. The lockfile carries Linux x64 binaries for every native dependency Vercel needs.

1. Import the GitHub repo in Vercel. Framework **Astro**, build command `npm run build`, output directory `dist`, Node.js **22.x** (all set in `vercel.json` / `package.json`, no manual settings needed).
2. Environment variables (Project Settings > Environment Variables):

| Name | Production | Preview | Notes |
| --- | --- | --- | --- |
| `PUBLIC_FORM_ENDPOINT` | **required** | optional | https URL of the form service. The Production build **fails** without it |
| `ALLOW_MAILTO_FORM` | leave unset | leave unset | Set to `1` only to deploy on purpose without a form service (not launch-ready) |
| `REQUIRE_FORM_ENDPOINT` | optional | leave unset | Production is already required automatically |

   Preview deployments are noindex automatically (`VERCEL_ENV=preview`). Changing `PUBLIC_FORM_ENDPOINT` needs a redeploy.
3. Deploy a Preview first and smoke-test it: home, one trip page, `/oregon-fishing-charter-rates/` (should redirect), an old URL such as `/profile/clinton-mcculloch`, a nonexistent URL (404 page), the form.
4. Add the domains `www.bdcguideservices.com` (primary) and `bdcguideservices.com` (redirects to www) and follow Vercel's DNS instructions. Confirm SSL.
5. On Production, confirm the CSP is active (`<meta http-equiv="Content-Security-Policy">` in the page source; Vercel gets the policy from that tag, other hosts also get a header), then send a **real test lead** and confirm the email arrives.
6. Rollback: Vercel > Deployments > previous deployment > Promote to Production.
7. Schedule a check 24-48 hours after launch: leads arriving, no errors, real traffic sane.

Other static hosts: Netlify and Cloudflare Pages read `dist/_headers` and `dist/_redirects` (generated by the build; removed automatically on Vercel).

## 7. Troubleshooting

- **Form says "not sent yet":** the endpoint is not configured for this build.
- **Content Security Policy blocks something after adding a script or a third-party embed:** add its origin to `config` (see `scripts/postbuild-csp.mjs`) and rebuild. Inline scripts are hashed automatically; do not add inline module scripts (Astro's page transitions then need a `data:` script the policy blocks).
- **A page shows only a redirect after a local build:** never add a redirect whose source differs from a real page only by letter case.
- **Fonts double-download in Safari:** do not add `<link rel="preload">` for the fonts.

## 8. Known limitations

- The chat assistant answers only from site data and says so when it does not know; it collects no leads.
- Accessibility panel and chat use browser storage only (no personal data leaves the browser).
- No analytics, no cookie banner (none is needed while there is no tracking). Add both together if analytics is ever added, and update the privacy policy.
- Photos are small phone images upscaled with Real-ESRGAN; a few are limited to small frames (`PHOTO_META` in `src/data/photos.ts`). Better originals would improve the site.
- 30 icons in `src/components/icons/paths.ts` are not used yet (kept as a library).

## 9. Third-party accounts and ownership

None are required by this repository. Still running outside it: the previous Guidesly-hosted site and its booking account, which stay live until DNS is switched. Decide what happens to that account (blocker 3). Form-service account (blocker 1) should be created in the client's name.

## 10. Contacts

Client: Captain Clinton McCulloch, (503) 826-7294, clinton.mcculloch5150@gmail.com. Developer: EthixWeb.
