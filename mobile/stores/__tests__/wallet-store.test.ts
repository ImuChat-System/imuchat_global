/**
 * Tests for stores/wallet-store.ts
 * Zustand store tested via getState()/setState()
 */

// --- Mocks ---
jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock("@/services/wallet-api", () => ({
    fetchBalance: jest.fn(),
    fetchTransactions: jest.fn(),
    fetchMissions: jest.fn(),
    sendImucoins: jest.fn(),
    claimMission: jest.fn(),
}));

import {
    claimMission,
    fetchBalance,
    fetchMissions,
    fetchTransactions,
    sendImucoins,
} from "@/services/wallet-api";
import { useWalletStore } from "../wallet-store";

// --- Helpers ---
const makeBalance = (overrides: any = {}) => ({
    userId: "user-1",
    imucoins: 500,
    fiatBalance: 0,
    fiatCurrency: "EUR",
    lastSyncAt: new Date().toISOString(),
    ...overrides,
});

const makeTransaction = (overrides: any = {}) => ({
    id: "tx-1",
    userId: "user-1",
    type: "earn" as const,
    amount: 50,
    currency: "IMC",
    status: "completed",
    description: "Test tx",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    ...overrides,
});

const makeMission = (overrides: any = {}) => ({
    id: "m-1",
    title: "Daily login",
    description: "Login every day",
    reward: 50,
    currency: "IMC",
    icon: "📅",
    progress: 3,
    target: 7,
    status: "in_progress" as const,
    ...overrides,
});

