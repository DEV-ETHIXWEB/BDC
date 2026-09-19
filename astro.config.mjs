// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

/** custom hydration strategy `client:late` (see src/scripts/late-directive.js) */
const lateDirective = {
  name: 'bdc-late-directive',
  hooks: { 'astro:config:setup': ({ addClientDirective }) => addClientDirective({ name: 'late', entrypoint: './src/scripts/late-directive.js' }) },
};

export default defineConfig({
  site: 'https://www.bdcguideservices.com',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [react(), lateDirective, sitemap({ filter: (p) => !p.endsWith('/404') && !p.endsWith('/sitemap') && !p.includes('/dev/') })],
  vite: { build: { assetsInlineLimit: 12000 } }, // inline the small motion runtime: no extra request before hero reveal
  image: { layout: 'constrained' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
