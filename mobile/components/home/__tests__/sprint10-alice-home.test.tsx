/**
 * Tests for Sprint S10A — Alice IA dans le Home
 *
 * - AliceHomeBanner (suggestions proactives, dismiss)
 * - DailySummaryCard (résumé quotidien, badges, collapse)
 * - QuickChatAlice (expand, input, send, reply)
 * - alice-home service (getDailySummary, getActiveSuggestions, dismissSuggestion, sendQuickChat, getModuleRecommendations)
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
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

const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/services/supabase', () => ({
    supabase: {
        get rpc() { return mockRpc; },
        get from() { return mockFrom; },
        auth: {
            getSession: jest.fn().mockResolvedValue({
                data: { session: { access_token: 'test-token' } },
            }),
            getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
        },
    },
    getCurrentUser: () => Promise.resolve({ id: 'user-1', email: 'test@test.com' }),
}));

jest.mock('@/services/alice', () => ({
    AliceProvider: { OPENAI: 'openai' },
    sendMessageToAlice: jest.fn().mockResolvedValue({
        message: { role: 'assistant', content: 'Bonjour ! Tu as 3 messages non lus et 1 événement ce matin.' },
        conversationId: 'conv-1',
        provider: 'openai',
        model: 'gpt-4o-mini',
    }),
}));

// ─── Imports ──────────────────────────────────────────────────

import * as aliceHome from '@/services/alice-home';
import AliceHomeBanner from '../AliceHomeBanner';
import DailySummaryCard from '../DailySummaryCard';
import QuickChatAlice from '../QuickChatAlice';

// ============================================================================
// AliceHomeBanner Tests
// ============================================================================

describe('AliceHomeBanner', () => {
    const mockSuggestions = [
        {
            id: 'sug-1',
            suggestion_type: 'event',
            title: 'Réunion à 14h',
            body: 'Tu as une réunion dans 2 heures',
            metadata: {},
            is_dismissed: false,
            expires_at: null,
            created_at: '2025-01-01T00:00:00Z',
        },
        {
            id: 'sug-2',
            suggestion_type: 'unread',
            title: '5 messages non lus',
            body: 'De Marie et Thomas',
            metadata: {},
            is_dismissed: false,
            expires_at: null,
            created_at: '2025-01-01T00:00:00Z',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRpc.mockResolvedValue({ data: mockSuggestions, error: null });
    });

    it('renders suggestions from Alice', async () => {
        const { getByText, getByTestId } = render(<AliceHomeBanner />);

        await waitFor(() => {
            expect(getByText('Alice suggère')).toBeTruthy();
        });

        await waitFor(() => {
            expect(getByTestId('suggestion-sug-1')).toBeTruthy();
            expect(getByText('Réunion à 14h')).toBeTruthy();
            expect(getByTestId('suggestion-sug-2')).toBeTruthy();
            expect(getByText('5 messages non lus')).toBeTruthy();
        });
    });

    it('dismisses a suggestion on pressing X', async () => {
        mockRpc
            .mockResolvedValueOnce({ data: mockSuggestions, error: null })
            .mockResolvedValueOnce({ data: null, error: null });

        const { getByTestId, queryByTestId } = render(<AliceHomeBanner />);

        await waitFor(() => {
            expect(getByTestId('suggestion-sug-1')).toBeTruthy();
        });

        await act(async () => {
            fireEvent.press(getByTestId('dismiss-sug-1'));
        });

        await waitFor(() => {
            expect(queryByTestId('suggestion-sug-1')).toBeNull();
        });
    });

    it('returns null when no suggestions', async () => {
        mockRpc.mockResolvedValue({ data: [], error: null });

        const { toJSON } = render(<AliceHomeBanner />);

        await waitFor(() => {
            expect(toJSON()).toBeNull();
        });
    });

    it('renders suggestion icons per type', async () => {
        const { getByTestId } = render(<AliceHomeBanner />);

        await waitFor(() => {
            expect(getByTestId('suggestion-sug-1')).toBeTruthy();
        });

        // Each card renders its corresponding icon
        expect(getByTestId('icon-calendar-outline')).toBeTruthy();
        expect(getByTestId('icon-chatbubble-outline')).toBeTruthy();
    });
});

// ============================================================================
// DailySummaryCard Tests
// ============================================================================

describe('DailySummaryCard', () => {
    const mockSummaryRow = {
        id: 'sum-1',
        user_id: 'user-1',
        summary_date: '2025-01-15',
        content: 'Bonjour ! Tu as 3 messages et 1 événement.',
        context: { unreadMessages: 3, upcomingEvents: 1 },
        created_at: '2025-01-15T07:00:00Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock chain for supabase.from(...).select(...).eq(...).eq(...).maybeSingle()
        const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: mockSummaryRow, error: null }),
        };
        mockFrom.mockReturnValue(mockChain);
    });

    it('renders daily summary content', async () => {
        const { getByText, getByTestId } = render(<DailySummaryCard />);

        await waitFor(() => {
            expect(getByTestId('daily-summary-card')).toBeTruthy();
        });

        expect(getByText('Bonjour ! Voici ton résumé')).toBeTruthy();
        expect(getByText('Bonjour ! Tu as 3 messages et 1 événement.')).toBeTruthy();
    });

    it('shows context badges for unread and events', async () => {
        const { getByTestId } = render(<DailySummaryCard />);

        await waitFor(() => {
            expect(getByTestId('badge-unread')).toBeTruthy();
            expect(getByTestId('badge-events')).toBeTruthy();
        });
    });

    it('collapses and expands on toggle press', async () => {
        const { getByTestId, queryByTestId } = render(<DailySummaryCard />);

        await waitFor(() => {
            expect(getByTestId('daily-summary-card')).toBeTruthy();
        });

        // Collapse
        fireEvent.press(getByTestId('daily-summary-toggle'));
        expect(queryByTestId('badge-unread')).toBeNull();

        // Expand
        fireEvent.press(getByTestId('daily-summary-toggle'));
        expect(getByTestId('badge-unread')).toBeTruthy();
    });

    it('shows loading state initially', async () => {
        const { getByTestId } = render(<DailySummaryCard />);
        // Loading spinner should be shown initially
        expect(getByTestId('daily-summary-loading')).toBeTruthy();
    });

    it('calls onRefresh when refresh button pressed', async () => {
        const onRefresh = jest.fn();
        const { getByTestId } = render(<DailySummaryCard onRefresh={onRefresh} />);

        await waitFor(() => {
            expect(getByTestId('daily-summary-card')).toBeTruthy();
        });

        fireEvent.press(getByTestId('daily-summary-refresh'));
        expect(onRefresh).toHaveBeenCalled();
    });
});

// ============================================================================
// QuickChatAlice Tests
// ============================================================================

describe('QuickChatAlice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders collapsed trigger initially', () => {
        const { getByTestId, queryByTestId } = render(<QuickChatAlice />);

        expect(getByTestId('quick-chat-trigger')).toBeTruthy();
        expect(queryByTestId('quick-chat-container')).toBeNull();
    });

    it('expands on trigger press', () => {
        const { getByTestId, queryByTestId } = render(<QuickChatAlice />);

        fireEvent.press(getByTestId('quick-chat-trigger'));

        expect(getByTestId('quick-chat-container')).toBeTruthy();
        expect(getByTestId('quick-chat-input')).toBeTruthy();
        expect(queryByTestId('quick-chat-trigger')).toBeNull();
    });

    it('collapses on close button press', () => {
        const { getByTestId, queryByTestId } = render(<QuickChatAlice />);

        fireEvent.press(getByTestId('quick-chat-trigger'));
        expect(getByTestId('quick-chat-container')).toBeTruthy();

        fireEvent.press(getByTestId('quick-chat-close'));
        expect(getByTestId('quick-chat-trigger')).toBeTruthy();
        expect(queryByTestId('quick-chat-container')).toBeNull();
    });

    it('sends message and shows reply', async () => {
        // Mock the service function — restore after test
        const spy = jest.spyOn(aliceHome, 'sendQuickChat').mockResolvedValue({
            reply: 'Voici ta réponse !',
            conversationId: 'conv-quick',
        });

        const { getByTestId, getByText } = render(<QuickChatAlice />);

        // Expand
        fireEvent.press(getByTestId('quick-chat-trigger'));

        // Type
        fireEvent.changeText(getByTestId('quick-chat-input'), 'Quel temps ?');

        // Send
        await act(async () => {
            fireEvent.press(getByTestId('quick-chat-send'));
        });

        await waitFor(() => {
            expect(getByTestId('quick-chat-reply')).toBeTruthy();
        });

        spy.mockRestore();
    });

    it('has send button disabled when input is empty', () => {
        const { getByTestId } = render(<QuickChatAlice />);

        fireEvent.press(getByTestId('quick-chat-trigger'));

        const sendBtn = getByTestId('quick-chat-send');
        // Button is rendered but disabled
        expect(sendBtn.props.accessibilityState?.disabled ?? sendBtn.props.disabled).toBeTruthy();
    });
});

// ============================================================================
// alice-home Service Tests
// ============================================================================

describe('alice-home service', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('getActiveSuggestions', () => {
        it('returns mapped suggestions from RPC', async () => {
            mockRpc.mockResolvedValue({
                data: [
                    {
                        id: 's1',
                        suggestion_type: 'tip',
                        title: 'Tip du jour',
                        body: 'Essaie le mode sombre',
                        metadata: {},
                        is_dismissed: false,
                        expires_at: null,
                        created_at: '2025-01-01T00:00:00Z',
                    },
                ],
                error: null,
            });

            const result = await aliceHome.getActiveSuggestions();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
            expect(result[0].type).toBe('tip');
            expect(result[0].title).toBe('Tip du jour');
        });

        it('returns empty array on error', async () => {
            mockRpc.mockResolvedValue({ data: null, error: { message: 'fail' } });

            const result = await aliceHome.getActiveSuggestions();
            expect(result).toEqual([]);
        });
    });

    describe('dismissSuggestion', () => {
        it('calls dismiss RPC and returns true on success', async () => {
            mockRpc.mockResolvedValue({ data: null, error: null });

            const ok = await aliceHome.dismissSuggestion('sug-1');
            expect(ok).toBe(true);
            expect(mockRpc).toHaveBeenCalledWith('dismiss_suggestion', {
                p_suggestion_id: 'sug-1',
            });
        });

        it('returns false on error', async () => {
            mockRpc.mockResolvedValue({ data: null, error: { message: 'not found' } });

            const ok = await aliceHome.dismissSuggestion('sug-xx');
            expect(ok).toBe(false);
        });
    });

    describe('sendQuickChat', () => {
        it('sends message via Alice and returns reply', async () => {
            const result = await aliceHome.sendQuickChat('Salut !');

            expect(result).not.toBeNull();
            expect(result!.reply).toBeTruthy();
            expect(result!.conversationId).toBeTruthy();
        });
    });

    describe('getModuleRecommendations', () => {
        it('returns recommendations for stale modules', async () => {
            const staleDate = new Date(Date.now() - 15 * 86400000).toISOString();
            const mockLimit = jest.fn().mockResolvedValue({
                data: [
                    { module_id: 'tasks', usage_count: 10, last_used_at: staleDate },
                    { module_id: 'calendar', usage_count: 5, last_used_at: staleDate },
                    { module_id: 'new_mod', usage_count: 1, last_used_at: staleDate },
                ],
                error: null,
            });
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnValue({ ascending: false, limit: mockLimit }),
                limit: mockLimit,
            };
            // order returns object with limit
            mockChain.order = jest.fn().mockReturnValue({ limit: mockLimit });
            mockFrom.mockReturnValue(mockChain);

            const recs = await aliceHome.getModuleRecommendations();

            // new_mod has usage_count < 3, should be excluded
            expect(recs.length).toBeGreaterThanOrEqual(2);
            expect(recs[0].moduleId).toBe('tasks');
            expect(recs[0].reason).toContain('Ça fait un moment');
        });

        it('returns empty array when no stale modules', async () => {
            const recentDate = new Date().toISOString();
            const mockLimit = jest.fn().mockResolvedValue({
                data: [
                    { module_id: 'chat', usage_count: 5, last_used_at: recentDate },
                ],
                error: null,
            });
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnValue({ limit: mockLimit }),
                limit: mockLimit,
            };
            mockFrom.mockReturnValue(mockChain);

            const recs = await aliceHome.getModuleRecommendations();
            expect(recs).toEqual([]);
        });
    });

    describe('getDailySummary', () => {
        it('returns existing summary when found', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                maybeSingle: jest.fn().mockResolvedValue({
                    data: {
                        id: 'sum-1',
                        summary_date: '2025-01-15',
                        content: 'Good morning!',
                        context: { unreadMessages: 2 },
                        created_at: '2025-01-15T07:00:00Z',
                    },
                    error: null,
                }),
            };
            mockFrom.mockReturnValue(mockChain);

            const summary = await aliceHome.getDailySummary();
            expect(summary).not.toBeNull();
            expect(summary!.content).toBe('Good morning!');
            expect(summary!.context.unreadMessages).toBe(2);
        });
    });
});
