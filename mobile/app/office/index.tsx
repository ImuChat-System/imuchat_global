/**
 * OfficeScreen — Hub documentaire principal
 *
 * Sections :
 *  - Barre de recherche
 *  - Filtres par type de document
 *  - Documents récents
 *  - Dossiers
 *  - Liste des documents filtrés/triés
 *  - FAB pour créer un nouveau document
 *
 * Phase — DEV-019 Module Office
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useOfficeStore } from "@/stores/office-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type {
  OfficeDocument,
  OfficeDocumentType,
  OfficeFolder,
} from "@/types/office";

const DOC_TYPE_ICONS: Record<OfficeDocumentType, string> = {
  note: "document-text",
  spreadsheet: "grid",
  presentation: "easel",
  pdf: "reader",
  journal: "book",
  signature: "create",
};

const DOC_TYPE_COLORS: Record<OfficeDocumentType, string> = {
  note: "#4A90D9",
  spreadsheet: "#34A853",
  presentation: "#FF9500",
  pdf: "#E53E3E",
  journal: "#9B59B6",
  signature: "#1ABC9C",
};

export default function OfficeScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const {
    documents,
    folders,
    isLoading,
    filterType,
    sortBy,
    currentFolderId,
    loadDocuments,
    loadFolders,
    searchDocuments,
    setFilterType,
    setSortBy,
    setCurrentFolder,
    getFilteredDocuments,
    getDocumentCount,
    getRecentDocuments,
  } = useOfficeStore();

  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, [loadDocuments, loadFolders]);

  const filteredDocs = getFilteredDocuments();
  const documentCounts = getDocumentCount();
  const recentDocs = getRecentDocuments(5);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDocuments();
    await loadFolders();
    setRefreshing(false);
  }, [loadDocuments, loadFolders]);

  const handleSearch = useCallback(
    async (query: string) => {
      setLocalSearch(query);
      if (query.trim().length >= 2) {
        await searchDocuments(query);
      } else if (query.trim().length === 0) {
        await loadDocuments();
      }
    },
    [searchDocuments, loadDocuments],
  );

  const handleDocumentPress = useCallback(
    (doc: OfficeDocument) => {
      switch (doc.type) {
        case "note":
          router.push({
            pathname: "/office/editor",
            params: { docId: doc.id },
          });
          break;
        case "spreadsheet":
          router.push({
            pathname: "/office/spreadsheet",
            params: { docId: doc.id },
          });
          break;
        case "presentation":
          router.push({
            pathname: "/office/presentation",
            params: { docId: doc.id },
          });
          break;
        case "pdf":
          router.push({
            pathname: "/office/pdf-viewer",
            params: { docId: doc.id },
          });
          break;
        case "journal":
          router.push({
            pathname: "/office/journal",
            params: { entryId: doc.id },
          });
          break;
        case "signature":
          router.push("/office/signature");
          break;
      }
    },
    [router],
  );

  const handleFolderPress = useCallback(
    (folder: OfficeFolder) => {
      setCurrentFolder(folder.id);
    },
    [setCurrentFolder],
  );

  const handleCreateDocument = useCallback(
    (type: OfficeDocumentType) => {
      setShowCreateMenu(false);
      switch (type) {
        case "note":
          router.push({
            pathname: "/office/editor",
            params: { isNew: "true" },
          });
          break;
        case "spreadsheet":
          router.push({
            pathname: "/office/spreadsheet",
            params: { isNew: "true" },
          });
          break;
        case "presentation":
          router.push({
            pathname: "/office/presentation",
            params: { isNew: "true" },
          });
          break;
        case "journal":
          router.push({
            pathname: "/office/journal",
            params: { isNew: "true" },
          });
          break;
        case "signature":
          router.push("/office/signature");
          break;
        default:
          break;
      }
    },
    [router],
  );

  // ─── Filter chips ───────────────────────────────────────
  const renderFilterChip = (
    type: OfficeDocumentType | "all",
    label: string,
  ) => {
    const isActive = filterType === type;
    return (
      <TouchableOpacity
        key={type}
        testID={`filter-${type}`}
        onPress={() => setFilterType(type)}
        style={[
          styles.filterChip,
          {
            backgroundColor: isActive ? colors.primary : colors.card,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.filterChipText,
            { color: isActive ? "#FFF" : colors.secondaryText },
          ]}
        >
          {label} ({type === "all" ? documentCounts.all : documentCounts[type]})
        </Text>
      </TouchableOpacity>
    );
  };

  // ─── Document card ──────────────────────────────────────
  const renderDocumentCard = ({ item }: { item: OfficeDocument }) => {
    const iconName = DOC_TYPE_ICONS[item.type] || "document";
    const iconColor = DOC_TYPE_COLORS[item.type] || colors.primary;

    return (
      <TouchableOpacity
        testID={`doc-${item.id}`}
        style={[
          styles.documentCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => handleDocumentPress(item)}
      >
        <View style={styles.docCardHeader}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
          <View style={styles.docCardBadges}>
            {item.is_pinned && (
              <Ionicons name="pin" size={14} color={colors.primary} />
            )}
            {item.is_favorite && (
              <Ionicons name="heart" size={14} color="#E53E3E" />
            )}
            {item.is_encrypted && (
              <Ionicons
                name="lock-closed"
                size={14}
                color={colors.secondaryText}
              />
            )}
          </View>
        </View>
        <Text
          style={[styles.docTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.docPreview, { color: colors.secondaryText }]}
          numberOfLines={2}
        >
          {item.content || t("office.noContent")}
        </Text>
        <View style={styles.docMeta}>
          <Text style={[styles.docMetaText, { color: colors.secondaryText }]}>
            {item.word_count} {t("office.words")}
          </Text>
          <Text style={[styles.docMetaText, { color: colors.secondaryText }]}>
            {new Date(item.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Folder card ────────────────────────────────────────
  const renderFolderCard = (folder: OfficeFolder) => (
    <TouchableOpacity
      key={folder.id}
      testID={`folder-${folder.id}`}
      style={[
        styles.folderCard,
        {
          backgroundColor: colors.card,
          borderColor: folder.color || colors.border,
          borderLeftWidth: 4,
        },
      ]}
      onPress={() => handleFolderPress(folder)}
    >
      <Ionicons
        name="folder"
        size={20}
        color={folder.color || colors.primary}
      />
      <Text style={[styles.folderName, { color: colors.text }]}>
        {folder.name}
      </Text>
      <Text style={[styles.folderCount, { color: colors.secondaryText }]}>
        {folder.document_count}
      </Text>
    </TouchableOpacity>
  );

  // ─── Create menu overlay ───────────────────────────────
  const renderCreateMenu = () => {
    if (!showCreateMenu) return null;

    const createOptions: Array<{
      type: OfficeDocumentType;
      label: string;
      icon: string;
    }> = [
      { type: "note", label: t("office.newNote"), icon: "document-text" },
      { type: "spreadsheet", label: t("office.newSpreadsheet"), icon: "grid" },
      {
        type: "presentation",
        label: t("office.newPresentation"),
        icon: "easel",
      },
      { type: "journal", label: t("office.newJournal"), icon: "book" },
    ];

    return (
      <View style={[styles.createMenuOverlay]}>
        <TouchableOpacity
          style={styles.createMenuBackdrop}
          onPress={() => setShowCreateMenu(false)}
        />
        <View
          style={[
            styles.createMenu,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {createOptions.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              testID={`create-${opt.type}`}
              style={styles.createMenuItem}
              onPress={() => handleCreateDocument(opt.type)}
            >
              <Ionicons
                name={opt.icon as any}
                size={22}
                color={DOC_TYPE_COLORS[opt.type]}
              />
              <Text style={[styles.createMenuText, { color: colors.text }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          testID="office-search-input"
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t("office.searchPlaceholder")}
          placeholderTextColor={colors.secondaryText}
          value={localSearch}
          onChangeText={handleSearch}
        />
        {localSearch.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.secondaryText}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Breadcrumb if in folder */}
      {currentFolderId && (
        <TouchableOpacity
          testID="breadcrumb-back"
          style={styles.breadcrumb}
          onPress={() => setCurrentFolder(null)}
        >
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={[styles.breadcrumbText, { color: colors.primary }]}>
            {t("office.allDocuments")}
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        stickyHeaderIndices={[0]}
      >
        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filtersRow, { backgroundColor: colors.background }]}
        >
          {renderFilterChip("all", t("office.filterAll"))}
          {renderFilterChip("note", t("office.filterNotes"))}
          {renderFilterChip("spreadsheet", t("office.filterSpreadsheets"))}
          {renderFilterChip("presentation", t("office.filterPresentations"))}
          {renderFilterChip("journal", t("office.filterJournal"))}
          {renderFilterChip("pdf", t("office.filterPdf"))}
        </ScrollView>

        {/* Folders (only at root) */}
        {!currentFolderId && folders.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📁 {t("office.folders")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {folders.map(renderFolderCard)}
            </ScrollView>
          </View>
        )}

        {/* Recent documents (only at root with no search) */}
        {!currentFolderId && !localSearch && recentDocs.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🕐 {t("office.recentDocuments")}
            </Text>
            <FlatList
              data={recentDocs}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderDocumentCard}
              contentContainerStyle={{ gap: spacing.sm }}
            />
          </View>
        )}

        {/* All filtered documents */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📄 {t("office.documents")} ({filteredDocs.length})
            </Text>
            {/* Sort button */}
            <TouchableOpacity
              testID="sort-button"
              onPress={() => {
                const options: Array<"updated" | "created" | "title" | "type"> =
                  ["updated", "created", "title", "type"];
                const currentIdx = options.indexOf(sortBy);
                const nextIdx = (currentIdx + 1) % options.length;
                setSortBy(options[nextIdx]);
              }}
            >
              <Ionicons
                name="swap-vertical"
                size={20}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          </View>

          {filteredDocs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.secondaryText}
              />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                {localSearch
                  ? t("office.noSearchResults")
                  : t("office.noDocuments")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredDocs}
              keyExtractor={(item) => item.id}
              renderItem={renderDocumentCard}
              numColumns={2}
              columnWrapperStyle={{ gap: spacing.sm }}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: 100 }}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        testID="fab-create"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateMenu(true)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {renderCreateMenu()}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, paddingVertical: 4 },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  breadcrumbText: { fontSize: 14, fontWeight: "500" },
  filtersRow: { paddingHorizontal: 12, paddingVertical: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: { fontSize: 13, fontWeight: "500" },
  section: { marginTop: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  documentCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
    maxWidth: "48%",
  },
  docCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  docCardBadges: { flexDirection: "row", gap: 4 },
  docTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  docPreview: { fontSize: 12, lineHeight: 16, marginBottom: 8 },
  docMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  docMetaText: { fontSize: 11 },
  folderCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    gap: 8,
  },
  folderName: { fontSize: 14, fontWeight: "500" },
  folderCount: { fontSize: 12 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  createMenuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  createMenuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  createMenu: {
    marginRight: 24,
    marginBottom: 90,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    minWidth: 200,
  },
  createMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  createMenuText: { fontSize: 15, fontWeight: "500" },
});
