import os
import json, sys
from playwright.sync_api import sync_playwright
B=os.environ.get("QA_BASE","http://localhost:4325")
PAGES=["/article","/profile/clinton-mcculloch","/oregon-fishing-charter-photos/clackamas-chinook-salmon-catch-2532","/oregon-fishing-charter-photos/dungeness-crab-bucket-clackamas-2297","/","/oregon-fishing-charter-rates","/oregon-fishing-charter-rates/oregon-fishing-charter-full-day-drift-trip","/oregon-fishing-charter-rates/oregon-crabbing-charter-bdc-guide-service","/oregon-fishing-species","/oregon-fishing-charter-photos","/oregon-fishing-charter-reviews","/oregon-fishing-reports","/captain-clinton-mcculloch-of-oregon","/fishing-faqs","/contact-us","/article/things-to-do-in-oregon","/article/get-your-valid-oregon-fishing-license","/terms-of-service","/privacy-policy","/sitemap","/no-such-page"]
def run(p,label,browser_name,ctx_args):
    br=getattr(p,browser_name).launch()
    ctx=br.new_context(**ctx_args); ctx.set_default_timeout(5000); ctx.set_default_navigation_timeout(20000); pg=ctx.new_page(); res={"label":label,"errors":[],"overflow":[],"broken":[],"checks":{}}
    pg.on("pageerror",lambda e: res["errors"].append("pageerror: "+str(e)[:140]))
    pg.on("console",lambda m: res["errors"].append("console: "+m.text[:140]) if m.type=="error" else None)
    pg.on("requestfailed",lambda r: res["errors"].append("reqfailed: "+r.url[-70:]))
    for u in PAGES:
        cur=len(res["errors"])
        r=pg.goto(B+u,wait_until="load"); pg.wait_for_timeout(700)
        if u=="/no-such-page":
            res["checks"]["404 status"]= r.status==404
            # a 404 page load logs one expected resource error; drop it
            del res["errors"][cur:]; continue
        if r.status!=200: res["errors"].append(f"{u} status {r.status}")
        ow=pg.evaluate("document.documentElement.scrollWidth-innerWidth")
        if ow>0: res["overflow"].append((u,ow))
        bk=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src).length")
        if bk: res["broken"].append((u,bk))
    ok=lambda name,fn: res["checks"].__setitem__(name,fn())
    mobile=ctx_args.get("is_mobile") or (ctx_args.get("viewport",{}).get("width",1400)<1080)
    # chat
    pg.goto(B+"/",wait_until="load"); pg.wait_for_timeout(1500)
    def chat():
        pg.locator("button[aria-label*='chat' i], button[aria-label*='Ask' i], .wd-launcher, .wd-fab--chat").first.click(); pg.wait_for_timeout(500)
        inp=pg.locator("input[type=text], textarea").filter(has=None).last
        pg.locator("#chat-input, input[placeholder*='Ask' i], input[aria-label*='question' i]").first.fill("how much is a half day trip?"); pg.keyboard.press("Enter"); pg.wait_for_timeout(1200)
        t=pg.inner_text("body"); return "$150" in t
    try: res["checks"]["chat answers price"]=bool(chat())
    except Exception as e: res["checks"]["chat answers price"]=f"ERR {str(e)[:80]}"
    try:
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
        pg.locator("button[aria-label*='ccessibility']").first.click(); pg.wait_for_timeout(400)
        pg.locator("button[role=switch]").first.click(); pg.wait_for_timeout(200)
        res["checks"]["a11y panel toggles contrast"]= pg.evaluate("document.documentElement.dataset.contrast")=="high"
        pg.evaluate("localStorage.clear()")
    except Exception as e: res["checks"]["a11y panel toggles contrast"]=f"ERR {str(e)[:80]}"
    try:
        pg.goto(B+"/fishing-faqs",wait_until="load"); pg.wait_for_timeout(800)
        b=pg.locator(".faq button, [data-faq] button, button[aria-expanded]").nth(2); b.click(); pg.wait_for_timeout(300)
        res["checks"]["faq expands"]= b.get_attribute("aria-expanded")=="true"
    except Exception as e: res["checks"]["faq expands"]=f"ERR {str(e)[:80]}"
    if mobile:
        try:
            pg.goto(B+"/",wait_until="load"); pg.wait_for_timeout(1200); pg.locator(".menu-trigger").first.click(); pg.wait_for_timeout(500)
            res["checks"]["mobile menu opens"]= pg.locator("[role=dialog] a[href='/oregon-fishing-charter-rates']").count()>0
        except Exception as e: res["checks"]["mobile menu opens"]=f"ERR {str(e)[:80]}"
    try:
        pg.goto(B+"/oregon-fishing-charter-photos",wait_until="load"); pg.wait_for_timeout(1000)
        pg.locator(".gb-plate__btn").first.click(); pg.wait_for_timeout(600)
        res["checks"]["gallery lightbox opens"]= pg.locator(".gb-lb__img").count()==1
        pg.keyboard.press("Escape")
    except Exception as e: res["checks"]["gallery lightbox opens"]=f"ERR {str(e)[:80]}"
    try:
        pg.goto(B+"/contact-us",wait_until="load"); pg.wait_for_timeout(800)
        pg.locator("button:has-text('Continue')").first.click(); pg.wait_for_timeout(400)
        res["checks"]["form blocks empty step"]= pg.locator("input[name=name]").count()>0
    except Exception as e: res["checks"]["form blocks empty step"]=f"ERR {str(e)[:80]}"
    pg.goto(B+"/",wait_until="load"); pg.wait_for_timeout(1500)
    pg.screenshot(path=os.path.join(os.environ.get("QA_OUT","qa-out"),f"xb_{label.replace(' ','_')}.png"))
    br.close(); return res
os.makedirs(os.environ.get('QA_OUT','qa-out'),exist_ok=True)
with sync_playwright() as p:
    D=p.devices
    runs=[("Chromium desktop","chromium",{"viewport":{"width":1440,"height":900}}),
          ("Firefox desktop","firefox",{"viewport":{"width":1440,"height":900}}),
          ("WebKit (Safari) desktop","webkit",{"viewport":{"width":1440,"height":900}}),
          ("iPhone 14 (Safari)","webkit",dict(D["iPhone 14"])),
          ("iPhone SE (Safari)","webkit",dict(D["iPhone SE"])),
          ("Pixel 7 (Chrome)","chromium",dict(D["Pixel 7"])),
          ("iPad gen 7 (Safari)","webkit",dict(D["iPad (gen 7)"])),
          ("Galaxy S9+ (Chrome)","chromium",dict(D["Galaxy S9+"])),
          ("Firefox mobile-size","firefox",{"viewport":{"width":390,"height":844}})]
    out=[]
    want=sys.argv[2:] 
    for label,bn,args in runs:
        if want and not any(w.lower() in label.lower() for w in want): continue
        try: out.append(run(p,label,bn,args))
        except Exception as e: out.append({"label":label,"fatal":str(e)[:200]})
json.dump(out,open(sys.argv[1],"w"),indent=1)
for r in out:
    print("\n==",r["label"]); 
    if "fatal" in r: print("  FATAL",r["fatal"]); continue
    print("  errors:",sorted(set(r["errors"]))[:6] or "none"); print("  overflow:",r["overflow"] or "none","| broken imgs:",r["broken"] or "none")
    print("  checks:",{k:v for k,v in r["checks"].items()})
