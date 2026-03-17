-- ================================================================
-- 🏪 ImuChat — Sprint 22: Store & Services Production-Ready
-- Date: 2026-02-XX
-- Ajouts: user layout settings, store bundles/rewards/products
-- ================================================================

-- ================================================================
-- 👤 Ajout layout_settings JSONB à la table profiles
-- Stocke les préférences d'interface utilisateur (sidebar, panels, etc.)
-- ================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS layout_settings JSONB DEFAULT '{}';

COMMENT ON COLUMN public.profiles.layout_settings IS
  'User layout preferences: sidebar order, panel widths, chat layout, presets, etc.';

-- ================================================================
-- 🎁 Table: store_rewards (récompenses achetables)
-- Remplace MOCK_REWARDS de lib/data/commerce.ts
-- ================================================================
CREATE TABLE IF NOT EXISTS public.store_rewards (
  id TEXT PRIMARY KEY,                          -- ex: "rew-1"
  name_key TEXT NOT NULL,                       -- clé i18n
  description_key TEXT NOT NULL,                -- clé i18n
  type TEXT NOT NULL CHECK (type IN ('stickers', 'theme', 'avatar', 'badge', 'emoji', 'filter', 'sound', 'effect')),
  credit_cost INTEGER NOT NULL DEFAULT 0,
  xp_cost INTEGER NOT NULL DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_sale BOOLEAN DEFAULT false,
  sale_end_date TIMESTAMP WITH TIME ZONE,
  icon_url TEXT,
  preview_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.store_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rewards are viewable by everyone" ON public.store_rewards;
CREATE POLICY "Rewards are viewable by everyone"
  ON public.store_rewards FOR SELECT
  USING (is_published = true);

-- ================================================================
-- 🎁 Table: user_rewards (récompenses possédées par l'utilisateur)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id TEXT REFERENCES public.store_rewards(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'usable' CHECK (status IN ('usable', 'expired', 'consumed')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, reward_id)
);

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rewards" ON public.user_rewards;
CREATE POLICY "Users can view own rewards"
  ON public.user_rewards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own rewards" ON public.user_rewards;
CREATE POLICY "Users can manage own rewards"
  ON public.user_rewards FOR ALL
  USING (auth.uid() = user_id);

-- ================================================================
-- 📦 Table: store_bundles (bundles de modules/récompenses)
-- Remplace MOCK_BUNDLES de lib/data/commerce.ts
-- ================================================================
CREATE TABLE IF NOT EXISTS public.store_bundles (
  id TEXT PRIMARY KEY,                          -- ex: "bundle-1"
  title TEXT NOT NULL,
  description TEXT,
  original_price INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'credits',
  badges TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.store_bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bundles are viewable by everyone" ON public.store_bundles;
CREATE POLICY "Bundles are viewable by everyone"
  ON public.store_bundles FOR SELECT
  USING (is_published = true);

-- ================================================================
-- 🔗 Table: store_bundle_items (items dans un bundle)
-- Polymorphique : peut référencer un module ou une récompense
-- ================================================================
CREATE TABLE IF NOT EXISTS public.store_bundle_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id TEXT REFERENCES public.store_bundles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('module', 'reward')),
  item_id TEXT NOT NULL,                        -- module.id ou store_rewards.id
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.store_bundle_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bundle items are viewable by everyone" ON public.store_bundle_items;
CREATE POLICY "Bundle items are viewable by everyone"
  ON public.store_bundle_items FOR SELECT
  USING (true);

-- ================================================================
-- 💄 Table: store_products (produits partenaires ex: beauté)
-- Remplace MOCK_BEAUTY_PRODUCTS de lib/data/misc.ts
-- ================================================================
CREATE TABLE IF NOT EXISTS public.store_products (
  id TEXT PRIMARY KEY,                          -- ex: "beauty-1"
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,                       -- ex: "Skincare", "Makeup"
  price INTEGER NOT NULL,
  rating NUMERIC(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',                     -- ex: skin types, keywords
  partner_id UUID REFERENCES auth.users(id),   -- partenaire qui vend
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.store_products;
CREATE POLICY "Products are viewable by everyone"
  ON public.store_products FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Partners can manage own products" ON public.store_products;
CREATE POLICY "Partners can manage own products"
  ON public.store_products FOR ALL
  USING (auth.uid() = partner_id);

-- ================================================================
-- 🔖 Table: user_favorites (produits favoris / liked)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.store_products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own favorites" ON public.user_favorites;
CREATE POLICY "Users can manage own favorites"
  ON public.user_favorites FOR ALL
  USING (auth.uid() = user_id);

-- ================================================================
-- 📊 Index pour les performances
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_store_products_category ON public.store_products(category);
CREATE INDEX IF NOT EXISTS idx_store_products_brand ON public.store_products(brand);
CREATE INDEX IF NOT EXISTS idx_store_rewards_type ON public.store_rewards(type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_store_bundle_items_bundle ON public.store_bundle_items(bundle_id);
