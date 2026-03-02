/**
 * Templates de Messages
 *
 * Gestion des templates :
 *  - Filtrage par catégorie
 *  - Aperçu et application
 *  - Création de templates custom
 *  - Favoris
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import { useSuggestions } from "@/hooks/useSuggestions";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { MessageTemplate } from "@/types/suggestions";
import { TemplateCategory } from "@/types/suggestions";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORY_ICONS: Record<string, string> = {
  greeting: "hand-left-outline",
  farewell: "hand-right-outline",
  thanks: "heart-outline",
  apology: "sad-outline",
  invitation: "calendar-outline",
  confirmation: "checkmark-circle-outline",
  question: "help-circle-outline",
  announcement: "megaphone-outline",
  congratulations: "trophy-outline",
  custom: "create-outline",
};

const CATEGORY_COLORS: Record<string, string> = {
  greeting: "#4CAF50",
  farewell: "#9C27B0",
  thanks: "#E91E63",
  apology: "#FF9800",
  invitation: "#2196F3",
  confirmation: "#00BCD4",
  question: "#3F51B5",
  announcement: "#F44336",
  congratulations: "#FFC107",
  custom: "#607D8B",
};

export default function TemplatesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    filteredTemplates,
    favoriteTemplates,
    selectedCategory,
    setTemplateCategory,
    applyTemplate,
    createTemplate,
    deleteTemplate,
    toggleFavorite,
    templateCount,
  } = useSuggestions();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<TemplateCategory>(
    TemplateCategory.CUSTOM,
  );
  const [previewText, setPreviewText] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const categories = Object.keys(CATEGORY_ICONS);

  const handleCreateTemplate = useCallback(async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await createTemplate(newTitle.trim(), newContent.trim(), newCategory);
    setShowCreateModal(false);
    setNewTitle("");
    setNewContent("");
    setNewCategory(TemplateCategory.CUSTOM);
  }, [newTitle, newContent, newCategory]);

  const handleDeleteTemplate = useCallback(
    (templateId: string, isCustom: boolean) => {
      if (!isCustom) {
        Alert.alert(t("suggestions.cannotDeleteDefault"));
        return;
      }
      Alert.alert(
        t("suggestions.deleteTemplate"),
        t("suggestions.deleteTemplateConfirm"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => deleteTemplate(templateId),
          },
        ],
      );
    },
    [],
  );

  const handleApply = useCallback(
    (templateId: string) => {
      const text = applyTemplate(templateId, {});
      setPreviewText(text);
    },
    [applyTemplate],
  );

  const displayedTemplates = showFavorites
    ? favoriteTemplates
    : filteredTemplates;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    filterRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "15",
    },
    filterChipText: { fontSize: 12, color: colors.textMuted },
    filterChipTextActive: { color: colors.primary, fontWeight: "600" },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginHorizontal: 16,
      marginBottom: 10,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    cardTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      marginLeft: 10,
    },
    cardContent: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: colors.primary + "15",
    },
    badgeText: { fontSize: 11, color: colors.primary, fontWeight: "500" },
    actionBtn: { padding: 6, marginLeft: 8 },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 30,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
    },
    modalBtn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 8,
      marginLeft: 10,
    },
    preview: {
      backgroundColor: colors.primary + "10",
      borderRadius: 10,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    previewLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 4,
    },
    previewText: { fontSize: 14, color: colors.text },
    toggleRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8 },
    toggleBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 8,
      backgroundColor: colors.surface,
    },
    toggleBtnActive: { backgroundColor: colors.primary },
    toggleText: { fontSize: 13, color: colors.textMuted },
    toggleTextActive: { color: "#fff", fontWeight: "600" },
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 40,
      fontSize: 15,
    },
    catRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      marginBottom: 8,
    },
  });

  const renderTemplate = ({ item }: { item: MessageTemplate }) => {
    const catColor = CATEGORY_COLORS[item.category] || colors.primary;
    const catIcon = CATEGORY_ICONS[item.category] || "document-outline";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name={catIcon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={catColor}
          />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={item.is_favorite ? "star" : "star-outline"}
              size={18}
              color="#FFC107"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardContent} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.cardFooter}>
          <View style={[styles.badge, { backgroundColor: catColor + "15" }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>
              {t("suggestions.category." + item.category) || item.category}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleApply(item.id)}
            >
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            {item.is_custom && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDeleteTemplate(item.id, true)}
              >
                <Ionicons name="trash-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, !showFavorites && styles.toggleBtnActive]}
          onPress={() => setShowFavorites(false)}
        >
          <Text
            style={[
              styles.toggleText,
              !showFavorites && styles.toggleTextActive,
            ]}
          >
            {t("suggestions.allTemplates")} ({templateCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showFavorites && styles.toggleBtnActive]}
          onPress={() => setShowFavorites(true)}
        >
          <Text
            style={[
              styles.toggleText,
              showFavorites && styles.toggleTextActive,
            ]}
          >
            ⭐ {t("suggestions.favorites")} ({favoriteTemplates.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category filter chips */}
      {!showFavorites && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedCategory && styles.filterChipActive,
            ]}
            onPress={() => setTemplateCategory(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedCategory && styles.filterChipTextActive,
              ]}
            >
              {t("suggestions.allCategories")}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setTemplateCategory(cat as TemplateCategory)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat && styles.filterChipTextActive,
                ]}
              >
                {t("suggestions.category." + cat) || cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Preview */}
      {previewText ? (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{t("suggestions.preview")}</Text>
          <Text style={styles.previewText}>{previewText}</Text>
        </View>
      ) : null}

      {/* Template list */}
      <FlatList
        data={displayedTemplates}
        keyExtractor={(item) => item.id}
        renderItem={renderTemplate}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t("suggestions.noTemplates")}</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t("suggestions.newTemplate")}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("suggestions.templateTitle")}
              placeholderTextColor={colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder={t("suggestions.templateContent")}
              placeholderTextColor={colors.textMuted}
              value={newContent}
              onChangeText={setNewContent}
              multiline
            />
            <Text
              style={{
                fontSize: 13,
                color: colors.textMuted,
                marginBottom: 8,
              }}
            >
              {t("suggestions.variableHint")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    newCategory === cat && styles.filterChipActive,
                  ]}
                  onPress={() => setNewCategory(cat as TemplateCategory)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      newCategory === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {t("suggestions.category." + cat) || cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={{ color: colors.textMuted }}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: !newTitle.trim() || !newContent.trim() ? 0.5 : 1,
                  },
                ]}
                onPress={handleCreateTemplate}
                disabled={!newTitle.trim() || !newContent.trim()}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {t("common.create")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
