/**
 * Tests for useChat hook
 * Covers conversations, messages, send (online/offline), edit, delete, copy, forward, flush
 */

import { act, renderHook, waitFor } from "@testing-library/react-native";

// --- Mocks ---

// Network state mock
const mockNetworkState = { isConnected: true, isInternetReachable: true };
jest.mock("@/hooks/useNetworkState", () => ({
    useNetworkState: () => mockNetworkState,
}));

// Messaging service mock
const mockGetConversations = jest.fn().mockResolvedValue([]);
const mockGetMessages = jest.fn().mockResolvedValue([]);
const mockSendMessage = jest.fn();
const mockMarkConversationAsRead = jest.fn().mockResolvedValue(undefined);
const mockGetOthersLastReadAt = jest.fn().mockResolvedValue(null);
const mockEditMessage = jest.fn();
const mockDeleteMessage = jest.fn();
const mockCopyMessageToClipboard = jest.fn().mockResolvedValue(undefined);
const mockForwardMessage = jest.fn();
const mockSendTypingIndicator = jest.fn();
const mockSubscribeToConversation = jest.fn(() => jest.fn());
const mockSubscribeToConversations = jest.fn(() => jest.fn());
const mockSubscribeToTypingIndicators = jest.fn(() => jest.fn());

jest.mock("@/services/messaging", () => ({
    getConversations: (...args: any[]) => mockGetConversations(...args),
    getMessages: (...args: any[]) => mockGetMessages(...args),
    sendMessage: (...args: any[]) => mockSendMessage(...args),
    markConversationAsRead: (...args: any[]) => mockMarkConversationAsRead(...args),
    getOthersLastReadAt: (...args: any[]) => mockGetOthersLastReadAt(...args),
    editMessage: (...args: any[]) => mockEditMessage(...args),
    deleteMessage: (...args: any[]) => mockDeleteMessage(...args),
    copyMessageToClipboard: (...args: any[]) => mockCopyMessageToClipboard(...args),
    forwardMessage: (...args: any[]) => mockForwardMessage(...args),
    sendTypingIndicator: (...args: any[]) => mockSendTypingIndicator(...args),
    subscribeToConversation: (...args: any[]) => mockSubscribeToConversation(...args),
    subscribeToConversations: (...args: any[]) => mockSubscribeToConversations(...args),
    subscribeToTypingIndicators: (...args: any[]) => mockSubscribeToTypingIndicators(...args),
}));

// Offline queue mock
const mockAddPendingMessage = jest.fn().mockResolvedValue(undefined);
const mockCleanExpiredMessages = jest.fn().mockResolvedValue(undefined);
const mockGetPendingCount = jest.fn().mockResolvedValue(0);
const mockGetPendingMessagesForConversation = jest.fn().mockResolvedValue([]);
const mockRemovePendingMessage = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/offline-queue", () => ({
    addPendingMessage: (...args: any[]) => mockAddPendingMessage(...args),
    cleanExpiredMessages: (...args: any[]) => mockCleanExpiredMessages(...args),
    getPendingCount: (...args: any[]) => mockGetPendingCount(...args),
    getPendingMessagesForConversation: (...args: any[]) => mockGetPendingMessagesForConversation(...args),
    removePendingMessage: (...args: any[]) => mockRemovePendingMessage(...args),
}));

// Supabase is globally mocked via jest.setup.js
import { supabase } from "@/services/supabase";
const mockGetUser = supabase.auth.getUser as jest.Mock;

import { useChat } from "../useChat";

// Helper factories
const makeConversation = (id: string) => ({
    id,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_message_at: "2025-01-01T00:00:00Z",
    is_group: false,
    group_name: null,
    group_avatar_url: null,
    participants: [],
    last_message: null,
});

const makeMessage = (id: string, convId: string) => ({
    id,
    conversation_id: convId,
    sender_id: "user-1",
    content: `msg-${id}`,
    media_url: null,
    media_type: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    deleted_at: null,
    is_edited: false,
    reply_to_id: null,
    replied_message: null,
});

beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockGetConversations.mockResolvedValue([]);
    mockGetMessages.mockResolvedValue([]);
    mockGetPendingCount.mockResolvedValue(0);
    // Reset network state to online
    mockNetworkState.isConnected = true;
    mockNetworkState.isInternetReachable = true;
});

describe("useChat", () => {
    // --- Initial state ---
    test("returns initial state with default options", async () => {
        const { result } = renderHook(() => useChat({ autoLoad: false }));

        expect(result.current.conversations).toEqual([]);
        expect(result.current.messages).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.sending).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.isOnline).toBe(true);
        expect(result.current.pendingMessagesCount).toBe(0);
    });

    // --- Load conversations ---
    test("loadConversations fetches and sets conversations", async () => {
        const convos = [makeConversation("c1"), makeConversation("c2")];
        mockGetConversations.mockResolvedValue(convos);

        const { result } = renderHook(() => useChat({ autoLoad: false }));

        await act(async () => {
            await result.current.loadConversations();
        });

        expect(mockGetConversations).toHaveBeenCalled();
        expect(result.current.conversations).toHaveLength(2);
        expect(result.current.error).toBeNull();
    });

    test("loadConversations sets error on failure", async () => {
        mockGetConversations.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useChat({ autoLoad: false }));

        await act(async () => {
            await result.current.loadConversations();
        });

        expect(result.current.error).toBe("Network error");
        expect(result.current.conversations).toEqual([]);
    });

    // --- Load messages ---
    test("loadMessages fetches messages, marks read, and loads read receipts", async () => {
        const msgs = [makeMessage("m1", "conv-1"), makeMessage("m2", "conv-1")];
        mockGetMessages.mockResolvedValue(msgs);
        mockGetOthersLastReadAt.mockResolvedValue("2025-01-01T00:00:00Z");

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await act(async () => {
            await result.current.loadMessages();
        });

        expect(mockGetMessages).toHaveBeenCalledWith("conv-1");
        expect(mockMarkConversationAsRead).toHaveBeenCalledWith("conv-1");
        expect(mockGetOthersLastReadAt).toHaveBeenCalledWith("conv-1");
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.othersLastReadAt).toBe("2025-01-01T00:00:00Z");
    });

    test("loadMessages sets error on failure", async () => {
        mockGetMessages.mockRejectedValue(new Error("DB error"));

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await act(async () => {
            await result.current.loadMessages();
        });

        expect(result.current.error).toBe("DB error");
    });

    // --- Send message (online) ---
    test("sendMessage online sends to DB and replaces temp message", async () => {
        const realMsg = makeMessage("real-1", "conv-1");
        mockSendMessage.mockResolvedValue(realMsg);

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        // Wait for getUser to resolve
        await waitFor(() => {
            expect(result.current.currentUserId).toBe("user-1");
        });

        let sentMsg: any;
        await act(async () => {
            sentMsg = await result.current.sendMessage("Hello!");
        });

        expect(mockSendMessage).toHaveBeenCalledWith("conv-1", "Hello!", undefined, undefined, undefined);
        expect(sentMsg).toEqual(realMsg);
        // Temp message should have been replaced
        expect(result.current.messages.some((m: any) => m.id === "real-1")).toBe(true);
    });

    test("sendMessage returns null if no conversationId and no content", async () => {
        const { result } = renderHook(() => useChat({ autoLoad: false }));

        let sentMsg: any;
        await act(async () => {
            sentMsg = await result.current.sendMessage("");
        });

        expect(sentMsg).toBeNull();
        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test("sendMessage online sets error on failure and removes temp message", async () => {
        mockSendMessage.mockRejectedValue(new Error("Send failed"));

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await waitFor(() => {
            expect(result.current.currentUserId).toBe("user-1");
        });

        let sentMsg: any;
        await act(async () => {
            sentMsg = await result.current.sendMessage("Hello!");
        });

        expect(sentMsg).toBeNull();
        expect(result.current.error).toBe("Send failed");
        // Temp messages should be removed
        expect(result.current.messages.filter((m: any) => m.id.startsWith("temp-"))).toHaveLength(0);
    });

    // --- Send message (offline) ---
    test("sendMessage offline queues message instead of sending to DB", async () => {
        mockNetworkState.isConnected = false;
        mockNetworkState.isInternetReachable = false;
        mockGetPendingCount.mockResolvedValue(1);

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await waitFor(() => {
            expect(result.current.currentUserId).toBe("user-1");
        });

        let sentMsg: any;
        await act(async () => {
            sentMsg = await result.current.sendMessage("Offline msg");
        });

        // Should NOT call sendMessage to DB
        expect(mockSendMessage).not.toHaveBeenCalled();
        // Should queue the message
        expect(mockAddPendingMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                content: "Offline msg",
                conversationId: "conv-1",
            })
        );
        // Returns the optimistic temp message
        expect(sentMsg).toBeDefined();
        expect(sentMsg.content).toBe("Offline msg");
        expect(result.current.pendingMessagesCount).toBe(1);
    });

    // --- Edit message ---
    test("editMessage updates message in local state", async () => {
        const updatedMsg = { ...makeMessage("m1", "conv-1"), content: "edited", is_edited: true };
        mockEditMessage.mockResolvedValue(updatedMsg);

        // Pre-load a message
        mockGetMessages.mockResolvedValue([makeMessage("m1", "conv-1")]);

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await act(async () => {
            await result.current.loadMessages();
        });

        let success: boolean;
        await act(async () => {
            success = await result.current.editMessage("m1", "edited");
        });

        expect(success!).toBe(true);
        expect(mockEditMessage).toHaveBeenCalledWith("m1", "edited");
        const msg = result.current.messages.find((m: any) => m.id === "m1");
        expect(msg?.content).toBe("edited");
        expect(msg?.is_edited).toBe(true);
    });

    test("editMessage returns false on error", async () => {
        mockEditMessage.mockRejectedValue(new Error("Edit failed"));

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        let success: boolean;
        await act(async () => {
            success = await result.current.editMessage("m1", "new");
        });

        expect(success!).toBe(false);
        expect(result.current.error).toBe("Edit failed");
    });

    // --- Delete message ---
    test("deleteMessage soft-deletes message in local state", async () => {
        mockDeleteMessage.mockResolvedValue(undefined);
        mockGetMessages.mockResolvedValue([makeMessage("m1", "conv-1")]);

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await act(async () => {
            await result.current.loadMessages();
        });

        let success: boolean;
        await act(async () => {
            success = await result.current.deleteMessage("m1");
        });

        expect(success!).toBe(true);
        const msg = result.current.messages.find((m: any) => m.id === "m1");
        expect(msg?.deleted_at).not.toBeNull();
        expect(msg?.content).toBeNull();
    });

    test("deleteMessage returns false on error", async () => {
        mockDeleteMessage.mockRejectedValue(new Error("Delete failed"));

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        let success: boolean;
        await act(async () => {
            success = await result.current.deleteMessage("m1");
        });

        expect(success!).toBe(false);
        expect(result.current.error).toBe("Delete failed");
    });

    // --- Copy message ---
    test("copyMessage returns true on success", async () => {
        const { result } = renderHook(() => useChat({ autoLoad: false }));

        let success: boolean;
        await act(async () => {
            success = await result.current.copyMessage("Some text");
        });

        expect(success!).toBe(true);
        expect(mockCopyMessageToClipboard).toHaveBeenCalledWith("Some text");
    });

    test("copyMessage returns false on error", async () => {
        mockCopyMessageToClipboard.mockRejectedValue(new Error("Copy failed"));

        const { result } = renderHook(() => useChat({ autoLoad: false }));

        let success: boolean;
        await act(async () => {
            success = await result.current.copyMessage("text");
        });

        expect(success!).toBe(false);
    });

    // --- Forward message ---
    test("forwardMessage calls service and returns message", async () => {
        const fwdMsg = makeMessage("fwd-1", "conv-2");
        mockForwardMessage.mockResolvedValue(fwdMsg);

        const { result } = renderHook(() => useChat({ autoLoad: false }));

        let msg: any;
        await act(async () => {
            msg = await result.current.forwardMessage("conv-2", "forwarded text", "orig-1");
        });

        expect(mockForwardMessage).toHaveBeenCalledWith("conv-2", "forwarded text", "orig-1");
        expect(msg).toEqual(fwdMsg);
    });

    test("forwardMessage returns null on error", async () => {
        mockForwardMessage.mockRejectedValue(new Error("Forward failed"));

        const { result } = renderHook(() => useChat({ autoLoad: false }));

        let msg: any;
        await act(async () => {
            msg = await result.current.forwardMessage("conv-2", "text", "orig-1");
        });

        expect(msg).toBeNull();
        expect(result.current.error).toBe("Forward failed");
    });

    // --- isMessageRead helper ---
    test("isMessageRead returns true when message was created before othersLastReadAt", async () => {
        mockGetMessages.mockResolvedValue([makeMessage("m1", "conv-1")]);
        mockGetOthersLastReadAt.mockResolvedValue("2025-06-01T00:00:00Z");

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await act(async () => {
            await result.current.loadMessages();
        });

        // m1 created_at is 2025-01-01 which is before 2025-06-01
        const isRead = result.current.isMessageRead(result.current.messages[0]);
        expect(isRead).toBe(true);
    });

    test("isMessageRead returns false when no read receipts", async () => {
        const { result } = renderHook(() => useChat({ autoLoad: false }));

        const msg = makeMessage("m1", "conv-1") as any;
        expect(result.current.isMessageRead(msg)).toBe(false);
    });

    // --- Flush pending messages ---
    test("flushPendingMessages sends queued messages and removes them", async () => {
        const pending = [
            { id: "temp-1", content: "queued", conversationId: "conv-1", senderId: "user-1" },
        ];
        mockGetPendingMessagesForConversation.mockResolvedValue(pending);
        const realMsg = makeMessage("real-1", "conv-1");
        mockSendMessage.mockResolvedValue(realMsg);
        mockGetPendingCount.mockResolvedValue(0);

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: false })
        );

        await act(async () => {
            await result.current.flushPendingMessages();
        });

        expect(mockGetPendingMessagesForConversation).toHaveBeenCalledWith("conv-1");
        expect(mockSendMessage).toHaveBeenCalled();
        expect(mockRemovePendingMessage).toHaveBeenCalledWith("temp-1");
    });

    // --- Auto-load ---
    test("auto-loads conversations when no conversationId", async () => {
        const convos = [makeConversation("c1")];
        mockGetConversations.mockResolvedValue(convos);

        const { result } = renderHook(() => useChat({ autoLoad: true }));

        await waitFor(() => {
            expect(result.current.conversations).toHaveLength(1);
        });
    });

    test("auto-loads messages when conversationId provided", async () => {
        const msgs = [makeMessage("m1", "conv-1")];
        mockGetMessages.mockResolvedValue(msgs);

        const { result } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: true })
        );

        await waitFor(() => {
            expect(result.current.messages).toHaveLength(1);
        });
    });

    // --- Subscriptions ---
    test("subscribes to conversation when conversationId provided", async () => {
        renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: true })
        );

        await waitFor(() => {
            expect(mockSubscribeToConversation).toHaveBeenCalledWith("conv-1", expect.any(Function));
        });
    });

    test("subscribes to all conversations when no conversationId", async () => {
        renderHook(() => useChat({ autoLoad: true }));

        await waitFor(() => {
            expect(mockSubscribeToConversations).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    // --- Cleanup on unmount ---
    test("cleans up subscriptions on unmount", async () => {
        const unsubConvo = jest.fn();
        const unsubTyping = jest.fn();
        mockSubscribeToConversation.mockReturnValue(unsubConvo);
        mockSubscribeToTypingIndicators.mockReturnValue(unsubTyping);

        const { unmount } = renderHook(() =>
            useChat({ conversationId: "conv-1", autoLoad: true })
        );

        await waitFor(() => {
            expect(mockSubscribeToConversation).toHaveBeenCalled();
        });

        unmount();

        expect(unsubConvo).toHaveBeenCalled();
        expect(unsubTyping).toHaveBeenCalled();
    });
});
