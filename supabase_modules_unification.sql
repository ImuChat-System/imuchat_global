-- ================================================================
-- 🔗 ImuChat — Unification des registres + pré-installation auto
-- Date: 27 février 2026
-- Ce fichier :
--   1. Ajoute default_enabled + is_core à la table modules
--   2. Insère les 14 modules core dans le catalogue
--   3. Met à jour default_enabled/is_core pour les modules existants
--   4. Crée la fonction auto_install_default_modules()
--   5. Crée le trigger sur profiles INSERT
-- IDEMPOTENT : safe to re-run.
-- Prérequis : tables modulescréées par supabase_modules_phase_b.sql
-- ================================================================

-- ================================================================
-- 1️⃣ Schema: ajouter les colonnes default_enabled et is_core
-- ================================================================
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS default_enabled BOOLEAN DEFAULT false;

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.modules.default_enabled IS
  'Si true, ce module est automatiquement installé pour les nouveaux utilisateurs.';

COMMENT ON COLUMN public.modules.is_core IS
  'Si true, ce module fait partie du core et s''exécute nativement (pas en iframe).';

-- ================================================================
-- 2️⃣ Seed: Les 14 modules core natifs
--    entry_url = ''native'' car ils s''exécutent dans l''app mère
-- ================================================================

-- ─── Chat (core) ──────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'chat', 'Chat', '1.0.0',
  'Messagerie instantanée — Conversations privées et de groupe.',
  'core', '💬', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Calls (core) ─────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'calls', 'Appels', '1.0.0',
  'Appels audio et vidéo — Communication en temps réel.',
  'core', '📞', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Comms (core) ─────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'comms', 'Communautés', '1.0.0',
  'Canaux et communautés — Discussions thématiques et groupes publics.',
  'core', '📢', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Hometab (core) ───────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'hometab', 'Accueil', '1.0.0',
  'Page d''accueil — Feed principal et navigation.',
  'core', '🏠', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Store (core) ─────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'store', 'Store', '1.0.0',
  'Boutique d''applications — Découvrez et installez des mini-apps.',
  'core', '🏪', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Wallet (core) ────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'wallet', 'Wallet', '1.0.0',
  'Portefeuille numérique — Gérez vos ImuCoins et transactions.',
  'core', '💰', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Themes (core) ────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'themes', 'Thèmes', '1.0.0',
  'Personnalisation visuelle — Thèmes et apparence de l''application.',
  'core', '🎨', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Profile (core) ───────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'profile', 'Profil', '1.0.0',
  'Profil utilisateur — Identité, avatar et paramètres personnels.',
  'core', '👤', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Notifications (core) ─────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'notifications', 'Notifications', '1.0.0',
  'Système de notifications push et in-app.',
  'core', '🔔', 'ImuChat Team', 'MIT', 'native',
  ARRAY['notifications']::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Help (core) ──────────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'help', 'Aide', '1.0.0',
  'Centre d''aide — FAQ, support et assistance utilisateur.',
  'core', '❓', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Customize (core) ─────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'customize', 'Personnalisation', '1.0.0',
  'Personnalisation UI — Layout, widgets et préférences visuelles.',
  'core', '✨', 'ImuChat Team', 'MIT', 'native',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ─── Stories (core) ───────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url,
  permissions, dependencies, bundle_size, sandbox, allowed_domains,
  is_published, is_verified, default_enabled, is_core)
