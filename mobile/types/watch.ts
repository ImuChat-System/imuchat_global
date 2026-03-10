/**
 * Types pour le module Watch natif.
 * Couvre les vidéos, Watch Parties et l'état du lecteur vidéo.
 */

/** Sous-onglet Watch (Sprint S12) */
export type WatchSubTab = 'videos' | 'podcasts' | 'music';

/** Source de contenu vidéo */
export type VideoSource = 'upload' | 'youtube' | 'twitch' | 'external';

/** Catégorie de contenu */
export type WatchCategory = 'all' | 'anime' | 'movie' | 'series' | 'documentary' | 'live';

/** Statut d'une watch party */
export type WatchPartyStatus = 'scheduled' | 'live' | 'ended';

/** Un contenu vidéo */
export interface WatchItem {
    id: string;
    title: string;
    description: string;
    /** URL de la vidéo (CDN / Supabase Storage) */
    video_url: string;
    /** URL de la miniature */
    thumbnail_url: string | null;
    category: WatchCategory;
    source: VideoSource;
    duration_ms: number;
    /** Nombre de vues */
    view_count: number;
    /** Nombre de likes */
    like_count: number;
    /** Auteur / Uploader */
    author_id: string;
    author_username: string;
    /** Tags */
    tags: string[];
    is_live: boolean;
    created_at: string;
}

/** Watch Party */
export interface WatchParty {
    id: string;
    title: string;
    description: string;
    /** Hôte de la party */
    host_id: string;
    host_username: string;
    /** Vidéo en lecture */
    video: WatchItem | null;
    /** Catégorie */
    category: WatchCategory;
    /** Nombre de spectateurs actuels */
    viewer_count: number;
    /** Status */
    status: WatchPartyStatus;
    /** Date de programmation (si scheduled) */
    scheduled_for: string | null;
    /** Date de début réelle */
    started_at: string | null;
    /** Participants inscrits */
    attendee_count: number;
    /** Chat activé */
    chat_enabled: boolean;
    created_at: string;
}

/** État du lecteur vidéo */
export interface VideoPlayerState {
    /** Vidéo en cours */
    currentVideo: WatchItem | null;
    /** Watch party courante */
    currentParty: WatchParty | null;
    /** Lecture en cours */
    isPlaying: boolean;
    /** Position en ms */
    positionMs: number;
    /** Durée totale en ms */
    durationMs: number;
    /** Plein écran */
    isFullscreen: boolean;
    /** PiP mode */
    isPiP: boolean;
    /** Buffering */
    isBuffering: boolean;
}

/** Section de contenu Watch pour la page d'accueil */
export interface WatchSection {
    id: string;
    title: string;
    type: 'featured' | 'live_parties' | 'upcoming' | 'trending' | 'categories';
    items: WatchItem[] | WatchParty[];
}

// ─── Sprint S12 — Watch enrichi ───────────────────────────────

/** Catégorie dynamique depuis Supabase */
export interface DynamicWatchCategory {
    id: string;
    slug: string;
    label: string;
    emoji: string | null;
    sort_order: number;
    is_active: boolean;
}

/** Données pour créer une Watch Party */
export interface WatchPartyCreateInput {
    title: string;
    description?: string;
    video_id?: string;
    category_slug?: string;
    is_public: boolean;
    max_viewers?: number;
    chat_enabled: boolean;
    scheduled_for?: string;
    invited_user_ids?: string[];
}

/** Invitation Watch Party */
export interface WatchPartyInvitation {
    id: string;
    party_id: string;
    inviter_id: string;
    invitee_id: string;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string;
}
