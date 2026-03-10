/**
 * Tests for Sprint S12B — Gamification ImuFeed
 *
 * - gamification-service (XP table, level calc, tier, buildCreatorLevel, badge defs)
 * - GamificationService class (recordXPEvent, getCreatorLevel, getCreatorBadges, getDailyChallenges, getWeeklyLeaderboard)
 * - CreatorLevelBadge (compact, detailed, progress bar, tier display)
 * - DailyChallenges (render list, progress, claim button, empty state)
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

// ─── Imports ──────────────────────────────────────────────────

import {
    BADGE_DEFINITIONS,
    buildCreatorLevel,
    calculateLevel,
    currentXPInLevel,
    GamificationService,
    getTierForLevel,
    getXPForAction,
    levelProgress,
    TIER_TABLE,
    XP_MAP,
    XP_TABLE,
    xpForNextLevel,
} from '@/services/imufeed/gamification-service';
import type { CreatorLevel, DailyChallenge } from '@/types/gamification';
import CreatorLevelBadge from '../../imufeed/CreatorLevelBadge';
import DailyChallenges from '../../imufeed/DailyChallenges';

// ============================================================================
// gamification-service — Pure utility functions
// ============================================================================

describe('gamification-service', () => {
    // ── XP Configuration ──────────────────────────────────────

    it('XP_TABLE has entries for all 10 actions', () => {
        expect(XP_TABLE).toHaveLength(10);
    });

    it('XP_MAP maps publish_video to 50', () => {
        expect(XP_MAP.publish_video).toBe(50);
    });

    it('XP_MAP maps like_received to 2', () => {
        expect(XP_MAP.like_received).toBe(2);
    });

    it('XP_MAP maps views_10k to 500', () => {
        expect(XP_MAP.views_10k).toBe(500);
    });

    it('XP_MAP maps challenge_completed to 200', () => {
        expect(XP_MAP.challenge_completed).toBe(200);
    });

    it('getXPForAction returns correct XP', () => {
        expect(getXPForAction('publish_video')).toBe(50);
        expect(getXPForAction('comment_received')).toBe(5);
        expect(getXPForAction('first_video')).toBe(100);
    });

    // ── Tier Configuration ────────────────────────────────────

    it('TIER_TABLE has 6 tiers', () => {
        expect(TIER_TABLE).toHaveLength(6);
        expect(TIER_TABLE[0].tier).toBe('bronze');
        expect(TIER_TABLE[5].tier).toBe('legend');
    });

    it('tier ranges are contiguous: Bronze 1-10, Silver 11-20, Gold 21-30, Platinum 31-40, Diamond 41-50, Legend 51+', () => {
        expect(TIER_TABLE[0]).toMatchObject({ tier: 'bronze', minLevel: 1, maxLevel: 10 });
        expect(TIER_TABLE[1]).toMatchObject({ tier: 'silver', minLevel: 11, maxLevel: 20 });
        expect(TIER_TABLE[2]).toMatchObject({ tier: 'gold', minLevel: 21, maxLevel: 30 });
        expect(TIER_TABLE[3]).toMatchObject({ tier: 'platinum', minLevel: 31, maxLevel: 40 });
        expect(TIER_TABLE[4]).toMatchObject({ tier: 'diamond', minLevel: 41, maxLevel: 50 });
        expect(TIER_TABLE[5]).toMatchObject({ tier: 'legend', minLevel: 51 });
    });

    // ── Level calculation ─────────────────────────────────────

    it('calculateLevel: 0 XP → level 1', () => {
        expect(calculateLevel(0)).toBe(1);
    });

    it('calculateLevel: 99 XP → level 1', () => {
        expect(calculateLevel(99)).toBe(1);
    });

    it('calculateLevel: 100 XP → level 2', () => {
        expect(calculateLevel(100)).toBe(2);
    });

    it('calculateLevel: 5000 XP → level 51 (Légende)', () => {
        expect(calculateLevel(5000)).toBe(51);
    });

    it('xpForNextLevel: level 5 → 500', () => {
        expect(xpForNextLevel(5)).toBe(500);
    });

    it('currentXPInLevel: 250 XP → 50 in level', () => {
        expect(currentXPInLevel(250)).toBe(50);
    });

    it('levelProgress: 50 XP → 50%', () => {
        expect(levelProgress(50)).toBe(50);
    });

    it('levelProgress: 0 XP → 0%', () => {
        expect(levelProgress(0)).toBe(0);
    });

    // ── Tier for level ────────────────────────────────────────

    it('getTierForLevel: level 1 → bronze', () => {
        expect(getTierForLevel(1).tier).toBe('bronze');
    });

    it('getTierForLevel: level 15 → silver', () => {
        expect(getTierForLevel(15).tier).toBe('silver');
    });

    it('getTierForLevel: level 25 → gold', () => {
        expect(getTierForLevel(25).tier).toBe('gold');
    });

    it('getTierForLevel: level 51 → legend', () => {
        expect(getTierForLevel(51).tier).toBe('legend');
    });

    // ── buildCreatorLevel ─────────────────────────────────────

    it('buildCreatorLevel builds complete level info', () => {
        const result = buildCreatorLevel('u-1', 250);
        expect(result).toEqual({
            user_id: 'u-1',
            level: 3,
            total_xp: 250,
            tier: 'bronze',
            xp_for_next_level: 300,
            current_xp_in_level: 50,
        });
    });

    it('buildCreatorLevel: 5000 XP → legend tier', () => {
        const result = buildCreatorLevel('u-2', 5000);
        expect(result.tier).toBe('legend');
        expect(result.level).toBe(51);
    });

    // ── Badge definitions ─────────────────────────────────────

    it('BADGE_DEFINITIONS has 8+ badges', () => {
        expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(8);
    });

    it('badges include First Video, Viral, Creator King', () => {
        const ids = BADGE_DEFINITIONS.map((b) => b.id);
        expect(ids).toContain('first_video');
        expect(ids).toContain('viral');
        expect(ids).toContain('creator_king');
    });

    it('badges have rarity: common, rare, epic, legendary', () => {
        const rarities = new Set(BADGE_DEFINITIONS.map((b) => b.rarity));
        expect(rarities).toContain('common');
        expect(rarities).toContain('rare');
        expect(rarities).toContain('epic');
        expect(rarities).toContain('legendary');
    });
});

// ============================================================================
// GamificationService — Class methods with mock supabase
// ============================================================================

describe('GamificationService', () => {
    let service: GamificationService;
    let mockSupabase: any;
    let mockInsert: jest.Mock;
    let mockSelect: jest.Mock;
    let mockEq: jest.Mock;
    let mockSingle: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        mockInsert = jest.fn();
        mockSelect = jest.fn();
        mockEq = jest.fn();
        mockSingle = jest.fn();

        mockSupabase = {
            from: jest.fn(),
            rpc: jest.fn(),
        };

        service = new GamificationService(mockSupabase);
    });

    // ── recordXPEvent ─────────────────────────────────────────

    it('recordXPEvent inserts event and calls calculate_creator_level', async () => {
        mockSupabase.from.mockReturnValue({
            insert: mockInsert.mockResolvedValue({ error: null }),
        });
        mockSupabase.rpc.mockResolvedValue({
            data: [{ level: 2, total_xp: 150, tier: 'bronze' }],
            error: null,
        });

        const result = await service.recordXPEvent('u-1', 'publish_video');

        expect(mockSupabase.from).toHaveBeenCalledWith('creator_xp_events');
        expect(mockInsert).toHaveBeenCalledWith({
            user_id: 'u-1',
            action: 'publish_video',
            xp_amount: 50,
            source_id: null,
        });
        expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_creator_level', { p_user_id: 'u-1' });
        expect(result.level).toBe(2);
        expect(result.total_xp).toBe(150);
    });

    it('recordXPEvent throws on insert error', async () => {
        mockSupabase.from.mockReturnValue({
            insert: mockInsert.mockResolvedValue({ error: new Error('Insert fail') }),
        });

        await expect(service.recordXPEvent('u-1', 'like_received')).rejects.toThrow('Insert fail');
    });

    // ── getCreatorLevel ───────────────────────────────────────

    it('getCreatorLevel returns level from DB', async () => {
        const chain = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { user_id: 'u-1', total_xp: 300 }, error: null }) };
        mockSupabase.from.mockReturnValue(chain);

        const result = await service.getCreatorLevel('u-1');

        expect(result.level).toBe(4);
        expect(result.total_xp).toBe(300);
        expect(result.tier).toBe('bronze');
    });

    it('getCreatorLevel returns level 1 if not found', async () => {
        const chain = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }) };
        mockSupabase.from.mockReturnValue(chain);

        const result = await service.getCreatorLevel('u-new');

        expect(result.level).toBe(1);
        expect(result.total_xp).toBe(0);
    });

    // ── getCreatorBadges ──────────────────────────────────────

    it('getCreatorBadges returns badges with unlock status', async () => {
        const chain = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: [{ badge_id: 'first_video', unlocked_at: '2025-01-01T00:00:00Z' }], error: null }) };
        mockSupabase.from.mockReturnValue(chain);

        const badges = await service.getCreatorBadges('u-1');

        expect(badges.length).toBeGreaterThanOrEqual(8);
        const firstVideo = badges.find((b) => b.id === 'first_video');
        expect(firstVideo?.unlocked).toBe(true);
        const viral = badges.find((b) => b.id === 'viral');
        expect(viral?.unlocked).toBe(false);
    });

    // ── getDailyChallenges ────────────────────────────────────

    it('getDailyChallenges returns challenges with progress', async () => {
        const challengeData = [
            { id: 'ch-1', title: 'Publie une vidéo', description: 'Desc', action_type: 'publish', target: 1, xp_reward: 200, is_active: true },
            { id: 'ch-2', title: 'Like 5 vidéos', description: 'Desc', action_type: 'like', target: 5, xp_reward: 100, is_active: true },
        ];
        const progressData = [
            { challenge_id: 'ch-1', current: 1, completed: true, claimed: false },
        ];

        let callCount = 0;
        mockSupabase.from.mockImplementation((table: string) => {
            callCount++;
            if (table === 'daily_challenges') {
                const eqFn = jest.fn().mockResolvedValue({ data: challengeData, error: null });
                return { select: jest.fn().mockReturnValue({ eq: eqFn }) };
            }
            // user_daily_progress: select → eq(user_id) → eq(day)
            const eqDay = jest.fn().mockResolvedValue({ data: progressData, error: null });
            const eqUser = jest.fn().mockReturnValue({ eq: eqDay });
            return { select: jest.fn().mockReturnValue({ eq: eqUser }) };
        });

        const challenges = await service.getDailyChallenges('u-1');

        expect(challenges).toHaveLength(2);
        expect(challenges[0].completed).toBe(true);
        expect(challenges[0].current).toBe(1);
        expect(challenges[1].current).toBe(0);
    });

    // ── getWeeklyLeaderboard ──────────────────────────────────

    it('getWeeklyLeaderboard returns ranked creators', async () => {
        mockSupabase.rpc.mockResolvedValue({
            data: [
                { user_id: 'u-1', username: 'TopCreator', total_xp: 500, level: 6, tier: 'bronze', rank: 1 },
                { user_id: 'u-2', username: 'Runner', total_xp: 300, level: 4, tier: 'bronze', rank: 2 },
            ],
            error: null,
        });

        const lb = await service.getWeeklyLeaderboard(10);

        expect(lb).toHaveLength(2);
        expect(lb[0].rank).toBe(1);
        expect(lb[0].username).toBe('TopCreator');
        expect(lb[1].rank).toBe(2);
    });

    it('getWeeklyLeaderboard returns empty on error', async () => {
        mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'fail' } });

        const lb = await service.getWeeklyLeaderboard();

        expect(lb).toEqual([]);
    });
});

// ============================================================================
// CreatorLevelBadge Tests
// ============================================================================

describe('CreatorLevelBadge', () => {
    const bronzeLevel: CreatorLevel = {
        user_id: 'u-1',
        level: 5,
        total_xp: 450,
        tier: 'bronze',
        xp_for_next_level: 500,
        current_xp_in_level: 50,
    };

    const legendLevel: CreatorLevel = {
        user_id: 'u-2',
        level: 55,
        total_xp: 5450,
        tier: 'legend',
        xp_for_next_level: 5500,
        current_xp_in_level: 50,
    };

    it('renders compact variant with tier emoji and level', () => {
        const { getByTestId, getByText } = render(
            <CreatorLevelBadge level={bronzeLevel} />,
        );

        expect(getByTestId('creator-level-badge')).toBeTruthy();
        expect(getByText('🥉')).toBeTruthy();
        expect(getByText('Nv.5')).toBeTruthy();
    });

    it('renders detailed variant with tier label and progress bar', () => {
        const { getByTestId, getByText } = render(
            <CreatorLevelBadge level={bronzeLevel} variant="detailed" />,
        );

        expect(getByTestId('creator-level-badge')).toBeTruthy();
        expect(getByText('Bronze')).toBeTruthy();
        expect(getByText('Niveau 5')).toBeTruthy();
        expect(getByTestId('xp-progress-bar')).toBeTruthy();
        expect(getByText('50 / 500 XP')).toBeTruthy();
    });

    it('renders legend tier correctly', () => {
        const { getByText } = render(
            <CreatorLevelBadge level={legendLevel} variant="detailed" />,
        );

        expect(getByText('👑')).toBeTruthy();
        expect(getByText('Légende')).toBeTruthy();
        expect(getByText('Niveau 55')).toBeTruthy();
    });
});

// ============================================================================
// DailyChallenges Tests
// ============================================================================

describe('DailyChallenges', () => {
    const onClaim = jest.fn();

    afterEach(() => jest.clearAllMocks());

    const mockChallenges: DailyChallenge[] = [
        { id: 'ch-1', title: 'Publie une vidéo', description: 'Au moins 1', action_type: 'publish', target: 1, current: 1, xp_reward: 200, completed: true, claimed: false },
        { id: 'ch-2', title: 'Like 5 vidéos', description: 'Like 5', action_type: 'like', target: 5, current: 3, xp_reward: 100, completed: false, claimed: false },
        { id: 'ch-3', title: 'Partage', description: 'Partage 1', action_type: 'share', target: 1, current: 1, xp_reward: 100, completed: true, claimed: true },
    ];

    it('renders section title "Défis du jour"', () => {
        const { getByText } = render(
            <DailyChallenges challenges={mockChallenges} onClaim={onClaim} />,
        );

        expect(getByText('🎯 Défis du jour')).toBeTruthy();
    });

    it('renders all challenge cards', () => {
        const { getByTestId } = render(
            <DailyChallenges challenges={mockChallenges} onClaim={onClaim} />,
        );

        expect(getByTestId('challenge-ch-1')).toBeTruthy();
        expect(getByTestId('challenge-ch-2')).toBeTruthy();
        expect(getByTestId('challenge-ch-3')).toBeTruthy();
    });

    it('shows XP reward labels', () => {
        const { getByText, getAllByText } = render(
            <DailyChallenges challenges={mockChallenges} onClaim={onClaim} />,
        );

        expect(getByText('+200 XP')).toBeTruthy();
        // ch-2 and ch-3 both have +100 XP
        expect(getAllByText('+100 XP')).toHaveLength(2);
    });

    it('shows progress fractions', () => {
        const { getAllByText, getByText } = render(
            <DailyChallenges challenges={mockChallenges} onClaim={onClaim} />,
        );

        // ch-1 and ch-3 both show 1/1
        expect(getAllByText('1/1')).toHaveLength(2);
        expect(getByText('3/5')).toBeTruthy();
    });

    it('shows "Réclamer" button for completed non-claimed challenge', () => {
        const { getByTestId, getByText } = render(
            <DailyChallenges challenges={mockChallenges} onClaim={onClaim} />,
        );

        expect(getByText('Réclamer')).toBeTruthy();
        fireEvent.press(getByTestId('claim-ch-1'));
        expect(onClaim).toHaveBeenCalledWith('ch-1');
    });

    it('shows "Réclamé" for already claimed challenge', () => {
        const { getByTestId } = render(
            <DailyChallenges challenges={mockChallenges} onClaim={onClaim} />,
        );

        expect(getByTestId('claimed-ch-3')).toBeTruthy();
    });

    it('shows empty state when no challenges', () => {
        const { getByTestId } = render(
            <DailyChallenges challenges={[]} onClaim={onClaim} />,
        );

        expect(getByTestId('no-challenges')).toBeTruthy();
    });
});
