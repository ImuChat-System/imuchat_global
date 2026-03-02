/**
 * useBots Hook — DEV-025 : Bots de groupe
 *
 * Hook React façade pour le module bots :
 * - Chargement du catalogue
 * - Installation / désinstallation
 * - Exécution de commandes
 * - Quiz en temps réel
 * - Logs de modération
 *
 * Phase 3 — Groupe 9 IA (fonc. 5/5)
 */

import { useBotsStore } from '@/stores/bots-store';
import type {
    BotCommandResult,
    BotDefinition,
    BotInstance,
    BotStatus,
    BotsSection,
} from '@/types/bots';
import { useCallback, useEffect, useMemo } from 'react';

// ============================================================================
// HOOK
// ============================================================================

export function useBots(conversationId?: string) {
    const store = useBotsStore();

    // ── Auto-load catalogue au montage ───────────────────────────
    useEffect(() => {
        if (store.catalog.length === 0) {
            store.loadCatalog();
        }
    }, []);

    // ── Auto-load bots installés quand conversationId change ─────
    useEffect(() => {
        if (conversationId) {
            store.setConversation(conversationId);
            store.loadInstalledBots(conversationId);
            store.loadActiveQuiz(conversationId);
        }
    }, [conversationId]);

    // ── Catalogue ────────────────────────────────────────────────

    const catalog = useMemo(() => store.catalog, [store.catalog]);

    const searchCatalog = useCallback(
        (query: string): BotDefinition[] => {
            return store.searchCatalog(query);
        },
        [],
    );

    const getBotDefinition = useCallback(
        (botId: string): BotDefinition | null => {
            return store.getBotDefinition(botId);
        },
        [],
    );

    // ── Bots installés ───────────────────────────────────────────

    const installedBots = useMemo((): BotInstance[] => {
        if (!conversationId) return store.installedBots;
        return store.getInstalledBotsForConversation(conversationId);
    }, [store.installedBots, conversationId]);

    const installedBotsWithDefinition = useMemo(() => {
        return installedBots.map(instance => ({
            instance,
            definition: store.getBotDefinition(instance.botId),
        }));
    }, [installedBots]);

    // ── Installation ─────────────────────────────────────────────

    const install = useCallback(
        async (botId: string): Promise<boolean> => {
            if (!conversationId) return false;
            return store.install(botId, conversationId);
        },
        [conversationId],
    );

    const uninstall = useCallback(
        async (instanceId: string): Promise<boolean> => {
            return store.uninstall(instanceId);
        },
        [],
    );

    // ── Configuration ────────────────────────────────────────────

    const updateConfig = useCallback(
        async (instanceId: string, config: Record<string, unknown>): Promise<boolean> => {
            return store.updateConfig(instanceId, config);
        },
        [],
    );

    const changeStatus = useCallback(
        async (instanceId: string, status: BotStatus): Promise<boolean> => {
            return store.changeStatus(instanceId, status);
        },
        [],
    );

    // ── Commandes ────────────────────────────────────────────────

    const handleMessage = useCallback(
        async (message: string, userId: string, userName: string): Promise<BotCommandResult | null> => {
            if (!conversationId) return null;
            return store.handleChatMessage(conversationId, message, userId, userName);
        },
        [conversationId],
    );

    const isCommand = useCallback(
        (message: string): boolean => {
            return message.startsWith('/');
        },
        [],
    );

    const isCommandAvailable = useCallback(
        (commandName: string): boolean => {
            if (!conversationId) return false;
            return store.isCommandAvailable(conversationId, commandName);
        },
        [conversationId],
    );

    /** Liste plate de toutes les commandes disponibles dans le groupe */
    const availableCommands = useMemo(() => {
        const commands: Array<{ command: string; description: string; botName: string }> = [];
        for (const { instance, definition } of installedBotsWithDefinition) {
            if (!definition || instance.status !== 'active') continue;
            for (const cmd of definition.commands) {
                commands.push({
                    command: `/${cmd.name}`,
                    description: cmd.description,
                    botName: definition.name,
                });
            }
        }
        return commands;
    }, [installedBotsWithDefinition]);

    // ── Quiz ─────────────────────────────────────────────────────

    const activeQuiz = useMemo(() => store.activeQuizSession, [store.activeQuizSession]);

    const refreshQuiz = useCallback(async () => {
        if (conversationId) {
            await store.loadActiveQuiz(conversationId);
        }
    }, [conversationId]);

    // ── Modération ───────────────────────────────────────────────

    const moderationLogs = useMemo(() => store.recentModerationLogs, [store.recentModerationLogs]);

    const loadModerationLogs = useCallback(async () => {
        if (conversationId) {
            await store.loadModerationLogs(conversationId);
        }
    }, [conversationId]);

    // ── Events ───────────────────────────────────────────────────

    const botEvents = useMemo(() => store.recentEvents, [store.recentEvents]);

    const loadBotEvents = useCallback(
        async (instanceId: string) => {
            await store.loadBotEvents(instanceId);
        },
        [],
    );

    // ── Navigation ───────────────────────────────────────────────

    const setSection = useCallback(
        (section: BotsSection) => {
            store.setSection(section);
        },
        [],
    );

    // ── Return flat object ───────────────────────────────────────
    return {
        // State
        catalog,
        installedBots,
        installedBotsWithDefinition,
        activeQuiz,
        moderationLogs,
        botEvents,
        isLoading: store.isLoading,
        error: store.error,
        selectedSection: store.selectedSection,
        availableCommands,

        // Catalogue
        searchCatalog,
        getBotDefinition,
        loadCatalog: store.loadCatalog,

        // Installation
        install,
        uninstall,
        loadInstalledBots: store.loadInstalledBots,

        // Configuration
        updateConfig,
        changeStatus,

        // Commandes
        handleMessage,
        isCommand,
        isCommandAvailable,

        // Quiz
        refreshQuiz,

        // Modération
        loadModerationLogs,

        // Events
        loadBotEvents,

        // Navigation
        setSection,

        // Helpers
        clearError: store.clearError,
    };
}
