/**
 * Tests for stores/music-store.ts
 * Zustand store — player + library actions
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

jest.mock("@/services/audio-player", () => ({
    playTrack: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    resume: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    seekTo: jest.fn().mockResolvedValue(undefined),
    setLooping: jest.fn().mockResolvedValue(undefined),
    setStatusCallback: jest.fn(),
}));

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import * as AudioPlayer from "@/services/audio-player";
import { useMusicStore } from "../music-store";

// --- Helpers ---
const makeTrack = (overrides: any = {}) => ({
    id: "t1",
    title: "Test Track",
    artist: "Test Artist",
    album: "Test Album",
    audio_url: "https://example.com/track.mp3",
    artwork_url: null,
    duration_ms: 200000,
    genre: "electronic",
    play_count: 100,
    is_liked: false,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
});

const resetState = () => {
    useMusicStore.setState({
        currentTrack: null,
        queue: [],
        queueIndex: -1,
        isPlaying: false,
        positionMs: 0,
        durationMs: 0,
        isBuffering: false,
        repeatMode: "off",
        shuffle: false,
        volume: 1,
        playlists: [],
        likedTracks: [],
        recentlyPlayed: [],
    });
};

// --- Tests ---
describe("useMusicStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetState();
    });

    // ── Initial state ──
    describe("initial state", () => {
        it("has no current track and empty queue", () => {
            const s = useMusicStore.getState();
            expect(s.currentTrack).toBeNull();
            expect(s.queue).toEqual([]);
            expect(s.queueIndex).toBe(-1);
            expect(s.isPlaying).toBe(false);
        });
    });

    // ── play ──
    describe("play", () => {
        it("should set current track and call AudioPlayer.playTrack", async () => {
            const track = makeTrack();
            await useMusicStore.getState().play(track);

            const s = useMusicStore.getState();
            expect(s.currentTrack).toEqual(track);
            expect(s.queue).toEqual([track]);
            expect(s.queueIndex).toBe(0);
            expect(AudioPlayer.playTrack).toHaveBeenCalledWith(track);
        });

        it("should set queue when provided", async () => {
            const t1 = makeTrack({ id: "t1" });
            const t2 = makeTrack({ id: "t2" });
            const t3 = makeTrack({ id: "t3" });

            await useMusicStore.getState().play(t2, [t1, t2, t3]);

            const s = useMusicStore.getState();
            expect(s.currentTrack).toEqual(t2);
            expect(s.queue).toHaveLength(3);
            expect(s.queueIndex).toBe(1);
        });

        it("should add to recently played", async () => {
            const track = makeTrack();
            await useMusicStore.getState().play(track);

            expect(useMusicStore.getState().recentlyPlayed[0]).toEqual(track);
        });

        it("should handle play error gracefully", async () => {
            (AudioPlayer.playTrack as jest.Mock).mockRejectedValueOnce(
                new Error("Audio error")
            );
            const track = makeTrack();

            await useMusicStore.getState().play(track);

            expect(useMusicStore.getState().isPlaying).toBe(false);
        });
    });

    // ── togglePlayPause ──
    describe("togglePlayPause", () => {
        it("should pause when playing", async () => {
            useMusicStore.setState({
                currentTrack: makeTrack(),
                isPlaying: true,
            });

            await useMusicStore.getState().togglePlayPause();

            expect(AudioPlayer.pause).toHaveBeenCalled();
        });

        it("should resume when paused", async () => {
            useMusicStore.setState({
                currentTrack: makeTrack(),
                isPlaying: false,
            });

            await useMusicStore.getState().togglePlayPause();

            expect(AudioPlayer.resume).toHaveBeenCalled();
        });

        it("should do nothing without current track", async () => {
            await useMusicStore.getState().togglePlayPause();
            expect(AudioPlayer.pause).not.toHaveBeenCalled();
            expect(AudioPlayer.resume).not.toHaveBeenCalled();
        });
    });

    // ── next ──
    describe("next", () => {
        it("should advance to next track", async () => {
            const t1 = makeTrack({ id: "t1" });
            const t2 = makeTrack({ id: "t2" });
            useMusicStore.setState({
                queue: [t1, t2],
                queueIndex: 0,
                currentTrack: t1,
            });

            await useMusicStore.getState().next();

            expect(useMusicStore.getState().currentTrack).toEqual(t2);
            expect(useMusicStore.getState().queueIndex).toBe(1);
            expect(AudioPlayer.playTrack).toHaveBeenCalledWith(t2);
        });

        it("should wrap to beginning when repeatMode=all", async () => {
            const t1 = makeTrack({ id: "t1" });
            const t2 = makeTrack({ id: "t2" });
            useMusicStore.setState({
                queue: [t1, t2],
                queueIndex: 1,
                currentTrack: t2,
                repeatMode: "all",
            });

            await useMusicStore.getState().next();

            expect(useMusicStore.getState().currentTrack).toEqual(t1);
            expect(useMusicStore.getState().queueIndex).toBe(0);
        });

        it("should stop at end of queue when repeatMode=off", async () => {
            const t1 = makeTrack({ id: "t1" });
            useMusicStore.setState({
                queue: [t1],
                queueIndex: 0,
                currentTrack: t1,
                repeatMode: "off",
            });

            await useMusicStore.getState().next();

            expect(AudioPlayer.stop).toHaveBeenCalled();
            expect(useMusicStore.getState().isPlaying).toBe(false);
        });

        it("should do nothing with empty queue", async () => {
            await useMusicStore.getState().next();
            expect(AudioPlayer.playTrack).not.toHaveBeenCalled();
        });
    });

    // ── previous ──
    describe("previous", () => {
        it("should go to previous track when position < 3s", async () => {
            const t1 = makeTrack({ id: "t1" });
            const t2 = makeTrack({ id: "t2" });
            useMusicStore.setState({
                queue: [t1, t2],
                queueIndex: 1,
                currentTrack: t2,
                positionMs: 1000,
            });

            await useMusicStore.getState().previous();

            expect(useMusicStore.getState().currentTrack).toEqual(t1);
            expect(AudioPlayer.playTrack).toHaveBeenCalledWith(t1);
        });

        it("should restart track when position > 3s", async () => {
            useMusicStore.setState({
                queue: [makeTrack()],
                queueIndex: 0,
                currentTrack: makeTrack(),
                positionMs: 5000,
            });

            await useMusicStore.getState().previous();

            expect(AudioPlayer.seekTo).toHaveBeenCalledWith(0);
        });
    });

    // ── seekTo ──
    describe("seekTo", () => {
        it("should seek and update position", async () => {
            await useMusicStore.getState().seekTo(30000);

            expect(AudioPlayer.seekTo).toHaveBeenCalledWith(30000);
            expect(useMusicStore.getState().positionMs).toBe(30000);
        });
    });

    // ── setRepeat ──
    describe("setRepeat", () => {
        it("should set repeat mode", () => {
            useMusicStore.getState().setRepeat("all");
            expect(useMusicStore.getState().repeatMode).toBe("all");
            expect(AudioPlayer.setLooping).toHaveBeenCalledWith("all");
        });
    });

    // ── toggleShuffle ──
    describe("toggleShuffle", () => {
        it("should toggle shuffle on", () => {
            const t1 = makeTrack({ id: "t1" });
            const t2 = makeTrack({ id: "t2" });
            useMusicStore.setState({
                queue: [t1, t2],
                currentTrack: t1,
                shuffle: false,
            });

            useMusicStore.getState().toggleShuffle();

            expect(useMusicStore.getState().shuffle).toBe(true);
            expect(useMusicStore.getState().queue).toHaveLength(2);
        });

        it("should toggle shuffle off", () => {
            useMusicStore.setState({ shuffle: true });
            useMusicStore.getState().toggleShuffle();
            expect(useMusicStore.getState().shuffle).toBe(false);
        });
    });

    // ── stopPlayback ──
    describe("stopPlayback", () => {
        it("should stop and reset player state", async () => {
            useMusicStore.setState({
                currentTrack: makeTrack(),
                isPlaying: true,
                positionMs: 5000,
            });

            await useMusicStore.getState().stopPlayback();

            const s = useMusicStore.getState();
            expect(s.currentTrack).toBeNull();
            expect(s.isPlaying).toBe(false);
            expect(s.positionMs).toBe(0);
            expect(s.queue).toEqual([]);
            expect(AudioPlayer.stop).toHaveBeenCalled();
        });
    });

    // ── loadLibrary ──
    describe("loadLibrary", () => {
        it("should load mock playlists and liked tracks", async () => {
            await useMusicStore.getState().loadLibrary();

            const s = useMusicStore.getState();
            expect(s.playlists.length).toBeGreaterThan(0);
            expect(s.likedTracks.length).toBeGreaterThan(0);
        });
    });

    // ── toggleLike ──
    describe("toggleLike", () => {
        it("should like an unliked track", async () => {
            await useMusicStore.getState().loadLibrary();
            const playlists = useMusicStore.getState().playlists;
            const track = playlists[0].tracks[0];

            useMusicStore.getState().toggleLike(track.id);

            const liked = useMusicStore.getState().likedTracks;
            expect(liked.some((t) => t.id === track.id)).toBe(true);
        });

        it("should unlike a liked track", async () => {
            await useMusicStore.getState().loadLibrary();
            const likedBefore = useMusicStore.getState().likedTracks;
            const trackToUnlike = likedBefore[0];

            useMusicStore.getState().toggleLike(trackToUnlike.id);

            const likedAfter = useMusicStore.getState().likedTracks;
            expect(likedAfter.some((t) => t.id === trackToUnlike.id)).toBe(false);
        });
    });

    // ── formatDuration ──
    describe("formatDuration", () => {
        it("should format milliseconds to m:ss", () => {
            const { formatDuration } = useMusicStore.getState();
            expect(formatDuration(0)).toBe("0:00");
            expect(formatDuration(60000)).toBe("1:00");
            expect(formatDuration(90000)).toBe("1:30");
            expect(formatDuration(3605000)).toBe("60:05");
        });
    });
});
