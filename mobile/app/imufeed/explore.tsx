/**
 * Explore Page — Page exploration ImuFeed
 * Sprint S8 Axe B — Explore & Trending
 *
 * Sections : Trending hashtags, Top créateurs, Top vidéos (grille), Challenges actifs.
 * Toggle mode grille (3 colonnes) / liste.
 */

import VideoGridItem from '@/components/imufeed/VideoGridItem';
import { useI18n } from '@/providers/I18nProvider';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { fetchExploreData } from '@/services/imufeed-api';
import { createLogger } from '@/services/logger';
import {
    ExploreFeedData,
    ImuFeedVideo,
    TopCreator,
    TrendingHashtagScore,
    VideoHashtag,
} from '@/types/imufeed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const logger = createLogger('ExploreScreen');

// ─── Sub-components ───────────────────────────────────────────

/** Section header réutilisable */
function SectionHeader({
    title,
    icon,
    onSeeAll,
}: {
    title: string;
    icon: string;
    onSeeAll?: () => void;
}) {
    const colors = useColors();
    const spacing = useSpacing();

    return (
        <View style={[styles.sectionHeader, { paddingHorizontal: spacing.md }]}>
            <View style={styles.sectionHeaderLeft}>
                <Ionicons name={icon as any} size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.xs }]}>
                    {title}
                </Text>
            </View>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} testID={`see-all-${title}`}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

/** Chip trending hashtag avec score */
function TrendingChip({ item, onPress }: { item: TrendingHashtagScore; onPress: () => void }) {
    const colors = useColors();
    const spacing = useSpacing();
    return (
        <TouchableOpacity
            testID={`trending-chip-${item.name}`}
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.chip, { backgroundColor: colors.primary + '15', borderRadius: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}
        >
            <Text style={[styles.chipText, { color: colors.primary }]}>#{item.name}</Text>
            <Text style={[styles.chipScore, { color: colors.textSecondary }]}>
                {Math.round(item.score)}
            </Text>
        </TouchableOpacity>
    );
}

/** Carte créateur */
function CreatorCard({ creator, onPress }: { creator: TopCreator; onPress: () => void }) {
    const colors = useColors();
    const spacing = useSpacing();
    return (
        <TouchableOpacity
            testID={`creator-card-${creator.id}`}
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.creatorCard, { backgroundColor: colors.card, borderRadius: spacing.md, padding: spacing.sm }]}
        >
            {creator.avatar_url ? (
                <Image source={{ uri: creator.avatar_url }} style={styles.creatorAvatar} />
            ) : (
                <View style={[styles.creatorAvatar, { backgroundColor: colors.surface }]}>
                    <Ionicons name="person" size={20} color={colors.textSecondary} />
                </View>
            )}
            <Text style={[styles.creatorName, { color: colors.text }]} numberOfLines={1}>
                {creator.display_name ?? creator.username}
            </Text>
            <Text style={[styles.creatorStats, { color: colors.textSecondary }]}>
                {creator.weekly_likes} ❤️
            </Text>
            {creator.is_verified && (
                <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
            )}
        </TouchableOpacity>
    );
}

/** Chip challenge actif */
function ChallengeChip({ item, onPress }: { item: VideoHashtag; onPress: () => void }) {
    const colors = useColors();
    const spacing = useSpacing();
    return (
        <TouchableOpacity
            testID={`challenge-chip-${item.name}`}
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.challengeChip, { backgroundColor: colors.success + '20', borderRadius: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}
        >
            <Ionicons name="trophy-outline" size={14} color={colors.success} />
            <Text style={[styles.chipText, { color: colors.success, marginLeft: 4 }]}>#{item.name}</Text>
        </TouchableOpacity>
    );
}

// ─── Main Component ───────────────────────────────────────────

