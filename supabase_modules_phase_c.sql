-- ================================================================
-- 🧩 ImuChat — Phase C: 9 modules extraits en mini-apps
-- Date: 27 février 2026
-- Ce fichier ajoute les 9 modules Phase C au catalogue.
-- Prérequis : tables créées par supabase_modules.sql ou
--             supabase_modules_phase_b.sql (les deux sont idempotents).
-- IDEMPOTENT : safe to re-run (ON CONFLICT DO NOTHING).
-- ================================================================

-- ================================================================
-- 🌱 Seed: Phase C — 9 modules (5 defaultEnabled + 4 optionnels)
-- ================================================================

-- ─── Events (defaultEnabled) ──────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-events',
  'ImuEvents',
  '1.0.0',
  'Events & Campaigns — Discover seasonal events and special campaigns.',
  'social',
  '🎉',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-events/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal'],
  ARRAY[]::TEXT[],
  198000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'images.unsplash.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Music (defaultEnabled) ──────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-music',
  'ImuMusic',
  '1.0.0',
  'ImuMusic — Listen, share, and discover music together.',
  'entertainment',
  '🎵',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-music/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
  ARRAY[]::TEXT[],
  413000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'images.unsplash.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Watch (defaultEnabled) ──────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-watch',
  'ImuWatch',
  '1.0.0',
  'Watch Party — Watch videos together with friends in real-time.',
  'entertainment',
  '📺',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-watch/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
  ARRAY[]::TEXT[],
  580000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'images.unsplash.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Admin (optionnel) ───────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-admin',
  'ImuAdmin',
  '1.0.0',
  'Admin Panel — Back-office administration dashboard.',
  'tools',
  '🛠️',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-admin/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'admin:read', 'admin:write'],
  ARRAY[]::TEXT[],
  173000,
  'iframe',
  ARRAY[]::TEXT[],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Stickers (optionnel) ────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-stickers',
  'ImuStickers',
  '1.0.0',
  'Stickers — Browse, collect and share sticker packs.',
  'social',
  '🎨',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-stickers/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'chat:stickers'],
  ARRAY[]::TEXT[],
  172000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'images.unsplash.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── News (optionnel) ────────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-news',
  'ImuNews',
  '1.0.0',
  'News aggregation — Stay up to date with the latest news from your communities.',
  'information',
  '📰',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-news/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'news:read'],
  ARRAY['profile'],
  458000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'images.unsplash.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Podcasts (optionnel) ────────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-podcasts',
  'ImuPodcasts',
  '1.0.0',
  'Discover, listen, and create podcasts on ImuChat.',
  'media',
  '🎙️',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-podcasts/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'audio:stream', 'storage:read', 'storage:write'],
  ARRAY[]::TEXT[],
  502000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'images.unsplash.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Social Hub (optionnel) ──────────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-social-hub',
  'Social Hub',
  '1.0.0',
  'Social feed — Posts, stories, groups, and trending topics.',
  'social',
  '👥',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-social-hub/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'post:write', 'post:read', 'social:interact'],
  ARRAY[]::TEXT[],
  306000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos', 'api.dicebear.com'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Creator Studio (optionnel) ──────────────────────────────
INSERT INTO public.modules (id, name, version, description, category, icon, author, license, entry_url, permissions, dependencies, bundle_size, sandbox, allowed_domains, is_published, is_verified)
VALUES (
  'imu-creator-studio',
  'ImuCreator Studio',
  '1.0.0',
  'Content creation and publishing dashboard for creators.',
  'productivity',
  '✏️',
  'ImuChat Team',
  'MIT',
  '/miniapps/imu-creator-studio/index.html',
  ARRAY['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'content:create', 'storage:read', 'storage:write', 'notifications:send'],
  ARRAY['profile'],
  258000,
  'iframe',
  ARRAY['placehold.co', 'picsum.photos'],
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 📊 Summary: 9 Phase C modules added to catalogue
--   defaultEnabled: imu-events, imu-music, imu-watch
--   optional: imu-admin, imu-stickers, imu-news, imu-podcasts,
--             imu-social-hub, imu-creator-studio
--
-- Combined with Phase A (1) + Phase B (13) = 23 total modules
-- This file is IDEMPOTENT — safe to re-run.
-- ================================================================
