/**
 * Creator Analytics Types — Sprint S13 Axe B
 *
 * Types pour le Dashboard Créateur & Analytics ImuFeed :
 * - Métriques agrégées (overview)
 * - Métriques par vidéo
 * - Données quotidiennes (graphiques)
 * - Heatmap heures optimales
 * - Audience
 */

// ─── Période dashboard ────────────────────────────────────────

export type CreatorDashboardPeriod = "7d" | "30d" | "90d";

// ─── Overview (agrégé sur une période) ────────────────────────

export interface CreatorDashboardOverview {
    total_views: number;
    total_followers: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    total_watch_time_seconds: number;
    total_revenue_imucoins: number;
    avg_engagement_rate: number;
}

// ─── Metric card pour le dashboard ────────────────────────────

export interface CreatorMetricCard {
    key: string;
    label: string;
    value: number;
    emoji: string;
    /** Formatted string (e.g. "12.4K", "3h 20m") */
    formatted: string;
}

// ─── Métriques par vidéo ──────────────────────────────────────

export interface VideoAnalytics {
    video_id: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    watch_time_seconds: number;
    avg_watch_seconds: number;
    completion_rate: number;
    engagement_rate: number;
}

// ─── Données quotidiennes (graphiques) ────────────────────────

export interface CreatorDailyMetric {
    day: string;
    views: number;
    new_followers: number;
    likes: number;
    engagement_rate: number;
}

// ─── Heatmap (heures optimales) ───────────────────────────────

export interface HourlyHeatmapEntry {
    day_of_week: number;
    hour_of_day: number;
    avg_engagement: number;
    post_count: number;
}

// ─── Audience ─────────────────────────────────────────────────

export interface AudienceSegment {
    label: string;
    percentage: number;
    count: number;
}

export interface AudienceBreakdown {
    geo: AudienceSegment[];
    age: AudienceSegment[];
    gender: AudienceSegment[];
}
