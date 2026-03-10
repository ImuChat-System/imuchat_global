/**
 * GamingWidgetContent — Contenu widget Gaming (2×1)
 *
 * Affiche la dernière partie jouée et les stats de jeu.
 * Données issues du fetcher `fetchGamingData`.
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

interface RecentGame {
    name: string;
    score: number;
    played_at: string;
}

function formatPlayedAt(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.round(diffMs / 3_600_000);
    if (hours < 1) return 'maintenant';
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.round(hours / 24);
    return `il y a ${days}j`;
}

export default function GamingWidgetContent({ data }: Props) {
    const colors = useColors();
    const spacing = useSpacing();
    const recentGame = (data.recentGame as RecentGame | undefined) ?? null;
    const totalGames = (data.totalGames as number | undefined) ?? 0;

    return (
        <View style={styles.container} testID="widget-gaming-content">
            {!recentGame ? (
                <View style={styles.empty}>
                    <Ionicons name="game-controller-outline" size={24} color={colors.textSecondary} testID="icon-game-controller-outline" />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                        Aucune partie
                    </Text>
                </View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.gameRow}>
                        <Ionicons name="game-controller" size={16} color={colors.primary} testID="icon-game-controller" />
                        <Text
                            style={[styles.gameName, { color: colors.text, marginLeft: spacing.xs }]}
                            numberOfLines={1}
                        >
                            {recentGame.name}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.score, { color: colors.primary }]}>
                            {recentGame.score} pts
                        </Text>
                        <Text style={[styles.time, { color: colors.textSecondary }]}>
                            {formatPlayedAt(recentGame.played_at)}
                        </Text>
                    </View>
                    {totalGames > 0 && (
                        <Text style={[styles.totalGames, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                            {totalGames} partie{totalGames > 1 ? 's' : ''} jouée{totalGames > 1 ? 's' : ''}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    empty: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    emptyText: { fontSize: 12 },
    content: { flex: 1, justifyContent: 'center' },
    gameRow: { flexDirection: 'row', alignItems: 'center' },
    gameName: { fontSize: 14, fontWeight: '600', flex: 1 },
    detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    score: { fontSize: 13, fontWeight: '700' },
    time: { fontSize: 11 },
    totalGames: { fontSize: 11 },
});
