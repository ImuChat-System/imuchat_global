/**
 * Engagement Screen (DEV-036)
 *
 * Daily active minutes, sessions, retention, peak usage times.
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
import type { DataPoint } from "@/types/analytics-insights";

export default function EngagementScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { engagement, isLoading, fetchEngagement } =
    useAnalyticsInsightsStore();

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  if (isLoading && !engagement) {
    return (
      <View
        testID="engagement-screen"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="engagement-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Key Metrics Row ──────────────────────────────── */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {engagement?.averageSessionLength ?? 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.avgSession")}
          </Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: "#22c55e" }]}>
            {engagement?.totalSessions ?? 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.sessionsPerDay")}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: "#f5a623" }]}>
            {engagement?.longestSession ?? 0} min
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.dailyMinutes")}
          </Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: "#8B5CF6" }]}>
            {engagement?.peakHour ?? "-"}h
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.peakHour")}
          </Text>
        </View>
      </View>

      {/* ── Peak Day ──────────────────────────────────────── */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Text style={{ fontSize: 22 }}>📅</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t("analyticsInsights.peakDay")}
          </Text>
          <Text style={[styles.infoValue, { color: colors.primary }]}>
            {engagement?.peakDay ?? "-"}
          </Text>
        </View>
      </View>

      {/* ── Daily Breakdown (simple bar chart) ───────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.dailyBreakdown")}
      </Text>

      {engagement?.dailyActiveMinutes?.map((point: DataPoint, idx: number) => {
        const maxVal = Math.max(
          ...(engagement.dailyActiveMinutes?.map((d: DataPoint) => d.value) ?? [
            1,
          ]),
        );
        const pct = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
        return (
          <View key={idx} style={styles.barRow}>
            <Text style={[styles.barLabel, { color: colors.textMuted }]}>
              {point.date.slice(5)}
            </Text>
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${pct}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.barValue, { color: colors.text }]}>
              {point.value}m
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  metricCard: { flex: 1, padding: 16, borderRadius: 10, alignItems: "center" },
  metricValue: { fontSize: 26, fontWeight: "800" },
  metricLabel: { fontSize: 12, marginTop: 4, textAlign: "center" },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 6,
  },
  infoTitle: { fontSize: 14, fontWeight: "600" },
  infoValue: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  barLabel: { width: 40, fontSize: 12, textAlign: "right" },
  barTrack: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden" },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { width: 40, fontSize: 12 },
});
