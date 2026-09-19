// Delivery + validation shared by BookingForm (trip requests) and ContactForm (site-wide questions).
//
// If PUBLIC_FORM_ENDPOINT is set at build time (Formspree, Basin, Netlify, etc.) the form POSTs there and
// only a confirmed 2xx response is shown as "sent". Without it the form can NOT know whether anything was
// delivered, so it opens the visitor's mail app and says plainly that the request is not sent yet.
export const ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

export const validators = {
  name: (v: string) => (v.trim().length < 2 ? 'Enter your name so Captain Clinton knows who to call.' : ''),
  phone: (v: string) => (v.replace(/\D/g, '').length < 10 ? 'Enter a phone number with area code, like (503) 555-0123.' : ''),
  email: (v: string) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Enter an email address like name@example.com.' : ''),
};

/** A mailto: URL has practical length limits, so the body is capped; the full text is still shown for copying. */
export const mailtoHref = (to: string, subject: string, body: string, cap = 1800) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, cap))}`;

export async function postLead(data: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT as string, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
    return res.ok;
  } catch {
    return false;
  }
}
