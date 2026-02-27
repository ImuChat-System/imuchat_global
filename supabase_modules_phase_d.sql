-- ================================================================
-- 🧩 ImuChat — Phase D: Ouverture aux développeurs tiers
-- Date: 28 février 2026
-- Ce fichier ajoute :
--   1. Nouvelles colonnes sur `modules` (developer_id, review, etc.)
--   2. Table `admin_profiles` (reviewers / admins) — créée en premier car référencée par les policies suivantes
--   3. Table `developer_profiles` (comptes développeurs)
--   4. Table `module_versions` (historique des versions)
--   5. Storage bucket `modules` (bundles mini-apps)
--   6. Triggers & Functions
--   7. Data migration
-- IDEMPOTENT : safe to re-run.
-- Prérequis : supabase_modules.sql / supabase_modules_phase_b.sql
-- ================================================================


-- ================================================================
-- 1️⃣ Nouvelles colonnes sur la table modules
-- ================================================================

-- developer_id (lien vers l'utilisateur qui possède le module côté développeur)
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES auth.users(id);

-- Statut de review (pipeline de publication)
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'approved'
    CHECK (review_status IN (
      'draft',
      'pending_auto_review',
      'pending_manual_review',
      'approved',
      'rejected',
      'changes_requested'
    ));

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Métadonnées de publication
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'latest';

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{"sandbox": "iframe"}'::JSONB;

-- Taille du bundle (renomme bundle_size → size si bundle_size existe déjà)
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS size INTEGER DEFAULT 0;

-- Commentaires
COMMENT ON COLUMN public.modules.developer_id IS
  'UUID du développeur propriétaire (auth.users). Null pour les modules core ImuChat.';

COMMENT ON COLUMN public.modules.review_status IS
  'Pipeline de review : draft → pending_auto_review → approved | pending_manual_review → approved / rejected / changes_requested.';

COMMENT ON COLUMN public.modules.storage_path IS
  'Chemin dans Supabase Storage (bucket modules). Ex: miniapps/my-app/1.0.0/';

COMMENT ON COLUMN public.modules.config IS
  'Configuration avancée : sandbox mode, maxStorageSize, allowedDomains, CSP.';

-- Index sur developer_id
CREATE INDEX IF NOT EXISTS idx_modules_developer_id
  ON public.modules(developer_id);

CREATE INDEX IF NOT EXISTS idx_modules_review_status
  ON public.modules(review_status);

-- Politique : les développeurs peuvent voir leurs propres modules non publiés
DROP POLICY IF EXISTS "Developers can view own modules" ON public.modules;
CREATE POLICY "Developers can view own modules"
  ON public.modules FOR SELECT
  USING (
    auth.uid() = developer_id
    OR auth.uid() = publisher_id
    OR is_published = true
  );

-- Politique : les développeurs peuvent mettre à jour leurs propres modules
DROP POLICY IF EXISTS "Developers can update own modules" ON public.modules;
CREATE POLICY "Developers can update own modules"
  ON public.modules FOR UPDATE
  USING (auth.uid() = developer_id OR auth.uid() = publisher_id);


-- ================================================================
-- 2️⃣ Table: admin_profiles (admins & reviewers internes)
-- Créée AVANT developer_profiles et module_versions car leurs
-- politiques RLS font référence à admin_profiles.
-- ================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'reviewer'
    CHECK (role IN ('admin', 'reviewer', 'super_admin')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent voir leur propre profil
DROP POLICY IF EXISTS "Admins can view own profile" ON public.admin_profiles;
CREATE POLICY "Admins can view own profile"
  ON public.admin_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Note : l'insertion d'admin_profiles se fait via la console Supabase (pas d'API publique)


-- ================================================================
-- 3️⃣ Table: developer_profiles (comptes développeurs)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.developer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  organization TEXT,
  website TEXT,
  description TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  api_token_hash TEXT,                         -- SHA-256 du token (on ne stocke pas le token brut)
  api_token_prefix TEXT,                       -- 8 premiers chars du token pour identification
  accepted_terms_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT false,           -- vérifié par l'équipe ImuChat
  total_modules INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur peut voir son propre profil développeur
DROP POLICY IF EXISTS "Users can view own developer profile" ON public.developer_profiles;
CREATE POLICY "Users can view own developer profile"
  ON public.developer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Chaque utilisateur peut créer son propre profil développeur
DROP POLICY IF EXISTS "Users can create own developer profile" ON public.developer_profiles;
CREATE POLICY "Users can create own developer profile"
  ON public.developer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chaque utilisateur peut modifier son propre profil développeur
DROP POLICY IF EXISTS "Users can update own developer profile" ON public.developer_profiles;
CREATE POLICY "Users can update own developer profile"
  ON public.developer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Les admins/reviewers peuvent voir tous les profils développeurs
DROP POLICY IF EXISTS "Admins can view all developer profiles" ON public.developer_profiles;
CREATE POLICY "Admins can view all developer profiles"
  ON public.developer_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'reviewer')
    )
  );

