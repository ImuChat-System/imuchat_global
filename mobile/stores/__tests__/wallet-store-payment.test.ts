/**
 * Tests for wallet-store.ts — DEV-028 Payment extensions
 *
 * Tests newly added payment actions: payment methods, topup, subscriptions, IAP.
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

var mockFetchPaymentMethods = jest.fn();
var mockFetchTopupPackages = jest.fn();
var mockCreateCheckoutSession = jest.fn();
var mockGetCheckoutStatus = jest.fn();
var mockRemovePaymentMethod = jest.fn();
var mockSetDefaultPaymentMethod = jest.fn();

jest.mock("@/services/payment-api", function () {
    return {
        fetchPaymentMethods: function () { return mockFetchPaymentMethods.apply(null, arguments); },
        fetchTopupPackages: function () { return mockFetchTopupPackages.apply(null, arguments); },
        createCheckoutSession: function () { return mockCreateCheckoutSession.apply(null, arguments); },
        getCheckoutStatus: function () { return mockGetCheckoutStatus.apply(null, arguments); },
        removePaymentMethod: function () { return mockRemovePaymentMethod.apply(null, arguments); },
        setDefaultPaymentMethod: function () { return mockSetDefaultPaymentMethod.apply(null, arguments); },
        createSetupIntent: jest.fn(),
    };
});

var mockFetchIAPCatalog = jest.fn();
var mockFetchPurchasedItems = jest.fn();
var mockPurchaseItem = jest.fn();
var mockRestorePurchases = jest.fn();

jest.mock("@/services/iap-service", function () {
    return {
        fetchIAPCatalog: function () { return mockFetchIAPCatalog.apply(null, arguments); },
        fetchPurchasedItems: function () { return mockFetchPurchasedItems.apply(null, arguments); },
        purchaseItem: function () { return mockPurchaseItem.apply(null, arguments); },
        restorePurchases: function () { return mockRestorePurchases.apply(null, arguments); },
    };
});

var mockFetchSubscriptionPlans = jest.fn();
var mockFetchCurrentSubscription = jest.fn();
var mockSubscribeToPlan = jest.fn();
var mockCancelSubscription = jest.fn();
var mockResumeSubscription = jest.fn();
var mockChangePlan = jest.fn();

jest.mock("@/services/subscription-api", function () {
    return {
        fetchSubscriptionPlans: function () { return mockFetchSubscriptionPlans.apply(null, arguments); },
        fetchCurrentSubscription: function () { return mockFetchCurrentSubscription.apply(null, arguments); },
        subscribeToPlan: function () { return mockSubscribeToPlan.apply(null, arguments); },
        cancelSubscription: function () { return mockCancelSubscription.apply(null, arguments); },
        resumeSubscription: function () { return mockResumeSubscription.apply(null, arguments); },
        changePlan: function () { return mockChangePlan.apply(null, arguments); },
    };
});

var useWalletStore = require("../wallet-store").useWalletStore;

// --- Helpers ---
function resetPaymentState() {
    useWalletStore.setState({
        paymentMethods: [],
        topupPackages: [],
        currentCheckout: null,
        subscription: null,
        availablePlans: [],
        iapCatalog: [],
        purchasedItems: [],
        paymentLoading: false,
        paymentError: null,
        balance: null,
        transactions: [],
        missions: [],
        isLoading: false,
        error: null,
    });
}

function makeMethod(overrides) {
    return Object.assign(
        {
            id: "pm_1",
            type: "card",
            last4: "4242",
            brand: "visa",
            isDefault: true,
            label: "Visa •••• 4242",
            createdAt: new Date().toISOString(),
        },
        overrides || {},
    );
}

function makePackage(overrides) {
    return Object.assign(
        {
            id: "pkg_500",
            imucoins: 500,
            priceEur: 4.49,
            priceUsd: 4.49,
            priceJpy: 700,
            bonusPercent: 10,
            label: "Popular",
            popular: true,
        },
        overrides || {},
    );
}

function makePlan(overrides) {
    return Object.assign(
        {
            id: "plan_pro",
            tier: "pro",
            name: "ImuChat Pro",
            description: "Premium",
            features: ["Unlimited"],
            priceMonthlyEur: 4.99,
            priceYearlyEur: 47.88,
            priceMonthlyUsd: 4.99,
            priceYearlyUsd: 47.88,
            priceMonthlyJpy: 750,
            priceYearlyJpy: 7200,
            trialDays: 7,
            popular: true,
        },
        overrides || {},
    );
}

function makeSub(overrides) {
    return Object.assign(
        {
            id: "sub_1",
            planId: "plan_pro",
            tier: "pro",
            status: "active",
            interval: "month",
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
        },
        overrides || {},
    );
}

function makeReceipt(overrides) {
    return Object.assign(
        {
            id: "rcpt_1",
            itemId: "iap_1",
            productId: "com.imuchat.theme",
            transactionId: "txn_1",
            platform: "ios",
            purchasedAt: new Date().toISOString(),
            isActive: true,
        },
        overrides || {},
    );
}

// --- Tests ---
describe("useWalletStore — payment extensions", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        resetPaymentState();
    });

    // ── Payment state ──
    describe("initial payment state", function () {
        it("should have empty payment state", function () {
            var state = useWalletStore.getState();
            expect(state.paymentMethods).toEqual([]);
            expect(state.topupPackages).toEqual([]);
            expect(state.currentCheckout).toBeNull();
            expect(state.subscription).toBeNull();
            expect(state.availablePlans).toEqual([]);
            expect(state.iapCatalog).toEqual([]);
            expect(state.purchasedItems).toEqual([]);
            expect(state.paymentLoading).toBe(false);
            expect(state.paymentError).toBeNull();
        });
    });

    // ── loadPaymentMethods ──
    describe("loadPaymentMethods", function () {
        it("should load methods and set state", async function () {
            var methods = [makeMethod(), makeMethod({ id: "pm_2", isDefault: false })];
            mockFetchPaymentMethods.mockResolvedValue(methods);

            await useWalletStore.getState().loadPaymentMethods();

            var state = useWalletStore.getState();
            expect(state.paymentMethods).toHaveLength(2);
            expect(state.paymentLoading).toBe(false);
        });

        it("should set error on failure", async function () {
            mockFetchPaymentMethods.mockRejectedValue(new Error("network"));

            await useWalletStore.getState().loadPaymentMethods();

            expect(useWalletStore.getState().paymentError).toBeTruthy();
        });
    });

    // ── removeMethod ──
    describe("removeMethod", function () {
        it("should remove method on success", async function () {
            useWalletStore.setState({ paymentMethods: [makeMethod()] });
            mockRemovePaymentMethod.mockResolvedValue(true);

            await useWalletStore.getState().removeMethod("pm_1");

            expect(useWalletStore.getState().paymentMethods).toHaveLength(0);
        });

        it("should not remove on failure", async function () {
            useWalletStore.setState({ paymentMethods: [makeMethod()] });
            mockRemovePaymentMethod.mockResolvedValue(false);

            await useWalletStore.getState().removeMethod("pm_1");

            expect(useWalletStore.getState().paymentMethods).toHaveLength(1);
        });
    });

    // ── setDefaultMethod ──
    describe("setDefaultMethod", function () {
        it("should set new default", async function () {
            var methods = [
                makeMethod({ id: "pm_1", isDefault: true }),
                makeMethod({ id: "pm_2", isDefault: false }),
            ];
            useWalletStore.setState({ paymentMethods: methods });
            mockSetDefaultPaymentMethod.mockResolvedValue(true);

            await useWalletStore.getState().setDefaultMethod("pm_2");

            var state = useWalletStore.getState();
            var pm1 = state.paymentMethods.find(function (m) { return m.id === "pm_1"; });
            var pm2 = state.paymentMethods.find(function (m) { return m.id === "pm_2"; });
            expect(pm1.isDefault).toBe(false);
            expect(pm2.isDefault).toBe(true);
        });
    });

    // ── loadTopupPackages ──
    describe("loadTopupPackages", function () {
        it("should load packages", async function () {
            var pkgs = [makePackage(), makePackage({ id: "pkg_100" })];
            mockFetchTopupPackages.mockResolvedValue(pkgs);

            await useWalletStore.getState().loadTopupPackages();

            expect(useWalletStore.getState().topupPackages).toHaveLength(2);
        });
    });

    // ── startTopup ──
    describe("startTopup", function () {
        it("should create checkout and set state", async function () {
            var session = {
                id: "cs_1",
                url: "https://checkout.stripe.com/1",
                status: "pending",
                packageId: "pkg_500",
                amount: 4.49,
                currency: "EUR",
                createdAt: new Date().toISOString(),
                expiresAt: new Date().toISOString(),
            };
            mockCreateCheckoutSession.mockResolvedValue(session);

            var result = await useWalletStore.getState().startTopup("pkg_500", "EUR");

            expect(result).toBeTruthy();
            expect(result.url).toContain("stripe.com");
            expect(useWalletStore.getState().currentCheckout).toBeTruthy();
        });

        it("should handle failure", async function () {
            mockCreateCheckoutSession.mockResolvedValue(null);

            var result = await useWalletStore.getState().startTopup("pkg_500", "EUR");

            expect(result).toBeNull();
        });
    });

    // ── loadSubscription ──
    describe("loadSubscription", function () {
        it("should load current subscription", async function () {
            var sub = makeSub();
            mockFetchCurrentSubscription.mockResolvedValue(sub);

            await useWalletStore.getState().loadSubscription();

            expect(useWalletStore.getState().subscription).toBeTruthy();
            expect(useWalletStore.getState().subscription.tier).toBe("pro");
        });

        it("should set null on failure", async function () {
            mockFetchCurrentSubscription.mockResolvedValue(null);

            await useWalletStore.getState().loadSubscription();

            expect(useWalletStore.getState().subscription).toBeNull();
        });
    });

    // ── loadPlans ──
    describe("loadPlans", function () {
        it("should load plans", async function () {
            var plans = [makePlan({ tier: "free" }), makePlan({ tier: "pro" }), makePlan({ tier: "premium" })];
            mockFetchSubscriptionPlans.mockResolvedValue(plans);

            await useWalletStore.getState().loadPlans();

            expect(useWalletStore.getState().availablePlans).toHaveLength(3);
        });
    });

    // ── subscribe ──
    describe("subscribe", function () {
        it("should return checkout URL", async function () {
            mockSubscribeToPlan.mockResolvedValue({ url: "https://checkout.stripe.com/sub", subscriptionId: "sub_1" });

            var url = await useWalletStore.getState().subscribe("plan_pro", "month", "EUR");

            expect(url).toContain("stripe.com");
        });

        it("should return null on failure", async function () {
            mockSubscribeToPlan.mockResolvedValue(null);

            var url = await useWalletStore.getState().subscribe("plan_pro", "month", "EUR");

            expect(url).toBeNull();
        });
    });

    // ── cancelSub ──
    describe("cancelSub", function () {
        it("should set cancelAtPeriodEnd on success", async function () {
            useWalletStore.setState({ subscription: makeSub() });
            mockCancelSubscription.mockResolvedValue(true);

            await useWalletStore.getState().cancelSub();

            expect(useWalletStore.getState().subscription.cancelAtPeriodEnd).toBe(true);
        });

        it("should not modify on failure", async function () {
            useWalletStore.setState({ subscription: makeSub({ cancelAtPeriodEnd: false }) });
            mockCancelSubscription.mockResolvedValue(false);

            await useWalletStore.getState().cancelSub();

            expect(useWalletStore.getState().subscription.cancelAtPeriodEnd).toBe(false);
        });
    });

    // ── resumeSub ──
    describe("resumeSub", function () {
        it("should clear cancelAtPeriodEnd on success", async function () {
            useWalletStore.setState({ subscription: makeSub({ cancelAtPeriodEnd: true }) });
            mockResumeSubscription.mockResolvedValue(true);

            await useWalletStore.getState().resumeSub();

            expect(useWalletStore.getState().subscription.cancelAtPeriodEnd).toBe(false);
        });
    });

    // ── loadIAPCatalog ──
    describe("loadIAPCatalog", function () {
        it("should load catalog", async function () {
            var items = [
                { id: "iap_1", name: "Theme1", category: "theme" },
                { id: "iap_2", name: "Theme2", category: "theme" },
            ];
            mockFetchIAPCatalog.mockResolvedValue(items);

            await useWalletStore.getState().loadIAPCatalog();

            expect(useWalletStore.getState().iapCatalog).toHaveLength(2);
        });
    });

    // ── loadPurchases ──
    describe("loadPurchases", function () {
        it("should load purchased items", async function () {
            var receipts = [makeReceipt()];
            mockFetchPurchasedItems.mockResolvedValue(receipts);

            await useWalletStore.getState().loadPurchases();

            expect(useWalletStore.getState().purchasedItems).toHaveLength(1);
        });
    });

    // ── purchase ──
    describe("purchase", function () {
        it("should add receipt on success", async function () {
            var receipt = makeReceipt();
            mockPurchaseItem.mockResolvedValue(receipt);

            await useWalletStore.getState().purchase("iap_1");

            expect(useWalletStore.getState().purchasedItems).toHaveLength(1);
        });

        it("should set error on failure", async function () {
            mockPurchaseItem.mockRejectedValue(new Error("purchase failed"));

            await useWalletStore.getState().purchase("iap_1");

            expect(useWalletStore.getState().paymentError).toBeTruthy();
        });
    });

    // ── restoreAllPurchases ──
    describe("restoreAllPurchases", function () {
        it("should replace purchased items", async function () {
            var receipts = [makeReceipt(), makeReceipt({ id: "rcpt_2", itemId: "iap_2" })];
            mockRestorePurchases.mockResolvedValue(receipts);

            await useWalletStore.getState().restoreAllPurchases();

            expect(useWalletStore.getState().purchasedItems).toHaveLength(2);
        });
    });

    // ── isItemOwned ──
    describe("isItemOwned", function () {
        it("returns true when item is purchased", function () {
            useWalletStore.setState({
                purchasedItems: [makeReceipt({ itemId: "iap_1", isActive: true })],
            });

            expect(useWalletStore.getState().isItemOwned("iap_1")).toBe(true);
        });

        it("returns false when item is not purchased", function () {
            useWalletStore.setState({ purchasedItems: [] });

            expect(useWalletStore.getState().isItemOwned("iap_1")).toBe(false);
        });
    });

    // ── clearPaymentError ──
    describe("clearPaymentError", function () {
        it("should clear error", function () {
            useWalletStore.setState({ paymentError: "Some error" });

            useWalletStore.getState().clearPaymentError();

            expect(useWalletStore.getState().paymentError).toBeNull();
        });
    });
});
