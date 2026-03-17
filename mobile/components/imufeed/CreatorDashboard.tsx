/**
 * CreatorDashboard — Dashboard analytics créateur ImuFeed
 *
 * Vue principale avec :
 * - Sélecteur période (7j / 30j / 90j)
 * - Grille de metric cards
 * - Données quotidiennes (mini chart)
 * - Top vidéo
 * - Heures optimales (heatmap simplifié)
 *
 * Sprint S13 Axe B — Dashboard Créateur & Analytics
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  buildMetricCards,
  CreatorAnalyticsService,
} from "@/services/imufeed/creator-analytics-service";
import type {
  CreatorDailyMetric,
  CreatorDashboardOverview,
  CreatorDashboardPeriod,
  CreatorMetricCard,
  HourlyHeatmapEntry,
  VideoAnalytics,
} from "@/types/creator-analytics";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface CreatorDashboardProps {
  userId: string;
}

// ─── Period Tabs ──────────────────────────────────────────────

const PERIODS: { id: CreatorDashboardPeriod; label: string }[] = [
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "90d", label: "90 jours" },
];

// ─── Component ────────────────────────────────────────────────

export default function CreatorDashboard({ userId }: CreatorDashboardProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const [period, setPeriod] = useState<CreatorDashboardPeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<CreatorDashboardOverview | null>(
    null,
  );
  const [metricCards, setMetricCards] = useState<CreatorMetricCard[]>([]);
  const [dailyData, setDailyData] = useState<CreatorDailyMetric[]>([]);
  const [topVideo, setTopVideo] = useState<VideoAnalytics | null>(null);
  const [heatmap, setHeatmap] = useState<HourlyHeatmapEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, daily, top, heat] = await Promise.all([
        CreatorAnalyticsService.fetchDashboard(userId, period),
        CreatorAnalyticsService.fetchDailyChart(userId, period),
        CreatorAnalyticsService.fetchTopVideo(userId),
        CreatorAnalyticsService.fetchHeatmap(userId),
      ]);
      setOverview(dash);
      setMetricCards(buildMetricCards(dash));
      setDailyData(daily);
      setTopVideo(top);
      setHeatmap(heat);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Render helpers ──────────────────────────────────────────

  const renderPeriodSelector = () => (
    <View testID="period-selector" style={styles.periodRow}>
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p.id}
          testID={`period-${p.id}`}
          style={[
            styles.periodBtn,
            { borderColor: colors.border },
            period === p.id && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setPeriod(p.id)}
        >
          <Text
            style={[
              styles.periodText,
              { color: period === p.id ? "#FFFFFF" : colors.textMuted },
            ]}
          >
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMetricCards = () => (
    <View testID="metric-cards" style={styles.cardsGrid}>
      {metricCards.map((card) => (
        <View
          key={card.key}
          testID={`metric-${card.key}`}
          style={[styles.card, { backgroundColor: colors.surface }]}
        >
          <Text style={styles.cardEmoji}>{card.emoji}</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {card.formatted}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderDailyChart = () => {
    if (dailyData.length === 0) return null;
    const maxViews = Math.max(...dailyData.map((d) => d.views), 1);

    return (
      <View
        testID="daily-chart"
        style={[styles.section, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📈 Vues quotidiennes
        </Text>
        <View style={styles.chartBars}>
          {dailyData.slice(-14).map((d, i) => (
            <View key={d.day || i} style={styles.barWrapper}>
              <View
                testID={`bar-${i}`}
                style={[
                  styles.bar,
                  {
                    height: Math.max((d.views / maxViews) * 60, 2),
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTopVideo = () => {
    if (!topVideo) return null;
    return (
      <View
        testID="top-video"
        style={[styles.section, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🏆 Top Vidéo
        </Text>
        <View style={styles.topVideoStats}>
          <Text style={[styles.topStat, { color: colors.text }]}>
            👁️ {topVideo.views.toLocaleString()}
          </Text>
          <Text style={[styles.topStat, { color: colors.text }]}>
            ❤️ {topVideo.likes.toLocaleString()}
          </Text>
          <Text style={[styles.topStat, { color: colors.text }]}>
            📊 {(topVideo.engagement_rate * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderHeatmap = () => {
    if (heatmap.length === 0) return null;
    const top3 = heatmap.slice(0, 3);
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    return (
      <View
        testID="heatmap-section"
        style={[styles.section, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ⏰ Heures optimales
        </Text>
        {top3.map((entry, i) => (
          <Text
            key={i}
            testID={`heatmap-entry-${i}`}
            style={[styles.heatmapEntry, { color: colors.text }]}
          >
            {dayNames[entry.day_of_week]} {entry.hour_of_day}h —{" "}
            {(entry.avg_engagement * 100).toFixed(1)}% engagement
          </Text>
        ))}
      </View>
    );
  };

  // ── Main render ─────────────────────────────────────────────

  if (loading) {
    return (
      <View testID="dashboard-loading" style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View testID="dashboard-error" style={styles.center}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity testID="dashboard-retry" onPress={loadData}>
          <Text style={{ color: colors.primary, marginTop: 12 }}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      testID="creator-dashboard"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.md }}
    >
      <Text style={[styles.pageTitle, { color: colors.text }]}>
        📊 Dashboard Créateur
      </Text>

      {renderPeriodSelector()}
      {renderMetricCards()}
      {renderDailyChart()}
      {renderTopVideo()}
      {renderHeatmap()}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  periodText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  card: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  cardLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 64,
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bar: {
    borderRadius: 3,
    minWidth: 4,
  },
  topVideoStats: {
    flexDirection: "row",
    gap: 16,
  },
  topStat: {
    fontSize: 14,
    fontWeight: "600",
  },
  heatmapEntry: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
});
