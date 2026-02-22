-- ============================================================================
-- Migration 003: Advanced Profiles (DEV-008)
-- Adds: visibility, enriched status, website, verification fields
-- ============================================================================

-- 1. Add profile visibility (public/private/anonymous)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_visibility') THEN
    CREATE TYPE profile_visibility AS ENUM ('public', 'private', 'anonymous');
  END IF;
END$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS visibility profile_visibility DEFAULT 'public';

-- 2. Add enriched status fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status_emoji TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Add website (profile.tsx was referencing it but column didn't exist)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS website TEXT DEFAULT NULL;

-- 4. Add verification fields (for future badge system)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 5. Add profile stats cache (denormalized for fast reads)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contacts_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversations_count INTEGER DEFAULT 0;

-- 6. Rename full_name → display_name if needed (skip if display_name already exists)
-- Note: The schema already has display_name. The code was wrong, not the DB.
-- No rename needed — just fix the code references.

-- 7. RLS: Visibility-aware SELECT policy
-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Profiles visibility aware" ON public.profiles
  FOR SELECT
  USING (
    -- Users can always see their own profile
    auth.uid() = id
    OR
    -- Public profiles visible to all authenticated users
    (visibility = 'public' AND auth.role() = 'authenticated')
    OR
    -- Private profiles: only visible to contacts (simplified: authenticated for now)
    (visibility = 'private' AND auth.role() = 'authenticated')
    -- Anonymous profiles: never visible to others (only owner sees it)
  );

-- 8. Index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON public.profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_profiles_status_expires ON public.profiles(status_expires_at)
  WHERE status_expires_at IS NOT NULL;

-- ============================================================================
-- Run this migration in Supabase SQL Editor
-- ============================================================================
