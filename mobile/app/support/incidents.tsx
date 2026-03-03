/**
 * Incidents Platform Screen — Statut incidents plateforme
 *
 * Features:
 * - Active incidents with severity badges
 * - Incident timeline with updates
 * - Affected services list
 * - Resolved incidents history
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { IncidentSeverity, IncidentStatus } from "@/types/support";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SEVERITY_CONFIG: Record<
  IncidentSeverity,
  { color: string; icon: string; emoji: string }
> = {
  minor: { color: "#F59E0B", icon: "alert-circle-outline", emoji: "🟡" },
  major: { color: "#F97316", icon: "warning-outline", emoji: "🟠" },
  critical: { color: "#EF4444", icon: "flame-outline", emoji: "🔴" },
};

const STATUS_CONFIG: Record<IncidentStatus, { color: string; label: string }> =
  {
    investigating: { color: "#EF4444", label: "Investigating" },
    identified: { color: "#F59E0B", label: "Identified" },
    monitoring: { color: "#3B82F6", label: "Monitoring" },
    resolved: { color: "#10B981", label: "Resolved" },
  };

export default function IncidentsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { incidents } = useSupport();
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeIncidents = useMemo(
    () => incidents.filter((i) => i.status !== "resolved"),
    [incidents],
  );

  const resolvedIncidents = useMemo(
    () => incidents.filter((i) => i.status === "resolved"),
    [incidents],
  );

  const allOk = activeIncidents.length === 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Status banner */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: allOk ? "#10B98120" : "#EF444420" },
        ]}
      >
        <Text style={{ fontSize: 28 }}>{allOk ? "✅" : "⚠️"}</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.bannerTitle,
              { color: allOk ? "#10B981" : "#EF4444" },
            ]}
          >
            {allOk ? t("support.allSystemsOk") : t("support.activeIncidents")}
          </Text>
          <Text style={[styles.bannerSub, { color: colors.textMuted }]}>
            {allOk
              ? t("support.allSystemsOkSub")
              : t("support.activeIncidentsSub", {
                  count: activeIncidents.length,
                })}
          </Text>
        </View>
      </View>

      {/* Active incidents */}
      {activeIncidents.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            {t("support.currentIncidents")}
          </Text>
          {activeIncidents.map((incident) => {
            const sev = SEVERITY_CONFIG[incident.severity];
            const expanded = expandedId === incident.id;
            return (
              <TouchableOpacity
                key={incident.id}
                style={[
                  styles.incidentCard,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => setExpandedId(expanded ? null : incident.id)}
                activeOpacity={0.7}
              >
                <View style={styles.incidentHeader}>
                  <Text style={{ fontSize: 18 }}>{sev.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.incidentTitle, { color: colors.text }]}
                    >
                      {incident.title}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: sev.color + "20" },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: sev.color,
                            fontWeight: "600",
                          }}
                        >
                          {t(`support.severity.${incident.severity}`)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor:
                              STATUS_CONFIG[incident.status].color + "20",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: STATUS_CONFIG[incident.status].color,
                            fontWeight: "600",
                          }}
                        >
                          {t(`support.incidentStatus.${incident.status}`)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.textMuted}
                  />
                </View>

                {/* Affected services */}
                {expanded && (
                  <View style={styles.expandedSection}>
                    <Text
                      style={[styles.subLabel, { color: colors.textMuted }]}
                    >
                      {t("support.affectedServices")}
                    </Text>
                    <View style={styles.serviceRow}>
                      {incident.affectedServices.map((s) => (
                        <View
                          key={s}
                          style={[
                            styles.serviceChip,
                            { backgroundColor: colors.background },
                          ]}
                        >
                          <Text
                            style={[styles.serviceText, { color: colors.text }]}
                          >
                            {t(`support.service.${s}`)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Timeline */}
                    <Text
                      style={[
                        styles.subLabel,
                        { color: colors.textMuted, marginTop: 12 },
                      ]}
                    >
                      {t("support.timeline")}
                    </Text>
                    {incident.updates.map((update, idx) => (
                      <View key={update.id} style={styles.timelineItem}>
                        <View
                          style={[
                            styles.timelineDot,
                            {
                              backgroundColor:
                                STATUS_CONFIG[update.status].color,
                            },
                          ]}
                        />
                        {idx < incident.updates.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              { backgroundColor: colors.border },
                            ]}
                          />
                        )}
                        <View style={styles.timelineContent}>
                          <Text
                            style={[
                              styles.timelineStatus,
                              { color: STATUS_CONFIG[update.status].color },
                            ]}
                          >
                            {t(`support.incidentStatus.${update.status}`)}
                          </Text>
                          <Text
                            style={[styles.timelineMsg, { color: colors.text }]}
                          >
                            {update.message}
                          </Text>
                          <Text
                            style={[
                              styles.timelineTime,
                              { color: colors.textMuted },
                            ]}
                          >
                            {new Date(update.createdAt).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* Resolved incidents */}
      <TouchableOpacity
        style={[styles.resolvedToggle, { backgroundColor: colors.surface }]}
        onPress={() => setShowResolved(!showResolved)}
      >
        <Text style={[styles.resolvedLabel, { color: colors.text }]}>
          {t("support.resolvedIncidents")} ({resolvedIncidents.length})
        </Text>
        <Ionicons
          name={showResolved ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {showResolved &&
        resolvedIncidents.map((incident) => (
          <View
            key={incident.id}
            style={[styles.resolvedCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.resolvedTitle, { color: colors.textMuted }]}>
              {incident.title}
            </Text>
            <Text style={[styles.resolvedMeta, { color: colors.textMuted }]}>
              {t(`support.severity.${incident.severity}`)} ·{" "}
              {incident.resolvedAt
                ? new Date(incident.resolvedAt).toLocaleDateString()
                : ""}
            </Text>
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  bannerTitle: { fontSize: 16, fontWeight: "700" },
  bannerSub: { fontSize: 13, marginTop: 2 },
  sectionLabel: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  incidentCard: { borderRadius: 12, padding: 14, gap: 8 },
  incidentHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  incidentTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  badgeRow: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  expandedSection: { paddingTop: 8, gap: 6 },
  subLabel: { fontSize: 12, fontWeight: "600" },
  serviceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  serviceChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  serviceText: { fontSize: 12 },
  timelineItem: { flexDirection: "row", gap: 10, minHeight: 50 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 16,
    bottom: -8,
    width: 2,
  },
  timelineContent: { flex: 1, gap: 2 },
  timelineStatus: { fontSize: 12, fontWeight: "600" },
  timelineMsg: { fontSize: 13, lineHeight: 18 },
  timelineTime: { fontSize: 11 },
  resolvedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  resolvedLabel: { fontSize: 14, fontWeight: "600" },
  resolvedCard: {
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  resolvedTitle: { fontSize: 13, fontWeight: "500" },
  resolvedMeta: { fontSize: 11 },
});
