-- ================================================================
-- 🎮 ImuChat — MVP Phase 2 Sprint 3: Gamification
-- Date: 3 mars 2026
-- Ce fichier ajoute :
--   1. Table `user_xp` (XP & niveaux)
--   2. Table `badges` (définitions badges)
--   3. Table `user_badges` (badges obtenus)
--   4. Table `missions` (missions quotidiennes/hebdo)
--   5. Table `user_missions` (progression missions)
--   6. Fonctions SQL : grant_xp, check_and_award_badges
--   7. Triggers XP automatiques
--   8. RLS Policies
-- IDEMPOTENT : safe to re-run.
-- Prérequis : supabase_schema.sql (profiles)
-- ================================================================

-- ================================================================
-- 1️⃣ Table user_xp — XP & Niveaux
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp_this_week INTEGER NOT NULL DEFAULT 0 CHECK (xp_this_week >= 0),
  xp_this_month INTEGER NOT NULL DEFAULT 0 CHECK (xp_this_month >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  last_daily_reset TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- 2️⃣ Table badges — Définitions des badges
-- ================================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT CHECK (category IN ('social', 'chat', 'store', 'community', 'achievement', 'special', 'seasonal')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  xp_required INTEGER DEFAULT 0 CHECK (xp_required >= 0),
  xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
  condition_type TEXT CHECK (condition_type IN ('xp_threshold', 'action_count', 'streak', 'level', 'manual', 'seasonal')),
  condition_value JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- 3️⃣ Table user_badges — Badges obtenus par les utilisateurs
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  is_featured BOOLEAN NOT NULL DEFAULT false, -- Badge affiché sur le profil
  PRIMARY KEY (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_awarded ON public.user_badges(awarded_at DESC);

-- ================================================================
-- 4️⃣ Table missions — Missions quotidiennes/hebdomadaires
-- ================================================================

CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎯',
  xp_reward INTEGER NOT NULL DEFAULT 10 CHECK (xp_reward > 0),
  imucoin_reward INTEGER NOT NULL DEFAULT 0 CHECK (imucoin_reward >= 0),
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'one_time', 'seasonal', 'achievement')),
  condition JSONB NOT NULL, -- ex: {"action": "send_message", "count": 5}
  category TEXT CHECK (category IN ('social', 'chat', 'store', 'community', 'content', 'engagement')),
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_missions_type ON public.missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_active ON public.missions(is_active) WHERE is_active = true;

-- ================================================================
-- 5️⃣ Table user_missions — Progression des missions
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  target INTEGER NOT NULL CHECK (target > 0),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_missions_user ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_active ON public.user_missions(user_id, completed) WHERE completed = false;

-- ================================================================
-- 6️⃣ Table xp_history — Historique des gains/pertes XP
-- ================================================================

CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positif = gain, négatif = perte
  reason TEXT NOT NULL CHECK (reason IN (
    'message_sent', 'post_created', 'reaction_received', 'reaction_given',
    'mission_completed', 'module_installed', 'module_published',
    'server_created', 'friend_invited', 'badge_earned',
    'daily_login', 'streak_bonus', 'admin_grant', 'admin_deduct',
    'level_up_bonus', 'weekly_reset'
  )),
  reference_id TEXT, -- ID de l'objet associé (post_id, mission_id, etc.)
  new_total INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user ON public.xp_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_history_reason ON public.xp_history(reason);

-- ================================================================
-- 7️⃣ Fonctions SQL
-- ================================================================

-- Calcul du niveau basé sur l'XP total (courbe: 100 * level^1.5)
CREATE OR REPLACE FUNCTION public.compute_level(p_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
BEGIN
  WHILE (100 * POWER(v_level, 1.5))::INTEGER <= p_xp LOOP
    v_level := v_level + 1;
  END LOOP;
  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction : Accorder de l'XP à un utilisateur
CREATE OR REPLACE FUNCTION public.grant_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
) RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_total INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Créer l'entrée user_xp si elle n'existe pas
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Récupérer l'ancien niveau
  SELECT level INTO v_old_level FROM public.user_xp WHERE user_id = p_user_id;
  
  -- Mettre à jour l'XP
  UPDATE public.user_xp
  SET total_xp = total_xp + p_amount,
      xp_this_week = xp_this_week + p_amount,
      xp_this_month = xp_this_month + p_amount,
      last_activity_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING total_xp INTO v_new_total;
  
  -- Calculer le nouveau niveau
  v_new_level := public.compute_level(v_new_total);
  
  -- Mettre à jour le niveau
  UPDATE public.user_xp SET level = v_new_level WHERE user_id = p_user_id;
  
  -- Enregistrer dans l'historique
  INSERT INTO public.xp_history (user_id, amount, reason, reference_id, new_total, new_level)
  VALUES (p_user_id, p_amount, p_reason, p_reference_id, v_new_total, v_new_level);
  
  new_total_xp := v_new_total;
  new_level := v_new_level;
  level_up := v_new_level > v_old_level;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction : Vérifier et attribuer les badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_id TEXT, badge_name TEXT) AS $$
