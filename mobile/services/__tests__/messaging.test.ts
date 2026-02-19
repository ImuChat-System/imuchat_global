import {
    createConversation,
    getConversations,
    getMessages,
    markConversationAsRead,
    sendMessage,
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
                eq: jest.fn().mockResolvedValue({
                    error: null,
                }),
            });

            await expect(
                markConversationAsRead("conv-1")
            ).resolves.not.toThrow();
        });
    });
});
