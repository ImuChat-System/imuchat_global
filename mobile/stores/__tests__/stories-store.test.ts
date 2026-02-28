/**
 * Tests for stores/stories-store.ts
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

const mockGetStoriesFeed = jest.fn();
const mockGetMyStories = jest.fn();
const mockCreateStory = jest.fn();
const mockDeleteStory = jest.fn();
const mockArchiveStory = jest.fn();
const mockMarkStoryViewed = jest.fn();

jest.mock("../../services/stories-api", () => ({
    getStoriesFeed: (...args: any[]) => mockGetStoriesFeed(...args),
    getMyStories: (...args: any[]) => mockGetMyStories(...args),
    createStory: (...args: any[]) => mockCreateStory(...args),
    deleteStory: (...args: any[]) => mockDeleteStory(...args),
    archiveStory: (...args: any[]) => mockArchiveStory(...args),
    markStoryViewed: (...args: any[]) => mockMarkStoryViewed(...args),
}));

import { useStoriesStore } from "../stories-store";

const makeStory = (id: string, userId: string = "u-1", viewed = false): any => ({
    id,
    user_id: userId,
    type: "text" as const,
    media_url: null,
    thumbnail_url: null,
    text_content: "Hello",
    background_color: "#6366f1",
    text_color: "#ffffff",
    font_style: "normal" as const,
    visibility: "all" as const,
    allow_replies: true,
    duration_seconds: 24 * 3600,
    created_at: "2024-01-01T00:00:00Z",
    expires_at: "2024-01-02T00:00:00Z",
    is_archived: false,
    archived_at: null,
    username: "bob",
    display_name: "Bob" as string | null,
    author_avatar: null as string | null,
    view_count: 0,
    is_viewed: viewed,
});

const makeGroup = (userId: string, stories: any[], hasUnread = true) => ({
    user_id: userId,
    username: "user-" + userId,
    display_name: "User " + userId,
    avatar_url: null,
    has_unread: hasUnread,
    stories,
});

describe("useStoriesStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useStoriesStore.getState().reset();
    });

    // ── Initial state ───────────────────────
    describe("initial state", () => {
        it("has empty story groups", () => {
            expect(useStoriesStore.getState().storyGroups).toEqual([]);
        });

        it("has empty myStories", () => {
            expect(useStoriesStore.getState().myStories).toEqual([]);
        });

        it("is not loading", () => {
            expect(useStoriesStore.getState().isLoading).toBe(false);
        });

        it("viewer is closed", () => {
            expect(useStoriesStore.getState().viewer.isOpen).toBe(false);
        });
    });

    // ── fetchStories ────────────────────────
    describe("fetchStories", () => {
        it("should fetch and set story groups", async () => {
            const groups = [makeGroup("u-1", [makeStory("s-1", "u-1")])];
            mockGetStoriesFeed.mockResolvedValue(groups);

            await useStoriesStore.getState().fetchStories();

            expect(useStoriesStore.getState().storyGroups).toEqual(groups);
            expect(useStoriesStore.getState().isLoading).toBe(false);
            expect(useStoriesStore.getState().lastFetchedAt).not.toBeNull();
        });

        it("should skip fetch if fetched recently (< 30s)", async () => {
            mockGetStoriesFeed.mockResolvedValue([]);
            await useStoriesStore.getState().fetchStories();
            const callCount = mockGetStoriesFeed.mock.calls.length;

            await useStoriesStore.getState().fetchStories();

            expect(mockGetStoriesFeed).toHaveBeenCalledTimes(callCount);
        });

        it("should set error on failure", async () => {
            mockGetStoriesFeed.mockRejectedValue(new Error("Network"));

            await useStoriesStore.getState().fetchStories();

            expect(useStoriesStore.getState().error).toBe("Network");
            expect(useStoriesStore.getState().isLoading).toBe(false);
        });

        it("should not double-fetch while loading", async () => {
            useStoriesStore.setState({ isLoading: true, lastFetchedAt: null });
            await useStoriesStore.getState().fetchStories();
            expect(mockGetStoriesFeed).not.toHaveBeenCalled();
        });
    });

    // ── refreshStories ──────────────────────
    describe("refreshStories", () => {
        it("should refresh ignoring cache", async () => {
            const groups = [makeGroup("u-1", [makeStory("s-1")])];
            mockGetStoriesFeed.mockResolvedValue(groups);

            await useStoriesStore.getState().refreshStories();

            expect(useStoriesStore.getState().storyGroups).toEqual(groups);
            expect(useStoriesStore.getState().isRefreshing).toBe(false);
        });

        it("should set error on failure", async () => {
            mockGetStoriesFeed.mockRejectedValue(new Error("Timeout"));
            await useStoriesStore.getState().refreshStories();
            expect(useStoriesStore.getState().error).toBe("Timeout");
        });
    });

    // ── fetchMyStories ──────────────────────
    describe("fetchMyStories", () => {
        it("should fetch and set my stories", async () => {
            const stories = [makeStory("s-1"), makeStory("s-2")];
            mockGetMyStories.mockResolvedValue(stories);

            await useStoriesStore.getState().fetchMyStories();

            expect(useStoriesStore.getState().myStories).toEqual(stories);
        });
    });

    // ── createStory ─────────────────────────
    describe("createStory", () => {
        it("should create and prepend to myStories", async () => {
            const newStory = makeStory("s-new");
            mockCreateStory.mockResolvedValue(newStory);
            mockGetStoriesFeed.mockResolvedValue([]);

            const result = await useStoriesStore.getState().createStory({
                content_type: "text",
                text_content: "Hello",
            } as any);

            expect(result).toEqual(newStory);
            expect(useStoriesStore.getState().myStories[0].id).toBe("s-new");
            expect(useStoriesStore.getState().isCreating).toBe(false);
        });

        it("should return null on failure", async () => {
            mockCreateStory.mockRejectedValue(new Error("Upload failed"));

            const result = await useStoriesStore.getState().createStory({
                content_type: "text",
                text_content: "Hello",
            } as any);

            expect(result).toBeNull();
            expect(useStoriesStore.getState().error).toBe("Upload failed");
        });
    });

    // ── deleteStory ─────────────────────────
    describe("deleteStory", () => {
        it("should delete from myStories and storyGroups", async () => {
            mockDeleteStory.mockResolvedValue(undefined);

            useStoriesStore.setState({
                myStories: [makeStory("s-1"), makeStory("s-2")],
                storyGroups: [
                    makeGroup("u-1", [makeStory("s-1", "u-1"), makeStory("s-2", "u-1")]),
                ],
            });

            const result = await useStoriesStore.getState().deleteStory("s-1");

            expect(result).toBe(true);
            expect(useStoriesStore.getState().myStories).toHaveLength(1);
            expect(useStoriesStore.getState().myStories[0].id).toBe("s-2");
        });

        it("should remove empty groups after delete", async () => {
            mockDeleteStory.mockResolvedValue(undefined);

            useStoriesStore.setState({
                myStories: [makeStory("s-1")],
                storyGroups: [makeGroup("u-1", [makeStory("s-1", "u-1")])],
            });

            await useStoriesStore.getState().deleteStory("s-1");

            expect(useStoriesStore.getState().storyGroups).toHaveLength(0);
        });

        it("should return false on failure", async () => {
            mockDeleteStory.mockRejectedValue(new Error("fail"));
            const result = await useStoriesStore.getState().deleteStory("s-1");
            expect(result).toBe(false);
        });
    });

    // ── archiveStory ────────────────────────
    describe("archiveStory", () => {
        it("should archive and remove from lists", async () => {
            mockArchiveStory.mockResolvedValue(undefined);
            useStoriesStore.setState({
                myStories: [makeStory("s-1")],
                storyGroups: [makeGroup("u-1", [makeStory("s-1", "u-1")])],
            });

            const result = await useStoriesStore.getState().archiveStory("s-1");

            expect(result).toBe(true);
            expect(useStoriesStore.getState().myStories).toHaveLength(0);
        });
    });

    // ── markViewed ──────────────────────────
    describe("markViewed", () => {
        it("should mark story as viewed and update has_unread", async () => {
            mockMarkStoryViewed.mockResolvedValue(undefined);
            useStoriesStore.setState({
                storyGroups: [
                    makeGroup("u-1", [
                        makeStory("s-1", "u-1", false),
                        makeStory("s-2", "u-1", true),
                    ], true),
                ],
            });

            await useStoriesStore.getState().markViewed("s-1");

            const group = useStoriesStore.getState().storyGroups[0];
            const story = group.stories.find((s: any) => s.id === "s-1");
            expect(story!.is_viewed).toBe(true);
        });

        it("should silently handle errors", async () => {
            mockMarkStoryViewed.mockRejectedValue(new Error("fail"));
            useStoriesStore.setState({
                storyGroups: [makeGroup("u-1", [makeStory("s-1", "u-1")])],
            });

            await expect(useStoriesStore.getState().markViewed("s-1")).resolves.toBeUndefined();
        });
    });

    // ── Viewer navigation ───────────────────
    describe("viewer", () => {
        beforeEach(() => {
            useStoriesStore.setState({
                storyGroups: [
                    makeGroup("u-1", [makeStory("s-1", "u-1"), makeStory("s-2", "u-1")]),
                    makeGroup("u-2", [makeStory("s-3", "u-2")]),
                ],
            });
        });

        it("openViewer sets correct state", () => {
            useStoriesStore.getState().openViewer(0, 1);

            const viewer = useStoriesStore.getState().viewer;
            expect(viewer.isOpen).toBe(true);
            expect(viewer.currentUserIndex).toBe(0);
            expect(viewer.currentStoryIndex).toBe(1);
            expect(viewer.isPaused).toBe(false);
        });

        it("closeViewer resets viewer state", () => {
            useStoriesStore.getState().openViewer(0);
            useStoriesStore.getState().closeViewer();

            expect(useStoriesStore.getState().viewer.isOpen).toBe(false);
        });

        it("nextStory advances within same user", () => {
            useStoriesStore.getState().openViewer(0, 0);
            useStoriesStore.getState().nextStory();

            expect(useStoriesStore.getState().viewer.currentStoryIndex).toBe(1);
            expect(useStoriesStore.getState().viewer.currentUserIndex).toBe(0);
        });

        it("nextStory at last story goes to next user", () => {
            useStoriesStore.getState().openViewer(0, 1); // last story of user 0
            useStoriesStore.getState().nextStory();

            expect(useStoriesStore.getState().viewer.currentUserIndex).toBe(1);
            expect(useStoriesStore.getState().viewer.currentStoryIndex).toBe(0);
        });

        it("nextStory at last user closes viewer", () => {
            useStoriesStore.getState().openViewer(1, 0); // last user, only 1 story
            useStoriesStore.getState().nextStory();

            expect(useStoriesStore.getState().viewer.isOpen).toBe(false);
        });

        it("prevStory goes back within same user", () => {
            useStoriesStore.getState().openViewer(0, 1);
            useStoriesStore.getState().prevStory();

            expect(useStoriesStore.getState().viewer.currentStoryIndex).toBe(0);
        });

        it("prevStory at first story goes to previous user last story", () => {
            useStoriesStore.getState().openViewer(1, 0);
            useStoriesStore.getState().prevStory();

            expect(useStoriesStore.getState().viewer.currentUserIndex).toBe(0);
            expect(useStoriesStore.getState().viewer.currentStoryIndex).toBe(1);
        });

        it("prevStory at first user first story does nothing", () => {
            useStoriesStore.getState().openViewer(0, 0);
            useStoriesStore.getState().prevStory();

            // prevStory -> prevUser, but index 0 already => no change
            expect(useStoriesStore.getState().viewer.currentUserIndex).toBe(0);
        });

        it("pauseViewer and resumeViewer toggle isPaused", () => {
            useStoriesStore.getState().openViewer(0);
            useStoriesStore.getState().pauseViewer();
            expect(useStoriesStore.getState().viewer.isPaused).toBe(true);

            useStoriesStore.getState().resumeViewer();
            expect(useStoriesStore.getState().viewer.isPaused).toBe(false);
        });
    });

    // ── clearError ──────────────────────────
    describe("clearError", () => {
        it("should clear the error", () => {
            useStoriesStore.setState({ error: "Something" });
            useStoriesStore.getState().clearError();
            expect(useStoriesStore.getState().error).toBeNull();
        });
    });

    // ── reset ───────────────────────────────
    describe("reset", () => {
        it("should reset all state to initial", () => {
            useStoriesStore.setState({
                storyGroups: [makeGroup("u-1", [])],
                myStories: [makeStory("s-1")],
                isLoading: true,
                error: "fail",
                viewer: { isOpen: true, currentUserIndex: 2, currentStoryIndex: 3, isPaused: true },
                lastFetchedAt: Date.now(),
            });

            useStoriesStore.getState().reset();

            const state = useStoriesStore.getState();
            expect(state.storyGroups).toEqual([]);
            expect(state.myStories).toEqual([]);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.viewer.isOpen).toBe(false);
            expect(state.lastFetchedAt).toBeNull();
        });
    });
});
