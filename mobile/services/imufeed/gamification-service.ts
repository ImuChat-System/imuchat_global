/**
 * Gamification Service — ImuFeed XP, niveaux, badges, défis
 *
 * Calcul level, tier, XP ; enregistrement events ; défis quotidiens ;
 * classements créateurs ; vérification badges.
 *
 * Sprint S12 Axe B — Gamification ImuFeed
 */

import { createLogger } from "@/services/logger";
import type {
    CreatorBadge,
    CreatorLeaderboardEntry,
    CreatorLevel,
    CreatorXPAction,
    DailyChallenge,
    LevelTier,
    XPConfig,
} from "@/types/gamification";

const logger = createLogger("gamification-service");

// ─── XP Configuration ─────────────────────────────────────────

export const XP_TABLE: XPConfig[] = [
    { action: "publish_video", xp: 50, label: "Publier une vidéo" },
    { action: "like_received", xp: 2, label: "Like reçu" },
    { action: "comment_received", xp: 5, label: "Commentaire reçu" },
    { action: "views_1k", xp: 100, label: "1 000 vues atteintes" },
    { action: "views_10k", xp: 500, label: "10 000 vues atteintes" },
    { action: "challenge_completed", xp: 200, label: "Défi quotidien complété" },
    { action: "share_received", xp: 3, label: "Partage reçu" },
    { action: "first_video", xp: 100, label: "Première vidéo publiée" },
    { action: "went_viral", xp: 500, label: "Vidéo virale" },
    { action: "collab", xp: 75, label: "Collaboration (duo/remix)" },
];

/** Mapping action → XP */
export const XP_MAP: Record<CreatorXPAction, number> = Object.fromEntries(
    XP_TABLE.map((c) => [c.action, c.xp]),
) as Record<CreatorXPAction, number>;

// ─── Tier Configuration ───────────────────────────────────────

export interface TierConfig {
    tier: LevelTier;
    minLevel: number;
    maxLevel: number;
    color: string;
    emoji: string;
    label: string;
}

export const TIER_TABLE: TierConfig[] = [
    { tier: "bronze", minLevel: 1, maxLevel: 10, color: "#CD7F32", emoji: "🥉", label: "Bronze" },
    { tier: "silver", minLevel: 11, maxLevel: 20, color: "#C0C0C0", emoji: "🥈", label: "Argent" },
    { tier: "gold", minLevel: 21, maxLevel: 30, color: "#FFD700", emoji: "🥇", label: "Or" },
    { tier: "platinum", minLevel: 31, maxLevel: 40, color: "#E5E4E2", emoji: "💎", label: "Platine" },
    { tier: "diamond", minLevel: 41, maxLevel: 50, color: "#B9F2FF", emoji: "💠", label: "Diamant" },
    { tier: "legend", minLevel: 51, maxLevel: 999, color: "#FF6EC7", emoji: "👑", label: "Légende" },
];

// ─── XP par niveau: 100 XP par niveau ────────────────────────

const XP_PER_LEVEL = 100;

// ─── Fonctions utilitaires ────────────────────────────────────

/** Calcule le niveau à partir du totalXP */
export function calculateLevel(totalXP: number): number {
    return Math.max(1, Math.floor(totalXP / XP_PER_LEVEL) + 1);
}

/** XP requis pour le prochain niveau */
export function xpForNextLevel(level: number): number {
    return level * XP_PER_LEVEL;
}

/** XP courant dans le niveau actuel */
export function currentXPInLevel(totalXP: number): number {
    return totalXP % XP_PER_LEVEL;
}

/** Pourcentage de progression dans le niveau (0-100) */
export function levelProgress(totalXP: number): number {
    const inLevel = currentXPInLevel(totalXP);
    return Math.round((inLevel / XP_PER_LEVEL) * 100);
}

/** Renvoie le tier pour un niveau donné */
export function getTierForLevel(level: number): TierConfig {
    return (
        TIER_TABLE.find((t) => level >= t.minLevel && level <= t.maxLevel) ??
        TIER_TABLE[0]
    );
}

/** Construit un CreatorLevel complet à partir du totalXP */
export function buildCreatorLevel(userId: string, totalXP: number): CreatorLevel {
    const level = calculateLevel(totalXP);
    const tier = getTierForLevel(level);
    return {
        user_id: userId,
        level,
        total_xp: totalXP,
        tier: tier.tier,
        xp_for_next_level: xpForNextLevel(level),
        current_xp_in_level: currentXPInLevel(totalXP),
    };
}

/** Renvoie le XP gagné pour une action donnée */
export function getXPForAction(action: CreatorXPAction): number {
    return XP_MAP[action] ?? 0;
}

// ─── Badge Definitions ────────────────────────────────────────

