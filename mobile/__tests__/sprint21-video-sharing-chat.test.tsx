/**
 * __tests__/sprint21-video-sharing-chat.test.tsx
 *
 * Sprint S21 — Partage DM & Chat
 * Tests : types, service, store, VideoCard, ShareVideoModal
 */

import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ──────────────────────────────────────────────────

// I18n
jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      (opts && opts.defaultValue) || key,
    locale: "fr",
  }),
}));

// Supabase chain mock helper (no external deps — safe outside factory)
function chainMock(resolveValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "from",
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "in",
    "order",
    "limit",
    "single",
    "maybeSingle",
    "rpc",
  ];
  methods.forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.then = (resolve: (v: unknown) => void) =>
    resolve({ data: resolveValue, error: null });
  return chain;
}

function errorChainMock(errorMessage: string) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "from",
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "in",
    "order",
    "limit",
    "single",
    "maybeSingle",
    "rpc",
  ];
  methods.forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.then = (resolve: (v: unknown) => void) =>
    resolve({ data: null, error: { message: errorMessage } });
  return chain;
}

// Supabase mock — defined INSIDE factory to avoid hoisting issues
jest.mock("@/services/supabase", () => {
  const cm = (val: unknown) => {
    const c: Record<string, unknown> = {};
    [
      "from",
      "select",
      "insert",
      "update",
      "delete",
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

jest.mock("@/services/imufeed/video-sharing", () => {
  const actual = jest.requireActual("@/services/imufeed/video-sharing");
  return {
    ...actual,
    fetchShareTargets: jest.fn().mockResolvedValue([]),
    shareVideoToMultiple: jest.fn().mockResolvedValue([]),
  };
});

// ─── Imports ────────────────────────────────────────────────

import type {
  InlinePreviewConfig,
  InlinePreviewState,
  ShareResult,
  ShareStatus,
  ShareTarget,
  ShareTargetType,
  VideoCardData,
  VideoReplyData,
} from "@/types/video-sharing";
import {
  DEFAULT_INLINE_PREVIEW_CONFIG,
  VIDEO_REPLY_MAX_DURATION_MS,
} from "@/types/video-sharing";

import {
  fetchShareTargets,
  fetchVideoCardData,
  shareVideoToConversation,
  shareVideoToMultiple,
} from "@/services/imufeed/video-sharing";

import { supabase } from "@/services/supabase";
const mockSupabase = supabase as unknown as {
  from: jest.Mock;
  rpc: jest.Mock;
  auth: { getUser: jest.Mock };
};

import {
  initialVideoSharingState,
  useVideoSharingStore,
} from "@/stores/video-sharing-store";

import ShareVideoModal from "@/components/imufeed/ShareVideoModal";
import VideoCard from "@/components/imufeed/VideoCard";

// ─── Helpers ────────────────────────────────────────────────

const sampleVideo: VideoCardData = {
  videoId: "v-1",
  videoUrl: "https://cdn.test/v1.mp4",
  thumbnailUrl: "https://cdn.test/v1-thumb.jpg",
  caption: "Mon super clip",
  author: {
    username: "alice",
    displayName: "Alice W",
    avatarUrl: "https://cdn.test/alice.jpg",
  },
  durationMs: 65000,
  viewsCount: 12400,
  likesCount: 890,
  commentsCount: 42,
};

const sampleTargets: ShareTarget[] = [
  {
    conversationId: "conv-1",
    type: "dm",
    displayName: "Bob",
    avatarUrl: null,
  },
  {
    conversationId: "conv-2",
    type: "group",
    displayName: "Groupe Fun",
    avatarUrl: null,
  },
  {
    conversationId: "conv-3",
    type: "dm",
    displayName: "Charlie",
    avatarUrl: null,
  },
];

function resetStore() {
  useVideoSharingStore.setState(initialVideoSharingState);
}

// =============================================================
// 1. Types & Constantes
// =============================================================
describe("S21 — Types & Constantes", () => {
  it("DEFAULT_INLINE_PREVIEW_CONFIG a les bons défauts", () => {
    expect(DEFAULT_INLINE_PREVIEW_CONFIG).toEqual({
      enabled: true,
      autoplay: true,
      defaultMuted: true,
      maxPreviewDurationMs: 0,
    });
  });

  it("VIDEO_REPLY_MAX_DURATION_MS = 8000", () => {
    expect(VIDEO_REPLY_MAX_DURATION_MS).toBe(8000);
  });

  it("VideoCardData est structuré correctement", () => {
    const v: VideoCardData = sampleVideo;
    expect(v.videoId).toBe("v-1");
    expect(v.author.username).toBe("alice");
    expect(v.durationMs).toBe(65000);
  });

  it("ShareTarget types acceptent dm|group|guild", () => {
    const types: ShareTargetType[] = ["dm", "group", "guild"];
    types.forEach((t) => expect(typeof t).toBe("string"));
  });

  it("ShareStatus types", () => {
    const statuses: ShareStatus[] = [
      "idle",
      "selecting",
      "sharing",
      "success",
      "error",
    ];
    expect(statuses).toHaveLength(5);
  });

  it("ShareResult a success, messageId, error", () => {
    const r: ShareResult = { success: true, messageId: "m-1", error: null };
    expect(r.success).toBe(true);
    expect(r.messageId).toBe("m-1");
    expect(r.error).toBeNull();
  });

  it("VideoReplyData structure", () => {
    const reply: VideoReplyData = {
      videoId: "v-r1",
      videoUrl: "https://cdn.test/reply.mp4",
      thumbnailUrl: null,
      durationMs: 5000,
      replyToMessageId: "msg-1",
    };
    expect(reply.durationMs).toBeLessThanOrEqual(VIDEO_REPLY_MAX_DURATION_MS);
  });

  it("InlinePreviewState structure", () => {
    const state: InlinePreviewState = {
      messageId: null,
      videoId: null,
      isPlaying: false,
      isMuted: true,
      positionMs: 0,
    };
    expect(state.isMuted).toBe(true);
  });

  it("InlinePreviewConfig structure", () => {
    const cfg: InlinePreviewConfig = {
      enabled: false,
      autoplay: false,
      defaultMuted: false,
      maxPreviewDurationMs: 30000,
    };
    expect(cfg.maxPreviewDurationMs).toBe(30000);
  });
});

// =============================================================
// 2. Service video-sharing
// =============================================================
describe("S21 — Service video-sharing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  describe("fetchVideoCardData", () => {
    it("retourne VideoCardData quand la vidéo existe", async () => {
      const dbRow = {
        id: "v-1",
        video_url: "https://cdn.test/v.mp4",
        thumbnail_url: "https://cdn.test/t.jpg",
        caption: "Hello",
        duration_ms: 10000,
        views_count: 100,
        likes_count: 10,
        comments_count: 2,
        profiles: {
          username: "bob",
          display_name: "Bob D",
          avatar_url: null,
        },
      };
      mockSupabase.from.mockReturnValueOnce(chainMock(dbRow));

      // fetchVideoCardData is the actual implementation (spread from actual)
      const result = await fetchVideoCardData("v-1");

      expect(result).toEqual({
        videoId: "v-1",
        videoUrl: "https://cdn.test/v.mp4",
        thumbnailUrl: "https://cdn.test/t.jpg",
        caption: "Hello",
        author: {
          username: "bob",
          displayName: "Bob D",
          avatarUrl: null,
        },
        durationMs: 10000,
        viewsCount: 100,
        likesCount: 10,
        commentsCount: 2,
      });
    });

    it("retourne null quand la vidéo n'existe pas", async () => {
      mockSupabase.from.mockReturnValueOnce(chainMock(null));
      const result = await fetchVideoCardData("unknown");
      expect(result).toBeNull();
    });

    it("retourne null en cas d'erreur supabase", async () => {
      mockSupabase.from.mockReturnValueOnce(errorChainMock("DB down"));
      const result = await fetchVideoCardData("v-err");
      expect(result).toBeNull();
    });
  });

  describe("fetchShareTargets", () => {
    it("retourne un tableau de ShareTarget", async () => {
      const conversations = [
        {
          id: "c-1",
          is_group: false,
          group_name: null,
          participants: [
            {
              user_id: "user-1",
              profile: { username: "me", avatar_url: null },
            },
            {
              user_id: "user-2",
              profile: { username: "bob", avatar_url: "av2" },
            },
          ],
        },
        {
          id: "c-2",
          is_group: true,
          group_name: "Team",
          participants: [],
        },
      ];
      mockSupabase.from.mockReturnValueOnce(chainMock(conversations));

      const actual = jest.requireActual<
        typeof import("@/services/imufeed/video-sharing")
      >("@/services/imufeed/video-sharing");
      const result = await actual.fetchShareTargets();

      expect(result).toHaveLength(2);
      expect(result[0].conversationId).toBe("c-1");
      expect(result[0].type).toBe("dm");
      expect(result[0].displayName).toBe("bob");
      expect(result[1].type).toBe("group");
      expect(result[1].displayName).toBe("Team");
    });

    it("retourne tableau vide si auth échoue", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: "Not logged in" },
      });

      const actual = jest.requireActual<
        typeof import("@/services/imufeed/video-sharing")
      >("@/services/imufeed/video-sharing");
      const result = await actual.fetchShareTargets();

      expect(result).toEqual([]);
    });
  });

  describe("shareVideoToConversation", () => {
    it("insère un message video_card et incrémente les shares", async () => {
      mockSupabase.from.mockReturnValueOnce(chainMock({ id: "msg-new" }));
      mockSupabase.rpc.mockReturnValueOnce(chainMock(null));

      const result = await shareVideoToConversation(sampleVideo, "conv-1");

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-new");
    });

    it("retourne erreur si l'insertion échoue", async () => {
      mockSupabase.from.mockReturnValueOnce(errorChainMock("Insert failed"));

      const result = await shareVideoToConversation(sampleVideo, "conv-bad");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Insert failed");
    });
  });

  describe("shareVideoToMultiple", () => {
    it("partage séquentiellement à plusieurs cibles", async () => {
      mockSupabase.from
        .mockReturnValueOnce(chainMock({ id: "msg-1" }))
        .mockReturnValueOnce(chainMock({ id: "msg-2" }));
      mockSupabase.rpc
        .mockReturnValueOnce(chainMock(null))
        .mockReturnValueOnce(chainMock(null));

      const targets: ShareTarget[] = [
        {
          conversationId: "c-1",
          type: "dm",
          displayName: "A",
          avatarUrl: null,
        },
        {
          conversationId: "c-2",
          type: "group",
          displayName: "B",
          avatarUrl: null,
        },
      ];

      const actual = jest.requireActual<
        typeof import("@/services/imufeed/video-sharing")
      >("@/services/imufeed/video-sharing");
      const results = await actual.shareVideoToMultiple(sampleVideo, targets);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
  });
});

