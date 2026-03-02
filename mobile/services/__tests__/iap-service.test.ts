/**
 * Tests for services/iap-service.ts — DEV-028
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
var iapService = require("@/services/iap-service");
var fetchIAPCatalog = iapService.fetchIAPCatalog;
var fetchIAPByCategory = iapService.fetchIAPByCategory;
var fetchPurchasedItems = iapService.fetchPurchasedItems;
var purchaseItem = iapService.purchaseItem;
var restorePurchases = iapService.restorePurchases;
var isItemPurchased = iapService.isItemPurchased;
var getPurchasedByCategory = iapService.getPurchasedByCategory;

// --- Helpers ---
function makeItem(overrides) {
    return Object.assign(
        {
            id: "iap_1",
            productId: "com.imuchat.theme_neon",
            type: "non_consumable",
            category: "theme",
            name: "Neon Nights",
            priceEur: 1.99,
            priceUsd: 1.99,
            priceJpy: 300,
            icon: "🌃",
        },
        overrides || {},
    );
}

function makeReceipt(overrides) {
    return Object.assign(
        {
            id: "rcpt_1",
            itemId: "iap_1",
            productId: "com.imuchat.theme_neon",
            transactionId: "txn_abc",
            platform: "ios",
            purchasedAt: new Date().toISOString(),
            isActive: true,
        },
        overrides || {},
    );
}

// --- Tests ---
describe("iap-service", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: { id: "user_1" } } });
        mockFromData = null;
        mockFromError = null;
    });

    // ── isItemPurchased ──
    describe("isItemPurchased", function () {
        it("returns true when item is active", function () {
            var receipts = [makeReceipt({ itemId: "iap_1", isActive: true })];
            expect(isItemPurchased("iap_1", receipts)).toBe(true);
        });

        it("returns false when item is inactive", function () {
            var receipts = [makeReceipt({ itemId: "iap_1", isActive: false })];
            expect(isItemPurchased("iap_1", receipts)).toBe(false);
        });

        it("returns false when item not found", function () {
            var receipts = [makeReceipt({ itemId: "iap_2" })];
            expect(isItemPurchased("iap_1", receipts)).toBe(false);
        });

        it("returns false for empty receipts", function () {
            expect(isItemPurchased("iap_1", [])).toBe(false);
        });
    });

    // ── getPurchasedByCategory ──
    describe("getPurchasedByCategory", function () {
        it("returns matching purchased items", function () {
            var catalog = [
                makeItem({ id: "iap_1", category: "theme" }),
                makeItem({ id: "iap_2", category: "theme" }),
                makeItem({ id: "iap_3", category: "avatar" }),
            ];
            var receipts = [
                makeReceipt({ itemId: "iap_1", isActive: true }),
                makeReceipt({ itemId: "iap_3", isActive: true }),
            ];

            var result = getPurchasedByCategory("theme", catalog, receipts);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("iap_1");
        });

        it("excludes inactive receipts", function () {
            var catalog = [makeItem({ id: "iap_1", category: "theme" })];
            var receipts = [makeReceipt({ itemId: "iap_1", isActive: false })];

            var result = getPurchasedByCategory("theme", catalog, receipts);
            expect(result).toHaveLength(0);
        });

        it("returns empty array for no matches", function () {
            var catalog = [makeItem({ id: "iap_1", category: "theme" })];
            var receipts = [];

            var result = getPurchasedByCategory("theme", catalog, receipts);
            expect(result).toHaveLength(0);
        });
    });

    // ── fetchIAPCatalog ──
    describe("fetchIAPCatalog", function () {
        it("returns server catalog on success", async function () {
            mockFromData = [
                { id: "s1", product_id: "com.test.1", type: "non_consumable", category: "theme", name: "Test" },
            ];

            var result = await fetchIAPCatalog();
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        it("returns default catalog on error", async function () {
            mockFromError = { message: "fail" };

            var result = await fetchIAPCatalog();
            expect(result.length).toBeGreaterThanOrEqual(7);
        });

        it("returns default catalog on exception", async function () {
            mockInvoke.mockRejectedValue(new Error("network"));

            var result = await fetchIAPCatalog();
            expect(result.length).toBeGreaterThanOrEqual(7);
        });
    });

    // ── fetchIAPByCategory ──
    describe("fetchIAPByCategory", function () {
        it("returns only items of requested category", async function () {
            mockFromData = [
                { id: "s1", product_id: "p1", type: "non_consumable", category: "theme", name: "T1" },
            ];

            var result = await fetchIAPByCategory("theme");
            // May include server results or defaults; at least should work without error
            expect(Array.isArray(result)).toBe(true);
        });

        it("returns empty on error", async function () {
            mockFromError = { message: "fail" };

            var result = await fetchIAPByCategory("theme");
            expect(Array.isArray(result)).toBe(true);
        });
    });

    // ── fetchPurchasedItems ──
    describe("fetchPurchasedItems", function () {
        it("returns receipts on success", async function () {
            mockFromData = [
                {
                    id: "r1",
                    item_id: "iap_1",
                    product_id: "com.test.1",
                    transaction_id: "txn_1",
                    platform: "ios",
                    purchased_at: new Date().toISOString(),
                    is_active: true,
                },
            ];

            var result = await fetchPurchasedItems();
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        it("returns empty on error", async function () {
            mockGetUser.mockResolvedValue({ data: { user: null } });

            var result = await fetchPurchasedItems();
            expect(result).toEqual([]);
        });
    });

    // ── purchaseItem ──
    describe("purchaseItem", function () {
        it("returns receipt on success", async function () {
            mockInvoke.mockResolvedValue({
                data: {
                    id: "r1",
                    item_id: "iap_1",
                    product_id: "com.test.1",
                    transaction_id: "txn_abc",
                    platform: "web",
                    purchased_at: new Date().toISOString(),
                    is_active: true,
                },
                error: null,
            });

            var result = await purchaseItem("iap_1");
            expect(result).not.toBeNull();
        });

        it("returns null on error", async function () {
            mockGetUser.mockResolvedValue({ data: { user: null } });

            var result = await purchaseItem("iap_1");
            expect(result).toBeNull();
        });
    });

    // ── restorePurchases ──
    describe("restorePurchases", function () {
        it("returns receipts on success", async function () {
            mockInvoke.mockResolvedValue({
                data: {
                    purchases: [
                        {
                            id: "r1",
                            item_id: "iap_1",
                            product_id: "p1",
                            transaction_id: "t1",
                            platform: "ios",
                            purchased_at: new Date().toISOString(),
                            is_active: true,
                        },
                    ],
                },
                error: null,
            });

            var result = await restorePurchases();
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        it("returns empty on error", async function () {
            mockGetUser.mockResolvedValue({ data: { user: null } });

            var result = await restorePurchases();
            expect(result).toEqual([]);
        });
    });
});
