/**
 * Tests for Sprint S17 — Live Co-host, Replay, Modération, Sondages
 *
 * - components/imufeed/LivePoll (PollCreator + LivePollDisplay)
 * - components/imufeed/LiveModeration (viewer list, actions, mod toggle)
 * - components/imufeed/LiveCoHostPanel (invite, active, requests)
 * - app/imufeed/live/replays (replay list, watch, delete)
 * - stores/live-streaming-store (poll, cohost, moderation actions)
 * - services/imufeed/live-api (new methods)
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

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

import LiveCoHostPanel from "@/components/imufeed/LiveCoHostPanel";
import LiveModeration from "@/components/imufeed/LiveModeration";
import LivePollDisplay, { PollCreator } from "@/components/imufeed/LivePoll";
import type {
  CoHostRequest,
  LivePoll,
  LiveReplay,
} from "@/types/live-streaming";

// ─── Helpers ──────────────────────────────────────────────────

function chainMock(resolveValue) {
  const chain: any = {};
  const methods = [
    "insert",
    "update",
    "delete",
    "select",
    "eq",
    "order",
    "limit",
  ];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  chain.then = jest.fn((resolve) => resolve(resolveValue));
  return chain;
}

function makePoll(overrides: Partial<LivePoll> = {}): LivePoll {
  return {
    id: "poll-1",
    liveId: "live-001",
    question: "Quel jeu jouer ensuite ?",
    options: [
      { id: "opt_0", text: "Minecraft", voteCount: 5 },
      { id: "opt_1", text: "Fortnite", voteCount: 3 },
      { id: "opt_2", text: "Zelda", voteCount: 2 },
    ],
    totalVotes: 10,
    hasVoted: false,
    votedOptionIndex: null,
    durationSeconds: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    closedAt: null,
    ...overrides,
  };
}

function makeCoHostRequest(
  overrides: Partial<CoHostRequest> = {},
): CoHostRequest {
  return {
    id: "req-1",
    liveId: "live-001",
    fromUserId: "host-1",
    toUserId: "user-2",
    status: "pending",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeReplay(overrides: Partial<LiveReplay> = {}): LiveReplay {
  return {
    id: "replay-1",
    liveId: "live-001",
    hostId: "host-1",
    hostName: "TestHost",
    title: "Mon super live gaming",
    category: "gaming",
    thumbnailUrl: null,
    replayUrl: "https://example.com/replay.mp4",
    duration: 3600,
    viewCount: 1200,
    likeCount: 45,
    peakViewerCount: 300,
    createdAt: "2026-02-20T10:00:00Z",
    ...overrides,
  };
}

// ─── Clean-up ─────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({
    data: { user: { id: "host-1" } },
  });
});

// ═══════════════════════════════════════════════════════════════
// 1. PollCreator
// ═══════════════════════════════════════════════════════════════

describe("PollCreator", () => {
  const onCreatePoll = jest.fn();
  const onClose = jest.fn();

  it("renders the form with question input and 2 option inputs", () => {
    const { getByTestId } = render(
      <PollCreator onCreatePoll={onCreatePoll} onClose={onClose} />,
    );
    expect(getByTestId("poll-creator")).toBeTruthy();
    expect(getByTestId("poll-question-input")).toBeTruthy();
    expect(getByTestId("poll-option-input-0")).toBeTruthy();
    expect(getByTestId("poll-option-input-1")).toBeTruthy();
  });

  it("create button is disabled when question < 3 chars", () => {
    const { getByTestId } = render(
      <PollCreator onCreatePoll={onCreatePoll} onClose={onClose} />,
    );
    const btn = getByTestId("poll-create-button");
    fireEvent.press(btn);
    expect(onCreatePoll).not.toHaveBeenCalled();
  });

  it("calls onCreatePoll with valid data", () => {
    const { getByTestId } = render(
      <PollCreator onCreatePoll={onCreatePoll} onClose={onClose} />,
    );
    fireEvent.changeText(getByTestId("poll-question-input"), "Quel jeu ?");
    fireEvent.changeText(getByTestId("poll-option-input-0"), "Minecraft");
    fireEvent.changeText(getByTestId("poll-option-input-1"), "Fortnite");
    fireEvent.press(getByTestId("poll-create-button"));
    expect(onCreatePoll).toHaveBeenCalledWith(
      "Quel jeu ?",
      ["Minecraft", "Fortnite"],
      60,
    );
  });

  it("can add a third option", () => {
    const { getByTestId, queryByTestId } = render(
      <PollCreator onCreatePoll={onCreatePoll} onClose={onClose} />,
    );
    expect(queryByTestId("poll-option-input-2")).toBeNull();
    fireEvent.press(getByTestId("poll-add-option"));
    expect(getByTestId("poll-option-input-2")).toBeTruthy();
  });

  it("can remove an option when > 2", () => {
    const { getByTestId, queryByTestId } = render(
      <PollCreator onCreatePoll={onCreatePoll} onClose={onClose} />,
    );
    fireEvent.press(getByTestId("poll-add-option"));
    expect(getByTestId("poll-option-input-2")).toBeTruthy();
    fireEvent.press(getByTestId("poll-remove-option-2"));
    expect(queryByTestId("poll-option-input-2")).toBeNull();
  });

  it("changes duration when pressing a chip", () => {
    const { getByTestId } = render(
      <PollCreator onCreatePoll={onCreatePoll} onClose={onClose} />,
    );
    fireEvent.press(getByTestId("poll-duration-120"));
    // Fill valid data so create button works
    fireEvent.changeText(getByTestId("poll-question-input"), "Question test");
    fireEvent.changeText(getByTestId("poll-option-input-0"), "A");
    fireEvent.changeText(getByTestId("poll-option-input-1"), "B");
    fireEvent.press(getByTestId("poll-create-button"));
    expect(onCreatePoll).toHaveBeenCalledWith("Question test", ["A", "B"], 120);
  });

  it("calls onClose when close button pressed", () => {
    const { getByTestId } = render(
      <PollCreator onCreatePoll={onCreatePoll} onClose={onClose} />,
    );
    fireEvent.press(getByTestId("poll-creator-close"));
    expect(onClose).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. LivePollDisplay
// ═══════════════════════════════════════════════════════════════

describe("LivePollDisplay", () => {
  const onVote = jest.fn();
  const onClose = jest.fn();

  it("renders poll question and options", () => {
    const poll = makePoll();
    const { getByTestId } = render(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={false}
      />,
    );
    expect(getByTestId("poll-display")).toBeTruthy();
    expect(getByTestId("poll-question")).toBeTruthy();
    expect(getByTestId("poll-option-0")).toBeTruthy();
    expect(getByTestId("poll-option-1")).toBeTruthy();
    expect(getByTestId("poll-option-2")).toBeTruthy();
  });

  it("calls onVote when option pressed and poll is active", () => {
    const poll = makePoll();
    const { getByTestId } = render(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={false}
      />,
    );
    fireEvent.press(getByTestId("poll-option-1"));
    expect(onVote).toHaveBeenCalledWith(1);
  });

  it("does not call onVote when already voted", () => {
    const poll = makePoll({ hasVoted: true, votedOptionIndex: 0 });
    const { getByTestId } = render(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={false}
      />,
    );
    fireEvent.press(getByTestId("poll-option-1"));
    expect(onVote).not.toHaveBeenCalled();
  });

  it("does not call onVote when poll is closed", () => {
    const poll = makePoll({ isActive: false });
    const { getByTestId } = render(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={false}
      />,
    );
    fireEvent.press(getByTestId("poll-option-0"));
    expect(onVote).not.toHaveBeenCalled();
  });

  it("shows percentages when user has voted", () => {
    const poll = makePoll({ hasVoted: true, votedOptionIndex: 0 });
    const { getByText } = render(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={false}
      />,
    );
    expect(getByText("50%")).toBeTruthy(); // 5/10 = 50%
    expect(getByText("30%")).toBeTruthy(); // 3/10 = 30%
    expect(getByText("20%")).toBeTruthy(); // 2/10 = 20%
  });

  it("shows close button only for host on active poll", () => {
    const poll = makePoll();
    const { getByTestId, queryByTestId, rerender } = render(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={true}
      />,
    );
    expect(getByTestId("poll-close-button")).toBeTruthy();
    fireEvent.press(getByTestId("poll-close-button"));
    expect(onClose).toHaveBeenCalled();

    // Not for viewers
    rerender(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={false}
      />,
    );
    expect(queryByTestId("poll-close-button")).toBeNull();
  });

  it("shows total vote count", () => {
    const poll = makePoll();
    const { getByText } = render(
      <LivePollDisplay
        poll={poll}
        onVote={onVote}
        onClose={onClose}
        isHost={false}
      />,
    );
    expect(getByText(/10/)).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. LiveModeration
// ═══════════════════════════════════════════════════════════════

describe("LiveModeration", () => {
  const onModerate = jest.fn();
  const onAssignMod = jest.fn();
  const onRemoveMod = jest.fn();
  const onClose = jest.fn();

  const viewers = [
    { userId: "u1", userName: "Alice", role: "viewer" as const },
    { userId: "u2", userName: "Bob", role: "subscriber" as const },
    { userId: "u3", userName: "Charlie", role: "moderator" as const },
  ];

  it("renders moderation panel with viewers list", () => {
    const { getByTestId } = render(
      <LiveModeration
        viewers={viewers}
        moderators={["u3"]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    expect(getByTestId("moderation-panel")).toBeTruthy();
    expect(getByTestId("viewers-list")).toBeTruthy();
    expect(getByTestId("viewer-row-u1")).toBeTruthy();
    expect(getByTestId("viewer-row-u2")).toBeTruthy();
    expect(getByTestId("viewer-row-u3")).toBeTruthy();
  });

  it("shows mod badge for moderators", () => {
    const { getByTestId, queryByTestId } = render(
      <LiveModeration
        viewers={viewers}
        moderators={["u3"]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    expect(getByTestId("mod-badge-u3")).toBeTruthy();
    expect(queryByTestId("mod-badge-u1")).toBeNull();
  });

  it("expands viewer actions on press", () => {
    const { getByTestId, queryByTestId } = render(
      <LiveModeration
        viewers={viewers}
        moderators={[]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    expect(queryByTestId("viewer-actions-u1")).toBeNull();
    fireEvent.press(getByTestId("viewer-row-u1"));
    expect(getByTestId("viewer-actions-u1")).toBeTruthy();
  });

  it("calls onModerate with ban action", () => {
    const { getByTestId } = render(
      <LiveModeration
        viewers={viewers}
        moderators={[]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByTestId("viewer-row-u1"));
    fireEvent.press(getByTestId("action-ban-u1"));
    expect(onModerate).toHaveBeenCalledWith("u1", "ban");
  });

  it("calls onAssignModerator when toggling mod for non-mod", () => {
    const { getByTestId } = render(
      <LiveModeration
        viewers={viewers}
        moderators={[]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByTestId("viewer-row-u1"));
    fireEvent.press(getByTestId("toggle-mod-u1"));
    expect(onAssignMod).toHaveBeenCalledWith("u1");
  });

  it("calls onRemoveModerator when toggling mod for existing mod", () => {
    const { getByTestId } = render(
      <LiveModeration
        viewers={viewers}
        moderators={["u1"]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByTestId("viewer-row-u1"));
    fireEvent.press(getByTestId("toggle-mod-u1"));
    expect(onRemoveMod).toHaveBeenCalledWith("u1");
  });

  it("shows empty state when no viewers", () => {
    const { getByTestId } = render(
      <LiveModeration
        viewers={[]}
        moderators={[]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    expect(getByTestId("no-viewers")).toBeTruthy();
  });

  it("calls onClose when close button pressed", () => {
    const { getByTestId } = render(
      <LiveModeration
        viewers={viewers}
        moderators={[]}
        onModerate={onModerate}
        onAssignModerator={onAssignMod}
        onRemoveModerator={onRemoveMod}
        onClose={onClose}
      />,
    );
    fireEvent.press(getByTestId("moderation-close"));
    expect(onClose).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. LiveCoHostPanel
// ═══════════════════════════════════════════════════════════════

describe("LiveCoHostPanel", () => {
  const onInvite = jest.fn();
  const onRemoveCoHost = jest.fn();
  const onClose = jest.fn();

  const candidates = [
    { userId: "u1", userName: "Alice", userAvatar: null },
    { userId: "u2", userName: "Bob", userAvatar: null },
    { userId: "u3", userName: "Charlie", userAvatar: null },
  ];

  it("renders panel with slot count", () => {
    const { getByTestId, getByText } = render(
      <LiveCoHostPanel
        activeCoHosts={[]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    expect(getByTestId("cohost-panel")).toBeTruthy();
    expect(getByText("0/3")).toBeTruthy();
  });

  it("shows active co-hosts", () => {
    const { getByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={["u1"]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    expect(getByTestId("active-cohosts")).toBeTruthy();
    expect(getByTestId("active-cohost-u1")).toBeTruthy();
  });

  it("shows pending requests", () => {
    const req = makeCoHostRequest({ id: "req-1", toUserId: "u2" });
    const { getByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={[]}
        coHostRequests={[req]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    expect(getByTestId("pending-requests")).toBeTruthy();
    expect(getByTestId("request-req-1")).toBeTruthy();
    expect(getByTestId("request-badge-pending")).toBeTruthy();
  });

  it("calls onInvite when invite button pressed", () => {
    const { getByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={[]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    expect(getByTestId("invite-section")).toBeTruthy();
    fireEvent.press(getByTestId("invite-u1"));
    expect(onInvite).toHaveBeenCalledWith("u1");
  });

  it("calls onRemoveCoHost when remove button pressed", () => {
    const { getByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={["u1"]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    fireEvent.press(getByTestId("remove-cohost-u1"));
    expect(onRemoveCoHost).toHaveBeenCalledWith("u1");
  });

  it("shows full message when max co-hosts reached", () => {
    const { getByTestId, queryByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={["u1", "u2", "u3"]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    expect(getByTestId("cohost-full")).toBeTruthy();
    expect(queryByTestId("invite-section")).toBeNull();
  });

  it("filters candidates by search", () => {
    const { getByTestId, queryByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={[]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    fireEvent.changeText(getByTestId("cohost-search-input"), "Ali");
    expect(getByTestId("candidate-u1")).toBeTruthy();
    expect(queryByTestId("candidate-u2")).toBeNull();
  });

  it("excludes already active co-hosts from candidates", () => {
    const { queryByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={["u1"]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    expect(queryByTestId("candidate-u1")).toBeNull();
  });

  it("calls onClose when close button pressed", () => {
    const { getByTestId } = render(
      <LiveCoHostPanel
        activeCoHosts={[]}
        coHostRequests={[]}
        maxCoHosts={3}
        onInvite={onInvite}
        onRemoveCoHost={onRemoveCoHost}
        onClose={onClose}
        candidates={candidates}
      />,
    );
    fireEvent.press(getByTestId("cohost-close"));
    expect(onClose).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Replays Screen
// ═══════════════════════════════════════════════════════════════

describe("ReplaysScreen", () => {
  // Mock the service
  const mockGetReplaysByHost = jest.fn();
  const mockDeleteReplay = jest.fn();
  let getReplaySpy: jest.SpyInstance;
  let deleteReplaySpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // SpyOn prototype methods (auto-restorable)
    const { LiveStreamingService } = require("@/services/imufeed/live-api");
    getReplaySpy = jest
      .spyOn(LiveStreamingService.prototype, "getReplaysByHost")
      .mockImplementation(mockGetReplaysByHost);
    deleteReplaySpy = jest
      .spyOn(LiveStreamingService.prototype, "deleteReplay")
      .mockImplementation(mockDeleteReplay);
  });

  afterEach(() => {
    getReplaySpy?.mockRestore();
    deleteReplaySpy?.mockRestore();
  });

  it("shows loading state initially", async () => {
    mockGetReplaysByHost.mockResolvedValue({ data: [], error: null });
    const ReplaysScreen = require("@/app/imufeed/live/replays").default;
    const { getByTestId } = render(<ReplaysScreen />);
    expect(getByTestId("replays-screen")).toBeTruthy();
  });

  it("shows empty state when no replays", async () => {
    mockGetReplaysByHost.mockResolvedValue({ data: [], error: null });
    const ReplaysScreen = require("@/app/imufeed/live/replays").default;
    const { findByTestId } = render(<ReplaysScreen />);
    const empty = await findByTestId("replays-empty");
    expect(empty).toBeTruthy();
  });

  it("renders replay list with cards", async () => {
    const replays = [
      makeReplay(),
      makeReplay({ id: "replay-2", title: "Deuxième live" }),
    ];
    mockGetReplaysByHost.mockResolvedValue({ data: replays, error: null });
    const ReplaysScreen = require("@/app/imufeed/live/replays").default;
    const { findByTestId } = render(<ReplaysScreen />);
    const list = await findByTestId("replays-list");
    expect(list).toBeTruthy();
    const card1 = await findByTestId("replay-card-replay-1");
    expect(card1).toBeTruthy();
  });

  it("navigates on watch press", async () => {
    const replays = [makeReplay()];
    mockGetReplaysByHost.mockResolvedValue({ data: replays, error: null });
    const ReplaysScreen = require("@/app/imufeed/live/replays").default;
    const { findByTestId } = render(<ReplaysScreen />);
    const watchBtn = await findByTestId("replay-watch-replay-1");
    fireEvent.press(watchBtn);
    expect(mockRouterPush).toHaveBeenCalledWith("/imufeed/live/live-001");
  });

  it("navigates back on back button", async () => {
    mockGetReplaysByHost.mockResolvedValue({ data: [], error: null });
    const ReplaysScreen = require("@/app/imufeed/live/replays").default;
    const { findByTestId } = render(<ReplaysScreen />);
    const backBtn = await findByTestId("replays-back");
    fireEvent.press(backBtn);
    expect(mockRouterBack).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Live Streaming Store — S17 additions
// ═══════════════════════════════════════════════════════════════

describe("LiveStreamingStore - S17 features", () => {
  const { useLiveStreamingStore } = require("@/stores/live-streaming-store");

  beforeEach(() => {
    useLiveStreamingStore.getState().reset();
  });

  // ── Polls ─────────────────────────────────────────

  describe("Poll actions", () => {
    it("setActivePoll sets the active poll", () => {
      const poll = makePoll();
      useLiveStreamingStore.getState().setActivePoll(poll);
      expect(useLiveStreamingStore.getState().activePoll).toEqual(poll);
    });

    it("setActivePoll(null) clears poll", () => {
      useLiveStreamingStore.getState().setActivePoll(makePoll());
      useLiveStreamingStore.getState().setActivePoll(null);
      expect(useLiveStreamingStore.getState().activePoll).toBeNull();
    });

    it("voteOnPoll increments vote and marks voted", () => {
      const poll = makePoll({
        totalVotes: 0,
        options: [
          { id: "opt_0", text: "A", voteCount: 0 },
          { id: "opt_1", text: "B", voteCount: 0 },
        ],
      });
      useLiveStreamingStore.getState().setActivePoll(poll);
      useLiveStreamingStore.getState().voteOnPoll(1);
      const updated = useLiveStreamingStore.getState().activePoll;
      expect(updated?.options[1].voteCount).toBe(1);
      expect(updated?.totalVotes).toBe(1);
      expect(updated?.hasVoted).toBe(true);
      expect(updated?.votedOptionIndex).toBe(1);
    });

    it("voteOnPoll does nothing when already voted", () => {
      const poll = makePoll({ hasVoted: true, votedOptionIndex: 0 });
      useLiveStreamingStore.getState().setActivePoll(poll);
      useLiveStreamingStore.getState().voteOnPoll(1);
      const updated = useLiveStreamingStore.getState().activePoll;
      expect(updated?.votedOptionIndex).toBe(0);
    });

    it("updatePollResults updates option counts", () => {
      useLiveStreamingStore.getState().setActivePoll(makePoll());
      const newOptions = [
        { id: "opt_0", text: "Minecraft", voteCount: 15 },
        { id: "opt_1", text: "Fortnite", voteCount: 10 },
        { id: "opt_2", text: "Zelda", voteCount: 8 },
      ];
      useLiveStreamingStore.getState().updatePollResults(newOptions, 33);
      const updated = useLiveStreamingStore.getState().activePoll;
      expect(updated?.totalVotes).toBe(33);
      expect(updated?.options[0].voteCount).toBe(15);
    });
  });

  // ── Co-host ───────────────────────────────────────

  describe("CoHost actions", () => {
    it("addCoHostRequest adds request", () => {
      const req = makeCoHostRequest();
      useLiveStreamingStore.getState().addCoHostRequest(req);
      expect(useLiveStreamingStore.getState().coHostRequests).toHaveLength(1);
      expect(useLiveStreamingStore.getState().coHostRequests[0].id).toBe(
        "req-1",
      );
    });

    it("updateCoHostRequest changes status", () => {
      useLiveStreamingStore.getState().addCoHostRequest(makeCoHostRequest());
      useLiveStreamingStore.getState().updateCoHostRequest("req-1", "accepted");
      expect(useLiveStreamingStore.getState().coHostRequests[0].status).toBe(
        "accepted",
      );
    });

    it("setActiveCoHosts sets co-host IDs", () => {
      useLiveStreamingStore.getState().setActiveCoHosts(["u1", "u2"]);
      expect(useLiveStreamingStore.getState().activeCoHosts).toEqual([
        "u1",
        "u2",
      ]);
    });

    it("addActiveCoHost adds unique co-host", () => {
      useLiveStreamingStore.getState().addActiveCoHost("u1");
      useLiveStreamingStore.getState().addActiveCoHost("u1");
      expect(useLiveStreamingStore.getState().activeCoHosts).toEqual(["u1"]);
    });

    it("removeActiveCoHost removes co-host", () => {
      useLiveStreamingStore.getState().setActiveCoHosts(["u1", "u2"]);
      useLiveStreamingStore.getState().removeActiveCoHost("u1");
      expect(useLiveStreamingStore.getState().activeCoHosts).toEqual(["u2"]);
    });
  });

  // ── Moderation ────────────────────────────────────

  describe("Moderation actions", () => {
    it("setModerators sets moderator list", () => {
      useLiveStreamingStore.getState().setModerators(["u1", "u2"]);
      expect(useLiveStreamingStore.getState().moderators).toEqual(["u1", "u2"]);
    });

    it("addModerator adds unique moderator", () => {
      useLiveStreamingStore.getState().addModerator("u1");
      useLiveStreamingStore.getState().addModerator("u1");
      expect(useLiveStreamingStore.getState().moderators).toEqual(["u1"]);
    });

    it("removeModerator removes moderator", () => {
      useLiveStreamingStore.getState().setModerators(["u1", "u2"]);
      useLiveStreamingStore.getState().removeModerator("u1");
      expect(useLiveStreamingStore.getState().moderators).toEqual(["u2"]);
    });
  });

  // ── Reset ─────────────────────────────────────────

  describe("Reset clears S17 state", () => {
    it("reset clears all S17 fields", () => {
      useLiveStreamingStore.getState().setActivePoll(makePoll());
      useLiveStreamingStore.getState().addCoHostRequest(makeCoHostRequest());
      useLiveStreamingStore.getState().setActiveCoHosts(["u1"]);
      useLiveStreamingStore.getState().setModerators(["u2"]);
      useLiveStreamingStore.getState().reset();

      const state = useLiveStreamingStore.getState();
      expect(state.activePoll).toBeNull();
      expect(state.coHostRequests).toEqual([]);
      expect(state.activeCoHosts).toEqual([]);
      expect(state.moderators).toEqual([]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Service methods — S17
// ═══════════════════════════════════════════════════════════════

describe("LiveStreamingService - S17 methods", () => {
  const { LiveStreamingService } = require("@/services/imufeed/live-api");
  let service: InstanceType<typeof LiveStreamingService>;

  beforeEach(() => {
    service = new LiveStreamingService();
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "host-1" } } });
  });

  describe("assignModerator", () => {
    it("inserts into imufeed_live_moderators", async () => {
      const chain = chainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);
      const result = await service.assignModerator("live-001", "u1");
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_moderators");
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          live_id: "live-001",
          user_id: "u1",
          assigned_by: "host-1",
        }),
      );
      expect(result.error).toBeNull();
    });
  });

  describe("removeModerator", () => {
    it("deletes from imufeed_live_moderators", async () => {
      const chain = chainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);
      const result = await service.removeModerator("live-001", "u1");
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_moderators");
      expect(chain.delete).toHaveBeenCalled();
    });
  });

  describe("createPoll", () => {
    it("creates poll and returns mapped data", async () => {
      const chain = chainMock({
        data: {
          id: "poll-1",
          live_id: "live-001",
          question: "Test?",
          options: [{ id: "opt_0", text: "A", voteCount: 0 }],
          duration_seconds: 60,
          is_active: true,
          total_votes: 0,
          created_at: "2026-01-01T00:00:00Z",
          closed_at: null,
        },
        error: null,
      });
      mockFrom.mockReturnValue(chain);
      const result = await service.createPoll({
        liveId: "live-001",
        question: "Test?",
        options: ["A", "B"],
      });
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_polls");
      expect(result.data).not.toBeNull();
      expect(result.data.question).toBe("Test?");
    });
  });

  describe("votePoll", () => {
    it("inserts vote", async () => {
      const chain = chainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);
      const result = await service.votePoll("poll-1", 0);
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_poll_votes");
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          poll_id: "poll-1",
          user_id: "host-1",
          option_index: 0,
        }),
      );
    });
  });

  describe("closePoll", () => {
    it("updates poll to inactive", async () => {
      const chain = chainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);
      const result = await service.closePoll("poll-1");
      expect(mockFrom).toHaveBeenCalledWith("imufeed_live_polls");
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false }),
      );
    });
  });

  describe("getReplaysByHost", () => {
    it("queries ended lives with has_replay", async () => {
      const chain = chainMock({
        data: [
          {
            id: "r1",
            host_id: "host-1",
            host_name: "Test",
            title: "Live 1",
            category: "gaming",
            thumbnail_url: null,
            replay_url: "url",
            duration: 3600,
            view_count: 100,
            like_count: 10,
            peak_viewer_count: 50,
            ended_at: "2026-01-01T00:00:00Z",
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
        error: null,
      });
      mockFrom.mockReturnValue(chain);
      const result = await service.getReplaysByHost("host-1");
      expect(mockFrom).toHaveBeenCalledWith("imufeed_lives");
      expect(chain.eq).toHaveBeenCalledWith("status", "ended");
      expect(chain.eq).toHaveBeenCalledWith("has_replay", true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Live 1");
    });
  });

  describe("deleteReplay", () => {
    it("sets has_replay to false", async () => {
      const chain = chainMock({ data: null, error: null });
      mockFrom.mockReturnValue(chain);
      const result = await service.deleteReplay("live-001");
      expect(mockFrom).toHaveBeenCalledWith("imufeed_lives");
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ has_replay: false, replay_url: null }),
      );
    });
  });

  describe("subscribeToPollChannel", () => {
    it("subscribes to live-poll channel", () => {
      const mockChannelObj = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
      };
      mockChannel.mockReturnValue(mockChannelObj);
      const onPoll = jest.fn();
      const unsub = service.subscribeToPollChannel("live-001", onPoll);
      expect(mockChannel).toHaveBeenCalledWith("live-poll:live-001");
      expect(mockChannelObj.on).toHaveBeenCalledWith(
        "broadcast",
        { event: "poll_update" },
        expect.any(Function),
      );
      expect(typeof unsub).toBe("function");
    });
  });
});
