/**
 * AuditLogScreen — AI Actions Journal (DEV-035)
 *
 * View AI audit log:
 *  - Chronological list of all AI actions
 *  - Filter by severity / action type
 *  - Clear log
 *
 * Spec §6.5: Journal actions IA (audit)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAIAdminStore } from "@/stores/ai-admin-store";
import type { AIAuditEntry, AuditSeverity } from "@/types/ai-admin";
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

// ─── Helpers ──────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<AuditSeverity, { icon: string; color: string }> =
  {
    info: { icon: "information-circle", color: "#3B82F6" },
    warning: { icon: "warning", color: "#F59E0B" },
    error: { icon: "alert-circle", color: "#EF4444" },
  };

const ACTION_LABELS: Record<string, string> = {
  chat_sent: "💬 Chat envoyé",
  chat_received: "🤖 Réponse IA",
  persona_switched: "🎭 Persona changé",
  memory_added: "🧠 Mémoire ajoutée",
  memory_deleted: "🗑️ Mémoire supprimée",
  provider_changed: "🔄 Provider changé",
  tool_used: "🔧 Outil utilisé",
  moderation_triggered: "🛡️ Modération déclenchée",
  summary_generated: "📝 Résumé généré",
  permission_changed: "🔐 Permission modifiée",
};

// ─── Audit Entry Card ─────────────────────────────────────────

interface AuditCardProps {
  entry: AIAuditEntry;
  colors: ReturnType<typeof useColors>;
}

function AuditCard({ entry, colors }: AuditCardProps) {
  const sev = SEVERITY_CONFIG[entry.severity];
  const label = ACTION_LABELS[entry.action] || entry.action;

  return (
    <View style={[styles.auditCard, { backgroundColor: colors.surface }]}>
      <View style={styles.auditHeader}>
        <Ionicons name={sev.icon as any} size={18} color={sev.color} />
        <Text style={[styles.auditAction, { color: colors.text }]}>
          {label}
        </Text>
        <Text style={[styles.auditTime, { color: colors.textMuted }]}>
          {new Date(entry.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text
        style={[styles.auditDetails, { color: colors.textMuted }]}
        numberOfLines={2}
      >
        {entry.details}
      </Text>
      {entry.tokensUsed > 0 && (
        <Text style={[styles.auditTokens, { color: colors.textMuted }]}>
          🪙 {entry.tokensUsed} tokens
        </Text>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function AuditLogScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { auditLog, auditEnabled, toggleAudit, clearAuditLog } =
    useAIAdminStore();

  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "all">(
    "all",
  );

  const filtered = useMemo(
    () =>
      severityFilter === "all"
        ? auditLog
        : auditLog.filter((e) => e.severity === severityFilter),
    [auditLog, severityFilter],
  );

  const handleClear = useCallback(() => {
    Alert.alert(t("aiAdmin.clearAudit"), t("aiAdmin.clearAuditMsg"), [
      { text: t("aiAdmin.cancel"), style: "cancel" },
      {
        text: t("aiAdmin.clear"),
        style: "destructive",
        onPress: clearAuditLog,
      },
    ]);
  }, [clearAuditLog, t]);

  const renderEntry = useCallback(
    ({ item }: { item: AIAuditEntry }) => (
      <AuditCard entry={item} colors={colors} />
    ),
    [colors],
  );

  const severities: (AuditSeverity | "all")[] = [
    "all",
    "info",
    "warning",
    "error",
  ];

  return (
    <View
      testID="audit-log-screen"
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
                {t("aiAdmin.auditEnabled")}
              </Text>
              <Switch
                testID="audit-toggle"
                value={auditEnabled}
                onValueChange={toggleAudit}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>

            {/* Severity filter */}
            <View style={styles.filterRow}>
              {severities.map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        severityFilter === sev
                          ? colors.primary
                          : colors.surface,
                    },
                  ]}
                  onPress={() => setSeverityFilter(sev)}
                >
                  <Text
                    style={{
                      color: severityFilter === sev ? "#fff" : colors.text,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {sev === "all" ? t("aiAdmin.all") : sev}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clear */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                testID="clear-audit-btn"
                style={[styles.clearBtn, { borderColor: colors.error + "40" }]}
                onPress={handleClear}
              >
                <Ionicons name="trash-outline" size={14} color={colors.error} />
                <Text style={[styles.clearBtnText, { color: colors.error }]}>
                  {t("aiAdmin.clearAudit")}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.countText, { color: colors.textMuted }]}>
                {filtered.length} {t("aiAdmin.entries")}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📋</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("aiAdmin.noAudit")}
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
  list: { gap: 8, paddingBottom: 40 },
  header: { gap: 10, marginBottom: 8 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
  },
  toggleLabel: { fontSize: 15, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearBtnText: { fontSize: 12, fontWeight: "600" },
  countText: { fontSize: 12 },
  auditCard: { padding: 12, borderRadius: 10, gap: 6 },
  auditHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  auditAction: { fontSize: 13, fontWeight: "600", flex: 1 },
  auditTime: { fontSize: 11 },
  auditDetails: { fontSize: 12, lineHeight: 16 },
  auditTokens: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14 },
});
