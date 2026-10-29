import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../data/site';
import { TRIPS } from '../data/trips';
import { SEASONS, rangeLabel, SEASON_START } from '../data/seasons';
import { ARTICLES } from '../data/articles';

// A curated map of the site for language models, per the llms.txt community proposal.
//
// Worth being straight about what this is: Google has said AI-text files like this are not used by
// Search, and no major provider has confirmed reading one, so it is not a ranking lever and must
// never be sold as one. It is cheap, it cannot hurt, and it may help the systems that do read it.
// The real work for AI answers is elsewhere: server-rendered HTML, clean headings, direct answers
// near the top of the page, and correct schema. This file is generated from the same data as those
// pages, so it cannot drift out of date the way a hand-written copy would.
export const GET: APIRoute = async () => {
  const staging = import.meta.env.PUBLIC_NOINDEX === '1' || process.env.VERCEL_ENV === 'preview';
  if (staging) return new Response('', { status: 404 });

  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .map((p) => ({ slug: p.id, title: p.data.title, description: p.data.description }));

  const money = (n: number) => `$${n}`;
  const lines = [
    `# ${SITE.name}`,
    '',
    `> Guided fishing and Dungeness crab charters in Oregon with ${SITE.captain}, who has fished these waters for over 45 years. Trips run on the Columbia, Willamette, Wilson, Trask, Sandy, Clackamas and Nestucca rivers and the Oregon coast. Rods, reels, bait and all fishing gear are included; guests need their own Oregon fishing license. The season opens ${SEASON_START}.`,
    '',
    '## Key facts',
    '',
    `- ${SITE.captain}, US Coast Guard certified, fully licensed and insured`,
    `- Phone: ${SITE.phone}`,
    `- Email: ${SITE.email}`,
    `- Service area: ${SITE.regionName}, ${SITE.country}. No public street address: the meeting point is given when you book, because it changes with the season and the river.`,
    `- Boats: 22 foot Willie Predator (up to 6 anglers, often limited to 4) and a 16 foot Alumaweld drift boat (up to 3 guests)`,
    `- Trips can start as early as 4:00 AM, most often for salmon`,
    `- An Oregon fishing license is required at age 12 and over, plus a Columbia River Basin Endorsement for salmon, steelhead and sturgeon in the Columbia basin`,
    '',
    '## Seasons',
    '',
    ...SEASONS.map((s) => `- ${s.name}: ${rangeLabel(s)}${s.approximate ? ' (not yet confirmed by the captain)' : ''}${s.note ? `. ${s.note}` : ''}`),
    '',
    '## Trips and rates',
    '',
    ...TRIPS.map((t) => `- [${t.name}](${SITE.url}/oregon-fishing-charter-rates/${t.slug}): ${t.hours} hours, ${money(t.price)} per person, up to ${t.capacity} guests, ${t.boatSpec}`),
    '',
    '## Blogs',
    '',
    ...posts.map((p) => `- [${p.title}](${SITE.url}/article/${p.slug}): ${p.description}`),
    ...ARTICLES.map((a) => `- [${a.title}](${SITE.url}/article/${a.slug}): ${a.description}`),
    '',
    '## Pages',
    '',
    `- [Trips and rates](${SITE.url}/oregon-fishing-charter-rates)`,
    `- [Target species](${SITE.url}/oregon-fishing-species)`,
    `- [Meet the captain](${SITE.url}/captain-clinton-mcculloch-of-oregon)`,
    `- [Fishing FAQs](${SITE.url}/fishing-faqs)`,
    `- [Fishing reports](${SITE.url}/oregon-fishing-reports)`,
    `- [Gallery](${SITE.url}/oregon-fishing-charter-photos)`,
    `- [Reviews](${SITE.url}/oregon-fishing-charter-reviews)`,
    `- [Contact](${SITE.url}/contact-us)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
