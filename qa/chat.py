import os
import sys
from playwright.sync_api import sync_playwright
B=os.environ.get("QA_BASE","http://localhost:4325")
QS=['can I bring my kids?','are kids allowed?','what should I bring?','what should my kid wear?','when is the deposit due?','what is your cancellation policy?','what if the weather is bad?','how big are the crab I can keep?','do I need a license for crabbing?','who is the captain?','<img src=x onerror=window.__xss=1>']
with sync_playwright() as p:
    for bn in ("chromium","webkit"):
        br=getattr(p,bn).launch(); pg=br.new_context(viewport={"width":1280,"height":900}).new_page(); pg.set_default_timeout(6000); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e)[:120])); pg.on("dialog",lambda d:(errs.append("DIALOG "+d.message),d.dismiss()))
        pg.goto(B+"/",wait_until="load"); pg.wait_for_timeout(1500)
        pg.locator("button[aria-label*='hat' i], .wd-launcher").first.click(); pg.wait_for_timeout(500)
        inp=pg.locator("input[placeholder*='Ask' i], input[type=text]").last
        print("==",bn)
        for q in QS:
            n0=pg.locator("[class*=wd-msg]").count()
            inp.fill(q[:5000]); pg.keyboard.press("Enter"); pg.wait_for_timeout(1300)
            msgs=pg.locator("[class*=wd-msg--bot], [class*=wd-msg--assistant]").all_inner_texts()
            last=(msgs[-1] if msgs else pg.locator("[class*=wd-msg]").last.inner_text()).replace("\n"," ")[:150]
            print(f"  Q {q[:34]!r:38} -> {last!r}")
        print("  script executed:",pg.evaluate("window.__xss||0"),"| injected <img onerror> elements:",pg.evaluate("document.querySelectorAll('.wd-log img[src=x], [class*=msg] img[src=x]').length"),"| page errors:",errs or "none")
        br.close()
