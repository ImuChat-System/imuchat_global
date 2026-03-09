/**
 * ImuFeed API Service — Client Supabase pour le feed vidéo
 * Sprint S1 Axe B — MVP Feed Foundation
 *
 * CRUD vidéos, likes, bookmarks, commentaires, follows, feed algorithmique.
 * Utilise Supabase direct (tables imufeed_*) + RPC pour les feeds.
 */

import { createLogger } from '@/services/logger';
import type {
    CommentReportReason,
    FeedComment,
    FeedPage,
    FeedSearchResult,
    FeedSource,
    ImuFeedVideo,
    UploadProgress,
    VideoAuthor,
    VideoCategory,
    VideoHashtag,
    VideoSound,
    VideoUploadData,
} from '@/types/imufeed';
import { supabase } from './supabase';

const logger = createLogger('ImuFeedAPI');

// ─── Helpers ──────────────────────────────────────────────────

/** Map un row Supabase vers ImuFeedVideo */
function mapVideoRow(row: Record<string, unknown>, userId?: string): ImuFeedVideo {
    const author: VideoAuthor = {
        id: (row.author_id as string) ?? '',
        username: (row.profiles as Record<string, unknown>)?.username as string ?? '',
        display_name: (row.profiles as Record<string, unknown>)?.display_name as string ?? null,
        avatar_url: (row.profiles as Record<string, unknown>)?.avatar_url as string ?? null,
        is_verified: ((row.profiles as Record<string, unknown>)?.is_verified as boolean) ?? false,
        followers_count: ((row.profiles as Record<string, unknown>)?.followers_count as number) ?? 0,
        is_following: false,
    };

    const sound: VideoSound | null = row.imufeed_sounds
        ? {
            id: (row.imufeed_sounds as Record<string, unknown>).id as string,
            title: (row.imufeed_sounds as Record<string, unknown>).title as string,
            artist: (row.imufeed_sounds as Record<string, unknown>).artist as string,
            audio_url: (row.imufeed_sounds as Record<string, unknown>).audio_url as string,
            artwork_url: (row.imufeed_sounds as Record<string, unknown>).artwork_url as string | null,
            duration_ms: (row.imufeed_sounds as Record<string, unknown>).duration_ms as number,
            usage_count: (row.imufeed_sounds as Record<string, unknown>).usage_count as number,
        }
        : null;

    return {
        id: row.id as string,
        author,
        video_url: row.video_url as string,
        thumbnail_url: (row.thumbnail_url as string) ?? null,
        caption: (row.caption as string) ?? '',
        duration_ms: (row.duration_ms as number) ?? 0,
        width: (row.width as number) ?? 1080,
        height: (row.height as number) ?? 1920,
        sound,
        hashtags: [],
        category: (row.category as VideoCategory) ?? 'other',
        visibility: row.visibility as ImuFeedVideo['visibility'],
        status: row.status as ImuFeedVideo['status'],
        likes_count: (row.likes_count as number) ?? 0,
        comments_count: (row.comments_count as number) ?? 0,
        shares_count: (row.shares_count as number) ?? 0,
        views_count: (row.views_count as number) ?? 0,
        bookmarks_count: (row.bookmarks_count as number) ?? 0,
        is_liked: (row.is_liked as boolean) ?? false,
        is_bookmarked: (row.is_bookmarked as boolean) ?? false,
        allow_comments: (row.allow_comments as boolean) ?? true,
        allow_duet: (row.allow_duet as boolean) ?? true,
        original_video_id: (row.original_video_id as string) ?? null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
    };
}

function mapCommentRow(row: Record<string, unknown>): FeedComment {
    return {
        id: row.id as string,
        video_id: row.video_id as string,
        author: {
            id: (row.author_id as string) ?? '',
            username: (row.profiles as Record<string, unknown>)?.username as string ?? '',
            display_name: (row.profiles as Record<string, unknown>)?.display_name as string ?? null,
            avatar_url: (row.profiles as Record<string, unknown>)?.avatar_url as string ?? null,
            is_verified: false,
            followers_count: 0,
            is_following: false,
        },
        content: row.content as string,
        likes_count: (row.likes_count as number) ?? 0,
        is_liked: false,
        parent_id: (row.parent_id as string) ?? null,
        replies_count: (row.replies_count as number) ?? 0,
        is_pinned: (row.is_pinned as boolean) ?? false,
        created_at: row.created_at as string,
    };
}

// ─── Feed Endpoints ───────────────────────────────────────────