// =============================================================
// 3. Store video-sharing
// =============================================================
describe("S21 — Store video-sharing", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  it("état initial correct", () => {
    const s = useVideoSharingStore.getState();
    expect(s.shareStatus).toBe("idle");
    expect(s.selectedTargets).toEqual([]);
    expect(s.videoToShare).toBeNull();
    expect(s.inlinePreview.messageId).toBeNull();
    expect(s.recentShares).toEqual([]);
  });

  describe("Flow de partage", () => {
    it("startShare -> selecting + vidéo stockée", () => {
      useVideoSharingStore.getState().startShare(sampleVideo);
      const s = useVideoSharingStore.getState();
      expect(s.shareStatus).toBe("selecting");
      expect(s.videoToShare).toEqual(sampleVideo);
      expect(s.selectedTargets).toEqual([]);
    });

    it("cancelShare -> idle + reset", () => {
      useVideoSharingStore.getState().startShare(sampleVideo);
      useVideoSharingStore.getState().cancelShare();
      const s = useVideoSharingStore.getState();
      expect(s.shareStatus).toBe("idle");
      expect(s.videoToShare).toBeNull();
    });

    it("toggleTarget ajoute puis retire", () => {
      const target = sampleTargets[0];
      const store = useVideoSharingStore.getState();
      store.toggleTarget(target);
      expect(useVideoSharingStore.getState().selectedTargets).toHaveLength(1);
      useVideoSharingStore.getState().toggleTarget(target);
      expect(useVideoSharingStore.getState().selectedTargets).toHaveLength(0);
    });

    it("toggleTarget multi-sélection", () => {
      const store = useVideoSharingStore.getState();
      store.toggleTarget(sampleTargets[0]);
      store.toggleTarget(sampleTargets[1]);
      expect(useVideoSharingStore.getState().selectedTargets).toHaveLength(2);
    });

    it("clearTargets vide la sélection", () => {
      const store = useVideoSharingStore.getState();
      store.toggleTarget(sampleTargets[0]);
      store.toggleTarget(sampleTargets[1]);
      store.clearTargets();
      expect(useVideoSharingStore.getState().selectedTargets).toEqual([]);
    });

    it("confirmShare retourne erreur si rien à partager", async () => {
      const results = await useVideoSharingStore.getState().confirmShare();
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe("Nothing to share");
    });

    it("confirmShare réussit et met à jour recentShares", async () => {
      (shareVideoToMultiple as jest.Mock).mockResolvedValueOnce([
        { success: true, messageId: "m-1", error: null },
      ]);

      const store = useVideoSharingStore.getState();
      store.startShare(sampleVideo);
      store.toggleTarget(sampleTargets[0]);

      const results = await useVideoSharingStore.getState().confirmShare();
      expect(results[0].success).toBe(true);

      const s = useVideoSharingStore.getState();
      expect(s.shareStatus).toBe("success");
      expect(s.recentShares).toHaveLength(1);
      expect(s.recentShares[0].videoId).toBe("v-1");
      expect(s.videoToShare).toBeNull();
      expect(s.selectedTargets).toEqual([]);
    });

    it("confirmShare passe en error si un échec", async () => {
      (shareVideoToMultiple as jest.Mock).mockResolvedValueOnce([
        { success: false, messageId: null, error: "fail" },
      ]);

      const store = useVideoSharingStore.getState();
      store.startShare(sampleVideo);
      store.toggleTarget(sampleTargets[0]);

      await useVideoSharingStore.getState().confirmShare();
      expect(useVideoSharingStore.getState().shareStatus).toBe("error");
    });

    it("confirmShare gère une exception", async () => {
      (shareVideoToMultiple as jest.Mock).mockRejectedValueOnce(
        new Error("Network"),
      );

      const store = useVideoSharingStore.getState();
      store.startShare(sampleVideo);
      store.toggleTarget(sampleTargets[0]);

      const results = await useVideoSharingStore.getState().confirmShare();
      expect(results[0].success).toBe(false);
      expect(useVideoSharingStore.getState().shareStatus).toBe("error");
    });

    it("confirmShare tronque recentShares à 50", async () => {
      // Pré-remplir 49 entrées
      const existing = Array.from({ length: 49 }, (_, i) => ({
        videoId: `old-${i}`,
        conversationId: `c-${i}`,
        sharedAt: Date.now() - i * 1000,
      }));
      useVideoSharingStore.setState({ recentShares: existing });

      (shareVideoToMultiple as jest.Mock).mockResolvedValueOnce([
        { success: true, messageId: "m-new-1", error: null },
        { success: true, messageId: "m-new-2", error: null },
      ]);

      const store = useVideoSharingStore.getState();
      store.startShare(sampleVideo);
      store.toggleTarget(sampleTargets[0]);
      store.toggleTarget(sampleTargets[1]);

      await useVideoSharingStore.getState().confirmShare();
      expect(
        useVideoSharingStore.getState().recentShares.length,
      ).toBeLessThanOrEqual(50);
    });
  });

  describe("Inline preview", () => {
    it("setInlinePreview configure l'état", () => {
      useVideoSharingStore.getState().setInlinePreview("msg-1", "v-1");
      const s = useVideoSharingStore.getState().inlinePreview;
      expect(s.messageId).toBe("msg-1");
      expect(s.videoId).toBe("v-1");
      expect(s.isPlaying).toBe(true); // autoplay=true par défaut
      expect(s.isMuted).toBe(true); // defaultMuted=true
      expect(s.positionMs).toBe(0);
    });

    it("setInlinePreview respecte config.autoplay=false", () => {
      useVideoSharingStore
        .getState()
        .updateInlinePreviewConfig({ autoplay: false });
      useVideoSharingStore.getState().setInlinePreview("msg-2", "v-2");
      expect(useVideoSharingStore.getState().inlinePreview.isPlaying).toBe(
        false,
      );
    });

    it("playInlinePreview met isPlaying à true", () => {
      useVideoSharingStore.getState().setInlinePreview("msg-1", "v-1");
      useVideoSharingStore.getState().pauseInlinePreview();
      useVideoSharingStore.getState().playInlinePreview();
      expect(useVideoSharingStore.getState().inlinePreview.isPlaying).toBe(
        true,
      );
    });

    it("pauseInlinePreview met isPlaying à false", () => {
      useVideoSharingStore.getState().setInlinePreview("msg-1", "v-1");
      useVideoSharingStore.getState().pauseInlinePreview();
      expect(useVideoSharingStore.getState().inlinePreview.isPlaying).toBe(
        false,
      );
    });

    it("toggleInlinePreviewMute bascule isMuted", () => {
      useVideoSharingStore.getState().setInlinePreview("msg-1", "v-1");
      expect(useVideoSharingStore.getState().inlinePreview.isMuted).toBe(true);
      useVideoSharingStore.getState().toggleInlinePreviewMute();
      expect(useVideoSharingStore.getState().inlinePreview.isMuted).toBe(false);
      useVideoSharingStore.getState().toggleInlinePreviewMute();
      expect(useVideoSharingStore.getState().inlinePreview.isMuted).toBe(true);
    });

    it("updateInlinePreviewPosition met à jour positionMs", () => {
      useVideoSharingStore.getState().setInlinePreview("msg-1", "v-1");
      useVideoSharingStore.getState().updateInlinePreviewPosition(5000);
      expect(useVideoSharingStore.getState().inlinePreview.positionMs).toBe(
        5000,
      );
    });

    it("closeInlinePreview reset l'état", () => {
      useVideoSharingStore.getState().setInlinePreview("msg-1", "v-1");
      useVideoSharingStore.getState().closeInlinePreview();
      const s = useVideoSharingStore.getState().inlinePreview;
      expect(s.messageId).toBeNull();
      expect(s.videoId).toBeNull();
      expect(s.isPlaying).toBe(false);
    });
  });

  describe("Config", () => {
    it("updateInlinePreviewConfig merge partiel", () => {
      useVideoSharingStore
        .getState()
        .updateInlinePreviewConfig({
          defaultMuted: false,
          maxPreviewDurationMs: 15000,
        });
      const cfg = useVideoSharingStore.getState().inlinePreviewConfig;
      expect(cfg.defaultMuted).toBe(false);
      expect(cfg.maxPreviewDurationMs).toBe(15000);
      expect(cfg.enabled).toBe(true); // inchangé
      expect(cfg.autoplay).toBe(true); // inchangé
    });
  });

  describe("resetVideoSharing", () => {
    it("remet tout à l'état initial", () => {
      const store = useVideoSharingStore.getState();
      store.startShare(sampleVideo);
      store.toggleTarget(sampleTargets[0]);
      store.setInlinePreview("m", "v");
      store.updateInlinePreviewConfig({ autoplay: false });

      useVideoSharingStore.getState().resetVideoSharing();
      const s = useVideoSharingStore.getState();
      expect(s.shareStatus).toBe("idle");
      expect(s.selectedTargets).toEqual([]);
      expect(s.videoToShare).toBeNull();
      expect(s.inlinePreview.messageId).toBeNull();
      expect(s.inlinePreviewConfig).toEqual(DEFAULT_INLINE_PREVIEW_CONFIG);
    });
  });
});

