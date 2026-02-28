/**
 * MusicScreen — Lecteur natif avec expo-av
 *
 * Sections :
 * - Barre de lecture rapide (MiniPlayer en bas)
 * - Playlists
 * - Pistes récemment jouées
 * - Pistes likées
 *
 * Phase M4 — Module Music natif
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useMusicStore } from "@/stores/music-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Playlist, Track } from "@/types/music";

// ─── Component ────────────────────────────────────────────────
export default function MusicScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);

  const {
    playlists,
    likedTracks,
    recentlyPlayed,
    currentTrack,
    isPlaying,
    positionMs,
    durationMs,
    isBuffering,
    repeatMode,
    shuffle,
    loadLibrary,
    play,
    togglePlayPause,
    next,
    previous,
    seekTo,
    setRepeat,
    toggleShuffle,
    toggleLike,
    formatDuration,
  } = useMusicStore();

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLibrary();
    setRefreshing(false);
  }, [loadLibrary]);

  const handlePlayTrack = useCallback(
    async (track: Track, trackList?: Track[]) => {
      await play(track, trackList);
    },
    [play],
  );

  const progressPercent = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  // ─── Track row ────────────────────────────────────────────
  const renderTrackRow = (track: Track, trackList: Track[]) => {
    const isActive = currentTrack?.id === track.id;
    const liked = likedTracks.some((t) => t.id === track.id);

    return (
      <TouchableOpacity
        key={track.id}
        testID={`track-${track.id}`}
        style={[styles.trackRow, { borderBottomColor: colors.border }]}
        onPress={() => handlePlayTrack(track, trackList)}
      >
        <View
          style={[styles.trackArt, { backgroundColor: colors.primary + "15" }]}
        >
          <Text style={styles.trackArtEmoji}>
            {isActive && isPlaying ? "🔊" : "🎵"}
          </Text>
        </View>
        <View style={styles.trackInfo}>
          <Text
            style={[
              styles.trackTitle,
              { color: isActive ? colors.primary : colors.text },
            ]}
            numberOfLines={1}
          >
            {track.title}
          </Text>
          <Text
            style={[styles.trackArtist, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {track.artist} · {track.album}
          </Text>
        </View>
        <Text style={[styles.trackDuration, { color: colors.textMuted }]}>
          {formatDuration(track.duration_ms)}
        </Text>
        <TouchableOpacity
          testID={`like-${track.id}`}
          onPress={() => toggleLike(track.id)}
          style={styles.likeBtn}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#ef4444" : colors.textMuted}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // ─── Playlist card (horizontal) ───────────────────────────
  const renderPlaylistCard = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      testID={`playlist-${item.id}`}
      style={[
        styles.playlistCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() =>
        item.tracks.length > 0 && handlePlayTrack(item.tracks[0], item.tracks)
      }
    >
      <View
        style={[styles.playlistArt, { backgroundColor: colors.primary + "20" }]}
      >
        <Text style={styles.playlistArtEmoji}>🎶</Text>
      </View>
      <Text
        style={[styles.playlistName, { color: colors.text }]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Text style={[styles.playlistMeta, { color: colors.textMuted }]}>
        {item.track_count} {t("music.tracks")}
      </Text>
    </TouchableOpacity>
  );

  // ─── Now Playing / MiniPlayer ─────────────────────────────
  const renderNowPlaying = () => {
    if (!currentTrack) return null;

    return (
      <View
        testID="now-playing"
        style={[
          styles.nowPlaying,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${progressPercent}%` as unknown as number,
              },
            ]}
          />
        </View>

        <View style={styles.nowPlayingContent}>
          <View
            style={[
              styles.nowPlayingArt,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={styles.nowPlayingArtEmoji}>
              {isBuffering ? "⏳" : isPlaying ? "🔊" : "🎵"}
            </Text>
          </View>
          <View style={styles.nowPlayingInfo}>
            <Text
              style={[styles.nowPlayingTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {currentTrack.title}
            </Text>
            <Text
              style={[styles.nowPlayingArtist, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {currentTrack.artist}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              testID="btn-shuffle"
              onPress={toggleShuffle}
              style={styles.controlBtn}
            >
              <Ionicons
                name="shuffle"
                size={20}
                color={shuffle ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-prev"
              onPress={previous}
              style={styles.controlBtn}
            >
              <Ionicons name="play-skip-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-play-pause"
              onPress={togglePlayPause}
              style={[styles.playBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-next"
              onPress={next}
              style={styles.controlBtn}
            >
              <Ionicons
                name="play-skip-forward"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-repeat"
              onPress={() => {
                const modes: Array<"off" | "all" | "one"> = [
                  "off",
                  "all",
                  "one",
                ];
                const idx = modes.indexOf(repeatMode);
                setRepeat(modes[(idx + 1) % modes.length]);
              }}
              style={styles.controlBtn}
            >
              <Ionicons
                name={repeatMode === "one" ? "repeat" : "repeat"}
                size={20}
                color={repeatMode !== "off" ? colors.primary : colors.textMuted}
              />
              {repeatMode === "one" && (
                <Text
                  style={[styles.repeatOneLabel, { color: colors.primary }]}
                >
                  1
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Time labels */}
        <View style={styles.timeRow}>
          <Text style={[styles.timeLabel, { color: colors.textMuted }]}>
            {formatDuration(positionMs)}
          </Text>
          <Text style={[styles.timeLabel, { color: colors.textMuted }]}>
            {formatDuration(durationMs)}
          </Text>
        </View>
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        testID="music-screen"
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
            {t("music.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t("music.subtitle")}
          </Text>

          {/* ── Playlists ─────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("music.playlists")}
          </Text>
          <FlatList
            testID="playlists-row"
            data={playlists}
            renderItem={renderPlaylistCard}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.playlistList}
          />

          {/* ── Recently Played ───────────────────────────── */}
          {recentlyPlayed.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("music.recentlyPlayed")}
              </Text>
              {recentlyPlayed
                .slice(0, 5)
                .map((track) => renderTrackRow(track, recentlyPlayed))}
            </>
          )}

          {/* ── Liked ─────────────────────────────────────── */}
          {likedTracks.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("music.liked")}
              </Text>
              {likedTracks.map((track) => renderTrackRow(track, likedTracks))}
            </>
          )}

          {/* ── All Tracks (from playlists) ───────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("music.allTracks")}
          </Text>
          {playlists
            .flatMap((p) => p.tracks)
            .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
            .map((track) =>
              renderTrackRow(
                track,
                playlists
                  .flatMap((p) => p.tracks)
                  .filter(
                    (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i,
                  ),
              ),
            )}

          {/* Bottom spacer for now playing */}
          <View style={{ height: currentTrack ? 200 : 40 }} />
        </View>
      </ScrollView>

      {/* ── Now Playing (floating bottom) ─────────────────── */}
      {renderNowPlaying()}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
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

  // Track row
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trackArt: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  trackArtEmoji: { fontSize: 20 },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: { fontSize: 15, fontWeight: "600" },
  trackArtist: { fontSize: 13, marginTop: 2 },
  trackDuration: { fontSize: 12, marginRight: 8 },
  likeBtn: { padding: 6 },

  // Playlist card
  playlistList: { marginBottom: 8 },
  playlistCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginRight: 10,
    alignItems: "center",
  },
  playlistArt: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  playlistArtEmoji: { fontSize: 28 },
  playlistName: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  playlistMeta: { fontSize: 12, marginTop: 2 },

  // Now Playing
  nowPlaying: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: 34, // safe area
  },
  progressBar: {
    height: 3,
    width: "100%",
  },
  progressFill: {
    height: 3,
  },
  nowPlayingContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  nowPlayingArt: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  nowPlayingArtEmoji: { fontSize: 22 },
  nowPlayingInfo: { flex: 1, marginLeft: 12 },
  nowPlayingTitle: { fontSize: 15, fontWeight: "600" },
  nowPlayingArtist: { fontSize: 13, marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center", gap: 4 },
  controlBtn: { padding: 8, position: "relative" },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  repeatOneLabel: {
    position: "absolute",
    top: 4,
    right: 4,
    fontSize: 9,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  timeLabel: { fontSize: 11 },
});
