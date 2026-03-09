/**
 * app/imufeed/create.tsx — Écran de création vidéo ImuFeed
 *
 * Orchestre le flow : Capture/Import → Paramètres → Upload
 *
 * Sprint S3 Axe B — Upload Vidéo
 */

import CameraCapture from "@/components/imufeed/CameraCapture";
import PublishSettings from "@/components/imufeed/PublishSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import {
  uploadAndPublish,
  validateVideo,
  type PublishParams,
  type VideoPickResult,
} from "@/services/imufeed/video-upload";
import { useImuFeedStore } from "@/stores/imufeed-store";
import type { UploadProgress } from "@/types/imufeed";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Flow Steps ───────────────────────────────────────────────
type CreateStep = "capture" | "settings" | "uploading";

export default function CreateVideoScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const clearUploadProgress = useImuFeedStore((s) => s.clearUploadProgress);

  const [step, setStep] = useState<CreateStep>("capture");
  const [video, setVideo] = useState<VideoPickResult | null>(null);
  const [uploadProgress, setLocalProgress] = useState<UploadProgress | null>(
    null,
  );

  // ─── Open Editor ─────────────────────────────────
  const handleOpenEditor = useCallback(() => {
    if (!video) return;
    router.push({
      pathname: "/imufeed/editor" as any,
      params: {
        uri: video.uri,
        width: String(video.width),
        height: String(video.height),
        duration: String(video.duration),
        fileSize: String(video.fileSize),
        mimeType: video.mimeType,
      },
    });
  }, [video, router]);

  // ─── Step 1: Video captured ──────────────────────
  const handleVideoReady = useCallback(
    async (result: VideoPickResult) => {
      // Validate before proceeding
      const validation = await validateVideo(result);
      if (!validation.valid) {
        Alert.alert(
          t("imufeed.error") || "Erreur",
          validation.error || t("imufeed.invalidVideo"),
        );
        return;
      }
      setVideo(result);
      setStep("settings");
    },
    [t],
  );

  // ─── Step 2: Publish ─────────────────────────────
  const handlePublish = useCallback(
    async (params: PublishParams) => {
      if (!video) return;

      setStep("uploading");

      try {
        await uploadAndPublish(video, params, (progress) => {
          setLocalProgress(progress);
        });

        // Success
        setLocalProgress(null);
        clearUploadProgress();

        Alert.alert(
          t("imufeed.published") || "Publié !",
          t("imufeed.publishedDesc") || "Votre vidéo est en ligne.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
      } catch (error) {
        setStep("settings");
        const message =
          error instanceof Error ? error.message : t("imufeed.uploadError");
        Alert.alert(t("imufeed.error") || "Erreur", message);
      }
    },
    [video, router, t, clearUploadProgress],
  );

  // ─── Cancel ──────────────────────────────────────
  const handleCancel = useCallback(() => {
    if (step === "uploading") return; // Can't cancel during upload
    if (video) {
      Alert.alert(
        t("imufeed.discardTitle") || "Abandonner ?",
        t("imufeed.discardDesc") || "Votre vidéo sera perdue.",
        [
          { text: t("common.cancel") || "Annuler", style: "cancel" },
          {
            text: t("common.discard") || "Abandonner",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  }, [step, video, t, router]);

  // ─── Back to capture ─────────────────────────────
  const handleBackToCapture = useCallback(() => {
    setVideo(null);
    setStep("capture");
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  // Upload in progress
  if (step === "uploading") {
    return (
      <View
        style={[
          styles.uploadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.uploadingTitle, { color: colors.text }]}>
          {t("imufeed.uploading") || "Upload en cours..."}
        </Text>

        {/* Progress bar */}
        {uploadProgress && (
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBg, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.max(5, uploadProgress.percent)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {uploadProgress.percent}% — {uploadProgress.stage}
            </Text>
          </View>
        )}

        <TouchableOpacity
          testID="btn-cancel-upload"
          style={[styles.cancelUploadBtn, { borderColor: colors.border }]}
          onPress={() => {
            setStep("settings");
          }}
        >
          <Text style={[styles.cancelUploadText, { color: colors.textMuted }]}>
            {t("common.cancel") || "Annuler"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Publish settings
  if (step === "settings" && video) {
    return (
      <PublishSettings
        video={video}
        onPublish={handlePublish}
        onBack={handleBackToCapture}
        onEdit={handleOpenEditor}
      />
    );
  }

  // Camera capture (default)
  return (
    <CameraCapture onVideoReady={handleVideoReady} onCancel={handleCancel} />
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  uploadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  uploadingTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 32,
  },
  progressContainer: {
    width: "100%",
    maxWidth: 300,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  cancelUploadBtn: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelUploadText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
