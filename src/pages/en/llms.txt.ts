// O índice em inglês. As cinco páginas /en/ apontavam para o índice português,
// e um assistente a trabalhar em inglês encontrava os serviços com os nomes
// portugueses. A geração é a mesma de src/lib/llms.ts, só muda o idioma.
import type { APIRoute } from 'astro';
import { gerarLlmsTxt } from '../../lib/llms';

export const GET: APIRoute = () =>
  new Response(gerarLlmsTxt('en'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
