/**
 * ShowScreen — Détail d'une émission podcast
 *
 * Affiche :
 * - Pochette + titre + auteur
 * - Bouton abonnement
 * - Liste des épisodes avec durée et état (lu / en cours / non lu)
 * - Possibilité de lancer un épisode ou de l'ajouter à la queue
 *
 * Phase M5 — DEV-023 Module Podcasts
 */

import { useI18n } from '@/providers/I18nProvider';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { usePodcastStore } from '@/stores/podcast-store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import * as PodcastAPI from '@/services/podcast-api';
import type { PodcastEpisode, PodcastShow } from '@/types/podcast';

export default function ShowScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();
    const router = useRouter();
    const { showId } = useLocalSearchParams<{ showId: string }>();

    const {
        subscriptions,
        catalogShows,
        currentShowEpisodes,
        isLoading,
        listeningHistory,
        subscribe,
        unsubscribe,
        isSubscribed,
        loadShowEpisodes,
        playEpisode,
        addToQueue,
        formatDuration,
    } = usePodcastStore();

    // Find show from store or mock
    const show: PodcastShow | undefined =
        subscriptions.find((s) => s.id === showId)
        || catalogShows.find((s) => s.id === showId)
        || PodcastAPI.MOCK_SHOWS.find((s) => s.id === showId);

    useEffect(() => {
        if (show) {
            loadShowEpisodes(show);
        }
    }, [show?.id]);

    const subscribed = showId ? isSubscribed(showId) : false;

    const handleToggleSubscribe = useCallback(() => {
        if (!show) return;
        if (subscribed) {
            unsubscribe(show.id);
        } else {
            subscribe(show);
        }
    }, [show, subscribed, subscribe, unsubscribe]);

    const handlePlayEpisode = useCallback(async (episode: PodcastEpisode) => {
        if (!show) return;
        await playEpisode(episode, show);
        router.push('/podcasts/player');
    }, [show, playEpisode, router]);

    const handleAddToQueue = useCallback((episode: PodcastEpisode) => {
        addToQueue(episode);
    }, [addToQueue]);

    const getEpisodeStatus = (episode: PodcastEpisode) => {
        const entry = listeningHistory.find((h) => h.episode.id === episode.id);
        if (!entry) return 'new';
        if (entry.episode.is_played) return 'played';
        if (entry.last_position_ms > 0) return 'in-progress';
        return 'new';
    };

    const getResumeText = (episode: PodcastEpisode) => {
        const entry = listeningHistory.find((h) => h.episode.id === episode.id);
        if (!entry || entry.last_position_ms === 0) return null;
        const remaining = episode.duration_ms - entry.last_position_ms;
        return `${formatDuration(remaining)} ${t('podcast.remaining')}`;
    };

    // ─── Episode row ────────────────────────────────────────
    const renderEpisodeRow = ({ item: episode }: { item: PodcastEpisode }) => {
        const status = getEpisodeStatus(episode);
        const resumeText = getResumeText(episode);

        return (
            <View
                testID={`podcast-episode-${episode.id}`}
                style={[styles.episodeRow, { borderBottomColor: colors.border }]}
            >
                <TouchableOpacity
                    style={styles.episodePlayBtn}
                    onPress={() => handlePlayEpisode(episode)}
                >
                    <Ionicons
                        name={status === 'played' ? 'checkmark-circle' : 'play-circle'}
                        size={36}
                        color={status === 'played' ? colors.textMuted : colors.primary}
                    />
                </TouchableOpacity>

                <View style={styles.episodeInfo}>
                    <Text
                        style={[
                            styles.episodeTitle,
                            { color: status === 'played' ? colors.textMuted : colors.text },
                        ]}
                        numberOfLines={2}
                    >
                        {episode.episode_number ? `Ép. ${episode.episode_number} — ` : ''}
                        {episode.title}
                    </Text>
                    <Text style={[styles.episodeDate, { color: colors.textMuted }]}>
                        {new Date(episode.published_at).toLocaleDateString()}
                        {'  •  '}
                        {formatDuration(episode.duration_ms)}
                    </Text>
                    {resumeText && (
                        <Text style={[styles.episodeResume, { color: colors.primary }]}>
                            {resumeText}
                        </Text>
                    )}
                    {episode.is_downloaded && (
                        <View style={styles.downloadBadge}>
                            <Ionicons name="cloud-done" size={14} color={colors.primary} />
                            <Text style={[styles.downloadText, { color: colors.primary }]}>
                                {t('podcast.downloaded')}
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.episodeMenuBtn}
                    onPress={() => handleAddToQueue(episode)}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
        );
    };

    if (!show) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textMuted }}>{t('podcast.showNotFound')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]} testID="podcast-show-screen">
            <FlatList
                data={currentShowEpisodes}
                keyExtractor={(item) => item.id}
                renderItem={renderEpisodeRow}
                ListHeaderComponent={
                    <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
                        {/* Artwork + Info */}
                        <View style={styles.headerTop}>
                            {show.artwork_url ? (
                                <Image source={{ uri: show.artwork_url }} style={styles.headerArtwork} />
                            ) : (
                                <View style={[styles.headerArtwork, styles.artworkPlaceholder, { backgroundColor: colors.surface }]}>
                                    <Ionicons name="mic" size={48} color={colors.primary} />
                                </View>
                            )}
                            <View style={styles.headerInfo}>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>
                                    {show.title}
                                </Text>
                                <Text style={[styles.headerAuthor, { color: colors.textMuted }]}>
                                    {show.author}
                                </Text>
                                <Text style={[styles.headerEpisodes, { color: colors.textMuted }]}>
                                    {show.episode_count} {t('podcast.episodes')}
                                </Text>
                            </View>
                        </View>

                        {/* Description */}
                        <Text style={[styles.headerDescription, { color: colors.text }]} numberOfLines={4}>
                            {show.description}
                        </Text>

                        {/* Subscribe button */}
                        <TouchableOpacity
                            testID="podcast-subscribe-btn"
                            style={[
                                styles.subscribeBtn,
                                {
                                    backgroundColor: subscribed ? colors.surface : colors.primary,
                                    borderColor: colors.primary,
                                },
                            ]}
                            onPress={handleToggleSubscribe}
                        >
                            <Ionicons
                                name={subscribed ? 'checkmark' : 'add'}
                                size={20}
                                color={subscribed ? colors.primary : '#fff'}
                            />
                            <Text style={[
                                styles.subscribeBtnText,
                                { color: subscribed ? colors.primary : '#fff' },
                            ]}>
                                {subscribed ? t('podcast.subscribed') : t('podcast.subscribe')}
                            </Text>
                        </TouchableOpacity>

                        {/* Episodes header */}
                        <Text style={[styles.episodesHeader, { color: colors.text }]}>
                            {t('podcast.allEpisodes')}
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        {isLoading ? t('podcast.loading') : t('podcast.noEpisodes')}
                    </Text>
                }
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },

    // Header
    header: { paddingTop: 16, paddingBottom: 8 },
    headerTop: { flexDirection: 'row', marginBottom: 12 },
    headerArtwork: { width: 120, height: 120, borderRadius: 12 },
    artworkPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    headerAuthor: { fontSize: 15, marginTop: 4 },
    headerEpisodes: { fontSize: 13, marginTop: 4 },
    headerDescription: { fontSize: 14, lineHeight: 20, marginBottom: 16 },

    // Subscribe
    subscribeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        borderWidth: 1.5,
        paddingVertical: 10,
        paddingHorizontal: 24,
        marginBottom: 20,
        gap: 6,
    },
    subscribeBtnText: { fontSize: 15, fontWeight: '600' },

    // Episodes
    episodesHeader: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
    episodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    episodePlayBtn: { marginRight: 12 },
    episodeInfo: { flex: 1 },
    episodeTitle: { fontSize: 15, fontWeight: '600' },
    episodeDate: { fontSize: 12, marginTop: 4 },
    episodeResume: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    downloadBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    downloadText: { fontSize: 11, fontWeight: '500' },
    episodeMenuBtn: { padding: 8 },

    // Empty
    emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
});
