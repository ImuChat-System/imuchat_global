/**
 * Hook useGamification — Façade React pour le module Gamification
 *
 * Expose l'état du store et des actions mémorisées (useCallback)
 * pour éviter les re-renders inutiles.
 *
 * Usage:
 * ```tsx
 * const {
 *   userLevel, badges, missions, leaderboard,
 *   addXP, unlockBadge, claimMissionReward, ...
 * } = useGamification();
 * ```
 *
 * Phase 3 — DEV-032
 */

import { useGamificationStore } from "@/stores/gamification-store";
import type {
    Badge,
    Leaderboard,
    LeaderboardPeriod,
    LeaderboardScope,
    Mission,
    MissionStatus,
    RewardHistoryItem,
    ShopSection,
    SkinCategory,
    UserLevel,
    XPEvent,
} from "@/types/gamification";
import { useCallback, useMemo } from "react";

export function useGamification() {
    const store = useGamificationStore();

    // ─── XP actions ────────────────────────────────────────────────
    const addXP = useCallback(
        (event: XPEvent) => store.addXP(event),
        [store.addXP]
    );
    const setUserLevel = useCallback(
        (level: UserLevel) => store.setUserLevel(level),
        [store.setUserLevel]
    );

    // ─── Badge actions ─────────────────────────────────────────────
    const setBadges = useCallback(
        (badges: Badge[]) => store.setBadges(badges),
        [store.setBadges]
    );
    const unlockBadge = useCallback(
        (badgeId: string) => store.unlockBadge(badgeId),
        [store.unlockBadge]
    );
    const updateBadgeProgress = useCallback(
        (badgeId: string, progress: number) =>
            store.updateBadgeProgress(badgeId, progress),
        [store.updateBadgeProgress]
    );

    // ─── Mission actions ───────────────────────────────────────────
    const setMissions = useCallback(
        (missions: Mission[]) => store.setMissions(missions),
        [store.setMissions]
    );
    const updateMissionProgress = useCallback(
        (missionId: string, current: number) =>
            store.updateMissionProgress(missionId, current),
        [store.updateMissionProgress]
    );
    const updateMissionStatus = useCallback(
        (missionId: string, status: MissionStatus) =>
            store.updateMissionStatus(missionId, status),
        [store.updateMissionStatus]
    );
    const claimMissionReward = useCallback(
        (missionId: string) => store.claimMissionReward(missionId),
        [store.claimMissionReward]
    );

    // ─── Leaderboard actions ───────────────────────────────────────
    const setLeaderboard = useCallback(
        (leaderboard: Leaderboard | null) => store.setLeaderboard(leaderboard),
        [store.setLeaderboard]
    );
    const setLeaderboardFilter = useCallback(
        (scope: LeaderboardScope, period: LeaderboardPeriod) =>
            store.setLeaderboardFilter(scope, period),
        [store.setLeaderboardFilter]
    );

    // ─── Shop & Skin actions ───────────────────────────────────────
    const setShopSections = useCallback(
        (sections: ShopSection[]) => store.setShopSections(sections),
        [store.setShopSections]
    );
    const purchaseSkin = useCallback(
        (skinId: string) => store.purchaseSkin(skinId),
        [store.purchaseSkin]
    );
    const equipSkin = useCallback(
        (category: SkinCategory, skinId: string | null) =>
            store.equipSkin(category, skinId),
        [store.equipSkin]
    );

    // ─── Reward actions ────────────────────────────────────────────
    const addReward = useCallback(
        (reward: RewardHistoryItem) => store.addReward(reward),
        [store.addReward]
    );
    const setRewardHistory = useCallback(
        (history: RewardHistoryItem[]) => store.setRewardHistory(history),
        [store.setRewardHistory]
    );

    // ─── UI actions ────────────────────────────────────────────────
    const setLoading = useCallback(
        (loading: boolean) => store.setLoading(loading),
        [store.setLoading]
    );
    const setError = useCallback(
        (error: string | null) => store.setError(error),
        [store.setError]
    );
    const resetGamification = useCallback(
        () => store.resetGamification(),
        [store.resetGamification]
    );

    // ─── Computed values ───────────────────────────────────────────
    const levelProgress = useMemo(
        () =>
            store.userLevel.xpForNextLevel > 0
                ? Math.round(
                    (store.userLevel.currentXP / store.userLevel.xpForNextLevel) * 100
                )
                : 0,
        [store.userLevel.currentXP, store.userLevel.xpForNextLevel]
    );

    const unlockedBadgesCount = useMemo(
        () => store.badges.filter((b) => b.unlocked).length,
        [store.badges]
    );

    const activeMissionsCount = useMemo(
        () =>
            store.missions.filter(
                (m) => m.status === "available" || m.status === "in-progress"
            ).length,
        [store.missions]
    );

    const claimableMissionsCount = useMemo(
        () => store.missions.filter((m) => m.status === "completed").length,
        [store.missions]
    );

    const ownedSkinsCount = useMemo(
        () =>
            store.shopSections.reduce(
                (acc, section) => acc + section.items.filter((i) => i.owned).length,
                0
            ),
        [store.shopSections]
    );

    return {
        // ── State ────────────────────────────────────────────────────
        userLevel: store.userLevel,
        xpHistory: store.xpHistory,
        badges: store.badges,
        missions: store.missions,
        leaderboard: store.leaderboard,
        shopSections: store.shopSections,
        equippedSkins: store.equippedSkins,
        rewardHistory: store.rewardHistory,
        loading: store.loading,
        error: store.error,

        // ── Computed ─────────────────────────────────────────────────
        levelProgress,
        unlockedBadgesCount,
        activeMissionsCount,
        claimableMissionsCount,
        ownedSkinsCount,

        // ── Actions ──────────────────────────────────────────────────
        addXP,
        setUserLevel,
        setBadges,
        unlockBadge,
        updateBadgeProgress,
        setMissions,
        updateMissionProgress,
        updateMissionStatus,
        claimMissionReward,
        setLeaderboard,
        setLeaderboardFilter,
        setShopSections,
        purchaseSkin,
        equipSkin,
        addReward,
        setRewardHistory,
        setLoading,
        setError,
        resetGamification,
    };
}
