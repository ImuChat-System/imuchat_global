/**
 * Tests for Sprint S12A — Watch enrichi
 *
 * - WatchSubTabs (render 3 tabs, tab change, indicator, TABS export)
 * - LiveBadge (render, text LIVE, dot pulsating, sizes)
 * - WatchPartyCard (render, LIVE badge, join button, viewer count, scheduled)
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

// ─── Imports ──────────────────────────────────────────────────

import type { WatchParty } from '@/types/watch';
import LiveBadge from '../../watch/LiveBadge';
import WatchPartyCard from '../../watch/WatchPartyCard';
import WatchSubTabs, { TABS } from '../../watch/WatchSubTabs';

// ============================================================================
// WatchSubTabs Tests
// ============================================================================

describe('WatchSubTabs', () => {
    const onTabChange = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders 3 sub-tabs (Vidéos, Podcasts, Musique)', () => {
        const { getByTestId } = render(
            <WatchSubTabs activeTab="videos" onTabChange={onTabChange} />,
        );

        expect(getByTestId('watch-sub-tabs')).toBeTruthy();
        expect(getByTestId('watch-tab-videos')).toBeTruthy();
        expect(getByTestId('watch-tab-podcasts')).toBeTruthy();
        expect(getByTestId('watch-tab-music')).toBeTruthy();
    });

    it('renders tab labels and emojis', () => {
        const { getByText } = render(
            <WatchSubTabs activeTab="videos" onTabChange={onTabChange} />,
        );

        expect(getByText('Vidéos')).toBeTruthy();
        expect(getByText('Podcasts')).toBeTruthy();
        expect(getByText('Musique')).toBeTruthy();
        expect(getByText('🎬')).toBeTruthy();
        expect(getByText('🎧')).toBeTruthy();
        expect(getByText('🎵')).toBeTruthy();
    });

    it('calls onTabChange when pressing a tab', () => {
        const { getByTestId } = render(
            <WatchSubTabs activeTab="videos" onTabChange={onTabChange} />,
        );

        fireEvent.press(getByTestId('watch-tab-podcasts'));
        expect(onTabChange).toHaveBeenCalledWith('podcasts');

        fireEvent.press(getByTestId('watch-tab-music'));
        expect(onTabChange).toHaveBeenCalledWith('music');
    });

    it('renders the animated indicator', () => {
        const { getByTestId } = render(
            <WatchSubTabs activeTab="videos" onTabChange={onTabChange} />,
        );

        expect(getByTestId('watch-tab-indicator')).toBeTruthy();
    });

    it('exports TABS definition (3 items)', () => {
        expect(TABS).toHaveLength(3);
        expect(TABS[0].key).toBe('videos');
        expect(TABS[1].key).toBe('podcasts');
        expect(TABS[2].key).toBe('music');
    });
});

// ============================================================================
// LiveBadge Tests
// ============================================================================

describe('LiveBadge', () => {
    it('renders with LIVE text', () => {
        const { getByText, getByTestId } = render(<LiveBadge />);

        expect(getByTestId('live-badge')).toBeTruthy();
        expect(getByText('LIVE')).toBeTruthy();
    });

    it('renders the pulsating dot', () => {
        const { getByTestId } = render(<LiveBadge />);

        expect(getByTestId('live-dot')).toBeTruthy();
    });

    it('renders sm size variant', () => {
        const { getByTestId, getByText } = render(<LiveBadge size="sm" />);

        expect(getByTestId('live-badge')).toBeTruthy();
        expect(getByText('LIVE')).toBeTruthy();
    });

    it('renders without animation when animated=false', () => {
        const { getByTestId } = render(<LiveBadge animated={false} />);

        expect(getByTestId('live-badge')).toBeTruthy();
        expect(getByTestId('live-dot')).toBeTruthy();
    });
});

// ============================================================================
// WatchPartyCard Tests
// ============================================================================

describe('WatchPartyCard', () => {
    const onJoin = jest.fn();
    const onPress = jest.fn();

    afterEach(() => jest.clearAllMocks());

    const liveParty: WatchParty = {
        id: 'wp-1',
        title: 'Soirée Anime',
        description: 'On mate du Naruto',
        host_id: 'u-host',
        host_username: 'OtakuKing',
        video: {
            id: 'v-1',
            title: 'Naruto EP1',
            description: 'Ep1',
            video_url: 'https://example.com/v.mp4',
            thumbnail_url: 'https://example.com/thumb.jpg',
            category: 'anime',
            source: 'upload',
            duration_ms: 1200000,
            view_count: 150,
            like_count: 22,
            author_id: 'u-host',
            author_username: 'OtakuKing',
            tags: ['anime'],
            is_live: false,
            created_at: '2025-01-01T00:00:00Z',
        },
        category: 'anime',
        viewer_count: 42,
        status: 'live',
        scheduled_for: null,
        started_at: '2025-01-01T20:00:00Z',
        attendee_count: 60,
        chat_enabled: true,
        created_at: '2025-01-01T19:00:00Z',
    };

    const scheduledParty: WatchParty = {
        ...liveParty,
        id: 'wp-2',
        title: 'Film ce soir',
        status: 'scheduled',
        viewer_count: 0,
        scheduled_for: '2025-01-02T20:00:00Z',
        started_at: null,
    };

    it('renders party card with title and host', () => {
        const { getByTestId, getByText } = render(
            <WatchPartyCard party={liveParty} onJoin={onJoin} />,
        );

        expect(getByTestId('watch-party-card-wp-1')).toBeTruthy();
        expect(getByText('Soirée Anime')).toBeTruthy();
        expect(getByText('Hébergé par OtakuKing')).toBeTruthy();
    });

    it('shows LIVE badge for live parties', () => {
        const { getByText } = render(
            <WatchPartyCard party={liveParty} onJoin={onJoin} />,
        );

        expect(getByText('LIVE')).toBeTruthy();
    });

    it('shows viewer count', () => {
        const { getByText } = render(
            <WatchPartyCard party={liveParty} onJoin={onJoin} />,
        );

        expect(getByText('42')).toBeTruthy();
    });

    it('shows "Rejoindre" button for live parties', () => {
        const { getByTestId, getByText } = render(
            <WatchPartyCard party={liveParty} onJoin={onJoin} />,
        );

        expect(getByText('Rejoindre')).toBeTruthy();
        fireEvent.press(getByTestId('join-party-wp-1'));
        expect(onJoin).toHaveBeenCalledWith('wp-1');
    });

    it('shows "Programmée" for scheduled parties', () => {
        const { getByText, queryByText } = render(
            <WatchPartyCard party={scheduledParty} onJoin={onJoin} />,
        );

        expect(getByText('Programmée')).toBeTruthy();
        expect(queryByText('Rejoindre')).toBeNull();
    });

    it('shows attendee count', () => {
        const { getByText } = render(
            <WatchPartyCard party={liveParty} onJoin={onJoin} />,
        );

        expect(getByText('60')).toBeTruthy();
    });

    it('handles onPress callback', () => {
        const { getByTestId } = render(
            <WatchPartyCard party={liveParty} onJoin={onJoin} onPress={onPress} />,
        );

        fireEvent.press(getByTestId('watch-party-card-wp-1'));
        expect(onPress).toHaveBeenCalledWith('wp-1');
    });

    it('renders placeholder when no video thumbnail', () => {
        const noThumbParty = { ...liveParty, video: null };
        const { getByTestId } = render(
            <WatchPartyCard party={noThumbParty} onJoin={onJoin} />,
        );

        expect(getByTestId('icon-videocam')).toBeTruthy();
    });
});
