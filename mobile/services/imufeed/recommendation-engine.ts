/**
 * services/imufeed/recommendation-engine.ts — S19 · IA Recommandation Avancée
 *
 * Étend l'algorithme S7 avec :
 * - Re-ranking par règles métier (safety, boost originaux, clickbait penalty)
 * - Injection de diversité anti-bulle (10-15% exploration)
 * - Cold start (nouvel utilisateur : feed basé sur onboarding + populaire)
 * - Feedback loop enrichi (signaux négatifs détaillés → ajustement poids)
 */

import { createLogger } from "@/services/logger";
import { supabase } from "@/services/supabase";
import type { ImuFeedVideo } from "@/types/imufeed";
import type {
    ColdStartConfig,
    ColdStartStatus,
    DiversityConfig,
    FeedbackWeightAdjustment,
    NegativeFeedbackReason,
    OnboardingCategory,
    ReRankConfig,
    ReRankRule
} from "@/types/recommendation";
import {
    DEFAULT_COLD_START_CONFIG,
    DEFAULT_DIVERSITY_CONFIG,
    DEFAULT_RERANK_CONFIG,
} from "@/types/recommendation";

const logger = createLogger("RecommendationEngine");

// ═══════════════════════════════════════════════════════════════
// RE-RANKING
// ═══════════════════════════════════════════════════════════════

/**
 * Applique les règles métier de re-ranking sur des vidéos déjà scorées.
 * Chaque règle modifie le score via son multiplicateur.
 */
export function applyReRankRules(
    videos: ImuFeedVideo[],
    config: ReRankConfig = DEFAULT_RERANK_CONFIG,
): ImuFeedVideo[] {
    const enabledRules = config.rules.filter((r) => r.enabled);
    if (enabledRules.length === 0) return videos;

    const scored = videos.map((video, _index) => {
        let multiplier = 1;

        for (const rule of enabledRules) {
            multiplier *= getRuleMultiplier(rule, video);
        }

        return { video, adjustedScore: multiplier };
    });

    // Tri par score ajusté décroissant
    scored.sort((a, b) => b.adjustedScore - a.adjustedScore);

    // Appliquer la limite de créateur dans le top-N
    return enforceCreatorLimit(
        scored.map((s) => s.video),
        config.max_same_creator_in_top,
    );
}

function getRuleMultiplier(rule: ReRankRule, video: ImuFeedVideo): number {
    switch (rule.type) {
        case "safety_filter":
            // Les vidéos non publiées ou avec un status suspect sont éliminées
            return video.status !== "published" ? 0 : 1;

        case "boost_original":
            // Booster les vidéos originales (pas de duet/repost)
            return video.original_video_id == null ? rule.multiplier : 1;

        case "boost_verified":
            return video.author.is_verified ? rule.multiplier : 1;

        case "penalize_clickbait": {
            // Ratio likes/views faible = potentiel clickbait
            const views = video.views_count || 1;
            const likeRatio = video.likes_count / views;
            return likeRatio < 0.01 && views > 100 ? rule.multiplier : 1;
        }

        case "dedup_creator":
        case "time_decay":
        case "diversity_inject":
            // Gérés séparément (dedup post-sort, time_decay dans ranking, diversity injection)
            return 1;

        default:
            return 1;
    }
}

/**
 * Limite le nombre de vidéos du même créateur dans le top-N.
 */
function enforceCreatorLimit(
    videos: ImuFeedVideo[],
    maxPerCreator: number,
): ImuFeedVideo[] {
    const creatorCount: Record<string, number> = {};
    const result: ImuFeedVideo[] = [];
    const deferred: ImuFeedVideo[] = [];

    for (const video of videos) {
        const count = creatorCount[video.author.id] ?? 0;
        if (count < maxPerCreator) {
            result.push(video);
            creatorCount[video.author.id] = count + 1;
        } else {
            deferred.push(video);
        }
    }

    // Les vidéos déférées sont ajoutées à la fin
    return [...result, ...deferred];
}

// ═══════════════════════════════════════════════════════════════
// DIVERSITY / ANTI-BUBBLE
// ═══════════════════════════════════════════════════════════════

/**
 * Injecte du contenu hors des intérêts habituels dans le feed.
 * Remplace un pourcentage des vidéos par du contenu exploratoire.
 */
