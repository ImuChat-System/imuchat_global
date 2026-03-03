/**
 * Tests for wallet-store.ts — DEV-033 Wallet & Monétisation extensions
 *
 * Tests newly added actions: withdrawals, invoices, KYC, creator settings,
 * transaction filters.
 * CRITICAL: NO TypeScript syntax in test files.
 */

// --- Mocks ---
jest.mock("@react-native-async-storage/async-storage", function () {
    return {
        __esModule: true,
        default: {
            getItem: jest.fn().mockResolvedValue(null),
            setItem: jest.fn().mockResolvedValue(undefined),
            removeItem: jest.fn().mockResolvedValue(undefined),
        },
    };
});

jest.mock("@/services/wallet-api", function () {
    return {
        fetchBalance: jest.fn(),
        fetchTransactions: jest.fn(),
        fetchMissions: jest.fn(),
        sendImucoins: jest.fn(),
        claimMission: jest.fn(),
    };
});

jest.mock("@/services/payment-api", function () {
    return {
        fetchPaymentMethods: jest.fn().mockResolvedValue([]),
        fetchTopupPackages: jest.fn().mockResolvedValue([]),
        createCheckoutSession: jest.fn(),
        getCheckoutStatus: jest.fn(),
        removePaymentMethod: jest.fn(),
        setDefaultPaymentMethod: jest.fn(),
        createSetupIntent: jest.fn(),
    };
});

jest.mock("@/services/iap-service", function () {
    return {
        fetchIAPCatalog: jest.fn().mockResolvedValue([]),
        fetchPurchasedItems: jest.fn().mockResolvedValue([]),
        purchaseItem: jest.fn(),
        restorePurchases: jest.fn(),
    };
});

jest.mock("@/services/subscription-api", function () {
    return {
        fetchSubscriptionPlans: jest.fn().mockResolvedValue([]),
        fetchCurrentSubscription: jest.fn().mockResolvedValue(null),
        subscribeToPlan: jest.fn(),
        cancelSubscription: jest.fn(),
        resumeSubscription: jest.fn(),
        changePlan: jest.fn(),
    };
});

var useWalletStore = require("../wallet-store").useWalletStore;

// --- Helpers ---
function resetDEV033State() {
    useWalletStore.setState({
        withdrawals: [],
        invoices: [],
        kycInfo: { status: "not_started" },
        creatorSettings: null,
        transactionFilter: { type: "all", search: "" },
        transactions: [],
        balance: null,
        missions: [],
        isLoading: false,
        walletLoading: false,
        error: null,
        paymentMethods: [],
        topupPackages: [],
        currentCheckout: null,
        subscription: null,
        availablePlans: [],
        iapCatalog: [],
        purchasedItems: [],
        paymentLoading: false,
        paymentError: null,
    });
}

// ═══════════════════════════════════════════════════════════════
// WITHDRAWALS
// ═══════════════════════════════════════════════════════════════
describe("DEV-033 Wallet — Withdrawals", function () {
    beforeEach(function () {
        resetDEV033State();
    });

    it("loadWithdrawals populates the withdrawals array", async function () {
        await useWalletStore.getState().loadWithdrawals();
        var state = useWalletStore.getState();
        expect(state.withdrawals.length).toBeGreaterThan(0);
    });

    it("requestWithdrawal adds a new withdrawal", async function () {
        await useWalletStore.getState().loadWithdrawals();
        var before = useWalletStore.getState().withdrawals.length;
        await useWalletStore.getState().requestWithdrawal(100, "bank_transfer");
        var after = useWalletStore.getState().withdrawals.length;
        expect(after).toBe(before + 1);
    });

    it("requestWithdrawal creates a pending withdrawal", async function () {
        await useWalletStore.getState().requestWithdrawal(50, "paypal");
        var state = useWalletStore.getState();
        var latest = state.withdrawals[0];
        expect(latest.status).toBe("pending");
        expect(latest.amount).toBe(50);
        expect(latest.targetMethod).toBe("paypal");
    });

    it("requestWithdrawal calculates fee and netAmount", async function () {
        await useWalletStore.getState().requestWithdrawal(200, "bank_transfer");
        var state = useWalletStore.getState();
        var latest = state.withdrawals[0];
        expect(latest.fee).toBeGreaterThanOrEqual(0);
        expect(latest.netAmount).toBeLessThanOrEqual(200);
        expect(latest.netAmount).toBe(200 - latest.fee);
    });
});

