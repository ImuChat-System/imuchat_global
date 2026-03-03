/**
 * Tests — AI Admin Store (DEV-035)
 *
 * Couvre les actions du store Zustand AIAdmin :
 * - Global assistant toggle
 * - Personas CRUD + toggle
 * - Memory CRUD + clear
 * - Audit log
 * - Tool permissions
 * - Auto-summary settings
 * - Moderation settings
 */

import { useAIAdminStore } from "../ai-admin-store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getState() {
    return useAIAdminStore.getState();
}

function resetStore() {
    // Reset to initial state by toggling and clearing
    useAIAdminStore.setState({
        assistantEnabled: true,
        personas: getState().personas.filter(function (p) { return p.isBuiltIn; }),
        memoryEntries: [],
        memoryEnabled: true,
        auditLog: [],
        auditEnabled: true,
        toolPermissions: getState().toolPermissions.map(function (tp) {
            return { ...tp, enabled: ["web_search", "media_generation", "translation", "summarization"].includes(tp.tool), requireConfirmation: !["web_search", "media_generation", "translation", "summarization"].includes(tp.tool), lastUsedAt: null, usageCount: 0 };
        }),
        autoSummary: {
            enabled: false,
            frequency: "daily",
            length: "medium",
            language: "auto",
            includeKeyPoints: true,
            includeActionItems: true,
            notifyOnComplete: false,
        },
        moderation: {
            globalEnabled: true,
            globalLevel: "medium",
            rules: getState().moderation.rules,
            logModerationEvents: true,
            notifyOnBlock: true,
            allowOverride: false,
        },
        isLoading: false,
    });
}

beforeEach(resetStore);

// ---------------------------------------------------------------------------
// Global
// ---------------------------------------------------------------------------

