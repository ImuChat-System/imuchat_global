/**
 * Advanced Settings Layout
 *
 * Stack layout for advanced settings sub-screens:
 *  - index (overview with navigation to sub-sections)
 *  - notifications (granular notification settings)
 *  - sound (sound & ambient settings)
 *  - performance (low mode, animations, cache)
 *  - data-usage (mobile data limits, download policies)
 *  - accessibility (reduce motion, contrast, font size)
 *  - languages (multi-i18n detailed)
 *  - region (timezone, date/time format)
 *  - integrations (API keys & third-party integrations)
 *  - webhooks (webhook management)
 *
 * Paramètres globaux avancés — Phase 3
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function AdvancedSettingsLayout() {
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
          title: t("advancedSettings.title"),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: t("advancedSettings.notifications") }}
      />
      <Stack.Screen
        name="sound"
        options={{ title: t("advancedSettings.sound") }}
      />
      <Stack.Screen
        name="performance"
        options={{ title: t("advancedSettings.performance") }}
      />
      <Stack.Screen
        name="data-usage"
        options={{ title: t("advancedSettings.dataUsage") }}
      />
      <Stack.Screen
        name="accessibility"
        options={{ title: t("advancedSettings.accessibility") }}
      />
      <Stack.Screen
        name="languages"
        options={{ title: t("advancedSettings.languages") }}
      />
      <Stack.Screen
        name="region"
        options={{ title: t("advancedSettings.region") }}
      />
      <Stack.Screen
        name="integrations"
        options={{ title: t("advancedSettings.integrations") }}
      />
      <Stack.Screen
        name="webhooks"
        options={{ title: t("advancedSettings.webhooks") }}
      />
    </Stack>
  );
}
