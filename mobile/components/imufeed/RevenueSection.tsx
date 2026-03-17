/**
 * RevenueSection — Section revenus pour le dashboard créateur
 *
 * Affiche un résumé des revenus (tips + abonnements),
 * le nombre d'abonnés actifs, et un mini-graphique text-based.
 *
 * Sprint S14B — Revenue Dashboard
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type {
  CreatorRevenue,
  RevenueEntry,
} from "@/types/creator-monetization";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

export interface RevenueSectionProps {
  /** Données de revenus */
  revenue: CreatorRevenue | null;
  /** Historique par jour */
  history: RevenueEntry[];
  /** En cours de chargement */
  isLoading?: boolean;
  /** Style container */
  style?: ViewStyle;
}

export default function RevenueSection({
  revenue,
  history,
  isLoading = false,
  style,
}: RevenueSectionProps) {
  const colors = useColors();
  const spacing = useSpacing();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }, style]}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          testID="revenue-loading"
        />
      </View>
    );
  }

  if (!revenue) {
    return (
      <View
        testID="revenue-empty"
        style={[styles.container, { backgroundColor: colors.card }, style]}
      >
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Aucune donnée de revenus
        </Text>
      </View>
    );
  }

  return (
    <View
      testID="revenue-section"
      style={[styles.container, { backgroundColor: colors.card }, style]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        💰 Revenus ({revenue.period_days}j)
      </Text>

      {/* Stats principales */}
      <View style={styles.statsGrid}>
        <RevenueStatCard
          testID="revenue-total"
          label="Total"
          value={`${revenue.total_revenue} IC`}
          color={colors.primary}
          bgColor={colors.surface}
          textColor={colors.text}
          labelColor={colors.textMuted}
        />
        <RevenueStatCard
          testID="revenue-tips"
          label="Pourboires"
          value={`${revenue.tips_total} IC`}
          subtitle={`${revenue.tips_count} tips`}
          color="#FFD700"
          bgColor={colors.surface}
          textColor={colors.text}
          labelColor={colors.textMuted}
        />
        <RevenueStatCard
          testID="revenue-subs"
          label="Abonnements"
          value={`${revenue.subs_revenue} IC`}
          subtitle={`${revenue.subs_active} actifs`}
          color="#8B5CF6"
          bgColor={colors.surface}
          textColor={colors.text}
          labelColor={colors.textMuted}
        />
      </View>

      {/* Mini graph text-based */}
      {history.length > 0 && (
        <View style={styles.graphSection}>
          <Text style={[styles.graphTitle, { color: colors.textSecondary }]}>
            Évolution
          </Text>
          <MiniBarChart
            history={history}
            accentColor={colors.primary}
            mutedColor={colors.border}
          />
        </View>
      )}
    </View>
  );
}

// ─── Revenue Stat Card ─────────────────────────────────────────

function RevenueStatCard({
  testID,
  label,
  value,
  subtitle,
  color,
  bgColor,
  textColor,
  labelColor,
}: {
  testID: string;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  bgColor: string;
  textColor: string;
  labelColor: string;
}) {
  return (
    <View
      testID={testID}
      style={[styles.statCard, { backgroundColor: bgColor }]}
    >
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: labelColor }]}>
          {subtitle}
        </Text>
      )}
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

// ─── Mini Bar Chart (text-based) ───────────────────────────────

function MiniBarChart({
  history,
  accentColor,
  mutedColor,
}: {
  history: RevenueEntry[];
  accentColor: string;
  mutedColor: string;
}) {
  const maxTotal = Math.max(...history.map((h) => h.total), 1);
  const lastDays = history.slice(-7); // Derniers 7 jours

  return (
    <View style={styles.barChart} testID="revenue-chart">
      {lastDays.map((entry, i) => {
        const heightPercent = (entry.total / maxTotal) * 100;
        return (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(heightPercent, 5)}%` as any,
                    backgroundColor: accentColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: mutedColor }]}>
              {entry.day.slice(-2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  graphSection: {
    marginTop: 4,
  },
  graphTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 80,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barTrack: {
    width: 16,
    height: 60,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 9,
    marginTop: 4,
  },
});
