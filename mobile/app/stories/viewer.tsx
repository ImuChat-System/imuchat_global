/**
 * Story Viewer Screen — Fullscreen immersive story display
 *
 * Features:
 * - Auto-progress with timer bar
 * - Tap left/right to navigate
 * - Long press to pause
 * - Swipe up/down to close
 * - Reply input
 * - View count (for own stories)
 *
 * DEV-011: Stories Réelles
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import {
  reactToStory,
  sendStoryReply,
  type StoryReaction,
} from "@/services/stories-api";
import {
  useCurrentStory,
  useCurrentStoryGroup,
  useStoriesStore,
} from "@/stores/stories-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const STORY_DURATION = 5000; // 5 seconds per story

const REACTIONS: StoryReaction[] = ["❤️", "😂", "😮", "😢", "🔥", "👏"];

export default function StoryViewerScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Store
  const {
    viewer,
    storyGroups,
    closeViewer,
    nextStory,
    prevStory,
    pauseViewer,
    resumeViewer,
    markViewed,
  } = useStoriesStore();

  const currentStory = useCurrentStory();
  const currentGroup = useCurrentStoryGroup();

  // Local state
  const [replyText, setReplyText] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const closeThreshold = SCREEN_HEIGHT * 0.2;

  // Progress timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Auto-progress timer ─────────────────────────────────────
  const startTimer = useCallback(() => {
    if (!currentStory) return;

    progressAnim.setValue(0);

    const duration = (currentStory.duration_seconds || 5) * 1000;

    Animated.timing(progressAnim, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        nextStory();
      }
    });
  }, [currentStory, nextStory, progressAnim]);

  const pauseTimer = useCallback(() => {
    progressAnim.stopAnimation();
  }, [progressAnim]);

  const resumeTimer = useCallback(() => {
    // Resume from current position
    const currentValue =
      (progressAnim as unknown as { _value: number })._value || 0;
    const remaining = 1 - currentValue;
    const duration = (currentStory?.duration_seconds || 5) * 1000 * remaining;

    Animated.timing(progressAnim, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        nextStory();
      }
    });
  }, [currentStory, nextStory, progressAnim]);

  // ─── Mark viewed on story change ────────────────────────────
  useEffect(() => {
    if (currentStory && currentStory.user_id !== user?.id) {
      markViewed(currentStory.id);
    }
  }, [currentStory?.id, user?.id, markViewed]);

  // ─── Start/resume timer based on viewer state ───────────────
  useEffect(() => {
    if (!viewer.isOpen || !currentStory) return;

    if (viewer.isPaused) {
      pauseTimer();
    } else {
      startTimer();
    }

    return () => {
      progressAnim.stopAnimation();
    };
  }, [
    viewer.isOpen,
    viewer.isPaused,
    viewer.currentStoryIndex,
    viewer.currentUserIndex,
  ]);

  // ─── Close handler (navigate back) ──────────────────────────
  const handleClose = useCallback(() => {
    closeViewer();
    router.back();
  }, [closeViewer, router]);

  // ─── Tap handlers ───────────────────────────────────────────
  const handleTapLeft = useCallback(() => {
    prevStory();
  }, [prevStory]);

  const handleTapRight = useCallback(() => {
    nextStory();
  }, [nextStory]);

  // ─── Long press to pause ────────────────────────────────────
  const handleLongPressIn = useCallback(() => {
    pauseViewer();
  }, [pauseViewer]);

  const handleLongPressOut = useCallback(() => {
    resumeViewer();
  }, [resumeViewer]);

  // ─── Swipe to close ─────────────────────────────────────────
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true },
  );

  const handleGestureStateChange = useCallback(
    (event: { nativeEvent: { state: number; translationY: number } }) => {
      if (event.nativeEvent.state === State.END) {
        if (Math.abs(event.nativeEvent.translationY) > closeThreshold) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      }
    },
    [closeThreshold, handleClose, translateY],
  );

  // ─── Reply ──────────────────────────────────────────────────
  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !currentStory || isSending) return;

    setIsSending(true);
    try {
      await sendStoryReply(currentStory.id, replyText.trim());
      setReplyText("");
      Keyboard.dismiss();
      // Show toast or feedback
    } catch {
      // Handle error
    } finally {
      setIsSending(false);
    }
  }, [replyText, currentStory, isSending]);

  // ─── Reaction ───────────────────────────────────────────────
  const handleReaction = useCallback(
    async (reaction: StoryReaction) => {
      if (!currentStory) return;

      try {
        await reactToStory(currentStory.id, reaction);
        setShowReactions(false);
      } catch {
        // Handle error
      }
    },
    [currentStory],
  );

  // ─── Guard: no story ────────────────────────────────────────
  if (!currentStory || !currentGroup) {
    return null;
  }

  const isOwnStory = currentStory.user_id === user?.id;
  const storiesCount = currentGroup.stories.length;
  const currentIndex = viewer.currentStoryIndex;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor:
                currentStory.type === "text"
                  ? currentStory.background_color
                  : "#000",
              transform: [{ translateY }],
            },
          ]}
        >
          {/* ── Background Content ─────────────────────────────── */}
          {currentStory.type === "image" && currentStory.media_url && (
            <Image
              source={{ uri: currentStory.media_url }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}

          {currentStory.type === "video" && currentStory.media_url && (
            // TODO: Video player component
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]}
            >
              <Text style={styles.videoPlaceholder}>🎬 Video</Text>
            </View>
          )}

          {currentStory.type === "text" && (
            <View style={styles.textStoryContainer}>
              <Text
                style={[
                  styles.textStoryContent,
                  {
                    color: currentStory.text_color,
                    fontFamily:
                      currentStory.font_style === "serif"
                        ? "serif"
                        : currentStory.font_style === "mono"
                          ? "monospace"
                          : undefined,
                  },
                ]}
              >
                {currentStory.text_content}
              </Text>
            </View>
          )}

          {/* ── Image caption (if any) ─────────────────────────── */}
          {currentStory.type !== "text" && currentStory.text_content && (
            <View style={styles.captionContainer}>
              <View style={styles.captionBlur}>
                <Text style={styles.captionText}>
                  {currentStory.text_content}
                </Text>
              </View>
            </View>
          )}

          {/* ── Top gradient ───────────────────────────────────── */}
          <View style={[styles.topGradient, { paddingTop: insets.top }]}>
            {/* Progress bars */}
            <View style={styles.progressContainer}>
              {currentGroup.stories.map((_, index) => (
                <View key={index} style={styles.progressBarBg}>
                  {index === currentIndex ? (
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  ) : index < currentIndex ? (
                    <View style={[styles.progressBarFill, { width: "100%" }]} />
                  ) : null}
                </View>
              ))}
            </View>

            {/* Header: Avatar + Name + Close */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                  {currentGroup.avatar_url ? (
                    <Image
                      source={{ uri: currentGroup.avatar_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarFallback}>
                      {currentGroup.username?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={styles.username}>
                    {currentGroup.display_name || currentGroup.username}
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatTimeAgo(currentStory.created_at)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Tap zones ──────────────────────────────────────── */}
          <View style={styles.tapZones}>
            <Pressable
              style={styles.tapZoneLeft}
              onPress={handleTapLeft}
              onLongPress={handleLongPressIn}
              onPressOut={handleLongPressOut}
              delayLongPress={200}
            />
            <Pressable
              style={styles.tapZoneRight}
              onPress={handleTapRight}
              onLongPress={handleLongPressIn}
              onPressOut={handleLongPressOut}
              delayLongPress={200}
            />
          </View>

          {/* ── Bottom: Reply bar or View count ────────────────── */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
              styles.bottomContainer,
              { paddingBottom: insets.bottom + 8 },
            ]}
          >
            <View style={styles.bottomGradient}>
              {isOwnStory ? (
                // View count for own story
                <View style={styles.viewCountContainer}>
                  <Ionicons name="eye" size={20} color="#fff" />
                  <Text style={styles.viewCountText}>
                    {currentStory.view_count || 0}{" "}
                    {t("stories.views", { defaultValue: "views" })}
                  </Text>
                </View>
              ) : currentStory.allow_replies ? (
                // Reply input for others' stories
                <View style={styles.replyContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder={t("stories.replyPlaceholder", {
                      defaultValue: "Reply...",
                    })}
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={replyText}
                    onChangeText={setReplyText}
                    onFocus={pauseViewer}
                    onBlur={resumeViewer}
                  />

                  {replyText.trim() ? (
                    <TouchableOpacity
                      onPress={handleSendReply}
                      disabled={isSending}
                      style={styles.sendButton}
                    >
                      <Ionicons
                        name="send"
                        size={24}
                        color={isSending ? "rgba(255,255,255,0.4)" : "#fff"}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowReactions(!showReactions)}
                      style={styles.reactionButton}
                    >
                      <Ionicons name="heart-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}

              {/* Reactions picker */}
              {showReactions && (
                <View style={styles.reactionsContainer}>
                  {REACTIONS.map((reaction) => (
                    <TouchableOpacity
                      key={reaction}
                      onPress={() => handleReaction(reaction)}
                      style={styles.reactionItem}
                    >
                      <Text style={styles.reactionEmoji}>{reaction}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // Text story
  textStoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  textStoryContent: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 38,
  },

  // Video placeholder
  videoPlaceholder: {
    color: "#fff",
    fontSize: 48,
    textAlign: "center",
    marginTop: SCREEN_HEIGHT / 2 - 50,
  },

  // Caption
  captionContainer: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
  },
  captionBlur: {
    borderRadius: 12,
    padding: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },

  // Top gradient
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  // Progress bars
  progressContainer: {
    flexDirection: "row",
    gap: 4,
    paddingTop: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  username: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  timestamp: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
  },

  // Tap zones
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 5,
  },
  tapZoneLeft: {
    flex: 1,
  },
  tapZoneRight: {
    flex: 2,
  },

  // Bottom
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomGradient: {
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  // View count
  viewCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  viewCountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // Reply
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
  },
  sendButton: {
    padding: 4,
  },
  reactionButton: {
    padding: 4,
  },

  // Reactions
  reactionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 32,
    marginTop: 8,
  },
  reactionItem: {
    padding: 8,
  },
  reactionEmoji: {
    fontSize: 28,
  },
});
