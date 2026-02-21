/**
 * Hook useTranscription
 *
 * Fournit un état réactif pour la transcription d'un message vocal.
 * Gère loading, erreur, et résultat.
 *
 * @example
 * const { transcription, loading, error, transcribe } = useTranscription();
 * // Au tap "Transcrire"
 * await transcribe(audioUrl);
 * // transcription contient le texte
 */

import {
    transcribeAudio,
    type TranscriptionOptions,
    type TranscriptionResult,
} from "@/services/transcription";
import { useCallback, useState } from "react";

interface UseTranscriptionReturn {
    /** Résultat de la transcription (null si pas encore demandée) */
    transcription: TranscriptionResult | null;
    /** Chargement en cours */
    loading: boolean;
    /** Erreur éventuelle */
    error: string | null;
    /** Déclenche la transcription pour une URL audio */
    transcribe: (audioUrl: string, options?: TranscriptionOptions) => Promise<TranscriptionResult | null>;
    /** Remet à zéro l'état */
    reset: () => void;
}

export function useTranscription(): UseTranscriptionReturn {
    const [transcription, setTranscription] =
        useState<TranscriptionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const transcribe = useCallback(
        async (
            audioUrl: string,
            options?: TranscriptionOptions,
        ): Promise<TranscriptionResult | null> => {
            setLoading(true);
            setError(null);

            try {
                const result = await transcribeAudio(audioUrl, options);
                setTranscription(result);
                return result;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Erreur de transcription";
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setTranscription(null);
        setLoading(false);
        setError(null);
    }, []);

    return { transcription, loading, error, transcribe, reset };
}
