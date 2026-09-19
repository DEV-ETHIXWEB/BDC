import { TRIPS, type Trip } from '../../data/trips';
import { FAQS, SPECIES } from '../../data/content';
import { SITE, RIVERS } from '../../data/site';
import { COUPONS } from '../../data/coupons';

/*
 * Deterministic, offline "brain". Every fact below is read from src/data (trips, FAQS, SPECIES,
 * SITE, RIVERS, COUPONS) or from copy already published on the site, so the assistant cannot
 * invent a price or a policy. When it does not know, it says so and points to Captain Clinton.
 * Links use [label](href).
 */

export type ActionId = 'call' | 'email' | 'book' | 'license' | 'directions';
export interface Card { slug: string; name: string; price: number; hours: number; boat: string; capacity: number; href: string; note?: string }
export interface Ctx { intent?: string; entity?: Entity }
export interface Reply { text: string; cards?: Card[]; actions?: ActionId[]; followups: string[]; ctx: Ctx; fallback?: boolean }
export interface Entity { kind?: Trip['kind']; boat?: Trip['boat']; hours?: number; species?: 'steelhead' | 'salmon'; slug?: string }

/* ───────── text normalisation, stemming, typo tolerance ───────── */
const STOP = new Set(('the and for you your are with what how does can will this that have from about there their they them then than when where which who whom whose please would could should just like some any much many more most also into onto over under been being were was our out not but all get got want need tell know let its it is a an of to in on at or as if do i we me my us be by so up').split(' '));

function stem(w: string): string {
  if (w.length > 3 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) { w = w.slice(0, -3); if (/(.)\1$/.test(w)) w = w.slice(0, -1); return w; }
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

function lev(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 3;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let prev2: number[] = [];
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
    }
    prev2 = prev; prev = cur;
  }
  return prev[n];
}

/* ───────── intents ───────── */
interface Intent {
  id: string;
  /** keywords are stemmed at load; multi-word entries match as phrases (worth 2). [word, weight] overrides weight. */
  kw: (string | [string, number])[];
  fn: (c: Ask) => Partial<Reply> & { text: string };
  follow?: string[];
}
interface Ask { e: Entity; ctx: Ctx; page?: string; tokens: string[] }

const cardOf = (t: Trip): Card => ({ slug: t.slug, name: t.name, price: t.price, hours: t.hours, boat: t.boatSpec, capacity: t.capacity, href: `/trips/${t.slug}` });
const hasSp = (t: Trip, re: RegExp) => t.species.some((s) => re.test(s));

function pick(e: Entity): Trip[] {
  return TRIPS.filter((t) =>
    (!e.slug || t.slug === e.slug) &&
    (!e.kind || t.kind === e.kind) &&
    (!e.boat || t.boat === e.boat) &&
    (!e.hours || t.hours === e.hours) &&
    (!e.species || hasSp(t, e.species === 'steelhead' ? /steelhead/i : /chinook|salmon/i)));
}
const faq = (needle: string) => FAQS.find((f) => f.q.toLowerCase().includes(needle))!.a;
const sp = (slug: string) => SPECIES.find((s) => s.slug === slug)!;
const label = (e: Entity): string => {
  if (e.kind === 'crab') return 'crabbing';
  if (e.species === 'steelhead') return 'steelhead';
  if (e.species === 'salmon') return 'salmon';
  if (e.kind === 'drift') return 'drift boat';
  if (e.boat === 'Willy Predator') return 'Willy Predator';
  if (e.hours === 4) return 'half day';
  if (e.hours === 8) return 'full day';
  return '';
};
const tripsLink = '[Trips & Rates](/oregon-fishing-charter-rates)';
const noneFor = (e: Entity) => `I don't have a ${label(e) || 'matching'} trip matching that in our trip list. Here is everything we run:`;

function asTrips(e: Entity, build: (ts: Trip[]) => string, extra: Partial<Reply> = {}) {
  let ts = pick(e);
  let pre = '';
  if (!ts.length) { ts = TRIPS; pre = noneFor(e) + '\n'; }
  const filtered = ts.length < TRIPS.length;
  return { text: pre + build(ts), cards: filtered ? ts.map(cardOf) : undefined, ...extra };
}

const SIZE_Q = (t: string[]) => t.some((x) => ['big', 'weight', 'pound', 'lb', 'large', 'size', 'length', 'long'].includes(x)) && t.some((x) => ['big', 'weight', 'pound', 'lb', 'large', 'length', 'size'].includes(x));

