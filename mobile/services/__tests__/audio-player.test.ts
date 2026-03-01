/**
 * Tests for services/audio-player.ts
 * Works with the jest.setup.js expo-av mock which creates a NEW sound per call.
 * We capture each sound via Audio.Sound.createAsync.mock.results after playTrack.
 */

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

import { Audio } from "expo-av";
import {
    cleanup,
    configureAudioMode,
    isLoaded,
    pause,
    playTrack,
    resume,
    seekTo,
    setStatusCallback,
    stop,
} from "../audio-player";

// ── Helper: retrieve the sound mock created by the last playTrack call ──
const getLastSound = (): Record<string, jest.Mock> => {
    const results = (Audio.Sound.createAsync as jest.Mock).mock.results;
    const last = results[results.length - 1];
    return last?.value?.sound;
};

// ── Helpers ──
const makeTrack = (overrides: any = {}) => ({
    id: "t1",
    title: "Test",
    artist: "Artist",
    album: "Album",
    audio_url: "https://example.com/track.mp3",
    artwork_url: null,
    duration_ms: 200000,
    genre: "electronic",
    play_count: 0,
    is_liked: false,
    created_at: "2026-01-01",
    ...overrides,
});

beforeEach(async () => {
    jest.clearAllMocks();
    await cleanup();
});

describe("audio-player", () => {
    // ── configureAudioMode ──
    describe("configureAudioMode", () => {
        it("calls Audio.setAudioModeAsync with correct config", async () => {
            await configureAudioMode();

            expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                })
            );
        });
    });

    // ── setStatusCallback ──
    describe("setStatusCallback", () => {
        it("accepts a callback without error", () => {
            expect(() => setStatusCallback(jest.fn())).not.toThrow();
        });

        it("accepts null", () => {
            expect(() => setStatusCallback(null)).not.toThrow();
        });
    });

    // ── playTrack ──
    describe("playTrack", () => {
        it("creates sound and plays", async () => {
            const track = makeTrack();
            await playTrack(track);

            expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
                { uri: track.audio_url },
                expect.objectContaining({ shouldPlay: true }),
                expect.any(Function)
            );
        });

        it("unloads previous sound before playing new one", async () => {
            await playTrack(makeTrack({ id: "t1" }));
            const firstSound = getLastSound();

            await playTrack(makeTrack({ id: "t2" }));

            expect(firstSound.unloadAsync).toHaveBeenCalled();
        });

        it("throws when createAsync fails", async () => {
            (Audio.Sound.createAsync as jest.Mock).mockImplementationOnce(() => {
                throw new Error("No audio");
            });

            await expect(playTrack(makeTrack())).rejects.toThrow("No audio");
        });
    });

    // ── resume ──
    describe("resume", () => {
        it("calls playAsync on loaded sound", async () => {
            await playTrack(makeTrack());
            const sound = getLastSound();
            await resume();

            expect(sound.playAsync).toHaveBeenCalled();
        });
    });

    // ── pause ──
    describe("pause", () => {
        it("calls pauseAsync on loaded sound", async () => {
            await playTrack(makeTrack());
            const sound = getLastSound();
            await pause();

            expect(sound.pauseAsync).toHaveBeenCalled();
        });
    });

    // ── stop ──
    describe("stop", () => {
        it("stops and unloads sound", async () => {
            await playTrack(makeTrack());
            const sound = getLastSound();
            await stop();

            expect(sound.stopAsync).toHaveBeenCalled();
            expect(sound.unloadAsync).toHaveBeenCalled();
        });

        it("reports not loaded after stop", async () => {
            await playTrack(makeTrack());
            await stop();

            expect(isLoaded()).toBe(false);
        });
    });

    // ── seekTo ──
    describe("seekTo", () => {
        it("calls setPositionAsync", async () => {
            await playTrack(makeTrack());
            const sound = getLastSound();
            await seekTo(30000);

            expect(sound.setPositionAsync).toHaveBeenCalledWith(30000);
        });
    });

    // ── isLoaded ──
    describe("isLoaded", () => {
        it("returns true after playTrack", async () => {
            await playTrack(makeTrack());
            expect(isLoaded()).toBe(true);
        });

        it("returns false after stop", async () => {
            await playTrack(makeTrack());
            await stop();
            expect(isLoaded()).toBe(false);
        });

        it("returns false before any playback", async () => {
            expect(isLoaded()).toBe(false);
        });
    });

    // ── cleanup ──
    describe("cleanup", () => {
        it("unloads sound and clears state", async () => {
            await playTrack(makeTrack());
            const sound = getLastSound();
            await cleanup();

            expect(sound.unloadAsync).toHaveBeenCalled();
            expect(isLoaded()).toBe(false);
        });
    });
});
