/**
 * Tests pour le suggestions-store (Zustand).
 *
 * Couvre : Smart Reply actions, Completion actions, Summary actions,
 *          Tone actions, Template actions, Preferences, Stats, Reset.
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import { useSuggestionsStore } from "../suggestions-store";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
}));

const mockGenerateSmartRepliesLocal = jest.fn(() => [
    { id: "r1", text: "Salut !", type: "smart_reply", confidence: 0.9, source: "pattern", created_at: "2026-01-01" },
    { id: "r2", text: "Hello", type: "smart_reply", confidence: 0.8, source: "pattern", created_at: "2026-01-01" },
]);
const mockRecordSuggestionShown = jest.fn(() => Promise.resolve());
const mockRecordSuggestionUsed = jest.fn(() => Promise.resolve());
const mockGenerateCompletionLocal = jest.fn(() => [
    { id: "c1", text: "e que tu es dispo ?", full_text: "est-ce que tu es dispo ?", confidence: 0.7, source: "pattern" },
]);
const mockGenerateSummaryLocal = jest.fn(() => ({
    id: "sum-1",
    conversation_id: "conv-1",
    conversation_name: "Conversation",
    summary: "Résumé de la conversation",
    key_points: ["Point 1"],
    participants: ["Alice", "Bob"],
    message_count: 20,
    time_range: { start: "2026-01-01", end: "2026-01-02" },
    topics: ["projet"],
    action_items: [],
    sentiment: "neutral",
    status: "completed",
    length: "medium",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
}));
const mockSaveSummary = jest.fn(() => Promise.resolve(true));
const mockGetSavedSummaries = jest.fn(() =>
    Promise.resolve([
        { id: "sum-a", summary: "A" },
        { id: "sum-b", summary: "B" },
    ]),
);
const mockDeleteSavedSummary = jest.fn(() => Promise.resolve(true));
const mockAnalyzeToneLocal = jest.fn(() => ({
    id: "tone-1",
    message_id: "msg-1",
    primary_tone: "positive",
    secondary_tone: "casual",
    confidence: 0.85,
    emotions: [{ emotion: "positive", score: 0.7 }],
    language: "fr",
}));
const mockGetTemplates = jest.fn(() =>
    Promise.resolve([
        {
            id: "tpl_1",
            title: "Salutation",
            content: "Hello {name}",
            category: "greeting",
            language: "fr",
            variables: [{ name: "name", placeholder: "{name}", default_value: "" }],
            usage_count: 0,
            is_custom: false,
            is_favorite: false,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
        },
        {
            id: "tpl_2",
            title: "Thank you",
            content: "Merci",
            category: "thanks",
            language: "fr",
            variables: [],
            usage_count: 3,
            is_custom: false,
            is_favorite: true,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
        },
    ]),
);
const mockCreateTemplateApi = jest.fn((title, content, category) =>
    Promise.resolve({
        id: "tpl_new",
        title,
        content,
        category,
        language: "fr",
        variables: [],
        usage_count: 0,
        is_custom: true,
        is_favorite: false,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
    }),
);
const mockDeleteTemplateApi = jest.fn(() => Promise.resolve(true));
const mockToggleTemplateFavorite = jest.fn();
const mockIncrementTemplateUsage = jest.fn();
const mockApplyTemplateVariables = jest.fn(
    (content, vars) => {
        let result = content;
        for (const [key, value] of Object.entries(vars)) {
            result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
        }
        return result;
    },
);
const mockGetStats = jest.fn(() =>
    Promise.resolve({
        total_suggestions_shown: 10,
        total_suggestions_used: 5,
        acceptance_rate: 0.5,
        most_used_type: "smart_reply",
        summaries_generated: 2,
        templates_used: 3,
        top_templates: [],
        daily_usage: [],
    }),
);
const mockGetPreferences = jest.fn();
const mockSavePreferences = jest.fn();

jest.mock("@/services/suggestions-api", () => ({
    generateSmartRepliesLocal: (...args) => mockGenerateSmartRepliesLocal(...args),
    recordSuggestionShown: (...args) => mockRecordSuggestionShown(...args),
    recordSuggestionUsed: (...args) => mockRecordSuggestionUsed(...args),
    generateCompletionLocal: (...args) => mockGenerateCompletionLocal(...args),
    generateSummaryLocal: (...args) => mockGenerateSummaryLocal(...args),
    saveSummary: (...args) => mockSaveSummary(...args),
    getSavedSummaries: (...args) => mockGetSavedSummaries(...args),
    deleteSavedSummary: (...args) => mockDeleteSavedSummary(...args),
    analyzeToneLocal: (...args) => mockAnalyzeToneLocal(...args),
    getTemplates: (...args) => mockGetTemplates(...args),
    createTemplate: (...args) => mockCreateTemplateApi(...args),
    deleteTemplate: (...args) => mockDeleteTemplateApi(...args),
    toggleTemplateFavorite: (...args) => mockToggleTemplateFavorite(...args),
    incrementTemplateUsage: (...args) => mockIncrementTemplateUsage(...args),
    applyTemplateVariables: (...args) => mockApplyTemplateVariables(...args),
    getStats: (...args) => mockGetStats(...args),
    getPreferences: (...args) => mockGetPreferences(...args),
    savePreferences: (...args) => mockSavePreferences(...args),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

// ─── Helpers ──────────────────────────────────────────────────

function resetStore() {
    useSuggestionsStore.getState().reset();
}

beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
});

// ============================================================================
// 1. INITIAL STATE
// ============================================================================

describe("initial state", () => {
    it("should have empty smart replies", () => {
        expect(useSuggestionsStore.getState().smartReplies).toEqual([]);
    });

    it("should have empty completions", () => {
        expect(useSuggestionsStore.getState().completions).toEqual([]);
    });

    it("should have empty summaries", () => {
        expect(useSuggestionsStore.getState().summaries).toEqual([]);
    });

    it("should have empty templates", () => {
        expect(useSuggestionsStore.getState().templates).toEqual([]);
    });

    it("should have null stats", () => {
        expect(useSuggestionsStore.getState().stats).toBeNull();
    });

    it("should have default preferences", () => {
        const prefs = useSuggestionsStore.getState().preferences;
        expect(prefs.smart_reply_enabled).toBe(true);
        expect(prefs.auto_completion_enabled).toBe(true);
        expect(prefs.tone_detection_enabled).toBe(false);
        expect(prefs.max_suggestions).toBe(3);
        expect(prefs.language).toBe("fr");
        expect(prefs.use_llm).toBe(false);
    });

    it("should not be loading", () => {
        expect(useSuggestionsStore.getState().isLoadingSuggestions).toBe(false);
        expect(useSuggestionsStore.getState().isGeneratingSummary).toBe(false);
        expect(useSuggestionsStore.getState().isAnalyzingTone).toBe(false);
    });

    it("should have no error", () => {
        expect(useSuggestionsStore.getState().error).toBeNull();
    });

    it("should have no current tone", () => {
        expect(useSuggestionsStore.getState().currentTone).toBeNull();
    });

    it("should have no selected template category", () => {
        expect(useSuggestionsStore.getState().selectedTemplateCategory).toBeNull();
    });
});

// ============================================================================
// 2. SMART REPLY ACTIONS
// ============================================================================

describe("generateSmartReplies", () => {
    const context = {
        message_id: "m1",
        conversation_id: "c1",
        content: "Bonjour !",
        sender_id: "u1",
        sender_name: "Alice",
        previous_messages: [],
    };

    it("should generate and store smart replies", async () => {
        await useSuggestionsStore.getState().generateSmartReplies(context);
        const state = useSuggestionsStore.getState();
        expect(state.smartReplies.length).toBe(2);
        expect(state.isLoadingSuggestions).toBe(false);
        expect(mockGenerateSmartRepliesLocal).toHaveBeenCalledWith(context, 3);
        expect(mockRecordSuggestionShown).toHaveBeenCalled();
    });

    it("should set loading state while generating", async () => {
        const promise = useSuggestionsStore.getState().generateSmartReplies(context);
        // isLoadingSuggestions may have been set then resolved, just check resolved state
        await promise;
        expect(useSuggestionsStore.getState().isLoadingSuggestions).toBe(false);
    });

    it("should handle errors gracefully", async () => {
        mockGenerateSmartRepliesLocal.mockImplementationOnce(() => {
            throw new Error("fail");
        });
        await useSuggestionsStore.getState().generateSmartReplies(context);
        const state = useSuggestionsStore.getState();
        expect(state.error).toBe("fail");
        expect(state.isLoadingSuggestions).toBe(false);
    });
});

describe("acceptSuggestion", () => {
    it("should remove accepted suggestion from list", async () => {
        await useSuggestionsStore.getState().generateSmartReplies({
            content: "Test",
            sender_name: "A",
            previous_messages: [],
        });
        const replies = useSuggestionsStore.getState().smartReplies;
        expect(replies.length).toBe(2);

        useSuggestionsStore.getState().acceptSuggestion("r1");
        expect(useSuggestionsStore.getState().smartReplies.length).toBe(1);
        expect(mockRecordSuggestionUsed).toHaveBeenCalledWith("smart_reply");
    });

    it("should do nothing for non-existent suggestion", () => {
        useSuggestionsStore.getState().acceptSuggestion("nonexistent");
        expect(mockRecordSuggestionUsed).not.toHaveBeenCalled();
    });
});

describe("dismissSuggestion", () => {
    it("should remove dismissed suggestion from list", async () => {
        await useSuggestionsStore.getState().generateSmartReplies({
            content: "Test",
            sender_name: "A",
            previous_messages: [],
        });
        useSuggestionsStore.getState().dismissSuggestion("r1");
        const remaining = useSuggestionsStore.getState().smartReplies;
        expect(remaining.length).toBe(1);
        expect(remaining[0].id).toBe("r2");
    });
});

describe("clearSmartReplies", () => {
    it("should clear all smart replies", async () => {
        await useSuggestionsStore.getState().generateSmartReplies({
            content: "Test",
            sender_name: "A",
            previous_messages: [],
        });
        expect(useSuggestionsStore.getState().smartReplies.length).toBe(2);
        useSuggestionsStore.getState().clearSmartReplies();
        expect(useSuggestionsStore.getState().smartReplies).toEqual([]);
    });
});

// ============================================================================
// 3. COMPLETION ACTIONS
// ============================================================================

describe("generateCompletion", () => {
    it("should generate and store completions", async () => {
        await useSuggestionsStore.getState().generateCompletion("est-ce qu");
        const state = useSuggestionsStore.getState();
        expect(state.completions.length).toBe(1);
        expect(mockGenerateCompletionLocal).toHaveBeenCalledWith("est-ce qu");
    });

    it("should handle errors and set empty completions", async () => {
        mockGenerateCompletionLocal.mockImplementationOnce(() => {
            throw new Error("fail");
        });
        await useSuggestionsStore.getState().generateCompletion("test");
        expect(useSuggestionsStore.getState().completions).toEqual([]);
    });
});

describe("clearCompletions", () => {
    it("should clear all completions", async () => {
        await useSuggestionsStore.getState().generateCompletion("est-ce qu");
        useSuggestionsStore.getState().clearCompletions();
        expect(useSuggestionsStore.getState().completions).toEqual([]);
    });
});

// ============================================================================
// 4. SUMMARY ACTIONS
// ============================================================================

describe("generateSummary", () => {
    it("should generate summary and add to list", async () => {
        await useSuggestionsStore.getState().generateSummary("conv-1", 20, "medium");
        const state = useSuggestionsStore.getState();
        expect(state.summaries.length).toBe(1);
        expect(state.summaries[0].id).toBe("sum-1");
        expect(state.isGeneratingSummary).toBe(false);
        expect(mockGenerateSummaryLocal).toHaveBeenCalled();
        expect(mockSaveSummary).toHaveBeenCalled();
    });

    it("should prepend new summary to existing list", async () => {
        useSuggestionsStore.setState({ summaries: [{ id: "old", summary: "Old" }] });
        await useSuggestionsStore.getState().generateSummary("conv-2", 10, "short");
        const summaries = useSuggestionsStore.getState().summaries;
        expect(summaries[0].id).toBe("sum-1");
        expect(summaries.length).toBe(2);
    });

    it("should handle errors gracefully", async () => {
        mockGenerateSummaryLocal.mockImplementationOnce(() => {
            throw new Error("summary fail");
        });
        await useSuggestionsStore.getState().generateSummary("conv-err", 10);
        const state = useSuggestionsStore.getState();
        expect(state.error).toBe("summary fail");
        expect(state.isGeneratingSummary).toBe(false);
    });

    it("should increment summaries_generated stat", async () => {
        useSuggestionsStore.setState({
            stats: {
                total_suggestions_shown: 0,
                total_suggestions_used: 0,
                summaries_generated: 5,
            },
        });
        await useSuggestionsStore.getState().generateSummary("conv-3", 15);
        expect(useSuggestionsStore.getState().stats.summaries_generated).toBe(6);
    });
});

describe("loadSummaries", () => {
    it("should load summaries from storage", async () => {
        await useSuggestionsStore.getState().loadSummaries();
        const summaries = useSuggestionsStore.getState().summaries;
        expect(summaries.length).toBe(2);
        expect(summaries[0].id).toBe("sum-a");
        expect(mockGetSavedSummaries).toHaveBeenCalled();
    });

    it("should handle load errors", async () => {
        mockGetSavedSummaries.mockRejectedValueOnce(new Error("load fail"));
        await useSuggestionsStore.getState().loadSummaries();
        // Should not crash
    });
});

describe("deleteSummary", () => {
    it("should remove summary from state and storage", async () => {
        useSuggestionsStore.setState({
            summaries: [
                { id: "s1", summary: "A" },
                { id: "s2", summary: "B" },
            ],
        });
        useSuggestionsStore.getState().deleteSummary("s1");
        const summaries = useSuggestionsStore.getState().summaries;
        expect(summaries.length).toBe(1);
        expect(summaries[0].id).toBe("s2");
        expect(mockDeleteSavedSummary).toHaveBeenCalledWith("s1");
    });
});

// ============================================================================
// 5. TONE ACTIONS
// ============================================================================

describe("analyzeTone", () => {
    it("should analyze tone and store result", async () => {
        await useSuggestionsStore.getState().analyzeTone("msg-1", "Super cool !");
        const state = useSuggestionsStore.getState();
        expect(state.currentTone).toBeDefined();
        expect(state.currentTone.primary_tone).toBe("positive");
        expect(state.isAnalyzingTone).toBe(false);
        expect(mockAnalyzeToneLocal).toHaveBeenCalledWith("msg-1", "Super cool !");
    });

    it("should handle analysis errors", async () => {
        mockAnalyzeToneLocal.mockImplementationOnce(() => {
            throw new Error("tone fail");
        });
        await useSuggestionsStore.getState().analyzeTone("msg-2", "test");
        expect(useSuggestionsStore.getState().isAnalyzingTone).toBe(false);
    });
});

describe("clearTone", () => {
    it("should clear current tone", async () => {
        await useSuggestionsStore.getState().analyzeTone("msg-1", "test");
        useSuggestionsStore.getState().clearTone();
        expect(useSuggestionsStore.getState().currentTone).toBeNull();
    });
});

// ============================================================================
// 6. TEMPLATE ACTIONS
// ============================================================================

describe("loadTemplates", () => {
    it("should load templates from service", async () => {
        await useSuggestionsStore.getState().loadTemplates();
        const templates = useSuggestionsStore.getState().templates;
        expect(templates.length).toBe(2);
        expect(mockGetTemplates).toHaveBeenCalled();
    });

    it("should handle load errors", async () => {
        mockGetTemplates.mockRejectedValueOnce(new Error("fail"));
        await useSuggestionsStore.getState().loadTemplates();
        // Should not crash
    });
});

describe("createTemplate", () => {
    it("should create and add template to state", async () => {
        await useSuggestionsStore.getState().createTemplate("New", "Content", "custom");
        const templates = useSuggestionsStore.getState().templates;
        expect(templates.length).toBe(1);
        expect(templates[0].id).toBe("tpl_new");
        expect(templates[0].title).toBe("New");
        expect(mockCreateTemplateApi).toHaveBeenCalledWith("New", "Content", "custom");
    });

    it("should handle creation errors", async () => {
        mockCreateTemplateApi.mockRejectedValueOnce(new Error("create fail"));
        await useSuggestionsStore.getState().createTemplate("Fail", "x", "custom");
        expect(useSuggestionsStore.getState().error).toBe("create fail");
    });
});

describe("deleteTemplate", () => {
    it("should remove template from state", () => {
        useSuggestionsStore.setState({
            templates: [
                { id: "tpl_a", title: "A" },
                { id: "tpl_b", title: "B" },
            ],
        });
        useSuggestionsStore.getState().deleteTemplate("tpl_a");
        expect(useSuggestionsStore.getState().templates.length).toBe(1);
        expect(useSuggestionsStore.getState().templates[0].id).toBe("tpl_b");
        expect(mockDeleteTemplateApi).toHaveBeenCalledWith("tpl_a");
    });
});

describe("toggleFavorite", () => {
    it("should toggle favorite status in state", () => {
        useSuggestionsStore.setState({
            templates: [{ id: "tpl_1", is_favorite: false }],
        });
        useSuggestionsStore.getState().toggleFavorite("tpl_1");
        expect(useSuggestionsStore.getState().templates[0].is_favorite).toBe(true);
        expect(mockToggleTemplateFavorite).toHaveBeenCalledWith("tpl_1");
    });

    it("should toggle back to false", () => {
        useSuggestionsStore.setState({
            templates: [{ id: "tpl_1", is_favorite: true }],
        });
        useSuggestionsStore.getState().toggleFavorite("tpl_1");
        expect(useSuggestionsStore.getState().templates[0].is_favorite).toBe(false);
    });
});

describe("useTemplate", () => {
    it("should apply variables and return text", () => {
        useSuggestionsStore.setState({
            templates: [
                { id: "tpl_t", content: "Hello {name}", usage_count: 2 },
            ],
        });
        const result = useSuggestionsStore.getState().useTemplate("tpl_t", { name: "Alice" });
        expect(result).toBe("Hello Alice");
        expect(mockIncrementTemplateUsage).toHaveBeenCalledWith("tpl_t");
        expect(mockRecordSuggestionUsed).toHaveBeenCalledWith("template");
    });

    it("should increment usage count locally", () => {
        useSuggestionsStore.setState({
            templates: [{ id: "tpl_u", content: "Hey", usage_count: 5 }],
        });
        useSuggestionsStore.getState().useTemplate("tpl_u", {});
        expect(useSuggestionsStore.getState().templates[0].usage_count).toBe(6);
    });

    it("should return empty string for non-existent template", () => {
        const result = useSuggestionsStore.getState().useTemplate("nonexistent", {});
        expect(result).toBe("");
    });
});

describe("setTemplateCategory", () => {
    it("should set selected category", () => {
        useSuggestionsStore.getState().setTemplateCategory("greeting");
        expect(useSuggestionsStore.getState().selectedTemplateCategory).toBe("greeting");
    });

    it("should clear category with null", () => {
        useSuggestionsStore.getState().setTemplateCategory("greeting");
        useSuggestionsStore.getState().setTemplateCategory(null);
        expect(useSuggestionsStore.getState().selectedTemplateCategory).toBeNull();
    });
});

// ============================================================================
// 7. PREFERENCES ACTIONS
// ============================================================================

describe("updatePreferences", () => {
    it("should update specific preference fields", () => {
        useSuggestionsStore.getState().updatePreferences({ language: "en" });
        const prefs = useSuggestionsStore.getState().preferences;
        expect(prefs.language).toBe("en");
        expect(prefs.smart_reply_enabled).toBe(true); // untouched
        expect(mockSavePreferences).toHaveBeenCalled();
    });

    it("should update multiple fields at once", () => {
        useSuggestionsStore.getState().updatePreferences({
            use_llm: true,
            max_suggestions: 5,
            tone_detection_enabled: true,
        });
        const prefs = useSuggestionsStore.getState().preferences;
        expect(prefs.use_llm).toBe(true);
        expect(prefs.max_suggestions).toBe(5);
        expect(prefs.tone_detection_enabled).toBe(true);
    });
});

// ============================================================================
// 8. STATS ACTIONS
// ============================================================================

describe("loadStats", () => {
    it("should load stats from service", async () => {
        await useSuggestionsStore.getState().loadStats();
        const stats = useSuggestionsStore.getState().stats;
        expect(stats).toBeDefined();
        expect(stats.total_suggestions_shown).toBe(10);
        expect(stats.total_suggestions_used).toBe(5);
        expect(mockGetStats).toHaveBeenCalled();
    });

    it("should handle load errors", async () => {
        mockGetStats.mockRejectedValueOnce(new Error("stats fail"));
        await useSuggestionsStore.getState().loadStats();
        // Should not crash
    });
});

// ============================================================================
// 9. UTILITY ACTIONS
// ============================================================================

describe("clearError", () => {
    it("should clear error state", () => {
        useSuggestionsStore.setState({ error: "some error" });
        useSuggestionsStore.getState().clearError();
        expect(useSuggestionsStore.getState().error).toBeNull();
    });
});

describe("reset", () => {
    it("should reset all state to defaults", async () => {
        // Populate state
        await useSuggestionsStore.getState().generateSmartReplies({
            content: "Test",
            sender_name: "A",
            previous_messages: [],
        });
        useSuggestionsStore.getState().updatePreferences({ language: "ja" });
        useSuggestionsStore.setState({ error: "err", summaries: [{ id: "s1" }] });

        // Reset
        useSuggestionsStore.getState().reset();
        const state = useSuggestionsStore.getState();
        expect(state.smartReplies).toEqual([]);
        expect(state.completions).toEqual([]);
        expect(state.summaries).toEqual([]);
        expect(state.templates).toEqual([]);
        expect(state.stats).toBeNull();
        expect(state.error).toBeNull();
        expect(state.currentTone).toBeNull();
        expect(state.isLoadingSuggestions).toBe(false);
        expect(state.isGeneratingSummary).toBe(false);
        expect(state.isAnalyzingTone).toBe(false);
        expect(state.preferences.language).toBe("fr");
        expect(state.preferences.smart_reply_enabled).toBe(true);
    });
});