VALUES (
  'stories', 'Stories', '1.0.0',
  'Stories éphémères — Partagez des moments avec vos contacts.',
  'social', '📖', 'ImuChat Team', 'MIT', 'native',
  ARRAY['story:write']::TEXT[], ARRAY['profile']::TEXT[], 0, 'iframe', ARRAY[]::TEXT[],
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 3️⃣ Update: marquer default_enabled et is_core sur modules existants
--    (les ON CONFLICT DO NOTHING ci-dessus ne mettent pas à jour)
-- ================================================================

-- Core modules : default_enabled=true, is_core=true
UPDATE public.modules SET default_enabled = true, is_core = true
WHERE id IN ('chat', 'calls', 'comms', 'hometab', 'store', 'wallet',
             'themes', 'profile', 'notifications', 'help', 'customize', 'stories');

-- Mini-apps defaultEnabled (activées par défaut pour les nouveaux users)
UPDATE public.modules SET default_enabled = true, is_core = false
WHERE id IN ('imu-events', 'imu-music', 'imu-watch');

-- Tous les autres modules extraits : default_enabled=false, is_core=false
UPDATE public.modules SET default_enabled = false, is_core = false
WHERE id NOT IN (
  'chat', 'calls', 'comms', 'hometab', 'store', 'wallet',
  'themes', 'profile', 'notifications', 'help', 'customize', 'stories',
  'imu-events', 'imu-music', 'imu-watch'
) AND (default_enabled IS NULL OR is_core IS NULL);

-- ================================================================
-- 4️⃣ Fonction: auto_install_default_modules(p_user_id)
--    Installe automatiquement tous les modules default_enabled=true
--    qui ne sont PAS is_core (les core s'exécutent nativement).
--    Utilisée par le trigger et appelable manuellement.
-- ================================================================
CREATE OR REPLACE FUNCTION public.auto_install_default_modules(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  installed_count INTEGER := 0;
BEGIN
  INSERT INTO public.user_modules (user_id, module_id, installed_version, is_active, granted_permissions)
  SELECT
    p_user_id,
    m.id,
    m.version,
    true,
    m.permissions
  FROM public.modules m
  WHERE m.default_enabled = true
    AND m.is_core = false
    AND m.is_published = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_modules um
      WHERE um.user_id = p_user_id AND um.module_id = m.id
    );

  GET DIAGNOSTICS installed_count = ROW_COUNT;
  RETURN installed_count;
END;
$$;

COMMENT ON FUNCTION public.auto_install_default_modules(UUID) IS
  'Pré-installe les modules default_enabled pour un utilisateur. Retourne le nombre installé.';

-- ================================================================
-- 5️⃣ Trigger: auto-install sur création de profil
--    Se déclenche AFTER INSERT sur profiles (créé lors du signup).
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.auto_install_default_modules(NEW.id);
  RETURN NEW;
END;
$$;

-- Supprimer le trigger s'il existe déjà (idempotent)
DROP TRIGGER IF EXISTS on_profile_created_install_modules ON public.profiles;

CREATE TRIGGER on_profile_created_install_modules
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_modules();

-- ================================================================
-- 6️⃣ Fonction utilitaire: backfill pour utilisateurs existants
--    À appeler une seule fois pour migrer les users actuels.
--    Usage: SELECT backfill_default_modules_all_users();
-- ================================================================
CREATE OR REPLACE FUNCTION public.backfill_default_modules_all_users()
RETURNS TABLE(user_id UUID, modules_installed INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles
  LOOP
    user_id := r.id;
    modules_installed := public.auto_install_default_modules(r.id);
    IF modules_installed > 0 THEN
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.backfill_default_modules_all_users() IS
  'Installe les modules default_enabled pour TOUS les utilisateurs existants. Idempotent.';

-- ================================================================
-- 7️⃣ Index pour accélérer les requêtes catalogue
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_modules_default_enabled ON public.modules (default_enabled) WHERE default_enabled = true;
CREATE INDEX IF NOT EXISTS idx_modules_is_core ON public.modules (is_core) WHERE is_core = true;
CREATE INDEX IF NOT EXISTS idx_modules_category ON public.modules (category);

-- ================================================================
-- ✅ Résumé de la migration
-- ================================================================
-- • 2 colonnes ajoutées : default_enabled, is_core
-- • 12 modules core insérés (chat, calls, comms, hometab, store,
--   wallet, themes, profile, notifications, help, customize, stories)
-- • 3 mini-apps marquées default_enabled (events, music, watch)
-- • Fonction auto_install_default_modules() créée
-- • Trigger on_profile_created_install_modules activé
-- • Fonction backfill_default_modules_all_users() disponible
-- • 3 index de recherche créés
-- ================================================================
