import { useMemo, useState } from 'react';
import { Radio, RadioGroup } from 'react-aria-components';
import { Icon } from './Icon';
import type { IconName } from '../icons/paths';

export interface PlannerTrip {
  slug: string;
  name: string;
  hours: number;
  price: number;
  boat: string;
  capacity: number;
  kind: 'river' | 'drift' | 'crab';
  species: string[];
  season?: string;
}

type Target = 'steelhead' | 'salmon' | 'crab';
type Len = 'any' | '4' | '5' | '8';

const TARGETS: { id: Target; label: string; when: string; icon: IconName }[] = [
  { id: 'steelhead', label: 'Steelhead', when: 'January to April', icon: 'fish' },
  { id: 'salmon', label: 'Salmon', when: 'Spring, early summer and fall', icon: 'fishJump' },
  { id: 'crab', label: 'Dungeness crab', when: 'October to December', icon: 'crab' },
];
const LENGTHS: { id: Len; label: string }[] = [
  { id: 'any', label: 'Any length' },
  { id: '4', label: '4 hours' },
  { id: '5', label: '5 hours' },
  { id: '8', label: '8 hours' },
];
const SIZES = [2, 3, 4, 5, 6];

const targetsOf = (t: PlannerTrip): Target[] => {
  if (t.kind === 'crab') return ['crab'];
  const out: Target[] = [];
  if (t.species.some((s) => /steelhead/i.test(s))) out.push('steelhead');
  if (t.species.some((s) => /salmon/i.test(s))) out.push('salmon');
  return out;
};
const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const targetLabel = (t: Target) => (t === 'crab' ? 'crab' : t);

