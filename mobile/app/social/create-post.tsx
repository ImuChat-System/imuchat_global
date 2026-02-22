/**
 * Create Post Screen
 *
 * DEV-012: Création de posts pour le feed social
 * - Texte libre
 * - Ajout de médias (images)
 * - Type de post (post, news, announcement)
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { createPost, CreatePostParams } from "@/services/social-feed";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 4;

export default function CreatePostScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Character count
  const charCount = content.length;
  const isOverLimit = charCount > MAX_CONTENT_LENGTH;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  // Pick image from library
  const handlePickImage = useCallback(async () => {
    if (mediaUrls.length >= MAX_IMAGES) {
      Alert.alert(
        t("social.createPost.error"),
        t("social.createPost.maxImages", { max: MAX_IMAGES }),
      );
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t("social.createPost.permissionRequired"),
        t("social.createPost.galleryPermission"),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUrls((prev) => [...prev, result.assets[0].uri]);
    }
  }, [mediaUrls.length, t]);

  // Remove image
  const handleRemoveImage = useCallback((index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Submit post
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const params: CreatePostParams = {
        content: content.trim(),
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        type: "post",
      };

      const post = await createPost(params);
      if (post) {
        router.back();
      } else {
        Alert.alert(
          t("social.createPost.error"),
          t("social.createPost.failed"),
        );
      }
    } catch (error) {
      Alert.alert(t("social.createPost.error"), t("social.createPost.failed"));
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, content, mediaUrls, router, t]);

  // Cancel
  const handleCancel = useCallback(() => {
    if (content.trim() || mediaUrls.length > 0) {
      Alert.alert(
        t("social.createPost.discardTitle"),
        t("social.createPost.discardMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("social.createPost.discard"),
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  }, [content, mediaUrls.length, router, t]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <TouchableOpacity
            testID="btn-cancel"
            onPress={handleCancel}
            style={styles.headerBtn}
          >
            <Text style={[styles.headerBtnText, { color: colors.textMuted }]}>
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("social.createPost.title")}
          </Text>

          <TouchableOpacity
            testID="btn-submit"
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[
              styles.submitBtn,
              {
                backgroundColor: canSubmit
                  ? colors.primary
                  : colors.primary + "40",
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {t("social.createPost.publish")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Author preview */}
          <View style={[styles.authorRow, { padding: spacing.md }]}>
            {user?.user_metadata?.avatar_url ? (
              <Image
                source={{ uri: user.user_metadata.avatar_url }}
                style={styles.authorAvatar}
              />
            ) : (
              <View
                style={[
                  styles.authorAvatarPlaceholder,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text style={[styles.authorInitial, { color: colors.primary }]}>
                  {(
                    user?.user_metadata?.display_name ||
                    user?.user_metadata?.username ||
                    user?.email ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.authorName, { color: colors.text }]}>
              {user?.user_metadata?.display_name ||
                user?.user_metadata?.username ||
                user?.email?.split("@")[0] ||
                t("social.anonymous")}
            </Text>
          </View>

          {/* Content input */}
          <TextInput
            testID="input-content"
            style={[
              styles.contentInput,
              {
                color: colors.text,
                padding: spacing.md,
              },
            ]}
            placeholder={t("social.createPost.placeholder")}
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            maxLength={MAX_CONTENT_LENGTH + 100} // Allow some overflow for UX
          />

          {/* Character count */}
          <View
            style={[styles.charCountRow, { paddingHorizontal: spacing.md }]}
          >
            <Text
              style={[
                styles.charCount,
                { color: isOverLimit ? colors.error : colors.textMuted },
              ]}
            >
              {charCount}/{MAX_CONTENT_LENGTH}
            </Text>
          </View>

          {/* Media preview */}
          {mediaUrls.length > 0 && (
            <View style={[styles.mediaContainer, { padding: spacing.md }]}>
              {mediaUrls.map((uri, index) => (
                <View key={uri} style={styles.mediaItem}>
                  <Image source={{ uri }} style={styles.mediaImage} />
                  <TouchableOpacity
                    testID={`remove-image-${index}`}
                    style={[
                      styles.removeMediaBtn,
                      { backgroundColor: colors.error },
                    ]}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeMediaText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom toolbar */}
        <View
          style={[
            styles.toolbar,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <TouchableOpacity
            testID="btn-add-image"
            style={[
              styles.toolBtn,
              { opacity: mediaUrls.length >= MAX_IMAGES ? 0.5 : 1 },
            ]}
            onPress={handlePickImage}
            disabled={mediaUrls.length >= MAX_IMAGES}
          >
            <Text style={styles.toolIcon}>🖼️</Text>
            <Text style={[styles.toolLabel, { color: colors.textMuted }]}>
              {t("social.createPost.addImage")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 8,
  },
  headerBtnText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Content
  scrollContent: { flex: 1 },

  // Author
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: "600",
  },
  authorName: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
  },

  // Input
  contentInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 150,
    textAlignVertical: "top",
  },

  // Char count
  charCountRow: {
    alignItems: "flex-end",
  },
  charCount: {
    fontSize: 12,
  },

  // Media
  mediaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mediaItem: {
    position: "relative",
  },
  mediaImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeMediaBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeMediaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  toolIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  toolLabel: {
    fontSize: 14,
  },
});
