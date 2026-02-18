/**
 * Service d'enregistrement vocal pour mobile
 * Utilise expo-av pour capturer l'audio et le télécharger vers Supabase Storage
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { getCurrentUser, supabase } from './supabase';

// Types
export interface VoiceRecording {
    uri: string;
    duration: number; // in milliseconds
    mimeType: string;
}

export interface VoiceUploadResult {
    url: string;
    duration: number;
    mimeType: string;
    size: number;
}

// Recording states
export type RecordingStatus = 'idle' | 'preparing' | 'recording' | 'paused' | 'stopped' | 'uploading';

let currentRecording: Audio.Recording | null = null;

/**
 * Request audio recording permissions
 */
export async function requestPermissions(): Promise<boolean> {
    try {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting audio permissions:', error);
        return false;
    }
}

/**
 * Configure audio mode for recording
 */
async function configureAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
    });
}

/**
 * Start a new voice recording
 */
export async function startRecording(): Promise<Audio.Recording> {
    // Stop any existing recording
    if (currentRecording) {
        await stopRecording();
    }

    // Request permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
        throw new Error('Microphone permission not granted');
    }

    // Configure audio mode
    await configureAudioMode();

    // Create and start new recording
    const recording = new Audio.Recording();

    await recording.prepareToRecordAsync({
        android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
        },
        ios: {
            extension: '.m4a',
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
        },
    });

    await recording.startAsync();
    currentRecording = recording;

    return recording;
}

/**
 * Stop the current recording and return the result
 */
export async function stopRecording(): Promise<VoiceRecording | null> {
    if (!currentRecording) {
        return null;
    }

    try {
        const status = await currentRecording.getStatusAsync();

        if (status.isRecording) {
            await currentRecording.stopAndUnloadAsync();
        }

        const uri = currentRecording.getURI();
        const duration = status.durationMillis || 0;

        // Reset audio mode
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });

        currentRecording = null;

        if (!uri) {
            return null;
        }

        return {
            uri,
            duration,
            mimeType: 'audio/m4a',
        };
    } catch (error) {
        console.error('Error stopping recording:', error);
        currentRecording = null;
        return null;
    }
}

/**
 * Cancel the current recording without saving
 */
export async function cancelRecording(): Promise<void> {
    if (!currentRecording) {
        return;
    }

    try {
        const status = await currentRecording.getStatusAsync();

        if (status.isRecording) {
            await currentRecording.stopAndUnloadAsync();
        }

        const uri = currentRecording.getURI();
        if (uri) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        }

        // Reset audio mode
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
    } catch (error) {
        console.error('Error cancelling recording:', error);
    } finally {
        currentRecording = null;
    }
}

/**
 * Get recording status (for UI updates)
 */
export async function getRecordingStatus(): Promise<{
    isRecording: boolean;
    durationMillis: number;
    metering?: number;
} | null> {
    if (!currentRecording) {
        return null;
    }

    try {
        const status = await currentRecording.getStatusAsync();
        return {
            isRecording: status.isRecording,
            durationMillis: status.durationMillis || 0,
            metering: status.metering,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Upload voice recording to Supabase Storage
 */
export async function uploadVoiceNote(
    recording: VoiceRecording,
    onProgress?: (progress: number) => void
): Promise<VoiceUploadResult> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    onProgress?.(10);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(recording.uri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    onProgress?.(30);

    // Convert base64 to ArrayBuffer
    const { decode } = await import('base64-arraybuffer');
    const arrayBuffer = decode(base64);

    onProgress?.(50);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}_voice.m4a`;

    // Upload to Supabase
    const { error } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, arrayBuffer, {
            contentType: recording.mimeType,
            upsert: false,
        });

    if (error) {
        throw error;
    }
    onProgress?.(80);

    // Get signed URL
    const { data: urlData, error: urlError } = await supabase.storage
        .from('voice-notes')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    if (urlError) {
        throw urlError;
    }
    onProgress?.(100);

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(recording.uri);
    const size = (fileInfo as { size?: number }).size || 0;

    // Clean up local file
    await FileSystem.deleteAsync(recording.uri, { idempotent: true });

    return {
        url: urlData.signedUrl,
        duration: recording.duration,
        mimeType: recording.mimeType,
        size,
    };
}

/**
 * Format duration as mm:ss
 */
export function formatDuration(millis: number): string {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
