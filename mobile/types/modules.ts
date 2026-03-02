/**
 * Types pour le système de modules mobile.
 * Miroir des types web (host-bridge.types.ts) adaptés pour React Native.
 */

/**
 * Manifest d'un module tel que stocké en DB (table `modules`).
 */
export interface StoredModuleManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    category: ModuleCategory;
    icon: string;
    author: string;
    license: string;
    entry_url: string;
    permissions: string[];
    dependencies: string[];
    bundle_size: number;
    checksum: string | null;
    signature: string | null;
    sandbox: 'iframe' | 'webcomponent' | 'worker';
    allowed_domains: string[];
    content_security_policy: string | null;
    max_storage_size: number;
    is_published: boolean;
    is_verified: boolean;
    /** Si true, ce module est installé automatiquement pour les nouveaux utilisateurs */
    default_enabled: boolean;
    /** Si true, ce module s'exécute nativement (pas en iframe sandbox) */
    is_core: boolean;
    publisher_id: string | null;
    download_count: number;
    rating: number;
    price: number | null;
    created_at: string;
    updated_at: string;
}

/**
 * Module installé par un utilisateur (table `user_modules`).
 */
export interface UserInstalledModule {
    id: string;
    user_id: string;
    module_id: string;
    installed_version: string;
    is_active: boolean;
    granted_permissions: string[];
    settings: Record<string, unknown>;
    installed_at: string;
    updated_at: string;
    /** Jointure avec la table modules */
    module?: StoredModuleManifest;
}

/**
 * Catégories de modules.
 */
export type ModuleCategory =
    | 'core'
    | 'social'
    | 'media'
    | 'productivity'
    | 'entertainment'
    | 'education'
    | 'lifestyle'
    | 'finance'
    | 'services'
    | 'creativity'
    | 'communication'
    | 'other';

/**
 * Tabs du Store (catégories affichées à l'utilisateur).
 */
export type StoreTab = 'all' | 'apps' | 'installed' | 'contents' | 'services' | 'bundles';

/**
 * Options de tri du Store.
 */
export type SortOption = 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc';

/**
 * Message de communication entre l'app hôte et une mini-app WebView.
 */
export interface BridgeMessage {
    type: 'request' | 'response' | 'event';
    id: string;
    namespace: string;
    method: string;
    params?: unknown;
    result?: unknown;
    error?: { code: string; message: string };
    appId: string;
}

/**
 * État de chargement d'une mini-app dans MiniAppHostMobile.
 */
export type MiniAppLoadState = 'idle' | 'loading' | 'connected' | 'error';

// ─── Reviews (table `module_reviews`) ─────────────────────

/**
 * Avis utilisateur sur un module (table `module_reviews`).
 */
export interface ModuleReview {
    id: string;
    module_id: string;
    user_id: string;
    rating: number; // 1-5
    comment: string | null;
    created_at: string;
    /** Profil utilisateur joint (display_name, avatar_url) */
    user_profile?: {
        display_name: string | null;
        avatar_url: string | null;
    };
}

/**
 * Formulaire de soumission d'un avis.
 */
export interface ReviewFormData {
    rating: number; // 1-5
    comment?: string;
}

/**
 * Statistiques d'avis pour un module.
 */
export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// ─── Recommandations ──────────────────────────────────────

/**
 * Section de recommandation dans le Store.
 */
export interface RecommendationSection {
    key: 'trending' | 'top_rated' | 'new_releases' | 'for_you';
    titleKey: string; // i18n key
    modules: StoredModuleManifest[];
}

// ─── Notifications Store ──────────────────────────────────

/**
 * Notification liée au Store (nouveau module, mise à jour, etc.).
 */
export interface StoreNotification {
    id: string;
    type: 'new_module' | 'module_update' | 'review_reply' | 'price_drop';
    moduleId: string;
    moduleName: string;
    moduleIcon: string;
    message: string;
    read: boolean;
    createdAt: string;
}
