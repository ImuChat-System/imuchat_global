/**
 * Tests for stores/modules-store.ts — Review & Recommendation actions
 * Zustand store tested via getState()/setState() (no TS syntax — Babel constraint)
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

jest.mock("@/services/modules-api", () => ({
    fetchModuleCatalog: jest.fn(),
    fetchUserModules: jest.fn(),
    autoInstallDefaultModules: jest.fn(),
    installModule: jest.fn(),
    uninstallModule: jest.fn(),
    setModuleActive: jest.fn(),
    searchModules: jest.fn(),
    fetchModuleReviews: jest.fn(),
    fetchUserReview: jest.fn(),
    submitReview: jest.fn(),
    deleteReview: jest.fn(),
    fetchReviewStats: jest.fn(),
    fetchTrendingModules: jest.fn(),
    fetchTopRatedModules: jest.fn(),
    fetchNewReleases: jest.fn(),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

import {
    deleteReview,
    fetchModuleReviews,
    fetchNewReleases,
    fetchReviewStats,
    fetchTopRatedModules,
    fetchTrendingModules,
    fetchUserReview,
    submitReview,
} from "@/services/modules-api";
import { useModulesStore } from "../modules-store";

// --- Helpers ---
function makeReview(overrides) {
    return {
        id: "rev-1",
        module_id: "mod-1",
        user_id: "user-1",
        rating: 4,
        comment: "Nice module",
        created_at: "2026-01-15T10:00:00Z",
        ...overrides,
    };
}

function makeStats(overrides) {
    return {
        averageRating: 4.0,
        totalReviews: 3,
        distribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 },
        ...overrides,
    };
}

function makeModule(overrides) {
    return {
        id: "mod-1",
        name: "Test Module",
        version: "1.0.0",
        category: "social",
        is_published: true,
        is_core: false,
        rating: 4.5,
        download_count: 100,
        ...overrides,
    };
}

// --- Tests ---
describe("useModulesStore reviews", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useModulesStore.getState().reset();
    });

    // ── initial review state ──
    describe("initial review state", () => {
        it("should have empty reviews state", () => {
            var state = useModulesStore.getState();
            expect(state.reviews).toEqual({});
            expect(state.reviewStats).toEqual({});
            expect(state.userReviews).toEqual({});
            expect(state.reviewsLoading).toBe(false);
        });
    });

    // ── loadReviews ──
    describe("loadReviews", () => {
        it("should load reviews and stats for a module", async () => {
            var reviews = [makeReview(), makeReview({ id: "rev-2", rating: 5 })];
            var stats = makeStats({ totalReviews: 2 });
            fetchModuleReviews.mockResolvedValue(reviews);
            fetchReviewStats.mockResolvedValue(stats);

            await useModulesStore.getState().loadReviews("mod-1");

            var state = useModulesStore.getState();
            expect(state.reviews["mod-1"]).toEqual(reviews);
            expect(state.reviewStats["mod-1"]).toEqual(stats);
            expect(state.reviewsLoading).toBe(false);
        });

        it("should handle errors gracefully", async () => {
            fetchModuleReviews.mockRejectedValue(new Error("Network error"));
            fetchReviewStats.mockRejectedValue(new Error("Network error"));

            await useModulesStore.getState().loadReviews("mod-1");

            var state = useModulesStore.getState();
            expect(state.reviewsLoading).toBe(false);
        });
    });

    // ── loadUserReview ──
    describe("loadUserReview", () => {
        it("should load current user review", async () => {
            var review = makeReview();
            fetchUserReview.mockResolvedValue(review);

            await useModulesStore.getState().loadUserReview("mod-1");

            var state = useModulesStore.getState();
            expect(state.userReviews["mod-1"]).toEqual(review);
        });

        it("should handle null (no review)", async () => {
            fetchUserReview.mockResolvedValue(null);

            await useModulesStore.getState().loadUserReview("mod-1");

            var state = useModulesStore.getState();
            expect(state.userReviews["mod-1"]).toBeNull();
        });
    });

    // ── submitReview ──
    describe("submitReview", () => {
        it("should add review and update state", async () => {
            var review = makeReview({ rating: 5, comment: "Excellent!" });
            var stats = makeStats({ averageRating: 5.0, totalReviews: 1 });
            submitReview.mockResolvedValue(review);
            fetchReviewStats.mockResolvedValue(stats);

            await useModulesStore.getState().submitReview("mod-1", 5, "Excellent!");

            var state = useModulesStore.getState();
            expect(state.reviews["mod-1"]).toContainEqual(review);
            expect(state.userReviews["mod-1"]).toEqual(review);
            expect(state.reviewStats["mod-1"]).toEqual(stats);
            expect(submitReview).toHaveBeenCalledWith("mod-1", 5, "Excellent!");
        });

        it("should replace existing user review in reviews list", async () => {
            var oldReview = makeReview({ rating: 3 });
            useModulesStore.setState({
                reviews: { "mod-1": [oldReview] },
                userReviews: { "mod-1": oldReview },
            });

            var newReview = makeReview({ rating: 5, comment: "Updated!" });
            submitReview.mockResolvedValue(newReview);
            fetchReviewStats.mockResolvedValue(makeStats());

            await useModulesStore.getState().submitReview("mod-1", 5, "Updated!");

            var state = useModulesStore.getState();
            expect(state.reviews["mod-1"]).toHaveLength(1);
            expect(state.reviews["mod-1"][0].rating).toBe(5);
        });

        it("should throw on API error", async () => {
            submitReview.mockRejectedValue(new Error("Submit failed"));

            await expect(
                useModulesStore.getState().submitReview("mod-1", 4),
            ).rejects.toThrow("Submit failed");
        });
    });

    // ── removeReview ──
    describe("removeReview", () => {
        it("should remove review from state", async () => {
            var review = makeReview();
            useModulesStore.setState({
                reviews: { "mod-1": [review] },
                userReviews: { "mod-1": review },
            });

            deleteReview.mockResolvedValue(undefined);
            fetchReviewStats.mockResolvedValue(
                makeStats({ totalReviews: 0, averageRating: 0 }),
            );

            await useModulesStore.getState().removeReview("mod-1");

            var state = useModulesStore.getState();
            expect(state.reviews["mod-1"]).toHaveLength(0);
            expect(state.userReviews["mod-1"]).toBeNull();
        });

        it("should throw on API error", async () => {
            useModulesStore.setState({
                userReviews: { "mod-1": makeReview() },
            });
            deleteReview.mockRejectedValue(new Error("Delete failed"));

            await expect(
                useModulesStore.getState().removeReview("mod-1"),
            ).rejects.toThrow("Delete failed");
        });
    });
});

describe("useModulesStore recommendations", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useModulesStore.getState().reset();
    });

    // ── initial state ──
    describe("initial recommendations state", () => {
        it("should have empty recommendations", () => {
            var state = useModulesStore.getState();
            expect(state.recommendations).toEqual([]);
            expect(state.recommendationsLoading).toBe(false);
        });
    });

    // ── fetchRecommendations ──
    describe("fetchRecommendations", () => {
        it("should fetch and organize recommendation sections", async () => {
            var trending = [makeModule({ id: "trend-1" })];
            var topRated = [makeModule({ id: "top-1" })];
            var newReleases = [makeModule({ id: "new-1" })];

            fetchTrendingModules.mockResolvedValue(trending);
            fetchTopRatedModules.mockResolvedValue(topRated);
            fetchNewReleases.mockResolvedValue(newReleases);

            await useModulesStore.getState().fetchRecommendations();

            var state = useModulesStore.getState();
            expect(state.recommendations).toHaveLength(3);
            expect(state.recommendations[0].key).toBe("trending");
            expect(state.recommendations[0].modules).toEqual(trending);
            expect(state.recommendations[1].key).toBe("top_rated");
            expect(state.recommendations[2].key).toBe("new_releases");
            expect(state.recommendationsLoading).toBe(false);
            expect(state.recommendationsFetchedAt).toBeTruthy();
        });

        it("should skip empty sections", async () => {
            fetchTrendingModules.mockResolvedValue([]);
            fetchTopRatedModules.mockResolvedValue([makeModule()]);
            fetchNewReleases.mockResolvedValue([]);

            await useModulesStore.getState().fetchRecommendations();

            var state = useModulesStore.getState();
            expect(state.recommendations).toHaveLength(1);
            expect(state.recommendations[0].key).toBe("top_rated");
        });

        it("should use cache when not forced", async () => {
            // First fetch
            fetchTrendingModules.mockResolvedValue([makeModule()]);
            fetchTopRatedModules.mockResolvedValue([]);
            fetchNewReleases.mockResolvedValue([]);

            await useModulesStore.getState().fetchRecommendations();
            expect(fetchTrendingModules).toHaveBeenCalledTimes(1);

            // Second fetch — should be cached
            await useModulesStore.getState().fetchRecommendations();
            expect(fetchTrendingModules).toHaveBeenCalledTimes(1);
        });

        it("should force refresh when requested", async () => {
            fetchTrendingModules.mockResolvedValue([makeModule()]);
            fetchTopRatedModules.mockResolvedValue([]);
            fetchNewReleases.mockResolvedValue([]);

            await useModulesStore.getState().fetchRecommendations();
            await useModulesStore.getState().fetchRecommendations(true);

            expect(fetchTrendingModules).toHaveBeenCalledTimes(2);
        });

        it("should handle errors gracefully", async () => {
            fetchTrendingModules.mockRejectedValue(new Error("Network error"));
            fetchTopRatedModules.mockRejectedValue(new Error("Network error"));
            fetchNewReleases.mockRejectedValue(new Error("Network error"));

            await useModulesStore.getState().fetchRecommendations();

            var state = useModulesStore.getState();
            expect(state.recommendationsLoading).toBe(false);
        });
    });
});
