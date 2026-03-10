/**
 * Audio Mixer Service — Mixage vidéo + musique
 *
 * Gère la lecture simultanée de l'audio vidéo et d'une piste musique
 * avec contrôle de volume indépendant.
 *
 * Utilise deux instances expo-av (Video + Audio.Sound) :
 * - Piste vidéo : volume contrôlé via le composant Video
 * - Piste musique : volume contrôlé via Audio.Sound
 *
 * Sprint S9 Axe B — Musique & Son
 */

import { Audio } from 'expo-av';

import { createLogger } from '@/services/logger';
import type { VideoSound } from '@/types/imufeed';

const logger = createLogger('AudioMixer');

// ─── Types ────────────────────────────────────────────────────

export interface MixState {
    /** Piste musique chargée */
    sound: VideoSound | null;
    /** Volume musique (0-1) */
    musicVolume: number;
    /** Volume vidéo (0-1) */
    videoVolume: number;
    /** La musique est en cours de lecture */
    isMusicPlaying: boolean;
    /** Position de lecture musique (ms) */
    musicPositionMs: number;
}

export interface MixConfig {
    /** Son à mixer */
    sound: VideoSound;
    /** Volume musique initial (0-1) */
    musicVolume?: number;
    /** Volume vidéo initial (0-1) */
    videoVolume?: number;
    /** Offset de départ dans le clip audio (ms) */
    startOffsetMs?: number;
}

// ─── Singleton ────────────────────────────────────────────────

let musicSoundInstance: Audio.Sound | null = null;
let currentMixState: MixState = {
    sound: null,
    musicVolume: 0.5,
    videoVolume: 1,
    isMusicPlaying: false,
    musicPositionMs: 0,
};

type MixStatusCallback = (state: MixState) => void;
let onMixStatusUpdate: MixStatusCallback | null = null;

// ─── Public API ───────────────────────────────────────────────

/**
 * Enregistre un callback pour recevoir les changements d'état du mix.
 */
export function setMixStatusCallback(callback: MixStatusCallback | null): void {
    onMixStatusUpdate = callback;
}

/**
 * Charge un son et prépare le mixage.
 */
export async function loadMusicTrack(config: MixConfig): Promise<void> {
    // Nettoyer l'instance précédente
    await unloadMusicTrack();

    try {
        const { sound: audioSound } = await Audio.Sound.createAsync(
            { uri: config.sound.audio_url },
            {
                shouldPlay: false,
                volume: config.musicVolume ?? 0.5,
                positionMillis: config.startOffsetMs ?? 0,
                isLooping: true, // Loop la musique en boucle pour couvrir la durée vidéo
            },
            onMusicPlaybackStatus,
        );

        musicSoundInstance = audioSound;
        currentMixState = {
            sound: config.sound,
            musicVolume: config.musicVolume ?? 0.5,
            videoVolume: config.videoVolume ?? 1,
            isMusicPlaying: false,
            musicPositionMs: config.startOffsetMs ?? 0,
        };
        notifyStatus();
        logger.info(`Loaded music track: ${config.sound.title}`);
    } catch (error) {
        logger.error('Failed to load music track:', error);
        throw error;
    }
}

/**
 * Décharge le son en mémoire.
 */
export async function unloadMusicTrack(): Promise<void> {
    if (musicSoundInstance) {
        try {
            await musicSoundInstance.stopAsync();
            await musicSoundInstance.unloadAsync();
        } catch {
            // Ignore cleanup errors
        }
        musicSoundInstance = null;
    }
    currentMixState = {
        sound: null,
        musicVolume: 0.5,
        videoVolume: 1,
        isMusicPlaying: false,
        musicPositionMs: 0,
    };
    notifyStatus();
}

/**
 * Démarre la lecture de la piste musique.
 */
export async function playMusic(): Promise<void> {
    if (!musicSoundInstance) return;
    try {
        await musicSoundInstance.playAsync();
    } catch (error) {
        logger.error('Failed to play music:', error);
    }
}

/**
 * Met en pause la piste musique.
 */
export async function pauseMusic(): Promise<void> {
    if (!musicSoundInstance) return;
    try {
        await musicSoundInstance.pauseAsync();
    } catch (error) {
        logger.error('Failed to pause music:', error);
    }
}

/**
 * Modifie le volume musique (0-1).
 */
export async function setMusicVolume(volume: number): Promise<void> {
    const clamped = Math.max(0, Math.min(1, volume));
    currentMixState.musicVolume = clamped;
    if (musicSoundInstance) {
        try {
            await musicSoundInstance.setVolumeAsync(clamped);
        } catch (error) {
            logger.error('Failed to set music volume:', error);
        }
    }
    notifyStatus();
}

/**
 * Modifie le volume vidéo (0-1).
 * Note : le volume vidéo est appliqué côté composant Video (pas ici).
 * Ce setter met juste à jour le state partagé.
 */
export function setVideoVolume(volume: number): void {
    currentMixState.videoVolume = Math.max(0, Math.min(1, volume));
    notifyStatus();
}

/**
 * Seek dans la piste musique.
 */
export async function seekMusic(positionMs: number): Promise<void> {
    if (!musicSoundInstance) return;
    try {
        await musicSoundInstance.setPositionAsync(positionMs);
    } catch (error) {
        logger.error('Failed to seek music:', error);
    }
}

/**
 * Retourne l'état courant du mix.
 */
export function getMixState(): MixState {
    return { ...currentMixState };
}

// ─── Internal ─────────────────────────────────────────────────

function onMusicPlaybackStatus(status: unknown): void {
    if (!status || typeof status !== 'object' || !('isLoaded' in (status as Record<string, unknown>))) return;
    const s = status as { isLoaded: boolean; isPlaying?: boolean; positionMillis?: number };
    if (!s.isLoaded) return;

    currentMixState.isMusicPlaying = s.isPlaying ?? false;
    currentMixState.musicPositionMs = s.positionMillis ?? 0;
    notifyStatus();
}

function notifyStatus(): void {
    onMixStatusUpdate?.({ ...currentMixState });
}
