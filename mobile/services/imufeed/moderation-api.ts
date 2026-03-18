/**
 * S18 — ModerationAPIService
 *
 * Pipeline modération IA : signalements utilisateur, analyse automatique,
 * file de modération admin, outils créateur.
 */

import { supabase } from "@/services/supabase";
import type {
    ContentAnalysisResult,
    ContentModerationAction,
    ContentReport,
    CreatorModerationSettings,
    ModerationLogEntry,
    ModerationQueueItem,
    ModerationSeverity,
    ReportableContentType,
    ReportReason,
    ReportStatus
} from "@/types/content-moderation";
import { DEFAULT_CONFIDENCE_THRESHOLDS } from "@/types/content-moderation";

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapQueueRow(row: Record<string, unknown>): ModerationQueueItem {
    return {
        id: row.id as string,
        content_id: row.content_id as string,
        content_type: row.content_type as ReportableContentType,
        content_preview: (row.content_preview as string) ?? "",
        author_id: row.author_id as string,
        author_username: (row.author_username as string) ?? "unknown",
        reason: row.reason as ReportReason | "auto_flagged",
        report_count: (row.report_count as number) ?? 1,
        severity: (row.severity as ModerationSeverity) ?? "low",
        ai_confidence: (row.ai_confidence as number) ?? null,
        status: (row.status as ReportStatus) ?? "pending",
        created_at: row.created_at as string,
    };
}

function mapLogRow(row: Record<string, unknown>): ModerationLogEntry {
    return {
        id: row.id as string,
        content_id: row.content_id as string,
        content_type: row.content_type as ReportableContentType,
        moderator_id: (row.moderator_id as string) ?? null,
        action: row.action as ContentModerationAction,
        reason: (row.reason as string) ?? "",
        is_automatic: (row.is_automatic as boolean) ?? false,
        created_at: row.created_at as string,
    };
}

// ─── Service ────────────────────────────────────────────────────────────────

export class ModerationAPIService {
    // ── Signalements ────────────────────────────────────────────

    /**
     * Signaler un contenu (vidéo, commentaire, live, profil, message)
     */
    async reportContent(params: {
        content_id: string;
        content_type: ReportableContentType;
        reason: ReportReason;
        description: string;
    }): Promise<{ data: ContentReport | null; error: string | null }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return { data: null, error: "Not authenticated" };

        const { data, error } = await supabase
            .from("content_reports")
            .insert({
                content_id: params.content_id,
                content_type: params.content_type,
                reporter_id: user.user.id,
                reason: params.reason,
                description: params.description,
                status: "pending",
            })
            .select()
            .single();