/** Récupère le feed "Pour Toi" (algorithmique) */
export async function fetchForYouFeed(cursor?: string, limit = 20): Promise<FeedPage> {
    logger.info('fetchForYouFeed', { cursor, limit });
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase.rpc('get_imufeed_for_you', {
        p_user_id: userId ?? null,
        p_limit: limit,
        p_cursor: cursor ?? null,
    });

    if (error) {
        logger.error('fetchForYouFeed error', error);
        throw error;
    }

    const videos = (data ?? []).map((row: Record<string, unknown>) => mapVideoRow(row, userId ?? undefined));
    const lastVideo = videos[videos.length - 1];

    return {
        videos,
        cursor: lastVideo?.created_at ?? null,
        hasMore: videos.length === limit,
    };
}

/** Récupère le feed "Following" */
export async function fetchFollowingFeed(cursor?: string, limit = 20): Promise<FeedPage> {
    logger.info('fetchFollowingFeed', { cursor, limit });
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
        return { videos: [], cursor: null, hasMore: false };
    }

    const { data, error } = await supabase.rpc('get_imufeed_following', {
        p_user_id: userId,
        p_limit: limit,
        p_cursor: cursor ?? null,
    });

    if (error) {
        logger.error('fetchFollowingFeed error', error);
        throw error;
    }

    const videos = (data ?? []).map((row: Record<string, unknown>) => mapVideoRow(row, userId));
    const lastVideo = videos[videos.length - 1];

    return {
        videos,
        cursor: lastVideo?.created_at ?? null,
        hasMore: videos.length === limit,
    };
}

