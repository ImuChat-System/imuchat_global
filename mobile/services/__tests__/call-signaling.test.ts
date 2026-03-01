/**
 * Tests for services/call-signaling.ts
 * Supabase chain mock pattern
 */

// --- Mocks ---
jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        channel: jest.fn().mockReturnValue({
            on: jest.fn().mockReturnThis(),
            subscribe: jest.fn(),
        }),
        removeChannel: jest.fn(),
    },
    getCurrentUser: jest.fn(),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import {
    acceptCall,
    endCall,
    getCallHistory,
    initiateCall,
    markCallAsMissed,
    rejectCall,
    subscribeToCallUpdates,
    subscribeToIncomingCalls,
} from "../call-signaling";
import { getCurrentUser, supabase } from "../supabase";

const mockFrom = supabase.from as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;

// ── Helper builders ──
function buildCallEvent(overrides: any = {}) {
    return {
        id: "call-1",
        caller_id: "user-1",
        callee_id: "user-2",
        call_type: "audio",
        status: "ringing",
        stream_call_id: "stream-1",
        created_at: new Date().toISOString(),
        answered_at: null,
        ended_at: null,
        caller: { id: "user-1", username: "alice", display_name: "Alice", avatar_url: null },
        callee: { id: "user-2", username: "bob", display_name: "Bob", avatar_url: null },
        ...overrides,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("call-signaling", () => {
    // ── initiateCall ──
    describe("initiateCall", () => {
        it("inserts call event and returns data", async () => {
            const callEvent = buildCallEvent();
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: callEvent,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await initiateCall("user-2", "audio", "stream-1");
            expect(result).toEqual(callEvent);
            expect(mockFrom).toHaveBeenCalledWith("call_events");
        });

        it("throws when user not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(initiateCall("user-2", "audio", "s-1")).rejects.toThrow(
                "No authenticated user"
            );
        });

        it("throws on supabase error", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: "DB error" },
                        }),
                    }),
                }),
            });

            await expect(initiateCall("user-2", "audio", "s-1")).rejects.toBeTruthy();
        });
    });

    // ── acceptCall ──
    describe("acceptCall", () => {
        it("updates status to accepted", async () => {
            const eqMock = jest.fn().mockResolvedValue({ error: null });
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({ eq: eqMock }),
            });

            await acceptCall("call-1");
            expect(mockFrom).toHaveBeenCalledWith("call_events");
        });

        it("throws on error", async () => {
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
                }),
            });
            await expect(acceptCall("call-1")).rejects.toBeTruthy();
        });
    });

    // ── rejectCall ──
    describe("rejectCall", () => {
        it("updates status to rejected", async () => {
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await rejectCall("call-1");
            expect(mockFrom).toHaveBeenCalledWith("call_events");
        });
    });

    // ── endCall ──
    describe("endCall", () => {
        it("updates status to ended", async () => {
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await endCall("call-1");
            expect(mockFrom).toHaveBeenCalledWith("call_events");
        });
    });

    // ── markCallAsMissed ──
    describe("markCallAsMissed", () => {
        it("updates status to missed", async () => {
            mockFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            await markCallAsMissed("call-1");
            expect(mockFrom).toHaveBeenCalledWith("call_events");
        });
    });

    // ── subscribeToIncomingCalls ──
    describe("subscribeToIncomingCalls", () => {
        it("subscribes to incoming calls channel", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

            const unsub = await subscribeToIncomingCalls(jest.fn());
            expect(supabase.channel).toHaveBeenCalledWith("incoming_calls");
            expect(typeof unsub).toBe("function");
        });

        it("returns noop when no user", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            const unsub = await subscribeToIncomingCalls(jest.fn());
            expect(typeof unsub).toBe("function");
        });
    });

    // ── subscribeToCallUpdates ──
    describe("subscribeToCallUpdates", () => {
        it("subscribes to call update channel", () => {
            const unsub = subscribeToCallUpdates("call-1", jest.fn());
            expect(supabase.channel).toHaveBeenCalledWith("call_call-1");
            expect(typeof unsub).toBe("function");
        });
    });

    // ── getCallHistory ──
    describe("getCallHistory", () => {
        it("returns call history for current user", async () => {
            const calls = [buildCallEvent(), buildCallEvent({ id: "call-2" })];
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    or: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: calls,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await getCallHistory();
            expect(result).toEqual(calls);
        });

        it("throws when no user", async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            await expect(getCallHistory()).rejects.toThrow("No authenticated user");
        });
    });
});
