// Single source of truth for redirects. Consumed by astro.config.mjs (static fallback) and
// scripts/generate-host-config.mjs (real 301s for Vercel / Netlify / Cloudflare Pages).
// Every page of the previous site's sitemap.xml now exists at the same URL (qa/old_site_parity.py checks this),
// so nothing needs redirecting. Add [from, to] pairs here if a URL is ever retired.
// NOTE: never add a redirect that differs only by letter case (e.g. /Oregon-fishing-Charter-rates): it overwrites the
// real page on case-insensitive file systems (macOS/Windows builds) and can loop on case-insensitive hosts.
/** @type {Array<[string, string]>} */
export const REDIRECTS = [];
