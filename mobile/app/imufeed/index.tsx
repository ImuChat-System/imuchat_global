/**
 * ImuFeed — Écran principal du feed vertical plein écran
 * Sprint S2 Axe B — Feed Vertical Plein Écran
 *
 * Architecture :
 * - FlatList vertical paginé (pagingEnabled)
 * - Autoplay vidéo visible, pause hors écran
 * - Tabs : Pour Toi / Abonnements
 * - Boucle et mute via tap
 * - Panneau d'actions latéral (like, comment, share, save)
 * - Bottom sheet commentaires
 *
 * Route : /imufeed (standalone) ou sous-onglet Social
 */

import VideoActions from "@/components/imufeed/VideoActions";
import VideoFeedItem from "@/components/imufeed/VideoFeedItem";
import { useImuFeed } from "@/hooks/useImuFeed";
import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import type { FeedSource, ImuFeedVideo } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────

type FeedTab = "for_you" | "following";

// ─── Component ────────────────────────────────────────────────

export default function ImuFeedScreen() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    feedSource,
    videos,
    hasMore,
    isLoading,
    isLoadingMore,
    setFeedSource,
    loadFeed,
    loadMore,
    refreshFeed,
    setActiveVideo,
    player,
    setMuted,
    toggleLike,
    toggleBookmark,
    recordView,
  } = useImuFeed();

  // ─── Tab state ────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<FeedTab>("for_you");
  const flatListRef = useRef<FlatList<ImuFeedVideo>>(null);

  // Track current visible item
  const [currentIndex, setCurrentIndex] = useState(0);

  // View tracking: record when user watches a video
  const viewStartRef = useRef<{ videoId: string; startMs: number } | null>(
    null,
  );

  // ─── Load feed on mount & tab change ──────────────────────

  useEffect(() => {
    const source: FeedSource =
      activeTab === "following" ? "following" : "for_you";
    setFeedSource(source);
    loadFeed(source);
  }, [activeTab, setFeedSource, loadFeed]);

  // ─── Tab switching ────────────────────────────────────────

  const handleTabChange = useCallback(
    (tab: FeedTab) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
      setCurrentIndex(0);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    },
    [activeTab],
  );

  // ─── Viewability tracking ────────────────────────────────

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 200,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const visibleItem = viewableItems[0];
        const idx = visibleItem.index ?? 0;
        const video = visibleItem.item as ImuFeedVideo;

        // Record view for previous video
        if (viewStartRef.current && viewStartRef.current.videoId !== video.id) {
          const watchMs = Date.now() - viewStartRef.current.startMs;
          recordView(
            viewStartRef.current.videoId,
            watchMs,
            watchMs >= (video?.duration_ms || 0) * 0.9,
          );
        }

        // Start tracking new video
        viewStartRef.current = { videoId: video.id, startMs: Date.now() };
        setCurrentIndex(idx);
        setActiveVideo(video, idx);
      }
    },
  ).current;

  // ─── Load more on end reached ─────────────────────────────

  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadMore();
    }
  }, [isLoadingMore, hasMore, loadMore]);

  // ─── Mute toggle ──────────────────────────────────────────

  const handleToggleMute = useCallback(() => {
    setMuted(!player.isMuted);
  }, [player.isMuted, setMuted]);

  // ─── Share action ─────────────────────────────────────────

  const handleShare = useCallback(async (videoId: string) => {
    try {
      await Share.share({
        message: `Regarde cette vidéo sur ImuChat ! https://imuchat.com/imufeed/${videoId}`,
      });
    } catch {
      // User cancelled
    }
  }, []);

  // ─── Comment sheet ────────────────────────────────────────

  const handleOpenComments = useCallback(
    (videoId: string) => {
      // Find the video to pass its comments count
      const video = videos.find((v) => v.id === videoId);
      const count = video?.comments_count ?? 0;
      router.push(
        `/imufeed/comments?videoId=${videoId}&commentsCount=${count}` as any,
      );
    },
    [router, videos],
  );

  // ─── Render item ──────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: { item: ImuFeedVideo; index: number }) => (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
        <VideoFeedItem
          video={item}
          isActive={index === currentIndex}
          isMuted={player.isMuted}
          onToggleMute={handleToggleMute}
          onToggleLike={toggleLike}
        />
        <VideoActions
          video={item}
          onToggleLike={toggleLike}
          onToggleBookmark={toggleBookmark}
          onShare={handleShare}
          onComment={handleOpenComments}
        />
      </View>
    ),
    [
      currentIndex,
      player.isMuted,
      handleToggleMute,
      toggleLike,
      toggleBookmark,
      handleShare,
      handleOpenComments,
    ],
  );

  const keyExtractor = useCallback((item: ImuFeedVideo) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    [],
  );

  // ─── Render ───────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header tabs — Pour Toi / Abonnements */}
      <View style={[styles.headerTabs, { top: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => handleTabChange("following")}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "following" }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "following" && styles.tabTextActive,
            ]}
          >
            {t("imufeed.following")}
          </Text>
          {activeTab === "following" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <View style={styles.tabDivider} />

        <TouchableOpacity
          onPress={() => handleTabChange("for_you")}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "for_you" }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "for_you" && styles.tabTextActive,
            ]}
          >
            {t("imufeed.for_you")}
          </Text>
          {activeTab === "for_you" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        {/* Search icon */}
        <TouchableOpacity
          onPress={() => router.push("/search" as any)}
          style={styles.searchIcon}
          accessibilityRole="button"
          accessibilityLabel={t("common.search")}
        >
          <Ionicons name="search-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      {isLoading && videos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="videocam-outline"
            size={64}
            color="rgba(255,255,255,0.3)"
          />
          <Text style={styles.emptyText}>{t("imufeed.empty_feed")}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={videos}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReached={handleEndReached}
          onEndReachedThreshold={2}
          removeClippedSubviews
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={2}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color="#ec4899" />
              </View>
            ) : null
          }
        />
      )}

      {/* FAB — Créer une vidéo */}
      <TouchableOpacity
        onPress={() => router.push("/imufeed/create" as any)}
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        accessibilityRole="button"
        accessibilityLabel={t("imufeed.create")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerTabs: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    paddingHorizontal: 60,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: "center",
  },
  tabText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  tabIndicator: {
    width: 24,
    height: 3,
    backgroundColor: "#ec4899",
    borderRadius: 2,
    marginTop: 4,
  },
  tabDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  searchIcon: {
    position: "absolute",
    right: 12,
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    textAlign: "center",
  },
  footer: {
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ec4899",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    zIndex: 30,
  },
});
