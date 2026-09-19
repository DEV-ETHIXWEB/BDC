import os
from playwright.sync_api import sync_playwright
B=os.environ.get("QA_BASE","http://localhost:4325")
PAGES=["/","/oregon-fishing-charter-rates","/oregon-fishing-charter-rates/oregon-fishing-charter-full-day-drift-trip","/oregon-fishing-species","/oregon-fishing-charter-photos","/oregon-fishing-charter-reviews","/oregon-fishing-reports","/captain-clinton-mcculloch-of-oregon","/fishing-faqs","/contact-us","/article/things-to-do-in-oregon","/article/get-your-valid-oregon-fishing-license","/terms-of-service","/privacy-policy","/sitemap"]
with sync_playwright() as p:
    for bn in ("chromium","webkit"):
        br=getattr(p,bn).launch(); 
        for u in PAGES:
            pg=br.new_context(viewport={"width":1280,"height":900}).new_page(); w=[]
            pg.on("console",lambda m: w.append(m.text[:130]) if m.type in ("warning","error") else None)
            pg.goto(B+u,wait_until="load"); pg.wait_for_timeout(4500)   # warnings fire ~3s after load
            if w: print(bn,u,"->",[x.split("/_astro/")[-1][:70] for x in w])
        br.close()
print("done")
