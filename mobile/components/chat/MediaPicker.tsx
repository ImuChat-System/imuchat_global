/**
 * MediaPicker Component - Mobile
 * Bouton pour sélectionner des médias (images/vidéos) depuis la galerie ou caméra
 * Support sélection multiple (max 5 images)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import {
  requestCameraPermissions,
  requestMediaPermissions,
} from "@/services/media-upload";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { SlideInUp, SlideOutDown } from "react-native-reanimated";

const PRIMARY_COLOR = "#8B5CF6";
const MAX_IMAGES = 5;

export interface MediaFile {
  id: string;
  uri: string;
  type: "image" | "video";
  width: number;
  height: number;
  size: number;
  mimeType: string;
  fileName: string;
  uploadProgress?: number;
  status: "pending" | "uploading" | "uploaded" | "error";
}

export interface MediaPickerProps {
  /** Callback quand des médias sont sélectionnés */
  onMediaSelected: (media: MediaFile[]) => void;
  /** Max nombre d'images */
  maxImages?: number;
  /** Autoriser les vidéos */
  allowVideo?: boolean;
  /** Afficher seulement l'icône */
  iconOnly?: boolean;
  /** Couleur principale */
  primaryColor?: string;
  /** Désactivé */
  disabled?: boolean;
}

/**
 * Compresse une image pour réduire la taille
 */
async function compressImage(
  uri: string,
): Promise<{ uri: string; width: number; height: number }> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  return { uri: result.uri, width: result.width, height: result.height };
}

/**
 * Génère un ID unique
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * MediaPicker - Composant pour sélectionner des médias
 */
export function MediaPicker({
  onMediaSelected,
  maxImages = MAX_IMAGES,
  allowVideo = true,
  iconOnly = false,
  primaryColor = PRIMARY_COLOR,
  disabled = false,
}: MediaPickerProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = useCallback(() => {
    if (!disabled) {
      setIsModalVisible(true);
    }
  }, [disabled]);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  /**
   * Sélectionne des images depuis la galerie (multiple)
   */
  const handleSelectImages = useCallback(async () => {
    closeModal();
    setIsLoading(true);

    try {
      const hasPermission = await requestMediaPermissions();
      if (!hasPermission) {
        showToast(t("components.allowGalleryAccess"), "warning");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: allowVideo
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const mediaFiles: MediaFile[] = [];

      for (const asset of result.assets.slice(0, maxImages)) {
        const isVideo = asset.type === "video";
        let processedUri = asset.uri;
        let width = asset.width;
        let height = asset.height;

        // Compresser les images
        if (!isVideo) {
          const compressed = await compressImage(asset.uri);
          processedUri = compressed.uri;
          width = compressed.width;
          height = compressed.height;
        }

        mediaFiles.push({
          id: generateId(),
          uri: processedUri,
          type: isVideo ? "video" : "image",
          width,
          height,
          size: asset.fileSize || 0,
          mimeType: asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
          fileName: asset.fileName || `media_${Date.now()}`,
          status: "pending",
        });
      }

      onMediaSelected(mediaFiles);
    } catch (error) {
      console.error("Error selecting images:", error);
      showToast(t("components.cannotSelectImages"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [allowVideo, maxImages, onMediaSelected, closeModal]);

  /**
   * Prend une photo avec la caméra
   */
  const handleTakePhoto = useCallback(async () => {
    closeModal();
    setIsLoading(true);

    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        showToast(t("components.allowCameraAccess"), "warning");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const compressed = await compressImage(asset.uri);

      const mediaFile: MediaFile = {
        id: generateId(),
        uri: compressed.uri,
        type: "image",
        width: compressed.width,
        height: compressed.height,
        size: asset.fileSize || 0,
        mimeType: asset.mimeType || "image/jpeg",
        fileName: `photo_${Date.now()}.jpg`,
        status: "pending",
      };

      onMediaSelected([mediaFile]);
    } catch (error) {
      console.error("Error taking photo:", error);
      showToast(t("components.cannotTakePhoto"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [onMediaSelected, closeModal]);

  /**
   * Enregistre une vidéo avec la caméra
   */
  const handleRecordVideo = useCallback(async () => {
    closeModal();
    setIsLoading(true);

    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        showToast(t("components.allowCameraAccess"), "warning");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 60,
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];

      const mediaFile: MediaFile = {
        id: generateId(),
        uri: asset.uri,
        type: "video",
        width: asset.width,
        height: asset.height,
        size: asset.fileSize || 0,
        mimeType: asset.mimeType || "video/mp4",
        fileName: `video_${Date.now()}.mp4`,
        status: "pending",
      };

      onMediaSelected([mediaFile]);
    } catch (error) {
      console.error("Error recording video:", error);
      showToast(t("components.cannotRecordVideo"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [onMediaSelected, closeModal]);

  return (
    <>
      {/* Bouton principal */}
      <TouchableOpacity
        onPress={openModal}
        disabled={disabled || isLoading}
        style={[
          styles.button,
          iconOnly && styles.buttonIconOnly,
          disabled && styles.buttonDisabled,
          { backgroundColor: iconOnly ? "transparent" : `${primaryColor}15` },
        ]}
        accessibilityLabel={t("components.addMedia")}
        accessibilityRole="button"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : (
          <>
            <Ionicons
              name="image-outline"
              size={iconOnly ? 24 : 20}
              color={disabled ? colors.secondary : primaryColor}
            />
            {!iconOnly && (
              <Text style={[styles.buttonText, { color: primaryColor }]}>
                {t("components.media")}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Modal de sélection */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            entering={SlideInUp.springify().damping(20)}
            exiting={SlideOutDown}
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("components.addMedia")}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {/* Galerie */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { backgroundColor: `${primaryColor}15` },
                ]}
                onPress={handleSelectImages}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: primaryColor }]}
                >
                  <Ionicons name="images" size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {t("components.gallery")}
                </Text>
                <Text style={[styles.optionHint, { color: colors.secondary }]}>
                  {t("components.maxImages", { count: maxImages })}
                </Text>
              </TouchableOpacity>

              {/* Prendre photo */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { backgroundColor: `${primaryColor}15` },
                ]}
                onPress={handleTakePhoto}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: "#F472B6" }]}
                >
                  <Ionicons name="camera" size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {t("components.photo")}
                </Text>
                <Text style={[styles.optionHint, { color: colors.secondary }]}>
                  {t("components.cameraDevice")}
                </Text>
              </TouchableOpacity>

              {/* Enregistrer vidéo */}
              {allowVideo && (
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { backgroundColor: `${primaryColor}15` },
                  ]}
                  onPress={handleRecordVideo}
                >
                  <View
                    style={[styles.optionIcon, { backgroundColor: "#A78BFA" }]}
                  >
                    <Ionicons name="videocam" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t("components.video")}
                  </Text>
                  <Text
                    style={[styles.optionHint, { color: colors.secondary }]}
                  >
                    {t("components.maxDuration")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  buttonIconOnly: {
    padding: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionHint: {
    fontSize: 11,
    textAlign: "center",
  },
});
