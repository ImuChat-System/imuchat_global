/**
 * Tests for Sprint S15B — Infrastructure Live Streaming
 *
 * - types/live-streaming (getDonationTier, DONATION_TIER_THRESHOLDS)
 * - services/imufeed/live-api (LiveStreamingService CRUD, chat, reactions, donations)
 * - stores/live-streaming-store (Zustand store actions, queues, limits)
 */

import { act } from "@testing-library/react-native";

// ─── Mocks ────────────────────────────────────────────────────

// Mock supabase with getter pattern
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

jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// ─── Imports ──────────────────────────────────────────────────

import { LiveStreamingService } from "@/services/imufeed/live-api";
import { useLiveStreamingStore } from "@/stores/live-streaming-store";
import {
  DONATION_TIER_THRESHOLDS,
  getDonationTier,
} from "@/types/live-streaming";

// ─── Helpers ──────────────────────────────────────────────────

function chainMock(resolveValue) {
  const chain = {};
  // Every method returns the chain itself (sync chaining)
  const methods = ["insert", "update", "select", "eq", "order", "limit"];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  // Terminal: single() resolves the value
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  // Also make the chain itself thenable (for queries ending without .single())
  chain.then = jest.fn((resolve) => resolve(resolveValue));
  return chain;
}

const MOCK_USER = { user: { id: "user-001" } };
const MOCK_LIVE_ROW = {
  id: "live-001",
  host_id: "user-001",
  host_name: "TestHost",
  host_avatar: null,
  title: "Test Live",
  description: "A test stream",
  category: "gaming",
  status: "live",
  stream_url: null,
  thumbnail_url: null,
  viewer_count: 42,
  peak_viewer_count: 100,
  like_count: 5,
  total_donations: 300,
  co_hosts: [],
  settings: { donationsEnabled: true, chatEnabled: true },
  tags: ["test"],
  scheduled_at: null,
  started_at: "2025-01-01T00:00:00Z",
  ended_at: null,
  replay_url: null,
  has_replay: false,
  is_adult_only: false,
  created_at: "2025-01-01T00:00:00Z",
};

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: MOCK_USER });
  useLiveStreamingStore.getState().reset();
});

// ═══════════════════════════════════════════════════════════════
// Types: getDonationTier & DONATION_TIER_THRESHOLDS
// ═══════════════════════════════════════════════════════════════

describe("getDonationTier", () => {
  it("returns bronze for small amounts", () => {
    expect(getDonationTier(1)).toBe("bronze");
    expect(getDonationTier(49)).toBe("bronze");
  });

  it("returns silver for 50-199", () => {
    expect(getDonationTier(50)).toBe("silver");
    expect(getDonationTier(199)).toBe("silver");
  });

  it("returns gold for 200-499", () => {
    expect(getDonationTier(200)).toBe("gold");
    expect(getDonationTier(499)).toBe("gold");
  });

  it("returns diamond for 500-999", () => {
    expect(getDonationTier(500)).toBe("diamond");
    expect(getDonationTier(999)).toBe("diamond");
  });

  it("returns legendary for 1000+", () => {
    expect(getDonationTier(1000)).toBe("legendary");
    expect(getDonationTier(5000)).toBe("legendary");
  });
});

describe("DONATION_TIER_THRESHOLDS", () => {
  it("has correct thresholds", () => {
    expect(DONATION_TIER_THRESHOLDS.bronze).toBe(1);
    expect(DONATION_TIER_THRESHOLDS.silver).toBe(50);
    expect(DONATION_TIER_THRESHOLDS.gold).toBe(200);
    expect(DONATION_TIER_THRESHOLDS.diamond).toBe(500);
    expect(DONATION_TIER_THRESHOLDS.legendary).toBe(1000);
  });

  it("has exactly 5 tiers", () => {
    expect(Object.keys(DONATION_TIER_THRESHOLDS)).toHaveLength(5);
  });
});

// ═══════════════════════════════════════════════════════════════
// LiveStreamingService
// ═══════════════════════════════════════════════════════════════

