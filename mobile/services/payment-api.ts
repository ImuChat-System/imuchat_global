/**
 * Payment API Service — DEV-028
 *
 * Stripe integration for top-up, payment methods, checkout sessions.
 * Uses Supabase Edge Functions as backend proxy to Stripe.
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

import type {
    CardBrand,
    CheckoutSession,
    CheckoutStatus,
    CurrencyCode,
    PaymentMethod,
    PaymentMethodType,
    TopupPackage,
} from "@/types/wallet";

const logger = createLogger("PaymentAPI");

// ============================================================================
// TOP-UP PACKAGES
// ============================================================================

/** Default packages if Supabase is unreachable */
const DEFAULT_PACKAGES: TopupPackage[] = [
    {
        id: "pkg_100",
        imucoins: 100,
        priceEur: 0.99,
        priceUsd: 0.99,
        priceJpy: 150,
        bonusPercent: 0,
        label: "Starter",
    },
    {
        id: "pkg_500",
        imucoins: 500,
        priceEur: 4.49,
        priceUsd: 4.49,
        priceJpy: 700,
        bonusPercent: 10,
        label: "Popular",
        popular: true,
    },
    {
        id: "pkg_1200",
        imucoins: 1200,
        priceEur: 9.99,
        priceUsd: 9.99,
        priceJpy: 1500,
        bonusPercent: 20,
        label: "Best Value",
    },
    {
        id: "pkg_3000",
        imucoins: 3000,
        priceEur: 22.99,
        priceUsd: 22.99,
        priceJpy: 3500,
        bonusPercent: 30,
        label: "Mega Pack",
    },
    {
        id: "pkg_6500",
        imucoins: 6500,
        priceEur: 44.99,
        priceUsd: 44.99,
        priceJpy: 7000,
        bonusPercent: 40,
        label: "VIP Pack",
    },
];

/**
 * Fetch available top-up packages
 */
export async function fetchTopupPackages(): Promise<TopupPackage[]> {
    try {
        const { data, error } = await supabase
            .from("topup_packages")
            .select("*")
            .eq("active", true)
            .order("price_eur", { ascending: true });

        if (error) {
            logger.warn("Failed to fetch topup packages, using defaults", error);
            return DEFAULT_PACKAGES;
        }

        if (!data || data.length === 0) {
            return DEFAULT_PACKAGES;
        }

        return data.map(
            (row: Record<string, unknown>): TopupPackage => ({
                id: row.id as string,
                imucoins: row.imucoins as number,
                priceEur: row.price_eur as number,
                priceUsd: row.price_usd as number,
                priceJpy: row.price_jpy as number,
                bonusPercent: (row.bonus_percent as number) || 0,
                label: row.label as string,
                popular: (row.popular as boolean) || false,
            }),
        );
    } catch (err) {
        logger.error("fetchTopupPackages error", err);
        return DEFAULT_PACKAGES;
    }
}

// ============================================================================
// CHECKOUT SESSIONS
// ============================================================================

/**
 * Create a Stripe checkout session for top-up
 * Calls a Supabase Edge Function that creates the Stripe session server-side
 */
export async function createCheckoutSession(
    packageId: string,
    currency: CurrencyCode = "EUR",
): Promise<CheckoutSession | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            logger.error("Not authenticated");
            return null;
        }

        const { data, error } = await supabase.functions.invoke(
            "create-checkout-session",
            {
                body: {
                    userId: user.id,
                    packageId,
                    currency,
                    successUrl: "imuchat://wallet/topup-success",
                    cancelUrl: "imuchat://wallet/topup-cancel",
                },
            },
        );

        if (error) {
            logger.error("Failed to create checkout session", error);
            return null;
        }

        return mapCheckoutSession(data);
    } catch (err) {
        logger.error("createCheckoutSession error", err);
        return null;
    }
}

/**
 * Check the status of a checkout session
 */
export async function getCheckoutStatus(
    sessionId: string,
): Promise<CheckoutStatus | null> {
    try {
        const { data, error } = await supabase.functions.invoke(
            "check-checkout-status",
            { body: { sessionId } },
        );

        if (error) {
            logger.error("Failed to check checkout status", error);
            return null;
        }

        return (data?.status as CheckoutStatus) || null;
    } catch (err) {
        logger.error("getCheckoutStatus error", err);
        return null;
    }
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Fetch saved payment methods from Stripe via server
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase.functions.invoke(
            "list-payment-methods",
            { body: { userId: user.id } },
        );

        if (error) {
            logger.error("Failed to fetch payment methods", error);
            return [];
        }

        if (!data?.methods || !Array.isArray(data.methods)) {
            return [];
        }

        return data.methods.map(mapPaymentMethod);
    } catch (err) {
        logger.error("fetchPaymentMethods error", err);
        return [];
    }
}

