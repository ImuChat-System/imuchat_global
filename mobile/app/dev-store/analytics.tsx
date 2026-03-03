/**
 * AnalyticsScreen — Developer Analytics Dashboard (DEV-034)
 *
 * Shows: overview stats, downloads trend, revenue, per-app breakdown.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { AnalyticsPeriod } from "@/types/dev-store";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "7j" },
  { value: "30d", label: "30j" },
  { value: "90d", label: "90j" },
  { value: "1y", label: "1an" },
  { value: "all", label: "Tout" },
];

export default function AnalyticsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    analyticsOverview,
    analyticsLoading,
    analyticsPeriod,
    fetchAnalyticsOverview,
    setAnalyticsPeriod,
  } = useDevStore();

  useEffect(() => {
    fetchAnalyticsOverview();
  }, [fetchAnalyticsOverview]);

  const onRefresh = useCallback(() => {
    fetchAnalyticsOverview(analyticsPeriod);
  }, [fetchAnalyticsOverview, analyticsPeriod]);

  const handlePeriod = useCallback(
    (p: AnalyticsPeriod) => {
      setAnalyticsPeriod(p);
      fetchAnalyticsOverview(p);
    },
    [setAnalyticsPeriod, fetchAnalyticsOverview],
  );

  const ov = analyticsOverview;

  return (
    <ScrollView
      testID="analytics-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={analyticsLoading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* ── Period Selector ─────────────────────────────────── */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.periodBtn,
              {
                backgroundColor:
                  analyticsPeriod === p.value
                    ? colors.primary + "20"
                    : colors.surface,
                borderColor:
                  analyticsPeriod === p.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handlePeriod(p.value)}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color:
                  analyticsPeriod === p.value ? colors.primary : colors.text,
              }}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {analyticsLoading && !ov ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 60 }}
        />
      ) : (
        <>
          {/* ── Overview Cards ──────────────────────────────── */}
          <View style={styles.statsGrid}>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {ov?.total_downloads ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("devStore.downloads")}
              </Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: "#22c55e" }]}>
                {(ov?.total_revenue ?? 0).toFixed(2)} €
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("devStore.revenue")}
              </Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: "#f5a623" }]}>
                {(ov?.pending_payout ?? 0).toFixed(2)} €
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("devStore.pendingPayout")}
              </Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                ⭐ {(ov?.avg_rating ?? 0).toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("devStore.avgRating")}
              </Text>
            </View>
          </View>

          {/* ── Summary cards ──────────────────────────────── */}
          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {t("devStore.publishedApps")}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {ov?.total_apps ?? 0}
            </Text>
          </View>

          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {t("devStore.publishedThemes")}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {ov?.total_themes ?? 0}
            </Text>
          </View>

          {/* ── Trend placeholder ──────────────────────────── */}
          <View
            style={[
              styles.trendCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.trendTitle, { color: colors.text }]}>
              📈 {t("devStore.downloadsTrend")}
            </Text>
            {(ov?.downloads_trend?.length ?? 0) === 0 ? (
              <Text style={[styles.trendEmpty, { color: colors.textMuted }]}>
                {t("devStore.noTrendData")}
              </Text>
            ) : (
              <View style={styles.trendBars}>
                {ov!.downloads_trend.map((dp, i) => (
                  <View
                    key={i}
                    style={[
                      styles.trendBar,
                      {
                        backgroundColor: colors.primary,
                        height: Math.max(4, dp.value * 2),
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          <View
            style={[
              styles.trendCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.trendTitle, { color: colors.text }]}>
              💰 {t("devStore.revenueTrend")}
            </Text>
            {(ov?.revenue_trend?.length ?? 0) === 0 ? (
              <Text style={[styles.trendEmpty, { color: colors.textMuted }]}>
                {t("devStore.noTrendData")}
              </Text>
            ) : (
              <View style={styles.trendBars}>
                {ov!.revenue_trend.map((dp, i) => (
                  <View
                    key={i}
                    style={[
                      styles.trendBar,
                      {
                        backgroundColor: "#22c55e",
                        height: Math.max(4, dp.value * 2),
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  periodRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  periodBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: "47%",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 12, marginTop: 4 },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  summaryTitle: { fontSize: 14, fontWeight: "600" },
  summaryValue: { fontSize: 18, fontWeight: "800" },
  trendCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12 },
  trendTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  trendEmpty: { fontSize: 13 },
  trendBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 60,
  },
  trendBar: { flex: 1, borderRadius: 2 },
});
