import { useSelector } from 'react-redux';
import { RootState } from '../reducers/store';
import { t, Locale, getAvailableLocales } from '../i18n';

/**
 * Custom hook to use translations in components
 * Usage: const { t: translate } = useTranslation();
 *        <Text>{translate('auth.login')}</Text>
 */
export const useTranslation = () => {
  const locale = useSelector((state: RootState) => state.locale) as Locale;

  const translate = (key: string, params?: Record<string, string>) => {
    try {
      return t(locale, key, params);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  return {
    t: translate,
    locale,
    availableLocales: getAvailableLocales(),
  };
};

export default useTranslation;
