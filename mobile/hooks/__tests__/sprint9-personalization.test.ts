/**
 * Tests for Sprint S9A — Personnalisation Engine
 *
 * - useTimeOfDay hook (getTimePeriod, priorities)
 * - Usage tracking service (trackModuleUsage, fetchStaleModules)
 * - Modules store (trackUsage, getInstalledSortedByUsage, staleModules)
 * - Home-config store (getTimeSortedSections, getTimeSortedWidgets)
 */

// ─── Mocks ────────────────────────────────────────────────────

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
const mockGetUser = jest.fn();

jest.mock('@/services/supabase', () => ({
    supabase: {
        rpc: (...args) => mockRpc(...args),
        from: (...args) => mockFrom(...args),
        auth: { getUser: (...args) => mockGetUser(...args) },
    },
    getCurrentUser: () => Promise.resolve({ id: 'user-1' }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

// Mock all modules-api functions
jest.mock('@/services/modules-api', () => ({
    fetchModuleCatalog: jest.fn().mockResolvedValue([]),
    fetchUserModules: jest.fn().mockResolvedValue([]),
    installModule: jest.fn(),
    uninstallModule: jest.fn(),
    setModuleActive: jest.fn(),
    searchModules: jest.fn().mockResolvedValue([]),
    autoInstallDefaultModules: jest.fn().mockResolvedValue(0),
    fetchModuleReviews: jest.fn().mockResolvedValue([]),
    fetchReviewStats: jest.fn().mockResolvedValue({ averageRating: 0, totalReviews: 0, distribution: {} }),
    fetchUserReview: jest.fn().mockResolvedValue(null),
    submitReview: jest.fn(),
    deleteReview: jest.fn(),
    fetchTrendingModules: jest.fn().mockResolvedValue([]),
    fetchTopRatedModules: jest.fn().mockResolvedValue([]),
    fetchNewReleases: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/usage-tracking', () => ({
    trackModuleUsage: jest.fn().mockResolvedValue(undefined),
    fetchStaleModules: jest.fn().mockResolvedValue([]),
    fetchModuleUsageStats: jest.fn().mockResolvedValue([]),
}));

import { getTimePeriod, TIME_BASED_PRIORITIES, TIME_BASED_WIDGETS } from '@/hooks/useTimeOfDay';
import { fetchStaleModules, trackModuleUsage } from '@/services/usage-tracking';

// ──────────────────────────────────────────────────────────────
// Suite 1: getTimePeriod — pure function
// ──────────────────────────────────────────────────────────────

describe('getTimePeriod', () => {
    it('returns morning for 6-11', () => {
        expect(getTimePeriod(6)).toBe('morning');
        expect(getTimePeriod(8)).toBe('morning');
        expect(getTimePeriod(11)).toBe('morning');
    });

    it('returns afternoon for 12-17', () => {
        expect(getTimePeriod(12)).toBe('afternoon');
        expect(getTimePeriod(14)).toBe('afternoon');
        expect(getTimePeriod(17)).toBe('afternoon');
    });

    it('returns evening for 18-21', () => {
        expect(getTimePeriod(18)).toBe('evening');
        expect(getTimePeriod(20)).toBe('evening');
        expect(getTimePeriod(21)).toBe('evening');
    });

    it('returns night for 22-5', () => {
        expect(getTimePeriod(22)).toBe('night');
        expect(getTimePeriod(0)).toBe('night');
        expect(getTimePeriod(3)).toBe('night');
        expect(getTimePeriod(5)).toBe('night');
    });

    it('handles boundary hours correctly', () => {
        expect(getTimePeriod(5)).toBe('night');
        expect(getTimePeriod(6)).toBe('morning');
        expect(getTimePeriod(11)).toBe('morning');
        expect(getTimePeriod(12)).toBe('afternoon');
        expect(getTimePeriod(17)).toBe('afternoon');
        expect(getTimePeriod(18)).toBe('evening');
        expect(getTimePeriod(21)).toBe('evening');
        expect(getTimePeriod(22)).toBe('night');
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: TIME_BASED_PRIORITIES — config object
// ──────────────────────────────────────────────────────────────

describe('TIME_BASED_PRIORITIES', () => {
    it('has entries for all 4 periods', () => {
        expect(TIME_BASED_PRIORITIES).toHaveProperty('morning');
        expect(TIME_BASED_PRIORITIES).toHaveProperty('afternoon');
        expect(TIME_BASED_PRIORITIES).toHaveProperty('evening');
        expect(TIME_BASED_PRIORITIES).toHaveProperty('night');
    });

    it('each period has an array of section IDs', () => {
        for (const period of ['morning', 'afternoon', 'evening', 'night'] as const) {
            expect(Array.isArray(TIME_BASED_PRIORITIES[period])).toBe(true);
            expect(TIME_BASED_PRIORITIES[period].length).toBeGreaterThan(0);
        }
    });

    it('morning priorities include agenda and tasks', () => {
        expect(TIME_BASED_PRIORITIES.morning).toContain('agenda');
        expect(TIME_BASED_PRIORITIES.morning).toContain('tasks');
    });

    it('evening priorities include social and imufeed', () => {
        expect(TIME_BASED_PRIORITIES.evening).toContain('social');
        expect(TIME_BASED_PRIORITIES.evening).toContain('imufeed');
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 3: TIME_BASED_WIDGETS — config object
// ──────────────────────────────────────────────────────────────

describe('TIME_BASED_WIDGETS', () => {
    it('has entries for all 4 periods', () => {
        expect(TIME_BASED_WIDGETS).toHaveProperty('morning');
        expect(TIME_BASED_WIDGETS).toHaveProperty('afternoon');
        expect(TIME_BASED_WIDGETS).toHaveProperty('evening');
        expect(TIME_BASED_WIDGETS).toHaveProperty('night');
    });

    it('morning widgets include agenda and weather', () => {
        expect(TIME_BASED_WIDGETS.morning).toContain('agenda');
        expect(TIME_BASED_WIDGETS.morning).toContain('weather');
    });

    it('afternoon widgets include arena', () => {
        expect(TIME_BASED_WIDGETS.afternoon).toContain('arena');
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 4: Usage tracking service
// ──────────────────────────────────────────────────────────────

describe('Usage Tracking Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('trackModuleUsage', () => {
        it('is a function', () => {
            expect(typeof trackModuleUsage).toBe('function');
        });

        it('can be called without throwing', async () => {
            await expect(trackModuleUsage('mod-1')).resolves.not.toThrow();
        });
    });

    describe('fetchStaleModules', () => {
        it('is a function', () => {
            expect(typeof fetchStaleModules).toBe('function');
        });

        it('returns an array', async () => {
            const result = await fetchStaleModules(7);
            expect(Array.isArray(result)).toBe(true);
        });
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 5: Modules store — new S9 actions
// ──────────────────────────────────────────────────────────────

describe('Modules Store — S9 Personalization', () => {
    // Reset store before each test
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset store state by re-importing
        const { useModulesStore } = require('@/stores/modules-store');
        useModulesStore.getState().reset();
    });

    it('has trackUsage action', () => {
        const { useModulesStore } = require('@/stores/modules-store');
        expect(typeof useModulesStore.getState().trackUsage).toBe('function');
    });

    it('has fetchStale action', () => {
        const { useModulesStore } = require('@/stores/modules-store');
        expect(typeof useModulesStore.getState().fetchStale).toBe('function');
    });

    it('has getInstalledSortedByUsage action', () => {
        const { useModulesStore } = require('@/stores/modules-store');
        expect(typeof useModulesStore.getState().getInstalledSortedByUsage).toBe('function');
    });

    it('trackUsage increments usage_count locally', async () => {
        const { useModulesStore } = require('@/stores/modules-store');
        const store = useModulesStore.getState();

        // Set up a test module
        useModulesStore.setState({
            installedModules: [
                {
                    id: 'inst-1',
                    user_id: 'user-1',
                    module_id: 'mod-1',
                    installed_version: '1.0.0',
                    is_active: true,
                    granted_permissions: [],
                    settings: {},
                    installed_at: '2026-01-01T00:00:00Z',
                    updated_at: '2026-01-01T00:00:00Z',
                    usage_count: 5,
                    last_used_at: null,
                },
            ],
        });

        await useModulesStore.getState().trackUsage('mod-1');

        const updated = useModulesStore.getState().installedModules[0];
        expect(updated.usage_count).toBe(6);
        expect(updated.last_used_at).toBeTruthy();
    });

    it('getInstalledSortedByUsage sorts by usage_count DESC', () => {
        const { useModulesStore } = require('@/stores/modules-store');

        useModulesStore.setState({
            installedModules: [
                {
                    id: 'inst-1', user_id: 'u', module_id: 'm1', installed_version: '1.0',
                    is_active: true, granted_permissions: [], settings: {},
                    installed_at: '', updated_at: '', usage_count: 3, last_used_at: null,
                },
                {
                    id: 'inst-2', user_id: 'u', module_id: 'm2', installed_version: '1.0',
                    is_active: true, granted_permissions: [], settings: {},
                    installed_at: '', updated_at: '', usage_count: 10, last_used_at: null,
                },
                {
                    id: 'inst-3', user_id: 'u', module_id: 'm3', installed_version: '1.0',
                    is_active: false, granted_permissions: [], settings: {},
                    installed_at: '', updated_at: '', usage_count: 20, last_used_at: null,
                },
            ],
        });

        const sorted = useModulesStore.getState().getInstalledSortedByUsage();
        // Only active modules
        expect(sorted).toHaveLength(2);
        // Sorted by usage DESC
        expect(sorted[0].module_id).toBe('m2');
        expect(sorted[1].module_id).toBe('m1');
    });

    it('fetchStale updates staleModules in state', async () => {
        const { fetchStaleModules: mockFetch } = require('@/services/usage-tracking');
        mockFetch.mockResolvedValue([
            { module_id: 'm1', module_name: 'Chat', last_used_at: null, usage_count: 0 },
        ]);

        const { useModulesStore } = require('@/stores/modules-store');
        await useModulesStore.getState().fetchStale(7);

        expect(useModulesStore.getState().staleModules).toHaveLength(1);
        expect(useModulesStore.getState().staleModules[0].module_id).toBe('m1');
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 6: Home-config store — time-sorted getters
// ──────────────────────────────────────────────────────────────

describe('Home Config Store — Time Sorted (S9)', () => {
    beforeEach(() => {
        const { useHomeConfigStore } = require('@/stores/home-config-store');
        useHomeConfigStore.getState().resetToDefaults();
    });

    it('has getTimeSortedSections getter', () => {
        const { useHomeConfigStore } = require('@/stores/home-config-store');
        expect(typeof useHomeConfigStore.getState().getTimeSortedSections).toBe('function');
    });

    it('has getTimeSortedWidgets getter', () => {
        const { useHomeConfigStore } = require('@/stores/home-config-store');
        expect(typeof useHomeConfigStore.getState().getTimeSortedWidgets).toBe('function');
    });

    it('getTimeSortedSections returns visible sections', () => {
        const { useHomeConfigStore } = require('@/stores/home-config-store');
        const sorted = useHomeConfigStore.getState().getTimeSortedSections();
        expect(Array.isArray(sorted)).toBe(true);
        sorted.forEach(s => expect(s.visible).toBe(true));
    });

    it('getTimeSortedWidgets returns only visible widgets', () => {
        const { useHomeConfigStore } = require('@/stores/home-config-store');
        const store = useHomeConfigStore.getState();

        // Add some widgets
        store.addWidget({
            id: 'w1', type: 'weather', titleKey: 'W', size: '1x1',
            icon: 'cloud', order: 0, visible: true,
        });
        store.addWidget({
            id: 'w2', type: 'agenda', titleKey: 'A', size: '2x1',
            icon: 'calendar', order: 1, visible: false,
        });

        const sorted = useHomeConfigStore.getState().getTimeSortedWidgets();
        // Only visible widgets
        expect(sorted).toHaveLength(1);
        expect(sorted[0].id).toBe('w1');
    });
});
