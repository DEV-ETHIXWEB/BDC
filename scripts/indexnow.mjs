// Tells Bing (and every other IndexNow engine: Yandex, Seznam, Naver, Yep) which pages changed, so they recrawl
// within minutes instead of waiting for the sitemap. Run it AFTER a production deploy is live:
//
//   npm run indexnow                 every URL in the live sitemap
//   npm run indexnow -- /path /other just these paths
//
// The key is public by design: IndexNow proves ownership by fetching https://<host>/<key>.txt, which is
// public/<key>.txt. Changing the key means renaming that file too. Google does not use IndexNow.
import { readdirSync } from 'node:fs';

const SITE = (process.env.PUBLIC_SITE_URL || 'https://www.bestdayscatching.com').replace(/\/$/, '');
const KEY = readdirSync(new URL('../public/', import.meta.url)).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.slice(0, -4);
if (!KEY) throw new Error('No IndexNow key file (public/<32 hex>.txt) found.');

const live = await fetch(`${SITE}/${KEY}.txt`).then((r) => (r.ok ? r.text() : ''));
if (live.trim() !== KEY) throw new Error(`${SITE}/${KEY}.txt is not live yet. Deploy first, then run this again.`);

async function sitemapUrls() {
  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const index = await fetch(`${SITE}/sitemap-index.xml`).then((r) => r.text());
  // The image sitemap repeats page URLs, so only the page sitemaps are read.
  const maps = locs(index).filter((u) => !u.includes('sitemap-images'));
  return [...new Set((await Promise.all(maps.map((u) => fetch(u).then((r) => r.text())))).flatMap(locs))];
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map((p) => new URL(p, SITE).href) : await sitemapUrls();

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
// 200 = accepted, 202 = accepted and the key is still being validated. Anything else is a real failure.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URL(s)`);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
