/**
 * Gamification Layout
 *
 * Stack layout for gamification sub-screens:
 *  - index (hub with level overview + navigation)
 *  - xp-levels (XP profile & level progression)
 *  - badges (badge collection & trophies)
 *  - missions (daily / weekly / special missions)
 *  - leaderboards (global / friends rankings)
 *  - avatar (avatar skin customization)
 *  - shop (skin shop with purchase)
 *
 * Phase 3 — DEV-032
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function GamificationLayout() {
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
          title: t("gamification.title"),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="xp-levels"
        options={{ title: t("gamification.xpLevels") }}
      />
      <Stack.Screen
        name="badges"
        options={{ title: t("gamification.badges") }}
      />
      <Stack.Screen
        name="missions"
        options={{ title: t("gamification.missions") }}
      />
      <Stack.Screen
        name="leaderboards"
        options={{ title: t("gamification.leaderboards") }}
      />
      <Stack.Screen
        name="avatar"
        options={{ title: t("gamification.avatar") }}
      />
      <Stack.Screen name="shop" options={{ title: t("gamification.shop") }} />
    </Stack>
  );
}
