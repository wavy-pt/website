// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// A MESMA fonte que o Layout.astro usa para o canonical e o hreflang. Importar
// em vez de repetir a regra aqui: eram duas cópias, e foi a divergência entre
// elas que pôs 11 dos 12 endereços do sitemap a apontar para uma morada que a
// própria página dizia não ser a canónica.
import { localizedPaths } from './src/lib/slugs';

// Páginas a excluir do sitemap público (vazio = todas as páginas entram).
const WIP_PATHS = [];

const SITE = 'https://wavy.pt';

// https://astro.build/config
export default defineConfig({
  site: 'https://wavy.pt',
  server: { port: 4322 },

  vite: {
    plugins: [tailwindcss()],
    // Não embutir fontes como data: URI. A CSP em produção é `font-src 'self'`,
    // que bloqueia data: — a fonte de ícones (subset ~3KB) estava a ser embutida
    // e não carregava na Vercel. Assim fica como ficheiro /_astro/*.woff2 (permitido
    // pelo 'self' e com cache imutável).
    build: {
      assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
    },
  },

  adapter: vercel(),
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'pt',
        locales: {
          pt: 'pt-PT',
          en: 'en',
        },
      },
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '');
        return !WIP_PATHS.includes(path);
      },
      /**
       * Alinha o sitemap com o que as páginas declaram.
       *
       * Sem isto, o sitemap listava `/servicos/` (com barra) enquanto a página
       * dizia `rel="canonical" → /servicos` (sem barra) — 11 dos 12 endereços
       * divergiam. Os hreflang tinham o mesmo problema, faltava-lhes o
       * `x-default`, e o par PT/EN das páginas de privacidade nem existia
       * (têm slugs diferentes, e a opção `i18n` da integração só sabe emparelhar
       * pelo prefixo do idioma).
       *
       * A normalização é a MESMA do Layout.astro: tirar a barra final, exceto
       * na raiz. E os pares vêm de `localizedPaths`, a fonte que o HTML usa.
       */
      serialize(item) {
        const absoluto = (caminho) => `${SITE}${caminho === '/' ? '/' : caminho}`;
        const caminho = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const { pt, en } = localizedPaths(caminho);
        return {
          ...item,
          url: absoluto(caminho),
          links: [
            { lang: 'pt-PT', url: absoluto(pt) },
            { lang: 'en', url: absoluto(en) },
            // O x-default diz ao Google qual servir a quem não encaixa em
            // nenhum idioma. O HTML já o declarava; o sitemap não, e duas
            // anotações diferentes para a mesma página podem levar o Google a
            // ignorar ambas.
            { lang: 'x-default', url: absoluto(pt) },
          ],
        };
      },
    }),
  ],
});