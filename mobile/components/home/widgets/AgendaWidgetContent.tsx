/**
 * AgendaWidgetContent — Contenu widget Agenda (2×1)
 *
 * Affiche les prochains événements/réunions de l'utilisateur.
 * Données issues du fetcher `fetchAgendaData` (table events).
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

interface UpcomingEvent {
    id: string;
    title: string;
    start_at: string;
}

function formatEventTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / 60_000);

    if (diffMin < 0) return 'passé';
    if (diffMin < 60) return `${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}j`;
}

export default function AgendaWidgetContent({ data }: Props) {
    const colors = useColors();
    const spacing = useSpacing();
    const upcoming = (data.upcoming as UpcomingEvent[] | undefined) ?? [];

    return (
        <View style={styles.container} testID="widget-agenda-content">
            {upcoming.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} testID="icon-calendar-outline" />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                        Aucun événement
                    </Text>
                </View>
            ) : (
                upcoming.slice(0, 3).map((evt) => (
                    <View key={evt.id} style={[styles.eventRow, { marginBottom: spacing.xs }]}>
                        <Ionicons name="ellipse" size={8} color={colors.primary} />
                        <Text
                            style={[styles.eventTitle, { color: colors.text, marginLeft: spacing.xs }]}
                            numberOfLines={1}
                        >
                            {evt.title}
                        </Text>
                        <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                            {formatEventTime(evt.start_at)}
                        </Text>
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    empty: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    emptyText: { fontSize: 12 },
    eventRow: { flexDirection: 'row', alignItems: 'center' },
    eventTitle: { fontSize: 13, flex: 1 },
    eventTime: { fontSize: 11, marginLeft: 4 },
});
