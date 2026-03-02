/**
 * Paramètres des Suggestions Intelligentes
 *
 * Permet de configurer :
 *  - Smart Reply (on/off, LLM vs local)
 *  - Auto-complétion (on/off)
 *  - Détection de ton (on/off, afficher confiance)
 *  - Préférences : ton préféré, longueur, langue
 *  - Nombre max de suggestions
 *  - Réinitialisation du cache
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import { useSuggestions } from "@/hooks/useSuggestions";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { ToneCategory } from "@/types/suggestions";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** Extracted outside parent to avoid remount on every render */
const SwitchRow = ({
  icon,
  iconColor,
  label,
  desc,
  value,
  onValueChange,
  isLast,
  styles,
  colors,
}: {
  icon: string;
  iconColor?: string;
  label: string;
  desc?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
  styles: Record<string, any>;
  colors: ReturnType<typeof import("@/providers/ThemeProvider").useColors>;
}) => (
  <View style={[styles.row, isLast && styles.rowLast]}>
    <View style={styles.rowLeft}>
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={20}
        color={iconColor || colors.primary}
        style={styles.rowIcon}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {desc ? <Text style={styles.rowDesc}>{desc}</Text> : null}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary + "80" }}
      thumbColor={value ? colors.primary : "#f4f3f4"}
    />
  </View>
);

