import { useI18n } from "@/providers/I18nProvider";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MediaPreviewProps {
  uri: string;
  type: "image" | "video" | "voice" | "file";
  thumbnailSize?: number;
  onPress?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  style?: object;
}

interface MediaViewerProps {
  uri: string;
  type: "image" | "video";
  visible: boolean;
  onClose: () => void;
}

interface UploadProgressProps {
  progress: number;
  onCancel?: () => void;
}

/**
 * Media thumbnail preview
 */
export function MediaPreview({
  uri,
  type,
  thumbnailSize = 120,
  onPress,
  onRemove,
  showRemove = false,
  style,
}: MediaPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useI18n();

  const renderContent = () => {
    if (type === "image") {
      return (
        <Image
          source={{ uri }}
          style={[
            styles.thumbnail,
            { width: thumbnailSize, height: thumbnailSize },
          ]}
          resizeMode="cover"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      );
    }

    if (type === "video") {
      return (
        <View
          style={[
            styles.thumbnail,
            { width: thumbnailSize, height: thumbnailSize },
          ]}
        >
          <Video
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isMuted
          />
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={40} color="white" />
          </View>
        </View>
      );
    }

    if (type === "voice") {
      return (
        <View
          style={[styles.voicePreview, { width: thumbnailSize, height: 50 }]}
        >
          <Ionicons name="mic" size={24} color="#8b5cf6" />
          <Text style={styles.voiceText}>{t("components.voiceMessage")}</Text>
        </View>
      );
    }

    // File type
    return (
      <View
        style={[
          styles.filePreview,
          { width: thumbnailSize, height: thumbnailSize },
        ]}
      >
        <Ionicons name="document" size={40} color="#6b7280" />
        <Text style={styles.fileText} numberOfLines={1}>
          {t("components.file")}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.previewContainer, style]}
      activeOpacity={0.8}
    >
      {renderContent()}

      {loading && type === "image" && (
        <View
          style={[
            styles.loadingOverlay,
            { width: thumbnailSize, height: thumbnailSize },
          ]}
        >
          <ActivityIndicator color="white" />
        </View>
      )}

      {error && (
        <View
          style={[
            styles.errorOverlay,
            { width: thumbnailSize, height: thumbnailSize },
          ]}
        >
          <Ionicons name="image-outline" size={30} color="#9ca3af" />
          <Text style={styles.errorText}>{t("common.error")}</Text>
        </View>
      )}

      {showRemove && onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color="#ef4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

/**
 * Full-screen media viewer
 */
export function MediaViewer({ uri, type, visible, onClose }: MediaViewerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.viewerContainer}>
        <Pressable style={styles.viewerBackground} onPress={onClose} />

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        {type === "image" ? (
          <Image
            source={{ uri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        ) : (
          <Video
            source={{ uri }}
            style={styles.fullVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            useNativeControls
            isLooping
          />
        )}
      </View>
    </Modal>
  );
}

/**
 * Upload progress indicator
 */
export function UploadProgress({ progress, onCancel }: UploadProgressProps) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      {onCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Media attachment button
 */
export function MediaAttachButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.attachButton}>
      <Ionicons name="attach" size={24} color="#8b5cf6" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    position: "relative",
  },
  thumbnail: {
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  errorText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  voicePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  voiceText: {
    color: "#6b7280",
    fontSize: 14,
  },
  filePreview: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  fileText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  fullVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    width: 35,
  },
  cancelButton: {
    padding: 4,
  },
  attachButton: {
    padding: 8,
  },
});
