import os
from playwright.sync_api import sync_playwright
B=os.environ.get("QA_BASE","http://localhost:4325")
PAGES=["/","/oregon-fishing-charter-rates","/oregon-fishing-charter-rates/oregon-fishing-charter-full-day-drift-trip","/oregon-fishing-charter-rates/oregon-crabbing-charter-bdc-guide-service","/oregon-fishing-species","/oregon-fishing-charter-photos","/oregon-fishing-charter-reviews","/oregon-fishing-reports","/captain-clinton-mcculloch-of-oregon","/fishing-faqs","/contact-us","/article/things-to-do-in-oregon","/article/get-your-valid-oregon-fishing-license","/terms-of-service","/privacy-policy","/sitemap","/no-such-page"]
INIT="window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' | '+(e.blockedURI||'').slice(0,60)+' | '+(e.sourceFile||'').slice(-30)));"
with sync_playwright() as p:
    for bn in ("chromium","firefox","webkit"):
        br=getattr(p,bn).launch(); ctx=br.new_context(viewport={"width":1280,"height":900}); ctx.set_default_timeout(6000)
        pg=ctx.new_page(); errs=[]; viol=[]
        pg.on("pageerror",lambda e: errs.append("pageerror "+str(e)[:120])); pg.on("console",lambda m: errs.append("console."+m.type+" "+m.text[:140]) if m.type in ("error","warning") else None)
        pg.add_init_script(INIT)
        for u in PAGES:
            pg.goto(B+u,wait_until="load"); pg.wait_for_timeout(600)
            v=pg.evaluate("window.__csp||[]"); viol+= [(u,x) for x in v]
        # soft navigation tour (Astro ClientRouter): click real links, no reloads
        pg.goto(B+"/",wait_until="load"); pg.wait_for_timeout(900)
        for href in ("/oregon-fishing-charter-rates","/oregon-fishing-species","/fishing-faqs","/contact-us","/oregon-fishing-charter-photos","/"):
            pg.evaluate(f"document.querySelector('a[href=\"{href}\"]').click()"); pg.wait_for_timeout(1000)
        viol+=[("soft-nav",x) for x in pg.evaluate("window.__csp||[]")]
        # widgets under CSP
        try:
            pg.goto(B+"/",wait_until="load"); pg.wait_for_timeout(1500)
            pg.locator("button[aria-label*='hat' i], .wd-launcher").first.click(); pg.wait_for_timeout(500)
            pg.locator("input[placeholder*='Ask' i]").last.fill("how much is a half day trip?"); pg.keyboard.press("Enter"); pg.wait_for_timeout(1200)
            chat_ok="$150" in pg.inner_text("body")
            pg.keyboard.press("Escape")
            pg.locator("button[aria-label*='ccessibility']").first.click(); pg.wait_for_timeout(300); pg.locator("button[role=switch]").first.click(); a11y_ok=pg.evaluate("document.documentElement.dataset.contrast")=="high"; pg.evaluate("localStorage.clear()")
            form_ok='see form_flow.py'
        except Exception as e: chat_ok=a11y_ok=form_ok=f"ERR {str(e)[:60]}"
        viol+=[("widgets",x) for x in pg.evaluate("window.__csp||[]")]
        print(f"== {bn}: violations={len(viol)} console/page issues={len(errs)} | chat={chat_ok} a11y={a11y_ok} form={form_ok}")
        for v in sorted(set(viol))[:6]: print("   VIOL",v)
        for e in sorted(set(errs))[:6]: print("   ERR ",e)
        br.close()
