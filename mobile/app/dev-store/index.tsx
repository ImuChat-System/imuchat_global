/**
 * DevStoreHub — Developer Dashboard (DEV-034)
 *
 * Main hub for the developer/creator portal.
 * Shows: stats overview, quick actions, recent activity feed.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import { useRouter } from "expo-router";
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

// ─── Quick Action Card ────────────────────────────────────────

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  bgColor: string;
  textColor: string;
}

function QuickAction({
  icon,
  label,
  onPress,
  bgColor,
  textColor,
}: QuickActionProps) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text
        style={[styles.quickActionLabel, { color: textColor }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Stat Card ────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
}

function StatCard({
  label,
  value,
  surfaceColor,
  textColor,
  mutedColor,
}: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: mutedColor }]}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function DevStoreHub() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const { dashboardStats, dashboardLoading, recentActivity, fetchDashboard } =
    useDevStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = dashboardStats;

  return (
    <ScrollView
      testID="dev-store-hub"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={dashboardLoading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* ── Welcome Banner ──────────────────────────────────── */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: colors.primary + "18",
            borderColor: colors.primary + "40",
          },
        ]}
      >
        <Text style={styles.bannerIcon}>👨‍💻</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            {t("devStore.welcomeTitle")}
          </Text>
          <Text style={[styles.bannerSub, { color: colors.textMuted }]}>
            {t("devStore.welcomeSub")}
          </Text>
        </View>
      </View>

      {/* ── Stats Grid ─────────────────────────────────────── */}
      {dashboardLoading && !stats ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginVertical: 40 }}
        />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard
            label={t("devStore.totalApps")}
            value={stats?.total_apps ?? 0}
            surfaceColor={colors.surface}
            textColor={colors.text}
            mutedColor={colors.textMuted}
          />
          <StatCard
            label={t("devStore.totalThemes")}
            value={stats?.total_themes ?? 0}
            surfaceColor={colors.surface}
            textColor={colors.text}
            mutedColor={colors.textMuted}
          />
          <StatCard
            label={t("devStore.downloads")}
            value={stats?.total_downloads ?? 0}
            surfaceColor={colors.surface}
            textColor={colors.text}
            mutedColor={colors.textMuted}
          />
          <StatCard
            label={t("devStore.pendingSub")}
            value={stats?.pending_submissions ?? 0}
            surfaceColor={colors.surface}
            textColor={colors.text}
            mutedColor={colors.textMuted}
          />
        </View>
      )}

      {/* ── Quick Actions ──────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("devStore.quickActions")}
      </Text>
      <View style={styles.quickActionsRow}>
        <QuickAction
          icon="📱"
          label={t("devStore.myApps")}
          onPress={() => router.push("/dev-store/my-apps" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
        <QuickAction
          icon="➕"
          label={t("devStore.submitApp")}
          onPress={() => router.push("/dev-store/submit-app" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
        <QuickAction
          icon="🎨"
          label={t("devStore.myThemes")}
          onPress={() => router.push("/dev-store/my-themes" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
        <QuickAction
          icon="📊"
          label={t("devStore.analytics")}
          onPress={() => router.push("/dev-store/analytics" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
      </View>

      {/* ── More Actions ───────────────────────────────────── */}
      <View style={styles.quickActionsRow}>
        <QuickAction
          icon="👤"
          label={t("devStore.creatorProfile")}
          onPress={() => router.push("/dev-store/creator-profile" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
        <QuickAction
          icon="🔑"
          label={t("devStore.apiKeys")}
          onPress={() => router.push("/dev-store/api-keys" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
        <QuickAction
          icon="📖"
          label={t("devStore.docs")}
          onPress={() => router.push("/dev-store/documentation" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
        <QuickAction
          icon="🎨"
          label={t("devStore.themeEditor")}
          onPress={() => router.push("/dev-store/theme-editor" as any)}
          bgColor={colors.surface}
          textColor={colors.text}
        />
      </View>

      {/* ── Recent Activity ────────────────────────────────── */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        {t("devStore.recentActivity")}
      </Text>
      {recentActivity.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("devStore.noActivity")}
          </Text>
        </View>
      ) : (
        recentActivity.map((activity) => (
          <View
            key={activity.id}
            style={[styles.activityCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              {activity.title}
            </Text>
            <Text style={[styles.activityDesc, { color: colors.textMuted }]}>
              {activity.description}
            </Text>
          </View>
        ))
      )}

      {/* ── Revenue / Payout ───────────────────────────────── */}
      <View
        style={[
          styles.revenueCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 20 }}>💰</Text>
          <Text style={[styles.revenueTitle, { color: colors.text }]}>
            {t("devStore.revenue")}
          </Text>
        </View>
        <Text style={[styles.revenueAmount, { color: colors.primary }]}>
          {stats?.total_revenue?.toFixed(2) ?? "0.00"} €
        </Text>
        <Text style={[styles.revenuePending, { color: colors.textMuted }]}>
          {t("devStore.pendingPayout")}:{" "}
          {stats?.pending_payout?.toFixed(2) ?? "0.00"} €
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerIcon: { fontSize: 32 },
  bannerTitle: { fontSize: 18, fontWeight: "700" },
  bannerSub: { fontSize: 13, marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  quickAction: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  quickActionIcon: { fontSize: 24, marginBottom: 4 },
  quickActionLabel: { fontSize: 11, textAlign: "center", fontWeight: "600" },
  emptyCard: {
    padding: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  emptyText: { fontSize: 14 },
  activityCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  activityTitle: { fontSize: 14, fontWeight: "600" },
  activityDesc: { fontSize: 12, marginTop: 2 },
  revenueCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  revenueTitle: { fontSize: 16, fontWeight: "700" },
  revenueAmount: { fontSize: 28, fontWeight: "800", marginTop: 8 },
  revenuePending: { fontSize: 12, marginTop: 4 },
});
