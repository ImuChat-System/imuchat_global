/**
 * MediaPreview Component - Mobile
 * Affiche preview des médias avant envoi avec progress bar
 */

import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useCallback, useRef } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

import { MediaFile } from "./MediaPicker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_SIZE = 80;
const PRIMARY_COLOR = "#8B5CF6";

export interface MediaPreviewProps {
  /** Liste des médias à afficher */
  media: MediaFile[];
  /** Callback pour supprimer un média */
  onRemove: (mediaId: string) => void;
  /** Callback pour retry upload */
  onRetry?: (mediaId: string) => void;
  /** Taille des thumbnails */
  previewSize?: number;
  /** Afficher les boutons d'action */
  showActions?: boolean;
  /** Couleur principale */
  primaryColor?: string;
}

/**
 * Progress bar circulaire
 */
function CircularProgress({
  progress,
  size = 32,
  strokeWidth = 3,
  color = PRIMARY_COLOR,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.progressContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.progressBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: `${color}30`,
          },
        ]}
      />
      <View
        style={[
          styles.progressForeground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            transform: [{ rotate: `${(progress / 100) * 360}deg` }],
          },
        ]}
      />
      <Text style={[styles.progressText, { fontSize: size * 0.3, color }]}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
}

/**
 * Item de preview individuel
 */
function PreviewItem({
  media,
  onRemove,
  onRetry,
  size = PREVIEW_SIZE,
  primaryColor = PRIMARY_COLOR,
}: {
  media: MediaFile;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  size?: number;
  primaryColor?: string;
}) {
  const colors = useColors();
  const videoRef = useRef<Video>(null);

  const handleRemove = useCallback(() => {
    onRemove(media.id);
  }, [onRemove, media.id]);

  const handleRetry = useCallback(() => {
    onRetry?.(media.id);
  }, [onRetry, media.id]);

  const isUploading = media.status === "uploading";
  const isError = media.status === "error";
  const isUploaded = media.status === "uploaded";

  return (
    <Animated.View
      entering={SlideInRight.springify().damping(20)}
      exiting={SlideOutRight}
      layout={LinearTransition}
      style={[styles.previewItem, { width: size, height: size }]}
    >
      {/* Thumbnail */}
      {media.type === "image" ? (
        <Image
          source={{ uri: media.uri }}
          style={[styles.thumbnail, { width: size, height: size }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, { width: size, height: size }]}>
          <Video
            ref={videoRef}
            source={{ uri: media.uri }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            isMuted
            shouldPlay={false}
          />
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={28} color="#FFFFFF" />
          </View>
        </View>
      )}

      {/* Overlay état */}
      {(isUploading || isError) && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.statusOverlay}
        >
          {isUploading && (
            <CircularProgress
              progress={media.uploadProgress || 0}
              size={40}
              color={primaryColor}
            />
          )}
          {isError && (
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Badge uploaded */}
      {isUploaded && (
        <Animated.View entering={FadeIn} style={styles.uploadedBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        </Animated.View>
      )}

      {/* Bouton supprimer */}
      <TouchableOpacity
        onPress={handleRemove}
        style={[styles.removeButton, { backgroundColor: colors.background }]}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        accessibilityLabel="Supprimer"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={14} color={colors.text} />
      </TouchableOpacity>

      {/* Indicateur type vidéo */}
      {media.type === "video" && (
        <View style={styles.videoBadge}>
          <Ionicons name="videocam" size={10} color="#FFFFFF" />
        </View>
      )}
    </Animated.View>
  );
}

/**
 * MediaPreview - Affiche preview des médias avant envoi
 */
export function MediaPreview({
  media,
  onRemove,
  onRetry,
  previewSize = PREVIEW_SIZE,
  showActions = true,
  primaryColor = PRIMARY_COLOR,
}: MediaPreviewProps) {
  const colors = useColors();

  if (!media.length) return null;

  const uploadingCount = media.filter((m) => m.status === "uploading").length;
  const errorCount = media.filter((m) => m.status === "error").length;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.container, { backgroundColor: `${colors.background}E6` }]}
    >
      {/* Header avec compteur */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.secondary }]}>
          {media.length} média{media.length > 1 ? "s" : ""}
          {uploadingCount > 0 && ` • ${uploadingCount} en cours`}
          {errorCount > 0 &&
            ` • ${errorCount} erreur${errorCount > 1 ? "s" : ""}`}
        </Text>
      </View>

      {/* Liste des previews */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.previewList}
      >
        {media.map((item) => (
          <PreviewItem
            key={item.id}
            media={item}
            onRemove={onRemove}
            onRetry={onRetry}
            size={previewSize}
            primaryColor={primaryColor}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  previewList: {
    paddingHorizontal: 8,
    gap: 8,
  },
  previewItem: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    borderRadius: 12,
    backgroundColor: "#1F2937",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  progressBackground: {
    position: "absolute",
  },
  progressForeground: {
    position: "absolute",
  },
  progressText: {
    fontWeight: "700",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  retryButton: {
    alignItems: "center",
    gap: 4,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  uploadedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 2,
  },
  videoBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 6,
    padding: 4,
  },
});

export type { MediaPreviewProps };
