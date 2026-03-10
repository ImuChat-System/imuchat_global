-- ─── Migration 011 — Sprint S11 ──────────────────────────────
-- Axe A: Social Sub-Tabs (Feed / ImuFeed / Stories)
-- Axe B: Remix, Duo & Effets Avancés
-- Date: 10 mars 2026

-- ─── S11A: Préférences utilisateur sub-tabs Social ───────────

CREATE TABLE IF NOT EXISTS user_social_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_tab TEXT NOT NULL DEFAULT 'feed' CHECK (default_tab IN ('feed', 'imufeed', 'stories')),
    show_imufeed_tab BOOLEAN NOT NULL DEFAULT true,
    show_stories_tab BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_social_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_social_prefs"
    ON user_social_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ─── S11B: Table remixes / duos / green screen ───────────────

-- Type de mode vidéo (normal, duo, remix, green_screen)
DO $$ BEGIN
    CREATE TYPE video_creation_mode AS ENUM ('normal', 'duo', 'remix', 'green_screen');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Extension de imufeed_videos pour le mode de création
ALTER TABLE imufeed_videos
    ADD COLUMN IF NOT EXISTS creation_mode video_creation_mode NOT NULL DEFAULT 'normal',
    ADD COLUMN IF NOT EXISTS source_video_id UUID REFERENCES imufeed_videos(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS duo_layout JSONB DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS remix_config JSONB DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS post_effects JSONB DEFAULT '[]'::jsonb;

-- Index pour retrouver les remixes/duos d'une vidéo
CREATE INDEX IF NOT EXISTS idx_imufeed_source_video
    ON imufeed_videos(source_video_id) WHERE source_video_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_imufeed_creation_mode
    ON imufeed_videos(creation_mode) WHERE creation_mode != 'normal';

-- Table pour les effets post-production disponibles
CREATE TABLE IF NOT EXISTS imufeed_post_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    effect_type TEXT NOT NULL CHECK (effect_type IN ('blur_bg', 'stabilization', 'light_correction', 'color_grade')),
    description TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    config_schema JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE imufeed_post_effects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_effects_read_all"
    ON imufeed_post_effects FOR SELECT
    USING (true);

-- RPC: Récupérer les remixes/duos d'une vidéo source
CREATE OR REPLACE FUNCTION get_video_remixes(p_video_id UUID, p_limit INT DEFAULT 20)
RETURNS SETOF imufeed_videos
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT v.* FROM imufeed_videos v
    WHERE v.source_video_id = p_video_id
      AND v.status = 'published'
    ORDER BY v.created_at DESC
    LIMIT p_limit;
$$;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_social_prefs_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_social_prefs_updated ON user_social_preferences;
CREATE TRIGGER trg_social_prefs_updated
    BEFORE UPDATE ON user_social_preferences
    FOR EACH ROW EXECUTE FUNCTION update_social_prefs_timestamp();
