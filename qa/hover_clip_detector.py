#!/usr/bin/env python3
"""Hover / focus / press clipping and overlap detector.

For every interactive or hoverable element on every page, at every width, this measures the element's *visual*
bounds (getBoundingClientRect, which already includes transform/translate/scale, expanded by box-shadow extents and
outline width + offset) in four states: default, :hover (real mouse move, so magnetic/tilt scripts run), keyboard
:focus-visible and :active. It then walks the ancestors that clip (overflow hidden|clip|auto|scroll, clip-path, mask,
contain: paint|content|strict, content-visibility: auto|hidden, honouring overflow-clip-margin) and flags any side where
the visual bounds exceed the ancestor's padding box by more than 1px. It also flags unintended overlaps between text
lines / controls (default state and newly created by a hover lift/scale).

Rules that keep it honest:
  * A side whose default border box already crosses the clip edge is a deliberate crop (carousel content, media bleed)
    and is only listed as info ("crop"). Scroll axes are exempt for the box, but shadows/rings still count there.
  * Media (img/picture/video/svg/canvas) that fill a clipping frame and zoom inside it are deliberate and are skipped.
  * Fixed chrome (chat/a11y widgets, mobile menu) is reported under scope "widget" and not counted.

Usage:
  QA_BASE=http://localhost:4370 python qa/hover_clip_detector.py [--out report.json] [--widths 320,390,...]
        [--pages /,/fishing-faqs] [--jobs 4] [--quick] [--no-overlap]
Needs: pip install playwright && playwright install chromium. Serve the site first (astro dev or preview).
Exit code is 0 when there are no counted clip or overlap flags, 1 otherwise.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from collections import defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed

BASE = os.environ.get("QA_BASE", "http://localhost:4325").rstrip("/")
WIDTHS = [320, 390, 768, 820, 1024, 1280, 1440, 1920]
PAGES = [
    "/",
    "/oregon-fishing-charter-rates",
    "/oregon-fishing-charter-rates/oregon-fishing-charter-full-day-drift-trip",
    "/oregon-fishing-charter-rates/oregon-crabbing-charter-bdc-guide-service",
    "/oregon-fishing-species",
    "/oregon-fishing-charter-photos",
    "/oregon-fishing-charter-reviews",
    "/oregon-fishing-reports",
    "/captain-clinton-mcculloch-of-oregon",
    "/fishing-faqs",
    "/contact-us",
    "/article/things-to-do-in-oregon",
    "/article/get-your-valid-oregon-fishing-license",
    "/terms-of-service",
    "/privacy-policy",
    "/sitemap",
    "/this-page-does-not-exist-404",
    "/article",
    "/profile/clinton-mcculloch",
    "/oregon-fishing-charter-photos/clackamas-chinook-salmon-catch-2475",
]
OPTIONAL = ("/article", "/profile/clinton-mcculloch")  # routes other people are adding; skipped while they 404

JS_LIB = r"""
(() => {
const px = v => parseFloat(v) || 0;
const cls = e => (typeof e.className === 'string' ? e.className : (e.getAttribute && e.getAttribute('class')) || '').trim().split(/\s+/).filter(Boolean);
const sig = e => e.tagName.toLowerCase() + (cls(e).length ? '.' + cls(e).slice(0, 2).join('.') : (e.id ? '#' + e.id : ''));
const path = e => { const p = []; let x = e; for (let i = 0; x && x.nodeType === 1 && x !== document.body && i < 5; i++) { p.unshift(sig(x)); x = x.parentElement; } return p.join(' > '); };
const MEDIA = new Set(['img', 'picture', 'video', 'canvas', 'svg']);
const INTERACTIVE = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=tab],[role=button],[tabindex]:not([tabindex="-1"]),[data-tilt],[data-magnetic],.card,.ht-trip,.ht-ticket,.gb-plate,.gb-frame,.photo,figure';
const STATE_PROPS = /(^|[^-])(transform|translate|scale|rotate|box-shadow|outline|filter)|^(top|left|right|bottom|inset|margin)/;

function collect() {
  const set = new Set();
  document.querySelectorAll(INTERACTIVE).forEach(e => set.add(e));
  document.querySelectorAll('*').forEach(e => {
    const cs = getComputedStyle(e);
    if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 2) Array.from(e.children).forEach(c => set.add(c));
    const tp = cs.transitionProperty, td = cs.transitionDuration;
    if (td && td !== '0s' && /(transform|translate|scale|rotate|box-shadow|all)/.test(tp)) set.add(e);
  });
  const walk = (rules) => {
    for (const r of rules) {
      if (r.cssRules && !r.selectorText) { try { walk(r.cssRules); } catch (e) {} continue; }
      if (!r.selectorText || !r.style) continue;
      let hit = false;
      for (let i = 0; i < r.style.length; i++) if (STATE_PROPS.test(r.style[i])) { hit = true; break; }
      if (!hit) continue;
      r.selectorText.split(',').forEach(s => {
        if (!/:(hover|focus-visible|focus-within|focus|active)/.test(s) || s.includes('::')) return;
        const base = s.replace(/:(hover|focus-visible|focus-within|focus|active)/g, '').trim();
        if (!base) return;
        try { const l = document.querySelectorAll(base); if (l.length <= 400) l.forEach(e => set.add(e)); } catch (e) {}
      });
    }
  };
  for (const ss of document.styleSheets) { try { walk(ss.cssRules); } catch (e) {} }
  const out = [];
  set.forEach(e => {
    if (!e.tagName || e.closest('astro-dev-toolbar,[hidden],head,noscript,template,[inert]')) return;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    out.push(e);
  });
  return out;
}

