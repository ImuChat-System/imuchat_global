/**
 * Creator Analytics Service — Service API analytics créateur ImuFeed
 *
 * Appelle les RPCs Supabase pour le dashboard créateur :
 * - get_creator_dashboard (overview agrégé)
 * - get_creator_top_video (meilleure vidéo)
 * - get_creator_daily_chart (données quotidiennes)
 * - heatmap (heures optimales)
 *
 * Sprint S13 Axe B — Dashboard Créateur & Analytics
 */

import { createLogger } from "@/services/logger";
import { supabase } from "@/services/supabase";
import type {
    CreatorDailyMetric,
    CreatorDashboardOverview,
    CreatorDashboardPeriod,
    CreatorMetricCard,
    HourlyHeatmapEntry,
    VideoAnalytics,
} from "@/types/creator-analytics";

const logger = createLogger("creator-analytics-service");

// ─── Period helpers ───────────────────────────────────────────

function periodToDays(period: CreatorDashboardPeriod): number {
    switch (period) {
        case "7d":
            return 7;
        case "30d":
            return 30;
        case "90d":
            return 90;
    }
}

// ─── Format helpers ───────────────────────────────────────────

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// ─── API Calls ────────────────────────────────────────────────

/**
 * Récupérer l'overview agrégé du dashboard créateur.
 */
export async function fetchCreatorDashboard(
    userId: string,
    period: CreatorDashboardPeriod,
): Promise<CreatorDashboardOverview> {
    const days = periodToDays(period);
    logger.info("fetchCreatorDashboard", { userId, days });

    const { data, error } = await supabase.rpc("get_creator_dashboard", {
        p_user_id: userId,
        p_days: days,
    });

    if (error) {
        logger.error("fetchCreatorDashboard error", error);
        throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
        total_views: row?.total_views ?? 0,
        total_followers: row?.total_followers ?? 0,
        total_likes: row?.total_likes ?? 0,
        total_comments: row?.total_comments ?? 0,
        total_shares: row?.total_shares ?? 0,
        total_watch_time_seconds: row?.total_watch_time ?? 0,
        total_revenue_imucoins: row?.total_revenue ?? 0,
        avg_engagement_rate: row?.avg_engagement ?? 0,
    };
}

/**
 * Récupérer la meilleure vidéo.
 */
export async function fetchCreatorTopVideo(
    userId: string,
): Promise<VideoAnalytics | null> {
    logger.info("fetchCreatorTopVideo", { userId });

    const { data, error } = await supabase.rpc("get_creator_top_video", {
        p_user_id: userId,
    });

    if (error) {
        logger.error("fetchCreatorTopVideo error", error);
        throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    return {
        video_id: row.video_id,
        views: row.views ?? 0,
        likes: row.likes ?? 0,
        comments: row.comments ?? 0,
        shares: row.shares ?? 0,
        watch_time_seconds: 0,
        avg_watch_seconds: 0,
        completion_rate: row.completion_rate ?? 0,
        engagement_rate: row.engagement_rate ?? 0,
    };
}

/**
 * Récupérer les données quotidiennes pour les graphiques.
 */
export async function fetchCreatorDailyChart(
    userId: string,
    period: CreatorDashboardPeriod,
): Promise<CreatorDailyMetric[]> {
    const days = periodToDays(period);
    logger.info("fetchCreatorDailyChart", { userId, days });

    const { data, error } = await supabase.rpc("get_creator_daily_chart", {
        p_user_id: userId,
        p_days: days,
    });

    if (error) {
        logger.error("fetchCreatorDailyChart error", error);
        throw error;
    }

    if (!Array.isArray(data)) return [];

    return data.map((row: Record<string, unknown>) => ({
        day: String(row.day ?? ""),
        views: Number(row.views ?? 0),
        new_followers: Number(row.new_followers ?? 0),
        likes: Number(row.likes ?? 0),
        engagement_rate: Number(row.engagement_rate ?? 0),
    }));
}

/**
 * Récupérer la heatmap des heures optimales de publication.
 */
export async function fetchPublishHeatmap(
    userId: string,
): Promise<HourlyHeatmapEntry[]> {
    logger.info("fetchPublishHeatmap", { userId });

    const { data, error } = await supabase
        .from("creator_publish_heatmap")
        .select("day_of_week, hour_of_day, avg_engagement, post_count")
        .eq("creator_id", userId)
        .order("avg_engagement", { ascending: false });

    if (error) {
        logger.error("fetchPublishHeatmap error", error);
        throw error;
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
        day_of_week: Number(row.day_of_week ?? 0),
        hour_of_day: Number(row.hour_of_day ?? 0),
        avg_engagement: Number(row.avg_engagement ?? 0),
        post_count: Number(row.post_count ?? 0),
    }));
}

// ─── Metric Cards builder ─────────────────────────────────────

/**
 * Transforme un `CreatorDashboardOverview` en liste de cards affichables.
 */
export function buildMetricCards(
    overview: CreatorDashboardOverview,
): CreatorMetricCard[] {
    return [
        {
            key: "views",
            label: "Vues",
            value: overview.total_views,
            emoji: "👁️",
            formatted: formatNumber(overview.total_views),
        },
        {
            key: "followers",
            label: "Abonnés",
            value: overview.total_followers,
            emoji: "👥",
            formatted: formatNumber(overview.total_followers),
        },
        {
            key: "likes",
            label: "Likes",
            value: overview.total_likes,
            emoji: "❤️",
            formatted: formatNumber(overview.total_likes),
        },
        {
            key: "comments",
            label: "Commentaires",
            value: overview.total_comments,
            emoji: "💬",
            formatted: formatNumber(overview.total_comments),
        },
        {
            key: "shares",
            label: "Partages",
            value: overview.total_shares,
            emoji: "🔗",
            formatted: formatNumber(overview.total_shares),
        },
        {
            key: "watch_time",
            label: "Temps de visionnage",
            value: overview.total_watch_time_seconds,
            emoji: "⏱️",
            formatted: formatDuration(overview.total_watch_time_seconds),
        },
        {
            key: "revenue",
            label: "Revenus",
            value: overview.total_revenue_imucoins,
            emoji: "💰",
            formatted: `${formatNumber(overview.total_revenue_imucoins)} IC`,
        },
        {
            key: "engagement",
            label: "Engagement",
            value: overview.avg_engagement_rate,
            emoji: "📊",
            formatted: `${(overview.avg_engagement_rate * 100).toFixed(1)}%`,
        },
    ];
}

// ─── Exports groupés ──────────────────────────────────────────

export const CreatorAnalyticsService = {
    fetchDashboard: fetchCreatorDashboard,
    fetchTopVideo: fetchCreatorTopVideo,
    fetchDailyChart: fetchCreatorDailyChart,
    fetchHeatmap: fetchPublishHeatmap,
    buildMetricCards,
};
