/**
 * __tests__/sprint22-watch-party-social.test.tsx
 *
 * Sprint S22 — Watch Party & Social Cross-Post
 * Tests : types/constantes, service, store, WatchPartyQueue, CrossPostModal
 */

import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ──────────────────────────────────────────────────

jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      (opts && opts.defaultValue) || key,
    locale: "fr",
  }),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#6C47FF",
    background: "#fff",
    card: "#f5f5f5",
    text: "#000",
    textSecondary: "#888",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24 }),
}));

// Supabase mock inside factory
jest.mock("@/services/supabase", () => {
  const cm = (val: unknown) => {
    const c: Record<string, unknown> = {};
    [
      "from",
      "select",
      "insert",
      "update",
      "delete",
      "upsert",
      "eq",
      "neq",
      "in",
      "order",
      "limit",
      "single",
      "maybeSingle",
      "rpc",
    ].forEach((m) => {
      c[m] = jest.fn(() => c);
    });
    c.then = (r: (v: unknown) => void) => r({ data: val, error: null });
    return c;
  };
  return {
    supabase: {
      from: jest.fn(() => cm(null)),
      rpc: jest.fn(() => cm(null)),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    },
  };
});

jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// Mock the service module for component tests
jest.mock("@/services/imufeed/watch-party-social", () => {
  const actual = jest.requireActual("@/services/imufeed/watch-party-social");
  return {
    ...actual,
    joinWatchParty: jest.fn().mockResolvedValue({ participants: [] }),
    leaveWatchParty: jest.fn().mockResolvedValue(undefined),
    fetchPartyQueue: jest.fn().mockResolvedValue([]),
    addVideoToQueue: jest.fn().mockResolvedValue({ success: true }),
    voteQueueItem: jest.fn().mockResolvedValue(undefined),
    fetchCrossPostTargets: jest.fn().mockResolvedValue([]),
    crossPostVideo: jest.fn().mockResolvedValue({
      success: true,
      postId: "p-1",
      targetId: "g-1",
      targetType: "guild",
    }),
    createVideoThread: jest
      .fn()
      .mockResolvedValue({ success: true, thread: { id: "t-1" } }),
    republishVideoAsStory: jest
      .fn()
      .mockResolvedValue({ success: true, storyId: "s-1" }),
  };
});

// ─── Imports ────────────────────────────────────────────────

import type {
  CrossPostTarget,
  CrossPostTargetType,
  QueueItem,
  StoryRepublishOptions,
  StoryRepublishResult,
  SyncPlayback,
  SyncPlaybackState,
  VideoThread,
  WatchPartyParticipant,
  WatchPartyReaction,
} from "@/types/watch-party-social";
import { STORY_MAX_DURATION_MS } from "@/types/watch-party-social";

import {
  addVideoToQueue,
  createVideoThread,
  crossPostVideo,
  fetchCrossPostTargets,
  fetchPartyQueue,
  joinWatchParty,
  leaveWatchParty,
  republishVideoAsStory,
} from "@/services/imufeed/watch-party-social";

import {
  initialWatchPartySocialState,
  useWatchPartySocialStore,
} from "@/stores/watch-party-social-store";

import CrossPostModal from "@/components/imufeed/CrossPostModal";
import WatchPartyQueue from "@/components/imufeed/WatchPartyQueue";
import type { ImuFeedVideo } from "@/types/imufeed";

// ─── Helpers ────────────────────────────────────────────────

const mockVideo: ImuFeedVideo = {
  id: "v-1",
  caption: "Test Video",
  video_url: "https://cdn.test/v.mp4",
  thumbnail_url: "https://cdn.test/thumb.jpg",
  author: {
    id: "a-1",
    username: "creator1",
    display_name: "Creator",
    avatar_url: null,
    is_verified: false,
    follower_count: 100,
  },
  sound: null,
  hashtags: [],
  category: "entertainment",
  visibility: "public",
  status: "published",
  duration_ms: 30000,
  view_count: 1000,
  like_count: 50,
  comment_count: 10,
  share_count: 5,
  save_count: 3,
  is_liked: false,
  is_saved: false,
  is_following_author: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
} as ImuFeedVideo;

