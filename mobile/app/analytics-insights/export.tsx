/**
 * Export Screen (DEV-036)
 *
 * CSV / JSON export configuration + history list.
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAnalyticsInsightsStore } from "@/stores/analytics-insights-store";
import type {
  ExportFormat,
  ExportScope,
  InsightsPeriod,
} from "@/types/analytics-insights";

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

const SCOPE_OPTIONS: { value: ExportScope; label: string; key: string }[] = [
  { value: "all", label: "Tout", key: "all" },
  { value: "overview", label: "Vue d'ensemble", key: "overview" },
  { value: "engagement", label: "Engagement", key: "engagement" },
  { value: "communication", label: "Communication", key: "communication" },
  { value: "social", label: "Social", key: "social" },
  { value: "storage", label: "Stockage", key: "storage" },
];

const PERIOD_OPTIONS: { value: InsightsPeriod; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "6m", label: "6 mois" },
  { value: "1y", label: "1 an" },
  { value: "all", label: "Tout" },
];

export default function ExportScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { exports, requestExport, deleteExport, clearExports } =
    useAnalyticsInsightsStore();

  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<ExportScope>("all");
  const [period, setPeriod] = useState<InsightsPeriod>("30d");
  const [includePersonal, setIncludePersonal] = useState(false);

  const handleExport = () => {
    requestExport({
      format,
      scope,
      period,
      includePersonalData: includePersonal,
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t("analyticsInsights.deleteExport"),
      t("analyticsInsights.deleteExportConfirm"),
      [
        { text: t("analyticsInsights.cancel"), style: "cancel" },
        {
          text: t("analyticsInsights.delete"),
          style: "destructive",
          onPress: () => deleteExport(id),
        },
      ],
    );
  };

  return (
    <ScrollView
      testID="export-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Format ───────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.exportFormat")}
      </Text>
      <View style={styles.optionRow}>
        {FORMAT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setFormat(opt.value)}
            style={[
              styles.optionBtn,
              {
                backgroundColor:
                  format === opt.value ? colors.primary + "20" : colors.surface,
                borderColor:
                  format === opt.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                fontWeight: "600",
                color: format === opt.value ? colors.primary : colors.text,
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Scope ────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.exportScope")}
      </Text>
      <View style={styles.optionGrid}>
        {SCOPE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setScope(opt.value)}
            style={[
              styles.optionBtn,
              styles.scopeBtn,
              {
                backgroundColor:
                  scope === opt.value ? colors.primary + "20" : colors.surface,
                borderColor:
                  scope === opt.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: scope === opt.value ? colors.primary : colors.text,
              }}
            >
              {t(`analyticsInsights.scope_${opt.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Period ───────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.exportPeriod")}
      </Text>
      <View style={styles.optionRow}>
        {PERIOD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setPeriod(opt.value)}
            style={[
              styles.periodBtn,
              {
                backgroundColor:
                  period === opt.value ? colors.primary + "20" : colors.surface,
                borderColor:
                  period === opt.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: period === opt.value ? colors.primary : colors.text,
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Include Personal Data ────────────────────────── */}
      <View style={[styles.switchRow, { backgroundColor: colors.surface }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {t("analyticsInsights.includePersonal")}
          </Text>
          <Text style={[styles.switchDesc, { color: colors.textMuted }]}>
            {t("analyticsInsights.includePersonalDesc")}
          </Text>
        </View>
        <Switch
          value={includePersonal}
          onValueChange={setIncludePersonal}
          trackColor={{ false: colors.border, true: colors.primary + "60" }}
          thumbColor={includePersonal ? colors.primary : "#ccc"}
        />
      </View>

      {/* ── Export Button ─────────────────────────────────── */}
      <TouchableOpacity
        testID="export-button"
        onPress={handleExport}
        style={[styles.exportBtn, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.exportBtnText}>
          {t("analyticsInsights.startExport")}
        </Text>
      </TouchableOpacity>

      {/* ── Export History ────────────────────────────────── */}
      {exports.length > 0 && (
        <>
          <View style={styles.historyHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginBottom: 0 },
              ]}
            >
              {t("analyticsInsights.exportHistory")}
            </Text>
            <TouchableOpacity onPress={clearExports}>
              <Text
                style={{ color: "#ef4444", fontSize: 13, fontWeight: "600" }}
              >
                {t("analyticsInsights.clearAll")}
              </Text>
            </TouchableOpacity>
          </View>

          {exports.map((exp) => (
            <View
              key={exp.id}
              style={[styles.historyItem, { backgroundColor: colors.surface }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>
                  {exp.format.toUpperCase()} ·{" "}
                  {t(`analyticsInsights.scope_${exp.scope}`)}
                </Text>
                <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                  {new Date(exp.createdAt).toLocaleString()}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      exp.status === "completed"
                        ? "#22c55e20"
                        : exp.status === "failed"
                          ? "#ef444420"
                          : colors.primary + "20",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color:
                      exp.status === "completed"
                        ? "#22c55e"
                        : exp.status === "failed"
                          ? "#ef4444"
                          : colors.primary,
                  }}
                >
                  {t(`analyticsInsights.status_${exp.status}`)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(exp.id)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
  },
  optionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 60,
  },
  scopeBtn: { width: "30%", flexGrow: 1 },
  periodBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    gap: 12,
  },
  switchLabel: { fontSize: 14, fontWeight: "600" },
  switchDesc: { fontSize: 12, marginTop: 2 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  exportBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  historyTitle: { fontSize: 14, fontWeight: "600" },
  historyDate: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
