-- ============================================================================
-- ImuChat — File Manager (DEV-020 + DEV-037) — Sprint 6b
-- Drive cloud : fichiers, dossiers, versionning, partage, corbeille, activité
-- ============================================================================
-- Exécuter APRÈS supabase_office_suite.sql
-- Tables : cloud_folders, cloud_files, file_versions, file_shares,
--          share_links, file_transfers, file_activities
-- ============================================================================

-- ─── Cloud Folders ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cloud_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.cloud_folders(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  color TEXT NOT NULL DEFAULT '#2196F3',
  icon TEXT NOT NULL DEFAULT 'folder',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_trashed BOOLEAN NOT NULL DEFAULT false,
  trashed_at TIMESTAMPTZ,
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Cloud Files ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cloud_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  extension TEXT NOT NULL DEFAULT '',
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('image','video','audio','document','spreadsheet','presentation','pdf','archive','code','other')),
  size BIGINT NOT NULL DEFAULT 0,
  folder_id UUID REFERENCES public.cloud_folders(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Storage
  storage_path TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,

  -- Metadata
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_trashed BOOLEAN NOT NULL DEFAULT false,
  trashed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  color_label TEXT,

  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

-- ─── File Versions ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.cloud_files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  change_summary TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── File Shares ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.cloud_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.cloud_folders(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_name TEXT NOT NULL DEFAULT '',
  shared_with_avatar TEXT,
  permission TEXT NOT NULL DEFAULT 'view'
    CHECK (permission IN ('view','comment','edit','admin')),
  can_reshare BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (file_id IS NOT NULL OR folder_id IS NOT NULL)
);

-- ─── Share Links ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.cloud_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.cloud_folders(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view'
    CHECK (permission IN ('view','comment','edit','admin')),
  password_protected BOOLEAN NOT NULL DEFAULT false,
  max_downloads INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (file_id IS NOT NULL OR folder_id IS NOT NULL)
);

-- ─── File Transfers ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('upload','download')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','completed','failed','cancelled')),
  error_message TEXT,
  storage_path TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ─── File Activities ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.cloud_files(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES public.cloud_folders(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  action TEXT NOT NULL
    CHECK (action IN ('created','updated','deleted','shared','moved','renamed','restored','downloaded')),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_cloud_files_folder ON public.cloud_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_cloud_files_owner ON public.cloud_files(owner_id);
CREATE INDEX IF NOT EXISTS idx_cloud_files_trashed ON public.cloud_files(is_trashed);
CREATE INDEX IF NOT EXISTS idx_cloud_files_category ON public.cloud_files(category);
CREATE INDEX IF NOT EXISTS idx_cloud_folders_parent ON public.cloud_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_cloud_folders_owner ON public.cloud_folders(owner_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_file ON public.file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_file ON public.file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON public.file_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token);
CREATE INDEX IF NOT EXISTS idx_file_activities_file ON public.file_activities(file_id);
CREATE INDEX IF NOT EXISTS idx_file_activities_actor ON public.file_activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_file_transfers_user ON public.file_transfers(user_id);

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.cloud_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_activities ENABLE ROW LEVEL SECURITY;

-- Owners can do everything on their own data
CREATE POLICY "cloud_folders_owner" ON public.cloud_folders
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "cloud_files_owner" ON public.cloud_files
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "file_versions_owner" ON public.file_versions
  FOR ALL USING (
    created_by = auth.uid()
    OR file_id IN (SELECT id FROM public.cloud_files WHERE owner_id = auth.uid())
  );

CREATE POLICY "file_shares_participant" ON public.file_shares
  FOR ALL USING (shared_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "share_links_creator" ON public.share_links
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "file_transfers_owner" ON public.file_transfers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "file_activities_viewer" ON public.file_activities
  FOR SELECT USING (actor_id = auth.uid());

CREATE POLICY "file_activities_insert" ON public.file_activities
  FOR INSERT WITH CHECK (actor_id = auth.uid());

-- Shared files: users can view files shared with them
CREATE POLICY "cloud_files_shared_read" ON public.cloud_files
  FOR SELECT USING (
    id IN (SELECT file_id FROM public.file_shares WHERE shared_with = auth.uid() AND file_id IS NOT NULL)
  );

-- Shared folders: users can view folders shared with them
CREATE POLICY "cloud_folders_shared_read" ON public.cloud_folders
  FOR SELECT USING (
    id IN (SELECT folder_id FROM public.file_shares WHERE shared_with = auth.uid() AND folder_id IS NOT NULL)
  );

-- ─── Triggers (updated_at) ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'cloud_folders_updated_at') THEN
    CREATE TRIGGER cloud_folders_updated_at
      BEFORE UPDATE ON public.cloud_folders
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'cloud_files_updated_at') THEN
    CREATE TRIGGER cloud_files_updated_at
      BEFORE UPDATE ON public.cloud_files
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
