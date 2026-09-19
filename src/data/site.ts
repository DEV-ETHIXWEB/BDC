// Single source of truth for business facts. Everything here was taken from the
// live bdcguideservices.com site; nothing is invented.
export const SITE = {
  name: 'BDC Guide Service',
  legalName: 'BDC Guide Service',
  url: 'https://www.bdcguideservices.com',
  tagline: 'Oregon salmon, steelhead & crab charters',
  title: 'Oregon Fishing Guide Service | BDC Guide Service',
  description:
    'Family-friendly Oregon fishing charters for salmon, steelhead and Dungeness crab on the Columbia, Willamette, Wilson and Trask rivers with Captain Clinton McCulloch.',
  phone: '(503) 826-7294',
  phoneHref: 'tel:+15038267294',
  email: 'clinton.mcculloch5150@gmail.com',
  captain: 'Captain Clinton McCulloch',
  address: {
    street: '9018 Southeast Bridge Crk Ct',
    city: 'Happy Valley',
    region: 'OR',
    postal: '97015',
    country: 'US',
  },
  // Booking is handled by the existing Guidesly page until you switch it.
  bookingUrl: 'https://www.bdcguideservices.com/oregon-fishing-charter-rates',
  licenseUrl: 'https://myodfw.com/',
  year: 2026,
} as const;

export const NAV = [
  { label: 'Trips & Rates', href: '/oregon-fishing-charter-rates' },
  { label: 'Target Species', href: '/oregon-fishing-species' },
  { label: 'Gallery', href: '/oregon-fishing-charter-photos' },
  { label: 'Reviews', href: '/oregon-fishing-charter-reviews' },
  { label: 'Reports', href: '/oregon-fishing-reports' },
  { label: 'Meet the Captain', href: '/captain-clinton-mcculloch-of-oregon' },
] as const;

export const FOOTER_LINKS = [
  { label: 'Oregon Crab Hunt', href: '/trips/crabbing-charter-willy-predator' },
  { label: 'Fishing License', href: '/oregon-fishing-license' },
  { label: 'Things To Do', href: '/things-to-do-in-oregon' },
  { label: 'Crab Charter Fun', href: '/trips/crabbing-charter-alumaweld' },
  { label: 'Half Day Drift', href: '/trips/half-day-drift-boat' },
  { label: 'Willy Half Day', href: '/trips/half-day-willy-predator' },
  { label: 'Willy Full Day', href: '/trips/full-day-willy-predator' },
  { label: 'Full Day Drift', href: '/trips/full-day-drift-boat' },
] as const;

export const LEGAL_LINKS = [
  { label: 'FAQ', href: '/fishing-faqs' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Sitemap', href: '/sitemap' },
] as const;

export const RIVERS = [
  { name: 'Columbia River', note: 'Big-water Chinook trolling' },
  { name: 'Willamette River', note: 'Spring Chinook runs' },
  { name: 'Wilson River', note: 'Coastal winter steelhead' },
  { name: 'Trask River', note: 'Coastal winter steelhead' },
  { name: 'Sandy River', note: 'Steelhead drift fishing' },
  { name: 'Clackamas River', note: 'Steelhead and salmon' },
  { name: 'Nestucca River', note: 'Coastal steelhead' },
] as const;
