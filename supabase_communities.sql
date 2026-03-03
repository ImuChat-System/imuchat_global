-- ================================================================
-- 🏰 ImuChat — MVP Phase 2 Sprint 3: Communautés / Serveurs
-- Date: 3 mars 2026
-- Ce fichier ajoute :
--   1. Table `servers` (serveurs communautaires)
--   2. Table `server_roles` (rôles avec permissions JSONB)
--   3. Table `server_members` (membres avec rôle)
--   4. Table `server_channels` (channels texte/voix/annonce)
--   5. Table `server_invites` (invitations custom)
--   6. Table `server_audit_log` (journal d'audit)
--   7. Table `server_bans` (bannissements)
--   8. Fonctions SQL utilitaires
--   9. RLS Policies
-- IDEMPOTENT : safe to re-run.
-- Prérequis : supabase_schema.sql (profiles)
-- ================================================================

-- ================================================================
-- 0️⃣ Fonction utilitaire update_updated_at (si absente)
-- ================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 1️⃣ Table servers — Serveurs communautaires
-- ================================================================

CREATE TABLE IF NOT EXISTS public.servers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  banner_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('gaming', 'education', 'music', 'art', 'tech', 'social', 'sports', 'other')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 1 CHECK (member_count >= 0),
  max_members INTEGER DEFAULT 100000,
  default_role_id UUID, -- Rôle par défaut pour les nouveaux membres
  features JSONB DEFAULT '[]', -- ex: ["community", "discovery", "welcome_screen"]
  rules TEXT, -- Règlement du serveur (markdown)
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_partnered BOOLEAN NOT NULL DEFAULT false,
  boost_level INTEGER NOT NULL DEFAULT 0 CHECK (boost_level >= 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_servers_owner ON public.servers(owner_id);
CREATE INDEX IF NOT EXISTS idx_servers_category ON public.servers(category);
CREATE INDEX IF NOT EXISTS idx_servers_public ON public.servers(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_servers_members ON public.servers(member_count DESC);

-- ================================================================
-- 2️⃣ Table server_roles — Rôles avec permissions
-- ================================================================

CREATE TABLE IF NOT EXISTS public.server_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#99AAB5', -- Couleur hexadécimale
  icon_url TEXT,
  position INTEGER NOT NULL DEFAULT 0, -- Plus haut = plus de pouvoir
  is_default BOOLEAN NOT NULL DEFAULT false, -- @everyone role
  is_admin BOOLEAN NOT NULL DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '{
    "manage_server": false,
    "manage_channels": false,
    "manage_roles": false,
    "manage_members": false,
    "kick_members": false,
    "ban_members": false,
    "manage_messages": false,
    "send_messages": true,
    "read_messages": true,
    "mention_everyone": false,
    "manage_invites": false,
    "manage_webhooks": false,
    "view_audit_log": false,
    "manage_emojis": false,
    "connect_voice": true,
    "speak_voice": true
  }',
  mentionable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, name)
);

CREATE INDEX IF NOT EXISTS idx_server_roles_server ON public.server_roles(server_id);
CREATE INDEX IF NOT EXISTS idx_server_roles_default ON public.server_roles(server_id, is_default) WHERE is_default = true;

-- ================================================================
-- 3️⃣ Table server_members — Membres des serveurs
-- ================================================================

CREATE TABLE IF NOT EXISTS public.server_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_ids UUID[] DEFAULT '{}', -- Plusieurs rôles possibles
  nickname TEXT, -- Surnom dans le serveur
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_deafened BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  timeout_until TIMESTAMPTZ, -- Timeout temporaire
  xp_in_server INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_server_members_server ON public.server_members(server_id);
CREATE INDEX IF NOT EXISTS idx_server_members_user ON public.server_members(user_id);
CREATE INDEX IF NOT EXISTS idx_server_members_joined ON public.server_members(joined_at DESC);

-- ================================================================
-- 4️⃣ Table server_channels — Channels
-- ================================================================

CREATE TABLE IF NOT EXISTS public.server_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice', 'announcement', 'stage', 'forum')),
  category TEXT, -- Nom de la catégorie (groupement visuel)
  position INTEGER NOT NULL DEFAULT 0,
  is_nsfw BOOLEAN NOT NULL DEFAULT false,
  slowmode_seconds INTEGER DEFAULT 0 CHECK (slowmode_seconds >= 0),
  permission_overwrites JSONB DEFAULT '[]', -- [{role_id, allow, deny}]
  parent_id UUID REFERENCES public.server_channels(id) ON DELETE SET NULL, -- Pour les threads
  is_archived BOOLEAN NOT NULL DEFAULT false,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_server_channels_server ON public.server_channels(server_id);
