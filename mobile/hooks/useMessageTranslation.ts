/**
 * useMessageTranslation Hook
 *
 * Gère la traduction à la demande des messages chat.
 * Maintient un état de traduction par message (translatedText, loading, error).
 * Intégré avec le service translation et la locale utilisateur.
 *
 * Usage :
 *   const { translations, translateMessage, clearTranslation, isTranslating } = useMessageTranslation();
 *   // Sur bouton Translate:
 *   await translateMessage(message.id, message.content);
 *   // Affichage :
 *   const tr = translations[message.id]; // { translatedText, fromLang, ... }
 */

import { useI18n } from "@/providers/I18nProvider";
import {
    getLanguageName,
    translateText,
    type TranslationResult,
} from "@/services/translation";
import { useCallback, useRef, useState } from "react";

// === TYPES ===

export interface MessageTranslation {
    translatedText: string;
    detectedLanguage: string;
    detectedLanguageName: string;
    targetLanguage: string;
    cached?: boolean;
}

interface TranslationState {
    /** Map de messageId → traduction */
    translations: Record<string, MessageTranslation>;
    /** Set de messageId en cours de traduction */
    loadingIds: Set<string>;
    /** Map de messageId → erreur */
    errors: Record<string, string>;
}

export interface UseMessageTranslationReturn {
    /** Traductions par messageId */
    translations: Record<string, MessageTranslation>;
    /** Traduire un message */
    translateMessage: (
        messageId: string,
        text: string,
        targetLang?: string,
    ) => Promise<void>;
    /** Effacer la traduction d'un message (toggle off) */
    clearTranslation: (messageId: string) => void;
    /** Effacer toutes les traductions */
    clearAll: () => void;
    /** Vérifier si un message est en cours de traduction */
    isTranslating: (messageId: string) => boolean;
    /** Récupérer l'erreur pour un message */
    getError: (messageId: string) => string | undefined;
}

// === HOOK ===

export function useMessageTranslation(): UseMessageTranslationReturn {
    const { locale } = useI18n();

    const [state, setState] = useState<TranslationState>({
        translations: {},
        loadingIds: new Set(),
        errors: {},
    });

    // Ref to track in-flight requests and avoid duplicates
    const inflightRef = useRef<Set<string>>(new Set());

    const translateMessage = useCallback(
        async (messageId: string, text: string, targetLang?: string) => {
            const target = targetLang || locale;

            // Éviter les traductions en double
            if (inflightRef.current.has(messageId)) return;
            inflightRef.current.add(messageId);

            // Set loading
            setState((prev) => ({
                ...prev,
                loadingIds: new Set(prev.loadingIds).add(messageId),
                errors: { ...prev.errors, [messageId]: undefined } as Record<
                    string,
                    string
                >,
            }));

            try {
                const result: TranslationResult = await translateText(text, {
                    targetLang: target,
                });

                // Si le texte traduit est identique au texte source, ne pas afficher
                const isSameLanguage =
                    result.detectedLanguage === target ||
                    result.translatedText.trim() === text.trim();

                const translation: MessageTranslation = {
                    translatedText: isSameLanguage
                        ? text
                        : result.translatedText,
                    detectedLanguage: result.detectedLanguage,
                    detectedLanguageName: getLanguageName(
                        result.detectedLanguage,
                    ),
                    targetLanguage: result.targetLanguage,
                    cached: result.cached,
                };

                setState((prev) => {
                    const newLoading = new Set(prev.loadingIds);
                    newLoading.delete(messageId);
                    return {
                        ...prev,
                        translations: {
                            ...prev.translations,
                            [messageId]: translation,
                        },
                        loadingIds: newLoading,
                    };
                });
            } catch (err) {
                const errorMsg =
                    err instanceof Error
                        ? err.message
                        : "Erreur de traduction";

                setState((prev) => {
                    const newLoading = new Set(prev.loadingIds);
                    newLoading.delete(messageId);
                    return {
                        ...prev,
                        loadingIds: newLoading,
                        errors: { ...prev.errors, [messageId]: errorMsg },
                    };
                });
            } finally {
                inflightRef.current.delete(messageId);
            }
        },
        [locale],
    );

    const clearTranslation = useCallback((messageId: string) => {
        setState((prev) => {
            const newTranslations = { ...prev.translations };
            delete newTranslations[messageId];
            const newErrors = { ...prev.errors };
            delete newErrors[messageId];
            return {
                ...prev,
                translations: newTranslations,
                errors: newErrors,
            };
        });
    }, []);

    const clearAll = useCallback(() => {
        setState({
            translations: {},
            loadingIds: new Set(),
            errors: {},
        });
    }, []);

    const isTranslating = useCallback(
        (messageId: string) => state.loadingIds.has(messageId),
        [state.loadingIds],
    );

    const getError = useCallback(
        (messageId: string) => state.errors[messageId],
        [state.errors],
    );

    return {
        translations: state.translations,
        translateMessage,
        clearTranslation,
        clearAll,
        isTranslating,
        getError,
    };
}
