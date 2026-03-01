/**
 * Tests for Translation Service
 */

import { detectLanguage, getLanguageName, SUPPORTED_LANGUAGES, translateText } from "../translation";

// Mock dependencies
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: (...args: any[]) => mockGetItem(...args),
    setItem: (...args: any[]) => mockSetItem(...args),
    removeItem: (...args: any[]) => mockRemoveItem(...args),
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

// Mock fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe("Translation Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetItem.mockResolvedValue(null);
        mockSetItem.mockResolvedValue(undefined);
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: "test-token-123" } },
        });
    });

    describe("translateText", () => {
        it("should translate text via API and cache result", async () => {
            const mockResponse = {
                translatedText: "Hello world",
                detectedLanguage: "fr",
                targetLanguage: "en",
                confidence: 0.98,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await translateText("Bonjour le monde", {
                targetLang: "en",
            });

            expect(result.translatedText).toBe("Hello world");
            expect(result.detectedLanguage).toBe("fr");
            expect(result.targetLanguage).toBe("en");

            // Should have called fetch with correct args
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/translation/translate"),
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token-123",
                        "Content-Type": "application/json",
                    }),
                }),
            );

            // Should cache the result
            expect(mockSetItem).toHaveBeenCalledWith(
                expect.stringContaining("translation:"),
                expect.any(String),
            );
        });

        it("should return cached translation if available", async () => {
            const cachedResult = {
                result: {
                    translatedText: "Cached hello",
                    detectedLanguage: "fr",
                    targetLanguage: "en",
                },
                timestamp: Date.now(),
            };

            mockGetItem.mockResolvedValueOnce(JSON.stringify(cachedResult));

            const result = await translateText("Bonjour", { targetLang: "en" });

            expect(result.translatedText).toBe("Cached hello");
            expect(result.cached).toBe(true);
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it("should expire cache after TTL", async () => {
            const oldCache = {
                result: {
                    translatedText: "Old cached",
                    detectedLanguage: "fr",
                    targetLanguage: "en",
                },
                timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days
            };

            mockGetItem.mockResolvedValueOnce(JSON.stringify(oldCache));
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        translatedText: "Fresh translation",
                        detectedLanguage: "fr",
                        targetLanguage: "en",
                    }),
            });

            const result = await translateText("Bonjour", { targetLang: "en" });

            expect(result.translatedText).toBe("Fresh translation");
            expect(result.cached).toBeUndefined();
            // Old cache should be removed
            expect(mockRemoveItem).toHaveBeenCalled();
        });

        it("should throw on empty text", async () => {
            await expect(
                translateText("", { targetLang: "en" }),
            ).rejects.toThrow("Le texte à traduire est vide.");
        });

        it("should throw on API error", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () =>
                    Promise.resolve({ error: "Internal server error" }),
            });

            await expect(
                translateText("Bonjour", { targetLang: "en" }),
            ).rejects.toThrow("Internal server error");
        });

        it("should include sourceLang when provided", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        translatedText: "Hello",
                        detectedLanguage: "fr",
                        targetLanguage: "en",
                    }),
            });

            await translateText("Bonjour", {
                targetLang: "en",
                sourceLang: "fr",
            });

            const fetchBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(fetchBody.sourceLang).toBe("fr");
        });

        it("should throw when no auth session", async () => {
            mockGetSession.mockResolvedValueOnce({
                data: { session: null },
            });

            await expect(
                translateText("Bonjour", { targetLang: "en" }),
            ).rejects.toThrow("Session non trouvée");
        });
    });

    describe("detectLanguage", () => {
        it("should detect language via API", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ language: "fr", confidence: 0.99 }),
            });

            const result = await detectLanguage("Bonjour le monde");

            expect(result.language).toBe("fr");
            expect(result.confidence).toBe(0.99);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/translation/detect"),
                expect.objectContaining({
                    method: "POST",
                }),
            );
        });

        it("should throw on empty text", async () => {
            await expect(detectLanguage("")).rejects.toThrow(
                "Le texte à analyser est vide.",
            );
        });

        it("should throw on API error", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () =>
                    Promise.resolve({ error: "Detection failed" }),
            });

            await expect(detectLanguage("Bonjour")).rejects.toThrow(
                "Detection failed",
            );
        });
    });

    describe("getLanguageName", () => {
        it("should return language name for known codes", () => {
            expect(getLanguageName("fr")).toBe("Français");
            expect(getLanguageName("en")).toBe("English");
            expect(getLanguageName("ja")).toBe("日本語");
            expect(getLanguageName("es")).toBe("Español");
        });

        it("should return uppercase code for unknown languages", () => {
            expect(getLanguageName("xx")).toBe("XX");
            expect(getLanguageName("zzz")).toBe("ZZZ");
        });
    });

    describe("SUPPORTED_LANGUAGES", () => {
        it("should have at least 50 languages", () => {
            expect(Object.keys(SUPPORTED_LANGUAGES).length).toBeGreaterThanOrEqual(50);
        });

        it("should include fr, en, ja", () => {
            expect(SUPPORTED_LANGUAGES).toHaveProperty("fr");
            expect(SUPPORTED_LANGUAGES).toHaveProperty("en");
            expect(SUPPORTED_LANGUAGES).toHaveProperty("ja");
        });
    });
});
