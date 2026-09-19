import os
import json, sys
from playwright.sync_api import sync_playwright
AXE=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","node_modules","axe-core","axe.min.js")).read()
B=os.environ.get("QA_BASE","http://localhost:4325")
pages=["/","/oregon-fishing-charter-rates","/oregon-fishing-charter-rates/oregon-fishing-charter-full-day-drift-trip","/oregon-fishing-charter-rates/oregon-crabbing-charter-bdc-guide-service","/oregon-fishing-species","/oregon-fishing-charter-photos","/oregon-fishing-charter-reviews","/oregon-fishing-reports","/captain-clinton-mcculloch-of-oregon","/fishing-faqs","/contact-us","/article/things-to-do-in-oregon","/article/get-your-valid-oregon-fishing-license","/terms-of-service","/privacy-policy","/sitemap","/nope-404"]
widths=[(320,640),(375,812),(390,844),(430,932),(600,900),(768,1024),(820,1180),(1024,768),(1180,820),(1280,800),(1440,900),(1728,1117),(1920,1080),(2560,1440)]
res=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h in widths:
        ctx=b.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page(); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e)[:120]))
        pg.on("console",lambda m: errs.append("console:"+m.text[:120]) if m.type=="error" and "404" not in m.text else None)
        for u in pages:
            errs.clear()
            pg.goto(B+u,wait_until="load"); pg.wait_for_timeout(500)
            cls=pg.evaluate("new Promise(r=>{let v=0;new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) v+=e.value}).observe({type:'layout-shift',buffered:true});setTimeout(()=>r(v),400)})")
            ov=pg.evaluate("document.documentElement.scrollWidth-innerWidth")
            broken=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src).length")
            h1=pg.evaluate("document.querySelectorAll('h1').length")
            row={"w":w,"u":u,"ov":ov,"broken":broken,"h1":h1,"cls":round(cls,3),"errs":list(errs)}
            if w in (320,768,1280) and u!="/nope-404":
                pg.evaluate(AXE); r=pg.evaluate("axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','best-practice']})")
                row["axe"]=[(v['id'],v['impact'],len(v['nodes'])) for v in r['violations']]
            res.append(row)
        ctx.close()
    b.close()
json.dump(res,open(sys.argv[1],"w"))
bad=[r for r in res if r["ov"]>0 or r["broken"] or (r["h1"]!=1 and "404" not in r["u"]) or r["cls"]>0.1 or r["errs"] or r.get("axe")]
print("checks:",len(res),"problems:",len(bad))
for r in bad[:60]: print(r)
