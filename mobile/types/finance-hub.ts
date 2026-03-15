/**
 * Finance Hub Types — Sprint M-F1
 *
 * Types pour le Finance Hub (Dashboard financier enrichi).
 * Adapté du desktop finance-hub-service.ts (S44) pour React Native.
 */

// ── Enums & Types ────────────────────────────────────────────

export type KycLevel = 0 | 1 | 2 | 3;

export type KycStatus = "none" | "pending" | "verified" | "rejected";

export type FinanceHubTab =
    | "dashboard"
    | "wallet"
    | "methods"
    | "missions"
    | "cashout"
    | "kyc";

export type FiatCurrency = "EUR" | "USD" | "GBP" | "JPY" | "CHF";

export type FinanceActivityType =
    | "topup"
    | "transfer"
    | "mission_reward"
    | "streak_reward"
    | "badge_reward"
    | "cashout"
    | "purchase"
    | "refund";

export type MissionCategory =
    | "social"
    | "engagement"
    | "learning"
    | "creative"
    | "commerce"
    | "streak";

export type MissionDifficulty = "easy" | "medium" | "hard";

export type StreakTier = "bronze" | "silver" | "gold" | "diamond";

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export type CashoutStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "rejected";

// ── Interfaces ───────────────────────────────────────────────

export interface FinanceDashboardStats {
    balanceIc: number;
    balanceFiatCents: number;
    currency: FiatCurrency;
    lifetimeEarned: number;
    lifetimeSpent: number;
    todayEarned: number;
    activeMissions: number;
    currentStreak: number;
    kycLevel: KycLevel;
    paymentMethodsCount: number;
}

export interface LoginStreak {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastLoginDate: string;
    tier: StreakTier;
    nextRewardIc: number;
    totalEarnedIc: number;
    createdAt: string;
    updatedAt: string;
}

export interface BadgeReward {
    id: string;
    badgeId: string;
    badgeName: string;
    badgeEmoji: string;
    rarity: BadgeRarity;
    rewardIc: number;
    claimedAt: string | null;
}

export interface FinanceActivity {
    id: string;
    type: FinanceActivityType;
    amountIc: number;
    description: string;
    referenceId: string | null;
    createdAt: string;
}

export interface CashoutLimits {
    minAmountIc: number;
    maxAmountIc: number;
    dailyLimitIc: number;
    dailyUsedIc: number;
    kycRequired: KycLevel;
    userKycLevel: KycLevel;
    conversionRate: number;
}

export interface CashoutRequest {
    id: string;
    userId: string;
    amountIc: number;
    amountFiatCents: number;
    currency: FiatCurrency;
    status: CashoutStatus;
    rejectionReason: string | null;
    createdAt: string;
    completedAt: string | null;
}

export interface TopUpPackage {
    id: string;
    name: string;
    coins: number;
    bonus: number;
    priceCents: number;
    currency: FiatCurrency;
    popular: boolean;
    savingsPercent: number;
}

// ── Config Maps ──────────────────────────────────────────────

export const KYC_LEVEL_CONFIG: Record<
    KycLevel,
    { label: string; icon: string; color: string; limits: string }
> = {
    0: { label: "Non vérifié", icon: "⚪", color: "#94a3b8", limits: "500 IC / jour" },
    1: { label: "Basique", icon: "🟡", color: "#f59e0b", limits: "5 000 IC / jour" },
    2: { label: "Vérifié", icon: "🟢", color: "#22c55e", limits: "50 000 IC / jour, retrait fiat" },
    3: { label: "Premium", icon: "💎", color: "#3b82f6", limits: "Illimité" },
};

export const STREAK_TIER_CONFIG: Record<
    StreakTier,
    { label: string; icon: string; color: string; minDays: number; dailyReward: number }
> = {
    bronze: { label: "Bronze", icon: "🥉", color: "#cd7f32", minDays: 1, dailyReward: 10 },
    silver: { label: "Argent", icon: "🥈", color: "#c0c0c0", minDays: 7, dailyReward: 25 },
    gold: { label: "Or", icon: "🥇", color: "#ffd700", minDays: 30, dailyReward: 50 },
    diamond: { label: "Diamant", icon: "💎", color: "#b9f2ff", minDays: 100, dailyReward: 100 },
};

export const BADGE_RARITY_CONFIG: Record<
    BadgeRarity,
    { label: string; color: string; rewardIc: number }
> = {
    common: { label: "Commun", color: "#94a3b8", rewardIc: 25 },
    rare: { label: "Rare", color: "#3b82f6", rewardIc: 100 },
    epic: { label: "Épique", color: "#8b5cf6", rewardIc: 500 },
    legendary: { label: "Légendaire", color: "#f59e0b", rewardIc: 2000 },
};

export const MISSION_CATEGORY_CONFIG: Record<
    MissionCategory,
    { label: string; icon: string; color: string }
> = {
    social: { label: "Social", icon: "💬", color: "#3b82f6" },
    engagement: { label: "Engagement", icon: "🔥", color: "#f59e0b" },
    learning: { label: "Apprentissage", icon: "📚", color: "#8b5cf6" },
    creative: { label: "Créativité", icon: "🎨", color: "#ec4899" },
    commerce: { label: "Commerce", icon: "🛒", color: "#22c55e" },
    streak: { label: "Streak", icon: "⚡", color: "#f97316" },
};

export const CASHOUT_STATUS_CONFIG: Record<
    CashoutStatus,
    { label: string; icon: string; color: string }
> = {
    pending: { label: "En attente", icon: "⏳", color: "#f59e0b" },
    processing: { label: "Traitement", icon: "⚙️", color: "#3b82f6" },
    completed: { label: "Complété", icon: "✅", color: "#22c55e" },
    failed: { label: "Échoué", icon: "❌", color: "#ef4444" },
    rejected: { label: "Refusé", icon: "🚫", color: "#ef4444" },
};

