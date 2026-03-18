/**
 * types/video-sharing.ts — S21 · Partage DM & Chat
 *
 * Types pour le partage vidéo ImuFeed dans les conversations :
 * - VideoCard (card dans chat)
 * - Partage DM / groupe
 * - Preview inline
 * - Réponse vidéo courte
 */

// ─── VideoCard dans le chat ──────────────────────────────────

/** Données minimales d'une vidéo affichée dans le chat */
export interface VideoCardData {
    /** ID de la vidéo ImuFeed */
    videoId: string;
    /** URL de la vidéo (streaming) */
    videoUrl: string;
    /** Thumbnail */
    thumbnailUrl: string | null;
    /** Titre / caption */
    caption: string;
    /** Auteur */
    author: {
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
    };
    /** Durée en ms */
    durationMs: number;
    /** Compteurs */
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
}

// ─── Partage ─────────────────────────────────────────────────

/** Type de destination de partage */
export type ShareTargetType = "dm" | "group" | "guild";

/** Cible d'un partage vidéo */
export interface ShareTarget {
    /** ID de la conversation */
    conversationId: string;
    /** Type (DM, groupe, guilde) */
    type: ShareTargetType;
    /** Nom affiché */
    displayName: string;
    /** Avatar (pour UI) */
    avatarUrl: string | null;
}

/** Résultat d'un partage */
export interface ShareResult {
    success: boolean;
    /** ID du message envoyé */
    messageId: string | null;
    /** Erreur éventuelle */
    error: string | null;
}

/** Statut du partage en cours */
export type ShareStatus = "idle" | "selecting" | "sharing" | "success" | "error";

// ─── Preview inline ──────────────────────────────────────────

/** État de la preview inline dans le chat */
export interface InlinePreviewState {
    /** Le message contenant la vidéo */
    messageId: string | null;
    /** Vidéo en cours de preview */
    videoId: string | null;
    /** En lecture */
    isPlaying: boolean;
    /** Muet */
    isMuted: boolean;
    /** Position de lecture en ms */
    positionMs: number;
}

/** Configuration de la preview inline */
export interface InlinePreviewConfig {
    /** Activer la preview inline */
    enabled: boolean;
    /** Autoplay quand visible */
    autoplay: boolean;
    /** Muter par défaut */
    defaultMuted: boolean;
    /** Durée max de preview (ms, 0 = durée totale) */
    maxPreviewDurationMs: number;
}

export const DEFAULT_INLINE_PREVIEW_CONFIG: InlinePreviewConfig = {
    enabled: true,
    autoplay: true,
    defaultMuted: true,
    maxPreviewDurationMs: 0,
};

// ─── Réponse vidéo courte ────────────────────────────────────

/** Métadonnées d'une réponse vidéo dans le chat */
export interface VideoReplyData {
    /** ID de la vidéo enregistrée */
    videoId: string;
    /** URL de la vidéo */
    videoUrl: string;
    /** Thumbnail */
    thumbnailUrl: string | null;
    /** Durée max 8s */
    durationMs: number;
    /** ID du message auquel on répond */
    replyToMessageId: string;
}

/** Durée max d'une réponse vidéo (8 secondes) */
export const VIDEO_REPLY_MAX_DURATION_MS = 8000;

// ─── Store State ─────────────────────────────────────────────

/** État global du store video-sharing */
export interface VideoSharingStoreState {
    // --- Config ---
    inlinePreviewConfig: InlinePreviewConfig;

    // --- Runtime ---
    shareStatus: ShareStatus;
    selectedTargets: ShareTarget[];
    videoToShare: VideoCardData | null;
    inlinePreview: InlinePreviewState;
    recentShares: Array<{ videoId: string; conversationId: string; sharedAt: number }>;

    // --- Actions ---
    startShare: (video: VideoCardData) => void;
    cancelShare: () => void;
    toggleTarget: (target: ShareTarget) => void;
    clearTargets: () => void;
    confirmShare: () => Promise<ShareResult[]>;

    setInlinePreview: (messageId: string, videoId: string) => void;
    playInlinePreview: () => void;
    pauseInlinePreview: () => void;
    toggleInlinePreviewMute: () => void;
    closeInlinePreview: () => void;
    updateInlinePreviewPosition: (positionMs: number) => void;

    updateInlinePreviewConfig: (config: Partial<InlinePreviewConfig>) => void;
    resetVideoSharing: () => void;
}
