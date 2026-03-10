/**
 * MusicSelector — Sélecteur de son pour l'éditeur vidéo
 *
 * Permet de :
 * - Naviguer par catégorie (Trending, genres)
 * - Rechercher un son
 * - Prévisualiser un son (play/pause)
 * - Sélectionner un son pour la vidéo
 *
 * Sprint S9 Axe B — Musique & Son
 */

import { useColors, useSpacing } from '@/providers/ThemeProvider';
import {
    fetchSoundsByGenre,
    fetchTrendingSounds,
    searchSounds,
    SOUND_GENRES,
} from '@/services/imufeed/sound-service';
import type { VideoSound } from '@/types/imufeed';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────

interface MusicSelectorProps {
    /** Son actuellement sélectionné */
    currentSound?: VideoSound | null;
    /** Callback quand un son est sélectionné */
    onSelect: (sound: VideoSound) => void;
    /** Callback pour fermer le sélecteur */
    onClose: () => void;
}

// ─── Genre labels ─────────────────────────────────────────────

const GENRE_LABELS: Record<string, string> = {
    trending: '🔥 Tendances',
    electronic: '🎧 Électronique',
    hiphop: '🎤 Hip-Hop',
    pop: '🎵 Pop',
    jpop: '🇯🇵 J-Pop',
    kpop: '🇰🇷 K-Pop',
    afrobeat: '🌍 Afrobeat',
    classical: '🎻 Classique',
    rock: '🎸 Rock',
    rnb: '🎶 R&B',
    reggaeton: '💃 Reggaeton',
    other: '📁 Autres',
};

// ─── Component ────────────────────────────────────────────────

