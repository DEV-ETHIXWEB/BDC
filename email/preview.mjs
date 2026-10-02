// Renders both templates with sample data so a change can be eyeballed in a browser.
// Writes to email/preview/, which is gitignored. Run `npx astro preview --port 4371` first
// if you want the crest to load; pass --local to rewrite the logo URL at the local server.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'preview');
const local = process.argv.includes('--local');

/** The subset of Handlebars the templates use: {{#if k}}a{{else}}b{{/if}} and {{k}}. */
function render(src, data) {
  let s = readFileSync(join(here, src), 'utf8');
  const block = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/;
  while (block.test(s)) {
    s = s.replace(block, (_m, key, inner) => {
      const [yes, no = ''] = inner.split('{{else}}');
      return data[key] ? yes : no;
    });
  }
  for (const [k, v] of Object.entries(data)) s = s.split(`{{${k}}}`).join(String(v));
  s = s.replace(/\{\{\w+\}\}/g, '');
  if (local) s = s.split('https://www.bdcguideservices.com/icon-512.png').join('http://localhost:4371/icon-512.png');
  return s;
}

// a complete booking-form request, and the thinnest payload any form can send
const SAMPLES = {
  full: {
    name: 'Marcus Webb', phone: '(503) 555-0148', email: 'marcus.webb@example.com',
    trip: 'Full Day Trip', guests: '4', date: 'Saturday 12 September 2026',
    message: 'Two of us have never fished for Chinook before. Is the full day the right call?',
    page: '/oregon-fishing-charter-rates', topics: '',
  },
  minimal: {
    name: 'Dana Ruiz', phone: '(503) 555-0199', trip: 'Not sure yet',
    email: '', guests: '', date: '', message: '', page: '/', topics: '',
  },
};

mkdirSync(out, { recursive: true });
let stray = 0;
for (const tpl of ['confirmation-to-guest', 'lead-to-captain']) {
  for (const [kind, data] of Object.entries(SAMPLES)) {
    for (const ext of ['html', 'txt']) {
      const body = render(`${tpl}.${ext}`, data);
      const left = body.match(/\{\{[^}]*\}\}/g);
      if (left) { stray += left.length; console.error(`  ! ${tpl}.${ext} (${kind}) left ${left.join(', ')}`); }
      writeFileSync(join(out, `${tpl}.${kind}.${ext}`), body);
    }
    console.log(`  rendered ${tpl} (${kind})`);
  }
}
console.log(stray ? `\n${stray} unresolved placeholder(s)` : '\nno unresolved placeholders');
console.log(`open ${join(out, 'confirmation-to-guest.full.html')}`);
process.exit(stray ? 1 : 0);
