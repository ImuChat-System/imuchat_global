/**
 * Audio Player Service — expo-av
 *
 * Gère la lecture audio avec expo-av :
 * - Play / Pause / Stop / Seek
 * - Queue management (next, previous, shuffle)
 * - Background audio (iOS UIBackgroundModes: audio)
 * - Événements de statut (position, buffering, fin de piste)
 *
 * Phase M4 — Module Music natif
 */

import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

import { createLogger } from '@/services/logger';
import type { RepeatMode, Track } from '@/types/music';

const logger = createLogger('AudioPlayer');

// ─── Singleton ────────────────────────────────────────────────

let soundInstance: Audio.Sound | null = null;
let isAudioModeConfigured = false;

/** Callbacks pour remonter les changements d'état au store */
type StatusCallback = (status: {
    isPlaying: boolean;
    positionMs: number;
    durationMs: number;
    isBuffering: boolean;
    didJustFinish: boolean;
}) => void;

let onStatusUpdate: StatusCallback | null = null;

// ─── Configuration ────────────────────────────────────────────

/**
 * Configure le mode audio pour la lecture en arrière-plan.
 * À appeler une seule fois au démarrage.
 */
export async function configureAudioMode(): Promise<void> {
    if (isAudioModeConfigured) return;
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
        isAudioModeConfigured = true;
        logger.info('Audio mode configured for background playback');
    } catch (error) {
        logger.error('Failed to configure audio mode:', error);
    }
}

// ─── Status handler ───────────────────────────────────────────

function handlePlaybackStatus(status: AVPlaybackStatus): void {
    if (!status.isLoaded) {
        if (status.error) {
            logger.error('Playback error:', status.error);
        }
        return;
    }

    const s = status as AVPlaybackStatusSuccess;
    onStatusUpdate?.({
        isPlaying: s.isPlaying,
        positionMs: s.positionMillis,
        durationMs: s.durationMillis ?? 0,
        isBuffering: s.isBuffering,
        didJustFinish: s.didJustFinish,
    });
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Enregistre le callback de mise à jour de statut.
 */
export function setStatusCallback(cb: StatusCallback | null): void {
    onStatusUpdate = cb;
}

/**
 * Charge et joue une piste audio.
 */
export async function playTrack(track: Track): Promise<void> {
    await configureAudioMode();

    // Décharger le son précédent
    if (soundInstance) {
        try {
            await soundInstance.unloadAsync();
        } catch {
            // ignore
        }
        soundInstance = null;
    }

    try {
        const { sound } = await Audio.Sound.createAsync(
            { uri: track.audio_url },
            { shouldPlay: true, progressUpdateIntervalMillis: 500 },
            handlePlaybackStatus,
        );
        soundInstance = sound;
        logger.info(`Playing: ${track.title} — ${track.artist}`);
    } catch (error) {
        logger.error(`Failed to play track ${track.id}:`, error);
        throw error;
    }
}

/**
 * Reprend la lecture.
 */
export async function resume(): Promise<void> {
    if (!soundInstance) return;
    try {
        await soundInstance.playAsync();
    } catch (error) {
        logger.error('Resume failed:', error);
    }
}

/**
 * Met en pause.
 */
export async function pause(): Promise<void> {
    if (!soundInstance) return;
    try {
        await soundInstance.pauseAsync();
    } catch (error) {
        logger.error('Pause failed:', error);
    }
}

/**
 * Arrête la lecture et décharge le son.
 */
export async function stop(): Promise<void> {
    if (!soundInstance) return;
    try {
        await soundInstance.stopAsync();
        await soundInstance.unloadAsync();
        soundInstance = null;
        logger.info('Playback stopped and unloaded');
    } catch (error) {
        logger.error('Stop failed:', error);
    }
}

/**
 * Saute à une position (en ms).
 */
export async function seekTo(positionMs: number): Promise<void> {
    if (!soundInstance) return;
    try {
        await soundInstance.setPositionAsync(positionMs);
    } catch (error) {
        logger.error('Seek failed:', error);
    }
}

/**
 * Change le volume (0-1).
 */
export async function setVolume(volume: number): Promise<void> {
    if (!soundInstance) return;
    try {
        await soundInstance.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (error) {
        logger.error('Set volume failed:', error);
    }
}

/**
 * Définit le mode de boucle.
 */
export async function setLooping(mode: RepeatMode): Promise<void> {
    if (!soundInstance) return;
    try {
        await soundInstance.setIsLoopingAsync(mode === 'one');
    } catch (error) {
        logger.error('Set looping failed:', error);
    }
}

/**
 * Retourne true si une piste est actuellement chargée.
 */
export function isLoaded(): boolean {
    return soundInstance !== null;
}

/**
 * Nettoyage complet — à appeler quand l'app se ferme.
 */
export async function cleanup(): Promise<void> {
    onStatusUpdate = null;
    if (soundInstance) {
        try {
            await soundInstance.unloadAsync();
        } catch {
            // ignore
        }
        soundInstance = null;
    }
    logger.info('Audio player cleaned up');
}
