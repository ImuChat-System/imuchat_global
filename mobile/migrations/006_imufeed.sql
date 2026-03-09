-- ============================================================================
-- Migration 006: ImuFeed Video (short video feed, TikTok-style)
-- Module: DEV-XXX - ImuFeed MVP
-- Date: Sprint S1 Axe B
-- Réf: MOBILE_ROADMAP_UNIFIED.md - T1 Axe B
-- ============================================================================

-- ============================================================================
-- 1. ENUMs
-- ============================================================================

CREATE TYPE video_status AS ENUM ('draft', 'processing', 'published', 'removed', 'flagged');
CREATE TYPE video_visibility AS ENUM ('public', 'followers', 'private');
CREATE TYPE video_category AS ENUM (
  'entertainment', 'education', 'music', 'gaming', 'sports',
  'cooking', 'fashion', 'tech', 'comedy', 'art', 'anime',
  'travel', 'pets', 'other'
);

-- ============================================================================
-- 2. TABLE: imufeed_sounds
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  audio_url TEXT NOT NULL,
  artwork_url TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. TABLE: imufeed_hashtags
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_hashtags_name ON imufeed_hashtags(name);
CREATE INDEX idx_hashtags_trending ON imufeed_hashtags(is_trending) WHERE is_trending = true;

-- ============================================================================
-- 4. TABLE: imufeed_videos
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1080,
  height INTEGER NOT NULL DEFAULT 1920,
  sound_id UUID REFERENCES imufeed_sounds(id),
  category video_category NOT NULL DEFAULT 'other',
  visibility video_visibility NOT NULL DEFAULT 'public',
  status video_status NOT NULL DEFAULT 'processing',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  bookmarks_count INTEGER NOT NULL DEFAULT 0,
  allow_comments BOOLEAN NOT NULL DEFAULT true,
  allow_duet BOOLEAN NOT NULL DEFAULT true,
  original_video_id UUID REFERENCES imufeed_videos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_videos_author ON imufeed_videos(author_id);
CREATE INDEX idx_videos_status ON imufeed_videos(status) WHERE status = 'published';
CREATE INDEX idx_videos_category ON imufeed_videos(category);
CREATE INDEX idx_videos_created ON imufeed_videos(created_at DESC);
CREATE INDEX idx_videos_trending ON imufeed_videos(likes_count DESC, views_count DESC)
  WHERE status = 'published';

-- ============================================================================
-- 5. TABLE: imufeed_video_hashtags (junction)
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_video_hashtags (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES imufeed_hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, hashtag_id)
);

-- ============================================================================
-- 6. TABLE: imufeed_likes
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_likes (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, user_id)
);

-- ============================================================================
-- 7. TABLE: imufeed_bookmarks
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_bookmarks (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, user_id)
);

