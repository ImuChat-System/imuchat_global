-- ================================================================
-- 🎮 ImuChat — Secondary Domains Schema
-- Date: 23 février 2026
-- Version: 2.1
-- Domains: Games, Sports, News, Smart Home, Events, Music
-- ================================================================
-- ⚠️  This migration is IDEMPOTENT: it drops and recreates all
--     secondary domain tables. Safe for dev, NOT for prod with data.
-- ================================================================

-- ----------------------------------------------------------------
-- 🗑  Clean slate — drop in reverse dependency order
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS public.music_liked_tracks CASCADE;
DROP TABLE IF EXISTS public.music_playlist_tracks CASCADE;
DROP TABLE IF EXISTS public.music_playlists CASCADE;
DROP TABLE IF EXISTS public.music_tracks CASCADE;
DROP TABLE IF EXISTS public.music_artists CASCADE;

DROP TABLE IF EXISTS public.event_rsvps CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.event_categories CASCADE;

DROP TABLE IF EXISTS public.smart_automations CASCADE;
DROP TABLE IF EXISTS public.smart_devices CASCADE;
DROP TABLE IF EXISTS public.smart_rooms CASCADE;

DROP TABLE IF EXISTS public.news_bookmarks CASCADE;
DROP TABLE IF EXISTS public.news_articles CASCADE;
DROP TABLE IF EXISTS public.news_categories CASCADE;

DROP TABLE IF EXISTS public.user_sports_follows CASCADE;
DROP TABLE IF EXISTS public.sports_matches CASCADE;
DROP TABLE IF EXISTS public.sports_teams CASCADE;

DROP TABLE IF EXISTS public.user_games CASCADE;
DROP TABLE IF EXISTS public.game_scores CASCADE;
DROP TABLE IF EXISTS public.game_library CASCADE;

-- ================================================================
-- 🎮 GAMES
-- ================================================================

-- Game catalog
CREATE TABLE IF NOT EXISTS public.game_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL CHECK (genre IN ('action', 'puzzle', 'strategy', 'arcade', 'trivia', 'card', 'rpg', 'casual', 'multiplayer')),
  thumbnail_url TEXT,
  banner_url TEXT,
  min_players INTEGER DEFAULT 1,
  max_players INTEGER DEFAULT 1,
  is_multiplayer BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  avg_duration_minutes INTEGER,
  play_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.game_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games are viewable by everyone" ON public.game_library
  FOR SELECT USING (true);

