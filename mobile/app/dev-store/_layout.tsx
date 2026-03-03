/**
 * Dev Store Section Layout (DEV-034)
 *
 * Stack layout for developer/creator portal screens:
 *  - index (developer dashboard hub)
 *  - my-apps (submitted apps list)
 *  - submit-app (app submission form)
 *  - app-detail (detailed view of a submission)
 *  - my-themes (created themes list)
 *  - theme-editor (visual theme editor)
 *  - creator-profile (developer profile & KYC)
 *  - analytics (analytics dashboard)
 *  - api-keys (API keys management)
 *  - documentation (developer docs viewer)
 */

import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function DevStoreLayout() {
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
        options={{ title: "Developer Hub", headerLargeTitle: true }}
      />
      <Stack.Screen name="my-apps" options={{ title: "Mes Apps" }} />
      <Stack.Screen
        name="submit-app"
        options={{ title: "Soumettre", presentation: "modal" }}
      />
      <Stack.Screen name="app-detail" options={{ title: "Détail App" }} />
      <Stack.Screen name="my-themes" options={{ title: "Mes Thèmes" }} />
      <Stack.Screen
        name="theme-editor"
        options={{ title: "Éditeur Thème", presentation: "modal" }}
      />
      <Stack.Screen
        name="creator-profile"
        options={{ title: "Profil Créateur" }}
      />
      <Stack.Screen name="analytics" options={{ title: "Analytics" }} />
      <Stack.Screen name="api-keys" options={{ title: "Clés API" }} />
      <Stack.Screen name="documentation" options={{ title: "Documentation" }} />
    </Stack>
  );
}