export const BADGE_DEFINITIONS: Omit<CreatorBadge, "unlocked" | "unlocked_at">[] = [
    { id: "first_video", name: "First Video", description: "Publie ta première vidéo", icon: "🎥", rarity: "common", requirement: "Publier 1 vidéo" },
    { id: "viral", name: "Viral", description: "Une vidéo atteint 10K vues", icon: "🔥", rarity: "rare", requirement: "10 000 vues sur une vidéo" },
    { id: "dj", name: "DJ", description: "Publie 10 vidéos avec musique", icon: "🎧", rarity: "rare", requirement: "10 vidéos musicales" },
    { id: "storyteller", name: "Storyteller", description: "Publie 20 stories", icon: "📖", rarity: "common", requirement: "20 stories publiées" },
    { id: "collaborator", name: "Collaborator", description: "Fais 5 duos/remixes", icon: "🤝", rarity: "rare", requirement: "5 duos ou remixes" },
    { id: "broadcaster", name: "Broadcaster", description: "Anime 10 Watch Parties", icon: "📡", rarity: "epic", requirement: "10 Watch Parties animées" },
    { id: "arena_champion", name: "Arena Champion", description: "Top 1 du classement semaine", icon: "🏆", rarity: "legendary", requirement: "Top 1 classement hebdo" },
    { id: "creator_king", name: "Creator King", description: "Atteins le niveau Légende", icon: "👑", rarity: "legendary", requirement: "Tier Légende (niveau 51+)" },
];

// ─── Classe principale du service ─────────────────────────────

export class GamificationService {
    private supabase: any;

    constructor(supabaseClient: any) {
        this.supabase = supabaseClient;
    }

    /** Enregistre un event XP et recalcule le niveau */
    async recordXPEvent(
        userId: string,
        action: CreatorXPAction,
        sourceId?: string,
    ): Promise<CreatorLevel> {
        const xp = getXPForAction(action);
        logger.info(`Recording XP: ${action} (+${xp}) for user ${userId}`);

        const { error: insertError } = await this.supabase
            .from("creator_xp_events")
            .insert({ user_id: userId, action, xp_amount: xp, source_id: sourceId ?? null });

        if (insertError) {
            logger.error("Failed to insert XP event", insertError);
            throw insertError;
        }

        const { data, error: rpcError } = await this.supabase
            .rpc("calculate_creator_level", { p_user_id: userId });

        if (rpcError) {
            logger.error("Failed to calculate level", rpcError);
            throw rpcError;
        }

        const row = Array.isArray(data) ? data[0] : data;
        return buildCreatorLevel(userId, row?.total_xp ?? 0);
    }

    /** Récupère le niveau créateur */
    async getCreatorLevel(userId: string): Promise<CreatorLevel> {
        const { data, error } = await this.supabase
            .from("creator_levels")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error || !data) {
            return buildCreatorLevel(userId, 0);
        }

        return buildCreatorLevel(userId, data.total_xp);
    }

    /** Récupère les badges avec statut de déblocage */
    async getCreatorBadges(userId: string): Promise<CreatorBadge[]> {
        const { data: earned } = await this.supabase
            .from("creator_badges_earned")
            .select("badge_id, unlocked_at")
            .eq("user_id", userId);

        const earnedMap = new Map(
            (earned ?? []).map((e: any) => [e.badge_id, e.unlocked_at]),
        );

        return BADGE_DEFINITIONS.map((b) => ({
            ...b,
            unlocked: earnedMap.has(b.id),
            unlocked_at: earnedMap.get(b.id) as string | undefined,
        }));
    }

    /** Récupère les défis quotidiens avec progression */
    async getDailyChallenges(userId: string): Promise<DailyChallenge[]> {
        const { data: challenges, error: cErr } = await this.supabase
            .from("daily_challenges")
            .select("*")
            .eq("is_active", true);

        if (cErr || !challenges) return [];

        const { data: progress } = await this.supabase
            .from("user_daily_progress")
            .select("*")
            .eq("user_id", userId)
            .eq("day", new Date().toISOString().split("T")[0]);

        const progressMap = new Map<string, { current: number; completed: boolean; claimed: boolean }>(
            (progress ?? []).map((p: any) => [p.challenge_id, p]),
        );

        return challenges.map((c: any) => {
            const p: { current: number; completed: boolean; claimed: boolean } | undefined = progressMap.get(c.id);
            return {
                id: c.id,
                title: c.title,
                description: c.description,
                action_type: c.action_type,
                target: c.target,
                current: p?.current ?? 0,
                xp_reward: c.xp_reward,
                completed: p?.completed ?? false,
                claimed: p?.claimed ?? false,
            };
        });
    }

    /** Top créateurs de la semaine */
    async getWeeklyLeaderboard(limit = 10): Promise<CreatorLeaderboardEntry[]> {
        const { data, error } = await this.supabase
            .rpc("get_top_creators_weekly", { p_limit: limit });

        if (error || !data) return [];

        return (data as any[]).map((row) => ({
            user_id: row.user_id,
            username: row.username,
            total_xp: row.total_xp,
            level: row.level ?? calculateLevel(row.total_xp),
            tier: row.tier ?? getTierForLevel(calculateLevel(row.total_xp)).tier,
            rank: row.rank,
        }));
    }
}
