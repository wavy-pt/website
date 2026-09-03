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
const preco = (s: {
  price?: string;
  priceLabel?: string;
  pricePeriod?: string;
  priceNote?: string;
}): string => {
  const valor = [s.priceLabel?.toLowerCase(), s.price].filter(Boolean).join(' ');
  const comPeriodo = `${valor}${s.pricePeriod ?? ''}`;
  return [comPeriodo, s.priceNote].filter(Boolean).join(' · ');
};

// ---------- Secções ----------

/** Os três serviços, em resumo (como aparecem na home). */
export const secaoServicos = (s: Strings): string => {
  const sv = s.services;
  const cartoes = [sv.start, sv.boost, sv.flow].map((c) =>
    bloco(
      `### ${c.name} — ${c.scriptName}`,
      `*${c.tag}*`,
      c.desc,
      `**Preço:** ${preco(c)}`
    )
  );
  return bloco(`## ${sv.title}`, sv.subtitle, ...cartoes, sv.planLine);
};

/** Os três serviços em detalhe (a jornada, na página de Serviços). */
export const secaoServicosDetalhe = (s: Strings): string => {
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
      `**Preço:** ${preco(c)}`
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

/** Add-ons e processo de trabalho. */
export const secaoAddonsProcesso = (s: Strings): string => {
  const a = s.servicesPage.addons;
  const p = s.servicesPage.process;
  return bloco(
    `## ${a.title}`,
    a.subtitle,
    lista(a.items.map((i) => `**${i.name}** — ${i.desc} (${i.price})`)),
    `## ${p.title}`,
    p.subtitle,
    ...p.steps.map((st) => bloco(`### ${st.number}. ${st.title}`, st.desc))
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

/** Como contactar e onde a Wavy está. */
export const secaoContacto = (
  s: Strings,
  lang: Lang,
  // Na própria página de contacto o título já é o H1 do documento; repeti-lo
  // como H2 logo a seguir lia-se a erro. Nas outras páginas serve de cabeçalho.
  comCabecalho = true
): string => {
  const c = s.contactPage;
  const cartoes = [c.options.card1, c.options.card2, c.options.card3];
  const base = lang === 'en' ? 'https://wavy.pt/en/contacto' : 'https://wavy.pt/contacto';
  return bloco(
    comCabecalho ? `## ${c.page.title}` : '',
    comCabecalho ? c.page.subtitle : '',
    ...cartoes.map((o) => bloco(`### ${o.title}`, o.desc, o.time ? `*${o.time}*` : '')),
    `### ${c.whereWeAre.label}`,
    ...c.whereWeAre.blocks.map((b) => bloco(`**${b.title}**`, b.body)),
    lista([
      `Email: ${c.connect.email}`,
      `${c.connect.ctaTitle}: https://calendly.com/mariana-antunes-wavy/30min`,
      `${lang === 'en' ? 'Contact page' : 'Página de contacto'}: ${base}`,
    ])
  );
};
