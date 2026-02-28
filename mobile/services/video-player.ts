/**
 * Video Player Service — expo-av (expo-video-ready)
 *
 * Gère la lecture vidéo avec expo-av :
 * - Play / Pause / Seek
 * - Plein écran (via ref du composant Video)
 * - PiP (prêt pour expo-video quand migration)
 *
 * Phase M4 — Module Watch natif
 */

import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess, ResizeMode, Video } from 'expo-av';

import { createLogger } from '@/services/logger';
import type { WatchItem } from '@/types/watch';

const logger = createLogger('VideoPlayer');

// ─── Singleton ref ────────────────────────────────────────────

let videoRef: Video | null = null;

/** Callbacks pour remonter les changements d'état au store */
type VideoStatusCallback = (status: {
    isLoaded: boolean;
    positionMillis?: number;
    durationMillis?: number;
    isPlaying: boolean;
    positionMs: number;
    durationMs: number;
    isBuffering: boolean;
    didJustFinish: boolean;
}) => void;

let onStatusUpdate: VideoStatusCallback | null = null;

// ─── Configuration ────────────────────────────────────────────

/**
 * Configure le mode audio pour la vidéo (mêmes options que l'audio player).
 */
export async function configureVideoAudioMode(): Promise<void> {
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
        logger.info('Video audio mode configured');
    } catch (error) {
        logger.error('Failed to configure video audio mode:', error);
    }
}

// ─── Status handler ───────────────────────────────────────────

export function handleVideoPlaybackStatus(status: AVPlaybackStatus): void {
    if (!status.isLoaded) {
        if (status.error) {
            logger.error('Video playback error:', status.error);
        }
        return;
    }

    const s = status as AVPlaybackStatusSuccess;
    onStatusUpdate?.({
        isLoaded: true,
        isPlaying: s.isPlaying,
        positionMillis: s.positionMillis,
        durationMillis: s.durationMillis ?? 0,
        positionMs: s.positionMillis,
        durationMs: s.durationMillis ?? 0,
        isBuffering: s.isBuffering,
        didJustFinish: s.didJustFinish,
    });
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Enregistre le composant Video de référence.
 */
export function setVideoRef(ref: Video | null): void {
    videoRef = ref;
}

/**
 * Enregistre le callback de mise à jour de statut.
 */
export function setVideoStatusCallback(cb: VideoStatusCallback | null): void {
    onStatusUpdate = cb;
}

/**
 * Charge et joue une vidéo.
 */
export async function loadVideo(video: WatchItem): Promise<void> {
    await configureVideoAudioMode();
    if (!videoRef) {
        logger.warn('No video ref set — cannot load video');
        return;
    }
    try {
        await videoRef.loadAsync(
            { uri: video.video_url },
            { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        );
        logger.info(`Video loaded: ${video.title}`);
    } catch (error) {
        logger.error(`Failed to load video ${video.id}:`, error);
        throw error;
    }
}

/**
 * Play.
 */
export async function playVideo(): Promise<void> {
    if (!videoRef) return;
    try {
        await videoRef.playAsync();
    } catch (error) {
        logger.error('Video play failed:', error);
    }
}

/**
 * Pause.
 */
export async function pauseVideo(): Promise<void> {
    if (!videoRef) return;
    try {
        await videoRef.pauseAsync();
    } catch (error) {
        logger.error('Video pause failed:', error);
    }
}

/**
 * Seek.
 */
export async function seekVideo(positionMs: number): Promise<void> {
    if (!videoRef) return;
    try {
        await videoRef.setPositionAsync(positionMs);
    } catch (error) {
        logger.error('Video seek failed:', error);
    }
}

/**
 * Plein écran (via composant Video — presentFullscreenPlayer).
 */
export async function enterFullscreen(): Promise<void> {
    if (!videoRef) return;
    try {
        await videoRef.presentFullscreenPlayer();
        logger.info('Entered fullscreen');
    } catch (error) {
        logger.error('Fullscreen failed:', error);
    }
}

/**
 * Quitter plein écran.
 */
export async function exitFullscreen(): Promise<void> {
    if (!videoRef) return;
    try {
        await videoRef.dismissFullscreenPlayer();
        logger.info('Exited fullscreen');
    } catch (error) {
        logger.error('Exit fullscreen failed:', error);
    }
}

/**
 * Décharge la vidéo.
 */
export async function unloadVideo(): Promise<void> {
    if (!videoRef) return;
    try {
        await videoRef.unloadAsync();
        logger.info('Video unloaded');
    } catch (error) {
        logger.error('Unload video failed:', error);
    }
}

/** Expose ResizeMode pour usage dans les composants */
export { ResizeMode };