CREATE INDEX IF NOT EXISTS idx_server_channels_type ON public.server_channels(server_id, type);

-- ================================================================
-- 5️⃣ Table server_invites — Invitations custom
-- ================================================================

CREATE TABLE IF NOT EXISTS public.server_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.server_channels(id) ON DELETE SET NULL,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE, -- Code d'invitation (ex: "abc123")
  max_uses INTEGER, -- NULL = illimité
  uses INTEGER NOT NULL DEFAULT 0,
  max_age_seconds INTEGER, -- NULL = permanent
  is_temporary BOOLEAN NOT NULL DEFAULT false, -- Membre temporaire
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_server_invites_code ON public.server_invites(code);
CREATE INDEX IF NOT EXISTS idx_server_invites_server ON public.server_invites(server_id);

-- ================================================================
-- 6️⃣ Table server_audit_log — Journal d'audit
-- ================================================================

CREATE TABLE IF NOT EXISTS public.server_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'server_update', 'channel_create', 'channel_update', 'channel_delete',
    'role_create', 'role_update', 'role_delete',
    'member_kick', 'member_ban', 'member_unban', 'member_role_update',
    'invite_create', 'invite_delete',
    'message_delete', 'message_pin', 'message_unpin',
    'webhook_create', 'webhook_update', 'webhook_delete',
    'emoji_create', 'emoji_delete'
  )),
  target_type TEXT CHECK (target_type IN ('server', 'channel', 'role', 'member', 'message', 'invite', 'webhook', 'emoji')),
  target_id TEXT, -- UUID or ID de la cible
  changes JSONB DEFAULT '{}', -- {before: {...}, after: {...}}
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_server ON public.server_audit_log(server_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.server_audit_log(actor_id);

-- ================================================================
-- 7️⃣ Table server_bans — Bannissements
-- ================================================================

CREATE TABLE IF NOT EXISTS public.server_bans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  expires_at TIMESTAMPTZ, -- NULL = permanent
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_server_bans_server ON public.server_bans(server_id);

-- ================================================================
-- 8️⃣ Fonctions SQL
-- ================================================================

-- Fonction : Créer un serveur avec rôle @everyone et channel #général
CREATE OR REPLACE FUNCTION public.create_server(
  p_owner_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'social',
  p_is_public BOOLEAN DEFAULT true
) RETURNS UUID AS $$
DECLARE
  v_server_id UUID;
  v_role_id UUID;
BEGIN
  -- Créer le serveur
  INSERT INTO public.servers (name, description, owner_id, category, is_public)
  VALUES (p_name, p_description, p_owner_id, p_category, p_is_public)
  RETURNING id INTO v_server_id;
  
  -- Créer le rôle @everyone (par défaut)
  INSERT INTO public.server_roles (server_id, name, is_default, position, permissions)
  VALUES (v_server_id, '@everyone', true, 0, '{
    "manage_server": false, "manage_channels": false, "manage_roles": false,
    "manage_members": false, "kick_members": false, "ban_members": false,
    "manage_messages": false, "send_messages": true, "read_messages": true,
    "mention_everyone": false, "manage_invites": false, "manage_webhooks": false,
    "view_audit_log": false, "manage_emojis": false, "connect_voice": true, "speak_voice": true
  }')
  RETURNING id INTO v_role_id;
  
  -- Définir le rôle par défaut
  UPDATE public.servers SET default_role_id = v_role_id WHERE id = v_server_id;
  
  -- Ajouter le propriétaire comme membre
  INSERT INTO public.server_members (server_id, user_id, role_ids)
  VALUES (v_server_id, p_owner_id, ARRAY[v_role_id]);
  
  -- Créer le channel #général
  INSERT INTO public.server_channels (server_id, name, topic, type, position)
  VALUES (v_server_id, 'général', 'Discussion générale', 'text', 0);
  
  -- Créer le channel #annonces
  INSERT INTO public.server_channels (server_id, name, topic, type, position)
  VALUES (v_server_id, 'annonces', 'Annonces officielles', 'announcement', 1);
  
  RETURN v_server_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction : Rejoindre un serveur
CREATE OR REPLACE FUNCTION public.join_server(
  p_user_id UUID,
  p_server_id UUID,
  p_invite_code TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_server RECORD;
  v_invite RECORD;
  v_default_role UUID;
BEGIN
  -- Vérifier que l'utilisateur n'est pas banni
  IF EXISTS (SELECT 1 FROM public.server_bans WHERE server_id = p_server_id AND user_id = p_user_id AND (expires_at IS NULL OR expires_at > now())) THEN
    RAISE EXCEPTION 'User is banned from this server';
  END IF;
  
  -- Vérifier que l'utilisateur n'est pas déjà membre
  IF EXISTS (SELECT 1 FROM public.server_members WHERE server_id = p_server_id AND user_id = p_user_id) THEN
    RETURN true; -- Déjà membre
  END IF;
  
  -- Récupérer le serveur
  SELECT * INTO v_server FROM public.servers WHERE id = p_server_id;
  IF v_server IS NULL THEN
    RAISE EXCEPTION 'Server not found';
  END IF;
  
  -- Vérifier que le serveur n'est pas plein
  IF v_server.member_count >= v_server.max_members THEN
    RAISE EXCEPTION 'Server is full';
  END IF;
  
  -- Si serveur privé, vérifier l'invitation
  IF NOT v_server.is_public THEN
    IF p_invite_code IS NULL THEN
      RAISE EXCEPTION 'Invite code required for private servers';
    END IF;
    
    SELECT * INTO v_invite FROM public.server_invites
    WHERE code = p_invite_code AND server_id = p_server_id
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses < max_uses);
    
    IF v_invite IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired invite';
    END IF;
    
    -- Incrémenter l'utilisation
    UPDATE public.server_invites SET uses = uses + 1 WHERE id = v_invite.id;
  END IF;
  
  -- Récupérer le rôle par défaut
  v_default_role := v_server.default_role_id;
  
  -- Ajouter le membre
  INSERT INTO public.server_members (server_id, user_id, role_ids)
  VALUES (p_server_id, p_user_id, CASE WHEN v_default_role IS NOT NULL THEN ARRAY[v_default_role] ELSE '{}' END);
  
  -- Mettre à jour le compteur
  UPDATE public.servers SET member_count = member_count + 1, updated_at = now() WHERE id = p_server_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction : Générer un code d'invitation unique
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := encode(gen_random_bytes(4), 'hex');
    SELECT EXISTS(SELECT 1 FROM public.server_invites WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 9️⃣ Triggers
-- ================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_servers_updated_at') THEN
    CREATE TRIGGER tr_servers_updated_at
      BEFORE UPDATE ON public.servers
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_server_channels_updated_at') THEN
    CREATE TRIGGER tr_server_channels_updated_at
      BEFORE UPDATE ON public.server_channels
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- ================================================================
-- 🔟 RLS Policies
-- ================================================================

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_bans ENABLE ROW LEVEL SECURITY;

-- servers: public servers visible by all, private by members
CREATE POLICY "Public servers are visible" ON public.servers FOR SELECT
  USING (is_public = true);

CREATE POLICY "Members can see private servers" ON public.servers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.server_members WHERE server_id = id AND user_id = auth.uid()));