DECLARE
  v_badge RECORD;
  v_user_xp RECORD;
  v_qualifies BOOLEAN;
BEGIN
  -- Récupérer les stats XP de l'utilisateur
  SELECT * INTO v_user_xp FROM public.user_xp WHERE user_id = p_user_id;
  
  IF v_user_xp IS NULL THEN
    RETURN;
  END IF;
  
  -- Parcourir les badges actifs non obtenus
  FOR v_badge IN
    SELECT b.* FROM public.badges b
    WHERE b.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_badges ub 
      WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
    )
  LOOP
    v_qualifies := false;
    
    CASE v_badge.condition_type
      WHEN 'xp_threshold' THEN
        v_qualifies := v_user_xp.total_xp >= v_badge.xp_required;
      WHEN 'level' THEN
        v_qualifies := v_user_xp.level >= (v_badge.condition_value->>'min_level')::INTEGER;
      WHEN 'streak' THEN
        v_qualifies := v_user_xp.streak_days >= (v_badge.condition_value->>'min_streak')::INTEGER;
      ELSE
        v_qualifies := false; -- manual, seasonal, action_count handled elsewhere
    END CASE;
    
    IF v_qualifies THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
      
      -- Accorder l'XP bonus du badge
      IF v_badge.xp_reward > 0 THEN
        PERFORM public.grant_xp(p_user_id, v_badge.xp_reward, 'badge_earned', v_badge.id);
      END IF;
      
      badge_id := v_badge.id;
      badge_name := v_badge.name;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 8️⃣ Données seed — Badges par défaut
-- ================================================================

INSERT INTO public.badges (id, name, description, icon_url, category, rarity, xp_required, xp_reward, condition_type, condition_value, sort_order) VALUES
  ('newcomer', 'Nouveau venu', 'Bienvenue sur ImuChat !', '/badges/newcomer.svg', 'achievement', 'common', 0, 10, 'manual', '{}', 1),
  ('first_message', 'Premier message', 'Envoyer votre premier message', '/badges/first-message.svg', 'chat', 'common', 0, 5, 'action_count', '{"action": "send_message", "count": 1}', 2),
  ('social_butterfly', 'Papillon social', 'Envoyer 100 messages', '/badges/social-butterfly.svg', 'chat', 'uncommon', 0, 20, 'action_count', '{"action": "send_message", "count": 100}', 3),
  ('xp_100', 'Apprenti', 'Atteindre 100 XP', '/badges/xp-100.svg', 'achievement', 'common', 100, 10, 'xp_threshold', '{}', 10),
  ('xp_500', 'Aventurier', 'Atteindre 500 XP', '/badges/xp-500.svg', 'achievement', 'uncommon', 500, 25, 'xp_threshold', '{}', 11),
  ('xp_1000', 'Héros', 'Atteindre 1000 XP', '/badges/xp-1000.svg', 'achievement', 'rare', 1000, 50, 'xp_threshold', '{}', 12),
  ('xp_5000', 'Légende', 'Atteindre 5000 XP', '/badges/xp-5000.svg', 'achievement', 'epic', 5000, 100, 'xp_threshold', '{}', 13),
  ('xp_10000', 'Mythique', 'Atteindre 10000 XP', '/badges/xp-10000.svg', 'achievement', 'legendary', 10000, 200, 'xp_threshold', '{}', 14),
  ('level_5', 'Niveau 5', 'Atteindre le niveau 5', '/badges/level-5.svg', 'achievement', 'common', 0, 15, 'level', '{"min_level": 5}', 20),
  ('level_10', 'Niveau 10', 'Atteindre le niveau 10', '/badges/level-10.svg', 'achievement', 'uncommon', 0, 30, 'level', '{"min_level": 10}', 21),
  ('level_25', 'Niveau 25', 'Atteindre le niveau 25', '/badges/level-25.svg', 'achievement', 'rare', 0, 75, 'level', '{"min_level": 25}', 22),
  ('streak_7', 'Semaine parfaite', '7 jours consécutifs', '/badges/streak-7.svg', 'achievement', 'uncommon', 0, 25, 'streak', '{"min_streak": 7}', 30),
  ('streak_30', 'Mois parfait', '30 jours consécutifs', '/badges/streak-30.svg', 'achievement', 'rare', 0, 75, 'streak', '{"min_streak": 30}', 31),
  ('streak_100', 'Centurion', '100 jours consécutifs', '/badges/streak-100.svg', 'achievement', 'epic', 0, 200, 'streak', '{"min_streak": 100}', 32),
  ('first_post', 'Auteur', 'Publier votre premier post', '/badges/first-post.svg', 'social', 'common', 0, 10, 'action_count', '{"action": "create_post", "count": 1}', 40),
  ('first_module', 'Explorateur', 'Installer votre premier module', '/badges/first-module.svg', 'store', 'common', 0, 20, 'action_count', '{"action": "install_module", "count": 1}', 50),
  ('server_creator', 'Bâtisseur', 'Créer votre premier serveur', '/badges/server-creator.svg', 'community', 'uncommon', 0, 30, 'action_count', '{"action": "create_server", "count": 1}', 60),
  ('dev_first_publish', 'Développeur', 'Publier votre premier module', '/badges/dev-publish.svg', 'store', 'rare', 0, 100, 'action_count', '{"action": "publish_module", "count": 1}', 70)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 9️⃣ Données seed — Missions par défaut
