/**
 * WatchScreen — Watch hub with expo-av video player
 * Sections : FeaturedCarousel, VideoPlayer, CategoryFilter, WatchPartyCards, UpcomingSection, CTA
 *
 * Phase M4 — Module Watch natif (expo-av + plein écran)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  enterFullscreen,
  pauseVideo,
  playVideo,
  seekVideo,
  setVideoRef,
  setVideoStatusCallback,
  unloadVideo,
} from "@/services/video-player";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type {
  VideoPlayerState,
  WatchCategory,
  WatchItem,
  WatchParty,
} from "@/types/watch";

// ─── Mock data (typed, parité web) ─────────────────────────────────
const FEATURED_ITEMS: WatchItem[] = [
  {
    id: "f1",
    title: "Anime Night: One Piece",
    description: "Épisode 1122 — Egg Head Arc",
    video_url:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "",
    author_id: "system",
    author_username: "ImuChat",
    source: "external",
    category: "anime",
    duration_ms: 5400000,
    view_count: 5420,
    like_count: 820,
    is_live: true,
    tags: ["one-piece", "anime"],
    created_at: new Date().toISOString(),
  },
  {
    id: "f2",
    title: "Ciné Club: Inception",
    description: "Christopher Nolan — 2h28",
    video_url:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_url: "",
    author_id: "system",
    author_username: "ImuChat",
    source: "external",
    category: "movie",
    duration_ms: 8880000,
    view_count: 3200,
    like_count: 490,
    is_live: false,
    tags: ["inception", "nolan"],
    created_at: new Date().toISOString(),
  },
  {
    id: "f3",
    title: "Docu: Notre Planète",
    description: "Saison 2, Ép. 4",
    video_url:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "",
    author_id: "system",
    author_username: "ImuChat",
    source: "external",
    category: "documentary",
    duration_ms: 3600000,
    view_count: 1800,
    like_count: 310,
    is_live: false,
    tags: ["nature", "documentary"],
    created_at: new Date().toISOString(),
  },
];

const WATCH_PARTIES: WatchParty[] = [
  {
    id: "wp1",
    title: "Dragon Ball Super: Broly",
    host_id: "user_alice",
    video: FEATURED_ITEMS[0],
    viewer_count: 23,
    status: "live",
    scheduled_for: new Date(Date.now() - 45 * 60000).toISOString(),
    chat_enabled: true,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
  {
    id: "wp2",
    title: "Breaking Bad S5 Marathon",
    host_id: "user_bob",
    video: FEATURED_ITEMS[1],
    viewer_count: 67,
    status: "live",
    scheduled_for: new Date(Date.now() - 90 * 60000).toISOString(),
    chat_enabled: true,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
  {
    id: "wp3",
    title: "Interstellar",
    host_id: "user_david",
    video: FEATURED_ITEMS[1],
    viewer_count: 34,
    status: "live",
    scheduled_for: new Date(Date.now() - 30 * 60000).toISOString(),
    chat_enabled: true,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
  {
    id: "wp4",
    title: "Cosmos: A Spacetime Odyssey",
    host_id: "user_emma",
    video: FEATURED_ITEMS[2],
    viewer_count: 18,
    status: "live",
    scheduled_for: new Date(Date.now() - 120 * 60000).toISOString(),
    chat_enabled: false,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
  {
    id: "wp5",
    title: "Attack on Titan Final",
    host_id: "user_francois",
    video: FEATURED_ITEMS[0],
    viewer_count: 95,
    status: "live",
    scheduled_for: new Date(Date.now() - 15 * 60000).toISOString(),
    chat_enabled: true,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
];

const UPCOMING_PARTIES: WatchParty[] = [
  {
    id: "up1",
    title: "Marvel Movie Night",
    host_id: "user_chloe",
    video: FEATURED_ITEMS[1],
    viewer_count: 0,
    status: "scheduled",
    scheduled_for: new Date(Date.now() + 3 * 3600000).toISOString(),
    chat_enabled: true,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
  {
    id: "up2",
    title: "Anime Friday: Jujutsu Kaisen",
    host_id: "user_alice",
    video: FEATURED_ITEMS[0],
    viewer_count: 0,
    status: "scheduled",
    scheduled_for: new Date(Date.now() + 24 * 3600000).toISOString(),
    chat_enabled: true,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
  {
    id: "up3",
    title: "Documentary Sunday",
    host_id: "user_bob",
    video: FEATURED_ITEMS[2],
    viewer_count: 0,
    status: "scheduled",
    scheduled_for: new Date(Date.now() + 48 * 3600000).toISOString(),
    chat_enabled: false,
    created_at: new Date().toISOString(),
    description: "",
    host_username: "",
    category: "live",
    started_at: null,
    attendee_count: 0,
  },
];

const HOST_NAMES: Record<string, string> = {
  user_alice: "Alice",
  user_bob: "Bob",
  user_david: "David",
  user_emma: "Emma",
  user_francois: "François",
  user_chloe: "Chloé",
};

const CATEGORIES: { key: WatchCategory; label: string; icon: string }[] = [
  { key: "all", label: "watch.all", icon: "🎨" },
  { key: "anime", label: "watch.anime", icon: "⛩️" },
  { key: "movie", label: "watch.movies", icon: "🎥" },
  { key: "series", label: "watch.series", icon: "📺" },
  { key: "documentary", label: "watch.documentary", icon: "🌍" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

// ─── Helpers ──────────────────────────────────────────────────────
function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────
export default function WatchScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const videoRef = useRef<Video>(null);

  const [category, setCategory] = useState<WatchCategory>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [activeVideo, setActiveVideo] = useState<WatchItem | null>(null);
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    currentVideo: null,
    currentParty: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    isBuffering: false,
    isFullscreen: false,
    isPiP: false,
  });

  // Register video ref & status callback
  useEffect(() => {
    if (videoRef.current) {
      setVideoRef(videoRef.current);
    }
    setVideoStatusCallback((status) => {
      if (status.isLoaded) {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: status.isPlaying,
          positionMs: status.positionMillis ?? 0,
          durationMs: status.durationMillis ?? 0,
          isBuffering: status.isBuffering,
        }));
      }
    });
    return () => {
      unloadVideo();
    };
  }, []);

  // Play a featured item / party video
  const handlePlayVideo = useCallback(
    async (item: WatchItem) => {
      if (activeVideo?.id === item.id) {
        // Toggle play/pause if same video
        if (playerState.isPlaying) {
          await pauseVideo();
        } else {
          await playVideo();
        }
        return;
      }
      setActiveVideo(item);
      try {
        if (videoRef.current) {
          await videoRef.current.unloadAsync();
          await videoRef.current.loadAsync(
            { uri: item.video_url },
            { shouldPlay: true, progressUpdateIntervalMillis: 500 },
          );
        }
      } catch (err) {
        console.warn("[Watch] Failed to load video:", err);
      }
    },
    [activeVideo, playerState.isPlaying],
  );

  const handleTogglePlayPause = useCallback(async () => {
    if (playerState.isPlaying) {
      await pauseVideo();
    } else {
      await playVideo();
    }
  }, [playerState.isPlaying]);

  const handleFullscreen = useCallback(async () => {
    await enterFullscreen();
  }, []);

  const handleSeek = useCallback(
    async (direction: "back" | "forward") => {
      const delta = direction === "back" ? -10000 : 10000;
      const target = Math.max(
        0,
        Math.min(playerState.positionMs + delta, playerState.durationMs),
      );
      await seekVideo(target);
    },
    [playerState.positionMs, playerState.durationMs],
  );

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch live watch parties from API when available
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const filteredParties =
    category === "all"
      ? WATCH_PARTIES
      : WATCH_PARTIES.filter((p) => p.video?.category === category);

  // ─── Featured carousel item ───────────────────────────────────
  const renderFeatured = ({ item }: { item: WatchItem }) => (
    <TouchableOpacity
      testID={`featured-${item.id}`}
      onPress={() => handlePlayVideo(item)}
      style={[
        styles.featuredCard,
        {
          width: SCREEN_WIDTH - spacing.lg * 2 - 24,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.featuredTop}>
        <Text style={[styles.featuredBadge, { color: colors.primary }]}>
          {item.is_live ? "🔴 LIVE" : `⏱ ${formatDuration(item.duration_ms)}`}
        </Text>
        <Text style={[styles.featuredViewers, { color: colors.textMuted }]}>
          👁 {item.view_count.toLocaleString()}
        </Text>
      </View>
      <Text style={[styles.featuredTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.featuredSub, { color: colors.textMuted }]}>
        {item.description}
      </Text>
      <View style={styles.featuredActions}>
        <TouchableOpacity
          testID={`play-featured-${item.id}`}
          style={[styles.joinBtn, { backgroundColor: colors.primary }]}
          onPress={() => handlePlayVideo(item)}
        >
          <Ionicons name="play" size={14} color="#fff" />
          <Text style={styles.joinBtnText}>
            {activeVideo?.id === item.id && playerState.isPlaying
              ? t("watch.pause") || "Pause"
              : t("watch.play") || "Lecture"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="heart-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>
            {item.like_count}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ─── Watch party card ─────────────────────────────────────────
  const renderParty = (p: WatchParty) => {
    const hostName = HOST_NAMES[p.host_id] ?? p.host_id;
    return (
      <TouchableOpacity
        key={p.id}
        testID={`party-${p.id}`}
        onPress={() => p.video && handlePlayVideo(p.video)}
        style={[
          styles.partyCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.partyHeader}>
          <View
            style={[
              styles.liveDot,
              {
                backgroundColor:
                  p.status === "live" ? "#ef4444" : colors.border,
              },
            ]}
          />
          <Text
            style={[styles.partyTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {p.title}
          </Text>
        </View>
        <Text style={[styles.partyHost, { color: colors.textMuted }]}>
          👤 {hostName}
        </Text>
        <View style={styles.partyMeta}>
          <Text style={[styles.partyViewers, { color: colors.primary }]}>
            👁 {p.viewer_count}
          </Text>
          <TouchableOpacity
            testID={`join-party-${p.id}`}
            style={[styles.partyJoin, { borderColor: colors.primary }]}
            onPress={() => p.video && handlePlayVideo(p.video)}
          >
            <Text style={[styles.partyJoinText, { color: colors.primary }]}>
              {t("watch.join")}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Upcoming card ────────────────────────────────────────────
  const renderUpcoming = (u: WatchParty) => {
    const hostName = HOST_NAMES[u.host_id] ?? u.host_id;
    const date = new Date(u.scheduled_for!);
    const timeStr = `${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`;
    const dayDiff = Math.floor((date.getTime() - Date.now()) / (24 * 3600000));
    const dayLabel =
      dayDiff === 0
        ? t("common.today")
        : dayDiff === 1
          ? t("common.tomorrow")
          : t("common.inDays", { count: dayDiff });

    return (
      <TouchableOpacity
        key={u.id}
        testID={`upcoming-${u.id}`}
        style={[
          styles.upcomingCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.upcomingLeft}>
          <Text style={[styles.upcomingDay, { color: colors.primary }]}>
            {dayLabel}
          </Text>
          <Text style={[styles.upcomingTime, { color: colors.textMuted }]}>
            {timeStr}
          </Text>
        </View>
        <View style={styles.upcomingInfo}>
          <Text
            style={[styles.upcomingTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {u.title}
          </Text>
          <Text style={[styles.upcomingHost, { color: colors.textMuted }]}>
            👤 {hostName} · {u.viewer_count} {t("watch.registered")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  const progressPercent =
    playerState.durationMs > 0
      ? (playerState.positionMs / playerState.durationMs) * 100
      : 0;

  return (
    <ScrollView
      testID="watch-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          {t("watch.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t("watch.subtitle")}
        </Text>

        {/* ── Video Player ────────────────────────────────────── */}
        {activeVideo && (
          <View
            testID="video-player-container"
            style={[
              styles.videoContainer,
              { backgroundColor: "#000", borderColor: colors.border },
            ]}
          >
            <Video
              ref={videoRef}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={false}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  setPlayerState((prev) => ({
                    ...prev,
                    isPlaying: status.isPlaying,
                    positionMs: status.positionMillis ?? 0,
                    durationMs: status.durationMillis ?? 0,
                    isBuffering: status.isBuffering,
                  }));
                }
              }}
            />

            {/* Buffering indicator */}
            {playerState.isBuffering && (
              <View style={styles.bufferingOverlay}>
                <Text style={styles.bufferingText}>⏳</Text>
              </View>
            )}

            {/* Video controls overlay */}
            <View style={styles.controlsOverlay}>
              <TouchableOpacity
                testID="btn-seek-back"
                onPress={() => handleSeek("back")}
                style={styles.controlBtn}
              >
                <Ionicons name="play-back" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-play-pause"
                onPress={handleTogglePlayPause}
                style={styles.controlBtnLarge}
              >
                <Ionicons
                  name={playerState.isPlaying ? "pause" : "play"}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-seek-forward"
                onPress={() => handleSeek("forward")}
                style={styles.controlBtn}
              >
                <Ionicons name="play-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Progress bar + time */}
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${progressPercent}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>
                  {formatDuration(playerState.positionMs)}
                </Text>
                <View style={styles.playerActions}>
                  <TouchableOpacity
                    testID="btn-fullscreen"
                    onPress={handleFullscreen}
                    style={styles.playerActionBtn}
                  >
                    <Ionicons name="expand" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.timeText}>
                  {formatDuration(playerState.durationMs)}
                </Text>
              </View>
            </View>

            {/* Now playing info */}
            <View
              style={[
                styles.nowPlayingInfo,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[styles.nowPlayingTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {activeVideo.title}
              </Text>
              <Text
                style={[styles.nowPlayingDesc, { color: colors.textMuted }]}
              >
                {activeVideo.description}
              </Text>
            </View>
          </View>
        )}

        {/* ── Featured Carousel ───────────────────────────────── */}
        <FlatList
          testID="featured-carousel"
          data={FEATURED_ITEMS}
          renderItem={renderFeatured}
          keyExtractor={(i) => i.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.featuredList}
        />

        {/* ── Category Filter ─────────────────────────────────── */}
        <View testID="category-filter" style={styles.categoryRow}>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                testID={`category-${c.key}`}
                onPress={() => setCategory(c.key)}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={styles.categoryIcon}>{c.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: active ? "#fff" : colors.textMuted },
                  ]}
                >
                  {t(c.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Watch Parties ───────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("watch.live")}
        </Text>
        <View testID="parties-list">
          {filteredParties.length === 0 ? (
            <Text
              testID="no-parties"
              style={[styles.emptyText, { color: colors.textMuted }]}
            >
              {t("watch.noParties")}
            </Text>
          ) : (
            filteredParties.map(renderParty)
          )}
        </View>

        {/* ── Upcoming ────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("watch.upcoming")}
        </Text>
        <View testID="upcoming-list">
          {UPCOMING_PARTIES.map(renderUpcoming)}
        </View>

        {/* ── Create CTA ──────────────────────────────────────── */}
        <TouchableOpacity
          testID="btn-create-party"
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.createBtnText}>{t("watch.createParty")}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },

  // Video player
  videoContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
  },
  video: {
    width: "100%",
    height: VIDEO_HEIGHT,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    height: VIDEO_HEIGHT,
  },
  bufferingText: { fontSize: 32 },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: VIDEO_HEIGHT,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlBtnLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#000",
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: { fontSize: 11, color: "#ccc", fontVariant: ["tabular-nums"] },
  playerActions: { flexDirection: "row", gap: 12 },
  playerActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  nowPlayingInfo: {
    padding: 12,
  },
  nowPlayingTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  nowPlayingDesc: { fontSize: 13 },

  // Featured
  featuredList: { marginBottom: 16 },
  featuredCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    borderWidth: 1,
    minHeight: 160,
  },
  featuredTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  featuredBadge: { fontSize: 13, fontWeight: "700" },
  featuredViewers: { fontSize: 13 },
  featuredTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  featuredSub: { fontSize: 14, marginBottom: 16 },
  featuredActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "500" },

  // Categories
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: 13, fontWeight: "500" },

  // Party cards
  partyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  partyHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  partyTitle: { fontSize: 15, fontWeight: "600", flex: 1 },
  partyHost: { fontSize: 13, marginBottom: 8 },
  partyMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partyViewers: { fontSize: 13, fontWeight: "600" },
  partyJoin: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  partyJoinText: { fontSize: 13, fontWeight: "500" },

  // Upcoming
  upcomingCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  upcomingLeft: { alignItems: "center", marginRight: 14, minWidth: 70 },
  upcomingDay: { fontSize: 13, fontWeight: "700" },
  upcomingTime: { fontSize: 12, marginTop: 2 },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { fontSize: 15, fontWeight: "600" },
  upcomingHost: { fontSize: 13, marginTop: 4 },

  // Create CTA
  createBtn: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Empty
  emptyText: { textAlign: "center", padding: 30, fontSize: 14 },
});
