/**
 * Wallet Store — Phase M4 + DEV-028 Stripe
 *
 * Zustand + AsyncStorage persist pour ImuWallet
 * Gère balance, transactions, missions, send/claim
 * + Payment methods, top-up Stripe, subscriptions, in-app purchases
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

import {
    createCheckoutSession,
    fetchPaymentMethods,
    fetchTopupPackages,
    getCheckoutStatus,
    removePaymentMethod,
    setDefaultPaymentMethod,
} from "@/services/payment-api";

import {
    fetchIAPCatalog,
    fetchPurchasedItems,
    purchaseItem,
    restorePurchases,
} from "@/services/iap-service";

import {
    cancelSubscription,
    changePlan,
    fetchCurrentSubscription,
    fetchSubscriptionPlans,
    resumeSubscription,
    subscribeToPlan,
} from "@/services/subscription-api";

import type {
    BillingInterval,
    CheckoutSession,
    CreatorPayoutSettings,
    CurrencyCode,
    InAppItem,
    Invoice,
    KYCInfo,
    Mission,
    PaymentMethod,
    PurchaseReceipt,
    SubscriptionPlan,
    TopupPackage,
    Transaction,
    TransactionFilter,
    TransactionFilterType,
    TransactionType,
    UserSubscription,
    WalletBalance,
    WithdrawalRequest,
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

// ─── Mock data: Withdrawals, Invoices, KYC, Creator ──────────────
const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
    {
        id: "wd1",
        userId: "mock_user",
        amount: 500,
        currency: "EUR",
        targetMethod: "bank_transfer",
        targetDetails: "FR76 •••• 4521",
        status: "completed",
        fee: 2.5,
        netAmount: 497.5,
        requestedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        processedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
        id: "wd2",
        userId: "mock_user",
        amount: 200,
        currency: "EUR",
        targetMethod: "paypal",
        targetDetails: "user@example.com",
        status: "pending",
        fee: 1.0,
        netAmount: 199.0,
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
    },
];

const MOCK_INVOICES: Invoice[] = [
    {
        id: "inv1",
        userId: "mock_user",
        type: "subscription",
        referenceId: "sub_pro_monthly",
        description: "ImuChat Pro — Mensuel",
        amount: 9.99,
        currency: "EUR",
        tax: 2.0,
        total: 11.99,
        status: "paid",
        issuedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        pdfUrl: "https://api.imuchat.com/invoices/inv1.pdf",
    },
    {
        id: "inv2",
        userId: "mock_user",
        type: "topup",
        referenceId: "pkg_500",
        description: "Recharge 500 ImuCoins",
        amount: 4.99,
        currency: "EUR",
        tax: 1.0,
        total: 5.99,
        status: "paid",
        issuedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
        id: "inv3",
        userId: "mock_user",
        type: "purchase",
        referenceId: "item_theme_dark",
        description: "Thème Dark Premium",
        amount: 2.99,
        currency: "EUR",
        tax: 0.6,
        total: 3.59,
        status: "paid",
        issuedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
];

const MOCK_KYC: KYCInfo = {
    status: "not_started",
};

const MOCK_CREATOR_SETTINGS: CreatorPayoutSettings = {
    userId: "mock_user",
    payoutMethod: "none",
    payoutDetails: "",
    autoPayoutEnabled: false,
    autoPayoutThreshold: 50,
    currency: "EUR",
};

// ─── Store interface ──────────────────────────────────────────────
interface WalletStore {
    balance: WalletBalance | null;
    transactions: Transaction[];
    missions: Mission[];
    isLoading: boolean;
    error: string | null;

    // Payment methods
    paymentMethods: PaymentMethod[];
    topupPackages: TopupPackage[];
    currentCheckout: CheckoutSession | null;

    // Subscriptions
    subscription: UserSubscription | null;
    availablePlans: SubscriptionPlan[];

    // In-App Purchases
    iapCatalog: InAppItem[];
    purchasedItems: PurchaseReceipt[];

    // DEV-033: Withdrawals, Invoices, KYC, Creator
    withdrawals: WithdrawalRequest[];
    invoices: Invoice[];
    kycInfo: KYCInfo | null;
    creatorSettings: CreatorPayoutSettings | null;
    transactionFilter: TransactionFilter;

    // Loading states
    paymentLoading: boolean;
    paymentError: string | null;

    // Core actions
    loadWallet: () => Promise<void>;
    refreshBalance: () => Promise<void>;
    loadTransactions: () => Promise<void>;
    loadMissions: () => Promise<void>;
    send: (recipientId: string, amount: number, message?: string) => Promise<boolean>;
    claim: (missionId: string) => Promise<boolean>;
    clearError: () => void;

    // Payment actions
    loadPaymentMethods: () => Promise<void>;
    addPaymentMethod: () => Promise<{ clientSecret: string } | null>;
    removeMethod: (methodId: string) => Promise<boolean>;
    setDefaultMethod: (methodId: string) => Promise<boolean>;
    loadTopupPackages: () => Promise<void>;
    startTopup: (packageId: string, currency?: CurrencyCode) => Promise<CheckoutSession | null>;
    checkTopupStatus: (sessionId: string) => Promise<void>;

    // Subscription actions
    loadSubscription: () => Promise<void>;
    loadPlans: () => Promise<void>;
    subscribe: (planId: string, interval?: BillingInterval, currency?: CurrencyCode) => Promise<string | null>;
    cancelSub: () => Promise<boolean>;
    resumeSub: () => Promise<boolean>;
    changeSub: (newPlanId: string, interval?: BillingInterval) => Promise<boolean>;

    // IAP actions
    loadIAPCatalog: () => Promise<void>;
    loadPurchases: () => Promise<void>;
    purchase: (itemId: string) => Promise<PurchaseReceipt | null>;
    restoreAllPurchases: () => Promise<void>;
    isItemOwned: (itemId: string) => boolean;

    // DEV-033: Withdrawal actions
    loadWithdrawals: () => Promise<void>;
    requestWithdrawal: (amount: number, method: "bank_transfer" | "paypal", details: string) => Promise<boolean>;

    // DEV-033: Invoice actions
    loadInvoices: () => Promise<void>;

    // DEV-033: KYC actions
    loadKYC: () => Promise<void>;
    submitKYC: (documentType: "id_card" | "passport" | "driver_license") => Promise<boolean>;

    // DEV-033: Creator settings actions
    loadCreatorSettings: () => Promise<void>;
    updateCreatorSettings: (settings: Partial<CreatorPayoutSettings>) => Promise<boolean>;

    // DEV-033: Transaction filter
    setTransactionFilter: (filter: Partial<TransactionFilter>) => void;
    getFilteredTransactions: () => Transaction[];

    // Helpers
    getTransactionIcon: (type: TransactionType) => string;
    formatAmount: (amount: number) => string;
    clearPaymentError: () => void;
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

            // Payment state
            paymentMethods: [],
            topupPackages: [],
            currentCheckout: null,
            subscription: null,
            availablePlans: [],
            iapCatalog: [],
            purchasedItems: [],
            paymentLoading: false,
            paymentError: null,

            // DEV-033 state
            withdrawals: [],
            invoices: [],
            kycInfo: null,
            creatorSettings: null,
            transactionFilter: { type: "all" as TransactionFilterType },

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

            // ══════════════════════════════════════════════════════════
            // PAYMENT METHODS
            // ══════════════════════════════════════════════════════════

            loadPaymentMethods: async () => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const methods = await fetchPaymentMethods();
                    set({ paymentMethods: methods, paymentLoading: false });
                } catch (err) {
                    console.warn("[WalletStore] loadPaymentMethods error:", err);
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                }
            },

            addPaymentMethod: async () => {
                try {
                    const { createSetupIntent } = await import("@/services/payment-api");
                    const result = await createSetupIntent();
                    if (result) {
                        return { clientSecret: result.clientSecret };
                    }
                    return null;
                } catch (err) {
                    set({ paymentError: (err as Error).message });
                    return null;
                }
            },

            removeMethod: async (methodId) => {
                try {
                    const ok = await removePaymentMethod(methodId);
                    if (ok) {
                        set({
                            paymentMethods: get().paymentMethods.filter((m) => m.id !== methodId),
                        });
                    }
                    return ok;
                } catch (err) {
                    set({ paymentError: (err as Error).message });
                    return false;
                }
            },

            setDefaultMethod: async (methodId) => {
                try {
                    const ok = await setDefaultPaymentMethod(methodId);
                    if (ok) {
                        set({
                            paymentMethods: get().paymentMethods.map((m) => ({
                                ...m,
                                isDefault: m.id === methodId,
                            })),
                        });
                    }
                    return ok;
                } catch (err) {
                    set({ paymentError: (err as Error).message });
                    return false;
                }
            },

            // ══════════════════════════════════════════════════════════
            // TOP-UP / CHECKOUT
            // ══════════════════════════════════════════════════════════

            loadTopupPackages: async () => {
                try {
                    const packages = await fetchTopupPackages();
                    set({ topupPackages: packages });
                } catch (err) {
                    console.warn("[WalletStore] loadTopupPackages error:", err);
                }
            },

            startTopup: async (packageId, currency = "EUR") => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const session = await createCheckoutSession(packageId, currency);
                    set({ currentCheckout: session, paymentLoading: false });
                    return session;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return null;
                }
            },

            checkTopupStatus: async (sessionId) => {
                try {
                    const status = await getCheckoutStatus(sessionId);
                    if (status === "completed") {
                        // Refresh balance after successful topup
                        const balance = await fetchBalance();
                        if (balance) set({ balance });
                        set({ currentCheckout: null });
                    } else if (status) {
                        const current = get().currentCheckout;
                        if (current) {
                            set({ currentCheckout: { ...current, status } });
                        }
                    }
                } catch (err) {
                    console.warn("[WalletStore] checkTopupStatus error:", err);
                }
            },

            // ══════════════════════════════════════════════════════════
            // SUBSCRIPTIONS
            // ══════════════════════════════════════════════════════════

            loadSubscription: async () => {
                try {
                    const sub = await fetchCurrentSubscription();
                    set({ subscription: sub });
                } catch (err) {
                    console.warn("[WalletStore] loadSubscription error:", err);
                }
            },

            loadPlans: async () => {
                try {
                    const plans = await fetchSubscriptionPlans();
                    set({ availablePlans: plans });
                } catch (err) {
                    console.warn("[WalletStore] loadPlans error:", err);
                }
            },

            subscribe: async (planId, interval = "month", currency = "EUR") => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const result = await subscribeToPlan(planId, interval, currency);
                    set({ paymentLoading: false });
                    if (result) {
                        return result.url;
                    }
                    return null;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return null;
                }
            },

            cancelSub: async () => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const ok = await cancelSubscription();
                    if (ok) {
                        const sub = get().subscription;
                        if (sub) {
                            set({ subscription: { ...sub, cancelAtPeriodEnd: true } });
                        }
                    }
                    set({ paymentLoading: false });
                    return ok;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return false;
                }
            },

            resumeSub: async () => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const ok = await resumeSubscription();
                    if (ok) {
                        const sub = get().subscription;
                        if (sub) {
                            set({ subscription: { ...sub, cancelAtPeriodEnd: false } });
                        }
                    }
                    set({ paymentLoading: false });
                    return ok;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return false;
                }
            },

            changeSub: async (newPlanId, interval = "month") => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const ok = await changePlan(newPlanId, interval);
                    if (ok) {
                        // Reload subscription to get updated data
                        const sub = await fetchCurrentSubscription();
                        set({ subscription: sub });
                    }
                    set({ paymentLoading: false });
                    return ok;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return false;
                }
            },

            // ══════════════════════════════════════════════════════════
            // IN-APP PURCHASES
            // ══════════════════════════════════════════════════════════

            loadIAPCatalog: async () => {
                try {
                    const catalog = await fetchIAPCatalog();
                    set({ iapCatalog: catalog });
                } catch (err) {
                    console.warn("[WalletStore] loadIAPCatalog error:", err);
                }
            },

            loadPurchases: async () => {
                try {
                    const items = await fetchPurchasedItems();
                    set({ purchasedItems: items });
                } catch (err) {
                    console.warn("[WalletStore] loadPurchases error:", err);
                }
            },

            purchase: async (itemId) => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const receipt = await purchaseItem(itemId);
                    if (receipt) {
                        set({
                            purchasedItems: [receipt, ...get().purchasedItems],
                        });
                    }
                    set({ paymentLoading: false });
                    return receipt;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return null;
                }
            },

            restoreAllPurchases: async () => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const restored = await restorePurchases();
                    set({ purchasedItems: restored, paymentLoading: false });
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                }
            },

            isItemOwned: (itemId) => {
                return get().purchasedItems.some(
                    (receipt) => receipt.itemId === itemId && receipt.isActive,
                );
            },

            clearPaymentError: () => set({ paymentError: null }),

            // ══════════════════════════════════════════════════════════
            // DEV-033: WITHDRAWALS
            // ══════════════════════════════════════════════════════════

            loadWithdrawals: async () => {
                try {
                    // TODO: fetch from API, fallback to mock
                    set({ withdrawals: MOCK_WITHDRAWALS });
                } catch (err) {
                    console.warn("[WalletStore] loadWithdrawals error:", err);
                    set({ withdrawals: MOCK_WITHDRAWALS });
                }
            },

            requestWithdrawal: async (amount, method, details) => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const fee = method === "bank_transfer" ? 2.5 : 1.0;
                    const newWithdrawal: WithdrawalRequest = {
                        id: `wd_${Date.now()}`,
                        userId: get().balance?.userId || "user",
                        amount,
                        currency: "EUR",
                        targetMethod: method,
                        targetDetails: details,
                        status: "pending",
                        fee,
                        netAmount: amount - fee,
                        requestedAt: new Date().toISOString(),
                    };
                    set({
                        withdrawals: [newWithdrawal, ...get().withdrawals],
                        paymentLoading: false,
                    });
                    return true;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return false;
                }
            },

            // ══════════════════════════════════════════════════════════
            // DEV-033: INVOICES
            // ══════════════════════════════════════════════════════════

            loadInvoices: async () => {
                try {
                    // TODO: fetch from API, fallback to mock
                    set({ invoices: MOCK_INVOICES });
                } catch (err) {
                    console.warn("[WalletStore] loadInvoices error:", err);
                    set({ invoices: MOCK_INVOICES });
                }
            },

            // ══════════════════════════════════════════════════════════
            // DEV-033: KYC
            // ══════════════════════════════════════════════════════════

            loadKYC: async () => {
                try {
                    // TODO: fetch from API, fallback to mock
                    set({ kycInfo: MOCK_KYC });
                } catch (err) {
                    console.warn("[WalletStore] loadKYC error:", err);
                    set({ kycInfo: MOCK_KYC });
                }
            },

            submitKYC: async (documentType) => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const kycInfo: KYCInfo = {
                        status: "pending",
                        submittedAt: new Date().toISOString(),
                        documentType,
                    };
                    set({ kycInfo, paymentLoading: false });
                    return true;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return false;
                }
            },

            // ══════════════════════════════════════════════════════════
            // DEV-033: CREATOR SETTINGS
            // ══════════════════════════════════════════════════════════

            loadCreatorSettings: async () => {
                try {
                    // TODO: fetch from API, fallback to mock
                    set({ creatorSettings: MOCK_CREATOR_SETTINGS });
                } catch (err) {
                    console.warn("[WalletStore] loadCreatorSettings error:", err);
                    set({ creatorSettings: MOCK_CREATOR_SETTINGS });
                }
            },

            updateCreatorSettings: async (updates) => {
                set({ paymentLoading: true, paymentError: null });
                try {
                    const current = get().creatorSettings || MOCK_CREATOR_SETTINGS;
                    const updated = { ...current, ...updates };
                    set({ creatorSettings: updated, paymentLoading: false });
                    return true;
                } catch (err) {
                    set({ paymentLoading: false, paymentError: (err as Error).message });
                    return false;
                }
            },

            // ══════════════════════════════════════════════════════════
            // DEV-033: TRANSACTION FILTER
            // ══════════════════════════════════════════════════════════

            setTransactionFilter: (filter) => {
                set({ transactionFilter: { ...get().transactionFilter, ...filter } });
            },

            getFilteredTransactions: () => {
                const { transactions, transactionFilter } = get();
                let filtered = [...transactions];

                if (transactionFilter.type !== "all") {
                    filtered = filtered.filter((tx) => tx.type === transactionFilter.type);
                }
                if (transactionFilter.status) {
                    filtered = filtered.filter((tx) => tx.status === transactionFilter.status);
                }
                if (transactionFilter.dateFrom) {
                    filtered = filtered.filter((tx) => tx.createdAt >= transactionFilter.dateFrom!);
                }
                if (transactionFilter.dateTo) {
                    filtered = filtered.filter((tx) => tx.createdAt <= transactionFilter.dateTo!);
                }
                if (transactionFilter.search) {
                    const q = transactionFilter.search.toLowerCase();
                    filtered = filtered.filter(
                        (tx) =>
                            tx.description.toLowerCase().includes(q) ||
                            (tx.counterpartyName && tx.counterpartyName.toLowerCase().includes(q)),
                    );
                }
                return filtered;
            },

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
                subscription: state.subscription,
                purchasedItems: state.purchasedItems,
                kycInfo: state.kycInfo,
                creatorSettings: state.creatorSettings,
            }),
        },
    ),
);
