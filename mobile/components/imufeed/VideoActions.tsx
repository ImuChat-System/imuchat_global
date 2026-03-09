/**
 * VideoActions — Panneau latéral droit d'actions sur une vidéo ImuFeed
 * Sprint S2 Axe B — Feed Vertical Plein Écran
 *
 * Actions : Like, Comment, Share, Bookmark + avatar auteur
 * Compteurs animés, retour haptique via Haptics
 */

import { useI18n } from "@/providers/I18nProvider";
import type { ImuFeedVideo } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

// ─── Props ────────────────────────────────────────────────────

interface VideoActionsProps {
  video: ImuFeedVideo;
  onToggleLike: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onShare: (videoId: string) => void;
  onComment: (videoId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Component ────────────────────────────────────────────────

const VideoActions = React.memo(function VideoActions({
  video,
  onToggleLike,
  onToggleBookmark,
  onShare,
  onComment,
}: VideoActionsProps) {
  const { t } = useI18n();
  const router = useRouter();

  // Like animation
  const likeScale = useSharedValue(1);
  const bookmarkScale = useSharedValue(1);

  const likeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const bookmarkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  // ─── Handlers ─────────────────────────────────────────────

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    likeScale.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 400 }),
      withSpring(1),
    );
    onToggleLike(video.id);
  }, [video.id, onToggleLike, likeScale]);

  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bookmarkScale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 400 }),
      withSpring(1),
    );
    onToggleBookmark(video.id);
  }, [video.id, onToggleBookmark, bookmarkScale]);

  const handleShare = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare(video.id);
  }, [video.id, onShare]);

  const handleComment = useCallback(() => {
    onComment(video.id);
  }, [video.id, onComment]);

  const handleAuthorPress = useCallback(() => {
    router.push(`/imufeed/profile/${video.author.id}` as any);
  }, [router, video.author.id]);

  // ─── Render ───────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Author avatar */}
      <TouchableOpacity
        onPress={handleAuthorPress}
        style={styles.avatarContainer}
        accessibilityRole="button"
        accessibilityLabel={video.author.username}
      >
        {video.author.avatar_url ? (
          <Image
            source={{ uri: video.author.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        )}
        {/* Follow badge */}
        {!video.author.is_following && (
          <View style={styles.followBadge}>
            <Ionicons name="add" size={12} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Like */}
      <Animated.View style={likeAnimStyle}>
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={t("imufeed.like")}
        >
          <Ionicons
            name={video.is_liked ? "heart" : "heart-outline"}
            size={32}
            color={video.is_liked ? "#ff2d55" : "#fff"}
          />
          <Text style={styles.actionCount}>
            {formatCount(video.likes_count)}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Comment */}
      <TouchableOpacity
        onPress={handleComment}
        style={styles.actionButton}
        accessibilityRole="button"
        accessibilityLabel={t("imufeed.comment")}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={30} color="#fff" />
        <Text style={styles.actionCount}>
          {formatCount(video.comments_count)}
        </Text>
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity
        onPress={handleShare}
        style={styles.actionButton}
        accessibilityRole="button"
        accessibilityLabel={t("imufeed.share")}
      >
        <Ionicons name="paper-plane-outline" size={28} color="#fff" />
        <Text style={styles.actionCount}>
          {formatCount(video.shares_count)}
        </Text>
      </TouchableOpacity>

      {/* Bookmark */}
      <Animated.View style={bookmarkAnimStyle}>
        <TouchableOpacity
          onPress={handleBookmark}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={t("imufeed.bookmark")}
        >
          <Ionicons
            name={video.is_bookmarked ? "bookmark" : "bookmark-outline"}
            size={28}
            color={video.is_bookmarked ? "#f59e0b" : "#fff"}
          />
          <Text style={styles.actionCount}>
            {formatCount(video.bookmarks_count)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

export default VideoActions;

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 8,
    bottom: 120,
    alignItems: "center",
    gap: 16,
    zIndex: 10,
  },
  avatarContainer: {
    marginBottom: 8,
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  followBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#ec4899",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  actionButton: {
    alignItems: "center",
    gap: 2,
  },
  actionCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
