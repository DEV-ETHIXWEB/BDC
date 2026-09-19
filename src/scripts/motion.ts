/**
 * BDC motion runtime. Vanilla, dependency free, progressive enhancement.
 * Contract (see docs/design-system.md): data-reveal, data-stagger, data-parallax, data-count(+suffix),
 * data-magnetic, data-split, scroll progress, header condense, smooth anchors.
 * Hidden states live in global.css and only apply under html.js-motion.
 */

const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const hoverFine = matchMedia('(hover: hover) and (pointer: fine)');
const scrollTimelines = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

const motionAllowed = () => !reduceMQ.matches && root.dataset.motion !== 'reduce';

let io: IntersectionObserver | null = null;
let cleanups: Array<() => void> = [];
let globalsBound = false;
let ticking = false;
let parallaxEls: { el: HTMLElement; k: number }[] = [];

const $$ = <T extends HTMLElement = HTMLElement>(sel: string, ctx: ParentNode = document) => Array.from(ctx.querySelectorAll<T>(sel));

/* ───────── split headlines ───────── */
function splitNode(node: Node, out: HTMLElement[]) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === 3) {
      const text = child.textContent ?? '';
      if (!text.trim()) return;
      const frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
        w.appendChild(wi); frag.appendChild(w); out.push(wi);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === 1 && (child as HTMLElement).tagName !== 'BR') {
      splitNode(child, out);
    }
  });
}

function initSplit() {
  $$('[data-split]').forEach((el) => {
    // init() can run more than once (page-load + startup) and builds a fresh observer each time,
    // so an already-split heading must be re-observed or it stays hidden forever.
    if (el.hasAttribute('data-split-ready')) { if (!el.classList.contains('is-in')) observe(el); return; }
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', (el.textContent ?? '').replace(/\s+/g, ' ').trim());
    const words: HTMLElement[] = [];
    splitNode(el, words);
    // group into visual lines by offsetTop so each line staggers as a unit
    let line = -1, top = -9999;
    words.forEach((wi, i) => {
      const t = (wi.parentElement as HTMLElement).offsetTop;
      if (Math.abs(t - top) > 4) { line++; top = t; }
      wi.style.setProperty('--l', String(line));
      wi.style.setProperty('--i', String(i));
    });
    el.setAttribute('data-split-ready', '');
    observe(el);
  });
}

/* ───────── reveal ───────── */
function observe(el: Element) { io?.observe(el); }

function reveal(el: Element) { el.classList.add('is-in'); io?.unobserve(el); }

function initReveal() {
  $$('[data-stagger]').forEach((parent) => {
    const step = parseInt(parent.getAttribute('data-stagger') || '', 10) || 70;
    $$('[data-reveal]', parent).forEach((c, i) => { if (!c.style.getPropertyValue('--d')) c.style.setProperty('--d', `${i * step}ms`); });
  });
  $$('[data-reveal]').forEach((el) => {
    const d = el.getAttribute('data-delay');
    if (d && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', /ms$/.test(d) ? d : `${d}ms`);
    observe(el);
  });
}

/* ───────── count up ───────── */
function initCount() {
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count || '0');
    if (Number.isNaN(target)) return;
    const suffix = el.dataset.countSuffix ?? '';
    const prefix = el.dataset.countPrefix ?? '';
    const dec = (el.dataset.count!.split('.')[1] || '').length;
    const fmt = (v: number) => prefix + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    el.setAttribute('aria-label', fmt(target));
    el.textContent = fmt(0);
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        co.unobserve(el);
        const dur = 1600, t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    co.observe(el);
    cleanups.push(() => co.disconnect());
  });
}

/* ───────── magnetic ───────── */
function initMagnetic() {
  if (!hoverFine.matches) return;
  $$('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '') || 0.28;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.setProperty('--mx', `${x.toFixed(1)}px`); el.style.setProperty('--my', `${y.toFixed(1)}px`);
      if (!(el as HTMLElement).classList.contains('btn')) el.style.translate = `${x}px ${y}px`;
    };
    const leave = () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); if (!el.classList.contains('btn')) el.style.translate = ''; };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); leave(); });
  });
}