// =============================================================
// 4. Composant VideoCard
// =============================================================
describe("S21 — VideoCard", () => {
  it("affiche le thumbnail", () => {
    const { getByTestId } = render(<VideoCard data={sampleVideo} />);
    expect(getByTestId("video-card-thumbnail")).toBeTruthy();
  });

  it("affiche le conteneur principal", () => {
    const { getByTestId } = render(<VideoCard data={sampleVideo} />);
    expect(getByTestId("video-card")).toBeTruthy();
  });

  it("affiche le nom de l'auteur", () => {
    const { getByTestId, getByText } = render(<VideoCard data={sampleVideo} />);
    expect(getByTestId("video-card-author")).toBeTruthy();
    expect(getByText("Alice W")).toBeTruthy();
  });

  it("affiche le caption", () => {
    const { getByTestId } = render(<VideoCard data={sampleVideo} />);
    expect(getByTestId("video-card-caption")).toBeTruthy();
  });

  it("masque le caption s'il est vide", () => {
    const noCaption = { ...sampleVideo, caption: "" };
    const { queryByTestId } = render(<VideoCard data={noCaption} />);
    expect(queryByTestId("video-card-caption")).toBeNull();
  });

  it("affiche la durée formatée", () => {
    const { getByText } = render(<VideoCard data={sampleVideo} />);
    expect(getByText("1:05")).toBeTruthy(); // 65000ms
  });

  it("affiche les compteurs formatés", () => {
    const { getByText } = render(<VideoCard data={sampleVideo} />);
    expect(getByText("12.4K")).toBeTruthy(); // viewsCount
    expect(getByText("890")).toBeTruthy(); // likesCount
    expect(getByText("42")).toBeTruthy(); // commentsCount
  });

  it("affiche le bouton 'Voir sur ImuFeed'", () => {
    const { getByTestId, getByText } = render(<VideoCard data={sampleVideo} />);
    expect(getByTestId("video-card-open-button")).toBeTruthy();
    expect(getByText("Voir sur ImuFeed")).toBeTruthy();
  });

  it("appelle onOpen au clic sur le bouton", () => {
    const onOpen = jest.fn();
    const { getByTestId } = render(
      <VideoCard data={sampleVideo} onOpen={onOpen} />,
    );
    fireEvent.press(getByTestId("video-card-open-button"));
    expect(onOpen).toHaveBeenCalledWith("v-1");
  });

  it("appelle onPreview au clic sur le thumbnail", () => {
    const onPreview = jest.fn();
    const { getByTestId } = render(
      <VideoCard data={sampleVideo} onPreview={onPreview} />,
    );
    fireEvent.press(getByTestId("video-card-thumbnail"));
    expect(onPreview).toHaveBeenCalledWith("v-1");
  });

  it("affiche username si pas de displayName", () => {
    const noDisplay = {
      ...sampleVideo,
      author: { username: "alice", displayName: null, avatarUrl: null },
    };
    const { getByText } = render(<VideoCard data={noDisplay} />);
    expect(getByText("alice")).toBeTruthy();
  });

  it("masque la durée si durationMs = 0", () => {
    const noDuration = { ...sampleVideo, durationMs: 0 };
    const { queryByText } = render(<VideoCard data={noDuration} />);
    expect(queryByText("0:00")).toBeNull();
  });

  it("affiche compteurs > 1M formatés", () => {
    const bigVideo = {
      ...sampleVideo,
      viewsCount: 2_500_000,
    };
    const { getByText } = render(<VideoCard data={bigVideo} />);
    expect(getByText("2.5M")).toBeTruthy();
  });
});

