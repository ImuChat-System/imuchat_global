/**
 * Alice Store (Zustand)
 *
 * Gère l'état global de l'assistant IA Alice :
 *  - Configuration fournisseur LLM (provider, API key, model, endpoint)
 *  - Conversations locales (historique, persona)
 *  - Persona sélectionnée
 *  - Préférences Alice
 *
 * Persistance via AsyncStorage.
 *
 * Phase 3 — DEV-024 Module IA
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createLogger } from "@/services/logger";
import type { AliceMessage, AliceProvider } from "@/services/alice";

const logger = createLogger("AliceStore");

// ============================================================================
// TYPES
// ============================================================================

export interface AliceConversation {
    id: string;
    title: string;
    persona: string;
    messages: AliceMessage[];
    provider: AliceProvider;
    model: string;
    createdAt: string;
    updatedAt: string;
}

export interface AliceProviderSettings {
    provider: AliceProvider;
    apiKey: string;
    baseUrl: string;
    model: string;
}

export interface AliceState {
    // === Provider Config ===
    providerSettings: AliceProviderSettings;

    // === Conversations ===
    conversations: AliceConversation[];
    currentConversationId: string | null;

    // === Persona ===
    selectedPersona: string;

    // === Preferences ===
    streamResponses: boolean;
    saveHistory: boolean;

    // === Actions — Provider ===
    setProvider: (provider: AliceProvider) => void;
    setApiKey: (key: string) => void;
    setBaseUrl: (url: string) => void;
    setModel: (model: string) => void;
    setProviderSettings: (settings: Partial<AliceProviderSettings>) => void;

    // === Actions — Conversations ===
    createConversation: (persona?: string) => AliceConversation;
    deleteConversation: (id: string) => void;
    clearAllConversations: () => void;
    setCurrentConversation: (id: string | null) => void;
    addMessage: (conversationId: string, message: AliceMessage) => void;
    updateConversationTitle: (id: string, title: string) => void;

    // === Actions — Persona ===
    setSelectedPersona: (personaId: string) => void;

    // === Actions — Preferences ===
    setStreamResponses: (enabled: boolean) => void;
    setSaveHistory: (enabled: boolean) => void;

    // === Getters ===
    getCurrentConversation: () => AliceConversation | undefined;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_PROVIDER_SETTINGS: AliceProviderSettings = {
    provider: "openai" as AliceProvider,
    apiKey: "",
    baseUrl: "",
    model: "gpt-4o-mini",
};

// ============================================================================
// STORE
// ============================================================================

export const useAliceStore = create<AliceState>()(
    persist(
        (set, get) => ({
            // === State ===
            providerSettings: { ...DEFAULT_PROVIDER_SETTINGS },
            conversations: [],
            currentConversationId: null,
            selectedPersona: "general",
            streamResponses: false,
            saveHistory: true,

            // === Provider Actions ===
            setProvider: (provider) => {
                logger.info(`Provider changed to: ${provider}`);
                set((state) => ({
                    providerSettings: {
                        ...state.providerSettings,
                        provider,
                        // Reset model when switching providers
                        model: getDefaultModelForProvider(provider),
                    },
                }));
            },

            setApiKey: (apiKey) => {
                set((state) => ({
                    providerSettings: { ...state.providerSettings, apiKey },
                }));
            },

            setBaseUrl: (baseUrl) => {
                set((state) => ({
                    providerSettings: { ...state.providerSettings, baseUrl },
                }));
            },

            setModel: (model) => {
                logger.info(`Model changed to: ${model}`);
                set((state) => ({
                    providerSettings: { ...state.providerSettings, model },
                }));
            },

            setProviderSettings: (settings) => {
                set((state) => ({
                    providerSettings: { ...state.providerSettings, ...settings },
                }));
            },

            // === Conversation Actions ===
            createConversation: (persona) => {
                const now = new Date().toISOString();
                const personaId = persona || get().selectedPersona;
                const { provider, model } = get().providerSettings;

                const conversation: AliceConversation = {
                    id: `alice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    title: "Nouvelle conversation",
                    persona: personaId,
                    messages: [],
                    provider: provider as AliceProvider,
                    model,
                    createdAt: now,
                    updatedAt: now,
                };

                logger.info(
                    `Created conversation: ${conversation.id} (persona: ${personaId})`,
                );

                set((state) => ({
                    conversations: [conversation, ...state.conversations],
                    currentConversationId: conversation.id,
                }));

                return conversation;
            },

            deleteConversation: (id) => {
                logger.info(`Deleted conversation: ${id}`);
                set((state) => ({
                    conversations: state.conversations.filter((c) => c.id !== id),
                    currentConversationId:
                        state.currentConversationId === id
                            ? null
                            : state.currentConversationId,
                }));
            },

            clearAllConversations: () => {
                logger.info("Cleared all conversations");
                set({ conversations: [], currentConversationId: null });
            },

            setCurrentConversation: (id) => {
                set({ currentConversationId: id });
            },

            addMessage: (conversationId, message) => {
                set((state) => ({
                    conversations: state.conversations.map((c) => {
                        if (c.id !== conversationId) return c;
                        const updatedMessages = [...c.messages, message];
                        // Auto-title: use first user message as title
                        const title =
                            c.title === "Nouvelle conversation" &&
                                message.role === "user"
                                ? message.content.substring(0, 50) +
                                (message.content.length > 50 ? "…" : "")
                                : c.title;
                        return {
                            ...c,
                            messages: updatedMessages,
                            title,
                            updatedAt: new Date().toISOString(),
                        };
                    }),
                }));
            },

            updateConversationTitle: (id, title) => {
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === id
                            ? { ...c, title, updatedAt: new Date().toISOString() }
                            : c,
                    ),
                }));
            },

            // === Persona ===
            setSelectedPersona: (personaId) => {
                logger.info(`Persona changed to: ${personaId}`);
                set({ selectedPersona: personaId });
            },

            // === Preferences ===
            setStreamResponses: (enabled) => set({ streamResponses: enabled }),
            setSaveHistory: (enabled) => set({ saveHistory: enabled }),

            // === Getters ===
            getCurrentConversation: () => {
                const { conversations, currentConversationId } = get();
                return conversations.find((c) => c.id === currentConversationId);
            },
        }),
        {
            name: "alice-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                providerSettings: {
                    ...state.providerSettings,
                    // On persiste la clé API localement (pas idéal mais simple pour MVP)
                    // TODO: migrer vers expo-secure-store en production
                },
                conversations: state.saveHistory ? state.conversations : [],
                currentConversationId: state.currentConversationId,
                selectedPersona: state.selectedPersona,
                streamResponses: state.streamResponses,
                saveHistory: state.saveHistory,
            }),
        },
    ),
);

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultModelForProvider(provider: AliceProvider): string {
    const defaults: Record<string, string> = {
        openai: "gpt-4o-mini",
        anthropic: "claude-3-5-haiku-20241022",
        google: "gemini-2.0-flash",
        mistral: "mistral-small-latest",
        groq: "llama-3.3-70b-versatile",
        custom: "default",
    };
    return defaults[provider] || "default";
}
