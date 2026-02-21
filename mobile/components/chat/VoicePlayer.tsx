/**
 * VoicePlayer Component - Mobile (React Native)
 * Lecteur audio avec progress bar, vitesse et waveform
 * Style kawaii avec couleurs violet/rose
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface VoicePlayerProps {
  /** URL de l'audio (Supabase Storage) */
  audioUrl: string;
  /** Durée totale en secondes */
  duration: number;
  /** Données de waveform optionnelles (amplitudes 0-1) */
  waveformData?: number[];
  /** Est-ce l'audio de l'utilisateur courant */
  isOwn?: boolean;
  /** Couleur principale */
  primaryColor?: string;
  /** Transcription optionnelle */
  transcription?: string;
}

type PlaybackSpeed = 1 | 1.5 | 2;

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [1, 1.5, 2];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Générer des données de waveform simulées si non fournies
function generateDefaultWaveform(count: number = 40): number[] {
  return Array.from({ length: count }, () => 0.2 + Math.random() * 0.8);
}

export function VoicePlayer({
  audioUrl,
  duration,
  waveformData,
  isOwn = false,
  primaryColor = "#8B5CF6",
  transcription,
}: VoicePlayerProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [error, setError] = useState<string | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const waveform = waveformData || generateDefaultWaveform();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Update progress animation
  useEffect(() => {
    const progress = duration > 0 ? currentPosition / duration : 0;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentPosition, duration, progressAnim]);

  const loadSound = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, rate: playbackSpeed },
        onPlaybackStatusUpdate,
      );

      soundRef.current = sound;
      setIsLoading(false);
      return sound;
    } catch (err) {
      console.error("Error loading sound:", err);
      setError(t("components.cannotLoadAudio"));
      setIsLoading(false);
      return null;
    }
  }, [audioUrl, playbackSpeed]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError(t("components.playbackError"));
      }
      return;
    }

    setCurrentPosition(status.positionMillis / 1000);
    setIsPlaying(status.isPlaying);

    // Audio finished
    if (status.didJustFinish) {
      setIsPlaying(false);
      setCurrentPosition(0);
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    try {
      let sound = soundRef.current;

      // Load sound if not loaded
      if (!sound) {
        sound = await loadSound();
        if (!sound) return;
      }

      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          // Reset if finished
          if (status.positionMillis >= status.durationMillis!) {
            await sound.setPositionAsync(0);
          }
          await sound.playAsync();
        }
      }
    } catch (err) {
      console.error("Error toggling playback:", err);
      setError(t("components.playbackError"));
    }
  }, [loadSound]);

  const seekTo = useCallback(
    async (position: number) => {
      try {
        let sound = soundRef.current;

        if (!sound) {
          sound = await loadSound();
          if (!sound) return;
        }

        const positionMs =
          Math.max(0, Math.min(position * duration, duration)) * 1000;
        await sound.setPositionAsync(positionMs);
      } catch (err) {
        console.error("Error seeking:", err);
      }
    },
    [duration, loadSound],
  );

  const cyclePlaybackSpeed = useCallback(async () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];

    setPlaybackSpeed(newSpeed);

    if (soundRef.current) {
      try {
        await soundRef.current.setRateAsync(newSpeed, true);
      } catch (err) {
        console.error("Error setting playback rate:", err);
      }
    }
  }, [playbackSpeed]);

  // Pan responder for seek
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        const progress = locationX / 200; // Approximate width
        seekTo(progress);
      },
      onPanResponderMove: (evt) => {
        const { locationX } = evt.nativeEvent;
        const progress = Math.max(0, Math.min(1, locationX / 200));
        seekTo(progress);
      },
    }),
  ).current;

  const backgroundColor = isOwn ? `${primaryColor}20` : colors.surface;

  const accentColor = isOwn ? primaryColor : "#8B5CF6";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Play/Pause Button */}
      <Pressable
        onPress={togglePlayback}
        style={[styles.playButton, { backgroundColor: accentColor }]}
        disabled={isLoading}
      >
        {isLoading ? (
          <Animated.View style={styles.loadingSpinner}>
            <Ionicons name="sync" size={24} color="white" />
          </Animated.View>
        ) : (
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="white"
            style={isPlaying ? undefined : { marginLeft: 3 }}
          />
        )}
      </Pressable>

      {/* Waveform and Progress */}
      <View style={styles.waveformContainer} {...panResponder.panHandlers}>
        <View style={styles.waveformWrapper}>
          {waveform.map((amplitude, index) => {
            const progress = duration > 0 ? currentPosition / duration : 0;
            const barProgress = index / waveform.length;
            const isPlayed = barProgress <= progress;

            return (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: 4 + amplitude * 20,
                    backgroundColor: isPlayed
                      ? accentColor
                      : `${accentColor}40`,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Progress indicator line */}
        <Animated.View
          style={[
            styles.progressIndicator,
            {
              backgroundColor: accentColor,
              left: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Time and Speed */}
      <View style={styles.controlsContainer}>
        <Text style={[styles.timeText, { color: colors.text }]}>
          {formatTime(currentPosition)} / {formatTime(duration)}
        </Text>

        <Pressable
          onPress={cyclePlaybackSpeed}
          style={[styles.speedButton, { borderColor: accentColor }]}
        >
          <Text style={[styles.speedText, { color: accentColor }]}>
            {playbackSpeed}x
          </Text>
        </Pressable>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Transcription toggle */}
      {transcription && (
        <Pressable
          onPress={() => setShowTranscription(!showTranscription)}
          style={styles.transcriptionToggle}
        >
          <Ionicons
            name={showTranscription ? "chevron-up" : "document-text"}
            size={16}
            color={colors.textMuted}
          />
          <Text
            style={[
              styles.transcriptionToggleText,
              { color: colors.textMuted },
            ]}
          >
            {showTranscription
              ? t("components.hide")
              : t("components.transcription")}
          </Text>
        </Pressable>
      )}

      {/* Transcription content */}
      {showTranscription && transcription && (
        <View
          style={[
            styles.transcriptionContainer,
            { borderColor: colors.border },
          ]}
        >
          <Text style={[styles.transcriptionText, { color: colors.text }]}>
            {transcription}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    minWidth: 240,
    maxWidth: 300,
  },
  playButton: {
    position: "absolute",
    left: 12,
    top: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingSpinner: {
    // Animation handled by parent
  },
  waveformContainer: {
    marginLeft: 56,
    height: 32,
    position: "relative",
    justifyContent: "center",
  },
  waveformWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: "100%",
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  progressIndicator: {
    position: "absolute",
    width: 2,
    height: "100%",
    borderRadius: 1,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginLeft: 56,
  },
  timeText: {
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  speedText: {
    fontSize: 12,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
  },
  transcriptionToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
  },
  transcriptionToggleText: {
    fontSize: 12,
  },
  transcriptionContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  transcriptionText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default VoicePlayer;
