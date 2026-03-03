/**
 * AI Administration Section Layout (DEV-035)
 *
 * Stack layout for AI administration screens:
 *  - index (AI admin hub)
 *  - personas (manage AI personas)
 *  - memory (AI memory management)
 *  - audit-log (AI actions journal)
 *  - permissions (AI tool permissions)
 *  - auto-summary (auto-summary settings)
 *  - moderation (AI moderation config)
 */

import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function AIAdminLayout() {
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
        options={{ title: "Administration IA", headerLargeTitle: true }}
      />
      <Stack.Screen name="personas" options={{ title: "Personas IA" }} />
      <Stack.Screen name="memory" options={{ title: "Mémoire IA" }} />
      <Stack.Screen name="audit-log" options={{ title: "Journal d'audit" }} />
      <Stack.Screen name="permissions" options={{ title: "Permissions" }} />
      <Stack.Screen
        name="auto-summary"
        options={{ title: "Résumé automatique" }}
      />
      <Stack.Screen name="moderation" options={{ title: "Modération IA" }} />
    </Stack>
  );
}
