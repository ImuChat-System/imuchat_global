-- ============================================================================
-- Sprint S14B — Monétisation Créateur
-- Tables : creator_tips, creator_subscriptions, subscriber_content
-- RPCs : send tip, get revenue
-- ============================================================================

-- ── 1. Creator Tips ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    message TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_creator_tips_creator ON creator_tips(creator_id, created_at DESC);
CREATE INDEX idx_creator_tips_tipper ON creator_tips(tipper_id, created_at DESC);

ALTER TABLE creator_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tips (sent or received)"
    ON creator_tips FOR SELECT
    USING (auth.uid() = tipper_id OR auth.uid() = creator_id);

CREATE POLICY "Users can insert own tips"
    ON creator_tips FOR INSERT
    WITH CHECK (auth.uid() = tipper_id);

-- ── 2. Creator Subscriptions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'vip')),
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    started_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    UNIQUE(subscriber_id, creator_id)
);

CREATE INDEX idx_creator_subs_creator ON creator_subscriptions(creator_id, status);
CREATE INDEX idx_creator_subs_subscriber ON creator_subscriptions(subscriber_id, status);

ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
    ON creator_subscriptions FOR SELECT
    USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

CREATE POLICY "Users can subscribe"
    ON creator_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can update own subscriptions"
    ON creator_subscriptions FOR UPDATE
    USING (auth.uid() = subscriber_id);

-- ── 3. Subscriber-only Content ───────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriber_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL,
    min_tier TEXT NOT NULL DEFAULT 'basic' CHECK (min_tier IN ('basic', 'pro', 'vip')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(video_id)
);

CREATE INDEX idx_subscriber_content_creator ON subscriber_content(creator_id);

ALTER TABLE subscriber_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can manage own subscriber content"
    ON subscriber_content FOR ALL
    USING (auth.uid() = creator_id);

CREATE POLICY "Subscribers can read content they have access to"
    ON subscriber_content FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM creator_subscriptions cs
            WHERE cs.subscriber_id = auth.uid()
              AND cs.creator_id = subscriber_content.creator_id
              AND cs.status = 'active'
        )
    );

-- ── 4. RPC: Send Tip ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION send_creator_tip(
    p_creator_id UUID,
    p_amount INTEGER,
    p_message TEXT DEFAULT ''
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_tipper_id UUID := auth.uid();
    v_balance INTEGER;
    v_tip creator_tips;
BEGIN
    -- Check balance
    SELECT imucoins INTO v_balance FROM wallets WHERE user_id = v_tipper_id;
    IF v_balance IS NULL OR v_balance < p_amount THEN
        RETURN json_build_object('error', 'Insufficient balance');
    END IF;

    -- Debit tipper
    UPDATE wallets SET imucoins = imucoins - p_amount WHERE user_id = v_tipper_id;

    -- Credit creator
    UPDATE wallets SET imucoins = imucoins + p_amount WHERE user_id = p_creator_id;

    -- Record tip
    INSERT INTO creator_tips (tipper_id, creator_id, amount, message)
    VALUES (v_tipper_id, p_creator_id, p_amount, p_message)
    RETURNING * INTO v_tip;

    RETURN row_to_json(v_tip);
END;
$$;

-- ── 5. RPC: Get Creator Revenue ─────────────────────────────────
CREATE OR REPLACE FUNCTION get_creator_revenue(
    p_creator_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_tips_total BIGINT;
    v_tips_count BIGINT;
    v_subs_total BIGINT;
    v_subs_active BIGINT;
BEGIN
    -- Tips in period
    SELECT COALESCE(SUM(amount), 0), COUNT(*)
    INTO v_tips_total, v_tips_count
    FROM creator_tips
    WHERE creator_id = p_creator_id
      AND created_at >= now() - (p_days || ' days')::interval;

    -- Active subscriptions
    SELECT COUNT(*), COALESCE(SUM(price_cents), 0)
    INTO v_subs_active, v_subs_total
    FROM creator_subscriptions
    WHERE creator_id = p_creator_id
      AND status = 'active';

    RETURN json_build_object(
        'tips_total', v_tips_total,
        'tips_count', v_tips_count,
        'subs_revenue', v_subs_total,
        'subs_active', v_subs_active,
        'total_revenue', v_tips_total + v_subs_total,
        'period_days', p_days
    );
END;
$$;
