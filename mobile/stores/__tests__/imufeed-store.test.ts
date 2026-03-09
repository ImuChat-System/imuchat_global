/**
 * Tests for stores/imufeed-store.ts
 * Zustand store tested via getState()/setState()
 */

jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock("../../services/logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

const mockFetchFeedBySource = jest.fn();
const mockToggleVideoLike = jest.fn();
const mockToggleVideoBookmark = jest.fn();
const mockRecordVideoView = jest.fn();
const mockFetchVideoComments = jest.fn();
const mockAddVideoComment = jest.fn();
const mockDeleteVideoComment = jest.fn();
const mockToggleCommentLike = jest.fn();
const mockFetchTrendingHashtags = jest.fn();
const mockUploadVideo = jest.fn();
const mockToggleFollow = jest.fn();

jest.mock("../../services/imufeed-api", () => ({
    fetchFeedBySource: (...args: any[]) => mockFetchFeedBySource(...args),
    toggleVideoLike: (...args: any[]) => mockToggleVideoLike(...args),
    toggleVideoBookmark: (...args: any[]) => mockToggleVideoBookmark(...args),
    recordVideoView: (...args: any[]) => mockRecordVideoView(...args),
    fetchVideoComments: (...args: any[]) => mockFetchVideoComments(...args),
    addVideoComment: (...args: any[]) => mockAddVideoComment(...args),
    deleteVideoComment: (...args: any[]) => mockDeleteVideoComment(...args),
    toggleCommentLike: (...args: any[]) => mockToggleCommentLike(...args),
    fetchTrendingHashtags: (...args: any[]) => mockFetchTrendingHashtags(...args),
    uploadVideo: (...args: any[]) => mockUploadVideo(...args),
    toggleFollow: (...args: any[]) => mockToggleFollow(...args),
}));

import type { FeedComment, ImuFeedVideo } from "../../types/imufeed";
import { useImuFeedStore } from "../imufeed-store";

// ─── Factories ──────────────────────────────────────────────

const makeVideo = (id: string, overrides: Partial<ImuFeedVideo> = {}): ImuFeedVideo => ({
    id,
    author: {
        id: "author-1",
        username: "creator",
        display_name: "Creator",
        avatar_url: null,
        is_verified: false,
        is_following: false,
        followers_count: 100,
    },
    video_url: `https://example.com/video/${id}.mp4`,
    thumbnail_url: null,
    caption: "Test video",
    hashtags: [],
    sound: null,
    category: "general",
    visibility: "public",
    status: "published",
    width: 1080,
    height: 1920,
    duration_ms: 15000,
    file_size_bytes: 5_000_000,
    views_count: 0,
    likes_count: 10,
    comments_count: 2,
    shares_count: 0,
    bookmarks_count: 0,
    is_liked: false,
    is_bookmarked: false,
    allow_comments: true,
    allow_duet: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
});

const makeComment = (id: string, videoId: string): FeedComment => ({
    id,
    video_id: videoId,
    user_id: "user-1",
    username: "commenter",
    display_name: "Commenter",
    avatar_url: null,
    content: "Nice video!",
    likes_count: 0,
    is_liked: false,
    parent_id: null,
    reply_count: 0,
    created_at: "2024-01-01T00:00:00Z",
});

describe("useImuFeedStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useImuFeedStore.getState().reset();
    });

    // ─── Initial State ────────────────────────────────

    it("should have correct initial state", () => {
        const state = useImuFeedStore.getState();
        expect(state.feedSource).toBe("for_you");
        expect(state.forYouVideos).toEqual([]);
        expect(state.followingVideos).toEqual([]);
        expect(state.trendingVideos).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.uploadProgress).toBeNull();
        expect(state.player.isPaused).toBe(true);
        expect(state.player.isMuted).toBe(false);
    });

    // ─── Feed Source ──────────────────────────────────

    it("setFeedSource changes source and triggers load if empty", async () => {
        const page = { videos: [makeVideo("v1")], cursor: "c1", hasMore: true };
        mockFetchFeedBySource.mockResolvedValue(page);

        useImuFeedStore.getState().setFeedSource("following");
        expect(useImuFeedStore.getState().feedSource).toBe("following");

        // Wait for async load
        await new Promise((r) => setTimeout(r, 50));
        expect(mockFetchFeedBySource).toHaveBeenCalledWith("following");
    });

    it("setFeedSource does not reload if feed already has videos", () => {
        useImuFeedStore.setState({ forYouVideos: [makeVideo("v1")] });
        useImuFeedStore.getState().setFeedSource("for_you");
        expect(mockFetchFeedBySource).not.toHaveBeenCalled();
    });

    // ─── Load Feed ────────────────────────────────────

    it("loadFeed populates for_you videos", async () => {
        const videos = [makeVideo("v1"), makeVideo("v2")];
        mockFetchFeedBySource.mockResolvedValue({ videos, cursor: "c1", hasMore: true });

        await useImuFeedStore.getState().loadFeed("for_you");

        const state = useImuFeedStore.getState();
        expect(state.forYouVideos).toHaveLength(2);
        expect(state.forYouCursor).toBe("c1");
        expect(state.forYouHasMore).toBe(true);
        expect(state.isLoading).toBe(false);
    });

    it("loadFeed sets error on failure", async () => {
        mockFetchFeedBySource.mockRejectedValue(new Error("Network error"));

        await useImuFeedStore.getState().loadFeed("for_you");

        expect(useImuFeedStore.getState().error).toBe("Network error");
        expect(useImuFeedStore.getState().isLoading).toBe(false);
    });

    // ─── Player Actions ───────────────────────────────

    it("setActiveVideo updates player state", () => {
        const video = makeVideo("v1");
        useImuFeedStore.getState().setActiveVideo(video, 3);

        const { player } = useImuFeedStore.getState();
        expect(player.currentVideoId).toBe("v1");
        expect(player.currentIndex).toBe(3);
        expect(player.isPaused).toBe(false);
        expect(player.positionMs).toBe(0);
    });

    it("setActiveVideo with null stops playback", () => {
        useImuFeedStore.getState().setActiveVideo(makeVideo("v1"), 0);
        useImuFeedStore.getState().setActiveVideo(null, 0);

        expect(useImuFeedStore.getState().player.isPaused).toBe(true);
        expect(useImuFeedStore.getState().player.currentVideoId).toBeNull();
    });

    it("togglePlayPause toggles isPaused", () => {
        useImuFeedStore.getState().setActiveVideo(makeVideo("v1"), 0);
        expect(useImuFeedStore.getState().player.isPaused).toBe(false);

        useImuFeedStore.getState().togglePlayPause();
        expect(useImuFeedStore.getState().player.isPaused).toBe(true);

        useImuFeedStore.getState().togglePlayPause();
        expect(useImuFeedStore.getState().player.isPaused).toBe(false);
    });

    it("setMuted updates mute state", () => {
        useImuFeedStore.getState().setMuted(true);
        expect(useImuFeedStore.getState().player.isMuted).toBe(true);

        useImuFeedStore.getState().setMuted(false);
        expect(useImuFeedStore.getState().player.isMuted).toBe(false);
    });

    // ─── Optimistic Like ─────────────────────────────

    it("toggleLike optimistically updates like state", async () => {
        const video = makeVideo("v1", { is_liked: false, likes_count: 10 });
        useImuFeedStore.setState({ forYouVideos: [video] });
        mockToggleVideoLike.mockResolvedValue(undefined);

        await useImuFeedStore.getState().toggleLike("v1");

        const updated = useImuFeedStore.getState().forYouVideos[0];
        expect(updated.is_liked).toBe(true);
        expect(updated.likes_count).toBe(11);
    });

    it("toggleLike rolls back on error", async () => {
        const video = makeVideo("v1", { is_liked: false, likes_count: 10 });
        useImuFeedStore.setState({ forYouVideos: [video] });
        mockToggleVideoLike.mockRejectedValue(new Error("fail"));

        await useImuFeedStore.getState().toggleLike("v1");

        const updated = useImuFeedStore.getState().forYouVideos[0];
        expect(updated.is_liked).toBe(false);
        expect(updated.likes_count).toBe(10);
    });

    // ─── Optimistic Bookmark ──────────────────────────

    it("toggleBookmark optimistically updates bookmark state", async () => {
        const video = makeVideo("v1", { is_bookmarked: false, bookmarks_count: 5 });
        useImuFeedStore.setState({ forYouVideos: [video] });
        mockToggleVideoBookmark.mockResolvedValue(undefined);

        await useImuFeedStore.getState().toggleBookmark("v1");

        const updated = useImuFeedStore.getState().forYouVideos[0];
        expect(updated.is_bookmarked).toBe(true);
        expect(updated.bookmarks_count).toBe(6);
    });

    // ─── Comments ─────────────────────────────────────

    it("loadComments populates activeVideoComments", async () => {
        const comments = [makeComment("c1", "v1"), makeComment("c2", "v1")];
        mockFetchVideoComments.mockResolvedValue({ comments, hasMore: false });

        await useImuFeedStore.getState().loadComments("v1");

        expect(useImuFeedStore.getState().activeVideoComments).toHaveLength(2);
        expect(useImuFeedStore.getState().commentsHasMore).toBe(false);
    });

    it("addComment prepends to activeVideoComments", async () => {
        const existing = [makeComment("c1", "v1")];
        useImuFeedStore.setState({ activeVideoComments: existing });

        const newComment = makeComment("c2", "v1");
        mockAddVideoComment.mockResolvedValue(newComment);

        const video = makeVideo("v1", { comments_count: 1 });
        useImuFeedStore.setState({ forYouVideos: [video] });

        await useImuFeedStore.getState().addComment("v1", "Great!");

        expect(useImuFeedStore.getState().activeVideoComments).toHaveLength(2);
        expect(useImuFeedStore.getState().activeVideoComments[0].id).toBe("c2");
    });

    it("clearComments empties the list", () => {
        useImuFeedStore.setState({
            activeVideoComments: [makeComment("c1", "v1")],
            commentsHasMore: true,
        });

        useImuFeedStore.getState().clearComments();

        expect(useImuFeedStore.getState().activeVideoComments).toEqual([]);
        expect(useImuFeedStore.getState().commentsHasMore).toBe(false);
    });

    // ─── Upload ───────────────────────────────────────

    it("clearUploadProgress resets upload progress", () => {
        useImuFeedStore.setState({
            uploadProgress: { video_id: "v1", stage: "uploading", percent: 50 },
        });

        useImuFeedStore.getState().clearUploadProgress();
        expect(useImuFeedStore.getState().uploadProgress).toBeNull();
    });

    // ─── Trending Hashtags ────────────────────────────

    it("loadTrendingHashtags populates hashtags", async () => {
        const hashtags = [
            { tag: "dance", video_count: 100 },
            { tag: "music", video_count: 50 },
        ];
        mockFetchTrendingHashtags.mockResolvedValue(hashtags);

        await useImuFeedStore.getState().loadTrendingHashtags();

        expect(useImuFeedStore.getState().trendingHashtags).toEqual(hashtags);
    });

    // ─── Reset ────────────────────────────────────────

    it("reset restores initial state", () => {
        useImuFeedStore.setState({
            feedSource: "following",
            forYouVideos: [makeVideo("v1")],
            isLoading: true,
            uploadProgress: { video_id: "", stage: "uploading", percent: 50 },
        });

        useImuFeedStore.getState().reset();

        const state = useImuFeedStore.getState();
        expect(state.feedSource).toBe("for_you");
        expect(state.forYouVideos).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.uploadProgress).toBeNull();
    });
});
