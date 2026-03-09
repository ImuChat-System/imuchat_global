-- ============================================================================
-- Migration 007 — ImuFeed Algorithm "Pour Toi" (Sprint S7B)
-- ============================================================================
-- Enrichit imufeed_views, ajoute user_interests et imufeed_not_interested

-- ============================================================================
-- 1. Enrichir imufeed_views avec colonnes engagement
-- ============================================================================

ALTER TABLE imufeed_views ADD COLUMN IF NOT EXISTS quick_skip BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE imufeed_views ADD COLUMN IF NOT EXISTS is_rewatch BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE imufeed_views ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'for_you';

CREATE INDEX IF NOT EXISTS idx_views_user_video
  ON imufeed_views(user_id, video_id);
CREATE INDEX IF NOT EXISTS idx_views_created
  ON imufeed_views(created_at DESC);

-- ============================================================================
-- 2. TABLE: user_interests — Profil d'intérêts utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_interests (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  category_weights JSONB NOT NULL DEFAULT '{}',
  hashtag_weights JSONB NOT NULL DEFAULT '{}',
  top_creator_ids UUID[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY interests_select ON user_interests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY interests_upsert ON user_interests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY interests_update ON user_interests FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- 3. TABLE: imufeed_not_interested — Signal négatif
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_not_interested (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'not_interested'
    CHECK (reason IN ('not_interested', 'repetitive', 'inappropriate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, user_id)
);

ALTER TABLE imufeed_not_interested ENABLE ROW LEVEL SECURITY;
CREATE POLICY not_interested_select ON imufeed_not_interested FOR SELECT USING (user_id = auth.uid());
CREATE POLICY not_interested_insert ON imufeed_not_interested FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY not_interested_delete ON imufeed_not_interested FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 4. RPC: get_subscription_video_ids
-- ============================================================================

CREATE OR REPLACE FUNCTION get_subscription_video_ids(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 40
)
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT v.id
  FROM imufeed_videos v
  INNER JOIN imufeed_follows f ON f.following_id = v.author_id AND f.follower_id = p_user_id
  WHERE v.status = 'published' AND v.visibility = 'public'
    AND NOT EXISTS (SELECT 1 FROM imufeed_not_interested ni WHERE ni.video_id = v.id AND ni.user_id = p_user_id)
  ORDER BY v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 5. RPC: get_video_engagement_stats
-- ============================================================================

CREATE OR REPLACE FUNCTION get_video_engagement_stats(
  p_video_ids UUID[]
)
RETURNS TABLE (video_id UUID, completion_rate FLOAT, view_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vw.video_id,
    AVG(CASE WHEN vw.completed THEN 1.0 ELSE 0.0 END)::FLOAT AS completion_rate,
    COUNT(*)::BIGINT AS view_count
  FROM imufeed_views vw
  WHERE vw.video_id = ANY(p_video_ids)
    AND vw.quick_skip = false
  GROUP BY vw.video_id;
END;
$$ LANGUAGE plpgsql STABLE;
