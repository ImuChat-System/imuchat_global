/**
 * Gamification Types
 *
 * Types pour le module Gamification :
 * - XP & niveaux (progression)
 * - Badges & trophées
 * - Missions quotidiennes / hebdomadaires
 * - Classements (amis + global)
 * - Personnalisation avatar (skins)
 * - Boutique & récompenses
 *
 * Phase 3 — DEV-032
 */

// ---------------------------------------------------------------------------
// XP & Niveaux
// ---------------------------------------------------------------------------

export interface XPEvent {
    id: string;
    action: string;
    xp: number;
    timestamp: string;
}

export interface UserLevel {
    level: number;
    currentXP: number;
    xpForNextLevel: number;
    totalXP: number;
    title: string;
}

export type LevelTier =
    | "bronze"
    | "silver"
    | "gold"
    | "platinum"
    | "diamond"
    | "legend";

export interface TierInfo {
    tier: LevelTier;
    minLevel: number;
    maxLevel: number;
    color: string;
    emoji: string;
}

// ---------------------------------------------------------------------------
// Badges & Trophées
// ---------------------------------------------------------------------------

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export type BadgeCategory =
    | "social"
    | "messaging"
    | "community"
    | "creator"
    | "explorer"
    | "veteran"
    | "special";

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: BadgeRarity;
    category: BadgeCategory;
    /** 0-100 progression toward unlocking */
    progress: number;
    unlocked: boolean;
    unlockedAt?: string;
    /** Condition d'obtention visible */
    requirement: string;
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

export type MissionFrequency = "daily" | "weekly" | "special";

export type MissionStatus = "available" | "in-progress" | "completed" | "claimed";

export interface MissionReward {
    type: "xp" | "badge" | "skin" | "coins";
    amount?: number;
    itemId?: string;
    label: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    frequency: MissionFrequency;
    status: MissionStatus;
    /** 0-100 */
    progress: number;
    target: number;
    current: number;
    reward: MissionReward;
    expiresAt?: string;
    completedAt?: string;
}

// ---------------------------------------------------------------------------
// Classements
// ---------------------------------------------------------------------------

export type LeaderboardScope = "global" | "friends" | "community";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all-time";

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatar?: string;
    xp: number;
    level: number;
    tier: LevelTier;
    isCurrentUser: boolean;
}

export interface Leaderboard {
    scope: LeaderboardScope;
    period: LeaderboardPeriod;
    entries: LeaderboardEntry[];
    userRank?: LeaderboardEntry;
    lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Avatar Skins & Boutique
// ---------------------------------------------------------------------------

export type SkinCategory =
    | "hair"
    | "outfit"
    | "accessory"
    | "background"
    | "effect"
    | "frame";

export type SkinRarity = "common" | "rare" | "epic" | "legendary";

export interface AvatarSkin {
    id: string;
    name: string;
    description: string;
    preview: string;
    category: SkinCategory;
    rarity: SkinRarity;
    price: number;
    /** "coins" | "premium" */
    currency: "coins" | "premium";
    owned: boolean;
    equipped: boolean;
    releasedAt: string;
}

export interface ShopSection {
    id: string;
    title: string;
    items: AvatarSkin[];
    featured?: boolean;
}

// ---------------------------------------------------------------------------
// Récompenses
// ---------------------------------------------------------------------------

export type RewardType = "xp" | "badge" | "skin" | "coins" | "title";

export interface RewardHistoryItem {
    id: string;
    type: RewardType;
    label: string;
    amount?: number;
    itemId?: string;
    source: string;
    claimedAt: string;
}

// ---------------------------------------------------------------------------
// Aggregate State
// ---------------------------------------------------------------------------

export interface GamificationState {
    userLevel: UserLevel;
    xpHistory: XPEvent[];
    badges: Badge[];
    missions: Mission[];
    leaderboard: Leaderboard | null;
    shopSections: ShopSection[];
    equippedSkins: Record<SkinCategory, string | null>;
    rewardHistory: RewardHistoryItem[];
}

// ---------------------------------------------------------------------------
// Sprint S12 — ImuFeed Gamification
// ---------------------------------------------------------------------------

/** Actions XP créateur ImuFeed avec points associés */
export type CreatorXPAction =
    | 'publish_video'
    | 'like_received'
    | 'comment_received'
    | 'views_1k'
    | 'views_10k'
    | 'challenge_completed'
    | 'share_received'
    | 'first_video'
    | 'went_viral'
    | 'collab';

/** Configuration XP par action */
export interface XPConfig {
    action: CreatorXPAction;
    xp: number;
    label: string;
}

/** Niveau créateur avec tier */
export interface CreatorLevel {
    user_id: string;
    level: number;
    total_xp: number;
    tier: LevelTier;
    xp_for_next_level: number;
    current_xp_in_level: number;
}

/** Badge du catalogue créateur */
export interface CreatorBadge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: BadgeRarity;
    requirement: string;
    unlocked: boolean;
    unlocked_at?: string;
}

/** Défi quotidien */
export type ChallengeActionType = 'publish' | 'like' | 'comment' | 'watch' | 'share';

export interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    action_type: ChallengeActionType;
    target: number;
    current: number;
    xp_reward: number;
    completed: boolean;
    claimed: boolean;
}

/** Entrée du classement créateur */
export interface CreatorLeaderboardEntry {
    user_id: string;
    username: string;
    total_xp: number;
    level: number;
    tier: LevelTier;
    rank: number;
}
