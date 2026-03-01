/**
 * Tests for useMessageTranslation hook
 * Covers translate, clear, loading state, error handling, same-language detection
 */

import { act, renderHook } from "@testing-library/react-native";

// --- Mocks ---

const mockTranslateText = jest.fn();
const mockGetLanguageName = jest.fn((code: string) => {
    const names: Record<string, string> = {
        fr: "Français",
        en: "English",
        ja: "日本語",
    };
    return names[code] || code.toUpperCase();
});

jest.mock("@/services/translation", () => ({
    translateText: (...args: unknown[]) => mockTranslateText.apply(null, args),
    getLanguageName: (...args: unknown[]) =>
        mockGetLanguageName.apply(null, args),
}));

jest.mock("@/providers/I18nProvider", () => ({
    useI18n: () => ({
        locale: "fr",
        t: (key: string) => key,
        setLocale: jest.fn(),
        ready: true,
    }),
}));

import { useMessageTranslation } from "../useMessageTranslation";

describe("useMessageTranslation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslateText.mockResolvedValue({
            translatedText: "Hello world",
            detectedLanguage: "en",
            targetLanguage: "fr",
            confidence: 0.98,
        });
    });

    // --- Initial state ---
    test("returns empty initial state", () => {
        const { result } = renderHook(() => useMessageTranslation());

        expect(result.current.translations).toEqual({});
        expect(result.current.isTranslating("msg-1")).toBe(false);
        expect(result.current.getError("msg-1")).toBeUndefined();
    });

    // --- Translate a message ---
    test("translates a message and stores result", async () => {
        const { result } = renderHook(() => useMessageTranslation());

        await act(async () => {
            await result.current.translateMessage("msg-1", "Hello world");
        });

        expect(mockTranslateText).toHaveBeenCalledWith("Hello world", {
            targetLang: "fr",
        });

        expect(result.current.translations["msg-1"]).toBeDefined();
        expect(result.current.translations["msg-1"].translatedText).toBe(
            "Hello world",
        );
        expect(result.current.translations["msg-1"].detectedLanguage).toBe(
            "en",
        );
        expect(
            result.current.translations["msg-1"].detectedLanguageName,
        ).toBe("English");
    });

    // --- Custom target language ---
    test("uses custom target language when provided", async () => {
        const { result } = renderHook(() => useMessageTranslation());

        await act(async () => {
            await result.current.translateMessage(
                "msg-1",
                "Bonjour",
                "ja",
            );
        });

        expect(mockTranslateText).toHaveBeenCalledWith("Bonjour", {
            targetLang: "ja",
        });
    });

    // --- Loading state ---
    test("sets loading state during translation", async () => {
        let resolveTranslation: (value: any) => void;
        const translationPromise = new Promise((resolve) => {
            resolveTranslation = resolve;
        });
        mockTranslateText.mockReturnValue(translationPromise);

        const { result } = renderHook(() => useMessageTranslation());

        // Start translation (don't await)
        let translatePromise: Promise<void>;
        act(() => {
            translatePromise = result.current.translateMessage(
                "msg-1",
                "Hello",
            );
        });

        // Should be loading
        expect(result.current.isTranslating("msg-1")).toBe(true);

        // Resolve
        await act(async () => {
            resolveTranslation!({
                translatedText: "Bonjour",
                detectedLanguage: "en",
                targetLanguage: "fr",
            });
            await translatePromise!;
        });

        // No longer loading
        expect(result.current.isTranslating("msg-1")).toBe(false);
        expect(result.current.translations["msg-1"]).toBeDefined();
    });

    // --- Error handling ---
    test("stores error on translation failure", async () => {
        mockTranslateText.mockRejectedValueOnce(
            new Error("API error: quota exceeded"),
        );

        const { result } = renderHook(() => useMessageTranslation());

        await act(async () => {
            await result.current.translateMessage("msg-1", "Hello");
        });

        expect(result.current.getError("msg-1")).toBe(
            "API error: quota exceeded",
        );
        expect(result.current.isTranslating("msg-1")).toBe(false);
        expect(result.current.translations["msg-1"]).toBeUndefined();
    });

    // --- Clear translation ---
    test("clears a specific translation", async () => {
        const { result } = renderHook(() => useMessageTranslation());

        // First, translate
        await act(async () => {
            await result.current.translateMessage("msg-1", "Hello");
        });

        expect(result.current.translations["msg-1"]).toBeDefined();

        // Then clear
        act(() => {
            result.current.clearTranslation("msg-1");
        });

        expect(result.current.translations["msg-1"]).toBeUndefined();
    });

    // --- Clear all ---
    test("clears all translations", async () => {
        const { result } = renderHook(() => useMessageTranslation());

        await act(async () => {
            await result.current.translateMessage("msg-1", "Hello");
        });
        await act(async () => {
            await result.current.translateMessage("msg-2", "Bonjour");
        });

        expect(Object.keys(result.current.translations)).toHaveLength(2);

        act(() => {
            result.current.clearAll();
        });

        expect(result.current.translations).toEqual({});
    });

    // --- Multiple messages ---
    test("translates multiple messages independently", async () => {
        mockTranslateText
            .mockResolvedValueOnce({
                translatedText: "Bonjour",
                detectedLanguage: "en",
                targetLanguage: "fr",
            })
            .mockResolvedValueOnce({
                translatedText: "こんにちは",
                detectedLanguage: "en",
                targetLanguage: "ja",
            });

        const { result } = renderHook(() => useMessageTranslation());

        await act(async () => {
            await result.current.translateMessage("msg-1", "Hello");
        });
        await act(async () => {
            await result.current.translateMessage("msg-2", "Hello", "ja");
        });

        expect(result.current.translations["msg-1"].translatedText).toBe(
            "Bonjour",
        );
        expect(result.current.translations["msg-2"].translatedText).toBe(
            "こんにちは",
        );
    });

    // --- Duplicate request prevention ---
    test("prevents duplicate translation requests for same message", async () => {
        let resolveFirst: (value: any) => void;
        const firstPromise = new Promise((resolve) => {
            resolveFirst = resolve;
        });
        mockTranslateText.mockReturnValueOnce(firstPromise);

        const { result } = renderHook(() => useMessageTranslation());

        // Start two translations for same message
        let p1: Promise<void>;
        let p2: Promise<void>;
        act(() => {
            p1 = result.current.translateMessage("msg-1", "Hello");
            p2 = result.current.translateMessage("msg-1", "Hello");
        });

        await act(async () => {
            resolveFirst!({
                translatedText: "Bonjour",
                detectedLanguage: "en",
                targetLanguage: "fr",
            });
            await p1!;
            await p2!;
        });

        // Should only call API once
        expect(mockTranslateText).toHaveBeenCalledTimes(1);
    });
});
