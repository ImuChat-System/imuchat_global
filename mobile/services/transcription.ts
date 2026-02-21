/**
 * Service de transcription vocale
 *
 * Envoie un fichier audio au backend platform-core pour transcription
 * via Whisper (OpenAI) ou Google Speech-to-Text.
 *
 * Supporte :
 * - Transcription à la demande (tap pour transcrire)
 * - Cache local via AsyncStorage
 * - Fallback en cas d'erreur API
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createLogger } from "./logger";
import { supabase } from "./supabase";

const log = createLogger("Transcription");

const PLATFORM_CORE_URL =
    (process.env as Record<string, string | undefined>)[
    "EXPO_PUBLIC_PLATFORM_CORE_URL"
    ] || "http://localhost:8080";

const CACHE_PREFIX = "transcription:";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

// === TYPES ===

export interface TranscriptionResult {
    text: string;
    language?: string;
    confidence?: number;
    duration?: number; // durée audio en secondes
    cached?: boolean;
}

export interface TranscriptionOptions {
    /** Langue attendue (code ISO 639-1). Auto-détection si omis. */
    language?: string;
    /** Prompt contextuel pour améliorer la précision */
    prompt?: string;
}

// === CACHE LOCAL ===

async function getCachedTranscription(
    audioUrl: string,
): Promise<TranscriptionResult | null> {
    try {
        const key = `${CACHE_PREFIX}${hashUrl(audioUrl)}`;
        const raw = await AsyncStorage.getItem(key);
        if (!raw) return null;

        const cached = JSON.parse(raw) as {
            result: TranscriptionResult;
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

async function setCachedTranscription(
    audioUrl: string,
    result: TranscriptionResult,
): Promise<void> {
    try {
        const key = `${CACHE_PREFIX}${hashUrl(audioUrl)}`;
        await AsyncStorage.setItem(
            key,
            JSON.stringify({ result, timestamp: Date.now() }),
        );
    } catch {
        // Ignorer les erreurs de cache
    }
}

function hashUrl(url: string): string {
    // Hash simple pour clé de cache
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
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
 * Transcrit un message vocal à partir de son URL audio.
 *
 * Workflow :
 * 1. Vérifie le cache local
 * 2. Appelle le backend `/api/v1/transcription/transcribe`
 * 3. Met en cache le résultat
 *
 * @param audioUrl - URL du fichier audio (Supabase Storage signed URL)
 * @param options  - Options de transcription
 * @returns Résultat de la transcription
 */
export async function transcribeAudio(
    audioUrl: string,
    options: TranscriptionOptions = {},
): Promise<TranscriptionResult> {
    // 1. Cache local
    const cached = await getCachedTranscription(audioUrl);
    if (cached) {
        log.debug("Transcription trouvée en cache", { audioUrl: audioUrl.slice(0, 60) });
        return cached;
    }

    // 2. Appel API
    log.info("Demande de transcription", { audioUrl: audioUrl.slice(0, 60) });

    const token = await getAuthToken();

    const response = await fetch(
        `${PLATFORM_CORE_URL}/api/v1/transcription/transcribe`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                audioUrl,
                language: options.language,
                prompt: options.prompt,
            }),
        },
    );

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg =
            body.error || `Erreur transcription: ${response.status}`;
        log.error(msg);
        throw new Error(msg);
    }

    const result: TranscriptionResult = await response.json();

    // 3. Cache
    await setCachedTranscription(audioUrl, result);
    log.info("Transcription réussie", {
        length: result.text.length,
        language: result.language,
    });

    return result;
}

/**
 * Transcrit un message vocal en identifiant le message par son ID.
 * Utile si la transcription doit être sauvegardée côté serveur.
 *
 * @param messageId - ID du message contenant l'audio
 * @returns Résultat de la transcription
 */
export async function transcribeMessage(
    messageId: string,
): Promise<TranscriptionResult> {
    const token = await getAuthToken();

    const response = await fetch(
        `${PLATFORM_CORE_URL}/api/v1/transcription/message/${messageId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Erreur transcription: ${response.status}`);
    }

    return response.json();
}
