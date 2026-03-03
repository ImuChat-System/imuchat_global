/**
 * usePodcast Hook
 *
 * Fournit une interface unifiée pour le module Podcasts :
 *  - Lecture d'épisodes avec reprise automatique
 *  - Contrôle du player (play/pause, seek, vitesse)
 *  - Gestion des abonnements
 *  - Recherche dans le catalogue
 *  - Historique d'écoute
 *
 * Usage :
 *   const { playEpisode, togglePlayPause, subscriptions, ... } = usePodcast();
 *
 * Phase M5 — DEV-023 Module Podcasts
 */

import { useCallback, useState } from 'react';

import { usePodcastStore, type PodcastState } from '@/stores/podcast-store';
import type { PlaybackSpeed, PodcastEpisode, PodcastShow } from '@/types/podcast';

// ============================================================================
// TYPES
// ============================================================================

export interface UsePodcastReturn {
    // --- Player State ---
    currentEpisode: PodcastEpisode | null;
    currentShow: PodcastShow | null;
    isPlaying: boolean;
    positionMs: number;
    durationMs: number;
    isBuffering: boolean;
    playbackSpeed: PlaybackSpeed;
    chapters: PodcastState['chapters'];

    // --- Library ---
    subscriptions: PodcastShow[];
    listeningHistory: PodcastState['listeningHistory'];
    downloadedEpisodes: PodcastEpisode[];
    episodeQueue: PodcastEpisode[];

    // --- Catalogue ---
    catalogShows: PodcastShow[];
    currentShowEpisodes: PodcastEpisode[];
    searchResults: PodcastShow[];
    isLoading: boolean;
    isSearching: boolean;

    // --- Player Actions ---
    playEpisode: (episode: PodcastEpisode, show: PodcastShow) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    seekTo: (positionMs: number) => Promise<void>;
    seekForward: (seconds?: number) => Promise<void>;
    seekBackward: (seconds?: number) => Promise<void>;
    setSpeed: (speed: PlaybackSpeed) => void;
    stopPlayback: () => Promise<void>;

    // --- Subscription Actions ---
    subscribe: (show: PodcastShow) => void;
    unsubscribe: (showId: string) => void;
    isSubscribed: (showId: string) => boolean;

    // --- Queue Actions ---
    addToQueue: (episode: PodcastEpisode) => void;
    removeFromQueue: (episodeId: string) => void;

    // --- Catalogue Actions ---
    loadCatalogue: () => Promise<void>;
    loadShowEpisodes: (show: PodcastShow) => Promise<void>;
    searchShows: (query: string) => Promise<void>;
    clearSearch: () => void;

    // --- Helpers ---
    formatDuration: (ms: number) => string;
    progressPercent: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePodcast(): UsePodcastReturn {
    const store = usePodcastStore();
    const [isSearching, setIsSearching] = useState(false);

    // --- Derived ---
    const progressPercent = store.durationMs > 0
        ? Math.round((store.positionMs / store.durationMs) * 100)
        : 0;

    // --- Wrapped search with local loading state ---
    const searchShows = useCallback(async (query: string) => {
        setIsSearching(true);
        try {
            await store.searchShows(query);
        } finally {
            setIsSearching(false);
        }
    }, [store.searchShows]);

    const clearSearch = useCallback(() => {
        usePodcastStore.setState({ searchResults: [] });
    }, []);

    return {
        // Player state
        currentEpisode: store.currentEpisode,
        currentShow: store.currentShow,
        isPlaying: store.isPlaying,
        positionMs: store.positionMs,
        durationMs: store.durationMs,
        isBuffering: store.isBuffering,
        playbackSpeed: store.playbackSpeed,
        chapters: store.chapters,

        // Library
        subscriptions: store.subscriptions,
        listeningHistory: store.listeningHistory,
        downloadedEpisodes: store.downloadedEpisodes,
        episodeQueue: store.episodeQueue,

        // Catalogue
        catalogShows: store.catalogShows,
        currentShowEpisodes: store.currentShowEpisodes,
        searchResults: store.searchResults,
        isLoading: store.isLoading,
        isSearching,

        // Player actions
        playEpisode: store.playEpisode,
        togglePlayPause: store.togglePlayPause,
        seekTo: store.seekTo,
        seekForward: store.seekForward,
        seekBackward: store.seekBackward,
        setSpeed: store.setSpeed,
        stopPlayback: store.stopPlayback,

        // Subscriptions
        subscribe: store.subscribe,
        unsubscribe: store.unsubscribe,
        isSubscribed: store.isSubscribed,

        // Queue
        addToQueue: store.addToQueue,
        removeFromQueue: store.removeFromQueue,

        // Catalogue
        loadCatalogue: store.loadCatalogue,
        loadShowEpisodes: store.loadShowEpisodes,
        searchShows,
        clearSearch,

        // Helpers
        formatDuration: store.formatDuration,
        progressPercent,
    };
}
