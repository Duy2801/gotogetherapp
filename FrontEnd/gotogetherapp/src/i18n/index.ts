import viTranslations from './vi.json';
import enTranslations from './en.json';

export type Locale = 'vi' | 'en';

const translations: Record<Locale, typeof viTranslations> = {
  vi: viTranslations,
  en: enTranslations,
};

/**
 * Get translation value by key
 * @param locale - Current locale
 * @param key - Dot notation key (e.g., "auth.login")
 * @param params - Parameters for interpolation (e.g., {field: "email"})
 * @returns Translated string
 */
export const t = (
  locale: Locale,
  key: string,
  params?: Record<string, string>,
): string => {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation key not found
      value = translations.en;
      for (const fallbackK of keys) {
        if (value && typeof value === 'object' && fallbackK in value) {
          value = value[fallbackK];
        } else {
          return key; // Return key if not found anywhere
        }
      }
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters in string
  if (params) {
    return value.replace(/{(\w+)}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }

  return value;
};

/**
 * Get all translations for a locale
 */
export const getTranslations = (locale: Locale) => {
  return translations[locale];
};

/**
 * Get available locales
 */
export const getAvailableLocales = (): Locale[] => {
  return Object.keys(translations) as Locale[];
};

export default translations;
