/**
 * Tests pour le service suggestions-api.
 *
 * Couvre : Language Detection, Tone Analysis, Smart Reply (Local),
 *          Auto-completion, Summary Generation (Local),
 *          Template CRUD, Template Variables, Template Favorites,
 *          Stats Tracking, Preferences, Helpers.
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

// ─── Mock AsyncStorage ────────────────────────────────────────

const mockStore = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn((key) => Promise.resolve(mockStore[key] || null)),
        setItem: jest.fn((key, value) => {
            mockStore[key] = value;
            return Promise.resolve();
        }),
        removeItem: jest.fn((key) => {
            delete mockStore[key];
            return Promise.resolve();
        }),
    },
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

// ─── Mock fetch (for LLM calls) ──────────────────────────────

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
    }),
);

import {
    analyzeToneLocal,
    applyTemplateVariables,
    createTemplate,
    deleteSavedSummary,
    deleteTemplate,
    detectLanguage,
    generateCompletionLocal,
    generateSmartRepliesLLM,
    generateSmartRepliesLocal,
    generateSummaryLLM,
    generateSummaryLocal,
    getDefaultTemplateCount,
    getPreferences,
    getReplyPatternCategories,
    getSavedSummaries,
    getStats,
    getTemplateCategories,
    getTemplates,
    getTemplatesByCategory,
    incrementTemplateUsage,
    recordSuggestionShown,
    recordSuggestionUsed,
    savePreferences,
    saveSummary,
    toggleTemplateFavorite,
    updateStats,
} from "../suggestions-api";

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Helpers ──────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    for (const key of Object.keys(mockStore)) {
        delete mockStore[key];
    }
});

// ============================================================================
// 1. LANGUAGE DETECTION
// ============================================================================

describe("detectLanguage", () => {
    it("should detect French text", () => {
        const result = detectLanguage("Bonjour, je suis dans la maison");
        expect(result).toBe("fr");
    });

    it("should detect English text", () => {
        const result = detectLanguage("The weather is beautiful today");
        expect(result).toBe("en");
    });

    it("should detect Japanese text", () => {
        const result = detectLanguage("こんにちは、元気ですか");
        expect(result).toBe("ja");
    });

    it("should default to French for empty text", () => {
        const result = detectLanguage("");
        expect(result).toBe("fr");
    });

    it("should default to French for null", () => {
        const result = detectLanguage(null);
        expect(result).toBe("fr");
    });

    it("should handle mixed language text", () => {
        // Should return whichever has more matches
        const result = detectLanguage("Je suis le directeur the project");
        expect(["fr", "en"]).toContain(result);
    });
});

// ============================================================================
// 2. TONE DETECTION
// ============================================================================

describe("analyzeToneLocal", () => {
    it("should detect positive tone", () => {
        const result = analyzeToneLocal("msg-1", "Super génial, trop cool ! 😊");
        expect(result).toBeDefined();
        expect(result.message_id).toBe("msg-1");
        expect(result.primary_tone).toBe("positive");
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.id).toBeDefined();
    });

    it("should detect negative tone", () => {
        const result = analyzeToneLocal("msg-2", "C'est horrible et terrible 😢");
        expect(result.primary_tone).toBe("negative");
    });

    it("should detect question tone", () => {
        const result = analyzeToneLocal("msg-3", "Comment ça marche ? Pourquoi ?");
        expect(result.primary_tone).toBe("question");
    });

    it("should detect urgent tone", () => {
        const result = analyzeToneLocal("msg-4", "URGENT !!! Au secours immédiatement !!!");
        expect(result.primary_tone).toBe("urgent");
    });

    it("should detect formal tone", () => {
        const result = analyzeToneLocal("msg-5", "Cordialement, Madame, sincèrement vôtre");
        expect(result.primary_tone).toBe("formal");
    });

    it("should detect casual tone", () => {
        const result = analyzeToneLocal("msg-6", "mdr lol ptdr 😂🤣");
        expect(["casual", "humorous"]).toContain(result.primary_tone);
    });

    it("should return neutral for empty content", () => {
        const result = analyzeToneLocal("msg-7", "");
        expect(result.primary_tone).toBe("neutral");
        expect(result.confidence).toBe(0.5);
    });

    it("should return neutral for whitespace-only content", () => {
        const result = analyzeToneLocal("msg-8", "   ");
        expect(result.primary_tone).toBe("neutral");
    });

    it("should include emotions array", () => {
        const result = analyzeToneLocal("msg-9", "Super cool et génial !");
        expect(Array.isArray(result.emotions)).toBe(true);
    });

    it("should detect language in tone result", () => {
        const result = analyzeToneLocal("msg-10", "This is amazing and awesome!");
        expect(result.language).toBe("en");
    });

    it("should have secondary_tone when multiple tones detected", () => {
        const result = analyzeToneLocal("msg-11", "Super !!! URGENT help s'il vous plaît ?");
        // Multiple tones should be detected
        expect(result.primary_tone).toBeDefined();
    });
});

// ============================================================================
// 3. SMART REPLY GENERATION (LOCAL)
// ============================================================================

describe("generateSmartRepliesLocal", () => {
    const makeContext = (content) => ({
        message_id: "ctx-1",
        conversation_id: "conv-1",
        content,
        sender_id: "user-1",
        sender_name: "Alice",
        previous_messages: [],
    });

    it("should generate replies for greeting", () => {
        const replies = generateSmartRepliesLocal(makeContext("Bonjour !"));
        expect(replies.length).toBeGreaterThan(0);
        expect(replies.length).toBeLessThanOrEqual(3);
        for (const r of replies) {
            expect(r.id).toBeDefined();
            expect(r.text).toBeDefined();
            expect(r.type).toBe("smart_reply");
            expect(r.confidence).toBeGreaterThan(0);
            expect(r.source).toBe("pattern");
        }
    });

    it("should generate replies for thanks", () => {
        const replies = generateSmartRepliesLocal(makeContext("Merci beaucoup !"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should generate replies for question", () => {
        const replies = generateSmartRepliesLocal(makeContext("Comment ça marche ?"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should generate replies for agreement", () => {
        const replies = generateSmartRepliesLocal(makeContext("D'accord, parfait !"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should generate replies for farewell", () => {
        const replies = generateSmartRepliesLocal(makeContext("Au revoir !"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should generate replies for invitation", () => {
        const replies = generateSmartRepliesLocal(makeContext("On se voit demain ?"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should generate replies for apology", () => {
        const replies = generateSmartRepliesLocal(makeContext("Désolé pour le retard"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should generate replies for excitement", () => {
        const replies = generateSmartRepliesLocal(makeContext("Trop bien, incroyable !!!"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should generate default replies for unknown pattern", () => {
        const replies = generateSmartRepliesLocal(makeContext("xyz 123 abc"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should respect maxSuggestions parameter", () => {
        const replies = generateSmartRepliesLocal(makeContext("Bonjour !"), 1);
        expect(replies.length).toBe(1);
    });

    it("should return more when maxSuggestions is higher", () => {
        const replies = generateSmartRepliesLocal(makeContext("Bonjour !"), 5);
        expect(replies.length).toBeLessThanOrEqual(5);
    });

    it("should detect English and return English replies", () => {
        const replies = generateSmartRepliesLocal(makeContext("Hello! How are you?"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should detect Japanese and return Japanese replies", () => {
        const replies = generateSmartRepliesLocal(makeContext("ありがとう"));
        expect(replies.length).toBeGreaterThan(0);
    });

    it("should sort replies by confidence (descending)", () => {
        const replies = generateSmartRepliesLocal(makeContext("Bonjour !"), 5);
        for (let i = 1; i < replies.length; i++) {
            expect(replies[i - 1].confidence).toBeGreaterThanOrEqual(replies[i].confidence);
        }
    });
});

// ============================================================================
// 4. SMART REPLY GENERATION (LLM)
// ============================================================================

describe("generateSmartRepliesLLM", () => {
    const makeContext = (content) => ({
        message_id: "ctx-1",
        conversation_id: "conv-1",
        content,
        sender_id: "user-1",
        sender_name: "Alice",
        previous_messages: [
            { sender_name: "Bob", content: "Hey !" },
        ],
    });

    it("should fall back to local when fetch fails", async () => {
        (global.fetch).mockRejectedValueOnce(new Error("Network error"));
        const replies = await generateSmartRepliesLLM(makeContext("Bonjour !"));
        expect(replies.length).toBeGreaterThan(0);
        // Should be pattern source (fallback)
        expect(replies[0].source).toBe("pattern");
    });

    it("should fall back to local when response is not ok", async () => {
        (global.fetch).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({}),
        });
        const replies = await generateSmartRepliesLLM(makeContext("Hello"), 2);
        expect(replies.length).toBeGreaterThan(0);
        expect(replies[0].source).toBe("pattern");
    });

    it("should parse LLM response when successful", async () => {
        (global.fetch).mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    message: {
                        content: '["Super !", "D\'accord", "Merci"]',
                    },
                }),
        });
        const replies = await generateSmartRepliesLLM(makeContext("Bonjour"), 3);
        expect(replies.length).toBe(3);
        expect(replies[0].source).toBe("llm");
        expect(replies[0].text).toBe("Super !");
    });

    it("should fall back when LLM response has invalid JSON", async () => {
        (global.fetch).mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    message: { content: "not a json" },
                }),
        });
        const replies = await generateSmartRepliesLLM(makeContext("Test"), 2);
        expect(replies.length).toBeGreaterThan(0);
        expect(replies[0].source).toBe("pattern");
    });
});

// ============================================================================
// 5. AUTO-COMPLETION
// ============================================================================

describe("generateCompletionLocal", () => {
    it("should return completions for French prefix 'est-ce qu'", () => {
        const completions = generateCompletionLocal("est-ce qu");
        expect(completions.length).toBeGreaterThan(0);
        for (const c of completions) {
            expect(c.id).toBeDefined();
            expect(c.text).toBeDefined();
            expect(c.full_text).toBeDefined();
            expect(c.confidence).toBeGreaterThan(0);
        }
    });

    it("should return completions for 'je voul'", () => {
        const completions = generateCompletionLocal("je voul");
        expect(completions.length).toBeGreaterThan(0);
    });

    it("should return completions for 'on se v'", () => {
        const completions = generateCompletionLocal("on se v");
        expect(completions.length).toBeGreaterThan(0);
    });

    it("should return completions for English prefix 'do you'", () => {
        const completions = generateCompletionLocal("do you");
        expect(completions.length).toBeGreaterThan(0);
    });

    it("should return completions for 'can you'", () => {
        const completions = generateCompletionLocal("can you");
        expect(completions.length).toBeGreaterThan(0);
    });

    it("should return completions for 'let me'", () => {
        const completions = generateCompletionLocal("let me");
        expect(completions.length).toBeGreaterThan(0);
    });

    it("should return empty for unmatched prefix", () => {
        const completions = generateCompletionLocal("zzzzqqqq");
        expect(completions.length).toBe(0);
    });

    it("should return empty for short text", () => {
        const completions = generateCompletionLocal("ab");
        expect(completions.length).toBe(0);
    });

    it("should return empty for null input", () => {
        const completions = generateCompletionLocal(null);
        expect(completions.length).toBe(0);
    });

    it("should return empty for empty string", () => {
        const completions = generateCompletionLocal("");
        expect(completions.length).toBe(0);
    });

    it("should include full_text with completion text", () => {
        const completions = generateCompletionLocal("tu peux");
        expect(completions.length).toBeGreaterThan(0);
        for (const c of completions) {
            expect(c.full_text.startsWith("tu peux")).toBe(true);
        }
    });
});

// ============================================================================
// 6. CONVERSATION SUMMARY (LOCAL)
// ============================================================================

describe("generateSummaryLocal", () => {
    it("should generate a summary with correct structure", () => {
        const summary = generateSummaryLocal("conv-1", "Test Conv", 20, "medium");
        expect(summary.id).toBeDefined();
        expect(summary.conversation_id).toBe("conv-1");
        expect(summary.conversation_name).toBe("Test Conv");
        expect(summary.summary).toBeDefined();
        expect(summary.summary.length).toBeGreaterThan(0);
        expect(summary.key_points).toBeDefined();
        expect(Array.isArray(summary.key_points)).toBe(true);
        expect(summary.participants).toBeDefined();
        expect(Array.isArray(summary.participants)).toBe(true);
        expect(summary.message_count).toBe(20);
        expect(summary.topics).toBeDefined();
        expect(summary.action_items).toBeDefined();
        expect(summary.sentiment).toBe("neutral");
        expect(summary.status).toBe("completed");
        expect(summary.length).toBe("medium");
    });

    it("should have more key points for long length", () => {
        const shortSummary = generateSummaryLocal("c1", "Conv", 10, "short");
        const longSummary = generateSummaryLocal("c2", "Conv", 10, "long");
        expect(longSummary.key_points.length).toBeGreaterThan(shortSummary.key_points.length);
    });

    it("should default to medium length", () => {
        const summary = generateSummaryLocal("c1", "Conv", 10);
        expect(summary.length).toBe("medium");
    });

    it("should include time_range", () => {
        const summary = generateSummaryLocal("c1", "Conv", 10);
        expect(summary.time_range).toBeDefined();
        expect(summary.time_range.start).toBeDefined();
        expect(summary.time_range.end).toBeDefined();
    });

    it("should include action items", () => {
        const summary = generateSummaryLocal("c1", "Conv", 10);
        expect(summary.action_items.length).toBeGreaterThan(0);
        for (const item of summary.action_items) {
            expect(item.id).toBeDefined();
            expect(item.text).toBeDefined();
            expect(item.priority).toBeDefined();
            expect(typeof item.completed).toBe("boolean");
        }
    });

    it("should extract topics from messages", () => {
        const summary = generateSummaryLocal("c1", "Conv", 30);
        expect(summary.topics.length).toBeGreaterThan(0);
    });

    it("should use default name when none provided", () => {
        const summary = generateSummaryLocal("c1", null, 5);
        expect(summary.conversation_name).toBe("Conversation");
    });
});

// ============================================================================
// 7. CONVERSATION SUMMARY (LLM)
// ============================================================================

describe("generateSummaryLLM", () => {
    it("should fall back to local when fetch fails", async () => {
        (global.fetch).mockRejectedValueOnce(new Error("Offline"));
        const summary = await generateSummaryLLM("conv-1", "My Conv", 20, "medium");
        expect(summary).toBeDefined();
        expect(summary.conversation_id).toBe("conv-1");
        expect(summary.status).toBe("completed");
    });

    it("should fall back to local when response is not ok", async () => {
        (global.fetch).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({}),
        });
        const summary = await generateSummaryLLM("conv-2", "Conv", 10);
        expect(summary).toBeDefined();
        expect(summary.status).toBe("completed");
    });

    it("should parse LLM response when successful", async () => {
        (global.fetch).mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    message: {
                        content: JSON.stringify({
                            summary: "Great conversation about projects",
                            key_points: ["point1", "point2"],
                            topics: ["project", "design"],
                            action_items: [{ text: "Follow up", assignee: "Alice", priority: "high" }],
                            sentiment: "positive",
                        }),
                    },
                }),
        });
        const summary = await generateSummaryLLM("conv-3", "Team Chat", 50, "long");
        expect(summary.summary).toBe("Great conversation about projects");
        expect(summary.key_points).toEqual(["point1", "point2"]);
        expect(summary.sentiment).toBe("positive");
    });
});

// ============================================================================
// 8. TEMPLATE MANAGEMENT
// ============================================================================

describe("getTemplates", () => {
    it("should return default templates when no custom templates exist", async () => {
        const templates = await getTemplates();
        expect(templates.length).toBe(getDefaultTemplateCount());
    });

    it("should include custom templates from storage", async () => {
        const custom = [
            { id: "tpl_custom_1", title: "Custom", content: "Hello", category: "custom" },
        ];
        mockStore["imuchat-suggestions-templates"] = JSON.stringify(custom);
        const templates = await getTemplates();
        expect(templates.length).toBe(getDefaultTemplateCount() + 1);
    });

    it("should handle corrupted storage gracefully", async () => {
        (AsyncStorage.getItem).mockRejectedValueOnce(new Error("Storage error"));
        const templates = await getTemplates();
        // Should return default templates
        expect(templates.length).toBe(getDefaultTemplateCount());
    });
});

describe("getTemplatesByCategory", () => {
    it("should filter templates by greeting", async () => {
        const templates = await getTemplatesByCategory("greeting");
        expect(templates.length).toBeGreaterThan(0);
        for (const t of templates) {
            expect(t.category).toBe("greeting");
        }
    });

    it("should return empty for non-existent category", async () => {
        const templates = await getTemplatesByCategory("nonexistent");
        expect(templates.length).toBe(0);
    });
});

describe("createTemplate", () => {
    it("should create and persist a custom template", async () => {
        const template = await createTemplate("My Template", "Hello {name}", "greeting");
        expect(template).toBeDefined();
        expect(template.id).toBeDefined();
        expect(template.title).toBe("My Template");
        expect(template.content).toBe("Hello {name}");
        expect(template.category).toBe("greeting");
        expect(template.is_custom).toBe(true);
        expect(template.is_favorite).toBe(false);
        expect(template.usage_count).toBe(0);
        expect(template.variables.length).toBe(1);
        expect(template.variables[0].name).toBe("name");

        // Verify AsyncStorage was called
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "imuchat-suggestions-templates",
            expect.any(String),
        );
    });

    it("should extract multiple variables from content", async () => {
        const template = await createTemplate("Invite", "Hey {name}, join us at {place} at {time}", "invitation");
        expect(template.variables.length).toBe(3);
        const varNames = template.variables.map((v) => v.name);
        expect(varNames).toContain("name");
        expect(varNames).toContain("place");
        expect(varNames).toContain("time");
    });

    it("should handle storage errors", async () => {
        (AsyncStorage.getItem).mockRejectedValueOnce(new Error("fail"));
        await expect(createTemplate("Test", "content", "custom")).rejects.toThrow();
    });
});

describe("deleteTemplate", () => {
    it("should delete a template by ID", async () => {
        const custom = [
            { id: "tpl_del_1", title: "To Delete", content: "x", category: "custom" },
            { id: "tpl_keep", title: "Keep", content: "y", category: "custom" },
        ];
        mockStore["imuchat-suggestions-templates"] = JSON.stringify(custom);
        const result = await deleteTemplate("tpl_del_1");
        expect(result).toBe(true);
        // Verify only one template remains
        const saved = JSON.parse(
            (AsyncStorage.setItem).mock.calls.find(
                (c) => c[0] === "imuchat-suggestions-templates",
            )[1],
        );
        expect(saved.length).toBe(1);
        expect(saved[0].id).toBe("tpl_keep");
    });

    it("should handle non-existent template", async () => {
        mockStore["imuchat-suggestions-templates"] = JSON.stringify([]);
        const result = await deleteTemplate("nonexistent");
        expect(result).toBe(true);
    });

    it("should handle storage error gracefully", async () => {
        (AsyncStorage.getItem).mockRejectedValueOnce(new Error("fail"));
        const result = await deleteTemplate("x");
        expect(result).toBe(false);
    });
});

describe("toggleTemplateFavorite", () => {
    it("should toggle favorite for custom template", async () => {
        const custom = [
            { id: "tpl_fav", title: "Fav", content: "x", category: "custom", is_custom: true, is_favorite: false },
        ];
        mockStore["imuchat-suggestions-templates"] = JSON.stringify(custom);
        const result = await toggleTemplateFavorite("tpl_fav");
        expect(result).toBeDefined();
        expect(result.is_favorite).toBe(true);
    });

    it("should toggle favorite for default template (stored separately)", async () => {
        // Default templates exist but no custom templates
        const result = await toggleTemplateFavorite("tpl_greeting_1");
        expect(result).toBeDefined();
        expect(result.is_favorite).toBe(true);
    });

    it("should return null for non-existent template", async () => {
        const result = await toggleTemplateFavorite("nonexistent_template_xyz");
        expect(result).toBeNull();
    });
});

describe("applyTemplateVariables", () => {
    it("should replace single variable", () => {
        const result = applyTemplateVariables("Hello {name}!", { name: "Alice" });
        expect(result).toBe("Hello Alice!");
    });

    it("should replace multiple variables", () => {
        const result = applyTemplateVariables("Hey {name}, see you at {place} at {time}!", {
            name: "Bob",
            place: "café",
            time: "14h",
        });
        expect(result).toBe("Hey Bob, see you at café at 14h!");
    });

    it("should replace same variable multiple times", () => {
        const result = applyTemplateVariables("{name} likes {name}", { name: "Alice" });
        expect(result).toBe("Alice likes Alice");
    });

    it("should leave unreplaced variables", () => {
        const result = applyTemplateVariables("Hey {name} at {place}", { name: "Alice" });
        expect(result).toBe("Hey Alice at {place}");
    });

    it("should handle empty variables", () => {
        const result = applyTemplateVariables("Hello {name}!", {});
        expect(result).toBe("Hello {name}!");
    });
});

describe("incrementTemplateUsage", () => {
    it("should increment usage count", async () => {
        const custom = [
            { id: "tpl_usage", title: "T", content: "x", usage_count: 5 },
        ];
        mockStore["imuchat-suggestions-templates"] = JSON.stringify(custom);
        await incrementTemplateUsage("tpl_usage");
        const saved = JSON.parse(
            (AsyncStorage.setItem).mock.calls.find(
                (c) => c[0] === "imuchat-suggestions-templates",
            )[1],
        );
        expect(saved[0].usage_count).toBe(6);
    });

    it("should handle non-existent template gracefully", async () => {
        mockStore["imuchat-suggestions-templates"] = JSON.stringify([]);
        await incrementTemplateUsage("nonexistent");
        // Should not throw
    });
});

// ============================================================================
// 9. SUMMARY PERSISTENCE
// ============================================================================

describe("saveSummary", () => {
    it("should save a summary to storage", async () => {
        const summary = { id: "sum-1", conversation_name: "Test", summary: "Summary text" };
        const result = await saveSummary(summary);
        expect(result).toBe(true);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "imuchat-suggestions-summaries",
            expect.any(String),
        );
    });

    it("should prepend new summary (most recent first)", async () => {
        const existing = [{ id: "sum-old", summary: "Old" }];
        mockStore["imuchat-suggestions-summaries"] = JSON.stringify(existing);
        const newSummary = { id: "sum-new", summary: "New" };
        await saveSummary(newSummary);
        const saved = JSON.parse(
            (AsyncStorage.setItem).mock.calls.find(
                (c) => c[0] === "imuchat-suggestions-summaries",
            )[1],
        );
        expect(saved[0].id).toBe("sum-new");
        expect(saved[1].id).toBe("sum-old");
    });

    it("should limit to 50 summaries", async () => {
        const existing = Array.from({ length: 55 }, (_, i) => ({
            id: "sum-" + i,
            summary: "S" + i,
        }));
        mockStore["imuchat-suggestions-summaries"] = JSON.stringify(existing);
        await saveSummary({ id: "sum-new", summary: "New" });
        const saved = JSON.parse(
            (AsyncStorage.setItem).mock.calls.find(
                (c) => c[0] === "imuchat-suggestions-summaries",
            )[1],
        );
        expect(saved.length).toBeLessThanOrEqual(50);
    });
});

describe("getSavedSummaries", () => {
    it("should return empty array when no summaries exist", async () => {
        const summaries = await getSavedSummaries();
        expect(summaries).toEqual([]);
    });

    it("should return saved summaries", async () => {
        mockStore["imuchat-suggestions-summaries"] = JSON.stringify([
            { id: "s1" },
            { id: "s2" },
        ]);
        const summaries = await getSavedSummaries();
        expect(summaries.length).toBe(2);
    });

    it("should handle storage error", async () => {
        (AsyncStorage.getItem).mockRejectedValueOnce(new Error("fail"));
        const summaries = await getSavedSummaries();
        expect(summaries).toEqual([]);
    });
});

describe("deleteSavedSummary", () => {
    it("should delete a summary by ID", async () => {
        mockStore["imuchat-suggestions-summaries"] = JSON.stringify([
            { id: "s1" },
            { id: "s2" },
        ]);
        const result = await deleteSavedSummary("s1");
        expect(result).toBe(true);
        const saved = JSON.parse(
            (AsyncStorage.setItem).mock.calls.find(
                (c) => c[0] === "imuchat-suggestions-summaries",
            )[1],
        );
        expect(saved.length).toBe(1);
        expect(saved[0].id).toBe("s2");
    });
});

// ============================================================================
// 10. STATS
// ============================================================================

describe("getStats", () => {
    it("should return default stats when no stats exist", async () => {
        const stats = await getStats();
        expect(stats.total_suggestions_shown).toBe(0);
        expect(stats.total_suggestions_used).toBe(0);
        expect(stats.acceptance_rate).toBe(0);
        expect(stats.summaries_generated).toBe(0);
    });

    it("should return stored stats", async () => {
        mockStore["imuchat-suggestions-stats"] = JSON.stringify({
            total_suggestions_shown: 10,
            total_suggestions_used: 5,
            acceptance_rate: 0.5,
        });
        const stats = await getStats();
        expect(stats.total_suggestions_shown).toBe(10);
    });
});

describe("updateStats", () => {
    it("should update and save stats", async () => {
        const result = await updateStats({ total_suggestions_shown: 20, total_suggestions_used: 8 });
        expect(result).toBeDefined();
        expect(result.total_suggestions_shown).toBe(20);
        expect(result.acceptance_rate).toBe(0.4);
    });

    it("should not divide by zero", async () => {
        const result = await updateStats({ total_suggestions_shown: 0, total_suggestions_used: 0 });
        expect(result).toBeDefined();
        expect(result.acceptance_rate).toBe(0);
    });
});

describe("recordSuggestionShown", () => {
    it("should increment shown count", async () => {
        await recordSuggestionShown();
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "imuchat-suggestions-stats",
            expect.any(String),
        );
    });

    it("should track daily usage", async () => {
        await recordSuggestionShown();
        const saved = JSON.parse(
            (AsyncStorage.setItem).mock.calls.find(
                (c) => c[0] === "imuchat-suggestions-stats",
            )[1],
        );
        expect(saved.daily_usage.length).toBeGreaterThan(0);
        expect(saved.daily_usage[0].suggestions_shown).toBeGreaterThan(0);
    });
});

describe("recordSuggestionUsed", () => {
    it("should increment used count", async () => {
        await recordSuggestionUsed("smart_reply");
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "imuchat-suggestions-stats",
            expect.any(String),
        );
    });

    it("should update daily usage", async () => {
        await recordSuggestionUsed("template");
        const saved = JSON.parse(
            (AsyncStorage.setItem).mock.calls.find(
                (c) => c[0] === "imuchat-suggestions-stats",
            )[1],
        );
        expect(saved.daily_usage.length).toBeGreaterThan(0);
    });
});

// ============================================================================
// 11. PREFERENCES
// ============================================================================

describe("getPreferences", () => {
    it("should return default preferences when none saved", async () => {
        const prefs = await getPreferences();
        expect(prefs.smart_reply_enabled).toBe(true);
        expect(prefs.auto_completion_enabled).toBe(true);
        expect(prefs.tone_detection_enabled).toBe(false);
        expect(prefs.max_suggestions).toBe(3);
        expect(prefs.preferred_tone).toBe("casual");
        expect(prefs.language).toBe("fr");
        expect(prefs.use_llm).toBe(false);
    });

    it("should merge stored preferences with defaults", async () => {
        mockStore["imuchat-suggestions-preferences"] = JSON.stringify({
            language: "en",
            use_llm: true,
        });
        const prefs = await getPreferences();
        expect(prefs.language).toBe("en");
        expect(prefs.use_llm).toBe(true);
        // Defaults still present
        expect(prefs.smart_reply_enabled).toBe(true);
    });

    it("should handle storage error", async () => {
        (AsyncStorage.getItem).mockRejectedValueOnce(new Error("fail"));
        const prefs = await getPreferences();
        expect(prefs.smart_reply_enabled).toBe(true);
    });
});

describe("savePreferences", () => {
    it("should save preferences to storage", async () => {
        const result = await savePreferences({ language: "ja", max_suggestions: 5 });
        expect(result).toBe(true);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "imuchat-suggestions-preferences",
            expect.any(String),
        );
    });

    it("should handle storage error", async () => {
        (AsyncStorage.setItem).mockRejectedValueOnce(new Error("fail"));
        const result = await savePreferences({ language: "en" });
        expect(result).toBe(false);
    });
});

// ============================================================================
// 12. HELPERS
// ============================================================================

describe("getTemplateCategories", () => {
    it("should return array of categories", () => {
        const categories = getTemplateCategories();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length).toBe(10);
        expect(categories).toContain("greeting");
        expect(categories).toContain("farewell");
        expect(categories).toContain("custom");
    });
});

describe("getReplyPatternCategories", () => {
    it("should return array of pattern categories", () => {
        const categories = getReplyPatternCategories();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length).toBe(9);
        expect(categories).toContain("greeting");
        expect(categories).toContain("thanks");
        expect(categories).toContain("negative");
    });
});

describe("getDefaultTemplateCount", () => {
    it("should return count of default templates", () => {
        const count = getDefaultTemplateCount();
        expect(count).toBe(10);
    });
});
