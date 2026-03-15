/**
 * KYC Status Screen — Sprint M-F2
 *
 * Affiche le statut KYC : tier actuel, limites, historique tentatives,
 * chemin de progression vers le tier suivant.
 * Route : /wallet/kyc-status (Expo Router)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useKycVerificationStore } from "@/stores/kyc-verification-store";
import type { KycTier, VerificationAttempt } from "@/types/kyc-verification";
import {
  KYC_TIER_DETAIL_CONFIG,
  VERIFICATION_ATTEMPT_STATUS_CONFIG,
  getDailyLimitForTier,
  getMonthlyLimitForTier,
  getTierLabel,
} from "@/types/kyc-verification";
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

export default function KycStatusScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const { profile, history, isLoading, loadProfile, loadHistory } =
    useKycVerificationStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, [loadProfile, loadHistory]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadHistory()]);
    setRefreshing(false);
  }, [loadProfile, loadHistory]);

  const currentTier: KycTier = profile?.currentTier ?? 0;
  const tierConfig = KYC_TIER_DETAIL_CONFIG[currentTier];
  const nextTier = currentTier < 3 ? ((currentTier + 1) as KycTier) : null;
  const nextTierConfig =
    nextTier !== null ? KYC_TIER_DETAIL_CONFIG[nextTier] : null;

  // ── Tier Card ─────────────────────────────────────────────
  const renderTierCard = () => (
    <View
      testID="kyc-tier-card"
      style={[styles.tierCard, { backgroundColor: tierConfig.color + "15" }]}
    >
      <Text style={styles.tierEmoji}>{tierConfig.icon}</Text>
      <Text style={[styles.tierLabel, { color: tierConfig.color }]}>
        {t("kycVerification.tier") || "Tier"} {currentTier} — {tierConfig.label}
      </Text>
      <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>
        {tierConfig.description}
      </Text>
    </View>
  );

  // ── Limits ────────────────────────────────────────────────
  const renderLimits = () => (
    <View
      testID="kyc-limits"
      style={[styles.limitsCard, { backgroundColor: colors.surface }]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("kycVerification.currentLimits") || "Limites actuelles"}
      </Text>

      <View style={styles.limitRow}>
        <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>
          {t("kycVerification.dailyLimit") || "Limite quotidienne"}
        </Text>
        <Text style={[styles.limitValue, { color: colors.text }]}>
          {getDailyLimitForTier(currentTier).toLocaleString()} IC
        </Text>
      </View>

      <View style={styles.limitRow}>
        <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>
          {t("kycVerification.monthlyLimit") || "Limite mensuelle"}
        </Text>
        <Text style={[styles.limitValue, { color: colors.text }]}>
          {getMonthlyLimitForTier(currentTier).toLocaleString()} IC
        </Text>
      </View>

      <View style={styles.limitRow}>
        <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>
          {t("kycVerification.singleTransaction") || "Transaction max"}
        </Text>
        <Text style={[styles.limitValue, { color: colors.text }]}>
          {tierConfig.singleTransactionLimitIc.toLocaleString()} IC
        </Text>
      </View>

      {/* Capabilities */}
      <View style={styles.capabilitiesRow}>
        <View style={styles.capItem}>
          <Text style={styles.capEmoji}>
            {tierConfig.canCashout ? "✅" : "❌"}
          </Text>
          <Text style={[styles.capLabel, { color: colors.textSecondary }]}>
            {t("kycVerification.cashout") || "Retrait"}
          </Text>
        </View>
        <View style={styles.capItem}>
          <Text style={styles.capEmoji}>
            {tierConfig.canP2PFiat ? "✅" : "❌"}
          </Text>
          <Text style={[styles.capLabel, { color: colors.textSecondary }]}>
            P2P Fiat
          </Text>
        </View>
        <View style={styles.capItem}>
          <Text style={styles.capEmoji}>
            {tierConfig.canUseCards ? "✅" : "❌"}
          </Text>
          <Text style={[styles.capLabel, { color: colors.textSecondary }]}>
            {t("kycVerification.cards") || "Cartes"}
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Upgrade Path ──────────────────────────────────────────
  const renderUpgradePath = () => {
    if (!nextTierConfig) return null;

    return (
      <View
        testID="kyc-upgrade-path"
        style={[styles.upgradeCard, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("kycVerification.upgradeTitle") || "Passer au niveau suivant"}
        </Text>
        <View style={styles.upgradeRow}>
          <Text style={styles.upgradeEmoji}>{nextTierConfig.icon}</Text>
          <View style={styles.upgradeInfo}>
            <Text style={[styles.upgradeName, { color: colors.text }]}>
              Tier {nextTier} — {nextTierConfig.label}
            </Text>
            <Text style={[styles.upgradeDesc, { color: colors.textSecondary }]}>
              {nextTierConfig.description}
            </Text>
          </View>
        </View>

        {/* Requirements */}
        {nextTierConfig.requirements.map((req, i) => (
          <View key={i} style={styles.reqRow}>
            <Text style={styles.reqBullet}>•</Text>
            <Text style={[styles.reqText, { color: colors.textSecondary }]}>
              {req}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          testID="kyc-upgrade-btn"
          style={[styles.upgradeBtn, { backgroundColor: nextTierConfig.color }]}
          onPress={() => router.push("/wallet/kyc-verification" as any)}
        >
          <Text style={styles.upgradeBtnText}>
            {t("kycVerification.startUpgrade") || "Commencer la vérification"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── History ───────────────────────────────────────────────
  const renderAttemptItem = (attempt: VerificationAttempt) => {
    const statusConfig = VERIFICATION_ATTEMPT_STATUS_CONFIG[attempt.status];
    return (
      <View
        key={attempt.id}
        style={[styles.historyItem, { borderColor: colors.border }]}
      >
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTarget, { color: colors.text }]}>
            Tier {attempt.targetTier} — {getTierLabel(attempt.targetTier)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.color + "20" },
            ]}
          >
            <Text
              style={[styles.statusBadgeText, { color: statusConfig.color }]}
            >
              {statusConfig.icon} {statusConfig.label}
            </Text>
          </View>
        </View>
        <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
          {new Date(attempt.startedAt).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) return null;

    return (
      <View testID="kyc-history" style={{ marginTop: 16 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("kycVerification.history") || "Historique"}
        </Text>
        {history.map(renderAttemptItem)}
      </View>
    );
  };

  // ── Main Render ───────────────────────────────────────────
  if (isLoading && !profile) {
    return (
      <View
        testID="kyc-status-loading"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="kyc-status-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("kycVerification.statusTitle") || "Statut KYC"}
      </Text>

      {renderTierCard()}
      {renderLimits()}
      {renderUpgradePath()}
      {renderHistory()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },

  // Tier Card
  tierCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  tierEmoji: { fontSize: 40, marginBottom: 8 },
  tierLabel: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  tierDesc: { fontSize: 14, textAlign: "center" },

  // Limits
  limitsCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  limitLabel: { fontSize: 14 },
  limitValue: { fontSize: 14, fontWeight: "700" },
  capabilitiesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
  },
  capItem: { alignItems: "center" },
  capEmoji: { fontSize: 18, marginBottom: 4 },
  capLabel: { fontSize: 12 },

  // Upgrade
  upgradeCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  upgradeRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  upgradeEmoji: { fontSize: 32, marginRight: 12 },
  upgradeInfo: { flex: 1 },
  upgradeName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  upgradeDesc: { fontSize: 13 },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingLeft: 8,
  },
  reqBullet: { marginRight: 8, fontSize: 14 },
  reqText: { fontSize: 13 },
  upgradeBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  upgradeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // History
  historyItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyTarget: { fontSize: 14, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  historyDate: { fontSize: 12 },
});
