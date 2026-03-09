/**
 * ImuFeed Algorithm — Moteur "Pour Toi"
 *
 * Implémente le pipeline de recommandation :
 * 1. Tracking d'engagement enrichi (watch time, completion, skip, rewatch)
 * 2. Profil d'intérêts utilisateur (catégories + hashtags pondérés)
 * 3. Recall : sélection de ~100 candidats (abonnements 40% + similaire 30% + trending 30%)
 * 4. Ranking : scoring par pertinence (engagement × freshness × relevance)
 * 5. Dédup : pas 2 vidéos consécutives du même créateur
 * 6. Signal négatif : "Pas intéressé"
 *
 * Sprint S7 Axe B — Algorithme "Pour Toi"
 */

import { createLogger } from '@/services/logger';
import { supabase } from '@/services/supabase';
import type {
    ForYouConfig,
    ImuFeedVideo,
    NotInterestedSignal,
    UserInterest
} from '@/types/imufeed';

const logger = createLogger('ImuFeedAlgorithm');

// ─── Default Config ───────────────────────────────────────────

export const DEFAULT_FOR_YOU_CONFIG: ForYouConfig = {
    subscriptions_weight: 0.4,
    similar_weight: 0.3,
    trending_weight: 0.3,
    recall_limit: 100,
    result_limit: 20,
};

// ─── Engagement Tracking ──────────────────────────────────────

const QUICK_SKIP_THRESHOLD_MS = 2000;

/**
 * Enregistre un événement d'engagement enrichi.
 * Étend le `recordVideoView` existant avec des signaux supplémentaires.
 */
export async function trackEngagement(params: {
    videoId: string;
    watchDurationMs: number;
    completed: boolean;
    videoDurationMs: number;
    source: string;
}): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const quickSkip = params.watchDurationMs < QUICK_SKIP_THRESHOLD_MS;

    // Vérifier si c'est un re-watch
    const { count } = await supabase
        .from('imufeed_views')
        .select('id', { count: 'exact', head: true })
        .eq('video_id', params.videoId)
        .eq('user_id', userId);

    const isRewatch = (count ?? 0) > 0;

    const { error } = await supabase.from('imufeed_views').insert({
        video_id: params.videoId,
        user_id: userId,
        watch_duration_ms: params.watchDurationMs,
        completed: params.completed,
        quick_skip: quickSkip,
        is_rewatch: isRewatch,
        source: params.source,
    });

    if (error) {
        logger.warn('trackEngagement insert failed', error.message);
    }
}

// ─── User Interests ───────────────────────────────────────────

/**
 * Construit le profil d'intérêts à partir de l'historique de visionnage.
 * Pondère par engagement : watch_time, completion, likes.
 */
export async function buildUserInterests(userId: string): Promise<UserInterest> {
    // Récupérer les 500 dernières vues avec les infos vidéo
    const { data: views, error } = await supabase
        .from('imufeed_views')
        .select(`
            video_id,
            watch_duration_ms,
            completed,
            quick_skip,
            imufeed_videos!video_id(
                category,
                author_id,
                duration_ms,
                imufeed_video_hashtags(
                    imufeed_hashtags(name)
                )
            )
        `)
        .eq('user_id', userId)
        .eq('quick_skip', false)
        .order('created_at', { ascending: false })
        .limit(500);

    if (error) {
        logger.warn('buildUserInterests query failed', error.message);
        return emptyInterests(userId);
    }

    const categoryWeights: Record<string, number> = {};
    const hashtagWeights: Record<string, number> = {};
    const creatorScores: Record<string, number> = {};

    for (const view of (views ?? [])) {
        const video = view.imufeed_videos as unknown as Record<string, unknown> | null;
        if (!video) continue;

        const category = video.category as string;
        const authorId = video.author_id as string;
        const videoDurationMs = (video.duration_ms as number) || 1;
        const watchRatio = Math.min(1, (view.watch_duration_ms ?? 0) / videoDurationMs);
        const completionBonus = view.completed ? 1.5 : 1;

        // Score = watchRatio × completionBonus
        const score = watchRatio * completionBonus;

        categoryWeights[category] = (categoryWeights[category] ?? 0) + score;
        creatorScores[authorId] = (creatorScores[authorId] ?? 0) + score;

        // Hashtags
        const junctions = video.imufeed_video_hashtags as Array<{
            imufeed_hashtags: { name: string } | null;
        }> | null;
        if (junctions) {
            for (const j of junctions) {
                const name = j.imufeed_hashtags?.name;
                if (name) {
                    hashtagWeights[name] = (hashtagWeights[name] ?? 0) + score;
                }
            }
        }
    }

    // Top 20 créateurs
    const topCreatorIds = Object.entries(creatorScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([id]) => id);

    return {
        user_id: userId,
        category_weights: categoryWeights as UserInterest['category_weights'],
        hashtag_weights: hashtagWeights,
        top_creator_ids: topCreatorIds,
        updated_at: new Date().toISOString(),
    };
}

