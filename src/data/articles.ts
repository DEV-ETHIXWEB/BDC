// The two articles on the previous site (both published Jul 10, 2026); descriptions are that site's own meta text.
export const ARTICLES = [
  {
    slug: 'things-to-do-in-oregon',
    title: 'Things To Do In Oregon',
    description: 'Discover top things to do in Oregon, including parks, dining, and family activities. Plan your trip and explore the best Oregon attractions today.',
    published: '2026-07-10',
    icon: 'mountain',
  },
  {
    slug: 'get-your-valid-oregon-fishing-license',
    title: 'Get Your Valid Oregon Fishing License',
    description: 'Learn how to get an Oregon fishing license, costs, rules, and requirements for anglers. Plan your trip with confidence before fishing Oregon waters.',
    published: '2026-07-10',
    icon: 'license',
  },
] as const;

export const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
