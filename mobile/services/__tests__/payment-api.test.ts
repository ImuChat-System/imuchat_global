/**
 * Tests for services/payment-api.ts — DEV-028
 *
 * CRITICAL: NO TypeScript syntax in test files.
 * No `: Type`, `as const`, `as any`, `!` (non-null assertion).
 * Use `var` for reassigned variables.
 */

// --- Mocks ---
jest.mock("@/services/logger", function () {
    return {
        createLogger: jest.fn().mockReturnValue({
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        }),
    };
});

var mockInvoke = jest.fn();
var mockGetUser = jest.fn();
var mockFromData = null;
var mockFromError = null;

jest.mock("@/services/supabase", function () {
    return {
        supabase: {
            functions: {
                invoke: function () { return mockInvoke.apply(null, arguments); },
            },
            auth: {
                getUser: function () { return mockGetUser(); },
            },
            from: function () {
                var chain = {
                    select: function () { return chain; },
                    eq: function () { return chain; },
                    order: function () { return chain; },
                    then: function (resolve, reject) {
                        return Promise.resolve({ data: mockFromData, error: mockFromError }).then(resolve, reject);
                    },
                };
                return chain;
            },
        },
    };
});

// Importing functions after mocks
var paymentApi = require("@/services/payment-api");
var fetchTopupPackages = paymentApi.fetchTopupPackages;
var createCheckoutSession = paymentApi.createCheckoutSession;
var getCheckoutStatus = paymentApi.getCheckoutStatus;
var fetchPaymentMethods = paymentApi.fetchPaymentMethods;
var createSetupIntent = paymentApi.createSetupIntent;
var removePaymentMethod = paymentApi.removePaymentMethod;
var setDefaultPaymentMethod = paymentApi.setDefaultPaymentMethod;
var requestCashout = paymentApi.requestCashout;
var getPackagePrice = paymentApi.getPackagePrice;
var formatPrice = paymentApi.formatPrice;

// --- Helpers ---
function makePkg(overrides) {
    return Object.assign(
        {
            id: "pkg_100",
            imucoins: 100,
            priceEur: 0.99,
            priceUsd: 1.09,
            priceJpy: 150,
            bonusPercent: 0,
            label: "Starter",
        },
        overrides || {},
    );
}

