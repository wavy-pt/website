# Wavy — Site

Website oficial da [Wavy](https://wavy.pt) — direção e marketing digital para
negócios com história, na Zona Oeste e Grande Lisboa.

Construído com [Astro](https://astro.build/) + [Tailwind CSS v4](https://tailwindcss.com/) + TypeScript.
Bilingue PT-PT (default) / EN.

---

## Comandos

```bash
npm install              # Instalar dependências
npm run dev              # Dev server em http://localhost:4322
npm run build            # Build de produção para ./dist
npm run preview          # Servir o build localmente
```

Variáveis de ambiente:

```bash
# Default (correr em modo development)
npm run dev

# Simular produção (sem dev banner, indexável)
PUBLIC_ENV=production npm run dev
```

---

## Estrutura

```
src/
├── assets/         # Imagens originais (importadas via Astro Image)
├── components/     # Componentes .astro (Header, Footer, Hero, etc.)
├── i18n/           # JSONs de tradução (pt.json, en.json)
├── layouts/        # Layout.astro (shared head, schema.org, cookie banner)
├── lib/            # Helpers (env.ts, slugs.ts)
├── pages/          # Rotas — 6 páginas PT + as mesmas em en/, api/, .md e llms.txt
└── styles/         # global.css (Tailwind + tokens + fonts self-hosted)
public/             # Static assets (logos, og-image)
```

### Branches

| Branch | Ambiente Vercel | URL | `PUBLIC_ENV` |
|---|---|---|---|
| `main` | Produção | wavy.pt | `production` |
| `develop` | Preview | URL Vercel de preview | `development` |

As 12 páginas (6 por idioma) estão publicadas e acessíveis nos dois ambientes.
A diferença é outra: em desenvolvimento há dev banner e as páginas levam
`noindex`; em produção não há banner e o site é indexável.

O mecanismo de esconder páginas ainda existe (`WIP_PATHS` no `astro.config.mjs`
e `wip` no `src/lib/nav.ts`), mas está vazio — nenhuma página está escondida.

---

## Design system

| Token | Valor | Onde |
|---|---|---|
| `--color-teal` | `#2A9090` | Botões, acentos |
| `--color-teal-dark` | `#1C3C3C` | Texto, fundos escuros |
| `--color-cream` | `#F0EDE4` | Cards, fundos suaves |
| `--color-offwhite` | `#FAFAF8` | Background base |
| `--font-serif` | Playfair Display Variable | Headings |
| `--font-sans` | DM Sans Variable | Body |

Tokens definidos em `src/styles/global.css` via `@theme` do Tailwind v4.

---

## Lighthouse

Build de produção atual (mobile, Lighthouse 13):

| Categoria | Score |
|---|---|
| Performance | 100/100 |
| Accessibility | 100/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |

Core Web Vitals: LCP 1.3s · FCP 0.9s · CLS 0.003 · TBT 0ms.

Para correr localmente:

```bash
npm run build && npx astro preview --port 4325 &
npx lighthouse http://localhost:4325/ --view --form-factor=mobile
```

---

## Deploy

Ver [`DEPLOY.md`](./DEPLOY.md) para o passo-a-passo do Vercel:
- Setup inicial (envs, branches, domínio)
- Headers de segurança HTTP (CSP, HSTS, etc. via `vercel.json`)
- Como esconder ou repor uma página (WIP_PATHS)
