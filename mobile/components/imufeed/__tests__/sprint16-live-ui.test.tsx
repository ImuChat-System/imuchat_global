/**
 * Tests for Sprint S16 — Live Streaming UI
 *
 * - components/imufeed/LiveChat (messages, roles, pin, input, send)
 * - components/imufeed/LiveReactions (floating animations, emoji map, buttons)
 * - components/imufeed/LiveDonationAlert (tier configs, animation lifecycle)
 * - app/imufeed/live/create (form, category, toggles, go live)
 * - app/imufeed/live/[id] (viewer/host screen, overlays, end live)
 */

import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

// Supabase mock
const mockFrom = jest.fn();
const mockChannel = jest.fn();
const mockRemoveChannel = jest.fn();
const mockGetUser = jest.fn();

jest.mock("@/services/supabase", () => ({
  get supabase() {
    return {
      from: mockFrom,
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
      auth: { getUser: mockGetUser },
    };
  },
}));

// ThemeProvider
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

// I18nProvider
jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({
    t: (key, opts) => (opts && opts.defaultValue) || key,
    locale: "fr",
  }),
}));

// Logger
jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// Ionicons
jest.mock("@expo/vector-icons", () => {
  const RN = require("react-native");
  const R = require("react");
  return {
    Ionicons: (props) =>
      R.createElement(RN.Text, { testID: `icon-${props.name}` }, props.name),
  };
});

// expo-router
const mockRouterBack = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockRouterBack,
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
  useLocalSearchParams: () => ({ id: "live-001" }),
}));

// react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const RN = require("react-native");
  const R = require("react");
  return {
    SafeAreaView: (props) => R.createElement(RN.View, props),
  };
});

// ─── Imports ──────────────────────────────────────────────────

import LiveChat from "@/components/imufeed/LiveChat";
import LiveDonationAlert, {
  TIER_CONFIGS,
} from "@/components/imufeed/LiveDonationAlert";
import LiveReactions, {
  REACTION_EMOJI,
  ReactionButtons,
} from "@/components/imufeed/LiveReactions";
import type {
  LiveChatMessage,
  LiveDonation,
  LiveReaction,
  LiveReactionType,
} from "@/types/live-streaming";

// ─── Helpers ──────────────────────────────────────────────────

function chainMock(resolveValue) {
  const chain = {};
  const methods = ["insert", "update", "select", "eq", "order", "limit"];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  chain.then = jest.fn((resolve) => resolve(resolveValue));
  return chain;
}

function makeChatMessage(overrides = {}): LiveChatMessage {
  return {
    id: "msg-1",
    liveId: "live-001",
    userId: "user-1",
    userName: "TestUser",
    userAvatar: null,
    type: "text",
    content: "Hello live!",
    donationAmount: null,
    role: "viewer",
    createdAt: new Date().toISOString(),
    isPinned: false,
    ...overrides,
  };
}

