/**
 * Filter & Sticker Service — Bibliothèque de filtres et stickers
 *
 * Fournit :
 * - 22 filtres built-in (7 classic, 6 manga/anime, 9 ambiance)
 * - Récupération de packs stickers depuis Supabase
 * - Récupération de stickers individuels
 *
 * Sprint S10 Axe B — Filtres, Stickers & Effets
 */

import { createLogger } from '@/services/logger';
import { supabase } from '@/services/supabase';
import type {
    Sticker,
    StickerPack,
    VideoFilter,
    VideoFilterCategory,
} from '@/types/imufeed';

const logger = createLogger('FilterService');

// ─── Built-in Filters (22 filtres) ───────────────────────────

export const BUILT_IN_FILTERS: VideoFilter[] = [
    // === Classic (7) ===
    {
        id: 'none',
        name: 'Original',
        category: 'classic',
        previewStyle: {},
        thumbnailColor: '#888888',
        requiresAI: false,
    },
    {
        id: 'vivid',
        name: 'Vivid',
        category: 'classic',
        previewStyle: { brightness: 1.1, contrast: 1.2, saturate: 1.4 },
        thumbnailColor: '#FF6B35',
        requiresAI: false,
    },
    {
        id: 'warm',
        name: 'Warm',
        category: 'classic',
        previewStyle: { brightness: 1.05, saturate: 1.2, hueRotate: -10 },
        thumbnailColor: '#E8A87C',
        requiresAI: false,
    },
    {
        id: 'cool',
        name: 'Cool',
        category: 'classic',
        previewStyle: { brightness: 1.05, saturate: 0.9, hueRotate: 20 },
        thumbnailColor: '#85C1E9',
        requiresAI: false,
    },
    {
        id: 'bw',
        name: 'Noir & Blanc',
        category: 'classic',
        previewStyle: { saturate: 0, contrast: 1.2 },
        thumbnailColor: '#333333',
        requiresAI: false,
    },
    {
        id: 'vintage',
        name: 'Vintage',
        category: 'classic',
        previewStyle: { sepia: 0.5, brightness: 0.95, contrast: 1.1 },
        thumbnailColor: '#C39B77',
        requiresAI: false,
    },
    {
        id: 'high_contrast',
        name: 'High Contrast',
        category: 'classic',
        previewStyle: { contrast: 1.6, brightness: 1.05 },
        thumbnailColor: '#1A1A1A',
        requiresAI: false,
    },

    // === Manga / Anime (6) ===
    {
        id: 'manga_sketch',
        name: 'Manga Sketch',
        category: 'manga',
        previewStyle: { saturate: 0, contrast: 2.0, brightness: 1.3 },
        thumbnailColor: '#2C3E50',
        requiresAI: true,
    },
    {
        id: 'anime_soft',
        name: 'Anime Soft',
        category: 'manga',
        previewStyle: { saturate: 1.6, brightness: 1.15, contrast: 0.9 },
        thumbnailColor: '#FF85A2',
        requiresAI: true,
    },
    {
        id: 'anime_vibrant',
        name: 'Anime Vibrant',
        category: 'manga',
        previewStyle: { saturate: 2.0, contrast: 1.3, brightness: 1.1 },
        thumbnailColor: '#FF4081',
        requiresAI: true,
    },
    {
        id: 'comic_halftone',
        name: 'Comic Pop',
        category: 'manga',
        previewStyle: { contrast: 1.8, saturate: 1.5, brightness: 1.1 },
        thumbnailColor: '#FFD700',
        requiresAI: true,
    },
    {
        id: 'ghibli_dream',
        name: 'Ghibli Dream',
        category: 'manga',
        previewStyle: { saturate: 1.3, brightness: 1.2, hueRotate: 10, contrast: 0.85 },
        thumbnailColor: '#87CEEB',
        requiresAI: true,
    },
    {
        id: 'cyberpunk_anime',
        name: 'Cyberpunk Anime',
        category: 'manga',
        previewStyle: { saturate: 1.8, contrast: 1.5, hueRotate: -30, brightness: 0.9 },
        thumbnailColor: '#9B59B6',
        requiresAI: true,
    },

    // === Ambiance (9) ===
    {
        id: 'golden_hour',
        name: 'Golden Hour',
        category: 'ambiance',
        previewStyle: { brightness: 1.15, saturate: 1.3, hueRotate: -15, sepia: 0.2 },
        thumbnailColor: '#F4A460',
        requiresAI: false,
    },
    {
        id: 'night_glow',
        name: 'Night Glow',
        category: 'ambiance',
        previewStyle: { brightness: 0.8, contrast: 1.3, saturate: 1.4, hueRotate: 30 },
        thumbnailColor: '#1E3A5F',
        requiresAI: false,
    },
    {
        id: 'neon',
        name: 'Neon',
        category: 'ambiance',
        previewStyle: { saturate: 2.5, contrast: 1.4, brightness: 1.1 },
        thumbnailColor: '#00FF88',
        requiresAI: false,
    },
    {
        id: 'dreamy',
        name: 'Dreamy',
        category: 'ambiance',
        previewStyle: { brightness: 1.2, saturate: 0.7, contrast: 0.8, opacity: 0.9 },
        thumbnailColor: '#DDA0DD',
        requiresAI: false,
    },
    {
        id: 'moody',
        name: 'Moody',
        category: 'ambiance',
        previewStyle: { brightness: 0.85, contrast: 1.2, saturate: 0.6 },
        thumbnailColor: '#4A4A4A',
        requiresAI: false,
    },
    {
        id: 'sunset_blush',
        name: 'Sunset Blush',
        category: 'ambiance',
        previewStyle: { brightness: 1.1, hueRotate: -20, saturate: 1.5, sepia: 0.15 },
        thumbnailColor: '#FF7F50',
        requiresAI: false,
    },
    {
        id: 'arctic',
        name: 'Arctic',
        category: 'ambiance',
        previewStyle: { brightness: 1.15, hueRotate: 40, saturate: 0.5, contrast: 1.1 },
        thumbnailColor: '#B0E0E6',
        requiresAI: false,
    },
    {
        id: 'film_grain',
        name: 'Film Grain',
        category: 'ambiance',
        previewStyle: { sepia: 0.3, contrast: 1.15, brightness: 0.95, saturate: 0.8 },
        thumbnailColor: '#A0522D',
        requiresAI: false,
    },
    {
        id: 'lo_fi',
        name: 'Lo-Fi',
        category: 'ambiance',
        previewStyle: { saturate: 0.4, contrast: 0.9, brightness: 1.1, sepia: 0.1 },
        thumbnailColor: '#DEB887',
        requiresAI: false,
    },
];

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Retourne tous les filtres d'une catégorie donnée.
 */
