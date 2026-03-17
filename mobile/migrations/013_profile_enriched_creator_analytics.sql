-- ─── Migration 013 — Sprint S13 ──────────────────────────────
-- Axe A: Profil enrichi (Wallet + Arena + Analytics + Modules + Thème)
-- Axe B: Dashboard Créateur & Analytics ImuFeed
-- Date: 17 mars 2026

-- =====================================================================
-- S13B: Creator Analytics
-- =====================================================================

-- ─── Métriques par vidéo ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS creator_video_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    views INT NOT NULL DEFAULT 0,
    likes INT NOT NULL DEFAULT 0,
    comments INT NOT NULL DEFAULT 0,
    shares INT NOT NULL DEFAULT 0,
    watch_time_seconds BIGINT NOT NULL DEFAULT 0,
    avg_watch_seconds FLOAT NOT NULL DEFAULT 0,
    completion_rate FLOAT NOT NULL DEFAULT 0,
    engagement_rate FLOAT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (video_id)
);

ALTER TABLE creator_video_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_analytics_own"
    ON creator_video_analytics FOR SELECT
    USING (creator_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_video_analytics_creator
    ON creator_video_analytics(creator_id);

-- ─── Métriques quotidiennes agrégées par créateur ────────────

CREATE TABLE IF NOT EXISTS creator_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day DATE NOT NULL DEFAULT CURRENT_DATE,
    views INT NOT NULL DEFAULT 0,
    new_followers INT NOT NULL DEFAULT 0,
    likes INT NOT NULL DEFAULT 0,
    comments INT NOT NULL DEFAULT 0,
    shares INT NOT NULL DEFAULT 0,
    watch_time_seconds BIGINT NOT NULL DEFAULT 0,
    revenue_imucoins INT NOT NULL DEFAULT 0,
    engagement_rate FLOAT NOT NULL DEFAULT 0,
    UNIQUE (creator_id, day)
);

ALTER TABLE creator_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_metrics_own"
    ON creator_daily_metrics FOR SELECT
    USING (creator_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_daily_metrics_creator_day
    ON creator_daily_metrics(creator_id, day DESC);

-- ─── Heatmap heures optimales de publication ─────────────────

CREATE TABLE IF NOT EXISTS creator_publish_heatmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    hour_of_day INT NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
    avg_engagement FLOAT NOT NULL DEFAULT 0,
    post_count INT NOT NULL DEFAULT 0,
    UNIQUE (creator_id, day_of_week, hour_of_day)
);

ALTER TABLE creator_publish_heatmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "heatmap_own"
    ON creator_publish_heatmap FOR SELECT
    USING (creator_id = auth.uid());

-- ─── Thème préféré utilisateur (rapide switch profil) ────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'light';

-- =====================================================================
-- RPCs
-- =====================================================================

-- ─── Dashboard créateur (agrégé sur N jours) ─────────────────

CREATE OR REPLACE FUNCTION get_creator_dashboard(p_user_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE(
    total_views BIGINT,
    total_followers BIGINT,
    total_likes BIGINT,
    total_comments BIGINT,
    total_shares BIGINT,
    total_watch_time BIGINT,
    total_revenue BIGINT,
    avg_engagement FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT
        COALESCE(SUM(views), 0) AS total_views,
        COALESCE(SUM(new_followers), 0) AS total_followers,
        COALESCE(SUM(likes), 0) AS total_likes,
        COALESCE(SUM(comments), 0) AS total_comments,
        COALESCE(SUM(shares), 0) AS total_shares,
        COALESCE(SUM(watch_time_seconds), 0) AS total_watch_time,
        COALESCE(SUM(revenue_imucoins), 0) AS total_revenue,
        COALESCE(AVG(engagement_rate), 0)::FLOAT AS avg_engagement
    FROM creator_daily_metrics
    WHERE creator_id = p_user_id
      AND day >= CURRENT_DATE - p_days;
$$;

-- ─── Top vidéo du créateur ───────────────────────────────────

CREATE OR REPLACE FUNCTION get_creator_top_video(p_user_id UUID)
RETURNS TABLE(
    video_id UUID,
    views INT,
    likes INT,
    comments INT,
    shares INT,
    completion_rate FLOAT,
    engagement_rate FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT
        va.video_id,
        va.views,
        va.likes,
        va.comments,
        va.shares,
        va.completion_rate,
        va.engagement_rate
    FROM creator_video_analytics va
    WHERE va.creator_id = p_user_id
    ORDER BY va.views DESC
    LIMIT 1;
$$;

-- ─── Métriques quotidiennes (pour graphiques) ────────────────

CREATE OR REPLACE FUNCTION get_creator_daily_chart(p_user_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE(
    day DATE,
    views INT,
    new_followers INT,
    likes INT,
    engagement_rate FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT
        dm.day,
        dm.views,
        dm.new_followers,
        dm.likes,
        dm.engagement_rate
    FROM creator_daily_metrics dm
    WHERE dm.creator_id = p_user_id
      AND dm.day >= CURRENT_DATE - p_days
    ORDER BY dm.day ASC;
$$;
