/**
 * Stories Layout
 * Stack navigation for story-related screens
 */

import { Stack } from "expo-router";

export default function StoriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      }}
    >
      <Stack.Screen
        name="viewer"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
