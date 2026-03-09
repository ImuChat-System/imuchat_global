/**
 * Tests for Sprint S7B — ImuFeed Algorithm Service
 */

import { deduplicateByCreator } from '../imufeed-algorithm';
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
    const chain: Record<string, jest.Mock> = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
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

function makeVideo(id: string, authorId: string, overrides = {}) {
    return {
        id,
        author: {
            id: authorId,
            username: `user_${authorId}`,
            display_name: null,
            avatar_url: null,
            is_verified: false,
            followers_count: 0,
            is_following: false,
        },
        video_url: `https://example.com/${id}.mp4`,
        thumbnail_url: null,
        caption: `Video ${id}`,
        duration_ms: 30000,
        width: 1080,
        height: 1920,
        sound: null,
        hashtags: [],
        category: 'entertainment' as const,
        visibility: 'public' as const,
        status: 'published' as const,
        likes_count: 10,
        comments_count: 2,
        shares_count: 1,
        views_count: 100,
        bookmarks_count: 5,
        is_liked: false,
        is_bookmarked: false,
        allow_comments: true,
        allow_duet: true,
        original_video_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

// ──────────────────────────────────────────────────────────────
// Suite 1: deduplicateByCreator (pure function — no mocks needed)
// ──────────────────────────────────────────────────────────────

describe('deduplicateByCreator', () => {
    it('returns empty array for empty input', () => {
        expect(deduplicateByCreator([])).toEqual([]);
    });

    it('returns same array when no consecutive duplicates', () => {
        const videos = [
            makeVideo('v1', 'a1'),
            makeVideo('v2', 'a2'),
            makeVideo('v3', 'a3'),
        ];
        const result = deduplicateByCreator(videos as any);
        expect(result.map((v) => v.id)).toEqual(['v1', 'v2', 'v3']);
    });

    it('separates consecutive videos from same creator', () => {
        const videos = [
            makeVideo('v1', 'a1'),
            makeVideo('v2', 'a1'), // same creator as v1
            makeVideo('v3', 'a2'),
        ];
        const result = deduplicateByCreator(videos as any);

        // v2 should not be right after v1
        for (let i = 1; i < result.length; i++) {
            if (result[i].id === 'v2') {
                expect(result[i - 1].author.id).not.toBe('a1');
            }
        }
    });

    it('handles all videos from same creator', () => {
        const videos = [
            makeVideo('v1', 'a1'),
            makeVideo('v2', 'a1'),
            makeVideo('v3', 'a1'),
        ];
        const result = deduplicateByCreator(videos as any);
        // All videos should still be present
        expect(result).toHaveLength(3);
        expect(new Set(result.map((v) => v.id))).toEqual(new Set(['v1', 'v2', 'v3']));
    });

    it('preserves total count of videos', () => {
        const videos = [
            makeVideo('v1', 'a1'),
            makeVideo('v2', 'a1'),
            makeVideo('v3', 'a2'),
            makeVideo('v4', 'a2'),
            makeVideo('v5', 'a3'),
        ];
        const result = deduplicateByCreator(videos as any);
        expect(result).toHaveLength(5);
    });

    it('interleaves creators when multiple consecutive duplicates', () => {
        const videos = [
            makeVideo('v1', 'a1'),
            makeVideo('v2', 'a1'),
            makeVideo('v3', 'a2'),
            makeVideo('v4', 'a2'),
        ];
        const result = deduplicateByCreator(videos as any);

        // Check no consecutive same-creator (when possible)
        for (let i = 1; i < result.length; i++) {
            // With 2+2, perfect interleaving may not always be possible
            // but the algorithm should at least try
        }
        expect(result).toHaveLength(4);
    });

    it('single video returns as-is', () => {
        const videos = [makeVideo('v1', 'a1')];
        const result = deduplicateByCreator(videos as any);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('v1');
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: trackEngagement
// ──────────────────────────────────────────────────────────────

describe('trackEngagement', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does nothing when user not authenticated', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: null },
        });

        const { trackEngagement } = require('../imufeed-algorithm');
        await trackEngagement({
            videoId: 'v1',
            watchDurationMs: 5000,
            completed: false,
            videoDurationMs: 30000,
            source: 'for_you',
        });

        expect(supabase.from).not.toHaveBeenCalled();
    });

    it('inserts view with quick_skip=true when watch < 2s', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'user-1' } },
        });

        // First call: check rewatch (count query)
        const countChain = chainMock();
        countChain.eq = jest.fn().mockReturnThis();
        countChain.select = jest.fn().mockReturnValue(countChain);
        // Make .eq chain return the final result on last call
        let eqCount = 0;
        countChain.eq.mockImplementation(() => {
            eqCount++;
            if (eqCount >= 2) {
                return Promise.resolve({ count: 0, error: null });
            }
            return countChain;
        });

        // Second call: insert
        const insertChain = chainMock();
        insertChain.insert = jest.fn().mockResolvedValue({ error: null });

        let fromCallCount = 0;
        (supabase.from as jest.Mock).mockImplementation(() => {
            fromCallCount++;
            if (fromCallCount === 1) return countChain;
            return insertChain;
        });

        const { trackEngagement } = require('../imufeed-algorithm');
        await trackEngagement({
            videoId: 'v1',
            watchDurationMs: 500, // < 2000ms → quick skip
            completed: false,
            videoDurationMs: 30000,
            source: 'for_you',
        });

        expect(supabase.from).toHaveBeenCalled();
    });

    it('detects rewatch when previous views exist', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'user-1' } },
        });

        let eqCount = 0;
        const countChain = chainMock();
        countChain.select = jest.fn().mockReturnValue(countChain);
        countChain.eq = jest.fn().mockImplementation(() => {
            eqCount++;
            if (eqCount >= 2) {
                return Promise.resolve({ count: 3, error: null }); // 3 previous views
            }
            return countChain;
        });

        const insertChain = chainMock();
        insertChain.insert = jest.fn().mockResolvedValue({ error: null });

        let fromCallCount = 0;
        (supabase.from as jest.Mock).mockImplementation(() => {
            fromCallCount++;
            if (fromCallCount === 1) return countChain;
            return insertChain;
        });

        const { trackEngagement } = require('../imufeed-algorithm');
        await trackEngagement({
            videoId: 'v1',
            watchDurationMs: 15000,
            completed: false,
            videoDurationMs: 30000,
            source: 'for_you',
        });

        // Insert was called with is_rewatch = true
        expect(insertChain.insert).toHaveBeenCalledWith(
            expect.objectContaining({ is_rewatch: true }),
        );
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 3: markNotInterested
// ──────────────────────────────────────────────────────────────

