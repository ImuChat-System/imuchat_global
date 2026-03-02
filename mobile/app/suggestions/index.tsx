/**
 * Suggestions IA — Dashboard
 *
 * Écran principal avec :
 *  - Démo Smart Reply interactive
 *  - Statistiques d'utilisation
 *  - Accès rapide templates, résumés, paramètres
 *  - Détection de ton en direct
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import { useSuggestions } from "@/hooks/useSuggestions";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SuggestionsIndex() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const {
    smartReplies,
    hasSmartReplies,
    isLoadingSuggestions,
    getSmartReplies,
    acceptReply,
    dismissReply,
    currentTone,
    analyzeTone,
    completions,
    getCompletions,
    stats,
    acceptanceRate,
    preferences,
    templateCount,
    summaryCount,
    loadStats,
    loadTemplates,
    loadSummaries,
  } = useSuggestions();

  const [demoMessage, setDemoMessage] = useState("");
  const [acceptedReply, setAcceptedReply] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadTemplates(), loadSummaries()]);
    setRefreshing(false);
  }, []);

  const handleDemoSuggest = useCallback(async () => {
    if (!demoMessage.trim()) return;
    const context = {
      message_id: "demo_msg",
      content: demoMessage,
      sender_id: "demo_sender",
      sender_name: "Demo User",
      conversation_id: "demo_conv",
      is_group: false,
      timestamp: new Date().toISOString(),
      previous_messages: [],
    };
    await getSmartReplies(context);
    await analyzeTone("demo_msg", demoMessage);
  }, [demoMessage]);

  const handleAcceptReply = useCallback(
    (id: string) => {
      const text = acceptReply(id);
      setAcceptedReply(text);
    },
    [acceptReply],
  );

  const handleTextChange = useCallback((text: string) => {
    setDemoMessage(text);
    if (text.length >= 3) {
      getCompletions(text, {
        message_id: "demo",
        content: "",
        sender_id: "me",
        sender_name: "Me",
        conversation_id: "demo",
        is_group: false,
        timestamp: new Date().toISOString(),
        previous_messages: [],
      });
    }
  }, []);

  const toneColor = {
    positive: "#4CAF50",
    negative: "#F44336",
    neutral: "#9E9E9E",
    question: "#2196F3",
    urgent: "#FF5722",
    formal: "#607D8B",
    casual: "#FF9800",
    humorous: "#E91E63",
  };

  const toneEmoji = {
    positive: "😊",
    negative: "😔",
    neutral: "😐",
    question: "🤔",
    urgent: "🚨",
    formal: "🎩",
    casual: "😎",
    humorous: "😂",
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
    cardSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    cardIcon: { marginRight: 12 },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 10,
    },
    suggestBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
    replyChip: {
      backgroundColor: colors.primary + "20",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.primary + "40",
    },
    replyChipText: { color: colors.primary, fontWeight: "500", fontSize: 14 },
    replyRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
    acceptedText: {
      color: colors.primary,
      fontWeight: "600",
      marginTop: 8,
      fontSize: 14,
    },
    toneBar: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    toneText: { fontSize: 14, fontWeight: "500", marginLeft: 8 },
    toneEmoji: { fontSize: 20 },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 8,
    },
    statItem: { alignItems: "center" },
    statValue: { fontSize: 20, fontWeight: "700", color: colors.primary },
    statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    navCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    navText: { flex: 1, marginLeft: 12 },
    navTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
    navSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    completionItem: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    completionText: { fontSize: 14, color: colors.textMuted },
    completionBold: { color: colors.text, fontWeight: "600" },
    dismissBtn: { marginLeft: 6, padding: 4 },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Demo Smart Reply */}
      <Text style={styles.sectionTitle}>{t("suggestions.smartReply")}</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder={t("suggestions.demoPlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={demoMessage}
          onChangeText={handleTextChange}
          multiline
        />

        {/* Auto-completion */}
        {completions.length > 0 && (
          <View style={{ marginTop: 6 }}>
            {completions.slice(0, 3).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.completionItem}
                onPress={() => setDemoMessage(c.full_text)}
              >
                <Text style={styles.completionText}>
                  <Text style={styles.completionBold}>{demoMessage}</Text>
                  {c.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.suggestBtn,
            (!demoMessage.trim() || isLoadingSuggestions) && { opacity: 0.5 },
          ]}
          onPress={handleDemoSuggest}
          disabled={!demoMessage.trim() || isLoadingSuggestions}
        >
          {isLoadingSuggestions ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.suggestBtnText}>
              {t("suggestions.generateReplies")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Smart Reply chips */}
        {hasSmartReplies && (
          <View style={styles.replyRow}>
            {smartReplies.map((reply) => (
              <View
                key={reply.id}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <TouchableOpacity
                  style={styles.replyChip}
                  onPress={() => handleAcceptReply(reply.id)}
                >
                  <Text style={styles.replyChipText}>{reply.text}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={() => dismissReply(reply.id)}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Accepted reply */}
        {acceptedReply ? (
          <Text style={styles.acceptedText}>
            ✓ {t("suggestions.accepted")}: "{acceptedReply}"
          </Text>
        ) : null}

        {/* Tone detection */}
        {currentTone && (
          <View
            style={[
              styles.toneBar,
              {
                backgroundColor:
                  (toneColor[currentTone.primary_tone] || "#9E9E9E") + "15",
              },
            ]}
          >
            <Text style={styles.toneEmoji}>
              {toneEmoji[currentTone.primary_tone] || "😐"}
            </Text>
            <Text
              style={[
                styles.toneText,
                { color: toneColor[currentTone.primary_tone] || "#9E9E9E" },
              ]}
            >
              {t("suggestions.tone." + currentTone.primary_tone)} (
              {Math.round(currentTone.confidence * 100)}%)
            </Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      <Text style={styles.sectionTitle}>{t("suggestions.statistics")}</Text>
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.total_suggestions_shown || 0}
            </Text>
            <Text style={styles.statLabel}>{t("suggestions.shown")}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.total_suggestions_used || 0}
            </Text>
            <Text style={styles.statLabel}>{t("suggestions.used")}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{acceptanceRate}%</Text>
            <Text style={styles.statLabel}>
              {t("suggestions.acceptanceRate")}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.summaries_generated || 0}
            </Text>
            <Text style={styles.statLabel}>
              {t("suggestions.summariesCount")}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation cards */}
      <Text style={styles.sectionTitle}>{t("suggestions.tools")}</Text>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => router.push("/suggestions/templates" as Href)}
      >
        <Ionicons
          name="document-text-outline"
          size={24}
          color={colors.primary}
        />
        <View style={styles.navText}>
          <Text style={styles.navTitle}>{t("suggestions.templates")}</Text>
          <Text style={styles.navSubtitle}>
            {templateCount} {t("suggestions.templatesAvailable")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => router.push("/suggestions/summaries" as Href)}
      >
        <Ionicons name="reader-outline" size={24} color={colors.primary} />
        <View style={styles.navText}>
          <Text style={styles.navTitle}>{t("suggestions.summaries")}</Text>
          <Text style={styles.navSubtitle}>
            {summaryCount} {t("suggestions.summariesSaved")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => router.push("/suggestions/settings" as Href)}
      >
        <Ionicons name="settings-outline" size={24} color={colors.primary} />
        <View style={styles.navText}>
          <Text style={styles.navTitle}>{t("suggestions.settings")}</Text>
          <Text style={styles.navSubtitle}>
            {t("suggestions.settingsDesc")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
