// Line-draw reveal for [data-pg-draw] SVGs. Content stays visible without JS:
// paths are only hidden once this script has armed the element.
function init() {
  const reduce =
    matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce';
  const els = document.querySelectorAll<HTMLElement>('[data-pg-draw]:not([data-pg-armed])');
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          requestAnimationFrame(() => e.target.classList.add('pg-drawn'));
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.25 }
  );
  els.forEach((el) => {
    el.setAttribute('data-pg-armed', '');
    el.classList.add('pg-armed');
    io.observe(el);
    setTimeout(() => el.classList.add('pg-drawn'), 6000);
  });
}
init();
document.addEventListener('astro:page-load', init);

export {};
