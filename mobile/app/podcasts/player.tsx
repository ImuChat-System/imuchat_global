/**
 * PlayerScreen — Lecteur podcast plein écran
 *
 * Fonctionnalités :
 * - Pochette grand format
 * - Contrôles play/pause, avancer/reculer (30s / 15s)
 * - Barre de progression avec seek
 * - Sélecteur de vitesse (0.5x → 2x)
 * - Chapitres (si disponibles)
 * - Bouton ajouter à la queue / télécharger
 *
 * Phase M5 — DEV-023 Module Podcasts
 */

import { useI18n } from '@/providers/I18nProvider';
import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { usePodcastStore } from '@/stores/podcast-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import type { PlaybackSpeed, PodcastChapter } from '@/types/podcast';

const SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function PlayerScreen() {
    const colors = useColors();
    const spacing = useSpacing();
    const { t } = useI18n();
    const router = useRouter();
    const [showChapters, setShowChapters] = useState(false);

    const {
        currentEpisode,
        currentShow,
        isPlaying,
        positionMs,
        durationMs,
        isBuffering,
        playbackSpeed,
        chapters,
        togglePlayPause,
        seekTo,
        seekForward,
        seekBackward,
        setSpeed,
        stopPlayback,
        markDownloaded,
        formatDuration,
    } = usePodcastStore();

    const progressPercent = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

    const handleSeekFromBar = useCallback((event: any) => {
        if (durationMs <= 0) return;
        const { locationX } = event.nativeEvent;
        const barWidth = event.nativeEvent.target ? 300 : 300; // Approximate
        const percent = Math.max(0, Math.min(locationX / barWidth, 1));
        seekTo(Math.floor(percent * durationMs));
    }, [durationMs, seekTo]);

    const handleCycleSpeed = useCallback(() => {
        const idx = SPEEDS.indexOf(playbackSpeed);
        const nextIdx = (idx + 1) % SPEEDS.length;
        setSpeed(SPEEDS[nextIdx]);
    }, [playbackSpeed, setSpeed]);

    const handleClose = useCallback(async () => {
        router.back();
    }, [router]);

    const handleStop = useCallback(async () => {
        await stopPlayback();
        router.back();
    }, [stopPlayback, router]);

    const handleDownload = useCallback(() => {
        if (currentEpisode) {
            markDownloaded(currentEpisode);
        }
    }, [currentEpisode, markDownloaded]);

    // ─── Chapter row ────────────────────────────────────────
    const renderChapterRow = (chapter: PodcastChapter) => {
        const isCurrent = positionMs >= chapter.start_ms && positionMs < chapter.end_ms;
        return (
            <TouchableOpacity
                key={chapter.id}
                style={[
                    styles.chapterRow,
                    { borderBottomColor: colors.border },
                    isCurrent && { backgroundColor: colors.surface },
                ]}
                onPress={() => seekTo(chapter.start_ms)}
            >
                <Ionicons
                    name={isCurrent ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={isCurrent ? colors.primary : colors.textMuted}
                />
                <View style={styles.chapterInfo}>
                    <Text style={[styles.chapterTitle, { color: isCurrent ? colors.primary : colors.text }]}>
                        {chapter.title}
                    </Text>
                    <Text style={[styles.chapterTime, { color: colors.textMuted }]}>
                        {formatDuration(chapter.start_ms)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (!currentEpisode || !currentShow) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
                <Ionicons name="headset-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    {t('podcast.noEpisodePlaying')}
                </Text>
                <TouchableOpacity
                    style={[styles.goBackBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.goBackText}>{t('podcast.browsePodcasts')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            testID="podcast-player-screen"
        >
            {/* Close button */}
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} testID="podcast-player-close">
                <Ionicons name="chevron-down" size={28} color={colors.text} />
            </TouchableOpacity>

            {/* Artwork */}
            <View style={styles.artworkContainer}>
                {currentEpisode.artwork_url || currentShow.artwork_url ? (
                    <Image
                        source={{ uri: currentEpisode.artwork_url || currentShow.artwork_url || '' }}
                        style={styles.artwork}
                    />
                ) : (
                    <View style={[styles.artwork, styles.artworkPlaceholder, { backgroundColor: colors.surface }]}>
                        <Ionicons name="mic" size={80} color={colors.primary} />
                    </View>
                )}
            </View>

            {/* Title & Show */}
            <Text style={[styles.episodeTitle, { color: colors.text }]} numberOfLines={2}>
                {currentEpisode.title}
            </Text>
            <Text style={[styles.showTitle, { color: colors.textMuted }]} numberOfLines={1}>
                {currentShow.title} — {currentShow.author}
            </Text>

            {/* Progress bar */}
            <TouchableOpacity
                testID="podcast-progress-bar"
                style={[styles.progressBarContainer, { backgroundColor: colors.border }]}
                onPress={handleSeekFromBar}
                activeOpacity={0.9}
            >
                <View
                    style={[
                        styles.progressBarFill,
                        { backgroundColor: colors.primary, width: `${progressPercent}%` },
                    ]}
                />
            </TouchableOpacity>

            {/* Time labels */}
            <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {formatDuration(positionMs)}
                </Text>
                <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    -{formatDuration(Math.max(0, durationMs - positionMs))}
                </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {/* Rewind 15s */}
                <TouchableOpacity testID="podcast-rewind" onPress={() => seekBackward(15)}>
                    <Ionicons name="play-back" size={32} color={colors.text} />
                    <Text style={[styles.seekLabel, { color: colors.textMuted }]}>15</Text>
                </TouchableOpacity>

                {/* Play/Pause */}
                <TouchableOpacity
                    testID="podcast-play-pause"
                    style={[styles.playBtn, { backgroundColor: colors.primary }]}
                    onPress={togglePlayPause}
                >
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={36}
                        color="#fff"
                    />
                </TouchableOpacity>

                {/* Forward 30s */}
                <TouchableOpacity testID="podcast-forward" onPress={() => seekForward(30)}>
                    <Ionicons name="play-forward" size={32} color={colors.text} />
                    <Text style={[styles.seekLabel, { color: colors.textMuted }]}>30</Text>
                </TouchableOpacity>
            </View>

            {/* Speed + Actions */}
            <View style={styles.actionsRow}>
                {/* Speed selector */}
                <TouchableOpacity
                    testID="podcast-speed-btn"
                    style={[styles.speedBtn, { borderColor: colors.border }]}
                    onPress={handleCycleSpeed}
                >
                    <Text style={[styles.speedText, { color: colors.text }]}>
                        {playbackSpeed}x
                    </Text>
                </TouchableOpacity>

                {/* Chapters toggle */}
                {chapters.length > 0 && (
                    <TouchableOpacity
                        testID="podcast-chapters-btn"
                        style={[styles.actionBtn, { borderColor: colors.border }]}
                        onPress={() => setShowChapters(!showChapters)}
                    >
                        <Ionicons name="list" size={20} color={colors.text} />
                        <Text style={[styles.actionText, { color: colors.text }]}>
                            {t('podcast.chapters')}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Download */}
                <TouchableOpacity
                    testID="podcast-download-btn"
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                    onPress={handleDownload}
                >
                    <Ionicons
                        name={currentEpisode.is_downloaded ? 'cloud-done' : 'cloud-download-outline'}
                        size={20}
                        color={currentEpisode.is_downloaded ? colors.primary : colors.text}
                    />
                </TouchableOpacity>

                {/* Stop */}
                <TouchableOpacity
                    testID="podcast-stop-btn"
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                    onPress={handleStop}
                >
                    <Ionicons name="stop-circle-outline" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Buffering indicator */}
            {isBuffering && (
                <Text style={[styles.bufferingText, { color: colors.textMuted }]}>
                    {t('podcast.buffering')}
                </Text>
            )}

            {/* Chapters list */}
            {showChapters && chapters.length > 0 && (
                <View style={[styles.chaptersSection, { marginHorizontal: spacing.md }]}>
                    <Text style={[styles.chaptersTitle, { color: colors.text }]}>
                        {t('podcast.chapters')} ({chapters.length})
                    </Text>
                    {chapters.map(renderChapterRow)}
                </View>
            )}
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: 40, alignItems: 'center' },

    // Close
    closeBtn: { alignSelf: 'center', paddingVertical: 12 },

    // Artwork
    artworkContainer: { marginVertical: 20 },
    artwork: { width: 280, height: 280, borderRadius: 16 },
    artworkPlaceholder: { justifyContent: 'center', alignItems: 'center' },

    // Title
    episodeTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', paddingHorizontal: 24 },
    showTitle: { fontSize: 15, textAlign: 'center', marginTop: 4, paddingHorizontal: 24 },

    // Progress
    progressBarContainer: { height: 6, borderRadius: 3, marginTop: 24, marginHorizontal: 24, width: '85%' },
    progressBarFill: { height: 6, borderRadius: 3 },

    // Time
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '85%', marginTop: 4, paddingHorizontal: 4 },
    timeText: { fontSize: 12 },

    // Controls
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 36 },
    playBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    seekLabel: { fontSize: 10, textAlign: 'center', marginTop: -2 },

    // Actions
    actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 12 },
    speedBtn: {
        borderWidth: 1.5,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    speedText: { fontSize: 15, fontWeight: '700' },
    actionBtn: {
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: { fontSize: 13 },

    // Buffering
    bufferingText: { fontSize: 13, marginTop: 12 },

    // Empty
    emptyText: { fontSize: 16, marginTop: 16 },
    goBackBtn: { marginTop: 24, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
    goBackText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    // Chapters
    chaptersSection: { marginTop: 24, width: '100%' },
    chaptersTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
    chapterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 10,
    },
    chapterInfo: { flex: 1 },
    chapterTitle: { fontSize: 14, fontWeight: '500' },
    chapterTime: { fontSize: 12, marginTop: 2 },
});
