/**
 * Activity Heatmap Screen (DEV-036)
 *
 * 7-day × 24-hour heat grid showing usage intensity.
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

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21];

function intensityColor(intensity: number, primary: string): string {
  if (intensity >= 0.8) return primary;
  if (intensity >= 0.6) return primary + "CC";
  if (intensity >= 0.4) return primary + "88";
  if (intensity >= 0.2) return primary + "44";
  return primary + "15";
}

export default function HeatmapScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { heatmap, isLoading, fetchHeatmap } = useAnalyticsInsightsStore();

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  if (isLoading && !heatmap) {
    return (
      <View
        testID="heatmap-screen"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Organise cells into a 7×24 grid
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  heatmap?.cells?.forEach((cell) => {
    if (cell.day >= 0 && cell.day < 7 && cell.hour >= 0 && cell.hour < 24) {
      grid[cell.day][cell.hour] = cell.intensity;
    }
  });

  // Find peak
  let peakDay = 0;
  let peakHour = 0;
  let peakVal = 0;
  grid.forEach((row, d) =>
    row.forEach((val, h) => {
      if (val > peakVal) {
        peakVal = val;
        peakDay = d;
        peakHour = h;
      }
    }),
  );

  return (
    <ScrollView
      testID="heatmap-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Peak info ────────────────────────────────────── */}
      <View style={[styles.peakCard, { backgroundColor: colors.surface }]}>
        <Text style={{ fontSize: 22 }}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.peakTitle, { color: colors.text }]}>
            {t("analyticsInsights.peakActivity")}
          </Text>
          <Text style={[styles.peakValue, { color: colors.primary }]}>
            {DAY_LABELS[peakDay]} {peakHour}h - {peakHour + 1}h
          </Text>
        </View>
      </View>

      {/* ── Heatmap Grid ─────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.activityGrid")}
      </Text>

      {/* Hour labels */}
      <View style={styles.hourRow}>
        <View style={{ width: 36 }} />
        {HOUR_LABELS.map((h) => (
          <Text key={h} style={[styles.hourLabel, { color: colors.textMuted }]}>
            {h}h
          </Text>
        ))}
      </View>

      {/* Grid rows */}
      {grid.map((row, dayIdx) => (
        <View key={dayIdx} style={styles.gridRow}>
          <Text style={[styles.dayLabel, { color: colors.textMuted }]}>
            {DAY_LABELS[dayIdx]}
          </Text>
          <View style={styles.cellRow}>
            {row.map((val, hourIdx) => (
              <View
                key={hourIdx}
                style={[
                  styles.cell,
                  { backgroundColor: intensityColor(val, colors.primary) },
                ]}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={[styles.legendText, { color: colors.textMuted }]}>
          {t("analyticsInsights.less")}
        </Text>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
          <View
            key={v}
            style={[
              styles.legendCell,
              { backgroundColor: intensityColor(v, colors.primary) },
            ]}
          />
        ))}
        <Text style={[styles.legendText, { color: colors.textMuted }]}>
          {t("analyticsInsights.more")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  peakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  peakTitle: { fontSize: 14, fontWeight: "600" },
  peakValue: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  hourRow: { flexDirection: "row", marginBottom: 4, paddingLeft: 0 },
  hourLabel: { flex: 3, fontSize: 10, textAlign: "center" },
  gridRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  dayLabel: { width: 36, fontSize: 11, textAlign: "right", marginRight: 4 },
  cellRow: { flex: 1, flexDirection: "row", gap: 1 },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 2 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 16,
  },
  legendCell: { width: 14, height: 14, borderRadius: 2 },
  legendText: { fontSize: 11 },
});
