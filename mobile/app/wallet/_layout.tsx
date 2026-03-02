/**
 * Wallet Section Layout
 *
 * Stack layout for wallet screens:
 *  - index (overview, balance, transactions, missions)
 *  - topup (top-up ImuCoins via Stripe)
 *  - subscription (ImuChat Pro/Premium plans)
 *  - payment-methods (manage cards & payment methods)
 *
 * Phase M4 + DEV-028 Stripe
 */

import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function WalletLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "ImuWallet",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="topup"
        options={{
          title: "Recharger",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: "ImuChat Pro",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="payment-methods"
        options={{
          title: "Moyens de paiement",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
