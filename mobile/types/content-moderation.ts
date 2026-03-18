/**
 * S18 — Modération IA : Types pour le pipeline de modération automatique,
 * signalements et outils créateur (ImuFeed / vidéos + commentaires)
 */

// ─── Catégories & Sévérité ─────────────────────────────────────────────────

export type ContentModerationCategory =
    | 'spam'
    | 'harassment'
    | 'hate_speech'
    | 'nsfw'
    | 'violence'
    | 'self_harm'
    | 'misinformation'
    | 'scam'
    | 'copyright'
    | 'impersonation';

export type ModerationSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

// ─── Actions ────────────────────────────────────────────────────────────────

/** Actions de modération IA — alignées avec la roadmap S18 */
export type ContentModerationAction =
    | 'none'
    | 'flag'
    | 'warn'
    | 'restrict'
    | 'shadowban'
    | 'suspend'
    | 'ban';

// ─── Signalements ───────────────────────────────────────────────────────────

/** Raisons de signalement (superset de CommentReportReason) */
export type ReportReason =
    | 'spam'
    | 'harassment'
    | 'hate_speech'
    | 'violence'
    | 'nsfw'
    | 'misinformation'
    | 'copyright'
    | 'impersonation'
    | 'underage'
    | 'other';

/** Types de contenu signalables */
export type ReportableContentType =
    | 'video'
    | 'comment'
    | 'live'
    | 'profile'
    | 'message';

/** Statut d'un signalement */
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

/** Signalement utilisateur */
export interface ContentReport {
    id: string;
    content_id: string;
    content_type: ReportableContentType;
    reporter_id: string;
    reason: ReportReason;
    description: string;
    status: ReportStatus;
    /** Nombre total de signalements pour ce contenu */
    report_count: number;
    created_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
    resolution_action: ContentModerationAction | null;
}

// ─── Analyse IA ─────────────────────────────────────────────────────────────

/** Seuils de confiance IA (roadmap : >0.95, 0.7-0.95, <0.7) */
export interface ConfidenceThresholds {
    auto_block: number;   // 0.95 — blocage automatique
    human_review: number; // 0.70 — review humaine
}

export const DEFAULT_CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
    auto_block: 0.95,
    human_review: 0.70,
};

/** Résultat d'analyse IA d'un contenu */
export interface ContentAnalysisResult {
    content_id: string;
    content_type: ReportableContentType;
    categories: ContentModerationCategory[];
    severity: ModerationSeverity;
    confidence: number;
    suggested_action: ContentModerationAction;
    explanation: string;
    analyzed_at: string;
}

// ─── File de modération ─────────────────────────────────────────────────────

/** Élément de la file de modération admin */
export interface ModerationQueueItem {
    id: string;
    content_id: string;
    content_type: ReportableContentType;
    /** Aperçu du contenu (texte ou thumbnail URL) */
    content_preview: string;
    author_id: string;
    author_username: string;
    reason: ReportReason | 'auto_flagged';
    report_count: number;
    severity: ModerationSeverity;
    ai_confidence: number | null;
    status: ReportStatus;
    created_at: string;
}

/** Entrée du journal de modération */
export interface ModerationLogEntry {
    id: string;
    content_id: string;
    content_type: ReportableContentType;
    moderator_id: string | null;
    action: ContentModerationAction;
    reason: string;
    is_automatic: boolean;
    created_at: string;
}

// ─── Outils créateur ────────────────────────────────────────────────────────

/** Mode de commentaires pour un créateur */
export type CommentMode = 'all' | 'subscribers_only' | 'disabled';

/** Config de modération du créateur */
export interface CreatorModerationSettings {
    user_id: string;
    /** Mots-clés bloqués dans les commentaires */
    blocked_keywords: string[];
    /** Utilisateurs bloqués */
    blocked_users: string[];
    /** Mode de commentaires par défaut */
    comment_mode: CommentMode;
    /** Filtre IA automatique activé */
    auto_filter_enabled: boolean;
}

export const DEFAULT_CREATOR_SETTINGS: CreatorModerationSettings = {
    user_id: '',
    blocked_keywords: [],
    blocked_users: [],
    comment_mode: 'all',
    auto_filter_enabled: true,
};

// ─── Store State ────────────────────────────────────────────────────────────

export interface ContentModerationStoreState {
    /** File d'attente de modération (admin) */
    queue: ModerationQueueItem[];
    queueLoading: boolean;
    /** Journal de modération */
    log: ModerationLogEntry[];
    logLoading: boolean;
    /** Paramètres créateur */
    creatorSettings: CreatorModerationSettings;
    creatorSettingsLoading: boolean;

    // Actions — Queue
    loadQueue: (status?: ReportStatus) => Promise<void>;
    reviewItem: (itemId: string, action: ContentModerationAction, reason: string) => Promise<void>;
    dismissItem: (itemId: string) => Promise<void>;

    // Actions — Log
    loadLog: (limit?: number) => Promise<void>;

    // Actions — Report
    reportContent: (
        contentId: string,
        contentType: ReportableContentType,
        reason: ReportReason,
        description: string,
    ) => Promise<void>;

    // Actions — Creator
    loadCreatorSettings: () => Promise<void>;
    updateBlockedKeywords: (keywords: string[]) => void;
    addBlockedUser: (userId: string) => Promise<void>;
    removeBlockedUser: (userId: string) => Promise<void>;
    setCommentMode: (mode: CommentMode) => void;
    toggleAutoFilter: () => void;
    saveCreatorSettings: () => Promise<void>;

    // Actions — IA
    analyzeContent: (contentId: string, contentType: ReportableContentType) => Promise<ContentAnalysisResult | null>;
}
