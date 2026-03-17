/**
 * CreatorMonetizationService — Service pour la monétisation créateur
 *
 * Gère les pourboires (tips), abonnements premium, contenu abonnés,
 * et le dashboard de revenus.
 *
 * Sprint S14B — Monétisation Créateur
 */

import { supabase } from "@/services/supabase";
import type {
    CreatorRevenue,
    CreatorSubscription,
    RevenueEntry,
    SubscriberContent,
    SubscriptionTier,
    TipTransaction,
} from "@/types/creator-monetization";

export class CreatorMonetizationService {
    // ── Tips ──────────────────────────────────────────────────────

    /**
     * Envoie un pourboire en ImuCoins à un créateur
     * Utilise la RPC send_creator_tip (côté Supabase)
     */
    async sendTip(
        creatorId: string,
        amount: number,
        message: string = ""
    ): Promise<{ success: boolean; tip?: TipTransaction; error?: string }> {
        const { data, error } = await supabase.rpc("send_creator_tip", {
            p_creator_id: creatorId,
            p_amount: amount,
            p_message: message,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            tip: data as unknown as TipTransaction,
        };
    }

    /**
     * Récupère l'historique des tips reçus par un créateur
     */
    async getCreatorTips(
        creatorId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<TipTransaction[]> {
        const { data, error } = await supabase
            .from("creator_tips")
            .select("*")
            .eq("creator_id", creatorId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []) as TipTransaction[];
    }

    /**
     * Récupère les tips envoyés par l'utilisateur courant
     */
    async getMyTips(limit: number = 20): Promise<TipTransaction[]> {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return [];

        const { data, error } = await supabase
            .from("creator_tips")
            .select("*")
            .eq("tipper_id", userData.user.id)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []) as TipTransaction[];
    }

    // ── Subscriptions ─────────────────────────────────────────────

    /**
     * S'abonner à un créateur
     */
    async subscribe(
        creatorId: string,
        tier: SubscriptionTier
    ): Promise<{ success: boolean; subscription?: CreatorSubscription; error?: string }> {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return { success: false, error: "Non authentifié" };

        const { data, error } = await supabase
            .from("creator_subscriptions")
            .upsert(
                {
                    subscriber_id: userData.user.id,
                    creator_id: creatorId,
                    tier,
                    status: "active",
                    started_at: new Date().toISOString(),
                    expires_at: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                },
                { onConflict: "subscriber_id,creator_id" }
            )
            .select()
            .single();

        if (error) return { success: false, error: error.message };
        return { success: true, subscription: data as CreatorSubscription };
    }

    /**
     * Annuler un abonnement
     */
    async cancelSubscription(
        subscriptionId: string
    ): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from("creator_subscriptions")
            .update({
                status: "cancelled",
                cancelled_at: new Date().toISOString(),
            })
            .eq("id", subscriptionId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    }

    /**
     * Récupère l'abonnement actuel de l'utilisateur à un créateur
     */
    async getMySubscription(
        creatorId: string
    ): Promise<CreatorSubscription | null> {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return null;

        const { data, error } = await supabase
            .from("creator_subscriptions")
            .select("*")
            .eq("subscriber_id", userData.user.id)
            .eq("creator_id", creatorId)
            .eq("status", "active")
            .single();

        if (error) return null;
        return data as CreatorSubscription;
    }

    /**
     * Récupère tous les abonnés actifs d'un créateur
     */
    async getCreatorSubscribers(
        creatorId: string
    ): Promise<CreatorSubscription[]> {
        const { data, error } = await supabase
            .from("creator_subscriptions")
            .select("*")
            .eq("creator_id", creatorId)
            .eq("status", "active")
            .order("started_at", { ascending: false });

        if (error) throw error;
        return (data || []) as CreatorSubscription[];
    }

    // ── Subscriber Content ────────────────────────────────────────

    /**
     * Vérifie si l'utilisateur a accès à un contenu réservé
     */
    async checkContentAccess(
        videoId: string
    ): Promise<{ hasAccess: boolean; requiredTier: SubscriptionTier | null }> {
        // Récupérer la restriction sur la vidéo
        const { data: content, error: contentError } = await supabase
            .from("subscriber_content")
            .select("*")
            .eq("video_id", videoId)
            .single();

        if (contentError || !content) {
            return { hasAccess: true, requiredTier: null }; // Pas de restriction
        }

        const subContent = content as SubscriberContent;

        // Vérifier l'abonnement de l'utilisateur
        const subscription = await this.getMySubscription(subContent.creator_id);
        if (!subscription) {
            return { hasAccess: false, requiredTier: subContent.min_tier };
        }

        // Vérifier le tier
        const tierOrder: Record<SubscriptionTier, number> = {
            basic: 1,
            pro: 2,
            vip: 3,
        };

        const hasAccess =
            tierOrder[subscription.tier] >= tierOrder[subContent.min_tier];

        return {
            hasAccess,
            requiredTier: hasAccess ? null : subContent.min_tier,
        };
    }

    // ── Revenue Dashboard ─────────────────────────────────────────

    /**
     * Récupère le résumé des revenus du créateur
     */
    async getCreatorRevenue(
        creatorId: string,
        days: number = 30
    ): Promise<CreatorRevenue> {
        const { data, error } = await supabase.rpc("get_creator_revenue", {
            p_creator_id: creatorId,
            p_days: days,
        });

        if (error) throw error;

        return (data as unknown as CreatorRevenue) || {
            tips_total: 0,
            tips_count: 0,
            subs_revenue: 0,
            subs_active: 0,
            total_revenue: 0,
            period_days: days,
        };
    }

    /**
     * Récupère l'historique des revenus jour par jour
     */
    async getRevenueHistory(
        creatorId: string,
        days: number = 30
    ): Promise<RevenueEntry[]> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        const { data, error } = await supabase
            .from("creator_tips")
            .select("amount, created_at")
            .eq("creator_id", creatorId)
            .gte("created_at", since)
            .order("created_at", { ascending: true });

        if (error) throw error;

        // Agréger par jour
        const byDay = new Map<string, { tips: number; subs: number }>();
        (data || []).forEach((row: { amount: number; created_at: string }) => {
            const day = row.created_at.split("T")[0];
            const entry = byDay.get(day) || { tips: 0, subs: 0 };
            entry.tips += row.amount;
            byDay.set(day, entry);
        });

        return Array.from(byDay.entries()).map(([day, entry]) => ({
            day,
            tips: entry.tips,
            subs: entry.subs,
            total: entry.tips + entry.subs,
        }));
    }
}

// Singleton
export const creatorMonetizationService = new CreatorMonetizationService();
export default creatorMonetizationService;