/** Récupère les vidéos tendances */
export async function fetchTrendingFeed(cursor?: string, limit = 20): Promise<FeedPage> {
    logger.info('fetchTrendingFeed', { cursor, limit });
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    let query = supabase
        .from('imufeed_videos')
        .select(`
      *,
      profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
      imufeed_sounds(*)
    `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('likes_count', { ascending: false })
        .order('views_count', { ascending: false })
        .limit(limit);

    if (cursor) {
        query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
        logger.error('fetchTrendingFeed error', error);
        throw error;
    }

    const videos = (data ?? []).map((row: Record<string, unknown>) => mapVideoRow(row, userId ?? undefined));
    const lastVideo = videos[videos.length - 1];

    return {
        videos,
        cursor: lastVideo?.created_at ?? null,
        hasMore: videos.length === limit,
    };
}

/** Récupère le feed selon la source */
export async function fetchFeedBySource(
    source: FeedSource,
    cursor?: string,
    limit = 20,
): Promise<FeedPage> {
    switch (source) {
        case 'for_you':
            return fetchForYouFeed(cursor, limit);
        case 'following':
            return fetchFollowingFeed(cursor, limit);
        case 'trending':
            return fetchTrendingFeed(cursor, limit);
        case 'explore':
            return fetchTrendingFeed(cursor, limit);
        default:
            return fetchForYouFeed(cursor, limit);
    }
}

// ─── Video CRUD ───────────────────────────────────────────────

/** Récupère une vidéo par ID */
export async function fetchVideoById(videoId: string): Promise<ImuFeedVideo | null> {
    logger.info('fetchVideoById', { videoId });

    const { data, error } = await supabase
        .from('imufeed_videos')
        .select(`
      *,
      profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
      imufeed_sounds(*)
    `)
        .eq('id', videoId)
        .single();

    if (error) {
        logger.error('fetchVideoById error', error);
        return null;
    }

    return mapVideoRow(data as Record<string, unknown>);
}

/** Upload et publie une vidéo */
export async function uploadVideo(
    data: VideoUploadData,
    onProgress?: (progress: UploadProgress) => void,
): Promise<ImuFeedVideo> {
    logger.info('uploadVideo', { caption: data.caption, category: data.category });

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const videoId = crypto.randomUUID();

    // Stage 1: Upload vidéo vers Supabase Storage
    onProgress?.({ video_id: videoId, stage: 'uploading', percent: 10 });

    const videoExt = data.uri.split('.').pop() ?? 'mp4';
    const videoPath = `imufeed/${userId}/${videoId}.${videoExt}`;

    const response = await fetch(data.uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(videoPath, blob, { contentType: `video/${videoExt}`, upsert: false });

    if (uploadError) {
        onProgress?.({ video_id: videoId, stage: 'error', percent: 0, error: uploadError.message });
        throw uploadError;
    }

    onProgress?.({ video_id: videoId, stage: 'uploading', percent: 60 });

    const { data: publicUrl } = supabase.storage.from('videos').getPublicUrl(videoPath);

    // Stage 2: Upload thumbnail si fourni
    let thumbnailUrl: string | null = null;
    if (data.thumbnail_uri) {
        const thumbPath = `imufeed/${userId}/${videoId}_thumb.jpg`;
        const thumbResponse = await fetch(data.thumbnail_uri);
        const thumbBlob = await thumbResponse.blob();
        await supabase.storage.from('videos').upload(thumbPath, thumbBlob, { contentType: 'image/jpeg' });
        const { data: thumbPublicUrl } = supabase.storage.from('videos').getPublicUrl(thumbPath);
        thumbnailUrl = thumbPublicUrl.publicUrl;
    }

    onProgress?.({ video_id: videoId, stage: 'processing', percent: 80 });

    // Stage 3: Créer/lier les hashtags
    const hashtagIds: string[] = [];
    for (const tag of data.hashtags) {
        const normalizedTag = tag.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (!normalizedTag) continue;

        const { data: existing } = await supabase
            .from('imufeed_hashtags')
            .select('id')
            .eq('name', normalizedTag)
            .single();

        if (existing) {
            hashtagIds.push(existing.id);
        } else {
            const { data: created } = await supabase
                .from('imufeed_hashtags')
                .insert({ name: normalizedTag })
                .select('id')
                .single();
            if (created) hashtagIds.push(created.id);
        }
    }

    // Stage 4: Insérer la vidéo
    const { data: videoRow, error: insertError } = await supabase
        .from('imufeed_videos')
        .insert({
            id: videoId,
            author_id: userId,
            video_url: publicUrl.publicUrl,
            thumbnail_url: thumbnailUrl,
            caption: data.caption,
            category: data.category,
            visibility: data.visibility,
            status: 'published',
            allow_comments: data.allow_comments,
            allow_duet: data.allow_duet,
            sound_id: data.sound_id ?? null,
        })
        .select(`
      *,
      profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
      imufeed_sounds(*)
    `)
        .single();

    if (insertError) {
        onProgress?.({ video_id: videoId, stage: 'error', percent: 0, error: insertError.message });
        throw insertError;
    }

    // Lier hashtags
    if (hashtagIds.length > 0) {
        await supabase.from('imufeed_video_hashtags').insert(
            hashtagIds.map((hid) => ({ video_id: videoId, hashtag_id: hid })),
        );
    }

    onProgress?.({ video_id: videoId, stage: 'complete', percent: 100 });

    return mapVideoRow(videoRow as Record<string, unknown>, userId);
}

/** Supprime une vidéo */
export async function deleteVideo(videoId: string): Promise<void> {
    logger.info('deleteVideo', { videoId });
    const { error } = await supabase.from('imufeed_videos').delete().eq('id', videoId);
    if (error) throw error;
}

// ─── Interactions ─────────────────────────────────────────────

/** Like / unlike une vidéo */
export async function toggleVideoLike(videoId: string, isCurrentlyLiked: boolean): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    if (isCurrentlyLiked) {
        await supabase.from('imufeed_likes').delete().eq('video_id', videoId).eq('user_id', userId);
    } else {
        await supabase.from('imufeed_likes').insert({ video_id: videoId, user_id: userId });
    }
}

/** Bookmark / unbookmark une vidéo */
export async function toggleVideoBookmark(videoId: string, isCurrentlyBookmarked: boolean): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    if (isCurrentlyBookmarked) {
        await supabase.from('imufeed_bookmarks').delete().eq('video_id', videoId).eq('user_id', userId);
    } else {
        await supabase.from('imufeed_bookmarks').insert({ video_id: videoId, user_id: userId });
    }
}

/** Enregistrer une vue */
export async function recordVideoView(videoId: string, watchDurationMs: number, completed: boolean): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    await supabase.from('imufeed_views').insert({
        video_id: videoId,
        user_id: userId ?? null,
        watch_duration_ms: watchDurationMs,
        completed,
    });
}

/** Partager une vidéo (incrémente le compteur) */
export async function shareVideo(videoId: string): Promise<void> {
    await supabase.rpc('increment_field', {
        table_name: 'imufeed_videos',
        field_name: 'shares_count',
        row_id: videoId,
    }).match(() => {
        // fallback si la RPC n'existe pas
        supabase.from('imufeed_videos').update({}).eq('id', videoId);
    });
}

// ─── Comments ─────────────────────────────────────────────────

