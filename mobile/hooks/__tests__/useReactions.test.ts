/**
 * Tests for useReactions hook
 * Covers loading, subscribing, optimistic toggle, error recovery
 */

import { act, renderHook, waitFor } from "@testing-library/react-native";

// --- Mocks ---

// Variables starting with "mock" are allowed in hoisted jest.mock factories
const mockQuickReactions = ["❤️", "😂", "😮", "😢", "😡", "👍"];

const mockGetReactionsForMessages = jest.fn().mockResolvedValue({});
const mockGroupReactions = jest.fn().mockReturnValue([]);
const mockSubscribeToReactions = jest.fn(() => jest.fn());
const mockToggleReaction = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/reactions", () => ({
    getReactionsForMessages: (...args: unknown[]) => mockGetReactionsForMessages.apply(null, args),
    groupReactions: (...args: unknown[]) => mockGroupReactions.apply(null, args),
    subscribeToReactions: (...args: unknown[]) => mockSubscribeToReactions.apply(null, args),
    toggleReaction: (...args: unknown[]) => mockToggleReaction.apply(null, args),
    QUICK_REACTIONS: ["❤️", "😂", "😮", "😢", "😡", "👍"],
}));

// Supabase is globally mocked via jest.setup.js
import { supabase } from "@/services/supabase";
const mockGetUser = supabase.auth.getUser as jest.Mock;

import { useReactions } from "../useReactions";

beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetReactionsForMessages.mockResolvedValue({});
    mockGroupReactions.mockReturnValue([]);
});

describe("useReactions", () => {
    // --- Initial state ---
    test("returns initial empty state", () => {
        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: [] })
        );

        expect(result.current.reactionsByMessage).toEqual({});
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.quickReactions).toEqual(["❤️", "😂", "😮", "😢", "😡", "👍"]);
    });

    // --- Loading reactions ---
    test("loads reactions when messageIds and currentUserId are available", async () => {
        const rawReactions = {
            "msg-1": [
                { id: "r1", message_id: "msg-1", user_id: "user-1", emoji: "❤️" },
                { id: "r2", message_id: "msg-1", user_id: "user-2", emoji: "❤️" },
            ],
        };
        const groupedReactions = [
            { emoji: "❤️", count: 2, users: ["user-1", "user-2"], isOwn: true },
        ];

        mockGetReactionsForMessages.mockResolvedValue(rawReactions);
        mockGroupReactions.mockReturnValue(groupedReactions);

        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(Object.keys(result.current.reactionsByMessage)).toHaveLength(1);
        });

        expect(mockGetReactionsForMessages).toHaveBeenCalledWith(["msg-1"]);
        expect(mockGroupReactions).toHaveBeenCalledWith(rawReactions["msg-1"], "user-1");
        expect(result.current.reactionsByMessage["msg-1"]).toEqual(groupedReactions);
    });

    test("does not load if messageIds is empty", async () => {
        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: [] })
        );

        // Wait a tick for effects
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockGetReactionsForMessages).not.toHaveBeenCalled();
    });

    test("sets error on load failure", async () => {
        mockGetReactionsForMessages.mockRejectedValue(new Error("Load failed"));

        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        await waitFor(() => {
            expect(result.current.error).toBe("Load failed");
        });

        expect(result.current.loading).toBe(false);
    });

    // --- Subscription ---
    test("subscribes to reaction changes for conversation", async () => {
        renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        await waitFor(() => {
            expect(mockSubscribeToReactions).toHaveBeenCalledWith(
                "conv-1",
                expect.any(Function)
            );
        });
    });

    test("cleans up subscription on unmount", async () => {
        const unsubscribe = jest.fn();
        mockSubscribeToReactions.mockReturnValue(unsubscribe);

        const { unmount } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        await waitFor(() => {
            expect(mockSubscribeToReactions).toHaveBeenCalled();
        });

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });

    // --- Toggle reaction (optimistic) ---
    test("toggle adds new reaction optimistically", async () => {
        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        // Wait for currentUserId to be set (subscription depends on it)
        await waitFor(() => {
            expect(mockSubscribeToReactions).toHaveBeenCalled();
        });

        await act(async () => {
            await result.current.toggle("msg-1", "👍");
        });

        expect(mockToggleReaction).toHaveBeenCalledWith("msg-1", "👍");

        // Optimistic: new group should be created
        const groups = result.current.reactionsByMessage["msg-1"];
        expect(groups).toBeDefined();
        expect(groups).toContainEqual(
            expect.objectContaining({ emoji: "👍", count: 1, isOwn: true })
        );
    });

    test("toggle removes own reaction optimistically when already reacted", async () => {
        // Pre-set reactionsByMessage with an existing own reaction
        mockGetReactionsForMessages.mockResolvedValue({
            "msg-1": [{ id: "r1", message_id: "msg-1", user_id: "user-1", emoji: "❤️" }],
        });
        mockGroupReactions.mockReturnValue([
            { emoji: "❤️", count: 1, users: ["user-1"], isOwn: true },
        ]);

        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        await waitFor(() => {
            expect(result.current.reactionsByMessage["msg-1"]).toBeDefined();
        });

        await act(async () => {
            await result.current.toggle("msg-1", "❤️");
        });

        // Optimistic: count-1 = 0, filtered out
        const groups = result.current.reactionsByMessage["msg-1"] || [];
        const heartGroup = groups.find((g: any) => g.emoji === "❤️");
        expect(heartGroup).toBeUndefined(); // Removed because count became 0
    });

    test("toggle increments count on existing group when not own", async () => {
        mockGetReactionsForMessages.mockResolvedValue({
            "msg-1": [{ id: "r1", message_id: "msg-1", user_id: "user-2", emoji: "😂" }],
        });
        mockGroupReactions.mockReturnValue([
            { emoji: "😂", count: 1, users: ["user-2"], isOwn: false },
        ]);

        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        await waitFor(() => {
            expect(result.current.reactionsByMessage["msg-1"]).toBeDefined();
        });

        await act(async () => {
            await result.current.toggle("msg-1", "😂");
        });

        const groups = result.current.reactionsByMessage["msg-1"];
        const laughGroup = groups?.find((g: any) => g.emoji === "😂");
        expect(laughGroup).toEqual(
            expect.objectContaining({ emoji: "😂", count: 2, isOwn: true })
        );
    });

    test("toggle reverts on API error and reloads", async () => {
        mockToggleReaction.mockRejectedValue(new Error("Toggle failed"));

        // After error, getReactionsForMessages is called again to revert
        const revertReactions = jest.fn().mockResolvedValue({ "msg-1": [] });
        mockGetReactionsForMessages.mockImplementation(revertReactions);
        mockGroupReactions.mockReturnValue([]);

        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: ["msg-1"] })
        );

        // Wait for currentUserId to be set
        await waitFor(() => {
            expect(mockSubscribeToReactions).toHaveBeenCalled();
        });

        await act(async () => {
            await result.current.toggle("msg-1", "👍");
        });

        await waitFor(() => {
            expect(result.current.error).toBe("Toggle failed");
        });
        // getReactionsForMessages called again for revert
        expect(revertReactions).toHaveBeenCalledWith(["msg-1"]);
    });

    // --- quickReactions constant ---
    test("exposes quickReactions from service", () => {
        const { result } = renderHook(() =>
            useReactions({ conversationId: "conv-1", messageIds: [] })
        );

        expect(result.current.quickReactions).toEqual(["❤️", "😂", "😮", "😢", "😡", "👍"]);
    });
});
