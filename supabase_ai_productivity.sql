-- ============================================================================
-- Migration: AI Conversations & Productivity (Sprint 5)
-- Tables pour: Alice AI Assistant, Traduction, Auto-modération
-- Date: Mars 2026
-- Pré-requis: supabase_schema.sql (profiles), mobile/migrations/005_tasks_projects.sql
-- Note: Les tables projects/tasks/task_comments/task_activity_log sont déjà créées
--       par la migration mobile 005. Cette migration ajoute les tables IA.
-- ============================================================================

-- ============================================================================
-- 1. TABLE: ai_conversations — Historique des conversations Alice
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Métadonnées conversation
    title TEXT, -- Titre auto-généré ou défini par l'utilisateur
    persona TEXT DEFAULT 'general', -- general, health, study, style, pro, code, creative
    provider TEXT DEFAULT 'openai', -- openai, anthropic, google, mistral, groq, custom
    model TEXT, -- Modèle utilisé (gpt-4o, claude-3, etc.)
    
    -- Compteurs
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    
    -- État
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_persona ON ai_conversations(persona);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_pinned ON ai_conversations(user_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_msg ON ai_conversations(user_id, last_message_at DESC);

-- ============================================================================
-- 2. TABLE: ai_messages — Messages individuels des conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    
    -- Contenu
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Métadonnées IA (pour les réponses assistant)
    provider TEXT,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    latency_ms INTEGER, -- Temps de réponse en ms
    
    -- État
    is_error BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_messages(conversation_id, created_at);

-- ============================================================================
-- 3. TABLE: ai_provider_configs — Configuration providers par utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    provider TEXT NOT NULL, -- openai, anthropic, google, mistral, groq, custom
    
    -- Configuration (clés chiffrées côté client avant stockage)
    api_key_encrypted TEXT,
    base_url TEXT,
    preferred_model TEXT,
    
    -- État
    is_active BOOLEAN DEFAULT TRUE,
    is_validated BOOLEAN DEFAULT FALSE,
    last_validated_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_ai_provider_configs_user ON ai_provider_configs(user_id);

-- ============================================================================
-- 4. TABLE: translation_cache — Cache de traductions pour les messages chat
-- ============================================================================

CREATE TABLE IF NOT EXISTS translation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source
    source_text_hash TEXT NOT NULL, -- SHA-256 du texte source
    source_language TEXT, -- Langue source détectée
    target_language TEXT NOT NULL,
    
    -- Résultat
    translated_text TEXT NOT NULL,
    provider TEXT DEFAULT 'ai-gateway', -- Service de traduction utilisé
    
    -- Stats
    hit_count INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    
    UNIQUE(source_text_hash, target_language)
);

CREATE INDEX IF NOT EXISTS idx_translation_cache_hash ON translation_cache(source_text_hash, target_language);
CREATE INDEX IF NOT EXISTS idx_translation_cache_expires ON translation_cache(expires_at);

-- ============================================================================
-- 5. TABLE: content_moderation_log — Journal auto-modération
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_moderation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contexte
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    server_id UUID, -- Référence vers le serveur/communauté
    channel_id UUID,
    message_id UUID,
    
    -- Détection
    content_snippet TEXT, -- Extrait du contenu (max 200 chars)
    violation_type TEXT NOT NULL, -- spam, hate_speech, nsfw, harassment, self_harm, violence, illegal, other
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1), -- 0.00 à 1.00
    
    -- Action prise
    action_taken TEXT NOT NULL CHECK (action_taken IN ('none', 'flag', 'hide', 'delete', 'warn', 'mute', 'ban')),
    
    -- Revue humaine
    reviewed_by UUID REFERENCES profiles(id),
    review_decision TEXT CHECK (review_decision IN ('confirmed', 'overturned', 'pending')),
    review_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_log_user ON content_moderation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_server ON content_moderation_log(server_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_type ON content_moderation_log(violation_type);
CREATE INDEX IF NOT EXISTS idx_moderation_log_severity ON content_moderation_log(severity);
CREATE INDEX IF NOT EXISTS idx_moderation_log_created ON content_moderation_log(created_at);

-- ============================================================================
-- 6. TABLE: bot_configs — Configuration bots par serveur
-- ============================================================================

CREATE TABLE IF NOT EXISTS bot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID NOT NULL, -- Référence vers le serveur
    
    -- Type de bot
    bot_type TEXT NOT NULL CHECK (bot_type IN ('imu_guard', 'imu_quiz', 'imu_bot', 'custom')),
    bot_name TEXT NOT NULL,
    
    -- Configuration
    is_enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',
    -- Pour ImuGuard: {"auto_mod": true, "spam_filter": true, "nsfw_filter": true, "word_blacklist": [...]}
    -- Pour ImuQuiz: {"auto_quiz": false, "quiz_interval_minutes": 60, "categories": [...]}
    -- Pour ImuBot: {"welcome_enabled": true, "welcome_message": "...", "auto_role": "..."}
    
    -- Permissions
    allowed_channels UUID[] DEFAULT '{}', -- Si vide = tous les channels
    exempt_roles TEXT[] DEFAULT '{}', -- Rôles exemptés de la modération
    
    -- Stats
    actions_count INTEGER DEFAULT 0,
    last_action_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(server_id, bot_type)
);

