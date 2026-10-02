"""Finds elements that collide: glyph ink printing over the next element, text clipped by its
own box, children escaping their parent, and touch targets under 44px. Added after the coupon
stub printed a descender over its label (line-height 0.85 left no room for the 'g' in 'Aug')."""
import os, sys, json
from playwright.sync_api import sync_playwright

B = os.environ.get("QA_BASE", "http://localhost:4371")
PAGES = ["/", "/oregon-fishing-charter-rates", "/oregon-fishing-species", "/oregon-fishing-charter-photos",
         "/oregon-fishing-charter-reviews", "/oregon-fishing-reports", "/captain-clinton-mcculloch-of-oregon",
         "/fishing-faqs", "/contact-us", "/article", "/article/things-to-do-in-oregon",
         "/article/get-your-valid-oregon-fishing-license", "/terms-of-service", "/privacy-policy",
         "/sitemap", "/404", "/profile/clinton-mcculloch",
         "/oregon-fishing-charter-rates/full-day-oregon-river-fishing-charter",
         "/oregon-fishing-charter-rates/oregon-crabbing-charter-bdc-guide-service",
         "/oregon-fishing-charter-photos/clackamas-chinook-salmon-catch-2532"]
WIDTHS = [320, 360, 390, 414, 480, 600, 768, 834, 1024, 1180, 1280, 1440, 1680, 1920, 2560]

JS = r"""
() => {
  // Screen-reader text (.sr-only/.tp-sr), honeypots (.qr__hp/.cb-hp) and anything parked off-canvas
  // are 1x1 clipped boxes on purpose: they are not layout bugs and must never be reported.
  const offscreen = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n), r = n.getBoundingClientRect();
      if (s.clip !== 'auto' && s.clip !== '' ) return true;
      if (s.clipPath && s.clipPath !== 'none') return true;
      if (r.width <= 1 || r.height <= 1) return true;
      if (r.right < -1000 || r.left > window.innerWidth + 5000) return true;
    }
    return false;
  };
  const decorative = (el) => el.closest('[aria-hidden="true"]') !== null;
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    return !offscreen(el);
  };
  const path = (el) => {
    const p = [];
    for (let n = el; n && n.nodeType === 1 && p.length < 4; n = n.parentElement) {
      p.unshift(n.tagName.toLowerCase() + (n.className && typeof n.className === 'string'
        ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : ''));
    }
    return p.join('>');
  };
  const textOf = (el) => (el.textContent || '').trim().slice(0, 28);
  const out = [];
  const cv = document.createElement('canvas').getContext('2d');

  // ---- 1. glyph ink printing onto the element below it -------------------------------
  // Only leaf text nodes, and only against the next element in document order that is also
  // a text leaf and starts below it. line-height < 1 is the usual cause.
  const leaves = [...document.querySelectorAll('body *')].filter(el =>
    vis(el) && el.children.length === 0 && (el.textContent || '').trim());
  // The painted glyphs, not the source text: text-transform:uppercase removes every descender,
  // so measuring the raw textContent invents collisions that cannot happen on screen.
  const painted = (el, cs) => {
    const t = (el.textContent || '').trim();
    const tt = cs.textTransform;
    return tt === 'uppercase' ? t.toUpperCase() : tt === 'lowercase' ? t.toLowerCase()
         : tt === 'capitalize' ? t.replace(/\b\w/g, c => c.toUpperCase()) : t;
  };
  const inkOf = (el) => {
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight) || fs;
    if (!fs) return null;
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const m = cv.measureText(painted(el, cs));
    if (!m.fontBoundingBoxAscent) return null;
    const r = el.getBoundingClientRect();
    const lines = Math.max(1, Math.round(r.height / lh));
    const firstBaseline = r.top + (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    const lastBaseline = firstBaseline + (lines - 1) * lh;
    return { box: r, lh, fs,
             inkTop: firstBaseline - (m.actualBoundingBoxAscent || 0),
             inkBottom: lastBaseline + (m.actualBoundingBoxDescent || 0) };
  };
  for (const el of leaves) {
    const a = inkOf(el); if (!a) continue;
    const cs = getComputedStyle(el);
    const r = a.box, inkBottom = a.inkBottom;
    if (inkBottom <= r.bottom + 0.5 && a.inkTop >= r.top - 0.5) continue;  // ink inside its own box, fine
    for (const other of leaves) {
      if (other === el || el.contains(other) || other.contains(el)) continue;
      const b = inkOf(other); if (!b) continue;
      const o = b.box;
      if (o.right < r.left + 1 || o.left > r.right - 1) continue;       // no horizontal overlap
      if (o.top >= r.bottom - 0.5 && b.inkTop < inkBottom - 0.5) {
        const sameBlock = el.parentElement === other.parentElement
          && el.tagName === other.tagName && el.className === other.className;
        out.push({ kind: sameBlock ? 'line-leading-collision' : 'ink-over-text',
                   a: path(el), aText: textOf(el), b: path(other), bText: textOf(other),
                   px: +(inkBottom - b.inkTop).toFixed(1), lineHeight: +(a.lh / a.fs).toFixed(2) });
        break;
      }
    }
  }

  // ---- 2. text clipped by its own box ------------------------------------------------
  for (const el of leaves) {
    const cs = getComputedStyle(el);
    if (cs.overflow === 'auto' || cs.overflow === 'scroll' || cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue;
    if (cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none') continue;   // deliberate
    if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX === 'hidden')
      out.push({ kind: 'text-clipped', a: path(el), aText: textOf(el), px: el.scrollWidth - el.clientWidth });
  }

  // ---- 3. children escaping a clipping parent ---------------------------------------
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el) || decorative(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.overflow !== 'hidden' && cs.overflowX !== 'hidden') continue;
    if (el.scrollWidth <= el.clientWidth + 2) continue;
    // does the overflow actually cut visible text, or only a decorative/absolute layer?
    const cutsText = [...el.querySelectorAll('*')].some(c =>
      c.children.length === 0 && (c.textContent || '').trim() && vis(c) && !decorative(c)
      && getComputedStyle(c).position !== 'absolute'
      && c.getBoundingClientRect().right > el.getBoundingClientRect().right + 1);
    if (cutsText) out.push({ kind: 'content-cut-off', a: path(el), px: el.scrollWidth - el.clientWidth });
  }

  // ---- 4. touch targets under 44px ---------------------------------------------------
  if (window.innerWidth <= 834) {
    for (const el of document.querySelectorAll('a[href], button, input, select, [role=button], [role=tab]')) {
      if (!vis(el) || decorative(el)) continue;
      const lab = el.closest('label');
      if (lab && lab !== el && lab.getBoundingClientRect().height >= 24) continue;  // label is the target
      if (getComputedStyle(el).display.startsWith('inline') && el.closest('p, li, blockquote, address, dd, td')) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 24 || r.width < 24)
        out.push({ kind: 'touch-target', a: path(el), aText: textOf(el), size: `${Math.round(r.width)}x${Math.round(r.height)}` });
    }
  }

  // ---- 5. page scrolls sideways ------------------------------------------------------
  if (document.documentElement.scrollWidth > window.innerWidth + 1)
    out.push({ kind: 'page-h-overflow', px: document.documentElement.scrollWidth - window.innerWidth });

  return out;
}
"""

