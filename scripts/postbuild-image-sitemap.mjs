// Builds dist/sitemap-images.xml from what actually shipped, and lists it in the sitemap index.
//
// Why after the build rather than in the sitemap integration: Astro content-hashes every image, so
// the real URLs only exist once the build has run. Reading them back out of the HTML is the only
// way to be certain the sitemap points at files that exist.
//
// Why bother: this is a fishing charter. People search for pictures of fish, and the gallery is 16
// pages of real catch photos with honest alt text. Google Images cannot index what it is not told
// about, and the main sitemap carries page URLs only.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITE = (process.env.PUBLIC_SITE_URL || 'https://www.bestdayscatching.com').replace(/\/$/, '');

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const pageUrl = (file) => {
  const rel = file.slice(DIST.length).replace(/\\/g, '/').replace(/\.html$/, '');
  return `${SITE}${rel === '/index' ? '' : rel}`;
};

const entries = [];
for (const file of walk(DIST)) {
  // Only the gallery: its pages are each about one photograph, which is exactly what an image
  // sitemap is for. Listing the same logo on all 42 pages would be noise.
  if (!file.includes('oregon-fishing-charter-photos')) continue;
  const html = readFileSync(file, 'utf8');
  const og = html.match(/property="og:image"\s+content="([^"]+)"/);
  if (!og) continue;
  const img = og[1].startsWith('http') ? og[1] : `${SITE}${og[1]}`;
  // The caption is the page's own alt text, which describes only what is visible, per the
  // project's rule about never claiming a river or a species that was not verified.
  const alt = html.match(/<img[^>]+src="\/_astro\/[^"]+"[^>]*alt="([^"]+)"/);
  const title = html.match(/<title>([^<]*)</);
  entries.push({
    page: pageUrl(file),
    img,
    caption: alt?.[1]?.trim() || '',
    title: title?.[1]?.split('|')[0]?.trim() || '',
  });
}

if (!entries.length) {
  console.log('image sitemap: no gallery pages found, nothing written');
  process.exit(0);
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...entries.map((e) => [
    '<url>',
    `<loc>${esc(e.page)}</loc>`,
    '<image:image>',
    `<image:loc>${esc(e.img)}</image:loc>`,
    e.caption ? `<image:caption>${esc(e.caption)}</image:caption>` : '',
    e.title ? `<image:title>${esc(e.title)}</image:title>` : '',
    '</image:image>',
    '</url>',
  ].filter(Boolean).join('')),
  '</urlset>',
  '',
].join('\n');
writeFileSync(join(DIST, 'sitemap-images.xml'), xml);

// Add it to the index, if it is not already listed.
const idxPath = join(DIST, 'sitemap-index.xml');
if (existsSync(idxPath)) {
  let idx = readFileSync(idxPath, 'utf8');
  if (!idx.includes('sitemap-images.xml')) {
    const now = new Date().toISOString();
    idx = idx.replace('</sitemapindex>', `<sitemap><loc>${SITE}/sitemap-images.xml</loc><lastmod>${now}</lastmod></sitemap></sitemapindex>`);
    writeFileSync(idxPath, idx);
  }
}
console.log(`image sitemap: ${entries.length} images, listed in sitemap-index.xml`);