CREATE INDEX IF NOT EXISTS idx_bot_configs_server ON bot_configs(server_id);
CREATE INDEX IF NOT EXISTS idx_bot_configs_type ON bot_configs(bot_type);

-- ============================================================================
-- 7. TRIGGERS: Auto-update timestamps
-- ============================================================================

-- ai_conversations updated_at
CREATE OR REPLACE FUNCTION update_ai_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER trigger_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_conversations_updated_at();

-- ai_provider_configs updated_at
CREATE OR REPLACE FUNCTION update_ai_provider_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_provider_configs_updated_at ON ai_provider_configs;
CREATE TRIGGER trigger_ai_provider_configs_updated_at
    BEFORE UPDATE ON ai_provider_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_provider_configs_updated_at();

-- bot_configs updated_at
CREATE OR REPLACE FUNCTION update_bot_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bot_configs_updated_at ON bot_configs;
CREATE TRIGGER trigger_bot_configs_updated_at
    BEFORE UPDATE ON bot_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_configs_updated_at();

-- ============================================================================
-- 8. TRIGGER: Auto-update message count & tokens on ai_conversations
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ai_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ai_conversations
        SET message_count = message_count + 1,
            total_tokens = total_tokens + COALESCE(NEW.total_tokens, 0),
            last_message_at = NEW.created_at
        WHERE id = NEW.conversation_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE ai_conversations
        SET message_count = GREATEST(0, message_count - 1),
            total_tokens = GREATEST(0, total_tokens - COALESCE(OLD.total_tokens, 0))
        WHERE id = OLD.conversation_id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ai_conversation_stats ON ai_messages;
CREATE TRIGGER trigger_update_ai_conversation_stats
    AFTER INSERT OR DELETE ON ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_conversation_stats();

-- ============================================================================
-- 9. RLS Policies
-- ============================================================================

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;

-- ai_conversations: Utilisateur voit/gère ses propres conversations
CREATE POLICY ai_conversations_select ON ai_conversations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY ai_conversations_insert ON ai_conversations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY ai_conversations_update ON ai_conversations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY ai_conversations_delete ON ai_conversations FOR DELETE USING (user_id = auth.uid());

-- ai_messages: Accès via la conversation (même user)
CREATE POLICY ai_messages_select ON ai_messages FOR SELECT
    USING (EXISTS (SELECT 1 FROM ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
CREATE POLICY ai_messages_insert ON ai_messages FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
CREATE POLICY ai_messages_delete ON ai_messages FOR DELETE
    USING (EXISTS (SELECT 1 FROM ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

-- ai_provider_configs: Utilisateur gère ses propres configs
CREATE POLICY ai_provider_configs_select ON ai_provider_configs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY ai_provider_configs_insert ON ai_provider_configs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY ai_provider_configs_update ON ai_provider_configs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY ai_provider_configs_delete ON ai_provider_configs FOR DELETE USING (user_id = auth.uid());

-- translation_cache: Lecture publique (cache partagé)
CREATE POLICY translation_cache_select ON translation_cache FOR SELECT USING (true);
CREATE POLICY translation_cache_insert ON translation_cache FOR INSERT WITH CHECK (true);

-- content_moderation_log: Admins voient tout, users voient leurs propres
CREATE POLICY moderation_log_admin_select ON content_moderation_log FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
        OR user_id = auth.uid()
    );
CREATE POLICY moderation_log_insert ON content_moderation_log FOR INSERT WITH CHECK (true);

-- bot_configs: Admins du serveur gèrent
CREATE POLICY bot_configs_select ON bot_configs FOR SELECT USING (true); -- Visible par tous (config publique)
CREATE POLICY bot_configs_insert ON bot_configs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
);
CREATE POLICY bot_configs_update ON bot_configs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
);
CREATE POLICY bot_configs_delete ON bot_configs FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
);

-- ============================================================================
-- 10. Cleanup: Auto-purge translation cache (> 30 days)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_translation_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM translation_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FIN Migration AI & Productivity
-- ============================================================================
