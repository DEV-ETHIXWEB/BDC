// Single source of truth for redirects. Every URL below was listed in the OLD site's sitemap.xml
// (https://www.bdcguideservices.com/sitemap.xml) or linked from its pages, and has no page of the same
// path on the new site. Consumed by astro.config.mjs (static fallback) and scripts/generate-host-config.mjs
// (real 301s for Vercel / Netlify / Cloudflare Pages).
export const REDIRECTS = [
  // old article index and profile pages
  ['/article', '/'],
  ['/profile/clinton-mcculloch', '/captain-clinton-mcculloch-of-oregon'],
  // NOTE: the old home page linked a mixed-case /Oregon-fishing-Charter-rates. It is deliberately NOT redirected:
  // a redirect that differs only by letter case overwrites the real page on case-insensitive file systems
  // (macOS/Windows builds) and can loop on case-insensitive hosts. The lower-case URL is the indexed one.
  // the old site had one page per gallery photo; the new gallery is a single page with a lightbox
  ['/oregon-fishing-charter-photos/clackamas-fishing-catch-rocky-shore-2308', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-rainbow-trout-catch-2389', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-fishing-boat-catch-2366', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-chinook-salmon-catch-2475', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/fishing-boat-clackamas-oregon-stream-2433', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/fishing-boat-clackamas-water-ready-2262', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-coho-salmon-fishing-catch-2454', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-chinook-salmon-catch-2532', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-salmon-fishing-boat-catch-2417', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-salmon-fishing-boat-2443', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-oregon-salmon-fishing-2394', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/trout-fishing-clackamas-oregon-catch-2335', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-coho-salmon-catch-2346', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-fishing-boat-catch-2326', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/dungeness-crab-bucket-clackamas-2297', '/oregon-fishing-charter-photos'],
  ['/oregon-fishing-charter-photos/clackamas-chinook-salmon-catch-2495', '/oregon-fishing-charter-photos'],
];
