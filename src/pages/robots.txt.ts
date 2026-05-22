import type { APIRoute } from 'astro';
import { isProd } from '../lib/env';

const productionRobots = `User-agent: *
Allow: /

Sitemap: https://wavy.pt/sitemap.xml
`;

const developmentRobots = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = () =>
  new Response(isProd ? productionRobots : developmentRobots, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
