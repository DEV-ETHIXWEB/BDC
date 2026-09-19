/**
 * client:late  hydrate after the page has loaded and settled, or immediately on first intent
 * (hover, touch, focus, key, click). Keeps React and the widget bundles off the critical path
 * so the hero image and text get the bandwidth. A click that lands before hydration is replayed.
 * @type {import('astro').ClientDirective}
 */
export default (load, _options, el) => {
  let started = false;
  let clicked = false;
  const intents = ['pointerover', 'touchstart', 'focusin', 'keydown'];
  const start = async () => {
    if (started) return;
    started = true;
    intents.forEach((e) => el.removeEventListener(e, start));
    const hydrate = await load();
    await hydrate();
    if (clicked) setTimeout(() => el.querySelector('button, a, [role=button]')?.click(), 60);
  };
  intents.forEach((e) => el.addEventListener(e, start, { passive: true, once: true }));
  el.addEventListener('click', () => { clicked = true; start(); }, { capture: true, once: true });
  const later = () => setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : start()), 1500);
  if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
};
