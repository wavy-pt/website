// ============================================================
// O índice do site para sistemas de IA — /llms.txt e /en/llms.txt
// ------------------------------------------------------------
// Era um ficheiro estático em `public/`, escrito à mão. Passou a ser gerado
// porque tinha divergido: dizia que A Obra e A Direção eram "orçamentadas
// individualmente" quando o site já mostrava 1.500€ e 750€/mês. Um índice para
// agentes com preços errados é pior do que não ter índice nenhum — e o
// cabeçalho `Link: rel="describedby"` aponta os agentes precisamente para cá.
//
// Depois passou a existir nos dois idiomas: as cinco páginas inglesas estavam a
// anunciar o índice português, e um assistente a trabalhar em inglês encontrava
// os serviços chamados "O Raio-X", "A Obra" e "A Direção". Não era erro — os
// endereços estavam certos — mas desperdiçava a versão inglesa do site.
//
// Os serviços, os preços e os nomes das páginas vêm do i18n, a mesma fonte que
// as páginas e os `.md` usam. O texto de enquadramento é editorial e só existe
// aqui, pelo que não há outra cópia de onde divergir.
// ============================================================

import { t } from '../i18n';
import type { Lang } from '../i18n';
import { ROTAS_MD } from './paginas-md';
// Importadas, não recopiadas: eram literais aqui e nos .md, e no dia em que
// mudassem os botões do site apontavam bem enquanto estes ficheiros — os que os
// agentes de IA leem — continuavam a anunciar o antigo, sem erro no build.
import { CALENDLY_URL, INSTAGRAM_URL, FACEBOOK_URL, CONTACT_EMAIL } from './env';
// Importado, não recopiado: havia duas versões de `preco` e só uma foi
// corrigida quando o rótulo passou a poder ser vazio — daí um espaço a mais.
import { preco } from './conteudo-md';

const SITE = 'https://wavy.pt';

/** Texto editorial. Tudo o resto vem do i18n. */
const TEXTOS = {
  pt: {
    resumo:
      'Direção e marketing digital para negócios com história, na Zona Oeste e Grande Lisboa. Estratégia, websites, redes sociais e SEO local — com rigor e sensibilidade humana.',
    quem:
      'A Wavy é o estúdio de direção e marketing digital de Mariana Antunes, apoiado por uma rede de especialistas. Acompanha negócios já estabelecidos que procuram uma parceira para dirigir a sua transformação digital com método, não com sorte. O princípio é simples: estratégia antes de execução — a Wavy não vende "posts", vende direção. Atua na Zona Oeste e Grande Lisboa (Portugal), em português e inglês.',
    hServicos: 'Serviços',
    hPaginas: 'Páginas principais',
    hMarkdown: 'Versões em Markdown',
    hContacto: 'Contacto e redes',
    hNotas: 'Notas',
    notaMarkdown:
      'Cada página tem um equivalente em texto, servido também por negociação de conteúdo (`Accept: text/markdown`):',
    rotuloPreco: 'Preço',
    email: 'Email',
    calendly: 'Marcação de conversa (Calendly)',
    idiomas: `Idiomas: Português (pt-PT, versão principal) e Inglês (${SITE}/en/, índice em ${SITE}/en/llms.txt).`,
    zona: 'Zona de atuação',
    bases: 'Bases: Mafra e Samora Correia (Portugal).',
    licenca: `Utilização do conteúdo: permitida com atribuição. Ver ${SITE}/robots.txt (Content-Signal).`,
    paginas: [
      ['/', 'visão geral da Wavy e do método.'],
      ['/servicos', 'os 3 serviços em detalhe e um teste interativo para perceber por onde começar.'],
      ['/casos', 'projetos reais acompanhados pela Wavy.'],
      ['/sobre', 'a história da Wavy e da fundadora, Mariana Antunes.'],
      ['/contacto', 'marcação de diagnóstico (Calendly) e formulário de contacto.'],
    ] as const,
  },
  en: {
    resumo:
      'Digital direction and marketing for established businesses in the Oeste region and Greater Lisbon. Strategy, websites, social media and local SEO — with rigour and human sensitivity.',
    quem:
      'Wavy is Mariana Antunes’s digital direction and marketing studio, backed by a network of specialists. It works with established businesses looking for a partner to direct their digital transformation with method, not with luck. The principle is simple: strategy before execution — Wavy does not sell "posts", it sells direction. It operates in the Oeste region and Greater Lisbon (Portugal), in Portuguese and English.',
    hServicos: 'Services',
    hPaginas: 'Main pages',
    hMarkdown: 'Markdown versions',
    hContacto: 'Contact and social',
    hNotas: 'Notes',
    notaMarkdown:
      'Every page has a plain-text equivalent, also served through content negotiation (`Accept: text/markdown`):',
    rotuloPreco: 'Price',
    email: 'Email',
    calendly: 'Book a conversation (Calendly)',
    idiomas: `Languages: English (${SITE}/en/) and Portuguese (pt-PT, the primary version, indexed at ${SITE}/llms.txt).`,
    zona: 'Area served',
    bases: 'Bases: Mafra and Samora Correia (Portugal).',
    licenca: `Content use: permitted with attribution. See ${SITE}/robots.txt (Content-Signal).`,
    paginas: [
      ['/en', 'overview of Wavy and the method.'],
      ['/en/servicos', 'the 3 services in detail, plus an interactive quiz to find where to start.'],
      ['/en/casos', 'real projects directed by Wavy.'],
      ['/en/sobre', 'the story of Wavy and its founder, Mariana Antunes.'],
      ['/en/contacto', 'diagnosis booking (Calendly) and contact form.'],
    ] as const,
  },
} as const;