const INTENTS: Intent[] = [
  {
    id: 'price', kw: ['price', 'cost', 'rate', 'fee', 'how much', 'expensive', 'cheap', 'afford', 'dollar', '$', 'charge', 'quote', 'per person', 'pp'],
    follow: ['How do I book?', "What's included?", 'How long are the trips?'],
    fn: ({ e }) => asTrips(e, (ts) => {
      const one = ts.length === 1 ? ts[0] : null;
      if (one) return `${one.name} is $${one.price} per person for ${one.hours} hours aboard the ${one.boatSpec}. It is a shared trip with a 2 guest minimum, and it includes the guide, boat and gear.`;
      const prices = [...new Set(ts.map((t) => t.price))].sort((a, b) => a - b);
      const range = prices.length === 1 ? `$${prices[0]}` : `$${prices[0]} to $${prices[prices.length - 1]}`;
      return `Rates ${prices.length === 1 ? 'are' : 'run'} ${range} per person, with a 2 guest minimum. Every trip includes the guide, boat and gear. Tipping 20% is customary. See ${tripsLink}.`;
    }),
  },
  {
    id: 'book', kw: ['book', 'reserve', 'availab', 'schedule', 'sign up', 'date', 'calendar', 'openings', 'appointment', 'available', 'hire'],
    follow: ['Trip prices', 'What should I bring?', 'Where do you meet?'],
    fn: ({ e }) => {
      const ts = pick(e);
      const target = ts.length === 1 ? `Open [${ts[0].name}](/trips/${ts[0].slug}) and use the booking form, or ` : `Pick a trip on ${tripsLink}, send a request from [Contact](/contact-us), or `;
      return { text: `${target}call Captain Clinton at [${SITE.phone}](${SITE.phoneHref}). Trips are scheduled from the 3rd week of September, and he confirms the date, launch time and target fish with you.`, actions: ['book', 'call'], cards: ts.length && ts.length <= 3 ? ts.map(cardOf) : undefined };
    },
  },
  {
    id: 'trips', kw: [['trips', 0.5], 'offer', 'options', ['charter', 0.5], 'packages', 'tour', 'choices', 'menu', 'what do you do', 'services', 'what do you have'],
    follow: ['Trip prices', 'Crabbing season', 'Which trip is best for kids?'],
    fn: () => ({ text: `We run six guided trips on two boats: half day (4 hrs), full day (8 hrs), drift boat steelhead trips and October-to-December crabbing charters. Here they all are:`, cards: TRIPS.map(cardOf) }),
  },
  {
    id: 'crab', kw: [['crab', 1.5], ['dungeness', 1.5], ['crabbing', 1.5]],
    follow: ['How much is crabbing?', 'Can kids come crabbing?', 'How do I book?'],
    fn: ({ tokens }) => {
      const ts = TRIPS.filter((t) => t.kind === 'crab');
      if (SIZE_Q(tokens)) return { text: `Dungeness crab typically weigh ${sp('dungeness-crab').weight} and measure ${sp('dungeness-crab').length}. On crab trips guests sort keepers and take home fresh crab.` };
      return { text: `Crabbing charters run ${ts[0].season}: ${ts[0].hours} hours, $${ts[0].price} per person, on the Willy Predator (up to ${ts[0].capacity} guests) or the Alumaweld (up to ${ts[1].capacity}). ${sp('dungeness-crab').tip}`, cards: ts.map(cardOf) };
    },
  },
  {
    id: 'steelhead', kw: [['steelhead', 1.5], ['winter fish', 2]],
    follow: ['Which boat for steelhead?', 'How much is a drift boat trip?', 'Do I need a license?'],
    fn: ({ tokens }) => SIZE_Q(tokens) ? { text: `Steelhead typically run ${sp('steelhead-trout').weight} and ${sp('steelhead-trout').length}.` } : ({ text: `${sp('steelhead-trout').season} ${sp('steelhead-trout').technique} You can fish steelhead from the low-profile [Alumaweld drift boat](/trips/full-day-drift-boat) or aboard the Willy Predator.`, cards: TRIPS.filter((t) => hasSp(t, /steelhead/i)).map(cardOf) }),
  },
  {
    id: 'salmon', kw: [['salmon', 1.5], ['chinook', 1.5], ['king', 1]],
    follow: ['How early do trips start?', 'How much is a full day?', 'Do I need a license?'],
    fn: ({ tokens }) => SIZE_Q(tokens) ? { text: `Chinook salmon typically run ${sp('chinook-salmon').weight} and ${sp('chinook-salmon').length}.` } : ({ text: `${sp('chinook-salmon').season} ${sp('chinook-salmon').technique} Most salmon trips run on the Willy Predator.`, cards: TRIPS.filter((t) => t.boat === 'Willy Predator' && t.kind === 'river').map(cardOf) }),
  },
  {
    id: 'license', kw: ['license', 'licence', 'permit', 'odfw', 'endorsement', 'fish and wildlife'],
    follow: ['How do I book?', 'Can kids come along?'],
    fn: () => ({ text: `${faq('state fishing license?')} ${faq('where do i get')} Our [license guide](/oregon-fishing-license) has the details.`, actions: ['license'] }),
  },
  { id: 'tip', kw: [['tip', 3], ['gratuity', 3]], follow: ['Trip prices', "What's included?"], fn: () => ({ text: faq('tip') }) },
  {
    id: 'includes', kw: ['include', 'provide', 'gear', 'rod', 'reel', 'bait', 'equipment', 'tackle', 'supply', 'photo', 'video', 'what do i get'],
    follow: ['Trip prices', 'What should I bring?', 'Do I need a license?'],
    fn: ({ e }) => asTrips(e, (ts) => `${ts.length === 1 ? ts[0].name + ' includes' : 'Every trip includes'}: ${ts[0].includes.join(', ').toLowerCase()}. ${faq('own gear').replace(/^No\. /, 'You do not need your own gear. ')} You also receive trip photos and videos.`),
  },
  {
    id: 'prep', kw: ['bring', 'wear', 'lunch', 'food', 'snack', 'drink', 'cooler', 'clothes', 'clothing', 'pack', 'jacket', 'water', 'eat', 'what to bring', 'prepare'],
    follow: ["What's included?", 'Do I need a license?', 'How early do trips start?'],
    fn: () => ({ text: `I don't have a food or packing list on file. What I do know: standard gear such as rods and reels is provided, a valid Oregon fishing license is required for anglers 12 and older, and for crabbing you should bring a cooler and a hungry family. Ask Captain Clinton what to wear or pack for your date.`, actions: ['call'] }),
  },
  {
    id: 'where', kw: ['meet', 'address', 'location', 'direction', 'launch', 'depart', 'located', 'parking', 'find you', 'happy valley', 'map', ['where', 0.6]],
    follow: ['How early do trips start?', 'Which rivers do you fish?', 'How do I book?'],
    fn: () => ({ text: `${faq('meet our guests')} Captain Clinton confirms the launch spot and time when you book.`, actions: ['directions', 'call'] }),
  },
  {
    id: 'river', kw: ['river', 'creek', 'lake', 'reservoir', 'area', 'fish in', 'where do you fish', 'where you fish'],
    follow: ['Steelhead season', 'Salmon season', 'Where do you meet?'],
    fn: () => ({ text: `${faq('what rivers')} Rivers and what they are known for: ${RIVERS.map((r) => `${r.name.replace(' River', '')} (${r.note.toLowerCase()})`).join(', ')}. ${faq('where does bdc')}` }),
  },
  {
    id: 'time', kw: ['early', 'start', 'time', 'hour', 'long', 'duration', 'length', 'what time', 'how many hour', ['when', 0.5], 'morning'],
    follow: ['Trip prices', 'Where do you meet?', 'How do I book?'],
    fn: ({ e }) => asTrips(e, (ts) => ts.length === 1
      ? `${ts[0].name} runs ${ts[0].hours} hours. ${faq('how early')}`
      : ts.length < TRIPS.length
        ? `${label(e) ? label(e)[0].toUpperCase() + label(e).slice(1) + ' trips' : 'Those trips'} run ${[...new Set(ts.map((t) => t.hours))].sort((a, b) => a - b).join(' or ')} hours. ${faq('how early')}`
        : `Half day trips are 4 hours, full day trips 8 hours and crabbing charters 5 hours. ${faq('how early')}`),
  },
  {
    id: 'season', kw: ['season', 'month', 'winter', 'spring', 'summer', 'fall', 'autumn', 'best time', 'when to fish', 'when do', ['when', 0.5], 'october', 'november', 'december', 'january', 'february', 'march', 'april', 'june', 'july', 'august', 'september'],
    follow: ['Steelhead season', 'Crabbing season', 'How do I book?'],
    fn: ({ e }) => {
      const lines: string[] = [];
      const want = e.kind === 'crab' ? 'crab' : e.species ?? (e.kind === 'drift' ? 'steelhead' : '');
      if (!want || want === 'steelhead') lines.push(`Steelhead: ${sp('steelhead-trout').season}`);
      if (!want || want === 'salmon') lines.push(`Salmon: ${sp('chinook-salmon').season}`);
      if (!want || want === 'crab') lines.push(`Crab: ${sp('dungeness-crab').season}`);
      return { text: `${lines.join('\n')}\nTrips are scheduled from the 3rd week of September. See the [fishing reports](/oregon-fishing-reports).` };
    },
  },
  {
    id: 'group', kw: ['people', 'group', 'capacity', 'guest', 'how many', 'seat', 'party', 'size', 'bigger', 'large group', 'friend', 'anglers', 'minimum', 'solo', 'alone', 'couple'],
    follow: ['Which boat is which?', 'Trip prices', 'Can kids come along?'],
    fn: ({ e }) => asTrips(e, (ts) => ts.length === 1
      ? `${ts[0].name} takes 2 to ${ts[0].capacity} guests on the ${ts[0].boatSpec}. Shared trips have a 2 guest minimum.`
      : `${faq('how many people')} Trips are shared with a minimum of 2 guests.`),
  },
  {
    id: 'kids', kw: ['kid', 'child', 'children', 'family', 'families', 'son', 'daughter', 'teen', 'young', 'youth', 'beginner', 'first time', 'first-time', 'novice', 'inexperienced', 'never fished', 'age', ['old', 0.5], 'toddler', 'baby', 'grandkid', 'grandpa', 'senior'],
    follow: ['Which trip is best for kids?', 'Do I need a license?', 'Trip prices'],
    fn: () => ({ text: `Yes, we are a family-friendly service. The [half day trip](/trips/half-day-willy-predator) is ideal for families and first-timers, and crabbing is a family favorite. Captain Clinton is patient with first-time anglers and tailors each trip to skill level. A fishing license is required for anglers 12 and older. I don't have a minimum age on file, so call to check for very young children.`, actions: ['call'], cards: [cardOf(TRIPS.find((t) => t.slug === 'half-day-willy-predator')!), cardOf(TRIPS.find((t) => t.slug === 'crabbing-charter-willy-predator')!)] }),
  },
  {
    id: 'boat', kw: ['boat', 'drift', 'willy', 'alumaweld', 'predator', 'vessel', 'yamaha', 'motor', 'engine'],
    follow: ['Trip prices', 'How many people fit?', 'Which trip is best for steelhead?'],
    fn: () => ({ text: `Two boats. The 22' Willy Predator (twin Yamaha power, 150 HP main and 9.9 HP kicker) takes up to 6 guests and is built for salmon on larger rivers like the Columbia and Willamette. The 16' Alumaweld drift boat takes up to 3 guests and reaches shallow water for steelhead.` }),
  },
  {
    id: 'captain', kw: ['captain', 'clinton', 'guide', 'mcculloch', 'owner', 'experience', 'who', 'bdc'],
    follow: ['Trip prices', 'How do I book?', 'How do I contact him?'],
    fn: () => ({ text: `${SITE.captain} runs every trip. He keeps groups small so each guest gets personal attention, fishes responsibly, and is patient and down-to-earth with beginners and seasoned anglers alike. Read more on the [captain page](/captain-clinton-mcculloch-of-oregon).` }),
  },
  {
    id: 'contact', kw: ['contact', 'phone', 'call', 'email', 'text', 'reach', 'talk', 'speak', 'number', 'message', 'human', 'person', 'mail'],
    follow: ['Trip prices', 'Where do you meet?'],
    fn: () => ({ text: `Call [${SITE.phone}](${SITE.phoneHref}) or email [${SITE.email}](mailto:${SITE.email}). You can also send a request from [Contact](/contact-us).`, actions: ['call', 'email'] }),
  },
  {
    id: 'deals', kw: ['discount', 'coupon', 'promo', 'deal', 'special', 'offers', 'sale', 'code', 'military'],
    follow: ['Trip prices', 'How do I book?'],
    fn: () => {
      const codes = COUPONS.filter((c) => c.code);
      return { text: `${codes.length ? codes.map((c) => `${c.title}: use code ${c.code}.`).join(' ') + ' ' : "I don't see a promo code listed right now. "}Current offers: ${COUPONS.map((c) => c.title).join('; ')}. Ask Captain Clinton if there is anything else.`, actions: ['call'] };
    },
  },
  {
    id: 'policy', kw: [['cancel', 2], ['refund', 2], ['deposit', 2], 'reschedule', 'policy', 'insurance', 'weather', 'rain', 'wind', 'payment', ['card', 2.5], 'cash', 'venmo', 'rebook', 'postpone', 'check', 'paypal', 'zelle'],
    follow: ['How do I book?', 'How do I contact him?'],
    fn: ({ tokens }) => ({ text: `${tokens.some((t) => /^(weather|rain|wind)$/.test(t)) ? 'Trips are tailored to the season, river conditions and skill level, and Captain Clinton confirms details with you before your trip. ' : ''}I don't have deposit, cancellation or payment details in my trip info, and I won't guess. Please ask Captain Clinton directly.`, actions: ['call', 'email'] }),
  },
  {
    id: 'keep', kw: [['keep', 3], ['keeper', 2], ['take home', 3], ['catch and release', 3], ['limit', 2], ['release', 2], ['fillet', 2], ['clean', 2], ['cook', 2], ['process', 1.5], ['freezer', 2], ['smoke', 2]],
    follow: ['Crabbing season', 'Do I need a license?', 'How do I contact him?'],
    fn: ({ e }) => ({ text: `${e.kind === 'crab' ? 'On crab trips guests pull pots, sort keepers and take home fresh Dungeness crab. ' : ''}I don't have catch limits or keep-and-release rules for fish on file, and they depend on ODFW regulations, so please ask Captain Clinton.`, actions: ['call', 'license'] }),
  },
  {
    id: 'unknown', kw: [['dog', 3], ['pet', 3], ['bathroom', 3], ['restroom', 3], ['toilet', 3], ['heater', 3], ['alcohol', 3], ['beer', 3], ['wheelchair', 3], ['accessible', 3], ['disabled', 3], ['guarantee', 3], ['gift', 3], ['certificate', 3], ['private', 2], ['charge', 0], ['seasick', 3], ['nausea', 3], ['motion sickness', 3], ['pregnant', 3], ['swim', 3], ['life jacket', 3], ['lifejacket', 3], ['safety', 2], ['group rate', 3], ['corporate', 3], ['bachelor', 3], ['birthday', 3], ['wedding', 3]],
    follow: ['How do I contact him?', 'Trip prices'],
    fn: () => ({ text: `I don't have that detail in our trip info, and I won't guess. Captain Clinton can answer it directly.`, actions: ['call', 'email'] }),
  },
  { id: 'hi', kw: ['hi', 'hello', 'hey', 'howdy', 'good morning', 'good evening', 'good afternoon', 'yo'], fn: () => ({ text: `Hi! I can help with trips, prices, seasons, licenses and booking. What would you like to know?` }), follow: ['Trip prices', 'Crabbing season', 'How do I book?'] },
  { id: 'thanks', kw: ['thanks', 'thank', 'thx', 'great', 'perfect', 'awesome', 'cool', 'ok thanks', 'bye', 'goodbye'], fn: () => ({ text: `You're welcome! Ready to go? [Book a trip](/oregon-fishing-charter-rates).`, actions: ['book'] }), follow: ['Trip prices'] },
];

