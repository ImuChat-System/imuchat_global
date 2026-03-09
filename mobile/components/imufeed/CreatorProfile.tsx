/**
 * CreatorProfile — Profil créateur ImuFeed réutilisable
 *
 * Affiche l'avatar, nom, bio, compteurs (vidéos, abonnés, likes),
 * boutons suivre/message, et grille vidéos 3 colonnes.
 *
 * Sprint S4 Axe B — Profil Créateur MVP
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import * as ImuFeedAPI from "@/services/imufeed-api";
import { useImuFeedStore } from "@/stores/imufeed-store";
import type { ImuFeedVideo, VideoAuthor } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

// ─── Types ────────────────────────────────────────────────────

interface CreatorProfileProps {
  userId: string;
}

interface CreatorStats {
  videos_count: number;
  followers_count: number;
  following_count: number;
  total_likes: number;
}

// ─── Component ────────────────────────────────────────────────

export default function CreatorProfile({ userId }: CreatorProfileProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const toggleFollow = useImuFeedStore((s) => s.toggleFollow);

  const [author, setAuthor] = useState<VideoAuthor | null>(null);
  const [bio, setBio] = useState<string>("");
  const [stats, setStats] = useState<CreatorStats>({
    videos_count: 0,
    followers_count: 0,
    following_count: 0,
    total_likes: 0,
  });
  const [videos, setVideos] = useState<ImuFeedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = user?.id === userId;

  // ─── Load profile data ────────────────────────

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Fetch user info
      const following = await ImuFeedAPI.isFollowing(userId);
      setIsFollowing(following);

      // Fetch videos
      const feedPage = await ImuFeedAPI.fetchUserVideos(userId);
      setVideos(feedPage.videos);
      setCursor(feedPage.cursor);
      setHasMore(feedPage.hasMore);

      // Derive author from first video or fallback
      if (feedPage.videos.length > 0) {
        const firstAuthor = feedPage.videos[0].author;
        setAuthor(firstAuthor);
        setStats({
          videos_count: feedPage.videos.length,
          followers_count: firstAuthor.followers_count,
          following_count: 0,
          total_likes: feedPage.videos.reduce(
            (sum, v) => sum + v.likes_count,
            0,
          ),
        });
      }
    } catch {
      // Silently fail — will show empty state
    } finally {
      setLoading(false);
    }
  };

  // ─── Load more videos ─────────────────────────

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const feedPage = await ImuFeedAPI.fetchUserVideos(userId, cursor);
      setVideos((prev) => [...prev, ...feedPage.videos]);
      setCursor(feedPage.cursor);
      setHasMore(feedPage.hasMore);
    } catch {
      // Ignore pagination errors
    } finally {
      setLoadingMore(false);
    }
  }, [userId, cursor, hasMore, loadingMore]);

  // ─── Follow toggle ────────────────────────────

  const handleFollow = useCallback(async () => {
    const was = isFollowing;
    setIsFollowing(!was);
    setStats((prev) => ({
      ...prev,
      followers_count: prev.followers_count + (was ? -1 : 1),
    }));
    try {
      await toggleFollow(userId);
    } catch {
      // Rollback
      setIsFollowing(was);
      setStats((prev) => ({
        ...prev,
        followers_count: prev.followers_count + (was ? 1 : -1),
      }));
    }
  }, [isFollowing, userId, toggleFollow]);

  // ─── Navigate to video ────────────────────────

  const handleVideoPress = useCallback(
    (video: ImuFeedVideo) => {
      router.push(`/imufeed?videoId=${video.id}` as any);
    },
    [router],
  );

  const handleMessage = useCallback(() => {
    router.push(`/chat/${userId}` as any);
  }, [router, userId]);

  // ─── Format numbers ───────────────────────────

  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  // ─── Header Component ─────────────────────────

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Avatar */}
      <View style={styles.avatarRow}>
        {author?.avatar_url ? (
          <Image source={{ uri: author.avatar_url }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.avatarPlaceholder,
              { backgroundColor: colors.border },
            ]}
          >
            <Ionicons name="person" size={40} color={colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Name & Bio */}
      <Text style={[styles.displayName, { color: colors.text }]}>
        {author?.display_name || author?.username || "..."}
      </Text>
      <Text style={[styles.username, { color: colors.textSecondary }]}>
        @{author?.username || "..."}
        {author?.is_verified && (
          <Text>
            {" "}
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.primary}
            />
          </Text>
        )}
      </Text>
      {bio ? (
        <Text style={[styles.bio, { color: colors.text }]}>{bio}</Text>
      ) : null}

      {/* Stats Row */}
      <View style={[styles.statsRow, { marginTop: spacing.md }]}>
        <StatItem
          count={stats.followers_count}
          label={t("profile.followers") || "Abonnés"}
          colors={colors}
        />
        <StatItem
          count={stats.following_count}
          label={t("profile.following") || "Abonnements"}
          colors={colors}
        />
        <StatItem
          count={stats.total_likes}
          label={t("profile.likes") || "Likes"}
          colors={colors}
        />
        <StatItem
          count={stats.videos_count}
          label={t("profile.videos") || "Vidéos"}
          colors={colors}
        />
      </View>

      {/* Action Buttons */}
      {!isOwnProfile && (
        <View style={[styles.actionsRow, { marginTop: spacing.md }]}>
          <TouchableOpacity
            onPress={handleFollow}
            style={[
              styles.followButton,
              isFollowing
                ? { backgroundColor: colors.border }
                : { backgroundColor: colors.primary },
            ]}
            accessibilityLabel={isFollowing ? "Se désabonner" : "S'abonner"}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.followButtonText,
                { color: isFollowing ? colors.text : "#fff" },
              ]}
            >
              {isFollowing
                ? t("profile.following_btn") || "Abonné"
                : t("profile.follow") || "S'abonner"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMessage}
            style={[styles.messageButton, { borderColor: colors.border }]}
            accessibilityLabel="Envoyer un message"
            accessibilityRole="button"
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Grid Label */}
      <View
        style={[
          styles.gridHeader,
          { borderBottomColor: colors.border, marginTop: spacing.md },
        ]}
      >
        <Ionicons name="grid" size={20} color={colors.primary} />
        <Text style={[styles.gridLabel, { color: colors.text }]}>
          {t("profile.videos") || "Vidéos"}
        </Text>
      </View>
    </View>
  );

  // ─── Video Grid Item ──────────────────────────

  const renderVideoTile = ({ item }: { item: ImuFeedVideo }) => (
    <TouchableOpacity
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.8}
      style={styles.tile}
      accessibilityLabel={item.caption || "Vidéo"}
      accessibilityRole="button"
    >
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.tileThumbnail}
        />
      ) : (
        <View style={[styles.tileThumbnail, { backgroundColor: colors.card }]}>
          <Ionicons name="videocam" size={24} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.tileOverlay}>
        <Ionicons name="play" size={12} color="#fff" />
        <Text style={styles.tileViews}>{formatCount(item.views_count)}</Text>
      </View>
    </TouchableOpacity>
  );

  // ─── Loading State ────────────────────────────

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(v) => v.id}
      renderItem={renderVideoTile}
      numColumns={GRID_COLUMNS}
      ListHeaderComponent={renderHeader}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ paddingVertical: 16 }}
          />
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons
            name="videocam-off"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("profile.noVideos") || "Aucune vidéo pour le moment"}
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 100 }}
      columnWrapperStyle={{ gap: GRID_GAP }}
      style={{ backgroundColor: colors.background }}
    />
  );
}

// ─── Stat Item ────────────────────────────────────────────────

function StatItem({
  count,
  label,
  colors,
}: {
  count: number;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <View style={styles.statItem}>
      <Text style={[styles.statCount, { color: colors.text }]}>
        {formatCount(count)}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  avatarRow: {
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: {
    fontSize: 20,
    fontWeight: "700",
  },
  username: {
    fontSize: 14,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  followButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gridHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    width: "100%",
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE * 1.3,
    marginBottom: GRID_GAP,
  },
  tileThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tileOverlay: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tileViews: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
