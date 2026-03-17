-- ================================================================
-- Sprint 23 — Themes Store + Wallet History Views
-- ================================================================
-- Tables créées :
--   1. themes           — Catalogue de thèmes UI achetables
--   2. theme_reviews    — Avis sur les thèmes (séparé de module_reviews)
--   3. wallet_transactions — Vue unifiée des transactions wallet
-- ================================================================

-- ================================================================
-- 1️⃣ Table themes — Catalogue de thèmes
-- ================================================================

CREATE TABLE IF NOT EXISTS public.themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Unknown',
  preview_url TEXT,
  style TEXT NOT NULL CHECK (style IN ('minimalist', 'cyberpunk', 'fantasy', 'retro', 'nature')),
  tags TEXT[] DEFAULT '{}',
  price INTEGER NOT NULL DEFAULT 0,        -- en crédits (0 = gratuit)
  xp_cost INTEGER NOT NULL DEFAULT 0,      -- coût en XP (0 = pas d'XP requis)
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_sale BOOLEAN DEFAULT false,
  sale_end_date TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "Themes are viewable by everyone" ON public.themes;
CREATE POLICY "Themes are viewable by everyone"
  ON public.themes FOR SELECT
  USING (true);

-- L'auteur peut modifier ses thèmes
DROP POLICY IF EXISTS "Authors can manage their themes" ON public.themes;
CREATE POLICY "Authors can manage their themes"
  ON public.themes FOR ALL
  USING (auth.uid() = author_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_themes_style ON public.themes(style);
CREATE INDEX IF NOT EXISTS idx_themes_featured ON public.themes(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_themes_price ON public.themes(price);
CREATE INDEX IF NOT EXISTS idx_themes_tags ON public.themes USING GIN (tags);

-- ================================================================
-- 2️⃣ Table theme_reviews — Avis sur les thèmes
-- ================================================================

CREATE TABLE IF NOT EXISTS public.theme_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(theme_id, user_id)
);

ALTER TABLE public.theme_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Theme reviews are viewable by everyone" ON public.theme_reviews;
CREATE POLICY "Theme reviews are viewable by everyone"
  ON public.theme_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their theme reviews" ON public.theme_reviews;
CREATE POLICY "Users can manage their theme reviews"
  ON public.theme_reviews FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_theme_reviews_theme ON public.theme_reviews(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_reviews_user ON public.theme_reviews(user_id);

-- ================================================================
-- 3️⃣ Table wallet_transactions — Historique unifié du wallet
-- ================================================================
-- Unifie les différents types de transactions (achats, gains XP,
-- recharges, dons) en une seule vue pour les pages wallet.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Achat', 'Gain XP', 'Recharge', 'Don')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('EUR', 'XP', 'Credits')),
  reference_id UUID,           -- lien vers store_transactions, missions, etc.
  reference_type TEXT,         -- 'store_transaction', 'mission', 'transfer', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their wallet transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert wallet transactions" ON public.wallet_transactions;
CREATE POLICY "System can insert wallet transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON public.wallet_transactions(created_at DESC);