/* build the stemmed lookup once */
interface Compiled { intent: Intent; words: Map<string, number>; phrases: [string, number][] }
const COMPILED: Compiled[] = INTENTS.map((intent) => {
  const words = new Map<string, number>();
  const phrases: [string, number][] = [];
  for (const k of intent.kw) {
    const [text, w] = Array.isArray(k) ? k : [k, 1];
    const parts = text.toLowerCase().split(/[\s-]+/).map(stem);
    if (parts.length > 1) phrases.push([` ${parts.join(' ')} `, Array.isArray(k) ? w : 2]);
    else words.set(parts[0], Math.max(words.get(parts[0]) ?? 0, w));
  }
  return { intent, words, phrases };
});
const VOCAB = new Set<string>();
COMPILED.forEach((c) => c.words.forEach((_, w) => VOCAB.add(w)));
['crab', 'drift', 'willy', 'steelhead', 'salmon', 'alumaweld', 'predator', 'half', 'full', 'clinton', 'kid', 'family', 'price', 'license', 'season'].forEach((w) => VOCAB.add(w));
const VOCAB_LONG = [...VOCAB].filter((w) => w.length >= 4);

function tokenize(input: string): { tokens: string[]; joined: string } {
  const raw = input.toLowerCase().replace(/\$/g, ' $ ').replace(/[^a-z0-9$\s'-]/g, ' ').replace(/'/g, '').split(/\s+/).filter(Boolean);
  const tokens = raw.map((t) => {
    const base = stem(t);
    if (VOCAB.has(base) || VOCAB.has(t) || STOP.has(base) || t.length < 5) return base;
    let best = '', bd = 9;
    for (const cand of new Set([t, base])) {
      const max = cand.length >= 8 ? 2 : 1;
      for (const v of VOCAB_LONG) { const d = lev(cand, v); if (d < bd && d <= max) { bd = d; best = v; } }
    }
    return best || base;
  });
  return { tokens, joined: ` ${tokens.join(' ')} ` };
}

function entityOf(tokens: string[], joined: string): Entity {
  const e: Entity = {};
  const has = (...w: string[]) => w.some((x) => tokens.includes(x));
  if (has('crab', 'dungeness')) e.kind = 'crab';
  else if (has('drift', 'alumaweld') || joined.includes(' drift boat ')) e.kind = 'drift';
  else if (has('steelhead')) e.species = 'steelhead';
  else if (has('salmon', 'chinook', 'king')) e.species = 'salmon';
  if (has('willy', 'predator')) e.boat = 'Willy Predator';
  if (has('half') || /\b4 hour|\b4 hr/.test(joined)) e.hours = 4;
  if (has('full') || /\b8 hour|\b8 hr/.test(joined)) e.hours = 8;
  return e;
}
const hasEntity = (e: Entity) => Object.keys(e).length > 0;

const ASPECTS = new Set(['price', 'time', 'group', 'includes', 'book', 'season']);
const SPECIES_INTENTS = new Set(['crab', 'steelhead', 'salmon']);

function tripFromPath(path?: string): Trip | undefined {
  const m = path?.match(/^\/trips\/([^/]+)/);
  return m ? TRIPS.find((t) => t.slug === m[1]) : undefined;
}

export const FALLBACK_FOLLOW = ['Trip prices', 'How do I book?', 'Crabbing season', 'Do I need a license?'];

export function suggestionsFor(path?: string): string[] {
  const t = tripFromPath(path);
  if (t) return [`How much is this trip?`, `What's included?`, `How many people can come?`, `How do I book this trip?`];
  if (path && /rates/.test(path)) return ['Which trip is best for kids?', "What's included?", 'How do I book?', 'Do I need a license?'];
  if (path && /license/.test(path)) return ['Do I need a license?', 'Where do I get one?', 'How old for a license?', 'Trip prices'];
  if (path && /species|report/.test(path)) return ['Steelhead season', 'Salmon season', 'Crabbing season', 'Trip prices'];
  if (path && /contact/.test(path)) return ['How do I contact him?', 'Where do you meet?', 'How early do trips start?', 'Trip prices'];
  return ['Trip prices', 'How do I book?', 'Crabbing season', 'Do I need a license?'];
}

function actionsFor(ids: ActionId[]): ActionId[] { return [...new Set(ids)]; }

export function reply(input: string, ctx: Ctx = {}, path?: string): Reply {
  const page = tripFromPath(path);
  const { tokens, joined } = tokenize(input);
  const content = tokens.filter((t) => !STOP.has(t));

  /* score every intent */
  const scored = COMPILED.map((c, order) => {
    let s = 0;
    const seen = new Set<string>();
    for (const t of tokens) { const w = c.words.get(t); if (w && !seen.has(t)) { s += w; seen.add(t); } }
    for (const [p, w] of c.phrases) if (joined.includes(p)) s += w;
    return { c, s, order };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.order - b.order);

  let ent = entityOf(tokens, joined);
  const mentionsEntity = hasEntity(ent);
  const pronoun = tokens.some((t) => ['it', 'this', 'that', 'thi', 'those', 'they', 'them', 'one'].includes(t)) || tokens.includes('trip');

  /* the page's trip is the default subject: "how much is this trip?" */
  if (!mentionsEntity && page && (pronoun || content.length <= 4)) ent = { slug: page.slug };
  else if (!mentionsEntity && ctx.entity && pronoun) ent = ctx.entity;

  let pool = scored;
  // a species word ("crab") plus another topic ("how much") means that topic, filtered by the species
  if (mentionsEntity && pool.some((x) => !SPECIES_INTENTS.has(x.c.intent.id) && x.c.intent.id !== 'hi' && x.c.intent.id !== 'thanks')) pool = pool.filter((x) => !SPECIES_INTENTS.has(x.c.intent.id));
  if (pool.length > 1) pool = pool.filter((x) => x.c.intent.id !== 'hi' && x.c.intent.id !== 'thanks');
  const aspect = pool.find((x) => ASPECTS.has(x.c.intent.id));
  let chosen = pool.filter((x) => x.s >= (pool[0]?.s ?? 0) * 0.6).slice(0, 2);
  // avoid stacking near-duplicate answers
  const ids = chosen.map((x) => x.c.intent.id);
  if (ids.includes('unknown')) chosen = chosen.filter((x) => x.c.intent.id === 'unknown');
  else if (ids.includes('policy') && ids.includes('trips')) chosen = chosen.filter((x) => x.c.intent.id !== 'trips');
  if (ids.includes('prep') && ids.length > 1) chosen = chosen.filter((x) => x.c.intent.id !== (ids.includes('includes') ? 'prep' : 'kids'));
  // an ambiguous "when" alone shouldn't outrank a clear topic
  const followUp = /^(and|what about|how about|also|what if|then|or|for)\b/.test(input.trim().toLowerCase()) || content.length <= 3;

  /* follow-up using the last topic: "what about crab?" after a price answer */
  if (ctx.intent && ASPECTS.has(ctx.intent) && mentionsEntity && followUp && (!aspect || SPECIES_INTENTS.has(chosen[0]?.c.intent.id ?? ''))) {
    const c = COMPILED.find((x) => x.intent.id === ctx.intent)!;
    chosen = [{ c, s: 1, order: 0 }];
  }
  /* pure pronoun follow-up: "and how long is it?" keeps last entity */
  if (!chosen.length && ctx.intent && followUp && mentionsEntity === false && ctx.entity && pronoun) {
    chosen = [{ c: COMPILED.find((x) => x.intent.id === ctx.intent)!, s: 1, order: 0 }];
  }
  /* last resort: "what about crab?" with no intent context still deserves the species answer */
  if (!chosen.length && mentionsEntity) {
    const id = ent.kind === 'crab' ? 'crab' : ent.species === 'steelhead' ? 'steelhead' : ent.species === 'salmon' ? 'salmon' : ent.kind === 'drift' || ent.boat ? 'boat' : 'trips';
    chosen = [{ c: COMPILED.find((x) => x.intent.id === id)!, s: 1, order: 0 }];
  }

  if (!chosen.length) {
    return {
      text: `I'm not sure about that one, and I only answer from our trip info, so I won't guess. I can help with trips, prices, seasons, gear, licenses and booking. For anything else, Captain Clinton is a call away.`,
      actions: ['call', 'email'], followups: FALLBACK_FOLLOW, ctx, fallback: true,
    };
  }

  const parts = chosen.map((x) => x.c.intent.fn({ e: ent, ctx, page: path, tokens }));
  const primary = chosen[0].c.intent;
  const text = parts.map((p) => p.text).join('\n\n');
  const cards = parts.flatMap((p) => p.cards ?? []);
  const uniqueCards = cards.filter((c, i) => cards.findIndex((x) => x.slug === c.slug) === i);
  const actions = actionsFor(parts.flatMap((p) => p.actions ?? []));
  const follow = [...new Set(chosen.flatMap((x) => x.c.intent.follow ?? []).concat(primary.follow ?? []))]
    .filter((f) => f.toLowerCase() !== input.trim().toLowerCase()).slice(0, 3);
  return {
    text,
    cards: uniqueCards.length ? uniqueCards.slice(0, 6) : undefined,
    actions: actions.length ? actions : undefined,
    followups: follow.length ? follow : FALLBACK_FOLLOW.slice(0, 3),
    ctx: { intent: primary.id, entity: hasEntity(ent) ? ent : ctx.entity },
  };
}

export const SUGGESTIONS = suggestionsFor();
export const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postal}`)}`;
