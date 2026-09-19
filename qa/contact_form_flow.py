"""Site-wide 'Ask the captain' form (ContactForm) on a page that has no booking form.
A: default build (no form service)  QA_BASE=http://localhost:4325
B: build with PUBLIC_FORM_ENDPOINT=https://forms.example.test/f/abc   QA_BASE_ENDPOINT=http://localhost:4361"""
import os, json
from playwright.sync_api import sync_playwright
OK = lambda n, c: print(("PASS " if c else "FAIL ") + n)
PAGE = '/fishing-faqs'
A = os.environ.get('QA_BASE', 'http://localhost:4325')
B = os.environ.get('QA_BASE_ENDPOINT', 'http://localhost:4361')

def fill(pg, name='Test User', email='t@example.com', phone='', msg='Do you take kids on the crab trip?', company=None):
    f = pg.locator('.cb-form')
    f.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
    f.locator('input[name=name]').fill(name); f.locator('input[name=email]').fill(email)
    if phone: f.locator('input[name=phone]').fill(phone)
    f.locator('textarea[name=message]').fill(msg)
    if company: pg.evaluate("(v)=>{const i=document.querySelector('.cb-form input[name=company]');i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))}", company)

with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={'width': 1280, 'height': 1000}); pg.set_default_timeout(6000)
    pg.goto(A + PAGE, wait_until='load'); pg.wait_for_timeout(1200)
    OK('C0 contact form present on a non-booking page', pg.locator('.cb-form').count() == 1)
    # validation
    pg.locator('.cb-form').scroll_into_view_if_needed()
    pg.locator('.cb-form button[type=submit]').click(); pg.wait_for_timeout(500)
    OK('C1 empty submit blocked with messages', pg.locator('.cb-err').count() >= 3 and 'not sent' not in pg.inner_text('body').lower())
    pg.locator('.cb-form input[name=email]').fill('nope'); pg.locator('.cb-form input[name=phone]').fill('123')
    pg.locator('.cb-form button[type=submit]').click(); pg.wait_for_timeout(400)
    OK('C2 bad email and short phone rejected', 'Enter an email' in pg.inner_text('.cb-form') and 'area code' in pg.inner_text('.cb-form'))
    pg.locator('.cb-form input[name=name]').fill('x' * 500)
    OK('C3 name capped at 80', len(pg.input_value('.cb-form input[name=name]')) <= 80)
    pg.reload(wait_until='load'); pg.wait_for_timeout(1000)
    fill(pg); pg.locator('.cb-form button[type=submit]').click(); pg.wait_for_timeout(800)
    body = pg.inner_text('body')
    OK('C4 no endpoint: says "not sent yet", never "Message sent"', 'Your message is not sent yet' in body and 'Message sent' not in body)
    href = pg.locator("a:has-text('Open email again')").get_attribute('href') or ''
    OK('C5 mailto carries subject, name and the page it was sent from', href.startswith('mailto:') and 'Test%20User' in href and 'fishing-faqs' in href)
    OK('C6 copy/edit fallbacks', pg.locator("button:has-text('Copy message')").count() == 1 and pg.locator("button:has-text('Edit message')").count() == 1)
    pg.locator("button:has-text('Edit message')").click(); pg.wait_for_timeout(400)
    OK('C7 edit returns to the form with the form intact', pg.locator('.cb-form').count() == 1)
    pg.close()

    for scenario in (() if os.environ.get('SKIP_ENDPOINT') else ('success', 'server_error', 'double_submit', 'honeypot')):
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); ctx.set_default_timeout(6000); pg = ctx.new_page()
        posts = []
        def handler(route, req, sc=scenario):
            posts.append(req.post_data)
            if sc == 'server_error': route.fulfill(status=500, body='{}', headers={'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'})
            else:
                import time; time.sleep(0.6 if sc == 'double_submit' else 0)
                route.fulfill(status=200, body='{"ok":true}', headers={'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'})
        ctx.route('https://forms.example.test/**', lambda r, req: r.fulfill(status=204, headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS'}) if req.method == 'OPTIONS' else handler(r, req))
        pg.add_init_script("window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective))")
        pg.goto(B + '/oregon-fishing-species', wait_until='load'); pg.wait_for_timeout(1200)
        fill(pg, company='Spam Inc' if scenario == 'honeypot' else None)
        if scenario == 'double_submit': pg.evaluate("()=>{const f=document.querySelector('.cb-form'); for(let i=0;i<5;i++) f.requestSubmit();}")
        else: pg.locator('.cb-form button[type=submit]').click()
        pg.wait_for_timeout(1800)
        body = pg.inner_text('body'); csp = pg.evaluate('window.__csp')
        if scenario == 'success':
            d = json.loads(posts[0]) if posts else {}
            OK('D1 endpoint success: "Message sent"', 'Message sent' in body and 'not sent yet' not in body)
            OK('D2 payload has name/email/trip/message/page', all(k in d for k in ('name', 'email', 'trip', 'message', 'page')) and d.get('page') == '/oregon-fishing-species')
            OK('D3 exactly one POST and no CSP violations', len(posts) == 1 and csp == [])
        if scenario == 'server_error':
            OK('D4 server 500: error shown, NOT success', 'Message sent' not in body and 'went wrong' in body.lower())
            OK('D5 form still there to retry', pg.locator('.cb-form button[type=submit]').count() == 1)
        if scenario == 'double_submit': OK(f'D6 5 rapid submits -> 1 POST (got {len(posts)})', len(posts) == 1)
        if scenario == 'honeypot': OK(f'D7 honeypot filled -> no POST (got {len(posts)})', len(posts) == 0)
        ctx.close()
    br.close()
