/**
 * ImuFeed Store (Zustand)
 *
 * Gère l'état global du feed vidéo :
 * - Vidéos du feed (for_you, following, trending)
 * - État du player (vidéo active, pause/play)
 * - Upload en cours
 * - Interactions (like, bookmark, follow)
 *
 * Sprint S1 Axe B — MVP Feed Foundation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as ImuFeedAlgo from '@/services/imufeed-algorithm';
import * as ImuFeedAPI from '@/services/imufeed-api';
import { createLogger } from '@/services/logger';
import type {
    CommentReportReason,
    CommentSortMode,
    FeedComment,
    FeedPlayerState,
    FeedSource,
    ImuFeedVideo,
    NotInterestedSignal,
    UploadProgress,
    VideoHashtag,
    VideoUploadData,
} from '@/types/imufeed';

const logger = createLogger('ImuFeedStore');

// ─── Interfaces ───────────────────────────────────────────────

interface ImuFeedState {
    // --- Feed State ---
    feedSource: FeedSource;
    forYouVideos: ImuFeedVideo[];
    followingVideos: ImuFeedVideo[];
    trendingVideos: ImuFeedVideo[];
    forYouCursor: string | null;
    followingCursor: string | null;
    trendingCursor: string | null;
    forYouHasMore: boolean;
    followingHasMore: boolean;
    trendingHasMore: boolean;

    // --- Player State ---
    player: FeedPlayerState;

    // --- Upload ---
    uploadProgress: UploadProgress | null;

    // --- UI State ---
    isLoading: boolean;
    isLoadingMore: boolean;
    isRefreshing: boolean;
    error: string | null;

    // --- Comments ---
    activeVideoComments: FeedComment[];
    commentsHasMore: boolean;
    isLoadingComments: boolean;
    commentSortMode: CommentSortMode;

    // --- Discovery ---
    trendingHashtags: VideoHashtag[];

    // --- Feed Actions ---
    setFeedSource: (source: FeedSource) => void;
    loadFeed: (source?: FeedSource) => Promise<void>;
    loadMore: () => Promise<void>;
    refreshFeed: () => Promise<void>;

    // --- Player Actions ---
    setActiveVideo: (video: ImuFeedVideo | null, index: number) => void;
    togglePlayPause: () => void;
    setMuted: (muted: boolean) => void;

    // --- Interaction Actions ---
    toggleLike: (videoId: string) => Promise<void>;
    toggleBookmark: (videoId: string) => Promise<void>;
    toggleFollow: (authorId: string) => Promise<void>;
    recordView: (videoId: string, watchDurationMs: number, completed: boolean) => Promise<void>;
    markNotInterested: (videoId: string, reason?: NotInterestedSignal['reason']) => Promise<void>;

    // --- Comments Actions ---
    loadComments: (videoId: string) => Promise<void>;
    loadMoreComments: (videoId: string) => Promise<void>;
    addComment: (videoId: string, content: string, parentId?: string) => Promise<void>;
    deleteComment: (commentId: string) => Promise<void>;
    toggleCommentLike: (commentId: string) => Promise<void>;
    pinComment: (commentId: string, videoId: string) => Promise<void>;
    unpinComment: (commentId: string) => Promise<void>;
    reportComment: (commentId: string, reason: CommentReportReason) => Promise<void>;
    setCommentSortMode: (mode: CommentSortMode) => void;
    clearComments: () => void;

    // --- Upload Actions ---
    uploadVideo: (data: VideoUploadData) => Promise<ImuFeedVideo>;
    clearUploadProgress: () => void;

    // --- Discovery ---
    loadTrendingHashtags: () => Promise<void>;

    // --- Reset ---
    reset: () => void;
}

// ─── Initial State ────────────────────────────────────────────

const INITIAL_PLAYER: FeedPlayerState = {
    currentVideoId: null,
    currentIndex: 0,
    isPaused: true,
    isMuted: false,
    positionMs: 0,
};

// ─── Store ────────────────────────────────────────────────────

export const useImuFeedStore = create<ImuFeedState>()(
    persist(
        (set, get) => ({
            // --- Initial State ---
            feedSource: 'for_you',
            forYouVideos: [],
            followingVideos: [],
            trendingVideos: [],
            forYouCursor: null,
            followingCursor: null,
            trendingCursor: null,
            forYouHasMore: true,
            followingHasMore: true,
            trendingHasMore: true,
            player: { ...INITIAL_PLAYER },
            uploadProgress: null,
            isLoading: false,
            isLoadingMore: false,
            isRefreshing: false,
            error: null,
            activeVideoComments: [],
            commentsHasMore: false,
            isLoadingComments: false,
            commentSortMode: 'top' as CommentSortMode,
            trendingHashtags: [],

            // ─── Feed Actions ────────────────────────────────

            setFeedSource: (source) => {
                set({ feedSource: source });
                const state = get();
                const videos = getVideosForSource(state, source);
                if (videos.length === 0) {
                    state.loadFeed(source);
                }
            },

            loadFeed: async (source) => {
                const s = source ?? get().feedSource;
                logger.info('loadFeed', { source: s });
                set({ isLoading: true, error: null });
                try {
                    const page = await ImuFeedAPI.fetchFeedBySource(s);
                    const update: Partial<ImuFeedState> = { isLoading: false };

                    switch (s) {
                        case 'for_you':
                            update.forYouVideos = page.videos;
                            update.forYouCursor = page.cursor;
                            update.forYouHasMore = page.hasMore;
                            break;
                        case 'following':
                            update.followingVideos = page.videos;
                            update.followingCursor = page.cursor;
                            update.followingHasMore = page.hasMore;
                            break;
                        case 'trending':
                        case 'explore':
                            update.trendingVideos = page.videos;
                            update.trendingCursor = page.cursor;
                            update.trendingHasMore = page.hasMore;
                            break;
                    }

                    set(update);
                } catch (err) {
                    logger.error('loadFeed error', err);
                    set({ isLoading: false, error: (err as Error).message });
                }
            },

            loadMore: async () => {
                const { feedSource, isLoadingMore } = get();
                if (isLoadingMore) return;

                const cursor = getCursorForSource(get(), feedSource);
                const hasMore = getHasMoreForSource(get(), feedSource);
                if (!hasMore || !cursor) return;

                logger.info('loadMore', { source: feedSource });
                set({ isLoadingMore: true });
                try {
                    const page = await ImuFeedAPI.fetchFeedBySource(feedSource, cursor);
                    const state = get();
                    const existing = getVideosForSource(state, feedSource);

                    const update: Partial<ImuFeedState> = { isLoadingMore: false };

                    switch (feedSource) {
                        case 'for_you':
                            update.forYouVideos = [...existing, ...page.videos];
                            update.forYouCursor = page.cursor;
                            update.forYouHasMore = page.hasMore;
                            break;
                        case 'following':
                            update.followingVideos = [...existing, ...page.videos];
                            update.followingCursor = page.cursor;
                            update.followingHasMore = page.hasMore;
                            break;
                        case 'trending':
                        case 'explore':
                            update.trendingVideos = [...existing, ...page.videos];
                            update.trendingCursor = page.cursor;
                            update.trendingHasMore = page.hasMore;
                            break;
                    }

                    set(update);
                } catch (err) {
                    logger.error('loadMore error', err);
                    set({ isLoadingMore: false });
                }
            },

            refreshFeed: async () => {
                const { feedSource } = get();
                logger.info('refreshFeed', { source: feedSource });
                set({ isRefreshing: true });
                try {
                    const page = await ImuFeedAPI.fetchFeedBySource(feedSource);
                    const update: Partial<ImuFeedState> = { isRefreshing: false };

                    switch (feedSource) {
                        case 'for_you':
                            update.forYouVideos = page.videos;
                            update.forYouCursor = page.cursor;
                            update.forYouHasMore = page.hasMore;
                            break;
                        case 'following':
                            update.followingVideos = page.videos;
                            update.followingCursor = page.cursor;
                            update.followingHasMore = page.hasMore;
                            break;
                        case 'trending':
                        case 'explore':
                            update.trendingVideos = page.videos;
                            update.trendingCursor = page.cursor;
                            update.trendingHasMore = page.hasMore;
                            break;
                    }

                    set(update);
                } catch (err) {
                    logger.error('refreshFeed error', err);
                    set({ isRefreshing: false });
                }
            },

            // ─── Player Actions ──────────────────────────────

            setActiveVideo: (video, index) => {
                set({
                    player: {
                        ...get().player,
                        currentVideoId: video?.id ?? null,
                        currentIndex: index,
                        isPaused: !video,
                        positionMs: 0,
                    },
                });
            },

            togglePlayPause: () => {
                set({
                    player: {
                        ...get().player,
                        isPaused: !get().player.isPaused,
                    },
                });
            },

            setMuted: (muted) => {
                set({
                    player: {
                        ...get().player,
                        isMuted: muted,
                    },
                });
            },

            // ─── Interaction Actions ─────────────────────────

            toggleLike: async (videoId) => {
                const state = get();
                const video = findVideoInState(state, videoId);
                if (!video) return;

                const wasLiked = video.is_liked;
                // Optimistic update
                updateVideoInState(set, get, videoId, {
                    is_liked: !wasLiked,
                    likes_count: video.likes_count + (wasLiked ? -1 : 1),
                });

                try {
                    await ImuFeedAPI.toggleVideoLike(videoId, wasLiked);
                } catch (err) {
                    logger.error('toggleLike error', err);
                    // Rollback
                    updateVideoInState(set, get, videoId, {
                        is_liked: wasLiked,
                        likes_count: video.likes_count,
                    });
                }
            },

            toggleBookmark: async (videoId) => {
                const state = get();
                const video = findVideoInState(state, videoId);
                if (!video) return;

                const wasBookmarked = video.is_bookmarked;
                updateVideoInState(set, get, videoId, {
                    is_bookmarked: !wasBookmarked,
                    bookmarks_count: video.bookmarks_count + (wasBookmarked ? -1 : 1),
                });

                try {
                    await ImuFeedAPI.toggleVideoBookmark(videoId, wasBookmarked);
                } catch (err) {
                    logger.error('toggleBookmark error', err);
                    updateVideoInState(set, get, videoId, {
                        is_bookmarked: wasBookmarked,
                        bookmarks_count: video.bookmarks_count,
                    });
                }
            },

            toggleFollow: async (authorId) => {
                const state = get();
                // Trouver une vidéo de cet auteur pour connaître le statut follow
                const video = [...state.forYouVideos, ...state.followingVideos, ...state.trendingVideos]
                    .find((v) => v.author.id === authorId);
                if (!video) return;

                const wasFollowing = video.author.is_following;

                try {
                    await ImuFeedAPI.toggleFollow(authorId, wasFollowing);
                    // Mettre à jour toutes les vidéos de cet auteur
                    const updateAllByAuthor = (videos: ImuFeedVideo[]) =>
                        videos.map((v) =>
                            v.author.id === authorId
                                ? { ...v, author: { ...v.author, is_following: !wasFollowing } }
                                : v,
                        );

                    set({
                        forYouVideos: updateAllByAuthor(get().forYouVideos),
                        followingVideos: updateAllByAuthor(get().followingVideos),
                        trendingVideos: updateAllByAuthor(get().trendingVideos),
                    });
                } catch (err) {
                    logger.error('toggleFollow error', err);
                }
            },

            recordView: async (videoId, watchDurationMs, completed) => {
                try {
                    const video = findVideoInState(get(), videoId);
                    await ImuFeedAPI.recordVideoView(videoId, watchDurationMs, completed);
                    // Enriched tracking for algorithm
                    await ImuFeedAlgo.trackEngagement({
                        videoId,
                        watchDurationMs,
                        completed,
                        videoDurationMs: video?.duration_ms ?? 0,
                        source: get().feedSource,
                    });
                    updateVideoInState(set, get, videoId, (v) => ({
                        views_count: v.views_count + 1,
                    }));
                } catch (err) {
                    logger.error('recordView error', err);
                }
            },

            markNotInterested: async (videoId, reason = 'not_interested') => {
                // Optimistic: retirer la vidéo du feed
                const state = get();
                const prevForYou = state.forYouVideos;
                const prevFollowing = state.followingVideos;
                const prevTrending = state.trendingVideos;

                set({
                    forYouVideos: prevForYou.filter((v) => v.id !== videoId),
                    followingVideos: prevFollowing.filter((v) => v.id !== videoId),
                    trendingVideos: prevTrending.filter((v) => v.id !== videoId),
                });

                try {
                    await ImuFeedAlgo.markNotInterested(videoId, reason);
                } catch (err) {
                    logger.error('markNotInterested error', err);
                    // Rollback
                    set({
                        forYouVideos: prevForYou,
                        followingVideos: prevFollowing,
                        trendingVideos: prevTrending,
                    });
                }
            },

            // ─── Comments Actions ────────────────────────────

            loadComments: async (videoId) => {
                set({ isLoadingComments: true, activeVideoComments: [] });
                try {
                    const result = await ImuFeedAPI.fetchVideoComments(videoId);
                    set({
                        activeVideoComments: result.comments,
                        commentsHasMore: result.hasMore,
                        isLoadingComments: false,
                    });
                } catch (err) {
                    logger.error('loadComments error', err);
                    set({ isLoadingComments: false });
                }
            },

            loadMoreComments: async (videoId) => {
                const { activeVideoComments, commentsHasMore, isLoadingComments } = get();
                if (isLoadingComments || !commentsHasMore) return;

                const lastComment = activeVideoComments[activeVideoComments.length - 1];
                if (!lastComment) return;

                set({ isLoadingComments: true });
                try {
                    const result = await ImuFeedAPI.fetchVideoComments(videoId, null, lastComment.created_at);
                    set({
                        activeVideoComments: [...activeVideoComments, ...result.comments],
                        commentsHasMore: result.hasMore,
                        isLoadingComments: false,
                    });
                } catch (err) {
                    logger.error('loadMoreComments error', err);
                    set({ isLoadingComments: false });
                }
            },

            addComment: async (videoId, content, parentId) => {
                try {
                    const comment = await ImuFeedAPI.addVideoComment(videoId, content, parentId);
                    set({ activeVideoComments: [comment, ...get().activeVideoComments] });
                    updateVideoInState(set, get, videoId, (v) => ({
                        comments_count: v.comments_count + 1,
                    }));
                } catch (err) {
                    logger.error('addComment error', err);
                    throw err;
                }
            },

            deleteComment: async (commentId) => {
                const { activeVideoComments } = get();
                const comment = activeVideoComments.find((c) => c.id === commentId);
                if (!comment) return;

                set({
                    activeVideoComments: activeVideoComments.filter((c) => c.id !== commentId),
                });

                try {
                    await ImuFeedAPI.deleteVideoComment(commentId);
                    updateVideoInState(set, get, comment.video_id, (v) => ({
                        comments_count: Math.max(0, v.comments_count - 1),
                    }));
                } catch (err) {
                    logger.error('deleteComment error', err);
                    // Rollback
                    set({ activeVideoComments });
                }
            },

            toggleCommentLike: async (commentId) => {
                const { activeVideoComments } = get();
                const comment = activeVideoComments.find((c) => c.id === commentId);
                if (!comment) return;

                const wasLiked = comment.is_liked;
                set({
                    activeVideoComments: activeVideoComments.map((c) =>
                        c.id === commentId
                            ? {
                                ...c,
                                is_liked: !wasLiked,
                                likes_count: c.likes_count + (wasLiked ? -1 : 1),
                            }
                            : c,
                    ),
                });

                try {
                    await ImuFeedAPI.toggleCommentLike(commentId, wasLiked);
                } catch (err) {
                    logger.error('toggleCommentLike error', err);
                    set({ activeVideoComments });
                }
            },

            clearComments: () => {
                set({ activeVideoComments: [], commentsHasMore: false });
            },

            pinComment: async (commentId, videoId) => {
                const { activeVideoComments } = get();
                // Optimistic: unpin all, pin target
                set({
                    activeVideoComments: activeVideoComments.map((c) => ({
                        ...c,
                        is_pinned: c.id === commentId,
                    })),
                });
                try {
                    await ImuFeedAPI.pinComment(commentId, videoId);
                } catch (err) {
                    logger.error('pinComment error', err);
                    set({ activeVideoComments }); // rollback
                }
            },

            unpinComment: async (commentId) => {
                const { activeVideoComments } = get();
                set({
                    activeVideoComments: activeVideoComments.map((c) =>
                        c.id === commentId ? { ...c, is_pinned: false } : c,
                    ),
                });
                try {
                    await ImuFeedAPI.unpinComment(commentId);
                } catch (err) {
                    logger.error('unpinComment error', err);
                    set({ activeVideoComments }); // rollback
                }
            },

            reportComment: async (commentId, reason) => {
                try {
                    await ImuFeedAPI.reportComment(commentId, reason);
                } catch (err) {
                    logger.error('reportComment error', err);
                    throw err;
                }
            },

            setCommentSortMode: (mode) => {
                set({ commentSortMode: mode });
            },

            // ─── Upload Actions ──────────────────────────────

            uploadVideo: async (data) => {
                logger.info('uploadVideo', { caption: data.caption });
                set({ uploadProgress: { video_id: '', stage: 'uploading', percent: 0 } });
                try {
                    const video = await ImuFeedAPI.uploadVideo(data, (progress) => {
                        set({ uploadProgress: progress });
                    });
                    // Ajouter la vidéo en tête du feed for_you
                    set({
                        forYouVideos: [video, ...get().forYouVideos],
                        uploadProgress: null,
                    });
                    return video;
                } catch (err) {
                    logger.error('uploadVideo error', err);
                    set({ uploadProgress: null });
                    throw err;
                }
            },

            clearUploadProgress: () => {
                set({ uploadProgress: null });
            },

            // ─── Discovery ───────────────────────────────────

            loadTrendingHashtags: async () => {
                try {
                    const hashtags = await ImuFeedAPI.fetchTrendingHashtags();
                    set({ trendingHashtags: hashtags });
                } catch (err) {
                    logger.error('loadTrendingHashtags error', err);
                }
            },

            // ─── Reset ───────────────────────────────────────

            reset: () => {
                set({
                    feedSource: 'for_you',
                    forYouVideos: [],
                    followingVideos: [],
                    trendingVideos: [],
                    forYouCursor: null,
                    followingCursor: null,
                    trendingCursor: null,
                    forYouHasMore: true,
                    followingHasMore: true,
                    trendingHasMore: true,
                    player: { ...INITIAL_PLAYER },
                    uploadProgress: null,
                    isLoading: false,
                    isLoadingMore: false,
                    isRefreshing: false,
                    error: null,
                    activeVideoComments: [],
                    commentsHasMore: false,
                    isLoadingComments: false,
                    trendingHashtags: [],
                });
            },
        }),
        {
            name: 'imufeed-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialState: (state: ImuFeedState) => ({
                feedSource: state.feedSource,
                // On ne persiste PAS les vidéos / player pour garder le storage léger
            }),
        } as any,
    ),
);

// ─── Helpers internes ─────────────────────────────────────────

function getVideosForSource(state: ImuFeedState, source: FeedSource): ImuFeedVideo[] {
    switch (source) {
        case 'for_you': return state.forYouVideos;
        case 'following': return state.followingVideos;
        case 'trending':
        case 'explore': return state.trendingVideos;
        default: return state.forYouVideos;
    }
}

function getCursorForSource(state: ImuFeedState, source: FeedSource): string | null {
    switch (source) {
        case 'for_you': return state.forYouCursor;
        case 'following': return state.followingCursor;
        case 'trending':
        case 'explore': return state.trendingCursor;
        default: return null;
    }
}

function getHasMoreForSource(state: ImuFeedState, source: FeedSource): boolean {
    switch (source) {
        case 'for_you': return state.forYouHasMore;
        case 'following': return state.followingHasMore;
        case 'trending':
        case 'explore': return state.trendingHasMore;
        default: return false;
    }
}

function findVideoInState(state: ImuFeedState, videoId: string): ImuFeedVideo | undefined {
    return (
        state.forYouVideos.find((v) => v.id === videoId) ??
        state.followingVideos.find((v) => v.id === videoId) ??
        state.trendingVideos.find((v) => v.id === videoId)
    );
}

function updateVideoInState(
    set: (partial: Partial<ImuFeedState>) => void,
    get: () => ImuFeedState,
    videoId: string,
    updater: Partial<ImuFeedVideo> | ((v: ImuFeedVideo) => Partial<ImuFeedVideo>),
): void {
    const updateList = (videos: ImuFeedVideo[]) =>
        videos.map((v) => {
            if (v.id !== videoId) return v;
            const patch = typeof updater === 'function' ? updater(v) : updater;
            return { ...v, ...patch };
        });

    const state = get();
    set({
        forYouVideos: updateList(state.forYouVideos),
        followingVideos: updateList(state.followingVideos),
        trendingVideos: updateList(state.trendingVideos),
    });
}
