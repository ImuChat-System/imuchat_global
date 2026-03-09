/**
 * VideoEditor — Timeline trim + contrôle volume
 *
 * Éditeur basique permettant de découper début/fin d'une vidéo,
 * ajuster le volume vidéo/musique, et prévisualiser en temps réel.
 *
 * Sprint S4 Axe B — Éditeur Basique
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { VideoPickResult } from "@/services/imufeed/video-upload";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TIMELINE_PADDING = 24;
const TIMELINE_WIDTH = SCREEN_WIDTH - TIMELINE_PADDING * 2;
const HANDLE_WIDTH = 16;

// ─── Types ────────────────────────────────────────────────────

export interface TrimRange {
  startMs: number;
  endMs: number;
}

export interface EditorResult {
  uri: string;
  trimRange: TrimRange;
  videoVolume: number;
  musicVolume: number;
}

interface VideoEditorProps {
  video: VideoPickResult;
  onDone: (result: EditorResult) => void;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────

export default function VideoEditor({
  video,
  onDone,
  onCancel,
}: VideoEditorProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const videoRef = useRef<Video>(null);

  const durationMs = video.duration * 1000;

  // Trim state (in ms)
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(durationMs);

  // Volume state (0 → 1)
  const [videoVolume, setVideoVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(0.5);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);

  // ─── Playback ─────────────────────────────────

  const handlePlaybackUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setPositionMs(status.positionMillis);
      setIsPlaying(status.isPlaying);

      // Loop within trim range
      if (status.positionMillis >= trimEnd) {
        videoRef.current?.setPositionAsync(trimStart);
      }
    },
    [trimStart, trimEnd],
  );

  useEffect(() => {
    videoRef.current?.setVolumeAsync(videoVolume);
  }, [videoVolume]);

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playFromPositionAsync(
        Math.max(positionMs, trimStart),
      );
    }
  }, [positionMs, trimStart]);

  // ─── Trim Handles (PanResponder) ─────────────

  const msToX = (ms: number) => (ms / durationMs) * TIMELINE_WIDTH;
  const xToMs = (x: number) => Math.round((x / TIMELINE_WIDTH) * durationMs);

  const leftHandleResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, msToX(trimStart) + gestureState.dx);
        const newMs = xToMs(Math.min(newX, msToX(trimEnd) - HANDLE_WIDTH));
        setTrimStart(Math.max(0, newMs));
      },
    }),
  ).current;

  const rightHandleResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = msToX(trimEnd) + gestureState.dx;
        const newMs = xToMs(Math.max(newX, msToX(trimStart) + HANDLE_WIDTH));
        setTrimEnd(Math.min(durationMs, newMs));
      },
    }),
  ).current;

  // ─── Done ─────────────────────────────────────

  const handleDone = useCallback(() => {
    onDone({
      uri: video.uri,
      trimRange: { startMs: trimStart, endMs: trimEnd },
      videoVolume,
      musicVolume,
    });
  }, [video.uri, trimStart, trimEnd, videoVolume, musicVolume, onDone]);

  // ─── Format time ─────────────────────────────

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const trimDuration = trimEnd - trimStart;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity
          onPress={onCancel}
          accessibilityLabel="Annuler"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Éditer</Text>
        <TouchableOpacity
          onPress={handleDone}
          accessibilityLabel="Confirmer"
          accessibilityRole="button"
        >
          <Text style={[styles.doneText, { color: colors.primary }]}>OK</Text>
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.previewContainer}>
        <Video
          ref={videoRef}
          source={{ uri: video.uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackUpdate}
        />
        <TouchableOpacity
          style={styles.playOverlay}
          onPress={togglePlay}
          activeOpacity={0.8}
          accessibilityLabel={isPlaying ? "Pause" : "Lecture"}
          accessibilityRole="button"
        >
          {!isPlaying && (
            <View style={styles.playButton}>
              <Ionicons name="play" size={36} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Timeline with Trim Handles */}
      <View
        style={[
          styles.timelineSection,
          { paddingHorizontal: TIMELINE_PADDING },
        ]}
      >
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Découpe ({formatTime(trimDuration)})
        </Text>

        <View style={styles.timeline}>
          {/* Track background */}
          <View style={[styles.track, { backgroundColor: colors.border }]} />

          {/* Active region */}
          <View
            style={[
              styles.activeRegion,
              {
                left: msToX(trimStart),
                width: msToX(trimEnd) - msToX(trimStart),
                backgroundColor: `${colors.primary}40`,
                borderColor: colors.primary,
              },
            ]}
          />

          {/* Playhead */}
          <View
            style={[
              styles.playhead,
              {
                left: msToX(Math.max(trimStart, Math.min(positionMs, trimEnd))),
                backgroundColor: "#fff",
              },
            ]}
          />

          {/* Left handle */}
          <View
            style={[
              styles.handle,
              styles.handleLeft,
              { left: msToX(trimStart) - HANDLE_WIDTH },
            ]}
            {...leftHandleResponder.panHandlers}
          >
            <View
              style={[styles.handleBar, { backgroundColor: colors.primary }]}
            />
          </View>

          {/* Right handle */}
          <View
            style={[
              styles.handle,
              styles.handleRight,
              { left: msToX(trimEnd) },
            ]}
            {...rightHandleResponder.panHandlers}
          >
            <View
              style={[styles.handleBar, { backgroundColor: colors.primary }]}
            />
          </View>
        </View>

        <View style={styles.timeLabels}>
          <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
            {formatTime(trimStart)}
          </Text>
          <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
            {formatTime(trimEnd)}
          </Text>
        </View>
      </View>

      {/* Volume Controls */}
      <View style={[styles.volumeSection, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Volume
        </Text>

        {/* Video Volume */}
        <VolumeSlider
          icon="videocam"
          label="Vidéo"
          value={videoVolume}
          onChange={setVideoVolume}
          colors={colors}
        />

        {/* Music Volume */}
        <VolumeSlider
          icon="musical-notes"
          label="Musique"
          value={musicVolume}
          onChange={setMusicVolume}
          colors={colors}
        />
      </View>
    </View>
  );
}

