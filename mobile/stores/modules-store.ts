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
    installModule as apiInstallModule,
    searchModules as apiSearchModules,
    setModuleActive as apiSetModuleActive,
    uninstallModule as apiUninstallModule,
    autoInstallDefaultModules,
    fetchModuleCatalog,
    fetchUserModules,
} from '@/services/modules-api';
import type { StoredModuleManifest, UserInstalledModule } from '@/types/modules';

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
            }),
        },
    ),
);
