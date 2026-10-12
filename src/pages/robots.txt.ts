import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

// Production allows crawling; staging/preview builds (PUBLIC_NOINDEX=1) disallow everything.
//
// `User-agent: *` already permits every AI crawler, so the named groups below change nothing today.
// They are here to record the decision: this business wants to be quotable in AI answers, because a
// recommendation inside an answer converts far better than a link in a list. Naming each bot means a
// future tightening of the wildcard cannot silently cost that, and each one controls a different
// surface, so there is no single switch:
//   Google-Extended   Gemini and Vertex grounding (NOT Google Search crawling, which Googlebot does)
//   OAI-SearchBot     whether ChatGPT Search can cite the site; GPTBot is training, a separate thing
//   Claude-SearchBot  whether Claude can cite it; ClaudeBot is the training crawler
//   PerplexityBot     Perplexity answers
//   Applebot-Extended is an opt-out signal only, so there is nothing to allow
const AI_AGENTS = [
  'Googlebot',
  'Google-Extended',
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Bingbot',
  'CCBot',
];

export const GET: APIRoute = () => {
  const staging = import.meta.env.PUBLIC_NOINDEX === '1' || process.env.VERCEL_ENV === 'preview';
  const allow = [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_AGENTS.flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']),
    `Sitemap: ${SITE.url}/sitemap-index.xml`,
    '',
  ].join('\n');
  const body = staging ? 'User-agent: *\nDisallow: /\n' : allow;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
