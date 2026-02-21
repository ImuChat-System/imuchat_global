import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "./en.json";
import fr from "./fr.json";
import ja from "./ja.json";

export const SUPPORTED_LOCALES = ["fr", "en", "ja"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
    fr: "Français",
    en: "English",
    ja: "日本語",
};

const i18n = new I18n({ fr, en, ja });

// Set the locale once at the beginning of your app
const deviceLocale = Localization.getLocales()?.[0]?.languageCode ?? "fr";

// Default to device locale if supported, otherwise French
i18n.locale = SUPPORTED_LOCALES.includes(deviceLocale as AppLocale)
    ? deviceLocale
    : "fr";

i18n.enableFallback = true;
i18n.defaultLocale = "fr";

export default i18n;
