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

/**
 * Quantos casos estão PUBLICADOS.
 *
 * O i18n tem mais casos do que a página mostra: o 3.º (a Ana) está em standby.
 * Este número estava decidido em quatro sítios — os índices fixos em casos.astro
 * e en/casos.astro, o `page.cards.length` no gerador dos .md, e o
 * `items.length` no CasesHero, que contava pelo lado errado (3 em vez de 2).
 * Hoje coincidiam por acaso; no dia em que o 3.º caso for ligado, quem só
 * acrescentasse o cartão ao i18n ficava com os ficheiros para agentes de IA a
 * anunciar três casos e a página a mostrar dois — sem erro nenhum no build.
 *
 * PARA PUBLICAR O 3.º CASO: mudar aqui para 3, e repor os imports das imagens
 * em CaseStudy.astro (ver o comentário no imageMap desse ficheiro).
 */
export const CASOS_PUBLICADOS = 2;

/** A rota escrita como o endpoint a espera em `params.pagina` (sem barra inicial). */
export const rotaParaParam = (rota: string): string =>
  rota === '/' ? 'index' : rota.replace(/^\//, '');