CREATE POLICY "Owner can update server" ON public.servers FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated can create servers" ON public.servers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- server_roles: visible by members
CREATE POLICY "Server members can view roles" ON public.server_roles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.server_members WHERE server_id = server_roles.server_id AND user_id = auth.uid()));

-- server_members: visible by co-members
CREATE POLICY "Server members can see other members" ON public.server_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.server_members sm WHERE sm.server_id = server_members.server_id AND sm.user_id = auth.uid()));

-- server_channels: visible by members
CREATE POLICY "Server members can view channels" ON public.server_channels FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.server_members WHERE server_id = server_channels.server_id AND user_id = auth.uid()));

-- server_invites: visible by members
CREATE POLICY "Server members can view invites" ON public.server_invites FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.server_members WHERE server_id = server_invites.server_id AND user_id = auth.uid()));

CREATE POLICY "Members can create invites" ON public.server_invites FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.server_members WHERE server_id = server_invites.server_id AND user_id = auth.uid()));

-- server_audit_log: visible by admins of the server
CREATE POLICY "Server admins can view audit log" ON public.server_audit_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.server_members sm
    JOIN public.server_roles sr ON sr.id = ANY(sm.role_ids)
    WHERE sm.server_id = server_audit_log.server_id 
    AND sm.user_id = auth.uid()
    AND (sr.is_admin = true OR (sr.permissions->>'view_audit_log')::boolean = true)
  ));

-- server_bans: visible by admins
CREATE POLICY "Server admins can view bans" ON public.server_bans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.server_members sm
    JOIN public.server_roles sr ON sr.id = ANY(sm.role_ids)
    WHERE sm.server_id = server_bans.server_id
    AND sm.user_id = auth.uid()
    AND (sr.is_admin = true OR (sr.permissions->>'ban_members')::boolean = true)
  ));

-- ================================================================
-- ✅ Migration communautés terminée
-- ================================================================
