/**
 * types/recommendation.ts — Types S19 · IA Recommandation Avancée
 *
 * Re-ranking règles métier, diversité anti-bulle, cold start,
 * feedback loop enrichi, Alice résumé/recherche vidéo.
 */

// ─── Re-Ranking Rules ────────────────────────────────────────

/** Type de règle de re-ranking */
export type ReRankRuleType =
    | "safety_filter"
    | "dedup_creator"
    | "boost_original"
    | "boost_verified"
    | "penalize_clickbait"
    | "time_decay"
    | "diversity_inject";

/** Règle métier de re-ranking appliquée après le scoring */
export interface ReRankRule {
    type: ReRankRuleType;
    /** Multiplicateur appliqué au score (< 1 pénalise, > 1 boost) */
    multiplier: number;
    /** Active ou non */
    enabled: boolean;
    /** Description lisible */
    description: string;
}

/** Configuration complète du re-ranking */
export interface ReRankConfig {
    rules: ReRankRule[];
    /** Limite de vidéos du même créateur dans le top-N */
    max_same_creator_in_top: number;
}

export const DEFAULT_RERANK_CONFIG: ReRankConfig = {
    rules: [
        {
            type: "safety_filter",
            multiplier: 0,
            enabled: true,
            description: "Exclure le contenu flaggé par la modération IA",
        },
        {
            type: "dedup_creator",
            multiplier: 0.3,
            enabled: true,
            description: "Pénaliser les doublons consécutifs du même créateur",
        },
        {
            type: "boost_original",
            multiplier: 1.5,
            enabled: true,
            description: "Booster le contenu original ImuChat (pas de duet/repost)",
        },
        {
            type: "boost_verified",
            multiplier: 1.2,
            enabled: true,
            description: "Léger boost pour les créateurs vérifiés",
        },
        {
            type: "penalize_clickbait",
            multiplier: 0.5,
            enabled: true,
            description: "Pénaliser le contenu avec un ratio clic/complétion faible",
        },
        {
            type: "time_decay",
            multiplier: 1,
            enabled: true,
            description: "Décroissance temporelle exponentielle (demi-vie 48h)",
        },
        {
            type: "diversity_inject",
            multiplier: 1,
            enabled: true,
            description: "Injection de contenu hors intérêts habituels",
        },
    ],
    max_same_creator_in_top: 2,
};

// ─── Diversity / Anti-Bubble ─────────────────────────────────

/** Configuration de la diversité anti-bulle */
export interface DiversityConfig {
    /** Pourcentage de contenu hors intérêts habituels (0-1) */
    exploration_ratio: number;
    /** Nombre minimum de catégories distinctes dans un feed de 20 */
    min_distinct_categories: number;
    /** Catégories à ne jamais exclure (toujours éligibles à l'injection) */
    always_eligible_categories: string[];
}

export const DEFAULT_DIVERSITY_CONFIG: DiversityConfig = {
    exploration_ratio: 0.12,
    min_distinct_categories: 4,
    always_eligible_categories: ["education", "music", "art"],
};

// ─── Cold Start ──────────────────────────────────────────────

/** Catégorie sélectionnable pendant l'onboarding */
export interface OnboardingCategory {
    id: string;
    label: string;
    icon: string;
    /** Nombre de vidéos disponibles dans cette catégorie */
    video_count: number;
}

/** Statut du cold start */
export type ColdStartStatus = "new_user" | "onboarding" | "warming" | "ready";

/** Configuration cold start */
export interface ColdStartConfig {
    /** Nombre minimum de vues avant de quitter le mode cold start */
    min_views_to_exit: number;
    /** Nombre minimum de catégories à sélectionner pendant l'onboarding */
    min_onboarding_categories: number;
    /** Nombre max de catégories sélectionnables */
    max_onboarding_categories: number;
    /** Poids des catégories populaires en cold start (vs onboarding selections) */
    popular_weight: number;
    /** Poids des sélections onboarding */
    onboarding_weight: number;
}

