import type { APIRoute } from 'astro';
import { isProd } from '../lib/env';

const productionRobots = `User-agent: *
Allow: /

# Crawlers de IA e motores generativos — explicitamente bem-vindos (GEO/AIO)
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://wavy.pt/sitemap-index.xml
`;

const developmentRobots = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = () =>
  new Response(isProd ? productionRobots : developmentRobots, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
