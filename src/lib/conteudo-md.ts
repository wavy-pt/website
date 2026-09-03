// ============================================================
// Composição do conteúdo do site em Markdown
// ------------------------------------------------------------
// Serve os `/<pagina>.md` — a versão em texto de cada página, para agentes de
// IA que preferem conteúdo a HTML.
//
// A FONTE É O i18n, NUNCA O HTML CONSTRUÍDO. Raspar o HTML traria classes de
// Tailwind, texto decorativo e marcação de ícones, e partir-se-ia a cada
// mudança de layout. Aqui o conteúdo vem das mesmas chaves que as páginas usam,
// pelo que uma alteração de copy aparece nos dois sítios ao mesmo tempo.
//
// OS TÍTULOS TAMBÉM VÊM DO i18n, e não do `title=` de SEO que está fixo em cada
// `.astro`. É deliberado: copiar essa prosa para aqui criava uma segunda cópia
// que divergia na primeira vez que alguém mexesse num dos lados. O que fica é
// o H1 real da página, que é o que descreve o conteúdo a quem o lê.
// ============================================================

import ptStrings from '../i18n/pt.json';
import enStrings from '../i18n/en.json';
import type { Lang } from '../i18n';

export type Strings = typeof ptStrings;

export const strings = (lang: Lang): Strings =>
  (lang === 'en' ? enStrings : ptStrings) as Strings;

/** Junta partes com linha em branco, ignorando as vazias. */
export const bloco = (...partes: (string | undefined | null)[]): string =>
  partes.filter((p): p is string => Boolean(p && p.trim())).join('\n\n');

/**
 * Rótulos que o GERADOR acrescenta e que não vêm do i18n — o site não os mostra,
 * por isso não têm chave lá.
 *
 * Ficam todos aqui de propósito: estavam espalhados em literais pelo ficheiro, e
 * foi assim que "**Preço:**" acabou dentro dos ficheiros Markdown INGLESES, em
 * cima da informação mais sensível da página. Um sítio só significa que
 * acrescentar um rótulo ou um idioma é uma alteração, não uma caça ao literal
 * esquecido.
 */
const rotulos = (lang: Lang) =>
  lang === 'en'
    ? { preco: 'Price', paginaContacto: 'Contact page' }
    : { preco: 'Preço', paginaContacto: 'Página de contacto' };

/**
 * Lista de tópicos.
 *
 * Rejeita o que não é texto de propósito: no i18n há listas de strings e listas
 * de objetos com a mesma cara (`steps` e `types` são `{title, desc}`), e passar
 * um objeto aqui publicava "- [object Object]" sem erro nenhum. Mais vale o
 * build parar do que o site anunciar lixo aos agentes.
 */
const lista = (itens: readonly unknown[]): string =>
  itens
    .map((i) => {
      if (typeof i !== 'string') {
        throw new Error(
          `lista() recebeu ${typeof i} em vez de texto: ${JSON.stringify(i)?.slice(0, 80)}`
        );
      }
      return `- ${i}`;
    })
    .join('\n');

/** Junta um cabeçalho partido em duas chaves (headline + highlight). */
export const juntar = (...partes: unknown[]): string =>
  partes
    .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Preço legível: "desde 350€ + IVA · 100% deduzido no projeto seguinte". */
export const preco = (s: {
  price?: string;
  priceLabel?: string;
  pricePeriod?: string;
  priceNote?: string;
}): string => {
  const valor = [s.priceLabel?.toLowerCase(), s.price].filter(Boolean).join(' ').trim();
  const comPeriodo = `${valor}${s.pricePeriod ?? ''}`;
  return [comPeriodo, s.priceNote].filter(Boolean).join(' · ');
};

// ---------- Secções ----------

