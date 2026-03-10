/**
 * Category Page — Feed filtré par catégorie
 * Sprint S8 Axe B — Explore & Trending
 *
 * Affiche les vidéos d'une catégorie en mode grille (3 colonnes)
 * avec pagination infinie (cursor-based).
 */

import VideoGridItem from '@/components/imufeed/VideoGridItem';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { fetchCategoryFeed } from '@/services/imufeed-api';
import { createLogger } from '@/services/logger';
import { ImuFeedVideo, VideoCategory } from '@/types/imufeed';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const logger = createLogger('CategoryScreen');

/** Labels catégories */
const CATEGORY_NAMES: Record<string, string> = {
    entertainment: 'Divertissement',
    education: 'Éducation',
    music: 'Musique',
    gaming: 'Gaming',
    sports: 'Sports',
    cooking: 'Cuisine',
    fashion: 'Mode',
    tech: 'Tech',
    comedy: 'Comédie',
    art: 'Art',
    anime: 'Anime',
    travel: 'Voyage',
    pets: 'Animaux',
    other: 'Autre',
};

export default function CategoryScreen() {
    const { cat } = useLocalSearchParams<{ cat: string }>();
    const colors = useColors();
    const spacing = useSpacing();
    const router = useRouter();

    const [videos, setVideos] = useState<ImuFeedVideo[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const category = (cat ?? 'other') as VideoCategory;
    const categoryName = CATEGORY_NAMES[category] ?? category;

    const loadInitial = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const page = await fetchCategoryFeed(category);
            setVideos(page.videos);
            setCursor(page.cursor);
            setHasMore(page.hasMore);
            setTotalCount(page.totalCount);
        } catch (err) {
            logger.error('Failed to load category feed', err);
            setError('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [category]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !cursor) return;
        try {
            setLoadingMore(true);
            const page = await fetchCategoryFeed(category, cursor);
            setVideos((prev) => [...prev, ...page.videos]);
            setCursor(page.cursor);
            setHasMore(page.hasMore);
        } catch (err) {
            logger.error('Failed to load more', err);
        } finally {
            setLoadingMore(false);
        }
    }, [category, cursor, hasMore, loadingMore]);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    // ─── Render helpers ───────────────────────────────────────

    const renderItem = useCallback(
        ({ item, index }: { item: ImuFeedVideo; index: number }) => (
            <VideoGridItem video={item} index={index} />
        ),
        [],
    );

    const keyExtractor = useCallback((item: ImuFeedVideo) => item.id, []);

    const renderFooter = useCallback(() => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }, [loadingMore, colors.primary]);

    // ─── Loading / Error ──────────────────────────────────────

    if (loading) {
        return (
            <View testID="category-loading" style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View testID="category-error" style={[styles.center, { backgroundColor: colors.background }]}>
                <Ionicons name="warning-outline" size={32} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
                <TouchableOpacity onPress={loadInitial} testID="category-retry">
                    <Text style={[styles.retryText, { color: colors.primary }]}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View testID="category-screen" style={[styles.screen, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.topBar, { paddingHorizontal: spacing.md, paddingTop: spacing.xl }]}>
                <TouchableOpacity onPress={() => router.back()} testID="category-back">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.screenTitle, { color: colors.text }]}>{categoryName}</Text>
                <Text style={[styles.countText, { color: colors.textSecondary }]}>
                    {totalCount} vidéo{totalCount !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Video Grid */}
            {videos.length === 0 ? (
                <View testID="category-empty" style={styles.center}>
                    <Ionicons name="videocam-off-outline" size={40} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Aucune vidéo dans cette catégorie
                    </Text>
                </View>
            ) : (
                <FlatList
                    testID="category-grid"
                    data={videos}
                    keyExtractor={keyExtractor}
                    numColumns={3}
                    renderItem={renderItem}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={{ paddingHorizontal: spacing.xs, paddingTop: spacing.sm }}
                    columnWrapperStyle={{ gap: 2 }}
                />
            )}
        </View>
    );
}

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
    countText: {
        fontSize: 13,
    },
    footer: {
        paddingVertical: 16,
        alignItems: 'center',
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
    emptyText: {
        fontSize: 14,
        marginTop: 8,
    },
});
