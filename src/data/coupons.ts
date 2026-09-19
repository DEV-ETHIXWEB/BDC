import type { IconName } from '../components/icons/paths';

export interface Coupon {
  icon: IconName;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Set a real promo code here once the captain approves one, e.g. code: 'FALL26'. */
  code?: string;
  /** Hero figure on the ticket face, e.g. '$150'. */
  big?: string;
  bigLabel?: string;
}

// Only facts from the live site are used. To add a discount, add an entry with a `code`
// and describe the offer in `body`. No discounts are invented here.
export const COUPONS: Coupon[] = [
  {
    icon: 'calendar',
    eyebrow: '2026 season',
    title: 'Now booking fall trips',
    body: 'Trips are scheduled from the 3rd week of September. Salmon, steelhead and more.',
    big: 'Sept',
    bigLabel: 'from the 3rd week',
    cta: 'View 2026 trips',
    href: '/oregon-fishing-charter-rates',
  },
  {
    icon: 'crab',
    eyebrow: 'Oct – Dec',
    title: 'Fall crab charters',
    body: 'Five hours of Dungeness crab and family fun aboard the Willy Predator or Alumaweld.',
    big: '$150',
    bigLabel: 'per person',
    cta: 'Book crabbing',
    href: '/trips/crabbing-charter-willy-predator',
  },
];
