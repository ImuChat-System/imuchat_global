/**
 * Types ImuFeed Video — Feed vidéo court-format (style TikTok)
 * Sprint S1 Axe B — MVP Feed Foundation
 */

// ─── Enums ────────────────────────────────────────────────────

/** Statut de publication d'une vidéo */
export type VideoStatus = 'draft' | 'processing' | 'published' | 'removed' | 'flagged';

/** Visibilité de la vidéo */
export type VideoVisibility = 'public' | 'followers' | 'private';

/** Catégorie de contenu */
export type VideoCategory =
  | 'entertainment'
  | 'education'
  | 'music'
  | 'gaming'
  | 'sports'
  | 'cooking'
  | 'fashion'
  | 'tech'
  | 'comedy'
  | 'art'
  | 'anime'
  | 'travel'
  | 'pets'
  | 'other';

/** Type de réaction */
export type FeedReactionType = 'like' | 'love' | 'haha' | 'wow' | 'fire' | 'sad';

/** Source du feed */
export type FeedSource = 'for_you' | 'following' | 'trending' | 'explore';

// ─── Core Types ───────────────────────────────────────────────

/** Auteur d'une vidéo */
export interface VideoAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  followers_count: number;
  is_following: boolean;
}

/** Musique/son utilisé dans une vidéo */
export interface VideoSound {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  artwork_url: string | null;
  duration_ms: number;
  usage_count: number;
  /** Genre musical (ajouté S9) */
  genre: string;
  /** Son original d'une vidéo (ajouté S9) */
  is_original: boolean;
  /** Vidéo source pour les sons originaux */
  original_video_id: string | null;
}

/** Hashtag */
export interface VideoHashtag {
  id: string;
  name: string;
  usage_count: number;
  is_trending: boolean;
}

