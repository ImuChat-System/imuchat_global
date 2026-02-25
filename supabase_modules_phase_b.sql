-- ================================================================
-- 🧩 ImuChat — Phase A+B: Module System (tables + catalogue complet)
-- Date: 25 février 2026
-- Ce fichier est AUTONOME : il crée les tables si absentes, puis
-- insère les 14 modules (1 Phase A + 13 Phase B).
-- ================================================================

-- ================================================================
-- 📦 Table: modules (catalogue des mini-apps disponibles)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  icon TEXT,
  author TEXT NOT NULL DEFAULT 'ImuChat Team',
  license TEXT DEFAULT 'MIT',
  entry_url TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  bundle_size INTEGER DEFAULT 0,
  checksum TEXT,
  signature TEXT,
  sandbox TEXT DEFAULT 'iframe' CHECK (sandbox IN ('iframe', 'webcomponent', 'worker')),
  allowed_domains TEXT[] DEFAULT '{}',
  content_security_policy TEXT,
  max_storage_size INTEGER DEFAULT 10485760,
  is_published BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  publisher_id UUID REFERENCES auth.users(id),
  download_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published modules are viewable by everyone" ON public.modules;
CREATE POLICY "Published modules are viewable by everyone"
  ON public.modules FOR SELECT
  USING (is_published = true);

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
  settings JSONB DEFAULT '{}',
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own installed modules" ON public.user_modules;
CREATE POLICY "Users can view own installed modules"
  ON public.user_modules FOR SELECT
  USING (auth.uid() = user_id);

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
-- 🔧 Triggers: updated_at automatique
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
-- 📊 Trigger: Recalculer la note moyenne d'un module
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
-- 🌱 Seed: Phase A — imu-games (pilote)
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
  '/miniapps/imu-games/index.html',
  ARRAY['auth:read', 'auth:profile', 'storage:read', 'storage:write', 'notifications:send', 'theme:read', 'ui:toast', 'ui:modal'],
  ARRAY['profile'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 🌱 Seed: Phase B — 13 modules optionnels
-- ================================================================

-- ─── Voom ─────────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-voom',
  'ImuVoom',
  '1.0.0',
  'Short video platform — Create, share, and discover short-form video content.',
  'video',
  '🎬',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-voom/index.html',
  ARRAY['auth:read', 'theme:read', 'ui:toast', 'storage:read', 'storage:write'],
  ARRAY[]::TEXT[],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Resources ────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-resources',
  'ImuResources',
  '1.0.0',
  'Community resources — Discover anime, manga, games, movies, and guild content.',
  'tools',
  '📚',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-resources/index.html',
  ARRAY['auth:read', 'theme:read', 'ui:toast', 'storage:read'],
  ARRAY['library'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Worlds ───────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-worlds',
  'ImuWorlds',
  '1.0.0',
  'Virtual worlds — Explore, create, and join immersive 3D worlds.',
  'entertainment',
  '🌍',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-worlds/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
  ARRAY['profile'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Contests ─────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-contests',
  'ImuContests',
  '1.0.0',
  'Competitions & contests — Participate, challenge friends, and win prizes.',
  'games',
  '🏆',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-contests/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
  ARRAY['games'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Dating ───────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-dating',
  'ImuDate',
  '1.0.0',
  'Find your match — Discover people nearby, swipe, chat, and connect.',
  'social',
  '💕',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-dating/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'chat:send', 'storage:read', 'storage:write'],
  ARRAY['profile'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Smart Home ───────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-smart-home',
  'ImuHome',
  '1.0.0',
  'Connected home — Control your smart devices, security, and energy usage.',
  'lifestyle',
  '🏠',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-smart-home/index.html',
  ARRAY['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
  ARRAY[]::TEXT[],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Mobility ─────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-mobility',
  'ImuMove',
  '1.0.0',
  'Transport & mobility — Ride-sharing, public transport, EV charging, and more.',
  'lifestyle',
  '🚗',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-mobility/index.html',
  ARRAY['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
  ARRAY['smart-home'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Style & Beauty ──────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-style-beauty',
  'ImuStyle',
  '1.0.0',
  'Fashion & beauty — Virtual try-on, AI stylist, trends, tutorials, and shopping.',
  'lifestyle',
  '💅',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-style-beauty/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
  ARRAY[]::TEXT[],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Sports ───────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-sports',
  'ImuSports',
  '1.0.0',
  'Sports hub — Live scores, news, standings, betting, and watch parties.',
  'entertainment',
  '⚽',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-sports/index.html',
  ARRAY['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write', 'wallet:read'],
  ARRAY[]::TEXT[],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Formations ───────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-formations',
  'ImuLearn',
  '1.0.0',
  'Education platform — Courses, lessons, quizzes, and certificates.',
  'education',
  '🎓',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-formations/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
  ARRAY['library'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Finance ──────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-finance',
  'ImuFinance',
  '1.0.0',
  'Finance & crypto — Banking, investments, group funds, and cryptocurrency.',
  'finance',
  '💰',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-finance/index.html',
  ARRAY['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'wallet:read', 'storage:read', 'storage:write'],
  ARRAY['wallet'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Library ──────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-library',
  'ImuLibrary',
  '1.0.0',
  'Media library — Books, audiobooks, comics, novels, and stories reader.',
  'entertainment',
  '📖',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-library/index.html',
  ARRAY['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
  ARRAY[]::TEXT[],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Services ─────────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-services',
  'ImuServices',
  '1.0.0',
  'Professional services marketplace — Find pros, book appointments, and manage requests.',
  'tools',
  '🔧',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-services/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'chat:send', 'wallet:read', 'storage:read', 'storage:write'],
  ARRAY['profile'],
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 📊 Summary: 14 modules in catalogue (1 Phase A + 13 Phase B)
-- Tables created: modules, user_modules, module_reviews
-- Triggers: updated_at auto-update, rating auto-recalculation
-- This file is IDEMPOTENT — safe to re-run.
-- ================================================================
