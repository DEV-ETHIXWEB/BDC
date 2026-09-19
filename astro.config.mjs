// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { REDIRECTS } from './config/redirects.mjs';

/** custom hydration strategy `client:late` (see src/scripts/late-directive.js) */
/** @type {import('astro').AstroIntegration} */
const lateDirective = {
  name: 'bdc-late-directive',
  hooks: { 'astro:config:setup': ({ addClientDirective }) => addClientDirective({ name: 'late', entrypoint: './src/scripts/late-directive.js' }) },
};

export default defineConfig({
  // Static fallback (meta-refresh pages). Hosts also get real 301s from vercel.json / public/_redirects.
  redirects: Object.fromEntries(REDIRECTS),
  site: 'https://www.bdcguideservices.com',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [react(), lateDirective, sitemap({ filter: (p) => !p.endsWith('/404') && !p.endsWith('/sitemap') && !p.includes('/dev/') })],
  // Scripts must be external files: inline module scripts make Astro's ClientRouter inject a data: script, which a strict CSP blocks.
  vite: { build: { assetsInlineLimit: 0 } },
  image: { layout: 'constrained' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
