/**
 * PublishSettings — Paramètres de publication vidéo
 *
 * Titre, description, hashtags, visibilité, commentaires on/off.
 * Reçoit la vidéo capturée et envoie vers le pipeline d'upload.
 *
 * Sprint S3 Axe B — Upload Vidéo
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  extractHashtags,
  formatHashtag,
  type PublishParams,
  type VideoPickResult,
} from "@/services/imufeed/video-upload";
import type { VideoCategory, VideoVisibility } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────

interface PublishSettingsProps {
  /** Vidéo à publier */
  video: VideoPickResult;
  /** Callback quand l'utilisateur confirme la publication */
  onPublish: (params: PublishParams) => void;
  /** Retour arrière */
  onBack: () => void;
  /** Ouvrir l'éditeur vidéo */
  onEdit?: () => void;
  /** Publication en cours */
  isPublishing?: boolean;
}

// ─── Config ───────────────────────────────────────────────────

const CATEGORIES: { value: VideoCategory; labelKey: string; icon: string }[] = [
  { value: "entertainment", labelKey: "imufeed.cat.entertainment", icon: "🎭" },
  { value: "education", labelKey: "imufeed.cat.education", icon: "📚" },
  { value: "music", labelKey: "imufeed.cat.music", icon: "🎵" },
  { value: "gaming", labelKey: "imufeed.cat.gaming", icon: "🎮" },
  { value: "comedy", labelKey: "imufeed.cat.comedy", icon: "😂" },
  { value: "sports", labelKey: "imufeed.cat.sports", icon: "⚽" },
  { value: "cooking", labelKey: "imufeed.cat.cooking", icon: "🍳" },
  { value: "fashion", labelKey: "imufeed.cat.fashion", icon: "👗" },
  { value: "tech", labelKey: "imufeed.cat.tech", icon: "💻" },
  { value: "art", labelKey: "imufeed.cat.art", icon: "🎨" },
  { value: "anime", labelKey: "imufeed.cat.anime", icon: "🎌" },
  { value: "travel", labelKey: "imufeed.cat.travel", icon: "✈️" },
  { value: "pets", labelKey: "imufeed.cat.pets", icon: "🐾" },
  { value: "other", labelKey: "imufeed.cat.other", icon: "📦" },
];

const VISIBILITY_OPTIONS: {
  value: VideoVisibility;
  labelKey: string;
  icon: string;
}[] = [
  {
    value: "public",
    labelKey: "imufeed.visibility.public",
    icon: "globe-outline",
  },
  {
    value: "followers",
    labelKey: "imufeed.visibility.followers",
    icon: "people-outline",
  },
  {
    value: "private",
    labelKey: "imufeed.visibility.private",
    icon: "lock-closed-outline",
  },
];

const MAX_CAPTION_LENGTH = 300;

// ─── Component ────────────────────────────────────────────────

