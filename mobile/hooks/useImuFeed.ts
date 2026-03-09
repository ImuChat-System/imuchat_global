/**
 * useImuFeed Hook
 *
 * Fournit une interface unifiée pour le module ImuFeed (vidéo courte) :
 *  - Navigation du feed (for_you, following, trending)
 *  - Contrôle du player vidéo
 *  - Interactions (like, bookmark, commentaires, follow)
 *  - Upload de vidéos
 *  - Recherche & découverte
 *
 * Usage :
 *   const { videos, loadFeed, toggleLike, ... } = useImuFeed();
 *
 * Sprint S1 Axe B — MVP Feed Foundation
 */

import { useCallback, useMemo } from 'react';

import { useImuFeedStore } from '@/stores/imufeed-store';
import type {
    FeedComment,
    FeedPlayerState,
    FeedSource,
    ImuFeedVideo,
    UploadProgress,
    VideoHashtag,
    VideoUploadData,
} from '@/types/imufeed';

// ============================================================================
// TYPES
// ============================================================================

export interface UseImuFeedReturn {
    // --- Feed State ---
    feedSource: FeedSource;
    videos: ImuFeedVideo[];
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    isRefreshing: boolean;
    error: string | null;

    // --- Player State ---
    player: FeedPlayerState;

    // --- Upload ---
    uploadProgress: UploadProgress | null;

    // --- Comments ---
    comments: FeedComment[];
    commentsHasMore: boolean;
    isLoadingComments: boolean;

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

    // --- Comments Actions ---
    loadComments: (videoId: string) => Promise<void>;
    loadMoreComments: (videoId: string) => Promise<void>;
    addComment: (videoId: string, content: string, parentId?: string) => Promise<void>;
    deleteComment: (commentId: string) => Promise<void>;
    toggleCommentLike: (commentId: string) => Promise<void>;
    clearComments: () => void;

    // --- Upload Actions ---
    uploadVideo: (data: VideoUploadData) => Promise<ImuFeedVideo>;
    clearUploadProgress: () => void;

    // --- Discovery ---
    loadTrendingHashtags: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useImuFeed(): UseImuFeedReturn {
    const store = useImuFeedStore();

    // Vidéos actuelles selon la source active
    const videos = useMemo(() => {
        switch (store.feedSource) {
            case 'for_you':
                return store.forYouVideos;
            case 'following':
                return store.followingVideos;
            case 'trending':
            case 'explore':
                return store.trendingVideos;
            default:
                return store.forYouVideos;
        }
    }, [store.feedSource, store.forYouVideos, store.followingVideos, store.trendingVideos]);

    const hasMore = useMemo(() => {
        switch (store.feedSource) {
            case 'for_you':
                return store.forYouHasMore;
            case 'following':
                return store.followingHasMore;
            case 'trending':
            case 'explore':
                return store.trendingHasMore;
            default:
                return false;
        }
    }, [store.feedSource, store.forYouHasMore, store.followingHasMore, store.trendingHasMore]);

    // Callbacks stables
    const setFeedSource = useCallback(store.setFeedSource, []);
    const loadFeed = useCallback(store.loadFeed, []);
    const loadMore = useCallback(store.loadMore, []);
    const refreshFeed = useCallback(store.refreshFeed, []);
    const setActiveVideo = useCallback(store.setActiveVideo, []);
    const togglePlayPause = useCallback(store.togglePlayPause, []);
    const setMuted = useCallback(store.setMuted, []);
    const toggleLike = useCallback(store.toggleLike, []);
    const toggleBookmark = useCallback(store.toggleBookmark, []);
    const toggleFollow = useCallback(store.toggleFollow, []);
    const recordView = useCallback(store.recordView, []);
    const loadComments = useCallback(store.loadComments, []);
    const loadMoreComments = useCallback(store.loadMoreComments, []);
    const addComment = useCallback(store.addComment, []);
    const deleteComment = useCallback(store.deleteComment, []);
    const toggleCommentLike = useCallback(store.toggleCommentLike, []);
    const clearComments = useCallback(store.clearComments, []);
    const uploadVideo = useCallback(store.uploadVideo, []);
    const clearUploadProgress = useCallback(store.clearUploadProgress, []);
    const loadTrendingHashtags = useCallback(store.loadTrendingHashtags, []);

    return {
        // Feed State
        feedSource: store.feedSource,
        videos,
        hasMore,
        isLoading: store.isLoading,
        isLoadingMore: store.isLoadingMore,
        isRefreshing: store.isRefreshing,
        error: store.error,

        // Player State
        player: store.player,

        // Upload
        uploadProgress: store.uploadProgress,

        // Comments
        comments: store.activeVideoComments,
        commentsHasMore: store.commentsHasMore,
        isLoadingComments: store.isLoadingComments,

        // Discovery
        trendingHashtags: store.trendingHashtags,

        // Feed Actions
        setFeedSource,
        loadFeed,
        loadMore,
        refreshFeed,

        // Player Actions
        setActiveVideo,
        togglePlayPause,
        setMuted,

        // Interaction Actions
        toggleLike,
        toggleBookmark,
        toggleFollow,
        recordView,

        // Comments Actions
        loadComments,
        loadMoreComments,
        addComment,
        deleteComment,
        toggleCommentLike,
        clearComments,

        // Upload Actions
        uploadVideo,
        clearUploadProgress,

        // Discovery
        loadTrendingHashtags,
    };
}
