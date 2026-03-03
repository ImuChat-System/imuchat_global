-- ================================================================
-- 🛡️ ImuChat — Admin & Modération: Tables complémentaires
-- Date: Mars 2026
-- Ce fichier ajoute :
--   1. Table `content_reports` (signalements de contenu)
--   2. Table `feature_flags` (flags de fonctionnalités)
--   3. Colonnes modération sur `profiles` (ban/suspend)
--   4. RLS policies
--   5. Indexes
-- IDEMPOTENT : safe to re-run.
-- Prérequis : supabase_schema.sql, supabase_modules_phase_d.sql
-- ================================================================

-- ================================================================
-- 0️⃣ Fonction update_updated_at (idempotent)
-- ================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ================================================================
-- 1️⃣ Colonnes modération sur profiles
-- ================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ban_reason TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspend_reason TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;


-- ================================================================
-- 2️⃣ Table: content_reports (signalements de contenu)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL
    CHECK (content_type IN ('message', 'post', 'comment', 'module', 'profile', 'server', 'other')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL
    CHECK (reason IN (
      'spam',
      'harassment',
      'hate_speech',
      'violence',
      'nsfw',
      'misinformation',
      'copyright',
      'impersonation',
      'underage',
      'other'
    )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Les admins/reviewers peuvent voir tous les signalements
DROP POLICY IF EXISTS "Admins can view all reports" ON public.content_reports;
CREATE POLICY "Admins can view all reports"
  ON public.content_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Les admins/reviewers peuvent mettre à jour les signalements
DROP POLICY IF EXISTS "Admins can update reports" ON public.content_reports;
CREATE POLICY "Admins can update reports"
  ON public.content_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Les utilisateurs authentifiés peuvent créer des signalements
DROP POLICY IF EXISTS "Users can create reports" ON public.content_reports;
CREATE POLICY "Users can create reports"
  ON public.content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Les utilisateurs peuvent voir leurs propres signalements
DROP POLICY IF EXISTS "Users can view own reports" ON public.content_reports;
CREATE POLICY "Users can view own reports"
  ON public.content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS content_reports_updated_at ON public.content_reports;
CREATE TRIGGER content_reports_updated_at
  BEFORE UPDATE ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_content_type ON public.content_reports(content_type);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON public.content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON public.content_reports(created_at DESC);


-- ================================================================
-- 3️⃣ Table: feature_flags (flags de fonctionnalités)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  target_tiers TEXT[] DEFAULT NULL,  -- NULL = all tiers; ['junior','teen','adult']
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Lecture publique (tous les flags sont lisibles pour conditionner le frontend)
DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Seuls les admins peuvent insérer
DROP POLICY IF EXISTS "Admins can insert feature flags" ON public.feature_flags;
CREATE POLICY "Admins can insert feature flags"
  ON public.feature_flags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
        AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Seuls les admins peuvent modifier
DROP POLICY IF EXISTS "Admins can update feature flags" ON public.feature_flags;
CREATE POLICY "Admins can update feature flags"
  ON public.feature_flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
        AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Seuls les super_admin peuvent supprimer
DROP POLICY IF EXISTS "Super admins can delete feature flags" ON public.feature_flags;
CREATE POLICY "Super admins can delete feature flags"
  ON public.feature_flags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
        AND admin_profiles.role = 'super_admin'
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ================================================================
-- 4️⃣ Données initiales feature flags
-- ================================================================
INSERT INTO public.feature_flags (name, description, is_enabled, target_tiers) VALUES
  ('store_enabled', 'Active le Store de modules', true, NULL),
  ('imucoin_enabled', 'Active le système ImuCoin', true, NULL),
  ('communities_enabled', 'Active les communautés/serveurs', true, NULL),
  ('gamification_enabled', 'Active le système de gamification (XP, badges)', true, NULL),
  ('video_calls_enabled', 'Active les appels vidéo', true, '{"teen","adult"}'),
  ('voice_messages_enabled', 'Active les messages vocaux', true, NULL),
  ('dark_mode_enabled', 'Active le thème sombre', true, NULL),
  ('developer_portal_enabled', 'Active le portail développeur', false, NULL),
  ('ai_companion_enabled', 'Active l''ImuCompanion AI', false, NULL),
  ('live2d_avatar_enabled', 'Active les avatars Live2D', false, NULL)
ON CONFLICT (name) DO NOTHING;


-- ================================================================
-- 5️⃣ Permissions admin étendues sur admin_profiles
-- ================================================================

-- Les admins peuvent voir tous les admin_profiles (pas seulement le leur)
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view all admin profiles"
  ON public.admin_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.user_id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- Super admins peuvent modifier tous les profils admin
DROP POLICY IF EXISTS "Super admins can update admin profiles" ON public.admin_profiles;
CREATE POLICY "Super admins can update admin profiles"
  ON public.admin_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.user_id = auth.uid()
        AND ap.role = 'super_admin'
    )
  );


-- ================================================================
-- 6️⃣ RLS: admins peuvent lire/modifier les profiles utilisateurs pour modération
-- ================================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update profiles for moderation" ON public.profiles;
CREATE POLICY "Admins can update profiles for moderation"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
        AND admin_profiles.role IN ('admin', 'super_admin')
    )
  );
