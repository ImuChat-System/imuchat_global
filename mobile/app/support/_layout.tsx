/**
 * Support & Assistance Layout
 *
 * Stack layout for support sub-screens:
 *  - index (hub with navigation)
 *  - help-center (knowledge base & articles)
 *  - faq (interactive FAQ)
 *  - tickets (support ticket list + create)
 *  - chat-support (live human chat)
 *  - incidents (platform status)
 *  - roadmap (public roadmap + votes)
 *  - feedback (user feedback form)
 *  - beta-features (toggle beta features)
 *
 * Phase 3 — DEV-031
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function SupportLayout() {
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
          title: t("support.title"),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="help-center"
        options={{ title: t("support.helpCenter") }}
      />
      <Stack.Screen name="faq" options={{ title: t("support.faq") }} />
      <Stack.Screen name="tickets" options={{ title: t("support.tickets") }} />
      <Stack.Screen
        name="chat-support"
        options={{ title: t("support.chatSupport") }}
      />
      <Stack.Screen
        name="incidents"
        options={{ title: t("support.incidents") }}
      />
      <Stack.Screen name="roadmap" options={{ title: t("support.roadmap") }} />
      <Stack.Screen
        name="feedback"
        options={{ title: t("support.feedback") }}
      />
      <Stack.Screen
        name="beta-features"
        options={{ title: t("support.betaFeatures") }}
      />
    </Stack>
  );
}
