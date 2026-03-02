/**
 * Files Trash — DEV-020
 *
 * Corbeille : fichiers et dossiers supprimés.
 * Restaurer, supprimer définitivement, vider la corbeille.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Alert,
  FlatList,
  Pressable,
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
} from "@/services/files-api";
import { useFilesStore } from "@/stores/files-store";

export default function FilesTrashScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();
  const { showToast } = useToast();

  const files = useFilesStore((s) => s.files);
  const restoreFromTrash = useFilesStore((s) => s.restoreFromTrash);
  const deleteFilePermanently = useFilesStore((s) => s.deleteFilePermanently);
  const emptyTrash = useFilesStore((s) => s.emptyTrash);
  const loadFiles = useFilesStore((s) => s.loadFiles);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const trashedFiles = useMemo(
    () => files.filter((f) => f.is_trashed),
    [files],
  );

  const handleRestore = useCallback(
    async (fileId: string) => {
      await restoreFromTrash(fileId);
      showToast(t("files.restored"), "success");
    },
    [restoreFromTrash, showToast, t],
  );

  const handleDeletePermanently = useCallback(
    (fileId: string) => {
      Alert.alert(
        t("files.deletePermanentlyTitle"),
        t("files.deletePermanentlyMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: async () => {
              await deleteFilePermanently(fileId);
              showToast(t("files.deletedPermanently"), "success");
            },
          },
        ],
      );
    },
    [deleteFilePermanently, showToast, t],
  );

  const handleEmptyTrash = useCallback(() => {
    if (trashedFiles.length === 0) return;
    Alert.alert(t("files.emptyTrashTitle"), t("files.emptyTrashMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("files.emptyTrash"),
        style: "destructive",
        onPress: async () => {
          await emptyTrash();
          showToast(t("files.trashEmptied"), "success");
        },
      },
    ]);
  }, [trashedFiles.length, emptyTrash, showToast, t]);

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
        headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
        emptyTrashBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          padding: spacing.xs,
        },
        emptyTrashText: {
          fontSize: 13,
          fontWeight: "600",
          color: colors.error,
        },
        info: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          margin: spacing.md,
          padding: spacing.sm,
          borderRadius: 10,
          gap: spacing.sm,
        },
        infoText: { flex: 1, fontSize: 12, color: colors.textSecondary },
        item: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: spacing.sm,
          marginHorizontal: spacing.md,
          marginBottom: spacing.xs,
          gap: spacing.sm,
        },
        itemIcon: {
          width: 40,
          height: 40,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        },
        itemInfo: { flex: 1 },
        itemName: { fontSize: 14, fontWeight: "500", color: colors.text },
        itemMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
        itemActions: { flexDirection: "row", gap: spacing.sm },
        actionBtn: { padding: spacing.xs },
        empty: { alignItems: "center", paddingTop: 80 },
        emptyText: {
          fontSize: 15,
          color: colors.textSecondary,
          marginTop: spacing.md,
        },
      }),
    [colors, spacing],
  );

  const renderItem = ({ item }: { item: (typeof trashedFiles)[0] }) => {
    const trashedDate = item.trashed_at
      ? new Date(item.trashed_at).toLocaleDateString()
      : "";
    return (
      <View style={styles.item}>
        <View
          style={[
            styles.itemIcon,
            { backgroundColor: getFileColor(item.category) + "20" },
          ]}
        >
          <Ionicons
            name={getFileIcon(item.category) as any}
            size={22}
            color={getFileColor(item.category)}
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemMeta}>
            {formatFileSize(item.size)} · {t("files.trashedOn")} {trashedDate}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => handleRestore(item.id)}
          >
            <Ionicons
              name="arrow-undo-outline"
              size={20}
              color={colors.primary}
            />
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => handleDeletePermanently(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("files.trash")}</Text>
        {trashedFiles.length > 0 ? (
          <Pressable style={styles.emptyTrashBtn} onPress={handleEmptyTrash}>
            <Ionicons name="trash" size={16} color={colors.error} />
            <Text style={styles.emptyTrashText}>{t("files.emptyTrash")}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {/* Info bar */}
      <View style={styles.info}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={styles.infoText}>{t("files.trashInfo")}</Text>
      </View>

      {/* List */}
      {trashedFiles.length > 0 ? (
        <FlatList
          data={trashedFiles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons
            name="checkmark-circle-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>{t("files.trashEmpty")}</Text>
        </View>
      )}
    </View>
  );
}
