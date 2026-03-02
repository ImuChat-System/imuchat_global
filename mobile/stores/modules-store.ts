/**
 * Modules Store (Zustand + AsyncStorage persist)
 *
 * Gère l'état global du système de modules :
 * - Catalogue complet (depuis Supabase)
 * - Modules installés par l'utilisateur
 * - État de chargement
 * - Actions : fetch, install, uninstall, toggle
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createLogger } from '@/services/logger';
import {
    deleteReview as apiDeleteReview,
    installModule as apiInstallModule,
    searchModules as apiSearchModules,
    setModuleActive as apiSetModuleActive,
    submitReview as apiSubmitReview,
    uninstallModule as apiUninstallModule,
    autoInstallDefaultModules,
    fetchModuleCatalog,
    fetchModuleReviews,
    fetchNewReleases,
    fetchReviewStats,
    fetchTopRatedModules,
    fetchTrendingModules,
    fetchUserModules,
    fetchUserReview,
} from '@/services/modules-api';
import type { ModuleReview, RecommendationSection, ReviewStats, StoredModuleManifest, UserInstalledModule } from '@/types/modules';

const logger = createLogger('ModulesStore');

// ─── Cache TTL ────────────────────────────────────────────────
const CATALOG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const USER_MODULES_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// ─── Interfaces ───────────────────────────────────────────────

interface ModulesState {
    // --- Catalogue ---
    catalog: StoredModuleManifest[];
    catalogLoading: boolean;
    catalogError: string | null;
    catalogFetchedAt: number | null;

    // --- Modules installés ---
    installedModules: UserInstalledModule[];
    installedLoading: boolean;
    installedError: string | null;
    installedFetchedAt: number | null;

    // --- Auto-install ---
    autoInstallComplete: boolean;

    // --- Reviews ---
    reviews: Record<string, ModuleReview[]>;
    reviewStats: Record<string, ReviewStats>;
    userReviews: Record<string, ModuleReview | null>;
    reviewsLoading: boolean;

    // --- Recommandations ---
    recommendations: RecommendationSection[];
    recommendationsLoading: boolean;
    recommendationsFetchedAt: number | null;

    // --- Actions catalogue ---
    fetchCatalog: (force?: boolean) => Promise<void>;
    searchCatalog: (query: string) => Promise<StoredModuleManifest[]>;

    // --- Actions modules installés ---
    fetchInstalled: (force?: boolean) => Promise<void>;
    runAutoInstall: () => Promise<number>;

    // --- Actions CRUD ---
    install: (moduleId: string, permissions?: string[]) => Promise<void>;
    uninstall: (moduleId: string) => Promise<void>;
    toggleActive: (moduleId: string, active: boolean) => Promise<void>;

    // --- Actions reviews ---
    loadReviews: (moduleId: string) => Promise<void>;
    loadUserReview: (moduleId: string) => Promise<void>;
    submitReview: (moduleId: string, rating: number, comment?: string) => Promise<void>;
    removeReview: (moduleId: string) => Promise<void>;

    // --- Actions recommandations ---
    fetchRecommendations: (force?: boolean) => Promise<void>;

    // --- Helpers ---
    isInstalled: (moduleId: string) => boolean;
    isActive: (moduleId: string) => boolean;
    getInstalledModule: (moduleId: string) => UserInstalledModule | undefined;
    getCatalogModule: (moduleId: string) => StoredModuleManifest | undefined;

    // --- Reset ---
    reset: () => void;
}

// ─── Store ────────────────────────────────────────────────────

const initialState = {
    catalog: [] as StoredModuleManifest[],
    catalogLoading: false,
    catalogError: null as string | null,
    catalogFetchedAt: null as number | null,
    installedModules: [] as UserInstalledModule[],
    installedLoading: false,
    installedError: null as string | null,
    installedFetchedAt: null as number | null,
    autoInstallComplete: false,
    reviews: {} as Record<string, ModuleReview[]>,
    reviewStats: {} as Record<string, ReviewStats>,
    userReviews: {} as Record<string, ModuleReview | null>,
    reviewsLoading: false,
    recommendations: [] as RecommendationSection[],
    recommendationsLoading: false,
    recommendationsFetchedAt: null as number | null,
};

export const useModulesStore = create<ModulesState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─── Fetch catalogue ────────────────────────────────
            fetchCatalog: async (force = false) => {
                const state = get();
                // Skip si cache encore valide
                if (
                    !force &&
                    state.catalogFetchedAt &&
                    Date.now() - state.catalogFetchedAt < CATALOG_CACHE_TTL &&
                    state.catalog.length > 0
                ) {
                    logger.debug('Catalog cache still valid, skipping fetch');
                    return;
                }

                set({ catalogLoading: true, catalogError: null });
                try {
                    const catalog = await fetchModuleCatalog();
                    set({
                        catalog,
                        catalogLoading: false,
                        catalogFetchedAt: Date.now(),
                    });
                    logger.info(`Catalog fetched: ${catalog.length} modules`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    set({ catalogLoading: false, catalogError: message });
                    logger.error('Failed to fetch catalog:', message);
                }
            },

            // ─── Recherche catalogue ────────────────────────────
            searchCatalog: async (query: string) => {
                if (!query.trim()) return get().catalog;
                try {
                    return await apiSearchModules(query);
                } catch (error) {
                    logger.error('Search failed:', error);
                    // Fallback : recherche locale sur le catalogue en cache
                    const lowerQuery = query.toLowerCase();
                    return get().catalog.filter(
                        m =>
                            m.name.toLowerCase().includes(lowerQuery) ||
                            m.description.toLowerCase().includes(lowerQuery),
                    );
                }
            },

            // ─── Fetch modules installés ────────────────────────
            fetchInstalled: async (force = false) => {
                const state = get();
                if (
                    !force &&
                    state.installedFetchedAt &&
                    Date.now() - state.installedFetchedAt < USER_MODULES_CACHE_TTL &&
                    state.installedModules.length > 0
                ) {
                    logger.debug('Installed modules cache still valid, skipping fetch');
                    return;
                }

                set({ installedLoading: true, installedError: null });
                try {
                    const installed = await fetchUserModules();
                    set({
                        installedModules: installed,
                        installedLoading: false,
                        installedFetchedAt: Date.now(),
                    });
                    logger.info(`Fetched ${installed.length} installed modules`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    set({ installedLoading: false, installedError: message });
                    logger.error('Failed to fetch installed modules:', message);
                }
            },

            // ─── Auto-install ──────────────────────────────────
            runAutoInstall: async () => {
                if (get().autoInstallComplete) return 0;
                try {
                    const count = await autoInstallDefaultModules();
                    set({ autoInstallComplete: true });
                    if (count > 0) {
                        // Refresh installed after auto-install
                        await get().fetchInstalled(true);
                    }
                    logger.info(`Auto-install complete: ${count} modules`);
                    return count;
                } catch (error) {
                    logger.error('Auto-install failed:', error);
                    return -1;
                }
            },

            // ─── Install ───────────────────────────────────────
            install: async (moduleId: string, permissions?: string[]) => {
                const module = get().getCatalogModule(moduleId);
                const perms = permissions ?? module?.permissions ?? [];
                try {
                    const installed = await apiInstallModule(moduleId, perms);
                    set(state => ({
                        installedModules: [installed, ...state.installedModules.filter(m => m.module_id !== moduleId)],
                        installedFetchedAt: Date.now(),
                    }));
                    logger.info(`Module ${moduleId} installed successfully`);
                } catch (error) {
                    logger.error(`Failed to install module ${moduleId}:`, error);
                    throw error;
                }
            },

            // ─── Uninstall ─────────────────────────────────────
            uninstall: async (moduleId: string) => {
                try {
                    await apiUninstallModule(moduleId);
                    set(state => ({
                        installedModules: state.installedModules.filter(m => m.module_id !== moduleId),
                        installedFetchedAt: Date.now(),
                    }));
                    logger.info(`Module ${moduleId} uninstalled`);
                } catch (error) {
                    logger.error(`Failed to uninstall module ${moduleId}:`, error);
                    throw error;
                }
            },

            // ─── Toggle active ────────────────────────────────
            toggleActive: async (moduleId: string, active: boolean) => {
                try {
                    await apiSetModuleActive(moduleId, active);
                    set(state => ({
                        installedModules: state.installedModules.map(m =>
                            m.module_id === moduleId ? { ...m, is_active: active } : m,
                        ),
                    }));
                    logger.info(`Module ${moduleId} ${active ? 'activated' : 'deactivated'}`);
                } catch (error) {
                    logger.error(`Failed to toggle module ${moduleId}:`, error);
                    throw error;
                }
            },

            // ─── Load reviews ─────────────────────────────────
            loadReviews: async (moduleId: string) => {
                set({ reviewsLoading: true });
                try {
                    const [reviews, stats] = await Promise.all([
                        fetchModuleReviews(moduleId),
                        fetchReviewStats(moduleId),
                    ]);
                    set(state => ({
                        reviews: { ...state.reviews, [moduleId]: reviews },
                        reviewStats: { ...state.reviewStats, [moduleId]: stats },
                        reviewsLoading: false,
                    }));
                } catch (error) {
                    logger.error(`Failed to load reviews for ${moduleId}:`, error);
                    set({ reviewsLoading: false });
                }
            },

            // ─── Load user review ─────────────────────────────
            loadUserReview: async (moduleId: string) => {
                try {
                    const review = await fetchUserReview(moduleId);
                    set(state => ({
                        userReviews: { ...state.userReviews, [moduleId]: review },
                    }));
                } catch (error) {
                    logger.error(`Failed to load user review for ${moduleId}:`, error);
                }
            },

            // ─── Submit review ────────────────────────────────
            submitReview: async (moduleId: string, rating: number, comment?: string) => {
                try {
                    const review = await apiSubmitReview(moduleId, rating, comment);
                    set(state => {
                        // Update reviews list
                        const existing = state.reviews[moduleId] || [];
                        const filtered = existing.filter(r => r.user_id !== review.user_id);
                        return {
                            reviews: { ...state.reviews, [moduleId]: [review, ...filtered] },
                            userReviews: { ...state.userReviews, [moduleId]: review },
                        };
                    });
                    // Refresh stats
                    const stats = await fetchReviewStats(moduleId);
                    set(state => ({
                        reviewStats: { ...state.reviewStats, [moduleId]: stats },
                    }));
                    logger.info(`Review submitted for ${moduleId}`);
                } catch (error) {
                    logger.error(`Failed to submit review for ${moduleId}:`, error);
                    throw error;
                }
            },

            // ─── Remove review ────────────────────────────────
            removeReview: async (moduleId: string) => {
                try {
                    await apiDeleteReview(moduleId);
                    set(state => {
                        const existing = state.reviews[moduleId] || [];
                        const userReview = state.userReviews[moduleId];
                        return {
                            reviews: {
                                ...state.reviews,
                                [moduleId]: userReview
                                    ? existing.filter(r => r.id !== userReview.id)
                                    : existing,
                            },
                            userReviews: { ...state.userReviews, [moduleId]: null },
                        };
                    });
                    // Refresh stats
                    const stats = await fetchReviewStats(moduleId);
                    set(state => ({
                        reviewStats: { ...state.reviewStats, [moduleId]: stats },
                    }));
                    logger.info(`Review removed for ${moduleId}`);
                } catch (error) {
                    logger.error(`Failed to remove review for ${moduleId}:`, error);
                    throw error;
                }
            },

            // ─── Fetch recommendations ────────────────────────
            fetchRecommendations: async (force = false) => {
                const state = get();
                if (
                    !force &&
                    state.recommendationsFetchedAt &&
                    Date.now() - state.recommendationsFetchedAt < CATALOG_CACHE_TTL &&
                    state.recommendations.length > 0
                ) {
                    return;
                }

                set({ recommendationsLoading: true });
                try {
                    const [trending, topRated, newReleases] = await Promise.all([
                        fetchTrendingModules(8),
                        fetchTopRatedModules(8),
                        fetchNewReleases(8),
                    ]);

                    const sections: RecommendationSection[] = [];
                    if (trending.length > 0) {
                        sections.push({ key: 'trending', titleKey: 'store.trending', modules: trending });
                    }
                    if (topRated.length > 0) {
                        sections.push({ key: 'top_rated', titleKey: 'store.topRated', modules: topRated });
                    }
                    if (newReleases.length > 0) {
                        sections.push({ key: 'new_releases', titleKey: 'store.newReleases', modules: newReleases });
                    }

                    set({
                        recommendations: sections,
                        recommendationsLoading: false,
                        recommendationsFetchedAt: Date.now(),
                    });
                    logger.info(`Recommendations fetched: ${sections.length} sections`);
                } catch (error) {
                    logger.error('Failed to fetch recommendations:', error);
                    set({ recommendationsLoading: false });
                }
            },

            // ─── Helpers ───────────────────────────────────────
            isInstalled: (moduleId: string) => {
                return get().installedModules.some(m => m.module_id === moduleId);
            },

            isActive: (moduleId: string) => {
                const installed = get().installedModules.find(m => m.module_id === moduleId);
                return installed ? installed.is_active : false;
            },

            getInstalledModule: (moduleId: string) => {
                return get().installedModules.find(m => m.module_id === moduleId);
            },

            getCatalogModule: (moduleId: string) => {
                return get().catalog.find(m => m.id === moduleId);
            },

            // ─── Reset ─────────────────────────────────────────
            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'imuchat-modules-store',
            storage: createJSONStorage(() => AsyncStorage),
            // Ne persister que le catalogue et les modules installés (pas les états loading)
            partialize: (state) => ({
                catalog: state.catalog,
                catalogFetchedAt: state.catalogFetchedAt,
                installedModules: state.installedModules,
                installedFetchedAt: state.installedFetchedAt,
                autoInstallComplete: state.autoInstallComplete,
                recommendations: state.recommendations,
                recommendationsFetchedAt: state.recommendationsFetchedAt,
            }),
        },
    ),
);
