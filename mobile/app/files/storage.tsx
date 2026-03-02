/**
 * Files Storage — DEV-020
 *
 * Écran d'utilisation du stockage : barre de quota,
 * répartition par catégorie, statistiques générales.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useI18n } from '@/providers/I18nProvider';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { useFilesStore } from '@/stores/files-store';
import { formatFileSize, getFileColor, getFileIcon } from '@/services/files-api';

const CATEGORY_ORDER = ['image', 'video', 'audio', 'document', 'pdf', 'spreadsheet', 'presentation', 'archive', 'code', 'other'] as const;

export default function FilesStorageScreen() {
    const { t } = useI18n();
    const colors = useColors();
    const spacing = useSpacing();
    const router = useRouter();

    const storageUsage = useFilesStore(s => s.storageUsage);
    const loadStorageUsage = useFilesStore(s => s.loadStorageUsage);
    const isLoading = useFilesStore(s => s.isLoading);

    useEffect(() => {
        loadStorageUsage();
    }, [loadStorageUsage]);

    const usedPct = storageUsage ? Math.min((storageUsage.used / storageUsage.total) * 100, 100) : 0;
    const usedStr = storageUsage ? formatFileSize(storageUsage.used) : '0 B';
    const totalStr = storageUsage ? formatFileSize(storageUsage.total) : '5 GB';

    const categories = useMemo(() => {
        if (!storageUsage) return [];
        return CATEGORY_ORDER
            .filter(cat => (storageUsage.by_category[cat] || 0) > 0)
            .map(cat => ({
                key: cat,
                size: storageUsage.by_category[cat] || 0,
                pct: ((storageUsage.by_category[cat] || 0) / storageUsage.total) * 100,
                color: getFileColor(cat),
                icon: getFileIcon(cat),
            }));
    }, [storageUsage]);

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.xl + 20,
            paddingBottom: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: spacing.sm,
        },
        headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
        mainCard: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            margin: spacing.md,
            padding: spacing.lg,
            alignItems: 'center',
        },
        circleOuter: {
            width: 140,
            height: 140,
            borderRadius: 70,
            borderWidth: 10,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
        },
        circleInner: { alignItems: 'center' },
        pctText: { fontSize: 28, fontWeight: '700', color: colors.text },
        pctLabel: { fontSize: 12, color: colors.textSecondary },
        usageText: { fontSize: 14, color: colors.text, marginTop: spacing.sm },
        usageLight: { color: colors.textSecondary },
        barContainer: {
            width: '100%',
            height: 12,
            backgroundColor: colors.border,
            borderRadius: 6,
            marginTop: spacing.md,
            overflow: 'hidden',
            flexDirection: 'row',
        },
        barSegment: { height: 12 },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: spacing.md,
            width: '100%',
        },
        statItem: { alignItems: 'center' },
        statValue: { fontSize: 18, fontWeight: '600', color: colors.text },
        statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
        section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
        sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
        catItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 10,
            padding: spacing.sm,
            marginBottom: spacing.xs,
            gap: spacing.sm,
        },
        catIcon: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        catInfo: { flex: 1 },
        catName: { fontSize: 14, fontWeight: '500', color: colors.text },
        catSize: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
        catBar: {
            height: 4,
            borderRadius: 2,
            marginTop: 4,
        },
        catPct: { fontSize: 13, fontWeight: '600', color: colors.text, width: 48, textAlign: 'right' },
        tipCard: {
            backgroundColor: colors.primary + '10',
            borderRadius: 12,
            padding: spacing.md,
            marginHorizontal: spacing.md,
            marginBottom: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        tipText: { flex: 1, fontSize: 13, color: colors.text },
    }), [colors, spacing]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>{t('files.storageTitle')}</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Main usage card */}
                <View style={styles.mainCard}>
                    <View style={[styles.circleOuter, { borderColor: usedPct > 80 ? '#EF5350' : usedPct > 60 ? '#FFA726' : colors.primary }]}>
                        <View style={styles.circleInner}>
                            <Text style={styles.pctText}>{usedPct.toFixed(1)}%</Text>
                            <Text style={styles.pctLabel}>{t('files.used')}</Text>
                        </View>
                    </View>

                    <Text style={styles.usageText}>
                        {usedStr}{' '}
                        <Text style={styles.usageLight}>{t('files.of')} {totalStr}</Text>
                    </Text>

                    {/* Segmented bar */}
                    <View style={styles.barContainer}>
                        {categories.map(cat => (
                            <View
                                key={cat.key}
                                style={[styles.barSegment, { width: `${cat.pct}%`, backgroundColor: cat.color }]}
                            />
                        ))}
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{storageUsage?.file_count || 0}</Text>
                            <Text style={styles.statLabel}>{t('files.totalFiles')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{storageUsage?.folder_count || 0}</Text>
                            <Text style={styles.statLabel}>{t('files.totalFolders')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{categories.length}</Text>
                            <Text style={styles.statLabel}>{t('files.categories')}</Text>
                        </View>
                    </View>
                </View>

                {/* Category breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('files.breakdown')}</Text>
                    {categories.map(cat => (
                        <View key={cat.key} style={styles.catItem}>
                            <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                                <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                            </View>
                            <View style={styles.catInfo}>
                                <Text style={styles.catName}>{t(`files.cat_${cat.key}`)}</Text>
                                <Text style={styles.catSize}>{formatFileSize(cat.size)}</Text>
                                <View style={[styles.catBar, { width: `${Math.max(cat.pct, 2)}%`, backgroundColor: cat.color }]} />
                            </View>
                            <Text style={styles.catPct}>{cat.pct.toFixed(1)}%</Text>
                        </View>
                    ))}
                </View>

                {/* Tip */}
                <View style={styles.tipCard}>
                    <Ionicons name="bulb-outline" size={22} color={colors.primary} />
                    <Text style={styles.tipText}>{t('files.storageTip')}</Text>
                </View>
            </ScrollView>
        </View>
    );
}
