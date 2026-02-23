/**
 * Tests for services/reactions.ts
 *
 * Focus on groupReactions (pure function) + Supabase-backed CRUD ops.
 */

// --- Mocks ---
jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
        channel: jest.fn().mockReturnValue({
            on: jest.fn().mockReturnThis(),
            subscribe: jest.fn(),
        }),
        removeChannel: jest.fn(),
    },
    getCurrentUser: jest.fn(),
}));

import {
    addReaction,
    groupReactions,
    QUICK_REACTIONS,
    Reaction,
    removeReaction,
    toggleReaction
} from "../reactions";
import { getCurrentUser, supabase } from "../supabase";

const mockFrom = supabase.from as jest.Mock;

function buildReaction(overrides: Partial<Reaction> = {}): Reaction {
    return {
        id: "r1",
        message_id: "msg-1",
        user_id: "user-1",
        emoji: "❤️",
        created_at: new Date().toISOString(),
        user: { id: "user-1", username: "alice", avatar_url: "" },
        ...overrides,
    };
}

// Reset mocks chain between tests
beforeEach(() => {
    jest.clearAllMocks();
    // Rebuild the chain for each test
    mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: [], error: null }),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: null }),
                    }),
                }),
            }),
            in: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
        }),
        insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: buildReaction(),
                    error: null,
                }),
            }),
        }),
        delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: buildReaction(),
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        }),
    });
});

// ─── groupReactions (pure function) ────────────────────

describe("groupReactions", () => {
    it("returns empty array for no reactions", () => {
        expect(groupReactions([], "user-1")).toEqual([]);
    });

    it("groups reactions by emoji", () => {
        const reactions: Reaction[] = [
            buildReaction({ emoji: "❤️", user_id: "u1", user: { id: "u1", username: "alice", avatar_url: "" } }),
            buildReaction({ emoji: "❤️", user_id: "u2", user: { id: "u2", username: "bob", avatar_url: "" } }),
            buildReaction({ emoji: "👍", user_id: "u3", user: { id: "u3", username: "carol", avatar_url: "" } }),
        ];

        const groups = groupReactions(reactions, "u1");
        expect(groups).toHaveLength(2);

        const heart = groups.find((g) => g.emoji === "❤️")!;
        expect(heart.count).toBe(2);
        expect(heart.users).toEqual(["alice", "bob"]);
        expect(heart.isOwn).toBe(true);

        const thumb = groups.find((g) => g.emoji === "👍")!;
        expect(thumb.count).toBe(1);
        expect(thumb.users).toEqual(["carol"]);
        expect(thumb.isOwn).toBe(false);
    });

    it("sets isOwn = true when currentUserId matches reaction.user_id", () => {
        const reactions: Reaction[] = [
            buildReaction({ emoji: "😂", user_id: "me" }),
        ];
        const groups = groupReactions(reactions, "me");
        expect(groups[0].isOwn).toBe(true);
    });

    it("sets isOwn = false when currentUserId does not match", () => {
        const reactions: Reaction[] = [
            buildReaction({ emoji: "😂", user_id: "other" }),
        ];
        const groups = groupReactions(reactions, "me");
        expect(groups[0].isOwn).toBe(false);
    });

    it("handles reactions without user object", () => {
        const reactions: Reaction[] = [
            { id: "r1", message_id: "m1", user_id: "u1", emoji: "❤️", created_at: "" },
        ];
        const groups = groupReactions(reactions, "u1");
        expect(groups[0].count).toBe(1);
        expect(groups[0].users).toEqual([]); // no username pushed
        expect(groups[0].isOwn).toBe(true);
    });
});

// ─── CRUD operations ───────────────────────────────────

describe("addReaction", () => {
    it("calls supabase insert with correct params", async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1" });

        const result = await addReaction("msg-1", "❤️");
        expect(result).toBeDefined();
        expect(mockFrom).toHaveBeenCalledWith("message_reactions");
    });

    it("throws if no authenticated user", async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(null);
        await expect(addReaction("msg-1", "❤️")).rejects.toThrow("No authenticated user");
    });
});

describe("removeReaction", () => {
    it("calls supabase delete with correct params", async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-1" });

        const result = await removeReaction("msg-1", "❤️");
        expect(result).toBeDefined();
        expect(mockFrom).toHaveBeenCalledWith("message_reactions");
    });

    it("throws if no authenticated user", async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(null);
        await expect(removeReaction("msg-1", "❤️")).rejects.toThrow("No authenticated user");
    });
});

describe("toggleReaction", () => {
    it("throws if no authenticated user", async () => {
        (getCurrentUser as jest.Mock).mockResolvedValue(null);
        await expect(toggleReaction("msg-1", "❤️")).rejects.toThrow("No authenticated user");
    });
});

// ─── Constants ─────────────────────────────────────────

describe("QUICK_REACTIONS", () => {
    it("has 6 quick reaction emojis", () => {
        expect(QUICK_REACTIONS).toHaveLength(6);
    });

    it("includes heart emoji", () => {
        expect(QUICK_REACTIONS).toContain("❤️");
    });

    it("includes thumbs up emoji", () => {
        expect(QUICK_REACTIONS).toContain("👍");
    });
});
