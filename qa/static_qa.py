import os
import re,glob,json,os,html,sys
from urllib.parse import urlparse,unquote
D=os.environ.get("QA_DIST",os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","dist"))
SITE="https://www.bdcguideservices.com"
def is_redirect(t): return 'http-equiv="refresh"' in t[:600].lower() or "redirecting" in t[:300].lower()
pages={}
for f in glob.glob(D+"/**/*.html",recursive=True):
    t=open(f,encoding="utf8").read()
    rel=f[len(D):]
    url="/" if rel=="/index.html" else rel[:-5]
    pages[url]=(f,t,is_redirect(t))
real={u:v for u,v in pages.items() if not v[2] and u!="/404"}
print(f"pages: {len(pages)} total, {len(real)} real, {len(pages)-len(real)-1} redirect stubs, 1 404")
def exists(path):
    path=unquote(path.split("#")[0].split("?")[0])
    if path in ("","/"): return True
    p=D+path
    return os.path.isfile(p) or os.path.isfile(p+".html") or os.path.isfile(p+"/index.html")
probs=[]; ext=set()
for u,(f,t,red) in real.items():
    body=re.sub(r"<script[^>]*>.*?</script>","",t,flags=re.S)
    for m in re.finditer(r'(?:href|src|poster|content)="([^"#][^"]*)"',body):
        v=html.unescape(m.group(1))
        if v.startswith(("mailto:","tel:","data:","javascript:")): 
            if v.startswith("javascript:"): probs.append((u,"javascript: url",v))
            continue
        if v.startswith("//"): probs.append((u,"protocol-relative",v)); continue
        if v.startswith("http"):
            if not v.startswith(SITE): ext.add(v)
            else:
                if not exists(urlparse(v).path): probs.append((u,"missing (absolute)",v))
            continue
        if v.startswith("/") and not exists(v): 
            if re.match(r"^/[\w./-]+$",v): probs.append((u,"missing",v))
    for m in re.finditer(r'srcset="([^"]+)"',body):
        for part in m.group(1).split(","):
            src=part.strip().split(" ")[0]
            if src.startswith("/") and not exists(src): probs.append((u,"missing srcset",src))
print("broken internal refs:",len(probs)); [print("  ",p) for p in probs[:15]]
print("external links:",sorted(ext))
# per-page SEO
titles={}; issues=[]
for u,(f,t,red) in sorted(real.items()):
    g=lambda p: (re.search(p,t,re.S) or [None,None])[1]
    title=html.unescape(g(r"<title>(.*?)</title>") or ""); desc=html.unescape(g(r'<meta name="description" content="([^"]*)"') or "")
    can=g(r'<link rel="canonical" href="([^"]*)"'); ogu=g(r'<meta property="og:url" content="([^"]*)"'); h1=len(re.findall(r"<h1[\s>]",t))
    exp=SITE+("" if u=="/" else u)+("/" if u=="/" else "")
    if can!=exp: issues.append((u,"canonical",can,exp))
    if ogu!=can: issues.append((u,"og:url != canonical",ogu,can))
    if h1!=1: issues.append((u,"h1 count",h1,1))
    if not 20<=len(title)<=70: issues.append((u,"title length",len(title),title))
    if not 60<=len(desc)<=170: issues.append((u,"desc length",len(desc),desc[:70]))
    if "noindex" in t[:4000] : issues.append((u,"noindex on production build","",""))
    if 'property="og:image"' not in t or 'name="twitter:card"' not in t: issues.append((u,"missing og/twitter","",""))
    titles.setdefault(title,[]).append(u)
    # JSON-LD
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>',t,re.S):
        try: j=json.loads(m.group(1))
        except Exception as e: issues.append((u,"invalid JSON-LD",str(e)[:60],""))
for ttl,us in titles.items():
    if len(us)>1: issues.append(("dup title",ttl,us,""))
print("SEO/structure issues:",len(issues)); [print("  ",i) for i in issues[:25]]
# sitemap
sm=open(D+"/sitemap-0.xml").read(); locs=re.findall(r"<loc>([^<]+)</loc>",sm)
missing=[l for l in locs if l.replace(SITE,"") not in real and l!=SITE+"/" ]
print("sitemap urls:",len(locs),"| not real pages:",missing)
notin=[u for u in real if u not in ("/sitemap",) and (SITE+("" if u=="/" else u)+("/" if u=="/" else "")) not in locs]
print("real pages missing from sitemap:",notin)
print("robots.txt:",open(D+"/robots.txt").read().replace("\n"," | "))
# NAP + schema consistency on home
home=real["/"][1]
ld=[json.loads(m.group(1)) for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>',home,re.S)]
biz=[j for j in ld if isinstance(j.get("@type"),list) and "LocalBusiness" in j["@type"]][0]
print("business schema:",biz["name"],"|",biz["telephone"],"|",biz["email"],"|",biz["address"]["streetAddress"],",",biz["address"]["addressLocality"],biz["address"]["postalCode"],"| priceRange",biz["priceRange"])
