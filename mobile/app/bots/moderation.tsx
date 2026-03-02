/**
 * ModerationLogsScreen — Logs de modération d'un groupe
 *
 * Affiche les actions de modération récentes :
 * warns, mutes, kicks, bans, suppressions de message.
 *
 * Phase 3 — DEV-025 Bots de groupe
 */

import { useBots } from '@/hooks/useBots';
import { useI18n } from '@/providers/I18nProvider';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import type { ModerationLog } from '@/types/bots';
import { ModerationAction } from '@/types/bots';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// ─── Action display config ───────────────────────────────────
const ACTION_CONFIG: Record<ModerationAction, { icon: string; color: string; label: string }> = {
    [ModerationAction.WARN]: { icon: 'warning', color: '#F59E0B', label: 'Avertissement' },
    [ModerationAction.MUTE]: { icon: 'volume-mute', color: '#6366F1', label: 'Mute' },
    [ModerationAction.KICK]: { icon: 'exit-outline', color: '#EC4899', label: 'Expulsion' },
    [ModerationAction.BAN]: { icon: 'ban', color: '#EF4444', label: 'Bannissement' },
    [ModerationAction.DELETE_MESSAGE]: { icon: 'trash', color: '#8B5CF6', label: 'Message supprimé' },
    [ModerationAction.FLAG]: { icon: 'flag', color: '#F97316', label: 'Signalé' },
};

export default function ModerationScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();
    const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

    const { moderationLogs, loadModerationLogs, isLoading } = useBots(conversationId);

    useEffect(() => {
        if (conversationId) {
            loadModerationLogs();
        }
    }, [conversationId, loadModerationLogs]);

    // ── Render log item ──────────────────────────────────────────
    const renderLogItem = useCallback(({ item }: { item: ModerationLog }) => {
        const config = ACTION_CONFIG[item.action] || ACTION_CONFIG[ModerationAction.WARN];

        return (
            <View style={[styles.logItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                    <Ionicons
                        name={config.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={config.color}
                    />
                </View>
                <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                        <Text style={[styles.logAction, { color: config.color }]}>{config.label}</Text>
                        {item.isAutomatic && (
                            <View style={[styles.autoBadge, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="hardware-chip" size={10} color={colors.primary} />
                                <Text style={[styles.autoText, { color: colors.primary }]}>Auto</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.logTarget, { color: colors.text }]}>
                        {item.targetUserName}
                    </Text>
                    <Text style={[styles.logReason, { color: colors.textMuted }]} numberOfLines={2}>
                        {item.reason}
                    </Text>
                    <Text style={[styles.logDate, { color: colors.textMuted }]}>
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    }, [colors]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={moderationLogs}
                keyExtractor={item => item.id}
                renderItem={renderLogItem}
                contentContainerStyle={{ padding: spacing.md }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shield-checkmark-outline" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                {t('groupBots.noModLogs')}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logContent: {
        flex: 1,
        gap: 2,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    logAction: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    autoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
        gap: 3,
    },
    autoText: {
        fontSize: 9,
        fontWeight: '700',
    },
    logTarget: {
        fontSize: 15,
        fontWeight: '600',
    },
    logReason: {
        fontSize: 13,
        lineHeight: 18,
    },
    logDate: {
        fontSize: 11,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