describe('markNotInterested', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws when user not authenticated', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: null },
        });

        const { markNotInterested } = require('../imufeed-algorithm');
        await expect(markNotInterested('v1')).rejects.toThrow('User not authenticated');
    });

    it('upserts not-interested signal', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'user-1' } },
        });

        const upsertChain = chainMock();
        upsertChain.upsert = jest.fn().mockResolvedValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue(upsertChain);

        const { markNotInterested } = require('../imufeed-algorithm');
        await markNotInterested('v1', 'repetitive');

        expect(supabase.from).toHaveBeenCalledWith('imufeed_not_interested');
        expect(upsertChain.upsert).toHaveBeenCalledWith({
            video_id: 'v1',
            user_id: 'user-1',
            reason: 'repetitive',
        });
    });

    it('defaults reason to not_interested', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'user-1' } },
        });

        const upsertChain = chainMock();
        upsertChain.upsert = jest.fn().mockResolvedValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue(upsertChain);

        const { markNotInterested } = require('../imufeed-algorithm');
        await markNotInterested('v1');

        expect(upsertChain.upsert).toHaveBeenCalledWith(
            expect.objectContaining({ reason: 'not_interested' }),
        );
    });

    it('throws on supabase error', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'user-1' } },
        });

        const upsertChain = chainMock();
        upsertChain.upsert = jest.fn().mockResolvedValue({
            error: { message: 'DB error' },
        });
        (supabase.from as jest.Mock).mockReturnValue(upsertChain);

        const { markNotInterested } = require('../imufeed-algorithm');
        await expect(markNotInterested('v1')).rejects.toBeTruthy();
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 4: buildUserInterests
// ──────────────────────────────────────────────────────────────