export function getFiltersByCategory(category: VideoFilterCategory): VideoFilter[] {
    return BUILT_IN_FILTERS.filter((f) => f.category === category);
}

/**
 * Retourne un filtre par ID.
 */
export function getFilterById(id: string): VideoFilter | undefined {
    return BUILT_IN_FILTERS.find((f) => f.id === id);
}

/**
 * Retourne toutes les catégories disponibles avec label.
 */
export const FILTER_CATEGORIES: { key: VideoFilterCategory; label: string }[] = [
    { key: 'classic', label: 'Classiques' },
    { key: 'manga', label: 'Manga / Anime' },
    { key: 'ambiance', label: 'Ambiance' },
];

// ─── Sticker Packs (depuis Supabase) ─────────────────────────

/**
 * Récupère tous les packs de stickers disponibles.
 */
export async function fetchStickerPacks(): Promise<StickerPack[]> {
    const { data, error } = await supabase
        .from('imufeed_sticker_packs')
        .select('id, name, description, thumbnail_url, is_official, is_premium, sticker_count')
        .order('is_official', { ascending: false })
        .order('download_count', { ascending: false });

    if (error) {
        logger.error('fetchStickerPacks error', error);
        return [];
    }

    return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        thumbnailUrl: row.thumbnail_url,
        isOfficial: row.is_official,
        isPremium: row.is_premium,
        stickerCount: row.sticker_count,
    }));
}

/**
 * Récupère les stickers d'un pack donné.
 */
export async function fetchStickers(packId: string): Promise<Sticker[]> {
    const { data, error } = await supabase
        .from('imufeed_stickers')
        .select('id, pack_id, name, image_url, is_animated, tags, sort_order')
        .eq('pack_id', packId)
        .order('sort_order', { ascending: true });

    if (error) {
        logger.error('fetchStickers error', error);
        return [];
    }

    return (data ?? []).map((row) => ({
        id: row.id,
        packId: row.pack_id,
        name: row.name,
        imageUrl: row.image_url,
        isAnimated: row.is_animated,
        tags: row.tags ?? [],
    }));
}
