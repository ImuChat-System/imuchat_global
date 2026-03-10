/**
 * ImuFeedMiniPlayer — Placeholder ImuFeed dans le sous-onglet Social
 *
 * Quand ImuFeed est activé comme sous-onglet dans Social,
 * affiche un mini-feed vertical de vidéos courtes.
 * Se connecte au store ImuFeed existant.
 *
 * Sprint S11 Axe A — Refonte Social (sous-onglet ImuFeed)
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { createLogger } from "@/services/logger";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = createLogger("ImuFeedMiniPlayer");
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────

export interface MiniVideoItem {
  id: string;
  thumbnailUrl: string | null;
  caption: string;
  authorName: string;
  authorAvatar: string | null;
  viewsCount: number;
  likesCount: number;
  duration: number;
}

interface ImuFeedMiniPlayerProps {
  videos: MiniVideoItem[];
  onVideoPress: (videoId: string) => void;
  onCreatePress?: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────

export default function ImuFeedMiniPlayer({
  videos,
  onVideoPress,
  onCreatePress,
  isLoading = false,
  onRefresh,
  onEndReached,
}: ImuFeedMiniPlayerProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const renderItem = useCallback(
    ({ item }: { item: MiniVideoItem }) => (
      <TouchableOpacity
        testID={`mini-video-${item.id}`}
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => onVideoPress(item.id)}
        activeOpacity={0.85}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {item.thumbnailUrl ? (
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderThumb,
                { backgroundColor: colors.border },
              ]}
            >
              <Ionicons
                name="videocam"
                size={32}
                color={colors.textSecondary}
              />
            </View>
          )}

          {/* Duration badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>

          {/* Play overlay */}
          <View style={styles.playOverlay}>
            <Ionicons
              name="play-circle"
              size={44}
              color="rgba(255,255,255,0.9)"
            />
          </View>
        </View>

        {/* Info */}
        <View style={[styles.info, { padding: spacing.sm }]}>
          <View style={styles.authorRow}>
            {item.authorAvatar ? (
              <Image
                source={{ uri: item.authorAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.border },
                ]}
              >
                <Ionicons
                  name="person"
                  size={10}
                  color={colors.textSecondary}
                />
              </View>
            )}
            <Text
              style={[styles.authorName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.authorName}
            </Text>
          </View>
          <Text
            style={[styles.caption, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.caption}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons
                name="eye-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {formatCount(item.viewsCount)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons
                name="heart-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {formatCount(item.likesCount)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [colors, spacing, onVideoPress],
  );

  if (videos.length === 0 && !isLoading) {
    return (
      <View testID="imufeed-mini-empty" style={styles.emptyContainer}>
        <Ionicons
          name="videocam-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Aucune vidéo ImuFeed
        </Text>
        {onCreatePress && (
          <TouchableOpacity
            testID="imufeed-mini-create"
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={onCreatePress}
          >
            <Text style={styles.createBtnText}>Créer une vidéo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <FlatList
      testID="imufeed-mini-list"
      data={videos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      refreshing={isLoading}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────

const CARD_WIDTH = (SCREEN_WIDTH - 12) / 2;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: "hidden",
    margin: 3,
  },
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    maxHeight: 200,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderThumb: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    gap: 4,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  avatarPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 10,
  },
  columnWrapper: {
    justifyContent: "flex-start",
  },
  listContent: {
    padding: 3,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
  createBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