/**
 * Add a new payment method via Stripe SetupIntent
 * Returns a client_secret for the Stripe SDK to confirm
 */
export async function createSetupIntent(): Promise<{
    clientSecret: string;
    setupIntentId: string;
} | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.functions.invoke(
            "create-setup-intent",
            { body: { userId: user.id } },
        );

        if (error) {
            logger.error("Failed to create setup intent", error);
            return null;
        }

        return {
            clientSecret: data.clientSecret as string,
            setupIntentId: data.setupIntentId as string,
        };
    } catch (err) {
        logger.error("createSetupIntent error", err);
        return null;
    }
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(methodId: string): Promise<boolean> {
    try {
        const { error } = await supabase.functions.invoke(
            "remove-payment-method",
            { body: { methodId } },
        );

        if (error) {
            logger.error("Failed to remove payment method", error);
            return false;
        }

        logger.info(`Removed payment method ${methodId}`);
        return true;
    } catch (err) {
        logger.error("removePaymentMethod error", err);
        return false;
    }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(methodId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.functions.invoke(
            "set-default-payment-method",
            { body: { userId: user.id, methodId } },
        );

        if (error) {
            logger.error("Failed to set default payment method", error);
            return false;
        }

        logger.info(`Set default payment method ${methodId}`);
        return true;
    } catch (err) {
        logger.error("setDefaultPaymentMethod error", err);
        return false;
    }
}

// ============================================================================
// CASHOUT (Stripe Connect)
// ============================================================================

/**
 * Request a cashout to bank account via Stripe Connect
 */
export async function requestCashout(
    amountImc: number,
    targetCurrency: CurrencyCode = "EUR",
): Promise<{ transactionId: string } | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        if (amountImc <= 0) throw new Error("Amount must be positive");

        const { data, error } = await supabase.functions.invoke(
            "request-cashout",
            {
                body: {
                    userId: user.id,
                    amountImc,
                    targetCurrency,
                },
            },
        );

        if (error) {
            logger.error("Cashout request failed", error);
            return null;
        }

        logger.info(`Cashout requested: ${amountImc} IMC → ${targetCurrency}`);
        return { transactionId: data.transactionId as string };
    } catch (err) {
        logger.error("requestCashout error", err);
        return null;
    }
}

// ============================================================================
// PRICE HELPERS
// ============================================================================

/**
 * Get localized price for a package
 */
export function getPackagePrice(pkg: TopupPackage, currency: CurrencyCode): number {
    switch (currency) {
        case "USD":
            return pkg.priceUsd;
        case "JPY":
            return pkg.priceJpy;
        case "EUR":
        default:
            return pkg.priceEur;
    }
}

/**
 * Format a price with currency symbol
 */
export function formatPrice(amount: number, currency: CurrencyCode): string {
    const symbols: Record<string, string> = {
        EUR: "€",
        USD: "$",
        JPY: "¥",
        IMC: "IMC",
    };
    const symbol = symbols[currency] || currency;

    if (currency === "JPY") {
        return `${symbol}${Math.round(amount)}`;
    }

    return `${amount.toFixed(2)}${symbol}`;
}

// ============================================================================
// HELPERS
// ============================================================================

function mapCheckoutSession(data: Record<string, unknown>): CheckoutSession {
    return {
        id: data.id as string,
        url: data.url as string,
        status: (data.status as CheckoutStatus) || "pending",
        packageId: data.packageId as string,
        amount: data.amount as number,
        currency: (data.currency as CurrencyCode) || "EUR",
        createdAt: (data.createdAt as string) || new Date().toISOString(),
        expiresAt: (data.expiresAt as string) || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
}

function mapPaymentMethod(raw: Record<string, unknown>): PaymentMethod {
    return {
        id: raw.id as string,
        type: (raw.type as PaymentMethodType) || "card",
        last4: raw.last4 as string | undefined,
        brand: (raw.brand as CardBrand) || "unknown",
        expiryMonth: raw.expiryMonth as number | undefined,
        expiryYear: raw.expiryYear as number | undefined,
        isDefault: (raw.isDefault as boolean) || false,
        label: (raw.label as string) || formatPaymentLabel(raw),
        createdAt: (raw.createdAt as string) || new Date().toISOString(),
    };
}

function formatPaymentLabel(raw: Record<string, unknown>): string {
    const type = raw.type as PaymentMethodType;
    if (type === "apple_pay") return "Apple Pay";
    if (type === "google_pay") return "Google Pay";
    if (type === "bank_transfer") return "Bank Transfer";
    const brand = ((raw.brand as string) || "Card").toUpperCase();
    const last4 = raw.last4 || "****";
    return `${brand} •••• ${last4}`;
}
