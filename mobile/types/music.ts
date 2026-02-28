/**
 * Types pour le module Music natif.
 * Couvre les pistes audio, playlists, état du lecteur et queue.
 */

/** Un morceau audio */
export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    /** URL audio (Supabase Storage / CDN) */
    audio_url: string;
    /** URL pochette d'album */
    artwork_url: string | null;
    duration_ms: number;
    /** Genre musical */
    genre: string;
    /** Nombre de lectures */
    play_count: number;
    /** Ajouté aux favoris */
    is_liked: boolean;
    created_at: string;
}

/** Une playlist */
export interface Playlist {
    id: string;
    name: string;
    description: string;
    artwork_url: string | null;
    owner_id: string;
    owner_username: string;
    is_public: boolean;
    track_count: number;
    total_duration_ms: number;
    tracks: Track[];
    created_at: string;
    updated_at: string;
}

/** Mode de répétition */
export type RepeatMode = 'off' | 'all' | 'one';

/** État de lecture du player */
export interface PlayerState {
    /** Piste en cours de lecture */
    currentTrack: Track | null;
    /** File d'attente */
    queue: Track[];
    /** Index dans la queue */
    queueIndex: number;
    /** Lecture en cours */
    isPlaying: boolean;
    /** Position actuelle en ms */
    positionMs: number;
    /** Durée totale en ms */
    durationMs: number;
    /** Chargement */
    isBuffering: boolean;
    /** Mode de répétition */
    repeatMode: RepeatMode;
    /** Lecture aléatoire */
    shuffle: boolean;
    /** Volume 0-1 */
    volume: number;
}

/** Section de contenu musical pour la page d'accueil Music */
export interface MusicSection {
    id: string;
    title: string;
    type: 'recently_played' | 'playlists' | 'trending' | 'new_releases' | 'genres';
    items: Track[] | Playlist[];
}

/** Genres musicaux disponibles */
export type MusicGenre =
    | 'pop'
    | 'rock'
    | 'hiphop'
    | 'rnb'
    | 'electronic'
    | 'jazz'
    | 'classical'
    | 'reggae'
    | 'afrobeat'
    | 'kpop'
    | 'jpop'
    | 'latin'
    | 'other';
