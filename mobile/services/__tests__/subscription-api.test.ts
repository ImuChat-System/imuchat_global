/**
 * Tests for services/subscription-api.ts — DEV-028
 *
 * CRITICAL: NO TypeScript syntax in test files.
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
                    in: function () { return chain; },
                    order: function () { return chain; },
                    limit: function () { return chain; },
                    maybeSingle: function () {
                        return Promise.resolve({ data: mockFromData, error: mockFromError });
                    },
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
var subApi = require("@/services/subscription-api");
var fetchSubscriptionPlans = subApi.fetchSubscriptionPlans;
var getPlanByTier = subApi.getPlanByTier;
var fetchCurrentSubscription = subApi.fetchCurrentSubscription;
var subscribeToPlan = subApi.subscribeToPlan;
var cancelSubscription = subApi.cancelSubscription;
var resumeSubscription = subApi.resumeSubscription;
var changePlan = subApi.changePlan;
var getPlanPrice = subApi.getPlanPrice;
var getYearlySavings = subApi.getYearlySavings;
var isSubscriptionActive = subApi.isSubscriptionActive;
var isInTrial = subApi.isInTrial;
var getDaysRemaining = subApi.getDaysRemaining;

// --- Helpers ---
function makePlan(overrides) {
    return Object.assign(
        {
            id: "plan_pro",
            tier: "pro",
            name: "ImuChat Pro",
            description: "Unlock premium features",
            features: ["Unlimited groups", "500 IMC/mo"],
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
    var now = new Date();
    var end = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    return Object.assign(
        {
            id: "sub_1",
            planId: "plan_pro",
            tier: "pro",
            status: "active",
            interval: "month",
            currentPeriodStart: now.toISOString(),
            currentPeriodEnd: end.toISOString(),
            cancelAtPeriodEnd: false,
        },
        overrides || {},
    );
}

// --- Tests ---
describe("subscription-api", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: { id: "user_1" } } });
        mockFromData = null;
        mockFromError = null;
    });

    // ── getPlanPrice ──
    describe("getPlanPrice", function () {
        it("returns monthly EUR by default", function () {
            var plan = makePlan();
            expect(getPlanPrice(plan, "month", "EUR")).toBe(4.99);
        });

        it("returns yearly EUR", function () {
            var plan = makePlan();
            expect(getPlanPrice(plan, "year", "EUR")).toBe(47.88);
        });

        it("returns monthly USD", function () {
            var plan = makePlan();
            expect(getPlanPrice(plan, "month", "USD")).toBe(4.99);
        });

        it("returns yearly JPY", function () {
            var plan = makePlan();
            expect(getPlanPrice(plan, "year", "JPY")).toBe(7200);
        });
    });

    // ── getYearlySavings ──
    describe("getYearlySavings", function () {
        it("calculates savings correctly", function () {
            var plan = makePlan();
            var savings = getYearlySavings(plan, "EUR");
            // 4.99 * 12 = 59.88 - 47.88 = 12.00
            expect(savings).toBeCloseTo(12.0, 1);
        });

        it("returns 0 when yearly >= monthly * 12", function () {
            var plan = makePlan({ priceYearlyEur: 100 });
            expect(getYearlySavings(plan, "EUR")).toBe(0);
        });
    });

    // ── isSubscriptionActive ──
    describe("isSubscriptionActive", function () {
        it("returns true for active", function () {
            expect(isSubscriptionActive(makeSub({ status: "active" }))).toBe(true);
        });

        it("returns true for trialing", function () {
            expect(isSubscriptionActive(makeSub({ status: "trialing" }))).toBe(true);
        });

        it("returns false for canceled", function () {
            expect(isSubscriptionActive(makeSub({ status: "canceled" }))).toBe(false);
        });

        it("returns false for null", function () {
            expect(isSubscriptionActive(null)).toBe(false);
        });
    });

    // ── isInTrial ──
    describe("isInTrial", function () {
        it("returns true when trialing", function () {
            expect(isInTrial(makeSub({ status: "trialing" }))).toBe(true);
        });

        it("returns false when active", function () {
            expect(isInTrial(makeSub({ status: "active" }))).toBe(false);
        });

        it("returns false for null", function () {
            expect(isInTrial(null)).toBe(false);
        });
    });

    // ── getDaysRemaining ──
    describe("getDaysRemaining", function () {
        it("returns days until period end", function () {
            var sub = makeSub();
            var days = getDaysRemaining(sub);
            expect(days).toBeGreaterThanOrEqual(14);
            expect(days).toBeLessThanOrEqual(16);
        });

        it("returns 0 for expired period", function () {
            var past = new Date(Date.now() - 1000).toISOString();
            var sub = makeSub({ currentPeriodEnd: past });
            expect(getDaysRemaining(sub)).toBe(0);
        });

        it("returns 0 for null", function () {
            expect(getDaysRemaining(null)).toBe(0);
        });
    });

    // ── getPlanByTier ──
    describe("getPlanByTier", function () {
        it("finds plan by tier", function () {
            var plans = [makePlan({ tier: "free" }), makePlan({ tier: "pro" })];
            var found = getPlanByTier("pro", plans);
            expect(found).toBeDefined();
            expect(found.tier).toBe("pro");
        });

        it("returns undefined if not found", function () {
            var plans = [makePlan({ tier: "free" })];
            expect(getPlanByTier("premium", plans)).toBeUndefined();
        });
    });

    // ── fetchSubscriptionPlans ──
    describe("fetchSubscriptionPlans", function () {
        it("returns server plans on success", async function () {
            mockFromData = [
                { id: "p1", tier: "free", name: "Free", features: [], price_monthly_eur: 0, price_yearly_eur: 0, price_monthly_usd: 0, price_yearly_usd: 0, price_monthly_jpy: 0, price_yearly_jpy: 0 },
                { id: "p2", tier: "pro", name: "Pro", features: ["a", "b"], price_monthly_eur: 4.99, price_yearly_eur: 47.88, price_monthly_usd: 4.99, price_yearly_usd: 47.88, price_monthly_jpy: 750, price_yearly_jpy: 7200 },
            ];

            var result = await fetchSubscriptionPlans();
            expect(result.length).toBeGreaterThanOrEqual(2);
        });

        it("returns default plans on error", async function () {
            mockFromError = { message: "fail" };

            var result = await fetchSubscriptionPlans();
            expect(result.length).toBeGreaterThanOrEqual(3);
        });
    });

    // ── fetchCurrentSubscription ──
    describe("fetchCurrentSubscription", function () {
        it("returns subscription on success", async function () {
            mockFromData = {
                id: "sub_1",
                plan_id: "plan_pro",
                tier: "pro",
                status: "active",
                interval: "month",
                current_period_start: new Date().toISOString(),
                current_period_end: new Date().toISOString(),
                cancel_at_period_end: false,
            };

            var result = await fetchCurrentSubscription();
            expect(result).not.toBeNull();
            expect(result.tier).toBe("pro");
        });

        it("returns null on error", async function () {
            mockFromError = { message: "fail" };

            var result = await fetchCurrentSubscription();
            expect(result).toBeNull();
        });
    });

    // ── subscribeToPlan ──
    describe("subscribeToPlan", function () {
        it("returns checkout URL on success", async function () {
            mockInvoke.mockResolvedValue({
                data: { url: "https://checkout.stripe.com/sub_1", subscriptionId: "sub_1" },
                error: null,
            });

            var result = await subscribeToPlan("plan_pro", "month", "EUR");
            expect(result).not.toBeNull();
            expect(result.url).toContain("stripe.com");
        });

        it("returns null on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await subscribeToPlan("plan_pro", "month", "EUR");
            expect(result).toBeNull();
        });
    });

    // ── cancelSubscription ──
    describe("cancelSubscription", function () {
        it("returns true on success", async function () {
            mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

            var result = await cancelSubscription();
            expect(result).toBe(true);
        });

        it("returns false on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await cancelSubscription();
            expect(result).toBe(false);
        });
    });

    // ── resumeSubscription ──
    describe("resumeSubscription", function () {
        it("returns true on success", async function () {
            mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

            var result = await resumeSubscription();
            expect(result).toBe(true);
        });

        it("returns false on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await resumeSubscription();
            expect(result).toBe(false);
        });
    });

    // ── changePlan ──
    describe("changePlan", function () {
        it("returns true on success", async function () {
            mockInvoke.mockResolvedValue({
                data: { success: true },
                error: null,
            });

            var result = await changePlan("plan_premium", "month");
            expect(result).toBe(true);
        });

        it("returns false on error", async function () {
            mockInvoke.mockResolvedValue({ data: null, error: { message: "fail" } });

            var result = await changePlan("plan_premium", "month");
            expect(result).toBe(false);
        });
    });
});
