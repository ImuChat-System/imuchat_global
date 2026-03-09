/**
 * WalletWidgetContent — Contenu widget Wallet (1×1)
 * Affiche le solde ImuCoins et la devise
 *
 * Sprint S7 Axe A — Widgets Core
 */

import { useColors } from "@/providers/ThemeProvider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: Record<string, unknown>;
}

function formatBalance(balance: number): string {
  if (balance >= 1_000_000) return `${(balance / 1_000_000).toFixed(1)}M`;
  if (balance >= 1_000) return `${(balance / 1_000).toFixed(1)}K`;
  return balance.toLocaleString();
}

export default function WalletWidgetContent({ data }: Props) {
  const colors = useColors();
  const balance = typeof data.balance === "number" ? data.balance : 0;
  const currency = typeof data.currency === "string" ? data.currency : "XAF";

  return (
    <View style={styles.container} testID="widget-wallet-content">
      <Text style={[styles.balance, { color: colors.text }]} numberOfLines={1}>
        {formatBalance(balance)}
      </Text>
      <Text style={[styles.currency, { color: colors.textSecondary }]}>
        {currency}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  balance: {
    fontSize: 22,
    fontWeight: "700",
  },
  currency: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