-- ================================================================

INSERT INTO public.missions (title, description, icon, xp_reward, imucoin_reward, mission_type, condition, category, difficulty, sort_order) VALUES
  ('Premier message du jour', 'Envoyez un message dans un chat', '💬', 5, 1, 'daily', '{"action": "send_message", "count": 1}', 'chat', 'easy', 1),
  ('Lecteur assidu', 'Lisez 10 messages', '📖', 5, 0, 'daily', '{"action": "read_messages", "count": 10}', 'chat', 'easy', 2),
  ('Social star', 'Réagissez à 3 messages', '⭐', 10, 2, 'daily', '{"action": "add_reaction", "count": 3}', 'social', 'easy', 3),
  ('Créateur du jour', 'Créez un post', '✍️', 15, 3, 'daily', '{"action": "create_post", "count": 1}', 'content', 'medium', 4),
  ('Explorateur', 'Parcourez 5 modules du Store', '🔍', 10, 1, 'daily', '{"action": "view_module", "count": 5}', 'store', 'easy', 5),
  ('Bavard de la semaine', 'Envoyez 50 messages cette semaine', '🗣️', 30, 10, 'weekly', '{"action": "send_message", "count": 50}', 'chat', 'medium', 10),
  ('Connecteur social', 'Ajoutez 3 amis cette semaine', '🤝', 40, 15, 'weekly', '{"action": "add_friend", "count": 3}', 'social', 'medium', 11),
  ('Découvreur', 'Installez 2 nouveaux modules cette semaine', '📦', 50, 20, 'weekly', '{"action": "install_module", "count": 2}', 'store', 'hard', 12),
  ('Premier pas', 'Complétez votre profil à 100%', '🎯', 50, 25, 'one_time', '{"action": "complete_profile", "count": 1}', 'engagement', 'medium', 100),
  ('Inviteur', 'Invitez 5 amis à rejoindre ImuChat', '📨', 100, 50, 'one_time', '{"action": "invite_friend", "count": 5}', 'social', 'hard', 101)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 🔟 RLS Policies
-- ================================================================

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- user_xp: public read, self update
CREATE POLICY "Anyone can view user XP" ON public.user_xp FOR SELECT USING (true);
CREATE POLICY "Users can view own XP details" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);

-- badges: public read
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- user_badges: public read
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);

-- missions: public read active
CREATE POLICY "Anyone can view active missions" ON public.missions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage missions" ON public.missions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- user_missions: own only
CREATE POLICY "Users can view own missions" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own mission progress" ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);

-- xp_history: own only
CREATE POLICY "Users can view own XP history" ON public.xp_history FOR SELECT USING (auth.uid() = user_id);

-- ================================================================
-- ✅ Migration gamification terminée
-- ================================================================
