/**
 * Links de navegação — partilhados entre o Header e o Footer.
 * Páginas com wip:true ficam escondidas em produção (nenhuma de momento).
 */
import { t, getLocalizedPath } from '../i18n';
import type { Lang } from '../i18n';
import { isProd } from './env';

export interface NavLink {
  label: string;
  to: string;
  wip: boolean;
}

export function getNavLinks(lang: Lang): NavLink[] {
  const i = t(lang);
  const all: NavLink[] = [
    { label: i.nav.home, to: getLocalizedPath('/', lang), wip: false },
    { label: i.nav.services, to: getLocalizedPath('/servicos', lang), wip: false },
    { label: i.nav.about, to: getLocalizedPath('/sobre', lang), wip: false },
    { label: i.nav.cases, to: getLocalizedPath('/casos', lang), wip: false },
    { label: i.nav.contact, to: getLocalizedPath('/contacto', lang), wip: false },
  ];
  return isProd ? all.filter((l) => !l.wip) : all;
}
