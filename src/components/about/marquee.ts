/**
 * Os três formatos de cartão do carrossel decorativo de /sobre.
 *
 * Vive num .ts e não no .astro porque o frontmatter de um componente Astro só
 * aceita `export` para getStaticPaths e prerender — um `export type` faz o
 * esbuild recusar o ficheiro.
 *
 * Antes disto o array era `readonly any[]`, o único `any` do projeto, e era
 * precisamente aqui que a verificação de tipos fazia falta: os dados misturam
 * três formatos e trazem um campo booleano (`small`). Escrever `{item.small}`
 * em vez de o usar como condição imprimia "true" no ecrã sem aviso nenhum.
 */
export type CorCartao = 'cream' | 'teal' | 'teal-deep';

export type CartaoMarquee =
  | { type: 'image'; imageKey?: 'hero' | 'bastidores'; cardColor?: CorCartao }
  | { type: 'stat'; label: string; number: string; sublabel?: string; small?: boolean; cardColor?: CorCartao }
  | { type: 'text'; title: string; body: string; cardColor?: CorCartao };
