"""Home hero 'Request a trip' bar. Default build (no form service): QA_BASE=http://localhost:4325"""
import os
from playwright.sync_api import sync_playwright
OK = lambda n, c: print(("PASS " if c else "FAIL ") + n)
B = os.environ.get('QA_BASE', 'http://localhost:4325')
with sync_playwright() as p:
    br = p.chromium.launch()
    for label, vp, sel in (('desktop', {'width': 1440, 'height': 900}, '.qr-desk .qr'), ('phone', {'width': 390, 'height': 844}, '.qr-mob .qr')):
        pg = br.new_page(viewport=vp); pg.set_default_timeout(6000)
        pg.goto(B + '/', wait_until='load'); pg.wait_for_timeout(1800)
        f = pg.locator(sel)
        box = f.bounding_box()
        OK(f'Q1 {label}: bar is on screen without scrolling', box is not None and box['y'] + 60 < vp['height'])
        OK(f'Q2 {label}: only one bar is visible', pg.locator('.qr:visible').count() == 1)
        f.locator('button[type=submit]').click(); pg.wait_for_timeout(300)
        OK(f'Q3 {label}: empty submit blocked with a message', 'Enter your name' in f.inner_text())
        f.locator('input[name=name]').fill('Test User'); f.locator('input[name=phone]').fill('123')
        f.locator('button[type=submit]').click(); pg.wait_for_timeout(300)
        OK(f'Q4 {label}: short phone rejected', 'area code' in f.inner_text())
        f.locator('input[name=phone]').fill('5035550100'); f.locator('select').select_option(index=2)
        f.locator('button[type=submit]').click(); pg.wait_for_timeout(600)
        t = pg.inner_text('body')
        OK(f'Q5 {label}: no endpoint says "Not sent yet", never "Request sent"', 'Not sent yet' in t and 'Request sent' not in t)
        href = pg.locator("a:has-text('Open email again')").first.get_attribute('href') or ''
        OK(f'Q6 {label}: mailto carries name, phone and trip', 'Test%20User' in href and '5035550100' in href and 'Trip' in href)
        pg.close()
    br.close()