export async function injectDiversity(
    videos: ImuFeedVideo[],
    userCategories: string[],
    config: DiversityConfig = DEFAULT_DIVERSITY_CONFIG,
): Promise<ImuFeedVideo[]> {
    if (videos.length === 0) return videos;

    const explorationCount = Math.max(
        1,
        Math.round(videos.length * config.exploration_ratio),
    );

    // Catégories hors des intérêts habituels
    const allCategories = [
        "entertainment",
        "gaming",
        "music",
        "education",
        "art",
        "cooking",
        "tech",
        "fitness",
        "comedy",
        "travel",
        "fashion",
        "news",
        "sports",
        "other",
    ];
    const explorationCategories = allCategories.filter(
        (c) => !userCategories.includes(c),
    );

    if (explorationCategories.length === 0) return videos;

    // Récupérer des vidéos exploratoires
    const { data: explorationVideos } = await supabase
        .from("imufeed_videos")
        .select("id")
        .eq("status", "published")
        .eq("visibility", "public")
        .in("category", explorationCategories)
        .order("likes_count", { ascending: false })
        .limit(explorationCount * 2);

    if (!explorationVideos || explorationVideos.length === 0) return videos;

    // Prendre un échantillon aléatoire
    const shuffled = explorationVideos.sort(() => Math.random() - 0.5);
    const selectedIds = shuffled
        .slice(0, explorationCount)
        .map((v: { id: string }) => v.id);

    // Charger les vidéos complètes
    const { data: fullVideos } = await supabase
        .from("imufeed_videos")
        .select(
            `*, profiles!author_id(username, display_name, avatar_url, is_verified, followers_count)`,
        )
        .in("id", selectedIds);

    if (!fullVideos || fullVideos.length === 0) return videos;

    // Injecter à des positions réparties dans le feed
    const result = [...videos];
    const injectionVideos = fullVideos.map(
        (row: Record<string, unknown>) => mapExplorationVideo(row),
    );

    for (let i = 0; i < injectionVideos.length; i++) {
        // Insérer après chaque bloc de ~5 vidéos
        const position = Math.min(
            result.length,
            (i + 1) * Math.floor(videos.length / (injectionVideos.length + 1)),
        );
        result.splice(position, 0, injectionVideos[i]);
    }

    return result;
}

function mapExplorationVideo(row: Record<string, unknown>): ImuFeedVideo {
    const profile = row.profiles as Record<string, unknown> | null;
    return {
        id: row.id as string,
        author: {
            id: row.author_id as string,
            username: (profile?.username as string) ?? "",
            display_name: (profile?.display_name as string) ?? null,
            avatar_url: (profile?.avatar_url as string) ?? null,
            is_verified: (profile?.is_verified as boolean) ?? false,
            followers_count: (profile?.followers_count as number) ?? 0,
            is_following: false,
        },
        video_url: row.video_url as string,
        thumbnail_url: (row.thumbnail_url as string) ?? null,
        caption: (row.caption as string) ?? "",
        duration_ms: (row.duration_ms as number) ?? 0,
        width: (row.width as number) ?? 1080,
        height: (row.height as number) ?? 1920,
        sound: null,
        hashtags: [],
        category: (row.category as ImuFeedVideo["category"]) ?? "other",
        visibility: (row.visibility as ImuFeedVideo["visibility"]) ?? "public",
        status: (row.status as ImuFeedVideo["status"]) ?? "published",
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
        created_at: (row.created_at as string) ?? "",
        updated_at: (row.updated_at as string) ?? "",
    };
}

// ═══════════════════════════════════════════════════════════════
// COLD START
// ═══════════════════════════════════════════════════════════════

/**
 * Détermine le statut cold start d'un utilisateur.
 */
export async function getColdStartStatus(
    userId: string,
    config: ColdStartConfig = DEFAULT_COLD_START_CONFIG,
): Promise<ColdStartStatus> {
    // Vérifier si l'utilisateur a fait l'onboarding
    const { data: prefs } = await supabase
        .from("user_preferences")
        .select("onboarding_categories")
        .eq("user_id", userId)
        .single();

    const hasOnboarding =
        prefs?.onboarding_categories &&
        (prefs.onboarding_categories as string[]).length > 0;

    // Compter les vues
    const { count } = await supabase
        .from("imufeed_views")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

    const viewCount = count ?? 0;

    if (viewCount === 0 && !hasOnboarding) return "new_user";
    if (!hasOnboarding) return "onboarding";
    if (viewCount < config.min_views_to_exit) return "warming";
    return "ready";
}

/**
 * Récupère les catégories disponibles pour l'onboarding avec leur nombre de vidéos.
 */
export async function getOnboardingCategories(): Promise<OnboardingCategory[]> {
    const categories = [
        { id: "entertainment", label: "Divertissement", icon: "happy" },
        { id: "gaming", label: "Gaming", icon: "game-controller" },
        { id: "music", label: "Musique", icon: "musical-notes" },
        { id: "education", label: "Éducation", icon: "school" },
        { id: "art", label: "Art & Créativité", icon: "color-palette" },
        { id: "cooking", label: "Cuisine", icon: "restaurant" },
        { id: "tech", label: "Tech", icon: "hardware-chip" },
        { id: "fitness", label: "Sport & Fitness", icon: "fitness" },
        { id: "comedy", label: "Humour", icon: "happy-outline" },
        { id: "travel", label: "Voyage", icon: "airplane" },
        { id: "fashion", label: "Mode & Beauté", icon: "shirt" },
        { id: "news", label: "Actualités", icon: "newspaper" },
        { id: "sports", label: "Sports", icon: "football" },
    ];

    // Récupérer le nombre de vidéos par catégorie
    const { data: counts } = await supabase.rpc("get_video_count_by_category");

    const countMap = new Map<string, number>();
    for (const row of (counts ?? []) as Array<{
        category: string;
        count: number;
    }>) {
        countMap.set(row.category, row.count);
    }

    return categories.map((c) => ({
        ...c,
        video_count: countMap.get(c.id) ?? 0,
    }));
}

