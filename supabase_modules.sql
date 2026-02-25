-- ================================================================
-- 🧩 ImuChat — Module System Tables
-- Date: 25 février 2026
-- Phase A : Support mini-apps dynamiques
-- ================================================================

-- ================================================================
-- 📦 Table: modules (catalogue des mini-apps disponibles)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,                          -- ex: "imu-games"
  name TEXT NOT NULL,                           -- ex: "ImuChat Games"
  version TEXT NOT NULL DEFAULT '1.0.0',
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  icon TEXT,                                    -- emoji ou URL
  author TEXT NOT NULL DEFAULT 'ImuChat Team',
  license TEXT DEFAULT 'MIT',
  entry_url TEXT NOT NULL,                      -- URL du bundle (CDN / Supabase Storage)
  permissions TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  bundle_size INTEGER DEFAULT 0,               -- taille en bytes
  checksum TEXT,                               -- SHA-256
  signature TEXT,                              -- RSA
  sandbox TEXT DEFAULT 'iframe' CHECK (sandbox IN ('iframe', 'webcomponent', 'worker')),
  allowed_domains TEXT[] DEFAULT '{}',
  content_security_policy TEXT,
  max_storage_size INTEGER DEFAULT 10485760,   -- 10MB par défaut
  is_published BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,           -- review passée
  publisher_id UUID REFERENCES auth.users(id),
  download_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les modules publiés
DROP POLICY IF EXISTS "Published modules are viewable by everyone" ON public.modules;
CREATE POLICY "Published modules are viewable by everyone"
  ON public.modules FOR SELECT
  USING (is_published = true);

-- Les auteurs peuvent gérer leurs modules
DROP POLICY IF EXISTS "Authors can manage their modules" ON public.modules;
CREATE POLICY "Authors can manage their modules"
  ON public.modules FOR ALL
  USING (auth.uid() = publisher_id);

-- ================================================================
-- 🔗 Table: user_modules (modules installés par utilisateur)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  installed_version TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  granted_permissions TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',                 -- paramètres utilisateur pour ce module
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur voit ses propres modules
DROP POLICY IF EXISTS "Users can view own installed modules" ON public.user_modules;
CREATE POLICY "Users can view own installed modules"
  ON public.user_modules FOR SELECT
  USING (auth.uid() = user_id);

-- Chaque utilisateur peut installer / modifier / désinstaller ses modules
DROP POLICY IF EXISTS "Users can manage own modules" ON public.user_modules;
CREATE POLICY "Users can manage own modules"
  ON public.user_modules FOR ALL
  USING (auth.uid() = user_id);

-- ================================================================
-- 📊 Table: module_reviews (avis utilisateurs)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.module_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, user_id)
);

ALTER TABLE public.module_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.module_reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.module_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their reviews" ON public.module_reviews;
CREATE POLICY "Users can manage their reviews"
  ON public.module_reviews FOR ALL
  USING (auth.uid() = user_id);

-- ================================================================
-- 🔄 Index pour la performance
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_modules_category ON public.modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_published ON public.modules(is_published);
CREATE INDEX IF NOT EXISTS idx_user_modules_user ON public.user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_module ON public.user_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_module ON public.module_reviews(module_id);

-- ================================================================
-- 🔧 Fonction: Mettre à jour updated_at automatiquement
-- ================================================================
CREATE OR REPLACE FUNCTION update_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_modules_updated_at ON public.modules;
CREATE TRIGGER trigger_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION update_modules_updated_at();

DROP TRIGGER IF EXISTS trigger_user_modules_updated_at ON public.user_modules;
CREATE TRIGGER trigger_user_modules_updated_at
  BEFORE UPDATE ON public.user_modules
  FOR EACH ROW EXECUTE FUNCTION update_modules_updated_at();

-- ================================================================
-- 📊 Fonction: Recalculer la note moyenne d'un module
-- ================================================================
CREATE OR REPLACE FUNCTION update_module_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.modules
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.module_reviews
    WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
  )
  WHERE id = COALESCE(NEW.module_id, OLD.module_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_module_rating ON public.module_reviews;
CREATE TRIGGER trigger_update_module_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.module_reviews
  FOR EACH ROW EXECUTE FUNCTION update_module_rating();

-- ================================================================
-- 🌱 Seed: Insérer imu-games comme mini-app pilote
-- ================================================================
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-games',
  'ImuChat Games',
  '1.0.0',
  'Discover and play games with your friends and communities on ImuChat.',
  'games',
  '🎮',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-games/index.html',  -- chemin relatif sur CDN / Supabase Storage
  ARRAY['auth:read', 'auth:profile', 'storage:read', 'storage:write', 'notifications:send', 'theme:read', 'ui:toast', 'ui:modal'],
  ARRAY['profile'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;