function scopeOf(e) {
  if (e.closest('[class*="wd-"],.panel,.skip')) return 'widget';
  if (e.closest('.header')) return 'header';
  if (e.closest('.footer')) return 'footer';
  return 'page';
}

function shadowExt(cs) {
  const v = cs.boxShadow; const ext = { l: 0, t: 0, r: 0, b: 0 };
  if (!v || v === 'none') return ext;
  const parts = []; let depth = 0, cur = '';
  for (const ch of v) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch; }
  parts.push(cur);
  for (let p of parts) {
    if (/inset/.test(p)) continue;
    const am = p.match(/rgba?\([^)]*?,\s*([\d.]+)\)/); if (am && parseFloat(am[1]) < 0.03) continue;
    p = p.replace(/(rgba?|hsla?|color-mix|oklch|oklab|lab|lch|color)\([^)]*\)/g, '').replace(/#[0-9a-f]{3,8}/gi, '');
    const n = (p.match(/-?[\d.]+px|(^|\s)0(?=\s|$)/g) || []).map(s => parseFloat(s) || 0);
    const [ox = 0, oy = 0, bl = 0, sp = 0] = n;
    const g = Math.max(0, bl) + sp;
    ext.l = Math.max(ext.l, g - ox); ext.r = Math.max(ext.r, g + ox); ext.t = Math.max(ext.t, g - oy); ext.b = Math.max(ext.b, g + oy);
  }
  for (const k in ext) ext[k] = Math.max(0, ext[k]);
  return ext;
}

function isCB(a) {
  const c = getComputedStyle(a);
  return c.transform !== 'none' || c.filter !== 'none' || /paint|layout|strict|content/.test(c.contain) || c.willChange.includes('transform') || (c.backdropFilter && c.backdropFilter !== 'none') || c.contentVisibility === 'auto' || (c.translate && c.translate !== 'none') || (c.scale && c.scale !== 'none') || (c.rotate && c.rotate !== 'none');
}
function containingBlock(e) {
  const cs = getComputedStyle(e);
  if (cs.position === 'fixed') { let a = e.parentElement; while (a) { if (isCB(a)) return a; a = a.parentElement; } return null; }
  if (cs.position === 'absolute') { let a = e.parentElement; while (a) { if (getComputedStyle(a).position !== 'static' || isCB(a)) return a; a = a.parentElement; } return document.documentElement; }
  return e.parentElement;
}

