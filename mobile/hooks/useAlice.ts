/**
 * useAlice Hook
 *
 * Gère l'interaction complète avec l'assistant IA Alice :
 *  - Envoi de messages (via le service alice)
 *  - État loading / error
 *  - Création & sélection de conversations
 *  - Lecture du store pour provider, persona, historique
 *
 * Usage :
 *   const { sendMessage, isLoading, error, currentConversation, ... } = useAlice();
 *   await sendMessage("Bonjour Alice !");
 *
 * Phase 3 — DEV-024 Module IA
 */

import { useCallback, useRef, useState } from "react";

import {
    getPersonas,
    getProviders,
    sendMessageToAlice,
    validateProvider,
    type AliceChatResponse,
    type AlicePersona,
    type AliceProvider,
    type AliceProviderInfo,
} from "@/services/alice";
import { useAliceStore, type AliceConversation, type AliceState } from "@/stores/alice-store";

// ============================================================================
// TYPES
// ============================================================================

export interface UseAliceReturn {
    // --- State ---
    isLoading: boolean;
    error: string | null;
    currentConversation: AliceConversation | undefined;
    conversations: AliceState["conversations"];
    selectedPersona: string;
    providerSettings: AliceState["providerSettings"];

    // --- Chat Actions ---
    sendMessage: (text: string) => Promise<AliceChatResponse | null>;
    retryLastMessage: () => Promise<AliceChatResponse | null>;
    clearError: () => void;

    // --- Conversation Actions ---
    createConversation: (persona?: string) => void;
    deleteConversation: (id: string) => void;
    switchConversation: (id: string) => void;
    clearAllConversations: () => void;

    // --- Provider / Persona ---
    setPersona: (personaId: string) => void;
    updateProvider: (settings: {
        provider?: AliceProvider;
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }) => void;
    testProviderConnection: () => Promise<boolean>;

    // --- Data Fetching ---
    fetchPersonas: () => Promise<AlicePersona[]>;
    fetchProviders: () => Promise<AliceProviderInfo[]>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAlice(): UseAliceReturn {
    const store = useAliceStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track in-flight to prevent double submissions
    const inflightRef = useRef(false);
    // Keep ref to last user message for retry
    const lastUserMessageRef = useRef<string | null>(null);

    // ---------- Chat ----------

    const sendMessage = useCallback(
        async (text: string): Promise<AliceChatResponse | null> => {
            if (inflightRef.current || !text.trim()) return null;
            inflightRef.current = true;
            setIsLoading(true);
            setError(null);
            lastUserMessageRef.current = text;

            try {
                // Ensure we have a conversation
                let conversation = store.getCurrentConversation();
                if (!conversation) {
                    conversation = store.createConversation();
                }

                // Add user message to store
                const userMessage = {
                    role: "user" as const,
                    content: text.trim(),
                    timestamp: new Date().toISOString(),
                };
                store.addMessage(conversation.id, userMessage);

                // Build history from conversation
                const history = conversation.messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

                // Send to service
                const response = await sendMessageToAlice({
                    message: text.trim(),
                    conversationId: conversation.id,
                    persona: store.selectedPersona,
                    provider: store.providerSettings
                        .provider as AliceProvider,
                    providerConfig: {
                        apiKey: store.providerSettings.apiKey || undefined,
                        baseUrl: store.providerSettings.baseUrl || undefined,
                        model: store.providerSettings.model || "gpt-4o-mini",
                    },
                    history,
                });

                // Add assistant response to store
                if (response?.message) {
                    store.addMessage(conversation.id, {
                        role: "assistant",
                        content: response.message.content,
                        timestamp:
                            response.message.timestamp ||
                            new Date().toISOString(),
                    });
                }

                return response;
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Erreur lors de l'envoi du message";
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
                inflightRef.current = false;
            }
        },
        [store],
    );

    const retryLastMessage = useCallback(async () => {
        if (!lastUserMessageRef.current) return null;
        const conversation = store.getCurrentConversation();
        if (conversation && conversation.messages.length > 0) {
            const lastMsg =
                conversation.messages[conversation.messages.length - 1];
            // Remove the last assistant error/response so we can retry cleanly
            if (lastMsg.role === "assistant") {
                store.removeLastMessage(conversation.id);
            }
        }
        // sendMessage will re-add the user message, so remove the existing one too
        // Actually, we just re-call sendMessage which adds a new user message.
        // To avoid duplication, let's pop the last user message first.
        const conv = store.getCurrentConversation();
        if (conv && conv.messages.length > 0) {
            const lastMsg = conv.messages[conv.messages.length - 1];
            if (lastMsg.role === "user") {
                store.removeLastMessage(conv.id);
            }
        }
        return sendMessage(lastUserMessageRef.current);
    }, [store, sendMessage]);

    const clearError = useCallback(() => setError(null), []);

    // ---------- Conversations ----------

    const createConversation = useCallback(
        (persona?: string) => {
            store.createConversation(persona);
        },
        [store],
    );

    const deleteConversation = useCallback(
        (id: string) => {
            store.deleteConversation(id);
        },
        [store],
    );

    const switchConversation = useCallback(
        (id: string) => {
            store.setCurrentConversation(id);
        },
        [store],
    );

    const clearAllConversations = useCallback(() => {
        store.clearAllConversations();
    }, [store]);

    // ---------- Provider / Persona ----------

    const setPersona = useCallback(
        (personaId: string) => {
            store.setSelectedPersona(personaId);
        },
        [store],
    );

    const updateProvider = useCallback(
        (settings: {
            provider?: AliceProvider;
            apiKey?: string;
            baseUrl?: string;
            model?: string;
        }) => {
            if (settings.provider !== undefined) {
                store.setProvider(settings.provider);
            }
            if (settings.apiKey !== undefined) {
                store.setApiKey(settings.apiKey);
            }
            if (settings.baseUrl !== undefined) {
                store.setBaseUrl(settings.baseUrl);
            }
            if (settings.model !== undefined) {
                store.setModel(settings.model);
            }
        },
        [store],
    );

    const testProviderConnection = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await validateProvider(
                store.providerSettings.provider as AliceProvider,
                store.providerSettings.apiKey || undefined,
                store.providerSettings.baseUrl || undefined,
            );
            return result.valid;
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur de validation du fournisseur";
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [store.providerSettings]);

    // ---------- Data Fetching ----------

    const fetchPersonas = useCallback(async (): Promise<AlicePersona[]> => {
        try {
            return await getPersonas();
        } catch {
            return [];
        }
    }, []);

    const fetchProviders = useCallback(async (): Promise<
        AliceProviderInfo[]
    > => {
        try {
            return await getProviders();
        } catch {
            return [];
        }
    }, []);

    // ---------- Return ----------

    return {
        // State
        isLoading,
        error,
        currentConversation: store.getCurrentConversation(),
        conversations: store.conversations,
        selectedPersona: store.selectedPersona,
        providerSettings: store.providerSettings,

        // Chat
        sendMessage,
        retryLastMessage,
        clearError,

        // Conversations
        createConversation,
        deleteConversation,
        switchConversation,
        clearAllConversations,

        // Provider / Persona
        setPersona,
        updateProvider,
        testProviderConnection,

        // Data
        fetchPersonas,
        fetchProviders,
    };
}
