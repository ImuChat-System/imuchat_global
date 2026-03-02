/**
 * Tests pour le service bots-api.
 *
 * Couvre : Catalogue officiel, recherche, parseBotCommand,
 *          installation, commandes, quiz, modération.
 *
 * Phase 3 — Groupe 9 IA (DEV-025)
 */

// ─── Mock Supabase ────────────────────────────────────────────

const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();
const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockIn = jest.fn();

function chainMock(overrides) {
    const chain = {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
        in: mockIn,
        order: mockOrder,
        limit: mockLimit,
        single: mockSingle,
        maybeSingle: mockMaybeSingle,
    };
    // Each method returns the chain
    for (const key of Object.keys(chain)) {
        chain[key].mockReturnValue({ ...chain, ...overrides });
    }
    mockFrom.mockReturnValue({ ...chain, ...overrides });
    return chain;
}

jest.mock("@/services/supabase", () => ({
    supabase: {
        from: (...args) => mockFrom(...args),
    },
    getCurrentUser: jest.fn(() =>
        Promise.resolve({ id: "user-1", email: "test@example.com" }),
    ),
}));

// ─── Mock logger ──────────────────────────────────────────────

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

// ─── Imports ──────────────────────────────────────────────────

import {
    OFFICIAL_BOTS,
    executeBotCommand,
    fetchBotCatalog,
    fetchBotEvents,
    fetchInstalledBots,
    fetchModerationLogs,
    getActiveQuizSession,
    getBotById,
    getBotsByCategory,
    installBot,
    parseBotCommand,
    searchBots,
    uninstallBot,
    updateBotConfig,
    updateBotStatus,
} from "../bots-api";

// ─── Reset mocks ─────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
});

// ============================================================================
// CATALOGUE OFFICIEL
// ============================================================================

describe("Bots Catalogue Officiel", () => {
    it("contient 4 bots officiels", () => {
        expect(OFFICIAL_BOTS).toHaveLength(4);
    });

    it("chaque bot a un id, nom, description et commandes", () => {
        for (const bot of OFFICIAL_BOTS) {
            expect(bot.id).toBeTruthy();
            expect(bot.name).toBeTruthy();
            expect(bot.description).toBeTruthy();
            expect(bot.commands.length).toBeGreaterThan(0);
            expect(bot.isOfficial).toBe(true);
        }
    });

    it("inclut ImuGuard (modération)", () => {
        const guard = OFFICIAL_BOTS.find((b) => b.id === "official-moderation");
        expect(guard).toBeDefined();
        expect(guard.name).toBe("ImuGuard");
        expect(guard.category).toBe("moderation");
    });

    it("inclut ImuQuiz", () => {
        const quiz = OFFICIAL_BOTS.find((b) => b.id === "official-quiz");
        expect(quiz).toBeDefined();
        expect(quiz.name).toBe("ImuQuiz");
        expect(quiz.category).toBe("quiz");
    });

    it("inclut ImuFun (animation)", () => {
        const fun = OFFICIAL_BOTS.find((b) => b.id === "official-animation");
        expect(fun).toBeDefined();
        expect(fun.name).toBe("ImuFun");
        expect(fun.category).toBe("animation");
    });

    it("inclut ImuTools (utilitaire)", () => {
        const tools = OFFICIAL_BOTS.find((b) => b.id === "official-utility");
        expect(tools).toBeDefined();
        expect(tools.name).toBe("ImuTools");
        expect(tools.category).toBe("utility");
    });

    it("chaque commande a un nom, description et usage", () => {
        for (const bot of OFFICIAL_BOTS) {
            for (const cmd of bot.commands) {
                expect(cmd.name).toBeTruthy();
                expect(cmd.description).toBeTruthy();
                expect(cmd.usage).toBeTruthy();
            }
        }
    });
});

// ============================================================================
// FETCH CATALOGUE
// ============================================================================

describe("fetchBotCatalog", () => {
    it("retourne la liste des bots officiels", async () => {
        const result = await fetchBotCatalog();
        expect(result).toEqual(OFFICIAL_BOTS);
        expect(result.length).toBe(4);
    });
});

// ============================================================================
// GET BOT BY ID
// ============================================================================

describe("getBotById", () => {
    it("retourne le bot si trouvé", () => {
        const bot = getBotById("official-moderation");
        expect(bot).toBeDefined();
        expect(bot.name).toBe("ImuGuard");
    });

    it("retourne null si non trouvé", () => {
        expect(getBotById("inexistant")).toBeNull();
    });
});

// ============================================================================
// GET BOTS BY CATEGORY
// ============================================================================

describe("getBotsByCategory", () => {
    it("filtre par catégorie moderation", () => {
        const bots = getBotsByCategory("moderation");
        expect(bots.length).toBeGreaterThanOrEqual(1);
        expect(bots[0].category).toBe("moderation");
    });

    it("retourne un array vide pour catégorie inexistante", () => {
        const bots = getBotsByCategory("gaming");
        expect(bots).toEqual([]);
    });
});

