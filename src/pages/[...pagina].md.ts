// ============================================================
// /<pagina>.md — o equivalente Markdown de cada página
// ------------------------------------------------------------
// Um agente que encontra `/servicos` pede `/servicos.md` e recebe o mesmo
// conteúdo em texto, sem ter de interpretar HTML cheio de classes de Tailwind.
//
// A NEGOCIAÇÃO POR `Accept:` É A OUTRA METADE e está no vercel.json: quem envia
// `Accept: text/markdown` a `/servicos` recebe um 307 para cá. Tem de ser um
// `redirect` e NÃO um `rewrite` — na Vercel os rewrites são avaliados depois do
// sistema de ficheiros, e como `/servicos` existe como ficheiro estático a
// reescrita nunca seria alcançada. (Medido no site da ADDS, não deduzido.)
//
// O conteúdo vem do i18n através de `conteudo-md.ts`, nunca do HTML construído.
// ============================================================

import { readFileSync } from 'node:fs';
import type { APIRoute, GetStaticPaths } from 'astro';
import type { Lang } from '../i18n';
import { ROTAS_MD, rotaParaParam } from '../lib/paginas-md';
import {
  bloco,
  juntar,
  secaoCasos,
  secaoContacto,
  secaoFaq,
  secaoMetodo,
  secaoParaQuem,
  secaoResultados,
  secaoServicos,
  secaoServicosDetalhe,
  strings,
  type Strings,
} from '../lib/conteudo-md';

export const prerender = true;

type Def = {
  titulo: (s: Strings) => string;
  corpo: (s: Strings, lang: Lang) => string;
};

/**
 * O que cada página leva. Espelha a página real: quem pede `/servicos.md` deve
 * receber o que está em `/servicos`, e não o site todo.
 *
 * O título é o H1 do i18n e não o `title=` de SEO fixo no `.astro` — copiar
 * essa prosa para aqui criava uma segunda cópia, que diverge sempre.
 */
const PAGINAS: Record<string, Def> = {
  '/': {
    titulo: (s) => s.hero.headline,
    corpo: (s, l) =>
      bloco(
        s.hero.subtitle,
        secaoParaQuem(s),
        secaoServicos(s),
        secaoResultados(s),
        secaoFaq(s.faq),
        secaoContacto(s, l)
      ),
  },
  '/servicos': {
    titulo: (s) => juntar(s.servicesPage.hero.headline, s.servicesPage.hero.headlineHighlight),
    corpo: (s, l) =>
      bloco(
        s.servicesPage.hero.subtitle,
        secaoMetodo(s),
        secaoServicosDetalhe(s, l),
        secaoFaq(s.servicesPage.faq)
      ),
  },
  '/sobre': {
    titulo: (s) => juntar(s.aboutPage.hero.headline, s.aboutPage.hero.headlineHighlight),
    corpo: (s) => bloco(s.aboutPage.hero.subtitle, secaoSobreSeguro(s)),
  },
  '/casos': {
    titulo: (s) =>
      juntar(s.casesPage.page.titleLine1, s.casesPage.page.titleLine2, s.casesPage.page.titleLine3),
    corpo: (s) => bloco(s.casesPage.page.subtitle, secaoCasos(s)),
  },
  '/contacto': {
    titulo: (s) => s.contactPage.page.title,
    corpo: (s, l) => bloco(s.contactPage.page.subtitle, secaoContacto(s, l, false)),
  },
};

// `secaoSobre` importada com nome próprio para manter a lista de imports acima
// alfabética e legível; sem isto o import solto no meio passava despercebido.
import { secaoSobre as secaoSobreSeguro } from '../lib/conteudo-md';

/** A rota PT equivalente a uma rota EN (`/en/sobre` → `/sobre`, `/en` → `/`). */
const rotaBase = (rota: string): string =>
  rota === '/en' ? '/' : rota.startsWith('/en/') ? rota.replace('/en', '') : rota;