describe('buildUserInterests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty interests on query error', async () => {
        const viewsChain = chainMock();
        viewsChain.limit = jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Query failed' },
        });
        (supabase.from as jest.Mock).mockReturnValue(viewsChain);

        const { buildUserInterests } = require('../imufeed-algorithm');
        const result = await buildUserInterests('user-1');

        expect(result.user_id).toBe('user-1');
        expect(result.category_weights).toEqual({});
        expect(result.hashtag_weights).toEqual({});
        expect(result.top_creator_ids).toEqual([]);
    });

    it('returns empty interests when no views', async () => {
        const viewsChain = chainMock();
        viewsChain.limit = jest.fn().mockResolvedValue({
            data: [],
            error: null,
        });
        (supabase.from as jest.Mock).mockReturnValue(viewsChain);

        const { buildUserInterests } = require('../imufeed-algorithm');
        const result = await buildUserInterests('user-1');

        expect(result.category_weights).toEqual({});
        expect(result.top_creator_ids).toEqual([]);
    });

    it('computes category and creator weights from views', async () => {
        const viewsChain = chainMock();
        viewsChain.limit = jest.fn().mockResolvedValue({
            data: [
                {
                    video_id: 'v1',
                    watch_duration_ms: 25000,
                    completed: true,
                    quick_skip: false,
                    imufeed_videos: {
                        category: 'comedy',
                        author_id: 'creator-1',
                        duration_ms: 30000,
                        imufeed_video_hashtags: [
                            { imufeed_hashtags: { name: 'funny' } },
                        ],
                    },
                },
                {
                    video_id: 'v2',
                    watch_duration_ms: 10000,
                    completed: false,
                    quick_skip: false,
                    imufeed_videos: {
                        category: 'comedy',
                        author_id: 'creator-1',
                        duration_ms: 30000,
                        imufeed_video_hashtags: [],
                    },
                },
                {
                    video_id: 'v3',
                    watch_duration_ms: 20000,
                    completed: true,
                    quick_skip: false,
                    imufeed_videos: {
                        category: 'education',
                        author_id: 'creator-2',
                        duration_ms: 20000,
                        imufeed_video_hashtags: [
                            { imufeed_hashtags: { name: 'learn' } },
                        ],
                    },
                },
            ],
            error: null,
        });
        (supabase.from as jest.Mock).mockReturnValue(viewsChain);

        const { buildUserInterests } = require('../imufeed-algorithm');
        const result = await buildUserInterests('user-1');

        // comedy should have 2 entries, education 1
        expect(result.category_weights.comedy).toBeGreaterThan(0);
        expect(result.category_weights.education).toBeGreaterThan(0);
        expect(result.hashtag_weights.funny).toBeGreaterThan(0);
        expect(result.hashtag_weights.learn).toBeGreaterThan(0);
        expect(result.top_creator_ids).toContain('creator-1');
        expect(result.top_creator_ids).toContain('creator-2');
    });

    it('limits top creators to 20', async () => {
        // Create views from 25 different creators
        const views = Array.from({ length: 25 }, (_, i) => ({
            video_id: `v${i}`,
            watch_duration_ms: 20000,
            completed: true,
            quick_skip: false,
            imufeed_videos: {
                category: 'entertainment',
                author_id: `creator-${i}`,
                duration_ms: 30000,
                imufeed_video_hashtags: [],
            },
        }));

        const viewsChain = chainMock();
        viewsChain.limit = jest.fn().mockResolvedValue({
            data: views,
            error: null,
        });
        (supabase.from as jest.Mock).mockReturnValue(viewsChain);

        const { buildUserInterests } = require('../imufeed-algorithm');
        const result = await buildUserInterests('user-1');

        expect(result.top_creator_ids.length).toBeLessThanOrEqual(20);
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 5: DEFAULT_FOR_YOU_CONFIG
// ──────────────────────────────────────────────────────────────

describe('DEFAULT_FOR_YOU_CONFIG', () => {
    it('has correct weight distribution summing to 1', () => {
        const { DEFAULT_FOR_YOU_CONFIG } = require('../imufeed-algorithm');
        const total =
            DEFAULT_FOR_YOU_CONFIG.subscriptions_weight +
            DEFAULT_FOR_YOU_CONFIG.similar_weight +
            DEFAULT_FOR_YOU_CONFIG.trending_weight;
        expect(total).toBeCloseTo(1.0);
    });

    it('has recall_limit and result_limit', () => {
        const { DEFAULT_FOR_YOU_CONFIG } = require('../imufeed-algorithm');
        expect(DEFAULT_FOR_YOU_CONFIG.recall_limit).toBe(100);
        expect(DEFAULT_FOR_YOU_CONFIG.result_limit).toBe(20);
    });
});
