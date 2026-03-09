/**
 * CameraCapture — Interface de capture vidéo
 *
 * Écran de pré-capture avec choix de durée (15s/30s/60s/3min),
 * boutons caméra / import galerie, preview.
 *
 * Utilise expo-image-picker (pas expo-camera) pour la capture.
 *
 * Sprint S3 Axe B — Upload Vidéo
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  ALLOWED_DURATIONS,
  captureVideo,
  pickVideoFromGallery,
  type VideoDuration,
  type VideoPickResult,
} from "@/services/imufeed/video-upload";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────

interface CameraCaptureProps {
  /** Callback appelé avec la vidéo capturée/importée */
  onVideoReady: (video: VideoPickResult) => void;
  /** Callback pour annuler */
  onCancel: () => void;
}

// ─── Duration Labels ──────────────────────────────────────────

const DURATION_LABELS: Record<VideoDuration, string> = {
  15: "15s",
  30: "30s",
  60: "1m",
  180: "3m",
};

// ─── Component ────────────────────────────────────────────────

export default function CameraCapture({
  onVideoReady,
  onCancel,
}: CameraCaptureProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const [selectedDuration, setSelectedDuration] = useState<VideoDuration>(60);
  const [isCapturing, setIsCapturing] = useState(false);

  // ─── Capture caméra ──────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const result = await captureVideo(selectedDuration);
      if (result) {
        onVideoReady(result);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [selectedDuration, onVideoReady, isCapturing]);

  // ─── Import galerie ──────────────────────────────────
  const handleGalleryImport = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const result = await pickVideoFromGallery();
      if (result) {
        onVideoReady(result);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [onVideoReady, isCapturing]);

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {/* ── Top Bar ──────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          testID="btn-cancel-capture"
          onPress={onCancel}
          style={styles.topBtn}
          accessibilityLabel={t("common.cancel")}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>{t("imufeed.create") || "Créer"}</Text>

        <View style={styles.topBtn} />
      </View>

      {/* ── Camera viewfinder placeholder ────────────── */}
      <View style={styles.viewfinder}>
        <Ionicons name="videocam" size={64} color="rgba(255,255,255,0.3)" />
        <Text style={styles.viewfinderText}>
          {t("imufeed.tapToRecord") || "Appuyez pour enregistrer"}
        </Text>
      </View>

      {/* ── Duration Selector ────────────────────────── */}
      <View style={styles.durationRow}>
        {ALLOWED_DURATIONS.map((dur) => (
          <TouchableOpacity
            key={dur}
            testID={`duration-${dur}`}
            onPress={() => setSelectedDuration(dur)}
            style={[
              styles.durationChip,
              {
                backgroundColor:
                  selectedDuration === dur
                    ? colors.primary
                    : "rgba(255,255,255,0.15)",
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedDuration === dur }}
          >
            <Text
              style={[
                styles.durationText,
                {
                  color:
                    selectedDuration === dur ? "#fff" : "rgba(255,255,255,0.7)",
                  fontWeight: selectedDuration === dur ? "700" : "500",
                },
              ]}
            >
              {DURATION_LABELS[dur]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Bottom Controls ──────────────────────────── */}
      <View style={styles.bottomBar}>
        {/* Gallery import */}
        <TouchableOpacity
          testID="btn-gallery"
          onPress={handleGalleryImport}
          style={styles.sideBtn}
          disabled={isCapturing}
          accessibilityLabel={t("imufeed.gallery") || "Galerie"}
        >
          <Ionicons name="images-outline" size={28} color="#fff" />
          <Text style={styles.sideBtnLabel}>
            {t("imufeed.gallery") || "Galerie"}
          </Text>
        </TouchableOpacity>

        {/* Main capture button */}
        <TouchableOpacity
          testID="btn-record"
          onPress={handleCapture}
          style={[
            styles.captureBtn,
            { borderColor: colors.primary },
            isCapturing && styles.captureBtnActive,
          ]}
          disabled={isCapturing}
          activeOpacity={0.7}
          accessibilityLabel={t("imufeed.record") || "Enregistrer"}
        >
          <View
            style={[
              styles.captureBtnInner,
              {
                backgroundColor: isCapturing ? "#ef4444" : colors.primary,
                borderRadius: isCapturing ? 8 : 30,
              },
            ]}
          />
        </TouchableOpacity>

        {/* Flip camera placeholder */}
        <TouchableOpacity
          testID="btn-flip"
          style={styles.sideBtn}
          accessibilityLabel={t("imufeed.flip") || "Retourner"}
        >
          <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
          <Text style={styles.sideBtnLabel}>
            {t("imufeed.flip") || "Retourner"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  topBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  viewfinder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    margin: 16,
    borderRadius: 16,
  },
  viewfinderText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginTop: 12,
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  sideBtn: {
    alignItems: "center",
    gap: 4,
  },
  sideBtnLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnActive: {
    borderColor: "#ef4444",
  },
  captureBtnInner: {
    width: 56,
    height: 56,
  },
});
