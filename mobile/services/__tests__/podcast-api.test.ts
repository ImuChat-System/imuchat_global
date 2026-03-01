/**
 * Tests pour le service podcast-api.
 *
 * Couvre : searchPodcasts, getShowDetails, parseRssItems, parseDuration,
 *          parseChapters, getMockShows, getMockEpisodes, getCategories,
 *          fetchEpisodesFromFeed.
 *
 * Phase M5 — DEV-023 Module Podcasts
 */

import {
    fetchEpisodesFromFeed,
    getCategories,
    getMockEpisodes,
    getMockShows,
    getShowDetails,
    MOCK_EPISODES,
    MOCK_SHOWS,
    parseChapters,
    parseDuration,
    parseRssItems,
    searchPodcasts,
} from '../podcast-api';

// ─── Mocks ────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── Mock data helpers ────────────────────────────────────────

const ITUNES_SEARCH_RESPONSE = {
    resultCount: 2,
    results: [
        {
            collectionId: 12345,
            collectionName: 'Test Podcast',
            artistName: 'Test Author',
            artworkUrl600: 'https://example.com/art.jpg',
            feedUrl: 'https://example.com/feed.xml',
            primaryGenreName: 'Technology',
            trackCount: 50,
        },
        {
            collectionId: 67890,
            collectionName: 'Podcast 2',
            artistName: 'Author 2',
            artworkUrl600: null,
            artworkUrl100: 'https://example.com/art100.jpg',
            feedUrl: 'https://example.com/feed2.xml',
            primaryGenreName: 'Comedy',
            trackCount: 30,
        },
    ],
};

const ITUNES_LOOKUP_RESPONSE = {
    resultCount: 1,
    results: [
        {
            collectionId: 12345,
            collectionName: 'Test Podcast',
            artistName: 'Test Author',
            description: 'A test description',
            artworkUrl600: 'https://example.com/art.jpg',
            feedUrl: 'https://example.com/feed.xml',
            primaryGenreName: 'Technology',
            trackCount: 50,
            releaseDate: '2026-02-15T00:00:00Z',
        },
    ],
};

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
<channel>
<item>
    <title>Episode One</title>
    <description>First episode description</description>
    <enclosure url="https://cdn.example.com/ep1.mp3" type="audio/mpeg" />
    <pubDate>Mon, 18 Feb 2026 08:00:00 GMT</pubDate>
    <itunes:duration>15:30</itunes:duration>
    <itunes:episode>1</itunes:episode>
    <itunes:season>2</itunes:season>
</item>
<item>
    <title><![CDATA[Episode Two: Special & Cool]]></title>
    <description><![CDATA[<p>HTML description</p>]]></description>
    <enclosure url="https://cdn.example.com/ep2.mp3" type="audio/mpeg" />
    <pubDate>Tue, 17 Feb 2026 08:00:00 GMT</pubDate>
    <itunes:duration>1:05:20</itunes:duration>
    <itunes:episode>2</itunes:episode>
</item>
<item>
    <title>No Audio Episode</title>
    <description>This has no enclosure</description>
