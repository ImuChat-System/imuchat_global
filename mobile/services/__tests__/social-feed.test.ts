import {
    addComment,
    createPost,
    deleteComment,
    deletePost,
    fetchComments,
    fetchFeed,
    likePost,
    sharePost,
    toggleLike,
    unlikePost,
} from "../social-feed";
import { supabase } from "../supabase";

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
}));

const mockUser = { id: "user-1", email: "test@test.com" };

function mockAuth(user: typeof mockUser | null = mockUser) {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user },
    });
}

describe("Social Feed Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // fetchFeed
    // ─────────────────────────────────────────────
    describe("fetchFeed", () => {
        it("should return posts with pagination", async () => {
            mockAuth();
            const rawPosts = [
                {
                    id: "p-1",
                    author_id: "u-2",
                    content: "Hello",
                    media_urls: [],
                    type: "post",
                    likes_count: 3,
                    comments_count: 1,
                    shares_count: 0,
                    created_at: "2024-01-01T12:00:00Z",
                    updated_at: "2024-01-01T12:00:00Z",
                    author: { id: "u-2", username: "bob", display_name: "Bob", avatar_url: null },
                },
            ];

            // Main query chain - need to support chaining: select().order().limit() then conditionally .lt() then await
            const queryChain: Record<string, jest.Mock> = {};
            queryChain.select = jest.fn().mockReturnValue(queryChain);
            queryChain.order = jest.fn().mockReturnValue(queryChain);
            queryChain.limit = jest.fn().mockResolvedValue({ data: rawPosts, error: null });
            queryChain.lt = jest.fn().mockReturnValue(queryChain);
            queryChain.in = jest.fn().mockReturnValue(queryChain);

            // Likes query
            const likesChain: Record<string, jest.Mock> = {};
            likesChain.select = jest.fn().mockReturnValue(likesChain);
            likesChain.eq = jest.fn().mockReturnValue(likesChain);
            likesChain.in = jest.fn().mockResolvedValue({ data: [{ post_id: "p-1" }] });

            (supabase.from as jest.Mock)
                .mockReturnValueOnce(queryChain) // posts query
                .mockReturnValueOnce(likesChain); // post_likes query

            const result = await fetchFeed();
            expect(result.posts).toHaveLength(1);
            expect(result.posts[0].content).toBe("Hello");
            expect(result.posts[0].isLiked).toBe(true);
            expect(result.hasMore).toBe(false);
        });

        it("should return empty feed on error", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({ data: null, error: { message: "err" } }),
                    }),
                }),
            });
            const result = await fetchFeed();
            expect(result.posts).toEqual([]);
            expect(result.hasMore).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // createPost
    // ─────────────────────────────────────────────
    describe("createPost", () => {
        it("should create and return a post", async () => {
            mockAuth();
            const created = {
                id: "p-new",
                author_id: "user-1",
                content: "New post",
                media_urls: [],
                type: "post",
                likes_count: 0,
                comments_count: 0,
                shares_count: 0,
                created_at: "2024-01-01T12:00:00Z",
                updated_at: "2024-01-01T12:00:00Z",
                author: { id: "user-1", username: "me", display_name: "Me", avatar_url: null },
            };
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: created, error: null }),
                    }),
                }),
            });
            const post = await createPost({ content: "New post" });
            expect(post).not.toBeNull();
            expect(post!.id).toBe("p-new");
            expect(post!.content).toBe("New post");
        });

        it("should return null when not authenticated", async () => {
            mockAuth(null);
            const post = await createPost({ content: "X" });
            expect(post).toBeNull();
        });

        it("should return null on error", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
                    }),
                }),
            });
            const post = await createPost({ content: "X" });
            expect(post).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // deletePost
    // ─────────────────────────────────────────────
    describe("deletePost", () => {
        it("should delete own post", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            const result = await deletePost("p-1");
            expect(result).toBe(true);
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await deletePost("p-1");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // likePost
    // ─────────────────────────────────────────────
    describe("likePost", () => {
        it("should like a post and increment count", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockResolvedValue({ error: null }),
            });
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await likePost("p-1");
            expect(result).toBe(true);
            expect(supabase.rpc).toHaveBeenCalledWith("increment_post_likes", { post_id: "p-1" });
        });

        it("should return true if already liked (unique constraint)", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockResolvedValue({ error: { code: "23505" } }),
            });
            const result = await likePost("p-1");
            expect(result).toBe(true);
        });

        it("should return false on other errors", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockResolvedValue({ error: { code: "500", message: "fail" } }),
            });
            const result = await likePost("p-1");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // unlikePost
    // ─────────────────────────────────────────────
    describe("unlikePost", () => {
        it("should unlike a post and decrement count", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await unlikePost("p-1");
            expect(result).toBe(true);
            expect(supabase.rpc).toHaveBeenCalledWith("decrement_post_likes", { post_id: "p-1" });
        });
    });

    // ─────────────────────────────────────────────
    // toggleLike
    // ─────────────────────────────────────────────
    describe("toggleLike", () => {
        it("should call unlikePost when currently liked", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await toggleLike("p-1", true);
            expect(result).toBe(true);
        });

        it("should call likePost when not currently liked", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockResolvedValue({ error: null }),
            });
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await toggleLike("p-1", false);
            expect(result).toBe(true);
        });
    });

    // ─────────────────────────────────────────────
    // fetchComments
    // ─────────────────────────────────────────────
    describe("fetchComments", () => {
        it("should return comments for a post", async () => {
            mockAuth();
            const rawComments = [
                {
                    id: "c-1",
                    post_id: "p-1",
                    author_id: "u-2",
                    content: "Nice!",
                    likes_count: 0,
                    created_at: "2024-01-01T12:00:00Z",
                    author: { id: "u-2", username: "bob", display_name: "Bob", avatar_url: null },
                },
            ];

            const queryChain: Record<string, jest.Mock> = {};
            queryChain.select = jest.fn().mockReturnValue(queryChain);
            queryChain.eq = jest.fn().mockReturnValue(queryChain);
            queryChain.order = jest.fn().mockReturnValue(queryChain);
            queryChain.limit = jest.fn().mockResolvedValue({ data: rawComments, error: null });
            queryChain.gt = jest.fn().mockReturnValue(queryChain);

            const likesChain: Record<string, jest.Mock> = {};
            likesChain.select = jest.fn().mockReturnValue(likesChain);
            likesChain.eq = jest.fn().mockReturnValue(likesChain);
            likesChain.in = jest.fn().mockResolvedValue({ data: [] });

            (supabase.from as jest.Mock)
                .mockReturnValueOnce(queryChain) // comments query
                .mockReturnValueOnce(likesChain); // comment_likes query

            const result = await fetchComments("p-1");
            expect(result.comments).toHaveLength(1);
            expect(result.comments[0].content).toBe("Nice!");
        });
    });

    // ─────────────────────────────────────────────
    // addComment
    // ─────────────────────────────────────────────
    describe("addComment", () => {
        it("should add a comment and increment count", async () => {
            mockAuth();
            const created = {
                id: "c-new",
                post_id: "p-1",
                author_id: "user-1",
                content: "Great!",
                likes_count: 0,
                created_at: "2024-01-01T12:00:00Z",
                author: { id: "user-1", username: "me", display_name: "Me", avatar_url: null },
            };
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: created, error: null }),
                    }),
                }),
            });
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const comment = await addComment("p-1", "Great!");
            expect(comment).not.toBeNull();
            expect(comment!.content).toBe("Great!");
            expect(supabase.rpc).toHaveBeenCalledWith("increment_post_comments", { post_id: "p-1" });
        });

        it("should return null when not authenticated", async () => {
            mockAuth(null);
            const comment = await addComment("p-1", "X");
            expect(comment).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // deleteComment
    // ─────────────────────────────────────────────
    describe("deleteComment", () => {
        it("should delete own comment and decrement count", async () => {
            mockAuth();
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

            const result = await deleteComment("c-1", "p-1");
            expect(result).toBe(true);
            expect(supabase.rpc).toHaveBeenCalledWith("decrement_post_comments", { post_id: "p-1" });
        });

        it("should return false when not authenticated", async () => {
            mockAuth(null);
            const result = await deleteComment("c-1", "p-1");
            expect(result).toBe(false);
        });
    });

    // ─────────────────────────────────────────────
    // sharePost
    // ─────────────────────────────────────────────
    describe("sharePost", () => {
        it("should share a post via RPC", async () => {
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });
            const result = await sharePost("p-1");
            expect(result).toBe(true);
            expect(supabase.rpc).toHaveBeenCalledWith("increment_post_shares", { post_id: "p-1" });
        });

        it("should return false on RPC error", async () => {
            (supabase.rpc as jest.Mock).mockResolvedValue({ error: { message: "fail" } });
            const result = await sharePost("p-1");
            expect(result).toBe(false);
        });
    });
});