/** Récupère les commentaires d'une vidéo */
export async function fetchVideoComments(
    videoId: string,
    parentId?: string | null,
    cursor?: string,
    limit = 20,
): Promise<{ comments: FeedComment[]; hasMore: boolean }> {
    let query = supabase
        .from('imufeed_comments')
        .select(`
      *,
      profiles!author_id(username, display_name, avatar_url)
    `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (parentId === undefined || parentId === null) {
        query = query.is('parent_id', null);
    } else {
        query = query.eq('parent_id', parentId);
    }

    if (cursor) {
        query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
        logger.error('fetchVideoComments error', error);
        throw error;
    }

    const comments = (data ?? []).map((row: Record<string, unknown>) => mapCommentRow(row));

    return {
        comments,
        hasMore: comments.length === limit,
    };
}

/** Ajouter un commentaire */
export async function addVideoComment(
    videoId: string,
    content: string,
    parentId?: string,
): Promise<FeedComment> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('imufeed_comments')
        .insert({
            video_id: videoId,
            author_id: userId,
            content,
            parent_id: parentId ?? null,
        })
        .select(`
      *,
      profiles!author_id(username, display_name, avatar_url)
    `)
        .single();

    if (error) throw error;

    return mapCommentRow(data as Record<string, unknown>);
}

/** Supprimer un commentaire */
export async function deleteVideoComment(commentId: string): Promise<void> {
    const { error } = await supabase.from('imufeed_comments').delete().eq('id', commentId);
    if (error) throw error;
}

/** Like / unlike un commentaire */
export async function toggleCommentLike(commentId: string, isCurrentlyLiked: boolean): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    if (isCurrentlyLiked) {
        await supabase.from('imufeed_comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
    } else {
        await supabase.from('imufeed_comment_likes').insert({ comment_id: commentId, user_id: userId });
    }
}

/** Épingler un commentaire (créateur only) */
export async function pinComment(commentId: string, videoId: string): Promise<void> {
    // D'abord unpin tous les commentaires de cette vidéo
    await supabase.from('imufeed_comments').update({ is_pinned: false }).eq('video_id', videoId).eq('is_pinned', true);
    // Puis pin le commentaire ciblé
    const { error } = await supabase.from('imufeed_comments').update({ is_pinned: true }).eq('id', commentId);
    if (error) throw error;
}

/** Désépingler un commentaire */
export async function unpinComment(commentId: string): Promise<void> {
    const { error } = await supabase.from('imufeed_comments').update({ is_pinned: false }).eq('id', commentId);
    if (error) throw error;
}

/** Signaler un commentaire */
export async function reportComment(commentId: string, reason: CommentReportReason): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase.from('imufeed_comment_reports').insert({
        comment_id: commentId,
        reporter_id: userId,
        reason,
    });
    if (error) throw error;
}

// ─── Follows ──────────────────────────────────────────────────

/** Follow / unfollow un créateur */
export async function toggleFollow(targetUserId: string, isCurrentlyFollowing: boolean): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    if (isCurrentlyFollowing) {
        await supabase.from('imufeed_follows').delete().eq('follower_id', userId).eq('following_id', targetUserId);
    } else {
        await supabase.from('imufeed_follows').insert({ follower_id: userId, following_id: targetUserId });
    }
}

/** Vérifie si l'utilisateur suit un créateur */
export async function isFollowing(targetUserId: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return false;

    const { data } = await supabase
        .from('imufeed_follows')
        .select('follower_id')
        .eq('follower_id', userId)
        .eq('following_id', targetUserId)
        .maybeSingle();

    return !!data;
}

// ─── Search & Discovery ───────────────────────────────────────