/** Os três serviços, em resumo (como aparecem na home). */
export const secaoServicos = (s: Strings, lang: Lang): string => {
  const sv = s.services;
  // O PREÇO VEM DE `servicesPage.journey`, NÃO DE `services.*`.
  // Os campos `services.boost.price` (1.500€) e `services.flow.price` (750€)
  // existem no i18n mas NÃO estão em lado nenhum do site — a página mostra
  // "Orçamento personalizado" para os dois, e a home nem sequer renderiza
  // preços. Publicá-los aqui dava a agentes valores que o negócio não anuncia.
  const jornada = s.servicesPage.journey.services;
  const cartoes = [sv.start, sv.boost, sv.flow].map((c, idx) =>
    bloco(
      `### ${c.name} — ${c.scriptName}`,
      c.tag ? `*${c.tag}*` : '',
      c.desc,
      jornada[idx] ? `**${rotulos(lang).preco}:** ${preco(jornada[idx])}` : ''
    )
  );
  return bloco(`## ${sv.title}`, sv.subtitle, ...cartoes, sv.planLine);
};

/** Os três serviços em detalhe (a jornada, na página de Serviços). */
export const secaoServicosDetalhe = (s: Strings, lang: Lang): string => {
  const j = s.servicesPage.journey;
  const servicos = j.services.map((c) =>
    bloco(
      `### ${c.number}. ${c.name} — ${c.scriptName}`,
      c.tag ? `*${c.tag}*` : '',
      c.tagline,
      c.desc,
      c.deliverables?.length ? `**${c.deliverablesLabel}:**\n${lista(c.deliverables)}` : '',
      c.steps?.length
        ? `**${c.stepsLabel}:**\n${lista(
            (c.steps as { title: string; desc: string }[]).map((st) => `**${st.title}** — ${st.desc}`)
          )}`
        : '',
      'types' in c && Array.isArray(c.types) && c.types.length
        ? `**${c.typesLabel}:**\n${lista(
            (c.types as { name: string; desc: string }[]).map((ty) => `**${ty.name}** — ${ty.desc}`)
          )}`
        : '',
      c.forWhoCases?.length
        ? `**${c.forWhoLabel}:** ${c.forWhoIntro ?? ''}\n${lista(c.forWhoCases)}`
        : '',
      `**${rotulos(lang).preco}:** ${preco(c)}`
    )
  );
  return bloco(`## ${j.title}`, j.subtitle, ...servicos);
};

/** O método: porque se começa sempre pelo Raio-X. */
export const secaoMetodo = (s: Strings): string => {
  const m = s.servicesPage.method;
  return bloco(
    `## ${m.title}`,
    m.subtitle,
    ...m.principles.map((p) => bloco(`### ${p.number}. ${p.title}`, p.desc)),
    m.closing
  );
};

/** Para quem a Wavy trabalha — e para quem não trabalha. */
export const secaoParaQuem = (s: Strings): string => {
  const f = s.forWho;
  const p = s.personas;
  return bloco(
    `## ${f.title}`,
    f.subtitle,
    ...f.cards.map((c) => bloco(`### ${c.title}`, c.desc, c.quote ? `> ${c.quote}` : '')),
    f.footer,
    `## ${p.title}`,
    p.subtitle,
    ...p.cards.map((c) => bloco(`### ${c.title}`, c.desc)),
    `**${p.forTitle}**\n${lista(p.forItems)}`,
    `**${p.againstTitle}**\n${lista(p.againstItems)}`
  );
};

/** Sobre a Wavy e a fundadora. */
export const secaoSobre = (s: Strings): string => {
  const a = s.aboutPage;
  return bloco(
    `## ${juntar(a.mariana.headline, a.mariana.headlineHighlight)}`,
    ...a.mariana.paragraphs,
    `## ${juntar(a.manifesto.headline, a.manifesto.headlineHighlight)}`,
    a.manifesto.subtitle,
    ...a.manifesto.items.map((i) => bloco(`### ${i.number}. ${i.title}`, i.desc)),
    `## ${juntar(a.whyWavy.headline, a.whyWavy.headlineHighlight)}`,
    ...a.whyWavy.paragraphs
  );
};

