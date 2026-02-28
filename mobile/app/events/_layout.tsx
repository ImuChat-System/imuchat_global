/**
 * Events Stack Layout
 *
 * DEV-013: Events navigation stack
 */

import { useTheme } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";

export default function EventsLayout() {
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
