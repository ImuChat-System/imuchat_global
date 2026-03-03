/**
 * Analytics & Insights Hub (DEV-036)
 *
 * Overview dashboard with key metrics and navigation cards to sub-sections.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAnalyticsInsightsStore } from "@/stores/analytics-insights-store";
import type { InsightsPeriod } from "@/types/analytics-insights";

const PERIODS: { value: InsightsPeriod; label: string }[] = [
  { value: "7d", label: "7j" },
  { value: "30d", label: "30j" },
  { value: "90d", label: "90j" },
  { value: "6m", label: "6m" },
  { value: "1y", label: "1an" },
];

interface NavCard {
  key: string;
  emoji: string;
  route: string;
  titleKey: string;
  subtitleKey: string;
}

const NAV_CARDS: NavCard[] = [
  {
    key: "engagement",
    emoji: "📊",
    route: "/analytics-insights/engagement",
    titleKey: "analyticsInsights.engagement",
    subtitleKey: "analyticsInsights.engagementDesc",
  },
  {
    key: "communication",
    emoji: "💬",
    route: "/analytics-insights/communication",
    titleKey: "analyticsInsights.communication",
    subtitleKey: "analyticsInsights.communicationDesc",
  },
  {
    key: "social",
    emoji: "👥",
    route: "/analytics-insights/social",
    titleKey: "analyticsInsights.social",
    subtitleKey: "analyticsInsights.socialDesc",
  },
  {
    key: "storage",
    emoji: "💾",
    route: "/analytics-insights/storage",
    titleKey: "analyticsInsights.storage",
    subtitleKey: "analyticsInsights.storageDesc",
  },
  {
    key: "heatmap",
    emoji: "🗓️",
    route: "/analytics-insights/heatmap",
    titleKey: "analyticsInsights.heatmap",
    subtitleKey: "analyticsInsights.heatmapDesc",
  },
  {
    key: "export",
    emoji: "📥",
    route: "/analytics-insights/export",
    titleKey: "analyticsInsights.export",
    subtitleKey: "analyticsInsights.exportDesc",
  },
];

export default function AnalyticsInsightsHub() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const { period, overview, isLoading, setPeriod, fetchOverview } =
    useAnalyticsInsightsStore();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handlePeriod = (p: InsightsPeriod) => {
    setPeriod(p);
    fetchOverview();
  };

  return (
    <ScrollView
      testID="analytics-insights-hub"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Period Selector ───────────────────────────────── */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.periodBtn,
              {
                backgroundColor:
                  period === p.value ? colors.primary + "20" : colors.surface,
                borderColor:
                  period === p.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handlePeriod(p.value)}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: period === p.value ? colors.primary : colors.text,
              }}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Overview Metrics ──────────────────────────────── */}
      {isLoading && !overview ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 60 }}
        />
      ) : (
        <>
          {/* Key stats */}
          <View style={styles.statsGrid}>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {overview?.totalMessages?.toLocaleString() ?? "0"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("analyticsInsights.messages")}
              </Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: "#22c55e" }]}>
                {overview?.totalCalls ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("analyticsInsights.calls")}
              </Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: "#f5a623" }]}>
                {overview?.totalMediaShared ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("analyticsInsights.media")}
              </Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statValue, { color: "#8B5CF6" }]}>
                {overview?.averageSessionMinutes ?? 0} min
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t("analyticsInsights.avgSession")}
              </Text>
            </View>
          </View>

          {/* Streak & friends */}
          <View
            style={[styles.streakCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.streakRow}>
              <Text style={{ fontSize: 22 }}>🔥</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.streakValue, { color: colors.text }]}>
                  {overview?.activeStreak ?? 0} {t("analyticsInsights.days")}
                </Text>
                <Text style={[styles.streakLabel, { color: colors.textMuted }]}>
                  {t("analyticsInsights.activeStreak")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.streakValue, { color: colors.text }]}>
                  {overview?.totalFriends ?? 0}
                </Text>
                <Text style={[styles.streakLabel, { color: colors.textMuted }]}>
                  {t("analyticsInsights.friends")}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Navigation Cards ──────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("analyticsInsights.explore")}
          </Text>

          {NAV_CARDS.map((card) => (
            <TouchableOpacity
              key={card.key}
              activeOpacity={0.7}
              onPress={() => router.push(card.route as any)}
              style={[styles.navCard, { backgroundColor: colors.surface }]}
            >
              <Text style={{ fontSize: 22 }}>{card.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, { color: colors.text }]}>
                  {t(card.titleKey)}
                </Text>
                <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>
                  {t(card.subtitleKey)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ))}
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
  streakCard: { padding: 16, borderRadius: 12, marginBottom: 20 },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  streakValue: { fontSize: 20, fontWeight: "800" },
  streakLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  navTitle: { fontSize: 15, fontWeight: "600" },
  navSubtitle: { fontSize: 12, marginTop: 2 },
});