export default function SuggestionsSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { preferences, updatePreferences, stats, acceptanceRate, reset } =
    useSuggestions();

  const handleReset = useCallback(() => {
    Alert.alert(t("suggestions.resetTitle"), t("suggestions.resetConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("suggestions.reset"), style: "destructive", onPress: reset },
    ]);
  }, []);

  const toneOptions = [
    {
      value: "casual",
      label: t("suggestions.tone.casual"),
      icon: "chatbubble-ellipses-outline",
    },
    {
      value: "formal",
      label: t("suggestions.tone.formal"),
      icon: "briefcase-outline",
    },
    {
      value: "friendly",
      label: t("suggestions.tone.friendly"),
      icon: "heart-outline",
    },
    {
      value: "professional",
      label: t("suggestions.tone.professional"),
      icon: "business-outline",
    },
  ];

  const lengthOptions = [
    { value: "short", label: t("suggestions.length.short") },
    { value: "medium", label: t("suggestions.length.medium") },
    { value: "long", label: t("suggestions.length.long") },
  ];

  const languageOptions = [
    { value: "fr", label: "🇫🇷 Français" },
    { value: "en", label: "🇬🇧 English" },
    { value: "ja", label: "🇯🇵 日本語" },
  ];

  const maxSuggestionsOptions = [1, 2, 3, 4, 5];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    rowIcon: { marginRight: 12 },
    rowLabel: { fontSize: 15, color: colors.text },
    rowDesc: { fontSize: 12, color: colors.secondary, marginTop: 2 },
    optionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      paddingBottom: 14,
      gap: 8,
    },
    optionChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionChipActive: {
      backgroundColor: colors.primary + "15",
      borderColor: colors.primary,
    },
    optionText: { fontSize: 13, color: colors.secondary },
    optionTextActive: { color: colors.primary, fontWeight: "600" },
    countRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    countBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    countText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      minWidth: 24,
      textAlign: "center",
    },
    statsCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    statLabel: { fontSize: 14, color: colors.secondary },
    statValue: { fontSize: 14, fontWeight: "600", color: colors.text },
    resetBtn: {
      backgroundColor: "#F443361A",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 12,
    },
    resetText: { fontSize: 15, fontWeight: "600", color: "#F44336" },
    footer: { height: 40 },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* === Smart Reply === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("suggestions.smartReply")}</Text>
        <View style={styles.card}>
          <SwitchRow
            icon="flash-outline"
            label={t("suggestions.enableSmartReply")}
            desc={t("suggestions.enableSmartReplyDesc")}
            value={preferences.smart_reply_enabled}
            onValueChange={(v) => updatePreferences({ smart_reply_enabled: v })}
            styles={styles}
            colors={colors}
          />
          <SwitchRow
            icon="cloud-outline"
            iconColor="#FF9800"
            label={t("suggestions.useLLM")}
            desc={t("suggestions.useLLMDesc")}
            value={preferences.use_llm}
            onValueChange={(v) => updatePreferences({ use_llm: v })}
            isLast
            styles={styles}
            colors={colors}
          />
        </View>
      </View>

      {/* === Auto-Completion === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("suggestions.autoCompletion")}
        </Text>
        <View style={styles.card}>
          <SwitchRow
            icon="text-outline"
            label={t("suggestions.enableAutoCompletion")}
            desc={t("suggestions.enableAutoCompletionDesc")}
            value={preferences.auto_completion_enabled}
            onValueChange={(v) =>
              updatePreferences({ auto_completion_enabled: v })
            }
            isLast
            styles={styles}
            colors={colors}
          />
        </View>
      </View>

      {/* === Tone Detection === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("suggestions.toneDetection")}
        </Text>
        <View style={styles.card}>
          <SwitchRow
            icon="pulse-outline"
            label={t("suggestions.enableToneDetection")}
            desc={t("suggestions.enableToneDetectionDesc")}
            value={preferences.tone_detection_enabled}
            onValueChange={(v) =>
              updatePreferences({ tone_detection_enabled: v })
            }
            styles={styles}
            colors={colors}
          />
          <SwitchRow
            icon="analytics-outline"
            label={t("suggestions.showConfidence")}
            desc={t("suggestions.showConfidenceDesc")}
            value={preferences.show_confidence}
            onValueChange={(v) => updatePreferences({ show_confidence: v })}
            isLast
            styles={styles}
            colors={colors}
          />
        </View>
      </View>

      {/* === Preferred Tone === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("suggestions.preferredTone")}
        </Text>
        <View style={styles.card}>
          <View style={[styles.optionsRow, { paddingTop: 14 }]}>
            {toneOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  preferences.preferred_tone === opt.value &&
                    styles.optionChipActive,
                ]}
                onPress={() =>
                  updatePreferences({
                    preferred_tone: opt.value as ToneCategory,
                  })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences.preferred_tone === opt.value &&
                      styles.optionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* === Preferred Length === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("suggestions.preferredLength")}
        </Text>
        <View style={styles.card}>
          <View style={[styles.optionsRow, { paddingTop: 14 }]}>
            {lengthOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  preferences.preferred_length === opt.value &&
                    styles.optionChipActive,
                ]}
                onPress={() =>
                  updatePreferences({
                    preferred_length: opt.value as "short" | "medium" | "long",
                  })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences.preferred_length === opt.value &&
                      styles.optionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* === Language === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("suggestions.language")}</Text>
        <View style={styles.card}>
          <View style={[styles.optionsRow, { paddingTop: 14 }]}>
            {languageOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  preferences.language === opt.value && styles.optionChipActive,
                ]}
                onPress={() => updatePreferences({ language: opt.value })}
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences.language === opt.value &&
                      styles.optionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* === Max Suggestions === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("suggestions.maxSuggestions")}
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="layers-outline"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={styles.rowLabel}>
                {t("suggestions.maxSuggestionsLabel")}
              </Text>
            </View>
            <View style={styles.countRow}>
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => {
                  const c = Math.max(1, preferences.max_suggestions - 1);
                  updatePreferences({ max_suggestions: c });
                }}
              >
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.countText}>
                {preferences.max_suggestions}
              </Text>
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => {
                  const c = Math.min(5, preferences.max_suggestions + 1);
                  updatePreferences({ max_suggestions: c });
                }}
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* === Statistics === */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("suggestions.statistics")}</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {t("suggestions.totalShown")}
              </Text>
              <Text style={styles.statValue}>
                {stats.total_suggestions_shown}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t("suggestions.totalUsed")}</Text>
              <Text style={styles.statValue}>
                {stats.total_suggestions_used}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {t("suggestions.acceptanceRate")}
              </Text>
              <Text style={styles.statValue}>{acceptanceRate}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {t("suggestions.summariesGenerated")}
              </Text>
              <Text style={styles.statValue}>{stats.summaries_generated}</Text>
            </View>
            <View style={[styles.statRow, { marginBottom: 0 }]}>
              <Text style={styles.statLabel}>
                {t("suggestions.templatesUsed")}
              </Text>
              <Text style={styles.statValue}>{stats.templates_used}</Text>
            </View>
          </View>
        </View>
      )}

      {/* === Reset === */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>{t("suggestions.resetAll")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}
