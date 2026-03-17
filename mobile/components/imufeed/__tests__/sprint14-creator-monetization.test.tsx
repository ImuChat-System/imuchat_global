/**
 * Tests for Sprint S14B — Monétisation Créateur
 *
 * - Types & Presets (TIP_PRESETS, SUBSCRIPTION_TIERS)
 * - CreatorMonetizationService (sendTip, getCreatorTips, subscribe, cancelSubscription, checkContentAccess, getCreatorRevenue, getRevenueHistory)
 * - TipButton (render, expand, preset select, send, cancel, error)
 * - DonationAnimation (render, visibility, amount display)
 * - CreatorSubscriptionCard (render tiers, select, subscribe, cancel, current badge)
 * - RevenueSection (render stats, loading, empty, chart)
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
const mockGetUser = jest.fn();

jest.mock("@/services/supabase", () => ({
  get supabase() {
    return {
      from: mockFrom,
      rpc: mockRpc,
      auth: { getUser: mockGetUser },
    };
  },
}));

// ─── Imports ──────────────────────────────────────────────────

import { CreatorMonetizationService } from "@/services/imufeed/creator-monetization-service";
import {
  SUBSCRIPTION_TIERS,
  TIP_PRESETS,
  type CreatorRevenue,
  type CreatorSubscription,
  type RevenueEntry,
  type SubscriptionTierInfo,
  type TipPreset,
} from "@/types/creator-monetization";
import CreatorSubscriptionCard from "../../imufeed/CreatorSubscriptionCard";
import DonationAnimation from "../../imufeed/DonationAnimation";
import RevenueSection from "../../imufeed/RevenueSection";
import TipButton from "../../imufeed/TipButton";

// ============================================================================
// Types & Presets
// ============================================================================

describe("TIP_PRESETS", () => {
  it("has 5 presets", () => {
    expect(TIP_PRESETS).toHaveLength(5);
  });

  it("presets have required fields", () => {
    TIP_PRESETS.forEach((preset: TipPreset) => {
      expect(preset.amount).toBeGreaterThan(0);
      expect(preset.emoji).toBeTruthy();
      expect(preset.label).toBeTruthy();
    });
  });

  it("presets are in ascending order", () => {
    for (let i = 1; i < TIP_PRESETS.length; i++) {
      expect(TIP_PRESETS[i].amount).toBeGreaterThan(TIP_PRESETS[i - 1].amount);
    }
  });

  it("includes Café preset at 10 IC", () => {
    const cafe = TIP_PRESETS.find((p) => p.label === "Café");
    expect(cafe).toBeDefined();
    expect(cafe!.amount).toBe(10);
    expect(cafe!.emoji).toBe("☕");
  });

  it("includes Royal preset at 1000 IC", () => {
    const royal = TIP_PRESETS.find((p) => p.label === "Royal");
    expect(royal).toBeDefined();
    expect(royal!.amount).toBe(1000);
    expect(royal!.emoji).toBe("👑");
  });
});

describe("SUBSCRIPTION_TIERS", () => {
  it("has 3 tiers", () => {
    expect(SUBSCRIPTION_TIERS).toHaveLength(3);
  });

  it("tiers have correct structure", () => {
    SUBSCRIPTION_TIERS.forEach((tier: SubscriptionTierInfo) => {
      expect(["basic", "pro", "vip"]).toContain(tier.tier);
      expect(tier.label).toBeTruthy();
      expect(tier.emoji).toBeTruthy();
      expect(tier.price_cents).toBeGreaterThan(0);
      expect(tier.perks.length).toBeGreaterThan(0);
    });
  });

  it("tiers are in ascending price order", () => {
    expect(SUBSCRIPTION_TIERS[0].price_cents).toBeLessThan(
      SUBSCRIPTION_TIERS[1].price_cents,
    );
    expect(SUBSCRIPTION_TIERS[1].price_cents).toBeLessThan(
      SUBSCRIPTION_TIERS[2].price_cents,
    );
  });

  it("basic tier at 2.99€", () => {
    const basic = SUBSCRIPTION_TIERS.find((t) => t.tier === "basic");
    expect(basic?.price_cents).toBe(299);
  });

  it("vip tier at 14.99€", () => {
    const vip = SUBSCRIPTION_TIERS.find((t) => t.tier === "vip");
    expect(vip?.price_cents).toBe(1499);
  });
});

// ============================================================================
// CreatorMonetizationService
// ============================================================================

describe("CreatorMonetizationService", () => {
  let service: CreatorMonetizationService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    service = new CreatorMonetizationService();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
  });

  // ── sendTip ─────────────────────────────────────────────────

  describe("sendTip", () => {
    it("calls rpc with correct params", async () => {
      mockRpc.mockResolvedValue({
        data: {
          id: "tip-1",
          tipper_id: "user-1",
          creator_id: "creator-1",
          amount: 50,
          message: "Bravo!",
          created_at: "2025-01-01",
        },
        error: null,
      });

      const result = await service.sendTip("creator-1", 50, "Bravo!");
      expect(mockRpc).toHaveBeenCalledWith("send_creator_tip", {
        p_creator_id: "creator-1",
        p_amount: 50,
        p_message: "Bravo!",
      });
      expect(result.success).toBe(true);
      expect(result.tip?.amount).toBe(50);
    });

    it("returns error on failure", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Insufficient balance" },
      });

      const result = await service.sendTip("creator-1", 9999);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insufficient balance");
    });
  });

  // ── getCreatorTips ──────────────────────────────────────────

  describe("getCreatorTips", () => {
    it("fetches tips with correct query", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: [
          { id: "t1", amount: 10, creator_id: "c1" },
          { id: "t2", amount: 50, creator_id: "c1" },
        ],
        error: null,
      });

      mockFrom.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
      });

      // Chain properly
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ range: mockRange });

      const tips = await service.getCreatorTips("c1", 20, 0);
      expect(mockFrom).toHaveBeenCalledWith("creator_tips");
      expect(tips).toHaveLength(2);
    });
  });

  // ── subscribe ───────────────────────────────────────────────

  describe("subscribe", () => {
    it("upserts subscription with correct data", async () => {
      const mockSelect = jest.fn();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: "sub-1",
          subscriber_id: "user-1",
          creator_id: "creator-1",
          tier: "pro",
          status: "active",
        },
        error: null,
      });
      mockSelect.mockReturnValue({ single: mockSingle });

      const mockUpsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ upsert: mockUpsert });

      const result = await service.subscribe("creator-1", "pro");
      expect(mockFrom).toHaveBeenCalledWith("creator_subscriptions");
      expect(result.success).toBe(true);
      expect(result.subscription?.tier).toBe("pro");
    });

    it("returns error when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await service.subscribe("creator-1", "basic");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Non authentifié");
    });
  });

  // ── cancelSubscription ──────────────────────────────────────

  describe("cancelSubscription", () => {
    it("updates subscription status to cancelled", async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await service.cancelSubscription("sub-1");
      expect(mockFrom).toHaveBeenCalledWith("creator_subscriptions");
      expect(result.success).toBe(true);
    });
  });

  // ── checkContentAccess ──────────────────────────────────────

  describe("checkContentAccess", () => {
    it("returns hasAccess=true when no restriction exists", async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "No rows" },
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await service.checkContentAccess("video-1");
      expect(result.hasAccess).toBe(true);
      expect(result.requiredTier).toBeNull();
    });
  });

  // ── getCreatorRevenue ───────────────────────────────────────

  describe("getCreatorRevenue", () => {
    it("calls rpc with correct params", async () => {
      mockRpc.mockResolvedValue({
        data: {
          tips_total: 500,
          tips_count: 10,
          subs_revenue: 200,
          subs_active: 5,
          total_revenue: 700,
          period_days: 30,
        },
        error: null,
      });

      const rev = await service.getCreatorRevenue("creator-1", 30);
      expect(mockRpc).toHaveBeenCalledWith("get_creator_revenue", {
        p_creator_id: "creator-1",
        p_days: 30,
      });
      expect(rev.total_revenue).toBe(700);
      expect(rev.tips_count).toBe(10);
    });
  });

  // ── getRevenueHistory ───────────────────────────────────────

  describe("getRevenueHistory", () => {
    it("fetches and aggregates tips by day", async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [
          { amount: 10, created_at: "2025-01-15T10:00:00Z" },
          { amount: 20, created_at: "2025-01-15T14:00:00Z" },
          { amount: 50, created_at: "2025-01-16T09:00:00Z" },
        ],
        error: null,
      });
      const mockGte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEq = jest.fn().mockReturnValue({ gte: mockGte });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const history = await service.getRevenueHistory("creator-1", 30);
      expect(history).toHaveLength(2);
      expect(history[0].day).toBe("2025-01-15");
      expect(history[0].tips).toBe(30); // 10 + 20
      expect(history[1].day).toBe("2025-01-16");
      expect(history[1].tips).toBe(50);
    });
  });
});

// ============================================================================
// TipButton — UI Component
// ============================================================================

describe("TipButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders trigger button with Soutenir text", () => {
    const { getByTestId, getByText } = render(
      <TipButton creatorId="c1" creatorName="Alice" />,
    );
    expect(getByTestId("tip-button-trigger")).toBeTruthy();
    expect(getByText("💰 Soutenir")).toBeTruthy();
  });

  it("expands panel on trigger press", () => {
    const { getByTestId } = render(
      <TipButton creatorId="c1" creatorName="Alice" />,
    );
    fireEvent.press(getByTestId("tip-button-trigger"));
    expect(getByTestId("tip-panel")).toBeTruthy();
    expect(getByTestId("tip-presets")).toBeTruthy();
  });

  it("renders all 5 presets when expanded", () => {
    const { getByTestId } = render(
      <TipButton creatorId="c1" creatorName="Alice" expanded />,
    );
    TIP_PRESETS.forEach((preset) => {
      expect(getByTestId(`tip-preset-${preset.amount}`)).toBeTruthy();
    });
  });

  it("shows creator name in panel title", () => {
    const { getByText } = render(
      <TipButton creatorId="c1" creatorName="Bob" expanded />,
    );
    expect(getByText("Soutenir Bob")).toBeTruthy();
  });

  it("selects a preset on press", () => {
    const { getByTestId, getByText } = render(
      <TipButton creatorId="c1" creatorName="Alice" expanded />,
    );
    fireEvent.press(getByTestId("tip-preset-50"));
    expect(getByText("Envoyer 50 IC")).toBeTruthy();
  });

  it("sends tip on send button press", async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    const mockOnSent = jest.fn();

    const { getByTestId } = render(
      <TipButton
        creatorId="c1"
        creatorName="Alice"
        expanded
        onSubmit={mockOnSubmit}
        onTipSent={mockOnSent}
      />,
    );

    fireEvent.press(getByTestId("tip-preset-100"));
    fireEvent.changeText(getByTestId("tip-message-input"), "Super contenu!");

    await waitFor(async () => {
      fireEvent.press(getByTestId("tip-send"));
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("c1", 100, "Super contenu!");
      expect(mockOnSent).toHaveBeenCalledWith(100, "Super contenu!");
    });
  });

  it("cancel closes the panel", () => {
    const { getByTestId, queryByTestId } = render(
      <TipButton creatorId="c1" creatorName="Alice" expanded />,
    );
    fireEvent.press(getByTestId("tip-cancel"));
    expect(queryByTestId("tip-panel")).toBeNull();
    expect(getByTestId("tip-button-trigger")).toBeTruthy();
  });

  it("shows message input", () => {
    const { getByTestId } = render(
      <TipButton creatorId="c1" creatorName="Alice" expanded />,
    );
    expect(getByTestId("tip-message-input")).toBeTruthy();
  });

  it("calls onTipError on failure", async () => {
    const mockOnSubmit = jest
      .fn()
      .mockRejectedValue(new Error("Solde insuffisant"));
    const mockOnError = jest.fn();

    const { getByTestId } = render(
      <TipButton
        creatorId="c1"
        creatorName="Alice"
        expanded
        onSubmit={mockOnSubmit}
        onTipError={mockOnError}
      />,
    );

    fireEvent.press(getByTestId("tip-preset-50"));
    fireEvent.press(getByTestId("tip-send"));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("Solde insuffisant");
    });
  });
});

// ============================================================================
// DonationAnimation — Visual feedback
// ============================================================================

describe("DonationAnimation", () => {
  it("renders when visible", () => {
    const { getByTestId } = render(
      <DonationAnimation amount={50} emoji="🎁" visible={true} />,
    );
    expect(getByTestId("donation-animation")).toBeTruthy();
    expect(getByTestId("donation-amount")).toBeTruthy();
  });

  it("does not render when not visible", () => {
    const { queryByTestId } = render(
      <DonationAnimation amount={50} visible={false} />,
    );
    expect(queryByTestId("donation-animation")).toBeNull();
  });

  it("displays correct amount", () => {
    const { getByText } = render(
      <DonationAnimation amount={100} visible={true} />,
    );
    expect(getByText("+100 IC")).toBeTruthy();
  });

  it("displays correct emoji", () => {
    const { getByText } = render(
      <DonationAnimation amount={50} emoji="🚀" visible={true} />,
    );
    expect(getByText("🚀")).toBeTruthy();
  });

  it("uses default emoji when not provided", () => {
    const { getByText } = render(
      <DonationAnimation amount={10} visible={true} />,
    );
    expect(getByText("💰")).toBeTruthy();
  });
});

// ============================================================================
// CreatorSubscriptionCard — Subscription management
// ============================================================================

describe("CreatorSubscriptionCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all 3 tiers", () => {
    const { getByTestId } = render(
      <CreatorSubscriptionCard creatorId="c1" currentSubscription={null} />,
    );
    expect(getByTestId("tier-basic")).toBeTruthy();
    expect(getByTestId("tier-pro")).toBeTruthy();
    expect(getByTestId("tier-vip")).toBeTruthy();
  });

  it("renders subscription card container", () => {
    const { getByTestId } = render(
      <CreatorSubscriptionCard creatorId="c1" currentSubscription={null} />,
    );
    expect(getByTestId("subscription-card")).toBeTruthy();
  });

  it("shows subscribe button", () => {
    const { getByTestId } = render(
      <CreatorSubscriptionCard creatorId="c1" currentSubscription={null} />,
    );
    expect(getByTestId("subscription-subscribe")).toBeTruthy();
  });

  it("shows current badge for active subscription", () => {
    const activeSub: CreatorSubscription = {
      id: "sub-1",
      subscriber_id: "user-1",
      creator_id: "c1",
      tier: "pro",
      price_cents: 699,
      currency: "EUR",
      status: "active",
      started_at: "2025-01-01",
      expires_at: "2025-02-01",
      cancelled_at: null,
    };

    const { getByText, getByTestId } = render(
      <CreatorSubscriptionCard
        creatorId="c1"
        currentSubscription={activeSub}
      />,
    );

    expect(getByText("Actuel")).toBeTruthy();
    expect(getByTestId("subscription-cancel")).toBeTruthy();
  });

  it("calls onSubscribe when subscribing", async () => {
    const mockSubscribe = jest.fn().mockResolvedValue(undefined);

    const { getByTestId } = render(
      <CreatorSubscriptionCard
        creatorId="c1"
        currentSubscription={null}
        onSubscribe={mockSubscribe}
      />,
    );

    fireEvent.press(getByTestId("tier-basic"));
    fireEvent.press(getByTestId("subscription-subscribe"));

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith("basic");
    });
  });

  it("calls onCancel when cancelling", async () => {
    const mockCancel = jest.fn().mockResolvedValue(undefined);

    const activeSub: CreatorSubscription = {
      id: "sub-1",
      subscriber_id: "user-1",
      creator_id: "c1",
      tier: "basic",
      price_cents: 299,
      currency: "EUR",
      status: "active",
      started_at: "2025-01-01",
      expires_at: "2025-02-01",
      cancelled_at: null,
    };

    const { getByTestId } = render(
      <CreatorSubscriptionCard
        creatorId="c1"
        currentSubscription={activeSub}
        onCancel={mockCancel}
      />,
    );

    fireEvent.press(getByTestId("subscription-cancel"));

    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalled();
    });
  });

  it("shows price for selected tier", () => {
    const { getByTestId, getByText } = render(
      <CreatorSubscriptionCard creatorId="c1" currentSubscription={null} />,
    );

    fireEvent.press(getByTestId("tier-vip"));
    expect(getByText(/14\.99€\/mois/)).toBeTruthy();
  });
});

// ============================================================================
// RevenueSection — Revenue dashboard
// ============================================================================

describe("RevenueSection", () => {
  const mockRevenue: CreatorRevenue = {
    tips_total: 500,
    tips_count: 25,
    subs_revenue: 200,
    subs_active: 8,
    total_revenue: 700,
    period_days: 30,
  };

  const mockHistory: RevenueEntry[] = [
    { day: "2025-01-15", tips: 30, subs: 10, total: 40 },
    { day: "2025-01-16", tips: 50, subs: 10, total: 60 },
    { day: "2025-01-17", tips: 20, subs: 10, total: 30 },
  ];

  it("renders revenue section with data", () => {
    const { getByTestId, getByText } = render(
      <RevenueSection revenue={mockRevenue} history={mockHistory} />,
    );
    expect(getByTestId("revenue-section")).toBeTruthy();
    expect(getByText(/Revenus/)).toBeTruthy();
  });

  it("shows total revenue", () => {
    const { getByTestId } = render(
      <RevenueSection revenue={mockRevenue} history={mockHistory} />,
    );
    expect(getByTestId("revenue-total")).toBeTruthy();
  });

  it("shows tips stats", () => {
    const { getByTestId, getByText } = render(
      <RevenueSection revenue={mockRevenue} history={mockHistory} />,
    );
    expect(getByTestId("revenue-tips")).toBeTruthy();
    expect(getByText("500 IC")).toBeTruthy();
    expect(getByText("25 tips")).toBeTruthy();
  });

  it("shows subscription stats", () => {
    const { getByTestId, getByText } = render(
      <RevenueSection revenue={mockRevenue} history={mockHistory} />,
    );
    expect(getByTestId("revenue-subs")).toBeTruthy();
    expect(getByText("200 IC")).toBeTruthy();
    expect(getByText("8 actifs")).toBeTruthy();
  });

  it("renders chart when history is provided", () => {
    const { getByTestId } = render(
      <RevenueSection revenue={mockRevenue} history={mockHistory} />,
    );
    expect(getByTestId("revenue-chart")).toBeTruthy();
  });

  it("shows loading state", () => {
    const { getByTestId } = render(
      <RevenueSection revenue={null} history={[]} isLoading />,
    );
    expect(getByTestId("revenue-loading")).toBeTruthy();
  });

  it("shows empty state when no revenue", () => {
    const { getByTestId, getByText } = render(
      <RevenueSection revenue={null} history={[]} />,
    );
    expect(getByTestId("revenue-empty")).toBeTruthy();
    expect(getByText("Aucune donnée de revenus")).toBeTruthy();
  });

  it("displays period in title", () => {
    const { getByText } = render(
      <RevenueSection revenue={mockRevenue} history={[]} />,
    );
    expect(getByText(/30j/)).toBeTruthy();
  });
});
