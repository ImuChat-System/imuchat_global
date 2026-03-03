/**
 * Analytics & Insights Types (DEV-036)
 *
 * Types for the Analytics & Insights portal:
 *  - Overview metrics (messages, calls, media, etc.)
 *  - Engagement analytics (daily active usage, retention)
 *  - Communication analytics (messages sent/received split)
 *  - Social analytics (followers, likes, shares)
 *  - Storage analytics (usage by category)
 *  - Activity heatmap (hourly usage data)
 *  - CSV export configuration
 */

// ============================================================================
// PERIOD & GENERAL
// ============================================================================

export type InsightsPeriod = "7d" | "30d" | "90d" | "6m" | "1y" | "all";

export type MetricTrend = "up" | "down" | "stable";

export interface DataPoint {
    date: string;
    value: number;
}

export interface MetricCard {
    label: string;
    value: number;
    previousValue: number;
    trend: MetricTrend;
    changePercent: number;
    unit?: string;
}

// ============================================================================
// OVERVIEW
// ============================================================================

export interface InsightsOverview {
    totalMessages: number;
    totalCalls: number;
    totalMediaShared: number;
    totalGroupsJoined: number;
    totalFriends: number;
    totalStorageUsedMB: number;
    averageSessionMinutes: number;
    activeStreak: number;
    metrics: MetricCard[];
}

// ============================================================================
// ENGAGEMENT
// ============================================================================

export interface EngagementData {
    dailyActiveMinutes: DataPoint[];
    weeklyRetention: DataPoint[];
    sessionsPerDay: DataPoint[];
    averageSessionLength: number;
    longestSession: number;
    totalSessions: number;
    peakHour: number;
    peakDay: string;
}

// ============================================================================
// COMMUNICATION
// ============================================================================

export type MessageType = "text" | "image" | "video" | "audio" | "file" | "sticker" | "link";

export interface CommunicationStats {
    messagesSent: number;
    messagesReceived: number;
    messagesByType: Record<MessageType, number>;
    callsMade: number;
    callsReceived: number;
    totalCallMinutes: number;
    averageCallLength: number;
    topContacts: TopContact[];
    messagesTrend: DataPoint[];
    callsTrend: DataPoint[];
}

export interface TopContact {
    id: string;
    name: string;
    avatar: string | null;
    messagesCount: number;
    callsCount: number;
    lastInteraction: string;
}

// ============================================================================
// SOCIAL
// ============================================================================

export interface SocialStats {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    followersTrend: DataPoint[];
    engagementRate: number;
    topPosts: TopPost[];
}

export interface TopPost {
    id: string;
    preview: string;
    likes: number;
    shares: number;
    comments: number;
    createdAt: string;
}

// ============================================================================
// STORAGE
// ============================================================================

export type StorageCategory = "images" | "videos" | "audio" | "documents" | "other";

export interface StorageBreakdown {
    category: StorageCategory;
    usedMB: number;
    fileCount: number;
    color: string;
}

export interface StorageStats {
    totalUsedMB: number;
    totalLimitMB: number;
    usagePercent: number;
    breakdown: StorageBreakdown[];
    storageTrend: DataPoint[];
}

// ============================================================================
// ACTIVITY HEATMAP
// ============================================================================

export interface HeatmapCell {
    day: number;    // 0=Mon, 6=Sun
    hour: number;   // 0-23
    intensity: number; // 0.0-1.0
}

export interface ActivityHeatmap {
    cells: HeatmapCell[];
    mostActiveDay: string;
    mostActiveHour: number;
    totalActiveHours: number;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

export type ExportFormat = "csv" | "json";
export type ExportScope = "overview" | "engagement" | "communication" | "social" | "storage" | "all";

export interface ExportConfig {
    format: ExportFormat;
    scope: ExportScope;
    period: InsightsPeriod;
    includePersonalData: boolean;
}

export interface ExportRecord {
    id: string;
    scope: ExportScope;
    format: ExportFormat;
    period: InsightsPeriod;
    fileSize: number;
    createdAt: string;
    status: "pending" | "completed" | "failed";
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

export interface AnalyticsInsightsState {
    // Global
    period: InsightsPeriod;
    isLoading: boolean;

    // Data sections
    overview: InsightsOverview | null;
    engagement: EngagementData | null;
    communication: CommunicationStats | null;
    social: SocialStats | null;
    storage: StorageStats | null;
    heatmap: ActivityHeatmap | null;

    // Export
    exports: ExportRecord[];
    exportLoading: boolean;
}
