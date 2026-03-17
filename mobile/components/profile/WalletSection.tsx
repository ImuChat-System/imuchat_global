/**
 * WalletSection — Section Wallet dans le profil
 *
 * Affiche le solde ImuCoins et 3 boutons d'action rapide :
 * Recharger / Historique / Envoyer.
 *
 * Sprint S13 Axe A — Profil enrichi
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface WalletSectionProps {
  balance: number;
  onTopUp: () => void;
  onHistory: () => void;
  onSend: () => void;
}

// ─── Quick Actions ────────────────────────────────────────────

const WALLET_ACTIONS = [
  {
    key: "topup",
    label: "Recharger",
    icon: "add-circle-outline" as const,
    emoji: "💳",
  },
  {
    key: "history",
    label: "Historique",
    icon: "time-outline" as const,
    emoji: "📜",
  },
  {
    key: "send",
    label: "Envoyer",
    icon: "paper-plane-outline" as const,
    emoji: "📤",
  },
] as const;

// ─── Component ────────────────────────────────────────────────

export default function WalletSection({
  balance,
  onTopUp,
  onHistory,
  onSend,
}: WalletSectionProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const handlers: Record<string, () => void> = {
    topup: onTopUp,
    history: onHistory,
    send: onSend,
  };

  return (
    <View
      testID="wallet-section"
      style={[
        styles.container,
        { backgroundColor: colors.surface, marginHorizontal: spacing.md },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>💰 Wallet</Text>
      </View>

      {/* Balance */}
      <View style={styles.balanceRow}>
        <Text style={[styles.balanceValue, { color: colors.text }]}>
          {balance.toLocaleString()}
        </Text>
        <Text style={[styles.balanceCurrency, { color: colors.textMuted }]}>
          ImuCoins
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {WALLET_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            testID={`wallet-action-${action.key}`}
            style={[styles.actionBtn, { backgroundColor: colors.background }]}
            onPress={handlers[action.key]}
          >
            <Ionicons name={action.icon} size={20} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "800",
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
