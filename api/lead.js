// Receives a lead from any form on the site and sends two emails through SMTP2GO:
//   1. the lead itself to the captain, with the agency on CC
//   2. a confirmation back to the visitor, when the form collected an email address
//
// This runs on the server precisely so SMTP2GO_API_KEY never reaches the browser. Nothing here may be
// renamed to PUBLIC_*: that prefix is compiled into the client bundle.
//
// The form treats only a 2xx as "sent", so this returns an error status whenever the lead email did not
// leave. A failed confirmation is NOT fatal: the captain has the lead, which is the part that matters.
import { leadEmail, confirmEmail } from './_templates.js';

const SMTP2GO = 'https://api.smtp2go.com/v3/email/send';
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const list = (v, fallback = []) =>
  (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : fallback);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

// The whole handler has to answer before the platform kills the function, so every network call
// draws from one shared budget rather than carrying its own fixed timeout. Without this a slow
// Turnstile check could eat the time the lead email needed, and the lead would be the thing lost.
const BUDGET_MS = 8500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function once(payload, timeout) {
  const res = await fetch(SMTP2GO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ api_key: process.env.SMTP2GO_API_KEY, ...payload }),
    signal: AbortSignal.timeout(timeout),
  });
  const body = await res.json().catch(() => ({}));
  // SMTP2GO answers 200 with data.succeeded = 0 when it accepted nothing, so status alone is not enough.
  const ok = res.ok && (body?.data?.succeeded ?? 0) > 0;
  return { ok, status: res.status, detail: body?.data?.error || body?.data?.failures?.[0]?.error || null };
}

