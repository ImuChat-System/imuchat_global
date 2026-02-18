/**
 * Hook pour l'enregistrement vocal
 * Gère l'état d'enregistrement avec des mises à jour temps réel
 */

import {
    cancelRecording,
    formatDuration,
    getRecordingStatus,
    RecordingStatus,
    requestPermissions,
    startRecording,
    stopRecording,
    uploadVoiceNote,
    VoiceRecording,
    VoiceUploadResult,
} from '@/services/voice-recording';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseVoiceRecordingReturn {
    /** Current recording status */
    status: RecordingStatus;
    /** Recording duration in ms */
    duration: number;
    /** Formatted duration (mm:ss) */
    formattedDuration: string;
    /** Audio metering level (-160 to 0 dB) */
    metering: number | null;
    /** Upload progress (0-100) */
    uploadProgress: number;
    /** Error message */
    error: string | null;
    /** Has microphone permission */
    hasPermission: boolean | null;
    /** Start recording */
    start: () => Promise<void>;
    /** Stop and get recording */
    stop: () => Promise<VoiceRecording | null>;
    /** Cancel recording */
    cancel: () => Promise<void>;
    /** Upload recorded audio */
    upload: (recording: VoiceRecording) => Promise<VoiceUploadResult | null>;
    /** Request permissions */
    requestPermission: () => Promise<boolean>;
}

/**
 * Hook pour gérer l'enregistrement vocal
 */
export function useVoiceRecording(): UseVoiceRecordingReturn {
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const [duration, setDuration] = useState(0);
    const [metering, setMetering] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const statusInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check permissions on mount
    useEffect(() => {
        requestPermissions().then(setHasPermission);
    }, []);

    // Clear interval on unmount
    useEffect(() => {
        return () => {
            if (statusInterval.current) {
                clearInterval(statusInterval.current);
            }
        };
    }, []);

    // Start polling recording status
    const startStatusPolling = useCallback(() => {
        if (statusInterval.current) {
            clearInterval(statusInterval.current);
        }

        statusInterval.current = setInterval(async () => {
            const recordingStatus = await getRecordingStatus();
            if (recordingStatus) {
                setDuration(recordingStatus.durationMillis);
                setMetering(recordingStatus.metering ?? null);
            }
        }, 100);
    }, []);

    // Stop polling
    const stopStatusPolling = useCallback(() => {
        if (statusInterval.current) {
            clearInterval(statusInterval.current);
            statusInterval.current = null;
        }
    }, []);

    // Request permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        const granted = await requestPermissions();
        setHasPermission(granted);
        return granted;
    }, []);

    // Start recording
    const start = useCallback(async () => {
        try {
            setError(null);
            setStatus('preparing');
            setDuration(0);
            setMetering(null);

            await startRecording();

            setStatus('recording');
            startStatusPolling();
        } catch (err) {
            console.error('Error starting recording:', err);
            setError(err instanceof Error ? err.message : 'Failed to start recording');
            setStatus('idle');
        }
    }, [startStatusPolling]);

    // Stop recording
    const stop = useCallback(async (): Promise<VoiceRecording | null> => {
        try {
            stopStatusPolling();
            setStatus('stopped');

            const recording = await stopRecording();

            if (!recording) {
                setStatus('idle');
                return null;
            }

            return recording;
        } catch (err) {
            console.error('Error stopping recording:', err);
            setError(err instanceof Error ? err.message : 'Failed to stop recording');
            setStatus('idle');
            return null;
        }
    }, [stopStatusPolling]);

    // Cancel recording
    const cancel = useCallback(async () => {
        try {
            stopStatusPolling();
            await cancelRecording();
            setStatus('idle');
            setDuration(0);
            setMetering(null);
            setError(null);
        } catch (err) {
            console.error('Error cancelling recording:', err);
            setStatus('idle');
        }
    }, [stopStatusPolling]);

    // Upload recording
    const upload = useCallback(async (
        recording: VoiceRecording
    ): Promise<VoiceUploadResult | null> => {
        try {
            setError(null);
            setStatus('uploading');
            setUploadProgress(0);

            const result = await uploadVoiceNote(recording, setUploadProgress);

            setStatus('idle');
            setUploadProgress(0);
            setDuration(0);

            return result;
        } catch (err) {
            console.error('Error uploading voice note:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload voice note');
            setStatus('idle');
            return null;
        }
    }, []);

    return {
        status,
        duration,
        formattedDuration: formatDuration(duration),
        metering,
        uploadProgress,
        error,
        hasPermission,
        start,
        stop,
        cancel,
        upload,
        requestPermission,
    };
}
