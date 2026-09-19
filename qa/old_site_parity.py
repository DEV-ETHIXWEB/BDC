"""Every URL in the previous site's sitemap must exist as a REAL page (not a redirect) in the new build.
Usage: python qa/old_site_parity.py            (checks dist/ files: run `npm run build` first)
       QA_BASE=http://localhost:4321 python qa/old_site_parity.py   (also fetches each URL: 200, no redirect, has <h1>)"""
import os, re, sys, urllib.request, urllib.error
ROOT = os.path.join(os.path.dirname(__file__), '..')
urls = [l.strip() for l in open(os.path.join(os.path.dirname(__file__), 'old_site_urls.txt')) if l.strip() and not l.startswith('#')]
base = os.environ.get('QA_BASE', '').rstrip('/')
bad = []

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None

for u in urls:
    f = os.path.join(ROOT, 'dist', 'index.html' if u == '/' else u.lstrip('/') + '.html')
    if not os.path.exists(f):
        bad.append(f'{u}: no dist file'); continue
    html = open(f, encoding='utf8').read()
    if 'http-equiv="refresh"' in html or not re.search(r'<h1[\s>]', html):
        bad.append(f'{u}: redirect stub or no h1'); continue
    if not re.search(r'<form[^>]*class="[^"]*\b(cb|tp)-form', html):
        bad.append(f'{u}: no form island (every page needs a contact form)'); continue
    if base:
        try:
            r = urllib.request.build_opener(NoRedirect).open(base + u, timeout=20)
            if r.status != 200: bad.append(f'{u}: HTTP {r.status}')
        except urllib.error.HTTPError as e:
            bad.append(f'{u}: HTTP {e.code}')
print(f'{len(urls)} old URLs checked, {len(bad)} problems')
for b in bad: print(' -', b)
sys.exit(1 if bad else 0)
