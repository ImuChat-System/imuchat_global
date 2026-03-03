/**
 * AutoSummaryScreen — Auto-Summary Settings (DEV-035)
 *
 * Configure automatic conversation summaries:
 *  - Enable/disable
 *  - Frequency (after each, daily, weekly, manual)
 *  - Length (short, medium, long)
 *  - Language
 *  - Include key points / action items
 *  - Notifications
 *
 * Spec §6.7: Paramétrage résumé automatique
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAIAdminStore } from "@/stores/ai-admin-store";
import type {
  SummaryFrequency,
  SummaryLanguage,
  SummaryLength,
} from "@/types/ai-admin";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Option Picker ────────────────────────────────────────────

interface OptionPickerProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
  colors: ReturnType<typeof useColors>;
}

function OptionPicker<T extends string>({
  label,
  options,
  selected,
  onSelect,
  colors,
}: OptionPickerProps<T>) {
  return (
    <View style={styles.pickerContainer}>
      <Text style={[styles.pickerLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.pickerRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.pickerChip,
              {
                backgroundColor:
                  selected === opt.value ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => onSelect(opt.value)}
          >
            <Text
              style={{
                color: selected === opt.value ? "#fff" : colors.text,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
}

function ToggleRow({ label, value, onToggle, colors }: ToggleRowProps) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: colors.surface }]}>
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function AutoSummaryScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { autoSummary, updateAutoSummary } = useAIAdminStore();

  const frequencyOptions: { value: SummaryFrequency; label: string }[] = [
    { value: "after_each", label: t("aiAdmin.freqAfterEach") },
    { value: "daily", label: t("aiAdmin.freqDaily") },
    { value: "weekly", label: t("aiAdmin.freqWeekly") },
    { value: "manual", label: t("aiAdmin.freqManual") },
  ];

  const lengthOptions: { value: SummaryLength; label: string }[] = [
    { value: "short", label: t("aiAdmin.lengthShort") },
    { value: "medium", label: t("aiAdmin.lengthMedium") },
    { value: "long", label: t("aiAdmin.lengthLong") },
  ];

  const languageOptions: { value: SummaryLanguage; label: string }[] = [
    { value: "auto", label: t("aiAdmin.langAuto") },
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
  ];

  return (
    <ScrollView
      testID="auto-summary-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { padding: spacing.md }]}
    >
      {/* Master toggle */}
      <ToggleRow
        label={t("aiAdmin.autoSummaryEnable")}
        value={autoSummary.enabled}
        onToggle={(v) => updateAutoSummary({ enabled: v })}
        colors={colors}
      />

      {/* Frequency */}
      <OptionPicker
        label={t("aiAdmin.frequency")}
        options={frequencyOptions}
        selected={autoSummary.frequency}
        onSelect={(v) => updateAutoSummary({ frequency: v })}
        colors={colors}
      />

      {/* Length */}
      <OptionPicker
        label={t("aiAdmin.summaryLength")}
        options={lengthOptions}
        selected={autoSummary.length}
        onSelect={(v) => updateAutoSummary({ length: v })}
        colors={colors}
      />

      {/* Language */}
      <OptionPicker
        label={t("aiAdmin.summaryLanguage")}
        options={languageOptions}
        selected={autoSummary.language}
        onSelect={(v) => updateAutoSummary({ language: v })}
        colors={colors}
      />

      {/* Options */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("aiAdmin.options")}
      </Text>

      <ToggleRow
        label={t("aiAdmin.includeKeyPoints")}
        value={autoSummary.includeKeyPoints}
        onToggle={(v) => updateAutoSummary({ includeKeyPoints: v })}
        colors={colors}
      />

      <ToggleRow
        label={t("aiAdmin.includeActionItems")}
        value={autoSummary.includeActionItems}
        onToggle={(v) => updateAutoSummary({ includeActionItems: v })}
        colors={colors}
      />

      <ToggleRow
        label={t("aiAdmin.notifyOnComplete")}
        value={autoSummary.notifyOnComplete}
        onToggle={(v) => updateAutoSummary({ notifyOnComplete: v })}
        colors={colors}
      />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 14, paddingBottom: 40 },
  pickerContainer: { gap: 6 },
  pickerLabel: { fontSize: 14, fontWeight: "600" },
  pickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
  },
  toggleLabel: { fontSize: 14, fontWeight: "500", flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 8 },
});