/** Os casos, em detalhe. */
export const secaoCasos = (s: Strings): string => {
  const c = s.casesPage;

  // SÓ OS CASOS PUBLICADOS. O i18n tem um caso completo a mais do que a página
  // mostra — um terceiro que ficou em standby por decisão e que `casos.astro`
  // não liga. `page.cards` é a lista que desenha a grelha visível, por isso é
  // ela que manda aqui: percorrer `items` às cegas publicaria num .md conteúdo
  // que foi deliberadamente retido do site.
  const publicados = c.items.slice(0, c.page.cards.length);

  const casos = publicados.map((it) => {
    const d = it.detail as
      | {
          intro?: string;
          sections?: { title: string; body: string }[];
          stats?: { value: string; label: string }[];
          services?: string[];
        }
      | undefined;
    const numeros = d?.stats ?? it.stats;

    return bloco(
      `### ${juntar(it.headlineBefore, it.headlineHighlight, it.headlineAfter)}`,
      it.metadata ? `*${it.metadata}*` : '',
      it.description,
      d?.intro,
      d?.sections?.length
        ? d.sections.map((sec) => bloco(`**${sec.title}**`, sec.body)).join('\n\n')
        : '',
      d?.services?.length ? `**${c.ui.servicesLabel}:**\n${lista(d.services)}` : '',
      numeros?.length
        ? `**${c.ui.resultsLabel}:**\n${lista(
            numeros.map((st) => [st.value, st.label].filter(Boolean).join(' — '))
          )}`
        : '',
      it.quote ? `> ${it.quote}${it.quoteAuthor ? `\n>\n> — ${it.quoteAuthor}` : ''}` : ''
    );
  });

  return bloco(`**${c.transparency.label}:** ${c.transparency.body}`, ...casos);
};

/** Testemunhos e números (versão curta, para a home). */
export const secaoResultados = (s: Strings): string => {
  const c = s.cases;
  return bloco(
    `## ${c.title}`,
    c.subtitle,
    ...c.testimonials.map((t) => `> ${t.quote}\n>\n> — ${t.author}, ${t.role}`),
    lista([`${c.stat1} ${c.stat1Label}`, `${c.stat2} ${c.stat2Label}`])
  );
};

/** Perguntas frequentes. Aceita as da home ou as da página de Serviços. */
export const secaoFaq = (
  fonte: { title: string; items: readonly { q: string; a: string }[] }
): string =>
  bloco(
    `## ${fonte.title}`,
    ...fonte.items.map((i) => bloco(`### ${i.q}`, i.a))
  );

/**
 * Como contactar e onde a Wavy está.
 *
 * USA `connect`, NÃO `options`. A secção `contactPage.options` existe no i18n
 * mas NENHUM componente a renderiza — é conteúdo morto. Publicá-la no .md
 * anunciava a agentes três "caminhos" que a página não mostra. Mesma armadilha
 * dos add-ons e do processo, removidos daqui pela mesma razão, e do 3.º caso em
 * standby: o i18n tem mais do que o site publica.
 *
 * Regra ao acrescentar secções aqui: confirmar que o texto aparece mesmo no
 * HTML construído, não que a chave existe no i18n.
 */
export const secaoContacto = (
  s: Strings,
  lang: Lang,
  // Na própria página de contacto o título já é o H1 do documento; repeti-lo
  // como H2 logo a seguir lia-se a erro. Nas outras páginas serve de cabeçalho.
  comCabecalho = true
): string => {
  const c = s.contactPage;
  const n = c.connect;
  const base = lang === 'en' ? 'https://wavy.pt/en/contacto' : 'https://wavy.pt/contacto';
  return bloco(
    comCabecalho ? `## ${c.page.title}` : '',
    comCabecalho ? c.page.subtitle : '',
    bloco(`### ${n.ctaTitle}`, n.ctaDesc),
    bloco(`### ${n.emailTitle}`, n.emailDesc),
    bloco(`### ${n.socialTitle}`, n.socialDesc),
    `### ${c.whereWeAre.label}`,
    ...c.whereWeAre.blocks.map((b) => bloco(`**${b.title}**`, b.body)),
    lista([
      `Email: ${n.email}`,
      `${n.ctaTitle}: https://calendly.com/mariana-antunes-wavy/30min`,
      `${rotulos(lang).paginaContacto}: ${base}`,
    ])
  );
};
