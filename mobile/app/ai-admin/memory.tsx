/**
 * MemoryScreen — AI Memory Management (DEV-035)
 *
 * View and manage AI persistent memory:
 *  - List all memory entries by category
 *  - Delete individual entries
 *  - Clear by category
 *  - Clear all memory
 *  - Toggle memory on/off
 *
 * Spec §6.3 & §6.4: Gestion mémoire persistante + suppression sélective
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAIAdminStore } from "@/stores/ai-admin-store";
import type { AIMemoryEntry, MemoryCategory } from "@/types/ai-admin";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Category Config ──────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  MemoryCategory,
  { emoji: string; color: string }
> = {
  preference: { emoji: "⚙️", color: "#8B5CF6" },
  fact: { emoji: "📌", color: "#3B82F6" },
  conversation: { emoji: "💬", color: "#10B981" },
  context: { emoji: "🔗", color: "#F59E0B" },
  instruction: { emoji: "📝", color: "#EF4444" },
};

// ─── Memory Entry Card ────────────────────────────────────────

interface EntryCardProps {
  entry: AIMemoryEntry;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}

function EntryCard({ entry, onDelete, colors }: EntryCardProps) {
  const cfg = CATEGORY_CONFIG[entry.category];
  return (
    <View style={[styles.entryCard, { backgroundColor: colors.surface }]}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryEmoji}>{cfg.emoji}</Text>
        <View
          style={[styles.categoryBadge, { backgroundColor: cfg.color + "20" }]}
        >
          <Text style={[styles.categoryText, { color: cfg.color }]}>
            {entry.category}
          </Text>
        </View>
        <Text style={[styles.entryDate, { color: colors.textMuted }]}>
          {new Date(entry.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[styles.entryContent, { color: colors.text }]}
        numberOfLines={3}
      >
        {entry.content}
      </Text>
      {entry.source && (
        <Text style={[styles.entrySource, { color: colors.textMuted }]}>
          {entry.source}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.deleteEntryBtn, { borderColor: colors.error + "40" }]}
        onPress={onDelete}
      >
        <Ionicons name="trash-outline" size={14} color={colors.error} />
        <Text style={[styles.deleteEntryText, { color: colors.error }]}>
          Supprimer
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function MemoryScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    memoryEntries,
    memoryEnabled,
    toggleMemory,
    deleteMemoryEntry,
    deleteMemoryByCategory,
    clearAllMemory,
  } = useAIAdminStore();

  const [selectedCategory, setSelectedCategory] = useState<
    MemoryCategory | "all"
  >("all");

  const categories = useMemo(() => {
    const cats = new Set(memoryEntries.map((m) => m.category));
    return ["all" as const, ...Array.from(cats)] as (MemoryCategory | "all")[];
  }, [memoryEntries]);

  const filtered = useMemo(
    () =>
      selectedCategory === "all"
        ? memoryEntries
        : memoryEntries.filter((m) => m.category === selectedCategory),
    [memoryEntries, selectedCategory],
  );

  const handleClearCategory = useCallback(
    (cat: MemoryCategory) => {
      Alert.alert(t("aiAdmin.clearCategory"), t("aiAdmin.clearCategoryMsg"), [
        { text: t("aiAdmin.cancel"), style: "cancel" },
        {
          text: t("aiAdmin.clear"),
          style: "destructive",
          onPress: () => deleteMemoryByCategory(cat),
        },
      ]);
    },
    [deleteMemoryByCategory, t],
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(t("aiAdmin.clearAll"), t("aiAdmin.clearAllMsg"), [
      { text: t("aiAdmin.cancel"), style: "cancel" },
      {
        text: t("aiAdmin.clear"),
        style: "destructive",
        onPress: clearAllMemory,
      },
    ]);
  }, [clearAllMemory, t]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(t("aiAdmin.deleteMemory"), t("aiAdmin.deleteMemoryMsg"), [
        { text: t("aiAdmin.cancel"), style: "cancel" },
        {
          text: t("aiAdmin.delete"),
          style: "destructive",
          onPress: () => deleteMemoryEntry(id),
        },
      ]);
    },
    [deleteMemoryEntry, t],
  );

  const renderEntry = useCallback(
    ({ item }: { item: AIMemoryEntry }) => (
      <EntryCard
        entry={item}
        onDelete={() => handleDelete(item.id)}
        colors={colors}
      />
    ),
    [colors, handleDelete],
  );

  return (
    <View
      testID="memory-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderEntry}
        contentContainerStyle={[styles.list, { padding: spacing.md }]}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Toggle */}
            <View
              style={[styles.toggleRow, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                {t("aiAdmin.memoryEnabled")}
              </Text>
              <Switch
                testID="memory-toggle"
                value={memoryEnabled}
                onValueChange={toggleMemory}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>

            {/* Category filter */}
            <View style={styles.categoryFilter}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        selectedCategory === cat
                          ? colors.primary
                          : colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={{
                      color: selectedCategory === cat ? "#fff" : colors.text,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {cat === "all" ? t("aiAdmin.all") : cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              {selectedCategory !== "all" && (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { borderColor: colors.error + "40" },
                  ]}
                  onPress={() =>
                    handleClearCategory(selectedCategory as MemoryCategory)
                  }
                >
                  <Text style={[styles.actionBtnText, { color: colors.error }]}>
                    {t("aiAdmin.clearCategory")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                testID="clear-all-memory-btn"
                style={[styles.actionBtn, { borderColor: colors.error + "40" }]}
                onPress={handleClearAll}
              >
                <Text style={[styles.actionBtnText, { color: colors.error }]}>
                  {t("aiAdmin.clearAll")}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.countText, { color: colors.textMuted }]}>
              {t("aiAdmin.memoryCount", { count: filtered.length })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🧠</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("aiAdmin.noMemory")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { gap: 10, paddingBottom: 40 },
  header: { gap: 10, marginBottom: 8 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
  },
  toggleLabel: { fontSize: 15, fontWeight: "600" },
  categoryFilter: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: { fontSize: 12, fontWeight: "600" },
  countText: { fontSize: 12 },
  entryCard: { padding: 14, borderRadius: 12, gap: 8 },
  entryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  entryEmoji: { fontSize: 16 },
  categoryBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  categoryText: { fontSize: 11, fontWeight: "600" },
  entryDate: { fontSize: 11, marginLeft: "auto" },
  entryContent: { fontSize: 13, lineHeight: 18 },
  entrySource: { fontSize: 11 },
  deleteEntryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  deleteEntryText: { fontSize: 11, fontWeight: "500" },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14 },
});
