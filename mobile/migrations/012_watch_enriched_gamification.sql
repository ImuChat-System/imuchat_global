-- ─── Migration 012 — Sprint S12 ──────────────────────────────
-- Axe A: Watch enrichi + Watch Party Foundation
-- Axe B: Gamification ImuFeed (XP, niveaux, badges, défis)
-- Date: 11 mars 2026

-- =====================================================================
-- S12A: Watch enrichi
-- =====================================================================

-- ─── Sous-onglets Watch: catégories dynamiques ───────────────

CREATE TABLE IF NOT EXISTS watch_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    emoji TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE watch_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watch_categories_read_all"
    ON watch_categories FOR SELECT
    USING (true);

-- Seed catégories par défaut
INSERT INTO watch_categories (slug, label, emoji, sort_order) VALUES
    ('all', 'Tout', '🔥', 0),
    ('anime', 'Anime', '🎌', 1),
    ('movie', 'Films', '🎬', 2),
    ('series', 'Séries', '📺', 3),
    ('documentary', 'Docu', '🌍', 4),
    ('live', 'Live', '🔴', 5),
    ('podcast', 'Podcasts', '🎧', 6),
    ('music', 'Musique', '🎵', 7)
ON CONFLICT (slug) DO NOTHING;

-- ─── Watch Parties (enrichissement) ──────────────────────────

CREATE TABLE IF NOT EXISTS watch_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID,
    category_slug TEXT REFERENCES watch_categories(slug),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
    is_public BOOLEAN NOT NULL DEFAULT true,
    max_viewers INT DEFAULT NULL,
    viewer_count INT NOT NULL DEFAULT 0,
    attendee_count INT NOT NULL DEFAULT 0,
    chat_enabled BOOLEAN NOT NULL DEFAULT true,
    scheduled_for TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watch_parties_read_public"
    ON watch_parties FOR SELECT
    USING (is_public = true OR host_id = auth.uid());

CREATE POLICY "watch_parties_insert_own"
    ON watch_parties FOR INSERT
    WITH CHECK (host_id = auth.uid());

CREATE POLICY "watch_parties_update_own"
    ON watch_parties FOR UPDATE
    USING (host_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_watch_parties_status
    ON watch_parties(status) WHERE status = 'live';

CREATE INDEX IF NOT EXISTS idx_watch_parties_host
    ON watch_parties(host_id);

-- ─── Invitations Watch Party ─────────────────────────────────

CREATE TABLE IF NOT EXISTS watch_party_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES watch_parties(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (party_id, invitee_id)
);

ALTER TABLE watch_party_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_own"
    ON watch_party_invitations FOR ALL
    USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

-- =====================================================================
-- S12B: Gamification ImuFeed
-- =====================================================================

-- ─── Events XP créateur ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS creator_xp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN (
        'publish_video', 'like_received', 'comment_received',
        'views_1k', 'views_10k', 'challenge_completed',
        'share_received', 'first_video', 'went_viral', 'collab'
    )),
    xp_amount INT NOT NULL,
    source_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE creator_xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_events_own"
    ON creator_xp_events FOR ALL
    USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_xp_events_user
    ON creator_xp_events(user_id, created_at DESC);

-- ─── Niveaux créateur (agrégé) ───────────────────────────────

