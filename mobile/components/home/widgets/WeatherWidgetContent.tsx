/**
 * WeatherWidgetContent — Contenu widget Météo (1×1)
 *
 * Affiche la température et les conditions météo.
 * Données issues du fetcher `fetchWeatherData`.
 *
 * Sprint S8 Axe A — Widgets Modules + Gestion
 */

import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
    data: Record<string, unknown>;
}

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly_cloudy';

const WEATHER_ICONS: Record<WeatherCondition, { name: string; color: string }> = {
    sunny: { name: 'sunny', color: '#FFD700' },
    cloudy: { name: 'cloudy', color: '#9E9E9E' },
    rainy: { name: 'rainy', color: '#42A5F5' },
    stormy: { name: 'thunderstorm', color: '#7E57C2' },
    snowy: { name: 'snow', color: '#90CAF9' },
    partly_cloudy: { name: 'partly-sunny', color: '#FFA726' },
};

export default function WeatherWidgetContent({ data }: Props) {
    const colors = useColors();
    const spacing = useSpacing();
    const temp = (data.temp as number | undefined) ?? null;
    const condition = (data.condition as WeatherCondition | undefined) ?? null;
    const city = (data.city as string | undefined) ?? null;

    const weatherStyle = condition ? WEATHER_ICONS[condition] : null;

    return (
        <View style={styles.container} testID="widget-weather-content">
            {temp === null ? (
                <View style={styles.empty}>
                    <Ionicons name="cloud-offline-outline" size={24} color={colors.textSecondary} testID="icon-cloud-offline-outline" />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                        Indisponible
                    </Text>
                </View>
            ) : (
                <View style={styles.content}>
                    <Ionicons
                        name={(weatherStyle?.name ?? 'partly-sunny') as keyof typeof Ionicons.glyphMap}
                        size={28}
                        color={weatherStyle?.color ?? colors.primary}
                        testID={`icon-${weatherStyle?.name ?? 'partly-sunny'}`}
                    />
                    <Text style={[styles.temp, { color: colors.text }]}>
                        {Math.round(temp)}°
                    </Text>
                    {city && (
                        <Text style={[styles.city, { color: colors.textSecondary }]} numberOfLines={1}>
                            {city}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    emptyText: { fontSize: 11 },
    content: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    temp: { fontSize: 24, fontWeight: '700', marginTop: 4 },
    city: { fontSize: 11, marginTop: 2 },
});
