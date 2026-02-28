/**
 * Group Settings Stack Layout
 *
 * DEV-014: Group settings navigation
 */

import { useTheme } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";

export default function GroupSettingsLayout() {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: false,
      }}
    />
  );
}
