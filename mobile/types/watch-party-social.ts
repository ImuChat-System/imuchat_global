/**
 * Types Watch Party Social — Sprint S22
 * Watch Party ImuFeed synchronisé, file d'attente collaborative,
 * cross-post communauté, vidéo→thread, story republish.
 */

import type { ImuFeedVideo } from "./imufeed";
import type { WatchParty } from "./watch";

// ─── Watch Party ImuFeed (lecture synchronisée) ─────────────

/** État de synchronisation de la lecture dans une watch party */
export type SyncPlaybackState = "playing" | "paused" | "buffering" | "ended";

/** Participant d'une watch party ImuFeed */
export interface WatchPartyParticipant {
    userId: string;
    username: string;
    avatarUrl: string | null;
    joinedAt: string;
    isHost: boolean;
    isCoHost: boolean;
}

/** État de la lecture synchronisée */
export interface SyncPlayback {
    videoId: string;
    positionMs: number;
    state: SyncPlaybackState;
    updatedAt: string;
    /** ID du participant qui contrôle la lecture */
    controllerId: string;
}

/** Réaction temps réel dans la watch party */
export type WatchPartyReaction = "fire" | "love" | "haha" | "wow" | "clap";

export interface WatchPartyReactionEvent {
    userId: string;
    reaction: WatchPartyReaction;
    timestamp: string;
}

// ─── File d'attente collaborative ───────────────────────────

/** Élément dans la file d'attente vidéo */
export interface QueueItem {
    id: string;
    video: ImuFeedVideo;
    addedBy: string;
    addedByUsername: string;
    addedAt: string;
    /** Nombre de votes pour monter dans la queue */
    upvotes: number;
    /** L'utilisateur courant a voté pour cet item */
    hasVoted: boolean;
}

/** Résultat d'ajout à la file */
export interface QueueAddResult {
    success: boolean;
    item?: QueueItem;
    error?: string;
}

// ─── Cross-post communauté ──────────────────────────────────

/** Cible de cross-post */
export type CrossPostTargetType = "guild" | "community";

export interface CrossPostTarget {
    id: string;
    name: string;
    type: CrossPostTargetType;
    iconUrl: string | null;
    memberCount: number;
}

/** Résultat d'un cross-post */
export interface CrossPostResult {
    success: boolean;
    postId?: string;
    targetId: string;
    targetType: CrossPostTargetType;
    error?: string;
}

// ─── Vidéo → Thread ─────────────────────────────────────────

/** Thread créé à partir des commentaires d'une vidéo */
export interface VideoThread {
    id: string;
    videoId: string;
    title: string;
    channelId: string;
    messageCount: number;
    createdAt: string;
    createdBy: string;
}

export interface VideoThreadCreateResult {
    success: boolean;
    thread?: VideoThread;
    error?: string;
}

// ─── Story republish ────────────────────────────────────────

/** Options de republication en story */
export interface StoryRepublishOptions {
    videoId: string;
    /** Extrait de la vidéo — début en ms */
    clipStartMs: number;
    /** Extrait de la vidéo — fin en ms (max 15s) */
    clipEndMs: number;
    /** Texte superposé */
    overlayText?: string;
    /** Sticker/badge */
    sticker?: string;
}

export const STORY_MAX_DURATION_MS = 15_000;

export interface StoryRepublishResult {
    success: boolean;
    storyId?: string;
    error?: string;
}

// ─── Store State ────────────────────────────────────────────

export interface WatchPartySocialStoreState {
    // Watch Party
    currentParty: WatchParty | null;
    participants: WatchPartyParticipant[];
    syncPlayback: SyncPlayback | null;
    reactions: WatchPartyReactionEvent[];

    // Queue
    queue: QueueItem[];
    isLoadingQueue: boolean;

    // Cross-post
    crossPostTargets: CrossPostTarget[];
    isLoadingTargets: boolean;
    crossPostResults: CrossPostResult[];

    // Thread
    createdThreads: VideoThread[];

    // Story republish
    republishOptions: StoryRepublishOptions | null;
    isRepublishing: boolean;

    // Loading / Errors
    error: string | null;

    // Actions — Watch Party
    joinParty: (partyId: string) => Promise<void>;
    leaveParty: () => void;
    updateSyncPlayback: (playback: Partial<SyncPlayback>) => void;
    sendReaction: (reaction: WatchPartyReaction) => void;
    clearReactions: () => void;

    // Actions — Queue
    loadQueue: (partyId: string) => Promise<void>;
    addToQueue: (partyId: string, video: ImuFeedVideo) => Promise<QueueAddResult>;
    removeFromQueue: (itemId: string) => void;
    voteQueueItem: (itemId: string) => void;
    reorderQueue: (queue: QueueItem[]) => void;

    // Actions — Cross-post
    loadCrossPostTargets: () => Promise<void>;
    crossPost: (videoId: string, targets: CrossPostTarget[]) => Promise<CrossPostResult[]>;
    clearCrossPostResults: () => void;

    // Actions — Thread
    createThreadFromVideo: (videoId: string, channelId: string) => Promise<VideoThreadCreateResult>;

    // Actions — Story republish
    setRepublishOptions: (options: StoryRepublishOptions | null) => void;
    republishAsStory: () => Promise<StoryRepublishResult>;

    // Reset
    resetWatchPartySocial: () => void;
}
