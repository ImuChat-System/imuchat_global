/**
 * Social Stats Screen (DEV-036)
 *
 * Followers, engagement rate, top posts.
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

export default function SocialScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { social, isLoading, fetchSocial } = useAnalyticsInsightsStore();

  useEffect(() => {
    fetchSocial();
  }, [fetchSocial]);

  if (isLoading && !social) {
    return (
      <View
        testID="social-screen"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="social-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Followers / Following ────────────────────────── */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {social?.followersCount?.toLocaleString() ?? "0"}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.followers")}
          </Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: "#22c55e" }]}>
            {social?.followingCount?.toLocaleString() ?? "0"}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.following")}
          </Text>
        </View>
      </View>

      {/* ── Engagement Rate ──────────────────────────────── */}
      <View
        style={[styles.engagementCard, { backgroundColor: colors.surface }]}
      >
        <Text style={{ fontSize: 22 }}>🎯</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.engTitle, { color: colors.text }]}>
            {t("analyticsInsights.engagementRate")}
          </Text>
          <Text style={[styles.engValue, { color: colors.primary }]}>
            {social?.engagementRate ?? 0}%
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.engTitle, { color: colors.text }]}>
            {t("analyticsInsights.totalPosts")}
          </Text>
          <Text style={[styles.engValue, { color: "#8B5CF6" }]}>
            {social?.postsCount ?? 0}
          </Text>
        </View>
      </View>

      {/* ── Interactions ─────────────────────────────────── */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: "#ec4899" }]}>
            {social?.totalLikes?.toLocaleString() ?? "0"}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.likes")}
          </Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricValue, { color: "#f5a623" }]}>
            {social?.totalShares ?? 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            {t("analyticsInsights.shares")}
          </Text>
        </View>
      </View>

      {/* ── Top Posts ────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("analyticsInsights.topPostsList")}
      </Text>

      {social?.topPosts?.map((post, idx) => (
        <View
          key={post.id}
          style={[styles.postCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.postHeader}>
            <Text style={[styles.postRank, { color: colors.primary }]}>
              #{idx + 1}
            </Text>
            <Text style={[styles.postDate, { color: colors.textMuted }]}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text
            numberOfLines={2}
            style={[styles.postContent, { color: colors.text }]}
          >
            {post.preview}
          </Text>
          <View style={styles.postStats}>
            <Text style={[styles.postStat, { color: "#ec4899" }]}>
              ❤️ {post.likes}
            </Text>
            <Text style={[styles.postStat, { color: "#f5a623" }]}>
              🔄 {post.shares}
            </Text>
            <Text style={[styles.postStat, { color: "#3b82f6" }]}>
              💬 {post.comments}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  metricCard: { flex: 1, padding: 16, borderRadius: 10, alignItems: "center" },
  metricValue: { fontSize: 24, fontWeight: "800" },
  metricLabel: { fontSize: 12, marginTop: 4, textAlign: "center" },
  engagementCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
  },
  engTitle: { fontSize: 13, fontWeight: "600" },
  engValue: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 12,
  },
  postCard: { padding: 14, borderRadius: 10, marginBottom: 8 },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  postRank: { fontSize: 14, fontWeight: "800" },
  postDate: { fontSize: 12 },
  postContent: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  postStats: { flexDirection: "row", gap: 16 },
  postStat: { fontSize: 13, fontWeight: "600" },
});