-- User game scores / high scores
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.game_library(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS game_scores_game_id_idx ON public.game_scores(game_id);
CREATE INDEX IF NOT EXISTS game_scores_user_id_idx ON public.game_scores(user_id);
CREATE INDEX IF NOT EXISTS game_scores_score_idx ON public.game_scores(score DESC);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all scores" ON public.game_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores" ON public.game_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User game library (installed/favorited games)
CREATE TABLE IF NOT EXISTS public.user_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.game_library(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  last_played_at TIMESTAMP WITH TIME ZONE,
  play_count INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own games" ON public.user_games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own games" ON public.user_games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own games" ON public.user_games
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own games" ON public.user_games
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- ⚽ SPORTS
-- ================================================================

-- Sports teams catalog
CREATE TABLE IF NOT EXISTS public.sports_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  sport TEXT NOT NULL CHECK (sport IN ('football', 'basketball', 'tennis', 'rugby', 'f1', 'cricket', 'baseball', 'hockey', 'mma', 'esports')),
  league TEXT,
  country TEXT,
  stadium TEXT,
  founded_year INTEGER,
  colors JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sports_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone" ON public.sports_teams
  FOR SELECT USING (true);

-- Sports matches
CREATE TABLE IF NOT EXISTS public.sports_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team_id UUID REFERENCES public.sports_teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES public.sports_teams(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  league TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  kickoff_at TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT,
  round TEXT,
  highlights_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sports_matches_kickoff_idx ON public.sports_matches(kickoff_at DESC);
CREATE INDEX IF NOT EXISTS sports_matches_status_idx ON public.sports_matches(status);

ALTER TABLE public.sports_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone" ON public.sports_matches
  FOR SELECT USING (true);

-- User sports follows
CREATE TABLE IF NOT EXISTS public.user_sports_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.sports_teams(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

ALTER TABLE public.user_sports_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follows" ON public.user_sports_follows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage follows" ON public.user_sports_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update follows" ON public.user_sports_follows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete follows" ON public.user_sports_follows
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 📰 NEWS
-- ================================================================

-- News categories
CREATE TABLE IF NOT EXISTS public.news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News categories are viewable by everyone" ON public.news_categories
  FOR SELECT USING (true);

-- News articles
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  source_name TEXT,
  source_url TEXT,
  author_name TEXT,
  category_id UUID REFERENCES public.news_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_breaking BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS news_articles_published_idx ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS news_articles_category_idx ON public.news_articles(category_id);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News articles are viewable by everyone" ON public.news_articles
  FOR SELECT USING (true);

-- User news bookmarks
CREATE TABLE IF NOT EXISTS public.news_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE public.news_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.news_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage bookmarks" ON public.news_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete bookmarks" ON public.news_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 🏠 SMART HOME
-- ================================================================

-- Smart rooms
CREATE TABLE IF NOT EXISTS public.smart_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏠',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.smart_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rooms" ON public.smart_rooms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage rooms" ON public.smart_rooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update rooms" ON public.smart_rooms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete rooms" ON public.smart_rooms
  FOR DELETE USING (auth.uid() = user_id);

-- Smart devices
CREATE TABLE IF NOT EXISTS public.smart_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.smart_rooms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('light', 'thermostat', 'camera', 'lock', 'sensor', 'speaker', 'plug', 'blinds', 'alarm', 'appliance')),
  brand TEXT,
  model TEXT,
  is_online BOOLEAN DEFAULT true,
  is_on BOOLEAN DEFAULT false,
  state JSONB DEFAULT '{}',
  battery_level INTEGER,
  firmware_version TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS smart_devices_user_idx ON public.smart_devices(user_id);
CREATE INDEX IF NOT EXISTS smart_devices_room_idx ON public.smart_devices(room_id);

ALTER TABLE public.smart_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON public.smart_devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage devices" ON public.smart_devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update devices" ON public.smart_devices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete devices" ON public.smart_devices
  FOR DELETE USING (auth.uid() = user_id);

-- Smart automations
CREATE TABLE IF NOT EXISTS public.smart_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time', 'device_state', 'location', 'sunrise', 'sunset', 'manual')),
  trigger_config JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.smart_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations" ON public.smart_automations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage automations" ON public.smart_automations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update automations" ON public.smart_automations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete automations" ON public.smart_automations
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 📅 EVENTS
-- ================================================================

-- Event categories
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event categories are viewable by everyone" ON public.event_categories
  FOR SELECT USING (true);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  image_url TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT false,
  meeting_url TEXT,
  max_attendees INTEGER,
  ticket_price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'live', 'ended', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  attendees_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_start_idx ON public.events(start_at);
CREATE INDEX IF NOT EXISTS events_organizer_idx ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events are viewable by everyone" ON public.events
  FOR SELECT USING (is_public = true OR organizer_id = auth.uid());

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = organizer_id);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RSVPs are viewable by everyone for public events" ON public.event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events WHERE id = event_rsvps.event_id AND is_public = true
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage own RSVPs" ON public.event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVPs" ON public.event_rsvps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVPs" ON public.event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 🎵 MUSIC
-- ================================================================

-- Music artists
CREATE TABLE IF NOT EXISTS public.music_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  genre TEXT,
  monthly_listeners INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.music_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists are viewable by everyone" ON public.music_artists
  FOR SELECT USING (true);

-- Music tracks
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.music_artists(id) ON DELETE CASCADE,
  album TEXT,
  cover_url TEXT,
  audio_url TEXT,
  duration_seconds INTEGER NOT NULL,
  genre TEXT,
  play_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  release_date DATE,
  is_explicit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS music_tracks_artist_idx ON public.music_tracks(artist_id);
CREATE INDEX IF NOT EXISTS music_tracks_genre_idx ON public.music_tracks(genre);

ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tracks are viewable by everyone" ON public.music_tracks
  FOR SELECT USING (true);

-- Music playlists
CREATE TABLE IF NOT EXISTS public.music_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  track_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playlists are viewable by everyone" ON public.music_playlists
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create playlists" ON public.music_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON public.music_playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON public.music_playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist tracks (join table)
CREATE TABLE IF NOT EXISTS public.music_playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES public.music_playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

ALTER TABLE public.music_playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Playlist tracks follow playlist visibility" ON public.music_playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.music_playlists
      WHERE id = music_playlist_tracks.playlist_id
      AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add tracks to own playlists" ON public.music_playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.music_playlists
      WHERE id = music_playlist_tracks.playlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tracks from own playlists" ON public.music_playlist_tracks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.music_playlists
      WHERE id = music_playlist_tracks.playlist_id
      AND user_id = auth.uid()
    )
  );

-- User liked tracks
CREATE TABLE IF NOT EXISTS public.music_liked_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

ALTER TABLE public.music_liked_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own likes" ON public.music_liked_tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can like tracks" ON public.music_liked_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike tracks" ON public.music_liked_tracks
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- ✅ Secondary Domains Schema Complete
-- 
-- Tables created: 18
-- Domains: games (3), sports (3), news (3), smart_home (3), events (3), music (4+1)
-- All with RLS enabled
-- ================================================================
