import pt from './pt.json';
import en from './en.json';

const translations: Record<string, typeof pt> = { pt, en };

export const defaultLang = 'pt';
export const languages = ['pt', 'en'] as const;
export type Lang = (typeof languages)[number];

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (languages.includes(lang as Lang)) return lang as Lang;
  return defaultLang;
}

export function t(lang: Lang) {
  return translations[lang] ?? translations[defaultLang];
}

export function getLocalizedPath(path: string, lang: Lang): string {
  const clean = path.replace(/^\/(pt|en)/, '').replace(/^\/+/, '/') || '/';
  if (lang === defaultLang) return clean;
  return `/${lang}${clean === '/' ? '' : clean}`;
}
