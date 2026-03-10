/**
 * Sound Service — API ImuFeed Sounds
 *
 * Gestion des sons/musiques pour l'éditeur vidéo :
 * - Bibliothèque (trending, par genre)
 * - Recherche
 * - Incrémentation d'usage
 * - Vidéos utilisant un son donné
 *
 * Sprint S9 Axe B — Musique & Son
 */

import { createLogger } from '@/services/logger';
import { supabase } from '@/services/supabase';
import type { ImuFeedVideo, VideoSound } from '@/types/imufeed';

const logger = createLogger('SoundService');

// ─── Fetch trending sounds ────────────────────────────────────

/**
 * Récupère les sons tendance (triés par usage_count DESC).
 */
export async function fetchTrendingSounds(limit: number = 20): Promise<VideoSound[]> {
    const { data, error } = await supabase.rpc('get_trending_sounds', {
        p_limit: limit,
    });

    if (error) {
        logger.error('Failed to fetch trending sounds:', error.message);
        return [];
    }

    return (data ?? []).map(mapSoundRow);
}

// ─── Fetch sounds by genre ────────────────────────────────────

/**
 * Récupère les sons d'un genre spécifique.
 */
export async function fetchSoundsByGenre(genre: string, limit: number = 20): Promise<VideoSound[]> {
    const { data, error } = await supabase
        .from('imufeed_sounds')
        .select('*')
        .eq('genre', genre)
        .order('usage_count', { ascending: false })
        .limit(limit);

    if (error) {
        logger.error(`Failed to fetch sounds for genre ${genre}:`, error.message);
        return [];
    }

    return (data ?? []).map(mapSoundRow);
}

// ─── Search sounds ────────────────────────────────────────────

/**
 * Recherche de sons par titre ou artiste.
 */
export async function searchSounds(query: string, limit: number = 20): Promise<VideoSound[]> {
    const { data, error } = await supabase
        .from('imufeed_sounds')
        .select('*')
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(limit);

    if (error) {
        logger.error(`Failed to search sounds "${query}":`, error.message);
        return [];
    }

    return (data ?? []).map(mapSoundRow);
}

// ─── Fetch sound by ID ───────────────────────────────────────

export async function fetchSoundById(soundId: string): Promise<VideoSound | null> {
    const { data, error } = await supabase
        .from('imufeed_sounds')
        .select('*')
        .eq('id', soundId)
        .single();

    if (error) {
        logger.error(`Failed to fetch sound ${soundId}:`, error.message);
        return null;
    }

    return data ? mapSoundRow(data) : null;
}

// ─── Fetch videos by sound ───────────────────────────────────

/**
 * Récupère les vidéos qui utilisent un son donné.
 */
export async function fetchVideosBySound(
    soundId: string,
    limit: number = 20,
): Promise<ImuFeedVideo[]> {
    const { data, error } = await supabase
        .from('imufeed_videos')
        .select(`
            *,
            author:profiles!user_id(id, username, display_name, avatar_url, is_verified, followers_count),
            sound:imufeed_sounds!sound_id(id, title, artist, audio_url, artwork_url, duration_ms, usage_count, genre, is_original)
        `)
        .eq('sound_id', soundId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        logger.error(`Failed to fetch videos for sound ${soundId}:`, error.message);
        return [];
    }

    return (data ?? []).map(mapVideoRow);
}

// ─── Increment sound usage ────────────────────────────────────

export async function incrementSoundUsage(soundId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_sound_usage', {
        p_sound_id: soundId,
    });

    if (error) {
        logger.error(`Failed to increment sound usage ${soundId}:`, error.message);
    }
}

// ─── Available genres ─────────────────────────────────────────

export const SOUND_GENRES = [
    'trending',
    'electronic',
    'hiphop',
    'pop',
    'jpop',
    'kpop',
    'afrobeat',
    'classical',
    'rock',
    'rnb',
    'reggaeton',
    'other',
] as const;

export type SoundGenre = (typeof SOUND_GENRES)[number];

// ─── Mappers ──────────────────────────────────────────────────

function mapSoundRow(row: Record<string, unknown>): VideoSound {
    return {
        id: row.id as string,
        title: row.title as string,
        artist: row.artist as string,
        audio_url: row.audio_url as string,
        artwork_url: (row.artwork_url as string) ?? null,
        duration_ms: row.duration_ms as number,
        usage_count: row.usage_count as number,
        genre: (row.genre as string) ?? 'other',
        is_original: (row.is_original as boolean) ?? false,
        original_video_id: (row.original_video_id as string) ?? null,
    };
}

function mapVideoRow(row: Record<string, unknown>): ImuFeedVideo {
    const author = row.author as Record<string, unknown> | null;
    const sound = row.sound as Record<string, unknown> | null;
    return {
        id: row.id as string,
        author: {
            id: author?.id as string ?? '',
            username: author?.username as string ?? '',
            display_name: author?.display_name as string ?? null,
            avatar_url: author?.avatar_url as string ?? null,
            is_verified: author?.is_verified as boolean ?? false,
            followers_count: author?.followers_count as number ?? 0,
            is_following: false,
        },
        video_url: row.video_url as string,
        thumbnail_url: (row.thumbnail_url as string) ?? null,
        description: (row.description as string) ?? '',
        sound: sound ? mapSoundRow(sound) : null,
        hashtags: [],
        likes_count: (row.likes_count as number) ?? 0,
        comments_count: (row.comments_count as number) ?? 0,
        shares_count: (row.shares_count as number) ?? 0,
        views_count: (row.views_count as number) ?? 0,
        bookmarks_count: (row.bookmarks_count as number) ?? 0,
        is_liked: false,
        is_bookmarked: false,
        category: (row.category as string) ?? 'other',
        visibility: (row.visibility as string) ?? 'public',
        status: (row.status as string) ?? 'published',
        created_at: row.created_at as string,
    } as unknown as ImuFeedVideo;
}
