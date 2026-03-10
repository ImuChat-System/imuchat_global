/**
 * Sound Page — Affiche les vidéos utilisant un son donné
 *
 * Route : /imufeed/sound/[id]
 * Affiche le header (titre son, artiste, usage count)
 * puis une grille de vidéos utilisant ce son.
 *
 * Sprint S9 Axe B — Musique & Son
 */

import VideoFeedItem from '@/components/imufeed/VideoFeedItem';
import { useColors } from '@/providers/ThemeProvider';
import { fetchSoundById, fetchVideosBySound } from '@/services/imufeed/sound-service';
import { createLogger } from '@/services/logger';
import type { ImuFeedVideo, VideoSound } from '@/types/imufeed';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const logger = createLogger('SoundPage');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Component ────────────────────────────────────────────────

export default function SoundScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [sound, setSound] = useState<VideoSound | null>(null);
    const [videos, setVideos] = useState<ImuFeedVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    // ─── Fetch ──────────────────────────────────────────

    const loadData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const [soundData, videosData] = await Promise.all([
                fetchSoundById(id),
                fetchVideosBySound(id, 30),
            ]);
            setSound(soundData);
            setVideos(videosData);
        } catch (err) {
            logger.error('loadData failed', err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ─── Format duration ────────────────────────────────

    const formatDuration = (ms: number) => {
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(sec / 60);
        const rem = sec % 60;
        return `${min}:${rem.toString().padStart(2, '0')}`;
    };

    // ─── Header ─────────────────────────────────────────

    const renderHeader = useCallback(() => {
        if (!sound) return null;
        return (
            <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
                {/* Back button */}
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    accessibilityLabel="Retour"
                    accessibilityRole="button"
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Sound info */}
                <View style={styles.soundInfo}>
                    <View style={styles.soundIconContainer}>
                        <Ionicons name="musical-notes" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.soundMeta}>
                        <Text style={styles.soundTitle} numberOfLines={1}>
                            🎵 {sound.title}
                        </Text>
                        <Text style={styles.soundArtist} numberOfLines={1}>
                            {sound.artist} · {formatDuration(sound.duration_ms)}
                        </Text>
                        <Text style={styles.usageText}>
                            {sound.usage_count.toLocaleString()} vidéos
                            {sound.is_original && ' · Son original'}
                        </Text>
                    </View>
                </View>

                {/* Use this sound button */}
                <TouchableOpacity
                    style={[styles.useBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        // Navigate to create with pre-selected sound
                        router.push({
                            pathname: '/imufeed/create' as any,
                            params: { soundId: sound.id },
                        });
                    }}
                    accessibilityLabel="Utiliser ce son"
                    accessibilityRole="button"
                >
                    <Ionicons name="videocam" size={18} color="#fff" />
                    <Text style={styles.useBtnText}>Utiliser ce son</Text>
                </TouchableOpacity>
            </View>
        );
    }, [sound, colors, insets, router]);

    // ─── Render video item ──────────────────────────────

    const renderItem = useCallback(
        ({ item, index }: { item: ImuFeedVideo; index: number }) => (
            <View style={{ height: SCREEN_HEIGHT }}>
                <VideoFeedItem
                    video={item}
                    isActive={false}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted((m) => !m)}
                    onToggleLike={(videoId) => logger.debug('like', videoId)}
                />
            </View>
        ),
        [isMuted],
    );

    // ─── Loading ────────────────────────────────────────

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: '#000' }]}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    if (!sound) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: '#000' }]}>
                <Text style={styles.errorText}>Son introuvable</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.linkText, { color: colors.primary }]}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                pagingEnabled
                snapToAlignment="start"
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={[styles.center, { height: SCREEN_HEIGHT / 2 }]}>
                        <Ionicons name="musical-notes-outline" size={48} color="#666" />
                        <Text style={styles.emptyText}>
                            Aucune vidéo avec ce son
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backBtn: {
        marginBottom: 12,
    },
    soundInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    soundIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    soundMeta: {
        flex: 1,
    },
    soundTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    soundArtist: {
        color: '#ccc',
        fontSize: 14,
        marginTop: 2,
    },
    usageText: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
    },
    useBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
    },
    useBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
        marginTop: 12,
    },
    errorText: {
        color: '#999',
        fontSize: 16,
        marginBottom: 12,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
