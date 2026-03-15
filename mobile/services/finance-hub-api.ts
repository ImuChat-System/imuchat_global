/**
 * Finance Hub API — Sprint M-F1
 *
 * Service API pour le Finance Hub mobile.
 * Adapté du desktop finance-hub-service.ts (S44) pour React Native / Supabase.
 */

import type {
    BadgeRarity,
    BadgeReward,
    CashoutLimits,
    CashoutRequest,
    FinanceActivity,
    FinanceActivityType,
    FinanceDashboardStats,
    KycLevel,
    LoginStreak
} from "@/types/finance-hub";
import {
    BADGE_RARITY_CONFIG,
    DAILY_CASHOUT_LIMIT_IC,
    IMUCOIN_TO_EUR_CENTS,
    KYC_REQUIRED_FOR_CASHOUT,
    MAX_CASHOUT_IC,
    MIN_CASHOUT_IC,
    computeCashoutNet,
    computeStreakTier,
    getNextStreakReward,
    icToEurCents,
} from "@/types/finance-hub";
import { createLogger } from "./logger";
import { supabase } from "./supabase";

const log = createLogger("finance-hub-api");

// ── Auth Helper ──────────────────────────────────────────────

async function requireUser(): Promise<string | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// ── Dashboard Stats ──────────────────────────────────────────

export async function fetchDashboardStats(): Promise<FinanceDashboardStats | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const [walletRes, kycRes, methodsRes, missionsRes, streakRes] =
            await Promise.all([
                supabase
                    .from("imucoin_wallets")
                    .select("*")
                    .eq("user_id", userId)
                    .single(),
                supabase
                    .from("user_kyc")
                    .select("level")
                    .eq("user_id", userId)
                    .maybeSingle(),
                supabase
                    .from("payment_methods")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", userId),
                supabase
                    .from("user_missions")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", userId)
                    .eq("status", "in_progress"),
                supabase
                    .from("login_streaks")
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle(),
            ]);

        const wallet = walletRes.data;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: todayTx } = await supabase
            .from("imucoin_transactions")
            .select("amount")
            .eq("to_user_id", userId)
            .gte("created_at", todayStart.toISOString());

        const todayEarned = (todayTx ?? []).reduce(
            (sum, t) => sum + ((t.amount as number) ?? 0),
            0,
        );

        return {
            balanceIc: (wallet?.balance as number) ?? 0,
            balanceFiatCents: icToEurCents((wallet?.balance as number) ?? 0),
            currency: "EUR",
            lifetimeEarned: (wallet?.lifetime_earned as number) ?? 0,
            lifetimeSpent: (wallet?.lifetime_spent as number) ?? 0,
            todayEarned,
            activeMissions: missionsRes.count ?? 0,
            currentStreak: (streakRes.data?.current_streak as number) ?? 0,
            kycLevel: ((kycRes.data?.level as number) ?? 0) as KycLevel,
            paymentMethodsCount: methodsRes.count ?? 0,
        };
    } catch (err) {
        log.error("fetchDashboardStats failed", err);
        return null;
    }
}

// ── Login Streak ─────────────────────────────────────────────

export async function fetchLoginStreak(): Promise<LoginStreak | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase
            .from("login_streaks")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return {
                userId,
                currentStreak: 0,
                longestStreak: 0,
                lastLoginDate: new Date().toISOString(),
                tier: "bronze",
                nextRewardIc: 10,
                totalEarnedIc: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }

        const current = (data.current_streak as number) ?? 0;
        return {
            userId: data.user_id as string,
            currentStreak: current,
            longestStreak: (data.longest_streak as number) ?? 0,
            lastLoginDate: data.last_login_date as string,
            tier: computeStreakTier(current),
            nextRewardIc: getNextStreakReward(current)?.reward ?? 0,
            totalEarnedIc: (data.total_earned_ic as number) ?? 0,
            createdAt: data.created_at as string,
            updatedAt: data.updated_at as string,
        };
    } catch (err) {
        log.error("fetchLoginStreak failed", err);
        return null;
    }
}

export async function recordDailyLogin(): Promise<{
    rewardIc: number;
    newStreak: number;
} | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.rpc("record_daily_login", {
            p_user_id: userId,
        });
        if (error) throw error;
        return {
            rewardIc:
                ((data as Record<string, unknown>)?.reward_ic as number) ?? 0,
            newStreak:
                ((data as Record<string, unknown>)?.new_streak as number) ?? 0,
        };
    } catch (err) {
        log.error("recordDailyLogin failed", err);
        return null;
    }
}

