/**
 * Stories Store (Zustand + AsyncStorage persist)
 *
 * Gère l'état global des stories :
 * - Stories feed (grouped by user)
 * - My stories
 * - Story viewer state
 * - Creation state
 * 
 * DEV-011: Stories Réelles
 */

import { createLogger } from "@/services/logger";
import type {
    CreateStoryInput,
    Story,
    StoryUserGroup,
    StoryWithAuthor
} from "@/services/stories-api";
import * as StoriesAPI from "@/services/stories-api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const logger = createLogger("StoriesStore");

// ═══════════════════════════════════════════════════════════════════
// STATE TYPES
// ═══════════════════════════════════════════════════════════════════

interface StoryViewerState {
    isOpen: boolean;
    currentUserIndex: number;
    currentStoryIndex: number;
    isPaused: boolean;
}

interface StoriesState {
    // Stories feed (grouped by user)
    storyGroups: StoryUserGroup[];

    // My stories
    myStories: Story[];

    // Loading states
    isLoading: boolean;
    isRefreshing: boolean;
    isCreating: boolean;

    // Error state
    error: string | null;

    // Viewer state
    viewer: StoryViewerState;

    // Last fetch timestamp
    lastFetchedAt: number | null;

    // ─── Actions ─────────────────────────────────────────────────

    // Fetch actions
    fetchStories: () => Promise<void>;
    refreshStories: () => Promise<void>;
    fetchMyStories: () => Promise<void>;

    // Story CRUD
    createStory: (input: CreateStoryInput) => Promise<Story | null>;
    deleteStory: (storyId: string) => Promise<boolean>;
    archiveStory: (storyId: string) => Promise<boolean>;

    // View tracking
    markViewed: (storyId: string) => Promise<void>;

    // Viewer controls
    openViewer: (userIndex: number, storyIndex?: number) => void;
    closeViewer: () => void;
    nextStory: () => void;
    prevStory: () => void;
    nextUser: () => void;
    prevUser: () => void;
    pauseViewer: () => void;
    resumeViewer: () => void;

