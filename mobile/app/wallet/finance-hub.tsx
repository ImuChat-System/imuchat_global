/**
 * Finance Hub Screen — Sprint M-F1
 *
 * Dashboard financier principal : solde, stats, activités récentes,
 * streak quotidien, badges, actions rapides.
 * Route : /wallet/finance-hub (Expo Router)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFinanceHubStore } from "@/stores/finance-hub-store";
import type { FinanceActivity } from "@/types/finance-hub";
import {
  STREAK_TIER_CONFIG,
  formatFiatCents,
  formatImuCoins,
  getActivityColor,
  getActivityIcon,
  isActivityPositive,
} from "@/types/finance-hub";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FinanceHubScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const {
    stats,
    activities,
    streak,
    isLoading,
    error,
    refreshAll,
    claimDailyLogin,
    clearError,
  } = useFinanceHubStore();

  const [refreshing, setRefreshing] = useState(false);
  const [claimingStreak, setClaimingStreak] = useState(false);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const handleClaimStreak = useCallback(async () => {
    setClaimingStreak(true);
    await claimDailyLogin();
    setClaimingStreak(false);
  }, [claimDailyLogin]);

  // ── Balance Card ──────────────────────────────────────────
  const renderBalanceCard = () => (
    <View
      testID="finance-balance-card"
      style={[styles.balanceCard, { backgroundColor: colors.primary }]}
    >
      <Text style={styles.balanceLabel}>
        {t("financeHub.totalBalance") || "Solde total"}
      </Text>
      <Text style={styles.balanceAmount}>
        {stats ? formatImuCoins(stats.balanceIc) : "---"}
      </Text>
      <Text style={styles.balanceFiat}>
        {stats
          ? `≈ ${formatFiatCents(stats.balanceFiatCents, stats.currency)}`
          : ""}
      </Text>

      {/* Quick Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {stats ? formatImuCoins(stats.todayEarned) : "0 IC"}
          </Text>
          <Text style={styles.statLabel}>
            {t("financeHub.todayEarned") || "Aujourd'hui"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.activeMissions ?? 0}</Text>
          <Text style={styles.statLabel}>
            {t("financeHub.activeMissions") || "Missions"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {stats?.paymentMethodsCount ?? 0}
          </Text>
          <Text style={styles.statLabel}>
            {t("financeHub.paymentMethods") || "Cartes"}
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Quick Actions ─────────────────────────────────────────
  const QUICK_ACTIONS = [
    {
      key: "topup",
      icon: "card-outline" as const,
      label: "financeHub.topup",
      route: "/wallet/topup",
    },
    {
      key: "send",
      icon: "arrow-up-circle-outline" as const,
      label: "financeHub.send",
      route: "/wallet",
    },
    {
      key: "withdraw",
      icon: "cash-outline" as const,
      label: "financeHub.withdraw",
      route: "/wallet/withdraw",
    },
    {
      key: "badges",
      icon: "ribbon-outline" as const,
      label: "financeHub.badges",
      route: "/wallet/badges",
    },
  ];

  const renderQuickActions = () => (
    <View testID="quick-actions" style={styles.quickActions}>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.key}
          testID={`action-${action.key}`}
          style={[
            styles.actionBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push(action.route as any)}
        >
          <Ionicons name={action.icon} size={24} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>
            {t(action.label) || action.key}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Streak Widget ─────────────────────────────────────────
  const renderStreakWidget = () => {
    if (!streak) return null;
    const tierConfig = STREAK_TIER_CONFIG[streak.tier];

    return (
      <View
        testID="streak-widget"
        style={[
          styles.streakCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.streakHeader}>
          <Text style={styles.streakIcon}>{tierConfig.icon}</Text>
          <View style={styles.streakInfo}>
            <Text style={[styles.streakTitle, { color: colors.text }]}>
              {t("financeHub.streakTitle") || "Streak quotidien"}
            </Text>
            <Text style={[styles.streakDays, { color: tierConfig.color }]}>
              {streak.currentStreak} {t("financeHub.days") || "jours"} ·{" "}
              {tierConfig.label}
            </Text>
          </View>
          <TouchableOpacity
            testID="btn-claim-streak"
            style={[
              styles.streakClaimBtn,
              { backgroundColor: tierConfig.color },
            ]}
            onPress={handleClaimStreak}
            disabled={claimingStreak}
          >
            {claimingStreak ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.streakClaimText}>
                +{streak.nextRewardIc} IC
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.streakRecord, { color: colors.textMuted }]}>
          {t("financeHub.recordStreak") || "Record"}: {streak.longestStreak}{" "}
          {t("financeHub.days") || "jours"} ·{" "}
          {formatImuCoins(streak.totalEarnedIc)}{" "}
          {t("financeHub.totalEarned") || "gagnés"}
        </Text>
      </View>
    );
  };

  // ── Activity Row ──────────────────────────────────────────
  const renderActivity = (activity: FinanceActivity) => {
    const positive = isActivityPositive(activity.type);
    return (
      <View
        key={activity.id}
        testID={`activity-${activity.id}`}
        style={[styles.activityRow, { borderBottomColor: colors.border }]}
      >
        <View
          style={[
            styles.activityIconContainer,
            { backgroundColor: getActivityColor(activity.type) + "20" },
          ]}
        >
          <Text style={styles.activityIcon}>
            {getActivityIcon(activity.type)}
          </Text>
        </View>
        <View style={styles.activityInfo}>
          <Text
            style={[styles.activityDesc, { color: colors.text }]}
            numberOfLines={1}
          >
            {activity.description}
          </Text>
          <Text style={[styles.activityDate, { color: colors.textMuted }]}>
            {new Date(activity.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text
          style={[
            styles.activityAmount,
            { color: positive ? "#22c55e" : "#ef4444" },
          ]}
        >
          {positive ? "+" : "-"}
          {formatImuCoins(activity.amountIc)}
        </Text>
      </View>
    );
  };

  // ── KYC Banner ────────────────────────────────────────────
  const renderKycBanner = () => {
    if (!stats || stats.kycLevel >= 2) return null;
    return (
      <TouchableOpacity
        testID="kyc-banner"
        style={[
          styles.kycBanner,
          { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
        ]}
        onPress={() => router.push("/wallet/withdraw" as any)}
      >
        <Ionicons name="shield-checkmark-outline" size={20} color="#f59e0b" />
        <Text style={[styles.kycBannerText, { color: "#92400e" }]}>
          {t("financeHub.kycBanner") ||
            "Vérifiez votre identité pour débloquer les retraits"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#f59e0b" />
      </TouchableOpacity>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  if (isLoading && !stats) {
    return (
      <View
        testID="finance-hub-loading"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="finance-hub-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {renderBalanceCard()}
      {renderQuickActions()}
      {renderKycBanner()}
      {renderStreakWidget()}

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("financeHub.recentActivity") || "Activité récente"}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/wallet/transactions" as any)}
          >
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              {t("financeHub.seeAll") || "Tout voir"}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.activityList,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {activities.length === 0 ? (
            <Text
              testID="no-activities"
              style={[styles.emptyText, { color: colors.textMuted }]}
            >
              {t("financeHub.noActivity") || "Aucune activité récente"}
            </Text>
          ) : (
            activities.slice(0, 5).map(renderActivity)
          )}
        </View>
      </View>

      {/* Lifetime Stats */}
      {stats && (
        <View
          testID="lifetime-stats"
          style={[
            styles.lifetimeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.lifetimeTitle, { color: colors.text }]}>
            {t("financeHub.lifetimeStats") || "Statistiques"}
          </Text>
          <View style={styles.lifetimeRow}>
            <View style={styles.lifetimeItem}>
              <Text style={[styles.lifetimeValue, { color: "#22c55e" }]}>
                {formatImuCoins(stats.lifetimeEarned)}
              </Text>
              <Text style={[styles.lifetimeLabel, { color: colors.textMuted }]}>
                {t("financeHub.totalEarnedLabel") || "Total gagné"}
              </Text>
            </View>
            <View style={styles.lifetimeItem}>
              <Text style={[styles.lifetimeValue, { color: "#ef4444" }]}>
                {formatImuCoins(stats.lifetimeSpent)}
              </Text>
              <Text style={[styles.lifetimeLabel, { color: colors.textMuted }]}>
                {t("financeHub.totalSpentLabel") || "Total dépensé"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Error banner */}
      {error && (
        <TouchableOpacity
          testID="error-banner"
          style={styles.errorBanner}
          onPress={clearError}
        >
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Balance Card
  balanceCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: { color: "#fff", fontSize: 36, fontWeight: "800" },
  balanceFiat: { color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "700" },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionBtn: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: 80,
  },
  actionLabel: { fontSize: 11, marginTop: 6, textAlign: "center" },

  // KYC Banner
  kycBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  kycBannerText: { flex: 1, fontSize: 13 },

  // Streak
  streakCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  streakHeader: { flexDirection: "row", alignItems: "center" },
  streakIcon: { fontSize: 32, marginRight: 12 },
  streakInfo: { flex: 1 },
  streakTitle: { fontSize: 16, fontWeight: "600" },
  streakDays: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  streakClaimBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakClaimText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  streakRecord: { fontSize: 12, marginTop: 8 },

  // Section
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "500" },

  // Activity
  activityList: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityIcon: { fontSize: 18 },
  activityInfo: { flex: 1 },
  activityDesc: { fontSize: 14, fontWeight: "500" },
  activityDate: { fontSize: 12, marginTop: 2 },
  activityAmount: { fontSize: 15, fontWeight: "700" },
  emptyText: { padding: 20, textAlign: "center", fontSize: 14 },

  // Lifetime
  lifetimeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  lifetimeTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  lifetimeRow: { flexDirection: "row", justifyContent: "space-around" },
  lifetimeItem: { alignItems: "center" },
  lifetimeValue: { fontSize: 18, fontWeight: "700" },
  lifetimeLabel: { fontSize: 12, marginTop: 4 },

  // Error
  errorBanner: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    marginBottom: 8,
  },
  errorText: { color: "#ef4444", fontSize: 13, textAlign: "center" },
});
