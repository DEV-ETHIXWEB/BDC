import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { ICONS } from './components/icons/paths';

// Blog posts live as Markdown in src/content/blog/*.md so a new post needs no developer:
// drop in a file, fill the front matter, commit. The two original articles from the previous
// site stay as hand-built .astro pages (static routes win over [slug], so their URLs are
// untouched) because they carry bespoke tables of contents and section icons.
// YAML gives us a Date for an unquoted date and a string for a quoted one. Either becomes YYYY-MM-DD.
const isoDate = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be written YYYY-MM-DD'), z.date()])
  .transform((v) => (typeof v === 'string' ? v : v.toISOString().slice(0, 10)));

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().min(1).max(70),
    // Shown on the article index and used as the meta description, so keep it under ~160 characters.
    description: z.string().min(1).max(200),
    // Publication date, written as YYYY-MM-DD. YAML turns a bare 2026-10-11 into a Date and a
    // quoted "2026-10-11" into a string, so accept either and normalise: an author should not
    // have to remember quotes. Stored as a plain string so the shared helpers format it in UTC
    // and the displayed day never shifts with the build machine's timezone.
    published: isoDate,
    updated: isoDate.optional(),
    // Card icon on the article index.
    icon: z.custom<keyof typeof ICONS>((v) => typeof v === 'string' && v in ICONS, 'unknown icon name').default('report'),
    tag: z.string().max(40).default('From the captain'),
    // A draft is built locally but left out of the index, the sitemap and search engines.
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