export default function TripPlanner({ trips }: { trips: PlannerTrip[] }) {
  const [guests, setGuests] = useState(2);
  const [target, setTarget] = useState<Target>('steelhead');
  const [lengthSel, setLengthSel] = useState<Len>('any');

  const lengthState = useMemo(() => {
    const res: Record<string, { ok: boolean; why: string }> = {};
    for (const l of ['4', '5', '8']) {
      const byTarget = trips.filter((t) => targetsOf(t).includes(target) && String(t.hours) === l);
      const fits = byTarget.filter((t) => t.capacity >= guests);
      res[l] = byTarget.length === 0
        ? { ok: false, why: `no ${targetLabel(target)} trip runs ${l} hours` }
        : fits.length === 0 ? { ok: false, why: `too many guests for the ${l}-hour boat` } : { ok: true, why: '' };
    }
    res.any = { ok: true, why: '' };
    return res;
  }, [trips, target, guests]);
  const length: Len = lengthState[lengthSel]?.ok ? lengthSel : 'any';

  const rows = useMemo(() => {
    return trips.map((t) => {
      let why = '';
      if (!targetsOf(t).includes(target)) {
        why = t.kind === 'crab' ? 'Crabbing trip, not a fishing trip' : target === 'crab' ? 'Fishing trip, not a crabbing trip' : `This trip does not target ${target}`;
      } else if (length !== 'any' && String(t.hours) !== length) {
        why = `Runs ${t.hours} hours, not ${length}`;
      } else if (t.capacity < guests) {
        why = `The ${t.boat === 'Willy Predator' ? 'Willy Predator' : 'Alumaweld'} carries up to ${t.capacity} guests, and you have ${guests}`;
      }
      return { t, match: !why, why };
    });
  }, [trips, target, length, guests]);

  const matches = rows.filter((r) => r.match);
  const totals = matches.map((r) => r.t.price * guests);
  const low = totals.length ? Math.min(...totals) : 0;
  const high = totals.length ? Math.max(...totals) : 0;
  const disabledLens = LENGTHS.filter((l) => !lengthState[l.id].ok);
  const sorted = [...rows].sort((a, b) => Number(b.match) - Number(a.match));

  const pick = (slug: string) => {
    window.dispatchEvent(new CustomEvent('tp:select-trip', { detail: { slug, guests } }));
  };

  return (
    <div className="tp-planner">
      <div className="tp-controls" role="group" aria-label="Trip planner">
        <RadioGroup className="tp-rg" value={String(guests)} onChange={(v) => setGuests(Number(v))} aria-label="Party size">
          <span className="tp-legend" aria-hidden="true">Party size</span>
          <div className="tp-seg">
            {SIZES.map((n) => (
              <Radio key={n} value={String(n)} className="tp-seg__opt">
                <span className="tp-seg__n">{n}</span>
                <span className="tp-sr">{n} guests</span>
              </Radio>
            ))}
          </div>
          <p className="tp-hint">
            {guests <= 3
              ? 'Up to 3 guests fits either boat: the Willy Predator or the Alumaweld drift boat.'
              : 'Four or more guests fish from the Willy Predator, which carries up to 6 (often 4).'}
          </p>
        </RadioGroup>

        <RadioGroup className="tp-rg" value={target} onChange={(v) => setTarget(v as Target)} aria-label="Target">
          <span className="tp-legend" aria-hidden="true">Target</span>
          <div className="tp-targets">
            {TARGETS.map((x) => (
              <Radio key={x.id} value={x.id} className="tp-target">
                <Icon name={x.icon} size={26} />
                <span className="tp-target__t">{x.label}</span>
                <span className="tp-target__s">{x.when}</span>
              </Radio>
            ))}
          </div>
        </RadioGroup>

        <RadioGroup className="tp-rg" value={length} onChange={(v) => setLengthSel(v as Len)} aria-label="Trip length">
          <span className="tp-legend" aria-hidden="true">Length</span>
          <div className="tp-lens">
            {LENGTHS.map((l) => (
              <Radio key={l.id} value={l.id} isDisabled={!lengthState[l.id].ok} className="tp-len">
                {l.label}
                {!lengthState[l.id].ok && <span className="tp-sr">, unavailable: {lengthState[l.id].why}</span>}
              </Radio>
            ))}
          </div>
          {disabledLens.length > 0 && (
            <p className="tp-hint">
              Unavailable for this pick: {disabledLens.map((l) => `${l.label.toLowerCase()} (${lengthState[l.id].why})`).join('; ')}.
            </p>
          )}
        </RadioGroup>
      </div>

      <div className="tp-results">
        <div className="tp-summary" aria-live="polite" aria-atomic="true">
          <p className="tp-summary__line">
            {matches.length === 0
              ? 'No trip matches. Try fewer guests or a different length.'
              : `${matches.length} ${matches.length === 1 ? 'trip matches' : 'trips match'} ${guests} guests fishing for ${targetLabel(target)}.`}
          </p>
          {matches.length > 0 && (
            <p className="tp-summary__range">
              <span key={`${low}-${high}`} className="tp-flip">{low === high ? money(low) : `${money(low)} to ${money(high)}`}</span>
              <small>total for {guests} guests</small>
            </p>
          )}
        </div>

        <ol className="tp-tickets">
          {sorted.map(({ t, match, why }) => {
            const total = t.price * guests;
            const tip = Math.round(total * 0.2);
            return (
              <li key={t.slug} className="tp-ticket" data-match={match ? 'yes' : 'no'}>
                <div className="tp-ticket__stub">
                  <span className="tp-ticket__hrs">{t.hours}</span>
                  <span className="tp-ticket__u">hours</span>
                </div>
                <div className="tp-ticket__main">
                  <h3><a href={`/trips/${t.slug}`}>{t.name}</a></h3>
                  <p className="tp-ticket__meta">
                    <Icon name={t.kind === 'drift' ? 'driftBoat' : t.kind === 'crab' ? 'crab' : 'boat'} size={18} />
                    {t.boat === 'Willy Predator' ? "22' Willy Predator" : "16' Alumaweld drift boat"}, up to {t.capacity} guests
                  </p>
                  <p className="tp-ticket__species">{t.species.join(', ')}{t.season ? ` · ${t.season}` : ''}</p>
                  {!match && <p className="tp-ticket__why"><Icon name="close" size={16} />{why}</p>}
                </div>
                <div className="tp-ticket__price">
                  {match ? (
                    <>
                      <span className="tp-ticket__pp">{money(t.price)}<small> per person</small></span>
                      <span key={total} className="tp-ticket__total tp-flip">{money(total)}<small> for {guests}</small></span>
                      <span className="tp-ticket__tip">20% tip customary: about {money(tip)}</span>
                      <a className="btn btn--primary btn--sm" href="#customize" onClick={() => pick(t.slug)}>Request this trip</a>
                    </>
                  ) : (
                    <span className="tp-ticket__pp tp-ticket__pp--off">{money(t.price)}<small> per person</small></span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="tp-fine">Minimum 2 guests per trip. Total is price per person times guests. Tips are not included.</p>
      </div>
    </div>
  );
}
