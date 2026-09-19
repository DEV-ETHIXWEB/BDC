import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, FieldError, Form, Input, Label, TextArea, TextField, ToggleButton, ToggleButtonGroup } from 'react-aria-components';
import { Icon } from './Icon';
import { SITE } from '../../data/site';
import { ENDPOINT, mailtoHref, postLead, validators } from './form-shared';

interface Props {
  trips: { slug: string; name: string }[];
  email: string;
  /** trip preselected from the page the form sits on, if any */
  defaultTrip?: string;
}

const NOT_SURE = 'Not sure yet';
const OTHER = 'Other';
const TOPICS = ['Book a trip', 'Prices and dates', 'Which trip fits us', 'Kids and families', 'What to bring', 'Licenses and rules', 'Crab trips', 'Group or private trip', 'Gift or special occasion', OTHER];
const SIZES = ['2', '3', '4', '5', '6'];
const WHENS = ['Within 2 weeks', 'This season', 'Later this year', 'Just exploring'];
const REACH = ['Call', 'Text', 'Email'];

const setToText = (k: Iterable<unknown>) => [...k].map(String);

// Site-wide "ask the captain" form. Tap-to-select answers (chips) keep it quick; only name, email and a way to say what
// you need are required. Same delivery rules as BookingForm: a confirmed 2xx from PUBLIC_FORM_ENDPOINT is "sent";
// without an endpoint it opens the visitor's mail app and says plainly that nothing has been sent yet.
export default function ContactForm({ trips, email, defaultTrip }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'draft' | 'error'>('idle');
  const [draft, setDraft] = useState<{ body: string; subject: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [trip, setTrip] = useState<string>(defaultTrip ?? '');
  const [size, setSize] = useState('');
  const [when, setWhen] = useState('');
  const [reach, setReach] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const otherPicked = topics.includes(OTHER);

  const errs = {
    name: validators.name(name),
    email: validators.email(mail),
    phone: phone.trim() ? validators.phone(phone) : (reach === 'Call' || reach === 'Text') ? `Add a phone number so we can ${reach.toLowerCase()} you, or choose Email.` : '',
    message: otherPicked && message.trim().length < 5 ? 'You chose Other: tell us a little about what you need.' : !topics.length && message.trim().length < 5 ? 'Pick at least one topic above, or write us a short question.' : '',
  };
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const show = (k: keyof typeof errs) => (touched[k] && errs[k] ? errs[k] : '');

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (status === 'sent' || status === 'draft') headRef.current?.focus({ preventScroll: true });
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    const bad = (['name', 'email', 'phone', 'message'] as const).find((k) => errs[k]);
    if (bad) {
      requestAnimationFrame(() => (formRef.current?.elements.namedItem(bad) as HTMLElement | null)?.focus());
      return;
    }
    if (((new FormData(e.currentTarget).get('company') as string) || '')) return; // honeypot
    const data = {
      name: name.trim(), email: mail.trim(), phone: phone.trim(), topics: topics.join(', '), trip: trip || NOT_SURE, group: size, when, reach,
      message: message.trim(), page: window.location.pathname,
    };
    const subject = data.trip !== NOT_SURE ? `Question about: ${data.trip}` : topics.length ? `Question: ${topics[0]}` : 'Question from the website';
    const body = [
      `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || 'not given'}`, `Best way to reach me: ${reach || 'any'}`,
      `About: ${data.topics || 'see message'}`, `Trip: ${data.trip}`, `Group size: ${size || 'not given'}`, `When: ${when || 'not given'}`,
      `Sent from: ${data.page}`, '', data.message,
    ].join('\n');
    if (!ENDPOINT) {
      setDraft({ body, subject });
      window.location.assign(mailtoHref(email, subject, body));
      setStatus('draft');
      return;
    }
    if (submitting.current) return; // ignore double submits fired in the same tick
    submitting.current = true;
    setStatus('sending');
    setStatus((await postLead({ ...data, form: 'contact' })) ? 'sent' : 'error');
    submitting.current = false;
  }

  if (status === 'draft' && draft) {
    const copy = async () => {
      try { await navigator.clipboard.writeText(`To: ${email}\nSubject: ${draft.subject}\n\n${draft.body}`); setCopied(true); } catch { setCopied(false); }
    };
    return (
      <div className="cb-done cb-done--draft" role="status">
        <span className="cb-done__mark" aria-hidden="true"><Icon name="mail" size={30} /></span>
        <h3 ref={headRef} tabIndex={-1}>Your message is not sent yet</h3>
        <p>
          Your email app should be opening with the message filled in. <strong>Press send there</strong> to finish. If nothing
          opened, copy it and email {email}, or call <a href={SITE.phoneHref}>{SITE.phone}</a>.
        </p>
        <div className="cb-done__actions">
          <a className="btn btn--primary btn--sm" href={mailtoHref(email, draft.subject, draft.body)}>Open email again</a>
          <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>{copied ? 'Copied' : 'Copy message'}</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setStatus('idle'); setCopied(false); }}>Edit message</button>
        </div>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="cb-done" role="status">
        <span className="cb-done__mark" aria-hidden="true"><Icon name="checkCircle" size={30} /></span>
        <h3 ref={headRef} tabIndex={-1}>Message sent</h3>
        <p>Captain Clinton will reply as soon as he is off the water. For a faster answer, call <a href={SITE.phoneHref}>{SITE.phone}</a>.</p>
      </div>
    );
  }

  const Chips = ({ id, label, hint, options, value, multiple, onChange }: { id: string; label: string; hint?: string; options: string[]; value: string[]; multiple?: boolean; onChange: (v: string[]) => void }) => (
    <div className="cb-q">
      <p className="cb-q__l" id={`cb-${id}-l`}>{label}{hint && <small>{hint}</small>}</p>
      <ToggleButtonGroup aria-labelledby={`cb-${id}-l`} className="cb-chips" selectionMode={multiple ? 'multiple' : 'single'} selectedKeys={value} onSelectionChange={(k) => onChange(setToText(k))}>
        {options.map((o) => (
          <ToggleButton key={o} id={o} className="cb-chip">
            <Icon name="check" size={14} className="cb-chip__tick" />{o}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );

  return (
    <Form className="cb-form" onSubmit={onSubmit} validationBehavior="aria" ref={formRef}>
      {Chips({ id: 'topics', label: 'What can we help with?', hint: 'Pick any', options: TOPICS, value: topics, multiple: true, onChange: setTopics })}
      {Chips({ id: 'trip', label: 'Which trip?', hint: 'Optional', options: [...trips.map((t) => t.name), NOT_SURE], value: trip ? [trip] : [], onChange: (v) => setTrip(v[0] ?? '') })}
      <div className="cb-row">
        {Chips({ id: 'size', label: 'Guests', hint: 'Optional', options: SIZES, value: size ? [size] : [], onChange: (v) => setSize(v[0] ?? '') })}
        {Chips({ id: 'when', label: 'When are you thinking?', hint: 'Optional', options: WHENS, value: when ? [when] : [], onChange: (v) => setWhen(v[0] ?? '') })}
      </div>

      <div className="cb-row">
        <TextField className="cb-fl" name="name" maxLength={80} isRequired autoComplete="name" value={name} onChange={setName} onBlur={() => touch('name')} isInvalid={!!show('name')}>
          <Input placeholder=" " />
          <Label>Your name</Label>
          <FieldError className="cb-err">{errs.name}</FieldError>
        </TextField>
        <TextField className="cb-fl" name="email" maxLength={254} type="email" inputMode="email" isRequired autoComplete="email" value={mail} onChange={setMail} onBlur={() => touch('email')} isInvalid={!!show('email')}>
          <Input placeholder=" " />
          <Label>Email</Label>
          <FieldError className="cb-err">{errs.email}</FieldError>
        </TextField>
      </div>
      <div className="cb-row">
        <TextField className="cb-fl" name="phone" maxLength={30} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={setPhone} onBlur={() => touch('phone')} isInvalid={!!show('phone')}>
          <Input placeholder=" " />
          <Label>Phone (optional)</Label>
          <FieldError className="cb-err">{errs.phone}</FieldError>
        </TextField>
        {Chips({ id: 'reach', label: 'Best way to reach you', hint: 'Optional', options: REACH, value: reach ? [reach] : [], onChange: (v) => setReach(v[0] ?? '') })}
      </div>

      <TextField className="cb-fl cb-fl--area" name="message" maxLength={1500} value={message} onChange={setMessage} onBlur={() => touch('message')} isInvalid={!!show('message')}>
        <TextArea placeholder=" " rows={3} />
        <Label>{otherPicked ? 'Tell us what you need' : 'Anything else? (optional)'}</Label>
        <FieldError className="cb-err">{errs.message}</FieldError>
      </TextField>

      <div aria-hidden="true" className="cb-hp">
        <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {status === 'error' && <p className="cb-err cb-err--box" role="alert"><Icon name="close" size={16} />Something went wrong sending that. Please call {SITE.phone} or email {email}.</p>}

      <div className="cb-actions">
        <p className="cb-note">Want to book a date? Use the <a href="/oregon-fishing-charter-rates#customize">trip request form</a>.</p>
        <Button type="submit" className="btn btn--primary" isDisabled={status === 'sending'}>
          {status === 'sending' ? 'Sending' : 'Send message'}
          <Icon name="send" size={18} />
        </Button>
      </div>
    </Form>
  );
}