describe("Global Assistant Toggle", function () {
    it("should start with assistant enabled", function () {
        expect(getState().assistantEnabled).toBe(true);
    });

    it("toggleAssistant should disable assistant", function () {
        getState().toggleAssistant(false);
        expect(getState().assistantEnabled).toBe(false);
    });

    it("toggleAssistant should re-enable assistant", function () {
        getState().toggleAssistant(false);
        getState().toggleAssistant(true);
        expect(getState().assistantEnabled).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------------

describe("Personas", function () {
    it("should start with 7 built-in personas", function () {
        var personas = getState().personas;
        expect(personas.length).toBe(7);
        personas.forEach(function (p) {
            expect(p.isBuiltIn).toBe(true);
        });
    });

    it("addPersona should add a custom persona", function () {
        var persona = getState().addPersona({
            name: "Custom Bot",
            description: "A custom persona",
            icon: "star",
            color: "#FF0000",
            systemPrompt: "You are a custom bot.",
            temperature: 0.5,
        });

        expect(persona.name).toBe("Custom Bot");
        expect(persona.isBuiltIn).toBe(false);
        expect(persona.isActive).toBe(true);
        expect(getState().personas.length).toBe(8);
    });

    it("updatePersona should modify a persona", function () {
        var persona = getState().addPersona({
            name: "Updatable",
            description: "desc",
            icon: "star",
            color: "#000",
            systemPrompt: "test",
            temperature: 0.5,
        });

        getState().updatePersona(persona.id, { name: "Updated Bot" });
        var updated = getState().personas.find(function (p) { return p.id === persona.id; });
        expect(updated!.name).toBe("Updated Bot");
    });

    it("deletePersona should remove a custom persona", function () {
        var persona = getState().addPersona({
            name: "ToDelete",
            description: "d",
            icon: "trash",
            color: "#000",
            systemPrompt: "t",
            temperature: 0.5,
        });

        expect(getState().personas.length).toBe(8);
        getState().deletePersona(persona.id);
        expect(getState().personas.length).toBe(7);
    });

    it("deletePersona should not remove built-in personas", function () {
        getState().deletePersona("general");
        expect(getState().personas.length).toBe(7);
        expect(getState().personas.find(function (p) { return p.id === "general"; })).toBeTruthy();
    });

    it("togglePersona should deactivate/activate a persona", function () {
        getState().togglePersona("general", false);
        var p = getState().personas.find(function (p) { return p.id === "general"; });
        expect(p!.isActive).toBe(false);

        getState().togglePersona("general", true);
        p = getState().personas.find(function (p) { return p.id === "general"; });
        expect(p!.isActive).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

describe("Memory", function () {
    it("should start with empty memory and memory enabled", function () {
        expect(getState().memoryEntries).toEqual([]);
        expect(getState().memoryEnabled).toBe(true);
    });

    it("toggleMemory should disable memory", function () {
        getState().toggleMemory(false);
        expect(getState().memoryEnabled).toBe(false);
    });

    it("addMemoryEntry should add an entry", function () {
        getState().addMemoryEntry({
            category: "preference",
            content: "User likes dark mode",
            source: "conversation",
            conversationId: "conv-1",
            expiresAt: null,
            isActive: true,
        });

        expect(getState().memoryEntries.length).toBe(1);
        expect(getState().memoryEntries[0].content).toBe("User likes dark mode");
        expect(getState().memoryEntries[0].category).toBe("preference");
    });

    it("deleteMemoryEntry should remove an entry", function () {
        getState().addMemoryEntry({
            category: "fact",
            content: "User is 25",
            source: "conversation",
            conversationId: null,
            expiresAt: null,
            isActive: true,
        });

        var id = getState().memoryEntries[0].id;
        getState().deleteMemoryEntry(id);
        expect(getState().memoryEntries.length).toBe(0);
    });

    it("deleteMemoryByCategory should remove entries of a category", function () {
        getState().addMemoryEntry({
            category: "preference",
            content: "Pref 1",
            source: "s",
            conversationId: null,
            expiresAt: null,
            isActive: true,
        });
        getState().addMemoryEntry({
            category: "fact",
            content: "Fact 1",
            source: "s",
            conversationId: null,
            expiresAt: null,
            isActive: true,
        });
        getState().addMemoryEntry({
            category: "preference",
            content: "Pref 2",
            source: "s",
            conversationId: null,
            expiresAt: null,
            isActive: true,
        });

        expect(getState().memoryEntries.length).toBe(3);
        getState().deleteMemoryByCategory("preference");
        expect(getState().memoryEntries.length).toBe(1);
        expect(getState().memoryEntries[0].category).toBe("fact");
    });

    it("clearAllMemory should remove all entries", function () {
        getState().addMemoryEntry({
            category: "fact",
            content: "A",
            source: "s",
            conversationId: null,
            expiresAt: null,
            isActive: true,
        });
        getState().addMemoryEntry({
            category: "context",
            content: "B",
            source: "s",
            conversationId: null,
            expiresAt: null,
            isActive: true,
        });

        expect(getState().memoryEntries.length).toBe(2);
        getState().clearAllMemory();
        expect(getState().memoryEntries.length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

describe("Audit Log", function () {
    it("should start with empty audit log and audit enabled", function () {
        expect(getState().auditLog).toEqual([]);
        expect(getState().auditEnabled).toBe(true);
    });

    it("addAuditEntry should add an entry", function () {
        getState().addAuditEntry("chat_sent", "info", "User sent a message");
        expect(getState().auditLog.length).toBe(1);
        expect(getState().auditLog[0].action).toBe("chat_sent");
        expect(getState().auditLog[0].severity).toBe("info");
    });

    it("addAuditEntry should not add when audit is disabled", function () {
        getState().toggleAudit(false);
        getState().addAuditEntry("chat_sent", "info", "Should not appear");
        expect(getState().auditLog.length).toBe(0);
    });

    it("addAuditEntry should prepend (newest first)", function () {
        getState().addAuditEntry("chat_sent", "info", "First");
        getState().addAuditEntry("chat_received", "info", "Second");
        expect(getState().auditLog[0].details).toBe("Second");
        expect(getState().auditLog[1].details).toBe("First");
    });

    it("addAuditEntry should respect 500 limit", function () {
        for (var i = 0; i < 510; i++) {
            getState().addAuditEntry("chat_sent", "info", "Entry " + i);
        }
        expect(getState().auditLog.length).toBe(500);
    });

    it("clearAuditLog should remove all entries", function () {
        getState().addAuditEntry("tool_used", "warning", "test");
        getState().addAuditEntry("moderation_triggered", "error", "test2");
        expect(getState().auditLog.length).toBe(2);
        getState().clearAuditLog();
        expect(getState().auditLog.length).toBe(0);
    });

    it("toggleAudit should disable audit", function () {
        getState().toggleAudit(false);
        expect(getState().auditEnabled).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

describe("Tool Permissions", function () {
    it("should start with 9 tool permissions", function () {
        expect(getState().toolPermissions.length).toBe(9);
    });

    it("toggleToolPermission should enable a tool", function () {
        getState().toggleToolPermission("code_execution", true);
        var perm = getState().toolPermissions.find(function (tp) { return tp.tool === "code_execution"; });
        expect(perm!.enabled).toBe(true);
    });

    it("toggleToolPermission should disable a tool", function () {
        getState().toggleToolPermission("web_search", false);
        var perm = getState().toolPermissions.find(function (tp) { return tp.tool === "web_search"; });
        expect(perm!.enabled).toBe(false);
    });

    it("setToolConfirmation should toggle confirmation", function () {
        getState().setToolConfirmation("web_search", true);
        var perm = getState().toolPermissions.find(function (tp) { return tp.tool === "web_search"; });
        expect(perm!.requireConfirmation).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Auto-Summary
// ---------------------------------------------------------------------------

describe("Auto-Summary Settings", function () {
    it("should start with auto-summary disabled", function () {
        expect(getState().autoSummary.enabled).toBe(false);
        expect(getState().autoSummary.frequency).toBe("daily");
    });

    it("updateAutoSummary should enable and change frequency", function () {
        getState().updateAutoSummary({ enabled: true, frequency: "weekly" });
        expect(getState().autoSummary.enabled).toBe(true);
        expect(getState().autoSummary.frequency).toBe("weekly");
    });

    it("updateAutoSummary should update language", function () {
        getState().updateAutoSummary({ language: "en" });
        expect(getState().autoSummary.language).toBe("en");
    });

    it("updateAutoSummary should update length", function () {
        getState().updateAutoSummary({ length: "long" });
        expect(getState().autoSummary.length).toBe("long");
    });

    it("updateAutoSummary should preserve other fields", function () {
        getState().updateAutoSummary({ enabled: true });
        expect(getState().autoSummary.frequency).toBe("daily");
        expect(getState().autoSummary.includeKeyPoints).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------

describe("Moderation Settings", function () {
    it("should start with moderation globally enabled", function () {
        expect(getState().moderation.globalEnabled).toBe(true);
        expect(getState().moderation.globalLevel).toBe("medium");
    });

    it("updateModeration should change global settings", function () {
        getState().updateModeration({ globalLevel: "high", allowOverride: true });
        expect(getState().moderation.globalLevel).toBe("high");
        expect(getState().moderation.allowOverride).toBe(true);
    });

    it("updateModeration should disable moderation globally", function () {
        getState().updateModeration({ globalEnabled: false });
        expect(getState().moderation.globalEnabled).toBe(false);
    });

    it("updateModerationRule should update a specific rule", function () {
        getState().updateModerationRule("spam", { level: "high", action: "block" });
        var rule = getState().moderation.rules.find(function (r) { return r.category === "spam"; });
        expect(rule!.level).toBe("high");
        expect(rule!.action).toBe("block");
    });

    it("updateModerationRule should disable a rule", function () {
        getState().updateModerationRule("violence", { enabled: false });
        var rule = getState().moderation.rules.find(function (r) { return r.category === "violence"; });
        expect(rule!.enabled).toBe(false);
    });

    it("updateModeration should preserve rules when changing global", function () {
        var rulesBefore = getState().moderation.rules.length;
        getState().updateModeration({ globalLevel: "strict" });
        expect(getState().moderation.rules.length).toBe(rulesBefore);
    });
});

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

describe("Loading state", function () {
    it("setLoading should update isLoading", function () {
        expect(getState().isLoading).toBe(false);
        getState().setLoading(true);
        expect(getState().isLoading).toBe(true);
        getState().setLoading(false);
        expect(getState().isLoading).toBe(false);
    });
});
