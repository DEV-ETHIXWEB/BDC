// Last-modified date per route, taken from git history of the file that produces it.
//
// The sitemap had no <lastmod> at all, which leaves a crawler no way to tell a page that changed
// yesterday from one untouched for a year. Build time is the wrong answer: it would claim every
// page changed on every deploy, which is false and teaches Google to ignore the field. The honest
// source is the last commit that touched the page's own source file.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  const add = (route, file) => {
    const d = gitDate(file);
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
      const d = stated ? `${stated}T12:00:00Z` : gitDate(join(blog, f));
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
    const d = newest(g.tpl, g.data);
    if (d) map.set(`group:${g.prefix}`, d);
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
