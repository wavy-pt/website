/**
 * Environment helpers.
 *
 * PUBLIC_ENV controls which features are visible:
 * - "production" → only homepage is live, other pages redirect to /
 * - "development" → all pages accessible, dev banner shown, noindex set
 *
 * Set via:
 * - Local: .env.development (committed default = development)
 * - Vercel preview/dev branch: dashboard env var PUBLIC_ENV=development
 * - Vercel production branch (main): dashboard env var PUBLIC_ENV=production
 */

export type Env = 'production' | 'development';

const raw = import.meta.env.PUBLIC_ENV;

export const env: Env = raw === 'production' ? 'production' : 'development';

export const isProd = env === 'production';
export const isDev = env === 'development';

/** Paths that are NOT yet ready for production. */
export const WIP_PATHS = ['/servicos', '/sobre', '/casos', '/contacto'] as const;

/** Same paths under the EN locale. */
export const WIP_PATHS_EN = WIP_PATHS.map((p) => `/en${p}`);

export const ALL_WIP_PATHS = [...WIP_PATHS, ...WIP_PATHS_EN];

/** Check if a given pathname is a WIP route. */
export function isWipPath(pathname: string): boolean {
  const clean = pathname.replace(/\/$/, '') || '/';
  return ALL_WIP_PATHS.includes(clean as (typeof ALL_WIP_PATHS)[number]);
}

/** Contact email used as production fallback for WIP /contacto links. */
export const CONTACT_EMAIL = 'geral@wavy.pt';

/**
 * Resolve the target for "book a chat" / "contact" CTAs:
 * - In production (/contacto is WIP): falls back to mailto.
 * - In development: real /contacto route.
 *
 * Once the /contacto page is shipped to production this helper can be removed
 * (or updated to point to a Calendly URL).
 */
export function contactHref(localizedContactPath: string): string {
  return isProd ? `mailto:${CONTACT_EMAIL}` : localizedContactPath;
}

/** Link público do Calendly. Vazio = os CTAs de agendar caem no contacto/email. */
export const CALENDLY_URL = 'https://calendly.com/mariana-antunes-wavy/30min';

/**
 * Destino dos CTAs de "marcar/agendar conversa".
 * Calendly quando definido; caso contrário, a página de contacto (dev) ou mailto (prod).
 */
export function schedulingHref(localizedContactPath: string): string {
  return CALENDLY_URL || contactHref(localizedContactPath);
}

/** True quando os links de agendamento vão para o Calendly (externo → abre em nova aba). */
export const schedulingIsExternal = Boolean(CALENDLY_URL);
