import os
import json,re
from playwright.sync_api import sync_playwright
OK=lambda n,c: print(("PASS " if c else "FAIL ")+n)
def fill_step2(pg,name="Test User",phone="5035550100",email="t@example.com",msg="Two adults, first time.",company=None):
    pg.locator("form button:has-text('Continue')").first.click(); pg.wait_for_timeout(500)
    pg.fill("input[name=name]",name); pg.fill("input[name=phone]",phone); pg.fill("input[name=email]",email)
    pg.fill("textarea[name=message]",msg)
    if company: pg.evaluate("(v)=>{const i=document.querySelector('input[name=company]');i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))}",company)
with sync_playwright() as p:
    br=p.chromium.launch()
    RUN_A=False
    # ---------- A. no form service configured (default build) ----------
    pg=br.new_page(viewport={"width":1280,"height":1000}); pg.set_default_timeout(6000)
    pg.goto(os.environ.get("QA_BASE","http://localhost:4325")+"/contact-us",wait_until="load"); pg.wait_for_timeout(1200)
    fill_step2(pg); pg.locator("button:has-text('Send request')").click(); pg.wait_for_timeout(800)
    body=pg.inner_text("body")
    OK("A1 no endpoint: says 'not sent yet'","Your request is not sent yet" in body)
    OK("A2 no endpoint: never says 'Request sent'","Request sent" not in body)
    href=pg.locator("a:has-text('Open email again')").get_attribute("href") or ""
    OK("A3 mailto link carries subject and details", href.startswith("mailto:") and "Trip%20request" in href and "Test%20User" in href)
    OK("A4 copy/edit fallbacks present", pg.locator("button:has-text('Copy request')").count()==1 and pg.locator("button:has-text('Edit request')").count()==1)
    pg.locator("button:has-text('Edit request')").click(); pg.wait_for_timeout(400)
    OK("A5 'Edit request' returns to the form", pg.locator("input[name=name]").count()==1 or pg.locator("form button:has-text('Continue')").count()==1)
    # validation
    pg.goto(os.environ.get("QA_BASE","http://localhost:4325")+"/contact-us",wait_until="load"); pg.wait_for_timeout(1000)
    pg.locator("form button:has-text('Continue')").first.click(); pg.wait_for_timeout(400)
    pg.fill("input[name=email]","not-an-email"); pg.locator("button:has-text('Send request')").click(); pg.wait_for_timeout(500)
    OK("A6 invalid/empty fields blocked with a message", "Enter" in pg.inner_text("body") or pg.locator("[role=alert], .tp-err").count()>0)
    # length caps
    pg.fill("input[name=name]","x"*500); OK("A7 name capped at 80", len(pg.input_value("input[name=name]"))<=80)
    pg.close()
    # ---------- B. form service configured (separate build on :4361) ----------
    for scenario in ("success","server_error","double_submit","honeypot"):
        ctx=br.new_context(viewport={"width":1280,"height":1000}); ctx.set_default_timeout(6000); pg=ctx.new_page()
        posts=[]; viol=[]
        def handler(route,req,sc=scenario):
            posts.append(req.post_data)
            if sc=="server_error": route.fulfill(status=500,body="{}",headers={"Access-Control-Allow-Origin":"*","Content-Type":"application/json"})
            else:
                import time; time.sleep(0.6 if sc=="double_submit" else 0)
                route.fulfill(status=200,body='{"ok":true}',headers={"Access-Control-Allow-Origin":"*","Content-Type":"application/json"})
        ctx.route("https://forms.example.test/**",lambda r,req: r.fulfill(status=204,headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*","Access-Control-Allow-Methods":"POST, OPTIONS"}) if req.method=="OPTIONS" else handler(r,req))
        pg.add_init_script("window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective))")
        pg.goto(os.environ.get("QA_BASE_ENDPOINT","http://localhost:4361")+"/contact-us",wait_until="load"); pg.wait_for_timeout(1200)
        fill_step2(pg,company="Spam Inc" if scenario=="honeypot" else None)
        btn=pg.locator("button:has-text('Send request')")
        if scenario=="double_submit":
            pg.evaluate("()=>{const f=document.querySelector('form'); for(let i=0;i<5;i++) f.requestSubmit();}")
        else: btn.click()
        pg.wait_for_timeout(1800)
        body=pg.inner_text("body"); csp=pg.evaluate("window.__csp")
        if scenario=="success":
            d=json.loads(posts[0]) if posts else {}
            OK("B1 endpoint success: shows 'Request sent'","Request sent" in body and "not sent yet" not in body)
            OK("B2 payload has all fields", all(k in d for k in ("name","phone","email","trip","guests","date","message")) and d.get("name")=="Test User")
            OK("B3 exactly one POST",len(posts)==1)
            OK("B4 CSP allows the form origin (no violations)", csp==[])
        if scenario=="server_error":
            OK("B5 server 500: error shown, NOT success","Request sent" not in body and ("Something went wrong" in body or "went wrong" in body.lower()))
            OK("B6 after error the user can retry (form still present)", pg.locator("button:has-text('Send request')").count()==1)
        if scenario=="double_submit": OK(f"B7 5 rapid submits -> 1 POST (got {len(posts)})",len(posts)==1)
        if scenario=="honeypot": OK(f"B8 honeypot filled -> no POST (got {len(posts)})",len(posts)==0)
        ctx.close()
    br.close()
