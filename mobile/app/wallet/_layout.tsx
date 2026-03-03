/**
 * Wallet Section Layout
 *
 * Stack layout for wallet screens:
 *  - index (overview, balance, transactions, missions)
 *  - topup (top-up ImuCoins via Stripe)
 *  - subscription (ImuChat Pro/Premium plans)
 *  - payment-methods (manage cards & payment methods)
 *  - transactions (full history with filters) — DEV-033
 *  - withdraw (cashout & KYC) — DEV-033
 *  - invoices (invoices & receipts) — DEV-033
 *  - manage-subscriptions (plan management) — DEV-033
 *  - payment-modal (secure payment flow) — DEV-033
 *  - creator-settings (payout & tax) — DEV-033
 *
 * Phase M4 + DEV-028 Stripe + DEV-033 Wallet & Monétisation
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
      {/* DEV-033 — New screens */}
      <Stack.Screen name="transactions" options={{ title: "Historique" }} />
      <Stack.Screen
        name="withdraw"
        options={{ title: "Retrait", presentation: "modal" }}
      />
      <Stack.Screen name="invoices" options={{ title: "Factures" }} />
      <Stack.Screen
        name="manage-subscriptions"
        options={{ title: "Abonnements" }}
      />
      <Stack.Screen
        name="payment-modal"
        options={{ title: "Paiement", presentation: "modal" }}
      />
      <Stack.Screen name="creator-settings" options={{ title: "Créateur" }} />
    </Stack>
  );
}
