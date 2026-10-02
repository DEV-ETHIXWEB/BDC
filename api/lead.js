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

async function send(payload) {
  const res = await fetch(SMTP2GO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ api_key: process.env.SMTP2GO_API_KEY, ...payload }),
  });
  const body = await res.json().catch(() => ({}));
  // SMTP2GO answers 200 with data.succeeded = 0 when it accepted nothing, so status alone is not enough.
  const ok = res.ok && (body?.data?.succeeded ?? 0) > 0;
  return { ok, status: res.status, detail: body?.data?.error || body?.data?.failures?.[0]?.error || null };
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

  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = null; } }
  if (!d || typeof d !== 'object') return res.status(400).json({ error: 'Bad request' });

  if (clip(d.company, 50)) return res.status(200).json({ ok: true });   // honeypot: look successful, send nothing

  const data = {
    name: clip(d.name, 80), phone: clip(d.phone, 30), email: clip(d.email, 254),
    trip: clip(d.trip, 120), guests: clip(d.guests, 10), date: clip(d.date, 60),
    message: clip(d.message, 1500), topics: clip(d.topics, 200), page: clip(d.page, 200),
  };
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
        signal: AbortSignal.timeout(10_000),
      }).then((r) => r.json());

      // 1. it passed, 2. it came from our widget action, 3. it came from a hostname we expect.
      // Without 2 and 3 a token minted on any other site or form could be replayed here.
      const hosts = list(process.env.TURNSTILE_ALLOWED_HOSTNAMES, ['www.bdcguideservices.com', 'bdcguideservices.com']);
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

  const sent = await send({
    sender: from, to, ...(cc.length ? { cc } : {}),
    subject: lead.subject, html_body: lead.html, text_body: lead.text,
    // replying to the notification should reach the guest, not the mailbox it was sent to
    ...(data.email ? { custom_headers: [{ header: 'Reply-To', value: data.email }] } : {}),
  });

  if (!sent.ok) {
    console.error('lead: SMTP2GO rejected the lead', sent.status, sent.detail);
    return res.status(502).json({ error: 'We could not send that right now' });
  }

  // Best effort. The lead is already delivered, so a failure here must not tell the visitor it went wrong.
  if (data.email) {
    const confirm = confirmEmail(data);
    try {
      const c = await send({
        sender: from, to: [data.email],
        subject: confirm.subject, html_body: confirm.html, text_body: confirm.text,
        custom_headers: [{ header: 'Reply-To', value: process.env.REPLY_TO || to[0] }],
      });
      if (!c.ok) console.error('lead: confirmation not sent', c.status, c.detail);
    } catch (e) {
      console.error('lead: confirmation threw', e);
    }
  }

  return res.status(200).json({ ok: true });
}
