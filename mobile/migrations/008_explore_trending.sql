-- ═══════════════════════════════════════════════════════════════
-- Migration 008 — Explore & Trending (Sprint S8 Axe B)
-- ═══════════════════════════════════════════════════════════════

-- ─── Pré-requis : colonnes manquantes sur profiles ───────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- Vue matérialisée : score trending par hashtag
-- Score = (usage_24h × 2) + (unique_creators × 5) + (views × 0.001) + (accélération × 10)

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_trending_hashtags AS
WITH recent_24h AS (
  SELECT
    vh.hashtag_id,
    COUNT(*) AS usage_24h,
    COUNT(DISTINCT v.author_id) AS unique_creators,
    SUM(v.views_count) AS total_views
  FROM imufeed_video_hashtags vh
  JOIN imufeed_videos v ON v.id = vh.video_id
  WHERE v.created_at >= now() - INTERVAL '24 hours'
    AND v.status = 'published'
  GROUP BY vh.hashtag_id
),
prev_24h AS (
  SELECT
    vh.hashtag_id,
    COUNT(*) AS usage_prev
  FROM imufeed_video_hashtags vh
  JOIN imufeed_videos v ON v.id = vh.video_id
  WHERE v.created_at >= now() - INTERVAL '48 hours'
    AND v.created_at < now() - INTERVAL '24 hours'
    AND v.status = 'published'
  GROUP BY vh.hashtag_id
)
SELECT
  h.id AS hashtag_id,
  h.name,
  COALESCE(r.usage_24h, 0) AS usage_24h,
  COALESCE(r.unique_creators, 0) AS unique_creators,
  COALESCE(r.total_views, 0) AS total_views,
  COALESCE(r.usage_24h, 0)::FLOAT / GREATEST(COALESCE(p.usage_prev, 0), 1) AS acceleration,
  (
    COALESCE(r.usage_24h, 0) * 2
    + COALESCE(r.unique_creators, 0) * 5
    + COALESCE(r.total_views, 0) * 0.001
    + (COALESCE(r.usage_24h, 0)::FLOAT / GREATEST(COALESCE(p.usage_prev, 0), 1)) * 10
  ) AS trending_score
FROM imufeed_hashtags h
LEFT JOIN recent_24h r ON r.hashtag_id = h.id
LEFT JOIN prev_24h p ON p.hashtag_id = h.id
WHERE COALESCE(r.usage_24h, 0) > 0
ORDER BY trending_score DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_trending_hashtag_id
  ON mv_trending_hashtags(hashtag_id);

-- ─── Top creators (weekly likes) ─────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_creators_weekly AS
SELECT
  v.author_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.is_verified,
  p.followers_count,
  SUM(v.likes_count) AS weekly_likes,
  COUNT(*) AS weekly_videos
FROM imufeed_videos v
JOIN profiles p ON p.id = v.author_id
WHERE v.status = 'published'
  AND v.created_at >= now() - INTERVAL '7 days'
GROUP BY v.author_id, p.username, p.display_name, p.avatar_url, p.is_verified, p.followers_count
ORDER BY weekly_likes DESC
LIMIT 50;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_creators_author
  ON mv_top_creators_weekly(author_id);

-- ─── RPC : Refresh materialized views ────────────────────────
-- À appeler périodiquement (pg_cron ou Edge Function scheduled)

CREATE OR REPLACE FUNCTION refresh_explore_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_hashtags;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_creators_weekly;
END;
$$ LANGUAGE plpgsql;

-- ─── RPC : Top videos (trending) ─────────────────────────────

CREATE OR REPLACE FUNCTION get_explore_top_videos(
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  video_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  duration_ms INTEGER,
  category video_category,
  likes_count INTEGER,
  views_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id, v.author_id, v.video_url, v.thumbnail_url, v.caption,
    v.duration_ms, v.category,
    v.likes_count, v.views_count, v.created_at
  FROM imufeed_videos v
  WHERE v.status = 'published'
    AND v.visibility = 'public'
    AND v.created_at >= now() - INTERVAL '7 days'
  ORDER BY
    (LOG(GREATEST(v.likes_count, 1)) * 0.4
     + LOG(GREATEST(v.views_count, 1)) * 0.3
     + LOG(GREATEST(v.shares_count, 1)) * 0.2
     + LOG(GREATEST(v.comments_count, 1)) * 0.1) DESC,
    v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Category feed count index ───────────────────────────────

CREATE INDEX IF NOT EXISTS idx_videos_category_status
  ON imufeed_videos(category, status, created_at DESC)
  WHERE status = 'published' AND visibility = 'public';
