/**
 * Subscription API Service — DEV-028
 *
 * ImuChat Pro / Premium subscription management.
 * Plans, subscribe, cancel, upgrade/downgrade, restore.
 * Uses Supabase Edge Functions → Stripe Billing.
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

import type {
    BillingInterval,
    CurrencyCode,
    SubscriptionPlan,
    SubscriptionStatus,
    SubscriptionTier,
    UserSubscription,
} from "@/types/wallet";

const logger = createLogger("SubscriptionAPI");

// ============================================================================
// DEFAULT PLANS
// ============================================================================

const DEFAULT_PLANS: SubscriptionPlan[] = [
    {
        id: "plan_free",
        tier: "free",
        name: "Free",
        description: "Accès de base à ImuChat",
        features: [
            "Messages illimités",
            "3 groupes max",
            "Modules basiques",
            "10 traductions/jour",
            "100 IMC bonus/mois",
        ],
        priceMonthlyEur: 0,
        priceYearlyEur: 0,
        priceMonthlyUsd: 0,
        priceYearlyUsd: 0,
        priceMonthlyJpy: 0,
        priceYearlyJpy: 0,
        trialDays: 0,
    },
    {
        id: "plan_pro",
        tier: "pro",
        name: "ImuChat Pro",
        description: "Pour les utilisateurs avancés",
        features: [
            "Tout Free +",
            "Groupes illimités",
            "Traduction illimitée",
            "Modules premium",
            "Alice IA avancée",
            "500 IMC bonus/mois",
            "Badge Pro ✨",
            "Thèmes exclusifs",
        ],
        priceMonthlyEur: 4.99,
        priceYearlyEur: 47.88,
        priceMonthlyUsd: 4.99,
        priceYearlyUsd: 47.88,
        priceMonthlyJpy: 780,
        priceYearlyJpy: 7480,
        trialDays: 7,
        popular: true,
    },
    {
        id: "plan_premium",
        tier: "premium",
        name: "ImuChat Premium",
        description: "L'expérience ultime",
        features: [
            "Tout Pro +",
            "IA sans limites (GPT-4, Claude)",
            "Stockage cloud 50 Go",
            "Priorité support",
            "1000 IMC bonus/mois",
            "Badge Premium 💎",
            "Accès bêta nouvelles fonctionnalités",
            "API développeur",
            "Backup automatique",
        ],
        priceMonthlyEur: 9.99,
        priceYearlyEur: 95.88,
        priceMonthlyUsd: 9.99,
        priceYearlyUsd: 95.88,
        priceMonthlyJpy: 1580,
        priceYearlyJpy: 14980,
        trialDays: 7,
    },
];

// ============================================================================
// PLANS
// ============================================================================

/**
 * Fetch available subscription plans
 */
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
        const { data, error } = await supabase
            .from("subscription_plans")
            .select("*")
            .eq("active", true)
            .order("price_monthly_eur", { ascending: true });

        if (error) {
            logger.warn("Failed to fetch plans, using defaults", error);
            return DEFAULT_PLANS;
        }

        if (!data || data.length === 0) {
            return DEFAULT_PLANS;
        }

        return data.map(mapSubscriptionPlan);
    } catch (err) {
        logger.error("fetchSubscriptionPlans error", err);
        return DEFAULT_PLANS;
    }
}

/**
 * Get plan details by tier
 */
export function getPlanByTier(tier: SubscriptionTier, plans: SubscriptionPlan[]): SubscriptionPlan | undefined {
    return plans.find((p) => p.tier === tier);
}

// ============================================================================
// USER SUBSCRIPTION
// ============================================================================

/**
 * Fetch current user subscription status
 */
export async function fetchCurrentSubscription(): Promise<UserSubscription | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .in("status", ["active", "trialing", "past_due"])
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            logger.error("Failed to fetch subscription", error);
            return null;
        }

        return data ? mapUserSubscription(data) : null;
    } catch (err) {
        logger.error("fetchCurrentSubscription error", err);
        return null;
    }
}

/**
 * Subscribe to a plan via Stripe Billing
 * Returns a checkout URL for payment
 */
export async function subscribeToPlan(
    planId: string,
    interval: BillingInterval = "month",
    currency: CurrencyCode = "EUR",
): Promise<{ url: string; subscriptionId: string } | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            logger.error("Not authenticated");
            return null;
        }

        const { data, error } = await supabase.functions.invoke(
            "create-subscription",
            {
                body: {
                    userId: user.id,
                    planId,
                    interval,
                    currency,
                    successUrl: "imuchat://wallet/subscription-success",
                    cancelUrl: "imuchat://wallet/subscription-cancel",
                },
            },
        );

        if (error) {
            logger.error("Failed to create subscription", error);
            return null;
        }

        return {
            url: data.url as string,
            subscriptionId: data.subscriptionId as string,
        };
    } catch (err) {
        logger.error("subscribeToPlan error", err);
        return null;
    }
}