-- ============================================================================
-- 8. TABLE: imufeed_comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES imufeed_comments(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_video ON imufeed_comments(video_id, created_at DESC);
CREATE INDEX idx_comments_parent ON imufeed_comments(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================================================
-- 9. TABLE: imufeed_comment_likes
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_comment_likes (
  comment_id UUID NOT NULL REFERENCES imufeed_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- ============================================================================
-- 10. TABLE: imufeed_views
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  watch_duration_ms INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_views_video ON imufeed_views(video_id);
CREATE INDEX idx_views_user ON imufeed_views(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 11. TABLE: imufeed_follows
-- ============================================================================

CREATE TABLE IF NOT EXISTS imufeed_follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);
CREATE INDEX idx_follows_following ON imufeed_follows(following_id);

-- ============================================================================
-- 12. RLS Policies
-- ============================================================================

ALTER TABLE imufeed_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_follows ENABLE ROW LEVEL SECURITY;

-- Vidéos
CREATE POLICY videos_select ON imufeed_videos FOR SELECT
  USING (status = 'published' AND (visibility = 'public' OR author_id = auth.uid()));
CREATE POLICY videos_update ON imufeed_videos FOR UPDATE
  USING (author_id = auth.uid());
CREATE POLICY videos_insert ON imufeed_videos FOR INSERT
  WITH CHECK (author_id = auth.uid());
CREATE POLICY videos_delete ON imufeed_videos FOR DELETE
  USING (author_id = auth.uid());

-- Likes
CREATE POLICY likes_select ON imufeed_likes FOR SELECT USING (true);
CREATE POLICY likes_insert ON imufeed_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY likes_delete ON imufeed_likes FOR DELETE USING (user_id = auth.uid());

-- Bookmarks
CREATE POLICY bookmarks_select ON imufeed_bookmarks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY bookmarks_insert ON imufeed_bookmarks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY bookmarks_delete ON imufeed_bookmarks FOR DELETE USING (user_id = auth.uid());

-- Commentaires
CREATE POLICY comments_select ON imufeed_comments FOR SELECT USING (true);
CREATE POLICY comments_insert ON imufeed_comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY comments_delete ON imufeed_comments FOR DELETE USING (author_id = auth.uid());

-- Vues
CREATE POLICY views_insert ON imufeed_views FOR INSERT WITH CHECK (true);
CREATE POLICY views_select ON imufeed_views FOR SELECT USING (true);

-- Follows
CREATE POLICY follows_select ON imufeed_follows FOR SELECT USING (true);
CREATE POLICY follows_insert ON imufeed_follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY follows_delete ON imufeed_follows FOR DELETE USING (follower_id = auth.uid());

-- ============================================================================
-- 13. Triggers
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION imufeed_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_videos_updated
  BEFORE UPDATE ON imufeed_videos
  FOR EACH ROW EXECUTE FUNCTION imufeed_update_timestamp();

-- Likes counter
CREATE OR REPLACE FUNCTION imufeed_likes_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_videos SET likes_count = likes_count + 1 WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_videos SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_counter
  AFTER INSERT OR DELETE ON imufeed_likes
  FOR EACH ROW EXECUTE FUNCTION imufeed_likes_counter();

-- Comments counter
CREATE OR REPLACE FUNCTION imufeed_comments_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_videos SET comments_count = comments_count + 1 WHERE id = NEW.video_id;
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE imufeed_comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_videos SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.video_id;
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE imufeed_comments SET replies_count = GREATEST(0, replies_count - 1) WHERE id = OLD.parent_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_counter
  AFTER INSERT OR DELETE ON imufeed_comments
  FOR EACH ROW EXECUTE FUNCTION imufeed_comments_counter();

-- Views counter
CREATE OR REPLACE FUNCTION imufeed_views_counter()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE imufeed_videos SET views_count = views_count + 1 WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_views_counter
  AFTER INSERT ON imufeed_views
  FOR EACH ROW EXECUTE FUNCTION imufeed_views_counter();

-- Bookmarks counter
CREATE OR REPLACE FUNCTION imufeed_bookmarks_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_videos SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_videos SET bookmarks_count = GREATEST(0, bookmarks_count - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookmarks_counter
  AFTER INSERT OR DELETE ON imufeed_bookmarks
  FOR EACH ROW EXECUTE FUNCTION imufeed_bookmarks_counter();

-- Hashtag usage counter
CREATE OR REPLACE FUNCTION imufeed_hashtag_usage_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_hashtags SET usage_count = usage_count + 1 WHERE id = NEW.hashtag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_hashtags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.hashtag_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hashtag_usage
  AFTER INSERT OR DELETE ON imufeed_video_hashtags
  FOR EACH ROW EXECUTE FUNCTION imufeed_hashtag_usage_counter();

-- Follows counter on profiles
CREATE OR REPLACE FUNCTION imufeed_follows_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 0) - 1) WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follows_counter
  AFTER INSERT OR DELETE ON imufeed_follows
  FOR EACH ROW EXECUTE FUNCTION imufeed_follows_counter();

-- ============================================================================
-- 14. RPC Functions
-- ============================================================================

-- Feed "Pour Toi" avec scoring pondéré
CREATE OR REPLACE FUNCTION get_imufeed_for_you(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  video_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  duration_ms INTEGER,
  width INTEGER,
  height INTEGER,
  category video_category,
  visibility video_visibility,
  status video_status,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  views_count INTEGER,
  bookmarks_count INTEGER,
  allow_comments BOOLEAN,
  allow_duet BOOLEAN,
  original_video_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_liked BOOLEAN,
  is_bookmarked BOOLEAN,
  score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id, v.author_id, v.video_url, v.thumbnail_url, v.caption,
    v.duration_ms, v.width, v.height, v.category, v.visibility, v.status,
    v.likes_count, v.comments_count, v.shares_count, v.views_count, v.bookmarks_count,
    v.allow_comments, v.allow_duet, v.original_video_id,
    v.created_at, v.updated_at,
    EXISTS(SELECT 1 FROM imufeed_likes l WHERE l.video_id = v.id AND l.user_id = p_user_id) AS is_liked,
    EXISTS(SELECT 1 FROM imufeed_bookmarks b WHERE b.video_id = v.id AND b.user_id = p_user_id) AS is_bookmarked,
    (
      EXTRACT(EPOCH FROM (now() - v.created_at)) / -86400.0 * 0.3
      + LOG(GREATEST(v.likes_count, 1)) * 0.25
      + LOG(GREATEST(v.comments_count, 1)) * 0.2
      + LOG(GREATEST(v.shares_count, 1)) * 0.15
      + CASE WHEN EXISTS(SELECT 1 FROM imufeed_follows f WHERE f.follower_id = p_user_id AND f.following_id = v.author_id) THEN 2.0 ELSE 0.0 END
      + LOG(GREATEST(v.views_count, 1)) * 0.1
    ) AS score
  FROM imufeed_videos v
  WHERE v.status = 'published'
    AND v.visibility = 'public'
    AND (p_cursor IS NULL OR v.created_at < p_cursor)
  ORDER BY score DESC, v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Feed "Following"
CREATE OR REPLACE FUNCTION get_imufeed_following(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  video_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  duration_ms INTEGER,
  width INTEGER,
  height INTEGER,
  category video_category,
  likes_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  allow_comments BOOLEAN,
  created_at TIMESTAMPTZ,
  is_liked BOOLEAN,
  is_bookmarked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id, v.author_id, v.video_url, v.thumbnail_url, v.caption,
    v.duration_ms, v.width, v.height, v.category,
    v.likes_count, v.comments_count, v.views_count,
    v.allow_comments, v.created_at,
    EXISTS(SELECT 1 FROM imufeed_likes l WHERE l.video_id = v.id AND l.user_id = p_user_id),
    EXISTS(SELECT 1 FROM imufeed_bookmarks b WHERE b.video_id = v.id AND b.user_id = p_user_id)
  FROM imufeed_videos v
  INNER JOIN imufeed_follows f ON f.following_id = v.author_id AND f.follower_id = p_user_id
  WHERE v.status = 'published'
    AND (p_cursor IS NULL OR v.created_at < p_cursor)
  ORDER BY v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
