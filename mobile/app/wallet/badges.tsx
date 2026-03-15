/**
 * Badges Screen — Sprint M-F1
 *
 * Collection de badges financiers avec progression et récompenses.
 * Route : /wallet/badges (Expo Router)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { useFinanceHubStore } from "@/stores/finance-hub-store";
import type { BadgeReward } from "@/types/finance-hub";
import { BADGE_RARITY_CONFIG, formatImuCoins } from "@/types/finance-hub";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BadgesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { badges, isLoading, loadBadges, claimBadge } = useFinanceHubStore();

  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
  }, [loadBadges]);

  const handleClaim = useCallback(
    async (badgeId: string) => {
      setClaimingId(badgeId);
      await claimBadge(badgeId);
      setClaimingId(null);
    },
    [claimBadge],
  );

  // ── Stats header ──
  const claimedCount = badges.filter((b) => b.claimedAt).length;
  const unclaimedCount = badges.filter((b) => !b.claimedAt).length;
  const totalRewards = badges
    .filter((b) => b.claimedAt)
    .reduce((sum, b) => sum + b.rewardIc, 0);

  const renderHeader = () => (
    <View
      testID="badges-header"
      style={[
        styles.header,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.headerStat}>
        <Text style={[styles.headerValue, { color: colors.primary }]}>
          {badges.length}
        </Text>
        <Text style={[styles.headerLabel, { color: colors.textMuted }]}>
          {t("financeHub.totalBadges") || "Total"}
        </Text>
      </View>
      <View style={styles.headerStat}>
        <Text style={[styles.headerValue, { color: "#22c55e" }]}>
          {claimedCount}
        </Text>
        <Text style={[styles.headerLabel, { color: colors.textMuted }]}>
          {t("financeHub.claimed") || "Réclamés"}
        </Text>
      </View>
      <View style={styles.headerStat}>
        <Text style={[styles.headerValue, { color: "#f59e0b" }]}>
          {unclaimedCount}
        </Text>
        <Text style={[styles.headerLabel, { color: colors.textMuted }]}>
          {t("financeHub.unclaimed") || "En attente"}
        </Text>
      </View>
      <View style={styles.headerStat}>
        <Text style={[styles.headerValue, { color: "#8b5cf6" }]}>
          {formatImuCoins(totalRewards)}
        </Text>
        <Text style={[styles.headerLabel, { color: colors.textMuted }]}>
          {t("financeHub.totalRewards") || "Gagnés"}
        </Text>
      </View>
    </View>
  );

  // ── Badge Card ──
  const renderBadge = ({ item }: { item: BadgeReward }) => {
    const rarityConfig = BADGE_RARITY_CONFIG[item.rarity];
    const canClaim = !item.claimedAt;
    const isClaiming = claimingId === item.badgeId;

    return (
      <View
        testID={`badge-${item.badgeId}`}
        style={[
          styles.badgeCard,
          {
            backgroundColor: colors.surface,
            borderColor: rarityConfig.color + "40",
          },
        ]}
      >
        <View style={styles.badgeTop}>
          <Text style={styles.badgeEmoji}>{item.badgeEmoji}</Text>
          <View
            style={[
              styles.rarityTag,
              { backgroundColor: rarityConfig.color + "20" },
            ]}
          >
            <Text style={[styles.rarityText, { color: rarityConfig.color }]}>
              {rarityConfig.label}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.badgeName, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.badgeName}
        </Text>
        <Text style={[styles.badgeReward, { color: colors.textMuted }]}>
          {formatImuCoins(item.rewardIc)}
        </Text>

        {canClaim ? (
          <TouchableOpacity
            testID={`claim-badge-${item.badgeId}`}
            style={[styles.claimBtn, { backgroundColor: rarityConfig.color }]}
            onPress={() => handleClaim(item.badgeId)}
            disabled={isClaiming}
          >
            {isClaiming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.claimText}>
                {t("financeHub.claimReward") || "Réclamer"}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.claimedTag}>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text style={[styles.claimedText, { color: "#22c55e" }]}>
              {t("financeHub.rewardClaimed") || "Réclamé"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ═══ RENDER ═══
  if (isLoading && badges.length === 0) {
    return (
      <View
        testID="badges-loading"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      testID="badges-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={badges}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View testID="badges-empty" style={styles.empty}>
            <Text style={styles.emptyIcon}>🏅</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("financeHub.noBadges") || "Aucun badge pour le moment"}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              {t("financeHub.noBadgesDesc") ||
                "Complétez des missions pour gagner des badges"}
            </Text>
          </View>
        }
        renderItem={renderBadge}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 40 },
  row: { justifyContent: "space-between", paddingHorizontal: 16 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  headerStat: { alignItems: "center" },
  headerValue: { fontSize: 20, fontWeight: "800" },
  headerLabel: { fontSize: 11, marginTop: 4 },

  // Badge Card
  badgeCard: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    maxWidth: "47%",
  },
  badgeTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  badgeEmoji: { fontSize: 36 },
  rarityTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  rarityText: { fontSize: 10, fontWeight: "700" },
  badgeName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  badgeReward: { fontSize: 12, marginBottom: 10 },

  // Claim
  claimBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  claimText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  claimedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
  },
  claimedText: { fontSize: 13, fontWeight: "600" },

  // Empty
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  emptySubtext: { fontSize: 13 },
});
