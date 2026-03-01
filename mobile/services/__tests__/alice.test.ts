/**
 * Tests for Alice AI Service
 *
 * Tests: sendMessageToAlice, getPersonas, getProviders, validateProvider,
 *        isLocalUrl detection, callLocalProvider vs callBackendProxy routing.
 *
 * Phase 3 — DEV-024 Module IA
 */

import {
    sendMessageToAlice,
    getPersonas,
    getProviders,
    validateProvider,
    FALLBACK_PERSONAS,
    FALLBACK_PROVIDERS,
    PROVIDER_DISPLAY_NAMES,
    PROVIDER_DESCRIPTIONS,
    PROVIDER_ICONS,
    
    
} from "../alice";

// ─── Mocks ────────────────────────────────────────────────────

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: (...args: any[]) => mockGetItem(...args),
    setItem: (...args: any[]) => mockSetItem(...args),
}));

jest.mock("../logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

const mockGetSession = jest.fn();
jest.mock("../supabase", () => ({
    supabase: {
        auth: {
            getSession: () => mockGetSession(),
        },
    },
}));

const mockFetch = jest.fn();
(global).fetch = mockFetch;

// ─── Tests ────────────────────────────────────────────────────

describe("Alice AI Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: "test-token-123" } },
        });
    });

    // ===================================
    // PROVIDER DISPLAY INFO
    // ===================================

    describe("Provider display info", () => {
        it("should have display names for all providers", () => {
            const providers: AliceProvider[] = [
                "openai",
                "anthropic",
                "google",
                "mistral",
                "groq",
                "custom",
            ];
            for (const p of providers) {
                expect(PROVIDER_DISPLAY_NAMES[p]).toBeDefined();
                expect(typeof PROVIDER_DISPLAY_NAMES[p]).toBe("string");
            }
        });

        it("should have descriptions for all providers", () => {
            expect(Object.keys(PROVIDER_DESCRIPTIONS).length).toBeGreaterThanOrEqual(6);
        });

        it("should have icons for all providers", () => {
            expect(Object.keys(PROVIDER_ICONS).length).toBeGreaterThanOrEqual(6);
        });
    });

    // ===================================
    // FALLBACK DATA
    // ===================================

    describe("Fallback data", () => {
        it("should have fallback personas", () => {
            expect(FALLBACK_PERSONAS.length).toBe(7);
            const ids = FALLBACK_PERSONAS.map((p) => p.id);
            expect(ids).toContain("general");
            expect(ids).toContain("health");
            expect(ids).toContain("study");
            expect(ids).toContain("code");
            expect(ids).toContain("creative");
        });

        it("each fallback persona should have required fields", () => {
            for (const persona of FALLBACK_PERSONAS) {
                expect(persona.id).toBeDefined();
                expect(persona.name).toBeDefined();
                expect(persona.description).toBeDefined();
                expect(persona.icon).toBeDefined();
            }
        });

        it("should have fallback providers", () => {
            expect(FALLBACK_PROVIDERS.length).toBe(6);
            const ids = FALLBACK_PROVIDERS.map((p) => p.id);
            expect(ids).toContain("openai");
            expect(ids).toContain("anthropic");
            expect(ids).toContain("google");
            expect(ids).toContain("custom");
        });

        it("each fallback provider should have required fields", () => {
            for (const provider of FALLBACK_PROVIDERS) {
                expect(provider.id).toBeDefined();
                expect(provider.name).toBeDefined();
                expect(provider.models).toBeDefined();
                expect(Array.isArray(provider.models)).toBe(true);
                // Custom provider may have empty models
                if (provider.id !== "custom") {
                    expect(provider.models.length).toBeGreaterThan(0);
                }
                expect(typeof provider.requiresApiKey).toBe("boolean");
                expect(typeof provider.supportsCustomUrl).toBe("boolean");
            }
        });

        it("custom provider should support custom URL", () => {
            const custom = FALLBACK_PROVIDERS.find((p) => p.id === "custom");
            expect(custom).toBeDefined();
            expect(custom.supportsCustomUrl).toBe(true);
            expect(custom.requiresApiKey).toBe(false);
        });
    });

    // ===================================
    // sendMessageToAlice
    // ===================================

    describe("sendMessageToAlice", () => {
        it("should send a message via backend proxy for cloud provider", async () => {
            const mockResponse = {
                message: {
                    role: "assistant",
                    content: "Bonjour ! Je suis Alice, comment puis-je vous aider ?",
                    timestamp: "2025-01-01T00:00:00Z",
                },
                conversationId: "conv_123",
                provider: "openai",
                model: "gpt-4o-mini",
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const request: AliceChatRequest = {
                message: "Bonjour Alice !",
                provider: "openai",
                providerConfig: {
                    apiKey: "sk-test-key",
                    model: "gpt-4o-mini",
                },
            };

            const result = await sendMessageToAlice(request);

            expect(result).toBeDefined();
            expect(result.message.role).toBe("assistant");
            expect(result.message.content).toContain("Alice");
            expect(result.provider).toBe("openai");
            expect(mockFetch).toHaveBeenCalled();
        });

        it("should include auth token in backend proxy calls", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        message: { role: "assistant", content: "test" },
                        conversationId: "conv_1",
                        provider: "openai",
                        model: "gpt-4o",
                    }),
            });

            await sendMessageToAlice({
                message: "test",
                provider: "openai",
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/alice/chat"),
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token-123",
                        "Content-Type": "application/json",
                    }),
                }),
            );
        });

        it("should handle API error responses", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Internal Server Error",
                json: () =>
                    Promise.resolve({ error: "Service unavailable" }),
            });

            await expect(
                sendMessageToAlice({
                    message: "test",
                    provider: "openai",
                }),
            ).rejects.toThrow();
        });

        it("should handle network errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(
                sendMessageToAlice({
                    message: "test",
                    provider: "openai",
                }),
            ).rejects.toThrow("Network error");
        });

        it("should pass persona in request body", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        message: { role: "assistant", content: "test" },
                        conversationId: "conv_1",
                        provider: "openai",
                        model: "gpt-4o",
                    }),
            });

            await sendMessageToAlice({
                message: "aide-moi à réviser",
                provider: "openai",
                persona: "study",
            });

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody.persona).toBe("study");
            expect(callBody.message).toBe("aide-moi à réviser");
        });

        it("should pass conversation history", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        message: { role: "assistant", content: "test" },
                        conversationId: "conv_1",
                        provider: "openai",
                        model: "gpt-4o",
                    }),
            });

            const history = [
                { role: "user" as const, content: "Salut" },
                { role: "assistant" as const, content: "Bonjour !" },
            ];

            await sendMessageToAlice({
                message: "Comment ça va ?",
                provider: "openai",
                history,
            });

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody.history).toEqual(history);
        });
    });

    // ===================================
    // getPersonas
    // ===================================

    describe("getPersonas", () => {
        it("should fetch personas from API", async () => {
            const mockPersonas = [
                { id: "general", name: "Alice", description: "Assistante", icon: "sparkles" },
                { id: "code", name: "Code", description: "Dev", icon: "code-slash" },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ personas: mockPersonas }),
            });

            const result = await getPersonas();
            expect(result.length).toBe(2);
            expect(result[0].id).toBe("general");
        });

        it("should return fallback personas on API error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            const result = await getPersonas();
            expect(result.length).toBe(7);
            expect(result[0].id).toBe("general");
        });

        it("should return fallback on non-ok response", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const result = await getPersonas();
            expect(result.length).toBe(7); // fallback
        });
    });

    // ===================================
    // getProviders
    // ===================================

    describe("getProviders", () => {
        it("should fetch providers from API", async () => {
            const mockProviders = [
                {
                    id: "openai",
                    name: "OpenAI",
                    models: ["gpt-4o"],
                    requiresApiKey: true,
                    supportsCustomUrl: false,
                },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ providers: mockProviders }),
            });

            const result = await getProviders();
            expect(result.length).toBe(1);
            expect(result[0].id).toBe("openai");
        });

        it("should return fallback providers on error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("fail"));

            const result = await getProviders();
            expect(result.length).toBe(6);
        });
    });

    // ===================================
    // validateProvider
    // ===================================

    describe("validateProvider", () => {
        it("should validate provider config via API", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        valid: true,
                        message: "Connection successful",
                    }),
            });

            const result = await validateProvider(
                "openai",
                "sk-test-key",
            );

            expect(result.valid).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/alice/provider/validate"),
                expect.objectContaining({ method: "POST" }),
            );
        });

        it("should return invalid on API error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("network"));

            const result = await validateProvider(
                "openai",
                "bad-key",
            );

            expect(result.valid).toBe(false);
        });

        it("should send provider and apiKey in body", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ valid: true }),
            });

            await validateProvider(
                "anthropic",
                "sk-ant-test",
            );

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody.provider).toBe("anthropic");
            expect(callBody.apiKey).toBe("sk-ant-test");
        });

        it("should send baseUrl for custom provider", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ valid: true }),
            });

            await validateProvider(
                "custom",
                undefined,
                "https://my-llm-server.com/v1",
            );

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody.provider).toBe("custom");
            expect(callBody.baseUrl).toBe("https://my-llm-server.com/v1");
        });
    });

    // ===================================
    // Local URL detection
    // ===================================

    describe("isLocalUrl (via sendMessageToAlice routing)", () => {
        it("should call local provider directly for localhost URL", async () => {
            // When provider is custom with a localhost URL, the service
            // should call the local endpoint directly
            const mockResponse = {
                choices: [
                    {
                        message: {
                            role: "assistant",
                            content: "Hello from local!",
                        },
                    },
                ],
                model: "llama3.1",
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await sendMessageToAlice({
                message: "test",
                provider: "custom",
                providerConfig: {
                    baseUrl: "http://localhost:11434/v1",
                    model: "llama3.1",
                },
            });

            expect(result).toBeDefined();
            expect(result.message.content).toBe("Hello from local!");
            // Should call the local URL directly, not the platform-core URL
            const callUrl = mockFetch.mock.calls[0][0];
            expect(callUrl).toContain("localhost:11434");
        });

        it("should call local provider for 192.168.x IP", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        choices: [
                            { message: { role: "assistant", content: "test" } },
                        ],
                        model: "mistral",
                    }),
            });

            await sendMessageToAlice({
                message: "test",
                provider: "custom",
                providerConfig: {
                    baseUrl: "http://192.168.1.100:8080/v1",
                    model: "mistral",
                },
            });

            const callUrl = mockFetch.mock.calls[0][0];
            expect(callUrl).toContain("192.168.1.100");
        });

        it("should use backend proxy for cloud providers", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        message: { role: "assistant", content: "test" },
                        conversationId: "conv_1",
                        provider: "openai",
                        model: "gpt-4o",
                    }),
            });

            await sendMessageToAlice({
                message: "test",
                provider: "openai",
                providerConfig: { apiKey: "sk-test" },
            });

            const callUrl = mockFetch.mock.calls[0][0];
            expect(callUrl).toContain("/api/v1/alice/chat");
        });
    });

    // ===================================
    // Edge cases
    // ===================================

    describe("Edge cases", () => {
        it("should handle empty message gracefully", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        message: { role: "assistant", content: "?" },
                        conversationId: "conv_1",
                        provider: "openai",
                        model: "gpt-4o",
                    }),
            });

            const result = await sendMessageToAlice({
                message: "",
                provider: "openai",
            });

            expect(result).toBeDefined();
        });

        it("should handle missing providerConfig", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        message: { role: "assistant", content: "ok" },
                        conversationId: "conv_1",
                        provider: "openai",
                        model: "gpt-4o-mini",
                    }),
            });

            const result = await sendMessageToAlice({
                message: "test",
                provider: "openai",
            });

            expect(result.message.content).toBe("ok");
        });
    });
});