// ═══════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════
describe("DEV-033 Wallet — Invoices", function () {
    beforeEach(function () {
        resetDEV033State();
    });

    it("loadInvoices populates the invoices array", async function () {
        await useWalletStore.getState().loadInvoices();
        var state = useWalletStore.getState();
        expect(state.invoices.length).toBeGreaterThan(0);
    });

    it("invoices have required fields", async function () {
        await useWalletStore.getState().loadInvoices();
        var invoice = useWalletStore.getState().invoices[0];
        expect(invoice.id).toBeDefined();
        expect(invoice.type).toBeDefined();
        expect(invoice.status).toBeDefined();
        expect(invoice.total).toBeDefined();
    });

    it("invoices include subscription and topup types", async function () {
        await useWalletStore.getState().loadInvoices();
        var invoices = useWalletStore.getState().invoices;
        var types = invoices.map(function (inv) { return inv.type; });
        expect(types).toContain("subscription");
        expect(types).toContain("topup");
    });
});

// ═══════════════════════════════════════════════════════════════
// KYC
// ═══════════════════════════════════════════════════════════════
describe("DEV-033 Wallet — KYC", function () {
    beforeEach(function () {
        resetDEV033State();
    });

    it("loadKYC updates kycInfo state", async function () {
        await useWalletStore.getState().loadKYC();
        var state = useWalletStore.getState();
        expect(state.kycInfo).toBeDefined();
        expect(state.kycInfo.status).toBeDefined();
    });

    it("submitKYC sets kycInfo status to pending", async function () {
        await useWalletStore.getState().submitKYC({ documentType: "passport" });
        var state = useWalletStore.getState();
        expect(state.kycInfo.status).toBe("pending");
    });

    it("kycInfo defaults to not_started", function () {
        var state = useWalletStore.getState();
        expect(state.kycInfo.status).toBe("not_started");
    });
});

// ═══════════════════════════════════════════════════════════════
// CREATOR SETTINGS
// ═══════════════════════════════════════════════════════════════
describe("DEV-033 Wallet — Creator Settings", function () {
    beforeEach(function () {
        resetDEV033State();
    });

    it("loadCreatorSettings populates creatorSettings", async function () {
        await useWalletStore.getState().loadCreatorSettings();
        var state = useWalletStore.getState();
        expect(state.creatorSettings).not.toBeNull();
        expect(state.creatorSettings.payoutMethod).toBeDefined();
    });

    it("creatorSettings has expected fields", async function () {
        await useWalletStore.getState().loadCreatorSettings();
        var settings = useWalletStore.getState().creatorSettings;
        expect(settings.payoutMethod).toBeDefined();
        expect(typeof settings.autoPayoutEnabled).toBe("boolean");
        expect(settings.autoPayoutThreshold).toBeDefined();
        expect(settings.currency).toBeDefined();
    });

    it("updateCreatorSettings modifies partial fields", async function () {
        await useWalletStore.getState().loadCreatorSettings();
        await useWalletStore.getState().updateCreatorSettings({
            payoutMethod: "paypal",
            paypalEmail: "test@example.com",
        });
        var settings = useWalletStore.getState().creatorSettings;
        expect(settings.payoutMethod).toBe("paypal");
        expect(settings.paypalEmail).toBe("test@example.com");
    });

    it("updateCreatorSettings preserves unmodified fields", async function () {
        await useWalletStore.getState().loadCreatorSettings();
        var before = useWalletStore.getState().creatorSettings;
        var beforeCurrency = before.currency;
        await useWalletStore.getState().updateCreatorSettings({
            taxId: "FR99999999",
        });
        var after = useWalletStore.getState().creatorSettings;
        expect(after.taxId).toBe("FR99999999");
        expect(after.currency).toBe(beforeCurrency);
    });
});

