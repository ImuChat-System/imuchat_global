/**
 * Dev Store — Zustand store (DEV-034)
 *
 * State for the developer/creator portal:
 *  - App submissions (CRUD, versioning)
 *  - Creator themes (CRUD, editor)
 *  - Creator profile & KYC
 *  - Analytics overview + per-app
 *  - API keys & webhooks
 *  - Dashboard activity feed
 *
 * Phase: P3 Store Dev & Créateurs
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
    AnalyticsPeriod,
    AppAnalytics,
    AppSubmission,
    AppSubmissionForm,
    AppVersion,
    CreatorProfile,
    CreatorProfileForm,
    CreatorTheme,
    DashboardStats,
    DevAPIKey,
    DevWebhook,
    DeveloperActivity,
    DeveloperAnalyticsOverview,
    ThemeFormData,
} from "@/types/dev-store";

// ─── Interfaces ───────────────────────────────────────────────

interface DevStoreState {
    // --- Submissions ---
    submissions: AppSubmission[];
    submissionsLoading: boolean;
    submissionsError: string | null;

    // --- Versions ---
    versions: Record<string, AppVersion[]>;
    versionsLoading: boolean;

    // --- Themes ---
    themes: CreatorTheme[];
    themesLoading: boolean;
    themesError: string | null;

    // --- Profile ---
    profile: CreatorProfile | null;
    profileLoading: boolean;

    // --- Analytics ---
    analyticsOverview: DeveloperAnalyticsOverview | null;
    appAnalytics: Record<string, AppAnalytics>;
    analyticsPeriod: AnalyticsPeriod;
    analyticsLoading: boolean;

    // --- API Keys ---
    apiKeys: DevAPIKey[];
    apiKeysLoading: boolean;

    // --- Webhooks ---
    webhooks: DevWebhook[];
    webhooksLoading: boolean;

    // --- Dashboard ---
    dashboardStats: DashboardStats | null;
    recentActivity: DeveloperActivity[];
    dashboardLoading: boolean;

    // --- Actions: Submissions ---
    fetchSubmissions: () => Promise<void>;
    createSubmission: (form: AppSubmissionForm) => Promise<AppSubmission>;
    updateSubmission: (
        id: string,
        form: Partial<AppSubmissionForm>,
    ) => Promise<void>;
    deleteSubmission: (id: string) => Promise<void>;
    submitForReview: (id: string) => Promise<void>;
    fetchVersions: (submissionId: string) => Promise<void>;
    publishVersion: (submissionId: string, version: string, changelog: string) => Promise<void>;

    // --- Actions: Themes ---
    fetchThemes: () => Promise<void>;
    createTheme: (form: ThemeFormData) => Promise<CreatorTheme>;
    updateTheme: (id: string, form: Partial<ThemeFormData>) => Promise<void>;
    deleteTheme: (id: string) => Promise<void>;
    publishTheme: (id: string) => Promise<void>;

    // --- Actions: Profile ---
    fetchProfile: () => Promise<void>;
    updateProfile: (form: CreatorProfileForm) => Promise<void>;
    startKYC: () => Promise<void>;

    // --- Actions: Analytics ---
    fetchAnalyticsOverview: (period?: AnalyticsPeriod) => Promise<void>;
    fetchAppAnalytics: (appId: string, period?: AnalyticsPeriod) => Promise<void>;
    setAnalyticsPeriod: (period: AnalyticsPeriod) => void;

    // --- Actions: API Keys ---
    fetchAPIKeys: () => Promise<void>;
    createAPIKey: (name: string, permissions: string[]) => Promise<DevAPIKey>;
    revokeAPIKey: (id: string) => Promise<void>;

    // --- Actions: Webhooks ---
    fetchWebhooks: () => Promise<void>;
    createWebhook: (url: string, events: string[]) => Promise<DevWebhook>;
    deleteWebhook: (id: string) => Promise<void>;

    // --- Actions: Dashboard ---
    fetchDashboard: () => Promise<void>;

    // --- Reset ---
    reset: () => void;
}

// ─── Initial state ────────────────────────────────────────────

const initialState = {
    submissions: [] as AppSubmission[],
    submissionsLoading: false,
    submissionsError: null as string | null,
    versions: {} as Record<string, AppVersion[]>,
    versionsLoading: false,
    themes: [] as CreatorTheme[],
    themesLoading: false,
    themesError: null as string | null,
    profile: null as CreatorProfile | null,
    profileLoading: false,
    analyticsOverview: null as DeveloperAnalyticsOverview | null,
    appAnalytics: {} as Record<string, AppAnalytics>,
    analyticsPeriod: "30d" as AnalyticsPeriod,
    analyticsLoading: false,
    apiKeys: [] as DevAPIKey[],
    apiKeysLoading: false,
    webhooks: [] as DevWebhook[],
    webhooksLoading: false,
    dashboardStats: null as DashboardStats | null,
    recentActivity: [] as DeveloperActivity[],
    dashboardLoading: false,
};

// ─── Helpers ──────────────────────────────────────────────────

/** Simulate API delay (placeholder until real API) */
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/** Generate a random ID */
const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Store ────────────────────────────────────────────────────

