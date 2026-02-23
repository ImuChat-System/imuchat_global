import {
    archiveConversation,
    createConversation,
    deleteConversation,
    deleteMessage,
    editMessage,
    forwardMessage,
    getConversations,
    getMessages,
    getOthersLastReadAt,
    globalSearch,
    markConversationAsRead,
    muteConversation,
    searchConversations,
    searchMessages,
    sendMessage,
    unarchiveConversation,
} from "../messaging";
import { supabase } from "../supabase";

// Mock the supabase module with explicit getCurrentUser
const mockGetCurrentUser = jest.fn();
jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        auth: { getUser: jest.fn() },
    },
    getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}));

describe("Messaging Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getConversations", () => {
        it("should fetch conversations for authenticated user", async () => {
            const mockConversations = [
                {
                    id: "conv-1",
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z",
                    last_message_at: "2024-01-01T00:00:00Z",
                    is_group: false,
                    group_name: null,
                    group_avatar_url: null,
                    participants: [],
                    messages: [
                        {
                            id: "msg-1",
                            content: "Hello",
                            created_at: "2024-01-01T00:00:00Z",
                            sender_id: "user-1",
                        },
                    ],
                },
            ];

            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockConversations,
                    error: null,
                }),
            });

            const result = await getConversations();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("conv-1");
            expect(result[0].last_message).toBeDefined();
            expect(supabase.from).toHaveBeenCalledWith("conversations");
        });

        it("should throw error when user is not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            await expect(getConversations()).rejects.toThrow(
                "No authenticated user"
            );
        });

        it("should throw error when database query fails", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error("Database error"),
                }),
            });

            await expect(getConversations()).rejects.toThrow("Database error");
        });
    });

    describe("getMessages", () => {
        it("should fetch messages for a conversation", async () => {
            const mockMessages = [
                {
                    id: "msg-1",
                    conversation_id: "conv-1",
                    sender_id: "user-1",
                    content: "Hello",
                    created_at: "2024-01-01T00:00:00Z",
                    sender: { id: "user-1", username: "testuser" },
                },
            ];

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: mockMessages,
                    error: null,
                }),
            });

            const result = await getMessages("conv-1");

            expect(result).toHaveLength(1);
            expect(result[0].content).toBe("Hello");
            expect(supabase.from).toHaveBeenCalledWith("messages");
        });

        it("should return empty array when no messages exist", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            const result = await getMessages("conv-1");

            expect(result).toEqual([]);
        });
    });

    describe("sendMessage", () => {
        it("should send a message successfully", async () => {
            const mockMessage = {
                id: "msg-1",
                conversation_id: "conv-1",
                sender_id: "user-1",
                content: "Test message",
                created_at: "2024-01-01T00:00:00Z",
            };

            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: mockMessage,
                    error: null,
                }),
            });

            const result = await sendMessage("conv-1", "Test message");

            expect(result.content).toBe("Test message");
            expect(supabase.from).toHaveBeenCalledWith("messages");
        });

        it("should throw error when user is not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            await expect(sendMessage("conv-1", "Test")).rejects.toThrow(
                "No authenticated user"
            );
        });
    });

    describe("createConversation", () => {
        it("should create a conversation with participants", async () => {
            const mockConversation = {
                id: "conv-1",
                is_group: false,
                group_name: null,
            };

            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    insert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockConversation,
                        error: null,
                    }),
                })
                .mockReturnValueOnce({
                    insert: jest.fn().mockResolvedValue({
                        error: null,
                    }),
                });

            const result = await createConversation(["user-2"]);

            expect(result.id).toBe("conv-1");
            expect(supabase.from).toHaveBeenCalledWith("conversations");
            expect(supabase.from).toHaveBeenCalledWith("conversation_participants");
        });
    });

    describe("markConversationAsRead", () => {
        it("should mark conversation as read", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });

            await expect(
                markConversationAsRead("conv-1")
            ).resolves.not.toThrow();
        });
    });

    // ─── NEW Phase 2 tests ─────────────────────────────────

    describe("forwardMessage", () => {
        it("should forward a message to another conversation", async () => {
            const mockMessage = {
                id: "msg-f1",
                conversation_id: "conv-2",
                sender_id: "user-1",
                content: "Forwarded text",
            };

            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: mockMessage,
                    error: null,
                }),
            });

            const result = await forwardMessage(
                "conv-2",
                "Forwarded text",
                "original-msg-1"
            );
            expect(result.conversation_id).toBe("conv-2");
        });
    });

    describe("editMessage", () => {
        it("should edit own message within time limit", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            // First call: fetch existing message
            // Second call: update message
            const now = new Date().toISOString();
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            id: "msg-1",
                            sender_id: "user-1",
                            created_at: now,
                        },
                        error: null,
                    }),
                })
                .mockReturnValueOnce({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            id: "msg-1",
                            content: "Edited",
                            is_edited: true,
                        },
                        error: null,
                    }),
                });

            const result = await editMessage("msg-1", "Edited");
            expect(result.content).toBe("Edited");
            expect(result.is_edited).toBe(true);
        });

        it("should reject editing someone else's message", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { id: "msg-1", sender_id: "user-2", created_at: new Date().toISOString() },
                    error: null,
                }),
            });

            await expect(editMessage("msg-1", "Edited")).rejects.toThrow(
                "Cannot edit someone else's message"
            );
        });

        it("should reject edit after 15 minute limit", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            const oldDate = new Date(Date.now() - 20 * 60 * 1000).toISOString();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { id: "msg-1", sender_id: "user-1", created_at: oldDate },
                    error: null,
                }),
            });

            await expect(editMessage("msg-1", "Edited")).rejects.toThrow(
                "Edit time limit exceeded"
            );
        });

        it("should throw when message not found", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error("not found"),
                }),
            });

            await expect(editMessage("msg-x", "Edited")).rejects.toThrow(
                "Message not found"
            );
        });

        it("should throw when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(editMessage("msg-1", "Edited")).rejects.toThrow(
                "No authenticated user"
            );
        });
    });

    describe("deleteMessage", () => {
        it("should soft-delete own message", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { sender_id: "user-1" },
                        error: null,
                    }),
                })
                .mockReturnValueOnce({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ error: null }),
                });

            const result = await deleteMessage("msg-1");
            expect(result).toBe(true);
        });

        it("should reject deleting someone else's message", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { sender_id: "user-2" },
                    error: null,
                }),
            });

            await expect(deleteMessage("msg-1")).rejects.toThrow(
                "Cannot delete someone else's message"
            );
        });

        it("should throw when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(deleteMessage("msg-1")).rejects.toThrow(
                "No authenticated user"
            );
        });
    });

    describe("getOthersLastReadAt", () => {
        it("should return the latest read timestamp from others", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                neq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { last_read_at: "2026-01-01T00:00:00Z" },
                    error: null,
                }),
            });

            const result = await getOthersLastReadAt("conv-1");
            expect(result).toBe("2026-01-01T00:00:00Z");
        });

        it("should return null when no other participants", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                neq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: "PGRST116" },
                }),
            });

            const result = await getOthersLastReadAt("conv-1");
            expect(result).toBeNull();
        });
    });

    describe("searchConversations", () => {
        it("should search conversations by query", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: [
                        {
                            id: "conv-1",
                            group_name: "Test Group",
                            conversation_participants: [],
                        },
                    ],
                    error: null,
                }),
            });

            const result = await searchConversations("test");
            expect(result).toHaveLength(1);
        });

        it("should return empty array for empty query", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);
            const result = await searchConversations("  ");
            expect(result).toEqual([]);
        });

        it("should throw when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(searchConversations("test")).rejects.toThrow(
                "No authenticated user"
            );
        });
    });

    describe("searchMessages", () => {
        it("should search messages by content", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                ilike: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ id: "msg-1", content: "Hello test", sender: {} }],
                    error: null,
                }),
            });

            const result = await searchMessages("test", {
                conversationId: "conv-1",
            });
            expect(result).toHaveLength(1);
        });

        it("should return empty for empty query", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);
            const result = await searchMessages("  ");
            expect(result).toEqual([]);
        });
    });

    describe("globalSearch", () => {
        it("should return both conversations and messages", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            // Two separate from() calls: one for searchConversations, one for searchMessages
            (supabase.from as jest.Mock)
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    or: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue({
                        data: [{ id: "conv-1", group_name: "Chat", conversation_participants: [] }],
                        error: null,
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    ilike: jest.fn().mockReturnThis(),
                    is: jest.fn().mockReturnThis(),
                    order: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue({
                        data: [{ id: "msg-1", content: "Chat", sender: {} }],
                        error: null,
                    }),
                });

            const result = await globalSearch("chat");
            expect(result.conversations).toHaveLength(1);
            expect(result.messages).toHaveLength(1);
        });
    });

    describe("archiveConversation", () => {
        it("should archive a conversation", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await expect(archiveConversation("conv-1")).resolves.not.toThrow();
        });

        it("should throw when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(archiveConversation("conv-1")).rejects.toThrow(
                "No authenticated user"
            );
        });
    });

    describe("unarchiveConversation", () => {
        it("should unarchive a conversation", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await expect(unarchiveConversation("conv-1")).resolves.not.toThrow();
        });
    });

    describe("muteConversation", () => {
        it("should mute a conversation", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await expect(muteConversation("conv-1", true)).resolves.not.toThrow();
        });

        it("should unmute a conversation", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await expect(muteConversation("conv-1", false)).resolves.not.toThrow();
        });
    });

    describe("deleteConversation", () => {
        it("should delete (leave) a conversation", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" } as any);

            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await expect(deleteConversation("conv-1")).resolves.not.toThrow();
        });

        it("should throw when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(deleteConversation("conv-1")).rejects.toThrow(
                "No authenticated user"
            );
        });
    });
});
