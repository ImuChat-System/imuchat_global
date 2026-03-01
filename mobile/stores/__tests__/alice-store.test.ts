/**
 * Tests for stores/alice-store.ts
 * Zustand store — conversations, provider config, personas
 *
 * Phase 3 — DEV-024 Module IA
 */

// --- Mocks ---
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import { useAliceStore } from "../alice-store";

// --- Helpers ---
const resetState = () => {
    useAliceStore.setState({
        providerSettings: {
            provider: "openai",
            apiKey: "",
            baseUrl: "",
            model: "gpt-4o-mini",
        },
        conversations: [],
        currentConversationId: null,
        selectedPersona: "general",
        streamResponses: false,
        saveHistory: true,
    });
};

describe("Alice Store", () => {
    beforeEach(() => {
        resetState();
    });

    // ===================================
    // PROVIDER SETTINGS
    // ===================================

    describe("Provider Settings", () => {
        it("should have default provider settings", () => {
            const state = useAliceStore.getState();
            expect(state.providerSettings.provider).toBe("openai");
            expect(state.providerSettings.model).toBe("gpt-4o-mini");
            expect(state.providerSettings.apiKey).toBe("");
            expect(state.providerSettings.baseUrl).toBe("");
        });

        it("should change provider", () => {
            useAliceStore.getState().setProvider("anthropic");
            const state = useAliceStore.getState();
            expect(state.providerSettings.provider).toBe("anthropic");
        });

        it("should reset model when changing provider", () => {
            useAliceStore.getState().setProvider("anthropic");
            expect(useAliceStore.getState().providerSettings.model).toBe(
                "claude-3-5-haiku-20241022",
            );

            useAliceStore.getState().setProvider("google");
            expect(useAliceStore.getState().providerSettings.model).toBe(
                "gemini-2.0-flash",
            );

            useAliceStore.getState().setProvider("groq");
            expect(useAliceStore.getState().providerSettings.model).toBe(
                "llama-3.3-70b-versatile",
            );
        });

        it("should set API key", () => {
            useAliceStore.getState().setApiKey("sk-test-12345");
            expect(useAliceStore.getState().providerSettings.apiKey).toBe(
                "sk-test-12345",
            );
        });

        it("should set base URL", () => {
            useAliceStore.getState().setBaseUrl("http://localhost:11434/v1");
            expect(useAliceStore.getState().providerSettings.baseUrl).toBe(
                "http://localhost:11434/v1",
            );
        });

        it("should set model", () => {
            useAliceStore.getState().setModel("gpt-4-turbo");
            expect(useAliceStore.getState().providerSettings.model).toBe(
                "gpt-4-turbo",
            );
        });

        it("should set multiple provider settings at once", () => {
            useAliceStore.getState().setProviderSettings({
                provider: "custom",
                baseUrl: "http://localhost:1234/v1",
                model: "llama3.1",
            });

            const { providerSettings } = useAliceStore.getState();
            expect(providerSettings.provider).toBe("custom");
            expect(providerSettings.baseUrl).toBe("http://localhost:1234/v1");
            expect(providerSettings.model).toBe("llama3.1");
        });
    });

    // ===================================
    // CONVERSATIONS
    // ===================================

    describe("Conversations", () => {
        it("should create a conversation", () => {
            const conv = useAliceStore.getState().createConversation();

            expect(conv).toBeDefined();
            expect(conv.id).toContain("alice_");
            expect(conv.title).toBe("Nouvelle conversation");
            expect(conv.persona).toBe("general");
            expect(conv.messages).toEqual([]);
            expect(conv.provider).toBe("openai");
        });

        it("should create conversation with specific persona", () => {
            const conv = useAliceStore.getState().createConversation("code");
            expect(conv.persona).toBe("code");
        });

        it("should auto-select new conversation as current", () => {
            const conv = useAliceStore.getState().createConversation();
            expect(useAliceStore.getState().currentConversationId).toBe(conv.id);
        });

        it("should prepend new conversations", () => {
            const conv1 = useAliceStore.getState().createConversation();
            const conv2 = useAliceStore.getState().createConversation();

            const { conversations } = useAliceStore.getState();
            expect(conversations.length).toBe(2);
            expect(conversations[0].id).toBe(conv2.id); // newest first
            expect(conversations[1].id).toBe(conv1.id);
        });

        it("should delete a conversation", () => {
            const conv1 = useAliceStore.getState().createConversation();
            const conv2 = useAliceStore.getState().createConversation();

            useAliceStore.getState().deleteConversation(conv1.id);

            const { conversations } = useAliceStore.getState();
            expect(conversations.length).toBe(1);
            expect(conversations[0].id).toBe(conv2.id);
        });

        it("should clear currentConversationId when deleting current conversation", () => {
            const conv = useAliceStore.getState().createConversation();
            expect(useAliceStore.getState().currentConversationId).toBe(conv.id);

            useAliceStore.getState().deleteConversation(conv.id);
            expect(useAliceStore.getState().currentConversationId).toBeNull();
        });

        it("should not clear currentConversationId when deleting a different conversation", () => {
            const conv1 = useAliceStore.getState().createConversation();
            const conv2 = useAliceStore.getState().createConversation();
            // conv2 is now current

            useAliceStore.getState().deleteConversation(conv1.id);
            expect(useAliceStore.getState().currentConversationId).toBe(conv2.id);
        });

        it("should clear all conversations", () => {
            useAliceStore.getState().createConversation();
            useAliceStore.getState().createConversation();
            useAliceStore.getState().createConversation();

            useAliceStore.getState().clearAllConversations();

            expect(useAliceStore.getState().conversations).toEqual([]);
            expect(useAliceStore.getState().currentConversationId).toBeNull();
        });

        it("should switch current conversation", () => {
            const conv1 = useAliceStore.getState().createConversation();
            useAliceStore.getState().createConversation();

            useAliceStore.getState().setCurrentConversation(conv1.id);
            expect(useAliceStore.getState().currentConversationId).toBe(conv1.id);
        });

        it("should set current conversation to null", () => {
            useAliceStore.getState().createConversation();
            useAliceStore.getState().setCurrentConversation(null);
            expect(useAliceStore.getState().currentConversationId).toBeNull();
        });
    });

    // ===================================
    // MESSAGES
    // ===================================

    describe("Messages", () => {
        it("should add a message to a conversation", () => {
            const conv = useAliceStore.getState().createConversation();

            useAliceStore.getState().addMessage(conv.id, {
                role: "user",
                content: "Bonjour !",
                timestamp: "2025-01-01T00:00:00Z",
            });

            const updated = useAliceStore
                .getState()
                .conversations.find((c) => c.id === conv.id);
            expect(updated.messages.length).toBe(1);
            expect(updated.messages[0].content).toBe("Bonjour !");
            expect(updated.messages[0].role).toBe("user");
        });

        it("should auto-title conversation on first user message", () => {
            const conv = useAliceStore.getState().createConversation();
            expect(conv.title).toBe("Nouvelle conversation");

            useAliceStore.getState().addMessage(conv.id, {
                role: "user",
                content: "Comment préparer un gâteau au chocolat ?",
            });

            const updated = useAliceStore
                .getState()
                .conversations.find((c) => c.id === conv.id);
            expect(updated.title).toBe(
                "Comment préparer un gâteau au chocolat ?",
            );
        });

        it("should truncate auto-title to 50 chars with ellipsis", () => {
            const conv = useAliceStore.getState().createConversation();

            const longMessage =
                "Ceci est un très long message qui dépasse largement les cinquante caractères autorisés pour le titre";
            useAliceStore.getState().addMessage(conv.id, {
                role: "user",
                content: longMessage,
            });

            const updated = useAliceStore
                .getState()
                .conversations.find((c) => c.id === conv.id);
            expect(updated.title.length).toBeLessThanOrEqual(51); // 50 + "…"
            expect(updated.title).toContain("…");
        });

        it("should not re-title on subsequent messages", () => {
            const conv = useAliceStore.getState().createConversation();

            useAliceStore.getState().addMessage(conv.id, {
                role: "user",
                content: "Premier message",
            });
            useAliceStore.getState().addMessage(conv.id, {
                role: "assistant",
                content: "Réponse d'Alice",
            });
            useAliceStore.getState().addMessage(conv.id, {
                role: "user",
                content: "Deuxième message",
            });

            const updated = useAliceStore
                .getState()
                .conversations.find((c) => c.id === conv.id);
            expect(updated.title).toBe("Premier message");
        });

        it("should update conversation updatedAt on new message", () => {
            const conv = useAliceStore.getState().createConversation();
            const originalUpdatedAt = conv.updatedAt;

            // Small delay to ensure different timestamp
            jest.advanceTimersByTime?.(100);

            useAliceStore.getState().addMessage(conv.id, {
                role: "user",
                content: "test",
            });

            const updated = useAliceStore
                .getState()
                .conversations.find((c) => c.id === conv.id);
            expect(updated.updatedAt).toBeDefined();
        });

        it("should not add message to non-existent conversation", () => {
            useAliceStore.getState().addMessage("non-existent-id", {
                role: "user",
                content: "test",
            });

            expect(useAliceStore.getState().conversations.length).toBe(0);
        });
    });

    // ===================================
    // CONVERSATION TITLE
    // ===================================

    describe("updateConversationTitle", () => {
        it("should update title manually", () => {
            const conv = useAliceStore.getState().createConversation();

            useAliceStore.getState().updateConversationTitle(
                conv.id,
                "Mon titre personnalisé",
            );

            const updated = useAliceStore
                .getState()
                .conversations.find((c) => c.id === conv.id);
            expect(updated.title).toBe("Mon titre personnalisé");
        });
    });

    // ===================================
    // PERSONA
    // ===================================

    describe("Persona", () => {
        it("should have default persona as general", () => {
            expect(useAliceStore.getState().selectedPersona).toBe("general");
        });

        it("should change persona", () => {
            useAliceStore.getState().setSelectedPersona("health");
            expect(useAliceStore.getState().selectedPersona).toBe("health");
        });
    });

    // ===================================
    // PREFERENCES
    // ===================================

    describe("Preferences", () => {
        it("should toggle streamResponses", () => {
            expect(useAliceStore.getState().streamResponses).toBe(false);
            useAliceStore.getState().setStreamResponses(true);
            expect(useAliceStore.getState().streamResponses).toBe(true);
        });

        it("should toggle saveHistory", () => {
            expect(useAliceStore.getState().saveHistory).toBe(true);
            useAliceStore.getState().setSaveHistory(false);
            expect(useAliceStore.getState().saveHistory).toBe(false);
        });
    });

    // ===================================
    // getCurrentConversation
    // ===================================

    describe("getCurrentConversation", () => {
        it("should return current conversation", () => {
            const conv = useAliceStore.getState().createConversation();
            const current = useAliceStore.getState().getCurrentConversation();
            expect(current).toBeDefined();
            expect(current.id).toBe(conv.id);
        });

        it("should return undefined when no current conversation", () => {
            const current = useAliceStore.getState().getCurrentConversation();
            expect(current).toBeUndefined();
        });

        it("should return undefined after clearing all conversations", () => {
            useAliceStore.getState().createConversation();
            useAliceStore.getState().clearAllConversations();
            expect(
                useAliceStore.getState().getCurrentConversation(),
            ).toBeUndefined();
        });
    });
});
