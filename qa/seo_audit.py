"""SEO checks derived from the claude-seo skill criteria (local, schema, GEO, technical).
Runs against dist/. Exits non-zero on any failure."""
import json, re, glob, os, sys, urllib.parse
import xml.etree.ElementTree as ET

DIST = 'dist'
SITE = 'https://www.bestdayscatching.com'
fails, notes = [], []
def check(ok, label, detail=''):
    (notes if ok else fails).append(f"{'PASS' if ok else 'FAIL'}  {label}{(' -- ' + detail) if detail else ''}")

pages = [f for f in glob.glob(f'{DIST}/**/*.html', recursive=True)]
html = {f: open(f, encoding='utf8').read() for f in pages}

# ---- titles & descriptions within what Google renders ----
longt = [f for f, h in html.items() if (m := re.search(r'<title>([^<]*)', h)) and len(m.group(1)) > 60]
longd = [f for f, h in html.items() if (m := re.search(r'name="description" content="([^"]*)', h)) and len(m.group(1)) > 160]
nod  = [f for f, h in html.items() if not re.search(r'name="description" content="[^"]+"', h)]
noh1 = [f for f, h in html.items() if not re.search(r'<h1[^>]*>', h)]
check(not longt, 'every title <= 60 chars', f'{len(longt)} too long')
check(not longd, 'every description <= 160 chars', f'{len(longd)} too long')
check(not nod, 'every page has a meta description', f'{len(nod)} missing')
check(not noh1, 'every page has an h1', f'{len(noh1)} missing')

# ---- one canonical, one h1 ----
multih1 = [f for f, h in html.items() if len(re.findall(r'<h1[^>]*>', h)) > 1]
# a noindex page (the 404) should not declare a canonical, so it is not expected to have one
nocanon = [f for f, h in html.items() if 'rel="canonical"' not in h and 'noindex' not in h]
check(not multih1, 'exactly one h1 per page', f'{len(multih1)} have more')
check(not nocanon, 'every page has a canonical', f'{len(nocanon)} missing')

# ---- JSON-LD parses everywhere, and the entity graph is wired ----
bad_json, bc = [], []
for f, h in html.items():
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
    for b in blocks:
        try: json.loads(b)
        except Exception as e: bad_json.append(f'{f}: {e}')
    if f.endswith('404.html') or f == f'{DIST}/index.html': continue
    if not any('BreadcrumbList' in b for b in blocks): bc.append(f)
check(not bad_json, 'all JSON-LD parses', '; '.join(bad_json[:2]))
check(not bc, 'BreadcrumbList on every page but home/404', f'{len(bc)} missing')

home = html[f'{DIST}/index.html']
biz = next((json.loads(b) for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', home, re.S)
            if 'LocalBusiness' in str(json.loads(b).get('@type'))), None)
check(biz is not None, 'LocalBusiness schema on home')
if biz:
    for k in ('name', 'url', 'telephone', 'areaServed', 'priceRange', 'image', 'sameAs', 'hasOfferCatalog'):
        check(k in biz, f'LocalBusiness has {k}')
    check(biz.get('@id', '').endswith('#business'), 'LocalBusiness has a stable @id')

# every Article/TouristTrip points back at the business entity
orphan = []
for f, h in html.items():
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        d = json.loads(b); t = str(d.get('@type'))
        if t == 'Article' and '#business' not in json.dumps(d): orphan.append(f)
        if t == 'TouristTrip' and '#business' not in json.dumps(d): orphan.append(f)
check(not orphan, 'Articles and trips link to the business @id', f'{len(orphan)} orphaned')

# ---- sitemaps ----
sm = ET.parse(f'{DIST}/sitemap-0.xml').getroot()
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = sm.findall('s:url', ns)
withmod = [u for u in urls if u.find('s:lastmod', ns) is not None]
check(len(withmod) == len(urls), 'every sitemap URL has lastmod', f'{len(withmod)}/{len(urls)}')
# each sitemap URL must be a real built page
missing = []
for u in urls:
    p = urllib.parse.urlparse(u.find('s:loc', ns).text).path.strip('/')
    if not os.path.exists(f'{DIST}/{p}.html' if p else f'{DIST}/index.html'): missing.append(p)
check(not missing, 'every sitemap URL is a real page', f'{len(missing)} dangling')

imgs = ET.parse(f'{DIST}/sitemap-images.xml').getroot()
ins = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'i': 'http://www.google.com/schemas/sitemap-image/1.1'}
ients = imgs.findall('s:url', ins)
gone = [e for e in ients if not os.path.exists(DIST + urllib.parse.urlparse(e.find('i:image/i:loc', ins).text).path)]
nocap = [e for e in ients if e.find('i:image/i:caption', ins) is None]
check(len(ients) > 0, 'image sitemap has entries', f'{len(ients)}')
check(not gone, 'every sitemap image file exists', f'{len(gone)} missing')
check(not nocap, 'every sitemap image has a caption', f'{len(nocap)} missing')
idx = open(f'{DIST}/sitemap-index.xml', encoding='utf8').read()
check('sitemap-images.xml' in idx and 'sitemap-0.xml' in idx, 'sitemap index lists both sitemaps')

# ---- robots + llms ----
rb = open(f'{DIST}/robots.txt', encoding='utf8').read()
for bot in ('Googlebot', 'Google-Extended', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot'):
    check(f'User-agent: {bot}' in rb, f'robots.txt names {bot}')
check('Disallow: /' not in rb, 'robots.txt does not disallow the site')
check(f'Sitemap: {SITE}/sitemap-index.xml' in rb, 'robots.txt points at the sitemap index')

llms = open(f'{DIST}/llms.txt', encoding='utf8').read()
check(llms.startswith('# '), 'llms.txt starts with an H1')
check('>' in llms.split('\n')[2], 'llms.txt has a summary blockquote')
links = re.findall(r'\]\((https?://[^)]+)\)', llms)
dead = []
for l in links:
    p = urllib.parse.urlparse(l).path.strip('/')
    if not os.path.exists(f'{DIST}/{p}.html' if p else f'{DIST}/index.html'): dead.append(l)
check(not dead, 'every llms.txt link resolves to a real page', f'{len(dead)} dead')
check('licence' not in llms, 'llms.txt uses US spelling')

# ---- things we must NOT be doing ----
check('aggregateRating' not in home, 'no fabricated aggregateRating', 'there are no reviews yet')
check('openingHoursSpecification' not in home, 'no invented opening hours')

print('\n'.join(notes))
if fails:
    print('\n' + '\n'.join(fails))
print(f"\n  {len(notes)} passed, {len(fails)} failed")
sys.exit(1 if fails else 0)
