/**
 * Podcasts Section Layout
 *
 * Stack layout for podcast screens:
 *  - index (catalogue + abonnements)
 *  - show (détail émission + épisodes)
 *  - player (lecteur plein écran avec vitesse, chapitres)
 *
 * Phase M5 — DEV-023 Module Podcasts
 */

import { useColors } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import React from 'react';

export default function PodcastsLayout() {
    const colors = useColors();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: '🎙️ Podcasts',
                    headerLargeTitle: true,
                }}
            />
            <Stack.Screen
                name="show"
                options={{
                    title: 'Émission',
                }}
            />
            <Stack.Screen
                name="player"
                options={{
                    title: 'Lecteur',
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}