CREATE INDEX IF NOT EXISTS idx_developer_profiles_user_id
  ON public.developer_profiles(user_id);


-- ================================================================
-- 4️⃣ Table: module_versions (historique des versions)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.module_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  version TEXT NOT NULL,
  entry_url TEXT,
  checksum TEXT,
  signature TEXT,
  size INTEGER DEFAULT 0,
  storage_path TEXT,
  tag TEXT DEFAULT 'latest',
  status TEXT DEFAULT 'pending_auto_review'
    CHECK (status IN (
      'pending_auto_review',
      'pending_manual_review',
      'approved',
      'rejected',
      'changes_requested'
    )),
  changelog TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, version)
);

ALTER TABLE public.module_versions ENABLE ROW LEVEL SECURITY;

-- Les développeurs peuvent voir les versions de leurs modules
DROP POLICY IF EXISTS "Developers can view own module versions" ON public.module_versions;
CREATE POLICY "Developers can view own module versions"
  ON public.module_versions FOR SELECT
  USING (
    auth.uid() = submitted_by
    OR EXISTS (
      SELECT 1 FROM public.modules
      WHERE id = module_versions.module_id
      AND (developer_id = auth.uid() OR publisher_id = auth.uid())
    )
  );

-- Les développeurs peuvent insérer des versions pour leurs modules
DROP POLICY IF EXISTS "Developers can insert module versions" ON public.module_versions;
CREATE POLICY "Developers can insert module versions"
  ON public.module_versions FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by
    OR EXISTS (
      SELECT 1 FROM public.modules
      WHERE id = module_versions.module_id
      AND developer_id = auth.uid()
    )
  );

-- Les versions approuvées sont visibles par tous
DROP POLICY IF EXISTS "Approved versions are viewable by everyone" ON public.module_versions;
CREATE POLICY "Approved versions are viewable by everyone"
  ON public.module_versions FOR SELECT
  USING (status = 'approved');

-- Les admins/reviewers peuvent voir et modifier toutes les versions
DROP POLICY IF EXISTS "Admins can manage all module versions" ON public.module_versions;
CREATE POLICY "Admins can manage all module versions"
  ON public.module_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'reviewer')
    )
  );

CREATE INDEX IF NOT EXISTS idx_module_versions_module_id
  ON public.module_versions(module_id);

CREATE INDEX IF NOT EXISTS idx_module_versions_submitted_by
  ON public.module_versions(submitted_by);

CREATE INDEX IF NOT EXISTS idx_module_versions_status
  ON public.module_versions(status);


-- ================================================================
-- 5️⃣ Storage: bucket modules (bundles mini-apps)
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('modules', 'modules', true)
ON CONFLICT (id) DO NOTHING;

-- Tout le monde peut lire les bundles (mini-apps chargées dans les iframes)
DROP POLICY IF EXISTS "Module bundles are publicly readable" ON storage.objects;
CREATE POLICY "Module bundles are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'modules');

