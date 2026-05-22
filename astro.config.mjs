// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// Pages still in development — excluded from the public sitemap.
const WIP_PATHS = [
  '/servicos',
  '/sobre',
  '/casos',
  '/contacto',
  '/en/servicos',
  '/en/sobre',
  '/en/casos',
  '/en/contacto',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://wavy.pt',
  server: { port: 4322 },

  vite: {
    plugins: [tailwindcss()]
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