function makeDonation(overrides = {}): LiveDonation {
  return {
    id: "don-1",
    liveId: "live-001",
    userId: "user-2",
    userName: "DonorUser",
    userAvatar: null,
    amount: 100,
    message: "Great stream!",
    tier: "silver",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeReaction(overrides = {}): LiveReaction {
  return {
    id: "react-1",
    liveId: "live-001",
    userId: "user-3",
    type: "heart" as LiveReactionType,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-001" } } });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — LiveChat Component
// ═══════════════════════════════════════════════════════════════

describe("LiveChat", () => {
  const defaultProps = {
    messages: [] as LiveChatMessage[],
    pinnedMessage: null,
    onSendMessage: jest.fn(),
    onPinMessage: jest.fn(),
    isHost: false,
    chatEnabled: true,
  };

  it("renders the chat container", () => {
    const { getByTestId } = render(<LiveChat {...defaultProps} />);
    expect(getByTestId("live-chat")).toBeTruthy();
  });

  it("renders chat message list", () => {
    const { getByTestId } = render(<LiveChat {...defaultProps} />);
    expect(getByTestId("chat-message-list")).toBeTruthy();
  });

  it("displays messages with user names", () => {
    const messages = [
      makeChatMessage({ id: "m1", userName: "Alice", content: "Salut!" }),
      makeChatMessage({ id: "m2", userName: "Bob", content: "Hey!" }),
    ];
    const { getByTestId } = render(
      <LiveChat {...defaultProps} messages={messages} />,
    );
    expect(getByTestId("chat-message-m1")).toBeTruthy();
    expect(getByTestId("chat-message-m2")).toBeTruthy();
  });

  it("shows role badges for host/mod/sub", () => {
    const messages = [
      makeChatMessage({ id: "m-host", role: "host", userName: "Host" }),
      makeChatMessage({ id: "m-mod", role: "moderator", userName: "Mod" }),
      makeChatMessage({ id: "m-sub", role: "subscriber", userName: "Sub" }),
    ];
    const { getByTestId } = render(
      <LiveChat {...defaultProps} messages={messages} />,
    );
    expect(getByTestId("role-badge-host")).toBeTruthy();
    expect(getByTestId("role-badge-moderator")).toBeTruthy();
    expect(getByTestId("role-badge-subscriber")).toBeTruthy();
  });

  it("does NOT show badge for viewer role", () => {
    const messages = [makeChatMessage({ id: "m-viewer", role: "viewer" })];
    const { queryByTestId } = render(
      <LiveChat {...defaultProps} messages={messages} />,
    );
    expect(queryByTestId("role-badge-viewer")).toBeNull();
  });

  it("shows donation text for donation messages", () => {
    const messages = [
      makeChatMessage({
        id: "m-don",
        type: "donation",
        donationAmount: 50,
        content: "Nice !",
      }),
    ];
    const { getByTestId } = render(
      <LiveChat {...defaultProps} messages={messages} />,
    );
    expect(getByTestId("chat-message-m-don")).toBeTruthy();
  });

  it("renders pinned message banner", () => {
    const pinned = makeChatMessage({
      id: "pin-1",
      content: "Pinned msg",
      isPinned: true,
    });
    const { getByTestId } = render(
      <LiveChat {...defaultProps} pinnedMessage={pinned} isHost />,
    );
    expect(getByTestId("pinned-message")).toBeTruthy();
  });

  it("pinned message shows unpin button for host", () => {
    const pinned = makeChatMessage({ id: "pin-1" });
    const { getByTestId } = render(
      <LiveChat {...defaultProps} pinnedMessage={pinned} isHost />,
    );
    expect(getByTestId("unpin-button")).toBeTruthy();
  });

  it("sends a message on submit", () => {
    const onSend = jest.fn();
    const { getByTestId } = render(
      <LiveChat {...defaultProps} onSendMessage={onSend} />,
    );
    const input = getByTestId("chat-input");
    fireEvent.changeText(input, "Bonjour !");
    fireEvent(input, "submitEditing");
    expect(onSend).toHaveBeenCalledWith("Bonjour !");
  });

  it("sends a message via send button", () => {
    const onSend = jest.fn();
    const { getByTestId } = render(
      <LiveChat {...defaultProps} onSendMessage={onSend} />,
    );
    fireEvent.changeText(getByTestId("chat-input"), "Test msg");
    fireEvent.press(getByTestId("chat-send-button"));
    expect(onSend).toHaveBeenCalledWith("Test msg");
  });

  it("does not send empty messages", () => {
    const onSend = jest.fn();
    const { getByTestId } = render(
      <LiveChat {...defaultProps} onSendMessage={onSend} />,
    );
    fireEvent.changeText(getByTestId("chat-input"), "   ");
    fireEvent.press(getByTestId("chat-send-button"));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows disabled chat message when chatEnabled=false", () => {
    const { getByTestId, queryByTestId } = render(
      <LiveChat {...defaultProps} chatEnabled={false} />,
    );
    expect(getByTestId("chat-disabled")).toBeTruthy();
    expect(queryByTestId("chat-input-bar")).toBeNull();
  });

  it("shows input bar when chatEnabled=true", () => {
    const { getByTestId, queryByTestId } = render(
      <LiveChat {...defaultProps} chatEnabled />,
    );
    expect(getByTestId("chat-input-bar")).toBeTruthy();
    expect(queryByTestId("chat-disabled")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — LiveReactions Component
// ═══════════════════════════════════════════════════════════════

describe("LiveReactions", () => {
  it("renders the container", () => {
    const { getByTestId } = render(
      <LiveReactions reactions={[]} onReactionComplete={jest.fn()} />,
    );
    expect(getByTestId("live-reactions")).toBeTruthy();
  });

  it("renders floating reactions for each item", () => {
    const reactions = [
      makeReaction({ id: "r1", type: "heart" }),
      makeReaction({ id: "r2", type: "fire" }),
    ];
    const { getByTestId } = render(
      <LiveReactions reactions={reactions} onReactionComplete={jest.fn()} />,
    );
    expect(getByTestId("floating-reaction-r1")).toBeTruthy();
    expect(getByTestId("floating-reaction-r2")).toBeTruthy();
  });

  it("maps all reaction types correctly", () => {
    const expectedEmojis: Record<LiveReactionType, string> = {
      heart: "❤️",
      fire: "🔥",
      laugh: "😂",
      wow: "😮",
      clap: "👏",
      star: "⭐",
    };
    for (const [type, emoji] of Object.entries(expectedEmojis)) {
      expect(REACTION_EMOJI[type as LiveReactionType]).toBe(emoji);
    }
  });

  it("REACTION_EMOJI has exactly 6 types", () => {
    expect(Object.keys(REACTION_EMOJI)).toHaveLength(6);
  });
});

describe("ReactionButtons", () => {
  it("renders reaction buttons bar", () => {
    const { getByTestId } = render(<ReactionButtons onReaction={jest.fn()} />);
    expect(getByTestId("reaction-buttons")).toBeTruthy();
  });

  it("renders a button for all 6 reaction types", () => {
    const { getByTestId } = render(<ReactionButtons onReaction={jest.fn()} />);
    expect(getByTestId("reaction-btn-heart")).toBeTruthy();
    expect(getByTestId("reaction-btn-fire")).toBeTruthy();
    expect(getByTestId("reaction-btn-laugh")).toBeTruthy();
    expect(getByTestId("reaction-btn-wow")).toBeTruthy();
    expect(getByTestId("reaction-btn-clap")).toBeTruthy();
    expect(getByTestId("reaction-btn-star")).toBeTruthy();
  });

  it("calls onReaction with correct type on press", () => {
    const onReaction = jest.fn();
    const { getByTestId } = render(<ReactionButtons onReaction={onReaction} />);
    fireEvent.press(getByTestId("reaction-btn-fire"));
    expect(onReaction).toHaveBeenCalledWith("fire");
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — LiveDonationAlert Component
// ═══════════════════════════════════════════════════════════════

describe("LiveDonationAlert", () => {
  it("renders nothing when donation is null", () => {
    const { queryByTestId } = render(
      <LiveDonationAlert donation={null} onComplete={jest.fn()} />,
    );
    expect(queryByTestId("donation-alert")).toBeNull();
  });

  it("renders alert when donation is provided", () => {
    const donation = makeDonation({ tier: "gold" });
    const { getByTestId } = render(
      <LiveDonationAlert donation={donation} onComplete={jest.fn()} />,
    );
    expect(getByTestId("donation-alert")).toBeTruthy();
    expect(getByTestId("donation-tier-gold")).toBeTruthy();
  });

  it("shows donor name and amount", () => {
    const donation = makeDonation({
      userName: "Tester",
      amount: 500,
      tier: "diamond",
    });
    const { getByText } = render(
      <LiveDonationAlert donation={donation} onComplete={jest.fn()} />,
    );
    expect(getByText("Tester")).toBeTruthy();
    expect(getByText("500 IC")).toBeTruthy();
  });

  it("shows donation message when present", () => {
    const donation = makeDonation({ message: "You're amazing!" });
    const { getByText } = render(
      <LiveDonationAlert donation={donation} onComplete={jest.fn()} />,
    );
    expect(getByText("You're amazing!")).toBeTruthy();
  });

  it("TIER_CONFIGS has all 5 tiers", () => {
    expect(Object.keys(TIER_CONFIGS)).toHaveLength(5);
    expect(TIER_CONFIGS.bronze).toBeDefined();
    expect(TIER_CONFIGS.silver).toBeDefined();
    expect(TIER_CONFIGS.gold).toBeDefined();
    expect(TIER_CONFIGS.diamond).toBeDefined();
    expect(TIER_CONFIGS.legendary).toBeDefined();
  });

  it("each tier config has required fields", () => {
    for (const tier of Object.values(TIER_CONFIGS)) {
      expect(tier.emoji).toBeDefined();
      expect(tier.color).toBeDefined();
      expect(tier.glowColor).toBeDefined();
      expect(tier.scale).toBeGreaterThan(0);
      expect(tier.label).toBeDefined();
    }
  });

  it("legendary has higher scale than bronze", () => {
    expect(TIER_CONFIGS.legendary.scale).toBeGreaterThan(
      TIER_CONFIGS.bronze.scale,
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4 — Create Live Screen
// ═══════════════════════════════════════════════════════════════

describe("CreateLiveScreen", () => {
  // We need to require dynamically to pick up mocks
  let CreateLiveScreen: React.ComponentType;

  beforeAll(() => {
    CreateLiveScreen = require("@/app/imufeed/live/create").default;
  });

  it("renders the create live screen", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    expect(getByTestId("create-live-screen")).toBeTruthy();
  });

  it("shows title input", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    expect(getByTestId("live-title-input")).toBeTruthy();
  });

  it("shows description input", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    expect(getByTestId("live-description-input")).toBeTruthy();
  });

  it("shows category grid with 9 categories", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    expect(getByTestId("category-grid")).toBeTruthy();
    expect(getByTestId("category-gaming")).toBeTruthy();
    expect(getByTestId("category-music")).toBeTruthy();
    expect(getByTestId("category-art")).toBeTruthy();
    expect(getByTestId("category-education")).toBeTruthy();
    expect(getByTestId("category-chat")).toBeTruthy();
    expect(getByTestId("category-cooking")).toBeTruthy();
    expect(getByTestId("category-tech")).toBeTruthy();
    expect(getByTestId("category-fitness")).toBeTruthy();
    expect(getByTestId("category-other")).toBeTruthy();
  });

  it("shows settings toggles", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    expect(getByTestId("donations-toggle")).toBeTruthy();
    expect(getByTestId("record-toggle")).toBeTruthy();
    expect(getByTestId("adult-toggle")).toBeTruthy();
  });

  it("shows go live button (disabled without title)", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    const btn = getByTestId("go-live-button");
    expect(btn).toBeTruthy();
    // Button should be disabled since title is empty
    expect(
      btn.props.accessibilityState?.disabled || btn.props.disabled,
    ).toBeTruthy();
  });

  it("enables go live button when title has 3+ chars", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    fireEvent.changeText(getByTestId("live-title-input"), "Mon live");
    const btn = getByTestId("go-live-button");
    // After text change, button should no longer be disabled
    expect(btn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("close button navigates back", () => {
    const { getByTestId } = render(<CreateLiveScreen />);
    fireEvent.press(getByTestId("close-button"));
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("go live creates a live and navigates", async () => {
    const mockLive = {
      id: "live-new",
      hostId: "user-001",
      hostName: "Me",
      hostAvatar: null,
      title: "Test Live",
      description: "",
      category: "chat",
      status: "live",
      streamUrl: null,
      thumbnailUrl: null,
      viewerCount: 0,
      peakViewerCount: 0,
      likeCount: 0,
      totalDonations: 0,
      coHosts: [],
      settings: {
        donationsEnabled: true,
        chatEnabled: true,
        subscribersOnlyChat: false,
        slowModeSeconds: 0,
        autoRecord: true,
        maxCoHosts: 3,
      },
      tags: [],
      scheduledAt: null,
      startedAt: new Date().toISOString(),
      endedAt: null,
      createdAt: new Date().toISOString(),
      replayUrl: null,
      hasReplay: false,
      isAdultOnly: false,
    };

    const chain = chainMock({ data: mockLive, error: null });
    mockFrom.mockReturnValue(chain);
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-001" } } });

    // The mapLiveRow function expects snake_case from DB
    chain.single.mockResolvedValue({
      data: {
        id: "live-new",
        host_id: "user-001",
        host_name: "Me",
        host_avatar: null,
        title: "Test Live",
        description: "",
        category: "chat",
        status: "live",
        stream_url: null,
        thumbnail_url: null,
        viewer_count: 0,
        peak_viewer_count: 0,
        like_count: 0,
        total_donations: 0,
        co_hosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduled_at: null,
        started_at: new Date().toISOString(),
        ended_at: null,
        created_at: new Date().toISOString(),
        replay_url: null,
        has_replay: false,
        is_adult_only: false,
      },
      error: null,
    });

    const { getByTestId } = render(<CreateLiveScreen />);
    fireEvent.changeText(getByTestId("live-title-input"), "Test Live");

    await act(async () => {
      fireEvent.press(getByTestId("go-live-button"));
    });

    // Should have called router.replace
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalled();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5 — Live Viewer Screen
// ═══════════════════════════════════════════════════════════════

describe("LiveViewerScreen", () => {
  let LiveViewerScreen: React.ComponentType;
  const { useLiveStreamingStore } = require("@/stores/live-streaming-store");

  beforeAll(() => {
    LiveViewerScreen = require("@/app/imufeed/live/[id]").default;
  });

  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useLiveStreamingStore.getState().reset();
    });

    // Mock channel for subscriptions
    const mockChannelObj = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    };
    mockChannel.mockReturnValue(mockChannelObj);
  });

  it("shows loading state when no live data", () => {
    const chain = chainMock({ data: null, error: { message: "Not found" } });
    mockFrom.mockReturnValue(chain);

    const { getByTestId } = render(<LiveViewerScreen />);
    expect(getByTestId("live-loading")).toBeTruthy();
  });

  it("renders the live viewer screen after loading", async () => {
    // Pre-set the store with live data
    act(() => {
      useLiveStreamingStore.getState().setCurrentLive({
        id: "live-001",
        hostId: "host-1",
        hostName: "HostUser",
        hostAvatar: null,
        title: "Test Stream",
        description: "",
        category: "gaming",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 42,
        peakViewerCount: 100,
        likeCount: 5,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
    });

    const { getByTestId } = render(<LiveViewerScreen />);

    await waitFor(() => {
      expect(getByTestId("live-viewer-screen")).toBeTruthy();
    });
  });

  it("shows viewer count", async () => {
    act(() => {
      const store = useLiveStreamingStore.getState();
      store.setCurrentLive({
        id: "live-001",
        hostId: "host-1",
        hostName: "Host",
        hostAvatar: null,
        title: "Stream",
        description: "",
        category: "chat",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 99,
        peakViewerCount: 99,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
    });

    const { getByTestId } = render(<LiveViewerScreen />);
    await waitFor(() => {
      expect(getByTestId("viewer-count")).toBeTruthy();
    });
  });

  it("shows leave button for viewers (not host)", async () => {
    act(() => {
      useLiveStreamingStore.getState().setCurrentLive({
        id: "live-001",
        hostId: "other",
        hostName: "Other",
        hostAvatar: null,
        title: "Stream",
        description: "",
        category: "chat",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 10,
        peakViewerCount: 10,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
      useLiveStreamingStore.getState().setIsHosting(false);
    });

    const { getByTestId } = render(<LiveViewerScreen />);
    await waitFor(() => {
      expect(getByTestId("leave-button")).toBeTruthy();
    });
  });

  it("shows end live button for host", async () => {
    act(() => {
      useLiveStreamingStore.getState().setCurrentLive({
        id: "live-001",
        hostId: "user-001",
        hostName: "Me",
        hostAvatar: null,
        title: "My Stream",
        description: "",
        category: "chat",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 5,
        peakViewerCount: 5,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
      useLiveStreamingStore.getState().setIsHosting(true);
    });

    const { getByTestId } = render(<LiveViewerScreen />);
    await waitFor(() => {
      expect(getByTestId("end-live-button")).toBeTruthy();
    });
  });

  it("shows video container", async () => {
    act(() => {
      useLiveStreamingStore.getState().setCurrentLive({
        id: "live-001",
        hostId: "host",
        hostName: "Host",
        hostAvatar: null,
        title: "Stream",
        description: "",
        category: "chat",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 0,
        peakViewerCount: 0,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
    });

    const { getByTestId } = render(<LiveViewerScreen />);
    await waitFor(() => {
      expect(getByTestId("video-container")).toBeTruthy();
    });
  });

  it("shows top bar with LIVE badge", async () => {
    act(() => {
      useLiveStreamingStore.getState().setCurrentLive({
        id: "live-001",
        hostId: "host",
        hostName: "TestHost",
        hostAvatar: null,
        title: "Stream",
        description: "",
        category: "chat",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 0,
        peakViewerCount: 0,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
    });

    const { getByTestId, getByText } = render(<LiveViewerScreen />);
    await waitFor(() => {
      expect(getByTestId("top-bar")).toBeTruthy();
      expect(getByText("LIVE")).toBeTruthy();
    });
  });

  it("leave button navigates back and resets store", async () => {
    act(() => {
      useLiveStreamingStore.getState().setCurrentLive({
        id: "live-001",
        hostId: "other",
        hostName: "Other",
        hostAvatar: null,
        title: "Stream",
        description: "",
        category: "chat",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 0,
        peakViewerCount: 0,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
      useLiveStreamingStore.getState().setIsHosting(false);
    });

    const { getByTestId } = render(<LiveViewerScreen />);
    await waitFor(() => {
      expect(getByTestId("leave-button")).toBeTruthy();
    });

    fireEvent.press(getByTestId("leave-button"));
    expect(mockRouterBack).toHaveBeenCalled();
    expect(useLiveStreamingStore.getState().currentLive).toBeNull();
  });

  it("renders reaction buttons for viewers", async () => {
    act(() => {
      useLiveStreamingStore.getState().setCurrentLive({
        id: "live-001",
        hostId: "other",
        hostName: "Other",
        hostAvatar: null,
        title: "Stream",
        description: "",
        category: "chat",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 0,
        peakViewerCount: 0,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {
          donationsEnabled: true,
          chatEnabled: true,
          subscribersOnlyChat: false,
          slowModeSeconds: 0,
          autoRecord: true,
          maxCoHosts: 3,
        },
        tags: [],
        scheduledAt: null,
        startedAt: new Date().toISOString(),
        endedAt: null,
        createdAt: new Date().toISOString(),
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
      useLiveStreamingStore.getState().setIsHosting(false);
    });

    const { getByTestId } = render(<LiveViewerScreen />);
    await waitFor(() => {
      expect(getByTestId("reaction-buttons")).toBeTruthy();
    });
  });
});