/* ───────── parallax ───────── */
function initParallax() {
  parallaxEls = [];
  $$('[data-parallax]').forEach((el) => {
    const k = parseFloat(el.dataset.parallax || '') || 0.1;
    el.style.setProperty('--plx', String(k));
    if (!scrollTimelines) parallaxEls.push({ el, k });
  });
  if (parallaxEls.length) onScroll();
}

/* ───────── scroll driven: header, progress, parallax fallback ───────── */
function onScroll() {
  ticking = false;
  const y = window.scrollY;
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (header) header.toggleAttribute('data-scrolled', y > 12);
  if (!scrollTimelines || !root.classList.contains('js-motion')) {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--progress', max > 0 ? String(Math.min(1, y / max)) : '0');
  }
  if (parallaxEls.length) {
    const vh = innerHeight;
    parallaxEls.forEach(({ el, k }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 across viewport
      el.style.setProperty('--py', (p * k * -240).toFixed(1));
    });
  }
}
const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };

/* ───────── nav: current page + animated indicator ───────── */
function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const links = $$<HTMLAnchorElement>('a', nav);
  const path = location.pathname.replace(/\/$/, '') || '/';
  let current: HTMLAnchorElement | null = null;
  links.forEach((a) => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    const on = href !== '/' && (path === href || path.startsWith(href + '/'));
    if (on) { a.setAttribute('aria-current', 'page'); current = a; } else a.removeAttribute('aria-current');
  });
  nav.setAttribute('data-ink', '');
  const place = (a: HTMLElement | null) => {
    if (!a) { nav.style.setProperty('--ink-o', '0'); return; }
    const pad = 14, nr = nav.getBoundingClientRect(), ar = a.getBoundingClientRect();
    nav.style.setProperty('--ink-x', `${(ar.left - nr.left + pad).toFixed(1)}px`);
    nav.style.setProperty('--ink-w', `${Math.max(0, ar.width - pad * 2).toFixed(1)}px`);
    nav.style.setProperty('--ink-o', '1');
  };
  place(current);
  const enter = (e: Event) => place(e.currentTarget as HTMLElement);
  const leave = () => place(current);
  // The header persists across page transitions, so every listener added here must be removed again by teardown().
  const off: Array<() => void> = [];
  if (hoverFine.matches) {
    links.forEach((a) => {
      a.addEventListener('pointerenter', enter); a.addEventListener('focus', enter); a.addEventListener('blur', leave);
      off.push(() => { a.removeEventListener('pointerenter', enter); a.removeEventListener('focus', enter); a.removeEventListener('blur', leave); });
    });
  }
  nav.addEventListener('pointerleave', leave);
  off.push(() => nav.removeEventListener('pointerleave', leave));
  const onResize = () => place(current);
  addEventListener('resize', onResize);
  document.fonts?.ready.then(() => place(current));
  cleanups.push(() => { removeEventListener('resize', onResize); off.forEach((f) => f()); });
}

/* ───────── smooth anchors (delegated once) ───────── */
function bindGlobals() {
  if (globalsBound) return;
  globalsBound = true;
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', requestTick, { passive: true });
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const u = new URL(a.href, location.href);
    if (u.pathname !== location.pathname || u.origin !== location.origin || !u.hash || u.hash === '#') return;
    const target = document.getElementById(decodeURIComponent(u.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'auto', block: 'start' });
    history.pushState(history.state, '', u.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
  document.addEventListener('click', (e) => {
    if ((e.target as Element | null)?.closest?.('[data-to-top]')) scrollTo({ top: 0, behavior: motionAllowed() ? 'smooth' : 'auto' });
  });
  reduceMQ.addEventListener?.('change', () => init());
}

/* ───────── init / teardown ───────── */
function teardown() {
  io?.disconnect(); io = null;
  cleanups.forEach((f) => f()); cleanups = [];
}

function init() {
  teardown();
  const on = motionAllowed();
  root.classList.toggle('js-motion', on);
  (window as Window & { __bdcMotion?: boolean }).__bdcMotion = true;
  initNav();
  bindGlobals();
  onScroll();
  if (!on) return; // content stays fully visible, nothing hidden
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) reveal(e.target); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  initReveal();
  initCount();
  initMagnetic();
  initParallax();
  const run = () => initSplit();
  if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(run); else run();
}

document.addEventListener('astro:page-load', init);
if (document.readyState !== 'loading') init();

export {};
