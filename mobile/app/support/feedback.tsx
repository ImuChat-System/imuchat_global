/**
 * Feedback Utilisateur Screen
 *
 * Features:
 * - Structured feedback form (type, mood, title, body)
 * - Mood emoji picker
 * - Feedback type selector
 * - Past feedback history list
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { FeedbackMood, FeedbackType } from "@/types/support";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FEEDBACK_TYPES: { key: FeedbackType; emoji: string }[] = [
  { key: "bug", emoji: "🐛" },
  { key: "feature", emoji: "💡" },
  { key: "improvement", emoji: "📈" },
  { key: "compliment", emoji: "💖" },
  { key: "other", emoji: "📋" },
];

const MOODS: { key: FeedbackMood; emoji: string }[] = [
  { key: "very-unhappy", emoji: "😡" },
  { key: "unhappy", emoji: "😞" },
  { key: "neutral", emoji: "😐" },
  { key: "happy", emoji: "😊" },
  { key: "very-happy", emoji: "🤩" },
];

export default function FeedbackScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { addFeedback, feedbackHistory } = useSupport();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>("improvement");
  const [mood, setMood] = useState<FeedbackMood>("neutral");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert(t("support.error"), t("support.fillAllFields"));
      return;
    }

    addFeedback({
      id: `fb-${Date.now()}`,
      userId: "current-user",
      type: feedbackType,
      mood,
      title: title.trim(),
      body: body.trim(),
      metadata: {
        appVersion: "1.0.0-beta",
        platform: "ios",
        osVersion: "17.0",
      },
      createdAt: new Date().toISOString(),
    });

    Alert.alert(t("support.thankYou"), t("support.feedbackSubmitted"));
    setTitle("");
    setBody("");
    setMood("neutral");
    setFeedbackType("improvement");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.headerDesc, { color: colors.textMuted }]}>
        {t("support.feedbackDesc")}
      </Text>

      {/* Mood picker */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          {t("support.howAreYouFeeling")}
        </Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.moodBtn,
                {
                  backgroundColor:
                    mood === m.key ? colors.primary + "20" : colors.background,
                  borderColor: mood === m.key ? colors.primary : "transparent",
                  borderWidth: mood === m.key ? 2 : 0,
                },
              ]}
              onPress={() => setMood(m.key)}
            >
              <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
              <Text
                style={{
                  fontSize: 10,
                  color: mood === m.key ? colors.primary : colors.textMuted,
                  fontWeight: mood === m.key ? "600" : "400",
                }}
              >
                {t(`support.mood.${m.key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Type picker */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          {t("support.feedbackType")}
        </Text>
        <View style={styles.typeRow}>
          {FEEDBACK_TYPES.map((ft) => (
            <TouchableOpacity
              key={ft.key}
              style={[
                styles.typeChip,
                {
                  backgroundColor:
                    feedbackType === ft.key
                      ? colors.primary
                      : colors.background,
                },
              ]}
              onPress={() => setFeedbackType(ft.key)}
            >
              <Text style={{ fontSize: 14 }}>{ft.emoji}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: feedbackType === ft.key ? "#fff" : colors.text,
                  fontWeight: "500",
                }}
              >
                {t(`support.feedbackTypes.${ft.key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Form */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          {t("support.feedbackDetails")}
        </Text>

        <TextInput
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border },
          ]}
          placeholder={t("support.feedbackTitlePlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { color: colors.text, borderColor: colors.border },
          ]}
          placeholder={t("support.feedbackBodyPlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>
            {t("support.submitFeedback")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      {feedbackHistory.length > 0 && (
        <>
          <TouchableOpacity
            style={[styles.historyToggle, { backgroundColor: colors.surface }]}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={[styles.historyLabel, { color: colors.text }]}>
              {t("support.feedbackHistory")} ({feedbackHistory.length})
            </Text>
            <Text style={{ color: colors.textMuted }}>
              {showHistory ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {showHistory &&
            feedbackHistory.map((fb) => {
              const typeEmoji =
                FEEDBACK_TYPES.find((f) => f.key === fb.type)?.emoji || "📋";
              const moodEmoji =
                MOODS.find((m) => m.key === fb.mood)?.emoji || "😐";
              return (
                <View
                  key={fb.id}
                  style={[
                    styles.historyCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <Text style={{ fontSize: 16 }}>
                      {typeEmoji} {moodEmoji}
                    </Text>
                    <Text style={[styles.historyTitle, { color: colors.text }]}>
                      {fb.title}
                    </Text>
                  </View>
                  <Text
                    style={[styles.historyBody, { color: colors.textMuted }]}
                    numberOfLines={2}
                  >
                    {fb.body}
                  </Text>
                  <Text
                    style={[styles.historyDate, { color: colors.textMuted }]}
                  >
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  headerDesc: { fontSize: 14, lineHeight: 20 },
  section: { borderRadius: 12, padding: 14, gap: 10 },
  sectionLabel: { fontSize: 14, fontWeight: "600" },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    minWidth: 56,
    gap: 4,
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  submitBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  historyToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
  },
  historyLabel: { fontSize: 14, fontWeight: "600" },
  historyCard: { borderRadius: 10, padding: 12, gap: 4 },
  historyHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  historyTitle: { fontSize: 14, fontWeight: "500", flex: 1 },
  historyBody: { fontSize: 13, lineHeight: 18 },
  historyDate: { fontSize: 11, alignSelf: "flex-end" },
});
