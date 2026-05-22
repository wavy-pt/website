/**
 * Slug map for pages whose URL differs between PT and EN.
 * Used by:
 *  - Layout.astro → canonical + hreflang
 *  - Header.astro → language switcher
 *
 * Pages with the same slug in both languages (e.g. /servicos, /sobre)
 * don't need to be listed — the default rule (add/strip /en prefix) covers them.
 */

import type { Lang } from '../i18n';

export interface SlugPair {
  pt: string;
  en: string;
}

export const SLUG_PAIRS: SlugPair[] = [
  { pt: '/privacidade', en: '/en/privacy' },
];

/** Find a slug pair that matches either the PT or EN path. */
export function findSlugPair(path: string): SlugPair | null {
  return SLUG_PAIRS.find((p) => p.pt === path || p.en === path) ?? null;
}

/** Resolve the PT and EN URLs for a given current path. */
export function localizedPaths(path: string): { pt: string; en: string } {
  const cleanPath = path.replace(/\/$/, '') || '/';
  const pair = findSlugPair(cleanPath);
  if (pair) return { pt: pair.pt, en: pair.en };

  // Default: same slug, prefixed with /en in English.
  const noLocale = cleanPath.replace(/^\/en(?=\/|$)/, '') || '/';
  return {
    pt: noLocale,
    en: noLocale === '/' ? '/en' : `/en${noLocale}`,
  };
}

/** Path used by the language switcher. */
export function switchLangPath(path: string, targetLang: Lang): string {
  const paths = localizedPaths(path);
  return targetLang === 'en' ? paths.en : paths.pt;
}
