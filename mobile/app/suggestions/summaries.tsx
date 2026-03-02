/**
 * Historique des Résumés de Conversations
 *
 * Affiche les résumés générés, avec :
 *  - Points clés et sujets
 *  - Points d'action
 *  - Filtrage par sentiment
 *  - Génération de nouveaux résumés
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import { useSuggestions } from "@/hooks/useSuggestions";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { ConversationSummary } from "@/types/suggestions";
import { SummaryLength } from "@/types/suggestions";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SummariesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    summaries,
    hasSummaries,
    isGeneratingSummary,
    generateSummary,
    deleteSummary,
    loadSummaries,
  } = useSuggestions();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [convName, setConvName] = useState("");
  const [msgCount, setMsgCount] = useState("50");
  const [summaryLength, setSummaryLength] = useState<SummaryLength>(
    SummaryLength.MEDIUM,
  );

  useEffect(() => {
    loadSummaries();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!convName.trim()) return;
    const count = parseInt(msgCount, 10) || 50;
    setShowGenerateModal(false);
    await generateSummary(
      "conv_" + Date.now(),
      count,
      summaryLength as SummaryLength,
    );
    setConvName("");
    setMsgCount("50");
  }, [convName, msgCount, summaryLength]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      t("suggestions.deleteSummary"),
      t("suggestions.deleteSummaryConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteSummary(id),
        },
      ],
    );
  }, []);

  const sentimentConfig: Record<string, { icon: string; color: string }> = {
    positive: { icon: "happy-outline", color: "#4CAF50" },
    negative: { icon: "sad-outline", color: "#F44336" },
    neutral: { icon: "remove-outline", color: "#9E9E9E" },
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text, flex: 1 },
    cardDate: { fontSize: 11, color: colors.textMuted },
    summary: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 21,
      marginTop: 10,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
      marginTop: 12,
      marginBottom: 6,
    },
    keyPoint: {
      fontSize: 13,
      color: colors.textMuted,
      paddingLeft: 8,
      marginBottom: 4,
    },
    topicChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.primary + "15",
      marginRight: 6,
      marginBottom: 6,
    },
    topicText: { fontSize: 12, color: colors.primary },
    topicsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
    actionItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    actionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    actionText: { fontSize: 13, color: colors.text, flex: 1 },
    actionAssignee: { fontSize: 11, color: colors.textMuted },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      gap: 12,
    },
    metaItem: { flexDirection: "row", alignItems: "center" },
    metaText: { fontSize: 12, color: colors.textMuted, marginLeft: 4 },
    deleteBtn: { padding: 6 },
    expandBtn: { padding: 6 },
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
    emptyText: {
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 60,
      fontSize: 15,
    },
    emptyIcon: { textAlign: "center", marginTop: 40 },
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
    lengthRow: { flexDirection: "row", marginBottom: 12 },
    lengthBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 8,
      backgroundColor: colors.background,
      marginHorizontal: 4,
    },
    lengthBtnActive: { backgroundColor: colors.primary },
    lengthText: { fontSize: 13, color: colors.textMuted },
    lengthTextActive: { color: "#fff", fontWeight: "600" },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },
    modalBtn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 8,
      marginLeft: 10,
    },
    generating: { alignItems: "center", padding: 20 },
    generatingText: {
      color: colors.textMuted,
      marginTop: 10,
      fontSize: 14,
    },
  });

  const priorityColors: Record<string, string> = {
    high: "#F44336",
    medium: "#FF9800",
    low: "#4CAF50",
  };

  const renderSummary = ({ item }: { item: ConversationSummary }) => {
    const isExpanded = expandedId === item.id;
    const sentConf = sentimentConfig[item.sentiment] || sentimentConfig.neutral;
    const dateStr = new Date(item.created_at).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name={sentConf.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={sentConf.color}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.conversation_name}
          </Text>
          <Text style={styles.cardDate}>{dateStr}</Text>
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setExpandedId(isExpanded ? null : item.id)}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.summary} numberOfLines={isExpanded ? undefined : 3}>
          {item.summary}
        </Text>

        {isExpanded && (
          <>
            {/* Key Points */}
            {item.key_points && item.key_points.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>
                  {t("suggestions.keyPoints")}
                </Text>
                {item.key_points.map((point, idx) => (
                  <Text key={idx} style={styles.keyPoint}>
                    • {point}
                  </Text>
                ))}
              </>
            )}

            {/* Topics */}
            {item.topics && item.topics.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>
                  {t("suggestions.topics")}
                </Text>
                <View style={styles.topicsRow}>
                  {item.topics.map((topic, idx) => (
                    <View key={idx} style={styles.topicChip}>
                      <Text style={styles.topicText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Action Items */}
            {item.action_items && item.action_items.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>
                  {t("suggestions.actionItems")}
                </Text>
                {item.action_items.map((action) => (
                  <View key={action.id} style={styles.actionItem}>
                    <View
                      style={[
                        styles.actionDot,
                        {
                          backgroundColor:
                            priorityColors[action.priority] || "#FF9800",
                        },
                      ]}
                    />
                    <Text style={styles.actionText}>{action.text}</Text>
                    {action.assignee && (
                      <Text style={styles.actionAssignee}>
                        → {action.assignee}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.metaText}>
                  {item.message_count} messages
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.metaText}>
                  {item.participants?.length || 0} participants
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#F44336" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Generating indicator */}
      {isGeneratingSummary && (
        <View style={styles.generating}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.generatingText}>
            {t("suggestions.generating")}
          </Text>
        </View>
      )}

      <FlatList
        data={summaries}
        keyExtractor={(item) => item.id}
        renderItem={renderSummary}
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>{t("suggestions.noSummaries")}</Text>
          </View>
        }
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowGenerateModal(true)}
      >
        <Ionicons name="sparkles" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Generate Modal */}
      <Modal visible={showGenerateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("suggestions.newSummary")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("suggestions.conversationName")}
              placeholderTextColor={colors.textMuted}
              value={convName}
              onChangeText={setConvName}
            />
            <TextInput
              style={styles.input}
              placeholder={t("suggestions.messageCount")}
              placeholderTextColor={colors.textMuted}
              value={msgCount}
              onChangeText={setMsgCount}
              keyboardType="numeric"
            />
            <Text
              style={{
                fontSize: 13,
                color: colors.textMuted,
                marginBottom: 8,
              }}
            >
              {t("suggestions.summaryLength")}
            </Text>
            <View style={styles.lengthRow}>
              {["short", "medium", "long"].map((len) => (
                <TouchableOpacity
                  key={len}
                  style={[
                    styles.lengthBtn,
                    summaryLength === len && styles.lengthBtnActive,
                  ]}
                  onPress={() => setSummaryLength(len as SummaryLength)}
                >
                  <Text
                    style={[
                      styles.lengthText,
                      summaryLength === len && styles.lengthTextActive,
                    ]}
                  >
                    {t("suggestions.length." + len)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => setShowGenerateModal(false)}
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
                    opacity: !convName.trim() ? 0.5 : 1,
                  },
                ]}
                onPress={handleGenerate}
                disabled={!convName.trim()}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {t("suggestions.generate")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