export default function ExploreScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();
    const router = useRouter();

    const [data, setData] = useState<ExploreFeedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gridMode, setGridMode] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const exploreData = await fetchExploreData();
            setData(exploreData);
        } catch (err) {
            logger.error('Failed to load explore data', err);
            setError('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const navigateToHashtag = useCallback(
        (name: string) => {
            router.push(`/imufeed/hashtag/${encodeURIComponent(name)}` as any);
        },
        [router],
    );

    const navigateToCreator = useCallback(
        (id: string) => {
            router.push(`/imufeed/profile/${id}` as any);
        },
        [router],
    );

    const navigateToCategory = useCallback(
        (cat: string) => {
            router.push(`/imufeed/category/${cat}` as any);
        },
        [router],
    );

    const toggleGridMode = useCallback(() => {
        setGridMode((prev) => !prev);
    }, []);

    // ─── Loading / Error ──────────────────────────────────────

    if (loading) {
        return (
            <View testID="explore-loading" style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !data) {
        return (
            <View testID="explore-error" style={[styles.center, { backgroundColor: colors.background }]}>
                <Ionicons name="warning-outline" size={32} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
                <TouchableOpacity onPress={loadData} testID="explore-retry">
                    <Text style={[styles.retryText, { color: colors.primary }]}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ─── Render ───────────────────────────────────────────────

    return (
        <ScrollView
            testID="explore-screen"
            style={[styles.screen, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
            {/* Header */}
            <View style={[styles.topBar, { paddingHorizontal: spacing.md, paddingTop: spacing.xl }]}>
                <TouchableOpacity onPress={() => router.back()} testID="explore-back">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.screenTitle, { color: colors.text }]}>Explorer</Text>
                <TouchableOpacity onPress={toggleGridMode} testID="explore-toggle-grid">
                    <Ionicons
                        name={gridMode ? 'list-outline' : 'grid-outline'}
                        size={22}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>

            {/* Trending Hashtags */}
            {data.trendingHashtags.length > 0 && (
                <View style={{ marginTop: spacing.md }}>
                    <SectionHeader title="Tendances" icon="flame-outline" />
                    <FlatList
                        testID="trending-hashtags-list"
                        data={data.trendingHashtags}
                        keyExtractor={(item) => item.hashtag_id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.md }}
                        ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
                        renderItem={({ item }) => (
                            <TrendingChip item={item} onPress={() => navigateToHashtag(item.name)} />
                        )}
                    />
                </View>
            )}

            {/* Top Creators */}
            {data.topCreators.length > 0 && (
                <View style={{ marginTop: spacing.lg }}>
                    <SectionHeader title="Top créateurs" icon="people-outline" />
                    <FlatList
                        testID="top-creators-list"
                        data={data.topCreators}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.md }}
                        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
                        renderItem={({ item }) => (
                            <CreatorCard creator={item} onPress={() => navigateToCreator(item.id)} />
                        )}
                    />
                </View>
            )}

            {/* Top Videos (grid or list) */}
            {data.topVideos.length > 0 && (
                <View style={{ marginTop: spacing.lg }}>
                    <SectionHeader title="Top vidéos" icon="videocam-outline" />
                    {gridMode ? (
                        <View testID="video-grid" style={[styles.videoGrid, { paddingHorizontal: spacing.xs }]}>
                            {data.topVideos.map((video: ImuFeedVideo, idx: number) => (
                                <VideoGridItem key={video.id} video={video} index={idx} />
                            ))}
                        </View>
                    ) : (
                        <FlatList
                            testID="video-list"
                            data={data.topVideos}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    testID={`video-list-item-${item.id}`}
                                    onPress={() => router.push(`/imufeed?videoId=${item.id}` as any)}
                                    style={[styles.listItem, { backgroundColor: colors.card, padding: spacing.sm, borderRadius: spacing.sm }]}
                                >
                                    {item.thumbnail_url && (
                                        <Image source={{ uri: item.thumbnail_url }} style={styles.listThumb} />
                                    )}
                                    <View style={styles.listInfo}>
                                        <Text style={[styles.listCaption, { color: colors.text }]} numberOfLines={2}>
                                            {item.caption}
                                        </Text>
                                        <Text style={[styles.listStats, { color: colors.textSecondary }]}>
                                            {item.views_count} vues · {item.likes_count} ❤️
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
                        />
                    )}
                </View>
            )}

            {/* Active Challenges */}
            {data.activeChallenges.length > 0 && (
                <View style={{ marginTop: spacing.lg }}>
                    <SectionHeader title="Challenges actifs" icon="trophy-outline" />
                    <FlatList
                        testID="active-challenges-list"
                        data={data.activeChallenges}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.md }}
                        ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
                        renderItem={({ item }) => (
                            <ChallengeChip item={item} onPress={() => navigateToHashtag(item.name)} />
                        )}
                    />
                </View>
            )}

            {/* Category shortcuts */}
            <View style={{ marginTop: spacing.lg }}>
                <SectionHeader title="Catégories" icon="apps-outline" />
                <View style={[styles.categoryGrid, { paddingHorizontal: spacing.md }]}>
                    {CATEGORY_LABELS.map(([cat, label, icon]) => (
                        <TouchableOpacity
                            key={cat}
                            testID={`category-chip-${cat}`}
                            onPress={() => navigateToCategory(cat)}
                            activeOpacity={0.7}
                            style={[styles.categoryChip, { backgroundColor: colors.card, borderRadius: spacing.sm, padding: spacing.sm }]}
                        >
                            <Ionicons name={icon as any} size={18} color={colors.primary} />
                            <Text style={[styles.categoryLabel, { color: colors.text }]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

// ─── Constants ────────────────────────────────────────────────

const CATEGORY_LABELS: [string, string, string][] = [
    ['entertainment', 'Divertissement', 'happy-outline'],
    ['education', 'Éducation', 'school-outline'],
    ['music', 'Musique', 'musical-notes-outline'],
    ['gaming', 'Gaming', 'game-controller-outline'],
    ['sports', 'Sports', 'football-outline'],
    ['cooking', 'Cuisine', 'restaurant-outline'],
    ['fashion', 'Mode', 'shirt-outline'],
    ['tech', 'Tech', 'hardware-chip-outline'],
    ['comedy', 'Comédie', 'happy-outline'],
    ['art', 'Art', 'color-palette-outline'],
    ['anime', 'Anime', 'sparkles-outline'],
    ['travel', 'Voyage', 'airplane-outline'],
    ['pets', 'Animaux', 'paw-outline'],
    ['other', 'Autre', 'ellipsis-horizontal-outline'],
];

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '600',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    chipScore: {
        fontSize: 11,
    },
    creatorCard: {
        alignItems: 'center',
        width: 100,
    },
    creatorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    creatorName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    creatorStats: {
        fontSize: 11,
    },
    challengeChip: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    videoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    listThumb: {
        width: 80,
        height: 60,
        borderRadius: 6,
    },
    listInfo: {
        flex: 1,
        marginLeft: 10,
    },
    listCaption: {
        fontSize: 14,
        fontWeight: '500',
    },
    listStats: {
        fontSize: 12,
        marginTop: 2,
    },
    errorText: {
        fontSize: 14,
        marginTop: 8,
    },
    retryText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: '30%',
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
});