/**
 * Sauvegarde les catégories sélectionnées pendant l'onboarding.
 */
export async function saveOnboardingCategories(
    userId: string,
    categories: string[],
): Promise<{ error: string | null }> {
    const { error } = await supabase.from("user_preferences").upsert(
        {
            user_id: userId,
            onboarding_categories: categories,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
    );

    return { error: error?.message ?? null };
}

/**
 * Génère un feed cold start basé sur les catégories populaires + onboarding.
 */
export async function getColdStartFeed(
    userId: string,
    selectedCategories: string[],
    config: ColdStartConfig = DEFAULT_COLD_START_CONFIG,
): Promise<string[]> {
    const onboardingLimit = Math.round(20 * config.onboarding_weight);
    const popularLimit = Math.round(20 * config.popular_weight);

    const ids = new Set<string>();

    // 1. Vidéos dans les catégories sélectionnées
    if (selectedCategories.length > 0) {
        const { data: onboardingVideos } = await supabase
            .from("imufeed_videos")
            .select("id")
            .eq("status", "published")
            .eq("visibility", "public")
            .in("category", selectedCategories)
            .order("likes_count", { ascending: false })
            .limit(onboardingLimit);

        for (const row of (onboardingVideos ?? []) as Array<{ id: string }>) {
            ids.add(row.id);
        }
    }

    // 2. Vidéos populaires globales
    const { data: popularVideos } = await supabase
        .from("imufeed_videos")
        .select("id")
        .eq("status", "published")
        .eq("visibility", "public")
        .order("views_count", { ascending: false })
        .limit(popularLimit);

    for (const row of (popularVideos ?? []) as Array<{ id: string }>) {
        ids.add(row.id);
    }

    return Array.from(ids).slice(0, 20);
}

// ═══════════════════════════════════════════════════════════════
// FEEDBACK LOOP
// ═══════════════════════════════════════════════════════════════

/**
 * Enregistre un signal de feedback négatif enrichi.
 */
export async function recordFeedback(
    videoId: string,
    reason: NegativeFeedbackReason,
    watchDurationMs?: number,
): Promise<{ error: string | null }> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return { error: "Not authenticated" };

    const { error } = await supabase.from("imufeed_feedback").insert({
        video_id: videoId,
        user_id: userId,
        signal_type: "negative",
        reason,
        watch_duration_ms: watchDurationMs ?? null,
        quick_skip: watchDurationMs != null && watchDurationMs < 2000,
    });

    if (error) {
        logger.warn("recordFeedback failed", error.message);
        return { error: error.message };
    }

    // Aussi marquer comme "pas intéressé" pour l'exclusion immédiate
    await supabase.from("imufeed_not_interested").upsert({
        video_id: videoId,
        user_id: userId,
        reason: reason === "inappropriate" ? "inappropriate" : "not_interested",
    });

    return { error: null };
}

/**
 * Calcule les ajustements de poids de catégories basés sur les feedbacks récents.
 */
export async function computeFeedbackAdjustments(
    userId: string,
): Promise<FeedbackWeightAdjustment[]> {
    const { data: feedbacks } = await supabase
        .from("imufeed_feedback")
        .select(
            `reason, imufeed_videos!video_id(category)`,
        )
        .eq("user_id", userId)
        .eq("signal_type", "negative")
        .order("created_at", { ascending: false })
        .limit(100);

    if (!feedbacks || feedbacks.length === 0) return [];

    const categoryPenalties: Record<
        string,
        { total: number; reasons: Set<NegativeFeedbackReason> }
    > = {};

    for (const row of feedbacks) {
        const video = row.imufeed_videos as unknown as Record<string, unknown> | null;
        const category = (video?.category as string) ?? "other";
        const reason = row.reason as NegativeFeedbackReason;

        if (!categoryPenalties[category]) {
            categoryPenalties[category] = { total: 0, reasons: new Set() };
        }

        // Pénalité proportionnelle à la gravité
        const penalty = getPenaltyWeight(reason);
        categoryPenalties[category].total += penalty;
        categoryPenalties[category].reasons.add(reason);
    }

    return Object.entries(categoryPenalties).map(([category, data]) => ({
        category,
        delta: -Math.min(0.5, data.total * 0.05),
        source_reason: Array.from(data.reasons)[0],
    }));
}

function getPenaltyWeight(reason: NegativeFeedbackReason): number {
    switch (reason) {
        case "inappropriate":
            return 3;
        case "misleading":
            return 2;
        case "low_quality":
            return 1.5;
        case "repetitive":
            return 1;
        case "not_interested":
            return 0.8;
        case "already_seen":
            return 0.3;
        case "too_long":
            return 0.5;
        case "not_my_language":
            return 0.5;
        default:
            return 1;
    }
}
