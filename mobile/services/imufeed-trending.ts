/**
 * ImuFeed Trending Service — Algorithme de calcul des tendances
 * Sprint S8 Axe B — Explore & Trending
 *
 * Score trending = (usage_24h × 2) + (unique_creators × 5) + (views × 0.001) + (accélération × 10)
 */

import { createLogger } from '@/services/logger';
import type {
    TopCreator,
    TrendingHashtagScore,
    VideoHashtag,
} from '@/types/imufeed';
import { supabase } from './supabase';

const logger = createLogger('ImuFeedTrending');

// ─── Trending Hashtags ────────────────────────────────────────

/**
 * Calcule le score trending : (usage_24h × 2) + (unique_creators × 5) + (views × 0.001) + (accélération × 10)
 * acceleration = usage_24h / max(usage_prev_24h, 1)
 */
export function computeTrendingScore(
    usage24h: number,
    uniqueCreators: number,
    views: number,
    usagePrev24h: number,
): number {
    const acceleration = usage24h / Math.max(usagePrev24h, 1);
    return (usage24h * 2) + (uniqueCreators * 5) + (views * 0.001) + (acceleration * 10);
}

/**
 * Récupère et classe les hashtags trending avec score calculé.
 * Interroge Supabase pour obtenir les métriques des 48 dernières heures.
 */
export async function fetchTrendingHashtagsScored(limit = 20): Promise<TrendingHashtagScore[]> {
    logger.info('fetchTrendingHashtagsScored', { limit });

    const now = new Date();
    const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    // 1. Hashtags actifs (au moins 1 usage ces 48h)
    const { data: activeHashtags, error: hashErr } = await supabase
        .from('imufeed_hashtags')
        .select('id, name, usage_count')
        .gt('usage_count', 0)
        .order('usage_count', { ascending: false })
        .limit(100);

    if (hashErr || !activeHashtags?.length) {
        logger.warn('No active hashtags found', hashErr);
        return [];
    }

    const hashtagIds = activeHashtags.map((h: Record<string, unknown>) => h.id as string);

    // 2. Usage 24h : vidéos avec ce hashtag créées dans les dernières 24h
    const { data: recent24h } = await supabase
        .from('imufeed_video_hashtags')
        .select('hashtag_id, video_id, imufeed_videos!inner(author_id, views_count, created_at)')
        .in('hashtag_id', hashtagIds)
        .gte('imufeed_videos.created_at', h24);

    // 3. Usage 24h-48h : fenêtre précédente pour calculer l'accélération
    const { data: prev24h } = await supabase
        .from('imufeed_video_hashtags')
        .select('hashtag_id, video_id, imufeed_videos!inner(created_at)')
        .in('hashtag_id', hashtagIds)
        .gte('imufeed_videos.created_at', h48)
        .lt('imufeed_videos.created_at', h24);

    // 4. Agréger les métriques par hashtag
    const metricsMap = new Map<string, {
        usage24h: number;
        uniqueCreators: Set<string>;
        views: number;
        usagePrev24h: number;
    }>();

    for (const row of (recent24h ?? []) as Record<string, unknown>[]) {
        const hid = row.hashtag_id as string;
        const video = row.imufeed_videos as Record<string, unknown>;
        if (!metricsMap.has(hid)) {
            metricsMap.set(hid, { usage24h: 0, uniqueCreators: new Set(), views: 0, usagePrev24h: 0 });
        }
        const m = metricsMap.get(hid)!;
        m.usage24h++;
        m.uniqueCreators.add(video.author_id as string);
        m.views += (video.views_count as number) ?? 0;
    }

    for (const row of (prev24h ?? []) as Record<string, unknown>[]) {
        const hid = row.hashtag_id as string;
        if (!metricsMap.has(hid)) {
            metricsMap.set(hid, { usage24h: 0, uniqueCreators: new Set(), views: 0, usagePrev24h: 0 });
        }
        metricsMap.get(hid)!.usagePrev24h++;
    }

    // 5. Calculer les scores et trier
    const scored: TrendingHashtagScore[] = activeHashtags
        .map((h: Record<string, unknown>) => {
            const m = metricsMap.get(h.id as string);
            const usage24h = m?.usage24h ?? 0;
            const uniqueCreators = m?.uniqueCreators.size ?? 0;
            const views = m?.views ?? 0;
            const usagePrev24h = m?.usagePrev24h ?? 0;

            return {
                hashtag_id: h.id as string,
                name: h.name as string,
                score: computeTrendingScore(usage24h, uniqueCreators, views, usagePrev24h),
                usage_24h: usage24h,
                unique_creators: uniqueCreators,
                views,
                acceleration: usage24h / Math.max(usagePrev24h, 1),
            };
        })
        .filter((s: TrendingHashtagScore) => s.score > 0)
        .sort((a: TrendingHashtagScore, b: TrendingHashtagScore) => b.score - a.score)
        .slice(0, limit);

    logger.info('Trending hashtags scored', { count: scored.length });
    return scored;
}