// =============================================================
// 5. Composant ShareVideoModal
// =============================================================
describe("S21 — ShareVideoModal", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
    (fetchShareTargets as jest.Mock).mockResolvedValue(sampleTargets);
  });

  it("affiche le modal quand visible=true", async () => {
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-video-modal")).toBeTruthy();
    });
  });

  it("affiche le titre", async () => {
    const { getByText } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByText("Partager la vidéo")).toBeTruthy();
    });
  });

  it("affiche le champ de recherche", async () => {
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-search-input")).toBeTruthy();
    });
  });

  it("charge et affiche les cibles", async () => {
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-target-conv-1")).toBeTruthy();
      expect(getByTestId("share-target-conv-2")).toBeTruthy();
    });
  });

  it("filtre les cibles par recherche", async () => {
    const { getByTestId, queryByTestId } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-target-conv-1")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("share-search-input"), "Groupe");
    await waitFor(() => {
      expect(getByTestId("share-target-conv-2")).toBeTruthy();
      expect(queryByTestId("share-target-conv-1")).toBeNull();
    });
  });

  it("sélectionne une cible au press", async () => {
    useVideoSharingStore.getState().startShare(sampleVideo);
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-target-conv-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("share-target-conv-1"));
    expect(useVideoSharingStore.getState().selectedTargets).toHaveLength(1);
  });

  it("désélectionne une cible au second press", async () => {
    useVideoSharingStore.getState().startShare(sampleVideo);
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-target-conv-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("share-target-conv-1"));
    fireEvent.press(getByTestId("share-target-conv-1"));
    expect(useVideoSharingStore.getState().selectedTargets).toHaveLength(0);
  });

  it("bouton confirmer désactivé si aucune cible", async () => {
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      const btn = getByTestId("share-confirm-button");
      expect(
        btn.props.accessibilityState?.disabled || btn.props.disabled,
      ).toBeTruthy();
    });
  });

  it("appelle confirmShare et onClose au confirm", async () => {
    (shareVideoToMultiple as jest.Mock).mockResolvedValueOnce([
      { success: true, messageId: "m-1", error: null },
    ]);
    useVideoSharingStore.getState().startShare(sampleVideo);
    useVideoSharingStore.getState().toggleTarget(sampleTargets[0]);

    const onClose = jest.fn();
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={onClose} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-confirm-button")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId("share-confirm-button"));
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("appelle cancelShare et onClose à la fermeture", async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ShareVideoModal visible={true} onClose={onClose} />,
    );
    await waitFor(() => {
      expect(getByTestId("share-modal-close")).toBeTruthy();
    });
    fireEvent.press(getByTestId("share-modal-close"));
    expect(onClose).toHaveBeenCalled();
    expect(useVideoSharingStore.getState().shareStatus).toBe("idle");
  });

  it("affiche 'Aucune conversation' si liste vide", async () => {
    (fetchShareTargets as jest.Mock).mockResolvedValueOnce([]);
    const { getByText } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByText("Aucune conversation")).toBeTruthy();
    });
  });

  it("affiche le texte Envoyer avec compteur", async () => {
    useVideoSharingStore.getState().startShare(sampleVideo);
    useVideoSharingStore.getState().toggleTarget(sampleTargets[0]);
    useVideoSharingStore.getState().toggleTarget(sampleTargets[1]);

    const { getByText } = render(
      <ShareVideoModal visible={true} onClose={jest.fn()} />,
    );
    await waitFor(() => {
      expect(getByText("Envoyer (2)")).toBeTruthy();
    });
  });
});