        if (error) return { data: null, error: error.message };
        return { data: data as unknown as ContentReport, error: null };
    }

    /**
     * Obtenir le nombre de signalements pour un contenu
     */
    async getReportCount(contentId: string): Promise<number> {
        const { count } = await supabase
            .from("content_reports")
            .select("*", { count: "exact", head: true })
            .eq("content_id", contentId)
            .eq("status", "pending");

        return count ?? 0;
    }

    // ── File de modération admin ────────────────────────────────

    /**
     * Charger la file de modération (éléments en attente par défaut)
     */
    async getQueue(
        status: ReportStatus = "pending",
    ): Promise<{ data: ModerationQueueItem[]; error: string | null }> {
        const { data, error } = await supabase
            .from("moderation_queue")
            .select("*")
            .eq("status", status)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) return { data: [], error: error.message };
        return {
            data: ((data as Record<string, unknown>[]) ?? []).map(mapQueueRow),
            error: null,
        };
    }

    /**
     * Traiter un élément : appliquer une action de modération
     */
    async reviewItem(
        itemId: string,
        action: ContentModerationAction,
        reason: string,
    ): Promise<{ error: string | null }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("moderation_queue")
            .update({
                status: "resolved",
                resolution_action: action,
                resolved_by: user.user.id,
                resolved_at: new Date().toISOString(),
            })
            .eq("id", itemId);

        if (error) return { error: error.message };

        // Écrire dans le journal
        await supabase.from("moderation_log").insert({
            content_id: itemId,
            content_type: "video",
            moderator_id: user.user.id,
            action,
            reason,
            is_automatic: false,
        });

        return { error: null };
    }

    /**
     * Rejeter un signalement (sans action)
     */
    async dismissItem(itemId: string): Promise<{ error: string | null }> {
        const { error } = await supabase
            .from("moderation_queue")
            .update({ status: "dismissed" })
            .eq("id", itemId);

        return { error: error?.message ?? null };
    }

    // ── Journal de modération ───────────────────────────────────

    /**
     * Charger les dernières entrées du journal
     */
    async getLog(
        limit = 50,
    ): Promise<{ data: ModerationLogEntry[]; error: string | null }> {
        const { data, error } = await supabase
            .from("moderation_log")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) return { data: [], error: error.message };
        return {
            data: ((data as Record<string, unknown>[]) ?? []).map(mapLogRow),
            error: null,
        };
    }

    // ── Analyse IA ──────────────────────────────────────────────

    /**
     * Analyse IA d'un contenu — retourne catégorie, sévérité, confiance
     * En production appelle un edge function ; ici simulation locale.
     */
    async analyzeContent(
        contentId: string,
        contentType: ReportableContentType,
    ): Promise<{ data: ContentAnalysisResult | null; error: string | null }> {
        const { data, error } = await supabase.functions.invoke(
            "analyze-content",
            {
                body: { content_id: contentId, content_type: contentType },
            },
        );

        if (error) return { data: null, error: error.message };

        const result = data as ContentAnalysisResult;

        // Appliquer les seuils de confiance automatiques
        if (result.confidence >= DEFAULT_CONFIDENCE_THRESHOLDS.auto_block) {
            // ≥0.95 → blocage automatique
            await this.autoModerate(contentId, contentType, result);
        }

        return { data: result, error: null };
    }

    /**
     * Modération automatique quand la confiance IA est très haute
     */
    private async autoModerate(
        contentId: string,
        contentType: ReportableContentType,
        result: ContentAnalysisResult,
    ): Promise<void> {
        const action = result.suggested_action;
        if (action === "none") return;

        await supabase.from("moderation_log").insert({
            content_id: contentId,
            content_type: contentType,
            moderator_id: null,
            action,
            reason: `Auto-modération IA (confiance: ${result.confidence})`,
            is_automatic: true,
        });

        // Mettre à jour le statut du contenu
        const table =
            contentType === "video"
                ? "imufeed_videos"
                : contentType === "comment"
                    ? "imufeed_comments"
                    : null;

        if (table) {
            await supabase
                .from(table)
                .update({ is_moderated: true, moderation_action: action })
                .eq("id", contentId);
        }
    }

    // ── Outils créateur ────────────────────────────────────────

    /**
     * Charger les paramètres de modération du créateur
     */
    async getCreatorSettings(
        userId: string,
    ): Promise<{ data: CreatorModerationSettings | null; error: string | null }> {
        const { data, error } = await supabase
            .from("creator_moderation_settings")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) return { data: null, error: error.message };
        return { data: data as unknown as CreatorModerationSettings, error: null };
    }

    /**
     * Sauvegarder les paramètres de modération du créateur
     */
    async saveCreatorSettings(
        settings: CreatorModerationSettings,
    ): Promise<{ error: string | null }> {
        const { error } = await supabase
            .from("creator_moderation_settings")
            .upsert(settings, { onConflict: "user_id" });

        return { error: error?.message ?? null };
    }

    /**
     * Bloquer un utilisateur (créateur)
     */
    async blockUser(
        creatorId: string,
        targetId: string,
    ): Promise<{ error: string | null }> {
        const { error } = await supabase.from("creator_blocked_users").insert({
            creator_id: creatorId,
            blocked_user_id: targetId,
        });

        return { error: error?.message ?? null };
    }

    /**
     * Débloquer un utilisateur (créateur)
     */
    async unblockUser(
        creatorId: string,
        targetId: string,
    ): Promise<{ error: string | null }> {
        const { error } = await supabase
            .from("creator_blocked_users")
            .delete()
            .eq("creator_id", creatorId)
            .eq("blocked_user_id", targetId);

        return { error: error?.message ?? null };
    }
}

export const moderationAPI = new ModerationAPIService();