export const DEFAULT_COLD_START_CONFIG: ColdStartConfig = {
    min_views_to_exit: 30,
    min_onboarding_categories: 3,
    max_onboarding_categories: 8,
    popular_weight: 0.4,
    onboarding_weight: 0.6,
};

// ─── Feedback Loop ───────────────────────────────────────────

/** Raison détaillée du feedback négatif */
export type NegativeFeedbackReason =
    | "not_interested"
    | "repetitive"
    | "inappropriate"
    | "misleading"
    | "low_quality"
    | "already_seen"
    | "too_long"
    | "not_my_language";

/** Signal de feedback enrichi */
export interface FeedbackSignal {
    video_id: string;
    user_id: string;
    /** Type de signal */
    signal_type: "negative" | "positive" | "implicit";
    /** Raison pour les signaux négatifs */
    reason?: NegativeFeedbackReason;
    /** Durée de visionnage avant le signal (ms) */
    watch_duration_ms?: number;
    /** Indique un swipe rapide (< 2s) */
    quick_skip?: boolean;
    created_at: string;
}

/** Ajustement de poids suite au feedback loop */
export interface FeedbackWeightAdjustment {
    category: string;
    /** Delta de poids (-1 à +1) */
    delta: number;
    /** Raison du feedback qui a provoqué l'ajustement */
    source_reason: NegativeFeedbackReason;
}

// ─── Alice Video Features ────────────────────────────────────

/** Résumé de vidéo généré par Alice */
export interface AliceVideoSummary {
    video_id: string;
    /** Résumé texte de la vidéo */
    summary: string;
    /** Points clés extraits */
    key_points: string[];
    /** Durée originale de la vidéo (ms) */
    original_duration_ms: number;
    /** Temps estimé de lecture du résumé (ms) */
    read_time_ms: number;
    /** Langue du résumé */
    language: string;
    generated_at: string;
}

/** Résultat de recherche vidéo via Alice */
export interface AliceVideoSearchResult {
    video_id: string;
    /** Score de pertinence (0-1) */
    relevance_score: number;
    /** Extrait correspondant à la requête */
    match_excerpt: string;
    /** Titre de la vidéo */
    title: string;
    /** Auteur */
    author_username: string;
    /** Thumbnail URL */
    thumbnail_url: string | null;
    /** Catégorie */
    category: string;
}

/** Requête de recherche Alice pour les vidéos */
export interface AliceVideoSearchQuery {
    /** Requête en langage naturel */
    query: string;
    /** Filtrer par catégorie (optionnel) */
    category?: string;
    /** Filtrer par durée max (ms) */
    max_duration_ms?: number;
    /** Nombre max de résultats */
    limit: number;
}

// ─── Store State ─────────────────────────────────────────────

export interface RecommendationStoreState {
    /** Statut du cold start */
    coldStartStatus: ColdStartStatus;
    /** Catégories sélectionnées pendant l'onboarding */
    onboardingCategories: string[];
    /** Catégories disponibles pour l'onboarding */
    availableCategories: OnboardingCategory[];
    /** Config de diversité active */
    diversityConfig: DiversityConfig;
    /** Config re-ranking active */
    rerankConfig: ReRankConfig;
    /** Résumé vidéo en cours */
    currentSummary: AliceVideoSummary | null;
    summaryLoading: boolean;
    /** Résultats de recherche Alice */
    searchResults: AliceVideoSearchResult[];
    searchLoading: boolean;

    // Actions
    loadColdStartStatus: () => Promise<void>;
    selectOnboardingCategory: (categoryId: string) => void;
    removeOnboardingCategory: (categoryId: string) => void;
    completeOnboarding: () => Promise<void>;
    loadAvailableCategories: () => Promise<void>;
    submitFeedback: (
        videoId: string,
        reason: NegativeFeedbackReason,
    ) => Promise<void>;
    summarizeVideo: (videoId: string) => Promise<void>;
    searchVideos: (query: string) => Promise<void>;
}
