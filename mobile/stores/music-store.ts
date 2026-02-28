/**
 * Music Store (Zustand)
 *
 * Gère l'état global du lecteur de musique :
 * - File d'attente (queue)
 * - Piste en cours
 * - Contrôles (play, pause, next, prev, shuffle, repeat)
 * - Playlists
 *
 * Phase M4 — Module Music natif
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as AudioPlayer from '@/services/audio-player';
import { createLogger } from '@/services/logger';
import type { PlayerState, Playlist, RepeatMode, Track } from '@/types/music';

const logger = createLogger('MusicStore');

// ─── Mock playlists (backend sera branché plus tard) ──────────

const MOCK_TRACKS: Track[] = [
    {
        id: 't1',
        title: 'Nuit Étoilée',
        artist: 'ImuBeats',
        album: 'Ambient Vol.1',
        audio_url: 'https://cdn.imuchat.app/music/nuit-etoilee.mp3',
        artwork_url: null,
        duration_ms: 215000,
        genre: 'electronic',
        play_count: 1240,
        is_liked: false,
        created_at: '2026-01-15T10:00:00Z',
    },
    {
        id: 't2',
        title: 'Sakura Dream',
        artist: 'Yuki',
        album: 'J-Pop Beats',
        audio_url: 'https://cdn.imuchat.app/music/sakura-dream.mp3',
        artwork_url: null,
        duration_ms: 198000,
        genre: 'jpop',
        play_count: 890,
        is_liked: true,
        created_at: '2026-01-20T14:00:00Z',
    },
    {
        id: 't3',
        title: 'City Groove',
        artist: 'MC Flow',
        album: 'Urban Collection',
        audio_url: 'https://cdn.imuchat.app/music/city-groove.mp3',
        artwork_url: null,
        duration_ms: 245000,
        genre: 'hiphop',
        play_count: 2100,
        is_liked: false,
        created_at: '2026-02-01T09:00:00Z',
    },
    {
        id: 't4',
        title: 'Afro Sunshine',
        artist: 'Kwame',
        album: 'Global Beats',
        audio_url: 'https://cdn.imuchat.app/music/afro-sunshine.mp3',
        artwork_url: null,
        duration_ms: 230000,
        genre: 'afrobeat',
        play_count: 1560,
        is_liked: true,
        created_at: '2026-02-10T16:00:00Z',
    },
    {
        id: 't5',
        title: 'Piano Nocturne',
        artist: 'ClassicImu',
        album: 'Instrumental',
        audio_url: 'https://cdn.imuchat.app/music/piano-nocturne.mp3',
        artwork_url: null,
        duration_ms: 310000,
        genre: 'classical',
        play_count: 670,
        is_liked: false,
        created_at: '2026-02-15T11:00:00Z',
    },
];

const MOCK_PLAYLISTS: Playlist[] = [
    {
        id: 'pl1',
        name: 'Chill Vibes',
        description: 'Musique relaxante pour se détendre',
        artwork_url: null,
        owner_id: 'system',
        owner_username: 'ImuChat',
        is_public: true,
        track_count: 3,
        total_duration_ms: 640000,
        tracks: [MOCK_TRACKS[0], MOCK_TRACKS[4], MOCK_TRACKS[1]],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'pl2',
        name: 'Workout Mix',
        description: 'Énergie pure pour le sport',
        artwork_url: null,
        owner_id: 'system',
        owner_username: 'ImuChat',
        is_public: true,
        track_count: 3,
        total_duration_ms: 673000,
        tracks: [MOCK_TRACKS[2], MOCK_TRACKS[3], MOCK_TRACKS[0]],
        created_at: '2026-01-10T00:00:00Z',
        updated_at: '2026-02-10T00:00:00Z',
    },
    {
        id: 'pl3',
        name: 'J-Pop & K-Pop',
        description: 'Les meilleurs titres asiatiques',
        artwork_url: null,
        owner_id: 'system',
        owner_username: 'ImuChat',
        is_public: true,
        track_count: 2,
        total_duration_ms: 413000,
        tracks: [MOCK_TRACKS[1], MOCK_TRACKS[0]],
        created_at: '2026-02-01T00:00:00Z',
        updated_at: '2026-02-20T00:00:00Z',
    },
];

// ─── Interfaces ───────────────────────────────────────────────

interface MusicState extends PlayerState {
    // --- Bibliothèque ---
    playlists: Playlist[];
    likedTracks: Track[];
    recentlyPlayed: Track[];

    // --- Actions player ---
    play: (track: Track, queue?: Track[]) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    next: () => Promise<void>;
    previous: () => Promise<void>;
    seekTo: (positionMs: number) => Promise<void>;
    setRepeat: (mode: RepeatMode) => void;
    toggleShuffle: () => void;
    stopPlayback: () => Promise<void>;

    // --- Actions bibliothèque ---
    loadLibrary: () => Promise<void>;
    toggleLike: (trackId: string) => void;

    // --- Helpers ---
    formatDuration: (ms: number) => string;
}

// ─── Helpers ──────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ─── Store ────────────────────────────────────────────────────

export const useMusicStore = create<MusicState>()(
    persist(
        (set, get) => {
            // Register status callback from audio player
            AudioPlayer.setStatusCallback((status) => {
                const state = get();
                set({
                    isPlaying: status.isPlaying,
                    positionMs: status.positionMs,
                    durationMs: status.durationMs,
                    isBuffering: status.isBuffering,
                });

                // Track finished → auto next
                if (status.didJustFinish) {
                    const { repeatMode, currentTrack } = state;
                    if (repeatMode === 'one' && currentTrack) {
                        // Replay same track
                        AudioPlayer.playTrack(currentTrack).catch(() => { });
                    } else {
                        get().next().catch(() => { });
                    }
                }
            });

            return {
                // --- Player state ---
                currentTrack: null,
                queue: [],
                queueIndex: -1,
                isPlaying: false,
                positionMs: 0,
                durationMs: 0,
                isBuffering: false,
                repeatMode: 'off' as RepeatMode,
                shuffle: false,
                volume: 1,

                // --- Library ---
                playlists: [],
                likedTracks: [],
                recentlyPlayed: [],

                // ─── Play a track ──────────────────────────────────
                play: async (track: Track, queue?: Track[]) => {
                    const newQueue = queue ?? [track];
                    const idx = newQueue.findIndex((t) => t.id === track.id);
                    const actualQueue = get().shuffle ? shuffleArray(newQueue) : newQueue;
                    const actualIdx = actualQueue.findIndex((t) => t.id === track.id);

                    set({
                        currentTrack: track,
                        queue: actualQueue,
                        queueIndex: actualIdx >= 0 ? actualIdx : 0,
                        positionMs: 0,
                        durationMs: track.duration_ms,
                    });

                    try {
                        await AudioPlayer.playTrack(track);
                        // Add to recently played
                        set((s) => ({
                            recentlyPlayed: [track, ...s.recentlyPlayed.filter((t) => t.id !== track.id)].slice(0, 20),
                        }));
                    } catch (error) {
                        logger.error('Failed to play:', error);
                        set({ isPlaying: false, isBuffering: false });
                    }
                },

                // ─── Toggle play/pause ─────────────────────────────
                togglePlayPause: async () => {
                    const { isPlaying, currentTrack } = get();
                    if (!currentTrack) return;

                    if (isPlaying) {
                        await AudioPlayer.pause();
                    } else {
                        await AudioPlayer.resume();
                    }
                },

                // ─── Next track ────────────────────────────────────
                next: async () => {
                    const { queue, queueIndex, repeatMode } = get();
                    if (queue.length === 0) return;

                    let nextIdx = queueIndex + 1;
                    if (nextIdx >= queue.length) {
                        if (repeatMode === 'all') {
                            nextIdx = 0;
                        } else {
                            // End of queue
                            await AudioPlayer.stop();
                            set({ isPlaying: false, positionMs: 0 });
                            return;
                        }
                    }

                    const nextTrack = queue[nextIdx];
                    set({ currentTrack: nextTrack, queueIndex: nextIdx, positionMs: 0 });
                    try {
                        await AudioPlayer.playTrack(nextTrack);
                    } catch (error) {
                        logger.error('Next failed:', error);
                    }
                },

                // ─── Previous track ────────────────────────────────
                previous: async () => {
                    const { queue, queueIndex, positionMs } = get();

                    // Si on est à > 3s, restart la piste en cours
                    if (positionMs > 3000) {
                        await AudioPlayer.seekTo(0);
                        return;
                    }

                    if (queue.length === 0) return;
                    const prevIdx = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
                    const prevTrack = queue[prevIdx];
                    set({ currentTrack: prevTrack, queueIndex: prevIdx, positionMs: 0 });
                    try {
                        await AudioPlayer.playTrack(prevTrack);
                    } catch (error) {
                        logger.error('Previous failed:', error);
                    }
                },

                // ─── Seek ──────────────────────────────────────────
                seekTo: async (positionMs: number) => {
                    await AudioPlayer.seekTo(positionMs);
                    set({ positionMs });
                },

                // ─── Repeat mode ──────────────────────────────────
                setRepeat: (mode: RepeatMode) => {
                    set({ repeatMode: mode });
                    AudioPlayer.setLooping(mode).catch(() => { });
                },

                // ─── Shuffle ───────────────────────────────────────
                toggleShuffle: () => {
                    const { shuffle, queue, currentTrack } = get();
                    const newShuffle = !shuffle;
                    if (newShuffle) {
                        const shuffled = shuffleArray(queue);
                        const idx = currentTrack ? shuffled.findIndex((t) => t.id === currentTrack.id) : 0;
                        set({ shuffle: true, queue: shuffled, queueIndex: idx >= 0 ? idx : 0 });
                    } else {
                        set({ shuffle: false });
                    }
                },

                // ─── Stop ──────────────────────────────────────────
                stopPlayback: async () => {
                    await AudioPlayer.stop();
                    set({
                        currentTrack: null,
                        isPlaying: false,
                        positionMs: 0,
                        durationMs: 0,
                        queue: [],
                        queueIndex: -1,
                    });
                },

                // ─── Load library ──────────────────────────────────
                loadLibrary: async () => {
                    // TODO: fetch from Supabase when music tables are created
                    set({
                        playlists: MOCK_PLAYLISTS,
                        likedTracks: MOCK_TRACKS.filter((t) => t.is_liked),
                    });
                    logger.info('Library loaded (mock)');
                },

                // ─── Toggle like ───────────────────────────────────
                toggleLike: (trackId: string) => {
                    set((state) => {
                        const track = [...state.queue, ...state.playlists.flatMap((p) => p.tracks)].find(
                            (t) => t.id === trackId,
                        );
                        if (!track) return state;

                        const wasLiked = state.likedTracks.some((t) => t.id === trackId);
                        return {
                            likedTracks: wasLiked
                                ? state.likedTracks.filter((t) => t.id !== trackId)
                                : [...state.likedTracks, { ...track, is_liked: true }],
                        };
                    });
                },

                // ─── Format duration ───────────────────────────────
                formatDuration: (ms: number) => {
                    const totalSec = Math.floor(ms / 1000);
                    const min = Math.floor(totalSec / 60);
                    const sec = totalSec % 60;
                    return `${min}:${sec.toString().padStart(2, '0')}`;
                },
            };
        },
        {
            name: 'imuchat-music-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                likedTracks: state.likedTracks,
                recentlyPlayed: state.recentlyPlayed,
                repeatMode: state.repeatMode,
                shuffle: state.shuffle,
                volume: state.volume,
            }),
        },
    ),
);
