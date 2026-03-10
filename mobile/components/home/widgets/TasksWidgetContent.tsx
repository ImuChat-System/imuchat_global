/**
 * TasksWidgetContent — Contenu widget Tâches (2×1)
 *
 * Affiche les tâches du jour en attente.
 * Données issues du fetcher `fetchTasksData`.
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

export default function TasksWidgetContent({ data }: Props) {
    const colors = useColors();
    const spacing = useSpacing();
    const pendingCount = (data.pendingCount as number | undefined) ?? 0;

    return (
        <View style={styles.container} testID="widget-tasks-content">
            {pendingCount === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" testID="icon-checkmark-circle" />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                        Tout est fait !
                    </Text>
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={[styles.count, { color: colors.primary }]}>
                        {pendingCount}
                    </Text>
                    <Text style={[styles.label, { color: colors.text }]}>
                        tâche{pendingCount > 1 ? 's' : ''} en attente
                    </Text>
                    <Ionicons
                        name="checkbox-outline"
                        size={16}
                        color={colors.textSecondary}
                        style={{ marginTop: 4 }}
                        testID="icon-checkbox-outline"
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    emptyText: { fontSize: 12 },
    content: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    count: { fontSize: 28, fontWeight: '700' },
    label: { fontSize: 12, marginTop: 2 },
});
