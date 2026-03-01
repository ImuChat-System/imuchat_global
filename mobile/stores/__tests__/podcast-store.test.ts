/**
 * Tests pour le podcast-store (Zustand).
 *
 * Couvre : playEpisode, togglePlayPause, seek, speed, subscriptions,
 *          history, downloads, queue, catalogue, formatDuration.
 *
 * Phase M5 — DEV-023 Module Podcasts
 */

import { usePodcastStore } from '../podcast-store';

// ─── Mocks ────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
}));

const mockPlayTrack = jest.fn(() => Promise.resolve());
const mockPause = jest.fn(() => Promise.resolve());
const mockResume = jest.fn(() => Promise.resolve());
const mockStop = jest.fn(() => Promise.resolve());
const mockSeekTo = jest.fn(() => Promise.resolve());
const mockSetRate = jest.fn(() => Promise.resolve());
const mockSetStatusCallback = jest.fn();

jest.mock('@/services/audio-player', () => ({
    playTrack: (...args) => mockPlayTrack(...args),
    pause: (...args) => mockPause(...args),
    resume: (...args) => mockResume(...args),
    stop: (...args) => mockStop(...args),
    seekTo: (...args) => mockSeekTo(...args),
    setRate: (...args) => mockSetRate(...args),
    setLooping: jest.fn(() => Promise.resolve()),
    setStatusCallback: jest.fn(),
}));

jest.mock('@/services/podcast-api', () => ({
    getMockShows: () => [
        {
            id: 'ps1',
            title: 'Tech Daily',
            author: 'ImuChat Media',
            description: 'Tech news',
            artwork_url: null,
            feed_url: 'https://feeds.test.com/tech',
            category: 'technology',
            episode_count: 100,
            is_subscribed: false,
            last_updated: '2026-02-18T08:00:00Z',
        },
    ],
    getMockEpisodes: jest.fn(() => []),
    fetchEpisodesFromFeed: jest.fn(() => Promise.resolve([])),
    searchPodcasts: jest.fn(() => Promise.resolve([])),
    MOCK_SHOWS: [{
        id: 'ps1',
        title: 'Tech Daily',
        author: 'ImuChat Media',
    }],
}));

jest.mock('@/services/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

// ─── Test data ────────────────────────────────────────────────

const MOCK_SHOW = {
    id: 'show1',
    title: 'Test Show',
    author: 'Test Author',
    description: 'A show for testing',
    artwork_url: 'https://example.com/art.jpg',
    feed_url: 'https://example.com/feed.xml',
    category: 'technology',
    episode_count: 50,
    is_subscribed: false,
    last_updated: '2026-02-18T00:00:00Z',
};

const MOCK_EPISODE = {
    id: 'ep1',
    show_id: 'show1',
    title: 'Test Episode',
    description: 'First episode',
    audio_url: 'https://cdn.example.com/ep1.mp3',
    artwork_url: null,
    duration_ms: 900000,
    published_at: '2026-02-18T08:00:00Z',
    is_played: false,
    play_position_ms: 0,
    is_downloaded: false,
    episode_number: 1,
    season_number: null,
};

const MOCK_EPISODE_2 = {
    id: 'ep2',
    show_id: 'show1',
    title: 'Test Episode 2',
    description: 'Second episode',
    audio_url: 'https://cdn.example.com/ep2.mp3',
    artwork_url: null,
    duration_ms: 1200000,
    published_at: '2026-02-17T08:00:00Z',
    is_played: false,
    play_position_ms: 0,
    is_downloaded: false,
    episode_number: 2,
    season_number: null,
};

// ─── Reset between tests ─────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    usePodcastStore.setState({
        currentEpisode: null,
        currentShow: null,
        isPlaying: false,
        positionMs: 0,
        durationMs: 0,
        isBuffering: false,
        playbackSpeed: 1,
        volume: 1,
        chapters: [],
        subscriptions: [],
        listeningHistory: [],
        downloadedEpisodes: [],
        episodeQueue: [],
        catalogShows: [],
        currentShowEpisodes: [],
        searchResults: [],
        isLoading: false,
    });
});

