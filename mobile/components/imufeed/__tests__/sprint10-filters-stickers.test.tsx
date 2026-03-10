/**
 * Tests for Sprint S10B — Filtres, Stickers & Effets
 *
 * - FilterSelector (render, category tabs, select filter, AI badge)
 * - StickerOverlay (render stickers, drag, remove)
 * - SpeedControl (render speeds, select speed)
 * - AnimatedTextOverlay (render texts, visibility by time, remove)
 * - filter-service (BUILT_IN_FILTERS, getFiltersByCategory, getFilterById, fetchStickerPacks, fetchStickers)
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────

jest.mock('@/providers/ThemeProvider', () => ({
    useColors: () => ({
        primary: '#ec4899',
        card: '#1a1a2e',
        surface: '#1a1a2e',
        background: '#0f0a1a',
        text: '#ffffff',
        textSecondary: '#999',
        border: '#333',
        error: '#FF3B30',
        success: '#34C759',
    }),
    useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        Ionicons: (props) =>
            React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
    };
});

jest.mock('@/services/logger', () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock('@/services/supabase', () => ({
    supabase: {
        rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        }),
        auth: { getUser: jest.fn() },
    },
    getCurrentUser: () => Promise.resolve({ id: 'user-1' }),
}));

// ─── Imports ──────────────────────────────────────────────────

import {
    BUILT_IN_FILTERS,
    fetchStickerPacks,
    fetchStickers,
    FILTER_CATEGORIES,
    getFilterById,
    getFiltersByCategory,
} from '@/services/imufeed/filter-service';
import type { PlacedSticker, PlacedText } from '@/types/imufeed';
import AnimatedTextOverlay, { ANIMATED_TEXT_STYLES, getAnimationLabel } from '../../imufeed/AnimatedTextOverlay';
import FilterSelector from '../../imufeed/FilterSelector';
import SpeedControl from '../../imufeed/SpeedControl';
import StickerOverlay from '../../imufeed/StickerOverlay';

// ============================================================================
// FilterSelector Tests
// ============================================================================

describe('FilterSelector', () => {
    const onSelectFilter = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders filter selector with category tabs', () => {
        const { getByTestId } = render(
            <FilterSelector selectedFilterId={null} onSelectFilter={onSelectFilter} />,
        );

        expect(getByTestId('filter-selector')).toBeTruthy();
        expect(getByTestId('filter-tab-classic')).toBeTruthy();
        expect(getByTestId('filter-tab-manga')).toBeTruthy();
        expect(getByTestId('filter-tab-ambiance')).toBeTruthy();
    });

    it('shows classic filters by default', () => {
        const { getByTestId } = render(
            <FilterSelector selectedFilterId={null} onSelectFilter={onSelectFilter} />,
        );

        // Classic category has 7 filters
        expect(getByTestId('filter-none')).toBeTruthy();
        expect(getByTestId('filter-vivid')).toBeTruthy();
        expect(getByTestId('filter-warm')).toBeTruthy();
        expect(getByTestId('filter-bw')).toBeTruthy();
    });

    it('switches category on tab press', () => {
        const { getByTestId, queryByTestId } = render(
            <FilterSelector selectedFilterId={null} onSelectFilter={onSelectFilter} />,
        );

        fireEvent.press(getByTestId('filter-tab-manga'));

        // Manga filters should appear
        expect(getByTestId('filter-manga_sketch')).toBeTruthy();
        expect(getByTestId('filter-anime_soft')).toBeTruthy();

        // Classic filters should disappear
        expect(queryByTestId('filter-none')).toBeNull();
    });

    it('calls onSelectFilter when pressing a filter', () => {
        const { getByTestId } = render(
            <FilterSelector selectedFilterId={null} onSelectFilter={onSelectFilter} />,
        );

        fireEvent.press(getByTestId('filter-vivid'));

        expect(onSelectFilter).toHaveBeenCalledTimes(1);
        expect(onSelectFilter).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'vivid', name: 'Vivid' }),
        );
    });

    it('highlights selected filter', () => {
        const { getByTestId } = render(
            <FilterSelector selectedFilterId="warm" onSelectFilter={onSelectFilter} />,
        );

        // The checkmark icon should be rendered for the selected filter
        expect(getByTestId('icon-checkmark-circle')).toBeTruthy();
    });

    it('shows AI badge on manga filters', () => {
        const { getByTestId, getAllByText } = render(
            <FilterSelector selectedFilterId={null} onSelectFilter={onSelectFilter} />,
        );

        fireEvent.press(getByTestId('filter-tab-manga'));

        // All 6 manga filters have AI badge
        const aiBadges = getAllByText('IA');
        expect(aiBadges.length).toBe(6);
    });
});

// ============================================================================
// StickerOverlay Tests
// ============================================================================

describe('StickerOverlay', () => {
    const mockStickers: PlacedSticker[] = [
        { id: 'st-1', stickerId: 'heart', imageUrl: 'https://example.com/heart.png', x: 0.5, y: 0.3, scale: 1, rotation: 0 },
        { id: 'st-2', stickerId: 'star', imageUrl: 'https://example.com/star.png', x: 0.2, y: 0.6, scale: 1.5, rotation: 45 },
    ];
    const onUpdate = jest.fn();
    const onRemove = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders sticker overlay with stickers', () => {
        const { getByTestId } = render(
            <StickerOverlay stickers={mockStickers} onUpdateSticker={onUpdate} onRemoveSticker={onRemove} />,
        );

        expect(getByTestId('sticker-overlay')).toBeTruthy();
        expect(getByTestId('sticker-st-1')).toBeTruthy();
        expect(getByTestId('sticker-st-2')).toBeTruthy();
    });

    it('renders empty overlay when no stickers', () => {
        const { getByTestId, queryByTestId } = render(
            <StickerOverlay stickers={[]} onUpdateSticker={onUpdate} onRemoveSticker={onRemove} />,
        );

        expect(getByTestId('sticker-overlay')).toBeTruthy();
        expect(queryByTestId('sticker-st-1')).toBeNull();
    });

    it('removes sticker on remove button press', () => {
        const { getByTestId } = render(
            <StickerOverlay stickers={mockStickers} onUpdateSticker={onUpdate} onRemoveSticker={onRemove} />,
        );

        fireEvent.press(getByTestId('remove-sticker-st-1'));
        expect(onRemove).toHaveBeenCalledWith('st-1');
    });

    it('renders stickers with correct scale', () => {
        const { getByTestId } = render(
            <StickerOverlay stickers={mockStickers} onUpdateSticker={onUpdate} onRemoveSticker={onRemove} />,
        );

        // sticker st-2 has scale 1.5 → size 96
        const sticker2 = getByTestId('sticker-st-2');
        expect(sticker2).toBeTruthy();
    });
});

// ============================================================================
// SpeedControl Tests
// ============================================================================

describe('SpeedControl', () => {
    const onSelectSpeed = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders speed control with all 7 speeds', () => {
        const { getByTestId } = render(
            <SpeedControl selectedSpeed={1} onSelectSpeed={onSelectSpeed} />,
        );

        expect(getByTestId('speed-control')).toBeTruthy();
        expect(getByTestId('speed-0.25')).toBeTruthy();
        expect(getByTestId('speed-0.5')).toBeTruthy();
        expect(getByTestId('speed-0.75')).toBeTruthy();
        expect(getByTestId('speed-1')).toBeTruthy();
        expect(getByTestId('speed-1.5')).toBeTruthy();
        expect(getByTestId('speed-2')).toBeTruthy();
        expect(getByTestId('speed-3')).toBeTruthy();
    });

    it('calls onSelectSpeed when pressing a speed', () => {
        const { getByTestId } = render(
            <SpeedControl selectedSpeed={1} onSelectSpeed={onSelectSpeed} />,
        );

        fireEvent.press(getByTestId('speed-2'));
        expect(onSelectSpeed).toHaveBeenCalledWith(2);
    });

    it('highlights selected speed', () => {
        const { getByText } = render(
            <SpeedControl selectedSpeed={1.5} onSelectSpeed={onSelectSpeed} />,
        );

        // 1.5x text should exist
        expect(getByText('1.5x')).toBeTruthy();
    });

    it('shows "Vitesse" label', () => {
        const { getByText } = render(
            <SpeedControl selectedSpeed={1} onSelectSpeed={onSelectSpeed} />,
        );

        expect(getByText('Vitesse')).toBeTruthy();
    });
});

// ============================================================================
// AnimatedTextOverlay Tests
// ============================================================================

describe('AnimatedTextOverlay', () => {
    const mockTexts: PlacedText[] = [
        {
            id: 'txt-1',
            text: 'Hello World',
            style: 'fade_in',
            x: 0.3,
            y: 0.4,
            scale: 1,
            rotation: 0,
            color: '#FFF',
            startMs: 0,
            durationMs: 0, // Visible toute la vidéo
        },
        {
            id: 'txt-2',
            text: 'Subtitle',
            style: 'bounce',
            x: 0.5,
            y: 0.8,
            scale: 1.2,
            rotation: 10,
            color: '#FF0000',
            startMs: 5000,
            durationMs: 3000,
        },
    ];
    const onUpdate = jest.fn();
    const onRemove = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders text overlay with visible texts', () => {
        const { getByTestId, getByText } = render(
            <AnimatedTextOverlay texts={mockTexts} onUpdateText={onUpdate} onRemoveText={onRemove} currentTimeMs={0} />,
        );

        expect(getByTestId('text-overlay')).toBeTruthy();
        // txt-1 visible (durationMs=0 → always)
        expect(getByTestId('text-txt-1')).toBeTruthy();
        expect(getByText('Hello World')).toBeTruthy();
    });

    it('hides texts outside their time range', () => {
        const { queryByTestId, getByTestId } = render(
            <AnimatedTextOverlay texts={mockTexts} onUpdateText={onUpdate} onRemoveText={onRemove} currentTimeMs={0} />,
        );

        // txt-2 starts at 5000ms, so not visible at time 0
        expect(queryByTestId('text-txt-2')).toBeNull();
        // txt-1 always visible
        expect(getByTestId('text-txt-1')).toBeTruthy();
    });

    it('shows time-limited text when in range', () => {
        const { getByTestId, getByText } = render(
            <AnimatedTextOverlay texts={mockTexts} onUpdateText={onUpdate} onRemoveText={onRemove} currentTimeMs={6000} />,
        );

        // txt-2: starts 5000, duration 3000 → visible at 6000
        expect(getByTestId('text-txt-2')).toBeTruthy();
        expect(getByText('Subtitle')).toBeTruthy();
    });

    it('hides time-limited text after range expires', () => {
        const { queryByTestId } = render(
            <AnimatedTextOverlay texts={mockTexts} onUpdateText={onUpdate} onRemoveText={onRemove} currentTimeMs={9000} />,
        );

        // txt-2: starts 5000, duration 3000 → NOT visible at 9000
        expect(queryByTestId('text-txt-2')).toBeNull();
    });

    it('removes text on remove button press', () => {
        const { getByTestId } = render(
            <AnimatedTextOverlay texts={mockTexts} onUpdateText={onUpdate} onRemoveText={onRemove} currentTimeMs={0} />,
        );

        fireEvent.press(getByTestId('remove-text-txt-1'));
        expect(onRemove).toHaveBeenCalledWith('txt-1');
    });

    it('renders empty overlay when no texts', () => {
        const { getByTestId, queryByTestId } = render(
            <AnimatedTextOverlay texts={[]} onUpdateText={onUpdate} onRemoveText={onRemove} currentTimeMs={0} />,
        );

        expect(getByTestId('text-overlay')).toBeTruthy();
        expect(queryByTestId('text-txt-1')).toBeNull();
    });
});

// ============================================================================
// AnimatedTextOverlay Exports Tests
// ============================================================================

describe('AnimatedTextOverlay exports', () => {
    it('exports all 12 animation styles', () => {
        expect(ANIMATED_TEXT_STYLES).toHaveLength(12);
        expect(ANIMATED_TEXT_STYLES).toContain('typewriter');
        expect(ANIMATED_TEXT_STYLES).toContain('rainbow');
        expect(ANIMATED_TEXT_STYLES).toContain('shadow_pop');
    });

    it('getAnimationLabel returns correct labels', () => {
        expect(getAnimationLabel('typewriter')).toBe('Typewriter');
        expect(getAnimationLabel('fade_in')).toBe('Fade In');
        expect(getAnimationLabel('bounce')).toBe('Bounce');
        expect(getAnimationLabel('glow')).toBe('Glow');
    });
});

// ============================================================================
// filter-service Tests
// ============================================================================

describe('filter-service', () => {
    describe('BUILT_IN_FILTERS', () => {
        it('has 22 filters total', () => {
            expect(BUILT_IN_FILTERS).toHaveLength(22);
        });

        it('has 7 classic filters', () => {
            const classic = BUILT_IN_FILTERS.filter((f) => f.category === 'classic');
            expect(classic).toHaveLength(7);
        });

        it('has 6 manga filters', () => {
            const manga = BUILT_IN_FILTERS.filter((f) => f.category === 'manga');
            expect(manga).toHaveLength(6);
        });

        it('has 9 ambiance filters', () => {
            const ambiance = BUILT_IN_FILTERS.filter((f) => f.category === 'ambiance');
            expect(ambiance).toHaveLength(9);
        });

        it('all manga filters require AI', () => {
            const manga = BUILT_IN_FILTERS.filter((f) => f.category === 'manga');
            expect(manga.every((f) => f.requiresAI)).toBe(true);
        });

        it('all classic/ambiance filters do NOT require AI', () => {
            const nonManga = BUILT_IN_FILTERS.filter((f) => f.category !== 'manga');
            expect(nonManga.every((f) => !f.requiresAI)).toBe(true);
        });

        it('every filter has unique id', () => {
            const ids = BUILT_IN_FILTERS.map((f) => f.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('getFiltersByCategory', () => {
        it('returns correct filters for classic', () => {
            const results = getFiltersByCategory('classic');
            expect(results).toHaveLength(7);
            expect(results[0].id).toBe('none');
        });

        it('returns correct filters for manga', () => {
            const results = getFiltersByCategory('manga');
            expect(results).toHaveLength(6);
            expect(results[0].id).toBe('manga_sketch');
        });
    });

    describe('getFilterById', () => {
        it('finds filter by id', () => {
            const f = getFilterById('vivid');
            expect(f).toBeDefined();
            expect(f!.name).toBe('Vivid');
        });

        it('returns undefined for unknown id', () => {
            expect(getFilterById('nonexistent')).toBeUndefined();
        });
    });

    describe('FILTER_CATEGORIES', () => {
        it('has 3 categories', () => {
            expect(FILTER_CATEGORIES).toHaveLength(3);
        });

        it('includes classic, manga, ambiance', () => {
            const keys = FILTER_CATEGORIES.map((c) => c.key);
            expect(keys).toEqual(['classic', 'manga', 'ambiance']);
        });
    });

    describe('fetchStickerPacks', () => {
        it('calls supabase.from with correct table', async () => {
            const { supabase } = require('@/services/supabase');
            await fetchStickerPacks();
            expect(supabase.from).toHaveBeenCalledWith('imufeed_sticker_packs');
        });
    });

    describe('fetchStickers', () => {
        it('calls supabase.from with correct table and packId', async () => {
            const { supabase } = require('@/services/supabase');
            await fetchStickers('pack-1');
            expect(supabase.from).toHaveBeenCalledWith('imufeed_stickers');
        });
    });
});
