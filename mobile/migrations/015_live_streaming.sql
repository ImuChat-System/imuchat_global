-- ============================================================================
-- Sprint S15B — Infrastructure Live Streaming
-- Tables : imufeed_lives, imufeed_live_chat, imufeed_live_donations,
--          imufeed_live_cohosts, imufeed_live_moderation
-- ============================================================================

-- ── 1. Live Streams ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imufeed_lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    host_name TEXT DEFAULT '',
    host_avatar TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL CHECK (category IN (
        'gaming', 'music', 'art', 'education', 'lifestyle',
        'tech', 'sports', 'social', 'other'
    )),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'live', 'ended', 'cancelled'
    )),
    stream_url TEXT,
    thumbnail_url TEXT,
    viewer_count INTEGER DEFAULT 0,
    peak_viewer_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    total_donations INTEGER DEFAULT 0,
    co_hosts UUID[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    replay_url TEXT,
    has_replay BOOLEAN DEFAULT false,
    is_adult_only BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lives_host ON imufeed_lives(host_id, created_at DESC);
CREATE INDEX idx_lives_status ON imufeed_lives(status, viewer_count DESC);
CREATE INDEX idx_lives_category ON imufeed_lives(category, status);
CREATE INDEX idx_lives_scheduled ON imufeed_lives(scheduled_at)
    WHERE status = 'scheduled';

ALTER TABLE imufeed_lives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live streams"
    ON imufeed_lives FOR SELECT
    USING (true);

CREATE POLICY "Hosts can create live streams"
    ON imufeed_lives FOR INSERT
    WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own live streams"
    ON imufeed_lives FOR UPDATE
    USING (auth.uid() = host_id);

-- ── 2. Live Chat ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imufeed_live_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_id UUID NOT NULL REFERENCES imufeed_lives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN (
        'text', 'donation', 'system', 'pinned'
    )),
    content TEXT NOT NULL,
    donation_amount INTEGER,
    role TEXT DEFAULT 'viewer' CHECK (role IN (
        'viewer', 'subscriber', 'moderator', 'cohost', 'host'
    )),
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_live_chat_live ON imufeed_live_chat(live_id, created_at DESC);

ALTER TABLE imufeed_live_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live chat"
    ON imufeed_live_chat FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can send chat"
    ON imufeed_live_chat FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ── 3. Live Donations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imufeed_live_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_id UUID NOT NULL REFERENCES imufeed_lives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_live_donations_live ON imufeed_live_donations(live_id, created_at DESC);
CREATE INDEX idx_live_donations_user ON imufeed_live_donations(user_id);

ALTER TABLE imufeed_live_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations"
    ON imufeed_live_donations FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can donate"
    ON imufeed_live_donations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ── 4. Co-host Requests ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imufeed_live_cohosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_id UUID NOT NULL REFERENCES imufeed_lives(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'declined'
    )),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(live_id, from_user_id, to_user_id)
);

ALTER TABLE imufeed_live_cohosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view cohost requests"
    ON imufeed_live_cohosts FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Hosts can send cohost invites"
    ON imufeed_live_cohosts FOR INSERT
    WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Invitees can respond to cohost requests"
    ON imufeed_live_cohosts FOR UPDATE
    USING (auth.uid() = to_user_id);

-- ── 5. Moderation Log ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS imufeed_live_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_id UUID NOT NULL REFERENCES imufeed_lives(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('warn', 'mute', 'timeout', 'ban')),
    reason TEXT,
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_live_moderation_live ON imufeed_live_moderation(live_id, created_at DESC);

ALTER TABLE imufeed_live_moderation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators and hosts can view moderation log"
    ON imufeed_live_moderation FOR SELECT
    USING (auth.uid() = moderator_id);

CREATE POLICY "Moderators can create moderation entries"
    ON imufeed_live_moderation FOR INSERT
    WITH CHECK (auth.uid() = moderator_id);

-- ── 6. Realtime publication ──────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE imufeed_live_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE imufeed_live_donations;