// ═══════════════════════════════════════════════════════════════
// Initial state
// ═══════════════════════════════════════════════════════════════

describe('initial state', () => {
    it('should have default values', () => {
        const state = usePodcastStore.getState();
        expect(state.currentEpisode).toBeNull();
        expect(state.currentShow).toBeNull();
        expect(state.isPlaying).toBe(false);
        expect(state.positionMs).toBe(0);
        expect(state.playbackSpeed).toBe(1);
        expect(state.subscriptions).toEqual([]);
        expect(state.listeningHistory).toEqual([]);
        expect(state.downloadedEpisodes).toEqual([]);
        expect(state.episodeQueue).toEqual([]);
    });
});

// ═══════════════════════════════════════════════════════════════
// playEpisode
// ═══════════════════════════════════════════════════════════════

describe('playEpisode', () => {
    it('should play an episode and set state', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);

        const state = usePodcastStore.getState();
        expect(state.currentEpisode).toEqual(MOCK_EPISODE);
        expect(state.currentShow).toEqual(MOCK_SHOW);
        expect(state.durationMs).toBe(900000);
        expect(mockPlayTrack).toHaveBeenCalledTimes(1);
    });

    it('should add to listening history', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);

        const state = usePodcastStore.getState();
        expect(state.listeningHistory).toHaveLength(1);
        expect(state.listeningHistory[0].episode.id).toBe('ep1');
        expect(state.listeningHistory[0].show.id).toBe('show1');
    });

    it('should not duplicate history entries', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);

        const state = usePodcastStore.getState();
        expect(state.listeningHistory).toHaveLength(1);
    });

    it('should set playback speed if not 1x', async () => {
        usePodcastStore.setState({ playbackSpeed: 1.5 });
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);

        expect(mockSetRate).toHaveBeenCalledWith(1.5);
    });

    it('should not set rate if speed is 1x', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);
        expect(mockSetRate).not.toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════
// togglePlayPause
// ═══════════════════════════════════════════════════════════════

