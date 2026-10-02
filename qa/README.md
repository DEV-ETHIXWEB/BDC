# QA scripts

Repeatable browser tests used for the launch-readiness audit. They drive the **production build** through Playwright.

```bash
pip install playwright && playwright install chromium firefox webkit
npm run build && npx astro preview --port 4325 &        # serve dist/
export QA_BASE=http://localhost:4325
python qa/static_qa.py            # links, assets, titles, canonicals, sitemap, JSON-LD (reads dist/)
python qa/responsive_sweep.py out.json   # 17 pages x 14 widths (320-2560): overflow, console errors, CLS, axe
python qa/browsers.py out.json    # Chrome/Firefox/Safari engines + iPhone/Pixel/iPad/Galaxy profiles
python qa/csp_test.py             # Content-Security-Policy violations in 3 engines, incl. soft navigation
python qa/chat.py                 # chat assistant answers + injection payloads
python qa/console_warnings.py     # console warnings/errors after load
python qa/image_sharpness.py      # every image's real pixel width vs device pixels needed (blur guard)
python qa/quick_request_flow.py   # home hero 'Request a trip' bar: visible without scrolling, validation, honest not-sent state
python qa/old_site_parity.py      # all 37 URLs of the previous site's sitemap exist as real pages with a form (reads dist/)
python qa/hover_clip_detector.py  # hover/focus states that get cut off by a parent's overflow or clip
```

`form_flow.py` (trip request form) and `contact_form_flow.py` (site-wide contact form; `SKIP_ENDPOINT=1` runs only the default-build part) need a second build with a form service configured, to test the POST paths:

```bash
# in a copy of the repo:
PUBLIC_FORM_ENDPOINT=https://forms.example.test/f/abc npm run build
npx astro preview --port 4361 &
QA_BASE_ENDPOINT=http://localhost:4361 python qa/form_flow.py
QA_BASE=http://localhost:4325 QA_BASE_ENDPOINT=http://localhost:4361 python qa/contact_form_flow.py
```

`overlap_detector.py` is the layout-collision suite: across 20 pages x 15 widths it flags glyph ink printing
over the next element, text clipped by its own box, content escaping a clipped parent, sub-24px touch targets
and sideways page scroll. It measures the glyphs the browser actually paints (it applies `text-transform`) and
compares ink to ink, because comparing ink to a padded box reports a collision on every tight heading. Screen
reader text, honeypots and `aria-hidden` decoration are excluded by design.

```bash
python qa/overlap_detector.py out.json   # exits non-zero if anything is found
```

## Turnstile, both ways

Spam protection is config-gated, so it needs checking in both states:

```bash
# off: no widget, no external script, policy closed
npm run build && grep -o "frame-src[^;]*" dist/index.html        # -> frame-src 'none'
grep -c challenges.cloudflare.com dist/index.html                # -> 0

# on: widget renders, policy opens, no CSP violations
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build
grep -o "frame-src[^;]*" dist/index.html                         # -> frame-src https://challenges.cloudflare.com

# guards
PUBLIC_TURNSTILE_SECRET_KEY=x node scripts/check-env.mjs         # must FAIL: secret in a PUBLIC_ name
REQUIRE_FORM_ENDPOINT=1 PUBLIC_FORM_ENDPOINT=https://e.test/f \
  PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA node scripts/check-env.mjs   # must FAIL: test key in prod
```

Remember to rebuild without the key afterwards so `dist/` is back to production state.
