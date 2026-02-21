import i18n, { AppLocale, SUPPORTED_LOCALES } from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LOCALE_STORAGE_KEY = "app-locale";

interface I18nContextValue {
  /** Current locale */
  locale: AppLocale;
  /** Change locale and persist the choice */
  setLocale: (locale: AppLocale) => void;
  /** Translate a key. Supports scoped keys like "auth.login" */
  t: (scope: string, options?: Record<string, unknown>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(
    i18n.locale as AppLocale,
  );
  const [ready, setReady] = useState(false);

  // On mount, load persisted locale
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored && SUPPORTED_LOCALES.includes(stored as AppLocale)) {
          i18n.locale = stored;
          setLocaleState(stored as AppLocale);
        }
      } catch {
        // Ignore – use default
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLocale = useCallback((newLocale: AppLocale) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale).catch(() => {});
  }, []);

  const t = useCallback(
    (scope: string, options?: Record<string, unknown>) => {
      // Force re-evaluation when locale changes
      return i18n.t(scope, options);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  if (!ready) return null;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
