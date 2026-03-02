/**
 * Bots Section Layout
 *
 * Stack layout for group bots screens:
 *  - index (catalogue + installés)
 *  - [id] (détail bot / configuration)
 *  - marketplace (découvrir des bots)
 *  - moderation (logs de modération)
 *
 * Phase 3 — DEV-025 Bots de groupe
 */

import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function BotsLayout() {
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
          title: "Bots",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Détails du bot",
        }}
      />
      <Stack.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="moderation"
        options={{
          title: "Logs de modération",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
