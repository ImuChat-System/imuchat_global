/**
 * VideoFeedItem — Élément vidéo plein écran pour le feed vertical ImuFeed
 * Sprint S2 Axe B — Feed Vertical Plein Écran
 *
 * Fonctionnalités :
 * - Vidéo plein écran avec expo-av
 * - Autoplay quand visible, pause quand hors écran
 * - Boucle automatique
 * - Tap → toggle mute
 * - Double-tap → like avec animation cœur
 * - Overlay : auteur, caption, hashtags, barre de progression
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { ImuFeedVideo } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Props ────────────────────────────────────────────────────

interface VideoFeedItemProps {
  video: ImuFeedVideo;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: (videoId: string) => void;
  onDoubleTapLike?: (videoId: string) => void;
}

// ─── Component ────────────────────────────────────────────────

const VideoFeedItem = React.memo(function VideoFeedItem({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onToggleLike,
  onDoubleTapLike,
}: VideoFeedItemProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  // Pour le double-tap like
  const lastTap = useRef<number>(0);
  const DOUBLE_TAP_DELAY = 300;

  // Animation cœur flottant
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  // Barre de progression
  const [progress, setProgress] = useState(0);

  // ─── Autoplay / Pause ─────────────────────────────────────

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
      videoRef.current.setPositionAsync(0);
    }
  }, [isActive]);

  // ─── Playback status → progress bar ──────────────────────

  const handlePlaybackStatus = useCallback((status: any) => {
    if (status.isLoaded && status.durationMillis > 0) {
      setProgress(status.positionMillis / status.durationMillis);
    }
  }, []);

  // ─── Tap handling ─────────────────────────────────────────

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double-tap → like
      if (!video.is_liked) {
        onToggleLike(video.id);
      }
      onDoubleTapLike?.(video.id);
      // Animate heart
      heartScale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 300 }),
        withTiming(0, { duration: 600 }),
      );
      heartOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 700 }),
      );
      lastTap.current = 0;
    } else {
      // Single tap → toggle mute
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          onToggleMute();
        }
      }, DOUBLE_TAP_DELAY);
    }
  }, [
    video.id,
    video.is_liked,
    onToggleLike,
    onDoubleTapLike,
    onToggleMute,
    heartScale,
    heartOpacity,
  ]);

  // Animated heart style
  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  // ─── Navigate to author profile ───────────────────────────

  const handleAuthorPress = useCallback(() => {
    router.push(`/social/profile/${video.author.id}` as any);
  }, [router, video.author.id]);

  // ─── Hashtag press ────────────────────────────────────────

  const handleHashtagPress = useCallback(
    (tag: string) => {
      router.push(`/search?q=%23${encodeURIComponent(tag)}` as any);
    },
    [router],
  );

  // ─── Caption avec hashtags cliquables ─────────────────────

  const renderCaption = () => {
    if (!video.caption) return null;
    // Simple regex pour les #hashtags
    const parts = video.caption.split(/(#\w+)/g);
    return (
      <Text style={styles.caption} numberOfLines={2}>
        {parts.map((part, i) =>
          part.startsWith("#") ? (
            <Text
              key={i}
              style={styles.hashtag}
              onPress={() => handleHashtagPress(part.slice(1))}
            >
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          ),
        )}
      </Text>
    );
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <View
      style={[styles.container, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
    >
      {/* Video */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={StyleSheet.absoluteFill}>
          <Video
            ref={videoRef}
            source={{ uri: video.video_url }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted={isMuted}
            shouldPlay={isActive}
            onPlaybackStatusUpdate={handlePlaybackStatus}
            posterSource={
              video.thumbnail_url ? { uri: video.thumbnail_url } : undefined
            }
            usePoster
          />

          {/* Floating heart animation (double-tap) */}
          <Animated.View
            style={[styles.floatingHeart, heartAnimStyle]}
            pointerEvents="none"
          >
            <Ionicons name="heart" size={100} color="#ff2d55" />
          </Animated.View>

          {/* Mute indicator (brief) */}
          {!isMuted ? null : (
            <View style={styles.muteIndicator} pointerEvents="none">
              <Ionicons
                name="volume-mute"
                size={24}
                color="rgba(255,255,255,0.5)"
              />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Bottom overlay — author + caption */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        {/* Author */}
        <TouchableOpacity
          style={styles.authorRow}
          onPress={handleAuthorPress}
          accessibilityRole="button"
          accessibilityLabel={
            video.author.display_name || video.author.username
          }
        >
          <Text style={styles.authorName}>
            @{video.author.username}
            {video.author.is_verified && (
              <Text>
                {" "}
                <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
              </Text>
            )}
          </Text>
        </TouchableOpacity>

        {/* Caption */}
        {renderCaption()}

        {/* Sound bar */}
        {video.sound && (
          <View style={styles.soundRow}>
            <Ionicons name="musical-notes" size={14} color="#fff" />
            <Text style={styles.soundText} numberOfLines={1}>
              {video.sound.title} — {video.sound.artist}
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
});

export default VideoFeedItem;

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    position: "relative",
  },
  floatingHeart: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -50,
    marginLeft: -50,
    zIndex: 10,
  },
  muteIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -16,
    marginLeft: -16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 80,
    left: 12,
    right: 80,
    zIndex: 5,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  authorName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hashtag: {
    color: "#ec4899",
    fontWeight: "600",
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  soundText: {
    color: "#fff",
    fontSize: 13,
    flex: 1,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    zIndex: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ec4899",
  },
});
