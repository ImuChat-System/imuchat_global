-- ============================================================
-- Sprint 25 — Tables for Pinned Messages, Shared Media, Activities
-- ============================================================

-- Pinned messages in a conversation
CREATE TABLE IF NOT EXISTS pinned_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (conversation_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_pinned_messages_conversation
    ON pinned_messages (conversation_id, pinned_at DESC);

-- Shared media attachments (extracted view of message media)
CREATE TABLE IF NOT EXISTS shared_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'gif', 'audio', 'file')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shared_media_conversation
    ON shared_media (conversation_id, created_at DESC);

-- User activity feed
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('group', 'watch', 'game', 'music', 'profile')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user
    ON user_activities (user_id, created_at DESC);

-- Scheduled events / calls
CREATE TABLE IF NOT EXISTS scheduled_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL DEFAULT 'call' CHECK (event_type IN ('call', 'watch_party', 'game_night', 'meeting')),
    call_type TEXT NOT NULL DEFAULT 'video' CHECK (call_type IN ('audio', 'video')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT,
    participants JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'started', 'ended', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_events_time
    ON scheduled_events (scheduled_at ASC)
    WHERE status = 'scheduled';

-- RLS policies
ALTER TABLE pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_events ENABLE ROW LEVEL SECURITY;

-- Pinned messages: read for conversation members, pin/unpin for members
CREATE POLICY "Users can view pinned messages in their conversations"
    ON pinned_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = pinned_messages.conversation_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can pin messages in their conversations"
    ON pinned_messages FOR INSERT
    WITH CHECK (
        pinned_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = pinned_messages.conversation_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can unpin messages they pinned"
    ON pinned_messages FOR DELETE
    USING (pinned_by = auth.uid());

-- Shared media: read for conversation members
CREATE POLICY "Users can view shared media in their conversations"
    ON shared_media FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = shared_media.conversation_id
            AND cm.user_id = auth.uid()
        )
    );

-- Activities: users see their own
CREATE POLICY "Users can view their own activities"
    ON user_activities FOR SELECT
    USING (user_id = auth.uid());

-- Scheduled events: participants can view
CREATE POLICY "Users can view scheduled events they participate in"
    ON scheduled_events FOR SELECT
    USING (
        organizer_id = auth.uid()
        OR participants::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
    );

CREATE POLICY "Users can create scheduled events"
    ON scheduled_events FOR INSERT
    WITH CHECK (organizer_id = auth.uid());
