// ============================================================
// /llms.txt — o índice do site para sistemas de IA
// ------------------------------------------------------------
// Era um ficheiro estático em `public/`, escrito à mão. Passou a ser gerado
// porque tinha divergido: dizia que A Obra e A Direção eram "orçamentadas
// individualmente" quando o site já mostrava 1.500€ e 750€/mês. Um índice para
// agentes com preços errados é pior do que não ter índice nenhum — e o
// cabeçalho `Link: rel="describedby"` aponta os agentes precisamente para cá.
//
// Os serviços, os preços e os nomes das páginas vêm agora do i18n, a mesma
// fonte que as páginas e os `.md` usam. O texto de enquadramento (o resumo e as
// notas) é editorial e só existe aqui — não há outra cópia de onde divergir.
// ============================================================

import type { APIRoute } from 'astro';
import { t } from '../i18n';
import { ROTAS_MD } from '../lib/paginas-md';
// Importadas, não recopiadas: eram literais aqui e nos .md, e no dia em que
// mudassem os botões do site apontavam bem enquanto estes ficheiros — os que os
// agentes de IA leem — continuavam a anunciar o antigo, sem erro no build.
import { CALENDLY_URL, INSTAGRAM_URL, FACEBOOK_URL } from '../lib/env';
// Importado, não recopiado: havia duas versões de `preco` e só uma foi
// corrigida quando o rótulo passou a poder ser vazio — daí um espaço a mais.
import { preco } from '../lib/conteudo-md';

const SITE = 'https://wavy.pt';

export const GET: APIRoute = () => {
  const i = t('pt');

  // Serviços: nome + o que é + para que serve + preço, tudo do i18n.
  const jornada = i.servicesPage.journey.services;
  // O preço vem de `journey`, que é o que a página mostra. Os valores em
  // `services.boost.price` / `services.flow.price` (1.500€ e 750€) NÃO estão
  // publicados no site — lá lê-se "Orçamento personalizado".
  const servicos = [i.services.start, i.services.boost, i.services.flow]
    .map((c, idx) => {
      const ancora = `${SITE}/servicos#servico-0${idx + 1}`;
      const j = jornada[idx];
      const tagline = j?.tagline ?? '';
      return `- [${c.name}](${ancora}): ${c.scriptName}. ${tagline}. Preço: ${j ? preco(j) : 'sob consulta'}`;
    })
    .join('\n');

  // Páginas: os rótulos vêm da navegação, os caminhos da fonte única das rotas.
  const paginas = [
    [i.nav.home, '/', 'visão geral da Wavy e do método.'],
    [i.nav.services, '/servicos', 'os 3 serviços em detalhe e um teste interativo para perceber por onde começar.'],
    [i.nav.cases, '/casos', 'projetos reais acompanhados pela Wavy.'],
    [i.nav.about, '/sobre', 'a história da Wavy e da fundadora, Mariana Antunes.'],
    [i.nav.contact, '/contacto', 'marcação de diagnóstico (Calendly) e formulário de contacto.'],
  ]
    .map(([rotulo, rota, nota]) => `- [${rotulo}](${SITE}${rota}): ${nota}`)
    .join('\n');

  // Cada página tem equivalente em Markdown. Anunciá-lo aqui poupa a um agente
  // ter de descobrir a negociação por `Accept:` para lá chegar.
  const markdown = Object.entries(ROTAS_MD)
    .map(([rota, md]) => `- ${SITE}${rota === '/' ? '' : rota} → ${SITE}${md}`)
    .join('\n');

  const corpo = `# Wavy

> Direção e marketing digital para negócios com história, na Zona Oeste e Grande Lisboa. Estratégia, websites, redes sociais e SEO local — com rigor e sensibilidade humana.

A Wavy é uma agência de direção e marketing digital fundada por Mariana Antunes. Trabalha com negócios já estabelecidos que procuram uma parceira para dirigir a sua transformação digital com método, não com sorte. O princípio é simples: estratégia antes de execução — a Wavy não vende "posts", vende direção. Atua na Zona Oeste e Grande Lisboa (Portugal), em português e inglês.

## Serviços

${servicos}

${i.services.planLine}

## Páginas principais

${paginas}

## Versões em Markdown

Cada página tem um equivalente em texto, servido também por negociação de conteúdo (\`Accept: text/markdown\`):

${markdown}

## Contacto e redes

- Email: geral@wavy.pt
- Marcação de conversa (Calendly): ${CALENDLY_URL}
- Instagram: ${INSTAGRAM_URL}
- Facebook: ${FACEBOOK_URL}

## Notas

- Idiomas: Português (pt-PT, versão principal) e Inglês (${SITE}/en/).
- Zona de atuação: ${i.contactPage.whereWeAre.blocks[1]?.body ?? 'Zona Oeste, Grande Lisboa e Samora Correia, Portugal.'}
- Bases: Mafra e Samora Correia (Portugal).
- Utilização do conteúdo: permitida com atribuição. Ver ${SITE}/robots.txt (Content-Signal).
`;

  return new Response(corpo, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
