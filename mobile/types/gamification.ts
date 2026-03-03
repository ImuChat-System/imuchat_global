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
