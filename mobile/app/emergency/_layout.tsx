/**
 * Emergency Section Layout
 *
 * Stack layout for emergency screens:
 *  - index (country list + geolocation)
 *  - country (detail: emergency numbers for a specific country)
 *
 * Phase 3 — Groupe 7 Services utilitaires (Feature 7.3)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function EmergencyLayout() {
  const colors = useColors();
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.danger ?? colors.primary },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("emergency.title"),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="country"
        options={{
          title: t("emergency.countryDetail"),
          presentation: "card",
        }}
      />
    </Stack>
  );
}
