/**
 * Tests for Sprint S13B — Dashboard Créateur & Analytics
 *
 * - creator-analytics-service (buildMetricCards, formatters, API calls)
 * - CreatorDashboard (render, period selector, metric cards, loading, error, retry)
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#6A54A3",
    card: "#1a1a2e",
    surface: "#1a1a2e",
    background: "#0f0a1a",
    text: "#ffffff",
    textMuted: "#888",
    textSecondary: "#999",
    border: "#333",
    error: "#FF3B30",
    success: "#34C759",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props: any) =>
      React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
  };
});

jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/services/supabase", () => ({
  get supabase() {
    return {
      from: mockFrom,
      rpc: mockRpc,
      auth: { getUser: jest.fn() },
    };
  },
}));

// ─── Imports ──────────────────────────────────────────────────

import {
  buildMetricCards,
  CreatorAnalyticsService,
} from "@/services/imufeed/creator-analytics-service";
import type { CreatorDashboardOverview } from "@/types/creator-analytics";
import CreatorDashboard from "../../imufeed/CreatorDashboard";

// ============================================================================
// buildMetricCards — Pure function
// ============================================================================

describe("buildMetricCards", () => {
  const overview: CreatorDashboardOverview = {
    total_views: 15000,
    total_followers: 1234,
    total_likes: 8500,
    total_comments: 320,
    total_shares: 150,
    total_watch_time_seconds: 72000,
    total_revenue_imucoins: 5000,
    avg_engagement_rate: 0.085,
  };

  it("returns 8 metric cards", () => {
    const cards = buildMetricCards(overview);
    expect(cards).toHaveLength(8);
  });

  it("formats views as K", () => {
    const cards = buildMetricCards(overview);
    const viewsCard = cards.find((c) => c.key === "views");
    expect(viewsCard?.formatted).toBe("15.0K");
    expect(viewsCard?.emoji).toBe("👁️");
  });

  it("formats followers", () => {
    const cards = buildMetricCards(overview);
    const followersCard = cards.find((c) => c.key === "followers");
    expect(followersCard?.formatted).toBe("1.2K");
  });

  it("formats watch time as hours/minutes", () => {
    const cards = buildMetricCards(overview);
    const wtCard = cards.find((c) => c.key === "watch_time");
    expect(wtCard?.formatted).toBe("20h 0m");
  });

  it("formats revenue with IC suffix", () => {
    const cards = buildMetricCards(overview);
    const revCard = cards.find((c) => c.key === "revenue");
    expect(revCard?.formatted).toBe("5.0K IC");
  });

  it("formats engagement as percentage", () => {
    const cards = buildMetricCards(overview);
    const engCard = cards.find((c) => c.key === "engagement");
    expect(engCard?.formatted).toBe("8.5%");
  });

  it("handles zero values", () => {
    const zeroOverview: CreatorDashboardOverview = {
      total_views: 0,
      total_followers: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_watch_time_seconds: 0,
      total_revenue_imucoins: 0,
      avg_engagement_rate: 0,
    };
    const cards = buildMetricCards(zeroOverview);
    expect(cards.find((c) => c.key === "views")?.formatted).toBe("0");
    expect(cards.find((c) => c.key === "watch_time")?.formatted).toBe("0m");
    expect(cards.find((c) => c.key === "engagement")?.formatted).toBe("0.0%");
  });

  it("handles millions (M format)", () => {
    const bigOverview: CreatorDashboardOverview = {
      ...overview,
      total_views: 2500000,
    };
    const cards = buildMetricCards(bigOverview);
    expect(cards.find((c) => c.key === "views")?.formatted).toBe("2.5M");
  });
});

// ============================================================================
// Creator Analytics Service — API calls
// ============================================================================

describe("CreatorAnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("fetchDashboard calls rpc with correct params", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          total_views: 100,
          total_followers: 50,
          total_likes: 30,
          total_comments: 10,
          total_shares: 5,
          total_watch_time: 3600,
          total_revenue: 200,
          avg_engagement: 0.05,
        },
      ],
      error: null,
    });

    const result = await CreatorAnalyticsService.fetchDashboard(
      "user-1",
      "30d",
    );
    expect(mockRpc).toHaveBeenCalledWith("get_creator_dashboard", {
      p_user_id: "user-1",
      p_days: 30,
    });
    expect(result.total_views).toBe(100);
    expect(result.total_followers).toBe(50);
  });

  it("fetchDashboard throws on error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "DB error" } });
    await expect(
      CreatorAnalyticsService.fetchDashboard("user-1", "7d"),
    ).rejects.toEqual({ message: "DB error" });
  });

  it("fetchTopVideo calls rpc and returns top video", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          video_id: "v-1",
          views: 5000,
          likes: 200,
          comments: 50,
          shares: 10,
          completion_rate: 0.8,
          engagement_rate: 0.12,
        },
      ],
      error: null,
    });

    const result = await CreatorAnalyticsService.fetchTopVideo("user-1");
    expect(mockRpc).toHaveBeenCalledWith("get_creator_top_video", {
      p_user_id: "user-1",
    });
    expect(result?.video_id).toBe("v-1");
    expect(result?.views).toBe(5000);
  });

  it("fetchTopVideo returns null when no data", async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    const result = await CreatorAnalyticsService.fetchTopVideo("user-1");
    expect(result).toBeNull();
  });

  it("fetchDailyChart calls rpc and maps data", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          day: "2025-02-01",
          views: 100,
          new_followers: 5,
          likes: 20,
          engagement_rate: 0.05,
        },
        {
          day: "2025-02-02",
          views: 150,
          new_followers: 8,
          likes: 30,
          engagement_rate: 0.06,
        },
      ],
      error: null,
    });

    const result = await CreatorAnalyticsService.fetchDailyChart(
      "user-1",
      "7d",
    );
    expect(mockRpc).toHaveBeenCalledWith("get_creator_daily_chart", {
      p_user_id: "user-1",
      p_days: 7,
    });
    expect(result).toHaveLength(2);
    expect(result[0].day).toBe("2025-02-01");
    expect(result[1].views).toBe(150);
  });

  it("fetchHeatmap calls supabase .from and returns sorted data", async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: [
        {
          day_of_week: 1,
          hour_of_day: 18,
          avg_engagement: 0.15,
          post_count: 10,
        },
        {
          day_of_week: 5,
          hour_of_day: 20,
          avg_engagement: 0.12,
          post_count: 8,
        },
      ],
      error: null,
    });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await CreatorAnalyticsService.fetchHeatmap("user-1");
    expect(mockFrom).toHaveBeenCalledWith("creator_publish_heatmap");
    expect(result).toHaveLength(2);
    expect(result[0].day_of_week).toBe(1);
    expect(result[0].avg_engagement).toBe(0.15);
  });
});

// ============================================================================
// CreatorDashboard — Component rendering
// ============================================================================

describe("CreatorDashboard", () => {
  const dashboardData = {
    total_views: 5000,
    total_followers: 200,
    total_likes: 1500,
    total_comments: 80,
    total_shares: 30,
    total_watch_time: 18000,
    total_revenue: 500,
    avg_engagement: 0.06,
  };

  const dailyData = [
    {
      day: "2025-02-01",
      views: 100,
      new_followers: 5,
      likes: 20,
      engagement_rate: 0.05,
    },
    {
      day: "2025-02-02",
      views: 200,
      new_followers: 10,
      likes: 40,
      engagement_rate: 0.08,
    },
  ];

  const topVideo = {
    video_id: "v-1",
    views: 3000,
    likes: 100,
    comments: 20,
    shares: 5,
    completion_rate: 0.75,
    engagement_rate: 0.1,
  };

  const heatmapData = [
    { day_of_week: 1, hour_of_day: 18, avg_engagement: 0.15, post_count: 10 },
  ];

  function setupMocks() {
    // Dashboard RPC
    mockRpc.mockImplementation((name: string) => {
      if (name === "get_creator_dashboard") {
        return Promise.resolve({ data: [dashboardData], error: null });
      }
      if (name === "get_creator_top_video") {
        return Promise.resolve({ data: [topVideo], error: null });
      }
      if (name === "get_creator_daily_chart") {
        return Promise.resolve({ data: dailyData, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    // Heatmap from()
    const mockOrder = jest
      .fn()
      .mockResolvedValue({ data: heatmapData, error: null });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    mockRpc.mockReturnValue(new Promise(() => {})); // never resolves
    mockFrom.mockReturnValue({
      select: jest
        .fn()
        .mockReturnValue({
          eq: jest
            .fn()
            .mockReturnValue({
              order: jest.fn().mockReturnValue(new Promise(() => {})),
            }),
        }),
    });

    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    expect(getByTestId("dashboard-loading")).toBeTruthy();
  });

  it("renders dashboard after loading", async () => {
    setupMocks();
    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByTestId("creator-dashboard")).toBeTruthy();
    });
  });

  it("renders page title", async () => {
    setupMocks();
    const { getByText } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByText("📊 Dashboard Créateur")).toBeTruthy();
    });
  });

  it("renders period selector with 3 options", async () => {
    setupMocks();
    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByTestId("period-selector")).toBeTruthy();
      expect(getByTestId("period-7d")).toBeTruthy();
      expect(getByTestId("period-30d")).toBeTruthy();
      expect(getByTestId("period-90d")).toBeTruthy();
    });
  });

  it("renders metric cards", async () => {
    setupMocks();
    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByTestId("metric-cards")).toBeTruthy();
      expect(getByTestId("metric-views")).toBeTruthy();
      expect(getByTestId("metric-followers")).toBeTruthy();
      expect(getByTestId("metric-likes")).toBeTruthy();
    });
  });

  it("renders top video section", async () => {
    setupMocks();
    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByTestId("top-video")).toBeTruthy();
    });
  });

  it("renders daily chart", async () => {
    setupMocks();
    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByTestId("daily-chart")).toBeTruthy();
    });
  });

  it("renders heatmap section", async () => {
    setupMocks();
    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByTestId("heatmap-section")).toBeTruthy();
    });
  });

  it("shows error state and retry button", async () => {
    mockRpc.mockRejectedValue(new Error("Network fail"));
    mockFrom.mockReturnValue({
      select: jest
        .fn()
        .mockReturnValue({
          eq: jest
            .fn()
            .mockReturnValue({
              order: jest.fn().mockRejectedValue(new Error("fail")),
            }),
        }),
    });

    const { getByTestId, getByText } = render(
      <CreatorDashboard userId="user-1" />,
    );
    await waitFor(() => {
      expect(getByTestId("dashboard-error")).toBeTruthy();
      expect(getByText("Réessayer")).toBeTruthy();
    });
  });

  it("can switch period", async () => {
    setupMocks();
    const { getByTestId } = render(<CreatorDashboard userId="user-1" />);
    await waitFor(() => {
      expect(getByTestId("period-7d")).toBeTruthy();
    });

    fireEvent.press(getByTestId("period-7d"));
    // The component should reload with 7d period
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("get_creator_dashboard", {
        p_user_id: "user-1",
        p_days: 7,
      });
    });
  });
});