describe("LiveStreamingService", () => {
  let service;

  beforeEach(() => {
    service = new LiveStreamingService();
  });

  // ── createLive ─────────────────────────────────────────

  describe("createLive", () => {
    it("creates a live stream successfully", async () => {
      const chain = chainMock({ data: MOCK_LIVE_ROW, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.createLive({
        title: "Test Live",
        category: "gaming",
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe("live-001");
      expect(result.data.title).toBe("Test Live");
      expect(result.data.hostId).toBe("user-001");
      expect(mockFrom).toHaveBeenCalledWith("imufeed_lives");
    });

    it("returns error when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await service.createLive({
        title: "Test",
        category: "gaming",
      });

      expect(result.error).toBe("Not authenticated");
      expect(result.data).toBeNull();
    });

    it("returns error on supabase failure", async () => {
      const chain = chainMock({
        data: null,
        error: { message: "DB error" },
      });
      mockFrom.mockReturnValue(chain);

      const result = await service.createLive({
        title: "Test",
        category: "gaming",
      });

      expect(result.error).toBe("DB error");
      expect(result.data).toBeNull();
    });
  });

  // ── endLive ────────────────────────────────────────────

  describe("endLive", () => {
    it("ends a live stream", async () => {
      const chain = chainMock({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.endLive("live-001");

      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("imufeed_lives");
    });

    it("returns error on failure", async () => {
      const chain = chainMock({ error: { message: "Not found" } });
      mockFrom.mockReturnValue(chain);

      const result = await service.endLive("invalid-id");

      expect(result.error).toBe("Not found");
    });
  });

  // ── getLive ────────────────────────────────────────────

  describe("getLive", () => {
    it("gets a live stream by ID", async () => {
      const chain = chainMock({ data: MOCK_LIVE_ROW, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.getLive("live-001");

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe("live-001");
      expect(result.data.category).toBe("gaming");
    });

    it("returns error when not found", async () => {
      const chain = chainMock({
        data: null,
        error: { message: "Not found" },
      });
      mockFrom.mockReturnValue(chain);

      const result = await service.getLive("nonexistent");

      expect(result.error).toBe("Not found");
    });
  });

  // ── getActiveLives ─────────────────────────────────────

  describe("getActiveLives", () => {
    it("returns active live streams", async () => {
      const chain = chainMock({
        data: [MOCK_LIVE_ROW],
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await service.getActiveLives();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe("live");
    });

    it("returns empty array on error", async () => {
      const chain = chainMock({
        data: null,
        error: { message: "Server error" },
      });
      mockFrom.mockReturnValue(chain);

      const result = await service.getActiveLives();

      expect(result.error).toBe("Server error");
      expect(result.data).toEqual([]);
    });
  });

  // ── sendChatMessage ────────────────────────────────────

  describe("sendChatMessage", () => {
    it("sends a chat message", async () => {
      const chain = chainMock({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.sendChatMessage("live-001", "Hello!");

      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_chat");
    });

    it("returns error when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await service.sendChatMessage("live-001", "Hello!");

      expect(result.error).toBe("Not authenticated");
    });
  });

  // ── subscribeToChatChannel ────────────────────────────

  describe("subscribeToChatChannel", () => {
    it("subscribes to chat and returns unsubscribe function", () => {
      const mockSubscribe = jest.fn().mockReturnThis();
      const mockOn = jest.fn().mockReturnValue({ subscribe: mockSubscribe });
      const mockChannelObj = { on: mockOn };
      mockChannel.mockReturnValue(mockChannelObj);

      const onMessage = jest.fn();
      const unsub = service.subscribeToChatChannel("live-001", onMessage);

      expect(mockChannel).toHaveBeenCalledWith("live-chat:live-001");
      expect(typeof unsub).toBe("function");

      unsub();
      expect(mockRemoveChannel).toHaveBeenCalled();
    });
  });

  // ── sendReaction ──────────────────────────────────────

  describe("sendReaction", () => {
    it("sends a reaction via broadcast channel", async () => {
      const mockSend = jest.fn().mockResolvedValue(undefined);
      mockChannel.mockReturnValue({ send: mockSend });

      await service.sendReaction("live-001", "heart");

      expect(mockChannel).toHaveBeenCalledWith("live-reactions:live-001");
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "broadcast",
          event: "reaction",
          payload: expect.objectContaining({
            userId: "user-001",
            type: "heart",
          }),
        }),
      );
    });

    it("does nothing when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      // Should not throw
      await service.sendReaction("live-001", "heart");
    });
  });

  // ── sendDonation ──────────────────────────────────────

  describe("sendDonation", () => {
    it("sends a donation successfully", async () => {
      const donationRow = {
        id: "don-001",
        live_id: "live-001",
        user_id: "user-001",
        amount: 250,
        message: "Great stream!",
        profiles: { display_name: "TestUser", avatar_url: null },
        created_at: "2025-01-01T00:00:00Z",
      };
      const chain = chainMock({ data: donationRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.sendDonation({
        liveId: "live-001",
        amount: 250,
        message: "Great stream!",
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.amount).toBe(250);
      expect(result.data.tier).toBe("gold");
    });

    it("returns error when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await service.sendDonation({
        liveId: "live-001",
        amount: 100,
      });

      expect(result.error).toBe("Not authenticated");
    });
  });

  // ── inviteCoHost ──────────────────────────────────────

  describe("inviteCoHost", () => {
    it("sends cohost invitation", async () => {
      const chain = chainMock({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.inviteCoHost("live-001", "user-002");

      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_cohosts");
    });
  });

  // ── moderateViewer ────────────────────────────────────

  describe("moderateViewer", () => {
    it("creates moderation entry", async () => {
      const chain = chainMock({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.moderateViewer({
        liveId: "live-001",
        targetUserId: "user-002",
        action: "mute",
        reason: "Spam",
      });

      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_moderation");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Live Streaming Store (Zustand)
// ═══════════════════════════════════════════════════════════════

describe("useLiveStreamingStore", () => {
  // ── setCurrentLive ────────────────────────────────────

  it("sets current live and viewer counts", () => {
    const store = useLiveStreamingStore.getState();
    const mockLive = {
      id: "live-001",
      hostId: "user-001",
      hostName: "Host",
      hostAvatar: null,
      title: "Test",
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
      settings: {},
      tags: [],
      scheduledAt: null,
      startedAt: "2025-01-01T00:00:00Z",
      endedAt: null,
      createdAt: "2025-01-01T00:00:00Z",
      replayUrl: null,
      hasReplay: false,
      isAdultOnly: false,
    };

    act(() => store.setCurrentLive(mockLive));

    const state = useLiveStreamingStore.getState();
    expect(state.currentLive).toBeDefined();
    expect(state.currentLive.id).toBe("live-001");
    expect(state.viewerCount).toBe(42);
    expect(state.peakViewerCount).toBe(100);
  });

  // ── updateLive ────────────────────────────────────────

  it("updates live stream partially", () => {
    const store = useLiveStreamingStore.getState();
    const mockLive = {
      id: "live-001",
      hostId: "u1",
      hostName: "H",
      hostAvatar: null,
      title: "Old Title",
      description: "",
      category: "gaming",
      status: "live",
      streamUrl: null,
      thumbnailUrl: null,
      viewerCount: 0,
      peakViewerCount: 0,
      likeCount: 0,
      totalDonations: 0,
      coHosts: [],
      settings: {},
      tags: [],
      scheduledAt: null,
      startedAt: null,
      endedAt: null,
      createdAt: "2025-01-01T00:00:00Z",
      replayUrl: null,
      hasReplay: false,
      isAdultOnly: false,
    };

    act(() => store.setCurrentLive(mockLive));
    act(() =>
      useLiveStreamingStore.getState().updateLive({ title: "New Title" }),
    );

    expect(useLiveStreamingStore.getState().currentLive.title).toBe(
      "New Title",
    );
  });

  // ── addChatMessage ────────────────────────────────────

  it("adds chat messages and caps at 200", () => {
    const store = useLiveStreamingStore.getState();

    // Add 210 messages
    act(() => {
      for (let i = 0; i < 210; i++) {
        store.addChatMessage({
          id: `msg-${i}`,
          liveId: "live-001",
          userId: "user-001",
          userName: "Test",
          userAvatar: null,
          type: "text",
          content: `Message ${i}`,
          role: "viewer",
          createdAt: new Date().toISOString(),
          isPinned: false,
        });
      }
    });

    const state = useLiveStreamingStore.getState();
    expect(state.chatMessages.length).toBeLessThanOrEqual(200);
    // Should keep the last 200 messages
    expect(state.chatMessages[state.chatMessages.length - 1].content).toBe(
      "Message 209",
    );
  });

  // ── pinMessage / unpinMessage ────────────────────────

  it("pins and unpins a message", () => {
    const store = useLiveStreamingStore.getState();
    const msg = {
      id: "msg-pin",
      liveId: "live-001",
      userId: "user-001",
      userName: "Test",
      userAvatar: null,
      type: "text",
      content: "Pin me!",
      role: "viewer",
      createdAt: new Date().toISOString(),
      isPinned: false,
    };

    act(() => store.addChatMessage(msg));
    act(() => useLiveStreamingStore.getState().pinMessage("msg-pin"));

    expect(useLiveStreamingStore.getState().pinnedMessage).toBeDefined();
    expect(useLiveStreamingStore.getState().pinnedMessage.id).toBe("msg-pin");

    act(() => useLiveStreamingStore.getState().unpinMessage());
    expect(useLiveStreamingStore.getState().pinnedMessage).toBeNull();
  });

  // ── updateViewerCount ─────────────────────────────────

  it("updates viewer count and tracks peak", () => {
    const store = useLiveStreamingStore.getState();

    act(() => store.updateViewerCount(50));
    expect(useLiveStreamingStore.getState().viewerCount).toBe(50);
    expect(useLiveStreamingStore.getState().peakViewerCount).toBe(50);

    act(() => useLiveStreamingStore.getState().updateViewerCount(30));
    expect(useLiveStreamingStore.getState().viewerCount).toBe(30);
    // Peak stays at 50
    expect(useLiveStreamingStore.getState().peakViewerCount).toBe(50);

    act(() => useLiveStreamingStore.getState().updateViewerCount(80));
    expect(useLiveStreamingStore.getState().peakViewerCount).toBe(80);
  });

  // ── addReaction / removeReaction ──────────────────────

  it("adds reactions and caps at 30", () => {
    const store = useLiveStreamingStore.getState();

    act(() => {
      for (let i = 0; i < 35; i++) {
        store.addReaction({
          id: `react-${i}`,
          userId: "user-001",
          type: "heart",
          createdAt: new Date().toISOString(),
        });
      }
    });

    const state = useLiveStreamingStore.getState();
    expect(state.reactionQueue.length).toBeLessThanOrEqual(30);
  });

  it("removes a reaction by ID", () => {
    const store = useLiveStreamingStore.getState();

    act(() => {
      store.addReaction({
        id: "react-remove",
        userId: "user-001",
        type: "fire",
        createdAt: new Date().toISOString(),
      });
    });

    expect(useLiveStreamingStore.getState().reactionQueue).toHaveLength(1);

    act(() => useLiveStreamingStore.getState().removeReaction("react-remove"));
    expect(useLiveStreamingStore.getState().reactionQueue).toHaveLength(0);
  });

  // ── addDonation / shiftDonation ───────────────────────

  it("adds donations and caps at 10", () => {
    const store = useLiveStreamingStore.getState();

    act(() => {
      for (let i = 0; i < 15; i++) {
        store.addDonation({
          id: `don-${i}`,
          liveId: "live-001",
          userId: "user-001",
          userName: "Test",
          userAvatar: null,
          amount: 100,
          message: null,
          tier: "silver",
          createdAt: new Date().toISOString(),
        });
      }
    });

    const state = useLiveStreamingStore.getState();
    expect(state.donationQueue.length).toBeLessThanOrEqual(10);
  });

  it("shifts first donation from queue", () => {
    const store = useLiveStreamingStore.getState();

    act(() => {
      store.addDonation({
        id: "don-first",
        liveId: "live-001",
        userId: "user-001",
        userName: "Test",
        userAvatar: null,
        amount: 50,
        message: null,
        tier: "silver",
        createdAt: new Date().toISOString(),
      });
      store.addDonation({
        id: "don-second",
        liveId: "live-001",
        userId: "user-001",
        userName: "Test",
        userAvatar: null,
        amount: 200,
        message: null,
        tier: "gold",
        createdAt: new Date().toISOString(),
      });
    });

    expect(useLiveStreamingStore.getState().donationQueue).toHaveLength(2);

    act(() => useLiveStreamingStore.getState().shiftDonation());

    const state = useLiveStreamingStore.getState();
    expect(state.donationQueue).toHaveLength(1);
    expect(state.donationQueue[0].id).toBe("don-second");
  });

  // ── connectionStatus ─────────────────────────────────

  it("sets connection status", () => {
    const store = useLiveStreamingStore.getState();

    act(() => store.setConnectionStatus("connecting"));
    expect(useLiveStreamingStore.getState().connectionStatus).toBe(
      "connecting",
    );

    act(() =>
      useLiveStreamingStore.getState().setConnectionStatus("connected"),
    );
    expect(useLiveStreamingStore.getState().connectionStatus).toBe("connected");
  });

  // ── setIsHosting ──────────────────────────────────────

  it("toggles hosting state", () => {
    const store = useLiveStreamingStore.getState();

    act(() => store.setIsHosting(true));
    expect(useLiveStreamingStore.getState().isHosting).toBe(true);

    act(() => useLiveStreamingStore.getState().setIsHosting(false));
    expect(useLiveStreamingStore.getState().isHosting).toBe(false);
  });

  // ── reset ─────────────────────────────────────────────

  it("resets store to initial state", () => {
    const store = useLiveStreamingStore.getState();

    act(() => {
      store.setCurrentLive({
        id: "live-x",
        hostId: "u1",
        hostName: "H",
        hostAvatar: null,
        title: "X",
        description: "",
        category: "gaming",
        status: "live",
        streamUrl: null,
        thumbnailUrl: null,
        viewerCount: 99,
        peakViewerCount: 99,
        likeCount: 0,
        totalDonations: 0,
        coHosts: [],
        settings: {},
        tags: [],
        scheduledAt: null,
        startedAt: null,
        endedAt: null,
        createdAt: "2025-01-01T00:00:00Z",
        replayUrl: null,
        hasReplay: false,
        isAdultOnly: false,
      });
      store.setIsHosting(true);
      store.setConnectionStatus("connected");
      store.addChatMessage({
        id: "m1",
        liveId: "live-x",
        userId: "u1",
        userName: "X",
        userAvatar: null,
        type: "text",
        content: "Hi",
        role: "viewer",
        createdAt: new Date().toISOString(),
        isPinned: false,
      });
    });

    expect(useLiveStreamingStore.getState().currentLive).toBeDefined();

    act(() => useLiveStreamingStore.getState().reset());

    const state = useLiveStreamingStore.getState();
    expect(state.currentLive).toBeNull();
    expect(state.chatMessages).toEqual([]);
    expect(state.viewerCount).toBe(0);
    expect(state.isHosting).toBe(false);
    expect(state.connectionStatus).toBe("disconnected");
    expect(state.reactionQueue).toEqual([]);
    expect(state.donationQueue).toEqual([]);
  });

  // ── clearChat ─────────────────────────────────────────

  it("clears chat messages and pinned message", () => {
    const store = useLiveStreamingStore.getState();

    act(() => {
      store.addChatMessage({
        id: "m1",
        liveId: "live-001",
        userId: "u1",
        userName: "T",
        userAvatar: null,
        type: "text",
        content: "Hello",
        role: "viewer",
        createdAt: new Date().toISOString(),
        isPinned: false,
      });
      store.pinMessage("m1");
    });

    expect(useLiveStreamingStore.getState().chatMessages).toHaveLength(1);
    expect(useLiveStreamingStore.getState().pinnedMessage).toBeDefined();

    act(() => useLiveStreamingStore.getState().clearChat());

    expect(useLiveStreamingStore.getState().chatMessages).toEqual([]);
    expect(useLiveStreamingStore.getState().pinnedMessage).toBeNull();
  });
});
