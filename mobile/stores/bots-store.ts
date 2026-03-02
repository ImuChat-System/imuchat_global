/**
 * Bots Store — DEV-025 : Bots de groupe
 *
 * Zustand + AsyncStorage persist pour le module bots.
 * Gère catalogue, installation, commandes, quiz, modération.
 *
 * Phase 3 — Groupe 9 IA (fonc. 5/5)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
    executeBotCommand,
    fetchAllUserBots,
    fetchBotCatalog,
    fetchBotEvents,
    fetchInstalledBots,
    fetchModerationLogs,
    getActiveQuizSession,
    getBotById,
    installBot,
    parseBotCommand,
    searchBots,
    uninstallBot,
    updateBotConfig,
    updateBotStatus,
} from '@/services/bots-api';

import {
    analyzeMessage,
    getDefaultModerationConfig,
    incrementWarnings,
    isAutoModerationActive,
} from '@/services/content-filter';

import type {
    BotCommandResult,
    BotDefinition,
    BotEvent,
    BotInstance,
    BotStatus,
    BotsSection,
    ContentAnalysisResult,
    ModerationBotConfig,
    ModerationLog,
    QuizSession,
} from '@/types/bots';

// ─── Mock data (fallback quand Supabase inaccessible) ────────────
const MOCK_CATALOG: BotDefinition[] = [];
// On utilisera OFFICIAL_BOTS depuis bots-api.ts comme fallback via fetchBotCatalog()

// ─── Store interface ──────────────────────────────────────────────
interface BotsStore {
    // State
    catalog: BotDefinition[];
    installedBots: BotInstance[];
    activeQuizSession: QuizSession | null;
    recentModerationLogs: ModerationLog[];
    recentEvents: BotEvent[];
    selectedSection: BotsSection;
    currentConversationId: string | null;
    isLoading: boolean;
    error: string | null;

    // Auto-modération state
    /** Configs d'auto-modération par conversationId */
    autoModerationConfigs: Record<string, ModerationBotConfig>;
    /** Dernier résultat d'analyse (pour feedback UI) */
    lastAnalysisResult: ContentAnalysisResult | null;
    /** Statistiques d'auto-modération par conversation */
    autoModStats: Record<string, { blocked: number; warned: number; flagged: number }>;

    // Catalog actions
    loadCatalog: () => Promise<void>;
    searchCatalog: (query: string) => BotDefinition[];

    // Installation actions
    loadInstalledBots: (conversationId: string) => Promise<void>;
    loadAllUserBots: () => Promise<void>;
    install: (botId: string, conversationId: string) => Promise<boolean>;
    uninstall: (instanceId: string) => Promise<boolean>;

    // Configuration actions
    updateConfig: (instanceId: string, config: Record<string, unknown>) => Promise<boolean>;
    changeStatus: (instanceId: string, status: BotStatus) => Promise<boolean>;

    // Command execution
    handleChatMessage: (
        conversationId: string,
        message: string,
        userId: string,
        userName: string,
    ) => Promise<BotCommandResult | null>;

    // Quiz actions
    loadActiveQuiz: (conversationId: string) => Promise<void>;

    // Moderation actions
    loadModerationLogs: (conversationId: string) => Promise<void>;

    // Auto-modération actions
    /** Mettre à jour la config d'auto-modération d'une conversation */
    updateAutoModConfig: (conversationId: string, config: Partial<ModerationBotConfig>) => void;
    /** Obtenir la config d'auto-modération pour une conversation */
    getAutoModConfig: (conversationId: string) => ModerationBotConfig;
    /** Analyser un message entrant (retourne le résultat) */
    analyzeIncomingMessage: (
        content: string,
        conversationId: string,
        userId: string,
    ) => ContentAnalysisResult;
    /** Vérifier si l'auto-modération est active pour une conversation */
    isAutoModActive: (conversationId: string) => boolean;
    /** Réinitialiser la config d'auto-modération d'une conversation */
    resetAutoModConfig: (conversationId: string) => void;

    // Events
    loadBotEvents: (instanceId: string) => Promise<void>;

    // Navigation
    setSection: (section: BotsSection) => void;
    setConversation: (conversationId: string) => void;

    // Helpers
    getBotDefinition: (botId: string) => BotDefinition | null;
    getInstalledBotsForConversation: (conversationId: string) => BotInstance[];
    isCommandAvailable: (conversationId: string, commandName: string) => boolean;

    // Clear
    clearError: () => void;
    reset: () => void;
}

