/**
 * Types pour le module Podcasts.
 * Couvre les émissions, épisodes, abonnements, état du lecteur podcast.
 *
 * Phase M5 — Module Podcasts natif
 */

/** Catégories de podcasts */
export type PodcastCategory =
    | 'technology'
    | 'science'
    | 'education'
    | 'comedy'
    | 'news'
    | 'culture'
    | 'music'
    | 'sports'
    | 'health'
    | 'business'
    | 'society'
    | 'storytelling'
    | 'gaming'
    | 'anime'
    | 'other';

/** Vitesses de lecture disponibles */
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

/** Une émission/série podcast */
export interface PodcastShow {
    id: string;
    title: string;
    author: string;
    description: string;
    /** URL de la pochette */
    artwork_url: string | null;
    /** URL du flux RSS */
    feed_url: string;
    /** Catégorie principale */
    category: PodcastCategory;
    /** Nombre total d'épisodes */
    episode_count: number;
    /** L'utilisateur est-il abonné */
    is_subscribed: boolean;
    /** Date de dernière mise à jour */
    last_updated: string;
}

/** Un épisode de podcast */
export interface PodcastEpisode {
    id: string;
    /** ID de l'émission parente */
    show_id: string;
    title: string;
    description: string;
    /** URL du fichier audio */
    audio_url: string;
    /** URL de la pochette (hérite de l'émission si null) */
    artwork_url: string | null;
    /** Durée en millisecondes */
    duration_ms: number;
    /** Date de publication */
    published_at: string;
    /** Épisode déjà écouté */
    is_played: boolean;
    /** Position de reprise en ms (0 si non commencé) */
    play_position_ms: number;
    /** Épisode téléchargé en local */
    is_downloaded: boolean;
    /** Numéro d'épisode (optionnel) */
    episode_number: number | null;
    /** Numéro de saison (optionnel) */
    season_number: number | null;
}

/** Un chapitre dans un épisode */
export interface PodcastChapter {
    id: string;
    title: string;
    /** Position de début en ms */
    start_ms: number;
    /** Position de fin en ms */
    end_ms: number;
}

/** État du lecteur podcast */
export interface PodcastPlayerState {
    /** Épisode en cours */
    currentEpisode: PodcastEpisode | null;
    /** Émission associée */
    currentShow: PodcastShow | null;
    /** Lecture en cours */
    isPlaying: boolean;
    /** Position actuelle en ms */
    positionMs: number;
    /** Durée totale en ms */
    durationMs: number;
    /** Chargement / buffering */
    isBuffering: boolean;
    /** Vitesse de lecture */
    playbackSpeed: PlaybackSpeed;
    /** Volume 0-1 */
    volume: number;
    /** Chapitres de l'épisode courant */
    chapters: PodcastChapter[];
}

/** Entrée d'historique d'écoute */
export interface ListeningHistoryEntry {
    episode: PodcastEpisode;
    show: PodcastShow;
    /** Dernière position en ms */
    last_position_ms: number;
    /** Dernière écoute */
    listened_at: string;
}

/** Résultat de recherche podcast (iTunes Search API) */
export interface PodcastSearchResult {
    id: string;
    title: string;
    author: string;
    artwork_url: string | null;
    feed_url: string;
    genre: string;
    episode_count: number;
}
