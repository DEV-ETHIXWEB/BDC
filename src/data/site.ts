// Single source of truth for business facts. Everything here was taken from the
// live bdcguideservices.com site; nothing is invented.
export const SITE = {
  name: 'BDC Guide Service',
  url: 'https://www.bdcguideservices.com',
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
  licenseUrl: 'https://myodfw.com/fishing/licensing-info',
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
  { label: 'Oregon Crab Hunt', href: '/oregon-fishing-charter-rates/oregon-crabbing-charter-bdc-guide-service' },
  { label: 'Fishing License', href: '/article/get-your-valid-oregon-fishing-license' },
  { label: 'Things To Do', href: '/article/things-to-do-in-oregon' },
  { label: 'Crab Charter Fun', href: '/oregon-fishing-charter-rates/oregon-crabbing-charter-5-hour-adventure' },
  { label: 'Half Day Drift', href: '/oregon-fishing-charter-rates/oregon-fishing-charter-half-day-drift-boat-trip' },
  { label: 'Willy Half Day', href: '/oregon-fishing-charter-rates/oregon-fishing-charter-half-day-trip' },
  { label: 'Willy Full Day', href: '/oregon-fishing-charter-rates/full-day-oregon-river-fishing-charter' },
  { label: 'Full Day Drift', href: '/oregon-fishing-charter-rates/oregon-fishing-charter-full-day-drift-trip' },
  { label: 'All Articles', href: '/article' },
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
