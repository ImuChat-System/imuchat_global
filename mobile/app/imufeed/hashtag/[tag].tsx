/**
 * Hashtag Page — Affiche les vidéos associées à un hashtag
 *
 * Route : /imufeed/hashtag/[tag]
 * Affiche le header (nom du tag + compteur) puis une grille de vidéos.
 *
 * Sprint S6 Axe B — Hashtags & Search
 */

import VideoFeedItem from "@/components/imufeed/VideoFeedItem";
import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { fetchVideosByHashtag } from "@/services/imufeed-api";
import { createLogger } from "@/services/logger";
import type { FeedPage, ImuFeedVideo } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const logger = createLogger("HashtagPage");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────

export default function HashtagScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [videos, setVideos] = useState<ImuFeedVideo[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const decodedTag = decodeURIComponent(tag ?? "");

  // ─── Fetch ──────────────────────────────────────────────

  const loadVideos = useCallback(
    async (reset = false) => {
      if (!decodedTag) return;
      try {
        if (reset) setIsLoading(true);
        const page: FeedPage = await fetchVideosByHashtag(
          decodedTag,
          reset ? undefined : (cursor ?? undefined),
        );
        setVideos((prev) => (reset ? page.videos : [...prev, ...page.videos]));
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      } catch (err) {
        logger.error("loadVideos failed", err);
      } finally {
        setIsLoading(false);
      }
    },
    [decodedTag, cursor],
  );

  useEffect(() => {
    loadVideos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedTag]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) loadVideos(false);
  }, [hasMore, isLoading, loadVideos]);

  const handleToggleMute = useCallback(() => setIsMuted((m) => !m), []);

  const handleToggleLike = useCallback((_videoId: string) => {
    // Like géré par le store ImuFeed (toggle optimiste)
  }, []);

  // ─── Render ─────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            #{decodedTag}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {videos.length} {t("imufeed.videos")}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Video list */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          pagingEnabled
          snapToInterval={SCREEN_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <VideoFeedItem
              video={item}
              isActive={false}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onToggleLike={handleToggleLike}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="videocam-off-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t("imufeed.no_videos")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
  },
});