export function gerarLlmsTxt(lang: Lang): string {
  const i = t(lang);
  const x = TEXTOS[lang];
  const prefixo = lang === 'en' ? '/en' : '';

  // Serviços: nome + o que é + para que serve + preço, tudo do i18n.
  const jornada = i.servicesPage.journey.services;
  // O preço vem de `journey`, que é o que a página mostra. Os valores em
  // `services.boost.price` / `services.flow.price` (1.500€ e 750€) NÃO estão
  // publicados no site — lá lê-se "Orçamento personalizado".
  const servicos = [i.services.start, i.services.boost, i.services.flow]
    .map((c, idx) => {
      const ancora = `${SITE}${prefixo}/servicos#servico-0${idx + 1}`;
      const j = jornada[idx];
      const tagline = j?.tagline ?? '';
      return `- [${c.name}](${ancora}): ${c.scriptName}. ${tagline}. ${x.rotuloPreco}: ${j ? preco(j) : '—'}`;
    })
    .join('\n');

  // Os rótulos vêm da navegação; os caminhos e as notas, da lista acima.
  const rotulos = [i.nav.home, i.nav.services, i.nav.cases, i.nav.about, i.nav.contact];
  const paginas = x.paginas
    .map(([rota, nota], idx) => `- [${rotulos[idx]}](${SITE}${rota}): ${nota}`)
    .join('\n');

  // Só as rotas do idioma deste índice: um agente a ler o índice inglês não
  // ganha nada com a lista dos .md portugueses, que já estão no outro.
  const markdown = Object.entries(ROTAS_MD)
    .filter(([rota]) => (lang === 'en' ? rota.startsWith('/en') : !rota.startsWith('/en')))
    .map(([rota, md]) => `- ${SITE}${rota === '/' ? '' : rota} → ${SITE}${md}`)
    .join('\n');

  return `# Wavy

> ${x.resumo}

${x.quem}

## ${x.hServicos}

${servicos}

${i.services.planLine}

## ${x.hPaginas}

${paginas}

## ${x.hMarkdown}

${x.notaMarkdown}

${markdown}

## ${x.hContacto}

- ${x.email}: ${CONTACT_EMAIL}
- ${x.calendly}: ${CALENDLY_URL}
- Instagram: ${INSTAGRAM_URL}
- Facebook: ${FACEBOOK_URL}

## ${x.hNotas}

- ${x.idiomas}
- ${x.zona}: ${i.contactPage.whereWeAre.blocks[1]?.body ?? ''}
- ${x.bases}
- ${x.licenca}
`;
}