function emptyInterests(userId: string): UserInterest {
    return {
        user_id: userId,
        category_weights: {} as UserInterest['category_weights'],
        hashtag_weights: {},
        top_creator_ids: [],
        updated_at: new Date().toISOString(),
    };
}

// ─── Recall Phase ─────────────────────────────────────────────

/**
 * Phase 1 : Sélectionner ~recall_limit candidats
 * - 40% depuis les abonnements
 * - 30% similaires aux intérêts
 * - 30% trending
 */
export async function recallCandidates(
    userId: string,
    interests: UserInterest,
    config: ForYouConfig = DEFAULT_FOR_YOU_CONFIG,
): Promise<string[]> {
    const subLimit = Math.round(config.recall_limit * config.subscriptions_weight);
    const simLimit = Math.round(config.recall_limit * config.similar_weight);
    const trendLimit = Math.round(config.recall_limit * config.trending_weight);

    // Récupérer les IDs "pas intéressé" pour les exclure
    const { data: notInterestedRows } = await supabase
        .from('imufeed_not_interested')
        .select('video_id')
        .eq('user_id', userId);

    const excludeIds = new Set((notInterestedRows ?? []).map((r: { video_id: string }) => r.video_id));

    // 1. Abonnements — dernières vidéos des créateurs suivis
    const { data: subVideos } = await supabase.rpc('get_subscription_video_ids', {
        p_user_id: userId,
        p_limit: subLimit,
    });

    // 2. Similaires — vidéos des catégories préférées
    const topCategories = Object.entries(interests.category_weights)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat);

    const { data: simVideos } = await supabase
        .from('imufeed_videos')
        .select('id')
        .eq('status', 'published')
        .eq('visibility', 'public')
        .in('category', topCategories.length > 0 ? topCategories : ['entertainment'])
        .neq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(simLimit);

    // 3. Trending — vidéos populaires récentes
    const { data: trendVideos } = await supabase
        .from('imufeed_videos')
        .select('id')
        .eq('status', 'published')
        .eq('visibility', 'public')
        .neq('author_id', userId)
        .order('likes_count', { ascending: false })
        .order('views_count', { ascending: false })
        .limit(trendLimit);

    // Combiner et dédupliquer
    const allIds = new Set<string>();
    for (const row of (subVideos ?? []) as Array<{ id: string }>) {
        if (!excludeIds.has(row.id)) allIds.add(row.id);
    }
    for (const row of (simVideos ?? []) as Array<{ id: string }>) {
        if (!excludeIds.has(row.id)) allIds.add(row.id);
    }
    for (const row of (trendVideos ?? []) as Array<{ id: string }>) {
        if (!excludeIds.has(row.id)) allIds.add(row.id);
    }

    return Array.from(allIds).slice(0, config.recall_limit);
}