/** Vidéo ImuFeed */
export interface ImuFeedVideo {
  id: string;
  author: VideoAuthor;
  /** URL de la vidéo (Supabase Storage / CDN) */
  video_url: string;
  /** URL de la miniature */
  thumbnail_url: string | null;
  /** Description / caption */
  caption: string;
  /** Durée en ms (max 180000 = 3 min) */
  duration_ms: number;
  /** Largeur pixels */
  width: number;
  /** Hauteur pixels */
  height: number;
  /** Son utilisé */
  sound: VideoSound | null;
  /** Hashtags */
  hashtags: VideoHashtag[];
  /** Catégorie */
  category: VideoCategory;
  /** Visibilité */
  visibility: VideoVisibility;
  /** Statut */
  status: VideoStatus;
  /** Statistiques */
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  bookmarks_count: number;
  /** État utilisateur */
  is_liked: boolean;
  is_bookmarked: boolean;
  /** Permettre commentaires */
  allow_comments: boolean;
  /** Permettre duos */
  allow_duet: boolean;
  /** Vidéo d'origine si c'est un duo/remix */
  original_video_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Commentaire sur une vidéo */
export interface FeedComment {
  id: string;
  video_id: string;
  author: VideoAuthor;
  content: string;
  likes_count: number;
  is_liked: boolean;
  /** Réponse à un autre commentaire */
  parent_id: string | null;
  replies_count: number;
  /** Épinglé par le créateur */
  is_pinned: boolean;
  created_at: string;
}

/** Tri des commentaires */
export type CommentSortMode = 'top' | 'recent';

/** Raison de signalement */
export type CommentReportReason = 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'other';

/** Données d'upload vidéo */
export interface VideoUploadData {
  /** URI locale du fichier vidéo */
  uri: string;
  caption: string;
  category: VideoCategory;
  visibility: VideoVisibility;
  hashtags: string[];
  sound_id?: string;
  allow_comments: boolean;
  allow_duet: boolean;
  /** URI locale de la miniature custom */
  thumbnail_uri?: string;
}

/** Progression d'upload */
export interface UploadProgress {
  video_id: string;
  stage: 'compressing' | 'uploading' | 'processing' | 'complete' | 'error';
  percent: number;
  error?: string;
}

// ─── Feed State ───────────────────────────────────────────────

/** État du player vidéo dans le feed */
export interface FeedPlayerState {
  /** Index de la vidéo visible */
  currentIndex: number;
  /** Video ID en cours */
  currentVideoId: string | null;
  /** En pause */
  isPaused: boolean;
  /** Muet */
  isMuted: boolean;
  /** Position de lecture en ms */
  positionMs: number;
}

/** Page de résultats du feed */
export interface FeedPage {
  videos: ImuFeedVideo[];
  cursor: string | null;
  hasMore: boolean;
}

/** Résultat de recherche dans le feed */
export interface FeedSearchResult {
  videos: ImuFeedVideo[];
  hashtags: VideoHashtag[];
  authors: VideoAuthor[];
}

// ─── Explore & Trending Types (Sprint S8B) ────────────────────

/** Score trending d'un hashtag (calculé) */
export interface TrendingHashtagScore {
  hashtag_id: string;
  name: string;
  /** usage_24h × 2 + unique_creators × 5 + views × 0.001 + accélération × 10 */
  score: number;
  usage_24h: number;
  unique_creators: number;
  views: number;
  /** Ratio usage_24h / usage_48h_to_24h */
  acceleration: number;
}

/** Créateur populaire (classement hebdomadaire) */
export interface TopCreator {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  followers_count: number;
  /** Likes reçus cette semaine */
  weekly_likes: number;
  /** Nombre de vidéos postées cette semaine */
  weekly_videos: number;
  is_following: boolean;
}

/** Section de la page Explore */
export type ExploreSectionType =
  | 'trending_hashtags'
  | 'top_creators'
  | 'top_videos'
  | 'active_challenges';

/** Section Explore avec données chargées */
export interface ExploreSection {
  type: ExploreSectionType;
  title: string;
  data: TrendingHashtagScore[] | TopCreator[] | ImuFeedVideo[];
}

/** Données complètes de la page Explore */
export interface ExploreFeedData {
  trendingHashtags: TrendingHashtagScore[];
  topCreators: TopCreator[];
  topVideos: ImuFeedVideo[];
  activeChallenges: VideoHashtag[];
}

/** Page de feed par catégorie */
export interface CategoryFeedPage {
  category: VideoCategory;
  videos: ImuFeedVideo[];
  cursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

// ─── Algorithm Types (Sprint S7) ──────────────────────────────

/** Événement d'engagement lors du visionnage */
export interface ViewEngagement {
  video_id: string;
  user_id: string;
  watch_duration_ms: number;
  completed: boolean;
  /** Swipe rapide (< 2s) = signal négatif */
  quick_skip: boolean;
  /** Re-watch (vidéo déjà vue) */
  is_rewatch: boolean;
  source: FeedSource;
  created_at: string;
}

/** Profil d'intérêts utilisateur pour le feed */
export interface UserInterest {
  user_id: string;
  /** Catégories pondérées par engagement */
  category_weights: Record<VideoCategory, number>;
  /** Hashtags pondérés par engagement */
  hashtag_weights: Record<string, number>;
  /** Créateurs favoris (par engagement) */
  top_creator_ids: string[];
  updated_at: string;
}

/** Score d'engagement d'une vidéo */
export interface VideoEngagementScore {
  video_id: string;
  /** Score composite : views × completion_rate × likes × comments */
  engagement_score: number;
  /** Taux de complétion moyen (0-1) */
  completion_rate: number;
  /** Score de fraîcheur (décroît avec le temps) */
  freshness_score: number;
  /** Score final (engagement × freshness × relevance) */
  final_score: number;
}

/** Signal "Pas intéressé" */
export interface NotInterestedSignal {
  video_id: string;
  user_id: string;
  reason: 'not_interested' | 'repetitive' | 'inappropriate';
  created_at: string;
}

/** Paramètres de configuration de l'algorithme "Pour Toi" */
export interface ForYouConfig {
  /** Poids pour les vidéos d'abonnements (0-1) */
  subscriptions_weight: number;
  /** Poids pour les vidéos similaires aux intérêts (0-1) */
  similar_weight: number;
  /** Poids pour les vidéos trending (0-1) */
  trending_weight: number;
  /** Nombre max de candidats en phase recall */
  recall_limit: number;
  /** Nombre max de résultats finaux */
  result_limit: number;
}

// ─── Video Editor Types (Sprint S10B) ─────────────────────────

/** Catégorie de filtre vidéo */
export type VideoFilterCategory = 'classic' | 'manga' | 'ambiance';

/** Filtre vidéo applicable */
export interface VideoFilter {
  id: string;
  name: string;
  category: VideoFilterCategory;
  /** Paramètres CSS-like pour l'aperçu (brightness, contrast, etc.) */
  previewStyle: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
    sepia?: number;
    opacity?: number;
  };
  /** Icon ou thumbnail pour la sélection */
  thumbnailColor: string;
  /** Nécessite processing IA (manga/anime) */
  requiresAI: boolean;
}

/** Sticker positionné sur la vidéo */
export interface PlacedSticker {
  id: string;
  stickerId: string;
  imageUrl: string;
  /** Position relative (0-1) */
  x: number;
  y: number;
  /** Échelle (1 = taille originale) */
  scale: number;
  /** Rotation en degrés */
  rotation: number;
}

/** Sticker pack */
export interface StickerPack {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  isOfficial: boolean;
  isPremium: boolean;
  stickerCount: number;
}

/** Sticker individuel */
export interface Sticker {
  id: string;
  packId: string;
  name: string;
  imageUrl: string;
  isAnimated: boolean;
  tags: string[];
}

/** Texte animé positionné */
export interface PlacedText {
  id: string;
  text: string;
  style: AnimatedTextStyle;
  /** Position relative (0-1) */
  x: number;
  y: number;
  /** Échelle */
  scale: number;
  rotation: number;
  color: string;
  /** Apparition en ms depuis le début */
  startMs: number;
  /** Durée d'affichage en ms (0 = toute la vidéo) */
  durationMs: number;
}

/** Style d'animation de texte */
export type AnimatedTextStyle =
  | 'typewriter'
  | 'fade_in'
  | 'slide_up'
  | 'bounce'
  | 'glow'
  | 'shake'
  | 'zoom_in'
  | 'glitch'
  | 'wave'
  | 'rainbow'
  | 'outline'
  | 'shadow_pop';

/** Vitesse de lecture vidéo */
export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3;

/** Métadonnées d'édition complètes appliquées à une vidéo */
export interface VideoEditMetadata {
  filterId: string | null;
  stickers: PlacedSticker[];
  texts: PlacedText[];
  speed: PlaybackSpeed;
}

// ─── SQL Schema (pour migration Supabase) ─────────────────────

export const IMUFEED_SCHEMA_SQL = `
-- ─── ImuFeed Video Tables ────────────────────────────────
-- Sprint S1 Axe B — MVP Feed Foundation

CREATE TYPE video_status AS ENUM ('draft', 'processing', 'published', 'removed', 'flagged');
CREATE TYPE video_visibility AS ENUM ('public', 'followers', 'private');
CREATE TYPE video_category AS ENUM (
  'entertainment', 'education', 'music', 'gaming', 'sports',
  'cooking', 'fashion', 'tech', 'comedy', 'art', 'anime',
  'travel', 'pets', 'other'
);

-- Sounds / musiques
CREATE TABLE IF NOT EXISTS imufeed_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  audio_url TEXT NOT NULL,
  artwork_url TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hashtags
CREATE TABLE IF NOT EXISTS imufeed_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_hashtags_name ON imufeed_hashtags(name);
CREATE INDEX idx_hashtags_trending ON imufeed_hashtags(is_trending) WHERE is_trending = true;

-- Vidéos
CREATE TABLE IF NOT EXISTS imufeed_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1080,
  height INTEGER NOT NULL DEFAULT 1920,
  sound_id UUID REFERENCES imufeed_sounds(id),
  category video_category NOT NULL DEFAULT 'other',
  visibility video_visibility NOT NULL DEFAULT 'public',
  status video_status NOT NULL DEFAULT 'processing',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  bookmarks_count INTEGER NOT NULL DEFAULT 0,
  allow_comments BOOLEAN NOT NULL DEFAULT true,
  allow_duet BOOLEAN NOT NULL DEFAULT true,
  original_video_id UUID REFERENCES imufeed_videos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_videos_author ON imufeed_videos(author_id);
CREATE INDEX idx_videos_status ON imufeed_videos(status) WHERE status = 'published';
CREATE INDEX idx_videos_category ON imufeed_videos(category);
CREATE INDEX idx_videos_created ON imufeed_videos(created_at DESC);
CREATE INDEX idx_videos_trending ON imufeed_videos(likes_count DESC, views_count DESC)
  WHERE status = 'published';

-- Junction vidéo ↔ hashtag
CREATE TABLE IF NOT EXISTS imufeed_video_hashtags (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES imufeed_hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, hashtag_id)
);

-- Likes
CREATE TABLE IF NOT EXISTS imufeed_likes (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, user_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS imufeed_bookmarks (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, user_id)
);

-- Commentaires
CREATE TABLE IF NOT EXISTS imufeed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES imufeed_comments(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_video ON imufeed_comments(video_id, created_at DESC);
CREATE INDEX idx_comments_parent ON imufeed_comments(parent_id) WHERE parent_id IS NOT NULL;

-- Comment likes
CREATE TABLE IF NOT EXISTS imufeed_comment_likes (
  comment_id UUID NOT NULL REFERENCES imufeed_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- Vues (tracking pour algorithme)
CREATE TABLE IF NOT EXISTS imufeed_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  watch_duration_ms INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_views_video ON imufeed_views(video_id);
CREATE INDEX idx_views_user ON imufeed_views(user_id) WHERE user_id IS NOT NULL;

-- Follows (utilisateur suit créateur)
CREATE TABLE IF NOT EXISTS imufeed_follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);
CREATE INDEX idx_follows_following ON imufeed_follows(following_id);

-- ─── RLS Policies ────────────────────────────────────────────

ALTER TABLE imufeed_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE imufeed_follows ENABLE ROW LEVEL SECURITY;

-- Vidéos publiques lisibles par tous
CREATE POLICY videos_select ON imufeed_videos FOR SELECT
  USING (status = 'published' AND (visibility = 'public' OR author_id = auth.uid()));

-- Auteur peut modifier ses vidéos
CREATE POLICY videos_update ON imufeed_videos FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY videos_insert ON imufeed_videos FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY videos_delete ON imufeed_videos FOR DELETE
  USING (author_id = auth.uid());

-- Likes : user ne peut voir/créer/supprimer que les siens
CREATE POLICY likes_select ON imufeed_likes FOR SELECT USING (true);
CREATE POLICY likes_insert ON imufeed_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY likes_delete ON imufeed_likes FOR DELETE USING (user_id = auth.uid());

-- Bookmarks
CREATE POLICY bookmarks_select ON imufeed_bookmarks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY bookmarks_insert ON imufeed_bookmarks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY bookmarks_delete ON imufeed_bookmarks FOR DELETE USING (user_id = auth.uid());

-- Commentaires lisibles par tous, modifiables/supprimables par l'auteur
CREATE POLICY comments_select ON imufeed_comments FOR SELECT USING (true);
CREATE POLICY comments_insert ON imufeed_comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY comments_delete ON imufeed_comments FOR DELETE USING (author_id = auth.uid());

-- Vues : insertable par tous (user ou anonyme)
CREATE POLICY views_insert ON imufeed_views FOR INSERT WITH CHECK (true);
CREATE POLICY views_select ON imufeed_views FOR SELECT USING (true);

-- Follows
CREATE POLICY follows_select ON imufeed_follows FOR SELECT USING (true);
CREATE POLICY follows_insert ON imufeed_follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY follows_delete ON imufeed_follows FOR DELETE USING (follower_id = auth.uid());

-- ─── Triggers ────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION imufeed_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_videos_updated
  BEFORE UPDATE ON imufeed_videos
  FOR EACH ROW EXECUTE FUNCTION imufeed_update_timestamp();

-- Increment/decrement likes_count
CREATE OR REPLACE FUNCTION imufeed_likes_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_videos SET likes_count = likes_count + 1 WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_videos SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_counter
  AFTER INSERT OR DELETE ON imufeed_likes
  FOR EACH ROW EXECUTE FUNCTION imufeed_likes_counter();

-- Increment/decrement comments_count
CREATE OR REPLACE FUNCTION imufeed_comments_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_videos SET comments_count = comments_count + 1 WHERE id = NEW.video_id;
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE imufeed_comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_videos SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.video_id;
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE imufeed_comments SET replies_count = GREATEST(0, replies_count - 1) WHERE id = OLD.parent_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_counter
  AFTER INSERT OR DELETE ON imufeed_comments
  FOR EACH ROW EXECUTE FUNCTION imufeed_comments_counter();

-- Increment views_count
CREATE OR REPLACE FUNCTION imufeed_views_counter()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE imufeed_videos SET views_count = views_count + 1 WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_views_counter
  AFTER INSERT ON imufeed_views
  FOR EACH ROW EXECUTE FUNCTION imufeed_views_counter();

-- Increment bookmarks_count
CREATE OR REPLACE FUNCTION imufeed_bookmarks_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_videos SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_videos SET bookmarks_count = GREATEST(0, bookmarks_count - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookmarks_counter
  AFTER INSERT OR DELETE ON imufeed_bookmarks
  FOR EACH ROW EXECUTE FUNCTION imufeed_bookmarks_counter();

-- Hashtag usage counter on video creation
CREATE OR REPLACE FUNCTION imufeed_hashtag_usage_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE imufeed_hashtags SET usage_count = usage_count + 1 WHERE id = NEW.hashtag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE imufeed_hashtags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.hashtag_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hashtag_usage
  AFTER INSERT OR DELETE ON imufeed_video_hashtags
  FOR EACH ROW EXECUTE FUNCTION imufeed_hashtag_usage_counter();

-- Follows counter on profiles
CREATE OR REPLACE FUNCTION imufeed_follows_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 0) - 1) WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follows_counter
  AFTER INSERT OR DELETE ON imufeed_follows
  FOR EACH ROW EXECUTE FUNCTION imufeed_follows_counter();

-- ─── RPC Functions ───────────────────────────────────────────

-- Feed "Pour Toi" avec signaux pondérés
CREATE OR REPLACE FUNCTION get_imufeed_for_you(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  video_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  duration_ms INTEGER,
  width INTEGER,
  height INTEGER,
  category video_category,
  visibility video_visibility,
  status video_status,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  views_count INTEGER,
  bookmarks_count INTEGER,
  allow_comments BOOLEAN,
  allow_duet BOOLEAN,
  original_video_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_liked BOOLEAN,
  is_bookmarked BOOLEAN,
  score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id, v.author_id, v.video_url, v.thumbnail_url, v.caption,
    v.duration_ms, v.width, v.height, v.category, v.visibility, v.status,
    v.likes_count, v.comments_count, v.shares_count, v.views_count, v.bookmarks_count,
    v.allow_comments, v.allow_duet, v.original_video_id,
    v.created_at, v.updated_at,
    EXISTS(SELECT 1 FROM imufeed_likes l WHERE l.video_id = v.id AND l.user_id = p_user_id) AS is_liked,
    EXISTS(SELECT 1 FROM imufeed_bookmarks b WHERE b.video_id = v.id AND b.user_id = p_user_id) AS is_bookmarked,
    -- Score : récence + engagement + follows
    (
      EXTRACT(EPOCH FROM (now() - v.created_at)) / -86400.0 * 0.3  -- récence (decay)
      + LOG(GREATEST(v.likes_count, 1)) * 0.25
      + LOG(GREATEST(v.comments_count, 1)) * 0.2
      + LOG(GREATEST(v.shares_count, 1)) * 0.15
      + CASE WHEN EXISTS(SELECT 1 FROM imufeed_follows f WHERE f.follower_id = p_user_id AND f.following_id = v.author_id) THEN 2.0 ELSE 0.0 END
      + LOG(GREATEST(v.views_count, 1)) * 0.1
    ) AS score
  FROM imufeed_videos v
  WHERE v.status = 'published'
    AND v.visibility = 'public'
    AND (p_cursor IS NULL OR v.created_at < p_cursor)
  ORDER BY score DESC, v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Feed "Following"
CREATE OR REPLACE FUNCTION get_imufeed_following(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  video_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  duration_ms INTEGER,
  width INTEGER,
  height INTEGER,
  category video_category,
  likes_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  allow_comments BOOLEAN,
  created_at TIMESTAMPTZ,
  is_liked BOOLEAN,
  is_bookmarked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id, v.author_id, v.video_url, v.thumbnail_url, v.caption,
    v.duration_ms, v.width, v.height, v.category,
    v.likes_count, v.comments_count, v.views_count,
    v.allow_comments, v.created_at,
    EXISTS(SELECT 1 FROM imufeed_likes l WHERE l.video_id = v.id AND l.user_id = p_user_id),
    EXISTS(SELECT 1 FROM imufeed_bookmarks b WHERE b.video_id = v.id AND b.user_id = p_user_id)
  FROM imufeed_videos v
  INNER JOIN imufeed_follows f ON f.following_id = v.author_id AND f.follower_id = p_user_id
  WHERE v.status = 'published'
    AND (p_cursor IS NULL OR v.created_at < p_cursor)
  ORDER BY v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ═══════════════════════════════════════════════════════════════
-- Sprint S7B — Algorithme "Pour Toi" (tables complémentaires)
-- ═══════════════════════════════════════════════════════════════

-- Colonnes enrichies sur imufeed_views (engagement tracking)
ALTER TABLE imufeed_views ADD COLUMN IF NOT EXISTS quick_skip BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE imufeed_views ADD COLUMN IF NOT EXISTS is_rewatch BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE imufeed_views ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'for_you';

CREATE INDEX IF NOT EXISTS idx_views_user_video
  ON imufeed_views(user_id, video_id);
CREATE INDEX IF NOT EXISTS idx_views_created
  ON imufeed_views(created_at DESC);

-- Profil d'intérêts utilisateur (cache calculé côté client)
CREATE TABLE IF NOT EXISTS user_interests (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  category_weights JSONB NOT NULL DEFAULT '{}',
  hashtag_weights JSONB NOT NULL DEFAULT '{}',
  top_creator_ids UUID[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY interests_select ON user_interests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY interests_upsert ON user_interests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY interests_update ON user_interests FOR UPDATE USING (user_id = auth.uid());

-- Signal "Pas intéressé"
CREATE TABLE IF NOT EXISTS imufeed_not_interested (
  video_id UUID NOT NULL REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'not_interested'
    CHECK (reason IN ('not_interested', 'repetitive', 'inappropriate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (video_id, user_id)
);

ALTER TABLE imufeed_not_interested ENABLE ROW LEVEL SECURITY;
CREATE POLICY not_interested_select ON imufeed_not_interested FOR SELECT USING (user_id = auth.uid());
CREATE POLICY not_interested_insert ON imufeed_not_interested FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY not_interested_delete ON imufeed_not_interested FOR DELETE USING (user_id = auth.uid());

-- RPC : récupérer les IDs vidéo des abonnements
CREATE OR REPLACE FUNCTION get_subscription_video_ids(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 40
)
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT v.id
  FROM imufeed_videos v
  INNER JOIN imufeed_follows f ON f.following_id = v.author_id AND f.follower_id = p_user_id
  WHERE v.status = 'published' AND v.visibility = 'public'
    AND NOT EXISTS (SELECT 1 FROM imufeed_not_interested ni WHERE ni.video_id = v.id AND ni.user_id = p_user_id)
  ORDER BY v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- RPC : stats d'engagement agrégées par vidéo
CREATE OR REPLACE FUNCTION get_video_engagement_stats(
  p_video_ids UUID[]
)
RETURNS TABLE (video_id UUID, completion_rate FLOAT, view_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vw.video_id,
    AVG(CASE WHEN vw.completed THEN 1.0 ELSE 0.0 END)::FLOAT AS completion_rate,
    COUNT(*)::BIGINT AS view_count
  FROM imufeed_views vw
  WHERE vw.video_id = ANY(p_video_ids)
    AND vw.quick_skip = false
  GROUP BY vw.video_id;
END;
$$ LANGUAGE plpgsql STABLE;
`;