// ─── Zustand store ────────────────────────────────────────────────
export const useBotsStore = create<BotsStore>()(
    persist(
        (set, get) => ({
            catalog: [],
            installedBots: [],
            activeQuizSession: null,
            recentModerationLogs: [],
            recentEvents: [],
            selectedSection: 'catalog',
            currentConversationId: null,
            isLoading: false,
            error: null,
            autoModerationConfigs: {},
            lastAnalysisResult: null,
            autoModStats: {},

            // ── Catalogue ────────────────────────────────────────────
            loadCatalog: async () => {
                set({ isLoading: true, error: null });
                try {
                    const catalog = await fetchBotCatalog();
                    set({ catalog, isLoading: false });
                } catch (err) {
                    console.warn('[BotsStore] loadCatalog fallback:', err);
                    // Le catalogue officiel est en mémoire, fetchBotCatalog() ne devrait pas échouer
                    const catalog = await fetchBotCatalog();
                    set({ catalog, isLoading: false });
                }
            },

            searchCatalog: (query) => {
                return searchBots(query);
            },

            // ── Installation ─────────────────────────────────────────
            loadInstalledBots: async (conversationId) => {
                set({ isLoading: true, error: null });
                try {
                    const installedBots = await fetchInstalledBots(conversationId);
                    set({ installedBots, isLoading: false });
                } catch (err) {
                    console.warn('[BotsStore] loadInstalledBots error:', err);
                    set({ installedBots: [], isLoading: false });
                }
            },

            loadAllUserBots: async () => {
                set({ isLoading: true, error: null });
                try {
                    const installedBots = await fetchAllUserBots();
                    set({ installedBots, isLoading: false });
                } catch (err) {
                    console.warn('[BotsStore] loadAllUserBots error:', err);
                    set({ isLoading: false });
                }
            },

            install: async (botId, conversationId) => {
                set({ error: null });
                try {
                    const instance = await installBot(botId, conversationId);
                    const { installedBots } = get();
                    set({ installedBots: [instance, ...installedBots] });
                    return true;
                } catch (err) {
                    set({ error: (err as Error).message });
                    return false;
                }
            },

            uninstall: async (instanceId) => {
                set({ error: null });
                try {
                    await uninstallBot(instanceId);
                    const { installedBots } = get();
                    set({
                        installedBots: installedBots.filter(b => b.id !== instanceId),
                    });
                    return true;
                } catch (err) {
                    set({ error: (err as Error).message });
                    return false;
                }
            },

            // ── Configuration ────────────────────────────────────────
            updateConfig: async (instanceId, config) => {
                set({ error: null });
                try {
                    const updated = await updateBotConfig(instanceId, config);
                    const { installedBots } = get();
                    set({
                        installedBots: installedBots.map(b =>
                            b.id === instanceId ? updated : b
                        ),
                    });
                    return true;
                } catch (err) {
                    set({ error: (err as Error).message });
                    return false;
                }
            },

            changeStatus: async (instanceId, status) => {
                set({ error: null });
                try {
                    const updated = await updateBotStatus(instanceId, status);
                    const { installedBots } = get();
                    set({
                        installedBots: installedBots.map(b =>
                            b.id === instanceId ? updated : b
                        ),
                    });
                    return true;
                } catch (err) {
                    set({ error: (err as Error).message });
                    return false;
                }
            },

            // ── Commandes ────────────────────────────────────────────
            handleChatMessage: async (conversationId, message, userId, userName) => {
                const parsed = parseBotCommand(message);
                if (!parsed) return null; // Pas une commande bot

                try {
                    const result = await executeBotCommand(
                        conversationId,
                        parsed.commandName,
                        parsed.args,
                        userId,
                        userName,
                    );
                    return result;
                } catch (err) {
                    return {
                        success: false,
                        error: (err as Error).message,
                    };
                }
            },

            // ── Quiz ─────────────────────────────────────────────────
            loadActiveQuiz: async (conversationId) => {
                try {
                    const session = await getActiveQuizSession(conversationId);
                    set({ activeQuizSession: session });
                } catch (err) {
                    console.warn('[BotsStore] loadActiveQuiz error:', err);
                }
            },

            // ── Modération ───────────────────────────────────────────
            loadModerationLogs: async (conversationId) => {
                try {
                    const logs = await fetchModerationLogs(conversationId);
                    set({ recentModerationLogs: logs });
                } catch (err) {
                    console.warn('[BotsStore] loadModerationLogs error:', err);
                }
            },

            // ── Auto-modération ──────────────────────────────────────
            updateAutoModConfig: (conversationId, config) => {
                const { autoModerationConfigs } = get();
                const existing = autoModerationConfigs[conversationId] ?? getDefaultModerationConfig();
                set({
                    autoModerationConfigs: {
                        ...autoModerationConfigs,
                        [conversationId]: { ...existing, ...config },
                    },
                });
            },

            getAutoModConfig: (conversationId) => {
                return get().autoModerationConfigs[conversationId] ?? getDefaultModerationConfig();
            },

            analyzeIncomingMessage: (content, conversationId, userId) => {
                const config = get().getAutoModConfig(conversationId);
                const result = analyzeMessage(content, config, userId, conversationId);

                // Mettre à jour les stats
                if (!result.passed) {
                    const { autoModStats } = get();
                    const stats = autoModStats[conversationId] ?? { blocked: 0, warned: 0, flagged: 0 };

                    if (result.suggestedAction === 'warn') {
                        stats.warned += 1;
                        incrementWarnings(userId, conversationId);
                    } else if (result.flagged) {
                        stats.flagged += 1;
                    } else {
                        stats.blocked += 1;
                    }

                    set({
                        lastAnalysisResult: result,
                        autoModStats: { ...autoModStats, [conversationId]: { ...stats } },
                    });
                } else {
                    set({ lastAnalysisResult: result });
                }

                return result;
            },

            isAutoModActive: (conversationId) => {
                const config = get().autoModerationConfigs[conversationId];
                if (!config) return false;
                return isAutoModerationActive(config);
            },

            resetAutoModConfig: (conversationId) => {
                const { autoModerationConfigs } = get();
                const updatedConfigs = { ...autoModerationConfigs };
                delete updatedConfigs[conversationId];
                set({ autoModerationConfigs: updatedConfigs });
            },

            // ── Events ───────────────────────────────────────────────
            loadBotEvents: async (instanceId) => {
                try {
                    const events = await fetchBotEvents(instanceId);
                    set({ recentEvents: events });
                } catch (err) {
                    console.warn('[BotsStore] loadBotEvents error:', err);
                }
            },

            // ── Navigation ───────────────────────────────────────────
            setSection: (section) => set({ selectedSection: section }),

            setConversation: (conversationId) => set({ currentConversationId: conversationId }),

            // ── Helpers ──────────────────────────────────────────────
            getBotDefinition: (botId) => {
                return getBotById(botId);
            },

            getInstalledBotsForConversation: (conversationId) => {
                return get().installedBots.filter(b => b.conversationId === conversationId);
            },

            isCommandAvailable: (conversationId, commandName) => {
                const bots = get().getInstalledBotsForConversation(conversationId);
                return bots.some(instance => {
                    if (instance.status !== 'active') return false;
                    const bot = getBotById(instance.botId);
                    return bot?.commands.some(c => c.name === commandName) ?? false;
                });
            },

            clearError: () => set({ error: null }),

            reset: () => set({
                catalog: [],
                installedBots: [],
                activeQuizSession: null,
                recentModerationLogs: [],
                recentEvents: [],
                selectedSection: 'catalog',
                currentConversationId: null,
                isLoading: false,
                error: null,
                autoModerationConfigs: {},
                lastAnalysisResult: null,
                autoModStats: {},
            }),
        }),
        {
            name: 'imuchat-bots-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Persister seulement le catalogue, les bots installés, et les configs auto-mod
                catalog: state.catalog,
                installedBots: state.installedBots,
                autoModerationConfigs: state.autoModerationConfigs,
                autoModStats: state.autoModStats,
            }),
        },
    ),
);
