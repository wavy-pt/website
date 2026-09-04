# Wavy — Deploy & Ambientes

Este projeto está preparado para correr em **dois ambientes** no Vercel:

| Ambiente | Branch Git | URL | `PUBLIC_ENV` | O que mostra |
|---|---|---|---|---|
| **Produção** | `main` | `wavy.pt` | `production` | As 12 páginas. Sem banner. Indexável pelo Google. |
| **Desenvolvimento** | `develop` | URL Vercel preview | `development` | As mesmas 12 páginas. Banner de dev. `noindex`. |

---

## Setup inicial no Vercel (uma só vez)

### 1. Criar o projeto

1. Entrar na conta Vercel **da Wavy** (separada da ADDS).
2. Clicar em **Add New… → Project**.
3. Importar o repositório `Wavy` (depois de o ligares ao GitHub/GitLab).
4. Framework Preset: **Astro** (deteta automaticamente).
5. Build command: `npm run build` (default).
6. Output directory: deixar vazio. O adaptador `@astrojs/vercel` escreve para
   `.vercel/output` e a Vercel lê-o automaticamente — **não** é `dist`.

### 2. Configurar a produção (branch `main`)

No painel do projeto → **Settings → Git → Production Branch**:
- Definir como `main`

No painel → **Settings → Environment Variables**:
- Adicionar `PUBLIC_ENV` = `production` no scope **Production**.
- Adicionar `PUBLIC_GA_ID` = `G-T3Y9N0ZFVM` no scope **Production** (ativa o Google Analytics 4 — só carrega após o utilizador aceitar os cookies).

### 3. Configurar o ambiente de desenvolvimento (branch `develop`)

No painel → **Settings → Environment Variables**:
- Adicionar `PUBLIC_ENV` = `development` no scope **Preview**.

O Vercel cria um deploy preview automático sempre que houver commit em `develop`.
O URL é `wavy-git-develop-<conta>.vercel.app` — o prefixo é o nome ACTUAL do
projeto na Vercel (`wavy`). Este documento dizia `wavy-astro-...`, do tempo em
que o projeto tinha o nome antigo.

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

## Como esconder ou repor uma página

Nenhuma página está escondida — as 12 estão publicadas. O mecanismo continua a
existir, para o caso de ser preciso:

1. `WIP_PATHS` em `astro.config.mjs` — os caminhos aí listados saem do sitemap.
2. `wip: true` na entrada correspondente de `src/lib/nav.ts` — esconde o link da
   navegação em produção (o `getNavLinks` filtra por `isProd`).

Para repor, basta o inverso. Não há nenhum componente `<WipPlaceholder>` nem
redirecionamentos `308` — esse mecanismo foi removido quando as páginas foram
publicadas.

---

## ⚠️ Publicar SEMPRE por Git, nunca da pasta local

O site publica-se por `git push` para `main`. **Nunca** correr `vercel deploy
--prebuilt` nem publicar a partir da pasta local: esse comando envia o conteúdo
de `.vercel/output` do teu disco, e o build local é feito com o `.env` local.

Publicar por Git faz a Vercel construir nos servidores dela, com as variáveis
do painel — que é o único sítio onde os segredos devem viver.

---

## Variáveis de ambiente

| Variável | Valores | Onde definir |
|---|---|---|
| `PUBLIC_ENV` | `production` \| `development` | Vercel dashboard (por scope) + `.env.development` local |
| `PUBLIC_GA_ID` | `G-T3Y9N0ZFVM` (ID de medição GA4) | Vercel dashboard, scope **Production** apenas |
| `RESEND_API_KEY` | chave secreta do Resend (sem prefixo `PUBLIC_`) | Vercel dashboard, scope **Production** + `.env` local (gitignored) |

> **Google Analytics:** o GA4 só ativa em **produção** e só dispara depois do
> utilizador clicar em **Aceitar** no banner de cookies (Consent Mode v2, estado
> inicial "denied"). Em dev/preview não há analytics. Propriedade GA4: **Wavy**.

> **Rate limit do formulário — a regra que existe e não estava escrita.**
> Na Vercel, em *Firewall → Custom Rules*, há uma regra chamada
> `Rate limit — formulário de contacto`:
>
> | | |
> |---|---|
> | Condição | Request Path **Equals** `/api/contact` |
> | Algoritmo | Fixed Window |
> | Janela | **600 segundos** (10 minutos) |
> | Limite | **5 pedidos** |
> | Chave | IP Address |
> | Acção | Too Many Requests (**429**) |
>
> É por isto que um `429` no formulário NÃO é uma avaria: é a regra a funcionar.
> A resposta traz `x-vercel-mitigated: deny` e o resto do site continua a 200 —
> se alguma vez o formulário falhar, esse cabeçalho distingue o rate limit de um
> erro a sério.
>
> Sendo *fixed window*, o contador reinicia no início de cada bloco de 10
> minutos, não 10 minutos depois do último pedido. Na prática pode reabrir em
> segundos.
>
> **Atenção ao testar:** um agente que corra na máquina do João sai do MESMO IP
> que o browser dele e gasta a mesma quota — cinco pedidos de teste bastam para
> lhe fechar o formulário. Aconteceu em 04/09/2026.
>
> O plano Hobby só permite **uma** regra de rate limit, e é esta. Foi por isso
> que a regra para o `/_image` (achado M#40) nunca poderia ser criada sem passar
> a Pro — além de ter sido descartada por decisão do João.

> **Rotação da chave Resend (#99) — FEITA em 04/09/2026.** A chave original
> nunca esteve no Git (verificado nos 115 commits do histórico), mas ficava em
> texto simples dentro dos ficheiros de build no disco, porque o código a lia com
> `import.meta.env` e o compilador colava lá o valor. Foi essa a causa real da
> avaria do formulário em junho: trocá-la na Vercel não tinha efeito sem um build
> novo, e só o Redeploy resolvia.
>
> Hoje o código usa `getSecret('RESEND_API_KEY')` de `astro:env/server`, que lê em
> execução — verificado que o pacote compilado tem ZERO chaves lá dentro. Chave
> nova gerada, definida na Vercel (Production e Preview), reposta no `.env` local,
> e a antiga apagada. Testado com envios reais dos dois lados depois de apagar.
>
> **Se voltar a ser preciso rodar:** gerar a nova no Resend, substituir na Vercel,
> confirmar com um envio, actualizar o `.env` local, e só então apagar a antiga.
> Nunca apagar antes de confirmar — e nunca commitar o `.env`.

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
