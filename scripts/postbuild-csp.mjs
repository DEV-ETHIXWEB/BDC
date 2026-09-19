// Generates a Content-Security-Policy from the BUILT pages and applies it two ways:
//   1. as a header line appended to dist/_headers (Netlify, Cloudflare Pages), including frame-ancestors;
//   2. as a <meta http-equiv> tag in every page (works on any host, incl. Vercel where headers are read before the build).
// (No upgrade-insecure-requests: HTTPS is enforced by HSTS/the host, and the directive breaks http://localhost previews in Safari.)
// Scripts: 'self' plus a SHA-256 hash of every inline <script> across ALL pages. The union is required because Astro's
// ClientRouter swaps pages without reloading, so scripts of the next page run under the first page's policy.
// Styles allow 'unsafe-inline' (inline style="" attributes and a style injected at runtime by react-aria): the script policy
// is what stops XSS. Nothing external is allowed, except the form endpoint origin when PUBLIC_FORM_ENDPOINT is set.
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });
const pages = walk(DIST);

const hashes = new Set();
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs) || /type\s*=\s*["']?application\/ld\+json/i.test(attrs)) continue;
    if (!m[2].trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`);
  }
}

let connect = "'self'";
const endpoint = process.env.PUBLIC_FORM_ENDPOINT?.trim();
if (endpoint) { try { connect += ` ${new URL(endpoint).origin}`; } catch { /* validated by check-env.mjs */ } }

const base = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].sort().join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src ${connect}`,
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];
const metaPolicy = base.join('; ');                       // frame-ancestors is ignored (and warned about) in <meta>
const headerPolicy = [...base, "frame-ancestors 'none'"].join('; ');

// 1. header file
const headersPath = join(DIST, '_headers');
if (existsSync(headersPath)) {
  const cur = readFileSync(headersPath, 'utf8');
  writeFileSync(headersPath, cur.replace(/^\/\*\n/, `/*\n  Content-Security-Policy: ${headerPolicy}\n`));
}

// 2. meta tag in every page (first thing in <head>, before any script can run)
let n = 0;
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;
  const out = html.replace(/<head([^>]*)>/i, `<head$1><meta http-equiv="Content-Security-Policy" content="${metaPolicy.replace(/"/g, '&quot;')}">`);
  if (out !== html) { writeFileSync(file, out); n++; }
}
console.log(`CSP: ${hashes.size} inline-script hashes, applied to ${n}/${pages.length} pages and dist/_headers`);
