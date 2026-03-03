/**
 * Types pour le Store Développeurs & Créateurs (DEV-034).
 *
 * Couvre : soumission apps, éditeur thèmes, profil créateur,
 * analytics développeur, gestion versioning, API keys.
 */

import type { ModuleCategory, StoredModuleManifest } from "./modules";

// ─── Submission ───────────────────────────────────────────────

/** Statut d'une soumission d'app */
export type SubmissionStatus =
    | "draft"
    | "pending_review"
    | "in_review"
    | "approved"
    | "rejected"
    | "published"
    | "suspended";

/** Motif de rejet */
export interface RejectionReason {
    code: string;
    message: string;
    field?: string;
}

/** Soumission d'une app au store */
export interface AppSubmission {
    id: string;
    developer_id: string;
    name: string;
    description: string;
    short_description: string;
    category: ModuleCategory;
    icon_url: string;
    screenshots: string[];
    version: string;
    changelog: string;
    entry_url: string;
    permissions: string[];
    bundle_size: number;
    price: number | null;
    status: SubmissionStatus;
    rejection_reasons: RejectionReason[];
    submitted_at: string | null;
    reviewed_at: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    /** Module associé (si publié) */
    module?: StoredModuleManifest;
}

/** Formulaire de soumission */
export interface AppSubmissionForm {
    name: string;
    description: string;
    short_description: string;
    category: ModuleCategory;
    icon_url: string;
    screenshots: string[];
    version: string;
    changelog: string;
    entry_url: string;
    permissions: string[];
    price: number | null;
}

/** Version d'une app soumise */
export interface AppVersion {
    id: string;
    submission_id: string;
    version: string;
    changelog: string;
    status: SubmissionStatus;
    bundle_size: number;
    download_count: number;
    created_at: string;
}

// ─── Thèmes ──────────────────────────────────────────────────

/** Palette de couleurs d'un thème */
export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    accent: string;
}

/** Configuration complète d'un thème */
export interface ThemeConfig {
    name: string;
    mode: "light" | "dark";
    colors: ThemeColors;
    borderRadius: number;
    fontFamily: string;
    /** URL preview */
    preview_url: string | null;
}

/** Thème soumis par un créateur */
export interface CreatorTheme {
    id: string;
    creator_id: string;
    name: string;
    description: string;
    config: ThemeConfig;
    icon_url: string;
    screenshots: string[];
    price: number | null;
    status: SubmissionStatus;
    install_count: number;
    rating: number;
    created_at: string;
    updated_at: string;
}

/** Formulaire de création de thème */
export interface ThemeFormData {
    name: string;
    description: string;
    config: ThemeConfig;
    icon_url: string;
    screenshots: string[];
    price: number | null;
}

// ─── Profil Créateur ──────────────────────────────────────────

/** Statut KYC développeur */
export type DevKYCStatus = "not_started" | "pending" | "verified" | "rejected";

/** Profil développeur/créateur */
export interface CreatorProfile {
    id: string;
    user_id: string;
    display_name: string;
    bio: string;
    avatar_url: string | null;
    website: string | null;
    github_url: string | null;
    kyc_status: DevKYCStatus;
    is_verified: boolean;
    total_apps: number;
    total_themes: number;
    total_downloads: number;
    total_revenue: number;
    commission_rate: number;
    joined_at: string;
}

/** Formulaire de mise à jour du profil créateur */
export interface CreatorProfileForm {
    display_name: string;
    bio: string;
    avatar_url: string | null;
    website: string | null;
    github_url: string | null;
}

// ─── Analytics ────────────────────────────────────────────────

/** Période pour les analytics */
export type AnalyticsPeriod = "7d" | "30d" | "90d" | "1y" | "all";

/** Point de donnée temporel */
export interface DataPoint {
    date: string;
    value: number;
}

/** Analytics d'une app */
export interface AppAnalytics {
    app_id: string;
    app_name: string;
    total_downloads: number;
    active_users: number;
    average_rating: number;
    total_reviews: number;
    revenue: number;
    downloads_trend: DataPoint[];
    ratings_trend: DataPoint[];
    revenue_trend: DataPoint[];
}

/** Vue d'ensemble analytics développeur */
export interface DeveloperAnalyticsOverview {
    total_apps: number;
    total_themes: number;
    total_downloads: number;
    total_revenue: number;
    pending_payout: number;
    avg_rating: number;
    downloads_trend: DataPoint[];
    revenue_trend: DataPoint[];
}

// ─── API Keys ─────────────────────────────────────────────────

/** Clé API développeur */
export interface DevAPIKey {
    id: string;
    name: string;
    key_prefix: string;
    permissions: string[];
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
    is_active: boolean;
}

/** Formulaire de création de clé API */
export interface APIKeyForm {
    name: string;
    permissions: string[];
    expires_in_days: number | null;
}

// ─── Webhook ──────────────────────────────────────────────────

/** Webhook développeur */
export interface DevWebhook {
    id: string;
    url: string;
    events: string[];
    secret: string;
    is_active: boolean;
    last_triggered_at: string | null;
    created_at: string;
}

// ─── Documentation ────────────────────────────────────────────

/** Section de la documentation développeur */
export interface DevDocSection {
    id: string;
    title: string;
    slug: string;
    content: string;
    order: number;
    parent_id: string | null;
    children?: DevDocSection[];
}

// ─── Dashboard Hub ────────────────────────────────────────────

/** Activité récente sur le dashboard */
export interface DeveloperActivity {
    id: string;
    type:
    | "submission_created"
    | "submission_approved"
    | "submission_rejected"
    | "version_published"
    | "theme_published"
    | "review_received"
    | "payout_completed";
    title: string;
    description: string;
    created_at: string;
    related_id: string | null;
}

/** Stats résumées pour le dashboard hub */
export interface DashboardStats {
    total_apps: number;
    total_themes: number;
    pending_submissions: number;
    total_downloads: number;
    total_revenue: number;
    pending_payout: number;
    avg_rating: number;
}
