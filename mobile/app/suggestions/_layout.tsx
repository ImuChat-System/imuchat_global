/**
 * Suggestions Section Layout
 *
 * Stack layout pour les écrans de suggestions intelligentes :
 *  - index (dashboard + smart reply demo)
 *  - templates (gestion des templates)
 *  - summaries (historique des résumés)
 *  - settings (préférences)
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function SuggestionsLayout() {
  const colors = useColors();
  const { t } = useI18n();

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
          title: t("suggestions.title") || "Suggestions IA",
        }}
      />
      <Stack.Screen
        name="templates"
        options={{
          title: t("suggestions.templates") || "Templates",
        }}
      />
      <Stack.Screen
        name="summaries"
        options={{
          title: t("suggestions.summaries") || "Résumés",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: t("suggestions.settings") || "Paramètres",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