function clipsOf(e) {
  const out = []; let cur = e; let guard = 0;
  while (cur && guard++ < 80) {
    const cb = containingBlock(cur);
    if (!cb) break;
    const cs = getComputedStyle(cb);
    let cx = cs.overflowX !== 'visible', cy = cs.overflowY !== 'visible', kind = 'overflow:' + cs.overflowX + '/' + cs.overflowY;
    if (/paint|strict|content/.test(cs.contain)) { cx = cy = true; kind = 'contain:' + cs.contain; }
    if (cs.contentVisibility === 'auto' || cs.contentVisibility === 'hidden') { cx = cy = true; kind = 'content-visibility:' + cs.contentVisibility; }
    if (cs.clipPath && cs.clipPath !== 'none') { cx = cy = true; kind = 'clip-path'; }
    if ((cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')) { cx = cy = true; kind = 'mask'; }
    if (cb === document.documentElement) { cx = cs.overflowX !== 'visible'; cy = false; kind = 'html overflow-x'; }
    if (cx || cy) {
      const isRoot = cb === document.documentElement;
      const r = isRoot ? { left: 0, top: 0, right: document.documentElement.clientWidth, bottom: 1e9 } : cb.getBoundingClientRect();
      const bl = isRoot ? 0 : px(cs.borderLeftWidth), br = isRoot ? 0 : px(cs.borderRightWidth), bt = isRoot ? 0 : px(cs.borderTopWidth), bb = isRoot ? 0 : px(cs.borderBottomWidth);
      let m = 0;
      if (/clip/.test(cs.overflowX + cs.overflowY)) { const mm = (cs.overflowClipMargin || '').match(/([\d.]+)px/); if (mm) m = parseFloat(mm[1]); }
      const scX = (cs.overflowX === 'auto' || cs.overflowX === 'scroll') && cb.scrollWidth > cb.clientWidth + 1;
      const scY = (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && cb.scrollHeight > cb.clientHeight + 1;
      out.push({ sig: sig(cb), path: path(cb), kind, cx, cy, scX, scY,
        l: r.left + bl - m, t: r.top + bt - m, r: r.right - br + m, b: r.bottom - bb + m });
    }
    cur = cb;
  }
  return out;
}

function measure(e) {
  const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  const sh = shadowExt(cs);
  let ol = 0;
  if (cs.outlineStyle !== 'none' && px(cs.outlineWidth) > 0) ol = px(cs.outlineWidth) + px(cs.outlineOffset);
  ol = Math.max(0, ol);
  return { box: { l: r.left, t: r.top, r: r.right, b: r.bottom }, sh, ol,
    vis: { l: r.left - Math.max(sh.l, ol), t: r.top - Math.max(sh.t, ol), r: r.right + Math.max(sh.r, ol), b: r.bottom + Math.max(sh.b, ol) },
    visOl: { l: r.left - ol, t: r.top - ol, r: r.right + ol, b: r.bottom + ol }, vw: document.documentElement.clientWidth,
    clips: clipsOf(e),
    hover: e.matches(':hover'), fv: e.matches(':focus-visible'), active: e.matches(':active'), shadowCss: cs.boxShadow.slice(0, 80), outlineCss: cs.outlineWidth + ' ' + cs.outlineOffset };
}

window.__qa = {
  init() { this.list = collect(); return this.list.length; },
  info(i) {
    const e = this.list[i]; if (!e || !e.isConnected) return null;
    const t = e.tagName.toLowerCase();
    return { i, sig: sig(e), path: path(e), tag: t, media: MEDIA.has(t), scope: scopeOf(e) };
  },
  prep(i) {
    const e = this.list[i]; if (!e || !e.isConnected) return null;
    document.documentElement.style.scrollBehavior = 'auto';
    e.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const r = e.getBoundingClientRect();
    const vw = innerWidth, vh = innerHeight;
    const L = Math.max(r.left, 0), R = Math.min(r.right, vw), T = Math.max(r.top, 0), B = Math.min(r.bottom, vh);
    if (R - L < 2 || B - T < 2) return { ok: false };
    return { ok: true, cx: (L + R) / 2, cy: (T + B) / 2, tx: L + (R - L) * 0.12, ty: T + (B - T) * 0.12, bx: L + (R - L) * 0.88, by: T + (B - T) * 0.88 };
  },
  measure(i) { const e = this.list[i]; return e && e.isConnected ? measure(e) : null; },
  focus(i) { const e = this.list[i]; e.focus({ preventScroll: true }); return e.matches(':focus-visible'); },
  blur() { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); },

  items() {
    const out = []; const sx = scrollX, sy = scrollY;
    const okVis = (el) => {
      let a = el, op = 1;
      while (a && a.nodeType === 1) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden') return false; op *= parseFloat(c.opacity); if (c.position === 'fixed' || c.position === 'sticky') return false; a = a.parentElement; }
      return op > 0.05;
    };
    const skip = el => el.closest('astro-dev-toolbar,svg,[aria-hidden="true"],[hidden],script,style,noscript,template,[class*="wd-"],.panel,.header,.skip,.sr-only,.tp-sr,.tp-hp,[inert],select');
    const clipRect = (el, r) => {
      let L = r.left, T = r.top, R = r.right, B = r.bottom;
      for (const c of clipsOf(el)) { if (c.cx) { L = Math.max(L, c.l); R = Math.min(R, c.r); } if (c.cy) { T = Math.max(T, c.t); B = Math.min(B, c.b); } }
      return (R - L > 2 && B - T > 2) ? { l: L, t: T, r: R, b: B } : null;
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const el = n.parentElement; if (!el || skip(el) || !okVis(el)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) {
        if (r.width < 3 || r.height < 3) continue;
        const cr = clipRect(el, r); if (!cr) continue;
        out.push({ el, kind: 'text', txt: n.nodeValue.trim().slice(0, 30), l: cr.l + sx, t: cr.t + sy, r: cr.r + sx, b: cr.b + sy });
      }
    }
    document.querySelectorAll('a[href],button,input:not([type=hidden]),textarea,summary,[role=button],[role=tab]').forEach(el => {
      if (skip(el) || !okVis(el)) return;
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
      const cr = clipRect(el, r); if (!cr) return;
      out.push({ el, kind: 'ctl', txt: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30), l: cr.l + sx, t: cr.t + sy, r: cr.r + sx, b: cr.b + sy });
    });
    this.items_ = out;
    return out.length;
  },
  overlaps(minPx) {
    const it = (this.items_ || []).slice().sort((a, b) => a.t - b.t); const res = []; const seenPair = new Set();
    for (let i = 0; i < it.length; i++) {
      const a = it[i];
      for (let j = i + 1; j < it.length; j++) {
        const b = it[j]; if (b.t >= a.b - minPx && b.t > a.t + 400) break;
        if (b.t >= a.b - minPx) continue;
        if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ix = Math.min(a.r, b.r) - Math.max(a.l, b.l), iy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
        if (ix > minPx && iy > minPx) {
          const key = sig(a.el) + '|' + sig(b.el) + '|' + Math.round(a.t / 20);
          if (seenPair.has(key)) continue; seenPair.add(key);
          res.push({ a: path(a.el), at: a.txt, ak: a.kind, b: path(b.el), bt: b.txt, bk: b.kind, ix: Math.round(ix), iy: Math.round(iy), y: Math.round(a.t) });
        }
      }
    }
    return res;
  },
  hoverOverlaps(i, minPx) {
    const e = this.list[i]; const it = this.items_ || []; if (!e || !e.isConnected) return [];
    const r = e.getBoundingClientRect(); const sx = scrollX, sy = scrollY;
    const box = { l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.bottom + sy };
    const res = [];
    for (const o of it) {
      if (o.el === e || e.contains(o.el) || o.el.contains(e)) continue;
      const ix = Math.min(box.r, o.r) - Math.max(box.l, o.l), iy = Math.min(box.b, o.b) - Math.max(box.t, o.t);
      if (ix > minPx && iy > minPx) res.push({ b: path(o.el), bt: o.txt, ix: Math.round(ix), iy: Math.round(iy) });
    }
    return res;
  },
  docSize() { return { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, vw: innerWidth }; },
};
})();
"""

INIT_SCRIPT = r"""
window.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
window.addEventListener('submit', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
"""

NO_MOTION_CSS = "*,*::before,*::after{transition:none!important;scroll-behavior:auto!important}astro-dev-toolbar{display:none!important}"

SIDES = ("l", "t", "r", "b")


def side_excess(v, clip, side):
    if side in ("l", "t"):
        return clip[side] - v[side]
    return v[side] - clip[side]


def analyse(info, state, m, default, cropped):
    """Return clip flags for one measured state, comparing against the default-state geometry."""
    flags = []
    if m is None or default is None:
        return flags
    for c in m["clips"]:
        if info["media"]:
            b = default["box"]
            iw = min(b["r"], c["r"]) - max(b["l"], c["l"]); ih = min(b["b"], c["b"]) - max(b["t"], c["t"])
            area = max(1.0, (c["r"] - c["l"]) * (c["b"] - c["t"]))
            if iw > 0 and ih > 0 and iw * ih / area >= 0.85:
                break  # this clip is the media's own frame (zoom/pan inside it is deliberate); outer clips are irrelevant
        for side in SIDES:
            is_x = side in ("l", "r")
            if (is_x and not c["cx"]) or (not is_x and not c["cy"]):
                continue
            scroll_axis = c["scX"] if is_x else c["scY"]
            box_ex = side_excess(m["box"], c, side)
            dbox_ex = side_excess(default["box"], c, side)
            # a shadow that runs past the viewport edge is invisible anyway: at viewport-edge clips only the ring counts
            at_edge = (side == "l" and c["l"] <= 0.5) or (side == "r" and c["r"] >= m["vw"] - 0.5)
            key = "visOl" if at_edge else "vis"
            vis_ex = side_excess(m[key], c, side)
            dvis_ex = side_excess(default[key], c, side)
            if dbox_ex > 1.0:
                if state == "default" and not info["media"]:
                    cropped.append((info, c, side, dbox_ex))
                continue  # deliberate crop of the border box
            if scroll_axis and box_ex > 1.0:
                continue  # content moved along its own scroll axis
            if vis_ex > 1.0:
                flags.append({"state": state, "clip": c["path"], "clip_sig": c["sig"], "kind": c["kind"], "side": side,
                              "px": round(vis_ex, 1), "box_px": round(max(box_ex, 0), 1), "scroll_axis": bool(scroll_axis),
                              "at_rest_px": round(max(dvis_ex, 0), 1), "shadow": m["shadowCss"], "outline": m["outlineCss"]})
    return flags


def run_job(job):
    """Run one page x width, retrying when the dev server reloads the page underneath us (HMR, transient 5xx)."""
    res = None
    for attempt in range(4):
        res = run_job_once(job)
        bad = any(n.startswith("ERROR") or n.startswith("HTTP 5") for n in res["note"]) or (res["n"] == 0 and not res.get("skipped") and "does-not-exist" not in job[0])
        if not bad:
            break
        time.sleep(3)
    return res


def run_job_once(job):
    from playwright.sync_api import sync_playwright
    path, width, opts = job
    res = {"page": path, "width": width, "clip": [], "crop": [], "overlap": [], "hover_overlap": [], "note": [], "n": 0}
    unhover = set()
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        h = 900 if width >= 768 else 780
        ctx = br.new_context(viewport={"width": width, "height": h})
        page = ctx.new_page()
        page.add_init_script(INIT_SCRIPT)
        try:
            resp = page.goto(BASE + path, wait_until="load", timeout=60000)
            for _ in range(8):  # dev server may return a transient 5xx while files are being edited
                if not resp or resp.status < 500:
                    break
                page.wait_for_timeout(4000)
                resp = page.goto(BASE + path, wait_until="load", timeout=60000)
            status = resp.status if resp else None
            res["status"] = status
            if status == 404 and "does-not-exist" not in path and (path in OPTIONAL or path.startswith("/oregon-fishing-charter-photos/")):
                res["note"].append("route not built yet (404), skipped")
                res["skipped"] = True
                br.close()
                return res
            if status and status >= 400 and "does-not-exist" not in path:
                res["note"].append(f"HTTP {status}")
            page.wait_for_timeout(1200)
            page.add_style_tag(content=NO_MOTION_CSS)
            page.evaluate("document.querySelector('astro-dev-toolbar')?.remove()")
            page.evaluate(JS_LIB)
            H = page.evaluate("document.documentElement.scrollHeight")
            y = 0
            while y < H:
                page.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})")
                page.wait_for_timeout(70)
                y += int(h * 0.6)
                H = max(H, page.evaluate("document.documentElement.scrollHeight"))
            page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
            page.wait_for_timeout(400)
            ds = page.evaluate("__qa.docSize()")
            if ds["w"] > ds["vw"] + 1:
                res["note"].append(f"horizontal scroll: scrollWidth {ds['w']} > {ds['vw']}")
            n = page.evaluate("__qa.init()")
            res["n"] = n
            if not opts.get("no_overlap"):
                page.evaluate("__qa.items()")
                res["overlap"] = page.evaluate("__qa.overlaps(3)")
            page.mouse.move(-5, -5)
            cropped = []
            for i in range(n):
                if opts.get("quick") and (i % 3):
                    continue
                info = page.evaluate(f"__qa.info({i})")
                if not info:
                    continue
                if path != "/" and info["scope"] in ("header", "footer"):
                    continue  # identical chrome on every page: tested once on /
                pos = page.evaluate(f"__qa.prep({i})")
                if not pos or not pos.get("ok"):
                    continue
                page.mouse.move(-5, -5)
                page.wait_for_timeout(12)
                d = page.evaluate(f"__qa.measure({i})")
                if d is None:
                    continue
                found = analyse(info, "default", d, d, cropped)
                for (x, yy, first) in ((pos["cx"], pos["cy"], True), (pos["bx"], pos["by"], False), (pos["tx"], pos["ty"], False)):
                    page.mouse.move(x, yy)
                    page.wait_for_timeout(45)
                    m = page.evaluate(f"__qa.measure({i})")
                    if m and not m["hover"]:
                        unhover.add(info["path"])
                        m = None
                    if m:
                        found += analyse(info, "hover", m, d, cropped)
                        if first and not opts.get("no_overlap"):
                            for o in page.evaluate(f"__qa.hoverOverlaps({i},3)"):
                                res["hover_overlap"].append({"el": info["path"], **o})
                page.mouse.move(pos["cx"], pos["cy"])
                page.wait_for_timeout(25)
                page.mouse.down()
                page.wait_for_timeout(45)
                m = page.evaluate(f"__qa.measure({i})")
                if m and m["active"]:
                    found += analyse(info, "active", m, d, cropped)
                page.mouse.move(-5, -5)
                page.mouse.up()
                page.keyboard.press("Shift")
                fv = page.evaluate(f"__qa.focus({i})")
                page.wait_for_timeout(45)
                m = page.evaluate(f"__qa.measure({i})")
                if m and (fv or m["fv"]):
                    found += analyse(info, "focus", m, d, cropped)
                page.evaluate("__qa.blur()")
                seen = set()
                for f in found:  # one row per (state, ancestor, side)
                    k = (f["state"], f["clip"], f["side"])
                    if k in seen:
                        continue
                    seen.add(k)
                    f.update({"el": info["path"], "sig": info["sig"], "scope": info["scope"], "tag": info["tag"]})
                    res["clip"].append(f)
            for info, c, side, ex in cropped:
                res["crop"].append({"el": info["path"], "sig": info["sig"], "clip": c["path"], "side": side, "px": round(ex, 1),
                                    "scope": info["scope"], "scroll_axis": bool(c["scX"] if side in ("l", "r") else c["scY"])})
        except Exception as ex:  # keep going and report
            res["note"].append(f"ERROR {type(ex).__name__}: {str(ex)[:200]}")
        finally:
            br.close()
    res["unhoverable"] = sorted(unhover)
    return res


def dedupe(items, keyf):
    d = defaultdict(list)
    for it in items:
        d[keyf(it)].append(it)
    return d


def summarize(results, out):
    counted_scopes = ("page", "footer", "header")
    counted = [f for r in results for f in r["clip"] if f["scope"] in counted_scopes]
    widget = [f for r in results for f in r["clip"] if f["scope"] == "widget"]
    by = {}
    for r in results:
        for f in r["clip"]:
            if f["scope"] not in counted_scopes:
                continue
            k = (f["sig"], f["clip_sig"], f["kind"])
            g = by.setdefault(k, {"px": 0, "states": set(), "sides": set(), "pages": set(), "widths": set(), "ex": None})
            g["px"] = max(g["px"], f["px"]); g["states"].add(f["state"]); g["sides"].add(f["side"])
            g["pages"].add(r["page"]); g["widths"].add(r["width"])
            if g["ex"] is None or f["px"] > g["ex"]["px"]:
                g["ex"] = {**f, "page": r["page"], "width": r["width"]}
    out.append(f"CLIPPED (counted): {len(counted)} raw flags, {len(by)} distinct element/ancestor pairs; widget scope (not counted): {len(widget)}")
    for k, g in sorted(by.items(), key=lambda kv: -kv[1]["px"]):
        e = g["ex"]
        out.append(f"  {k[0]}  cut by {k[1]} [{k[2]}]  max {g['px']}px  states={sorted(g['states'])} sides={sorted(g['sides'])} "
                   f"pages={len(g['pages'])} widths={sorted(g['widths'])}\n      worst: {e['page']} @{e['width']} :: {e['el']}  (shadow: {e['shadow'][:50]} | outline: {e['outline']})")
    ov = [dict(o, page=r["page"], width=r["width"]) for r in results for o in r["overlap"]]
    g2 = dedupe(ov, lambda o: (o["a"].split(" > ")[-1], o["b"].split(" > ")[-1]))
    out.append(f"OVERLAPS (default state): {len(ov)} raw, {len(g2)} distinct")
    for k, l in sorted(g2.items(), key=lambda kv: -len(kv[1])):
        o = l[0]
        out.append(f"  {k[0]} x {k[1]}  n={len(l)}  e.g. {o['page']} @{o['width']}  '{o['at']}' vs '{o['bt']}' {o['ix']}x{o['iy']}px")
    rest = {(o["a"], o["b"]) for o in ov} | {(o["b"], o["a"]) for o in ov}
    ho = [dict(o, page=r["page"], width=r["width"]) for r in results for o in r["hover_overlap"] if (o["el"], o["b"]) not in rest]
    g3 = dedupe(ho, lambda o: (o["el"].split(" > ")[-1], o["b"].split(" > ")[-1]))
    out.append(f"HOVER OVERLAPS (element box vs other text/controls, not present at rest): {len(ho)} raw, {len(g3)} distinct")
    for k, l in sorted(g3.items(), key=lambda kv: -len(kv[1]))[:60]:
        o = l[0]
        out.append(f"  {k[0]} over {k[1]} n={len(l)} e.g. {o['page']} @{o['width']} '{o['bt']}' {o['ix']}x{o['iy']}px")
    cr = [dict(c, page=r["page"], width=r["width"]) for r in results for c in r["crop"] if c["scope"] in counted_scopes]
    g4 = dedupe(cr, lambda c: (c["sig"], c["clip"].split(" > ")[-1], c["side"], c["scroll_axis"]))
    out.append(f"CROPS at rest (info, deliberate): {len(cr)} raw, {len(g4)} distinct")
    for k, l in sorted(g4.items(), key=lambda kv: -len(kv[1]))[:40]:
        out.append(f"  {k[0]} in {k[1]} side={k[2]} scroll_axis={k[3]} n={len(l)} max {max(c['px'] for c in l)}px e.g. {l[0]['page']} @{l[0]['width']}")
    notes = [f"{r['page']} @{r['width']}: {n}" for r in results for n in r["note"]]
    if notes:
        out.append("NOTES:")
        out.extend("  " + n for n in notes[:80])
    return len(counted) + len(ov) + len(ho)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="hover_clip_report.json")
    ap.add_argument("--widths", default=",".join(map(str, WIDTHS)))
    ap.add_argument("--pages", default="")
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--quick", action="store_true", help="test every 3rd element only (smoke run)")
    ap.add_argument("--no-overlap", action="store_true")
    a = ap.parse_args()
    widths = [int(x) for x in a.widths.split(",") if x]
    pages = [p for p in a.pages.split(",") if p] or PAGES
    opts = {"quick": a.quick, "no_overlap": a.no_overlap}
    jobs = [(p, w, opts) for p in pages for w in widths]
    results = []
    t0 = time.time()
    with ProcessPoolExecutor(max_workers=a.jobs) as ex:
        futs = [ex.submit(run_job, j) for j in jobs]
        for f in as_completed(futs):
            r = f.result()
            results.append(r)
            print(f"[{len(results)}/{len(jobs)}] {r['page']} @{r['width']}: {r['n']} els, {len(r['clip'])} clip, {len(r['overlap'])} overlap {r['note'][:1]} ({time.time()-t0:.0f}s)", flush=True)
    with open(a.out, "w") as fh:
        json.dump(results, fh, indent=1)
    lines = []
    total = summarize(results, lines)
    print("\n".join(lines))
    print(f"\nTOTAL counted flags: {total}   (report: {a.out})")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
