/**
 * In-App Purchase Service — DEV-028
 *
 * Manages digital goods: themes, avatars, module unlocks, sticker packs.
 * Uses Supabase for catalog + purchase records.
 * Platform-specific receipt validation via Edge Functions.
 */

import { Platform } from "react-native";

import { createLogger } from "./logger";
import { supabase } from "./supabase";

import type {
    IAPCategory,
    IAPItemType,
    InAppItem,
    PurchaseReceipt,
} from "@/types/wallet";

const logger = createLogger("IAPService");

// ============================================================================
// CATALOG
// ============================================================================

/** Default catalog fallback */
const DEFAULT_CATALOG: InAppItem[] = [
    {
        id: "iap_theme_neon",
        productId: "com.imuchat.theme.neon",
        type: "non_consumable",
        category: "theme",
        name: "Neon Nights",
        description: "Thème cyberpunk néon",
        priceEur: 1.99,
        priceUsd: 1.99,
        priceJpy: 300,
        icon: "🌃",
    },
    {
        id: "iap_theme_sakura",
        productId: "com.imuchat.theme.sakura",
        type: "non_consumable",
        category: "theme",
        name: "Sakura Bloom",
        description: "Thème cerisier japonais",
        priceEur: 1.99,
        priceUsd: 1.99,
        priceJpy: 300,
        icon: "🌸",
    },
    {
        id: "iap_avatar_premium",
        productId: "com.imuchat.avatar.premium",
        type: "non_consumable",
        category: "avatar",
        name: "Premium Avatar Pack",
        description: "12 avatars exclusifs HD",
        priceEur: 2.99,
        priceUsd: 2.99,
        priceJpy: 450,
        icon: "👤",
    },
    {
        id: "iap_sticker_kawaii",
        productId: "com.imuchat.stickers.kawaii",
        type: "non_consumable",
        category: "sticker_pack",
        name: "Kawaii Stickers",
        description: "40 stickers kawaii animés",
        priceEur: 0.99,
        priceUsd: 0.99,
        priceJpy: 150,
        icon: "🎀",
    },
    {
        id: "iap_module_weather",
        productId: "com.imuchat.module.weather",
        type: "non_consumable",
        category: "module_premium",
        name: "ImuWeather Pro",
        description: "Météo avancée avec alertes",
        priceEur: 2.49,
        priceUsd: 2.49,
        priceJpy: 400,
        icon: "🌦️",
    },
    {
        id: "iap_feature_translate",
        productId: "com.imuchat.feature.translate_unlimited",
        type: "non_consumable",
        category: "feature_unlock",
        name: "Unlimited Translation",
        description: "Traduction illimitée dans les chats",
        priceEur: 3.99,
        priceUsd: 3.99,
        priceJpy: 600,
        icon: "🌍",
    },
    {
        id: "iap_coins_250",
        productId: "com.imuchat.coins.250",
        type: "consumable",
        category: "feature_unlock",
        name: "250 ImuCoins",
        description: "Achat direct de 250 ImuCoins",
        priceEur: 2.49,
        priceUsd: 2.49,
        priceJpy: 400,
        icon: "💰",
    },
];

/**
 * Fetch the IAP catalog from Supabase
 */
export async function fetchIAPCatalog(): Promise<InAppItem[]> {
    try {
        const { data, error } = await supabase
            .from("iap_catalog")
            .select("*")
            .eq("active", true)
            .order("category", { ascending: true });

        if (error) {
            logger.warn("Failed to fetch IAP catalog, using defaults", error);
            return DEFAULT_CATALOG;
        }

        if (!data || data.length === 0) {
            return DEFAULT_CATALOG;
        }

        return data.map(mapInAppItem);
    } catch (err) {
        logger.error("fetchIAPCatalog error", err);
        return DEFAULT_CATALOG;
    }
}

/**
 * Fetch catalog items by category
 */
export async function fetchIAPByCategory(category: IAPCategory): Promise<InAppItem[]> {
    try {
        const { data, error } = await supabase
            .from("iap_catalog")
            .select("*")
            .eq("active", true)
            .eq("category", category)
            .order("price_eur", { ascending: true });

        if (error) {
            logger.warn(`Failed to fetch IAP for category ${category}`, error);
            return DEFAULT_CATALOG.filter((item) => item.category === category);
        }

        if (!data || data.length === 0) {
            return DEFAULT_CATALOG.filter((item) => item.category === category);
        }

        return data.map(mapInAppItem);
    } catch (err) {
        logger.error("fetchIAPByCategory error", err);
        return DEFAULT_CATALOG.filter((item) => item.category === category);
    }
}