</item>
</channel>
</rss>`;

const SAMPLE_CHAPTERS_XML = `
<psc:chapter start="00:00:00" title="Introduction" />
<psc:chapter start="00:05:30" title="Topic One" />
<psc:chapter start="00:15:00" title="Topic Two" />
<psc:chapter start="00:30:00" title="Conclusion" />
`;

// ═══════════════════════════════════════════════════════════════
// searchPodcasts
// ═══════════════════════════════════════════════════════════════

describe('searchPodcasts', () => {
    it('should return results from iTunes API', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ITUNES_SEARCH_RESPONSE,
        });

        const results = await searchPodcasts('tech');
        expect(results).toHaveLength(2);
        expect(results[0].id).toBe('12345');
        expect(results[0].title).toBe('Test Podcast');
        expect(results[0].author).toBe('Test Author');
        expect(results[0].artwork_url).toBe('https://example.com/art.jpg');
        expect(results[0].feed_url).toBe('https://example.com/feed.xml');
        expect(results[0].episode_count).toBe(50);
    });

    it('should use artworkUrl100 as fallback', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ITUNES_SEARCH_RESPONSE,
        });

        const results = await searchPodcasts('comedy');
        expect(results[1].artwork_url).toBe('https://example.com/art100.jpg');
    });

    it('should return empty for blank query', async () => {
        const results = await searchPodcasts('   ');
        expect(results).toEqual([]);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return empty on network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const results = await searchPodcasts('test');
        expect(results).toEqual([]);
    });

    it('should return empty on non-ok response', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
        const results = await searchPodcasts('test');
        expect(results).toEqual([]);
    });

    it('should encode query in URL', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ resultCount: 0, results: [] }),
        });

        await searchPodcasts('hello world');
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('hello%20world'),
            expect.anything(),
        );
    });

    it('should pass limit parameter', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ resultCount: 0, results: [] }),
        });

        await searchPodcasts('test', 5);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('limit=5'),
            expect.anything(),
        );
    });
});

// ═══════════════════════════════════════════════════════════════
// getShowDetails
// ═══════════════════════════════════════════════════════════════

describe('getShowDetails', () => {
    it('should return show details', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ITUNES_LOOKUP_RESPONSE,
        });

        const show = await getShowDetails('12345');
        expect(show).not.toBeNull();
        expect(show.id).toBe('12345');
        expect(show.title).toBe('Test Podcast');
        expect(show.category).toBe('technology');
        expect(show.is_subscribed).toBe(false);
    });

    it('should return null on error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const show = await getShowDetails('12345');
        expect(show).toBeNull();
    });

    it('should return null on empty results', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ resultCount: 0, results: [] }),
        });

        const show = await getShowDetails('99999');
        expect(show).toBeNull();
    });

    it('should return null on non-ok response', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
        const show = await getShowDetails('12345');
        expect(show).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// parseRssItems
// ═══════════════════════════════════════════════════════════════

describe('parseRssItems', () => {
    it('should parse standard RSS items', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        expect(episodes).toHaveLength(2); // 3rd has no audio
        expect(episodes[0].title).toBe('Episode One');
        expect(episodes[0].audio_url).toBe('https://cdn.example.com/ep1.mp3');
        expect(episodes[0].show_id).toBe('show1');
    });

    it('should parse CDATA titles', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        expect(episodes[1].title).toBe('Episode Two: Special & Cool');
    });

    it('should clean HTML from descriptions', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        expect(episodes[1].description).toBe('HTML description');
    });

    it('should parse episode duration HH:MM:SS format', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        expect(episodes[1].duration_ms).toBe((1 * 3600 + 5 * 60 + 20) * 1000);
    });

    it('should parse episode duration MM:SS format', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        expect(episodes[0].duration_ms).toBe((15 * 60 + 30) * 1000);
    });

    it('should parse episode and season numbers', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        expect(episodes[0].episode_number).toBe(1);
        expect(episodes[0].season_number).toBe(2);
        expect(episodes[1].episode_number).toBe(2);
        expect(episodes[1].season_number).toBeNull();
    });

    it('should skip items without audio URL', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        const noAudio = episodes.find((ep) => ep.title === 'No Audio Episode');
        expect(noAudio).toBeUndefined();
    });

    it('should respect limit', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1', 1);
        expect(episodes).toHaveLength(1);
    });

    it('should return empty for empty XML', () => {
        const episodes = parseRssItems('', 'show1');
        expect(episodes).toEqual([]);
    });

    it('should set default values for new episodes', () => {
        const episodes = parseRssItems(SAMPLE_RSS, 'show1');
        expect(episodes[0].is_played).toBe(false);
        expect(episodes[0].play_position_ms).toBe(0);
        expect(episodes[0].is_downloaded).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// parseDuration
// ═══════════════════════════════════════════════════════════════

describe('parseDuration', () => {
    it('should parse HH:MM:SS', () => {
        expect(parseDuration('1:30:00')).toBe(5400000);
    });

    it('should parse MM:SS', () => {
        expect(parseDuration('15:30')).toBe(930000);
    });

    it('should parse raw seconds', () => {
        expect(parseDuration('3600')).toBe(3600000);
    });

    it('should return 0 for null', () => {
        expect(parseDuration(null)).toBe(0);
    });

    it('should return 0 for undefined', () => {
        expect(parseDuration(undefined)).toBe(0);
    });

    it('should return 0 for empty string', () => {
        expect(parseDuration('')).toBe(0);
    });

    it('should return 0 for non-numeric string', () => {
        expect(parseDuration('abc')).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// parseChapters
// ═══════════════════════════════════════════════════════════════

describe('parseChapters', () => {
    it('should parse chapter markers', () => {
        const chapters = parseChapters(SAMPLE_CHAPTERS_XML);
        expect(chapters).toHaveLength(4);
        expect(chapters[0].title).toBe('Introduction');
        expect(chapters[0].start_ms).toBe(0);
        expect(chapters[1].title).toBe('Topic One');
        expect(chapters[1].start_ms).toBe(330000);
    });

    it('should set end_ms to next chapter start', () => {
        const chapters = parseChapters(SAMPLE_CHAPTERS_XML);
        expect(chapters[0].end_ms).toBe(chapters[1].start_ms);
        expect(chapters[1].end_ms).toBe(chapters[2].start_ms);
    });

    it('should set last chapter end_ms as start + 10 min', () => {
        const chapters = parseChapters(SAMPLE_CHAPTERS_XML);
        const last = chapters[chapters.length - 1];
        expect(last.end_ms).toBe(last.start_ms + 600000);
    });

    it('should return empty for no chapters', () => {
        expect(parseChapters('<rss></rss>')).toEqual([]);
    });
});

// ═══════════════════════════════════════════════════════════════
// fetchEpisodesFromFeed
// ═══════════════════════════════════════════════════════════════

describe('fetchEpisodesFromFeed', () => {
    it('should fetch and parse feed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            text: async () => SAMPLE_RSS,
        });

        const episodes = await fetchEpisodesFromFeed('https://feeds.example.com/feed.xml', 'show1');
        expect(episodes).toHaveLength(2);
        expect(episodes[0].title).toBe('Episode One');
    });

    it('should fallback to mock on fetch failure', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const episodes = await fetchEpisodesFromFeed('https://fails.com', 'ps1');
        // Should return MOCK_EPISODES filtered by show_id
        expect(episodes.length).toBeGreaterThan(0);
        episodes.forEach((ep) => {
            expect(ep.show_id).toBe('ps1');
        });
    });

    it('should fallback to mock on non-ok response', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
        const episodes = await fetchEpisodesFromFeed('https://fails.com', 'ps1');
        expect(episodes.length).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Mock data accessors
// ═══════════════════════════════════════════════════════════════

describe('getMockShows', () => {
    it('should return all mock shows', () => {
        const shows = getMockShows();
        expect(shows).toHaveLength(5);
        expect(shows).toEqual(MOCK_SHOWS);
    });

    it('mock shows should have required fields', () => {
        const shows = getMockShows();
        shows.forEach((show) => {
            expect(show.id).toBeTruthy();
            expect(show.title).toBeTruthy();
            expect(show.author).toBeTruthy();
            expect(show.feed_url).toBeTruthy();
            expect(show.category).toBeTruthy();
            expect(typeof show.episode_count).toBe('number');
        });
    });
});

describe('getMockEpisodes', () => {
    it('should filter episodes by show_id', () => {
        const episodes = getMockEpisodes('ps1');
        expect(episodes.length).toBeGreaterThan(0);
        episodes.forEach((ep) => {
            expect(ep.show_id).toBe('ps1');
        });
    });

    it('should return empty for unknown show', () => {
        expect(getMockEpisodes('unknown')).toEqual([]);
    });

    it('mock episodes should have required fields', () => {
        MOCK_EPISODES.forEach((ep) => {
            expect(ep.id).toBeTruthy();
            expect(ep.show_id).toBeTruthy();
            expect(ep.title).toBeTruthy();
            expect(ep.audio_url).toBeTruthy();
            expect(typeof ep.duration_ms).toBe('number');
        });
    });
});

describe('getCategories', () => {
    it('should return all categories', () => {
        const categories = getCategories();
        expect(categories.length).toBeGreaterThan(10);
        expect(categories).toContain('technology');
        expect(categories).toContain('gaming');
        expect(categories).toContain('anime');
    });
});
