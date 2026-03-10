-- ============================================================
-- Migration 010 — Alice Home Integration + Video Filters/Stickers
-- Sprint S10 · Axe A (Alice IA Home) + Axe B (Filtres & Stickers)
-- ============================================================

-- ─── S10A : Alice daily summaries ──────────────────────────

-- Table pour stocker les résumés quotidiens Alice (cache local-first)
CREATE TABLE IF NOT EXISTS alice_daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, summary_date)
);

ALTER TABLE alice_daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own summaries"
    ON alice_daily_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
    ON alice_daily_summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Table pour les suggestions proactives Alice
CREATE TABLE IF NOT EXISTS alice_proactive_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('event', 'unread', 'module', 'reminder', 'tip')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

ALTER TABLE alice_proactive_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own suggestions"
    ON alice_proactive_suggestions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own suggestions"
    ON alice_proactive_suggestions FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_alice_suggestions_user_active
    ON alice_proactive_suggestions(user_id, is_dismissed, expires_at);

-- RPC : fetch active suggestions (non-dismissed, non-expired)
CREATE OR REPLACE FUNCTION get_active_suggestions(p_user_id UUID)
RETURNS SETOF alice_proactive_suggestions
LANGUAGE sql STABLE
AS $$
    SELECT * FROM alice_proactive_suggestions
    WHERE user_id = p_user_id
      AND is_dismissed = FALSE
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at DESC
    LIMIT 5;
$$;

-- RPC : dismiss suggestion
CREATE OR REPLACE FUNCTION dismiss_suggestion(p_suggestion_id UUID)
RETURNS VOID
LANGUAGE sql
AS $$
    UPDATE alice_proactive_suggestions
    SET is_dismissed = TRUE
    WHERE id = p_suggestion_id AND user_id = auth.uid();
$$;

-- ─── S10B : Video filters & stickers ──────────────────────

-- Sticker packs table
CREATE TABLE IF NOT EXISTS imufeed_sticker_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_official BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    sticker_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE imufeed_sticker_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sticker packs"
    ON imufeed_sticker_packs FOR SELECT
    USING (TRUE);

-- Individual stickers
CREATE TABLE IF NOT EXISTS imufeed_stickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES imufeed_sticker_packs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_animated BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE imufeed_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stickers"
    ON imufeed_stickers FOR SELECT
    USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_stickers_pack ON imufeed_stickers(pack_id, sort_order);

-- Video edit metadata (filters, stickers, text, speed applied per video)
ALTER TABLE imufeed_videos ADD COLUMN IF NOT EXISTS edit_metadata JSONB DEFAULT NULL;

-- ============================================================
-- End migration 010
-- ============================================================
