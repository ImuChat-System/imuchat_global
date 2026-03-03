/**
 * Analytics Insights Screens — Tests (DEV-036)
 *
 * Smoke-renders each of the 7 screens and the layout.
 */
import { render } from "@testing-library/react-native";
import React from "react";

// ── Mocks ─────────────────────────────────────────────────

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  Stack: {
    Screen: (props: any) => require("react").createElement("View", props),
  },
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    background: "#fff",
    surface: "#f0f0f0",
    text: "#000",
    textMuted: "#999",
    primary: "#3b82f6",
    border: "#ddd",
    error: "#ef4444",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: "fr" }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: (props: any) =>
    require("react").createElement("Text", props, props.name),
}));

// Mock store — provide a full mock state
const mockState = {
  period: "30d" as const,
  isLoading: false,
  overview: {
    totalMessages: 12450,
    totalCalls: 234,
    totalMediaShared: 1892,
    totalGroupsJoined: 18,
    totalFriends: 147,
    totalStorageUsedMB: 2340,
    averageSessionMinutes: 42,
    activeStreak: 14,
    metrics: [],
  },
  engagement: {
    dailyActiveMinutes: [
      { date: "2026-01-01", value: 30 },
      { date: "2026-01-02", value: 45 },
    ],
    weeklyRetention: [{ date: "2026-01-01", value: 80 }],
    sessionsPerDay: [{ date: "2026-01-01", value: 5 }],
    averageSessionLength: 42,
    longestSession: 128,
    totalSessions: 150,
    peakHour: 21,
    peakDay: "samedi",
  },
  communication: {
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
      {
        id: "c1",
        name: "Alice",
        avatar: null,
        messagesCount: 2340,
        callsCount: 45,
        lastInteraction: "2026-02-20T10:00:00Z",
      },
    ],
    messagesTrend: [{ date: "2026-01-01", value: 180 }],
    callsTrend: [{ date: "2026-01-01", value: 8 }],
  },
  social: {
    followersCount: 523,
    followingCount: 412,
    postsCount: 89,
    totalLikes: 3450,
    totalShares: 234,
    totalComments: 567,
    followersTrend: [],
    engagementRate: 8.2,
    topPosts: [
      {
        id: "p1",
        preview: "Mon premier post",
        likes: 89,
        shares: 12,
        comments: 23,
        createdAt: "2026-02-15T10:30:00Z",
      },
    ],
  },
  storage: {
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
    storageTrend: [
      { date: "2026-01-01", value: 2100 },
      { date: "2026-01-30", value: 2340 },
    ],
  },
  heatmap: {
    cells: Array.from({ length: 168 }, (_, i) => ({
      day: Math.floor(i / 24),
      hour: i % 24,
      intensity: Math.random() * 0.8,
    })),
    mostActiveDay: "samedi",
    mostActiveHour: 21,
    totalActiveHours: 847,
  },
  exports: [
    {
      id: "exp1",
      scope: "all" as const,
      format: "csv" as const,
      period: "30d" as const,
      fileSize: 102400,
      createdAt: "2026-02-20T10:00:00Z",
      status: "completed" as const,
    },
  ],
  // Actions
  setPeriod: jest.fn(),
  fetchOverview: jest.fn(),
  fetchEngagement: jest.fn(),
  fetchCommunication: jest.fn(),
  fetchSocial: jest.fn(),
  fetchStorage: jest.fn(),
  fetchHeatmap: jest.fn(),
  fetchAll: jest.fn(),
  requestExport: jest.fn().mockReturnValue({
    id: "new-exp",
    scope: "all",
    format: "csv",
    period: "30d",
    fileSize: 50000,
    createdAt: new Date().toISOString(),
    status: "completed",
  }),
  deleteExport: jest.fn(),
  clearExports: jest.fn(),
  setLoading: jest.fn(),
};

jest.mock("@/stores/analytics-insights-store", () => ({
  useAnalyticsInsightsStore: function (selector: any) {
    if (typeof selector === "function") return selector(mockState);
    return mockState;
  },
}));