// ─── Ranking Phase ────────────────────────────────────────────

/**
 * Phase 2 : Scorer et trier les candidats
 * Score = engagement_score × freshness × relevance_to_interests
 */
export async function rankCandidates(
    candidateIds: string[],
    interests: UserInterest,
): Promise<ImuFeedVideo[]> {
    if (candidateIds.length === 0) return [];

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    // Charger toutes les vidéos candidates avec leurs stats
    const { data: videos, error } = await supabase
        .from('imufeed_videos')
        .select(`
            *,
            profiles!author_id(username, display_name, avatar_url, is_verified, followers_count),
            imufeed_sounds(*)
        `)
        .in('id', candidateIds)
        .eq('status', 'published');

    if (error || !videos) {
        logger.warn('rankCandidates query failed', error?.message);
        return [];
    }

    // Charger les stats de complétion agrégées par vidéo
    const { data: viewStats } = await supabase.rpc('get_video_engagement_stats', {
        p_video_ids: candidateIds,
    });

    const statsMap = new Map<string, { completion_rate: number; view_count: number }>();
    for (const row of (viewStats ?? []) as Array<{ video_id: string; completion_rate: number; view_count: number }>) {
        statsMap.set(row.video_id, row);
    }

    // Scorer chaque vidéo
    const scored = videos.map((row: Record<string, unknown>) => {
        const id = row.id as string;
        const category = row.category as string;
        const createdAt = row.created_at as string;
        const likesCount = (row.likes_count as number) || 0;
        const commentsCount = (row.comments_count as number) || 0;
        const viewsCount = (row.views_count as number) || 0;

        // Engagement score
        const stats = statsMap.get(id);
        const completionRate = stats?.completion_rate ?? 0.5;
        const engagementScore = (viewsCount * 0.1) + (likesCount * 1) + (commentsCount * 2);

        // Freshness score (décroît exponentiellement, demi-vie = 48h)
        const ageMs = Date.now() - new Date(createdAt).getTime();
        const ageHours = ageMs / 3_600_000;
        const freshnessScore = Math.exp(-ageHours / 48);

        // Relevance to interests
        const categoryWeight = interests.category_weights[category as keyof typeof interests.category_weights] ?? 0;
        const maxCatWeight = Math.max(1, ...Object.values(interests.category_weights));
        const relevanceScore = 0.5 + 0.5 * (categoryWeight / maxCatWeight);

        const finalScore = engagementScore * completionRate * freshnessScore * relevanceScore;

        return { row, finalScore };
    });

    // Trier par score décroissant
    scored.sort((a, b) => b.finalScore - a.finalScore);

    // Mapper en ImuFeedVideo (réutilise le mapVideoRow de l'api)
    return scored.map((s) => mapVideoRowForAlgo(s.row, userId ?? undefined));
}

// ─── Deduplication ────────────────────────────────────────────

/**
 * Déduplique : pas 2 vidéos consécutives du même créateur
 */
export function deduplicateByCreator(videos: ImuFeedVideo[]): ImuFeedVideo[] {
    const result: ImuFeedVideo[] = [];
    const deferred: ImuFeedVideo[] = [];

    for (const video of videos) {
        const lastCreator = result[result.length - 1]?.author?.id;
        if (lastCreator === video.author.id) {
            deferred.push(video);
        } else {
            result.push(video);
        }
    }

    // Réinsérer les déferred à des positions non-consécutives
    for (const video of deferred) {
        let inserted = false;
        for (let i = 0; i < result.length; i++) {
            const prev = i > 0 ? result[i - 1]?.author?.id : null;
            const curr = result[i]?.author?.id;
            if (prev !== video.author.id && curr !== video.author.id) {
                result.splice(i, 0, video);
                inserted = true;
                break;
            }
        }
        if (!inserted) result.push(video);
    }

    return result;
}

