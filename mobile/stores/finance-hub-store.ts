/**
 * Finance Hub Store — Sprint M-F1
 *
 * Zustand store pour le Finance Hub dashboard.
 * Gère : stats, activités récentes, streaks, badges, cashout limits.
 */

import {
    claimBadgeReward,
    fetchBadgeRewards,
    fetchCashoutLimits,
    fetchDashboardStats,
    fetchLoginStreak,
    fetchRecentActivities,
    recordDailyLogin,
} from "@/services/finance-hub-api";
import type {
    BadgeReward,
    CashoutLimits,
    FinanceActivity,
    FinanceDashboardStats,
    LoginStreak,
} from "@/types/finance-hub";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ── State ────────────────────────────────────────────────────

interface FinanceHubState {
    // Data
    stats: FinanceDashboardStats | null;
    activities: FinanceActivity[];
    streak: LoginStreak | null;
    badges: BadgeReward[];
    cashoutLimits: CashoutLimits | null;

    // UI
    isLoading: boolean;
    error: string | null;
    lastRefresh: string | null;

    // Actions
    loadDashboard: () => Promise<void>;
    loadActivities: () => Promise<void>;
    loadStreak: () => Promise<void>;
    loadBadges: () => Promise<void>;
    loadCashoutLimits: () => Promise<void>;
    claimDailyLogin: () => Promise<{ rewardIc: number; newStreak: number } | null>;
    claimBadge: (badgeId: string) => Promise<number>;
    refreshAll: () => Promise<void>;
    clearError: () => void;
}

// ── Store ────────────────────────────────────────────────────

export const useFinanceHubStore = create<FinanceHubState>()(
    persist(
        (set, get) => ({
            // Initial state
            stats: null,
            activities: [],
            streak: null,
            badges: [],
            cashoutLimits: null,
            isLoading: false,
            error: null,
            lastRefresh: null,

            // ── loadDashboard ──
            loadDashboard: async () => {
                set({ isLoading: true, error: null });
                try {
                    const stats = await fetchDashboardStats();
                    set({ stats, isLoading: false, lastRefresh: new Date().toISOString() });
                } catch {
                    set({ error: "Impossible de charger le tableau de bord", isLoading: false });
                }
            },

            // ── loadActivities ──
            loadActivities: async () => {
                try {
                    const activities = await fetchRecentActivities(30);
                    set({ activities });
                } catch {
                    set({ error: "Impossible de charger les activités" });
                }
            },

            // ── loadStreak ──
            loadStreak: async () => {
                try {
                    const streak = await fetchLoginStreak();
                    set({ streak });
                } catch {
                    set({ error: "Impossible de charger le streak" });
                }
            },

            // ── loadBadges ──
            loadBadges: async () => {
                try {
                    const badges = await fetchBadgeRewards();
                    set({ badges });
                } catch {
                    set({ error: "Impossible de charger les badges" });
                }
            },

            // ── loadCashoutLimits ──
            loadCashoutLimits: async () => {
                try {
                    const cashoutLimits = await fetchCashoutLimits();
                    set({ cashoutLimits });
                } catch {
                    set({ error: "Impossible de charger les limites de retrait" });
                }
            },

            // ── claimDailyLogin ──
            claimDailyLogin: async () => {
                try {
                    const result = await recordDailyLogin();
                    if (result) {
                        // Refresh streak after claiming
                        const streak = await fetchLoginStreak();
                        set({ streak });
                    }
                    return result;
                } catch {
                    set({ error: "Impossible de réclamer le bonus quotidien" });
                    return null;
                }
            },

            // ── claimBadge ──
            claimBadge: async (badgeId: string) => {
                try {
                    const result = await claimBadgeReward(badgeId);
                    if (result) {
                        // Update badge locally
                        set((state) => ({
                            badges: state.badges.map((b) =>
                                b.badgeId === badgeId
                                    ? { ...b, claimedAt: new Date().toISOString() }
                                    : b,
                            ),
                        }));
                    }
                    return result?.amountIc ?? 0;
                } catch {
                    set({ error: "Impossible de réclamer la récompense du badge" });
                    return 0;
                }
            },

            // ── refreshAll ──
            refreshAll: async () => {
                set({ isLoading: true, error: null });
                try {
                    const [stats, activities, streak, badges, cashoutLimits] =
                        await Promise.all([
                            fetchDashboardStats(),
                            fetchRecentActivities(30),
                            fetchLoginStreak(),
                            fetchBadgeRewards(),
                            fetchCashoutLimits(),
                        ]);
                    set({
                        stats,
                        activities,
                        streak,
                        badges,
                        cashoutLimits,
                        isLoading: false,
                        lastRefresh: new Date().toISOString(),
                    });
                } catch {
                    set({ error: "Impossible de rafraîchir les données", isLoading: false });
                }
            },

            // ── clearError ──
            clearError: () => set({ error: null }),
        }),
        {
            name: "finance-hub-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                stats: state.stats,
                streak: state.streak,
                badges: state.badges,
                lastRefresh: state.lastRefresh,
            }),
        },
    ),
);
