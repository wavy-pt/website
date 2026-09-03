// ============================================================
// As rotas que têm equivalente Markdown — fonte única
// ------------------------------------------------------------
// Esta lista precisa de existir em três sítios: os `redirects` do vercel.json
// (a negociação por `Accept:`), os `headers` do vercel.json (o `Link` que
// anuncia o .md) e o mapa de conteúdo em `[...pagina].md.ts`.
//
// Divergirem não dá erro por si só — dá um Markdown que ninguém anuncia, ou
// pior, um cabeçalho `Link` a apontar para um 404 que fomos nós a criar. Por
// isso a lista vive aqui e o endpoint compara-a com o vercel.json no build:
// se algum dos dois blocos divergir, o build FALHA em vez de ficar em silêncio.
//
// AS PÁGINAS LEGAIS NÃO ESTÃO AQUI, de propósito (/privacidade, /en/privacy):
// o texto delas está inline nos `.astro` e não no i18n, pelo que não há fonte
// de onde compor o Markdown sem raspar HTML.
// ============================================================

/** Rota canónica (sem barra final; `/` para a homepage) → caminho do Markdown. */
export const ROTAS_MD: Record<string, string> = {
  '/': '/index.md',
  '/servicos': '/servicos.md',
  '/sobre': '/sobre.md',
  '/casos': '/casos.md',
  '/contacto': '/contacto.md',
  '/en': '/en.md',
  '/en/servicos': '/en/servicos.md',
  '/en/sobre': '/en/sobre.md',
  '/en/casos': '/en/casos.md',
  '/en/contacto': '/en/contacto.md',
};

/** A rota escrita como o endpoint a espera em `params.pagina` (sem barra inicial). */
export const rotaParaParam = (rota: string): string =>
  rota === '/' ? 'index' : rota.replace(/^\//, '');
