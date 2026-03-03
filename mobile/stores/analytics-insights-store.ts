/**
 * Analytics & Insights Store (Zustand) — DEV-036
 *
 * Manages the Analytics portal state:
 *  - Period selector
 *  - Overview metrics (messages, calls, media, etc.)
 *  - Engagement data (sessions, retention, usage patterns)
 *  - Communication analytics (messages/calls breakdown)
 *  - Social analytics (followers, engagement rate)
 *  - Storage analytics (disk usage by category)
 *  - Activity heatmap
 *  - CSV/JSON export
 *
 * Persisted via AsyncStorage (only exports & period).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createLogger } from "@/services/logger";
import type {
    ActivityHeatmap,
    AnalyticsInsightsState,
    CommunicationStats,
    DataPoint,
    EngagementData,
    ExportConfig,
    ExportRecord,
    HeatmapCell,
    InsightsOverview,
    InsightsPeriod,
    MetricCard,
    SocialStats,
    StorageStats
} from "@/types/analytics-insights";

const logger = createLogger("AnalyticsInsightsStore");

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function trendDirection(current: number, prev: number): "up" | "down" | "stable" {
    if (current > prev) return "up";
    if (current < prev) return "down";
    return "stable";
}

function changePercent(current: number, prev: number): number {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
}

function generateTrend(days: number, base: number, variance: number): DataPoint[] {
    const result: DataPoint[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        result.push({
            date: d.toISOString().slice(0, 10),
            value: Math.max(0, Math.round(base + (Math.random() - 0.5) * variance)),
        });
    }
    return result;
}

function daysForPeriod(period: InsightsPeriod): number {
    switch (period) {
        case "7d": return 7;
        case "30d": return 30;
        case "90d": return 90;
        case "6m": return 180;
        case "1y": return 365;
        case "all": return 365;
    }
}

// ============================================================================
// MOCK DATA GENERATORS (will be replaced by real API)
// ============================================================================

function generateOverview(): InsightsOverview {
    const totalMessages = 12450;
    const totalCalls = 234;
    const totalMediaShared = 1892;
    const totalGroupsJoined = 18;
    const totalFriends = 147;
    const totalStorageUsedMB = 2340;
    const averageSessionMinutes = 42;
    const activeStreak = 14;

    const metrics: MetricCard[] = [
        { label: "messages", value: totalMessages, previousValue: 11200, trend: "up", changePercent: 11, unit: "" },
        { label: "calls", value: totalCalls, previousValue: 210, trend: "up", changePercent: 11, unit: "" },
        { label: "media", value: totalMediaShared, previousValue: 1750, trend: "up", changePercent: 8, unit: "" },
        { label: "session_avg", value: averageSessionMinutes, previousValue: 38, trend: "up", changePercent: 10, unit: "min" },
    ];

    return {
        totalMessages,
        totalCalls,
        totalMediaShared,
        totalGroupsJoined,
        totalFriends,
        totalStorageUsedMB,
        averageSessionMinutes,
        activeStreak,
        metrics,
    };
}

function generateEngagement(period: InsightsPeriod): EngagementData {
    const days = daysForPeriod(period);
    return {
        dailyActiveMinutes: generateTrend(days, 45, 30),
        weeklyRetention: generateTrend(Math.min(days, 12), 80, 15),
        sessionsPerDay: generateTrend(days, 5, 4),
        averageSessionLength: 42,
        longestSession: 128,
        totalSessions: days * 5,
        peakHour: 21,
        peakDay: "samedi",
    };
}

function generateCommunication(period: InsightsPeriod): CommunicationStats {
    const days = daysForPeriod(period);
    return {
        messagesSent: 6230,
        messagesReceived: 6220,
        messagesByType: {
            text: 8450,
            image: 1820,
            video: 430,
            audio: 310,
            file: 180,
            sticker: 920,
            link: 340,
        },
        callsMade: 120,
        callsReceived: 114,
        totalCallMinutes: 1560,
        averageCallLength: 6.7,
        topContacts: [
            { id: "c1", name: "Alice", avatar: null, messagesCount: 2340, callsCount: 45, lastInteraction: new Date().toISOString() },
            { id: "c2", name: "Bob", avatar: null, messagesCount: 1890, callsCount: 32, lastInteraction: new Date().toISOString() },
            { id: "c3", name: "Charlie", avatar: null, messagesCount: 1200, callsCount: 18, lastInteraction: new Date().toISOString() },
        ],
        messagesTrend: generateTrend(days, 180, 60),
        callsTrend: generateTrend(days, 8, 5),
    };
}

function generateSocial(): SocialStats {
    return {
        followersCount: 523,
        followingCount: 412,
        postsCount: 89,
        totalLikes: 3450,
        totalShares: 234,
        totalComments: 567,
        followersTrend: generateTrend(30, 510, 20),
        engagementRate: 8.2,
        topPosts: [
            { id: "p1", preview: "Mon premier post...", likes: 89, shares: 12, comments: 23, createdAt: "2026-02-15T10:30:00Z" },
            { id: "p2", preview: "Découverte du jour...", likes: 67, shares: 8, comments: 15, createdAt: "2026-02-20T14:00:00Z" },
            { id: "p3", preview: "Photo sunset...", likes: 54, shares: 6, comments: 11, createdAt: "2026-02-25T18:45:00Z" },
        ],
    };
}

function generateStorage(): StorageStats {
    return {
        totalUsedMB: 2340,
        totalLimitMB: 5120,
        usagePercent: 45.7,
        breakdown: [
            { category: "images", usedMB: 980, fileCount: 1245, color: "#3B82F6" },
            { category: "videos", usedMB: 760, fileCount: 89, color: "#EF4444" },
            { category: "audio", usedMB: 310, fileCount: 234, color: "#F59E0B" },
            { category: "documents", usedMB: 190, fileCount: 567, color: "#10B981" },
            { category: "other", usedMB: 100, fileCount: 123, color: "#6366F1" },
        ],
        storageTrend: generateTrend(30, 2200, 200),
    };
}

function generateHeatmap(): ActivityHeatmap {
    const cells: HeatmapCell[] = [];
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            let intensity = 0;
            // Simulate typical usage pattern
            if (hour >= 8 && hour <= 23) {
                intensity = Math.random() * 0.6;
                if (hour >= 19 && hour <= 22) intensity += 0.3;
                if (day >= 5) intensity += 0.1; // weekends
            }
            cells.push({ day, hour, intensity: Math.min(1, intensity) });
        }
    }
    return {
        cells,
        mostActiveDay: "samedi",
        mostActiveHour: 21,
        totalActiveHours: 847,
    };
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

export interface AnalyticsInsightsActions {
    // Period
    setPeriod: (period: InsightsPeriod) => void;

    // Fetch data
    fetchOverview: () => void;
    fetchEngagement: () => void;
    fetchCommunication: () => void;
    fetchSocial: () => void;
    fetchStorage: () => void;
    fetchHeatmap: () => void;
    fetchAll: () => void;

    // Export
    requestExport: (config: ExportConfig) => ExportRecord;
    deleteExport: (id: string) => void;
    clearExports: () => void;

    // Loading
    setLoading: (loading: boolean) => void;
}

export type AnalyticsInsightsStore = AnalyticsInsightsState & AnalyticsInsightsActions;

// ============================================================================
// STORE
// ============================================================================

export const useAnalyticsInsightsStore = create<AnalyticsInsightsStore>()(
    persist(
        (set, get) => ({
            // ── State ───────────────────────────────────────────────
            period: "30d" as InsightsPeriod,
            isLoading: false,
            overview: null,
            engagement: null,
            communication: null,
            social: null,
            storage: null,
            heatmap: null,
            exports: [],
            exportLoading: false,

            // ── Period ──────────────────────────────────────────────
            setPeriod: (period) => {
                logger.info(`Period set to ${period}`);
                set({ period });
            },

            // ── Fetch (simulate API calls) ──────────────────────────
            fetchOverview: () => {
                logger.info("Fetching overview");
                set({ isLoading: true });
                const overview = generateOverview();
                set({ overview, isLoading: false });
            },

            fetchEngagement: () => {
                const period = get().period;
                logger.info(`Fetching engagement for ${period}`);
                set({ isLoading: true });
                const engagement = generateEngagement(period);
                set({ engagement, isLoading: false });
            },

            fetchCommunication: () => {
                const period = get().period;
                logger.info(`Fetching communication for ${period}`);
                set({ isLoading: true });
                const communication = generateCommunication(period);
                set({ communication, isLoading: false });
            },

            fetchSocial: () => {
                logger.info("Fetching social stats");
                set({ isLoading: true });
                const social = generateSocial();
                set({ social, isLoading: false });
            },

            fetchStorage: () => {
                logger.info("Fetching storage stats");
                set({ isLoading: true });
                const storage = generateStorage();
                set({ storage, isLoading: false });
            },

            fetchHeatmap: () => {
                logger.info("Fetching heatmap");
                set({ isLoading: true });
                const heatmap = generateHeatmap();
                set({ heatmap, isLoading: false });
            },

            fetchAll: () => {
                logger.info("Fetching all analytics");
                const state = get();
                state.fetchOverview();
                state.fetchEngagement();
                state.fetchCommunication();
                state.fetchSocial();
                state.fetchStorage();
                state.fetchHeatmap();
            },

            // ── Export ──────────────────────────────────────────────
            requestExport: (config) => {
                logger.info(`Export requested: ${config.scope} (${config.format})`);
                const record: ExportRecord = {
                    id: generateId(),
                    scope: config.scope,
                    format: config.format,
                    period: config.period,
                    fileSize: Math.round(Math.random() * 500 + 50) * 1024,
                    createdAt: new Date().toISOString(),
                    status: "completed",
                };
                set((s) => ({ exports: [record, ...s.exports].slice(0, 50) }));
                return record;
            },

            deleteExport: (id) => {
                set((s) => ({ exports: s.exports.filter((e) => e.id !== id) }));
            },

            clearExports: () => {
                logger.info("All exports cleared");
                set({ exports: [] });
            },

            // ── Loading ─────────────────────────────────────────────
            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: "analytics-insights-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                period: state.period,
                exports: state.exports,
            }),
        },
    ),
);
