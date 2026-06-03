/**
 * Environment helpers.
 *
 * PUBLIC_ENV controla o comportamento por ambiente:
 * - "production" → site público: indexável, sem banner de desenvolvimento
 * - "development" → banner de desenvolvimento + noindex (preview privado)
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

/** Email de contacto público da Wavy. */
export const CONTACT_EMAIL = 'geral@wavy.pt';

/**
 * Destino dos CTAs de contacto: a página /contacto.
 * Agora pública em dev e em produção, devolve sempre a rota localizada.
 */
export function contactHref(localizedContactPath: string): string {
  return localizedContactPath;
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
