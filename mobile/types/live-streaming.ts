/**
 * Types Live Streaming — ImuFeed Live
 *
 * Types pour le live streaming : streams, chat, réactions,
 * donations live, co-host, et replay.
 *
 * Sprint S15B — Infrastructure Live Streaming
 */

// ─── Live Stream Status ───────────────────────────────────────

export type LiveStreamStatus =
    | "scheduled"
    | "live"
    | "ended"
    | "cancelled";

export type LiveCategory =
    | "gaming"
    | "music"
    | "art"
    | "education"
    | "chat"
    | "cooking"
    | "tech"
    | "fitness"
    | "other";

// ─── Core Types ───────────────────────────────────────────────

export interface LiveStream {
    id: string;
    hostId: string;
    hostName: string;
    hostAvatar: string | null;
    title: string;
    description: string;
    category: LiveCategory;
    status: LiveStreamStatus;
    streamUrl: string | null;
    thumbnailUrl: string | null;
    viewerCount: number;
    peakViewerCount: number;
    likeCount: number;
    /** Total IC donated during this stream */
    totalDonations: number;
    /** Co-hosts user IDs (max 3) */
    coHosts: string[];
    /** Stream settings */
    settings: LiveStreamSettings;
    /** Tags for discovery */
    tags: string[];
    /** Scheduled start time (null = start now) */
    scheduledAt: string | null;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
    /** Replay URL after stream ends */
    replayUrl: string | null;
    /** Is replay available? */
    hasReplay: boolean;
    /** Is 18+ content */
    isAdultOnly: boolean;
}

export interface LiveStreamSettings {
    /** Allow donations during live */
    donationsEnabled: boolean;
    /** Allow chat */
    chatEnabled: boolean;
    /** Subscribers only chat */
    subscribersOnlyChat: boolean;
    /** Slow mode delay in seconds (0 = off) */
    slowModeSeconds: number;
    /** Auto-record for replay */
    autoRecord: boolean;
    /** Max co-hosts */
    maxCoHosts: number;
}

// ─── Chat ─────────────────────────────────────────────────────

export type LiveChatMessageType =
    | "text"
    | "donation"
    | "system"
    | "pinned";

export interface LiveChatMessage {
    id: string;
    liveId: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    type: LiveChatMessageType;
    content: string;
    /** For donations: amount in IC */
    donationAmount: number | null;
    /** User role in this live */
    role: LiveUserRole;
    /** Message timestamp */
    createdAt: string;
    /** Is pinned by host */
    isPinned: boolean;
}

export type LiveUserRole =
    | "viewer"
    | "subscriber"
    | "moderator"
    | "cohost"
    | "host";

// ─── Reactions ────────────────────────────────────────────────

export type LiveReactionType =
    | "heart"
    | "fire"
    | "laugh"
    | "wow"
    | "clap"
    | "star";

export interface LiveReaction {
    id: string;
    liveId: string;
    userId: string;
    type: LiveReactionType;
    createdAt: string;
}

// ─── Donations ────────────────────────────────────────────────

export interface LiveDonation {
    id: string;
    liveId: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    amount: number;
    message: string | null;
    /** Animation tier based on amount */
    tier: DonationTier;
    createdAt: string;
}

export type DonationTier =
    | "bronze" // 1-49 IC
    | "silver" // 50-199 IC
    | "gold" // 200-499 IC
    | "diamond" // 500-999 IC
    | "legendary"; // 1000+ IC

export const DONATION_TIER_THRESHOLDS: Record<DonationTier, number> = {
    bronze: 1,
    silver: 50,
    gold: 200,
    diamond: 500,
    legendary: 1000,
};

export function getDonationTier(amount: number): DonationTier {
    if (amount >= 1000) return "legendary";
    if (amount >= 500) return "diamond";
    if (amount >= 200) return "gold";
    if (amount >= 50) return "silver";
    return "bronze";
}

// ─── Viewer ───────────────────────────────────────────────────

export interface LiveViewer {
    userId: string;
    userName: string;
    userAvatar: string | null;
    role: LiveUserRole;
    joinedAt: string;
}

// ─── Co-host Request ──────────────────────────────────────────

export type CoHostRequestStatus = "pending" | "accepted" | "declined";

export interface CoHostRequest {
    id: string;
    liveId: string;
    fromUserId: string;
    toUserId: string;
    status: CoHostRequestStatus;
    createdAt: string;
}

// ─── Moderation ───────────────────────────────────────────────

export type ModerationAction =
    | "warn"
    | "mute"
    | "timeout"
    | "ban";

export interface LiveModerationEntry {
    id: string;
    liveId: string;
    moderatorId: string;
    targetUserId: string;
    action: ModerationAction;
    reason: string | null;
    /** Duration in seconds for timeout */
    duration: number | null;
    createdAt: string;
}

// ─── Store State ──────────────────────────────────────────────

export interface LiveStreamStoreState {
    /** Currently viewed or hosted live */
    currentLive: LiveStream | null;
    /** Chat messages (most recent) */
    chatMessages: LiveChatMessage[];
    /** Active viewers (sample) */
    viewers: LiveViewer[];
    /** Is user currently hosting */
    isHosting: boolean;
    /** Is user a moderator for current live */
    isModerator: boolean;
    /** Connection status */
    connectionStatus: "connecting" | "connected" | "disconnected" | "error";
    /** Recent donations for animation queue */
    donationQueue: LiveDonation[];
    /** Floating reactions to animate */
    reactionQueue: LiveReaction[];
}
