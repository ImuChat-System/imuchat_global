/**
 * Tests for services/wallet-api.ts
 * Supabase chain mock pattern
 */

// --- Mocks ---
jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
        auth: {
            getUser: jest.fn(),
        },
        rpc: jest.fn(),
    },
    getCurrentUser: jest.fn(),
}));

jest.mock("../logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import { supabase } from "../supabase";
import {
    claimMission,
    createTopupSession,
    fetchBalance,
    fetchMissions,
    fetchTransactions,
    requestCashout,
    sendImucoins,
} from "../wallet-api";

const mockAuth = supabase.auth.getUser as jest.Mock;
const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

// ── Helpers ──
const mockUser = { id: "user-1", email: "test@test.com" };

function setupAuth(user: any = mockUser) {
    mockAuth.mockResolvedValue({ data: { user } });
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("wallet-api", () => {
    // ── fetchBalance ──
    describe("fetchBalance", () => {
        it("returns mapped balance", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: {
                                user_id: "user-1",
                                imucoins: 500,
                                fiat_balance: 10,
                                fiat_currency: "EUR",
                                last_sync_at: "2026-01-01",
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchBalance();
            expect(result).toEqual({
                userId: "user-1",
                imucoins: 500,
                fiatBalance: 10,
                fiatCurrency: "EUR",
                lastSyncAt: "2026-01-01",
            });
        });

        it("creates wallet when PGRST116 error", async () => {
            setupAuth();
            // First call: not found
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: "PGRST116", message: "Not found" },
                        }),
                    }),
                }),
            });
            // Second call: insert
            mockFrom.mockReturnValueOnce({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: {
                                user_id: "user-1",
                                imucoins: 100,
                                fiat_balance: 0,
                                fiat_currency: "EUR",
                                last_sync_at: null,
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await fetchBalance();
            expect(result?.imucoins).toBe(100);
        });

        it("returns null when no user", async () => {
            mockAuth.mockResolvedValue({ data: { user: null } });
            const result = await fetchBalance();
            expect(result).toBeNull();
        });

        it("returns null on other errors", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: "OTHER", message: "Unknown" },
                        }),
                    }),
                }),
            });

            const result = await fetchBalance();
            expect(result).toBeNull();
        });
    });

    // ── fetchTransactions ──
    describe("fetchTransactions", () => {
        it("returns mapped transactions", async () => {
            setupAuth();
            const rawTx = {
                id: "tx-1",
                user_id: "user-1",
                type: "earn",
                amount: 50,
                currency: "IMC",
                status: "completed",
                description: "Daily reward",
                created_at: "2026-01-01",
            };
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: [rawTx],
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchTransactions();
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("tx-1");
            expect(result[0].userId).toBe("user-1");
        });

        it("returns empty array when no user", async () => {
            mockAuth.mockResolvedValue({ data: { user: null } });
            expect(await fetchTransactions()).toEqual([]);
        });

        it("returns empty on error", async () => {
            setupAuth();
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: "DB error" },
                            }),
                        }),
                    }),
                }),
            });

            expect(await fetchTransactions()).toEqual([]);
        });
    });

    // ── sendImucoins ──
    describe("sendImucoins", () => {
        it("calls rpc and returns transaction", async () => {
            setupAuth();
            const rawTx = {
                id: "tx-2",
                user_id: "user-1",
                type: "send",
                amount: -100,
                currency: "IMC",
                description: "Gift",
                created_at: "2026-01-02",
            };
            mockRpc.mockResolvedValue({ data: rawTx, error: null });

            const result = await sendImucoins("user-2", 100, "Gift");
            expect(result).toBeTruthy();
            expect(result?.id).toBe("tx-2");
            expect(mockRpc).toHaveBeenCalledWith("transfer_imucoins", {
                p_sender_id: "user-1",
                p_amount: 100,
                p_recipient_id: "user-2",
                p_message: "Gift",
            });
        });

        it("throws on error", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({
                data: null,
                error: { message: "Insufficient balance" },
            });

            await expect(sendImucoins("user-2", 9999)).rejects.toThrow(
                "Insufficient balance"
            );
        });

        it("returns null when no user", async () => {
            mockAuth.mockResolvedValue({ data: { user: null } });
            expect(await sendImucoins("user-2", 100)).toBeNull();
        });
    });

    // ── fetchMissions ──
    describe("fetchMissions", () => {
        it("returns mapped missions", async () => {
            setupAuth();
            const rawMission = {
                id: "m-1",
                title: "Daily login",
                description: "Login every day",
                reward: 50,
                currency: "IMC",
                icon: "📅",
                progress: 3,
                target: 7,
                status: "in_progress",
            };
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        in: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({
                                data: [rawMission],
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchMissions();
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Daily login");
        });

        it("returns empty when no user", async () => {
            mockAuth.mockResolvedValue({ data: { user: null } });
            expect(await fetchMissions()).toEqual([]);
        });
    });

    // ── claimMission ──
    describe("claimMission", () => {
        it("returns true on success", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({ error: null });
            expect(await claimMission("m-1")).toBe(true);
        });

        it("returns false on error", async () => {
            setupAuth();
            mockRpc.mockResolvedValue({ error: { message: "Already claimed" } });
            expect(await claimMission("m-1")).toBe(false);
        });

        it("returns false when no user", async () => {
            mockAuth.mockResolvedValue({ data: { user: null } });
            expect(await claimMission("m-1")).toBe(false);
        });
    });

    // ── Stubs ──
    describe("stubs", () => {
        it("createTopupSession returns null", async () => {
            expect(await createTopupSession(10)).toBeNull();
        });

        it("requestCashout returns false", async () => {
            expect(await requestCashout(100)).toBe(false);
        });
    });
});
