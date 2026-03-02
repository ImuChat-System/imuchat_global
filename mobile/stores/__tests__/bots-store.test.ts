/**
 * Tests pour le bots-store (Zustand).
 *
 * Couvre : loadCatalog, searchCatalog, installation, configuration,
 *          handleChatMessage, helpers (getBotDefinition, isCommandAvailable).
 *
 * Phase 3 — Groupe 9 IA (DEV-025)
 */

import { useBotsStore } from "../bots-store";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
}));

const MOCK_CATALOG = [
    {
        id: "official-moderation",
        name: "ImuGuard",
        description: "Bot de modération",
        icon: "shield-checkmark",
        category: "moderation",
        tags: ["modération"],
        version: "1.0.0",
        commands: [
            {
                name: "warn",
                description: "Avertir un utilisateur",
                usage: "/warn @user raison",
                params: [],
                permission: "moderator",
                cooldownSeconds: 5,
            },
        ],
        defaultConfig: {},
        minPermission: "moderator",
        isOfficial: true,
        installCount: 100,
        rating: 4.5,
        executionMode: "SERVER",
    },
    {
        id: "official-quiz",
        name: "ImuQuiz",
        description: "Bot de quiz",
        icon: "help-circle",
        category: "quiz",
        tags: ["quiz"],
        version: "1.0.0",
        commands: [
            {
                name: "quiz",
                description: "Démarrer un quiz",
                usage: "/quiz start [topic]",
                params: [],
                permission: "member",
                cooldownSeconds: 10,
            },
        ],
        defaultConfig: {},
        minPermission: "member",
        isOfficial: true,
        installCount: 50,
        rating: 4.2,
        executionMode: "SERVER",
    },
];

const MOCK_INSTANCE = {
    id: "inst-1",
    botId: "official-moderation",
    conversationId: "conv-1",
    config: {},
    status: "active",
    installedBy: "user-1",
    installedAt: "2025-01-01T00:00:00Z",
    commandsExecuted: 0,
    lastExecutedAt: null,
};

const mockFetchBotCatalog = jest.fn(() => Promise.resolve(MOCK_CATALOG));
const mockSearchBots = jest.fn((query) =>
    MOCK_CATALOG.filter(
        (b) =>
            b.name.toLowerCase().includes(query.toLowerCase()) ||
            b.description.toLowerCase().includes(query.toLowerCase()),
    ),
);
const mockFetchInstalledBots = jest.fn(() => Promise.resolve([MOCK_INSTANCE]));
const mockFetchAllUserBots = jest.fn(() => Promise.resolve([MOCK_INSTANCE]));
const mockInstallBot = jest.fn(() => Promise.resolve(MOCK_INSTANCE));
const mockUninstallBot = jest.fn(() => Promise.resolve());
const mockUpdateBotConfig = jest.fn((id, config) =>
    Promise.resolve({ ...MOCK_INSTANCE, config }),
);
const mockUpdateBotStatus = jest.fn((id, status) =>
    Promise.resolve({ ...MOCK_INSTANCE, status }),
);
const mockGetBotById = jest.fn((id) =>
    MOCK_CATALOG.find((b) => b.id === id) || null,
);
const mockParseBotCommand = jest.fn((message) => {
    if (!message.startsWith("/")) return null;
    const parts = message.slice(1).split(/\s+/);
    return { commandName: parts[0], args: parts.slice(1) };
});
const mockExecuteBotCommand = jest.fn(() =>
    Promise.resolve({
        success: true,
        message: { content: "Commande exécutée", contentType: "text" },
    }),
);
const mockGetActiveQuizSession = jest.fn(() => Promise.resolve(null));
const mockFetchModerationLogs = jest.fn(() => Promise.resolve([]));
const mockFetchBotEvents = jest.fn(() => Promise.resolve([]));

