-- ═══════════════════════════════════════════════════════════════
-- Migration 009 — Personnalisation + Musique (Sprint S9)
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Ajout colonnes usage sur user_modules ────────────────

ALTER TABLE public.user_modules
  ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.user_modules
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_modules_usage
  ON public.user_modules(user_id, usage_count DESC);

-- ─── 2. RPC : incrémenter usage_count atomiquement ───────────

CREATE OR REPLACE FUNCTION increment_module_usage(
  p_user_id UUID,
  p_module_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.user_modules
  SET usage_count = usage_count + 1,
      last_used_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id
    AND module_id = p_module_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. RPC : modules pas utilisés depuis N jours ────────────

CREATE OR REPLACE FUNCTION get_stale_modules(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  module_id UUID,
  module_name TEXT,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    um.module_id,
    m.name,
    um.last_used_at,
    um.usage_count
  FROM public.user_modules um
  JOIN public.modules m ON m.id = um.module_id
  WHERE um.user_id = p_user_id
    AND um.is_active = true
    AND (um.last_used_at IS NULL OR um.last_used_at < now() - (p_days || ' days')::INTERVAL)
  ORDER BY um.last_used_at ASC NULLS FIRST
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 4. Enrichir imufeed_sounds — genres + catégories ────────

ALTER TABLE public.imufeed_sounds
  ADD COLUMN IF NOT EXISTS genre TEXT NOT NULL DEFAULT 'other';
ALTER TABLE public.imufeed_sounds
  ADD COLUMN IF NOT EXISTS is_original BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.imufeed_sounds
  ADD COLUMN IF NOT EXISTS original_video_id UUID REFERENCES imufeed_videos(id);

CREATE INDEX IF NOT EXISTS idx_sounds_genre ON imufeed_sounds(genre);
CREATE INDEX IF NOT EXISTS idx_sounds_usage ON imufeed_sounds(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_sounds_original ON imufeed_sounds(original_video_id)
  WHERE original_video_id IS NOT NULL;

-- ─── 5. RPC : incrémenter sound usage ────────────────────────

CREATE OR REPLACE FUNCTION increment_sound_usage(p_sound_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.imufeed_sounds
  SET usage_count = usage_count + 1
  WHERE id = p_sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 6. RPC : trending sounds ────────────────────────────────

CREATE OR REPLACE FUNCTION get_trending_sounds(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  title TEXT,
  artist TEXT,
  audio_url TEXT,
  artwork_url TEXT,
  duration_ms INTEGER,
  usage_count INTEGER,
  genre TEXT,
  is_original BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.title, s.artist, s.audio_url, s.artwork_url,
    s.duration_ms, s.usage_count, s.genre, s.is_original
  FROM public.imufeed_sounds s
  WHERE s.usage_count > 0
  ORDER BY s.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
