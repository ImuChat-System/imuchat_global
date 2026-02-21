/**
 * VoiceRecorder Component - Mobile (React Native)
 * Enregistrement vocal avec hold-to-record et animation waveform
 * Style kawaii avec couleurs violet/rose
 */

import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

const MAX_DURATION_MS = 2 * 60 * 1000; // 2 minutes
const CANCEL_SWIPE_THRESHOLD = -80;

export interface VoiceRecorderProps {
  /** Callback quand l'enregistrement est terminé */
  onRecordingComplete: (recording: {
    uri: string;
    duration: number;
    mimeType: string;
  }) => void;
  /** Callback quand l'enregistrement est annulé */
  onCancel?: () => void;
  /** Couleur principale */
  primaryColor?: string;
}

interface WaveformBarProps {
  index: number;
  level: number;
  isRecording: boolean;
  primaryColor: string;
}

function WaveformBar({
  index,
  level,
  isRecording,
  primaryColor,
}: WaveformBarProps) {
  const animatedHeight = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    if (isRecording) {
      // Calculer la hauteur basée sur le niveau audio et un peu de randomisation
      const baseHeight = 4;
      const maxHeight = 24;
      // Normaliser metering de -160..0 dB vers 0..1
      const normalizedLevel = Math.max(0, Math.min(1, (level + 60) / 60));
      const targetHeight =
        baseHeight + normalizedLevel * (maxHeight - baseHeight);

      // Ajouter un délai basé sur l'index pour créer un effet de vague
      Animated.timing(animatedHeight, {
        toValue: targetHeight,
        duration: 100,
        delay: index * 20,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 4,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [level, isRecording, index, animatedHeight]);

  return (
    <Animated.View
      style={[
        styles.waveformBar,
        {
          height: animatedHeight,
          backgroundColor: primaryColor,
        },
      ]}
    />
  );
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  primaryColor = "#8B5CF6",
}: VoiceRecorderProps) {
  const colors = useColors();
  const { t } = useI18n();
  const {
    status,
    duration,
    formattedDuration,
    metering,
    hasPermission,
    start,
    stop,
    cancel,
    requestPermission,
  } = useVoiceRecording();

  const isRecording = status === "recording";
  const isPreparing = status === "preparing";

  // Animation states
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const cancelOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation pour le bouton record
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
  }, [isRecording, pulseAnim]);

  // Auto-stop à 2 minutes
  useEffect(() => {
    if (duration >= MAX_DURATION_MS && isRecording) {
      handleRecordingStop();
    }
  }, [duration, isRecording]);

  const handleRecordingStart = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    // Vibration feedback
    if (Platform.OS === "ios") {
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(50);
    }

    // Animation de scale
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();

    await start();
  }, [hasPermission, requestPermission, start, scaleAnim]);

  const handleRecordingStop = useCallback(async () => {
    // Animation de scale
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const recording = await stop();
    if (recording) {
      onRecordingComplete(recording);
    }
  }, [stop, onRecordingComplete, scaleAnim, slideX]);

  const handleCancel = useCallback(async () => {
    Vibration.vibrate(100);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(slideX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    await cancel();
    onCancel?.();
  }, [cancel, onCancel, scaleAnim, slideX]);

  // Pan responder pour swipe-to-cancel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        handleRecordingStart();
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        if (dx < 0) {
          slideX.setValue(dx);
          // Afficher le texte "cancel" quand on swipe
          const opacity = Math.min(
            1,
            Math.abs(dx) / Math.abs(CANCEL_SWIPE_THRESHOLD),
          );
          cancelOpacity.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;

        if (dx < CANCEL_SWIPE_THRESHOLD) {
          handleCancel();
        } else {
          handleRecordingStop();
        }

        cancelOpacity.setValue(0);
      },
    }),
  ).current;

  // Générer les barres de waveform
  const waveformBars = Array.from({ length: 20 }, (_, i) => (
    <WaveformBar
      key={i}
      index={i}
      level={metering ?? -60}
      isRecording={isRecording}
      primaryColor={primaryColor}
    />
  ));

  // Temps restant
  const remainingMs = MAX_DURATION_MS - duration;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const showWarning = remainingSeconds <= 10 && isRecording;

  if (!hasPermission && hasPermission !== null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="mic-off" size={24} color={colors.textMuted} />
          <Text style={[styles.permissionText, { color: colors.textMuted }]}>
            {t("components.micPermissionRequired")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Cancel indicator */}
      <Animated.View
        style={[
          styles.cancelContainer,
          {
            opacity: cancelOpacity,
          },
        ]}
      >
        <Ionicons name="close-circle" size={24} color="#EF4444" />
        <Text style={styles.cancelText}>{t("components.releaseToCancel")}</Text>
      </Animated.View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.recordingContainer,
          {
            transform: [{ translateX: slideX }],
          },
        ]}
      >
        {isRecording || isPreparing ? (
          <>
            {/* Waveform */}
            <View style={styles.waveformContainer}>{waveformBars}</View>

            {/* Duration */}
            <View style={styles.durationContainer}>
              <View
                style={[styles.recordingDot, { backgroundColor: "#EF4444" }]}
              />
              <Text
                style={[
                  styles.durationText,
                  { color: showWarning ? "#EF4444" : colors.text },
                ]}
              >
                {formattedDuration}
              </Text>
              {showWarning && (
                <Text style={styles.warningText}>
                  {t("components.remainingSeconds", {
                    count: remainingSeconds,
                  })}
                </Text>
              )}
            </View>

            {/* Swipe hint */}
            <View style={styles.swipeHint}>
              <Ionicons
                name="chevron-back"
                size={16}
                color={colors.textMuted}
              />
              <Text style={[styles.swipeHintText, { color: colors.textMuted }]}>
                {t("components.slideToCancel")}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.instructionText, { color: colors.textMuted }]}>
            {t("components.holdToRecord")}
          </Text>
        )}

        {/* Record button */}
        <Animated.View
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording ? "#EF4444" : primaryColor,
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={28}
            color="white"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    minHeight: 64,
  },
  permissionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  permissionText: {
    fontSize: 14,
  },
  cancelContainer: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
    height: 32,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 16,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  warningText: {
    fontSize: 12,
    color: "#EF4444",
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  swipeHintText: {
    fontSize: 12,
  },
  instructionText: {
    fontSize: 14,
    flex: 1,
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default VoiceRecorder;
