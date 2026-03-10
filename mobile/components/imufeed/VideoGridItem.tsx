/**
 * VideoGridItem — Thumbnail grille 3 colonnes pour Explore
 * Sprint S8 Axe B — Explore & Trending
 *
 * Affiche une miniature vidéo avec overlay (vues, durée).
 */

import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { ImuFeedVideo } from '@/types/imufeed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const ITEM_GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - ITEM_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const ASPECT_RATIO = 4 / 3;

interface Props {
    video: ImuFeedVideo;
    index: number;
}

/** Formate le nombre de vues (1.2K, 3.4M, etc.) */
function formatViews(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return `${count}`;
}

/** Formate la durée en mm:ss */
function formatDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoGridItem({ video, index }: Props) {
    const colors = useColors();
    const spacing = useSpacing();
    const router = useRouter();

    const handlePress = useCallback(() => {
        router.push(`/imufeed?videoId=${video.id}` as any);
    }, [router, video.id]);

    return (
        <TouchableOpacity
            testID={`video-grid-item-${index}`}
            activeOpacity={0.8}
            onPress={handlePress}
            style={[
                styles.container,
                {
                    width: ITEM_SIZE,
                    height: ITEM_SIZE * ASPECT_RATIO,
                    marginRight: (index + 1) % NUM_COLUMNS !== 0 ? ITEM_GAP : 0,
                    marginBottom: ITEM_GAP,
                },
            ]}
        >
            {video.thumbnail_url ? (
                <Image
                    source={{ uri: video.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.thumbnail, { backgroundColor: colors.surface }]}>
                    <Ionicons name="videocam-outline" size={24} color={colors.textSecondary} />
                </View>
            )}

            {/* Overlay vues */}
            <View style={[styles.overlay, { padding: spacing.xs }]}>
                <View style={styles.viewsRow}>
                    <Ionicons name="play" size={10} color="#fff" />
                    <Text style={styles.overlayText}>{formatViews(video.views_count)}</Text>
                </View>
                {video.duration_ms > 0 && (
                    <Text style={styles.overlayText}>{formatDuration(video.duration_ms)}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

export { formatDuration, formatViews, ITEM_GAP, ITEM_SIZE, NUM_COLUMNS };

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 4,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    viewsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    overlayText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
});
