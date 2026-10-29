// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { REDIRECTS } from './config/redirects.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { pageDates, dateFor } from './scripts/page-dates.mjs';
import { satteri } from '@astrojs/markdown-satteri';
import { articleFurniture } from './scripts/article-furniture.mjs';

/** custom hydration strategy `client:late` (see src/scripts/late-directive.js) */
/** @type {import('astro').AstroIntegration} */
const lateDirective = {
  name: 'bdc-late-directive',
  hooks: { 'astro:config:setup': ({ addClientDirective }) => addClientDirective({ name: 'late', entrypoint: './src/scripts/late-directive.js' }) },
};

// Resolved once at config time: one git call per file rather than one per sitemap entry.
const DATES = pageDates();

// Draft posts are built, but they carry noindex and are left out of the blogs index, so listing
// them in the sitemap would be asking a crawler to fetch a page that tells it to go away.
const DRAFTS = new Set(
  readdirSync('./src/content/blog')
    .filter((f) => f.endsWith('.md'))
    .filter((f) => /^draft:\s*true\s*$/m.test(readFileSync(`./src/content/blog/${f}`, 'utf8').split('---')[1] || ''))
    .map((f) => `/article/${f.replace(/\.md$/, '')}`)
);

export default defineConfig({
  // Static fallback (meta-refresh pages). Hosts also get real 301s from vercel.json / public/_redirects.
  redirects: Object.fromEntries(REDIRECTS),
  // The live domain. Canonicals, og:url, JSON-LD and the sitemap all derive from this, so it must match the
  // domain the site is actually served from or Search Console rejects the sitemap as cross-domain.
  // Override with PUBLIC_SITE_URL if the site moves (e.g. back to bdcguideservices.com).
  site: process.env.PUBLIC_SITE_URL || 'https://www.bestdayscatching.com',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [
    react(),
    lateDirective,
    sitemap({
      filter: (p) => !p.endsWith('/404') && !p.endsWith('/sitemap') && !p.includes('/dev/') && !DRAFTS.has(new URL(p).pathname),
      // Every URL carries a real <lastmod>, taken from the last commit that touched the file
      // behind it (or the post's own stated date). Without it a crawler cannot tell a page that
      // changed yesterday from one untouched for a year, and recency is what AI answers favour.
      serialize(item) {
        const route = new URL(item.url).pathname.replace(/^\/|\/$/g, '');
        const d = dateFor(DATES, route);
        if (d) item.lastmod = new Date(d).toISOString();
        return item;
      },
    }),
  ],
  // Scripts must be external files: inline module scripts make Astro's ClientRouter inject a data: script, which a strict CSP blocks.
  vite: { build: { assetsInlineLimit: 0 } },
  // Markdown posts get figures, captions and scroll reveals from one plugin, so an author writes
  // plain markdown and still gets the furniture the hand-built pages have.
  markdown: { processor: satteri({ hastPlugins: [articleFurniture] }) },
  image: { layout: 'constrained' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
