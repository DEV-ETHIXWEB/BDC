import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

// Production allows crawling; staging/preview builds (PUBLIC_NOINDEX=1) disallow everything.
export const GET: APIRoute = () => {
  const staging = import.meta.env.PUBLIC_NOINDEX === '1' || process.env.VERCEL_ENV === 'preview';
  const body = staging
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
