/**
 * Composants UI pour l'enregistrement vocal
 */

import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { VoiceUploadResult } from "@/services/voice-recording";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VoiceRecorderProps {
  onRecordingComplete: (result: VoiceUploadResult) => void;
  onCancel?: () => void;
  compact?: boolean;
}

/**
 * Bouton d'enregistrement vocal avec visualisation
 */
export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  compact = false,
}: VoiceRecorderProps) {
  const colors = useColors();
  const { t } = useI18n();
  const {
    status,
    formattedDuration,
    metering,
    uploadProgress,
    error,
    hasPermission,
    start,
    stop,
    cancel,
    upload,
    requestPermission,
  } = useVoiceRecording();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation during recording
  useEffect(() => {
    if (status === "recording") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  // Update wave animation based on metering
  useEffect(() => {
    if (metering !== null) {
      // Convert dB to 0-1 scale (-60dB to 0dB)
      const normalizedLevel = Math.max(0, Math.min(1, (metering + 60) / 60));
      Animated.timing(waveAnim, {
        toValue: normalizedLevel,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [metering, waveAnim]);

  const handlePress = async () => {
    if (status === "idle" || status === "stopped") {
      if (hasPermission === false) {
        const granted = await requestPermission();
        if (!granted) return;
      }
      await start();
    } else if (status === "recording") {
      const recording = await stop();
      if (recording) {
        const result = await upload(recording);
        if (result) {
          onRecordingComplete(result);
        }
      }
    }
  };

  const handleCancel = async () => {
    await cancel();
    onCancel?.();
  };

  const isRecording = status === "recording";
  const isUploading = status === "uploading";
  const isPreparing = status === "preparing";

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactButton,
          { backgroundColor: isRecording ? colors.error : colors.primary },
        ]}
        onPress={handlePress}
        onLongPress={isRecording ? handleCancel : undefined}
        disabled={isPreparing || isUploading}
      >
        {isUploading ? (
          <Text style={styles.compactText}>{uploadProgress}%</Text>
        ) : (
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={20}
            color="#fff"
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View
            style={[styles.recordingDot, { backgroundColor: colors.error }]}
          />
          <Text style={[styles.durationText, { color: colors.text }]}>
            {formattedDuration}
          </Text>

          {/* Audio wave visualization */}
          <View style={styles.waveContainer}>
            {[...Array(5)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    backgroundColor: colors.primary,
                    transform: [
                      {
                        scaleY: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Upload progress */}
      {isUploading && (
        <View style={styles.uploadIndicator}>
          <Text style={[styles.uploadText, { color: colors.text }]}>
            {t("components.uploading", { progress: uploadProgress })}
          </Text>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${uploadProgress}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Error message */}
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {isRecording && (
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.error }]}
            onPress={handleCancel}
          >
            <Ionicons name="close" size={24} color={colors.error} />
          </TouchableOpacity>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              {
                backgroundColor: isRecording ? colors.error : colors.primary,
              },
            ]}
            onPress={handlePress}
            disabled={isPreparing || isUploading}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </Animated.View>

        {isRecording && (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.success }]}
            onPress={handlePress}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Hint */}
      {status === "idle" && (
        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          {t("components.holdToRecord")}
        </Text>
      )}
    </View>
  );
}

/**
 * Composant pour afficher un message vocal dans le chat
 */
interface VoiceMessageProps {
  url: string;
  duration?: number;
  isOwn: boolean;
}

export function VoiceMessage({ url, duration, isOwn }: VoiceMessageProps) {
  const colors = useColors();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackProgress, setPlaybackProgress] = React.useState(0);
  const soundRef = useRef<any>(null);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = async () => {
    try {
      const { Audio } = await import("expo-av");

      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              const progress =
                status.positionMillis / (status.durationMillis || 1);
              setPlaybackProgress(progress);

              if (status.didJustFinish) {
                setIsPlaying(false);
                setPlaybackProgress(0);
              }
            }
          },
        );
        soundRef.current = sound;
      } else {
        await soundRef.current.playAsync();
      }

      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View
      style={[
        styles.voiceMessage,
        {
          backgroundColor: isOwn ? colors.primary : colors.backgroundSecondary,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: isOwn ? "rgba(255,255,255,0.2)" : colors.primary },
        ]}
        onPress={handlePlayPause}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.voiceWaveform}>
        {/* Waveform placeholder */}
        <View
          style={[styles.waveformProgress, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.waveformFill,
              {
                backgroundColor: isOwn ? "#fff" : colors.primary,
                width: `${playbackProgress * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <Text
        style={[
          styles.voiceDuration,
          { color: isOwn ? "#fff" : colors.textMuted },
        ]}
      >
        {duration ? formatTime(duration) : "0:00"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  durationText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    gap: 3,
  },
  waveBar: {
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  uploadIndicator: {
    alignItems: "center",
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  compactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  compactText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  hintText: {
    fontSize: 12,
    marginTop: 12,
  },
  voiceMessage: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    minWidth: 180,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceWaveform: {
    flex: 1,
    marginHorizontal: 12,
  },
  waveformProgress: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  waveformFill: {
    height: "100%",
  },
  voiceDuration: {
    fontSize: 12,
  },
});
