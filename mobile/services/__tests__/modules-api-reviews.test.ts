/**
 * Tests for modules-api.ts — Review & Recommendation functions
 * Supabase chain mock pattern (no TS syntax — Babel constraint)
 */

// --- Mocks ---
jest.mock("../supabase", () => ({
    supabase: {
        from: jest.fn(),
    },
    getCurrentUser: jest.fn(),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
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
} from "../modules-api";
import { getCurrentUser, supabase } from "../supabase";

const mockFrom = supabase.from;
const mockGetCurrentUser = getCurrentUser;

// ── Helpers ──
function makeReview(overrides) {
    return {
        id: "rev-1",
        module_id: "mod-1",
        user_id: "user-1",
        rating: 4,
        comment: "Great module!",
        created_at: "2026-01-15T10:00:00Z",
        ...overrides,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("modules-api reviews", () => {
    // ── fetchModuleReviews ──
    describe("fetchModuleReviews", () => {
        it("returns reviews sorted by date", async () => {
            const reviews = [makeReview(), makeReview({ id: "rev-2", rating: 5 })];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: reviews,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchModuleReviews("mod-1");
            expect(result).toEqual(reviews);
            expect(mockFrom).toHaveBeenCalledWith("module_reviews");
        });

        it("throws on error", async () => {
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

            await expect(fetchModuleReviews("mod-1")).rejects.toThrow(
                "Failed to fetch reviews",
            );
        });

        it("returns empty array when no reviews", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: [],
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchModuleReviews("mod-1");
            expect(result).toEqual([]);
        });
    });

    // ── fetchUserReview ──
    describe("fetchUserReview", () => {
        it("returns user review when it exists", async () => {
            const review = makeReview();
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({
                                data: review,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchUserReview("mod-1");
            expect(result).toEqual(review);
        });

        it("returns null when user not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const result = await fetchUserReview("mod-1");
            expect(result).toBeNull();
        });

        it("returns null on error", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: "DB error" },
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchUserReview("mod-1");
            expect(result).toBeNull();
        });
    });

    // ── submitReview ──
    describe("submitReview", () => {
        it("submits a new review via upsert", async () => {
            const review = makeReview();
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                upsert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: review,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await submitReview("mod-1", 4, "Great module!");
            expect(result).toEqual(review);
            expect(mockFrom).toHaveBeenCalledWith("module_reviews");
        });

        it("throws when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            await expect(submitReview("mod-1", 4)).rejects.toThrow(
                "User not authenticated",
            );
        });

        it("throws on invalid rating", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });

            await expect(submitReview("mod-1", 0)).rejects.toThrow(
                "Rating must be between 1 and 5",
            );
            await expect(submitReview("mod-1", 6)).rejects.toThrow(
                "Rating must be between 1 and 5",
            );
        });

        it("throws on DB error", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                upsert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: "Unique constraint" },
                        }),
                    }),
                }),
            });

            await expect(submitReview("mod-1", 4)).rejects.toThrow(
                "Failed to submit review",
            );
        });
    });

    // ── deleteReview ──
    describe("deleteReview", () => {
        it("deletes user review", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                            error: null,
                        }),
                    }),
                }),
            });

            await expect(deleteReview("mod-1")).resolves.toBeUndefined();
        });

        it("throws when not authenticated", async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            await expect(deleteReview("mod-1")).rejects.toThrow(
                "User not authenticated",
            );
        });

        it("throws on DB error", async () => {
            mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
            mockFrom.mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                            error: { message: "Not found" },
                        }),
                    }),
                }),
            });

            await expect(deleteReview("mod-1")).rejects.toThrow(
                "Failed to delete review",
            );
        });
    });

    // ── fetchReviewStats ──
    describe("fetchReviewStats", () => {
        it("computes stats from reviews", async () => {
            const ratings = [
                { rating: 5 },
                { rating: 5 },
                { rating: 4 },
                { rating: 3 },
                { rating: 1 },
            ];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: ratings,
                        error: null,
                    }),
                }),
            });

            const stats = await fetchReviewStats("mod-1");
            expect(stats.totalReviews).toBe(5);
            expect(stats.averageRating).toBeCloseTo(3.6, 1);
            expect(stats.distribution[5]).toBe(2);
            expect(stats.distribution[4]).toBe(1);
            expect(stats.distribution[3]).toBe(1);
            expect(stats.distribution[2]).toBe(0);
            expect(stats.distribution[1]).toBe(1);
        });

        it("returns zeros when no reviews", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            const stats = await fetchReviewStats("mod-1");
            expect(stats.totalReviews).toBe(0);
            expect(stats.averageRating).toBe(0);
        });

        it("throws on error", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: "DB error" },
                    }),
                }),
            });

            await expect(fetchReviewStats("mod-1")).rejects.toThrow(
                "Failed to fetch review stats",
            );
        });
    });
});

describe("modules-api recommendations", () => {
    // ── fetchTrendingModules ──
    describe("fetchTrendingModules", () => {
        it("returns trending modules", async () => {
            const modules = [{ id: "mod-1", name: "Trending" }];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        gte: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue({
                                    data: modules,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchTrendingModules();
            expect(result).toEqual(modules);
            expect(mockFrom).toHaveBeenCalledWith("modules");
        });

        it("throws on error", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        gte: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue({
                                    data: null,
                                    error: { message: "DB error" },
                                }),
                            }),
                        }),
                    }),
                }),
            });

            await expect(fetchTrendingModules()).rejects.toThrow(
                "Failed to fetch trending modules",
            );
        });
    });

    // ── fetchTopRatedModules ──
    describe("fetchTopRatedModules", () => {
        it("returns top rated modules", async () => {
            const modules = [{ id: "mod-1", rating: 4.9 }];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        gte: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue({
                                    data: modules,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchTopRatedModules();
            expect(result).toEqual(modules);
        });
    });

    // ── fetchNewReleases ──
    describe("fetchNewReleases", () => {
        it("returns recent modules", async () => {
            const modules = [{ id: "mod-new", created_at: "2026-03-01" }];
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: modules,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await fetchNewReleases();
            expect(result).toEqual(modules);
        });

        it("throws on error", async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: "DB error" },
                            }),
                        }),
                    }),
                }),
            });

            await expect(fetchNewReleases()).rejects.toThrow(
                "Failed to fetch new releases",
            );
        });
    });
});