export const getStaticPaths: GetStaticPaths = () => {
  const declaradas = Object.keys(ROTAS_MD);

  // Guarda 1 — toda a rota declarada tem conteúdo definido.
  const semConteudo = declaradas.filter((r) => !PAGINAS[rotaBase(r)]);
  if (semConteudo.length) {
    throw new Error(
      `ROTAS_MD declara rotas sem conteúdo em PAGINAS: ${semConteudo.join(', ')}`
    );
  }

  // Guarda 2 — o vercel.json tem de conhecer exatamente as mesmas rotas, nos
  // dois blocos. Divergir daria um .md que ninguém anuncia, ou um cabeçalho
  // Link a apontar para um 404. Falha o build em vez de ficar em silêncio.
  let vercel: {
    redirects?: { destination?: string }[];
    headers?: { source?: string; headers?: { key: string; value: string }[] }[];
  };
  try {
    vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
  } catch {
    throw new Error('Não foi possível ler o vercel.json para validar as rotas .md');
  }

  const esperados = new Set(Object.values(ROTAS_MD));

  const nosRedirects = new Set(
    (vercel.redirects ?? []).map((r) => r.destination).filter((d): d is string => !!d?.endsWith('.md'))
  );
  const nosHeaders = new Set(
    (vercel.headers ?? [])
      .flatMap((b) => b.headers ?? [])
      .filter((h) => h.key.toLowerCase() === 'link')
      .flatMap((h) => [...h.value.matchAll(/<([^>]+\.md)>/g)].map((m) => m[1]))
  );

  const diff = (a: Set<string>, b: Set<string>) => [...a].filter((x) => !b.has(x));
  const problemas = [
    ...diff(esperados, nosRedirects).map((r) => `sem redirect de negociação: ${r}`),
    ...diff(nosRedirects, esperados).map((r) => `redirect a mais no vercel.json: ${r}`),
    ...diff(esperados, nosHeaders).map((r) => `sem cabeçalho Link: ${r}`),
    ...diff(nosHeaders, esperados).map((r) => `Link a apontar para .md inexistente: ${r}`),
  ];
  // Guarda 3 — cada rota tem de anunciar o índice do SEU idioma. As cinco
  // páginas inglesas apontavam para o /llms.txt português, e um assistente a
  // trabalhar em inglês encontrava os serviços com os nomes portugueses.
  for (const bloco of vercel.headers ?? []) {
    const link = (bloco.headers ?? []).find((h) => h.key.toLowerCase() === 'link');
    if (!link) continue;
    const declarado = link.value.match(/<([^>]*llms\.txt)>;\s*rel="describedby"/)?.[1];
    if (!declarado) continue;
    const esperado = bloco.source?.startsWith('/en') ? '/en/llms.txt' : '/llms.txt';
    if (declarado !== esperado) {
      problemas.push(
        `${bloco.source} anuncia ${declarado} em rel="describedby"; devia ser ${esperado}`
      );
    }
  }

  if (problemas.length) {
    throw new Error(`vercel.json divergente de ROTAS_MD:\n  - ${problemas.join('\n  - ')}`);
  }

  return declaradas.map((rota) => ({
    params: { pagina: rotaParaParam(rota) },
    props: { rota, lang: (rota === '/en' || rota.startsWith('/en/') ? 'en' : 'pt') as Lang },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { rota, lang } = props as { rota: string; lang: Lang };
  const s = strings(lang);
  const def = PAGINAS[rotaBase(rota)];
  const url = `https://wavy.pt${rota === '/' ? '/' : rota}`;

  const nota =
    lang === 'en'
      ? 'Text version of this page, generated at build time from the same sources the page itself uses. The site index is at /llms.txt. Use permitted with attribution.'
      : 'Versão em texto desta página, gerada no build a partir das mesmas fontes que a página usa. O índice do site está em /llms.txt. Utilização permitida com atribuição.';

  const cabecalho = bloco(`# ${def.titulo(s)}`, `> ${url}`, nota, '---');

  return new Response(`${cabecalho}\n\n${def.corpo(s, lang)}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
