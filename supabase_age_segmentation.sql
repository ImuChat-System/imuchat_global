-- ================================================================
-- 🛡️ ImuChat — MVP Phase 2 Sprint 2: Segmentation par âge
-- Date: 3 mars 2026
-- Ce fichier ajoute :
--   1. ENUM age_tier
--   2. Colonnes age sur profiles
--   3. Table parental_consents
--   4. Table feature_flag_matrix (flags par tier)
--   5. Colonne min_age_tier sur modules
--   6. Fonctions SQL : compute_age_tier, auto_install_default_modules (amélioré)
--   7. RLS Policies
-- IDEMPOTENT : safe to re-run.
-- Prérequis : supabase_schema.sql (profiles), supabase_modules.sql (modules)
-- Référence : docs/AGE_SEGMENTATION_ARCHITECTURE.md
-- ================================================================

-- ================================================================
-- 1️⃣ ENUM age_tier
-- ================================================================

DO $$ BEGIN
  CREATE TYPE public.age_tier AS ENUM ('KIDS', 'JUNIOR', 'TEEN', 'ADULT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- 2️⃣ Colonnes age sur profiles
-- ================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_tier public.age_tier DEFAULT 'ADULT';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_verified BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_verified_method TEXT CHECK (age_verified_method IN ('self_declared', 'parent_consent', 'id_verification', 'sms', 'admin'));

-- ================================================================
-- 3️⃣ Table parental_consents
-- ================================================================

CREATE TABLE IF NOT EXISTS public.parental_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  parent_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired', 'revoked')),
  consent_token TEXT UNIQUE, -- Token envoyé par email
  consent_scopes JSONB DEFAULT '{
    "messaging": true,
    "social": false,
    "store_purchases": false,
    "voice_calls": false,
    "video_calls": false,
    "dating": false,
    "finance": false
  }',
  ip_address TEXT,
  user_agent TEXT,
  consented_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parental_consents_child ON public.parental_consents(child_user_id);
CREATE INDEX IF NOT EXISTS idx_parental_consents_parent ON public.parental_consents(parent_email);
CREATE INDEX IF NOT EXISTS idx_parental_consents_token ON public.parental_consents(consent_token);

-- ================================================================
-- 4️⃣ Table feature_flag_matrix — Flags par tier
-- ================================================================

CREATE TABLE IF NOT EXISTS public.feature_flag_matrix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('messaging', 'social', 'store', 'finance', 'dating', 'media', 'community', 'calls', 'settings', 'ai')),
  kids_enabled BOOLEAN NOT NULL DEFAULT false,
  junior_enabled BOOLEAN NOT NULL DEFAULT false,
  teen_enabled BOOLEAN NOT NULL DEFAULT false,
  adult_enabled BOOLEAN NOT NULL DEFAULT true,
  requires_parental_consent BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- 5️⃣ Données seed — Feature Flags par tier
-- ================================================================

INSERT INTO public.feature_flag_matrix (feature_key, display_name, description, category, kids_enabled, junior_enabled, teen_enabled, adult_enabled, requires_parental_consent) VALUES
  -- Messaging
  ('direct_messages', 'Messages directs', 'Envoyer des messages privés', 'messaging', false, true, true, true, true),
  ('group_chat', 'Chat de groupe', 'Participer à des conversations de groupe', 'messaging', false, true, true, true, true),
  ('voice_messages', 'Messages vocaux', 'Envoyer des messages vocaux', 'messaging', false, true, true, true, false),
  ('file_sharing', 'Partage de fichiers', 'Envoyer des fichiers dans le chat', 'messaging', false, false, true, true, false),
  
  -- Social
  ('social_feed', 'Fil social', 'Voir et publier sur le feed social', 'social', false, true, true, true, true),
  ('stories', 'Stories', 'Publier et voir des stories', 'social', false, true, true, true, true),
  ('comments', 'Commentaires', 'Commenter des publications', 'social', false, true, true, true, false),
  ('reactions', 'Réactions', 'Réagir aux messages et posts', 'social', true, true, true, true, false),
  
  -- Store
  ('store_browse', 'Parcourir le Store', 'Voir le catalogue de modules', 'store', true, true, true, true, false),
  ('store_install_free', 'Installer modules gratuits', 'Installer des modules gratuits', 'store', true, true, true, true, false),
  ('store_purchase', 'Acheter des modules', 'Acheter des modules payants', 'store', false, false, true, true, true),
  ('store_review', 'Laisser un avis', 'Noter et commenter des modules', 'store', false, true, true, true, false),
  
  -- Finance
  ('wallet', 'Portefeuille', 'Accéder au wallet ImuCoin', 'finance', false, false, true, true, true),
  ('send_money', 'Envoyer de l''argent', 'Transférer des ImuCoins', 'finance', false, false, false, true, false),
  ('subscriptions', 'Abonnements', 'Gérer des abonnements', 'finance', false, false, false, true, false),
  
  -- Dating
  ('dating', 'ImuDate', 'Accéder au module dating', 'dating', false, false, false, true, false),
  
  -- Media
  ('watch_videos', 'Vidéos', 'Regarder des vidéos', 'media', true, true, true, true, false),
  ('live_streaming', 'Live streaming', 'Regarder et lancer des lives', 'media', false, false, true, true, false),
  ('music_player', 'Musique', 'Écouter de la musique', 'media', true, true, true, true, false),
  ('nsfw_content', 'Contenu NSFW', 'Accéder au contenu 18+', 'media', false, false, false, true, false),
  
  -- Community
  ('join_servers', 'Rejoindre des serveurs', 'Rejoindre des communautés', 'community', false, true, true, true, true),
  ('create_server', 'Créer un serveur', 'Créer sa propre communauté', 'community', false, false, true, true, false),
  
  -- Calls
  ('audio_calls', 'Appels audio', 'Passer des appels audio', 'calls', false, true, true, true, true),
  ('video_calls', 'Appels vidéo', 'Passer des appels vidéo', 'calls', false, true, true, true, true),
  ('screen_share', 'Partage d''écran', 'Partager son écran', 'calls', false, false, true, true, false),
  
  -- Settings
  ('change_username', 'Changer pseudo', 'Modifier son nom d''utilisateur', 'settings', false, true, true, true, false),
  ('delete_account', 'Supprimer le compte', 'Supprimer son compte définitivement', 'settings', false, false, false, true, false),
  
  -- AI
  ('ai_assistant', 'Assistant IA', 'Utiliser Alice IA', 'ai', true, true, true, true, false),
  ('ai_translation', 'Traduction IA', 'Traduction automatique des messages', 'ai', true, true, true, true, false),
  ('ai_moderation', 'Modération IA', 'Auto-modération IA dans serveurs', 'ai', true, true, true, true, false)
