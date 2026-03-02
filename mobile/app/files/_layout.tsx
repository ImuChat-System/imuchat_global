/**
 * Files Layout — DEV-020
 * Stack navigation pour le module Docs & Storage
 */

import { Stack } from "expo-router";
import React from "react";

import { useColors } from "@/providers/ThemeProvider";

export default function FilesLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "My Drive", headerShown: false }}
      />
      <Stack.Screen
        name="preview"
        options={{ title: "Preview", presentation: "modal" }}
      />
      <Stack.Screen
        name="share"
        options={{ title: "Share", presentation: "modal" }}
      />
      <Stack.Screen name="trash" options={{ title: "Trash" }} />
      <Stack.Screen name="activity" options={{ title: "Activity" }} />
      <Stack.Screen name="storage" options={{ title: "Storage" }} />
    </Stack>
  );
}
