/**
 * Tests for services/imufeed/video-upload.ts
 */

jest.mock("expo-image-picker", () => ({
    requestCameraPermissionsAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Videos: "Videos" },
    UIImagePickerControllerQualityType: { Medium: 1 },
}));

jest.mock("expo-file-system", () => ({
    getInfoAsync: jest.fn(),
}));

jest.mock("../logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock("../../services/imufeed-api", () => ({
    uploadVideo: jest.fn(),
}));

import * as FileSystem from "expo-file-system";
import {
    extractHashtags,
    formatHashtag,
    validateVideo,
    type VideoPickResult,
} from "../imufeed/video-upload";

describe("video-upload", () => {
    // ─── extractHashtags ─────────────────────────────

    describe("extractHashtags", () => {
        it("extracts hashtags from text", () => {
            const result = extractHashtags("Hello #world #dance vibes");
            expect(result).toEqual(["world", "dance"]);
        });

        it("returns empty array when no hashtags", () => {
            expect(extractHashtags("no hashtags here")).toEqual([]);
        });

        it("handles empty string", () => {
            expect(extractHashtags("")).toEqual([]);
        });

        it("deduplicates hashtags", () => {
            const result = extractHashtags("#cool #nice #cool");
            expect(result).toEqual(["cool", "nice"]);
        });
    });

    // ─── formatHashtag ───────────────────────────────

    describe("formatHashtag", () => {
        it("adds # prefix if missing", () => {
            expect(formatHashtag("dance")).toBe("#dance");
        });

        it("keeps # prefix if already present", () => {
            expect(formatHashtag("#dance")).toBe("#dance");
        });

        it("preserves tag casing", () => {
            expect(formatHashtag("DANCE")).toBe("#DANCE");
        });
    });

    // ─── validateVideo ───────────────────────────────

    describe("validateVideo", () => {
        const validVideo: VideoPickResult = {
            uri: "file:///video.mp4",
            width: 1080,
            height: 1920,
            duration: 15,
            fileSize: 10_000_000,
            mimeType: "video/mp4",
        };

        beforeEach(() => {
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
                exists: true,
                size: validVideo.fileSize,
            });
        });

        it("accepts a valid video", async () => {
            const result = await validateVideo(validVideo);
            expect(result.valid).toBe(true);
        });

        it("rejects video too long (> 180s)", async () => {
            const result = await validateVideo({ ...validVideo, duration: 200 });
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("rejects video too short (< 1s)", async () => {
            const result = await validateVideo({ ...validVideo, duration: 0.5 });
            expect(result.valid).toBe(false);
        });

        it("rejects file too large (> 500MB)", async () => {
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
                exists: true,
                size: 600_000_000,
            });
            const result = await validateVideo({ ...validVideo, fileSize: 600_000_000 });
            expect(result.valid).toBe(false);
        });

        it("rejects unsupported file extension", async () => {
            const result = await validateVideo({ ...validVideo, uri: "file:///video.gif" });
            expect(result.valid).toBe(false);
        });
    });
});