def main():
    findings = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        for w in WIDTHS:
            ctx = br.new_context(viewport={"width": w, "height": 900}, device_scale_factor=1)
            pg = ctx.new_page(); pg.set_default_timeout(15000)
            for u in PAGES:
                try:
                    pg.goto(B + u, wait_until="load")
                except Exception as e:
                    findings.append({"w": w, "u": u, "kind": "load-failed", "a": str(e)[:80]}); continue
                pg.wait_for_timeout(450)
                pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); pg.wait_for_timeout(350)
                pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(250)
                for f in pg.evaluate(JS):
                    f.update({"w": w, "u": u}); findings.append(f)
            ctx.close()
        br.close()

    seen, uniq = set(), []
    for f in findings:
        k = (f["kind"], f.get("a", ""), f.get("b", ""), f["u"])
        if k in seen: continue
        seen.add(k); uniq.append(f)

    by = {}
    for f in uniq: by.setdefault(f["kind"], []).append(f)
    print(f"pages {len(PAGES)} x widths {len(WIDTHS)} = {len(PAGES)*len(WIDTHS)} renders")
    print(f"unique findings: {len(uniq)}")
    for kind, items in sorted(by.items()):
        print(f"\n[{kind}] {len(items)}")
        for f in items[:12]:
            print("   ", json.dumps({k: v for k, v in f.items() if k != "kind"}))
    if len(sys.argv) > 1:
        json.dump(uniq, open(sys.argv[1], "w"), indent=1)
    return 1 if uniq else 0

sys.exit(main())