// ── Imports (after mocks) ──────────────────────────────────

import CommunicationScreen from "../app/analytics-insights/communication";
import EngagementScreen from "../app/analytics-insights/engagement";
import ExportScreen from "../app/analytics-insights/export";
import HeatmapScreen from "../app/analytics-insights/heatmap";
import AnalyticsInsightsHub from "../app/analytics-insights/index";
import SocialScreen from "../app/analytics-insights/social";
import StorageScreen from "../app/analytics-insights/storage";

// ============================================================================
// HUB
// ============================================================================

describe("AnalyticsInsightsHub", () => {
  it("renders without crash", () => {
    const { getByTestId } = render(React.createElement(AnalyticsInsightsHub));
    expect(getByTestId("analytics-insights-hub")).toBeTruthy();
  });

  it("shows total messages count", () => {
    const { getByText } = render(React.createElement(AnalyticsInsightsHub));
    expect(getByText("12,450")).toBeTruthy();
  });

  it("shows active streak", () => {
    const { getAllByText } = render(React.createElement(AnalyticsInsightsHub));
    expect(getAllByText(/14/).length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// ENGAGEMENT
// ============================================================================

describe("EngagementScreen", () => {
  it("renders without crash", () => {
    const { getByTestId } = render(React.createElement(EngagementScreen));
    expect(getByTestId("engagement-screen")).toBeTruthy();
  });

  it("shows peak hour", () => {
    const { getByText } = render(React.createElement(EngagementScreen));
    expect(getByText("21h")).toBeTruthy();
  });
});

// ============================================================================
// COMMUNICATION
// ============================================================================

describe("CommunicationScreen", () => {
  it("renders without crash", () => {
    const { getByTestId } = render(React.createElement(CommunicationScreen));
    expect(getByTestId("communication-screen")).toBeTruthy();
  });

  it("shows messages sent", () => {
    const { getByText } = render(React.createElement(CommunicationScreen));
    expect(getByText("6,230")).toBeTruthy();
  });

  it("shows top contact name", () => {
    const { getByText } = render(React.createElement(CommunicationScreen));
    expect(getByText("Alice")).toBeTruthy();
  });
});

// ============================================================================
// SOCIAL
// ============================================================================

describe("SocialScreen", () => {
  it("renders without crash", () => {
    const { getByTestId } = render(React.createElement(SocialScreen));
    expect(getByTestId("social-screen")).toBeTruthy();
  });

  it("shows followers count", () => {
    const { getByText } = render(React.createElement(SocialScreen));
    expect(getByText("523")).toBeTruthy();
  });

  it("shows engagement rate", () => {
    const { getByText } = render(React.createElement(SocialScreen));
    expect(getByText("8.2%")).toBeTruthy();
  });
});

// ============================================================================
// STORAGE
// ============================================================================

describe("StorageScreen", () => {
  it("renders without crash", () => {
    const { getByTestId } = render(React.createElement(StorageScreen));
    expect(getByTestId("storage-screen")).toBeTruthy();
  });

  it("shows used storage", () => {
    const { getByText } = render(React.createElement(StorageScreen));
    expect(getByText("2.3 Go")).toBeTruthy();
  });
});

// ============================================================================
// HEATMAP
// ============================================================================

describe("HeatmapScreen", () => {
  it("renders without crash", () => {
    const { getByTestId } = render(React.createElement(HeatmapScreen));
    expect(getByTestId("heatmap-screen")).toBeTruthy();
  });
});

// ============================================================================
// EXPORT
// ============================================================================

describe("ExportScreen", () => {
  it("renders without crash", () => {
    const { getByTestId } = render(React.createElement(ExportScreen));
    expect(getByTestId("export-screen")).toBeTruthy();
  });

  it("shows export button", () => {
    const { getByTestId } = render(React.createElement(ExportScreen));
    expect(getByTestId("export-button")).toBeTruthy();
  });

  it("shows existing export in history", () => {
    const { getAllByText } = render(React.createElement(ExportScreen));
    expect(getAllByText(/CSV/).length).toBeGreaterThanOrEqual(1);
  });
});
