import { useEffect, useId, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from './form-shared';

// Cloudflare Turnstile, explicit-render mode. Renders nothing at all until PUBLIC_TURNSTILE_SITE_KEY is set,
// so an unconfigured build behaves exactly as before (no external script, no iframe, CSP stays tight).
// The token this yields proves nothing on its own: the endpoint that receives the lead MUST post it to
// https://challenges.cloudflare.com/turnstile/v0/siteverify with the SECRET key and reject the lead on failure.
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
}
declare global {
  interface Window { turnstile?: TurnstileApi; __turnstileLoading?: Promise<void> }
}

/** Loads the script once per page, however many forms are on it. */
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileLoading) return window.__turnstileLoading;
  window.__turnstileLoading = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('turnstile script blocked or offline'));
    document.head.appendChild(s);
  });
  return window.__turnstileLoading;
}

/**
 * `onToken` receives the solved token, or '' whenever the challenge expires, errors or is reset.
 * Treat '' as "not verified yet" and keep the submit button blocked.
 *
 * A Turnstile token is single use: once it has been sent to siteverify it cannot be sent again. Bump
 * `resetKey` after every submit attempt so a retry gets a fresh challenge instead of a duplicate-token error.
 */
export default function Turnstile({ onToken, resetKey = 0, theme = 'auto' }: { onToken: (t: string) => void; resetKey?: number; theme?: 'auto' | 'light' | 'dark' }) {
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const uid = useId();

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !host.current) return;
    let dead = false;
    loadScript()
      .then(() => {
        if (dead || !host.current || !window.turnstile) return;
        widget.current = window.turnstile.render(host.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          action: 'lead',
          callback: (t: string) => onToken(t),
          'expired-callback': () => onToken(''),
          'timeout-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        });
      })
      .catch(() => { if (!dead) onToken(''); });
    return () => {
      dead = true;
      if (widget.current && window.turnstile) { try { window.turnstile.remove(widget.current); } catch { /* already gone */ } }
      widget.current = null;
    };
    // onToken is a stable setter from the parent; re-rendering the widget on every keystroke would reset the challenge
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => {
    if (!resetKey || !widget.current || !window.turnstile) return;
    try { window.turnstile.reset(widget.current); } catch { /* widget already gone */ }
    onToken('');
    // onToken is a stable setter; depending on it would reset the widget on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div className="ts-box" ref={host} id={`ts-${uid}`} aria-label="Security check" />;
}