ON CONFLICT (feature_key) DO NOTHING;

-- ================================================================
-- 6️⃣ Colonne min_age_tier sur modules
-- ================================================================

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS min_age_tier public.age_tier DEFAULT 'ADULT';

-- Mettre à jour les modules existants avec le tier approprié
-- Modules accessibles à tous (KIDS+)
UPDATE public.modules SET min_age_tier = 'KIDS' WHERE id IN (
  'weather', 'calculator', 'notes', 'music-player', 'podcast-player',
  'formations', 'library', 'stickers'
);

-- Modules JUNIOR+
UPDATE public.modules SET min_age_tier = 'JUNIOR' WHERE id IN (
  'social-hub', 'watch', 'news', 'stories', 'games',
  'themes', 'contacts', 'help'
);

-- Modules TEEN+
UPDATE public.modules SET min_age_tier = 'TEEN' WHERE id IN (
  'store', 'wallet', 'sports', 'mobility', 'events',
  'contests', 'worlds', 'creator-studio', 'smart-home'
);

-- Modules ADULT uniquement
UPDATE public.modules SET min_age_tier = 'ADULT' WHERE id IN (
  'dating', 'finance', 'betting'
);

-- ================================================================
-- 7️⃣ Fonctions SQL
-- ================================================================

-- Calcul du tier basé sur la date de naissance
CREATE OR REPLACE FUNCTION public.compute_age_tier(p_dob DATE)
RETURNS public.age_tier AS $$
DECLARE
  v_age INTEGER;
BEGIN
  v_age := EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_dob));
  
  IF v_age < 7 THEN
    RETURN NULL; -- Trop jeune pour la plateforme
  ELSIF v_age <= 12 THEN
    RETURN 'KIDS'::public.age_tier;
  ELSIF v_age <= 15 THEN
    RETURN 'JUNIOR'::public.age_tier;
  ELSIF v_age <= 17 THEN
    RETURN 'TEEN'::public.age_tier;
  ELSE
    RETURN 'ADULT'::public.age_tier;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger : Mettre à jour age_tier quand date_of_birth change
CREATE OR REPLACE FUNCTION public.update_age_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL AND (OLD.date_of_birth IS NULL OR NEW.date_of_birth != OLD.date_of_birth) THEN
    NEW.age_tier := public.compute_age_tier(NEW.date_of_birth);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_profiles_age_tier') THEN
    CREATE TRIGGER tr_profiles_age_tier
      BEFORE INSERT OR UPDATE OF date_of_birth ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_age_tier();
  END IF;
END $$;

-- Fonction améliorée : auto-install modules filtrés par age_tier
CREATE OR REPLACE FUNCTION public.auto_install_default_modules_with_age()
RETURNS TRIGGER AS $$
DECLARE
  v_module RECORD;
  v_user_tier public.age_tier;
BEGIN
  -- Récupérer le tier de l'utilisateur (défaut ADULT)
  v_user_tier := COALESCE(NEW.age_tier, 'ADULT'::public.age_tier);
  
  -- Installer les modules par défaut compatibles avec le tier
  FOR v_module IN
    SELECT id FROM public.modules
    WHERE is_default = true
    AND review_status = 'approved'
    AND (
      (min_age_tier = 'KIDS') OR
      (min_age_tier = 'JUNIOR' AND v_user_tier IN ('JUNIOR', 'TEEN', 'ADULT')) OR
      (min_age_tier = 'TEEN' AND v_user_tier IN ('TEEN', 'ADULT')) OR
      (min_age_tier = 'ADULT' AND v_user_tier = 'ADULT')
    )
  LOOP
    INSERT INTO public.user_modules (user_id, module_id, is_active)
    VALUES (NEW.id, v_module.id, true)
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 8️⃣ RLS Policies
-- ================================================================

ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag_matrix ENABLE ROW LEVEL SECURITY;

-- parental_consents: parent et enfant peuvent voir
CREATE POLICY "Child can view own consents" ON public.parental_consents FOR SELECT
  USING (auth.uid() = child_user_id);

CREATE POLICY "Parent can view child consents" ON public.parental_consents FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Parent can update consent" ON public.parental_consents FOR UPDATE
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Admins can manage consents" ON public.parental_consents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- feature_flag_matrix: lecture publique
CREATE POLICY "Anyone can read feature flags" ON public.feature_flag_matrix FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage feature flags" ON public.feature_flag_matrix FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- ================================================================
-- ✅ Migration segmentation par âge terminée
-- ================================================================
