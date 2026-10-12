// Last-modified date per route, taken from git history of the file that produces it.
//
// The sitemap had no <lastmod> at all, which leaves a crawler no way to tell a page that changed
// yesterday from one untouched for a year. Build time is the wrong answer: it would claim every
// page changed on every deploy, which is false and teaches Google to ignore the field. The honest
// source is the last commit that touched the page's own source file.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

// Vercel builds from a shallow clone, so `git log` for a file touched before the clone depth
// returns nothing and every date would quietly disappear in production, exactly where it matters.
// Falling back to file mtime would be worse than nothing: on a fresh checkout that is the build
// time, so the sitemap would claim every page changed on every deploy.
//
// So: whenever git history IS available (any local build), the computed dates are written to
// data/page-dates.json and committed. The build prefers live git and falls back to that snapshot.
// The snapshot is refreshed by the same builds that change the pages, so it cannot drift far.
const CACHE = 'data/page-dates.json';
const readCache = () => {
  try { return JSON.parse(readFileSync(CACHE, 'utf8')); } catch { return {}; }
};

const gitDate = (file) => {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, { encoding: 'utf8' }).trim();
    return out || null;
  } catch {
    return null;
  }
};

/** Last commit date for one file, or null. Exported so a page can state an honest dateModified. */
export function fileGitDate(file) {
  return gitDate(file);
}

/** route path (no leading slash, '' for home) -> ISO date */
export function pageDates() {
  const map = new Map();
  const cache = readCache();
  const add = (route, file) => {
    const d = gitDate(file) || cache[route] || null;
    if (d) map.set(route, d);
  };

  // src/pages/**.astro -> route
  const walk = (dir, prefix = '') => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) { walk(full, `${prefix}${e.name}/`); continue; }
      if (!e.name.endsWith('.astro')) continue;
      if (e.name.startsWith('[')) continue;            // dynamic routes are handled below
      const base = e.name.replace(/\.astro$/, '');
      add(base === 'index' ? prefix.replace(/\/$/, '') : `${prefix}${base}`, full);
    }
  };
  if (existsSync('src/pages')) walk('src/pages');

  // Markdown posts: prefer the front matter's own updated/published date over the commit, because
  // the author's stated date is the claim the page itself makes.
  const blog = 'src/content/blog';
  if (existsSync(blog)) {
    for (const f of readdirSync(blog)) {
      if (!f.endsWith('.md')) continue;
      const slug = f.replace(/\.md$/, '');
      const src = readFileSync(join(blog, f), 'utf8');
      const stated = (src.match(/^updated:\s*"?(\d{4}-\d{2}-\d{2})/m) || src.match(/^published:\s*"?(\d{4}-\d{2}-\d{2})/m))?.[1];
      const d = stated ? `${stated}T12:00:00Z` : (gitDate(join(blog, f)) || cache[`article/${slug}`]);
      if (d) map.set(`article/${slug}`, d);
    }
  }
  // Dynamic route groups. A trip or photo page is produced by a template plus a data file, so the
  // honest date is whichever of the two changed last.
  const newest = (...files) => {
    const ds = files.map(gitDate).filter(Boolean).sort();
    return ds.length ? ds[ds.length - 1] : null;
  };
  const groups = [
    { prefix: 'oregon-fishing-charter-rates/', tpl: 'src/pages/oregon-fishing-charter-rates/[slug].astro', data: 'src/data/trips.ts' },
    { prefix: 'oregon-fishing-charter-photos/', tpl: 'src/pages/oregon-fishing-charter-photos/[slug].astro', data: 'src/data/photos.ts' },
  ];
  for (const g of groups) {
    const d = newest(g.tpl, g.data) || cache[`group:${g.prefix}`];
    if (d) map.set(`group:${g.prefix}`, d);
  }

  // Refresh the snapshot whenever this build had real history to work from.
  if (gitDate('package.json')) {
    try {
      mkdirSync(dirname(CACHE), { recursive: true });
      writeFileSync(CACHE, `${JSON.stringify(Object.fromEntries([...map].sort()), null, 2)}\n`);
    } catch { /* a read-only CI filesystem is fine: the committed snapshot is already in use */ }
  }
  return map;
}

/** The date for a route, falling back to its dynamic group when the route has no file of its own. */
export function dateFor(map, route) {
  if (map.has(route)) return map.get(route);
  for (const [key, value] of map) {
    if (key.startsWith('group:') && route.startsWith(key.slice(6))) return value;
  }
  return null;
}
