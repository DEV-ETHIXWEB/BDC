import { useCallback, useEffect, useRef, useState } from 'react';
import '../../styles/widgets.css';
import { Icon } from './Icon';
import { G, useDragDismiss, useFocusTrap, useOpenFlag, useSheetMode } from './wd-shared';
import type { IconName } from '../icons/paths';

/*
 * Contract with the rest of the site (global.css / Base.astro read these):
 *   html[data-text=lg|xl]  html[data-contrast=high]  html[data-links=underline]  html[data-motion=reduce]
 * Extra, styled in widgets.css:
 *   html[data-font=dyslexic]  html[data-cursor=large]
 */
interface Prefs { text?: 'lg' | 'xl'; contrast?: boolean; links?: boolean; motion?: boolean; font?: boolean; cursor?: boolean }
const KEY = 'bdc-a11y';

function apply(p: Prefs) {
  const r = document.documentElement;
  p.text ? (r.dataset.text = p.text) : delete r.dataset.text;
  p.contrast ? (r.dataset.contrast = 'high') : delete r.dataset.contrast;
  p.links ? (r.dataset.links = 'underline') : delete r.dataset.links;
  p.motion ? (r.dataset.motion = 'reduce') : delete r.dataset.motion;
  p.font ? (r.dataset.font = 'dyslexic') : delete r.dataset.font;
  p.cursor ? (r.dataset.cursor = 'large') : delete r.dataset.cursor;
}

type Flag = 'contrast' | 'links' | 'motion' | 'font' | 'cursor';
const FLAGS: { k: Flag; label: string; hint: string; icon?: IconName; glyph?: 'type' | 'cursor'; mouseOnly?: boolean }[] = [
  { k: 'contrast', label: 'High contrast', hint: 'Black and white with strong borders', icon: 'contrast' },
  { k: 'links', label: 'Underline links', hint: 'Every link gets an underline', icon: 'link' },
  { k: 'motion', label: 'Reduce motion', hint: 'Stops animation and parallax', icon: 'motion' },
  { k: 'font', label: 'Dyslexia-friendly font', hint: 'OpenDyslexic for body text', glyph: 'type' },
  { k: 'cursor', label: 'Larger cursor', hint: 'Bigger pointer for mouse users', glyph: 'cursor', mouseOnly: true },
];
const SIZES: { v: Prefs['text']; label: string; name: string }[] = [
  { v: undefined, label: 'Aa', name: 'Standard text size' },
  { v: 'lg', label: 'Aa', name: 'Large text size' },
  { v: 'xl', label: 'Aa', name: 'Extra large text size' },
];

export default function A11yPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({});
  const [said, setSaid] = useState('');
  const sheet = useSheetMode();
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const grip = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    try {
      const p: Prefs = JSON.parse(localStorage.getItem(KEY) || '{}');
      setPrefs(p);
      apply(p);
    } catch { /* storage blocked */ }
  }, []);

  useOpenFlag('a11y', open, open && sheet);
  useFocusTrap(panel, open && sheet);
  useDragDismiss(panel, grip, close, open && sheet);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => first.current?.focus({ preventScroll: true }), 60);
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('keydown', onKey);
      return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey); };
    }
    if (wasOpen.current) requestAnimationFrame(() => btn.current?.focus());
  }, [open]);
  useEffect(() => { wasOpen.current = open; }, [open]);

  const update = (next: Prefs, msg: string) => {
    setPrefs(next);
    apply(next);
    setSaid(msg);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const changed = Object.values(prefs).some(Boolean);

  return (
    <>
      <div className="wd-dock wd-dock--a11y">
        <button ref={btn} type="button" className="wd-fab wd-fab--a11y" data-hidden={open ? '' : undefined} data-active={changed ? '' : undefined}
          aria-label="Accessibility options" aria-haspopup="dialog" aria-expanded={open} aria-controls="wd-a11y" onClick={() => setOpen(true)}>
          <Icon name="accessibility" size={26} />
          <span className="wd-fab__tip" aria-hidden="true">Accessibility</span>
        </button>
      </div>

      <div className="wd-scrim" data-open={open ? '' : undefined} data-for="a11y" onClick={close} aria-hidden="true" />
      <div id="wd-a11y" ref={panel} className="wd-panel wd-a11y" data-open={open ? '' : undefined} inert={!open}
        role="dialog" aria-modal={sheet ? true : undefined} aria-labelledby="wd-a11y-title">
        <div className="wd-head">
          <div ref={grip} className="wd-grip" aria-hidden="true"><i /></div>
          <div className="wd-head__row">
            <span className="wd-crest wd-crest--icon" aria-hidden="true"><Icon name="accessibility" size={24} /></span>
            <div className="wd-head__id">
              <h2 id="wd-a11y-title">Accessibility</h2>
              <p>Saved on this device</p>
            </div>
            <button type="button" className="wd-hbtn" aria-label="Close accessibility options" onClick={close}><Icon name="close" size={19} /></button>
          </div>
        </div>

        <div className="wd-a11y__body">
          <div className="wd-group" role="group" aria-labelledby="wd-a11y-size">
            <p className="wd-group__t" id="wd-a11y-size"><Icon name="text" size={18} />Text size</p>
            <div className="wd-sizes">
              {SIZES.map((s, i) => (
                <button key={i} ref={i === 0 ? first : undefined} type="button" className="wd-size" style={{ ['--i' as string]: i }} aria-pressed={prefs.text === s.v} aria-label={s.name}
                  onClick={() => update({ ...prefs, text: s.v }, s.name + ' on')}>
                  <span aria-hidden="true">{s.label}</span>
                  <small aria-hidden="true">{['Standard', 'Large', 'Extra large'][i]}</small>
                </button>
              ))}
            </div>
          </div>

          <ul className="wd-flags">
            {FLAGS.map((f) => {
              const on = !!prefs[f.k];
              return (
                <li key={f.k} className={f.mouseOnly ? 'wd-flags__mouse' : undefined}>
                  <button type="button" role="switch" aria-checked={on} className="wd-flag" onClick={() => update({ ...prefs, [f.k]: !on }, `${f.label} ${on ? 'off' : 'on'}`)}>
                    <span className="wd-flag__ic">{f.icon ? <Icon name={f.icon} size={22} /> : <G name={f.glyph!} size={22} />}</span>
                    <span className="wd-flag__tx"><b>{f.label}</b><small>{f.hint}</small></span>
                    <span className="wd-switch" aria-hidden="true"><i /></span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button type="button" className="wd-reset" disabled={!changed} onClick={() => update({}, 'All accessibility settings reset')}>
            <Icon name="reset" size={18} />Reset all settings
          </button>
          <p className="sr-only" role="status" aria-live="polite">{said}</p>
        </div>
      </div>
    </>
  );
}