jest.mock("@/services/bots-api", () => ({
    fetchBotCatalog: (...args) => mockFetchBotCatalog(...args),
    searchBots: (...args) => mockSearchBots(...args),
    fetchInstalledBots: (...args) => mockFetchInstalledBots(...args),
    fetchAllUserBots: (...args) => mockFetchAllUserBots(...args),
    installBot: (...args) => mockInstallBot(...args),
    uninstallBot: (...args) => mockUninstallBot(...args),
    updateBotConfig: (...args) => mockUpdateBotConfig(...args),
    updateBotStatus: (...args) => mockUpdateBotStatus(...args),
    getBotById: (...args) => mockGetBotById(...args),
    parseBotCommand: (...args) => mockParseBotCommand(...args),
    executeBotCommand: (...args) => mockExecuteBotCommand(...args),
    getActiveQuizSession: (...args) => mockGetActiveQuizSession(...args),
    fetchModerationLogs: (...args) => mockFetchModerationLogs(...args),
    fetchBotEvents: (...args) => mockFetchBotEvents(...args),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

// ─── Mock content-filter ──────────────────────────────────────

var mockAnalyzeMessage = jest.fn(() => ({
    passed: true,
    violations: [],
    score: 0,
    suggestedAction: null,
    flagged: false,
}));

var mockGetDefaultModerationConfig = jest.fn(() => ({
    wordFilterEnabled: false,
    bannedWords: [],
    wordFilterAction: "delete_message",
    linkFilterEnabled: false,
    allowedDomains: [],
    linkFilterAction: "warn",
    spamLimitPerMinute: 15,
    spamAction: "mute",
    floodThreshold: 5,
    muteDurationMinutes: 10,
    warnBeforeAction: true,
    maxWarnings: 3,
    aiModerationEnabled: false,
}));

var mockIncrementWarnings = jest.fn(() => 1);

var mockIsAutoModerationActive = jest.fn(() => false);

jest.mock("@/services/content-filter", () => ({
    analyzeMessage: (...args) => mockAnalyzeMessage(...args),
    getDefaultModerationConfig: (...args) => mockGetDefaultModerationConfig(...args),
    incrementWarnings: (...args) => mockIncrementWarnings(...args),
    isAutoModerationActive: (...args) => mockIsAutoModerationActive(...args),
}));

// ─── Helpers ──────────────────────────────────────────────────

function resetStore() {
    const store = useBotsStore.getState();
    store.reset();
}

// ─── Tests ────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
});

// ============================================================================
// STATE INITIAL
// ============================================================================

describe("État initial", () => {
    it("a un catalogue vide", () => {
        const { catalog } = useBotsStore.getState();
        expect(catalog).toEqual([]);
    });

    it("n'a pas de bots installés", () => {
        const { installedBots } = useBotsStore.getState();
        expect(installedBots).toEqual([]);
    });

    it("n'a pas de quiz actif", () => {
        const { activeQuizSession } = useBotsStore.getState();
        expect(activeQuizSession).toBeNull();
    });

    it("a la section par défaut 'catalog'", () => {
        const { selectedSection } = useBotsStore.getState();
        expect(selectedSection).toBe("catalog");
    });

    it("n'est pas en chargement", () => {
        const { isLoading } = useBotsStore.getState();
        expect(isLoading).toBe(false);
    });
});

// ============================================================================
// LOAD CATALOG
// ============================================================================

describe("loadCatalog", () => {
    it("charge le catalogue avec succès", async () => {
        const store = useBotsStore.getState();
        await store.loadCatalog();

        const { catalog, isLoading } = useBotsStore.getState();
        expect(catalog).toEqual(MOCK_CATALOG);
        expect(catalog).toHaveLength(2);
        expect(isLoading).toBe(false);
        expect(mockFetchBotCatalog).toHaveBeenCalledTimes(1);
    });
});

// ============================================================================
// SEARCH CATALOG
// ============================================================================

describe("searchCatalog", () => {
    it("recherche dans le catalogue", () => {
        const store = useBotsStore.getState();
        const results = store.searchCatalog("Guard");

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe("ImuGuard");
        expect(mockSearchBots).toHaveBeenCalledWith("Guard");
    });
});

// ============================================================================
// INSTALLATION
// ============================================================================

describe("install / uninstall", () => {
    it("installe un bot et l'ajoute à la liste", async () => {
        const store = useBotsStore.getState();
        const result = await store.install("official-moderation", "conv-1");

        expect(result).toBe(true);
        expect(mockInstallBot).toHaveBeenCalledWith("official-moderation", "conv-1");

        const { installedBots } = useBotsStore.getState();
        expect(installedBots).toHaveLength(1);
        expect(installedBots[0].botId).toBe("official-moderation");
    });

    it("désinstalle un bot et le retire de la liste", async () => {
        // D'abord installer
        const store = useBotsStore.getState();
        await store.install("official-moderation", "conv-1");
        expect(useBotsStore.getState().installedBots).toHaveLength(1);

        // Puis désinstaller
        const result = await store.uninstall("inst-1");
        expect(result).toBe(true);
        expect(mockUninstallBot).toHaveBeenCalledWith("inst-1");

        const { installedBots } = useBotsStore.getState();
        expect(installedBots).toHaveLength(0);
    });

    it("retourne false si l'installation échoue", async () => {
        mockInstallBot.mockRejectedValueOnce(new Error("Failed"));

        const store = useBotsStore.getState();
        const result = await store.install("bot-x", "conv-1");

        expect(result).toBe(false);
        expect(useBotsStore.getState().error).toBe("Failed");
    });
});

// ============================================================================
// LOAD INSTALLED BOTS
// ============================================================================

describe("loadInstalledBots", () => {
    it("charge les bots installés pour une conversation", async () => {
        const store = useBotsStore.getState();
        await store.loadInstalledBots("conv-1");

        const { installedBots } = useBotsStore.getState();
        expect(installedBots).toHaveLength(1);
        expect(mockFetchInstalledBots).toHaveBeenCalledWith("conv-1");
    });

    it("retourne un array vide en cas d'erreur", async () => {
        mockFetchInstalledBots.mockRejectedValueOnce(new Error("fail"));

        const store = useBotsStore.getState();
        await store.loadInstalledBots("conv-1");

        const { installedBots } = useBotsStore.getState();
        expect(installedBots).toEqual([]);
    });
});

// ============================================================================
// CONFIGURATION
// ============================================================================

describe("updateConfig / changeStatus", () => {
    beforeEach(async () => {
        const store = useBotsStore.getState();
        await store.install("official-moderation", "conv-1");
    });

    it("met à jour la configuration d'un bot", async () => {
        const store = useBotsStore.getState();
        const result = await store.updateConfig("inst-1", { wordFilter: true });

        expect(result).toBe(true);
        expect(mockUpdateBotConfig).toHaveBeenCalledWith("inst-1", { wordFilter: true });
    });

    it("change le status d'un bot", async () => {
        const store = useBotsStore.getState();
        const result = await store.changeStatus("inst-1", "paused");

        expect(result).toBe(true);
        expect(mockUpdateBotStatus).toHaveBeenCalledWith("inst-1", "paused");
    });
});

// ============================================================================
// COMMANDES
// ============================================================================

describe("handleChatMessage", () => {
    it("retourne null si le message n'est pas une commande", async () => {
        mockParseBotCommand.mockReturnValueOnce(null);

        const store = useBotsStore.getState();
        const result = await store.handleChatMessage(
            "conv-1",
            "hello world",
            "user-1",
            "User",
        );

        expect(result).toBeNull();
    });

    it("exécute une commande bot et retourne le résultat", async () => {
        const store = useBotsStore.getState();
        const result = await store.handleChatMessage(
            "conv-1",
            "/warn user2 spam",
            "user-1",
            "Admin",
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(mockExecuteBotCommand).toHaveBeenCalledWith(
            "conv-1",
            "warn",
            ["user2", "spam"],
            "user-1",
            "Admin",
        );
    });

    it("retourne une erreur si l'exécution échoue", async () => {
        mockExecuteBotCommand.mockRejectedValueOnce(new Error("Command failed"));

        const store = useBotsStore.getState();
        const result = await store.handleChatMessage(
            "conv-1",
            "/warn user2 test",
            "user-1",
            "Admin",
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(false);
        expect(result.error).toBe("Command failed");
    });
});

// ============================================================================
// HELPERS
// ============================================================================

describe("getBotDefinition", () => {
    it("délègue à getBotById du service", () => {
        const store = useBotsStore.getState();
        const bot = store.getBotDefinition("official-moderation");

        expect(mockGetBotById).toHaveBeenCalledWith("official-moderation");
        expect(bot).toBeDefined();
    });
});

describe("getInstalledBotsForConversation", () => {
    it("filtre les bots par conversationId", async () => {
        const store = useBotsStore.getState();
        await store.install("official-moderation", "conv-1");

        const bots = store.getInstalledBotsForConversation("conv-1");
        expect(bots).toHaveLength(1);

        const botsOther = store.getInstalledBotsForConversation("conv-2");
        expect(botsOther).toHaveLength(0);
    });
});

describe("isCommandAvailable", () => {
    it("retourne true si un bot actif a cette commande", async () => {
        const store = useBotsStore.getState();
        await store.install("official-moderation", "conv-1");

        // mockGetBotById needs to return definition with commands
        const available = store.isCommandAvailable("conv-1", "warn");
        expect(available).toBe(true);
    });

    it("retourne false si aucun bot n'a cette commande", async () => {
        const store = useBotsStore.getState();
        await store.install("official-moderation", "conv-1");

        const available = store.isCommandAvailable("conv-1", "inexistant");
        expect(available).toBe(false);
    });
});

// ============================================================================
// NAVIGATION
// ============================================================================

describe("setSection / setConversation", () => {
    it("change la section", () => {
        const store = useBotsStore.getState();
        store.setSection("installed");
        expect(useBotsStore.getState().selectedSection).toBe("installed");
    });

    it("change la conversation courante", () => {
        const store = useBotsStore.getState();
        store.setConversation("conv-42");
        expect(useBotsStore.getState().currentConversationId).toBe("conv-42");
    });
});

// ============================================================================
// QUIZ / MODERATION / EVENTS
// ============================================================================

describe("loadActiveQuiz", () => {
    it("charge le quiz actif (null par défaut)", async () => {
        const store = useBotsStore.getState();
        await store.loadActiveQuiz("conv-1");

        expect(useBotsStore.getState().activeQuizSession).toBeNull();
        expect(mockGetActiveQuizSession).toHaveBeenCalledWith("conv-1");
    });
});

describe("loadModerationLogs", () => {
    it("charge les logs de modération", async () => {
        const store = useBotsStore.getState();
        await store.loadModerationLogs("conv-1");

        expect(useBotsStore.getState().recentModerationLogs).toEqual([]);
        expect(mockFetchModerationLogs).toHaveBeenCalledWith("conv-1");
    });
});

describe("loadBotEvents", () => {
    it("charge les événements d'une instance", async () => {
        const store = useBotsStore.getState();
        await store.loadBotEvents("inst-1");

        expect(useBotsStore.getState().recentEvents).toEqual([]);
        expect(mockFetchBotEvents).toHaveBeenCalledWith("inst-1");
    });
});

// ============================================================================
// RESET
// ============================================================================

describe("reset / clearError", () => {
    it("reset remet le store à zéro", async () => {
        const store = useBotsStore.getState();
        await store.loadCatalog();
        await store.install("official-moderation", "conv-1");
        store.setSection("installed");

        store.reset();

        const state = useBotsStore.getState();
        expect(state.catalog).toEqual([]);
        expect(state.installedBots).toEqual([]);
        expect(state.selectedSection).toBe("catalog");
    });

    it("clearError efface l'erreur", async () => {
        mockInstallBot.mockRejectedValueOnce(new Error("fail"));
        const store = useBotsStore.getState();
        await store.install("bot-x", "conv-1");
        expect(useBotsStore.getState().error).toBe("fail");

        store.clearError();
        expect(useBotsStore.getState().error).toBeNull();
    });
});

// ============================================================================
// AUTO-MODÉRATION
// ============================================================================

describe("Auto-modération — updateAutoModConfig", () => {
    it("crée une config pour une conversation", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-1", { wordFilterEnabled: true });

        const state = useBotsStore.getState();
        expect(state.autoModerationConfigs["conv-1"]).toBeDefined();
        expect(state.autoModerationConfigs["conv-1"].wordFilterEnabled).toBe(true);
    });

    it("merge avec la config existante", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-1", { wordFilterEnabled: true });
        store.updateAutoModConfig("conv-1", { linkFilterEnabled: true });

        const config = useBotsStore.getState().autoModerationConfigs["conv-1"];
        expect(config.wordFilterEnabled).toBe(true);
        expect(config.linkFilterEnabled).toBe(true);
    });

    it("isole les configs par conversation", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-a", { wordFilterEnabled: true });
        store.updateAutoModConfig("conv-b", { linkFilterEnabled: true });

        const state = useBotsStore.getState();
        expect(state.autoModerationConfigs["conv-a"].wordFilterEnabled).toBe(true);
        expect(state.autoModerationConfigs["conv-a"].linkFilterEnabled).toBe(false);
        expect(state.autoModerationConfigs["conv-b"].linkFilterEnabled).toBe(true);
    });
});