describe('togglePlayPause', () => {
    it('should pause when playing', async () => {
        usePodcastStore.setState({ isPlaying: true, currentEpisode: MOCK_EPISODE });
        await usePodcastStore.getState().togglePlayPause();
        expect(mockPause).toHaveBeenCalled();
    });

    it('should resume when paused', async () => {
        usePodcastStore.setState({ isPlaying: false, currentEpisode: MOCK_EPISODE });
        await usePodcastStore.getState().togglePlayPause();
        expect(mockResume).toHaveBeenCalled();
    });

    it('should do nothing without current episode', async () => {
        await usePodcastStore.getState().togglePlayPause();
        expect(mockPause).not.toHaveBeenCalled();
        expect(mockResume).not.toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════
// Seek
// ═══════════════════════════════════════════════════════════════

describe('seek', () => {
    it('seekTo should update position', async () => {
        await usePodcastStore.getState().seekTo(300000);
        expect(mockSeekTo).toHaveBeenCalledWith(300000);
        expect(usePodcastStore.getState().positionMs).toBe(300000);
    });

    it('seekForward should add 30 seconds by default', async () => {
        usePodcastStore.setState({ positionMs: 100000, durationMs: 900000 });
        await usePodcastStore.getState().seekForward();
        expect(mockSeekTo).toHaveBeenCalledWith(130000);
    });

    it('seekForward should not exceed duration', async () => {
        usePodcastStore.setState({ positionMs: 890000, durationMs: 900000 });
        await usePodcastStore.getState().seekForward(30);
        expect(mockSeekTo).toHaveBeenCalledWith(900000);
    });

    it('seekBackward should subtract 15 seconds by default', async () => {
        usePodcastStore.setState({ positionMs: 100000 });
        await usePodcastStore.getState().seekBackward();
        expect(mockSeekTo).toHaveBeenCalledWith(85000);
    });

    it('seekBackward should not go below 0', async () => {
        usePodcastStore.setState({ positionMs: 5000 });
        await usePodcastStore.getState().seekBackward(15);
        expect(mockSeekTo).toHaveBeenCalledWith(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Speed
// ═══════════════════════════════════════════════════════════════

describe('setSpeed', () => {
    it('should update playback speed', () => {
        usePodcastStore.getState().setSpeed(1.5);
        expect(usePodcastStore.getState().playbackSpeed).toBe(1.5);
        expect(mockSetRate).toHaveBeenCalledWith(1.5);
    });

    it('should support 0.5x', () => {
        usePodcastStore.getState().setSpeed(0.5);
        expect(usePodcastStore.getState().playbackSpeed).toBe(0.5);
    });

    it('should support 2x', () => {
        usePodcastStore.getState().setSpeed(2);
        expect(usePodcastStore.getState().playbackSpeed).toBe(2);
    });
});

// ═══════════════════════════════════════════════════════════════
// Stop
// ═══════════════════════════════════════════════════════════════

describe('stopPlayback', () => {
    it('should stop and clear state', async () => {
        usePodcastStore.setState({
            currentEpisode: MOCK_EPISODE,
            currentShow: MOCK_SHOW,
            isPlaying: true,
            positionMs: 300000,
        });

        await usePodcastStore.getState().stopPlayback();

        const state = usePodcastStore.getState();
        expect(state.currentEpisode).toBeNull();
        expect(state.currentShow).toBeNull();
        expect(state.isPlaying).toBe(false);
        expect(state.positionMs).toBe(0);
        expect(mockStop).toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════
// Subscriptions
// ═══════════════════════════════════════════════════════════════

describe('subscriptions', () => {
    it('should subscribe to a show', () => {
        usePodcastStore.getState().subscribe(MOCK_SHOW);
        const subs = usePodcastStore.getState().subscriptions;
        expect(subs).toHaveLength(1);
        expect(subs[0].id).toBe('show1');
        expect(subs[0].is_subscribed).toBe(true);
    });

    it('should not duplicate subscriptions', () => {
        usePodcastStore.getState().subscribe(MOCK_SHOW);
        usePodcastStore.getState().subscribe(MOCK_SHOW);
        expect(usePodcastStore.getState().subscriptions).toHaveLength(1);
    });

    it('should unsubscribe', () => {
        usePodcastStore.getState().subscribe(MOCK_SHOW);
        usePodcastStore.getState().unsubscribe('show1');
        expect(usePodcastStore.getState().subscriptions).toHaveLength(0);
    });

    it('isSubscribed should return correct value', () => {
        expect(usePodcastStore.getState().isSubscribed('show1')).toBe(false);
        usePodcastStore.getState().subscribe(MOCK_SHOW);
        expect(usePodcastStore.getState().isSubscribed('show1')).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// History & Resume
// ═══════════════════════════════════════════════════════════════

describe('history and resume', () => {
    it('savePosition should update history entry', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);
        usePodcastStore.getState().savePosition('ep1', 450000);

        const entry = usePodcastStore.getState().listeningHistory[0];
        expect(entry.last_position_ms).toBe(450000);
    });

    it('getResumePosition should return saved position', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);
        usePodcastStore.getState().savePosition('ep1', 450000);

        const pos = usePodcastStore.getState().getResumePosition('ep1');
        expect(pos).toBe(450000);
    });

    it('getResumePosition should return 0 for unknown episode', () => {
        expect(usePodcastStore.getState().getResumePosition('unknown')).toBe(0);
    });

    it('markPlayed should set is_played and full position', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);
        usePodcastStore.getState().markPlayed('ep1');

        const entry = usePodcastStore.getState().listeningHistory[0];
        expect(entry.episode.is_played).toBe(true);
        expect(entry.last_position_ms).toBe(MOCK_EPISODE.duration_ms);
    });

    it('getResumePosition should return 0 for played episodes', async () => {
        await usePodcastStore.getState().playEpisode(MOCK_EPISODE, MOCK_SHOW);
        usePodcastStore.getState().markPlayed('ep1');

        expect(usePodcastStore.getState().getResumePosition('ep1')).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Downloads
// ═══════════════════════════════════════════════════════════════

describe('downloads', () => {
    it('markDownloaded should add episode', () => {
        usePodcastStore.getState().markDownloaded(MOCK_EPISODE);
        const downloads = usePodcastStore.getState().downloadedEpisodes;
        expect(downloads).toHaveLength(1);
        expect(downloads[0].is_downloaded).toBe(true);
    });

    it('should not duplicate downloads', () => {
        usePodcastStore.getState().markDownloaded(MOCK_EPISODE);
        usePodcastStore.getState().markDownloaded(MOCK_EPISODE);
        expect(usePodcastStore.getState().downloadedEpisodes).toHaveLength(1);
    });

    it('removeDownload should remove episode', () => {
        usePodcastStore.getState().markDownloaded(MOCK_EPISODE);
        usePodcastStore.getState().removeDownload('ep1');
        expect(usePodcastStore.getState().downloadedEpisodes).toHaveLength(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// Queue
// ═══════════════════════════════════════════════════════════════

describe('queue', () => {
    it('addToQueue should add episode', () => {
        usePodcastStore.getState().addToQueue(MOCK_EPISODE);
        expect(usePodcastStore.getState().episodeQueue).toHaveLength(1);
    });

    it('should not duplicate queue entries', () => {
        usePodcastStore.getState().addToQueue(MOCK_EPISODE);
        usePodcastStore.getState().addToQueue(MOCK_EPISODE);
        expect(usePodcastStore.getState().episodeQueue).toHaveLength(1);
    });

    it('removeFromQueue should remove episode', () => {
        usePodcastStore.getState().addToQueue(MOCK_EPISODE);
        usePodcastStore.getState().removeFromQueue('ep1');
        expect(usePodcastStore.getState().episodeQueue).toHaveLength(0);
    });

    it('clearQueue should remove all', () => {
        usePodcastStore.getState().addToQueue(MOCK_EPISODE);
        usePodcastStore.getState().addToQueue(MOCK_EPISODE_2);
        usePodcastStore.getState().clearQueue();
        expect(usePodcastStore.getState().episodeQueue).toHaveLength(0);
    });

    it('playNext should play first in queue', async () => {
        usePodcastStore.getState().subscribe(MOCK_SHOW);
        usePodcastStore.getState().addToQueue(MOCK_EPISODE);
        usePodcastStore.getState().addToQueue(MOCK_EPISODE_2);

        await usePodcastStore.getState().playNext();

        const state = usePodcastStore.getState();
        expect(state.currentEpisode.id).toBe('ep1');
        expect(state.episodeQueue).toHaveLength(1);
    });

    it('playNext should stop when queue is empty', async () => {
        await usePodcastStore.getState().playNext();
        expect(mockStop).toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════
// Catalogue
// ═══════════════════════════════════════════════════════════════

describe('catalogue', () => {
    it('loadCatalogue should populate shows', async () => {
        await usePodcastStore.getState().loadCatalogue();
        const state = usePodcastStore.getState();
        expect(state.catalogShows.length).toBeGreaterThan(0);
        expect(state.isLoading).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// formatDuration
// ═══════════════════════════════════════════════════════════════

describe('formatDuration', () => {
    it('should format minutes:seconds', () => {
        expect(usePodcastStore.getState().formatDuration(930000)).toBe('15:30');
    });

    it('should format hours:minutes:seconds', () => {
        expect(usePodcastStore.getState().formatDuration(5400000)).toBe('1:30:00');
    });

    it('should pad seconds', () => {
        expect(usePodcastStore.getState().formatDuration(65000)).toBe('1:05');
    });

    it('should handle 0', () => {
        expect(usePodcastStore.getState().formatDuration(0)).toBe('0:00');
    });
});