// ============================================================================
// PURCHASES
// ============================================================================

/**
 * Fetch user's purchased items
 */
export async function fetchPurchasedItems(): Promise<PurchaseReceipt[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("iap_purchases")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("purchased_at", { ascending: false });

        if (error) {
            logger.error("Failed to fetch purchases", error);
            return [];
        }

        return (data || []).map(mapPurchaseReceipt);
    } catch (err) {
        logger.error("fetchPurchasedItems error", err);
        return [];
    }
}

/**
 * Initiate a purchase for an IAP item.
 * For mobile: delegates to platform IAP, then validates receipt server-side.
 * For web: creates a Stripe checkout session.
 */
export async function purchaseItem(
    itemId: string,
): Promise<PurchaseReceipt | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            logger.error("Not authenticated");
            return null;
        }

        const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

        // Server-side purchase validation + record creation
        const { data, error } = await supabase.functions.invoke(
            "purchase-iap-item",
            {
                body: {
                    userId: user.id,
                    itemId,
                    platform,
                },
            },
        );

        if (error) {
            logger.error("Purchase failed", error);
            return null;
        }

        logger.info(`Purchased item ${itemId}`);
        return data ? mapPurchaseReceipt(data) : null;
    } catch (err) {
        logger.error("purchaseItem error", err);
        return null;
    }
}

/**
 * Restore purchases (e.g., after reinstall)
 */
export async function restorePurchases(): Promise<PurchaseReceipt[]> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase.functions.invoke(
            "restore-purchases",
            {
                body: {
                    userId: user.id,
                    platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web",
                },
            },
        );

        if (error) {
            logger.error("Failed to restore purchases", error);
            return [];
        }

        if (!data?.purchases || !Array.isArray(data.purchases)) {
            return [];
        }

        return data.purchases.map(mapPurchaseReceipt);
    } catch (err) {
        logger.error("restorePurchases error", err);
        return [];
    }
}

/**
 * Check if a specific item is purchased
 */
export function isItemPurchased(
    itemId: string,
    receipts: PurchaseReceipt[],
): boolean {
    return receipts.some(
        (receipt) => receipt.itemId === itemId && receipt.isActive,
    );
}

/**
 * Get purchased items by category
 */
export function getPurchasedByCategory(
    category: IAPCategory,
    catalog: InAppItem[],
    receipts: PurchaseReceipt[],
): InAppItem[] {
    const purchasedItemIds = new Set(
        receipts.filter((r) => r.isActive).map((r) => r.itemId),
    );
    return catalog.filter(
        (item) => item.category === category && purchasedItemIds.has(item.id),
    );
}

// ============================================================================
// HELPERS
// ============================================================================

function mapInAppItem(row: Record<string, unknown>): InAppItem {
    return {
        id: row.id as string,
        productId: row.product_id as string,
        type: (row.type as IAPItemType) || "non_consumable",
        category: (row.category as IAPCategory) || "theme",
        name: row.name as string,
        description: (row.description as string) || "",
        priceEur: (row.price_eur as number) || 0,
        priceUsd: (row.price_usd as number) || 0,
        priceJpy: (row.price_jpy as number) || 0,
        icon: (row.icon as string) || "📦",
        previewImageUrl: row.preview_image_url as string | undefined,
    };
}

function mapPurchaseReceipt(row: Record<string, unknown>): PurchaseReceipt {
    return {
        id: row.id as string,
        itemId: (row.item_id as string) || (row.itemId as string),
        productId: (row.product_id as string) || (row.productId as string),
        transactionId: (row.transaction_id as string) || (row.transactionId as string) || "",
        platform: (row.platform as PurchaseReceipt["platform"]) || "web",
        purchasedAt: (row.purchased_at as string) || (row.purchasedAt as string) || new Date().toISOString(),
        expiresAt: (row.expires_at as string) || (row.expiresAt as string) || undefined,
        isActive: row.is_active !== undefined ? (row.is_active as boolean) : (row.isActive as boolean) ?? true,
    };
}
