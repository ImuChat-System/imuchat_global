/**
 * PodcastsScreen — Page d'accueil Podcasts
 *
 * Sections :
 * - Barre de recherche
 * - Abonnements
 * - Catalogue (découverte)
 * - Historique d'écoute récent
 * - Mini-player en bas si un épisode est en cours
 *
 * Phase M5 — DEV-023 Module Podcasts
 */

import { useI18n } from '@/providers/I18nProvider';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { usePodcastStore } from '@/stores/podcast-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import type { PodcastShow } from '@/types/podcast';

export default function PodcastsScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const {
        subscriptions,
        catalogShows,
        searchResults,
        listeningHistory,
        currentEpisode,
        currentShow,
        isPlaying,
        isLoading,
        positionMs,
        durationMs,
        loadCatalogue,
        searchShows,
        togglePlayPause,
        formatDuration,
    } = usePodcastStore();

    useEffect(() => {
        loadCatalogue();
    }, [loadCatalogue]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadCatalogue();
        setRefreshing(false);
    }, [loadCatalogue]);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length >= 2) {
            await searchShows(query);
        }
    }, [searchShows]);

    const handleShowPress = useCallback((show: PodcastShow) => {
        router.push({ pathname: '/podcasts/show', params: { showId: show.id } });
    }, [router]);

    const handleMiniPlayerPress = useCallback(() => {
        router.push('/podcasts/player');
    }, [router]);

    const progressPercent = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

    // ─── Show card ──────────────────────────────────────────
    const renderShowCard = (show: PodcastShow) => (
        <TouchableOpacity
            key={show.id}
            testID={`podcast-show-${show.id}`}
            style={[styles.showCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleShowPress(show)}
        >
            {show.artwork_url ? (
                <Image source={{ uri: show.artwork_url }} style={styles.showArtwork} />
            ) : (
                <View style={[styles.showArtwork, styles.showArtworkPlaceholder, { backgroundColor: colors.surface }]}>
                    <Ionicons name="mic" size={32} color={colors.primary} />
                </View>
            )}
            <Text style={[styles.showTitle, { color: colors.text }]} numberOfLines={2}>
                {show.title}
            </Text>
            <Text style={[styles.showAuthor, { color: colors.textMuted }]} numberOfLines={1}>
                {show.author}
            </Text>
            <Text style={[styles.showEpisodes, { color: colors.textMuted }]}>
                {show.episode_count} {t('podcast.episodes')}
            </Text>
        </TouchableOpacity>
    );

    // ─── History row ────────────────────────────────────────
    const renderHistoryRow = (entry: (typeof listeningHistory)[0]) => {
        const progressPct = entry.episode.duration_ms > 0
            ? (entry.last_position_ms / entry.episode.duration_ms) * 100
            : 0;

        return (
            <TouchableOpacity
                key={entry.episode.id}
                testID={`podcast-history-${entry.episode.id}`}
                style={[styles.historyRow, { borderBottomColor: colors.border }]}
                onPress={() => handleShowPress(entry.show)}
            >
                <View style={styles.historyInfo}>
                    <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                        {entry.episode.title}
                    </Text>
                    <Text style={[styles.historyShow, { color: colors.textMuted }]} numberOfLines={1}>
                        {entry.show.title}
                    </Text>
                    {/* Progress bar */}
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { backgroundColor: colors.primary, width: `${Math.min(progressPct, 100)}%` },
                            ]}
                        />
                    </View>
                </View>
                <Text style={[styles.historyDuration, { color: colors.textMuted }]}>
                    {formatDuration(entry.episode.duration_ms - entry.last_position_ms)}
                </Text>
            </TouchableOpacity>
        );
    };

    const showsToDisplay = searchQuery.trim().length >= 2 ? searchResults : catalogShows;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]} testID="podcasts-screen">
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            >
                {/* Search bar */}
                <View style={[styles.searchBar, { backgroundColor: colors.surface, marginHorizontal: spacing.md }]}>
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        testID="podcast-search-input"
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder={t('podcast.searchPlaceholder')}
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); }}>
                            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Subscriptions */}
                {subscriptions.length > 0 && !searchQuery && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.md }]}>
                            {t('podcast.subscriptions')}
                        </Text>
                        <FlatList
                            horizontal
                            data={subscriptions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => renderShowCard(item)}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.md }}
                        />
                    </View>
                )}

                {/* Catalogue / Search results */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.md }]}>
                        {searchQuery ? t('podcast.searchResults') : t('podcast.discover')}
                    </Text>
                    <FlatList
                        horizontal
                        data={showsToDisplay}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderShowCard(item)}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.md }}
                        ListEmptyComponent={
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                {isLoading ? t('podcast.loading') : t('podcast.noResults')}
                            </Text>
                        }
                    />
                </View>

                {/* Listening history */}
                {listeningHistory.length > 0 && !searchQuery && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.md }]}>
                            {t('podcast.recentlyListened')}
                        </Text>
                        <View style={{ paddingHorizontal: spacing.md }}>
                            {listeningHistory.slice(0, 5).map(renderHistoryRow)}
                        </View>
                    </View>
                )}

                {/* Spacer for mini-player */}
                {currentEpisode && <View style={{ height: 80 }} />}
            </ScrollView>

            {/* Mini-player */}
            {currentEpisode && currentShow && (
                <TouchableOpacity
                    testID="podcast-mini-player"
                    style={[styles.miniPlayer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
                    onPress={handleMiniPlayerPress}
                >
                    <View style={styles.miniPlayerInfo}>
                        <Text style={[styles.miniPlayerTitle, { color: colors.text }]} numberOfLines={1}>
                            {currentEpisode.title}
                        </Text>
                        <Text style={[styles.miniPlayerShow, { color: colors.textMuted }]} numberOfLines={1}>
                            {currentShow.title}
                        </Text>
                        {/* Progress */}
                        <View style={[styles.miniProgressBar, { backgroundColor: colors.border }]}>
                            <View
                                style={[styles.miniProgressFill, { backgroundColor: colors.primary, width: `${progressPercent}%` }]}
                            />
                        </View>
                    </View>
                    <TouchableOpacity testID="podcast-mini-playpause" onPress={togglePlayPause}>
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={28}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Search
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 12,
        marginBottom: 8,
        gap: 8,
    },
    searchInput: { flex: 1, fontSize: 16 },

    // Sections
    section: { marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

    // Show card
    showCard: {
        width: 140,
        marginRight: 12,
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
    },
    showArtwork: { width: 124, height: 124, borderRadius: 8 },
    showArtworkPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    showTitle: { fontSize: 14, fontWeight: '600', marginTop: 8 },
    showAuthor: { fontSize: 12, marginTop: 2 },
    showEpisodes: { fontSize: 11, marginTop: 2 },

    // History
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    historyInfo: { flex: 1, marginRight: 12 },
    historyTitle: { fontSize: 15, fontWeight: '600' },
    historyShow: { fontSize: 13, marginTop: 2 },
    progressBar: { height: 3, borderRadius: 1.5, marginTop: 6 },
    progressFill: { height: 3, borderRadius: 1.5 },
    historyDuration: { fontSize: 13 },

    // Empty
    emptyText: { fontSize: 14, paddingHorizontal: 16, paddingVertical: 20 },

    // Mini-player
    miniPlayer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    miniPlayerInfo: { flex: 1, marginRight: 12 },
    miniPlayerTitle: { fontSize: 14, fontWeight: '600' },
    miniPlayerShow: { fontSize: 12, marginTop: 1 },
    miniProgressBar: { height: 2, borderRadius: 1, marginTop: 4 },
    miniProgressFill: { height: 2, borderRadius: 1 },
});
