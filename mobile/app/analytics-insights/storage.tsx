/**
 * Storage Stats Screen (DEV-036)
 *
 * Storage usage breakdown by category (images, videos, audio, docs, other).
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
import type { StorageCategory } from "@/types/analytics-insights";

const CATEGORY_COLORS: Record<StorageCategory, string> = {
  images: "#3b82f6",
  videos: "#f5a623",
  audio: "#8B5CF6",
  documents: "#22c55e",
  other: "#64748b",
};

const CATEGORY_EMOJIS: Record<StorageCategory, string> = {
  images: "🖼️",
  videos: "🎬",
  audio: "🎵",
  documents: "📄",
  other: "📦",
};

export default function StorageScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { storage, isLoading, fetchStorage } = useAnalyticsInsightsStore();

  useEffect(() => {
    fetchStorage();
  }, [fetchStorage]);

  if (isLoading && !storage) {
    return (
      <View
        testID="storage-screen"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const usedPct = storage
    ? Math.round((storage.totalUsedMB / storage.totalLimitMB) * 100)
    : 0;

  return (
    <ScrollView
      testID="storage-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Global Usage ─────────────────────────────────── */}
      <View style={[styles.usageCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.usageTitle, { color: colors.text }]}>
          {t("analyticsInsights.storageUsage")}
        </Text>

        {/* Progress bar */}
        <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(usedPct, 100)}%`,
                backgroundColor:
                  usedPct > 90
                    ? "#ef4444"
                    : usedPct > 70
                      ? "#f5a623"
                      : colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.usageNumbers}>
          <Text style={[styles.usageUsed, { color: colors.text }]}>
            {((storage?.totalUsedMB ?? 0) / 1024).toFixed(1)} Go
          </Text>
          <Text style={[styles.usageTotal, { color: colors.textMuted }]}>
            / {((storage?.totalLimitMB ?? 0) / 1024).toFixed(0)} Go ({usedPct}%)
          </Text>
        </View>
      </View>

      {/* ── Breakdown by Category ────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.byCategory")}
      </Text>

      {storage?.breakdown?.map((cat) => {
        const catPct =
          storage.totalUsedMB > 0
            ? Math.round((cat.usedMB / storage.totalUsedMB) * 100)
            : 0;
        return (
          <View
            key={cat.category}
            style={[styles.catCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.catHeader}>
              <Text style={{ fontSize: 20 }}>
                {CATEGORY_EMOJIS[cat.category] ?? "📦"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.catName, { color: colors.text }]}>
                  {t(`analyticsInsights.cat_${cat.category}`)}
                </Text>
                <Text style={[styles.catSize, { color: colors.textMuted }]}>
                  {cat.usedMB >= 1024
                    ? `${(cat.usedMB / 1024).toFixed(1)} Go`
                    : `${cat.usedMB} Mo`}
                  {" · "}
                  {cat.fileCount} {t("analyticsInsights.files")}
                </Text>
              </View>
              <Text
                style={[
                  styles.catPct,
                  { color: CATEGORY_COLORS[cat.category] ?? colors.primary },
                ]}
              >
                {catPct}%
              </Text>
            </View>
            <View style={[styles.catBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.catFill,
                  {
                    width: `${catPct}%`,
                    backgroundColor:
                      CATEGORY_COLORS[cat.category] ?? colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}

      {/* ── Trend ────────────────────────────────────────── */}
      {storage?.storageTrend &&
        storage.storageTrend.length >= 2 &&
        (() => {
          const first = storage.storageTrend[0].value;
          const last =
            storage.storageTrend[storage.storageTrend.length - 1].value;
          const dir = last > first ? "up" : last < first ? "down" : "stable";
          const pctChange =
            first > 0 ? Math.abs(((last - first) / first) * 100) : 0;
          return (
            <View
              style={[styles.trendCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.trendTitle, { color: colors.text }]}>
                {t("analyticsInsights.storageTrend")}
              </Text>
              <Text
                style={[
                  styles.trendValue,
                  {
                    color:
                      dir === "up"
                        ? "#ef4444"
                        : dir === "down"
                          ? "#22c55e"
                          : colors.textMuted,
                  },
                ]}
              >
                {dir === "up" ? "↑" : dir === "down" ? "↓" : "→"}{" "}
                {pctChange.toFixed(1)}%
              </Text>
            </View>
          );
        })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  usageCard: { padding: 18, borderRadius: 12, marginBottom: 20 },
  usageTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  barTrack: { height: 14, borderRadius: 7, overflow: "hidden" },
  barFill: { height: 14, borderRadius: 7 },
  usageNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
    gap: 4,
  },
  usageUsed: { fontSize: 20, fontWeight: "800" },
  usageTotal: { fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  catCard: { padding: 14, borderRadius: 10, marginBottom: 8 },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  catName: { fontSize: 14, fontWeight: "600" },
  catSize: { fontSize: 12, marginTop: 2 },
  catPct: { fontSize: 16, fontWeight: "800" },
  catBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  catFill: { height: 6, borderRadius: 3 },
  trendCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },
  trendTitle: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  trendValue: { fontSize: 20, fontWeight: "800" },
});
