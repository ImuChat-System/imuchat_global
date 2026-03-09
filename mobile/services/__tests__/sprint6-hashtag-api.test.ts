/**
 * Tests for Sprint S6 hashtag API functions
 * fetchVideosByHashtag, followHashtag, unfollowHashtag
 */

import { fetchVideosByHashtag, followHashtag, unfollowHashtag } from '../imufeed-api';
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
        storage: { from: jest.fn() },
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

// ─── Tests ────────────────────────────────────────────────────

describe('Sprint S6 Hashtag API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── fetchVideosByHashtag ─────────────────────────────

    describe('fetchVideosByHashtag', () => {
        it('returns empty page when hashtag not found', async () => {
            const hashtagChain = chainMock({
                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            });
            (supabase.from as jest.Mock).mockReturnValue(hashtagChain);

            const result = await fetchVideosByHashtag('nonexistent');

            expect(result).toEqual({ videos: [], cursor: null, hasMore: false });
        });

        it('returns empty page when no videos linked', async () => {
            // First call: find hashtag
            const hashtagChain = chainMock({
                maybeSingle: jest.fn().mockResolvedValue({
                    data: { id: 'h-1', usage_count: 5 },
                    error: null,
                }),
            });
            // Second call: junction query returns empty
            const junctionChain = chainMock({
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
            });

            let callIdx = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIdx++;
                return callIdx === 1 ? hashtagChain : junctionChain;
            });

            const result = await fetchVideosByHashtag('dance');
            expect(result.videos).toEqual([]);
            expect(result.hasMore).toBe(false);
        });

        it('fetches videos for existing hashtag', async () => {
            const hashtagChain = chainMock({
                maybeSingle: jest.fn().mockResolvedValue({
                    data: { id: 'h-1', usage_count: 50 },
                    error: null,
                }),
            });

            const junctionChain = chainMock({
                limit: jest.fn().mockResolvedValue({
                    data: [{ video_id: 'v-1' }, { video_id: 'v-2' }],
                    error: null,
                }),
            });

            const videoRow = {
                id: 'v-1',
                author_id: 'u-1',
                video_url: 'https://example.com/v1.mp4',
                thumbnail_url: null,
                description: 'Dance video',
                category: 'entertainment',
                visibility: 'public',
                status: 'published',
                likes_count: 10,
                comments_count: 2,
                shares_count: 0,
                views_count: 100,
                bookmarks_count: 0,
                duration: 30,
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z',
                hashtags: [],
                profiles: {
                    username: 'dancer',
                    display_name: 'Dancer',
                    avatar_url: null,
                    is_verified: false,
                    followers_count: 10,
                },
            };

            const videosChain = chainMock({
                order: jest.fn().mockResolvedValue({ data: [videoRow], error: null }),
            });

            let callIdx = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
                callIdx++;
                if (callIdx === 1) return hashtagChain;
                if (callIdx === 2) return junctionChain;
                return videosChain;
            });

            const result = await fetchVideosByHashtag('dance');
            expect(result.videos.length).toBe(1);
            expect(result.videos[0].id).toBe('v-1');
        });
    });

    // ─── followHashtag ────────────────────────────────────

    describe('followHashtag', () => {
        it('upserts follow relationship', async () => {
            const chain = chainMock();
            (supabase.from as jest.Mock).mockReturnValue(chain);

            await followHashtag('h-1', 'user-1');

            expect(supabase.from).toHaveBeenCalledWith('imufeed_hashtag_follows');
            expect(chain.upsert).toHaveBeenCalledWith(
                { hashtag_id: 'h-1', user_id: 'user-1' },
                { onConflict: 'hashtag_id,user_id' },
            );
        });

        it('throws on error', async () => {
            const chain = chainMock({
                upsert: jest.fn().mockResolvedValue({ error: { message: 'db error' } }),
            });
            (supabase.from as jest.Mock).mockReturnValue(chain);

            await expect(followHashtag('h-1', 'user-1')).rejects.toEqual({ message: 'db error' });
        });
    });

    // ─── unfollowHashtag ──────────────────────────────────

    describe('unfollowHashtag', () => {
        it('deletes follow relationship', async () => {
            const chain = chainMock({
                eq: jest.fn().mockReturnThis(),
            });
            // .delete() returns a chain with .eq()
            chain.delete = jest.fn().mockReturnValue(chain);
            // Final .eq() resolves
            let eqCalls = 0;
            chain.eq = jest.fn().mockImplementation(() => {
                eqCalls++;
                if (eqCalls >= 2) return Promise.resolve({ error: null });
                return chain;
            });
            (supabase.from as jest.Mock).mockReturnValue(chain);

            await unfollowHashtag('h-1', 'user-1');

            expect(supabase.from).toHaveBeenCalledWith('imufeed_hashtag_follows');
            expect(chain.delete).toHaveBeenCalled();
        });

        it('throws on error', async () => {
            const chain = chainMock();
            chain.delete = jest.fn().mockReturnValue(chain);
            let eqCalls = 0;
            chain.eq = jest.fn().mockImplementation(() => {
                eqCalls++;
                if (eqCalls >= 2) return Promise.resolve({ error: { message: 'fail' } });
                return chain;
            });
            (supabase.from as jest.Mock).mockReturnValue(chain);

            await expect(unfollowHashtag('h-1', 'user-1')).rejects.toEqual({ message: 'fail' });
        });
    });
});