/**
 * Cancel subscription (at period end)
 */
export async function cancelSubscription(): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.functions.invoke(
            "cancel-subscription",
            { body: { userId: user.id } },
        );

        if (error) {
            logger.error("Cancel subscription failed", error);
            return false;
        }

        logger.info("Subscription cancelled at period end");
        return true;
    } catch (err) {
        logger.error("cancelSubscription error", err);
        return false;
    }
}

/**
 * Resume a cancelled subscription (before period end)
 */
export async function resumeSubscription(): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.functions.invoke(
            "resume-subscription",
            { body: { userId: user.id } },
        );

        if (error) {
            logger.error("Resume subscription failed", error);
            return false;
        }

        logger.info("Subscription resumed");
        return true;
    } catch (err) {
        logger.error("resumeSubscription error", err);
        return false;
    }
}

/**
 * Change plan (upgrade/downgrade)
 */
export async function changePlan(
    newPlanId: string,
    interval: BillingInterval = "month",
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.functions.invoke(
            "change-subscription-plan",
            {
                body: {
                    userId: user.id,
                    newPlanId,
                    interval,
                },
            },
        );

        if (error) {
            logger.error("Change plan failed", error);
            return false;
        }

        logger.info(`Changed plan to ${newPlanId}`);
        return true;
    } catch (err) {
        logger.error("changePlan error", err);
        return false;
    }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get price for a plan based on currency and interval
 */
export function getPlanPrice(
    plan: SubscriptionPlan,
    interval: BillingInterval,
    currency: CurrencyCode,
): number {
    if (interval === "year") {
        switch (currency) {
            case "USD": return plan.priceYearlyUsd;
            case "JPY": return plan.priceYearlyJpy;
            default: return plan.priceYearlyEur;
        }
    }
    switch (currency) {
        case "USD": return plan.priceMonthlyUsd;
        case "JPY": return plan.priceMonthlyJpy;
        default: return plan.priceMonthlyEur;
    }
}

/**
 * Calculate yearly savings vs monthly
 */
export function getYearlySavings(plan: SubscriptionPlan, currency: CurrencyCode): number {
    const monthlyTotal = getPlanPrice(plan, "month", currency) * 12;
    const yearlyTotal = getPlanPrice(plan, "year", currency);
    return Math.max(0, monthlyTotal - yearlyTotal);
}

/**
 * Check if user has an active premium subscription
 */
export function isSubscriptionActive(sub: UserSubscription | null): boolean {
    if (!sub) return false;
    return sub.status === "active" || sub.status === "trialing";
}

/**
 * Check if subscription is in trial
 */
export function isInTrial(sub: UserSubscription | null): boolean {
    if (!sub) return false;
    return sub.status === "trialing";
}

/**
 * Get days remaining in current period
 */
export function getDaysRemaining(sub: UserSubscription | null): number {
    if (!sub) return 0;
    const end = new Date(sub.currentPeriodEnd).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)));
}

function mapSubscriptionPlan(row: Record<string, unknown>): SubscriptionPlan {
    return {
        id: row.id as string,
        tier: (row.tier as SubscriptionTier) || "free",
        name: row.name as string,
        description: (row.description as string) || "",
        features: (row.features as string[]) || [],
        priceMonthlyEur: (row.price_monthly_eur as number) || 0,
        priceYearlyEur: (row.price_yearly_eur as number) || 0,
        priceMonthlyUsd: (row.price_monthly_usd as number) || 0,
        priceYearlyUsd: (row.price_yearly_usd as number) || 0,
        priceMonthlyJpy: (row.price_monthly_jpy as number) || 0,
        priceYearlyJpy: (row.price_yearly_jpy as number) || 0,
        trialDays: (row.trial_days as number) || 0,
        popular: (row.popular as boolean) || false,
    };
}

function mapUserSubscription(row: Record<string, unknown>): UserSubscription {
    return {
        id: row.id as string,
        planId: (row.plan_id as string) || (row.planId as string),
        tier: (row.tier as SubscriptionTier) || "free",
        status: (row.status as SubscriptionStatus) || "active",
        interval: (row.interval as BillingInterval) || "month",
        currentPeriodStart: (row.current_period_start as string) || (row.currentPeriodStart as string) || new Date().toISOString(),
        currentPeriodEnd: (row.current_period_end as string) || (row.currentPeriodEnd as string) || new Date().toISOString(),
        cancelAtPeriodEnd: (row.cancel_at_period_end as boolean) || (row.cancelAtPeriodEnd as boolean) || false,
        trialEnd: (row.trial_end as string) || (row.trialEnd as string) || undefined,
        createdAt: (row.created_at as string) || (row.createdAt as string) || new Date().toISOString(),
    };
}