// --- Tests ---
describe("payment-api", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: { id: "user_1" } } });
        mockFromData = null;
        mockFromError = null;
    });

    // ── getPackagePrice ──
    describe("getPackagePrice", function () {
        it("returns EUR price by default", function () {
            var pkg = makePkg();
            expect(getPackagePrice(pkg, "EUR")).toBe(0.99);
        });

        it("returns USD price", function () {
            var pkg = makePkg();
            expect(getPackagePrice(pkg, "USD")).toBe(1.09);
        });

        it("returns JPY price", function () {
            var pkg = makePkg();
            expect(getPackagePrice(pkg, "JPY")).toBe(150);
        });
    });

    // ── formatPrice ──
    describe("formatPrice", function () {
        it("formats EUR", function () {
            expect(formatPrice(4.49, "EUR")).toBe("4.49€");
        });

        it("formats USD", function () {
            expect(formatPrice(4.49, "USD")).toBe("4.49$");
        });

        it("formats JPY as integer", function () {
            expect(formatPrice(700, "JPY")).toBe("¥700");
        });

        it("formats IMC", function () {
            var result = formatPrice(100, "IMC");
            expect(result).toContain("100");
        });
    });

    // ── fetchTopupPackages ──
    describe("fetchTopupPackages", function () {
        it("returns server packages on success", async function () {
            mockFromData = [
                { id: "srv_1", imucoins: 100, price_eur: 0.99, price_usd: 1.09, price_jpy: 150, bonus_percent: 0, label: "Test1", popular: false },
                { id: "srv_2", imucoins: 200, price_eur: 1.99, price_usd: 2.09, price_jpy: 300, bonus_percent: 5, label: "Test2", popular: false },
            ];

            var result = await fetchTopupPackages();
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("srv_1");
        });

        it("returns default packages on error", async function () {
            mockFromError = { message: "fail" };

            var result = await fetchTopupPackages();
            expect(result.length).toBeGreaterThanOrEqual(5);
            expect(result[0].id).toBe("pkg_100");
        });

        it("returns default packages on exception", async function () {
            mockInvoke.mockRejectedValue(new Error("network"));

            var result = await fetchTopupPackages();
            expect(result.length).toBeGreaterThanOrEqual(5);
        });
    });

    // ── createCheckoutSession ──
    describe("createCheckoutSession", function () {
        it("returns session on success", async function () {
            mockInvoke.mockResolvedValue({
                data: {
                    id: "cs_1",
                    url: "https://checkout.stripe.com/1",
                    status: "pending",
                    packageId: "pkg_500",
                    amount: 4.49,
                    currency: "EUR",
                },
                error: null,
            });

            var result = await createCheckoutSession("pkg_500", "EUR");
            expect(result).not.toBeNull();
            expect(result.id).toBe("cs_1");
            expect(result.url).toContain("stripe.com");
        });

        it("returns null on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await createCheckoutSession("pkg_500", "EUR");
            expect(result).toBeNull();
        });
    });

    // ── getCheckoutStatus ──
    describe("getCheckoutStatus", function () {
        it("returns status on success", async function () {
            mockInvoke.mockResolvedValue({
                data: { status: "completed" },
                error: null,
            });

            var result = await getCheckoutStatus("cs_1");
            expect(result).toBe("completed");
        });

        it("returns null on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await getCheckoutStatus("cs_1");
            expect(result).toBeNull();
        });
    });

    // ── fetchPaymentMethods ──
    describe("fetchPaymentMethods", function () {
        it("returns methods on success", async function () {
            mockInvoke.mockResolvedValue({
                data: {
                    methods: [
                        { id: "pm_1", type: "card", last4: "4242", brand: "visa", isDefault: true },
                    ],
                },
                error: null,
            });

            var result = await fetchPaymentMethods();
            expect(result).toHaveLength(1);
            expect(result[0].last4).toBe("4242");
        });

        it("returns empty array on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await fetchPaymentMethods();
            expect(result).toEqual([]);
        });
    });

    // ── createSetupIntent ──
    describe("createSetupIntent", function () {
        it("returns client secret on success", async function () {
            mockInvoke.mockResolvedValue({
                data: { clientSecret: "seti_secret_abc" },
                error: null,
            });

            var result = await createSetupIntent();
            expect(result).not.toBeNull();
            expect(result.clientSecret).toBe("seti_secret_abc");
        });

        it("returns null on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await createSetupIntent();
            expect(result).toBeNull();
        });
    });

    // ── removePaymentMethod ──
    describe("removePaymentMethod", function () {
        it("returns true on success", async function () {
            mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

            var result = await removePaymentMethod("pm_1");
            expect(result).toBe(true);
        });

        it("returns false on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await removePaymentMethod("pm_1");
            expect(result).toBe(false);
        });
    });

    // ── setDefaultPaymentMethod ──
    describe("setDefaultPaymentMethod", function () {
        it("returns true on success", async function () {
            mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

            var result = await setDefaultPaymentMethod("pm_1");
            expect(result).toBe(true);
        });

        it("returns false on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await setDefaultPaymentMethod("pm_1");
            expect(result).toBe(false);
        });
    });

    // ── requestCashout ──
    describe("requestCashout", function () {
        it("returns transaction id on success", async function () {
            mockInvoke.mockResolvedValue({
                data: { transactionId: "co_1" },
                error: null,
            });

            var result = await requestCashout(1000, "EUR");
            expect(result).not.toBeNull();
            expect(result.transactionId).toBe("co_1");
        });

        it("returns null on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await requestCashout(1000, "EUR");
            expect(result).toBeNull();
        });
    });
});
