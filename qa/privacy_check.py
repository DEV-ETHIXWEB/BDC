import os, urllib.parse
from playwright.sync_api import sync_playwright
B=os.environ.get("QA_BASE","http://localhost:4325"); host=urllib.parse.urlparse(B).netloc
PAGES=["/","/oregon-fishing-charter-rates","/oregon-fishing-charter-rates/oregon-crabbing-charter-bdc-guide-service","/oregon-fishing-species","/oregon-fishing-charter-photos","/contact-us","/fishing-faqs","/article/get-your-valid-oregon-fishing-license","/privacy-policy"]
with sync_playwright() as p:
    br=p.chromium.launch(); ctx=br.new_context(viewport={"width":1280,"height":900}); pg=ctx.new_page(); third=set(); total=0
    pg.on("request",lambda r: third.add(r.url) if urllib.parse.urlparse(r.url).netloc not in (host,"") and not r.url.startswith("data:") else None)
    for u in PAGES: pg.goto(B+u,wait_until="networkidle"); pg.wait_for_timeout(600)
    # exercise the interactive widgets: chat message, accessibility toggle, form step
    pg.goto(B+"/",wait_until="networkidle"); pg.wait_for_timeout(1500)
    pg.locator("button[aria-label*='hat' i], .wd-launcher").first.click(); pg.wait_for_timeout(400)
    pg.locator("input[placeholder*='Ask' i]").last.fill("my phone is 503-555-0100"); pg.keyboard.press("Enter"); pg.wait_for_timeout(1200)
    pg.keyboard.press("Escape"); pg.locator("button[aria-label*='ccessibility']").first.click(); pg.wait_for_timeout(300); pg.locator("button[role=switch]").first.click()
    cookies=ctx.cookies(); ls=pg.evaluate("Object.keys(localStorage)"); ss=pg.evaluate("Object.keys(sessionStorage)")
    ss_has_phone=pg.evaluate("Object.values(sessionStorage).some(v=>v.includes('503-555-0100'))"); ls_has_phone=pg.evaluate("Object.values(localStorage).some(v=>v.includes('503-555-0100'))")
    print("third-party requests:",sorted(third) or "none")
    print("cookies set:",cookies or "none")
    print("localStorage keys:",ls,"| contains typed text:",ls_has_phone)
    print("sessionStorage keys:",ss,"| contains typed text:",ss_has_phone)
    br.close()