// ============================================================================
// SEARCH BOTS
// ============================================================================

describe("searchBots", () => {
    it("trouve un bot par nom", () => {
        const results = searchBots("ImuGuard");
        expect(results.length).toBe(1);
        expect(results[0].name).toBe("ImuGuard");
    });

    it("trouve un bot par description", () => {
        const results = searchBots("quiz");
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.some((b) => b.id === "official-quiz")).toBe(true);
    });

    it("recherche insensible à la casse", () => {
        const results = searchBots("IMUGUARD");
        expect(results.length).toBe(1);
    });

    it("recherche par tag", () => {
        const results = searchBots("spam");
        expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("retourne vide pour recherche sans résultat", () => {
        const results = searchBots("zzzzzxyzxyz");
        expect(results).toEqual([]);
    });
});

// ============================================================================
// PARSE BOT COMMAND
// ============================================================================

describe("parseBotCommand", () => {
    it("parse une commande valide avec args", () => {
        const result = parseBotCommand("/quiz start culture 10");
        expect(result).toEqual({
            commandName: "quiz",
            args: ["start", "culture", "10"],
        });
    });

    it("parse une commande sans args", () => {
        const result = parseBotCommand("/help");
        expect(result).toEqual({
            commandName: "help",
            args: [],
        });
    });

    it("retourne null si le message ne commence pas par /", () => {
        expect(parseBotCommand("hello world")).toBeNull();
    });

    it("retourne null si juste /", () => {
        expect(parseBotCommand("/")).toBeNull();
    });

    it("convertit le commandName en lowercase", () => {
        const result = parseBotCommand("/QUIZ start");
        expect(result.commandName).toBe("quiz");
    });

    it("gère les espaces multiples", () => {
        const result = parseBotCommand("/warn  user1   raison test");
        expect(result).toEqual({
            commandName: "warn",
            args: ["user1", "raison", "test"],
        });
    });
});

// ============================================================================
// INSTALLATION
// ============================================================================

describe("installBot", () => {
    it("installe un bot avec succès", async () => {
        const mockInstance = {
            id: "inst-1",
            bot_id: "official-moderation",
            conversation_id: "conv-1",
            config: {},
            status: "active",
            installed_by: "user-1",
            installed_at: "2025-01-01T00:00:00Z",
            commands_executed: 0,
            last_executed_at: null,
        };

        chainMock({
            single: jest.fn().mockResolvedValue({ data: mockInstance, error: null }),
        });

        const result = await installBot("official-moderation", "conv-1");
        expect(result).toBeDefined();
        expect(result.botId).toBe("official-moderation");
        expect(result.conversationId).toBe("conv-1");
        expect(result.status).toBe("active");
    });

    it("rejette si le bot n'existe pas", async () => {
        await expect(installBot("inexistant", "conv-1")).rejects.toThrow(
            "Bot introuvable : inexistant",
        );
    });
});

// ============================================================================
// UNINSTALL BOT
// ============================================================================

describe("uninstallBot", () => {
    it("désinstalle un bot avec succès", async () => {
        chainMock({
            eq: jest.fn().mockResolvedValue({ error: null }),
        });

        await expect(uninstallBot("inst-1")).resolves.not.toThrow();
    });
});

// ============================================================================
// FETCH INSTALLED BOTS
// ============================================================================

describe("fetchInstalledBots", () => {
    it("retourne les bots installés pour une conversation", async () => {
        const mockData = [
            {
                id: "inst-1",
                bot_id: "official-quiz",
                conversation_id: "conv-1",
                config: {},
                status: "active",
                installed_by: "user-1",
                installed_at: "2025-01-01T00:00:00Z",
                commands_executed: 5,
                last_executed_at: null,
            },
        ];

        chainMock({
            order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        });

        const result = await fetchInstalledBots("conv-1");
        expect(result).toHaveLength(1);
        expect(result[0].botId).toBe("official-quiz");
    });

    it("rejette en cas d'erreur", async () => {
        chainMock({
            order: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "fail" },
            }),
        });

        await expect(fetchInstalledBots("conv-1")).rejects.toThrow(
            "Erreur de chargement des bots",
        );
    });
});

// ============================================================================
// UPDATE CONFIG
// ============================================================================

describe("updateBotConfig", () => {
    it("met à jour la configuration avec succès", async () => {
        const mockUpdated = {
            id: "inst-1",
            bot_id: "official-moderation",
            conversation_id: "conv-1",
            config: { wordFilter: true },
            status: "active",
            installed_by: "user-1",
            installed_at: "2025-01-01T00:00:00Z",
            commands_executed: 0,
            last_executed_at: null,
        };

        chainMock({
            single: jest.fn().mockResolvedValue({ data: mockUpdated, error: null }),
        });

        const result = await updateBotConfig("inst-1", { wordFilter: true });
        expect(result).toBeDefined();
        expect(result.config).toEqual({ wordFilter: true });
    });
});