CREATE TABLE IF NOT EXISTS creator_levels (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    level INT NOT NULL DEFAULT 1,
    total_xp INT NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE creator_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_levels_read_all"
    ON creator_levels FOR SELECT
    USING (true);

CREATE POLICY "creator_levels_update_own"
    ON creator_levels FOR UPDATE
    USING (user_id = auth.uid());

-- ─── Badges créateur ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS creator_badges_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    category TEXT NOT NULL DEFAULT 'creator',
    requirement TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE creator_badges_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_catalog_read_all"
    ON creator_badges_catalog FOR SELECT
    USING (true);

-- Seed badges ImuFeed
INSERT INTO creator_badges_catalog (id, name, description, icon, rarity, requirement) VALUES
    ('first_video', 'First Video', 'Publie ta première vidéo', '🎥', 'common', 'Publier 1 vidéo'),
    ('viral', 'Viral', 'Une vidéo atteint 10K vues', '🔥', 'rare', '10 000 vues sur une vidéo'),
    ('dj', 'DJ', 'Publie 10 vidéos avec musique', '🎧', 'rare', '10 vidéos musicales'),
    ('storyteller', 'Storyteller', 'Publie 20 stories', '📖', 'common', '20 stories publiées'),
    ('collaborator', 'Collaborator', 'Fais 5 duos/remixes', '🤝', 'rare', '5 duos ou remixes'),
    ('broadcaster', 'Broadcaster', 'Anime 10 Watch Parties', '📡', 'epic', '10 Watch Parties animées'),
    ('arena_champion', 'Arena Champion', 'Top 1 du classement semaine', '🏆', 'legendary', 'Top 1 classement hebdo'),
    ('creator_king', 'Creator King', 'Atteins le niveau Légende', '👑', 'legendary', 'Tier Légende (niveau 51+)')
ON CONFLICT (id) DO NOTHING;

-- ─── Badges débloqués par créateur ───────────────────────────

CREATE TABLE IF NOT EXISTS creator_badges_earned (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES creator_badges_catalog(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE creator_badges_earned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_earned_own_read"
    ON creator_badges_earned FOR SELECT
    USING (true);

CREATE POLICY "badges_earned_own_insert"
    ON creator_badges_earned FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ─── Défis quotidiens ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('publish', 'like', 'comment', 'watch', 'share')),
    target INT NOT NULL DEFAULT 1,
    xp_reward INT NOT NULL DEFAULT 200,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_challenges_read_all"
    ON daily_challenges FOR SELECT
    USING (is_active = true);

-- Seed 5 défis quotidiens
INSERT INTO daily_challenges (title, description, action_type, target, xp_reward) VALUES
    ('Publie une vidéo', 'Publie au moins 1 vidéo aujourd''hui', 'publish', 1, 200),
    ('Like 5 vidéos', 'Like 5 vidéos de la communauté', 'like', 5, 100),
    ('Commente 3 vidéos', 'Laisse 3 commentaires', 'comment', 3, 150),
    ('Regarde 10 minutes', 'Regarde au moins 10 minutes de contenu', 'watch', 10, 100),
    ('Partage une vidéo', 'Partage 1 vidéo à un ami', 'share', 1, 100)
ON CONFLICT DO NOTHING;

-- ─── Progression défis utilisateur ───────────────────────────

CREATE TABLE IF NOT EXISTS user_daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    current INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    claimed BOOLEAN NOT NULL DEFAULT false,
    day DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (user_id, challenge_id, day)
);

ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_progress_own"
    ON user_daily_progress FOR ALL
    USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_day
    ON user_daily_progress(user_id, day);

-- ─── RPC: Calculer XP et attribuer niveau ────────────────────

CREATE OR REPLACE FUNCTION calculate_creator_level(p_user_id UUID)
RETURNS TABLE(level INT, total_xp BIGINT, tier TEXT)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
    v_total_xp BIGINT;
    v_level INT;
    v_tier TEXT;
BEGIN
    SELECT COALESCE(SUM(xp_amount), 0) INTO v_total_xp
    FROM creator_xp_events WHERE user_id = p_user_id;

    -- Formule: 100 XP par niveau (simplifiée)
    v_level := GREATEST(1, (v_total_xp / 100) + 1);

    -- Tier basé sur le niveau
    v_tier := CASE
        WHEN v_level >= 51 THEN 'legend'
        WHEN v_level >= 41 THEN 'diamond'
        WHEN v_level >= 31 THEN 'platinum'
        WHEN v_level >= 21 THEN 'gold'
        WHEN v_level >= 11 THEN 'silver'
        ELSE 'bronze'
    END;

    -- Upsert creator_levels
    INSERT INTO creator_levels (user_id, level, total_xp, tier, updated_at)
    VALUES (p_user_id, v_level::INT, v_total_xp::INT, v_tier, now())
    ON CONFLICT (user_id) DO UPDATE SET
        level = v_level::INT,
        total_xp = v_total_xp::INT,
        tier = v_tier,
        updated_at = now();

    RETURN QUERY SELECT v_level, v_total_xp, v_tier;
END;
$$;

-- ─── RPC: Top créateurs de la semaine ────────────────────────

CREATE OR REPLACE FUNCTION get_top_creators_weekly(p_limit INT DEFAULT 10)
RETURNS TABLE(user_id UUID, username TEXT, total_xp BIGINT, level INT, tier TEXT, rank BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT
        e.user_id,
        p.username,
        SUM(e.xp_amount) AS total_xp,
        cl.level,
        cl.tier,
        ROW_NUMBER() OVER (ORDER BY SUM(e.xp_amount) DESC) AS rank
    FROM creator_xp_events e
    JOIN profiles p ON p.id = e.user_id
    LEFT JOIN creator_levels cl ON cl.user_id = e.user_id
    WHERE e.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY e.user_id, p.username, cl.level, cl.tier
    ORDER BY total_xp DESC
    LIMIT p_limit;
$$;
