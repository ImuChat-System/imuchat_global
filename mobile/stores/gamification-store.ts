/**
 * Gamification Store (Zustand + AsyncStorage persist)
 *
 * Gère le module Gamification :
 * - XP & niveaux (progression)
 * - Badges & trophées
 * - Missions quotidiennes / hebdomadaires
 * - Classements (amis + global)
 * - Personnalisation avatar (skins)
 * - Boutique skins avatar
 * - Historique récompenses
 *
 * Phase 3 — DEV-032
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
    XPEvent
} from "@/types/gamification";

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

export interface GamificationStoreState {
    // ── XP & Niveaux ──────────────────────────────────────────────
    userLevel: UserLevel;
    xpHistory: XPEvent[];

    // ── Badges ────────────────────────────────────────────────────
    badges: Badge[];

    // ── Missions ──────────────────────────────────────────────────
    missions: Mission[];

    // ── Classements ───────────────────────────────────────────────
    leaderboard: Leaderboard | null;

    // ── Boutique & Skins ──────────────────────────────────────────
    shopSections: ShopSection[];
    equippedSkins: Record<SkinCategory, string | null>;

    // ── Récompenses ───────────────────────────────────────────────
    rewardHistory: RewardHistoryItem[];

    // ── UI state ──────────────────────────────────────────────────
    loading: boolean;
    error: string | null;

    // ── XP actions ────────────────────────────────────────────────
    addXP: (event: XPEvent) => void;
    setUserLevel: (level: UserLevel) => void;

    // ── Badge actions ─────────────────────────────────────────────
    setBadges: (badges: Badge[]) => void;
    unlockBadge: (badgeId: string) => void;
    updateBadgeProgress: (badgeId: string, progress: number) => void;

    // ── Mission actions ───────────────────────────────────────────
    setMissions: (missions: Mission[]) => void;
    updateMissionProgress: (missionId: string, current: number) => void;
    updateMissionStatus: (missionId: string, status: MissionStatus) => void;
    claimMissionReward: (missionId: string) => void;

    // ── Leaderboard actions ───────────────────────────────────────
    setLeaderboard: (leaderboard: Leaderboard | null) => void;
    setLeaderboardFilter: (scope: LeaderboardScope, period: LeaderboardPeriod) => void;

    // ── Shop & Skin actions ───────────────────────────────────────
    setShopSections: (sections: ShopSection[]) => void;
    purchaseSkin: (skinId: string) => void;
    equipSkin: (category: SkinCategory, skinId: string | null) => void;

    // ── Reward actions ────────────────────────────────────────────
    addReward: (reward: RewardHistoryItem) => void;
    setRewardHistory: (history: RewardHistoryItem[]) => void;

    // ── UI actions ────────────────────────────────────────────────
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // ── Reset ─────────────────────────────────────────────────────
    resetGamification: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const defaultUserLevel: UserLevel = {
    level: 1,
    currentXP: 0,
    xpForNextLevel: 100,
    totalXP: 0,
    title: "Débutant",
};

const defaultEquippedSkins: Record<SkinCategory, string | null> = {
    hair: null,
    outfit: null,
    accessory: null,
    background: null,
    effect: null,
    frame: null,
};

const initialState = {
    userLevel: defaultUserLevel,
    xpHistory: [] as XPEvent[],
    badges: [] as Badge[],
    missions: [] as Mission[],
    leaderboard: null as Leaderboard | null,
    shopSections: [] as ShopSection[],
    equippedSkins: { ...defaultEquippedSkins },
    rewardHistory: [] as RewardHistoryItem[],
    loading: false,
    error: null as string | null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGamificationStore = create<GamificationStoreState>()(
    persist(
        (set) => ({
            ...initialState,

            // ── XP actions ─────────────────────────────────────────────
            addXP: (event) =>
                set((s) => ({
                    xpHistory: [event, ...s.xpHistory],
                    userLevel: {
                        ...s.userLevel,
                        currentXP: s.userLevel.currentXP + event.xp,
                        totalXP: s.userLevel.totalXP + event.xp,
                    },
                })),

            setUserLevel: (level) => set({ userLevel: level }),

            // ── Badge actions ──────────────────────────────────────────
            setBadges: (badges) => set({ badges }),

            unlockBadge: (badgeId) =>
                set((s) => ({
                    badges: s.badges.map((b) =>
                        b.id === badgeId
                            ? { ...b, unlocked: true, progress: 100, unlockedAt: new Date().toISOString() }
                            : b
                    ),
                })),

            updateBadgeProgress: (badgeId, progress) =>
                set((s) => ({
                    badges: s.badges.map((b) =>
                        b.id === badgeId ? { ...b, progress: Math.min(progress, 100) } : b
                    ),
                })),

            // ── Mission actions ────────────────────────────────────────
            setMissions: (missions) => set({ missions }),

            updateMissionProgress: (missionId, current) =>
                set((s) => ({
                    missions: s.missions.map((m) => {
                        if (m.id !== missionId) return m;
                        const newCurrent = Math.min(current, m.target);
                        const progress = Math.round((newCurrent / m.target) * 100);
                        return {
                            ...m,
                            current: newCurrent,
                            progress,
                            status: newCurrent >= m.target ? "completed" as const : m.status,
                            ...(newCurrent >= m.target ? { completedAt: new Date().toISOString() } : {}),
                        };
                    }),
                })),

            updateMissionStatus: (missionId, status) =>
                set((s) => ({
                    missions: s.missions.map((m) =>
                        m.id === missionId ? { ...m, status } : m
                    ),
                })),

            claimMissionReward: (missionId) =>
                set((s) => ({
                    missions: s.missions.map((m) =>
                        m.id === missionId && m.status === "completed"
                            ? { ...m, status: "claimed" as const }
                            : m
                    ),
                })),

            // ── Leaderboard actions ────────────────────────────────────
            setLeaderboard: (leaderboard) => set({ leaderboard }),

            setLeaderboardFilter: (scope, period) =>
                set((s) => ({
                    leaderboard: s.leaderboard ? { ...s.leaderboard, scope, period } : null,
                })),

            // ── Shop & Skin actions ────────────────────────────────────
            setShopSections: (sections) => set({ shopSections: sections }),

            purchaseSkin: (skinId) =>
                set((s) => ({
                    shopSections: s.shopSections.map((section) => ({
                        ...section,
                        items: section.items.map((item) =>
                            item.id === skinId ? { ...item, owned: true } : item
                        ),
                    })),
                })),

            equipSkin: (category, skinId) =>
                set((s) => ({
                    equippedSkins: { ...s.equippedSkins, [category]: skinId },
                    shopSections: s.shopSections.map((section) => ({
                        ...section,
                        items: section.items.map((item) =>
                            item.category === category
                                ? { ...item, equipped: item.id === skinId }
                                : item
                        ),
                    })),
                })),

            // ── Reward actions ─────────────────────────────────────────
            addReward: (reward) =>
                set((s) => ({ rewardHistory: [reward, ...s.rewardHistory] })),

            setRewardHistory: (history) => set({ rewardHistory: history }),

            // ── UI actions ─────────────────────────────────────────────
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),

            // ── Reset ──────────────────────────────────────────────────
            resetGamification: () => set(initialState),
        }),
        {
            name: "imuchat-gamification",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                equippedSkins: state.equippedSkins,
                userLevel: state.userLevel,
            }),
        }
    )
);