describe("Auto-modération — getAutoModConfig", () => {
    it("retourne la config par défaut si aucune n'existe", () => {
        const store = useBotsStore.getState();
        var config = store.getAutoModConfig("conv-unknown");
        expect(config).toBeDefined();
        expect(mockGetDefaultModerationConfig).toHaveBeenCalled();
    });

    it("retourne la config existante", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-1", { spamLimitPerMinute: 5 });
        var config = store.getAutoModConfig("conv-1");
        expect(config.spamLimitPerMinute).toBe(5);
    });
});

describe("Auto-modération — analyzeIncomingMessage", () => {
    it("appelle analyzeMessage avec la bonne config", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-1", { wordFilterEnabled: true });
        store.analyzeIncomingMessage("test message", "conv-1", "user-1");

        expect(mockAnalyzeMessage).toHaveBeenCalled();
    });

    it("met à jour lastAnalysisResult", () => {
        const store = useBotsStore.getState();
        store.analyzeIncomingMessage("safe message", "conv-2", "user-2");

        expect(useBotsStore.getState().lastAnalysisResult).toBeDefined();
    });

    it("met à jour les stats quand un message est bloqué", () => {
        mockAnalyzeMessage.mockReturnValueOnce({
            passed: false,
            violations: [{ type: "profanity", severity: 2 }],
            score: 50,
            suggestedAction: "mute",
            flagged: false,
        });

        const store = useBotsStore.getState();
        store.analyzeIncomingMessage("bad message", "conv-3", "user-3");

        var stats = useBotsStore.getState().autoModStats["conv-3"];
        expect(stats).toBeDefined();
        expect(stats.blocked).toBe(1);
    });

    it("incrémente warned quand action = warn", () => {
        mockAnalyzeMessage.mockReturnValueOnce({
            passed: false,
            violations: [{ type: "spam", severity: 2 }],
            score: 30,
            suggestedAction: "warn",
            flagged: false,
        });

        const store = useBotsStore.getState();
        store.analyzeIncomingMessage("spam msg", "conv-4", "user-4");

        var stats = useBotsStore.getState().autoModStats["conv-4"];
        expect(stats.warned).toBe(1);
        expect(mockIncrementWarnings).toHaveBeenCalledWith("user-4", "conv-4");
    });
});

