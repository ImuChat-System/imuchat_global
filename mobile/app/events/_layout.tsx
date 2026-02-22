/**
 * Events Stack Layout
 *
 * DEV-013: Events navigation stack
 */

import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";

export default function EventsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? "#000" : "#fff",
        },
        headerTintColor: "#007AFF",
        headerTitleStyle: {
          color: isDark ? "#fff" : "#000",
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    />
  );
}