export default function MusicSelector({
    currentSound,
    onSelect,
    onClose,
}: MusicSelectorProps) {
    const colors = useColors();
    const spacing = useSpacing();

    const [selectedGenre, setSelectedGenre] = useState<string>('trending');
    const [sounds, setSounds] = useState<VideoSound[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewingId, setPreviewingId] = useState<string | null>(null);

    const soundRef = useRef<Audio.Sound | null>(null);

    // ─── Fetch sounds on genre change ──────────────

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const result =
                    selectedGenre === 'trending'
                        ? await fetchTrendingSounds(30)
                        : await fetchSoundsByGenre(selectedGenre, 30);
                if (!cancelled) setSounds(result);
            } catch {
                if (!cancelled) setSounds([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        if (!searchQuery) load();
        return () => { cancelled = true; };
    }, [selectedGenre, searchQuery]);

    // ─── Search ────────────────────────────────────

    useEffect(() => {
        if (!searchQuery.trim()) return;
        let cancelled = false;
        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const result = await searchSounds(searchQuery.trim(), 30);
                if (!cancelled) setSounds(result);
            } catch {
                if (!cancelled) setSounds([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 400); // debounce
        return () => { cancelled = true; clearTimeout(timeout); };
    }, [searchQuery]);

    // ─── Preview playback ──────────────────────────

    const stopPreview = useCallback(async () => {
        if (soundRef.current) {
            await soundRef.current.stopAsync().catch(() => {});
            await soundRef.current.unloadAsync().catch(() => {});
            soundRef.current = null;
        }
        setPreviewingId(null);
    }, []);

    const togglePreview = useCallback(
        async (sound: VideoSound) => {
            if (previewingId === sound.id) {
                await stopPreview();
                return;
            }

            await stopPreview();
            try {
                const { sound: audioSound } = await Audio.Sound.createAsync(
                    { uri: sound.audio_url },
                    { shouldPlay: true, volume: 0.8 },
                );
                soundRef.current = audioSound;
                setPreviewingId(sound.id);

                // Auto-stop after 15 seconds (preview)
                setTimeout(() => {
                    if (soundRef.current === audioSound) {
                        stopPreview();
                    }
                }, 15000);
            } catch {
                setPreviewingId(null);
            }
        },
        [previewingId, stopPreview],
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => { stopPreview(); };
    }, [stopPreview]);

    // ─── Format duration ───────────────────────────

    const formatDuration = (ms: number) => {
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(sec / 60);
        const rem = sec % 60;
        return `${min}:${rem.toString().padStart(2, '0')}`;
    };

    // ─── Render sound item ─────────────────────────

    const renderSoundItem = useCallback(
        ({ item }: { item: VideoSound }) => {
            const isActive = currentSound?.id === item.id;
            const isPreviewing = previewingId === item.id;

            return (
                <TouchableOpacity
                    style={[
                        styles.soundItem,
                        {
                            backgroundColor: isActive
                                ? `${colors.primary}20`
                                : colors.surface,
                            borderColor: isActive ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={() => {
                        stopPreview();
                        onSelect(item);
                    }}
                    accessibilityLabel={`Sélectionner ${item.title} par ${item.artist}`}
                    accessibilityRole="button"
                >
                    {/* Preview button */}
                    <TouchableOpacity
                        style={[styles.previewBtn, { backgroundColor: colors.primary }]}
                        onPress={() => togglePreview(item)}
                        accessibilityLabel={isPreviewing ? 'Arrêter la prévisualisation' : 'Prévisualiser'}
                        accessibilityRole="button"
                    >
                        <Ionicons
                            name={isPreviewing ? 'pause' : 'play'}
                            size={16}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={styles.soundInfo}>
                        <Text
                            style={[styles.soundTitle, { color: colors.text }]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        <Text
                            style={[styles.soundArtist, { color: colors.textSecondary }]}
                            numberOfLines={1}
                        >
                            {item.artist} · {formatDuration(item.duration_ms)}
                        </Text>
                    </View>

                    {/* Usage count */}
                    <Text style={[styles.usageCount, { color: colors.textSecondary }]}>
                        🎵 {item.usage_count}
                    </Text>

                    {/* Selected indicator */}
                    {isActive && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                </TouchableOpacity>
            );
        },
        [colors, currentSound, previewingId, onSelect, stopPreview, togglePreview],
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
                <TouchableOpacity
                    onPress={onClose}
                    accessibilityLabel="Fermer"
                    accessibilityRole="button"
                >
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                    Choisir un son
                </Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Search bar */}
            <View style={[styles.searchContainer, { paddingHorizontal: spacing.md }]}>
                <View
                    style={[
                        styles.searchBar,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                >
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Rechercher un son..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Genre tabs */}
            {!searchQuery && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.genreTabs}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}
                >
                    {SOUND_GENRES.map((genre) => (
                        <TouchableOpacity
                            key={genre}
                            style={[
                                styles.genreTab,
                                {
                                    backgroundColor:
                                        selectedGenre === genre
                                            ? colors.primary
                                            : colors.surface,
                                    borderColor:
                                        selectedGenre === genre
                                            ? colors.primary
                                            : colors.border,
                                },
                            ]}
                            onPress={() => setSelectedGenre(genre)}
                        >
                            <Text
                                style={[
                                    styles.genreLabel,
                                    {
                                        color:
                                            selectedGenre === genre
                                                ? '#fff'
                                                : colors.text,
                                    },
                                ]}
                            >
                                {GENRE_LABELS[genre] ?? genre}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Sound list */}
            {loading ? (
                <ActivityIndicator
                    style={styles.loader}
                    color={colors.primary}
                    size="large"
                />
            ) : (
                <FlatList
                    data={sounds}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSoundItem}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 40 }}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {searchQuery
                                ? 'Aucun résultat pour cette recherche'
                                : 'Aucun son disponible'}
                        </Text>
                    }
                />
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    searchContainer: {
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 40,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    genreTabs: {
        maxHeight: 44,
        marginBottom: 8,
    },
    genreTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    genreLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    loader: {
        marginTop: 40,
    },
    soundItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        gap: 10,
    },
    previewBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    soundInfo: {
        flex: 1,
    },
    soundTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    soundArtist: {
        fontSize: 12,
        marginTop: 2,
    },
    usageCount: {
        fontSize: 11,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
    },
});
