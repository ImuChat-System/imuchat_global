/**
 * SocialScreen — Parité web stories module
 * Sections : StoryCarousel, StoryGrid, CreateStoryFAB, filtres (Mixte/News/Stories)
 * DEV-011: Intégration stories réelles avec Supabase
 * DEV-012: Feed social réel avec Supabase (posts, likes, commentaires)
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Post, fetchFeed, sharePost, toggleLike } from "@/services/social-feed";
import { StoryUserGroup } from "@/services/stories-api";
import { useStoriesStore } from "@/stores/stories-store";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────
type FeedFilter = "mixed" | "news" | "following";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────
export default function SocialScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  // Stories store
  const {
    storyGroups,
    isLoading: storiesLoading,
    fetchStories,
    refreshStories,
    openViewer,
  } = useStoriesStore();

  // Feed state
  const [filter, setFilter] = useState<FeedFilter>("mixed");
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Map filter to API filter
  const getApiFilter = (f: FeedFilter): "all" | "following" | "news" => {
    if (f === "news") return "news";
    if (f === "following") return "following";
    return "all";
  };

  // Fetch feed
  const loadFeed = useCallback(
    async (reset = false) => {
      if (reset) {
        setIsLoadingFeed(true);
        setPosts([]);
        setNextCursor(null);
        setHasMore(true);
      }

      try {
        const result = await fetchFeed(
          reset ? undefined : (nextCursor ?? undefined),
          getApiFilter(filter),
        );
        setPosts((prev) => (reset ? result.posts : [...prev, ...result.posts]));
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } finally {
        setIsLoadingFeed(false);
        setIsLoadingMore(false);
      }
    },
    [filter, nextCursor],
  );

  // Load feed on mount and filter change
  useEffect(() => {
    loadFeed(true);
  }, [filter]);

  // Fetch stories on mount
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshStories(), loadFeed(true)]);
    setRefreshing(false);
  }, [refreshStories, loadFeed]);

  // Handle load more (infinite scroll)
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingFeed) {
      setIsLoadingMore(true);
      loadFeed(false);
    }
  }, [isLoadingMore, hasMore, isLoadingFeed, loadFeed]);

  // Handle like toggle
  const handleToggleLike = useCallback(async (post: Post) => {
    const newIsLiked = await toggleLike(post.id, post.isLiked);
    if (newIsLiked !== null) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLiked: newIsLiked,
                likesCount: newIsLiked ? p.likesCount + 1 : p.likesCount - 1,
              }
            : p,
        ),
      );
    }
  }, []);

  // Handle share
  const handleShare = useCallback(async (postId: string) => {
    const success = await sharePost(postId);
    if (success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p,
        ),
      );
    }
  }, []);

  // Navigate to comments
  const handleCommentPress = useCallback(
    (postId: string) => {
      router.push(`/social/comments/${postId}`);
    },
    [router],
  );

  // Handle story tap - open viewer at index
  const handleStoryTap = useCallback(
    (index: number, isOwnStory: boolean) => {
      if (isOwnStory && storyGroups[index]?.stories.length === 0) {
        // Own story without content - navigate to create
        router.push("/stories/create");
      } else {
        // Open viewer at this index
        openViewer(index);
        router.push("/stories/viewer");
      }
    },
    [openViewer, router, storyGroups],
  );

  // Handle FAB - create new post
  const handleCreatePost = useCallback(() => {
    router.push("/social/create-post");
  }, [router]);

  // ─── Helpers ──────────────────────────────────────────────────
  const formatTimeAgo = useCallback(
    (iso: string) => {
      const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
      if (mins < 1) return t("common.justNow");
      if (mins < 60) return t("common.minutesAgo", { count: mins });
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return t("common.hoursAgo", { count: hrs });
      return t("common.daysAgo", { count: Math.floor(hrs / 24) });
    },
    [t],
  );

  // ─── Story carousel ──────────────────────────────────────────
  // Build carousel data - add "Add Story" item at start for current user
  const storyCarouselData: (StoryUserGroup | { isAddStory: true })[] = [
    { isAddStory: true } as const,
    ...storyGroups,
  ];

  // Handle create story from carousel
  const handleCreateStory = useCallback(() => {
    router.push("/stories/create");
  }, [router]);

  const renderStoryUser = ({
    item,
    index,
  }: {
    item: StoryUserGroup | { isAddStory: true };
    index: number;
  }) => {
    // "Add Story" button for current user
    if ("isAddStory" in item) {
      return (
        <TouchableOpacity
          testID="story-add-btn"
          style={styles.storyItem}
          onPress={handleCreateStory}
        >
          <View style={[styles.storyRing, { borderColor: colors.border }]}>
            <View
              style={[styles.storyAvatar, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.storyEmoji}>➕</Text>
            </View>
          </View>
          <Text
            style={[styles.storyUsername, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {t("social.yourStory")}
          </Text>
        </TouchableOpacity>
      );
    }

    // Story group from other user
    const hasAvatar = item.avatar_url;
    const latestStory = item.stories[0];

    return (
      <TouchableOpacity
        testID={`story-user-${item.user_id}`}
        style={styles.storyItem}
        onPress={() => handleStoryTap(index - 1, item.user_id === user?.id)}
      >
        <View
          style={[
            styles.storyRing,
            { borderColor: item.has_unread ? colors.primary : colors.border },
          ]}
        >
          {hasAvatar ? (
            <Image
              source={{ uri: item.avatar_url! }}
              style={styles.storyAvatarImage}
            />
          ) : (
            <View
              style={[styles.storyAvatar, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.storyEmoji}>
                {item.display_name?.charAt(0).toUpperCase() ||
                  item.username?.charAt(0).toUpperCase() ||
                  "?"}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.storyUsername, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {item.display_name || item.username || t("social.unknown")}
        </Text>
      </TouchableOpacity>
    );
  };

  // ─── Feed post ────────────────────────────────────────────────
  const renderPost = ({ item }: { item: Post }) => {
    const authorName =
      item.author.displayName || item.author.username || "Anonyme";
    const authorInitial = authorName.charAt(0).toUpperCase();

    return (
      <View
        testID={`feed-post-${item.id}`}
        style={[
          styles.postCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Author header */}
        <View style={styles.postHeader}>
          {item.author.avatarUrl ? (
            <Image
              source={{ uri: item.author.avatarUrl }}
              style={styles.postAvatarImage}
            />
          ) : (
            <View
              style={[
                styles.postAvatar,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.postAvatarText, { color: colors.primary }]}>
                {authorInitial}
              </Text>
            </View>
          )}
          <View style={styles.postHeaderInfo}>
            <Text style={[styles.postAuthor, { color: colors.text }]}>
              {authorName}
            </Text>
            <Text style={[styles.postTime, { color: colors.textMuted }]}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          {(item.type === "news" || item.type === "announcement") && (
            <View
              style={[
                styles.newsBadge,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.newsBadgeText, { color: colors.primary }]}>
                {t("social.newsBadge")}
              </Text>
            </View>
          )}
        </View>

        {/* Media */}
        {item.mediaUrls && item.mediaUrls.length > 0 && (
          <Image
            source={{ uri: item.mediaUrls[0] }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <Text style={[styles.postContent, { color: colors.text }]}>
          {item.content}
        </Text>

        {/* Actions */}
        <View style={[styles.postActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            testID={`like-${item.id}`}
            style={styles.actionBtn}
            onPress={() => handleToggleLike(item)}
          >
            <Text
              style={[
                styles.actionText,
                { color: item.isLiked ? colors.primary : colors.textMuted },
              ]}
            >
              {item.isLiked ? "❤️" : "🤍"} {item.likesCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={`comment-${item.id}`}
            style={styles.actionBtn}
            onPress={() => handleCommentPress(item.id)}
          >
            <Text style={[styles.actionText, { color: colors.textMuted }]}>
              💬 {item.commentsCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={`share-${item.id}`}
            style={styles.actionBtn}
            onPress={() => handleShare(item.id)}
          >
            <Text style={[styles.actionText, { color: colors.textMuted }]}>
              🔗 {item.sharesCount > 0 ? item.sharesCount : t("social.share")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Footer loader for infinite scroll
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  // Header component for FlatList
  const ListHeader = () => (
    <View style={[styles.content, { paddingHorizontal: spacing.lg }]}>
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>
        {t("social.title")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {t("social.subtitle")}
      </Text>

      {/* ── Story Carousel ──────────────────────────────────── */}
      <FlatList
        testID="social-story-carousel"
        data={storyCarouselData}
        renderItem={renderStoryUser}
        keyExtractor={(item, _index) =>
          "isAddStory" in item ? "add-story" : item.user_id
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storyCarousel}
      />

      {/* ── Filters ─────────────────────────────────────────── */}
      <View testID="feed-filters" style={styles.filterRow}>
        {(["mixed", "news", "following"] as FeedFilter[]).map((f) => {
          const labels: Record<FeedFilter, string> = {
            mixed: t("social.mixed"),
            news: t("social.news"),
            following: t("social.following"),
          };
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              testID={`filter-${f}`}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? "#fff" : colors.textMuted },
                ]}
              >
                {labels[f]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Loading indicator */}
      {isLoadingFeed && posts.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {t("common.loading")}
          </Text>
        </View>
      )}
    </View>
  );

  // Empty feed component
  const ListEmpty = () => {
    if (isLoadingFeed) return null;
    return (
      <Text
        testID="empty-feed"
        style={[styles.emptyText, { color: colors.textMuted }]}
      >
        {t("social.emptyFeed")}
      </Text>
    );
  };

  return (
    <View
      testID="social-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        ref={flatListRef}
        testID="social-feed"
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: 100,
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* ── Create Post FAB ──────────────────────────────────── */}
      <TouchableOpacity
        testID="btn-create-post"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreatePost}
      >
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 16 },

  // Story carousel
  storyCarousel: { marginBottom: 16 },
  storyItem: { alignItems: "center", marginRight: 14, width: 64 },
  storyRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  storyEmoji: { fontSize: 20 },
  storyUsername: { fontSize: 11, marginTop: 4, textAlign: "center" },

  // Filters
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "500" },

  // Loading
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  // Post card
  postCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  postAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  postAvatarText: { fontSize: 16, fontWeight: "600" },
  postHeaderInfo: { flex: 1, marginLeft: 10 },
  postAuthor: { fontSize: 14, fontWeight: "600" },
  postTime: { fontSize: 12, marginTop: 2 },
  newsBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  newsBadgeText: { fontSize: 11, fontWeight: "600" },
  postImage: {
    width: "100%",
    height: 200,
  },
  postContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  actionBtn: { flex: 1, alignItems: "center" },
  actionText: { fontSize: 13 },

  // Empty
  emptyText: { textAlign: "center", padding: 40, fontSize: 14 },

  // Footer loader
  footerLoader: {
    padding: 16,
    alignItems: "center",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: { fontSize: 24 },
});
