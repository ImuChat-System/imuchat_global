/**
 * Types for Creator Monetization — Sprint S14B
 *
 * Tips, Subscriptions, Subscriber-only content, Revenue
 */

// ── Tip ──────────────────────────────────────────────────────────

export interface TipTransaction {
    id: string;
    tipper_id: string;
    creator_id: string;
    amount: number; // ImuCoins
    message: string;
    created_at: string;
}

export interface TipPreset {
    amount: number;
    emoji: string;
    label: string;
}

export const TIP_PRESETS: TipPreset[] = [
    { amount: 10, emoji: "☕", label: "Café" },
    { amount: 50, emoji: "🎁", label: "Cadeau" },
    { amount: 100, emoji: "💎", label: "Diamant" },
    { amount: 500, emoji: "🚀", label: "Fusée" },
    { amount: 1000, emoji: "👑", label: "Royal" },
];

// ── Subscription ─────────────────────────────────────────────────

export type SubscriptionTier = "basic" | "pro" | "vip";
export type SubscriptionStatus = "active" | "cancelled" | "expired";

export interface CreatorSubscription {
    id: string;
    subscriber_id: string;
    creator_id: string;
    tier: SubscriptionTier;
    price_cents: number;
    currency: string;
    status: SubscriptionStatus;
    started_at: string;
    expires_at: string | null;
    cancelled_at: string | null;
}

export interface SubscriptionTierInfo {
    tier: SubscriptionTier;
    label: string;
    emoji: string;
    price_cents: number;
    perks: string[];
}

export const SUBSCRIPTION_TIERS: SubscriptionTierInfo[] = [
    {
        tier: "basic",
        label: "Basic",
        emoji: "⭐",
        price_cents: 299,
        perks: ["Contenu exclusif", "Badge abonné"],
    },
    {
        tier: "pro",
        label: "Pro",
        emoji: "💫",
        price_cents: 699,
        perks: ["Contenu exclusif", "Badge pro", "Accès anticipé", "Chat privé"],
    },
    {
        tier: "vip",
        label: "VIP",
        emoji: "👑",
        price_cents: 1499,
        perks: [
            "Tout Pro",
            "Badge VIP",
            "Shoutouts",
            "Coulisses",
            "Priorité live",
        ],
    },
];

// ── Subscriber Content ───────────────────────────────────────────

export interface SubscriberContent {
    id: string;
    creator_id: string;
    video_id: string;
    min_tier: SubscriptionTier;
    created_at: string;
}

// ── Revenue ──────────────────────────────────────────────────────

export interface CreatorRevenue {
    tips_total: number;
    tips_count: number;
    subs_revenue: number;
    subs_active: number;
    total_revenue: number;
    period_days: number;
}

export interface RevenueEntry {
    day: string;
    tips: number;
    subs: number;
    total: number;
}
