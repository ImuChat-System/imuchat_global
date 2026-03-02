/**
 * JournalScreen — Journal privé
 *
 * Fonctionnalités :
 *  - Suivi d'humeur (emoji)
 *  - Entrées quotidiennes
 *  - Tags et recherche
 *  - Mode édition / lecture
 *  - Météo et localisation (optionnels)
 *
 * Phase — DEV-019 Module Office
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { useOfficeStore } from "@/stores/office-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { JournalMood } from "@/types/office";

// ─── Mood config ────────────────────────────────────────────

const MOOD_OPTIONS: Array<{ mood: JournalMood; emoji: string; label: string }> =
  [
    { mood: "great", emoji: "😄", label: "Super" },
    { mood: "good", emoji: "🙂", label: "Bien" },
    { mood: "neutral", emoji: "😐", label: "Neutre" },
    { mood: "bad", emoji: "😞", label: "Mal" },
    { mood: "terrible", emoji: "😢", label: "Terrible" },
  ];

export default function JournalScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const { entryId, isNew } = useLocalSearchParams<{
    entryId?: string;
    isNew?: string;
  }>();

  const {
    journalEntries,
    currentJournalEntry,
    loadJournalEntries,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    openJournalEntry,
    closeJournalEntry,
  } = useOfficeStore();

  // ─── State ──────────────────────────────────────────────
  const [mode, setMode] = useState<"list" | "edit">(
    entryId || isNew ? "edit" : "list",
  );
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<JournalMood>("neutral");
  const [editId, setEditId] = useState<string | null>(entryId || null);
  const [filterMood, setFilterMood] = useState<JournalMood | "all">("all");

  // ─── Load data ──────────────────────────────────────────
  useEffect(() => {
    loadJournalEntries();
    return () => {
      closeJournalEntry();
    };
  }, [loadJournalEntries, closeJournalEntry]);

  // ─── Open existing entry ────────────────────────────────
  useEffect(() => {
    if (entryId && !isNew) {
      openJournalEntry(entryId);
    }
  }, [entryId, isNew, openJournalEntry]);

  useEffect(() => {
    if (currentJournalEntry) {
      setEditTitle(currentJournalEntry.title);
      setEditContent(currentJournalEntry.content || "");
      setEditMood(currentJournalEntry.mood);
      setEditId(currentJournalEntry.id);
      setMode("edit");
    }
  }, [currentJournalEntry]);

  // ─── Actions ────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!editTitle.trim()) {
      showToast(t("office.titleRequired"), "error");
      return;
    }

    if (editId) {
      await updateJournalEntry(editId, {
        title: editTitle,
        content: editContent,
        mood: editMood,
      });
      showToast(t("office.journalUpdated"), "success");
    } else {
      const entry = await createJournalEntry(editTitle, editContent, editMood);
      setEditId(entry.id);
      showToast(t("office.journalCreated"), "success");
    }
  }, [
    editId,
    editTitle,
    editContent,
    editMood,
    updateJournalEntry,
    createJournalEntry,
    showToast,
    t,
  ]);

  const handleNewEntry = useCallback(() => {
    closeJournalEntry();
    setEditId(null);
    setEditTitle("");
    setEditContent("");
    setEditMood("neutral");
    setMode("edit");
  }, [closeJournalEntry]);

  const handleOpenEntry = useCallback(
    (id: string) => {
      openJournalEntry(id);
      setMode("edit");
    },
    [openJournalEntry],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteJournalEntry(id);
      if (editId === id) {
        setMode("list");
        setEditId(null);
      }
      showToast(t("office.journalDeleted"), "success");
    },
    [deleteJournalEntry, editId, showToast, t],
  );

  const handleBack = useCallback(() => {
    if (mode === "edit" && !entryId) {
      setMode("list");
      closeJournalEntry();
    } else {
      router.back();
    }
  }, [mode, entryId, router, closeJournalEntry]);

  // ─── Filtered entries ───────────────────────────────────
  const filteredEntries =
    filterMood === "all"
      ? journalEntries
      : journalEntries.filter((e) => e.mood === filterMood);

  // ─── List mode ──────────────────────────────────────────
  if (mode === "list") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            📔 {t("office.journal")}
          </Text>
          <TouchableOpacity testID="new-journal-entry" onPress={handleNewEntry}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Mood filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.moodFilterRow}
        >
          <TouchableOpacity
            testID="filter-all"
            style={[
              styles.moodChip,
              {
                backgroundColor:
                  filterMood === "all" ? colors.primary : colors.card,
                borderColor:
                  filterMood === "all" ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilterMood("all")}
          >
            <Text
              style={{
                color: filterMood === "all" ? "#FFF" : colors.secondaryText,
                fontSize: 13,
              }}
            >
              {t("office.filterAll")}
            </Text>
          </TouchableOpacity>

          {MOOD_OPTIONS.map((opt) => {
            const isActive = filterMood === opt.mood;
            return (
              <TouchableOpacity
                key={opt.mood}
                testID={`filter-${opt.mood}`}
                style={[
                  styles.moodChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFilterMood(opt.mood)}
              >
                <Text style={{ fontSize: 16 }}>{opt.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Entries list */}
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {t("office.noJournalEntries")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              paddingBottom: 40,
            }}
            renderItem={({ item }) => {
              const moodOption = MOOD_OPTIONS.find((m) => m.mood === item.mood);
              return (
                <TouchableOpacity
                  testID={`entry-${item.id}`}
                  style={[
                    styles.entryCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleOpenEntry(item.id)}
                >
                  <View style={styles.entryCardHeader}>
                    <Text style={{ fontSize: 24 }}>
                      {moodOption?.emoji || "😐"}
                    </Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        style={[styles.entryTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.entryDate,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      testID={`delete-entry-${item.id}`}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.secondaryText}
                      />
                    </TouchableOpacity>
                  </View>
                  {item.content ? (
                    <Text
                      style={[
                        styles.entryPreview,
                        { color: colors.secondaryText },
                      ]}
                      numberOfLines={2}
                    >
                      {item.content}
                    </Text>
                  ) : null}
                  {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {item.tags.map((tag) => (
                        <Text
                          key={tag}
                          style={[
                            styles.tag,
                            {
                              backgroundColor: colors.primary + "20",
                              color: colors.primary,
                            },
                          ]}
                        >
                          #{tag}
                        </Text>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  }

  // ─── Edit mode ──────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={[
          styles.editHeader,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity testID="journal-back" onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity testID="journal-save" onPress={handleSave}>
          <Text style={[styles.saveBtn, { color: colors.primary }]}>
            {t("office.save")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date */}
        <Text style={[styles.dateLabel, { color: colors.secondaryText }]}>
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        {/* Mood picker */}
        <View style={styles.moodPicker}>
          <Text style={[styles.moodLabel, { color: colors.text }]}>
            {t("office.howAreYou")}
          </Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((opt) => {
              const isActive = editMood === opt.mood;
              return (
                <TouchableOpacity
                  key={opt.mood}
                  testID={`mood-${opt.mood}`}
                  style={[
                    styles.moodBtn,
                    {
                      backgroundColor: isActive
                        ? colors.primary + "20"
                        : colors.card,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setEditMood(opt.mood)}
                >
                  <Text style={{ fontSize: 28 }}>{opt.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: isActive ? colors.primary : colors.secondaryText,
                      marginTop: 2,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Title */}
        <TextInput
          testID="journal-title"
          style={[styles.titleInput, { color: colors.text }]}
          placeholder={t("office.journalTitlePlaceholder")}
          placeholderTextColor={colors.secondaryText}
          value={editTitle}
          onChangeText={setEditTitle}
          maxLength={200}
        />

        {/* Content */}
        <TextInput
          testID="journal-content"
          style={[
            styles.contentInput,
            {
              color: colors.text,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("office.journalContentPlaceholder")}
          placeholderTextColor={colors.secondaryText}
          value={editContent}
          onChangeText={setEditContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listTitle: { fontSize: 22, fontWeight: "700" },
  moodFilterRow: { paddingHorizontal: 16, paddingVertical: 10 },
  moodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 15, textAlign: "center" },
  entryCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  entryCardHeader: { flexDirection: "row", alignItems: "center" },
  entryTitle: { fontSize: 16, fontWeight: "600" },
  entryDate: { fontSize: 12, marginTop: 2 },
  entryPreview: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  tag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  saveBtn: { fontSize: 16, fontWeight: "600" },
  dateLabel: { fontSize: 14, marginBottom: 16, textAlign: "center" },
  moodPicker: { marginBottom: 20 },
  moodLabel: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 58,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 200,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
