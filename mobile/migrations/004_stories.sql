-- ================================================================
-- 📖 Migration 004: Stories (24h ephemeral content)
-- Date: 22 février 2026
-- DEV-011: Stories Réelles
-- ================================================================

-- ================================================================
-- 📖 Table: stories
-- Ephemeral content that expires after 24 hours
-- ================================================================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content type
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'text')),
  
  -- Media (for image/video types)
  media_url TEXT,
  thumbnail_url TEXT,
  
  -- Text content (for text type or caption)
  text_content TEXT,
  
  -- Text story styling
  background_color TEXT DEFAULT '#6366f1', -- Indigo default
  text_color TEXT DEFAULT '#ffffff',
  font_style TEXT DEFAULT 'default' CHECK (font_style IN ('default', 'serif', 'mono', 'handwritten')),
  
  -- Visibility
  visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
  
  -- Settings
  allow_replies BOOLEAN DEFAULT true,
  
  -- Metadata
  duration_seconds INTEGER DEFAULT 5, -- Display duration for viewer
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Soft delete for archives
  archived_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT false
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_visibility ON public.stories(visibility);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 👁️ Table: story_views
-- Track who has viewed each story
-- ================================================================
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reaction (optional quick reaction)
  reaction TEXT CHECK (reaction IN ('❤️', '😂', '😮', '😢', '🔥', '👏')),
  
  UNIQUE(story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON public.story_views(viewer_id);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 💬 Table: story_replies
-- Direct message replies to stories
-- ================================================================
CREATE TABLE IF NOT EXISTS public.story_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_story_replies_story_id ON public.story_replies(story_id);

ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 🔒 Row Level Security Policies
-- ================================================================

-- Stories: viewable based on visibility
DROP POLICY IF EXISTS "Stories viewable based on visibility" ON public.stories;
CREATE POLICY "Stories viewable based on visibility"
  ON public.stories FOR SELECT
  USING (
    -- Own stories always visible
    user_id = auth.uid()
    OR
    -- Public stories visible to all authenticated users
    (visibility = 'public' AND expires_at > NOW() AND NOT is_archived)
    OR
    -- Friends stories visible to contacts (simplified: mutual contact check)
    (
      visibility = 'friends' 
      AND expires_at > NOW() 
      AND NOT is_archived
      AND EXISTS (
        SELECT 1 FROM public.contacts
        WHERE (user_id = auth.uid() AND contact_id = stories.user_id)
           OR (contact_id = auth.uid() AND user_id = stories.user_id)
      )
    )
  );

-- Stories: users can create their own
DROP POLICY IF EXISTS "Users can create own stories" ON public.stories;
CREATE POLICY "Users can create own stories"
  ON public.stories FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Stories: users can update their own
DROP POLICY IF EXISTS "Users can update own stories" ON public.stories;
CREATE POLICY "Users can update own stories"
  ON public.stories FOR UPDATE
  USING (user_id = auth.uid());

-- Stories: users can delete their own
DROP POLICY IF EXISTS "Users can delete own stories" ON public.stories;
CREATE POLICY "Users can delete own stories"
  ON public.stories FOR DELETE
  USING (user_id = auth.uid());

-- Story views: viewable by story owner
DROP POLICY IF EXISTS "Story owner can view views" ON public.story_views;
CREATE POLICY "Story owner can view views"
  ON public.story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE id = story_views.story_id AND user_id = auth.uid()
    )
    OR viewer_id = auth.uid()
  );

-- Story views: users can insert their own views
DROP POLICY IF EXISTS "Users can mark stories as viewed" ON public.story_views;
CREATE POLICY "Users can mark stories as viewed"
  ON public.story_views FOR INSERT
  WITH CHECK (viewer_id = auth.uid());

-- Story views: users can update their own reaction
DROP POLICY IF EXISTS "Users can update own view reaction" ON public.story_views;
CREATE POLICY "Users can update own view reaction"
  ON public.story_views FOR UPDATE
  USING (viewer_id = auth.uid());

-- Story replies: sender and story owner can view
DROP POLICY IF EXISTS "Story replies viewable by participants" ON public.story_replies;
CREATE POLICY "Story replies viewable by participants"
  ON public.story_replies FOR SELECT
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.stories
      WHERE id = story_replies.story_id AND user_id = auth.uid()
    )
  );

-- Story replies: users can send replies
DROP POLICY IF EXISTS "Users can send story replies" ON public.story_replies;
CREATE POLICY "Users can send story replies"
  ON public.story_replies FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- ================================================================
-- 📊 Views for efficient queries
-- ================================================================

-- Active stories (not expired, not archived)
CREATE OR REPLACE VIEW public.active_stories AS
SELECT 
  s.*,
  p.username,
  p.full_name AS display_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.story_views WHERE story_id = s.id) AS view_count
FROM public.stories s
JOIN public.profiles p ON p.id = s.user_id
WHERE s.expires_at > NOW() 
  AND NOT s.is_archived;

-- ================================================================
-- 🔄 Functions
-- ================================================================

-- Function to get stories feed for a user
CREATE OR REPLACE FUNCTION public.get_stories_feed(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  text_content TEXT,
  background_color TEXT,
  text_color TEXT,
  font_style TEXT,
  visibility TEXT,
  allow_replies BOOLEAN,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  username TEXT,
  display_name TEXT,
  author_avatar TEXT,
  view_count BIGINT,
  is_viewed BOOLEAN
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.user_id,
    s.type,
    s.media_url,
    s.thumbnail_url,
    s.text_content,
    s.background_color,
    s.text_color,
    s.font_style,
    s.visibility,
    s.allow_replies,
    s.duration_seconds,
    s.created_at,
    s.expires_at,
    p.username,
    p.full_name AS display_name,
    p.avatar_url AS author_avatar,
    (SELECT COUNT(*) FROM public.story_views WHERE story_id = s.id) AS view_count,
    EXISTS (SELECT 1 FROM public.story_views WHERE story_id = s.id AND viewer_id = user_uuid) AS is_viewed
  FROM public.stories s
  JOIN public.profiles p ON p.id = s.user_id
  WHERE s.expires_at > NOW()
    AND NOT s.is_archived
    AND (
      s.user_id = user_uuid
      OR s.visibility = 'public'
      OR (
        s.visibility = 'friends'
        AND EXISTS (
          SELECT 1 FROM public.contacts
          WHERE (user_id = user_uuid AND contact_id = s.user_id)
             OR (contact_id = user_uuid AND user_id = s.user_id)
        )
      )
    )
  ORDER BY s.user_id, s.created_at DESC;
$$;

-- Function to cleanup expired stories (call via cron/edge function)
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Archive stories that have auto_archive enabled in user settings
  -- For now, just delete expired stories older than 48h
  DELETE FROM public.stories
  WHERE expires_at < NOW() - INTERVAL '24 hours'
    AND NOT is_archived;
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ================================================================
-- 🎯 Grants
-- ================================================================
GRANT SELECT ON public.active_stories TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stories_feed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_stories() TO service_role;
