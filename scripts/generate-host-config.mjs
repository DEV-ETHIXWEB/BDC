// Generates vercel.json, public/_headers and public/_redirects from config/*.mjs so the hosts cannot drift apart.
// Runs automatically before every build (see "prebuild" in package.json).
import { writeFileSync } from 'node:fs';
import { REDIRECTS } from '../config/redirects.mjs';
import { SECURITY_HEADERS, IMMUTABLE } from '../config/headers.mjs';

const cell = (h) => Object.entries(h).map(([key, value]) => ({ key, value }));

const vercel = {
  framework: 'astro',
  installCommand: 'npm install',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  cleanUrls: true,
  trailingSlash: false,
  redirects: REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true })),
  headers: [
    { source: '/(.*)', headers: cell(SECURITY_HEADERS) },
    { source: '/_astro/(.*)', headers: [{ key: 'Cache-Control', value: IMMUTABLE }] },
  ],
};
writeFileSync(new URL('../vercel.json', import.meta.url), JSON.stringify(vercel, null, 2) + '\n');

const headers = ['/*', ...Object.entries(SECURITY_HEADERS).map(([k, v]) => `  ${k}: ${v}`), '/_astro/*', `  Cache-Control: ${IMMUTABLE}`, ''].join('\n');
writeFileSync(new URL('../public/_headers', import.meta.url), headers);

const redirects = REDIRECTS.map(([from, to]) => `${from} ${to} 301`).join('\n') + '\n';
writeFileSync(new URL('../public/_redirects', import.meta.url), redirects);

console.log(`host config written: ${REDIRECTS.length} redirects, ${Object.keys(SECURITY_HEADERS).length} security headers`);
