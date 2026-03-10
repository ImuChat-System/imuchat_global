/**
 * Tests for Sprint S8B — Trending Algorithm + Explore Service
 */

import { computeTrendingScore } from '../imufeed-trending';
import { supabase } from '../supabase';

jest.mock('../logger', () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock('../supabase', () => ({
    supabase: {
        from: jest.fn(),
        auth: { getUser: jest.fn() },
        rpc: jest.fn(),
    },
}));

// ─── Helpers ──────────────────────────────────────────────────

function chainMock(overrides = {}) {
    const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
        delete: jest.fn().mockReturnThis(),
        ...overrides,
    };
    return chain;
}

// ──────────────────────────────────────────────────────────────
// Suite 1: computeTrendingScore (pure function)
// ──────────────────────────────────────────────────────────────

describe('computeTrendingScore', () => {
    it('returns 0 when all inputs are 0', () => {
        // acceleration = 0 / max(0, 1) = 0
        // score = (0 * 2) + (0 * 5) + (0 * 0.001) + (0 * 10) = 0
        expect(computeTrendingScore(0, 0, 0, 0)).toBe(0);
    });

    it('computes correct score with usage only', () => {
        // usage24h=10, usagePrev=0 → acceleration = 10/1 = 10
        // score = (10*2) + (0*5) + (0*0.001) + (10*10) = 20 + 0 + 0 + 100 = 120
        expect(computeTrendingScore(10, 0, 0, 0)).toBe(120);
    });

    it('computes correct score with all factors', () => {
        // usage24h=20, uniqueCreators=5, views=10000, usagePrev=10
        // acceleration = 20/10 = 2
        // score = (20*2) + (5*5) + (10000*0.001) + (2*10) = 40 + 25 + 10 + 20 = 95
        expect(computeTrendingScore(20, 5, 10000, 10)).toBe(95);
    });

    it('handles high acceleration when prev is very low', () => {
        // usage24h=50, usagePrev=1 → acceleration = 50
        // score = (50*2) + (0*5) + (0*0.001) + (50*10) = 100 + 0 + 0 + 500 = 600
        expect(computeTrendingScore(50, 0, 0, 1)).toBe(600);
    });

    it('weights unique creators heavily', () => {
        // 10 unique creators = +50 to score
        const withCreators = computeTrendingScore(10, 10, 0, 10);
        const without = computeTrendingScore(10, 0, 0, 10);
        expect(withCreators - without).toBe(50);
    });

    it('views contribute fractionally', () => {
        // 1M views = only +1000 to score
        const withViews = computeTrendingScore(0, 0, 1_000_000, 0);
        expect(withViews).toBe(1000);
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: fetchTrendingHashtagsScored
// ──────────────────────────────────────────────────────────────

describe('fetchTrendingHashtagsScored', () => {
    let fetchTrendingHashtagsScored: typeof import('../imufeed-trending').fetchTrendingHashtagsScored;

    beforeEach(() => {
        jest.clearAllMocks();
        // Re-require to get fresh module
        fetchTrendingHashtagsScored = require('../imufeed-trending').fetchTrendingHashtagsScored;
    });

    it('returns empty array when no active hashtags', async () => {
        const chain = chainMock();
        chain.limit = jest.fn().mockResolvedValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chain);

        const result = await fetchTrendingHashtagsScored();
        expect(result).toEqual([]);
    });

    it('returns scored hashtags sorted by score', async () => {
        let callCount = 0;
        (supabase.from as jest.Mock).mockImplementation((table: string) => {
            callCount++;
            if (callCount === 1) {
                // imufeed_hashtags query
                const chain = chainMock();
                chain.limit = jest.fn().mockResolvedValue({
                    data: [
                        { id: 'h1', name: 'dance', usage_count: 100 },
                        { id: 'h2', name: 'cooking', usage_count: 50 },
                    ],
                    error: null,
                });
                return chain;
            }
            if (callCount === 2) {
                // recent 24h
                const chain = chainMock();
                chain.gte = jest.fn().mockResolvedValue({
                    data: [
                        { hashtag_id: 'h1', video_id: 'v1', imufeed_videos: { author_id: 'a1', views_count: 5000, created_at: new Date().toISOString() } },
                        { hashtag_id: 'h1', video_id: 'v2', imufeed_videos: { author_id: 'a2', views_count: 3000, created_at: new Date().toISOString() } },
                    ],
                    error: null,
                });
                return chain;
            }
            // prev 24h
            const chain = chainMock();
            chain.lt = jest.fn().mockResolvedValue({
                data: [
                    { hashtag_id: 'h1', video_id: 'v0', imufeed_videos: { created_at: new Date().toISOString() } },
                ],
                error: null,
            });
            return chain;
        });

        const result = await fetchTrendingHashtagsScored(5);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].name).toBe('dance');
        expect(result[0].score).toBeGreaterThan(0);
        expect(result[0].usage_24h).toBe(2);
        expect(result[0].unique_creators).toBe(2);
    });

    it('handles error gracefully', async () => {
        const chain = chainMock();
        chain.limit = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
        (supabase.from as jest.Mock).mockReturnValue(chain);

        const result = await fetchTrendingHashtagsScored();
        expect(result).toEqual([]);
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 3: fetchTopCreatorsWeekly
// ──────────────────────────────────────────────────────────────

describe('fetchTopCreatorsWeekly', () => {
    let fetchTopCreatorsWeekly: typeof import('../imufeed-trending').fetchTopCreatorsWeekly;

    beforeEach(() => {
        jest.clearAllMocks();
        fetchTopCreatorsWeekly = require('../imufeed-trending').fetchTopCreatorsWeekly;
    });

    it('returns empty array when no recent videos', async () => {
        const chain = chainMock();
        chain.gte = jest.fn().mockResolvedValue({ data: [], error: null });
        (supabase.from as jest.Mock).mockReturnValue(chain);

        const result = await fetchTopCreatorsWeekly();
        expect(result).toEqual([]);
    });

    it('returns creators sorted by weekly likes', async () => {
        let callCount = 0;
        (supabase.from as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                const chain = chainMock();
                chain.gte = jest.fn().mockResolvedValue({
                    data: [
                        { author_id: 'a1', likes_count: 500, profiles: { username: 'alice', display_name: 'Alice', avatar_url: null, is_verified: true, followers_count: 1000 } },
                        { author_id: 'a1', likes_count: 300, profiles: { username: 'alice', display_name: 'Alice', avatar_url: null, is_verified: true, followers_count: 1000 } },
                        { author_id: 'a2', likes_count: 200, profiles: { username: 'bob', display_name: 'Bob', avatar_url: null, is_verified: false, followers_count: 500 } },
                    ],
                    error: null,
                });
                return chain;
            }
            // follows query
            const chain = chainMock();
            chain.in = jest.fn().mockResolvedValue({ data: [], error: null });
            return chain;
        });

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'me' } },
        });

        const result = await fetchTopCreatorsWeekly(5);
        expect(result.length).toBe(2);
        expect(result[0].username).toBe('alice');
        expect(result[0].weekly_likes).toBe(800);
        expect(result[0].weekly_videos).toBe(2);
        expect(result[1].username).toBe('bob');
        expect(result[1].weekly_likes).toBe(200);
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 4: fetchActiveChallenges
// ──────────────────────────────────────────────────────────────

describe('fetchActiveChallenges', () => {
    let fetchActiveChallenges: typeof import('../imufeed-trending').fetchActiveChallenges;

    beforeEach(() => {
        jest.clearAllMocks();
        fetchActiveChallenges = require('../imufeed-trending').fetchActiveChallenges;
    });

    it('returns trending hashtags with high usage', async () => {
        const chain = chainMock();
        chain.limit = jest.fn().mockResolvedValue({
            data: [
                { id: 'h1', name: 'danceChallenge', usage_count: 500, is_trending: true },
            ],
            error: null,
        });
        (supabase.from as jest.Mock).mockReturnValue(chain);

        const result = await fetchActiveChallenges();
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('danceChallenge');
        expect(result[0].is_trending).toBe(true);
    });

    it('returns empty array on error', async () => {
        const chain = chainMock();
        chain.limit = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
        (supabase.from as jest.Mock).mockReturnValue(chain);

        const result = await fetchActiveChallenges();
        expect(result).toEqual([]);
    });
});
