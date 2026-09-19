import { useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import { SITE } from '../../data/site';
import { ENDPOINT, mailtoHref, postLead, validators } from './form-shared';

interface Props {
  trips: { slug: string; name: string; price: number }[];
  email: string;
}

const NOT_SURE = 'Not sure yet';

// One-row trip request bar for the top of the home page. Same delivery rules as the other forms: a confirmed 2xx from
// PUBLIC_FORM_ENDPOINT is "sent"; without an endpoint it opens the visitor's mail app and says nothing was sent yet.
export default function QuickRequest({ trips, email }: Props) {
  const uid = useId();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'draft' | 'error'>('idle');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trip, setTrip] = useState(NOT_SURE);
  const [date, setDate] = useState('');
  const [problem, setProblem] = useState('');
  const [draftHref, setDraftHref] = useState('');
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nErr = validators.name(name), pErr = validators.phone(phone);
    if (nErr || pErr) {
      setProblem(nErr || pErr);
      (formRef.current?.elements.namedItem(nErr ? 'name' : 'phone') as HTMLElement | null)?.focus();
      return;
    }
    setProblem('');
    if (((new FormData(e.currentTarget).get('company') as string) || '')) return; // honeypot
    const data = { name: name.trim(), phone: phone.trim(), trip, date, page: window.location.pathname };
    const subject = trip === NOT_SURE ? 'Trip request from the home page' : `Trip request: ${trip}`;
    const body = `Name: ${data.name}\nPhone: ${data.phone}\nTrip: ${trip}\nPreferred date: ${date || 'flexible'}\n\nPlease call me back about this trip.`;
    if (!ENDPOINT) {
      const href = mailtoHref(email, subject, body);
      setDraftHref(href);
      window.location.assign(href);
      setStatus('draft');
      return;
    }
    if (submitting.current) return;
    submitting.current = true;
    setStatus('sending');
    setStatus((await postLead({ ...data, form: 'quick-request' })) ? 'sent' : 'error');
    submitting.current = false;
  }

  if (status === 'sent') {
    return <p className="qr qr--done" role="status"><Icon name="checkCircle" size={22} /><span><strong>Request sent.</strong> Captain Clinton will call you back as soon as he is off the water.</span></p>;
  }
  if (status === 'draft') {
    return (
      <p className="qr qr--done" role="status">
        <Icon name="mail" size={22} />
        <span><strong>Not sent yet.</strong> Your email app should be opening with the request filled in: press send there to finish. <a href={draftHref}>Open email again</a> or call <a href={SITE.phoneHref}>{SITE.phone}</a>.</span>
      </p>
    );
  }

  return (
    <form ref={formRef} className="qr" onSubmit={onSubmit} noValidate aria-label="Quick trip request">
      <p className="qr__title"><Icon name="ticket" size={20} />Request a trip</p>
      <div className="qr__f qr__f--trip">
        <label htmlFor={`${uid}t`}>Trip</label>
        <select id={`${uid}t`} name="trip" value={trip} onChange={(e) => setTrip(e.target.value)}>
          <option>{NOT_SURE}</option>
          {trips.map((t) => <option key={t.slug} value={t.name}>{t.name} · ${t.price} pp</option>)}
        </select>
      </div>
      <div className="qr__f qr__f--date">
        <label htmlFor={`${uid}d`}>Date</label>
        <input id={`${uid}d`} type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="qr__f">
        <label htmlFor={`${uid}n`}>Your name</label>
        <input id={`${uid}n`} name="name" maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={problem && validators.name(name) ? true : undefined} />
      </div>
      <div className="qr__f">
        <label htmlFor={`${uid}p`}>Phone</label>
        <input id={`${uid}p`} name="phone" type="tel" inputMode="tel" maxLength={30} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={problem && validators.phone(phone) ? true : undefined} />
      </div>
      <div aria-hidden="true" className="qr__hp"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <button type="submit" className="btn btn--cream qr__go" disabled={status === 'sending'}>{status === 'sending' ? 'Sending' : 'Request'}<Icon name="arrowRight" size={18} /></button>
      <p className="qr__msg" role="alert" aria-live="polite">{problem || (status === 'error' ? `Something went wrong. Please call ${SITE.phone}.` : '')}</p>
    </form>
  );
}