describe("Auto-modération — isAutoModActive", () => {
    it("retourne false si aucune config", () => {
        const store = useBotsStore.getState();
        expect(store.isAutoModActive("conv-none")).toBe(false);
    });

    it("délègue à isAutoModerationActive quand config existe", () => {
        mockIsAutoModerationActive.mockReturnValue(true);
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-1", { wordFilterEnabled: true });

        expect(store.isAutoModActive("conv-1")).toBe(true);
    });
});

describe("Auto-modération — resetAutoModConfig", () => {
    it("supprime la config d'une conversation", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-1", { wordFilterEnabled: true });
        store.resetAutoModConfig("conv-1");

        expect(useBotsStore.getState().autoModerationConfigs["conv-1"]).toBeUndefined();
    });

    it("ne touche pas les autres conversations", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-a", { wordFilterEnabled: true });
        store.updateAutoModConfig("conv-b", { linkFilterEnabled: true });
        store.resetAutoModConfig("conv-a");

        expect(useBotsStore.getState().autoModerationConfigs["conv-a"]).toBeUndefined();
        expect(useBotsStore.getState().autoModerationConfigs["conv-b"]).toBeDefined();
    });
});

describe("Auto-modération — reset inclut auto-mod", () => {
    it("reset vide aussi les configs auto-mod et stats", () => {
        const store = useBotsStore.getState();
        store.updateAutoModConfig("conv-1", { wordFilterEnabled: true });

        store.reset();

        const state = useBotsStore.getState();
        expect(state.autoModerationConfigs).toEqual({});
        expect(state.autoModStats).toEqual({});
        expect(state.lastAnalysisResult).toBeNull();
    });
});
