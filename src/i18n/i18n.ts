import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

// Map WordPress locale (e.g. "de_DE") to our language code (e.g. "de")
const WP_LOCALE_MAP: Record<string, string> = {
  en_US: 'en', en_GB: 'en', en_AU: 'en',
  bg_BG: 'bg',
  bs_BA: 'bs',
  cs_CZ: 'cs',
  da_DK: 'da',
  de_DE: 'de', de_AT: 'de', de_CH: 'de',
  el: 'el', el_GR: 'el',
  es_ES: 'es', es_MX: 'es', es_AR: 'es',
  et: 'et', et_EE: 'et',
  fi: 'fi', fi_FI: 'fi',
  fr_FR: 'fr', fr_CA: 'fr', fr_BE: 'fr',
  hr: 'hr', hr_HR: 'hr',
  hu_HU: 'hu',
  it_IT: 'it',
  lt_LT: 'lt',
  lv: 'lv', lv_LV: 'lv',
  mk_MK: 'mk',
  nb_NO: 'nb',
  nl_NL: 'nl', nl_BE: 'nl',
  pl_PL: 'pl',
  pt_PT: 'pt', pt_BR: 'pt',
  ro_RO: 'ro',
  ru_RU: 'ru',
  sk_SK: 'sk',
  sl_SI: 'sl',
  sr_RS: 'sr',
  sv_SE: 'sv',
  mt_MT: 'mt',
  ga: 'ga', ga_IE: 'ga',
};

export function resolveLanguage(wpLocale: string): string {
  return WP_LOCALE_MAP[wpLocale] ?? wpLocale.split('_')[0] ?? 'en';
}

// Locale importers - dynamically loaded for code splitting
const localeImporters: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  bg: () => import('./locales/bg.json'),
  bs: () => import('./locales/bs.json'),
  cnr: () => import('./locales/cnr.json'),
  cs: () => import('./locales/cs.json'),
  da: () => import('./locales/da.json'),
  de: () => import('./locales/de.json'),
  el: () => import('./locales/el.json'),
  es: () => import('./locales/es.json'),
  et: () => import('./locales/et.json'),
  fi: () => import('./locales/fi.json'),
  fr: () => import('./locales/fr.json'),
  ga: () => import('./locales/ga.json'),
  hr: () => import('./locales/hr.json'),
  hu: () => import('./locales/hu.json'),
  it: () => import('./locales/it.json'),
  lt: () => import('./locales/lt.json'),
  lv: () => import('./locales/lv.json'),
  mk: () => import('./locales/mk.json'),
  mt: () => import('./locales/mt.json'),
  nb: () => import('./locales/nb.json'),
  nl: () => import('./locales/nl.json'),
  pl: () => import('./locales/pl.json'),
  pt: () => import('./locales/pt.json'),
  ro: () => import('./locales/ro.json'),
  ru: () => import('./locales/ru.json'),
  sk: () => import('./locales/sk.json'),
  sl: () => import('./locales/sl.json'),
  sr: () => import('./locales/sr.json'),
  sv: () => import('./locales/sv.json'),
};

export async function initI18n(wpLocale: string) {
  const lang = resolveLanguage(wpLocale);
  const resources: Record<string, { translation: Record<string, string> }> = {
    en: { translation: en },
  };

  // Load target language if not English
  if (lang !== 'en' && localeImporters[lang]) {
    try {
      const mod = await localeImporters[lang]();
      resources[lang] = { translation: mod.default };
    } catch {
      // Fallback to English
    }
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  return i18n;
}