// ─── Top Creators ─────────────────────────────────────────────

/**
 * Classement hebdomadaire des créateurs par likes reçus.
 * Requête : somme des likes reçus sur les vidéos publiées dans les 7 derniers jours.
 */
export async function fetchTopCreatorsWeekly(limit = 10): Promise<TopCreator[]> {
    logger.info('fetchTopCreatorsWeekly', { limit });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Vidéos des 7 derniers jours avec author info
    const { data: recentVideos, error } = await supabase
        .from('imufeed_videos')
        .select('author_id, likes_count, profiles!author_id(username, display_name, avatar_url, is_verified, followers_count)')
        .eq('status', 'published')
        .gte('created_at', weekAgo);

    if (error || !recentVideos?.length) {
        logger.warn('No recent videos for top creators', error);
        return [];
    }

    // Agréger par auteur
    const creatorsMap = new Map<string, {
        profile: Record<string, unknown>;
        weeklyLikes: number;
        weeklyVideos: number;
    }>();

    for (const v of recentVideos as Record<string, unknown>[]) {
        const authorId = v.author_id as string;
        if (!creatorsMap.has(authorId)) {
            creatorsMap.set(authorId, {
                profile: v.profiles as Record<string, unknown>,
                weeklyLikes: 0,
                weeklyVideos: 0,
            });
        }
        const c = creatorsMap.get(authorId)!;
        c.weeklyLikes += (v.likes_count as number) ?? 0;
        c.weeklyVideos++;
    }

    // Vérifier les follows de l'utilisateur courant
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    let followingSet = new Set<string>();

    if (userId) {
        const creatorIds = Array.from(creatorsMap.keys());
        const { data: follows } = await supabase
            .from('imufeed_follows')
            .select('following_id')
            .eq('follower_id', userId)
            .in('following_id', creatorIds);

        followingSet = new Set(
            (follows ?? []).map((f: Record<string, unknown>) => f.following_id as string)
        );
    }

    // Trier par likes et limiter
    const sorted: TopCreator[] = Array.from(creatorsMap.entries())
        .map(([authorId, c]) => ({
            id: authorId,
            username: (c.profile?.username as string) ?? '',
            display_name: (c.profile?.display_name as string) ?? null,
            avatar_url: (c.profile?.avatar_url as string) ?? null,
            is_verified: (c.profile?.is_verified as boolean) ?? false,
            followers_count: (c.profile?.followers_count as number) ?? 0,
            weekly_likes: c.weeklyLikes,
            weekly_videos: c.weeklyVideos,
            is_following: followingSet.has(authorId),
        }))
        .sort((a, b) => b.weekly_likes - a.weekly_likes)
        .slice(0, limit);

    logger.info('Top creators weekly', { count: sorted.length });
    return sorted;
}

// ─── Active Challenges ────────────────────────────────────────

/**
 * Récupère les challenges/hashtags actifs avec fort usage récent.
 * Un "challenge" est un hashtag avec usage_count > 50 et trending.
 */
export async function fetchActiveChallenges(limit = 10): Promise<VideoHashtag[]> {
    logger.info('fetchActiveChallenges', { limit });

    const { data, error } = await supabase
        .from('imufeed_hashtags')
        .select('id, name, usage_count, is_trending')
        .eq('is_trending', true)
        .gt('usage_count', 50)
        .order('usage_count', { ascending: false })
        .limit(limit);

    if (error) {
        logger.warn('fetchActiveChallenges error', error);
        return [];
    }

    return (data ?? []).map((h: Record<string, unknown>) => ({
        id: h.id as string,
        name: h.name as string,
        usage_count: (h.usage_count as number) ?? 0,
        is_trending: true,
    }));
}
