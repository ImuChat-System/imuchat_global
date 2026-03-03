/**
 * WalletScreen — Phase M4
 *
 * ImuWallet : balance, transactions, missions, envoi
 * Route : /wallet (Expo Router)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
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

import type { Mission, Transaction, WalletSection } from "@/types/wallet";

// ─── Component ────────────────────────────────────────────────────
export default function WalletScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const {
    balance,
    transactions,
    missions,
    isLoading,
    error,
    loadWallet,
    claim,
    getTransactionIcon,
    formatAmount,
    clearError,
  } = useWalletStore();

  const [activeSection, setActiveSection] = useState<WalletSection>("overview");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  }, [loadWallet]);

  const handleClaimMission = useCallback(
    async (missionId: string) => {
      await claim(missionId);
    },
    [claim],
  );

  // ─── Balance Card ─────────────────────────────────────────────
  const renderBalanceCard = () => (
    <View
      testID="balance-card"
      style={[styles.balanceCard, { backgroundColor: colors.primary }]}
    >
      <Text style={styles.balanceLabel}>
        {t("wallet.balance") || "Solde ImuCoin"}
      </Text>
      <Text style={styles.balanceAmount}>
        {balance ? `${balance.imucoins.toLocaleString()} IMC` : "---"}
      </Text>
      <View style={styles.balanceActions}>
        <TouchableOpacity
          testID="btn-send"
          style={styles.balanceActionBtn}
          onPress={() => setActiveSection("send")}
        >
          <Ionicons name="arrow-up-circle-outline" size={24} color="#fff" />
          <Text style={styles.balanceActionText}>
            {t("wallet.send") || "Envoyer"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity testID="btn-receive" style={styles.balanceActionBtn}>
          <Ionicons name="arrow-down-circle-outline" size={24} color="#fff" />
          <Text style={styles.balanceActionText}>
            {t("wallet.receive") || "Recevoir"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="btn-topup"
          style={styles.balanceActionBtn}
          onPress={() => router.push("/wallet/topup")}
        >
          <Ionicons name="card-outline" size={24} color="#fff" />
          <Text style={styles.balanceActionText}>
            {t("wallet.topup") || "Recharger"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Section Tabs ─────────────────────────────────────────────
  const TABS: { key: WalletSection; label: string; icon: string }[] = [
    { key: "overview", label: "wallet.overview", icon: "📊" },
    { key: "transactions", label: "wallet.transactions", icon: "📜" },
    { key: "missions", label: "wallet.missions", icon: "🎯" },
  ];

  const renderTabs = () => (
    <View testID="wallet-tabs" style={styles.tabRow}>
      {TABS.map((tab) => {
        const active = activeSection === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            testID={`tab-${tab.key}`}
            onPress={() => setActiveSection(tab.key)}
            style={[
              styles.tabBtn,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                { color: active ? "#fff" : colors.textMuted },
              ]}
            >
              {t(tab.label) || tab.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── Transaction Row ──────────────────────────────────────────
  const renderTransaction = (tx: Transaction) => {
    const isPositive = tx.amount >= 0;
    return (
      <View
        key={tx.id}
        testID={`tx-${tx.id}`}
        style={[styles.txRow, { borderBottomColor: colors.border }]}
      >
        <Text style={styles.txIcon}>{getTransactionIcon(tx.type)}</Text>
        <View style={styles.txInfo}>
          <Text
            style={[styles.txDesc, { color: colors.text }]}
            numberOfLines={1}
          >
            {tx.description}
          </Text>
          <Text style={[styles.txDate, { color: colors.textMuted }]}>
            {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
            {tx.counterpartyName ? ` · ${tx.counterpartyName}` : ""}
          </Text>
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: isPositive ? "#22c55e" : "#ef4444" },
          ]}
        >
          {formatAmount(tx.amount)}
        </Text>
      </View>
    );
  };

  // ─── Mission Card ─────────────────────────────────────────────
  const renderMission = (mission: Mission) => {
    const progressPercent =
      mission.target > 0
        ? Math.min(100, (mission.progress / mission.target) * 100)
        : 0;
    const isComplete = mission.progress >= mission.target;
    const isClaimed = mission.status === "claimed";

    return (
      <View
        key={mission.id}
        testID={`mission-${mission.id}`}
        style={[
          styles.missionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.missionHeader}>
          <Text style={styles.missionIcon}>{mission.icon}</Text>
          <View style={styles.missionInfo}>
            <Text style={[styles.missionTitle, { color: colors.text }]}>
              {mission.title}
            </Text>
            <Text style={[styles.missionDesc, { color: colors.textMuted }]}>
              {mission.description}
            </Text>
          </View>
          <View style={styles.missionReward}>
            <Text style={[styles.missionRewardText, { color: colors.primary }]}>
              +{mission.reward}
            </Text>
            <Text
              style={[
                styles.missionRewardCurrency,
                { color: colors.textMuted },
              ]}
            >
              IMC
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.missionProgressRow}>
          <View
            style={[
              styles.missionProgressBar,
              { backgroundColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.missionProgressFill,
                {
                  backgroundColor: isComplete ? "#22c55e" : colors.primary,
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.missionProgressText, { color: colors.textMuted }]}
          >
            {mission.progress}/{mission.target}
          </Text>
        </View>

        {/* Claim button */}
        {isComplete && !isClaimed && (
          <TouchableOpacity
            testID={`claim-${mission.id}`}
            style={[styles.claimBtn, { backgroundColor: "#22c55e" }]}
            onPress={() => handleClaimMission(mission.id)}
          >
            <Text style={styles.claimBtnText}>
              {t("wallet.claim") || "Réclamer"} 🎉
            </Text>
          </TouchableOpacity>
        )}
        {isClaimed && (
          <Text style={[styles.claimedText, { color: "#22c55e" }]}>
            ✅ {t("wallet.claimed") || "Réclamé"}
          </Text>
        )}
      </View>
    );
  };

  // ─── Section Content ──────────────────────────────────────────
  const renderSectionContent = () => {
    switch (activeSection) {
      case "transactions":
        return (
          <View testID="transactions-section">
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("wallet.allTransactions") || "Toutes les transactions"}
            </Text>
            {transactions.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t("wallet.noTransactions") || "Aucune transaction"}
              </Text>
            ) : (
              <View
                style={[
                  styles.txList,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {transactions.map(renderTransaction)}
              </View>
            )}
          </View>
        );

      case "missions":
        return (
          <View testID="missions-section">
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("wallet.dailyMissions") || "Missions du jour"}
            </Text>
            {missions.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t("wallet.noMissions") || "Aucune mission disponible"}
              </Text>
            ) : (
              missions.map(renderMission)
            )}
          </View>
        );

      case "topup":
        // Navigate to the dedicated topup screen
        router.push("/wallet/topup");
        setActiveSection("overview");
        return null;

      default:
        // Overview: recent txs + active missions
        return (
          <View testID="overview-section">
            {/* Recent transactions */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("wallet.recentTransactions") || "Récentes"}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveSection("transactions")}
              >
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {t("home.seeAll") || "Tout voir"}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.txList,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {transactions.slice(0, 3).map(renderTransaction)}
            </View>

            {/* Active missions */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("wallet.activeMissions") || "Missions actives"}
              </Text>
              <TouchableOpacity onPress={() => setActiveSection("missions")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {t("home.seeAll") || "Tout voir"}
                </Text>
              </TouchableOpacity>
            </View>
            {missions
              .filter((m) => m.status !== "claimed")
              .slice(0, 2)
              .map(renderMission)}

            {/* Quick links: Subscription & Payment methods */}
            <View style={styles.quickLinksRow}>
              <TouchableOpacity
                testID="btn-subscription"
                style={[
                  styles.quickLinkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push("/wallet/subscription")}
              >
                <Ionicons name="star" size={24} color="#f59e0b" />
                <Text style={[styles.quickLinkLabel, { color: colors.text }]}>
                  {t("wallet.subscription") || "ImuChat Pro"}
                </Text>
                <Text
                  style={[styles.quickLinkDesc, { color: colors.textMuted }]}
                >
                  {t("wallet.manageSub") || "Gérer abonnement"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-payment-methods"
                style={[
                  styles.quickLinkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push("/wallet/payment-methods")}
              >
                <Ionicons name="card" size={24} color={colors.primary} />
                <Text style={[styles.quickLinkLabel, { color: colors.text }]}>
                  {t("wallet.paymentMethods") || "Paiements"}
                </Text>
                <Text
                  style={[styles.quickLinkDesc, { color: colors.textMuted }]}
                >
                  {t("wallet.manageCards") || "Gérer cartes"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DEV-033 — Quick links row 2: new wallet screens */}
            <View style={[styles.quickLinksRow, { marginTop: 10 }]}>
              <TouchableOpacity
                testID="btn-transactions"
                style={[
                  styles.quickLinkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push("/wallet/transactions" as any)}
              >
                <Ionicons name="receipt-outline" size={24} color="#6366f1" />
                <Text style={[styles.quickLinkLabel, { color: colors.text }]}>
                  {t("wallet.historyTitle") || "Historique"}
                </Text>
                <Text
                  style={[styles.quickLinkDesc, { color: colors.textMuted }]}
                >
                  {t("wallet.historyDesc") || "Toutes les transactions"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-withdraw"
                style={[
                  styles.quickLinkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push("/wallet/withdraw" as any)}
              >
                <Ionicons name="cash-outline" size={24} color="#10b981" />
                <Text style={[styles.quickLinkLabel, { color: colors.text }]}>
                  {t("wallet.withdrawTitle") || "Retrait"}
                </Text>
                <Text
                  style={[styles.quickLinkDesc, { color: colors.textMuted }]}
                >
                  {t("wallet.withdrawDesc") || "Encaisser vos gains"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.quickLinksRow, { marginTop: 10 }]}>
              <TouchableOpacity
                testID="btn-invoices"
                style={[
                  styles.quickLinkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push("/wallet/invoices" as any)}
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#f59e0b"
                />
                <Text style={[styles.quickLinkLabel, { color: colors.text }]}>
                  {t("wallet.invoicesTitle") || "Factures"}
                </Text>
                <Text
                  style={[styles.quickLinkDesc, { color: colors.textMuted }]}
                >
                  {t("wallet.invoicesDesc") || "Reçus & factures"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-creator-settings"
                style={[
                  styles.quickLinkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push("/wallet/creator-settings" as any)}
              >
                <Ionicons name="settings-outline" size={24} color="#8b5cf6" />
                <Text style={[styles.quickLinkLabel, { color: colors.text }]}>
                  {t("wallet.creatorTitle") || "Créateur"}
                </Text>
                <Text
                  style={[styles.quickLinkDesc, { color: colors.textMuted }]}
                >
                  {t("wallet.creatorDesc") || "Paiements & fiscal"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  if (isLoading && !balance) {
    return (
      <View
        testID="wallet-loading"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="wallet-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          {t("wallet.title") || "ImuWallet"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t("wallet.subtitle") || "Gérez vos ImuCoins"}
        </Text>

        {/* Error banner */}
        {error && (
          <TouchableOpacity
            testID="wallet-error"
            style={styles.errorBanner}
            onPress={clearError}
          >
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </TouchableOpacity>
        )}

        {/* Balance */}
        {renderBalanceCard()}

        {/* Tabs */}
        {renderTabs()}

        {/* Section content */}
        {renderSectionContent()}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {},
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 16 },

  // Balance card
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  balanceActionBtn: {
    alignItems: "center",
    gap: 4,
  },
  balanceActionText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "500",
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 13, fontWeight: "500" },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  seeAll: { fontSize: 14, fontWeight: "500" },

  // Transactions
  txList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIcon: { fontSize: 22, marginRight: 12 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: "500" },
  txDate: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },

  // Missions
  missionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  missionIcon: { fontSize: 28, marginRight: 12 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 15, fontWeight: "600" },
  missionDesc: { fontSize: 12, marginTop: 2 },
  missionReward: { alignItems: "center" },
  missionRewardText: { fontSize: 16, fontWeight: "700" },
  missionRewardCurrency: { fontSize: 10, marginTop: 1 },
  missionProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  missionProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  missionProgressFill: { height: "100%", borderRadius: 3 },
  missionProgressText: { fontSize: 12, fontWeight: "500", minWidth: 30 },
  claimBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  claimBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  claimedText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  // Top-up
  topupCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 30,
    alignItems: "center",
  },
  topupText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  topupBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  topupBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  // Quick links
  quickLinksRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  quickLinkCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  quickLinkLabel: { fontSize: 14, fontWeight: "600" },
  quickLinkDesc: { fontSize: 11, textAlign: "center" },

  // Error
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#ef4444", fontSize: 13 },

  // Empty
  emptyText: { textAlign: "center", padding: 30, fontSize: 14 },
});