// ─── Not Interested ───────────────────────────────────────────

/**
 * Enregistre un signal "Pas intéressé" pour une vidéo.
 */
export async function markNotInterested(
    videoId: string,
    reason: NotInterestedSignal['reason'] = 'not_interested',
): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase.from('imufeed_not_interested').upsert({
        video_id: videoId,
        user_id: userId,
        reason,
    });

    if (error) {
        logger.error('markNotInterested failed', error.message);
        throw error;
    }
}

// ─── Full Pipeline ────────────────────────────────────────────

/**
 * Pipeline complet "Pour Toi" :
 * 1. Build user interests
 * 2. Recall candidates
 * 3. Rank candidates
 * 4. Deduplicate
 */
export async function getForYouRecommendations(
    config: ForYouConfig = DEFAULT_FOR_YOU_CONFIG,
): Promise<ImuFeedVideo[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
        logger.info('No user, falling back to trending');
        return [];
    }

    try {
        // 1. Build interests
        const interests = await buildUserInterests(userId);

        // 2. Recall
        const candidateIds = await recallCandidates(userId, interests, config);
        if (candidateIds.length === 0) {
            logger.info('No candidates found, falling back to trending');
            return [];
        }

        // 3. Rank
        const ranked = await rankCandidates(candidateIds, interests);

        // 4. Deduplicate
        const deduped = deduplicateByCreator(ranked);

        return deduped.slice(0, config.result_limit);
    } catch (err) {
        logger.error('getForYouRecommendations failed', err);
        return [];
    }
}

// ─── Internal mapper ──────────────────────────────────────────

function mapVideoRowForAlgo(row: Record<string, unknown>, currentUserId?: string): ImuFeedVideo {
    const profile = row.profiles as Record<string, unknown> | null;
    const sound = row.imufeed_sounds as Record<string, unknown> | null;

    return {
        id: row.id as string,
        author: {
            id: row.author_id as string,
            username: (profile?.username as string) ?? '',
            display_name: (profile?.display_name as string) ?? null,
            avatar_url: (profile?.avatar_url as string) ?? null,
            is_verified: (profile?.is_verified as boolean) ?? false,
            followers_count: (profile?.followers_count as number) ?? 0,
            is_following: false,
        },
        video_url: row.video_url as string,
        thumbnail_url: (row.thumbnail_url as string) ?? null,
        caption: (row.caption as string) ?? '',
        duration_ms: (row.duration_ms as number) ?? 0,
        width: (row.width as number) ?? 1080,
        height: (row.height as number) ?? 1920,
        sound: sound
            ? {
                id: sound.id as string,
                title: (sound.title as string) ?? '',
                artist: (sound.artist as string) ?? '',
                audio_url: (sound.audio_url as string) ?? '',
                artwork_url: (sound.artwork_url as string) ?? null,
                duration_ms: (sound.duration_ms as number) ?? 0,
                usage_count: (sound.usage_count as number) ?? 0,
            }
            : null,
        hashtags: [],
        category: (row.category as ImuFeedVideo['category']) ?? 'other',
        visibility: (row.visibility as ImuFeedVideo['visibility']) ?? 'public',
        status: (row.status as ImuFeedVideo['status']) ?? 'published',
        likes_count: (row.likes_count as number) ?? 0,
        comments_count: (row.comments_count as number) ?? 0,
        shares_count: (row.shares_count as number) ?? 0,
        views_count: (row.views_count as number) ?? 0,
        bookmarks_count: (row.bookmarks_count as number) ?? 0,
        is_liked: false,
        is_bookmarked: false,
        allow_comments: (row.allow_comments as boolean) ?? true,
        allow_duet: (row.allow_duet as boolean) ?? true,
        original_video_id: (row.original_video_id as string) ?? null,
        created_at: (row.created_at as string) ?? '',
        updated_at: (row.updated_at as string) ?? '',
    };
}
