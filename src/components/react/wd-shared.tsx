import { useEffect, useLayoutEffect, useState, type ReactElement, type RefObject } from 'react';

/** Phones get a bottom sheet, larger screens a floating card. Must match widgets.css (639px). */
export const SHEET_QUERY = '(max-width: 639px)';

export function useSheetMode(): boolean {
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(SHEET_QUERY);
    const on = () => setSheet(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return sheet;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Keeps Tab inside `ref` while active (used for the phone bottom sheets, which are modal). */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !ref.current) return;
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const cur = document.activeElement;
      if (!ref.current.contains(cur)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ref, active]);
}

/** Publishes the visual viewport (shrunk by the on-screen keyboard) as CSS vars so sheets never jump. */
export function useVisualViewport(ref: RefObject<HTMLElement | null>, active: boolean) {
  useLayoutEffect(() => {
    const el = ref.current;
    const vv = window.visualViewport;
    if (!active || !el || !vv) return;
    const sync = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.setProperty('--wd-vh', `${Math.round(vv.height)}px`);
      el.style.setProperty('--wd-kb', `${Math.round(kb)}px`);
      if (kb > 80) el.dataset.kb = ''; else delete el.dataset.kb;
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      el.style.removeProperty('--wd-vh');
      el.style.removeProperty('--wd-kb');
      delete el.dataset.kb;
    };
  }, [ref, active]);
}

/** Locks page scroll and tells the CSS which widget is open (so the other FAB steps aside on phones). */
export function useOpenFlag(name: string, open: boolean, lockScroll: boolean) {
  useEffect(() => {
    const r = document.documentElement;
    if (!open) return;
    r.dataset.wdOpen = name;
    if (lockScroll) r.classList.add('wd-lock');
    return () => {
      if (r.dataset.wdOpen === name) delete r.dataset.wdOpen;
      r.classList.remove('wd-lock');
    };
  }, [name, open, lockScroll]);
}

/** Drag the grab area downward to dismiss a bottom sheet. */
export function useDragDismiss(sheetRef: RefObject<HTMLElement | null>, gripRef: RefObject<HTMLElement | null>, onClose: () => void, active: boolean) {
  useEffect(() => {
    const grip = gripRef.current, sheet = sheetRef.current;
    if (!active || !grip || !sheet) return;
    let startY = 0, dy = 0, t0 = 0, dragging = false;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button,a')) return;
      dragging = true; startY = e.clientY; dy = 0; t0 = e.timeStamp;
      grip.setPointerCapture(e.pointerId);
      sheet.style.transition = 'none';
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      sheet.style.transform = `translate3d(0, ${dy}px, 0)`;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      const v = dy / Math.max(1, e.timeStamp - t0);
      sheet.style.transform = '';
      if (dy > 110 || (dy > 40 && v > 0.6)) onClose();
    };
    grip.addEventListener('pointerdown', down);
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
    return () => {
      grip.removeEventListener('pointerdown', down);
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
    };
  }, [sheetRef, gripRef, onClose, active]);
}

/** The BDC crest in a medallion. `logo-mark.png` is the real crest artwork. */
export function Crest({ size = 40 }: { size?: number }) {
  return (
    <span className="wd-crest" style={{ width: size, height: size }} aria-hidden="true">
      <img src="/crest-140.webp" alt="" width={size} height={size} decoding="async" />
    </span>
  );
}

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
/** Small glyphs local to the widgets (the shared icon set has no copy / cursor / typeface). */
export function G({ name, size = 20 }: { name: 'copy' | 'check' | 'cursor' | 'type' | 'call' | 'mail' | 'pin' | 'ticket' | 'external'; size?: number }) {
  const d: Record<string, ReactElement> = {
    copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" {...P} /><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" {...P} /></>,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" {...P} />,
    cursor: <path d="M6 3.5 18.5 10l-5.4 1.6L10.8 17 6 3.5Z" {...P} />,
    type: <><path d="M4 18 9 5.5 14 18M5.9 13.6h6.2" {...P} /><path d="M16.5 18.5v-6.6M16.5 13.6c.6-1 1.5-1.6 2.6-1.6 1.2 0 2 .8 2 2v4.5" {...P} /></>,
    call: <path d="M5.5 4.5h3l1.6 4-2 1.3a10 10 0 0 0 5.1 5.1l1.3-2 4 1.6v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3.5 6.7a2 2 0 0 1 2-2.2Z" {...P} />,
    mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...P} /><path d="m4 7.5 8 6 8-6" {...P} /></>,
    pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" {...P} /><circle cx="12" cy="10" r="2.3" {...P} /></>,
    ticket: <path d="M4 8.5a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4V18h16v-1.5a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V7H4v1.5Z" {...P} />,
    external: <path d="M14 4.5h5.5V10M19.5 4.5 11 13M17 14v4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V9a1.5 1.5 0 0 1 1.5-1.5H10" {...P} />,
  };
  return <svg className="wd-g" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{d[name]}</svg>;
}