    // Utils
    clearError: () => void;
    reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════

const initialViewerState: StoryViewerState = {
    isOpen: false,
    currentUserIndex: 0,
    currentStoryIndex: 0,
    isPaused: false,
};

// ═══════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════

export const useStoriesStore = create<StoriesState>()(
    persist(
        (set, get) => ({
            // Initial state
            storyGroups: [],
            myStories: [],
            isLoading: false,
            isRefreshing: false,
            isCreating: false,
            error: null,
            viewer: initialViewerState,
            lastFetchedAt: null,

            // ─── Fetch Stories ─────────────────────────────────────────

            fetchStories: async () => {
                // Skip if already loading
                if (get().isLoading) return;

                // Skip if fetched recently (within 30 seconds)
                const now = Date.now();
                const lastFetch = get().lastFetchedAt;
                if (lastFetch && now - lastFetch < 30000) {
                    logger.debug("Skipping fetch - fetched recently");
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const groups = await StoriesAPI.getStoriesFeed();
                    set({
                        storyGroups: groups,
                        lastFetchedAt: now,
                        isLoading: false
                    });
                    logger.info(`Fetched ${groups.length} story groups`);
                } catch (error) {
                    logger.error("Failed to fetch stories", error);
                    set({
                        error: error instanceof Error ? error.message : "Failed to load stories",
                        isLoading: false
                    });
                }
            },

            refreshStories: async () => {
                set({ isRefreshing: true, error: null });

                try {
                    const groups = await StoriesAPI.getStoriesFeed();
                    set({
                        storyGroups: groups,
                        lastFetchedAt: Date.now(),
                        isRefreshing: false
                    });
                } catch (error) {
                    logger.error("Failed to refresh stories", error);
                    set({
                        error: error instanceof Error ? error.message : "Failed to refresh stories",
                        isRefreshing: false
                    });
                }
            },

            fetchMyStories: async () => {
                try {
                    const stories = await StoriesAPI.getMyStories();
                    set({ myStories: stories });
                } catch (error) {
                    logger.error("Failed to fetch my stories", error);
                }
            },

            // ─── Create Story ──────────────────────────────────────────

            createStory: async (input) => {
                set({ isCreating: true, error: null });

                try {
                    const story = await StoriesAPI.createStory(input);

                    // Add to myStories immediately
                    set((state) => ({
                        myStories: [story, ...state.myStories],
                        isCreating: false,
                    }));

                    // Refresh feed to show new story
                    get().refreshStories();

                    logger.info("Story created successfully", { id: story.id });
                    return story;
                } catch (error) {
                    logger.error("Failed to create story", error);
                    set({
                        error: error instanceof Error ? error.message : "Failed to create story",
                        isCreating: false
                    });
                    return null;
                }
            },

            // ─── Delete / Archive ──────────────────────────────────────

            deleteStory: async (storyId) => {
                try {
                    await StoriesAPI.deleteStory(storyId);

                    // Remove from local state
                    set((state) => ({
                        myStories: state.myStories.filter(s => s.id !== storyId),
                        storyGroups: state.storyGroups.map(group => ({
                            ...group,
                            stories: group.stories.filter(s => s.id !== storyId),
                        })).filter(group => group.stories.length > 0),
                    }));

                    return true;
                } catch (error) {
                    logger.error("Failed to delete story", error);
                    return false;
                }
            },

            archiveStory: async (storyId) => {
                try {
                    await StoriesAPI.archiveStory(storyId);

                    // Remove from active stories
                    set((state) => ({
                        myStories: state.myStories.filter(s => s.id !== storyId),
                        storyGroups: state.storyGroups.map(group => ({
                            ...group,
                            stories: group.stories.filter(s => s.id !== storyId),
                        })).filter(group => group.stories.length > 0),
                    }));

                    return true;
                } catch (error) {
                    logger.error("Failed to archive story", error);
                    return false;
                }
            },

            // ─── View Tracking ─────────────────────────────────────────

            markViewed: async (storyId) => {
                try {
                    await StoriesAPI.markStoryViewed(storyId);

                    // Update local state
                    set((state) => ({
                        storyGroups: state.storyGroups.map(group => ({
                            ...group,
                            stories: group.stories.map(story =>
                                story.id === storyId
                                    ? { ...story, is_viewed: true }
                                    : story
                            ),
                            has_unread: group.stories.some(
                                s => s.id !== storyId && !s.is_viewed
                            ),
                        })),
                    }));
                } catch {
                    // View tracking failure should not affect UX
                }
            },

            // ─── Viewer Controls ───────────────────────────────────────

            openViewer: (userIndex, storyIndex = 0) => {
                set({
                    viewer: {
                        isOpen: true,
                        currentUserIndex: userIndex,
                        currentStoryIndex: storyIndex,
                        isPaused: false,
                    },
                });
            },

            closeViewer: () => {
                set({ viewer: initialViewerState });
            },

            nextStory: () => {
                const { viewer, storyGroups } = get();
                const currentGroup = storyGroups[viewer.currentUserIndex];

                if (!currentGroup) return;

                if (viewer.currentStoryIndex < currentGroup.stories.length - 1) {
                    // Next story of same user
                    set({
                        viewer: {
                            ...viewer,
                            currentStoryIndex: viewer.currentStoryIndex + 1,
                        },
                    });
                } else {
                    // Move to next user
                    get().nextUser();
                }
            },

            prevStory: () => {
                const { viewer } = get();

                if (viewer.currentStoryIndex > 0) {
                    set({
                        viewer: {
                            ...viewer,
                            currentStoryIndex: viewer.currentStoryIndex - 1,
                        },
                    });
                } else {
                    // Move to previous user
                    get().prevUser();
                }
            },

            nextUser: () => {
                const { viewer, storyGroups } = get();

                if (viewer.currentUserIndex < storyGroups.length - 1) {
                    set({
                        viewer: {
                            ...viewer,
                            currentUserIndex: viewer.currentUserIndex + 1,
                            currentStoryIndex: 0,
                        },
                    });
                } else {
                    // End of stories - close viewer
                    get().closeViewer();
                }
            },

            prevUser: () => {
                const { viewer, storyGroups } = get();

                if (viewer.currentUserIndex > 0) {
                    const prevUserIndex = viewer.currentUserIndex - 1;
                    const prevGroup = storyGroups[prevUserIndex];
                    set({
                        viewer: {
                            ...viewer,
                            currentUserIndex: prevUserIndex,
                            currentStoryIndex: prevGroup ? prevGroup.stories.length - 1 : 0,
                        },
                    });
                }
            },

            pauseViewer: () => {
                set((state) => ({
                    viewer: { ...state.viewer, isPaused: true },
                }));
            },

            resumeViewer: () => {
                set((state) => ({
                    viewer: { ...state.viewer, isPaused: false },
                }));
            },

            // ─── Utils ─────────────────────────────────────────────────

            clearError: () => set({ error: null }),

            reset: () => set({
                storyGroups: [],
                myStories: [],
                isLoading: false,
                isRefreshing: false,
                isCreating: false,
                error: null,
                viewer: initialViewerState,
                lastFetchedAt: null,
            }),
        }),
        {
            name: "stories-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist essential data
                storyGroups: state.storyGroups,
                myStories: state.myStories,
                lastFetchedAt: state.lastFetchedAt,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get current story being viewed
 */
export function useCurrentStory(): StoryWithAuthor | null {
    const { viewer, storyGroups } = useStoriesStore();
    if (!viewer.isOpen) return null;

    const group = storyGroups[viewer.currentUserIndex];
    if (!group) return null;

    return group.stories[viewer.currentStoryIndex] || null;
}

/**
 * Get current user's stories being viewed
 */
export function useCurrentStoryGroup(): StoryUserGroup | null {
    const { viewer, storyGroups } = useStoriesStore();
    if (!viewer.isOpen) return null;

    return storyGroups[viewer.currentUserIndex] || null;
}

/**
 * Check if there are any unread stories
 */
export function useHasUnreadStories(): boolean {
    const { storyGroups } = useStoriesStore();
    return storyGroups.some(group => group.has_unread);
}