// ── Constants ────────────────────────────────────────────────

export const IMUCOIN_TO_EUR_CENTS = 10; // 1 IC = 0.10 €
export const MIN_CASHOUT_IC = 5_000; // Min retrait = 50 €
export const MAX_CASHOUT_IC = 500_000; // Max retrait = 5000 €
export const DAILY_CASHOUT_LIMIT_IC = 100_000; // 1000 € / jour
export const KYC_REQUIRED_FOR_CASHOUT: KycLevel = 2;
export const CASHOUT_FEE_PERCENT = 2.5;
export const STREAK_LOGIN_WINDOW_HOURS = 36;
export const MAX_DAILY_MISSIONS = 5;

export const TOPUP_PACKAGES: TopUpPackage[] = [
    { id: "pack_100", name: "100 ImuCoins", coins: 100, bonus: 0, priceCents: 99, currency: "EUR", popular: false, savingsPercent: 0 },
    { id: "pack_500", name: "500 ImuCoins", coins: 500, bonus: 50, priceCents: 449, currency: "EUR", popular: false, savingsPercent: 10 },
    { id: "pack_1000", name: "1 000 ImuCoins", coins: 1000, bonus: 200, priceCents: 799, currency: "EUR", popular: true, savingsPercent: 20 },
    { id: "pack_2500", name: "2 500 ImuCoins", coins: 2500, bonus: 750, priceCents: 1799, currency: "EUR", popular: false, savingsPercent: 28 },
    { id: "pack_5000", name: "5 000 ImuCoins", coins: 5000, bonus: 1500, priceCents: 3499, currency: "EUR", popular: false, savingsPercent: 30 },
    { id: "pack_10000", name: "10 000 ImuCoins", coins: 10000, bonus: 4000, priceCents: 5999, currency: "EUR", popular: false, savingsPercent: 40 },
];

export const STREAK_REWARD_SCHEDULE: { day: number; reward: number; label: string }[] = [
    { day: 1, reward: 10, label: "Jour 1" },
    { day: 3, reward: 30, label: "3 jours" },
    { day: 7, reward: 100, label: "1 semaine" },
    { day: 14, reward: 200, label: "2 semaines" },
    { day: 30, reward: 500, label: "1 mois" },
    { day: 60, reward: 1000, label: "2 mois" },
    { day: 100, reward: 2500, label: "100 jours" },
    { day: 365, reward: 10000, label: "1 an 🎉" },
];

// ── Helpers ──────────────────────────────────────────────────

export function icToEurCents(amountIc: number): number {
    return Math.round(amountIc * IMUCOIN_TO_EUR_CENTS);
}

export function eurCentsToIc(cents: number): number {
    return Math.round(cents / IMUCOIN_TO_EUR_CENTS);
}

export function formatImuCoins(amount: number): string {
    return `${amount.toLocaleString("fr-FR")} IC`;
}

export function formatFiatCents(cents: number, currency: FiatCurrency = "EUR"): string {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

export function computeStreakTier(days: number): StreakTier {
    if (days >= 100) return "diamond";
    if (days >= 30) return "gold";
    if (days >= 7) return "silver";
    return "bronze";
}

export function getStreakDailyReward(tier: StreakTier): number {
    return STREAK_TIER_CONFIG[tier]?.dailyReward ?? 10;
}

export function getNextStreakReward(
    currentStreak: number,
): { day: number; reward: number; label: string } | null {
    return STREAK_REWARD_SCHEDULE.find((s) => s.day > currentStreak) ?? null;
}

export function computeCashoutFee(amountIc: number): number {
    return Math.round(amountIc * (CASHOUT_FEE_PERCENT / 100));
}

export function computeCashoutNet(amountIc: number): number {
    return amountIc - computeCashoutFee(amountIc);
}

export function canCashout(
    kycLevel: KycLevel,
    amountIc: number,
    dailyUsedIc: number,
): boolean {
    if (kycLevel < KYC_REQUIRED_FOR_CASHOUT) return false;
    if (amountIc < MIN_CASHOUT_IC) return false;
    if (amountIc > MAX_CASHOUT_IC) return false;
    if (dailyUsedIc + amountIc > DAILY_CASHOUT_LIMIT_IC) return false;
    return true;
}

export function isStreakActive(lastLoginDate: string): boolean {
    const last = new Date(lastLoginDate).getTime();
    const now = Date.now();
    return now - last < STREAK_LOGIN_WINDOW_HOURS * 60 * 60 * 1000;
}

export function isActivityPositive(type: FinanceActivityType): boolean {
    return ["topup", "mission_reward", "streak_reward", "badge_reward", "refund"].includes(type);
}

export function getActivityIcon(type: FinanceActivityType): string {
    const icons: Record<FinanceActivityType, string> = {
        topup: "💰",
        transfer: "↔️",
        mission_reward: "🎯",
        streak_reward: "🔥",
        badge_reward: "🏅",
        cashout: "🏧",
        purchase: "🛒",
        refund: "↩️",
    };
    return icons[type] ?? "💫";
}

export function getActivityColor(type: FinanceActivityType): string {
    const colors: Record<FinanceActivityType, string> = {
        topup: "#22c55e",
        transfer: "#3b82f6",
        mission_reward: "#f59e0b",
        streak_reward: "#f97316",
        badge_reward: "#8b5cf6",
        cashout: "#ef4444",
        purchase: "#ef4444",
        refund: "#22c55e",
    };
    return colors[type] ?? "#94a3b8";
}
