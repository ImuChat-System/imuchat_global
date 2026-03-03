/**
 * Analytics & Insights — Stack Layout (DEV-036)
 */
import { Stack } from "expo-router";
import React from "react";

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";

export default function AnalyticsInsightsLayout() {
  const colors = useColors();
  const { t } = useI18n();

  const screenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerShadowVisible: false,
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{ title: t("analyticsInsights.title") }}
      />
      <Stack.Screen
        name="engagement"
        options={{ title: t("analyticsInsights.engagement") }}
      />
      <Stack.Screen
        name="communication"
        options={{ title: t("analyticsInsights.communication") }}
      />
      <Stack.Screen
        name="social"
        options={{ title: t("analyticsInsights.social") }}
      />
      <Stack.Screen
        name="storage"
        options={{ title: t("analyticsInsights.storage") }}
      />
      <Stack.Screen
        name="heatmap"
        options={{ title: t("analyticsInsights.heatmap") }}
      />
      <Stack.Screen
        name="export"
        options={{ title: t("analyticsInsights.export") }}
      />
    </Stack>
  );
}
