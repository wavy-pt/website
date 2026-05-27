# Wavy — Deploy & Ambientes

Este projeto está preparado para correr em **dois ambientes** no Vercel:

| Ambiente | Branch Git | URL | `PUBLIC_ENV` | O que mostra |
|---|---|---|---|---|
| **Produção** | `main` | `wavy.pt` (a configurar) | `production` | Só a homepage. Links WIP escondidos. Indexável pelo Google. |
| **Desenvolvimento** | `develop` | URL Vercel preview | `development` | Tudo, incluindo páginas WIP. Banner de dev. `noindex`. |

---

## Setup inicial no Vercel (uma só vez)

### 1. Criar o projeto

1. Entrar na conta Vercel **da Wavy** (separada da ADDS).
2. Clicar em **Add New… → Project**.
3. Importar o repositório `Wavy` (depois de o ligares ao GitHub/GitLab).
4. Framework Preset: **Astro** (deteta automaticamente).
5. Build command: `npm run build` (default).
6. Output directory: `dist` (default).

### 2. Configurar a produção (branch `main`)

No painel do projeto → **Settings → Git → Production Branch**:
- Definir como `main`

No painel → **Settings → Environment Variables**:
- Adicionar `PUBLIC_ENV` = `production` no scope **Production**.

### 3. Configurar o ambiente de desenvolvimento (branch `develop`)

No painel → **Settings → Environment Variables**:
- Adicionar `PUBLIC_ENV` = `development` no scope **Preview**.

O Vercel cria um deploy preview automático sempre que houver commit em `develop`.
O URL é tipo `wavy-astro-git-develop-<conta>.vercel.app`.

### 4. (Opcional) Domínio dedicado para o ambiente dev

Se quiseres um URL fixo tipo `dev.wavy.pt`:
1. Settings → Domains → Add.
2. Apontar para `develop` em vez de production.

### 5. Domínio de produção

Settings → Domains → Add `wavy.pt`.
Configurar os registos DNS conforme as instruções do Vercel.

---

## Workflow diário

```bash
# Trabalhar sempre em develop
git checkout develop

# Fazer alterações, commits, push
git push origin develop
# → Vercel cria deploy preview automático em dev URL
```

Quando uma página/feature está pronta para ir live:

```bash
git checkout main
git merge develop
git push origin main
# → Vercel deploy em produção (wavy.pt)
```

---

## Como adicionar uma nova página ao ambiente público

Quando uma página WIP estiver pronta para ir live:

1. Em `src/components/Header.astro` e `src/components/Footer.astro`, mudar `wip: true` → `wip: false` na entrada correspondente.
2. Em `src/pages/<rota>.astro` (e equivalente `/en/`), remover o bloco:
   ```ts
   if (isProd) {
     return Astro.redirect('/', 308);
   }
   ```
3. Substituir o componente `<WipPlaceholder>` pelo conteúdo real da página.
4. Commit em `develop`, validar no preview, e fazer merge para `main`.

Se chegar a altura de também aceitar a página `/contacto`, em `src/lib/env.ts` o helper `contactHref` pode ser removido (ou apontar para o Calendly).

---

## Variáveis de ambiente

| Variável | Valores | Onde definir |
|---|---|---|
| `PUBLIC_ENV` | `production` \| `development` | Vercel dashboard (por scope) + `.env.development` local |

Notas:
- `.env.development` é committed (default para `npm run dev` local = development).
- `.env.production` é **ignorado pelo Git** — não é necessário criar, o Vercel define a env var no dashboard.
- Tudo o que começa com `PUBLIC_` é exposto ao client (browser). Se algum dia adicionarmos secrets, **não usar prefixo PUBLIC_**.

---

## Debug local

```bash
# Correr como em dev (default)
npm run dev

# Correr como se fosse produção (testar redirects, links escondidos)
PUBLIC_ENV=production npm run dev

# Build local (apenas em modo production por causa do adapter Vercel)
PUBLIC_ENV=production npm run build
```

---

## Headers de segurança HTTP

O ficheiro `vercel.json` define os headers de segurança que o Vercel aplica
em produção. **Importante:** estes headers **só são aplicados pelo Vercel**;
correr `npx astro preview` localmente **não** os adiciona.

| Header | Valor (resumido) | O que protege |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'` + GA4 hosts | XSS, injection de scripts |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Força HTTPS (2 anos) |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacy do referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()…` | Restringe APIs do browser |
| `Cross-Origin-Opener-Policy` | `same-origin` | Cross-origin isolation |

E também cache-control para assets imutáveis:

- `/_astro/*` → cache 1 ano, immutable
- `*.woff2`, `*.woff`, `*.ttf` → cache 1 ano, immutable
- `*.jpg`, `*.webp`, `*.svg`… → cache 30 dias

### Validar em produção

Depois do primeiro deploy, validar em [securityheaders.com](https://securityheaders.com)
ou [observatory.mozilla.org](https://observatory.mozilla.org). Alvo: **A+**.

### Se adicionares serviços externos no futuro

Qualquer recurso externo novo (ex: Calendly embed, Hotjar, Sentry, Stripe…)
**vai ser bloqueado pelo CSP**. Adicionar o host correspondente ao
`script-src` e/ou `connect-src` no `vercel.json`.
