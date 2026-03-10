/**
 * ArenaWidgetContent — Contenu widget Arena (2×1)
 *
 * Affiche le rang, les points et le prochain concours actif.
 * Données issues du fetcher `fetchArenaData`.
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

export default function ArenaWidgetContent({ data }: Props) {
    const colors = useColors();
    const spacing = useSpacing();
    const rank = (data.rank as number | undefined) ?? null;
    const points = (data.points as number | undefined) ?? 0;
    const activeTournaments = (data.activeTournaments as number | undefined) ?? 0;
    const nextContest = (data.nextContest as string | undefined) ?? null;

    return (
        <View style={styles.container} testID="widget-arena-content">
            {activeTournaments === 0 && rank === null ? (
                <View style={styles.empty}>
                    <Ionicons name="trophy-outline" size={24} color={colors.textSecondary} testID="icon-trophy-outline" />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                        Aucun concours
                    </Text>
                </View>
            ) : (
                <View style={styles.stats}>
                    <View style={styles.statRow}>
                        <Ionicons name="medal" size={16} color="#FFD700" testID="icon-medal" />
                        <Text style={[styles.statValue, { color: colors.text, marginLeft: spacing.xs }]}>
                            {rank !== null ? `#${rank}` : '—'}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}> rang</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Ionicons name="star" size={16} color="#FF9500" testID="icon-star" />
                        <Text style={[styles.statValue, { color: colors.text, marginLeft: spacing.xs }]}>
                            {points}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}> pts</Text>
                    </View>
                    {nextContest && (
                        <Text
                            style={[styles.nextContest, { color: colors.primary, marginTop: spacing.xs }]}
                            numberOfLines={1}
                        >
                            Prochain : {nextContest}
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
    stats: { flex: 1, justifyContent: 'center' },
    statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    statValue: { fontSize: 15, fontWeight: '700' },
    statLabel: { fontSize: 12 },
    nextContest: { fontSize: 11, fontWeight: '600' },
});