/** Recherche dans le feed */
export async function searchFeed(query: string, limit = 20): Promise<FeedSearchResult> {
    logger.info('searchFeed', { query });
    const trimmed = query.trim();

    // Recherche hashtags
    const { data: hashtagData } = await supabase
        .from('imufeed_hashtags')
        .select('*')
        .ilike('name', `%${trimmed}%`)
        .order('usage_count', { ascending: false })
        .limit(10);

    // Recherche vidéos par caption
    const { data: videoData } = await supabase
        .from('imufeed_videos')
        .select(`
      *,
      profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
      imufeed_sounds(*)
    `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .ilike('caption', `%${trimmed}%`)
        .order('views_count', { ascending: false })
        .limit(limit);

    // Recherche auteurs
    const { data: authorData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, followers_count')
        .or(`username.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
        .limit(10);

    const hashtags: VideoHashtag[] = (hashtagData ?? []).map((h: Record<string, unknown>) => ({
        id: h.id as string,
        name: h.name as string,
        usage_count: (h.usage_count as number) ?? 0,
        is_trending: (h.is_trending as boolean) ?? false,
    }));

    const videos = (videoData ?? []).map((row: Record<string, unknown>) => mapVideoRow(row));

    const authors: VideoAuthor[] = (authorData ?? []).map((a: Record<string, unknown>) => ({
        id: a.id as string,
        username: (a.username as string) ?? '',
        display_name: (a.display_name as string) ?? null,
        avatar_url: (a.avatar_url as string) ?? null,
        is_verified: (a.is_verified as boolean) ?? false,
        followers_count: (a.followers_count as number) ?? 0,
        is_following: false,
    }));

    return { videos, hashtags, authors };
}

/** Récupère les hashtags tendance */
export async function fetchTrendingHashtags(limit = 20): Promise<VideoHashtag[]> {
    const { data, error } = await supabase
        .from('imufeed_hashtags')
        .select('*')
        .eq('is_trending', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data ?? []).map((h: Record<string, unknown>) => ({
        id: h.id as string,
        name: h.name as string,
        usage_count: (h.usage_count as number) ?? 0,
        is_trending: true,
    }));
}

/** Récupère les vidéos associées à un hashtag (paginé) */
export async function fetchVideosByHashtag(
    tag: string,
    cursor?: string,
    limit = 20,
): Promise<FeedPage> {
    logger.info('fetchVideosByHashtag', { tag });

    // 1. Trouver le hashtag
    const { data: hashtagRow } = await supabase
        .from('imufeed_hashtags')
        .select('id, usage_count')
        .eq('name', tag.toLowerCase())
        .maybeSingle();

    if (!hashtagRow) return { videos: [], cursor: null, hasMore: false };

    // 2. Récupérer les IDs vidéo liés
    let junctionQuery = supabase
        .from('imufeed_video_hashtags')
        .select('video_id')
        .eq('hashtag_id', hashtagRow.id)
        .order('video_id', { ascending: false })
        .limit(limit);

    if (cursor) {
        junctionQuery = junctionQuery.lt('video_id', cursor);
    }

    const { data: junctions } = await junctionQuery;
    const videoIds = (junctions ?? []).map((j: Record<string, unknown>) => j.video_id as string);

    if (videoIds.length === 0) return { videos: [], cursor: null, hasMore: false };

    // 3. Charger les vidéos
    const { data, error } = await supabase
        .from('imufeed_videos')
        .select(`
            *,
            profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
            imufeed_sounds(*)
        `)
        .in('id', videoIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) throw error;

    const videos = (data ?? []).map((row: Record<string, unknown>) => mapVideoRow(row));
    const lastVideo = videos[videos.length - 1];

    return {
        videos,
        cursor: lastVideo?.id ?? null,
        hasMore: videos.length === limit,
    };
}

/** Suivre un hashtag */
export async function followHashtag(hashtagId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('imufeed_hashtag_follows')
        .upsert({ hashtag_id: hashtagId, user_id: userId }, { onConflict: 'hashtag_id,user_id' });

    if (error) throw error;
    logger.info('followHashtag', { hashtagId });
}

/** Ne plus suivre un hashtag */
export async function unfollowHashtag(hashtagId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('imufeed_hashtag_follows')
        .delete()
        .eq('hashtag_id', hashtagId)
        .eq('user_id', userId);

    if (error) throw error;
    logger.info('unfollowHashtag', { hashtagId });
}

/** Récupère les vidéos d'un utilisateur */
export async function fetchUserVideos(userId: string, cursor?: string, limit = 20): Promise<FeedPage> {
    let query = supabase
        .from('imufeed_videos')
        .select(`
      *,
      profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
      imufeed_sounds(*)
    `)
        .eq('author_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (cursor) {
        query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw error;

    const videos = (data ?? []).map((row: Record<string, unknown>) => mapVideoRow(row, userId));
    const lastVideo = videos[videos.length - 1];

    return {
        videos,
        cursor: lastVideo?.created_at ?? null,
        hasMore: videos.length === limit,
    };
}

/** Récupère les vidéos bookmarkées */
export async function fetchBookmarkedVideos(cursor?: string, limit = 20): Promise<FeedPage> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return { videos: [], cursor: null, hasMore: false };

    let query = supabase
        .from('imufeed_bookmarks')
        .select(`
      created_at,
      imufeed_videos(
        *,
        profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
        imufeed_sounds(*)
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (cursor) {
        query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw error;

    const videos = (data ?? [])
        .filter((row: Record<string, unknown>) => row.imufeed_videos)
        .map((row: Record<string, unknown>) => {
            const video = mapVideoRow(row.imufeed_videos as Record<string, unknown>, userId);
            video.is_bookmarked = true;
            return video;
        });

    const lastRow = data?.[data.length - 1];

    return {
        videos,
        cursor: (lastRow as Record<string, unknown>)?.created_at as string ?? null,
        hasMore: videos.length === limit,
    };
}
