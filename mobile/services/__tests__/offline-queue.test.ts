/**
 * Tests for services/offline-queue.ts
 *
 * Mock AsyncStorage to test the persistent offline message queue.
 */

// Mock AsyncStorage
const mockStore: Record<string, string> = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn((key: string) => Promise.resolve(mockStore[key] || null)),
        setItem: jest.fn((key: string, value: string) => {
            mockStore[key] = value;
            return Promise.resolve();
        }),
        removeItem: jest.fn((key: string) => {
            delete mockStore[key];
            return Promise.resolve();
        }),
    },
}));

import {
    addPendingMessage,
    cleanExpiredMessages,
    clearAllPendingMessages,
    getPendingCount,
    getPendingMessages,
    getPendingMessagesForConversation,
    hasPendingMessages,
    PendingMessage,
    removePendingMessage,
} from "../offline-queue";

function buildPendingMsg(overrides: Partial<PendingMessage> = {}): PendingMessage {
    return {
        id: "msg-1",
        content: "Hello",
        senderId: "user-1",
        senderName: "Alice",
        conversationId: "conv-1",
        type: "text",
        queuedAt: Date.now(),
        ...overrides,
    };
}

beforeEach(() => {
    // Clear the mock store
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
    jest.clearAllMocks();
});

describe("addPendingMessage", () => {
    it("stores a message in the queue", async () => {
        const msg = buildPendingMsg();
        await addPendingMessage(msg);

        const result = await getPendingMessages();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("msg-1");
    });

    it("replaces duplicate messages by id", async () => {
        await addPendingMessage(buildPendingMsg({ id: "msg-1", content: "v1" }));
        await addPendingMessage(buildPendingMsg({ id: "msg-1", content: "v2" }));

        const result = await getPendingMessages();
        expect(result).toHaveLength(1);
        expect(result[0].content).toBe("v2");
    });

    it("stores multiple distinct messages", async () => {
        await addPendingMessage(buildPendingMsg({ id: "msg-1" }));
        await addPendingMessage(buildPendingMsg({ id: "msg-2" }));

        const result = await getPendingMessages();
        expect(result).toHaveLength(2);
    });
});

describe("getPendingMessages", () => {
    it("returns empty array when no messages", async () => {
        const result = await getPendingMessages();
        expect(result).toEqual([]);
    });

    it("filters out expired messages (older than 5 minutes)", async () => {
        const fresh = buildPendingMsg({ id: "fresh", queuedAt: Date.now() });
        const expired = buildPendingMsg({
            id: "old",
            queuedAt: Date.now() - 6 * 60 * 1000, // 6 min ago
        });

        await addPendingMessage(fresh);
        await addPendingMessage(expired);

        const result = await getPendingMessages();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("fresh");
    });
});

describe("getPendingMessagesForConversation", () => {
    it("filters by conversationId", async () => {
        await addPendingMessage(buildPendingMsg({ id: "m1", conversationId: "conv-A" }));
        await addPendingMessage(buildPendingMsg({ id: "m2", conversationId: "conv-B" }));
        await addPendingMessage(buildPendingMsg({ id: "m3", conversationId: "conv-A" }));

        const result = await getPendingMessagesForConversation("conv-A");
        expect(result).toHaveLength(2);
        expect(result.every((m) => m.conversationId === "conv-A")).toBe(true);
    });

    it("returns empty for unknown conversation", async () => {
        await addPendingMessage(buildPendingMsg({ conversationId: "conv-A" }));
        const result = await getPendingMessagesForConversation("conv-Z");
        expect(result).toEqual([]);
    });
});

describe("removePendingMessage", () => {
    it("removes a specific message by id", async () => {
        await addPendingMessage(buildPendingMsg({ id: "m1" }));
        await addPendingMessage(buildPendingMsg({ id: "m2" }));

        await removePendingMessage("m1");

        const result = await getPendingMessages();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("m2");
    });

    it("no-ops if message id not found", async () => {
        await addPendingMessage(buildPendingMsg({ id: "m1" }));
        await removePendingMessage("nonexistent");

        const result = await getPendingMessages();
        expect(result).toHaveLength(1);
    });
});

describe("cleanExpiredMessages", () => {
    it("returns 0 when no expired messages", async () => {
        await addPendingMessage(buildPendingMsg({ queuedAt: Date.now() }));
        const cleaned = await cleanExpiredMessages();
        expect(cleaned).toBe(0);
    });

    it("cleans expired messages and returns count", async () => {
        await addPendingMessage(buildPendingMsg({ id: "fresh", queuedAt: Date.now() }));
        await addPendingMessage(
            buildPendingMsg({ id: "old1", queuedAt: Date.now() - 10 * 60 * 1000 }),
        );
        await addPendingMessage(
            buildPendingMsg({ id: "old2", queuedAt: Date.now() - 10 * 60 * 1000 }),
        );

        const cleaned = await cleanExpiredMessages();
        expect(cleaned).toBe(2);

        const remaining = await getPendingMessages();
        expect(remaining).toHaveLength(1);
        expect(remaining[0].id).toBe("fresh");
    });
});

describe("clearAllPendingMessages", () => {
    it("removes all messages from queue", async () => {
        await addPendingMessage(buildPendingMsg({ id: "m1" }));
        await addPendingMessage(buildPendingMsg({ id: "m2" }));

        await clearAllPendingMessages();

        const result = await getPendingMessages();
        expect(result).toEqual([]);
    });
});

describe("getPendingCount", () => {
    it("returns 0 for empty queue", async () => {
        expect(await getPendingCount()).toBe(0);
    });

    it("returns count of non-expired messages", async () => {
        await addPendingMessage(buildPendingMsg({ id: "m1" }));
        await addPendingMessage(buildPendingMsg({ id: "m2" }));
        expect(await getPendingCount()).toBe(2);
    });

    it("excludes expired messages from count", async () => {
        await addPendingMessage(buildPendingMsg({ id: "m1", queuedAt: Date.now() }));
        await addPendingMessage(
            buildPendingMsg({ id: "m2", queuedAt: Date.now() - 10 * 60 * 1000 }),
        );
        expect(await getPendingCount()).toBe(1);
    });
});

describe("hasPendingMessages", () => {
    it("returns false for empty queue", async () => {
        expect(await hasPendingMessages()).toBe(false);
    });

    it("returns true when messages exist", async () => {
        await addPendingMessage(buildPendingMsg());
        expect(await hasPendingMessages()).toBe(true);
    });
});
