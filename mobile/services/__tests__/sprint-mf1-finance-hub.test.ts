/**
 * Sprint M-F1 — Finance Hub Tests
 *
 * Tests:
 *   1. Type helpers (icToEurCents, formatImuCoins, computeStreakTier, canCashout, etc.)
 *   2. API functions (fetchDashboardStats, fetchLoginStreak, recordDailyLogin,
 *      fetchBadgeRewards, claimBadgeReward, fetchRecentActivities, fetchCashoutLimits, requestCashout)
 *   3. Store actions (loadDashboard, loadActivities, claimDailyLogin, claimBadge, refreshAll)
 *
 * Pattern: Supabase chain mocking (jest.mock → mockFrom → select→eq→single etc.)
 */

// ── Mocks ────────────────────────────────────────────────────

jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        auth: { getUser: jest.fn() },
        rpc: jest.fn(),
        functions: { invoke: jest.fn() },
    },
    getCurrentUser: jest.fn(),
}));

jest.mock("../logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// ── Imports ──────────────────────────────────────────────────

import { useFinanceHubStore } from "@/stores/finance-hub-store";
import {
    BADGE_RARITY_CONFIG,
    canCashout,
    CASHOUT_FEE_PERCENT,
    CASHOUT_STATUS_CONFIG,
    computeCashoutFee,
    computeCashoutNet,
    computeStreakTier,
    DAILY_CASHOUT_LIMIT_IC,
    eurCentsToIc,
    formatFiatCents,
    formatImuCoins,
    getNextStreakReward,
    getStreakDailyReward,
    icToEurCents,
    IMUCOIN_TO_EUR_CENTS,
    isStreakActive,
    KYC_LEVEL_CONFIG,
    KYC_REQUIRED_FOR_CASHOUT,
    MAX_CASHOUT_IC,
    MIN_CASHOUT_IC,
    MISSION_CATEGORY_CONFIG,
    STREAK_LOGIN_WINDOW_HOURS,
    STREAK_REWARD_SCHEDULE,
    STREAK_TIER_CONFIG,
    TOPUP_PACKAGES,
} from "@/types/finance-hub";
import { act } from "@testing-library/react-native";
import {
    claimBadgeReward,
    fetchBadgeRewards,
    fetchCashoutLimits,
    fetchDashboardStats,
    fetchLoginStreak,
    fetchRecentActivities,
    recordDailyLogin,
    requestCashout,
} from "../finance-hub-api";
import { supabase } from "../supabase";

const mockAuth = supabase.auth.getUser as jest.Mock;
const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;
const mockInvoke = supabase.functions.invoke as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────

const testUser = { id: "user-42", email: "hub@test.com" };

function setupAuth(user = testUser) {
    mockAuth.mockResolvedValue({ data: { user } });
}

function setupNoAuth() {
    mockAuth.mockResolvedValue({ data: { user: null } });
}

beforeEach(() => {
    jest.clearAllMocks();
    // Reset zustand store between tests
    useFinanceHubStore.setState({
        stats: null,
        activities: [],
        streak: null,
        badges: [],
        cashoutLimits: null,
        isLoading: false,
        error: null,
        lastRefresh: null,
    });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — TYPE HELPERS
// ═══════════════════════════════════════════════════════════════

describe("finance-hub types & helpers", () => {
    // ── Conversion ──
    describe("icToEurCents", () => {
        it("converts ImuCoins to EUR cents", () => {
            expect(icToEurCents(100)).toBe(100 * IMUCOIN_TO_EUR_CENTS);
        });
        it("handles 0", () => {
            expect(icToEurCents(0)).toBe(0);
        });
        it("rounds correctly", () => {
            expect(icToEurCents(33)).toBe(330);
        });
    });

    describe("eurCentsToIc", () => {
        it("converts EUR cents to ImuCoins", () => {
            expect(eurCentsToIc(1000)).toBe(100);
        });
        it("handles 0", () => {
            expect(eurCentsToIc(0)).toBe(0);
        });
    });

    // ── Format ──
    describe("formatImuCoins", () => {
        it("formats with IC suffix", () => {
            const result = formatImuCoins(1500);
            expect(result).toContain("IC");
            expect(result).toContain("1");
        });
        it("handles 0", () => {
            expect(formatImuCoins(0)).toContain("0");
        });
    });

    describe("formatFiatCents", () => {
        it("formats EUR cents", () => {
            const result = formatFiatCents(1050, "EUR");
            // 10.50 €
            expect(result).toContain("10");
        });
        it("defaults to EUR", () => {
            expect(formatFiatCents(500)).toBeTruthy();
        });
    });

    // ── Streak ──
    describe("computeStreakTier", () => {
        it("returns bronze for < 7 days", () => {
            expect(computeStreakTier(1)).toBe("bronze");
            expect(computeStreakTier(6)).toBe("bronze");
        });
        it("returns silver for 7-29 days", () => {
            expect(computeStreakTier(7)).toBe("silver");
            expect(computeStreakTier(29)).toBe("silver");
        });
        it("returns gold for 30-99 days", () => {
            expect(computeStreakTier(30)).toBe("gold");
            expect(computeStreakTier(99)).toBe("gold");
        });
        it("returns diamond for 100+ days", () => {
            expect(computeStreakTier(100)).toBe("diamond");
            expect(computeStreakTier(365)).toBe("diamond");
        });
    });

    describe("getStreakDailyReward", () => {
        it("returns correct reward per tier", () => {
            expect(getStreakDailyReward("bronze")).toBe(10);
            expect(getStreakDailyReward("silver")).toBe(25);
            expect(getStreakDailyReward("gold")).toBe(50);
            expect(getStreakDailyReward("diamond")).toBe(100);
        });
    });

    describe("getNextStreakReward", () => {
        it("returns first milestone for streak 0", () => {
            const r = getNextStreakReward(0);
            expect(r).toEqual(STREAK_REWARD_SCHEDULE[0]);
        });
        it("returns next milestone after current", () => {
            const r = getNextStreakReward(3);
            expect(r?.day).toBe(7);
        });
        it("returns null after last milestone", () => {
            expect(getNextStreakReward(365)).toBeNull();
        });
    });

    // ── Cashout ──
    describe("computeCashoutFee", () => {
        it("calculates 2.5% fee", () => {
            expect(computeCashoutFee(10000)).toBe(250);
        });
        it("rounds to integer", () => {
            expect(Number.isInteger(computeCashoutFee(33))).toBe(true);
        });
    });

    describe("computeCashoutNet", () => {
        it("returns amount minus fee", () => {
            const net = computeCashoutNet(10000);
            expect(net).toBe(10000 - 250);
        });
    });

    describe("canCashout", () => {
        it("allows valid cashout (KYC 2, valid amount)", () => {
            expect(canCashout(2, 10000, 0)).toBe(true);
        });
        it("rejects low KYC", () => {
            expect(canCashout(1, 10000, 0)).toBe(false);
        });
        it("rejects amount below min", () => {
            expect(canCashout(2, 100, 0)).toBe(false);
        });
        it("rejects amount above max", () => {
            expect(canCashout(2, MAX_CASHOUT_IC + 1, 0)).toBe(false);
        });
        it("rejects when daily limit exceeded", () => {
            expect(canCashout(2, 10000, DAILY_CASHOUT_LIMIT_IC)).toBe(false);
        });
        it("accepts KYC level 3", () => {
            expect(canCashout(3, 50000, 0)).toBe(true);
        });
    });

    // ── isStreakActive ──
    describe("isStreakActive", () => {
        it("returns true for recent login", () => {
            const recent = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
            expect(isStreakActive(recent)).toBe(true);
        });
        it("returns false for old login", () => {
            const old = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
            expect(isStreakActive(old)).toBe(false);
        });
    });

    // ── Constants sanity ──
    describe("constants", () => {
        it("IMUCOIN_TO_EUR_CENTS = 10", () => {
            expect(IMUCOIN_TO_EUR_CENTS).toBe(10);
        });
        it("MIN_CASHOUT_IC = 5000", () => {
            expect(MIN_CASHOUT_IC).toBe(5000);
        });
        it("MAX_CASHOUT_IC = 500000", () => {
            expect(MAX_CASHOUT_IC).toBe(500000);
        });
        it("DAILY_CASHOUT_LIMIT_IC = 100000", () => {
            expect(DAILY_CASHOUT_LIMIT_IC).toBe(100000);
        });
        it("KYC_REQUIRED_FOR_CASHOUT = 2", () => {
            expect(KYC_REQUIRED_FOR_CASHOUT).toBe(2);
        });
        it("CASHOUT_FEE_PERCENT = 2.5", () => {
            expect(CASHOUT_FEE_PERCENT).toBe(2.5);
        });
        it("STREAK_LOGIN_WINDOW_HOURS = 36", () => {
            expect(STREAK_LOGIN_WINDOW_HOURS).toBe(36);
        });
        it("TOPUP_PACKAGES has 6 packages", () => {
            expect(TOPUP_PACKAGES).toHaveLength(6);
        });
        it("STREAK_REWARD_SCHEDULE has 8 milestones", () => {
            expect(STREAK_REWARD_SCHEDULE).toHaveLength(8);
        });
    });

    // ── Config maps ──
    describe("config maps", () => {
        it("KYC_LEVEL_CONFIG has 4 levels", () => {
            expect(Object.keys(KYC_LEVEL_CONFIG)).toHaveLength(4);
        });
        it("STREAK_TIER_CONFIG covers all tiers", () => {
            expect(STREAK_TIER_CONFIG.bronze).toBeDefined();
            expect(STREAK_TIER_CONFIG.diamond).toBeDefined();
        });
        it("BADGE_RARITY_CONFIG has ascending rewards", () => {
            expect(BADGE_RARITY_CONFIG.common.rewardIc).toBeLessThan(
                BADGE_RARITY_CONFIG.rare.rewardIc,
            );
            expect(BADGE_RARITY_CONFIG.rare.rewardIc).toBeLessThan(
                BADGE_RARITY_CONFIG.epic.rewardIc,
            );
        });
        it("MISSION_CATEGORY_CONFIG has 6 categories", () => {
            expect(Object.keys(MISSION_CATEGORY_CONFIG)).toHaveLength(6);
        });
        it("CASHOUT_STATUS_CONFIG has 5 statuses", () => {
            expect(Object.keys(CASHOUT_STATUS_CONFIG)).toHaveLength(5);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — API FUNCTIONS
// ═══════════════════════════════════════════════════════════════

describe("finance-hub-api", () => {
    // ── fetchDashboardStats ──
    describe("fetchDashboardStats", () => {
        it("returns mapped stats on success", async () => {
            setupAuth();
            // 5 parallel queries
            const walletRes = { data: { balance: 2500, lifetime_earned: 5000, lifetime_spent: 2500 }, error: null };
            const kycRes = { data: { level: 2 }, error: null };
            const methodsRes = { count: 3, data: null, error: null };
            const missionsRes = { count: 2, data: null, error: null };
            const streakRes = { data: { current_streak: 15 }, error: null };

            // For Promise.all, mockFrom is called 5 times, then once more for todayTx
            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue(walletRes),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue(kycRes),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue(methodsRes),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue(missionsRes),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue(streakRes),
                        }),
                    }),
                })
                // todayTx query
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            gte: jest.fn().mockResolvedValue({
                                data: [{ amount: 100 }, { amount: 200 }],
                                error: null,
                            }),
                        }),
                    }),
                });

            const result = await fetchDashboardStats();
            expect(result).not.toBeNull();
            expect(result!.balanceIc).toBe(2500);
            expect(result!.balanceFiatCents).toBe(icToEurCents(2500));
            expect(result!.currency).toBe("EUR");
            expect(result!.lifetimeEarned).toBe(5000);
            expect(result!.lifetimeSpent).toBe(2500);
            expect(result!.todayEarned).toBe(300);
            expect(result!.activeMissions).toBe(2);
            expect(result!.currentStreak).toBe(15);
            expect(result!.kycLevel).toBe(2);
            expect(result!.paymentMethodsCount).toBe(3);
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            expect(await fetchDashboardStats()).toBeNull();
        });

        it("returns null on error", async () => {
            setupAuth();
            mockFrom.mockImplementation(() => {
                throw new Error("DB down");
            });
            expect(await fetchDashboardStats()).toBeNull();
        });
    });

    // ── fetchLoginStreak ──
    describe("fetchLoginStreak", () => {
        it("returns mapped streak data", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: {
                                user_id: "user-42",
                                current_streak: 12,
                                longest_streak: 30,
                                last_login_date: "2026-02-10",
                                total_earned_ic: 1200,
                                created_at: "2026-01-01",
                                updated_at: "2026-02-10",
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchLoginStreak();
            expect(result).not.toBeNull();
            expect(result!.currentStreak).toBe(12);
            expect(result!.longestStreak).toBe(30);
            expect(result!.tier).toBe("silver"); // 12 days → silver
            expect(result!.totalEarnedIc).toBe(1200);
        });

        it("returns default when no data exists", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchLoginStreak();
            expect(result).not.toBeNull();
            expect(result!.currentStreak).toBe(0);
            expect(result!.tier).toBe("bronze");
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            expect(await fetchLoginStreak()).toBeNull();
        });

        it("returns null on error", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: "failed" },
                        }),
                    }),
                }),
            });

            expect(await fetchLoginStreak()).toBeNull();
        });
    });

    // ── recordDailyLogin ──
    describe("recordDailyLogin", () => {
        it("returns reward and new streak", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({
                data: { reward_ic: 25, new_streak: 8 },
                error: null,
            });

            const result = await recordDailyLogin();
            expect(result).toEqual({ rewardIc: 25, newStreak: 8 });
            expect(mockRpc).toHaveBeenCalledWith("record_daily_login", {
                p_user_id: "user-42",
            });
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            expect(await recordDailyLogin()).toBeNull();
        });

        it("returns null on rpc error", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({ data: null, error: { message: "rpc fail" } });
            expect(await recordDailyLogin()).toBeNull();
        });
    });

    // ── fetchBadgeRewards ──
    describe("fetchBadgeRewards", () => {
        it("returns mapped badge rewards", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: [
                                {
                                    id: "ub-1",
                                    badge_id: "b-1",
                                    badges: { name: "Explorer", emoji: "🌍", rarity: "rare" },
                                    reward_claimed_at: null,
                                },
                                {
                                    id: "ub-2",
                                    badge_id: "b-2",
                                    badges: { name: "Legend", emoji: "🏆", rarity: "legendary" },
                                    reward_claimed_at: "2026-02-01",
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchBadgeRewards();
            expect(result).toHaveLength(2);
            expect(result[0].badgeName).toBe("Explorer");
            expect(result[0].rarity).toBe("rare");
            expect(result[0].rewardIc).toBe(BADGE_RARITY_CONFIG.rare.rewardIc);
            expect(result[0].claimedAt).toBeNull();
            expect(result[1].badgeName).toBe("Legend");
            expect(result[1].claimedAt).toBe("2026-02-01");
        });

        it("returns empty array when not authenticated", async () => {
            setupNoAuth();
            expect(await fetchBadgeRewards()).toEqual([]);
        });

        it("returns empty array on error", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: "failed" },
                        }),
                    }),
                }),
            });

            expect(await fetchBadgeRewards()).toEqual([]);
        });
    });

    // ── claimBadgeReward ──
    describe("claimBadgeReward", () => {
        it("claims and returns amount", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({ data: 100, error: null });

            const result = await claimBadgeReward("badge-1");
            expect(result).toEqual({ amountIc: 100 });
            expect(mockRpc).toHaveBeenCalledWith("claim_badge_reward", {
                p_user_id: "user-42",
                p_badge_id: "badge-1",
            });
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            expect(await claimBadgeReward("badge-1")).toBeNull();
        });

        it("returns null on rpc error", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({ data: null, error: { message: "rpc fail" } });
            expect(await claimBadgeReward("badge-1")).toBeNull();
        });
    });

    // ── fetchRecentActivities ──
    describe("fetchRecentActivities", () => {
        it("returns mapped activities", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    or: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: [
                                    {
                                        id: "tx-1",
                                        transaction_type: "reward",
                                        to_user_id: "user-42",
                                        from_user_id: "system",
                                        amount: 50,
                                        description: "Mission reward",
                                        reference_id: "m-1",
                                        created_at: "2026-02-15",
                                    },
                                    {
                                        id: "tx-2",
                                        transaction_type: "transfer",
                                        to_user_id: "other",
                                        from_user_id: "user-42",
                                        amount: 20,
                                        description: "Gift",
                                        reference_id: null,
                                        created_at: "2026-02-14",
                                    },
                                ],
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchRecentActivities();
            expect(result).toHaveLength(2);
            expect(result[0].type).toBe("mission_reward");
            expect(result[0].amountIc).toBe(50);
            expect(result[1].type).toBe("transfer");
        });

        it("returns empty when not authenticated", async () => {
            setupNoAuth();
            expect(await fetchRecentActivities()).toEqual([]);
        });

        it("returns empty on error", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    or: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: "fail" },
                            }),
                        }),
                    }),
                }),
            });

            expect(await fetchRecentActivities()).toEqual([]);
        });
    });

    // ── fetchCashoutLimits ──
    describe("fetchCashoutLimits", () => {
        it("returns mapped limits", async () => {
            setupAuth();
            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({
                                data: { level: 2 },
                                error: null,
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                gte: jest.fn().mockResolvedValue({
                                    data: [{ amount_ic: 5000 }, { amount_ic: 10000 }],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                });

            const result = await fetchCashoutLimits();
            expect(result).not.toBeNull();
            expect(result!.minAmountIc).toBe(MIN_CASHOUT_IC);
            expect(result!.maxAmountIc).toBe(MAX_CASHOUT_IC);
            expect(result!.dailyLimitIc).toBe(DAILY_CASHOUT_LIMIT_IC);
            expect(result!.dailyUsedIc).toBe(15000);
            expect(result!.userKycLevel).toBe(2);
            expect(result!.conversionRate).toBe(IMUCOIN_TO_EUR_CENTS);
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            expect(await fetchCashoutLimits()).toBeNull();
        });

        it("returns null on error", async () => {
            setupAuth();
            mockFrom.mockImplementation(() => {
                throw new Error("DB fail");
            });
            expect(await fetchCashoutLimits()).toBeNull();
        });
    });

    // ── requestCashout ──
    describe("requestCashout", () => {
        it("calls edge function and returns request", async () => {
            setupAuth();
            const mockCashout = {
                id: "co-1",
                userId: "user-42",
                amountIc: 10000,
                amountFiatCents: 9750,
                currency: "EUR",
                status: "pending",
                rejectionReason: null,
                createdAt: "2026-02-15",
                completedAt: null,
            };
            mockInvoke.mockResolvedValue({ data: mockCashout, error: null });

            const result = await requestCashout(10000);
            expect(result).toEqual(mockCashout);
            expect(mockInvoke).toHaveBeenCalledWith("request-cashout", {
                body: {
                    userId: "user-42",
                    amountIc: 10000,
                    amountFiatCents: icToEurCents(computeCashoutNet(10000)),
                    currency: "EUR",
                },
            });
        });

        it("returns null when not authenticated", async () => {
            setupNoAuth();
            expect(await requestCashout(10000)).toBeNull();
        });

        it("returns null on invoke error", async () => {
            setupAuth();
            mockInvoke.mockResolvedValue({
                data: null,
                error: { message: "edge fn fail" },
            });
            expect(await requestCashout(10000)).toBeNull();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════

describe("finance-hub-store", () => {
    // ── loadDashboard ──
    describe("loadDashboard", () => {
        it("sets stats on success", async () => {
            setupAuth();
            // Mock 5 parallel queries + todayTx
            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { balance: 1000, lifetime_earned: 3000, lifetime_spent: 2000 },
                                error: null,
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: { level: 1 }, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ count: 1, data: null, error: null }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ count: 0, data: null, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({
                                data: { current_streak: 5 },
                                error: null,
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            gte: jest.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    }),
                });

            await act(async () => {
                await useFinanceHubStore.getState().loadDashboard();
            });

            const state = useFinanceHubStore.getState();
            expect(state.stats).not.toBeNull();
            expect(state.stats!.balanceIc).toBe(1000);
            expect(state.isLoading).toBe(false);
            expect(state.lastRefresh).not.toBeNull();
        });

        it("sets stats to null when API returns null", async () => {
            setupAuth();
            mockFrom.mockImplementation(() => {
                throw new Error("fail");
            });

            await act(async () => {
                await useFinanceHubStore.getState().loadDashboard();
            });

            const state = useFinanceHubStore.getState();
            // fetchDashboardStats catches internally → returns null → store stores null
            expect(state.stats).toBeNull();
            expect(state.isLoading).toBe(false);
        });
    });

    // ── loadActivities ──
    describe("loadActivities", () => {
        it("sets activities on success", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    or: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: [
                                    {
                                        id: "a-1",
                                        transaction_type: "reward",
                                        to_user_id: "user-42",
                                        from_user_id: "system",
                                        amount: 50,
                                        description: "reward",
                                        reference_id: null,
                                        created_at: "2026-02-15",
                                    },
                                ],
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            await act(async () => {
                await useFinanceHubStore.getState().loadActivities();
            });

            expect(useFinanceHubStore.getState().activities).toHaveLength(1);
        });
    });

    // ── loadStreak ──
    describe("loadStreak", () => {
        it("sets streak on success", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: {
                                user_id: "user-42",
                                current_streak: 10,
                                longest_streak: 20,
                                last_login_date: "2026-02-15",
                                total_earned_ic: 500,
                                created_at: "2026-01-01",
                                updated_at: "2026-02-15",
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            await act(async () => {
                await useFinanceHubStore.getState().loadStreak();
            });

            const streak = useFinanceHubStore.getState().streak;
            expect(streak).not.toBeNull();
            expect(streak!.currentStreak).toBe(10);
            expect(streak!.tier).toBe("silver");
        });
    });

    // ── loadBadges ──
    describe("loadBadges", () => {
        it("sets badges on success", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: [
                                {
                                    id: "ub-1",
                                    badge_id: "b-1",
                                    badges: { name: "Test", emoji: "⭐", rarity: "common" },
                                    reward_claimed_at: null,
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            });

            await act(async () => {
                await useFinanceHubStore.getState().loadBadges();
            });

            expect(useFinanceHubStore.getState().badges).toHaveLength(1);
        });
    });

    // ── claimDailyLogin ──
    describe("claimDailyLogin", () => {
        it("records login and refreshes streak", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({
                data: { reward_ic: 10, new_streak: 2 },
                error: null,
            });
            // After recordDailyLogin, store calls fetchLoginStreak
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: {
                                user_id: "user-42",
                                current_streak: 2,
                                longest_streak: 2,
                                last_login_date: new Date().toISOString(),
                                total_earned_ic: 20,
                                created_at: "2026-01-01",
                                updated_at: new Date().toISOString(),
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            let result: { rewardIc: number; newStreak: number } | null = null;
            await act(async () => {
                result = await useFinanceHubStore.getState().claimDailyLogin();
            });

            expect(result).toEqual({ rewardIc: 10, newStreak: 2 });
            expect(useFinanceHubStore.getState().streak?.currentStreak).toBe(2);
        });

        it("returns null when rpc fails", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({ data: null, error: { message: "fail" } });

            let result: { rewardIc: number; newStreak: number } | null = null;
            await act(async () => {
                result = await useFinanceHubStore.getState().claimDailyLogin();
            });

            expect(result).toBeNull();
        });
    });

    // ── claimBadge ──
    describe("claimBadge", () => {
        it("claims badge and updates local state", async () => {
            // Pre-set badges
            useFinanceHubStore.setState({
                badges: [
                    {
                        id: "ub-1",
                        badgeId: "b-1",
                        badgeName: "Test",
                        badgeEmoji: "⭐",
                        rarity: "rare",
                        rewardIc: 100,
                        claimedAt: null,
                    },
                ],
            });

            setupAuth();
            mockRpc.mockResolvedValue({ data: 100, error: null });

            let amount = 0;
            await act(async () => {
                amount = await useFinanceHubStore.getState().claimBadge("b-1");
            });

            expect(amount).toBe(100);
            const badges = useFinanceHubStore.getState().badges;
            expect(badges[0].claimedAt).not.toBeNull();
        });

        it("returns 0 on failure", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({ data: null, error: { message: "fail" } });

            let amount = 0;
            await act(async () => {
                amount = await useFinanceHubStore.getState().claimBadge("b-1");
            });

            expect(amount).toBe(0);
        });
    });

    // ── refreshAll ──
    describe("refreshAll", () => {
        it("loads all data in parallel", async () => {
            setupAuth();

            // 5 parallel fetches: dashboard(5+1), activities, streak, badges, cashout(2)
            // dashboard: wallet
            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { balance: 500, lifetime_earned: 500, lifetime_spent: 0 },
                                error: null,
                            }),
                        }),
                    }),
                })
                // dashboard: kyc
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                        }),
                    }),
                })
                // dashboard: methods count
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ count: 0, data: null, error: null }),
                    }),
                })
                // dashboard: missions count
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockResolvedValue({ count: 0, data: null, error: null }),
                        }),
                    }),
                })
                // dashboard: streak
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                        }),
                    }),
                })
                // activities: transactions
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        or: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
                            }),
                        }),
                    }),
                })
                // streak: login_streaks
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                        }),
                    }),
                })
                // badges: user_badges
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    }),
                })
                // cashout: kyc
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                        }),
                    }),
                })
                // cashout: daily
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                gte: jest.fn().mockResolvedValue({ data: [], error: null }),
                            }),
                        }),
                    }),
                })
                // dashboard todayTx
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            gte: jest.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    }),
                });

            await act(async () => {
                await useFinanceHubStore.getState().refreshAll();
            });

            const state = useFinanceHubStore.getState();
            expect(state.isLoading).toBe(false);
            expect(state.lastRefresh).not.toBeNull();
            expect(state.stats).not.toBeNull();
        });
    });

    // ── clearError ──
    describe("clearError", () => {
        it("clears error", () => {
            useFinanceHubStore.setState({ error: "some error" });
            useFinanceHubStore.getState().clearError();
            expect(useFinanceHubStore.getState().error).toBeNull();
        });
    });
});