// Retries only what is worth retrying. A 200 with succeeded = 0 is SMTP2GO refusing the message,
// usually a bad address, and sending it again just fails again; a timeout, a dropped connection or
// a 5xx is the kind of blip that a second attempt fixes.
async function send(payload, left, { retry = false } = {}) {
  let last = { ok: false, status: 0, detail: 'no time left' };
  for (let attempt = 0; attempt < (retry ? 2 : 1); attempt++) {
    const budget = left();
    if (budget < 1200) break;
    try {
      last = await once(payload, Math.min(4500, budget));
      if (last.ok) return last;
      // a hard refusal: sending the identical message again would only fail the same way
      if (last.status >= 400 && last.status < 500 && last.status !== 429) return last;
    } catch (e) {
      last = { ok: false, status: 0, detail: e?.name === 'TimeoutError' ? 'timeout' : String(e?.message || e) };
    }
    if (attempt === 0 && retry && left() > 2000) await sleep(250);
  }
  return last;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.SMTP2GO_API_KEY) {
    console.error('lead: SMTP2GO_API_KEY is not set');
    return res.status(500).json({ error: 'Mail is not configured' });
  }

  const started = Date.now();
  const left = () => BUDGET_MS - (Date.now() - started);

  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = null; } }
  if (!d || typeof d !== 'object') return res.status(400).json({ error: 'Bad request' });

  // Honeypot. The field is named so Chrome will not autofill it: a browser filling a field called "company"
  // used to drop a real person's enquiry with no feedback at all.
  if (clip(d.bdc_hp, 50) || clip(d.company, 50)) return res.status(200).json({ ok: true });

  const data = {
    name: clip(d.name, 80), phone: clip(d.phone, 30), email: clip(d.email, 254),
    trip: clip(d.trip, 120), guests: clip(d.guests, 10), date: clip(d.date, 60),
    message: clip(d.message, 1500), topics: clip(d.topics, 200), page: clip(d.page, 200),
    form: clip(d.form, 60), title: clip(d.title, 120),
  };
  // Where the lead came from, spelled out: which form, on which page. "/" told the captain nothing.
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
  data.site = host ? `https://${host}` : undefined;
  data.source = [data.form, data.title && `"${data.title}"`, data.page].filter(Boolean).join('  -  ') || undefined;
  if (data.name.length < 2) return res.status(400).json({ error: 'Name is required' });
  if (!data.phone && !data.email) return res.status(400).json({ error: 'A phone number or an email is required' });
  if (data.email && !EMAIL_RE.test(data.email)) return res.status(400).json({ error: 'That email address is not valid' });

  // Turnstile, when a secret is configured. No secret means the captcha is not switched on yet.
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const token = clip(d['cf-turnstile-response'], 2048);
    if (!token) return res.status(400).json({ error: 'Please complete the security check' });
    try {
      // Cloudflare's documented flow: form-encoded, with a timeout, and three checks on the result.
      const form = new URLSearchParams({ secret, response: token });
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      if (ip) form.set('remoteip', ip);
      const v = await fetch(TURNSTILE_VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
        // capped so there is always room left for at least one attempt at the lead itself
        signal: AbortSignal.timeout(Math.max(1500, Math.min(4000, left() - 3500))),
      }).then((r) => r.json());

      // 1. it passed, 2. it came from our widget action, 3. it came from a hostname we expect.
      // Without 2 and 3 a token minted on any other site or form could be replayed here.
      // The host this request actually arrived on is always allowed, so preview and *.vercel.app URLs work
      // without configuration while a token minted on someone else's site still fails. Add extra hosts with
      // TURNSTILE_ALLOWED_HOSTNAMES.
      const self = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
      const hosts = [...list(process.env.TURNSTILE_ALLOWED_HOSTNAMES), self].filter(Boolean);
      if (!v.success) {
        console.warn('lead: turnstile rejected', v['error-codes']);
        return res.status(400).json({ error: 'Security check failed, please try again' });
      }
      if (v.action && v.action !== 'lead') {
        console.warn('lead: turnstile action mismatch', v.action);
        return res.status(400).json({ error: 'Security check failed, please try again' });
      }
      if (v.hostname && !hosts.includes(v.hostname)) {
        console.warn('lead: turnstile hostname not allowed', v.hostname);
        return res.status(400).json({ error: 'Security check failed, please try again' });
      }
    } catch (e) {
      console.error('lead: turnstile verify unreachable', e);
      return res.status(502).json({ error: 'Could not run the security check' });
    }
  }

  const from = process.env.MAIL_FROM || 'BDC Guide Service <bookings@bestdayscatching.com>';
  const to = list(process.env.LEAD_TO, ['bestdayscatching@gmail.com']);
  const cc = list(process.env.LEAD_CC);
  const lead = leadEmail(data);

  let sent;
  try {
    sent = await send({
      sender: from, to, ...(cc.length ? { cc } : {}),
      subject: lead.subject, html_body: lead.html, text_body: lead.text,
      // replying to the notification should reach the guest, not the mailbox it was sent to
      ...(data.email ? { custom_headers: [{ header: 'Reply-To', value: data.email }] } : {}),
    }, left, { retry: true });
  } catch (e) {
    // a throw here used to escape as a 500 with no record of who had just tried to book
    sent = { ok: false, status: 0, detail: String(e?.message || e) };
  }

  if (!sent.ok) {
    // The enquiry is not lost just because the mail provider is. One greppable line carries the whole
    // lead into the function log, so it can be recovered and called back by hand:
    //   vercel logs --since 1d | grep LEAD-UNDELIVERED
    console.error('LEAD-UNDELIVERED', JSON.stringify({
      at: new Date().toISOString(), reason: sent.detail, status: sent.status, ...data,
    }));
    // The visitor is given everything needed to reach the captain anyway, so a provider outage
    // costs the captain a click, not a booking.
    return res.status(502).json({
      error: 'We could not send that right now',
      fallback: { phone: process.env.LEAD_PHONE || '(503) 826-7294', email: to[0] },
    });
  }

  // Best effort. The lead is already delivered, so a failure here must not tell the visitor it went wrong.
  if (data.email && left() > 1500) {
    const confirm = confirmEmail(data);
    try {
      const c = await send({
        sender: from, to: [data.email],
        subject: confirm.subject, html_body: confirm.html, text_body: confirm.text,
        custom_headers: [{ header: 'Reply-To', value: process.env.REPLY_TO || to[0] }],
      }, left);
      if (!c.ok) console.error('lead: confirmation not sent', c.status, c.detail);
    } catch (e) {
      console.error('lead: confirmation threw', e);
    }
  }

  return res.status(200).json({ ok: true });
}