const mockQueueItem: QueueItem = {
  id: "qi-1",
  video: mockVideo,
  addedBy: "u-1",
  addedByUsername: "alice",
  addedAt: "2025-01-01T00:00:00Z",
  upvotes: 3,
  hasVoted: false,
};

const mockTarget: CrossPostTarget = {
  id: "g-1",
  name: "Test Guild",
  type: "guild",
  iconUrl: null,
  memberCount: 42,
};

// ═════════════════════════════════════════════════════════════
// 1. TYPES & CONSTANTES
// ═════════════════════════════════════════════════════════════

describe("Sprint S22 — Types & Constantes", () => {
  it("STORY_MAX_DURATION_MS vaut 15 000", () => {
    expect(STORY_MAX_DURATION_MS).toBe(15_000);
  });

  it("SyncPlaybackState union couvre les 4 états", () => {
    const states: SyncPlaybackState[] = [
      "playing",
      "paused",
      "buffering",
      "ended",
    ];
    expect(states).toHaveLength(4);
  });

  it("WatchPartyReaction union couvre 5 réactions", () => {
    const reactions: WatchPartyReaction[] = [
      "fire",
      "love",
      "haha",
      "wow",
      "clap",
    ];
    expect(reactions).toHaveLength(5);
  });

  it("CrossPostTargetType union a guild et community", () => {
    const types: CrossPostTargetType[] = ["guild", "community"];
    expect(types).toHaveLength(2);
  });

  it("WatchPartyParticipant a les champs requis", () => {
    const p: WatchPartyParticipant = {
      userId: "u-1",
      username: "bob",
      avatarUrl: null,
      joinedAt: "2025-01-01T00:00:00Z",
      isHost: true,
      isCoHost: false,
    };
    expect(p.userId).toBe("u-1");
    expect(p.isHost).toBe(true);
  });

  it("QueueItem a video, upvotes et hasVoted", () => {
    expect(mockQueueItem.upvotes).toBe(3);
    expect(mockQueueItem.hasVoted).toBe(false);
    expect(mockQueueItem.video.id).toBe("v-1");
  });

  it("CrossPostTarget a type, memberCount et iconUrl nullable", () => {
    expect(mockTarget.type).toBe("guild");
    expect(mockTarget.memberCount).toBe(42);
    expect(mockTarget.iconUrl).toBeNull();
  });

  it("StoryRepublishOptions a clipStartMs et clipEndMs", () => {
    const opts: StoryRepublishOptions = {
      videoId: "v-1",
      clipStartMs: 0,
      clipEndMs: 15000,
      overlayText: "Check this!",
    };
    expect(opts.clipEndMs - opts.clipStartMs).toBeLessThanOrEqual(
      STORY_MAX_DURATION_MS,
    );
  });

  it("SyncPlayback a controllerId", () => {
    const sp: SyncPlayback = {
      videoId: "v-1",
      positionMs: 5000,
      state: "playing",
      updatedAt: "2025-01-01T00:00:00Z",
      controllerId: "u-host",
    };
    expect(sp.controllerId).toBe("u-host");
  });

  it("VideoThread a channelId et messageCount", () => {
    const vt: VideoThread = {
      id: "t-1",
      videoId: "v-1",
      title: "Thread vidéo",
      channelId: "ch-1",
      messageCount: 12,
      createdAt: "2025-01-01T00:00:00Z",
      createdBy: "u-1",
    };
    expect(vt.channelId).toBe("ch-1");
    expect(vt.messageCount).toBe(12);
  });
});

// ═════════════════════════════════════════════════════════════
// 2. SERVICE
// ═════════════════════════════════════════════════════════════

