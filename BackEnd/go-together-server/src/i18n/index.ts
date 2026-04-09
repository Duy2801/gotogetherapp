import viMessages from "./vi.json";
import enMessages from "./en.json";

export type Locale = "vi" | "en";

const messages: Record<Locale, typeof viMessages> = {
  vi: viMessages,
  en: enMessages,
};

/**
 * Get i18n message by key
 * @param locale - Current locale (from request header 'x-locale')
 * @param key - Dot notation key (e.g., "errors.user.not_found")
 * @param params - Parameters for interpolation
 * @returns Translated message
 */
export const i18n = (
  locale: string | undefined,
  key: string,
  params?: Record<string, string>,
): string => {
  const currentLocale: Locale = (locale === "en" ? "en" : "vi") as Locale;
  const keys = key.split(".");
  let value: any = messages[currentLocale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Fallback to English
      value = messages.en;
      for (const fallbackK of keys) {
        if (value && typeof value === "object" && fallbackK in value) {
          value = value[fallbackK];
        } else {
          return key;
        }
      }
    }
  }

  if (typeof value !== "string") {
    return key;
  }

  // Replace parameters
  if (params) {
    return value.replace(/{(\w+)}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }

  return value;
};

export default messages;
