/**
 * Files Preview — DEV-020
 *
 * Aperçu fichier en modal : image, vidéo, audio, PDF, code/text.
 * Affiche les infos du fichier + actions (partager, favoris, supprimer).
 */

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import {
  formatFileSize,
  getFileColor,
  getFileIcon,
  isPreviewable,
} from "@/services/files-api";
import { useFilesStore } from "@/stores/files-store";

export default function FilePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();
  const { showToast } = useToast();

  const currentFile = useFilesStore((s) => s.currentFile);
  const files = useFilesStore((s) => s.files);
  const openFile = useFilesStore((s) => s.openFile);
  const toggleFavorite = useFilesStore((s) => s.toggleFavorite);
  const moveToTrash = useFilesStore((s) => s.moveToTrash);

  const file = currentFile || files.find((f) => f.id === id);

  useEffect(() => {
    if (id && !currentFile) {
      openFile(id);
    }
  }, [id, currentFile, openFile]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xl + 20,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          flex: 1,
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
          marginHorizontal: spacing.sm,
        },
        previewArea: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.lg,
        },
        imagePreview: { width: "100%", height: 300, borderRadius: 12 },
        iconPreview: {
          width: 120,
          height: 120,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.lg,
        },
        previewText: {
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          marginTop: spacing.md,
        },
        textContent: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing.md,
          width: "100%",
          maxHeight: 400,
        },
        codeText: { fontSize: 13, fontFamily: "monospace", color: colors.text },
        infoSection: {
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.lg,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
          marginBottom: spacing.sm,
        },
        infoRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        infoLabel: { fontSize: 13, color: colors.textSecondary },
        infoValue: { fontSize: 13, color: colors.text, fontWeight: "500" },
        actions: {
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        actionBtn: { alignItems: "center", gap: 4 },
        actionText: { fontSize: 11, color: colors.textSecondary },
        tags: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.xs,
          marginTop: spacing.xs,
        },
        tag: {
          backgroundColor: colors.primary + "20",
          borderRadius: 12,
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
        },
        tagText: { fontSize: 11, color: colors.primary },
        versionRow: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: spacing.sm,
        },
        versionNumber: {
          fontSize: 13,
          fontWeight: "600",
          color: colors.primary,
          width: 30,
        },
        versionSummary: { flex: 1, fontSize: 12, color: colors.text },
        versionDate: { fontSize: 11, color: colors.textSecondary },
        loading: { flex: 1, alignItems: "center", justifyContent: "center" },
      }),
    [colors, spacing],
  );

  if (!file) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>
          {t("files.loading")}
        </Text>
      </View>
    );
  }

  const canPreview = isPreviewable(file.category);
  const date = new Date(file.created_at).toLocaleDateString();
  const updated = new Date(file.updated_at).toLocaleDateString();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {file.name}
        </Text>
        <Pressable onPress={() => toggleFavorite(file.id)}>
          <Ionicons
            name={file.is_favorite ? "star" : "star-outline"}
            size={22}
            color={file.is_favorite ? "#FFB300" : colors.textSecondary}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Preview area */}
        <View style={styles.previewArea}>
          {file.category === "image" && file.local_uri ? (
            <Image
              source={{ uri: file.local_uri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          ) : file.category === "code" ||
            file.extension === "md" ||
            file.extension === "txt" ? (
            <ScrollView style={styles.textContent}>
              <Text style={styles.codeText}>
                {file.description || t("files.noPreview")}
              </Text>
            </ScrollView>
          ) : (
            <>
              <View
                style={[
                  styles.iconPreview,
                  { backgroundColor: getFileColor(file.category) + "20" },
                ]}
              >
                <Ionicons
                  name={getFileIcon(file.category) as any}
                  size={56}
                  color={getFileColor(file.category)}
                />
              </View>
              <Text style={styles.previewText}>
                {canPreview
                  ? t("files.previewAvailableSoon")
                  : t("files.noPreview")}
              </Text>
            </>
          )}
        </View>

        {/* File info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t("files.details")}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("files.name")}</Text>
            <Text style={styles.infoValue}>{file.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("files.type")}</Text>
            <Text style={styles.infoValue}>{file.mime_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("files.size")}</Text>
            <Text style={styles.infoValue}>{formatFileSize(file.size)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("files.created")}</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("files.modified")}</Text>
            <Text style={styles.infoValue}>{updated}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("files.version")}</Text>
            <Text style={styles.infoValue}>v{file.version}</Text>
          </View>

          {/* Tags */}
          {file.tags.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>
                {t("files.tags")}
              </Text>
              <View style={styles.tags}>
                {file.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Versions */}
          {file.versions && file.versions.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>
                {t("files.versionHistory")}
              </Text>
              {file.versions.map((ver) => (
                <View key={ver.id} style={styles.versionRow}>
                  <Text style={styles.versionNumber}>
                    v{ver.version_number}
                  </Text>
                  <Text style={styles.versionSummary}>
                    {ver.change_summary}
                  </Text>
                  <Text style={styles.versionDate}>
                    {new Date(ver.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() =>
            router.push({ pathname: "/files/share", params: { id: file.id } })
          }
        >
          <Ionicons name="share-outline" size={22} color={colors.primary} />
          <Text style={styles.actionText}>{t("files.share")}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => showToast(t("files.downloadComingSoon"), "info")}
        >
          <Ionicons name="download-outline" size={22} color={colors.primary} />
          <Text style={styles.actionText}>{t("files.download")}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => router.push("/files/activity")}
        >
          <Ionicons name="time-outline" size={22} color={colors.primary} />
          <Text style={styles.actionText}>{t("files.activity")}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={async () => {
            await moveToTrash(file.id);
            showToast(t("files.movedToTrash"), "success");
            router.back();
          }}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>
            {t("files.delete")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