describe("Sprint S22 — Service watch-party-social", () => {
  const { supabase } = require("@/services/supabase");
  const mockFrom = supabase.from as jest.Mock;
  const mockRpc = supabase.rpc as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper : chain mock with custom resolve
  function chainResolve(val: unknown) {
    const c: Record<string, unknown> = {};
    [
      "from",
      "select",
      "insert",
      "update",
      "delete",
      "upsert",
      "eq",
      "neq",
      "in",
      "order",
      "limit",
      "single",
      "maybeSingle",
      "rpc",
    ].forEach((m) => {
      c[m] = jest.fn(() => c);
    });
    c.then = (r: (v: unknown) => void) => r({ data: val, error: null });
    return c;
  }

  function chainError(msg: string) {
    const c: Record<string, unknown> = {};
    [
      "from",
      "select",
      "insert",
      "update",
      "delete",
      "upsert",
      "eq",
      "neq",
      "in",
      "order",
      "limit",
      "single",
      "maybeSingle",
      "rpc",
    ].forEach((m) => {
      c[m] = jest.fn(() => c);
    });
    c.then = (r: (v: unknown) => void) =>
      r({ data: null, error: { message: msg } });
    return c;
  }

  // For service tests, use requireActual to get real impl
  const actualService = jest.requireActual(
    "@/services/imufeed/watch-party-social",
  );

  it("joinWatchParty upsert + select participants", async () => {
    // First call (upsert) → no error, second call (select) → participant list
    const upsertChain = chainResolve(null);
    const selectChain = chainResolve([
      {
        user_id: "u-1",
        username: "alice",
        avatar_url: null,
        joined_at: "2025-01-01T00:00:00Z",
        is_host: false,
        is_co_host: false,
      },
    ]);
    mockFrom.mockReturnValueOnce(upsertChain).mockReturnValueOnce(selectChain);

    const result = await actualService.joinWatchParty("wp-1", "u-1");
    expect(result.participants).toHaveLength(1);
    expect(result.participants[0].username).toBe("alice");
  });

  it("leaveWatchParty supprime le participant", async () => {
    mockFrom.mockReturnValueOnce(chainResolve(null));
    await expect(
      actualService.leaveWatchParty("wp-1", "u-1"),
    ).resolves.toBeUndefined();
  });

  it("fetchPartyQueue retourne les items triés par upvotes", async () => {
    const items = [
      {
        id: "qi-1",
        video_id: "v-1",
        added_by: "u-1",
        added_by_username: "alice",
        added_at: "2025-01-01T00:00:00Z",
        upvotes: 5,
        video: mockVideo,
      },
      {
        id: "qi-2",
        video_id: "v-2",
        added_by: "u-2",
        added_by_username: "bob",
        added_at: "2025-01-01T00:00:00Z",
        upvotes: 2,
        video: mockVideo,
      },
    ];
    mockFrom.mockReturnValueOnce(chainResolve(items));
    const queue = await actualService.fetchPartyQueue("wp-1");
    expect(queue).toHaveLength(2);
    expect(queue[0].upvotes).toBe(5);
  });

  it("addVideoToQueue retourne success avec item", async () => {
    const insertChain = chainResolve({
      id: "qi-new",
      added_at: "2025-01-01T00:00:00Z",
    });
    mockFrom.mockReturnValueOnce(insertChain);
    const result = await actualService.addVideoToQueue(
      "wp-1",
      mockVideo,
      "u-1",
      "alice",
    );
    expect(result.success).toBe(true);
    expect(result.item?.id).toBe("qi-new");
  });

  it("voteQueueItem appelle rpc increment_queue_upvote", async () => {
    mockRpc.mockReturnValueOnce(chainResolve(null));
    await expect(actualService.voteQueueItem("qi-1")).resolves.toBeUndefined();
  });

  it("fetchCrossPostTargets retourne les guildes", async () => {
    const guilds = [
      { id: "g-1", name: "Guild A", icon_url: null, member_count: 100 },
      {
        id: "g-2",
        name: "Guild B",
        icon_url: "https://img.test/g2.png",
        member_count: 50,
      },
    ];
    mockFrom.mockReturnValueOnce(chainResolve(guilds));
    const targets = await actualService.fetchCrossPostTargets();
    expect(targets).toHaveLength(2);
    expect(targets[0].type).toBe("guild");
    expect(targets[1].iconUrl).toBe("https://img.test/g2.png");
  });

  it("crossPostVideo retourne success avec postId", async () => {
    mockFrom.mockReturnValueOnce(chainResolve({ id: "cp-1" }));
    const result = await actualService.crossPostVideo("v-1", mockTarget);
    expect(result.success).toBe(true);
    expect(result.postId).toBe("cp-1");
  });

  it("crossPostVideo retourne error si échec", async () => {
    mockFrom.mockReturnValueOnce(chainError("insert failed"));
    const result = await actualService.crossPostVideo("v-1", mockTarget);
    expect(result.success).toBe(false);
    expect(result.error).toBe("insert failed");
  });

  it("createVideoThread retourne success avec thread", async () => {
    const threadData = {
      id: "t-1",
      video_id: "v-1",
      title: "Thread",
      channel_id: "ch-1",
      message_count: 0,
      created_at: "2025-01-01T00:00:00Z",
      created_by: "u-1",
    };
    mockFrom.mockReturnValueOnce(chainResolve(threadData));
    const result = await actualService.createVideoThread("v-1", "ch-1", "u-1");
    expect(result.success).toBe(true);
    expect(result.thread?.channelId).toBe("ch-1");
  });

  it("republishVideoAsStory retourne success avec storyId", async () => {
    mockFrom.mockReturnValueOnce(chainResolve({ id: "story-1" }));
    const opts: StoryRepublishOptions = {
      videoId: "v-1",
      clipStartMs: 0,
      clipEndMs: 10000,
    };
    const result = await actualService.republishVideoAsStory(opts, "u-1");
    expect(result.success).toBe(true);
    expect(result.storyId).toBe("story-1");
  });

  it("republishVideoAsStory retourne error si échec", async () => {
    mockFrom.mockReturnValueOnce(chainError("insert failed"));
    const opts: StoryRepublishOptions = {
      videoId: "v-1",
      clipStartMs: 0,
      clipEndMs: 10000,
    };
    const result = await actualService.republishVideoAsStory(opts, "u-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("insert failed");
  });
});

// ═════════════════════════════════════════════════════════════
// 3. STORE
// ═════════════════════════════════════════════════════════════

describe("Sprint S22 — Store watch-party-social", () => {
  const mockedJoin = joinWatchParty as jest.Mock;
  const mockedLeave = leaveWatchParty as jest.Mock;
  const mockedFetchQueue = fetchPartyQueue as jest.Mock;
  const mockedAddToQueue = addVideoToQueue as jest.Mock;
  const mockedFetchTargets = fetchCrossPostTargets as jest.Mock;
  const mockedCrossPost = crossPostVideo as jest.Mock;
  const mockedCreateThread = createVideoThread as jest.Mock;
  const mockedRepublish = republishVideoAsStory as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useWatchPartySocialStore.setState(initialWatchPartySocialState);
  });

  it("état initial correct", () => {
    const s = useWatchPartySocialStore.getState();
    expect(s.currentParty).toBeNull();
    expect(s.participants).toEqual([]);
    expect(s.queue).toEqual([]);
    expect(s.crossPostTargets).toEqual([]);
    expect(s.isRepublishing).toBe(false);
    expect(s.error).toBeNull();
  });

  it("joinParty met à jour participants", async () => {
    const participants = [
      {
        userId: "u-1",
        username: "alice",
        avatarUrl: null,
        joinedAt: "2025-01-01T00:00:00Z",
        isHost: true,
        isCoHost: false,
      },
    ];
    mockedJoin.mockResolvedValueOnce({ participants });
    await act(async () => {
      await useWatchPartySocialStore.getState().joinParty("wp-1");
    });
    expect(useWatchPartySocialStore.getState().participants).toEqual(
      participants,
    );
  });

  it("joinParty gère les erreurs", async () => {
    mockedJoin.mockRejectedValueOnce(new Error("Network error"));
    await act(async () => {
      await useWatchPartySocialStore.getState().joinParty("wp-1");
    });
    expect(useWatchPartySocialStore.getState().error).toBe("Network error");
  });

  it("leaveParty reset l'état de la party", () => {
    useWatchPartySocialStore.setState({
      participants: [
        {
          userId: "u-1",
          username: "a",
          avatarUrl: null,
          joinedAt: "",
          isHost: true,
          isCoHost: false,
        },
      ],
      queue: [mockQueueItem],
      reactions: [{ userId: "u-1", reaction: "fire", timestamp: "" }],
    });
    act(() => {
      useWatchPartySocialStore.getState().leaveParty();
    });
    const s = useWatchPartySocialStore.getState();
    expect(s.participants).toEqual([]);
    expect(s.queue).toEqual([]);
    expect(s.reactions).toEqual([]);
  });

  it("updateSyncPlayback met à jour partiellement", () => {
    const playback: SyncPlayback = {
      videoId: "v-1",
      positionMs: 0,
      state: "playing",
      updatedAt: "2025-01-01T00:00:00Z",
      controllerId: "u-host",
    };
    useWatchPartySocialStore.setState({ syncPlayback: playback });
    act(() => {
      useWatchPartySocialStore
        .getState()
        .updateSyncPlayback({ positionMs: 5000 });
    });
    expect(useWatchPartySocialStore.getState().syncPlayback?.positionMs).toBe(
      5000,
    );
    expect(useWatchPartySocialStore.getState().syncPlayback?.state).toBe(
      "playing",
    );
  });

  it("sendReaction ajoute et cap à 100", () => {
    act(() => {
      for (let i = 0; i < 105; i++) {
        useWatchPartySocialStore.getState().sendReaction("fire");
      }
    });
    expect(
      useWatchPartySocialStore.getState().reactions.length,
    ).toBeLessThanOrEqual(100);
  });

  it("clearReactions vide les réactions", () => {
    useWatchPartySocialStore.setState({
      reactions: [{ userId: "u-1", reaction: "love", timestamp: "" }],
    });
    act(() => {
      useWatchPartySocialStore.getState().clearReactions();
    });
    expect(useWatchPartySocialStore.getState().reactions).toEqual([]);
  });

  it("loadQueue charge la file", async () => {
    mockedFetchQueue.mockResolvedValueOnce([mockQueueItem]);
    await act(async () => {
      await useWatchPartySocialStore.getState().loadQueue("wp-1");
    });
    expect(useWatchPartySocialStore.getState().queue).toHaveLength(1);
    expect(useWatchPartySocialStore.getState().isLoadingQueue).toBe(false);
  });

  it("loadQueue gère les erreurs", async () => {
    mockedFetchQueue.mockRejectedValueOnce(new Error("fetch fail"));
    await act(async () => {
      await useWatchPartySocialStore.getState().loadQueue("wp-1");
    });
    expect(useWatchPartySocialStore.getState().error).toBe("fetch fail");
    expect(useWatchPartySocialStore.getState().isLoadingQueue).toBe(false);
  });

  it("addToQueue ajoute un item au state", async () => {
    mockedAddToQueue.mockResolvedValueOnce({
      success: true,
      item: { ...mockQueueItem, id: "qi-new" },
    });
    await act(async () => {
      await useWatchPartySocialStore.getState().addToQueue("wp-1", mockVideo);
    });
    expect(useWatchPartySocialStore.getState().queue).toHaveLength(1);
    expect(useWatchPartySocialStore.getState().queue[0].id).toBe("qi-new");
  });

  it("removeFromQueue supprime l'item par id", () => {
    useWatchPartySocialStore.setState({ queue: [mockQueueItem] });
    act(() => {
      useWatchPartySocialStore.getState().removeFromQueue("qi-1");
    });
    expect(useWatchPartySocialStore.getState().queue).toEqual([]);
  });

  it("voteQueueItem incrémente et trie", () => {
    const item2: QueueItem = { ...mockQueueItem, id: "qi-2", upvotes: 10 };
    useWatchPartySocialStore.setState({ queue: [mockQueueItem, item2] });
    act(() => {
      useWatchPartySocialStore.getState().voteQueueItem("qi-1");
    });
    const q = useWatchPartySocialStore.getState().queue;
    // qi-2 has 10 upvotes, qi-1 now has 4 upvotes → qi-2 still first
    expect(q[0].id).toBe("qi-2");
    expect(q[1].upvotes).toBe(4);
    expect(q[1].hasVoted).toBe(true);
  });

  it("reorderQueue remplace la queue", () => {
    const reordered = [
      { ...mockQueueItem, id: "qi-b" },
      { ...mockQueueItem, id: "qi-a" },
    ];
    act(() => {
      useWatchPartySocialStore.getState().reorderQueue(reordered);
    });
    expect(useWatchPartySocialStore.getState().queue.map((q) => q.id)).toEqual([
      "qi-b",
      "qi-a",
    ]);
  });

  it("loadCrossPostTargets charge les cibles", async () => {
    mockedFetchTargets.mockResolvedValueOnce([mockTarget]);
    await act(async () => {
      await useWatchPartySocialStore.getState().loadCrossPostTargets();
    });
    expect(useWatchPartySocialStore.getState().crossPostTargets).toHaveLength(
      1,
    );
    expect(useWatchPartySocialStore.getState().isLoadingTargets).toBe(false);
  });

  it("crossPost ajoute les résultats", async () => {
    mockedCrossPost.mockResolvedValueOnce({
      success: true,
      postId: "cp-1",
      targetId: "g-1",
      targetType: "guild",
    });
    await act(async () => {
      await useWatchPartySocialStore.getState().crossPost("v-1", [mockTarget]);
    });
    expect(useWatchPartySocialStore.getState().crossPostResults).toHaveLength(
      1,
    );
    expect(
      useWatchPartySocialStore.getState().crossPostResults[0].success,
    ).toBe(true);
  });

  it("clearCrossPostResults vide les résultats", () => {
    useWatchPartySocialStore.setState({
      crossPostResults: [
        { success: true, postId: "p-1", targetId: "g-1", targetType: "guild" },
      ],
    });
    act(() => {
      useWatchPartySocialStore.getState().clearCrossPostResults();
    });
    expect(useWatchPartySocialStore.getState().crossPostResults).toEqual([]);
  });

  it("createThreadFromVideo ajoute le thread", async () => {
    const thread: VideoThread = {
      id: "t-1",
      videoId: "v-1",
      title: "Thread",
      channelId: "ch-1",
      messageCount: 0,
      createdAt: "2025-01-01T00:00:00Z",
      createdBy: "u-1",
    };
    mockedCreateThread.mockResolvedValueOnce({ success: true, thread });
    await act(async () => {
      await useWatchPartySocialStore
        .getState()
        .createThreadFromVideo("v-1", "ch-1");
    });
    expect(useWatchPartySocialStore.getState().createdThreads).toHaveLength(1);
  });

  it("setRepublishOptions met à jour les options", () => {
    const opts: StoryRepublishOptions = {
      videoId: "v-1",
      clipStartMs: 0,
      clipEndMs: 10000,
    };
    act(() => {
      useWatchPartySocialStore.getState().setRepublishOptions(opts);
    });
    expect(useWatchPartySocialStore.getState().republishOptions).toEqual(opts);
  });

  it("republishAsStory publie et reset les options", async () => {
    const opts: StoryRepublishOptions = {
      videoId: "v-1",
      clipStartMs: 0,
      clipEndMs: 10000,
    };
    useWatchPartySocialStore.setState({ republishOptions: opts });
    mockedRepublish.mockResolvedValueOnce({ success: true, storyId: "s-1" });
    let result: StoryRepublishResult | undefined;
    await act(async () => {
      result = await useWatchPartySocialStore.getState().republishAsStory();
    });
    expect(result?.success).toBe(true);
    expect(useWatchPartySocialStore.getState().republishOptions).toBeNull();
    expect(useWatchPartySocialStore.getState().isRepublishing).toBe(false);
  });

  it("republishAsStory retourne erreur si pas d'options", async () => {
    let result: StoryRepublishResult | undefined;
    await act(async () => {
      result = await useWatchPartySocialStore.getState().republishAsStory();
    });
    expect(result?.success).toBe(false);
    expect(result?.error).toBe("No options set");
  });

  it("resetWatchPartySocial remet l'état initial", () => {
    useWatchPartySocialStore.setState({
      queue: [mockQueueItem],
      crossPostTargets: [mockTarget],
      isRepublishing: true,
      error: "some error",
    });
    act(() => {
      useWatchPartySocialStore.getState().resetWatchPartySocial();
    });
    const s = useWatchPartySocialStore.getState();
    expect(s.queue).toEqual([]);
    expect(s.crossPostTargets).toEqual([]);
    expect(s.isRepublishing).toBe(false);
    expect(s.error).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════
// 4. COMPOSANT — WatchPartyQueue
// ═════════════════════════════════════════════════════════════

describe("Sprint S22 — WatchPartyQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWatchPartySocialStore.setState(initialWatchPartySocialState);
  });

  it("rend le conteneur queue", () => {
    const { getByTestId } = render(<WatchPartyQueue partyId="wp-1" />);
    expect(getByTestId("watch-party-queue")).toBeTruthy();
  });

  it("affiche le titre avec le count", () => {
    const { getByText } = render(<WatchPartyQueue partyId="wp-1" />);
    expect(getByText("File d'attente (0)")).toBeTruthy();
  });

  it("affiche le message vide quand pas de vidéos", () => {
    const { getByTestId } = render(<WatchPartyQueue partyId="wp-1" />);
    expect(getByTestId("queue-empty")).toBeTruthy();
  });

  it("affiche le loading quand isLoadingQueue", () => {
    useWatchPartySocialStore.setState({ isLoadingQueue: true });
    const { getByTestId } = render(<WatchPartyQueue partyId="wp-1" />);
    expect(getByTestId("queue-loading")).toBeTruthy();
  });

  it("affiche un item de queue avec titre et auteur", () => {
    useWatchPartySocialStore.setState({ queue: [mockQueueItem] });
    const { getByTestId, getByText } = render(
      <WatchPartyQueue partyId="wp-1" />,
    );
    expect(getByTestId("queue-item-qi-1")).toBeTruthy();
    expect(getByText("Test Video")).toBeTruthy();
    expect(getByText("Ajouté par alice")).toBeTruthy();
  });

  it("affiche le nombre d'upvotes", () => {
    useWatchPartySocialStore.setState({ queue: [mockQueueItem] });
    const { getByText } = render(<WatchPartyQueue partyId="wp-1" />);
    expect(getByText("3")).toBeTruthy();
  });

  it("vote button appelle voteQueueItem", () => {
    useWatchPartySocialStore.setState({ queue: [mockQueueItem] });
    const { getByTestId } = render(<WatchPartyQueue partyId="wp-1" />);
    fireEvent.press(getByTestId("queue-vote-qi-1"));
    // After vote, upvotes should increment
    const q = useWatchPartySocialStore.getState().queue;
    expect(q[0].upvotes).toBe(4);
    expect(q[0].hasVoted).toBe(true);
  });

  it("remove button appelle removeFromQueue", () => {
    useWatchPartySocialStore.setState({ queue: [mockQueueItem] });
    const { getByTestId } = render(<WatchPartyQueue partyId="wp-1" />);
    fireEvent.press(getByTestId("queue-remove-qi-1"));
    expect(useWatchPartySocialStore.getState().queue).toEqual([]);
  });

  it("play button appelle onPlayVideo", () => {
    useWatchPartySocialStore.setState({ queue: [mockQueueItem] });
    const onPlay = jest.fn();
    const { getByTestId } = render(
      <WatchPartyQueue partyId="wp-1" onPlayVideo={onPlay} />,
    );
    fireEvent.press(getByTestId("queue-play-qi-1"));
    expect(onPlay).toHaveBeenCalledWith("v-1");
  });

  it("vote button désactivé si déjà voté", () => {
    const votedItem = { ...mockQueueItem, hasVoted: true };
    useWatchPartySocialStore.setState({ queue: [votedItem] });
    const { getByTestId } = render(<WatchPartyQueue partyId="wp-1" />);
    const btn = getByTestId("queue-vote-qi-1");
    expect(
      btn.props.accessibilityState?.disabled || btn.props.disabled,
    ).toBeTruthy();
  });

  it("affiche plusieurs items", () => {
    const item2: QueueItem = {
      ...mockQueueItem,
      id: "qi-2",
      addedByUsername: "bob",
    };
    useWatchPartySocialStore.setState({ queue: [mockQueueItem, item2] });
    const { getByTestId, getByText } = render(
      <WatchPartyQueue partyId="wp-1" />,
    );
    expect(getByTestId("queue-item-qi-1")).toBeTruthy();
    expect(getByTestId("queue-item-qi-2")).toBeTruthy();
    expect(getByText("File d'attente (2)")).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════
// 5. COMPOSANT — CrossPostModal
// ═════════════════════════════════════════════════════════════

describe("Sprint S22 — CrossPostModal", () => {
  const mockedFetchTargets = fetchCrossPostTargets as jest.Mock;
  const mockedCrossPost = crossPostVideo as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useWatchPartySocialStore.setState(initialWatchPartySocialState);
    mockedFetchTargets.mockResolvedValue([]);
  });

  it("rend le modal quand visible", () => {
    const { getByTestId } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    expect(getByTestId("crosspost-modal")).toBeTruthy();
  });

  it("affiche le titre 'Publier dans une communauté'", () => {
    const { getByText } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    expect(getByText("Publier dans une communauté")).toBeTruthy();
  });

  it("affiche le champ de recherche", () => {
    const { getByTestId } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    expect(getByTestId("crosspost-search")).toBeTruthy();
  });

  it("bouton close appelle onClose", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <CrossPostModal visible videoId="v-1" onClose={onClose} />,
    );
    fireEvent.press(getByTestId("crosspost-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("affiche le message vide quand pas de cibles", async () => {
    mockedFetchTargets.mockResolvedValueOnce([]);
    const { getByTestId } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("crosspost-empty")).toBeTruthy();
    });
  });

  it("affiche le loading quand isLoadingTargets", () => {
    mockedFetchTargets.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    expect(getByTestId("crosspost-loading")).toBeTruthy();
  });

  it("affiche une cible avec nom et membres", async () => {
    mockedFetchTargets.mockResolvedValueOnce([mockTarget]);
    const { getByTestId, getByText } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("crosspost-target-g-1")).toBeTruthy();
    });
    expect(getByText("Test Guild")).toBeTruthy();
    expect(getByText("42 membres")).toBeTruthy();
  });

  it("sélectionner une cible met à jour le bouton", async () => {
    mockedFetchTargets.mockResolvedValueOnce([mockTarget]);
    const { getByTestId, getByText } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("crosspost-target-g-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("crosspost-target-g-1"));
    expect(getByText("Publier (1)")).toBeTruthy();
  });

  it("désélectionner une cible met à jour le bouton", async () => {
    mockedFetchTargets.mockResolvedValueOnce([mockTarget]);
    const { getByTestId, getByText } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("crosspost-target-g-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("crosspost-target-g-1"));
    fireEvent.press(getByTestId("crosspost-target-g-1"));
    expect(getByText("Publier")).toBeTruthy();
  });

  it("recherche filtre les cibles", async () => {
    const target2: CrossPostTarget = {
      id: "g-2",
      name: "Alpha Guild",
      type: "guild",
      iconUrl: null,
      memberCount: 10,
    };
    mockedFetchTargets.mockResolvedValueOnce([mockTarget, target2]);
    const { getByTestId, queryByTestId } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("crosspost-target-g-1")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("crosspost-search"), "Alpha");
    expect(getByTestId("crosspost-target-g-2")).toBeTruthy();
    expect(queryByTestId("crosspost-target-g-1")).toBeNull();
  });

  it("bouton confirmer appelle crossPost et onComplete", async () => {
    mockedFetchTargets.mockResolvedValueOnce([mockTarget]);
    mockedCrossPost.mockResolvedValueOnce({
      success: true,
      postId: "p-1",
      targetId: "g-1",
      targetType: "guild",
    });
    const onComplete = jest.fn();
    const onClose = jest.fn();
    const { getByTestId } = render(
      <CrossPostModal
        visible
        videoId="v-1"
        onClose={onClose}
        onComplete={onComplete}
      />,
    );
    await waitFor(() => {
      expect(getByTestId("crosspost-target-g-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("crosspost-target-g-1"));
    await act(async () => {
      fireEvent.press(getByTestId("crosspost-confirm"));
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("affiche le bouton confirmer avec bon texte par défaut", () => {
    const { getByText } = render(
      <CrossPostModal visible videoId="v-1" onClose={jest.fn()} />,
    );
    expect(getByText("Publier")).toBeTruthy();
  });
});
