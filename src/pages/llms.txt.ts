// O índice em português. A geração vive em src/lib/llms.ts, partilhada com a
// versão inglesa em src/pages/en/llms.txt.ts.
import type { APIRoute } from 'astro';
import { gerarLlmsTxt } from '../lib/llms';

export const GET: APIRoute = () =>
  new Response(gerarLlmsTxt('pt'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
