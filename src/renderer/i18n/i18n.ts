import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import { SettingsService } from '../services/settingsService';
import { syncNativeMenuLabels } from '../services/menuSyncService';



// ─────────────────────────────────────────────
//  LOCALES
// ─────────────────────────────────────────────

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  es: 'Español',
  en: 'English',
};

export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const RTL_LANGUAGES: readonly string[] = ['ar', 'he', 'fa', 'ur'];

export function resolveLocale(osLocale: string): SupportedLocale {
    const lang = osLocale.split('-')[0].toLowerCase() as SupportedLocale;

    return SUPPORTED_LOCALES.includes(lang) ? lang: 'es';
}

export function applyDirection(lang: string): void {
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
}



// ─────────────────────────────────────────────
//  Locale resolution (localStorage → IPC → default)
// ─────────────────────────────────────────────

async function resolveInitialLocale(): Promise<SupportedLocale> {
    // 1. User has already chosen a language → use it directly
    const stored = SettingsService.get('language');
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
      return stored as SupportedLocale;
    }
  
    // 2. First launch → ask the Main process for the OS locale
    try {
      const osLocale = await window.electronAPI.app.getLocale();
      const resolved = resolveLocale(osLocale);

      SettingsService.save({ language: resolved });
  
      return resolved;
    } catch {
      // 3. IPC failed → fall back to Spanish
      return 'es';
    }
}



// ─────────────────────────────────────────────
//  i18next initialization
// ─────────────────────────────────────────────

export async function initI18n(): Promise<void> {
    const locale = await resolveInitialLocale();
  
    applyDirection(locale);
  
    await i18n
      .use(HttpBackend)
      .use(initReactI18next)
      .init({
        lng: locale,
        fallbackLng: 'es',
        ns: ['translation'],
        defaultNS: 'translation',
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
        saveMissing: import.meta.env.DEV,
        missingKeyHandler: import.meta.env.DEV
          ? (lngs, ns, key) => {
              console.warn(`[i18n] Missing key: ${ns}:${key} for [${lngs.join(', ')}]`);
            }
          : undefined,
      });

      syncNativeMenuLabels();
      i18n.on('languageChanged', syncNativeMenuLabels);
}


export default i18n;