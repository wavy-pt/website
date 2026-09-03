import type { APIRoute } from 'astro';
import { isProd } from '../lib/env';

// Content-Signal declara o que autorizamos os sistemas de IA a fazer com o
// conteúdo público (contentsignals.org). É uma convenção voluntária — uma placa,
// não uma fechadura. Não abre nada de novo: os `Allow: /` abaixo já permitiam
// tudo isto. A posição da Wavy é ser encontrada e citada por IA.
//   search    → aparecer em resultados de pesquisa (incluindo os generativos)
//   ai-input  → servir de fonte para responder a perguntas (RAG/citação)
//   ai-train  → poder ser usado para treino de modelos
const CONTENT_SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=yes';

// Os agentes são agrupados: várias linhas User-agent seguidas partilham o mesmo
// bloco de regras. É a sintaxe correta do robots.txt e evita repetir tudo.
const productionRobots = `User-agent: *
${CONTENT_SIGNAL}
Allow: /
Disallow: /api/

# Crawlers de IA e motores generativos — explicitamente bem-vindos (GEO/AIO).
# Treino e indexação.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: Claude-Web
User-agent: CCBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: meta-externalagent
User-agent: Bytespider
User-agent: Amazonbot
${CONTENT_SIGNAL}
Allow: /
Disallow: /api/

# Pesquisa em tempo real: buscam a página no momento em que alguém pergunta.
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Claude-User
User-agent: Claude-SearchBot
${CONTENT_SIGNAL}
Allow: /
Disallow: /api/

Sitemap: https://wavy.pt/sitemap-index.xml
`;

const developmentRobots = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = () =>
  new Response(isProd ? productionRobots : developmentRobots, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