// ═══════════════════════════════════════════════════════════════
// TRANSACTION FILTERS
// ═══════════════════════════════════════════════════════════════
describe("DEV-033 Wallet — Transaction Filters", function () {
    beforeEach(function () {
        resetDEV033State();
        // Seed some transactions
        useWalletStore.setState({
            transactions: [
                { id: "t1", type: "earn", amount: 100, status: "completed", description: "Mission", createdAt: "2025-01-01", imucoins: 100 },
                { id: "t2", type: "spend", amount: -50, status: "completed", description: "Achat", createdAt: "2025-01-02", imucoins: -50 },
                { id: "t3", type: "send", amount: -30, status: "completed", description: "Envoi Alice", createdAt: "2025-01-03", imucoins: -30 },
                { id: "t4", type: "topup", amount: 200, status: "completed", description: "Recharge Stripe", createdAt: "2025-01-04", imucoins: 200 },
                { id: "t5", type: "earn", amount: 75, status: "pending", description: "Bonus", createdAt: "2025-01-05", imucoins: 75 },
            ],
        });
    });

    it("setTransactionFilter updates filter state", function () {
        useWalletStore.getState().setTransactionFilter({ type: "earn" });
        var state = useWalletStore.getState();
        expect(state.transactionFilter.type).toBe("earn");
    });

    it("getFilteredTransactions returns all when filter is 'all'", function () {
        useWalletStore.getState().setTransactionFilter({ type: "all" });
        var result = useWalletStore.getState().getFilteredTransactions();
        expect(result.length).toBe(5);
    });

    it("getFilteredTransactions filters by type 'earn'", function () {
        useWalletStore.getState().setTransactionFilter({ type: "earn" });
        var result = useWalletStore.getState().getFilteredTransactions();
        expect(result.length).toBe(2);
        result.forEach(function (tx) {
            expect(tx.type).toBe("earn");
        });
    });

    it("getFilteredTransactions filters by type 'send'", function () {
        useWalletStore.getState().setTransactionFilter({ type: "send" });
        var result = useWalletStore.getState().getFilteredTransactions();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe("t3");
    });

    it("getFilteredTransactions filters by search term", function () {
        useWalletStore.getState().setTransactionFilter({ type: "all", search: "Stripe" });
        var result = useWalletStore.getState().getFilteredTransactions();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe("t4");
    });

    it("getFilteredTransactions combines type and search filters", function () {
        useWalletStore.getState().setTransactionFilter({ type: "earn", search: "Bonus" });
        var result = useWalletStore.getState().getFilteredTransactions();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe("t5");
    });

    it("getFilteredTransactions returns empty when no match", function () {
        useWalletStore.getState().setTransactionFilter({ type: "cashout" });
        var result = useWalletStore.getState().getFilteredTransactions();
        expect(result.length).toBe(0);
    });

    it("setTransactionFilter merges with previous filter", function () {
        useWalletStore.getState().setTransactionFilter({ type: "spend" });
        useWalletStore.getState().setTransactionFilter({ search: "Achat" });
        var state = useWalletStore.getState();
        expect(state.transactionFilter.type).toBe("spend");
        expect(state.transactionFilter.search).toBe("Achat");
    });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION / EDGE CASES
// ═══════════════════════════════════════════════════════════════
describe("DEV-033 Wallet — Edge cases", function () {
    beforeEach(function () {
        resetDEV033State();
    });

    it("requestWithdrawal with 0 amount still creates entry", async function () {
        await useWalletStore.getState().requestWithdrawal(0, "bank_transfer");
        var state = useWalletStore.getState();
        expect(state.withdrawals.length).toBe(1);
    });

    it("updateCreatorSettings without loading first uses default values", async function () {
        await useWalletStore.getState().updateCreatorSettings({
            payoutMethod: "crypto",
        });
        var s = useWalletStore.getState().creatorSettings;
        expect(s).toBeDefined();
        expect(s.payoutMethod).toBe("crypto");
    });

    it("multiple loadWithdrawals calls dont duplicate", async function () {
        await useWalletStore.getState().loadWithdrawals();
        var first = useWalletStore.getState().withdrawals.length;
        await useWalletStore.getState().loadWithdrawals();
        var second = useWalletStore.getState().withdrawals.length;
        expect(second).toBe(first);
    });

    it("multiple loadInvoices calls dont duplicate", async function () {
        await useWalletStore.getState().loadInvoices();
        var first = useWalletStore.getState().invoices.length;
        await useWalletStore.getState().loadInvoices();
        var second = useWalletStore.getState().invoices.length;
        expect(second).toBe(first);
    });
});
