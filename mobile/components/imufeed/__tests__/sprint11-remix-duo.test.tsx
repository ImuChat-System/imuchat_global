/**
 * Tests for Sprint S11B — Remix, Duo & Effets Avancés
 *
 * - remix-service (getDefaultMetadata, toggleEffect, updateEffectIntensity, catalog, labels)
 * - DuoRemixSelector (render 4 modes, mode change, source info)
 * - DuoPreview (render panels, toggle orientation, toggle order)
 * - PostEffectsPanel (toggle effects, intensity steps, premium badge)
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────

jest.mock('@/providers/ThemeProvider', () => ({
    useColors: () => ({
        primary: '#6A54A3',
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

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/services/supabase', () => ({
    get supabase() {
        return {
            from: mockFrom,
            rpc: mockRpc,
            auth: { getUser: jest.fn() },
        };
    },
    getCurrentUser: () => Promise.resolve({ id: 'user-1' }),
}));

// ─── Imports ──────────────────────────────────────────────────

import {
    canRemixVideo,
    DEFAULT_DUO_LAYOUT,
    DEFAULT_GREEN_SCREEN_CONFIG,
    DEFAULT_REMIX_CONFIG,
    getDefaultMetadata,
    getEffectDefinition,
    getVideoRemixes,
    MODE_ICONS,
    MODE_LABELS,
    POST_EFFECTS_CATALOG,
    toggleEffect,
    updateEffectIntensity,
} from '@/services/imufeed/remix-service';
import type { AppliedPostEffect } from '@/types/imufeed';
import DuoPreview from '../../imufeed/DuoPreview';
import DuoRemixSelector from '../../imufeed/DuoRemixSelector';
import PostEffectsPanel from '../../imufeed/PostEffectsPanel';

// ============================================================================
// remix-service Tests
// ============================================================================

describe('remix-service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── Constants ──────────────────────────────────────────────

    it('has 4 post effects in catalog', () => {
        expect(POST_EFFECTS_CATALOG).toHaveLength(4);
        const types = POST_EFFECTS_CATALOG.map((e) => e.type);
        expect(types).toEqual(['blur_bg', 'stabilization', 'light_correction', 'color_grade']);
    });

    it('marks only color_grade as premium', () => {
        const premiums = POST_EFFECTS_CATALOG.filter((e) => e.isPremium);
        expect(premiums).toHaveLength(1);
        expect(premiums[0].type).toBe('color_grade');
    });

    it('exports MODE_LABELS for all 4 modes', () => {
        expect(MODE_LABELS.normal).toBe('Normal');
        expect(MODE_LABELS.duo).toBe('Duo');
        expect(MODE_LABELS.remix).toBe('Remix');
        expect(MODE_LABELS.green_screen).toBe('Fond vert');
    });

    it('exports MODE_ICONS for all 4 modes', () => {
        expect(MODE_ICONS.normal).toBeDefined();
        expect(MODE_ICONS.duo).toBeDefined();
        expect(MODE_ICONS.remix).toBeDefined();
        expect(MODE_ICONS.green_screen).toBeDefined();
    });

    // ── getDefaultMetadata ─────────────────────────────────────

    it('returns duo layout for duo mode', () => {
        const meta = getDefaultMetadata('duo', 'src-123');
        expect(meta.mode).toBe('duo');
        expect(meta.sourceVideoId).toBe('src-123');
        expect(meta.duoLayout).toEqual(DEFAULT_DUO_LAYOUT);
        expect(meta.remixConfig).toBeNull();
        expect(meta.greenScreenConfig).toBeNull();
        expect(meta.postEffects).toEqual([]);
    });

    it('returns remix config for remix mode', () => {
        const meta = getDefaultMetadata('remix');
        expect(meta.mode).toBe('remix');
        expect(meta.remixConfig).toEqual(DEFAULT_REMIX_CONFIG);
        expect(meta.duoLayout).toBeNull();
    });

    it('returns green screen config for green_screen mode', () => {
        const meta = getDefaultMetadata('green_screen');
        expect(meta.greenScreenConfig).toEqual(DEFAULT_GREEN_SCREEN_CONFIG);
    });

    it('returns empty config for normal mode', () => {
        const meta = getDefaultMetadata('normal');
        expect(meta.duoLayout).toBeNull();
        expect(meta.remixConfig).toBeNull();
        expect(meta.greenScreenConfig).toBeNull();
    });

    // ── getEffectDefinition ────────────────────────────────────

    it('returns definition for known effect', () => {
        const def = getEffectDefinition('blur_bg');
        expect(def).toBeDefined();
        expect(def!.name).toBe('Flou arrière-plan');
    });

    it('returns undefined for unknown effect', () => {
        const def = getEffectDefinition('unknown' as any);
        expect(def).toBeUndefined();
    });

    // ── toggleEffect ───────────────────────────────────────────

    it('adds effect when not present', () => {
        const result = toggleEffect([], 'blur_bg');
        expect(result).toHaveLength(1);
        expect(result[0].effectType).toBe('blur_bg');
        expect(result[0].intensity).toBe(0.6); // default from catalog
    });

    it('removes effect when already present', () => {
        const effects: AppliedPostEffect[] = [
            { effectType: 'blur_bg', intensity: 0.6, params: {} },
        ];
        const result = toggleEffect(effects, 'blur_bg');
        expect(result).toHaveLength(0);
    });

    it('does not affect other effects when toggling', () => {
        const effects: AppliedPostEffect[] = [
            { effectType: 'blur_bg', intensity: 0.6, params: {} },
            { effectType: 'stabilization', intensity: 0.8, params: {} },
        ];
        const result = toggleEffect(effects, 'blur_bg');
        expect(result).toHaveLength(1);
        expect(result[0].effectType).toBe('stabilization');
    });

    // ── updateEffectIntensity ──────────────────────────────────

    it('updates intensity for matching effect', () => {
        const effects: AppliedPostEffect[] = [
            { effectType: 'blur_bg', intensity: 0.5, params: {} },
        ];
        const result = updateEffectIntensity(effects, 'blur_bg', 0.9);
        expect(result[0].intensity).toBe(0.9);
    });

    it('clamps intensity to [0, 1]', () => {
        const effects: AppliedPostEffect[] = [
            { effectType: 'blur_bg', intensity: 0.5, params: {} },
        ];
        expect(updateEffectIntensity(effects, 'blur_bg', 1.5)[0].intensity).toBe(1);
        expect(updateEffectIntensity(effects, 'blur_bg', -0.3)[0].intensity).toBe(0);
    });

    // ── canRemixVideo ──────────────────────────────────────────

    it('returns allowed when video is published and allows duet', async () => {
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { allow_duet: true, status: 'published' },
                error: null,
            }),
        });

        const result = await canRemixVideo('vid-1');
        expect(result.allowed).toBe(true);
    });

    it('returns not allowed when video disables duet', async () => {
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { allow_duet: false, status: 'published' },
                error: null,
            }),
        });

        const result = await canRemixVideo('vid-1');
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('désactivé');
    });

    it('returns not allowed when video is not published', async () => {
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { allow_duet: true, status: 'draft' },
                error: null,
            }),
        });

        const result = await canRemixVideo('vid-1');
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('non publiée');
    });

    // ── getVideoRemixes ────────────────────────────────────────

    it('returns remixes via RPC', async () => {
        const mockData = [
            { id: 'r-1', creation_mode: 'duo', caption: 'Mon duo' },
        ];
        mockRpc.mockResolvedValue({ data: mockData, error: null });

        const result = await getVideoRemixes('vid-1');
        expect(result).toEqual(mockData);
        expect(mockRpc).toHaveBeenCalledWith('get_video_remixes', {
            p_video_id: 'vid-1',
            p_limit: 20,
        });
    });

    it('returns empty array on RPC error', async () => {
        mockRpc.mockResolvedValue({ data: null, error: { message: 'fail' } });

        const result = await getVideoRemixes('vid-1');
        expect(result).toEqual([]);
    });
});

// ============================================================================
// DuoRemixSelector Tests
// ============================================================================

describe('DuoRemixSelector', () => {
    const onModeChange = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders 4 mode buttons', () => {
        const { getByTestId } = render(
            <DuoRemixSelector activeMode="normal" onModeChange={onModeChange} />,
        );

        expect(getByTestId('duo-remix-selector')).toBeTruthy();
        expect(getByTestId('mode-normal')).toBeTruthy();
        expect(getByTestId('mode-duo')).toBeTruthy();
        expect(getByTestId('mode-remix')).toBeTruthy();
        expect(getByTestId('mode-green_screen')).toBeTruthy();
    });

    it('calls onModeChange when pressing a mode', () => {
        const { getByTestId } = render(
            <DuoRemixSelector activeMode="normal" onModeChange={onModeChange} />,
        );

        fireEvent.press(getByTestId('mode-duo'));
        expect(onModeChange).toHaveBeenCalledWith('duo');

        fireEvent.press(getByTestId('mode-remix'));
        expect(onModeChange).toHaveBeenCalledWith('remix');
    });

    it('shows source info when mode is not normal', () => {
        const { getByTestId } = render(
            <DuoRemixSelector
                activeMode="duo"
                onModeChange={onModeChange}
                sourceName="Vidéo source"
            />,
        );

        expect(getByTestId('source-info')).toBeTruthy();
    });

    it('hides source info when mode is normal', () => {
        const { queryByTestId } = render(
            <DuoRemixSelector activeMode="normal" onModeChange={onModeChange} />,
        );

        expect(queryByTestId('source-info')).toBeNull();
    });

    it('displays mode labels', () => {
        const { getByText } = render(
            <DuoRemixSelector activeMode="normal" onModeChange={onModeChange} />,
        );

        expect(getByText('Normal')).toBeTruthy();
        expect(getByText('Duo')).toBeTruthy();
        expect(getByText('Remix')).toBeTruthy();
        expect(getByText('Fond vert')).toBeTruthy();
    });
});

// ============================================================================
// DuoPreview Tests
// ============================================================================

describe('DuoPreview', () => {
    const onLayoutChange = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders source and camera panels', () => {
        const { getByTestId } = render(
            <DuoPreview
                layout={DEFAULT_DUO_LAYOUT}
                onLayoutChange={onLayoutChange}
                sourceThumbnail="https://example.com/thumb.jpg"
            />,
        );

        expect(getByTestId('duo-preview')).toBeTruthy();
        expect(getByTestId('duo-source-panel')).toBeTruthy();
        expect(getByTestId('duo-camera-panel')).toBeTruthy();
    });

    it('renders toggle orientation button', () => {
        const { getByTestId } = render(
            <DuoPreview
                layout={DEFAULT_DUO_LAYOUT}
                onLayoutChange={onLayoutChange}
                sourceThumbnail={null}
            />,
        );

        expect(getByTestId('duo-toggle-orientation')).toBeTruthy();
    });

    it('toggles orientation on press', () => {
        const { getByTestId } = render(
            <DuoPreview
                layout={{ ...DEFAULT_DUO_LAYOUT, orientation: 'vertical' }}
                onLayoutChange={onLayoutChange}
                sourceThumbnail={null}
            />,
        );

        fireEvent.press(getByTestId('duo-toggle-orientation'));
        expect(onLayoutChange).toHaveBeenCalledWith(
            expect.objectContaining({ orientation: 'horizontal' }),
        );
    });

    it('toggles order on press', () => {
        const { getByTestId } = render(
            <DuoPreview
                layout={{ ...DEFAULT_DUO_LAYOUT, sourceFirst: true }}
                onLayoutChange={onLayoutChange}
                sourceThumbnail={null}
            />,
        );

        fireEvent.press(getByTestId('duo-toggle-order'));
        expect(onLayoutChange).toHaveBeenCalledWith(
            expect.objectContaining({ sourceFirst: false }),
        );
    });

    it('renders placeholder when no thumbnail', () => {
        const { getByTestId, getByText } = render(
            <DuoPreview
                layout={DEFAULT_DUO_LAYOUT}
                onLayoutChange={onLayoutChange}
                sourceThumbnail={null}
            />,
        );

        expect(getByText('Source')).toBeTruthy();
    });
});

// ============================================================================
// PostEffectsPanel Tests
// ============================================================================

describe('PostEffectsPanel', () => {
    const onToggleEffect = jest.fn();
    const onIntensityChange = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders panel with all 4 effects', () => {
        const { getByTestId, getByText } = render(
            <PostEffectsPanel
                activeEffects={[]}
                onToggleEffect={onToggleEffect}
                onIntensityChange={onIntensityChange}
            />,
        );

        expect(getByTestId('post-effects-panel')).toBeTruthy();
        expect(getByTestId('effect-blur_bg')).toBeTruthy();
        expect(getByTestId('effect-stabilization')).toBeTruthy();
        expect(getByTestId('effect-light_correction')).toBeTruthy();
        expect(getByTestId('effect-color_grade')).toBeTruthy();
        expect(getByText('Effets post-production')).toBeTruthy();
    });

    it('calls onToggleEffect when pressing an effect', () => {
        const { getByTestId } = render(
            <PostEffectsPanel
                activeEffects={[]}
                onToggleEffect={onToggleEffect}
                onIntensityChange={onIntensityChange}
            />,
        );

        fireEvent.press(getByTestId('effect-toggle-blur_bg'));
        expect(onToggleEffect).toHaveBeenCalledWith('blur_bg');
    });

    it('shows intensity bar when effect is active', () => {
        const activeEffects: AppliedPostEffect[] = [
            { effectType: 'blur_bg', intensity: 0.5, params: {} },
        ];

        const { getByTestId, queryByTestId } = render(
            <PostEffectsPanel
                activeEffects={activeEffects}
                onToggleEffect={onToggleEffect}
                onIntensityChange={onIntensityChange}
            />,
        );

        // blur_bg active → intensity row visible
        expect(getByTestId('intensity-blur_bg')).toBeTruthy();
        // stabilization inactive → no intensity row
        expect(queryByTestId('intensity-stabilization')).toBeNull();
    });

    it('calls onIntensityChange when pressing an intensity step', () => {
        const activeEffects: AppliedPostEffect[] = [
            { effectType: 'stabilization', intensity: 0.5, params: {} },
        ];

        const { getByTestId } = render(
            <PostEffectsPanel
                activeEffects={activeEffects}
                onToggleEffect={onToggleEffect}
                onIntensityChange={onIntensityChange}
            />,
        );

        fireEvent.press(getByTestId('intensity-step-stabilization-0.75'));
        expect(onIntensityChange).toHaveBeenCalledWith('stabilization', 0.75);
    });

    it('shows premium badge on color_grade', () => {
        const { getByTestId } = render(
            <PostEffectsPanel
                activeEffects={[]}
                onToggleEffect={onToggleEffect}
                onIntensityChange={onIntensityChange}
            />,
        );

        expect(getByTestId('premium-badge-color_grade')).toBeTruthy();
    });

    it('displays effect names and descriptions', () => {
        const { getByText } = render(
            <PostEffectsPanel
                activeEffects={[]}
                onToggleEffect={onToggleEffect}
                onIntensityChange={onIntensityChange}
            />,
        );

        expect(getByText('Flou arrière-plan')).toBeTruthy();
        expect(getByText('Stabilisation')).toBeTruthy();
        expect(getByText('Correction lumière')).toBeTruthy();
        expect(getByText('Étalonnage couleurs')).toBeTruthy();
    });
});
