-- ================================================================
-- 💰 ImuChat — MVP Phase 2 Sprint 1: Store Monétisation
-- Date: 3 mars 2026
-- Ce fichier ajoute :
--   1. Table `store_transactions` (achats modules)
--   2. Table `developer_payouts` (versements développeurs)
--   3. Table `revenue_share_config` (configuration commission)
--   4. Table `imucoin_wallets` (portefeuilles ImuCoin)
--   5. Table `imucoin_transactions` (historique ImuCoin)
--   6. Fonctions SQL : transfer_imucoins, calculate_revenue_share
--   7. Triggers & RLS policies
-- IDEMPOTENT : safe to re-run.
-- Prérequis : supabase_modules_phase_d.sql (developer_profiles, modules)
-- ================================================================

-- ================================================================
-- 1️⃣ Table store_transactions — Historique des achats modules
-- ================================================================

CREATE TABLE IF NOT EXISTS public.store_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES public.developer_profiles(user_id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  platform_fee_cents INTEGER NOT NULL CHECK (platform_fee_cents >= 0),
  developer_payout_cents INTEGER NOT NULL CHECK (developer_payout_cents >= 0),
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'imucoin', 'apple_iap', 'google_play')),
  payment_provider_tx_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  refund_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_store_transactions_buyer ON public.store_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_developer ON public.store_transactions(developer_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_module ON public.store_transactions(module_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_status ON public.store_transactions(status);
CREATE INDEX IF NOT EXISTS idx_store_transactions_created ON public.store_transactions(created_at DESC);

-- ================================================================
-- 2️⃣ Table developer_payouts — Versements aux développeurs
-- ================================================================

CREATE TABLE IF NOT EXISTS public.developer_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL REFERENCES public.developer_profiles(user_id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  payout_method TEXT CHECK (payout_method IN ('bank_transfer', 'paypal', 'stripe_connect', 'imucoin')),
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  failure_reason TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_developer_payouts_developer ON public.developer_payouts(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_payouts_status ON public.developer_payouts(status);
CREATE INDEX IF NOT EXISTS idx_developer_payouts_period ON public.developer_payouts(period_start, period_end);

-- ================================================================
-- 3️⃣ Table revenue_share_config — Configuration commission
-- ================================================================

CREATE TABLE IF NOT EXISTS public.revenue_share_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  platform_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 30.00 CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),
  developer_share_percent NUMERIC(5,2) NOT NULL DEFAULT 70.00 CHECK (developer_share_percent >= 0 AND developer_share_percent <= 100),
  min_payout_cents INTEGER NOT NULL DEFAULT 5000, -- 50€ minimum
  payout_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (payout_cycle IN ('weekly', 'biweekly', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  applies_to TEXT CHECK (applies_to IN ('all', 'premium', 'freemium', 'subscription')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT revenue_share_total CHECK (platform_fee_percent + developer_share_percent = 100)
);

-- Insert default config
INSERT INTO public.revenue_share_config (name, platform_fee_percent, developer_share_percent, applies_to)
VALUES ('default', 30.00, 70.00, 'all')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 4️⃣ Table imucoin_wallets — Portefeuilles ImuCoin
-- ================================================================

CREATE TABLE IF NOT EXISTS public.imucoin_wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- 5️⃣ Table imucoin_transactions — Historique ImuCoin
-- ================================================================

CREATE TABLE IF NOT EXISTS public.imucoin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'purchase',       -- Achat ImuCoins (€ → ImuCoin)
    'module_buy',     -- Achat module avec ImuCoins
    'transfer',       -- Transfert entre utilisateurs
    'reward',         -- Récompense (mission, badge, etc.)
    'refund',         -- Remboursement
    'admin_grant',    -- Crédité par admin
    'subscription'    -- Paiement abonnement
  )),
  reference_id TEXT,  -- ID transaction store, mission, etc.
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_imucoin_tx_from ON public.imucoin_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_imucoin_tx_to ON public.imucoin_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_imucoin_tx_type ON public.imucoin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_imucoin_tx_created ON public.imucoin_transactions(created_at DESC);

-- ================================================================
-- 6️⃣ Fonctions SQL
-- ================================================================

-- Fonction : Transférer des ImuCoins entre utilisateurs
CREATE OR REPLACE FUNCTION public.transfer_imucoins(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'transfer',
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_tx_id UUID;
  v_balance INTEGER;
BEGIN
  -- Vérifier le solde
  SELECT balance INTO v_balance FROM public.imucoin_wallets WHERE user_id = p_from_user_id FOR UPDATE;
  
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_from_user_id;
  END IF;
  
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: % < %', v_balance, p_amount;
  END IF;
  
  -- Vérifier que le wallet destination existe
  IF NOT EXISTS (SELECT 1 FROM public.imucoin_wallets WHERE user_id = p_to_user_id) THEN
    INSERT INTO public.imucoin_wallets (user_id, balance) VALUES (p_to_user_id, 0);
  END IF;
  
  -- Débiter l'expéditeur
  UPDATE public.imucoin_wallets
  SET balance = balance - p_amount,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE user_id = p_from_user_id;
  
  -- Créditer le destinataire
  UPDATE public.imucoin_wallets
  SET balance = balance + p_amount,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = now()
  WHERE user_id = p_to_user_id;
  
  -- Enregistrer la transaction
  INSERT INTO public.imucoin_transactions (from_user_id, to_user_id, amount, transaction_type, reference_id, description)
  VALUES (p_from_user_id, p_to_user_id, p_amount, p_type, p_reference_id, p_description)
  RETURNING id INTO v_tx_id;
  
  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction : Calculer le revenue share pour une transaction
CREATE OR REPLACE FUNCTION public.calculate_revenue_share(
  p_amount_cents INTEGER,
  p_config_name TEXT DEFAULT 'default'
) RETURNS TABLE(platform_fee_cents INTEGER, developer_payout_cents INTEGER) AS $$
DECLARE
  v_platform_pct NUMERIC;
BEGIN
  SELECT platform_fee_percent INTO v_platform_pct 
  FROM public.revenue_share_config 
  WHERE name = p_config_name AND is_active = true;
  
  IF v_platform_pct IS NULL THEN
    v_platform_pct := 30.00; -- fallback
  END IF;
  
  platform_fee_cents := ROUND(p_amount_cents * v_platform_pct / 100);
  developer_payout_cents := p_amount_cents - platform_fee_cents;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction : Créditer des ImuCoins (reward, admin_grant)
CREATE OR REPLACE FUNCTION public.credit_imucoins(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'reward',
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_tx_id UUID;
BEGIN
  -- Créer le wallet si nécessaire
  INSERT INTO public.imucoin_wallets (user_id, balance, lifetime_earned)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = imucoin_wallets.balance + p_amount,
    lifetime_earned = imucoin_wallets.lifetime_earned + p_amount,
    updated_at = now();
  
  -- Enregistrer la transaction
  INSERT INTO public.imucoin_transactions (to_user_id, amount, transaction_type, reference_id, description)
  VALUES (p_user_id, p_amount, p_type, p_reference_id, p_description)
  RETURNING id INTO v_tx_id;
  
  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7️⃣ Trigger updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_store_transactions_updated_at') THEN
    CREATE TRIGGER tr_store_transactions_updated_at
      BEFORE UPDATE ON public.store_transactions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_developer_payouts_updated_at') THEN
    CREATE TRIGGER tr_developer_payouts_updated_at
      BEFORE UPDATE ON public.developer_payouts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_imucoin_wallets_updated_at') THEN
    CREATE TRIGGER tr_imucoin_wallets_updated_at
      BEFORE UPDATE ON public.imucoin_wallets
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- ================================================================
-- 8️⃣ RLS Policies
-- ================================================================

ALTER TABLE public.store_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_share_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imucoin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imucoin_transactions ENABLE ROW LEVEL SECURITY;

-- store_transactions: buyer can see their own, developer can see their modules' transactions
CREATE POLICY "Buyers can view own transactions"
  ON public.store_transactions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Developers can view their module transactions"
  ON public.store_transactions FOR SELECT
  USING (auth.uid() = developer_id);

CREATE POLICY "Admins can view all transactions"
  ON public.store_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert transactions"
  ON public.store_transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- developer_payouts: developers see their own
CREATE POLICY "Developers can view own payouts"
  ON public.developer_payouts FOR SELECT
  USING (auth.uid() = developer_id);

CREATE POLICY "Admins can manage payouts"
  ON public.developer_payouts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- revenue_share_config: admins only + anyone can read active config
CREATE POLICY "Anyone can read active config"
  ON public.revenue_share_config FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage config"
  ON public.revenue_share_config FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- imucoin_wallets: users see their own
CREATE POLICY "Users can view own wallet"
  ON public.imucoin_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
  ON public.imucoin_wallets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- imucoin_transactions: users see their own (sent or received)
CREATE POLICY "Users can view own imucoin transactions"
  ON public.imucoin_transactions FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Admins can view all imucoin transactions"
  ON public.imucoin_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- ================================================================
-- ✅ Migration terminée
-- ================================================================