// ── Badge Rewards ────────────────────────────────────────────

export async function fetchBadgeRewards(): Promise<BadgeReward[]> {
    const userId = await requireUser();
    if (!userId) return [];

    try {
        const { data, error } = await supabase
            .from("user_badges")
            .select("*, badges(*)")
            .eq("user_id", userId)
            .order("earned_at", { ascending: false });

        if (error) throw error;

        return (data ?? []).map((row) => {
            const badge = row.badges as Record<string, unknown> | null;
            return {
                id: row.id as string,
                badgeId: row.badge_id as string,
                badgeName: (badge?.name as string) ?? "",
                badgeEmoji: (badge?.emoji as string) ?? "🏅",
                rarity: ((badge?.rarity as string) ?? "common") as BadgeRarity,
                rewardIc:
                    BADGE_RARITY_CONFIG[
                        ((badge?.rarity as string) ?? "common") as BadgeRarity
                    ]?.rewardIc ?? 25,
                claimedAt: (row.reward_claimed_at as string) ?? null,
            };
        });
    } catch (err) {
        log.error("fetchBadgeRewards failed", err);
        return [];
    }
}

export async function claimBadgeReward(
    badgeId: string,
): Promise<{ amountIc: number } | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.rpc("claim_badge_reward", {
            p_user_id: userId,
            p_badge_id: badgeId,
        });
        if (error) throw error;
        return { amountIc: (data as number) ?? 0 };
    } catch (err) {
        log.error("claimBadgeReward failed", err);
        return null;
    }
}

// ── Recent Activities ────────────────────────────────────────

function mapTransactionTypeToActivity(
    txType: string,
    isRecipient: boolean,
): FinanceActivityType {
    switch (txType) {
        case "purchase":
            return isRecipient ? "topup" : "purchase";
        case "reward":
            return "mission_reward";
        case "transfer":
            return "transfer";
        case "refund":
            return "refund";
        case "admin_grant":
            return "topup";
        default:
            return "transfer";
    }
}

export async function fetchRecentActivities(
    limit = 30,
): Promise<FinanceActivity[]> {
    const userId = await requireUser();
    if (!userId) return [];

    try {
        const { data, error } = await supabase
            .from("imucoin_transactions")
            .select("*")
            .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data ?? []).map((row) => {
            const activityType = mapTransactionTypeToActivity(
                row.transaction_type as string,
                row.to_user_id === userId,
            );
            return {
                id: row.id as string,
                type: activityType,
                amountIc: row.amount as number,
                description: (row.description as string) ?? "",
                referenceId: (row.reference_id as string) ?? null,
                createdAt: row.created_at as string,
            };
        });
    } catch (err) {
        log.error("fetchRecentActivities failed", err);
        return [];
    }
}

// ── Cashout ──────────────────────────────────────────────────

export async function fetchCashoutLimits(): Promise<CashoutLimits | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const [kycRes, dailyRes] = await Promise.all([
            supabase
                .from("user_kyc")
                .select("level")
                .eq("user_id", userId)
                .maybeSingle(),
            supabase
                .from("cashout_requests")
                .select("amount_ic")
                .eq("user_id", userId)
                .eq("status", "completed")
                .gte(
                    "created_at",
                    new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
                ),
        ]);

        const kycLevel = ((kycRes.data?.level as number) ?? 0) as KycLevel;
        const dailyUsed = (dailyRes.data ?? []).reduce(
            (sum, r) => sum + ((r.amount_ic as number) ?? 0),
            0,
        );

        return {
            minAmountIc: MIN_CASHOUT_IC,
            maxAmountIc: MAX_CASHOUT_IC,
            dailyLimitIc: DAILY_CASHOUT_LIMIT_IC,
            dailyUsedIc: dailyUsed,
            kycRequired: KYC_REQUIRED_FOR_CASHOUT,
            userKycLevel: kycLevel,
            conversionRate: IMUCOIN_TO_EUR_CENTS,
        };
    } catch (err) {
        log.error("fetchCashoutLimits failed", err);
        return null;
    }
}

export async function requestCashout(
    amountIc: number,
): Promise<CashoutRequest | null> {
    const userId = await requireUser();
    if (!userId) return null;

    try {
        const { data, error } = await supabase.functions.invoke("request-cashout", {
            body: {
                userId,
                amountIc,
                amountFiatCents: icToEurCents(computeCashoutNet(amountIc)),
                currency: "EUR",
            },
        });
        if (error) throw error;
        return data as CashoutRequest;
    } catch (err) {
        log.error("requestCashout failed", err);
        return null;
    }
}