// --- Tests ---
describe("useWalletStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useWalletStore.setState({
            balance: null,
            transactions: [],
            missions: [],
            isLoading: false,
            error: null,
        });
    });

    // ── Initial state ──
    describe("initial state", () => {
        it("should have null balance and empty arrays", () => {
            const state = useWalletStore.getState();
            expect(state.balance).toBeNull();
            expect(state.transactions).toEqual([]);
            expect(state.missions).toEqual([]);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    // ── loadWallet ──
    describe("loadWallet", () => {
        it("should load all wallet data", async () => {
            const balance = makeBalance();
            const txs = [makeTransaction()];
            const missions = [makeMission()];
            (fetchBalance as jest.Mock).mockResolvedValue(balance);
            (fetchTransactions as jest.Mock).mockResolvedValue(txs);
            (fetchMissions as jest.Mock).mockResolvedValue(missions);

            await useWalletStore.getState().loadWallet();

            const state = useWalletStore.getState();
            expect(state.balance).toEqual(balance);
            expect(state.transactions).toEqual(txs);
            expect(state.missions).toEqual(missions);
            expect(state.isLoading).toBe(false);
        });

        it("should fallback to mock data when API returns empty", async () => {
            (fetchBalance as jest.Mock).mockResolvedValue(null);
            (fetchTransactions as jest.Mock).mockResolvedValue([]);
            (fetchMissions as jest.Mock).mockResolvedValue([]);

            await useWalletStore.getState().loadWallet();

            const state = useWalletStore.getState();
            expect(state.balance).toBeTruthy(); // mock fallback
            expect(state.transactions.length).toBeGreaterThan(0); // mock fallback
            expect(state.missions.length).toBeGreaterThan(0); // mock fallback
        });

        it("should fallback to mock data on error", async () => {
            (fetchBalance as jest.Mock).mockRejectedValue(new Error("Network"));
            (fetchTransactions as jest.Mock).mockRejectedValue(new Error("Network"));
            (fetchMissions as jest.Mock).mockRejectedValue(new Error("Network"));

            await useWalletStore.getState().loadWallet();

            const state = useWalletStore.getState();
            expect(state.balance).toBeTruthy();
            expect(state.isLoading).toBe(false);
        });
    });

    // ── refreshBalance ──
    describe("refreshBalance", () => {
        it("should update balance only", async () => {
            const newBalance = makeBalance({ imucoins: 999 });
            (fetchBalance as jest.Mock).mockResolvedValue(newBalance);

            await useWalletStore.getState().refreshBalance();

            expect(useWalletStore.getState().balance).toEqual(newBalance);
        });

        it("should not crash on error", async () => {
            (fetchBalance as jest.Mock).mockRejectedValue(new Error("fail"));
            await expect(useWalletStore.getState().refreshBalance()).resolves.not.toThrow();
        });
    });

    // ── loadTransactions ──
    describe("loadTransactions", () => {
        it("should update transactions when API returns data", async () => {
            const txs = [makeTransaction(), makeTransaction({ id: "tx-2" })];
            (fetchTransactions as jest.Mock).mockResolvedValue(txs);

            await useWalletStore.getState().loadTransactions();

            expect(useWalletStore.getState().transactions).toEqual(txs);
        });

        it("should keep existing when API returns empty", async () => {
            useWalletStore.setState({ transactions: [makeTransaction()] });
            (fetchTransactions as jest.Mock).mockResolvedValue([]);

            await useWalletStore.getState().loadTransactions();

            expect(useWalletStore.getState().transactions).toHaveLength(1);
        });
    });

    // ── loadMissions ──
    describe("loadMissions", () => {
        it("should update missions when API returns data", async () => {
            const missions = [makeMission()];
            (fetchMissions as jest.Mock).mockResolvedValue(missions);

            await useWalletStore.getState().loadMissions();

            expect(useWalletStore.getState().missions).toEqual(missions);
        });
    });

    // ── send ──
    describe("send", () => {
        it("should send coins and update state", async () => {
            const tx = makeTransaction({ type: "send", amount: -100 });
            (sendImucoins as jest.Mock).mockResolvedValue(tx);
            useWalletStore.setState({ balance: makeBalance({ imucoins: 500 }) });

            const result = await useWalletStore.getState().send("recipient-1", 100, "Gift");

            expect(result).toBe(true);
            expect(sendImucoins).toHaveBeenCalledWith("recipient-1", 100, "Gift");
            expect(useWalletStore.getState().balance?.imucoins).toBe(400);
            expect(useWalletStore.getState().transactions[0]).toEqual(tx);
        });

        it("should return false when API returns null", async () => {
            (sendImucoins as jest.Mock).mockResolvedValue(null);
            useWalletStore.setState({ balance: makeBalance() });

            const result = await useWalletStore.getState().send("recipient-1", 100);

            expect(result).toBe(false);
        });

        it("should set error on failure", async () => {
            (sendImucoins as jest.Mock).mockRejectedValue(new Error("Insufficient funds"));

            const result = await useWalletStore.getState().send("recipient-1", 9999);

            expect(result).toBe(false);
            expect(useWalletStore.getState().error).toBe("Insufficient funds");
        });
    });

    // ── claim ──
    describe("claim", () => {
        it("should claim mission and update balance", async () => {
            (claimMission as jest.Mock).mockResolvedValue(true);
            useWalletStore.setState({
                balance: makeBalance({ imucoins: 500 }),
                missions: [makeMission({ id: "m-1", reward: 50 })],
            });

            const result = await useWalletStore.getState().claim("m-1");

            expect(result).toBe(true);
            expect(useWalletStore.getState().balance?.imucoins).toBe(550);
            expect(useWalletStore.getState().missions[0].status).toBe("claimed");
        });

        it("should return false when API fails", async () => {
            (claimMission as jest.Mock).mockResolvedValue(false);
            useWalletStore.setState({ missions: [makeMission()] });

            const result = await useWalletStore.getState().claim("m-1");

            expect(result).toBe(false);
        });

        it("should set error on exception", async () => {
            (claimMission as jest.Mock).mockRejectedValue(new Error("Already claimed"));

            const result = await useWalletStore.getState().claim("m-1");

            expect(result).toBe(false);
            expect(useWalletStore.getState().error).toBe("Already claimed");
        });
    });

    // ── clearError ──
    describe("clearError", () => {
        it("should clear error", () => {
            useWalletStore.setState({ error: "some error" });
            useWalletStore.getState().clearError();
            expect(useWalletStore.getState().error).toBeNull();
        });
    });

    // ── Helpers ──
    describe("helpers", () => {
        it("getTransactionIcon should return correct icons", () => {
            const { getTransactionIcon } = useWalletStore.getState();
            expect(getTransactionIcon("earn")).toBe("🏆");
            expect(getTransactionIcon("spend")).toBe("🛒");
            expect(getTransactionIcon("send")).toBe("↗️");
            expect(getTransactionIcon("receive")).toBe("↙️");
            expect(getTransactionIcon("topup")).toBe("💳");
            expect(getTransactionIcon("cashout")).toBe("🏦");
            expect(getTransactionIcon("refund")).toBe("↩️");
        });

        it("formatAmount should format with sign", () => {
            const { formatAmount } = useWalletStore.getState();
            expect(formatAmount(100)).toContain("+");
            expect(formatAmount(100)).toContain("IMC");
            expect(formatAmount(-50)).toContain("IMC");
            expect(formatAmount(0)).toContain("+");
        });
    });
});