export default function PublishSettings({
  video,
  onPublish,
  onBack,
  onEdit,
  isPublishing = false,
}: PublishSettingsProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<VideoCategory>("entertainment");
  const [visibility, setVisibility] = useState<VideoVisibility>("public");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);

  // Auto-extract hashtags from caption
  const hashtags = useMemo(() => extractHashtags(caption), [caption]);

  const canPublish = caption.trim().length > 0 && !isPublishing;

  const handlePublish = useCallback(() => {
    if (!canPublish) return;
    onPublish({
      caption: caption.trim(),
      category,
      visibility,
      hashtags,
      allow_comments: allowComments,
      allow_duet: allowDuet,
    });
  }, [
    canPublish,
    caption,
    category,
    visibility,
    hashtags,
    allowComments,
    allowDuet,
    onPublish,
  ]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Header ──────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          testID="btn-back"
          onPress={onBack}
          style={styles.headerBtn}
          disabled={isPublishing}
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("imufeed.publishSettings") || "Paramètres"}
        </Text>

        <TouchableOpacity
          testID="btn-publish"
          onPress={handlePublish}
          disabled={!canPublish}
          style={[
            styles.publishBtn,
            {
              backgroundColor: canPublish ? colors.primary : colors.border,
            },
          ]}
          accessibilityLabel={t("imufeed.publish") || "Publier"}
        >
          <Text style={styles.publishBtnText}>
            {isPublishing
              ? t("common.loading") || "..."
              : t("imufeed.publish") || "Publier"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Video Preview Summary ──────────────────── */}
        <View
          style={[styles.videoSummary, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.videoThumb, { backgroundColor: colors.border }]}>
            <Ionicons name="play-circle" size={32} color={colors.primary} />
          </View>
          <View style={styles.videoMeta}>
            <Text style={[styles.videoMetaText, { color: colors.text }]}>
              {formatDuration(video.duration)}
            </Text>
            <Text style={[styles.videoMetaText, { color: colors.textMuted }]}>
              {video.width}×{video.height}
            </Text>
            {video.fileSize > 0 && (
              <Text style={[styles.videoMetaText, { color: colors.textMuted }]}>
                {Math.round(video.fileSize / 1024 / 1024)} MB
              </Text>
            )}
          </View>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={[styles.editBtn, { borderColor: colors.border }]}
              accessibilityLabel={t("imufeed.edit") || "Éditer"}
              accessibilityRole="button"
            >
              <Ionicons name="cut-outline" size={18} color={colors.primary} />
              <Text style={[styles.editBtnText, { color: colors.primary }]}>
                {t("imufeed.edit") || "Éditer"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Caption ────────────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("imufeed.caption") || "Description"}
          </Text>
          <TextInput
            testID="input-caption"
            style={[
              styles.captionInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={caption}
            onChangeText={(text) =>
              setCaption(text.slice(0, MAX_CAPTION_LENGTH))
            }
            placeholder={
              t("imufeed.captionPlaceholder") ||
              "Décrivez votre vidéo... #hashtags"
            }
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={MAX_CAPTION_LENGTH}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {caption.length}/{MAX_CAPTION_LENGTH}
          </Text>

          {/* Hashtags preview */}
          {hashtags.length > 0 && (
            <View style={styles.hashtagsRow}>
              {hashtags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.hashtagChip,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Text style={[styles.hashtagText, { color: colors.primary }]}>
                    {formatHashtag(tag)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Category ───────────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("imufeed.category") || "Catégorie"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                testID={`cat-${cat.value}`}
                onPress={() => setCategory(cat.value)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      category === cat.value ? colors.primary : colors.surface,
                    borderColor:
                      category === cat.value ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: category === cat.value ? "#fff" : colors.text,
                    },
                  ]}
                >
                  {t(cat.labelKey) || cat.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Visibility ─────────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("imufeed.visibility") || "Visibilité"}
          </Text>
          <View style={styles.visibilityRow}>
            {VISIBILITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                testID={`visibility-${opt.value}`}
                onPress={() => setVisibility(opt.value)}
                style={[
                  styles.visibilityChip,
                  {
                    backgroundColor:
                      visibility === opt.value
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      visibility === opt.value ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={visibility === opt.value ? "#fff" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    { color: visibility === opt.value ? "#fff" : colors.text },
                  ]}
                >
                  {t(opt.labelKey) || opt.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Toggles ────────────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <View
            style={[styles.toggleRow, { borderBottomColor: colors.border }]}
          >
            <View style={styles.toggleInfo}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={colors.text}
              />
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                {t("imufeed.allowComments") || "Commentaires"}
              </Text>
            </View>
            <Switch
              testID="switch-comments"
              value={allowComments}
              onValueChange={setAllowComments}
              trackColor={{ false: colors.border, true: colors.primary + "60" }}
              thumbColor={allowComments ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons
                name="git-compare-outline"
                size={20}
                color={colors.text}
              />
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                {t("imufeed.allowDuet") || "Duo / Réponse"}
              </Text>
            </View>
            <Switch
              testID="switch-duet"
              value={allowDuet}
              onValueChange={setAllowDuet}
              trackColor={{ false: colors.border, true: colors.primary + "60" }}
              thumbColor={allowDuet ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  publishBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  videoSummary: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  videoThumb: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  videoMeta: {
    gap: 4,
  },
  videoMetaText: {
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  captionInput: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  hashtagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  hashtagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoriesRow: {
    marginBottom: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  visibilityRow: {
    flexDirection: "row",
    gap: 8,
  },
  visibilityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  visibilityText: {
    fontSize: 13,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toggleLabel: {
    fontSize: 15,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
