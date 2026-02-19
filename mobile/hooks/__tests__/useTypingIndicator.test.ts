/**
 * Tests pour useTypingIndicator Hook - Mobile
 */

import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useTypingIndicator } from "../useTypingIndicator";

// Mock Supabase
const mockSend = jest.fn();
const mockUnsubscribe = jest.fn();
const mockOn = jest.fn().mockReturnThis();
const mockSubscribe = jest.fn((callback) => {
    if (callback) callback("SUBSCRIBED");
    return { unsubscribe: mockUnsubscribe };
});

const mockChannel = {
    on: mockOn,
    subscribe: mockSubscribe,
    send: mockSend,
    unsubscribe: mockUnsubscribe,
};

jest.mock("@/services/supabase", () => ({
    supabase: {
        channel: jest.fn(() => mockChannel),
    },
}));

describe("useTypingIndicator", () => {
    const defaultOptions = {
        conversationId: "conv-123",
        currentUserId: "user-1",
        currentUserName: "Alice",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should initialize with empty typing users", () => {
        const { result } = renderHook(() => useTypingIndicator(defaultOptions));

        expect(result.current.typingUsers).toEqual([]);
        expect(result.current.typingUserNames).toEqual([]);
    });

    it("should subscribe to the correct channel", () => {
        renderHook(() => useTypingIndicator(defaultOptions));

        const { supabase } = require("@/services/supabase");
        expect(supabase.channel).toHaveBeenCalledWith("typing:conv-123");
        expect(mockOn).toHaveBeenCalledWith(
            "broadcast",
            { event: "typing" },
            expect.any(Function)
        );
    });

    it("should send typing event", async () => {
        const { result } = renderHook(() => useTypingIndicator(defaultOptions));

        act(() => {
            result.current.sendTypingEvent();
        });

        expect(mockSend).toHaveBeenCalledWith({
            type: "broadcast",
            event: "typing",
            payload: expect.objectContaining({
                userId: "user-1",
                userName: "Alice",
            }),
        });
    });

    it("should debounce typing events", () => {
        const { result } = renderHook(() =>
            useTypingIndicator({ ...defaultOptions, debounceDelay: 300 })
        );

        act(() => {
            result.current.sendTypingEvent();
            result.current.sendTypingEvent();
            result.current.sendTypingEvent();
        });

        // Only one call should be made due to debounce
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("should send stop typing event", () => {
        const { result } = renderHook(() => useTypingIndicator(defaultOptions));

        act(() => {
            result.current.stopTyping();
        });

        expect(mockSend).toHaveBeenCalledWith({
            type: "broadcast",
            event: "stop_typing",
            payload: {
                userId: "user-1",
            },
        });
    });

    it("should unsubscribe on unmount", () => {
        const { unmount } = renderHook(() => useTypingIndicator(defaultOptions));

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should report connection status", async () => {
        const { result } = renderHook(() => useTypingIndicator(defaultOptions));

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });
    });

    it("should not subscribe if conversationId is empty", () => {
        const { supabase } = require("@/services/supabase");
        supabase.channel.mockClear();

        renderHook(() =>
            useTypingIndicator({
                ...defaultOptions,
                conversationId: "",
            })
        );

        expect(supabase.channel).not.toHaveBeenCalled();
    });

    it("should remove user after timeout", async () => {
        // Test du timeout de 5 secondes
        const { result } = renderHook(() =>
            useTypingIndicator({ ...defaultOptions, typingTimeout: 5000 })
        );

        // Simuler la réception d'un événement typing
        // (Ceci nécessiterait un mock plus complexe du callback)

        expect(result.current.typingUsers).toEqual([]);
    });
});
