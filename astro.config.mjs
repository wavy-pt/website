// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// Páginas a excluir do sitemap público (vazio = todas as páginas entram).
const WIP_PATHS = [];

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
    }),
  ],
});