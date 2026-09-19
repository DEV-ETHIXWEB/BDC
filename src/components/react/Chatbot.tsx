import { Fragment, useCallback, useEffect, useRef, useState, type SubmitEvent, type ReactNode } from 'react';
import '../../styles/widgets.css';
import { Icon } from './Icon';
import { Crest, G, useDragDismiss, useFocusTrap, useOpenFlag, useSheetMode, useVisualViewport } from './wd-shared';
import { DIRECTIONS_URL, reply, suggestionsFor, type ActionId, type Card, type Ctx } from './brain';
import { TRIPS } from '../../data/trips';
import { SITE } from '../../data/site';

interface Msg { id: number; from: 'bot' | 'user'; text: string; ts: number; cards?: Card[]; actions?: ActionId[]; fallback?: boolean }
interface Saved { msgs: Msg[]; ctx: Ctx; chips: string[] | null }

const STORE = 'bdc-chat-v2';
const NUDGE_KEY = 'bdc-chat-nudge';
const NUDGE_MS = 12000;

/* ───────── markdown-lite: [label](href), **bold**, bullets, line breaks. Never injects HTML. ───────── */
// Only same-site paths (not protocol-relative //host), tel:, mailto: and https: links are ever rendered as links.
const safeHref = (h: string) => /^(\/(?!\/)|tel:|mailto:|https:\/\/)/.test(h);
function inline(text: string, onNav: () => void): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && safeHref(link[2])) {
      const ext = link[2].startsWith('https://');
      return <a key={i} href={link[2]} onClick={link[2].startsWith('/') ? onNav : undefined} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link[1]}</a>;
    }
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    return bold ? <strong key={i}>{bold[1]}</strong> : <Fragment key={i}>{part}</Fragment>;
  });
}
const Rich = ({ text, onNav }: { text: string; onNav: () => void }) => (
  <>{text.split('\n').filter((l) => l.trim() !== '').map((line, i) => <p key={i}>{inline(line, onNav)}</p>)}</>
);
const plain = (t: string) => t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)').replace(/\*\*/g, '');

const time = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const pageTrip = (path: string) => { const m = path.match(/^\/trips\/([^/]+)/); return m ? TRIPS.find((t) => t.slug === m[1]) : undefined; };

const ACTIONS: Record<ActionId, { label: string; href: string; icon: 'call' | 'mail' | 'ticket' | 'pin'; ext?: boolean; primary?: boolean }> = {
  call: { label: 'Call now', href: SITE.phoneHref, icon: 'call', primary: true },
  email: { label: 'Email', href: `mailto:${SITE.email}`, icon: 'mail' },
  book: { label: 'See trips', href: '/oregon-fishing-charter-rates', icon: 'ticket' },
  license: { label: 'License guide', href: '/article/get-your-valid-oregon-fishing-license', icon: 'ticket' },
  directions: { label: 'Directions', href: DIRECTIONS_URL, icon: 'pin', ext: true },
};

