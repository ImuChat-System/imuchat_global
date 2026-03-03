/**
 * My Files — Personal file browser (DEV-037)
 *
 * Folder/file list with breadcrumb nav, search, sort, grid/list view toggle.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFileManagerStore } from "@/stores/file-manager-store";
import type { FSItem, SortBy } from "@/types/file-manager";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function MyFilesScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();
  const { t } = useI18n();

  const currentFolderId = useFileManagerStore((s) => s.currentFolderId);
  const breadcrumbs = useFileManagerStore((s) => s.breadcrumbs);
  const files = useFileManagerStore((s) => s.files);
  const folders = useFileManagerStore((s) => s.folders);
  const loading = useFileManagerStore((s) => s.loading);
  const sortBy = useFileManagerStore((s) => s.sortBy);
  const sortOrder = useFileManagerStore((s) => s.sortOrder);
  const viewMode = useFileManagerStore((s) => s.viewMode);
  const searchQuery = useFileManagerStore((s) => s.searchQuery);

  const fetchFiles = useFileManagerStore((s) => s.fetchFiles);
  const setCurrentFolder = useFileManagerStore((s) => s.setCurrentFolder);
  const setSortBy = useFileManagerStore((s) => s.setSortBy);
  const setSearchQuery = useFileManagerStore((s) => s.setSearchQuery);
  const setViewMode = useFileManagerStore((s) => s.setViewMode);
  const createFolder = useFileManagerStore((s) => s.createFolder);
  const deleteItem = useFileManagerStore((s) => s.deleteItem);
  const toggleFavorite = useFileManagerStore((s) => s.toggleFavorite);

  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchFiles(currentFolderId);
  }, [currentFolderId, fetchFiles]);

  const items: FSItem[] = [
    ...folders.map((f) => ({ kind: "folder" as const, ...f })),
    ...files.map((f) => ({ kind: "file" as const, ...f })),
  ];

  const filtered = searchQuery
    ? items.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : items;

  const handleFolderOpen = useCallback(
    (folderId: string) => {
      setCurrentFolder(folderId);
    },
    [setCurrentFolder],
  );

  const handleGoBack = useCallback(() => {
    if (breadcrumbs.length > 1) {
      const parent = breadcrumbs[breadcrumbs.length - 2];
      setCurrentFolder(parent.id);
    } else {
      setCurrentFolder(null);
    }
  }, [breadcrumbs, setCurrentFolder]);

  const sortOptions: { key: SortBy; label: string }[] = [
    { key: "name", label: t("fileManager.sortName") },
    { key: "date", label: t("fileManager.sortDate") },
    { key: "size", label: t("fileManager.sortSize") },
    { key: "type", label: t("fileManager.sortType") },
  ];

  const renderItem = ({ item }: { item: FSItem }) => (
    <TouchableOpacity
      style={[
        viewMode === "grid" ? styles.gridItem : styles.listItem,
        { backgroundColor: colors.surface },
      ]}
      activeOpacity={0.7}
      onPress={() => {
        if (item.kind === "folder") handleFolderOpen(item.id);
      }}
      onLongPress={() => {
        if (item.kind === "file") {
          toggleFavorite(item.id);
        }
      }}
    >
      <Ionicons
        name={
          item.kind === "folder"
            ? "folder"
            : item.kind === "file" && item.type === "image"
              ? "image-outline"
              : item.kind === "file" && item.type === "video"
                ? "videocam-outline"
                : "document-outline"
        }
        size={viewMode === "grid" ? 36 : 22}
        color={item.kind === "folder" ? "#F5A623" : colors.primary}
      />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text
          style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
          {item.kind === "folder"
            ? `${item.itemCount} ${t("fileManager.items")}`
            : formatBytes(item.sizeBytes)}
        </Text>
      </View>
      {item.kind === "file" && item.isFavorite && (
        <Ionicons name="star" size={16} color="#F5A623" />
      )}
      <TouchableOpacity
        onPress={() => deleteItem(item.id, item.kind)}
        hitSlop={8}
        style={{ marginLeft: 4 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View
      testID="my-files-screen"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* Breadcrumbs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        }}
      >
        <TouchableOpacity onPress={() => setCurrentFolder(null)}>
          <Text style={[styles.breadcrumb, { color: colors.primary }]}>
            {t("fileManager.root")}
          </Text>
        </TouchableOpacity>
        {breadcrumbs.map((bc, i) => (
          <View
            key={bc.id}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ color: colors.textMuted, marginHorizontal: 4 }}>
              /
            </Text>
            <TouchableOpacity onPress={() => setCurrentFolder(bc.id)}>
              <Text
                style={[
                  styles.breadcrumb,
                  {
                    color:
                      i === breadcrumbs.length - 1
                        ? colors.text
                        : colors.primary,
                    fontWeight: i === breadcrumbs.length - 1 ? "700" : "400",
                  },
                ]}
              >
                {bc.name}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Search + Sort */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing.md,
          gap: 8,
          marginBottom: spacing.xs,
        }}
      >
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.surface, flex: 1 },
          ]}
        >
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            placeholder={t("fileManager.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, color: colors.text, marginLeft: 6, fontSize: 14 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        >
          <Ionicons
            name={viewMode === "list" ? "grid-outline" : "list-outline"}
            size={18}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {showSortMenu && (
        <View style={[styles.sortMenu, { backgroundColor: colors.surface }]}>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortItem}
              onPress={() => {
                setSortBy(opt.key);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={{
                  color: sortBy === opt.key ? colors.primary : colors.text,
                  fontSize: 14,
                }}
              >
                {opt.label}
              </Text>
              {sortBy === opt.key && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action bar */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing.md,
          gap: 8,
          marginBottom: spacing.xs,
        }}
      >
        {currentFolderId && (
          <TouchableOpacity
            style={[styles.chipButton, { backgroundColor: colors.surface }]}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={14} color={colors.primary} />
            <Text
              style={{ color: colors.primary, fontSize: 12, marginLeft: 4 }}
            >
              {t("fileManager.back")}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.chipButton, { backgroundColor: colors.surface }]}
          onPress={() => createFolder(currentFolderId)}
        >
          <Ionicons name="add" size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 12, marginLeft: 4 }}>
            {t("fileManager.newFolder")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* File list */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: 40,
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Ionicons
                name="folder-open-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text
                style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}
              >
                {t("fileManager.emptyFolder")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumb: { fontSize: 14 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sortMenu: {
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  chipButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gridItem: {
    width: "47%",
    padding: 12,
    borderRadius: 10,
    margin: 4,
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginVertical: 3,
  },
});
