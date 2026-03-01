/**
 * Service de traduction instantanée
 *
 * Traduit des messages texte via le backend platform-core
 * qui proxy vers Google Translate API / DeepL.
 *
 * Supporte :
 * - Détection automatique de langue
 * - Traduction à la demande (tap pour traduire)
 * - Cache local via AsyncStorage (économie d'appels API)
 * - Support 50+ langues
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createLogger } from "./logger";
import { supabase } from "./supabase";

const log = createLogger("Translation");

const PLATFORM_CORE_URL =
    (process.env as Record<string, string | undefined>)[
    "EXPO_PUBLIC_PLATFORM_CORE_URL"
    ] || "http://localhost:8080";

const CACHE_PREFIX = "translation:";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

// === TYPES ===

export interface TranslationResult {
    translatedText: string;
    detectedLanguage: string;
    targetLanguage: string;
    confidence?: number;
    cached?: boolean;
}

export interface DetectLanguageResult {
    language: string;
    confidence: number;
}

export interface TranslationOptions {
    /** Langue source (code ISO 639-1). Auto-détection si omis. */
    sourceLang?: string;
    /** Langue cible (code ISO 639-1). Requis. */
    targetLang: string;
}

/** Langues supportées pour la traduction */
export const SUPPORTED_LANGUAGES: Record<string, string> = {
    fr: "Français",
    en: "English",
    ja: "日本語",
    es: "Español",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    zh: "中文",
    ko: "한국어",
    ar: "العربية",
    ru: "Русский",
    hi: "हिन्दी",
    tr: "Türkçe",
    nl: "Nederlands",
    pl: "Polski",
    sv: "Svenska",
    da: "Dansk",
    no: "Norsk",
    fi: "Suomi",
    el: "Ελληνικά",
    cs: "Čeština",
    ro: "Română",
    hu: "Magyar",
    uk: "Українська",
    th: "ไทย",
    vi: "Tiếng Việt",
    id: "Bahasa Indonesia",
    ms: "Bahasa Melayu",
    tl: "Filipino",
    sw: "Kiswahili",
    he: "עברית",
    fa: "فارسی",
    bn: "বাংলা",
    ta: "தமிழ்",
    te: "తెలుగు",
    mr: "मराठी",
    ur: "اردو",
    pa: "ਪੰਜਾਬੀ",
    gu: "ગુજરાતી",
    kn: "ಕನ್ನಡ",
    ml: "മലയാളം",
    si: "සිංහල",
    my: "မြန်မာ",
    km: "ខ្មែរ",
    lo: "ລາວ",
    ka: "ქართული",
    am: "አማርኛ",
    ne: "नेपाली",
    mn: "Монгол",
    bg: "Български",
    hr: "Hrvatski",
    sk: "Slovenčina",
    sl: "Slovenščina",
    lt: "Lietuvių",
    lv: "Latviešu",
    et: "Eesti",
    af: "Afrikaans",
    sq: "Shqip",
    mk: "Македонски",
    bs: "Bosanski",
    sr: "Српски",
    is: "Íslenska",
    ga: "Gaeilge",
    mt: "Malti",
    cy: "Cymraeg",
    eu: "Euskara",
    ca: "Català",
    gl: "Galego",
    la: "Latina",
};

// === CACHE LOCAL ===

/**
 * Génère une clé de cache à partir du texte et de la langue cible.
 */
function cacheKey(text: string, targetLang: string): string {
    let hash = 0;
    const input = `${text}::${targetLang}`;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return `${CACHE_PREFIX}${Math.abs(hash).toString(36)}`;
}

async function getCachedTranslation(
    text: string,
    targetLang: string,
): Promise<TranslationResult | null> {
    try {
        const key = cacheKey(text, targetLang);
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return null;

        const cached = JSON.parse(raw) as {
            result: TranslationResult;
            timestamp: number;
        };

        // Vérifier l'expiration
        if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
            await AsyncStorage.removeItem(key);
            return null;
        }

        return { ...cached.result, cached: true };
    } catch {
        return null;
    }
}

async function setCachedTranslation(
    text: string,
    targetLang: string,
    result: TranslationResult,
): Promise<void> {
    try {
        const key = cacheKey(text, targetLang);
        await AsyncStorage.setItem(
            key,
            JSON.stringify({ result, timestamp: Date.now() }),
        );
    } catch {
        // Ignorer les erreurs de cache
    }
}

// === API ===

/**
 * Récupère le token d'auth Supabase pour les appels API
 */
async function getAuthToken(): Promise<string> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error("Session non trouvée. Veuillez vous reconnecter.");
    }
    return session.access_token;
}

/**
 * Traduit un texte vers la langue cible.
 *
 * Workflow :
 * 1. Vérifie le cache local
 * 2. Appelle le backend `/api/v1/translation/translate`
 * 3. Met en cache le résultat
 *
 * @param text      - Texte à traduire
 * @param options   - Options de traduction (langue cible, source optionnelle)
 * @returns Résultat de la traduction
 */
export async function translateText(
    text: string,
    options: TranslationOptions,
): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
        throw new Error("Le texte à traduire est vide.");
    }

    // 1. Cache local
    const cached = await getCachedTranslation(text, options.targetLang);
    if (cached) {
        log.debug("Traduction trouvée en cache", {
            targetLang: options.targetLang,
        });
        return cached;
    }

    // 2. Appel API
    log.info("Demande de traduction", {
        textLength: text.length,
        targetLang: options.targetLang,
        sourceLang: options.sourceLang,
    });

    const token = await getAuthToken();

    const response = await fetch(
        `${PLATFORM_CORE_URL}/api/v1/translation/translate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                text,
                targetLang: options.targetLang,
                sourceLang: options.sourceLang,
            }),
        },
    );

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = body.error || `Erreur traduction: ${response.status}`;
        log.error(msg);
        throw new Error(msg);
    }

    const result: TranslationResult = await response.json();

    // 3. Cache
    await setCachedTranslation(text, options.targetLang, result);
    log.info("Traduction réussie", {
        detectedLang: result.detectedLanguage,
        targetLang: result.targetLanguage,
    });

    return result;
}

/**
 * Détecte la langue d'un texte.
 *
 * @param text - Texte à analyser
 * @returns Langue détectée (code ISO 639-1) et confiance
 */
export async function detectLanguage(
    text: string,
): Promise<DetectLanguageResult> {
    if (!text || text.trim().length === 0) {
        throw new Error("Le texte à analyser est vide.");
    }

    const token = await getAuthToken();

    const response = await fetch(
        `${PLATFORM_CORE_URL}/api/v1/translation/detect`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text }),
        },
    );

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
            body.error || `Erreur détection de langue: ${response.status}`,
        );
    }

    return response.json();
}

/**
 * Retourne le nom de la langue à partir du code ISO.
 */
export function getLanguageName(langCode: string): string {
    return SUPPORTED_LANGUAGES[langCode] || langCode.toUpperCase();
}
