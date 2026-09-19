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
