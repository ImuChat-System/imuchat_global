/**
 * Wallet Store — Phase M4
 *
 * Zustand + AsyncStorage persist pour ImuWallet
 * Gère balance, transactions, missions, et actions send/claim
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
    claimMission,
    fetchBalance,
    fetchMissions,
    fetchTransactions,
    sendImucoins,
} from "@/services/wallet-api";

import type {
    Mission,
    Transaction,
    TransactionType,
    WalletBalance,
} from "@/types/wallet";

// ─── Mock data (fallback quand Supabase inaccessible) ────────────
const MOCK_BALANCE: WalletBalance = {
    userId: "mock_user",
    imucoins: 1250,
    fiatBalance: 0,
    fiatCurrency: "EUR",
    lastSyncAt: new Date().toISOString(),
};

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: "tx1",
        userId: "mock_user",
        type: "earn",
        amount: 50,
        currency: "IMC",
        status: "completed",
        description: "Bonus de bienvenue 🎉",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
        id: "tx2",
        userId: "mock_user",
        type: "earn",
        amount: 100,
        currency: "IMC",
        status: "completed",
        description: "Mission: 5 messages envoyés",
        referenceId: "mission_1",
        referenceType: "mission",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: "tx3",
        userId: "mock_user",
        type: "spend",
        amount: -30,
        currency: "IMC",
        status: "completed",
        description: "Module Premium: ImuWeather",
        referenceId: "mod_weather",
        referenceType: "module",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
        id: "tx4",
        userId: "mock_user",
        type: "send",
        amount: -25,
        currency: "IMC",
        status: "completed",
        description: "Cadeau à Alice 🎁",
        counterpartyId: "user_alice",
        counterpartyName: "Alice",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: "tx5",
        userId: "mock_user",
        type: "receive",
        amount: 15,
        currency: "IMC",
        status: "completed",
        description: "Reçu de Bob",
        counterpartyId: "user_bob",
        counterpartyName: "Bob",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3600000).toISOString(),
    },
];

const MOCK_MISSIONS: Mission[] = [
    {
        id: "m1",
        title: "Connexion quotidienne",
        description: "Connectez-vous 7 jours d'affilée",
        reward: 50,
        currency: "IMC",
        icon: "📅",
        progress: 5,
        target: 7,
        status: "in_progress",
    },
    {
        id: "m2",
        title: "Social Butterfly",
        description: "Envoyez 10 messages aujourd'hui",
        reward: 20,
        currency: "IMC",
        icon: "💬",
        progress: 7,
        target: 10,
        status: "in_progress",
    },
    {
        id: "m3",
        title: "Explorateur",
        description: "Installez un module du Store",
        reward: 30,
        currency: "IMC",
        icon: "🛒",
        progress: 0,
        target: 1,
        status: "available",
    },
    {
        id: "m4",
        title: "Mélomane",
        description: "Écoutez 5 morceaux dans Music",
        reward: 25,
        currency: "IMC",
        icon: "🎵",
        progress: 2,
        target: 5,
        status: "in_progress",
    },
];

// ─── Store interface ──────────────────────────────────────────────
interface WalletStore {
    balance: WalletBalance | null;
    transactions: Transaction[];
    missions: Mission[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadWallet: () => Promise<void>;
    refreshBalance: () => Promise<void>;
    loadTransactions: () => Promise<void>;
    loadMissions: () => Promise<void>;
    send: (recipientId: string, amount: number, message?: string) => Promise<boolean>;
    claim: (missionId: string) => Promise<boolean>;
    clearError: () => void;

    // Helpers
    getTransactionIcon: (type: TransactionType) => string;
    formatAmount: (amount: number) => string;
}

// ─── Zustand store ────────────────────────────────────────────────
export const useWalletStore = create<WalletStore>()(
    persist(
        (set, get) => ({
            balance: null,
            transactions: [],
            missions: [],
            isLoading: false,
            error: null,

            // ── Load everything ──────────────────────────────────────
            loadWallet: async () => {
                set({ isLoading: true, error: null });
                try {
                    const [balance, txs, missions] = await Promise.all([
                        fetchBalance(),
                        fetchTransactions(),
                        fetchMissions(),
                    ]);
                    set({
                        balance: balance || MOCK_BALANCE,
                        transactions: txs.length > 0 ? txs : MOCK_TRANSACTIONS,
                        missions: missions.length > 0 ? missions : MOCK_MISSIONS,
                        isLoading: false,
                    });
                } catch (err) {
                    console.warn("[WalletStore] loadWallet fallback to mock:", err);
                    set({
                        balance: MOCK_BALANCE,
                        transactions: MOCK_TRANSACTIONS,
                        missions: MOCK_MISSIONS,
                        isLoading: false,
                    });
                }
            },

            // ── Refresh balance only ─────────────────────────────────
            refreshBalance: async () => {
                try {
                    const balance = await fetchBalance();
                    if (balance) set({ balance });
                } catch (err) {
                    console.warn("[WalletStore] refreshBalance error:", err);
                }
            },

            // ── Load transactions ────────────────────────────────────
            loadTransactions: async () => {
                try {
                    const txs = await fetchTransactions();
                    if (txs.length > 0) set({ transactions: txs });
                } catch (err) {
                    console.warn("[WalletStore] loadTransactions error:", err);
                }
            },

            // ── Load missions ────────────────────────────────────────
            loadMissions: async () => {
                try {
                    const missions = await fetchMissions();
                    if (missions.length > 0) set({ missions });
                } catch (err) {
                    console.warn("[WalletStore] loadMissions error:", err);
                }
            },

            // ── Send ImuCoins ────────────────────────────────────────
            send: async (recipientId, amount, message) => {
                set({ error: null });
                try {
                    const tx = await sendImucoins(recipientId, amount, message);
                    if (tx) {
                        const { balance, transactions } = get();
                        set({
                            balance: balance
                                ? { ...balance, imucoins: balance.imucoins - amount }
                                : balance,
                            transactions: [tx, ...transactions],
                        });
                        return true;
                    }
                    return false;
                } catch (err) {
                    set({ error: (err as Error).message });
                    return false;
                }
            },

            // ── Claim mission reward ─────────────────────────────────
            claim: async (missionId) => {
                set({ error: null });
                try {
                    const ok = await claimMission(missionId);
                    if (ok) {
                        const { missions, balance } = get();
                        const mission = missions.find((m) => m.id === missionId);
                        set({
                            missions: missions.map((m) =>
                                m.id === missionId ? { ...m, status: "claimed" as const } : m
                            ),
                            balance:
                                balance && mission
                                    ? {
                                        ...balance,
                                        imucoins: balance.imucoins + mission.reward,
                                    }
                                    : balance,
                        });
                        return true;
                    }
                    return false;
                } catch (err) {
                    set({ error: (err as Error).message });
                    return false;
                }
            },

            clearError: () => set({ error: null }),

            // ── Helpers ──────────────────────────────────────────────
            getTransactionIcon: (type) => {
                const icons: Record<TransactionType, string> = {
                    earn: "🏆",
                    spend: "🛒",
                    send: "↗️",
                    receive: "↙️",
                    topup: "💳",
                    cashout: "🏦",
                    refund: "↩️",
                };
                return icons[type] || "💰";
            },

            formatAmount: (amount) => {
                const sign = amount >= 0 ? "+" : "";
                return `${sign}${amount.toLocaleString()} IMC`;
            },
        }),
        {
            name: "imuchat-wallet-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                balance: state.balance,
            }),
        },
    ),
);