-- Les développeurs peuvent uploader dans leur espace
DROP POLICY IF EXISTS "Developers can upload module bundles" ON storage.objects;
CREATE POLICY "Developers can upload module bundles"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'modules'
    AND EXISTS (
      SELECT 1 FROM public.developer_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Les développeurs peuvent mettre à jour leurs bundles
DROP POLICY IF EXISTS "Developers can update module bundles" ON storage.objects;
CREATE POLICY "Developers can update module bundles"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'modules'
    AND EXISTS (
      SELECT 1 FROM public.developer_profiles
      WHERE user_id = auth.uid()
    )
  );


-- ================================================================
-- 6️⃣ Triggers & Functions
-- ================================================================

-- Mettre à jour updated_at de developer_profiles
DROP TRIGGER IF EXISTS trigger_developer_profiles_updated_at ON public.developer_profiles;
CREATE TRIGGER trigger_developer_profiles_updated_at
  BEFORE UPDATE ON public.developer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_modules_updated_at();

-- Mettre à jour updated_at de admin_profiles
DROP TRIGGER IF EXISTS trigger_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trigger_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_modules_updated_at();

-- Fonction : incrémenter le compteur de modules du développeur
CREATE OR REPLACE FUNCTION public.update_developer_module_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand un module est publié (is_published passe à true)
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    UPDATE public.developer_profiles
    SET total_modules = total_modules + 1
    WHERE user_id = NEW.developer_id;
  END IF;

  -- Quand un module est dépublié
  IF NEW.is_published = false AND OLD.is_published = true THEN
    UPDATE public.developer_profiles
    SET total_modules = GREATEST(total_modules - 1, 0)
    WHERE user_id = NEW.developer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_developer_module_count ON public.modules;
CREATE TRIGGER trigger_update_developer_module_count
  AFTER UPDATE ON public.modules
  FOR EACH ROW
  WHEN (OLD.is_published IS DISTINCT FROM NEW.is_published)
  EXECUTE FUNCTION public.update_developer_module_count();

-- Fonction : incrémenter les downloads du développeur
CREATE OR REPLACE FUNCTION public.update_developer_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.download_count > OLD.download_count THEN
    UPDATE public.developer_profiles
    SET total_downloads = total_downloads + (NEW.download_count - OLD.download_count)
    WHERE user_id = NEW.developer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_developer_download_count ON public.modules;
CREATE TRIGGER trigger_update_developer_download_count
  AFTER UPDATE ON public.modules
  FOR EACH ROW
  WHEN (OLD.download_count IS DISTINCT FROM NEW.download_count)
  EXECUTE FUNCTION public.update_developer_download_count();


-- ================================================================
-- 7️⃣ Migration des données existantes
-- ================================================================

-- Pour les modules existants qui ont publisher_id mais pas developer_id,
-- on copie publisher_id vers developer_id
UPDATE public.modules
SET developer_id = publisher_id
WHERE developer_id IS NULL AND publisher_id IS NOT NULL;

-- Assurer que tous les modules core existants sont marqués 'approved'
UPDATE public.modules
SET review_status = 'approved'
WHERE is_core = true AND review_status IS NULL;


-- ================================================================
-- ✅ Phase D Schema Complete
--
-- Nouvelles tables :
--   • developer_profiles  — comptes développeurs avec API token
--   • module_versions     — historique des versions
--   • admin_profiles      — admins et reviewers
--
-- Nouvelles colonnes sur modules :
--   • developer_id, review_status, review_notes
--   • reviewed_at, reviewed_by, tag, storage_path
--   • submitted_at, config, size
--
-- Nouveau bucket Storage :
--   • modules (public, pour les bundles mini-apps)
--
-- Prochaines étapes :
--   1. Créer un admin_profile pour le super-admin initial
--   2. Tester le flow publish via CLI ou API
--   3. Connecter le Developer Portal UI
-- ================================================================
