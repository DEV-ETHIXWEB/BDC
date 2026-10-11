// Delivery + validation shared by BookingForm (trip requests) and ContactForm (site-wide questions).
//
// If PUBLIC_FORM_ENDPOINT is set at build time (Formspree, Basin, Netlify, etc.) the form POSTs there and
// only a confirmed 2xx response is shown as "sent". Without it the form can NOT know whether anything was
// delivered, so it opens the visitor's mail app and says plainly that the request is not sent yet.
export const ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

// Cloudflare Turnstile. The SITE key is public by design and safe in the bundle; the SECRET key never appears
// here and must live on the endpoint that verifies the token. Unset = Turnstile is off everywhere.
export const TURNSTILE_SITE_KEY = (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined)?.trim() || '';
/** A configured Turnstile means a lead is only sent once the visitor has solved the challenge. */
export const turnstileRequired = () => Boolean(TURNSTILE_SITE_KEY);

export const validators = {
  name: (v: string) => (v.trim().length < 2 ? 'Enter your name so Captain Clinton knows who to call.' : ''),
  phone: (v: string) => (v.replace(/\D/g, '').length < 10 ? 'Enter a phone number with area code, like (503) 555-0123.' : ''),
  email: (v: string) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Enter an email address like name@example.com.' : ''),
};

/** A mailto: URL has practical length limits, so the body is capped; the full text is still shown for copying. */
export const mailtoHref = (to: string, subject: string, body: string, cap = 1800) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, cap))}`;

// One network blip between the visitor's phone and the endpoint should not cost a booking, so a
// request that never got an answer is tried once more. Only the no-answer case is repeated: a reply,
// good or bad, is the server's decision and is left alone. The endpoint is safe to call twice,
// because a lead it accepted returns 2xx and is never reached again.
async function postOnce(body: unknown, timeout = 12000): Promise<Response | null> {
  try {
    return await fetch(ENDPOINT as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
  } catch {
    return null;
  }
}

export async function postLead(data: Record<string, string>, token = ''): Promise<boolean> {
  // `cf-turnstile-response` is the field name Cloudflare's siteverify expects; the endpoint forwards it.
  const body = token ? { ...data, 'cf-turnstile-response': token } : data;
  let res = await postOnce(body);
  // A spent Turnstile token cannot be replayed, so only retry when the captcha is not in play.
  if (res === null && !token) res = await postOnce(body, 8000);
  return Boolean(res?.ok);
}
