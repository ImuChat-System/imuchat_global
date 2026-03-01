/**
 * Alice Section Layout
 *
 * Stack layout for Alice AI assistant screens:
 *  - index (conversations list)
 *  - chat (conversation chat)
 *  - settings (provider configuration)
 *
 * Phase 3 — DEV-024 Module IA
 */

import { useColors } from "@/providers/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function AliceLayout() {
    const colors = useColors();

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
                    title: "Alice",
                    headerLargeTitle: true,
                }}
            />
            <Stack.Screen
                name="chat"
                options={{
                    title: "Alice",
                }}
            />
            <Stack.Screen
                name="settings"
                options={{
                    title: "Configuration IA",
                    presentation: "modal",
                }}
            />
        </Stack>
    );
}
