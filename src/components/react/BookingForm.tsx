import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, FieldError, Form, Input, Label, Radio, RadioGroup, TextArea, TextField } from 'react-aria-components';
import { Icon } from './Icon';

interface Props {
  trips: { slug: string; name: string; price: number; capacity?: number; boat?: string; hours?: number }[];
  email: string;
  defaultTrip?: string;
}

// If PUBLIC_FORM_ENDPOINT is set at build time (Formspree, Basin, Netlify, etc.) the form POSTs
// there. Otherwise it opens the visitor's mail app with the request pre-filled, so it always works.
const ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

const CAPACITY_BY_NAME: Record<string, number> = { 'Willy Predator': 6, 'Alumaweld Guide Model': 3 };
const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fmtDate = (iso: string) => {
  if (!iso) return 'Flexible';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const validators = {
  name: (v: string) => (v.trim().length < 2 ? 'Enter your name so Captain Clinton knows who to call.' : ''),
  phone: (v: string) => (v.replace(/\D/g, '').length < 10 ? 'Enter a phone number with area code, like (503) 555-0123.' : ''),
  email: (v: string) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Enter an email address like name@example.com.' : ''),
};

export default function BookingForm({ trips, email, defaultTrip }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [step, setStep] = useState<1 | 2>(1);
  const [tripName, setTripName] = useState(defaultTrip ?? trips[0].name);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mail, setMail] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const headRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const first = useRef(true);

  const trip = trips.find((t) => t.name === tripName) ?? trips[0];
  const cap = trip.capacity ?? (trip.boat ? CAPACITY_BY_NAME[trip.boat] : undefined) ?? 6;
  const capErr = guests > cap ? `${trip.name} carries up to ${cap} guests. Choose ${cap} or fewer, or pick a Willy Predator trip for larger groups.` : '';
  const dateErr = date && date < todayIso() ? 'Pick today or a later date, or leave it blank if you are flexible.' : '';
  const errs = { name: validators.name(name), phone: validators.phone(phone), email: validators.email(mail) };
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const show = (k: keyof typeof errs) => (touched[k] && errs[k] ? errs[k] : '');

  // Planner and other buttons can preselect a trip: window.dispatchEvent(new CustomEvent('tp:select-trip', { detail: { slug, guests } }))
  useEffect(() => {
    const onPick = (e: Event) => {
      const d = (e as CustomEvent<{ slug?: string; guests?: number }>).detail || {};
      const t = trips.find((x) => x.slug === d.slug);
      if (t) setTripName(t.name);
      if (d.guests && d.guests >= 2 && d.guests <= 6) setGuests(d.guests);
      setStep(1);
    };
    window.addEventListener('tp:select-trip', onPick);
    return () => window.removeEventListener('tp:select-trip', onPick);
  }, [trips]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    headRef.current?.focus({ preventScroll: true });
  }, [step, status]);

  function next(e: FormEvent) {
    e.preventDefault();
    touch('date');
    if (capErr || dateErr) return;
    setStep(2);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1) return next(e);
    setTouched({ name: true, phone: true, email: true });
    if (errs.name || errs.phone || errs.email) {
      const bad = errs.name ? 'name' : errs.phone ? 'phone' : 'email';
      requestAnimationFrame(() => (formRef.current?.elements.namedItem(bad) as HTMLElement | null)?.focus());
      return;
    }
    const company = (new FormData(e.currentTarget).get('company') as string) || '';
    if (company) return; // honeypot
    const data = { name: name.trim(), phone: phone.trim(), email: mail.trim(), trip: tripName, guests: String(guests), date, message: message.trim() };
    const body = `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nTrip: ${data.trip}\nGuests: ${data.guests}\nPreferred date: ${data.date || 'flexible'}\n\n${data.message || ''}`;
    if (!ENDPOINT) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent('Trip request: ' + data.trip)}&body=${encodeURIComponent(body)}`;
      setStatus('sent');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="tp-form tp-done" role="status">
        <span className="tp-done__mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" pathLength="1" className="tp-done__ring" /><path d="M14 25l7 7 13-15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="tp-done__tick" /></svg>
        </span>
        <h3 ref={headRef} tabIndex={-1}>{ENDPOINT ? 'Request sent' : 'Your request is ready'}</h3>
        <p>
          {ENDPOINT
            ? 'Captain Clinton will reply as soon as he is off the water.'
            : `Your email app is opening with this request filled in. Press send there. If nothing opens, write to ${email}.`}{' '}
          For a faster answer, call (503) 826-7294.
        </p>
        <dl className="tp-done__sum">
          <div><dt>Trip</dt><dd>{tripName}</dd></div>
          <div><dt>Guests</dt><dd>{guests}</dd></div>
          <div><dt>Date</dt><dd>{fmtDate(date)}</dd></div>
          <div><dt>Estimate</dt><dd>{money(trip.price * guests)}</dd></div>
        </dl>
      </div>
    );
  }

  return (
    <Form className="tp-form" onSubmit={onSubmit} validationBehavior="aria" ref={formRef} noValidate>
      <ol className="tp-steps" aria-label="Progress">
        <li data-on={step === 1 ? '' : undefined} data-done={step > 1 ? '' : undefined} aria-current={step === 1 ? 'step' : undefined}><span>1</span>Your trip</li>
        <li data-on={step === 2 ? '' : undefined} aria-current={step === 2 ? 'step' : undefined}><span>2</span>Your details</li>
      </ol>

      {step === 1 && (
        <div className="tp-step">
          <h3 ref={headRef} tabIndex={-1} className="tp-form__h">Choose your trip</h3>
          <RadioGroup className="tp-pick" value={tripName} onChange={setTripName} aria-label="Trip">
            {trips.map((t) => (
              <Radio key={t.slug} value={t.name} className="tp-pick__opt">
                <span className="tp-pick__dot" aria-hidden="true" />
                <span className="tp-pick__name">{t.name}</span>
                <span className="tp-pick__price">{money(t.price)}<small> pp</small></span>
              </Radio>
            ))}
          </RadioGroup>

          <div className="tp-row">
            <div className="tp-stepper">
              <span className="tp-stepper__l" id="tp-guests-l">Guests</span>
              <div className="tp-stepper__c" role="group" aria-labelledby="tp-guests-l">
                <Button className="tp-stepper__b" aria-label="Fewer guests" isDisabled={guests <= 2} onPress={() => setGuests((g) => Math.max(2, g - 1))}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                </Button>
                <output className="tp-stepper__v" aria-live="polite">{guests}</output>
                <Button className="tp-stepper__b" aria-label="More guests" isDisabled={guests >= 6} onPress={() => setGuests((g) => Math.min(6, g + 1))}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                </Button>
              </div>
              <span className="tp-stepper__n">Minimum 2</span>
            </div>

            <div className="tp-fl tp-fl--date" data-invalid={dateErr ? '' : undefined}>
              <input id="tp-date" type="date" name="date" value={date} min={todayIso()} onChange={(e) => setDate(e.target.value)} onBlur={() => touch('date')} aria-invalid={dateErr ? true : undefined} aria-describedby={dateErr ? 'tp-date-e' : 'tp-date-h'} />
              <label htmlFor="tp-date">Preferred date</label>
              {dateErr ? <p className="tp-err" id="tp-date-e" role="alert">{dateErr}</p> : <p className="tp-help" id="tp-date-h">Optional. Captain Clinton confirms what is running.</p>}
            </div>
          </div>

          {capErr && <p className="tp-err tp-err--box" role="alert"><Icon name="close" size={16} />{capErr}</p>}

          <div className="tp-actions">
            <p className="tp-est" aria-live="polite">
              <strong>{money(trip.price * guests)}</strong> estimate <small>{money(trip.price)} × {guests} guests, before tip</small>
            </p>
            <Button type="submit" className="btn btn--primary">Continue<Icon name="arrowRight" size={18} /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="tp-step">
          <h3 ref={headRef} tabIndex={-1} className="tp-form__h">How do we reach you?</h3>
          <p className="tp-recap">
            <strong>{tripName}</strong>, {guests} guests, {date ? fmtDate(date) : 'flexible date'}.{' '}
            <button type="button" className="tp-link" onClick={() => setStep(1)}>Change</button>
          </p>
          <TextField className="tp-fl" name="name" isRequired autoComplete="name" value={name} onChange={setName} onBlur={() => touch('name')} isInvalid={!!show('name')}>
            <Input placeholder=" " />
            <Label>Your name</Label>
            <FieldError className="tp-err">{errs.name}</FieldError>
          </TextField>
          <div className="tp-row">
            <TextField className="tp-fl" name="phone" type="tel" inputMode="tel" isRequired autoComplete="tel" value={phone} onChange={setPhone} onBlur={() => touch('phone')} isInvalid={!!show('phone')}>
              <Input placeholder=" " />
              <Label>Phone</Label>
              <FieldError className="tp-err">{errs.phone}</FieldError>
            </TextField>
            <TextField className="tp-fl" name="email" type="email" inputMode="email" isRequired autoComplete="email" value={mail} onChange={setMail} onBlur={() => touch('email')} isInvalid={!!show('email')}>
              <Input placeholder=" " />
              <Label>Email</Label>
              <FieldError className="tp-err">{errs.email}</FieldError>
            </TextField>
          </div>
          <TextField className="tp-fl tp-fl--area" name="message" value={message} onChange={setMessage}>
            <TextArea placeholder=" " rows={3} />
            <Label>Anything we should know?</Label>
          </TextField>
          <p className="tp-help">Beginners, kids, target fish, early start. All welcome.</p>

          <div aria-hidden="true" className="tp-hp">
            <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
          </div>

          {status === 'error' && <p className="tp-err tp-err--box" role="alert"><Icon name="close" size={16} />Something went wrong sending that. Please call (503) 826-7294 or email {email}.</p>}

          <div className="tp-actions">
            <button type="button" className="tp-back" onClick={() => setStep(1)}>Back</button>
            <Button type="submit" className="btn btn--primary" isDisabled={status === 'sending'}>
              {status === 'sending' ? 'Sending' : 'Send request'}
              <Icon name="send" size={18} />
            </Button>
          </div>
        </div>
      )}
      <p className="tp-help tp-help--foot">Minimum 2 guests. A valid Oregon fishing license is required for anglers 12 and older.</p>
    </Form>
  );
}
