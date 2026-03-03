/**
 * Communication Screen (DEV-036)
 *
 * Messages & calls breakdown, top contacts, trends.
 */
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAnalyticsInsightsStore } from "@/stores/analytics-insights-store";

const TYPE_COLORS: Record<string, string> = {
  text: "#3b82f6",
  image: "#22c55e",
  video: "#f5a623",
  audio: "#8B5CF6",
  file: "#64748b",
  sticker: "#ec4899",
};

export default function CommunicationScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { communication, isLoading, fetchCommunication } =
    useAnalyticsInsightsStore();

  useEffect(() => {
    fetchCommunication();
  }, [fetchCommunication]);

  if (isLoading && !communication) {
    return (
      <View
        testID="communication-screen"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="communication-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Messages Summary ─────────────────────────────── */}
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardValue, { color: "#3b82f6" }]}>
            {communication?.messagesSent?.toLocaleString() ?? "0"}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.sent")}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardValue, { color: "#22c55e" }]}>
            {communication?.messagesReceived?.toLocaleString() ?? "0"}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.received")}
          </Text>
        </View>
      </View>

      {/* ── Calls Summary ────────────────────────────────── */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Text style={{ fontSize: 22 }}>📞</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t("analyticsInsights.callsTotal")}
          </Text>
          <Text style={[styles.infoSub, { color: colors.textMuted }]}>
            {communication?.callsMade ?? 0} {t("analyticsInsights.made")} ·{" "}
            {communication?.callsReceived ?? 0}{" "}
            {t("analyticsInsights.receivedCalls")}
          </Text>
        </View>
        <Text style={[styles.durationText, { color: colors.primary }]}>
          {communication?.totalCallMinutes ?? 0} min
        </Text>
      </View>

      {/* ── By Type Breakdown ────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.byType")}
      </Text>

      {communication?.messagesByType
        ? Object.entries(communication.messagesByType).map(([type, count]) => {
            const total =
              Object.values(communication.messagesByType).reduce(
                (s: number, b: number) => s + b,
                0,
              ) || 1;
            const pct =
              total > 0 ? Math.round(((count as number) / total) * 100) : 0;
            return (
              <View key={type} style={styles.typeRow}>
                <View
                  style={[
                    styles.typeDot,
                    { backgroundColor: TYPE_COLORS[type] ?? colors.primary },
                  ]}
                />
                <Text style={[styles.typeLabel, { color: colors.text }]}>
                  {t(`analyticsInsights.type_${type}`)}
                </Text>
                <View
                  style={[styles.typeBar, { backgroundColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.typeFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: TYPE_COLORS[type] ?? colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.typeCount, { color: colors.textMuted }]}>
                  {count as number}
                </Text>
              </View>
            );
          })
        : null}

      {/* ── Top Contacts ─────────────────────────────────── */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}
      >
        {t("analyticsInsights.topContacts")}
      </Text>

      {communication?.topContacts?.map((contact, idx) => (
        <View
          key={contact.id}
          style={[styles.contactRow, { backgroundColor: colors.surface }]}
        >
          <View
            style={[
              styles.contactAvatar,
              { backgroundColor: colors.primary + "25" },
            ]}
          >
            <Text style={[styles.contactInitial, { color: colors.primary }]}>
              {contact.name.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactName, { color: colors.text }]}>
              {contact.name}
            </Text>
            <Text style={[styles.contactSub, { color: colors.textMuted }]}>
              {contact.messagesCount} {t("analyticsInsights.messages")}
            </Text>
          </View>
          <Text style={[styles.rankBadge, { color: colors.textMuted }]}>
            #{idx + 1}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row", gap: 10, marginBottom: 12 },
  card: { flex: 1, padding: 16, borderRadius: 10, alignItems: "center" },
  cardValue: { fontSize: 24, fontWeight: "800" },
  cardLabel: { fontSize: 12, marginTop: 4 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: { fontSize: 15, fontWeight: "700" },
  infoSub: { fontSize: 12, marginTop: 2 },
  durationText: { fontSize: 16, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  typeLabel: { width: 60, fontSize: 13 },
  typeBar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  typeFill: { height: 8, borderRadius: 4 },
  typeCount: { width: 40, fontSize: 12, textAlign: "right" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInitial: { fontSize: 16, fontWeight: "700" },
  contactName: { fontSize: 14, fontWeight: "600" },
  contactSub: { fontSize: 12, marginTop: 1 },
  rankBadge: { fontSize: 14, fontWeight: "700" },
});
