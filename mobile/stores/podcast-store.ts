/**
 * Podcast Store (Zustand)
 *
 * Gère l'état global du module Podcasts :
 * - Abonnements
 * - Historique d'écoute avec reprise
 * - Épisodes téléchargés (mode offline)
 * - Lecteur podcast (vitesse variable 0.5x-2x, chapitres)
 * - File d'écoute
 *
 * Phase M5 — Module Podcasts natif
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as AudioPlayer from '@/services/audio-player';
import { createLogger } from '@/services/logger';
import * as PodcastAPI from '@/services/podcast-api';
import type {
    ListeningHistoryEntry,
    PlaybackSpeed,
    PodcastEpisode,
    PodcastPlayerState,
    PodcastShow
} from '@/types/podcast';

const logger = createLogger('PodcastStore');

// ─── Interfaces ───────────────────────────────────────────────

export interface PodcastState extends PodcastPlayerState {
    // --- Bibliothèque ---
    subscriptions: PodcastShow[];
    listeningHistory: ListeningHistoryEntry[];
    downloadedEpisodes: PodcastEpisode[];
    episodeQueue: PodcastEpisode[];

    // --- Catalogue ---
    catalogShows: PodcastShow[];
    currentShowEpisodes: PodcastEpisode[];
    searchResults: PodcastShow[];
    isLoading: boolean;

    // --- Actions player ---
    playEpisode: (episode: PodcastEpisode, show: PodcastShow) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    seekTo: (positionMs: number) => Promise<void>;
    seekForward: (seconds?: number) => Promise<void>;
    seekBackward: (seconds?: number) => Promise<void>;
    setSpeed: (speed: PlaybackSpeed) => void;
    stopPlayback: () => Promise<void>;

    // --- Actions abonnements ---
    subscribe: (show: PodcastShow) => void;
    unsubscribe: (showId: string) => void;
    isSubscribed: (showId: string) => boolean;

    // --- Actions historique ---
    savePosition: (episodeId: string, positionMs: number) => void;
    markPlayed: (episodeId: string) => void;
    getResumePosition: (episodeId: string) => number;

    // --- Actions téléchargement ---
    markDownloaded: (episode: PodcastEpisode) => void;
    removeDownload: (episodeId: string) => void;

    // --- Actions queue ---
    addToQueue: (episode: PodcastEpisode) => void;
    removeFromQueue: (episodeId: string) => void;
    clearQueue: () => void;
    playNext: () => Promise<void>;

    // --- Actions catalogue ---
    loadCatalogue: () => Promise<void>;
    loadShowEpisodes: (show: PodcastShow) => Promise<void>;
    searchShows: (query: string) => Promise<void>;

    // --- Helpers ---
    formatDuration: (ms: number) => string;
}

// ─── Store ────────────────────────────────────────────────────

export const usePodcastStore = create<PodcastState>()(
    persist(
        (set, get) => {
            // Register audio status callback
            AudioPlayer.setStatusCallback((status) => {
                const state = get();
                if (!state.currentEpisode) return;

                set({
                    isPlaying: status.isPlaying,
                    positionMs: status.positionMs,
                    durationMs: status.durationMs,
                    isBuffering: status.isBuffering,
                });

                // Auto-save position every update
                if (state.currentEpisode && status.positionMs > 0) {
                    get().savePosition(state.currentEpisode.id, status.positionMs);
                }

                // Episode finished → mark played, play next in queue
                if (status.didJustFinish && state.currentEpisode) {
                    get().markPlayed(state.currentEpisode.id);
                    get().playNext().catch(() => { });
                }
            });

            return {
                // --- Player state ---
                currentEpisode: null,
                currentShow: null,
                isPlaying: false,
                positionMs: 0,
                durationMs: 0,
                isBuffering: false,
                playbackSpeed: 1 as PlaybackSpeed,
                volume: 1,
                chapters: [],

                // --- Library ---
                subscriptions: [],
                listeningHistory: [],
                downloadedEpisodes: [],
                episodeQueue: [],

                // --- Catalogue ---
                catalogShows: [],
                currentShowEpisodes: [],
                searchResults: [],
                isLoading: false,

                // ─── Play an episode ───────────────────────────────
                playEpisode: async (episode: PodcastEpisode, show: PodcastShow) => {
                    const resumePosition = get().getResumePosition(episode.id);
                    const speed = get().playbackSpeed;

                    set({
                        currentEpisode: episode,
                        currentShow: show,
                        positionMs: resumePosition,
                        durationMs: episode.duration_ms,
                        isBuffering: true,
                        chapters: [],
                    });

                    try {
                        // Build a track-like object for the audio player
                        await AudioPlayer.playTrack({
                            id: episode.id,
                            title: episode.title,
                            artist: show.author,
                            album: show.title,
                            audio_url: episode.audio_url,
                            artwork_url: episode.artwork_url || show.artwork_url,
                            duration_ms: episode.duration_ms,
                            genre: 'podcast',
                            play_count: 0,
                            is_liked: false,
                            created_at: episode.published_at,
                        });

                        // Set speed
                        if (speed !== 1) {
                            await AudioPlayer.setRate(speed);
                        }

                        // Resume from saved position
                        if (resumePosition > 0) {
                            await AudioPlayer.seekTo(resumePosition);
                        }

                        // Add to history
                        set((s) => ({
                            listeningHistory: [
                                {
                                    episode,
                                    show,
                                    last_position_ms: resumePosition,
                                    listened_at: new Date().toISOString(),
                                },
                                ...s.listeningHistory.filter((h) => h.episode.id !== episode.id),
                            ].slice(0, 50),
                        }));

                        logger.info(`Playing: ${episode.title}`);
                    } catch (error) {
                        logger.error('playEpisode failed:', error);
                        set({ isPlaying: false, isBuffering: false });
                    }
                },

                // ─── Toggle play/pause ─────────────────────────────
                togglePlayPause: async () => {
                    const { isPlaying, currentEpisode } = get();
                    if (!currentEpisode) return;

                    if (isPlaying) {
                        await AudioPlayer.pause();
                    } else {
                        await AudioPlayer.resume();
                    }
                },

                // ─── Seek ──────────────────────────────────────────
                seekTo: async (positionMs: number) => {
                    await AudioPlayer.seekTo(positionMs);
                    set({ positionMs });
                },

                seekForward: async (seconds: number = 30) => {
                    const { positionMs, durationMs } = get();
                    const newPos = Math.min(positionMs + seconds * 1000, durationMs);
                    await AudioPlayer.seekTo(newPos);
                    set({ positionMs: newPos });
                },

                seekBackward: async (seconds: number = 15) => {
                    const { positionMs } = get();
                    const newPos = Math.max(positionMs - seconds * 1000, 0);
                    await AudioPlayer.seekTo(newPos);
                    set({ positionMs: newPos });
                },

                // ─── Speed control ────────────────────────────────
                setSpeed: (speed: PlaybackSpeed) => {
                    set({ playbackSpeed: speed });
                    AudioPlayer.setRate(speed).catch(() => { });
                    logger.info(`Speed → ${speed}x`);
                },

                // ─── Stop ──────────────────────────────────────────
                stopPlayback: async () => {
                    const { currentEpisode, positionMs } = get();

                    // Save position before stopping
                    if (currentEpisode && positionMs > 0) {
                        get().savePosition(currentEpisode.id, positionMs);
                    }

                    await AudioPlayer.stop();
                    set({
                        currentEpisode: null,
                        currentShow: null,
                        isPlaying: false,
                        positionMs: 0,
                        durationMs: 0,
                        chapters: [],
                    });
                },

                // ─── Subscribe / Unsubscribe ──────────────────────
                subscribe: (show: PodcastShow) => {
                    set((s) => {
                        if (s.subscriptions.some((sub) => sub.id === show.id)) return s;
                        return {
                            subscriptions: [...s.subscriptions, { ...show, is_subscribed: true }],
                        };
                    });
                    logger.info(`Subscribed to: ${show.title}`);
                },

                unsubscribe: (showId: string) => {
                    set((s) => ({
                        subscriptions: s.subscriptions.filter((sub) => sub.id !== showId),
                    }));
                    logger.info(`Unsubscribed: ${showId}`);
                },

                isSubscribed: (showId: string) => {
                    return get().subscriptions.some((sub) => sub.id === showId);
                },

                // ─── Historique & reprise ──────────────────────────
                savePosition: (episodeId: string, positionMs: number) => {
                    set((s) => ({
                        listeningHistory: s.listeningHistory.map((h) =>
                            h.episode.id === episodeId
                                ? { ...h, last_position_ms: positionMs, listened_at: new Date().toISOString() }
                                : h,
                        ),
                    }));
                },

                markPlayed: (episodeId: string) => {
                    set((s) => ({
                        listeningHistory: s.listeningHistory.map((h) =>
                            h.episode.id === episodeId
                                ? { ...h, episode: { ...h.episode, is_played: true }, last_position_ms: h.episode.duration_ms }
                                : h,
                        ),
                    }));
                },

                getResumePosition: (episodeId: string) => {
                    const entry = get().listeningHistory.find((h) => h.episode.id === episodeId);
                    if (!entry) return 0;
                    // If already played, restart from 0
                    if (entry.episode.is_played) return 0;
                    return entry.last_position_ms;
                },

                // ─── Téléchargements offline ──────────────────────
                markDownloaded: (episode: PodcastEpisode) => {
                    set((s) => {
                        if (s.downloadedEpisodes.some((e) => e.id === episode.id)) return s;
                        return {
                            downloadedEpisodes: [...s.downloadedEpisodes, { ...episode, is_downloaded: true }],
                        };
                    });
                },

                removeDownload: (episodeId: string) => {
                    set((s) => ({
                        downloadedEpisodes: s.downloadedEpisodes.filter((e) => e.id !== episodeId),
                    }));
                },

                // ─── Queue management ─────────────────────────────
                addToQueue: (episode: PodcastEpisode) => {
                    set((s) => {
                        if (s.episodeQueue.some((e) => e.id === episode.id)) return s;
                        return { episodeQueue: [...s.episodeQueue, episode] };
                    });
                },

                removeFromQueue: (episodeId: string) => {
                    set((s) => ({
                        episodeQueue: s.episodeQueue.filter((e) => e.id !== episodeId),
                    }));
                },

                clearQueue: () => set({ episodeQueue: [] }),

                playNext: async () => {
                    const { episodeQueue, subscriptions } = get();
                    if (episodeQueue.length === 0) {
                        await get().stopPlayback();
                        return;
                    }

                    const nextEpisode = episodeQueue[0];
                    const show = subscriptions.find((s) => s.id === nextEpisode.show_id) || PodcastAPI.MOCK_SHOWS[0];

                    set((s) => ({
                        episodeQueue: s.episodeQueue.slice(1),
                    }));

                    await get().playEpisode(nextEpisode, show);
                },

                // ─── Catalogue ────────────────────────────────────
                loadCatalogue: async () => {
                    set({ isLoading: true });
                    try {
                        // For now, use mock data; real API will be connected later
                        const shows = PodcastAPI.getMockShows();
                        set({ catalogShows: shows, isLoading: false });
                        logger.info(`Catalogue loaded: ${shows.length} shows`);
                    } catch (error) {
                        logger.error('loadCatalogue failed:', error);
                        set({ isLoading: false });
                    }
                },

                loadShowEpisodes: async (show: PodcastShow) => {
                    set({ isLoading: true, currentShowEpisodes: [] });
                    try {
                        const episodes = await PodcastAPI.fetchEpisodesFromFeed(show.feed_url, show.id);
                        set({ currentShowEpisodes: episodes, isLoading: false });
                    } catch (error) {
                        logger.error('loadShowEpisodes failed:', error);
                        // Fallback mock
                        const mockEpisodes = PodcastAPI.getMockEpisodes(show.id);
                        set({ currentShowEpisodes: mockEpisodes, isLoading: false });
                    }
                },

                searchShows: async (query: string) => {
                    if (!query.trim()) {
                        set({ searchResults: [] });
                        return;
                    }

                    set({ isLoading: true });
                    try {
                        const results = await PodcastAPI.searchPodcasts(query);
                        // Convert search results to PodcastShow format
                        const shows: PodcastShow[] = results.map((r) => ({
                            id: r.id,
                            title: r.title,
                            author: r.author,
                            description: '',
                            artwork_url: r.artwork_url,
                            feed_url: r.feed_url,
                            category: 'other' as const,
                            episode_count: r.episode_count,
                            is_subscribed: get().isSubscribed(r.id),
                            last_updated: new Date().toISOString(),
                        }));
                        set({ searchResults: shows, isLoading: false });
                    } catch (error) {
                        logger.error('searchShows failed:', error);
                        set({ isLoading: false });
                    }
                },

                // ─── Format duration ──────────────────────────────
                formatDuration: (ms: number) => {
                    const totalSec = Math.floor(ms / 1000);
                    const hours = Math.floor(totalSec / 3600);
                    const min = Math.floor((totalSec % 3600) / 60);
                    const sec = totalSec % 60;

                    if (hours > 0) {
                        return `${hours}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
                    }
                    return `${min}:${sec.toString().padStart(2, '0')}`;
                },
            };
        },
        {
            name: 'imuchat-podcast-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                subscriptions: state.subscriptions,
                listeningHistory: state.listeningHistory,
                downloadedEpisodes: state.downloadedEpisodes,
                episodeQueue: state.episodeQueue,
                playbackSpeed: state.playbackSpeed,
                volume: state.volume,
            }),
        },
    ),
);
