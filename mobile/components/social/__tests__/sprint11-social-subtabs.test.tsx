/**
 * Tests for Sprint S11A — Refonte Social (sous-onglets)
 *
 * - SocialSubTabs (render 3 tabs, tab change callback, active highlight)
 * - StoriesGrid (render items, unviewed ring, count badge, empty state, create)
 * - ImuFeedMiniPlayer (render video cards, stats, empty state, create)
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

// ─── Imports ──────────────────────────────────────────────────

import ImuFeedMiniPlayer, {
    type MiniVideoItem,
} from '../../social/ImuFeedMiniPlayer';
import SocialSubTabs, { TABS } from '../../social/SocialSubTabs';
import StoriesGrid, { type StoryGridItem } from '../../social/StoriesGrid';

// ============================================================================
// SocialSubTabs Tests
// ============================================================================

describe('SocialSubTabs', () => {
    const onTabChange = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders 3 sub-tabs', () => {
        const { getByTestId } = render(
            <SocialSubTabs activeTab="feed" onTabChange={onTabChange} />,
        );

        expect(getByTestId('social-sub-tabs')).toBeTruthy();
        expect(getByTestId('social-tab-feed')).toBeTruthy();
        expect(getByTestId('social-tab-imufeed')).toBeTruthy();
        expect(getByTestId('social-tab-stories')).toBeTruthy();
    });

    it('renders tab labels and emojis', () => {
        const { getByText } = render(
            <SocialSubTabs activeTab="feed" onTabChange={onTabChange} />,
        );

        expect(getByText('Feed')).toBeTruthy();
        expect(getByText('ImuFeed')).toBeTruthy();
        expect(getByText('Stories')).toBeTruthy();
        expect(getByText('📝')).toBeTruthy();
        expect(getByText('🎬')).toBeTruthy();
        expect(getByText('⭐')).toBeTruthy();
    });

    it('calls onTabChange when pressing a tab', () => {
        const { getByTestId } = render(
            <SocialSubTabs activeTab="feed" onTabChange={onTabChange} />,
        );

        fireEvent.press(getByTestId('social-tab-imufeed'));
        expect(onTabChange).toHaveBeenCalledWith('imufeed');

        fireEvent.press(getByTestId('social-tab-stories'));
        expect(onTabChange).toHaveBeenCalledWith('stories');
    });

    it('renders the animated indicator', () => {
        const { getByTestId } = render(
            <SocialSubTabs activeTab="feed" onTabChange={onTabChange} />,
        );

        expect(getByTestId('tab-indicator')).toBeTruthy();
    });

    it('exports TABS definition array', () => {
        expect(TABS).toHaveLength(3);
        expect(TABS[0].key).toBe('feed');
        expect(TABS[1].key).toBe('imufeed');
        expect(TABS[2].key).toBe('stories');
    });
});

// ============================================================================
// StoriesGrid Tests
// ============================================================================

describe('StoriesGrid', () => {
    const onStoryPress = jest.fn();
    const onCreatePress = jest.fn();

    const mockStories: StoryGridItem[] = [
        {
            id: 's-1',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
            authorName: 'Alice',
            authorAvatar: 'https://example.com/alice.jpg',
            isViewed: false,
            storyCount: 3,
            createdAt: '2025-01-01T00:00:00Z',
        },
        {
            id: 's-2',
            thumbnailUrl: null,
            authorName: 'Bob',
            authorAvatar: null,
            isViewed: true,
            storyCount: 1,
            createdAt: '2025-01-02T00:00:00Z',
        },
    ];

    afterEach(() => jest.clearAllMocks());

    it('renders grid with story items', () => {
        const { getByTestId } = render(
            <StoriesGrid
                stories={mockStories}
                onStoryPress={onStoryPress}
                onCreatePress={onCreatePress}
            />,
        );

        expect(getByTestId('stories-grid')).toBeTruthy();
        expect(getByTestId('story-grid-s-1')).toBeTruthy();
        expect(getByTestId('story-grid-s-2')).toBeTruthy();
    });

    it('shows unviewed ring for non-viewed stories', () => {
        const { getByTestId, queryByTestId } = render(
            <StoriesGrid
                stories={mockStories}
                onStoryPress={onStoryPress}
            />,
        );

        // s-1 is not viewed → ring visible
        expect(getByTestId('story-unviewed-s-1')).toBeTruthy();
        // s-2 is viewed → no ring
        expect(queryByTestId('story-unviewed-s-2')).toBeNull();
    });

    it('shows count badge when storyCount > 1', () => {
        const { getByTestId, queryByTestId } = render(
            <StoriesGrid
                stories={mockStories}
                onStoryPress={onStoryPress}
            />,
        );

        // s-1 has count 3
        expect(getByTestId('story-count-s-1')).toBeTruthy();
        // s-2 has count 1 → no badge
        expect(queryByTestId('story-count-s-2')).toBeNull();
    });

    it('fires onStoryPress with the correct id', () => {
        const { getByTestId } = render(
            <StoriesGrid
                stories={mockStories}
                onStoryPress={onStoryPress}
            />,
        );

        fireEvent.press(getByTestId('story-grid-s-1'));
        expect(onStoryPress).toHaveBeenCalledWith('s-1');
    });

    it('renders grid without crash when onCreatePress provided', () => {
        const { getByTestId } = render(
            <StoriesGrid
                stories={mockStories}
                onStoryPress={onStoryPress}
                onCreatePress={onCreatePress}
            />,
        );

        // FlatList ListHeaderComponent may not render in RNTL;
        // verify the grid itself is still present
        expect(getByTestId('stories-grid')).toBeTruthy();
    });

    it('renders empty state when no stories', () => {
        const { getByTestId, getByText } = render(
            <StoriesGrid
                stories={[]}
                onStoryPress={onStoryPress}
                onCreatePress={onCreatePress}
            />,
        );

        expect(getByTestId('stories-grid-empty')).toBeTruthy();
        expect(getByText('Aucune story pour le moment')).toBeTruthy();
        expect(getByTestId('stories-create-empty')).toBeTruthy();
    });

    it('fires onCreatePress from empty state', () => {
        const { getByTestId } = render(
            <StoriesGrid
                stories={[]}
                onStoryPress={onStoryPress}
                onCreatePress={onCreatePress}
            />,
        );

        fireEvent.press(getByTestId('stories-create-empty'));
        expect(onCreatePress).toHaveBeenCalledTimes(1);
    });
});

// ============================================================================
// ImuFeedMiniPlayer Tests
// ============================================================================

describe('ImuFeedMiniPlayer', () => {
    const onVideoPress = jest.fn();
    const onCreatePress = jest.fn();

    const mockVideos: MiniVideoItem[] = [
        {
            id: 'v-1',
            thumbnailUrl: 'https://example.com/vid1.jpg',
            caption: 'Ma première vidéo',
            authorName: 'Alice',
            authorAvatar: 'https://example.com/alice.jpg',
            viewsCount: 15200,
            likesCount: 342,
            duration: 45,
        },
        {
            id: 'v-2',
            thumbnailUrl: null,
            caption: 'Tutoriel rapide',
            authorName: 'Bob',
            authorAvatar: null,
            viewsCount: 1200000,
            likesCount: 89000,
            duration: 127,
        },
    ];

    afterEach(() => jest.clearAllMocks());

    it('renders video cards in grid', () => {
        const { getByTestId } = render(
            <ImuFeedMiniPlayer
                videos={mockVideos}
                onVideoPress={onVideoPress}
            />,
        );

        expect(getByTestId('imufeed-mini-list')).toBeTruthy();
        expect(getByTestId('mini-video-v-1')).toBeTruthy();
        expect(getByTestId('mini-video-v-2')).toBeTruthy();
    });

    it('displays formatted duration', () => {
        const { getByText } = render(
            <ImuFeedMiniPlayer
                videos={mockVideos}
                onVideoPress={onVideoPress}
            />,
        );

        // 45s → 0:45
        expect(getByText('0:45')).toBeTruthy();
        // 127s → 2:07
        expect(getByText('2:07')).toBeTruthy();
    });

    it('displays formatted view and like counts', () => {
        const { getByText } = render(
            <ImuFeedMiniPlayer
                videos={mockVideos}
                onVideoPress={onVideoPress}
            />,
        );

        // 15200 → 15.2K
        expect(getByText('15.2K')).toBeTruthy();
        // 1200000 → 1.2M
        expect(getByText('1.2M')).toBeTruthy();
    });

    it('fires onVideoPress with correct id', () => {
        const { getByTestId } = render(
            <ImuFeedMiniPlayer
                videos={mockVideos}
                onVideoPress={onVideoPress}
            />,
        );

        fireEvent.press(getByTestId('mini-video-v-1'));
        expect(onVideoPress).toHaveBeenCalledWith('v-1');
    });

    it('renders empty state when no videos', () => {
        const { getByTestId, getByText } = render(
            <ImuFeedMiniPlayer
                videos={[]}
                onVideoPress={onVideoPress}
                onCreatePress={onCreatePress}
            />,
        );

        expect(getByTestId('imufeed-mini-empty')).toBeTruthy();
        expect(getByText('Aucune vidéo ImuFeed')).toBeTruthy();
    });

    it('shows create button in empty state', () => {
        const { getByTestId, getByText } = render(
            <ImuFeedMiniPlayer
                videos={[]}
                onVideoPress={onVideoPress}
                onCreatePress={onCreatePress}
            />,
        );

        expect(getByTestId('imufeed-mini-create')).toBeTruthy();
        fireEvent.press(getByTestId('imufeed-mini-create'));
        expect(onCreatePress).toHaveBeenCalledTimes(1);
    });

    it('renders author names and captions', () => {
        const { getByText } = render(
            <ImuFeedMiniPlayer
                videos={mockVideos}
                onVideoPress={onVideoPress}
            />,
        );

        expect(getByText('Alice')).toBeTruthy();
        expect(getByText('Bob')).toBeTruthy();
        expect(getByText('Ma première vidéo')).toBeTruthy();
        expect(getByText('Tutoriel rapide')).toBeTruthy();
    });
});
