import {
    archiveStory,
    createStory,
    deleteStory,
    getArchivedStories,
    getMyStories,
    getStoriesFeed,
    getStoryReplies,
    getStoryViewers,
    markReplyRead,
    markStoryViewed,
    reactToStory,
    sendStoryReply,
    STORY_BACKGROUNDS,
} from "../stories-api";
import { supabase } from "../supabase";

const mockGetCurrentUser = jest.fn();

jest.mock("../logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        auth: { getUser: jest.fn() },
        rpc: jest.fn(),
    },
    getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}));

jest.mock("../media-upload", () => ({
    uploadMediaToSupabase: jest.fn().mockResolvedValue("https://cdn.test/story.jpg"),
}));

const mockUser = { id: "user-1", email: "test@test.com" };

describe("Stories API Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue(mockUser);
    });

    // ─────────────────────────────────────────────
    // STORY_BACKGROUNDS constant
    // ─────────────────────────────────────────────
    describe("STORY_BACKGROUNDS", () => {
        it("should have 12 background options", () => {
            expect(STORY_BACKGROUNDS).toHaveLength(12);
        });

        it("should each have id, color, textColor", () => {
            for (const bg of STORY_BACKGROUNDS) {
                expect(bg).toHaveProperty("id");
                expect(bg).toHaveProperty("color");
                expect(bg).toHaveProperty("textColor");
            }
        });
    });

    // ─────────────────────────────────────────────
    // getStoriesFeed
    // ─────────────────────────────────────────────
    describe("getStoriesFeed", () => {
        it("should return stories grouped by user", async () => {
            const rpcData = [
                {
                    id: "s-1",
                    user_id: "u-2",
                    type: "text",
                    media_url: null,
                    thumbnail_url: null,
                    text_content: "Hello",
                    background_color: "#6366f1",
                    text_color: "#ffffff",
                    font_style: "default",
                    visibility: "friends",
                    allow_replies: true,
                    duration_seconds: 5,
                    created_at: "2024-01-01T12:00:00Z",
                    expires_at: "2024-01-02T12:00:00Z",
                    is_archived: false,
                    archived_at: null,
                    username: "bob",
                    display_name: "Bob",
                    author_avatar: null,
                    view_count: 3,
                    is_viewed: false,
                },
            ];
            (supabase.rpc as jest.Mock).mockResolvedValue({ data: rpcData, error: null });

            const groups = await getStoriesFeed();
            expect(groups).toHaveLength(1);
            expect(groups[0].user_id).toBe("u-2");
            expect(groups[0].has_unread).toBe(true);
            expect(groups[0].stories).toHaveLength(1);
        });

        it("should throw when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(getStoriesFeed()).rejects.toThrow("Not authenticated");
        });

        it("should throw on RPC error", async () => {
            (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: { message: "fail" } });
            await expect(getStoriesFeed()).rejects.toBeDefined();
        });
    });

    // ─────────────────────────────────────────────
    // getMyStories
    // ─────────────────────────────────────────────
    describe("getMyStories", () => {
        it("should return user stories", async () => {
            const stories = [{ id: "s-1", user_id: "user-1", type: "text" }];
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        gt: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                order: jest.fn().mockResolvedValue({ data: stories, error: null }),
                            }),
                        }),
                    }),
                }),
            });
            const result = await getMyStories();
            expect(result).toHaveLength(1);
        });

        it("should throw when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(getMyStories()).rejects.toThrow("Not authenticated");
        });
    });

    // ─────────────────────────────────────────────
    // getArchivedStories
    // ─────────────────────────────────────────────
    describe("getArchivedStories", () => {
        it("should return archived stories", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
                            }),
                        }),
                    }),
                }),
            });
            const result = await getArchivedStories();
            expect(result).toEqual([]);
        });
    });

    // ─────────────────────────────────────────────
    // createStory
    // ─────────────────────────────────────────────
    describe("createStory", () => {
        it("should create a text story", async () => {
            const created = {
                id: "s-new",
                user_id: "user-1",
                type: "text",
                media_url: null,
                thumbnail_url: null,
                text_content: "Hello World",
                background_color: "#6366f1",
                text_color: "#ffffff",
                font_style: "default",
                visibility: "friends",
                allow_replies: true,
                duration_seconds: 5,
                created_at: "2024-01-01",
                expires_at: "2024-01-02",
                is_archived: false,
                archived_at: null,
            };
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: created, error: null }),
                    }),
                }),
            });

            const story = await createStory({ type: "text", text_content: "Hello World" });
            expect(story.id).toBe("s-new");
            expect(story.text_content).toBe("Hello World");
        });

        it("should throw for empty text story", async () => {
            await expect(
                createStory({ type: "text", text_content: "" }),
            ).rejects.toThrow("Text stories require content");
        });

        it("should throw for text story without content", async () => {
            await expect(
                createStory({ type: "text" }),
            ).rejects.toThrow("Text stories require content");
        });

        it("should create image story with media upload", async () => {
            const created = {
                id: "s-img",
                user_id: "user-1",
                type: "image",
                media_url: "https://cdn.test/story.jpg",
                thumbnail_url: "https://cdn.test/story.jpg",
                text_content: null,
                background_color: "#6366f1",
                text_color: "#ffffff",
                font_style: "default",
                visibility: "friends",
                allow_replies: true,
                duration_seconds: 5,
                created_at: "2024-01-01",
                expires_at: "2024-01-02",
                is_archived: false,
                archived_at: null,
            };
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: created, error: null }),
                    }),
                }),
            });

            const story = await createStory({ type: "image", media_uri: "file://photo.jpg" });
            expect(story.type).toBe("image");
            expect(story.media_url).toBe("https://cdn.test/story.jpg");
        });
    });

    // ─────────────────────────────────────────────
    // deleteStory
    // ─────────────────────────────────────────────
    describe("deleteStory", () => {
        it("should delete a story", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            await expect(deleteStory("s-1")).resolves.toBeUndefined();
        });

        it("should throw on error", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
                    }),
                }),
            });
            await expect(deleteStory("s-1")).rejects.toBeDefined();
        });
    });

    // ─────────────────────────────────────────────
    // archiveStory
    // ─────────────────────────────────────────────
    describe("archiveStory", () => {
        it("should archive a story", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            await expect(archiveStory("s-1")).resolves.toBeUndefined();
        });
    });

    // ─────────────────────────────────────────────
    // markStoryViewed
    // ─────────────────────────────────────────────
    describe("markStoryViewed", () => {
        it("should upsert a view record", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                upsert: jest.fn().mockResolvedValue({ error: null }),
            });
            await expect(markStoryViewed("s-1")).resolves.toBeUndefined();
            expect(supabase.from).toHaveBeenCalledWith("story_views");
        });

        it("should not throw on error (silent fail)", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                upsert: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
            });
            // markStoryViewed silently swallows errors
            await expect(markStoryViewed("s-1")).resolves.toBeUndefined();
        });
    });

    // ─────────────────────────────────────────────
    // reactToStory
    // ─────────────────────────────────────────────
    describe("reactToStory", () => {
        it("should upsert a reaction", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                upsert: jest.fn().mockResolvedValue({ error: null }),
            });
            await expect(reactToStory("s-1", "❤️")).resolves.toBeUndefined();
        });

        it("should throw on error", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                upsert: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
            });
            await expect(reactToStory("s-1", "🔥")).rejects.toBeDefined();
        });
    });

    // ─────────────────────────────────────────────
    // getStoryViewers
    // ─────────────────────────────────────────────
    describe("getStoryViewers", () => {
        it("should return viewers with profile info", async () => {
            const data = [
                {
                    id: "v-1",
                    story_id: "s-1",
                    viewer_id: "u-2",
                    viewed_at: "2024-01-01",
                    reaction: "❤️",
                    profiles: { username: "bob", full_name: "Bob", avatar_url: null },
                },
            ];
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({ data, error: null }),
                    }),
                }),
            });
            const viewers = await getStoryViewers("s-1");
            expect(viewers).toHaveLength(1);
            expect(viewers[0].viewer_username).toBe("bob");
            expect(viewers[0].reaction).toBe("❤️");
        });
    });

    // ─────────────────────────────────────────────
    // sendStoryReply
    // ─────────────────────────────────────────────
    describe("sendStoryReply", () => {
        it("should send a reply", async () => {
            const created = {
                id: "r-1",
                story_id: "s-1",
                sender_id: "user-1",
                content: "Cool story!",
                created_at: "2024-01-01",
                read_at: null,
            };
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: created, error: null }),
                    }),
                }),
            });
            const reply = await sendStoryReply("s-1", "Cool story!");
            expect(reply.content).toBe("Cool story!");
        });

        it("should throw for empty reply", async () => {
            await expect(sendStoryReply("s-1", "")).rejects.toThrow("Reply cannot be empty");
        });

        it("should throw for whitespace-only reply", async () => {
            await expect(sendStoryReply("s-1", "   ")).rejects.toThrow("Reply cannot be empty");
        });
    });

    // ─────────────────────────────────────────────
    // getStoryReplies
    // ─────────────────────────────────────────────
    describe("getStoryReplies", () => {
        it("should return filtered replies", async () => {
            const data = [
                {
                    id: "r-1",
                    story_id: "s-1",
                    sender_id: "u-2",
                    content: "Nice!",
                    created_at: "2024-01-01",
                    read_at: null,
                    story: { user_id: "user-1" }, // story owner is current user
                },
            ];

            const queryChain: Record<string, jest.Mock | Function> = {};
            queryChain.select = jest.fn().mockReturnValue(queryChain);
            queryChain.eq = jest.fn().mockReturnValue(queryChain);
            queryChain.order = jest.fn().mockReturnValue(queryChain);
            // Make queryChain thenable so `await query` resolves after .eq()
            queryChain.then = (res: any, rej: any) =>
                Promise.resolve({ data, error: null }).then(res, rej);

            (supabase.from as jest.Mock).mockReturnValue(queryChain);

            const replies = await getStoryReplies("s-1");
            expect(replies).toHaveLength(1);
        });
    });

    // ─────────────────────────────────────────────
    // markReplyRead
    // ─────────────────────────────────────────────
    describe("markReplyRead", () => {
        it("should mark reply as read", async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });
            await expect(markReplyRead("r-1")).resolves.toBeUndefined();
        });
    });
});