// ============================================================================
// UPDATE STATUS
// ============================================================================

describe("updateBotStatus", () => {
    it("met à jour le status avec succès", async () => {
        const mockUpdated = {
            id: "inst-1",
            bot_id: "official-moderation",
            conversation_id: "conv-1",
            config: {},
            status: "paused",
            installed_by: "user-1",
            installed_at: "2025-01-01T00:00:00Z",
            commands_executed: 0,
            last_executed_at: null,
        };

        chainMock({
            single: jest.fn().mockResolvedValue({ data: mockUpdated, error: null }),
        });

        const result = await updateBotStatus("inst-1", "paused");
        expect(result).toBeDefined();
        expect(result.status).toBe("paused");
    });
});

// ============================================================================
// EXECUTE BOT COMMAND
// ============================================================================

describe("executeBotCommand", () => {
    it("retourne une erreur si la commande n'est pas trouvée", async () => {
        // Simuler qu'aucun bot n'est installé
        chainMock({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
        });

        const result = await executeBotCommand(
            "conv-1",
            "inexistant",
            [],
            "user-1",
            "User",
        );
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it("exécute une commande de modération", async () => {
        const mockInstances = [
            {
                id: "inst-1",
                bot_id: "official-moderation",
                conversation_id: "conv-1",
                config: {},
                status: "active",
                installed_by: "user-1",
                installed_at: "2025-01-01T00:00:00Z",
                commands_executed: 5,
                last_executed_at: null,
            },
        ];

        // Mock per-table responses
        mockFrom.mockImplementation(function (table) {
            if (table === "bot_instances") {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({ data: mockInstances, error: null }),
                        }),
                    }),
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
                    }),
                };
            }
            // moderation_logs / bot_events
            return {
                insert: jest.fn().mockResolvedValue({ error: null }),
            };
        });

        const result = await executeBotCommand(
            "conv-1",
            "warn",
            ["user2", "raison test"],
            "user-1",
            "Admin",
        );
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
    });
});

// ============================================================================
// FETCH MODERATION LOGS
// ============================================================================

describe("fetchModerationLogs", () => {
    it("retourne les logs de modération", async () => {
        const mockLogs = [
            {
                id: "log-1",
                conversation_id: "conv-1",
                bot_instance_id: "inst-1",
                action: "warn",
                target_user_id: "user-2",
                moderator_id: "user-1",
                reason: "Spam",
                is_automatic: false,
                details: {},
                created_at: "2025-01-01T00:00:00Z",
            },
        ];

        chainMock({
            limit: jest.fn().mockResolvedValue({ data: mockLogs, error: null }),
        });

        const result = await fetchModerationLogs("conv-1");
        expect(result).toHaveLength(1);
        expect(result[0].action).toBe("warn");
    });

    it("retourne un array vide en cas d'erreur", async () => {
        chainMock({
            limit: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "fail" },
            }),
        });

        const result = await fetchModerationLogs("conv-1");
        expect(result).toEqual([]);
    });
});

// ============================================================================
// GET ACTIVE QUIZ SESSION
// ============================================================================

describe("getActiveQuizSession", () => {
    it("retourne null si pas de quiz actif", async () => {
        chainMock({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        });

        const result = await getActiveQuizSession("conv-1");
        expect(result).toBeNull();
    });

    it("retourne la session de quiz active", async () => {
        const mockSession = {
            id: "quiz-1",
            conversation_id: "conv-1",
            bot_instance_id: "inst-1",
            topic: "culture",
            questions: [],
            current_question_index: 0,
            scores: {},
            status: "active",
            started_by: "user-1",
            started_at: "2025-01-01T00:00:00Z",
            ended_at: null,
            total_questions: 5,
            time_per_question: 30,
        };

        chainMock({
            maybeSingle: jest
                .fn()
                .mockResolvedValue({ data: mockSession, error: null }),
        });

        const result = await getActiveQuizSession("conv-1");
        expect(result).toBeDefined();
        expect(result.topic).toBe("culture");
        expect(result.status).toBe("active");
    });
});

// ============================================================================
// FETCH BOT EVENTS
// ============================================================================

describe("fetchBotEvents", () => {
    it("retourne les événements du bot", async () => {
        const mockEvents = [
            {
                id: "evt-1",
                bot_instance_id: "inst-1",
                type: "command_executed",
                description: "warn executed",
                metadata: { command: "warn" },
                created_at: "2025-01-01T00:00:00Z",
            },
        ];

        chainMock({
            limit: jest.fn().mockResolvedValue({ data: mockEvents, error: null }),
        });

        const result = await fetchBotEvents("inst-1");
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("command_executed");
    });

    it("retourne un array vide en cas d'erreur", async () => {
        chainMock({
            limit: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "fail" },
            }),
        });

        const result = await fetchBotEvents("inst-1");
        expect(result).toEqual([]);
    });
});
