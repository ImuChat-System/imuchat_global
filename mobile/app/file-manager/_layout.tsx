/**
 * File Manager & Storage — Stack Layout (DEV-037)
 */
import { Stack } from "expo-router";

import { useColors } from "@/providers/ThemeProvider";

export default function FileManagerLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mon Drive" }} />
      <Stack.Screen name="my-files" options={{ title: "Mes Fichiers" }} />
      <Stack.Screen name="shared" options={{ title: "Partagés" }} />
      <Stack.Screen name="favorites" options={{ title: "Favoris" }} />
      <Stack.Screen name="trash" options={{ title: "Corbeille" }} />
      <Stack.Screen name="sync" options={{ title: "Synchronisation" }} />
      <Stack.Screen name="upload" options={{ title: "Upload" }} />
    </Stack>
  );
}