// ─── Volume Slider ────────────────────────────────────────────

interface VolumeSliderProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  onChange: (v: number) => void;
  colors: ReturnType<typeof useColors>;
}

function VolumeSlider({
  icon,
  label,
  value,
  onChange,
  colors,
}: VolumeSliderProps) {
  const steps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.volumeRow}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <Text style={[styles.volumeLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.volumeSteps}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step}
            onPress={() => onChange(step)}
            style={[
              styles.volumeStep,
              {
                backgroundColor: value >= step ? colors.primary : colors.border,
                height: 8 + step * 16,
              },
            ]}
            accessibilityLabel={`Volume ${label} ${Math.round(step * 100)}%`}
            accessibilityRole="button"
          />
        ))}
      </View>
      <Text style={[styles.volumePercent, { color: colors.textSecondary }]}>
        {Math.round(value * 100)}%
      </Text>
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
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  doneText: {
    fontSize: 17,
    fontWeight: "700",
  },
  previewContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineSection: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeline: {
    height: 44,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
    width: "100%",
  },
  activeRegion: {
    position: "absolute",
    height: 44,
    borderWidth: 2,
    borderRadius: 4,
    top: 0,
  },
  playhead: {
    position: "absolute",
    width: 2,
    height: 44,
    borderRadius: 1,
    top: 0,
  },
  handle: {
    position: "absolute",
    width: HANDLE_WIDTH,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    top: 0,
  },
  handleLeft: {},
  handleRight: {},
  handleBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  timeLabel: {
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  volumeSection: {
    marginTop: 24,
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: "500",
    width: 64,
  },
  volumeSteps: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    flex: 1,
  },
  volumeStep: {
    flex: 1,
    borderRadius: 2,
    minHeight: 8,
  },
  volumePercent: {
    fontSize: 12,
    width: 36,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});