function TripCard({ c, onNav }: { c: Card; onNav: () => void }) {
  return (
    <article className="wd-trip">
      <div className="wd-trip__stub">
        <b>${c.price}</b>
        <span>per person</span>
      </div>
      <div className="wd-trip__body">
        <a className="wd-trip__name" href={c.href} onClick={onNav}>{c.name}</a>
        <span className="wd-trip__meta">{c.hours} hrs · {c.boat} · up to {c.capacity}</span>
      </div>
      <a className="wd-trip__book" href={`${c.href}#book`} onClick={onNav} aria-label={`Book ${c.name}`}>Book</a>
    </article>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ctx, setCtx] = useState<Ctx>({});
  const [chips, setChips] = useState<string[] | null>(null);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [path, setPath] = useState('/');
  const [nudge, setNudge] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const sheet = useSheetMode();

  const panel = useRef<HTMLElement>(null);
  const grip = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const idRef = useRef(1);
  const timer = useRef<number>(0);

  const close = useCallback(() => setOpen(false), []);
  const onNav = useCallback(() => { if (window.matchMedia('(max-width: 639px)').matches) setOpen(false); }, []);

  /* restore the conversation, follow the route */
  useEffect(() => {
    try {
      const s: Saved | null = JSON.parse(sessionStorage.getItem(STORE) || 'null');
      if (s?.msgs?.length) { setMsgs(s.msgs); setCtx(s.ctx || {}); setChips(s.chips || null); idRef.current = Math.max(...s.msgs.map((m) => m.id)) + 1; }
    } catch { /* storage blocked */ }
    setReady(true);
    const sync = () => setPath(location.pathname);
    sync();
    document.addEventListener('astro:page-load', sync);
    return () => document.removeEventListener('astro:page-load', sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(STORE, JSON.stringify({ msgs: msgs.slice(-40), ctx, chips } satisfies Saved)); } catch { /* ignore */ }
  }, [msgs, ctx, chips, ready]);

  /* proactive nudge, once per session */
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(NUDGE_KEY) === '1'; } catch { /* ignore */ }
    if (seen) return;
    const show = window.setTimeout(() => setNudge(true), NUDGE_MS);
    return () => window.clearTimeout(show);
  }, []);
  useEffect(() => {
    if (!nudge) return;
    try { sessionStorage.setItem(NUDGE_KEY, '1'); } catch { /* ignore */ }
    const hide = window.setTimeout(() => setNudge(false), 16000);
    return () => window.clearTimeout(hide);
  }, [nudge]);
  useEffect(() => { if (open) setNudge(false); }, [open]);

  /* open / close behaviour */
  useOpenFlag('chat', open, open && sheet);
  useVisualViewport(panel, open && sheet);
  useFocusTrap(panel, open && sheet);
  useDragDismiss(panel, grip, close, open && sheet);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 60);
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('keydown', onKey);
      return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey); };
    }
    if (wasOpen.current) requestAnimationFrame(() => launcher.current?.focus());
  }, [open]);
  useEffect(() => { wasOpen.current = open; }, [open]);
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [msgs, typing, open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const trip = pageTrip(path);
  const hasUser = msgs.some((m) => m.from === 'user');
  const suggestions = chips ?? suggestionsFor(path);
  const greeting = trip
    ? `You're looking at the **${trip.name}**: $${trip.price} per person, ${trip.hours} hours on the ${trip.boatSpec}. Ask me about it, or anything else about our trips.`
    : `Hi, I'm the BDC trip assistant. Ask me about trips, prices, seasons, gear or booking. For anything else, Captain Clinton is a call away.`;

  function send(text: string) {
    const t = text.trim().slice(0, 200);
    if (!t || typing) return;
    const now = Date.now();
    setMsgs((m) => [...m, { id: idRef.current++, from: 'user', text: t, ts: now }]);
    setDraft('');
    setTyping(true);
    const r = reply(t, ctx, path);
    const delay = Math.min(1100, 420 + r.text.length * 2.2);
    timer.current = window.setTimeout(() => {
      setMsgs((m) => [...m, { id: idRef.current++, from: 'bot', text: r.text, ts: Date.now(), cards: r.cards, actions: r.actions, fallback: r.fallback }]);
      setCtx(r.ctx);
      setChips(r.followups);
      setTyping(false);
    }, delay);
  }
  const onSubmit = (e: SubmitEvent) => { e.preventDefault(); send(draft); };

  async function copy(m: Msg) {
    try { await navigator.clipboard.writeText(plain(m.text)); setCopied(m.id); window.setTimeout(() => setCopied((c) => (c === m.id ? null : c)), 1600); } catch { /* clipboard blocked */ }
  }
  function reset() { setMsgs([]); setCtx({}); setChips(null); }

  return (
    <>
      <div className="wd-dock wd-dock--chat">
        {nudge && !open && (
          <div className="wd-nudge" role="status">
            <button type="button" className="wd-nudge__main" onClick={() => setOpen(true)}>
              <b>Planning a trip?</b>
              <span>Ask about prices, seasons or booking.</span>
            </button>
            <button type="button" className="wd-nudge__x" aria-label="Dismiss suggestion" onClick={() => setNudge(false)}><Icon name="close" size={16} /></button>
          </div>
        )}
        <button
          ref={launcher} type="button" className="wd-fab wd-fab--chat" data-hidden={open ? '' : undefined} data-nudge={nudge ? '' : undefined}
          aria-label="Open chat assistant" aria-haspopup="dialog" aria-expanded={open} aria-controls="wd-chat" onClick={() => setOpen(true)}
        >
          <Crest size={40} />
          <span className="wd-fab__label"><b>Ask BDC</b><small>Instant answers</small></span>
          <i className="wd-fab__dot" aria-hidden="true" />
        </button>
      </div>

      <div className="wd-scrim" data-open={open ? '' : undefined} data-for="chat" onClick={close} aria-hidden="true" />
      <section
        id="wd-chat" ref={panel} className="wd-panel wd-chat" data-open={open ? '' : undefined} inert={!open}
        role="dialog" aria-modal={sheet ? true : undefined} aria-labelledby="wd-chat-title"
      >
        <div className="wd-head">
          <div ref={grip} className="wd-grip" aria-hidden="true"><i /></div>
          <div className="wd-head__row">
            <Crest size={44} />
            <div className="wd-head__id">
              <h2 id="wd-chat-title">BDC assistant</h2>
              <p><i aria-hidden="true" />Automated answers</p>
            </div>
            <a className="wd-hbtn" href={SITE.phoneHref} aria-label={`Call ${SITE.phone}`}><G name="call" size={19} /></a>
            <button type="button" className="wd-hbtn" aria-label="Close chat" onClick={close}><Icon name="close" size={19} /></button>
          </div>
        </div>

        <div className="wd-log" ref={log} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation" tabIndex={0}>
          <div className="wd-msg wd-msg--bot">
            <div className="wd-bubble"><Rich text={greeting} onNav={onNav} /></div>
          </div>
          {msgs.map((m) => (
            <div key={m.id} className={`wd-msg wd-msg--${m.from}`}>
              <div className="wd-bubble" data-fallback={m.fallback ? '' : undefined}>
                {m.from === 'user' ? <p>{m.text}</p> : <Rich text={m.text} onNav={onNav} />}
                {m.cards && <div className="wd-cards">{m.cards.map((c) => <TripCard key={c.slug} c={c} onNav={onNav} />)}</div>}
                {m.actions && (
                  <div className="wd-actions">
                    {m.actions.map((a) => {
                      const x = ACTIONS[a];
                      return (
                        <a key={a} className={`wd-act${x.primary ? ' wd-act--primary' : ''}`} href={x.href} onClick={x.href.startsWith('/') ? onNav : undefined} {...(x.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                          <G name={x.icon} size={17} />{x.label}{x.ext && <span className="sr-only"> (opens in a new tab)</span>}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="wd-meta">
                <time dateTime={new Date(m.ts).toISOString()}>{time(m.ts)}</time>
                {m.from === 'bot' && (
                  <button type="button" className="wd-copy" onClick={() => copy(m)} aria-label={copied === m.id ? 'Copied' : 'Copy answer'}>
                    <G name={copied === m.id ? 'check' : 'copy'} size={14} />{copied === m.id ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="wd-msg wd-msg--bot" role="status" aria-label="Assistant is typing">
              <div className="wd-bubble wd-bubble--typing"><span className="wd-dots" aria-hidden="true"><i /><i /><i /></span></div>
            </div>
          )}
        </div>

        <div className="wd-chips" role="group" aria-label="Suggested questions">
          {suggestions.map((s) => <button key={s} type="button" className="wd-chip" disabled={typing} onClick={() => send(s)}>{s}</button>)}
          {hasUser && <button type="button" className="wd-chip wd-chip--quiet" onClick={reset}>Start over</button>}
        </div>

        <form className="wd-composer" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="wd-chat-input">Type your question</label>
          <input id="wd-chat-input" ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about trips, prices, booking" autoComplete="off" enterKeyHint="send" maxLength={200} />
          <button type="submit" className="wd-send" aria-label="Send message" disabled={!draft.trim() || typing}><Icon name="send" size={20} /></button>
        </form>
        <p className="wd-note">Automated answers from our trip info, not a person. For anything else call <a href={SITE.phoneHref}>{SITE.phone}</a>.</p>
      </section>
    </>
  );
}