export const useDevStore = create<DevStoreState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─── Submissions ────────────────────────────────────────

            fetchSubmissions: async () => {
                set({ submissionsLoading: true, submissionsError: null });
                try {
                    await delay();
                    // TODO: Replace with real API call
                    // const data = await api.fetchMySubmissions();
                    set({ submissionsLoading: false });
                } catch (e) {
                    set({
                        submissionsLoading: false,
                        submissionsError: e instanceof Error ? e.message : String(e),
                    });
                }
            },

            createSubmission: async (form) => {
                await delay();
                const now = new Date().toISOString();
                const submission: AppSubmission = {
                    id: uid(),
                    developer_id: "current-user",
                    ...form,
                    bundle_size: 0,
                    status: "draft",
                    rejection_reasons: [],
                    submitted_at: null,
                    reviewed_at: null,
                    published_at: null,
                    created_at: now,
                    updated_at: now,
                };
                set((s) => ({ submissions: [submission, ...s.submissions] }));
                return submission;
            },

            updateSubmission: async (id, form) => {
                await delay();
                set((s) => ({
                    submissions: s.submissions.map((sub) =>
                        sub.id === id
                            ? { ...sub, ...form, updated_at: new Date().toISOString() }
                            : sub,
                    ),
                }));
            },

            deleteSubmission: async (id) => {
                await delay();
                set((s) => ({
                    submissions: s.submissions.filter((sub) => sub.id !== id),
                }));
            },

            submitForReview: async (id) => {
                await delay();
                set((s) => ({
                    submissions: s.submissions.map((sub) =>
                        sub.id === id
                            ? {
                                ...sub,
                                status: "pending_review" as const,
                                submitted_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            }
                            : sub,
                    ),
                }));
            },

            fetchVersions: async (submissionId) => {
                set({ versionsLoading: true });
                try {
                    await delay();
                    // TODO: real API
                    set((s) => ({
                        versionsLoading: false,
                        versions: { ...s.versions, [submissionId]: s.versions[submissionId] || [] },
                    }));
                } catch {
                    set({ versionsLoading: false });
                }
            },

            publishVersion: async (submissionId, version, changelog) => {
                await delay();
                const v: AppVersion = {
                    id: uid(),
                    submission_id: submissionId,
                    version,
                    changelog,
                    status: "published",
                    bundle_size: 0,
                    download_count: 0,
                    created_at: new Date().toISOString(),
                };
                set((s) => ({
                    versions: {
                        ...s.versions,
                        [submissionId]: [v, ...(s.versions[submissionId] || [])],
                    },
                }));
            },

            // ─── Themes ─────────────────────────────────────────────

            fetchThemes: async () => {
                set({ themesLoading: true, themesError: null });
                try {
                    await delay();
                    set({ themesLoading: false });
                } catch (e) {
                    set({
                        themesLoading: false,
                        themesError: e instanceof Error ? e.message : String(e),
                    });
                }
            },

            createTheme: async (form) => {
                await delay();
                const now = new Date().toISOString();
                const theme: CreatorTheme = {
                    id: uid(),
                    creator_id: "current-user",
                    ...form,
                    status: "draft",
                    install_count: 0,
                    rating: 0,
                    created_at: now,
                    updated_at: now,
                };
                set((s) => ({ themes: [theme, ...s.themes] }));
                return theme;
            },

            updateTheme: async (id, form) => {
                await delay();
                set((s) => ({
                    themes: s.themes.map((th) =>
                        th.id === id
                            ? { ...th, ...form, updated_at: new Date().toISOString() }
                            : th,
                    ),
                }));
            },

            deleteTheme: async (id) => {
                await delay();
                set((s) => ({ themes: s.themes.filter((th) => th.id !== id) }));
            },

            publishTheme: async (id) => {
                await delay();
                set((s) => ({
                    themes: s.themes.map((th) =>
                        th.id === id
                            ? {
                                ...th,
                                status: "published" as const,
                                updated_at: new Date().toISOString(),
                            }
                            : th,
                    ),
                }));
            },

            // ─── Profile ────────────────────────────────────────────

            fetchProfile: async () => {
                set({ profileLoading: true });
                try {
                    await delay();
                    // TODO: real API — for now set mock if null
                    const current = get().profile;
                    if (!current) {
                        set({
                            profileLoading: false,
                            profile: {
                                id: uid(),
                                user_id: "current-user",
                                display_name: "",
                                bio: "",
                                avatar_url: null,
                                website: null,
                                github_url: null,
                                kyc_status: "not_started",
                                is_verified: false,
                                total_apps: 0,
                                total_themes: 0,
                                total_downloads: 0,
                                total_revenue: 0,
                                commission_rate: 0.3,
                                joined_at: new Date().toISOString(),
                            },
                        });
                    } else {
                        set({ profileLoading: false });
                    }
                } catch {
                    set({ profileLoading: false });
                }
            },

            updateProfile: async (form) => {
                await delay();
                set((s) => ({
                    profile: s.profile
                        ? { ...s.profile, ...form }
                        : {
                            id: `creator_${Date.now()}`,
                            user_id: "current_user",
                            display_name: form.display_name,
                            bio: form.bio,
                            avatar_url: form.avatar_url ?? null,
                            website: form.website,
                            github_url: form.github_url,
                            kyc_status: "not_started" as const,
                            is_verified: false,
                            total_apps: 0,
                            total_themes: 0,
                            total_downloads: 0,
                            total_revenue: 0,
                            commission_rate: 0.3,
                            joined_at: new Date().toISOString(),
                        },
                }));
            },

            startKYC: async () => {
                await delay();
                set((s) => ({
                    profile: s.profile
                        ? { ...s.profile, kyc_status: "pending" as const }
                        : null,
                }));
            },

            // ─── Analytics ──────────────────────────────────────────

            fetchAnalyticsOverview: async (period) => {
                if (period) set({ analyticsPeriod: period });
                set({ analyticsLoading: true });
                try {
                    await delay();
                    // TODO: real API
                    set({
                        analyticsLoading: false,
                        analyticsOverview: {
                            total_apps: get().submissions.length,
                            total_themes: get().themes.length,
                            total_downloads: 0,
                            total_revenue: 0,
                            pending_payout: 0,
                            avg_rating: 0,
                            downloads_trend: [],
                            revenue_trend: [],
                        },
                    });
                } catch {
                    set({ analyticsLoading: false });
                }
            },

            fetchAppAnalytics: async (appId, period) => {
                if (period) set({ analyticsPeriod: period });
                set({ analyticsLoading: true });
                try {
                    await delay();
                    const sub = get().submissions.find((s) => s.id === appId);
                    set((s) => ({
                        analyticsLoading: false,
                        appAnalytics: {
                            ...s.appAnalytics,
                            [appId]: {
                                app_id: appId,
                                app_name: sub?.name || "Unknown",
                                total_downloads: 0,
                                active_users: 0,
                                average_rating: 0,
                                total_reviews: 0,
                                revenue: 0,
                                downloads_trend: [],
                                ratings_trend: [],
                                revenue_trend: [],
                            },
                        },
                    }));
                } catch {
                    set({ analyticsLoading: false });
                }
            },

            setAnalyticsPeriod: (period) => set({ analyticsPeriod: period }),

            // ─── API Keys ──────────────────────────────────────────

            fetchAPIKeys: async () => {
                set({ apiKeysLoading: true });
                try {
                    await delay();
                    set({ apiKeysLoading: false });
                } catch {
                    set({ apiKeysLoading: false });
                }
            },

            createAPIKey: async (name, permissions) => {
                await delay();
                const key: DevAPIKey = {
                    id: uid(),
                    name,
                    key_prefix: `ik_${uid().slice(0, 8)}`,
                    permissions,
                    last_used_at: null,
                    expires_at: null,
                    created_at: new Date().toISOString(),
                    is_active: true,
                };
                set((s) => ({ apiKeys: [key, ...s.apiKeys] }));
                return key;
            },

            revokeAPIKey: async (id) => {
                await delay();
                set((s) => ({
                    apiKeys: s.apiKeys.map((k) =>
                        k.id === id ? { ...k, is_active: false } : k,
                    ),
                }));
            },

            // ─── Webhooks ──────────────────────────────────────────

            fetchWebhooks: async () => {
                set({ webhooksLoading: true });
                try {
                    await delay();
                    set({ webhooksLoading: false });
                } catch {
                    set({ webhooksLoading: false });
                }
            },

            createWebhook: async (url, events) => {
                await delay();
                const webhook: DevWebhook = {
                    id: uid(),
                    url,
                    events,
                    secret: `whsec_${uid()}`,
                    is_active: true,
                    last_triggered_at: null,
                    created_at: new Date().toISOString(),
                };
                set((s) => ({ webhooks: [webhook, ...s.webhooks] }));
                return webhook;
            },

            deleteWebhook: async (id) => {
                await delay();
                set((s) => ({ webhooks: s.webhooks.filter((w) => w.id !== id) }));
            },

            // ─── Dashboard ─────────────────────────────────────────

            fetchDashboard: async () => {
                set({ dashboardLoading: true });
                try {
                    await delay();
                    const subs = get().submissions;
                    const themes = get().themes;
                    set({
                        dashboardLoading: false,
                        dashboardStats: {
                            total_apps: subs.length,
                            total_themes: themes.length,
                            pending_submissions: subs.filter(
                                (s) => s.status === "pending_review" || s.status === "in_review",
                            ).length,
                            total_downloads: 0,
                            total_revenue: 0,
                            pending_payout: 0,
                            avg_rating: 0,
                        },
                        recentActivity: [],
                    });
                } catch {
                    set({ dashboardLoading: false });
                }
            },

            // ─── Reset ──────────────────────────────────────────────

            reset: () => set(initialState),
        }),
        {
            name: "dev-store-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                submissions: state.submissions,
                themes: state.themes,
                profile: state.profile,
                apiKeys: state.apiKeys,
                webhooks: state.webhooks,
                analyticsPeriod: state.analyticsPeriod,
            }),
        },
    ),
);
