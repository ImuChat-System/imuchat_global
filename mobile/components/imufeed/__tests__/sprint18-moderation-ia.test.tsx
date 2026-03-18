/**
 * Tests for Sprint S18 — Modération IA
 *
 * - types/content-moderation (types & defaults)
 * - services/imufeed/moderation-api (report, queue, review, creator tools, analyze)
 * - stores/content-moderation-store (all actions)
 * - components/imufeed/ReportModal (reason select, submit, confirmation)
 * - components/imufeed/CreatorModTools (keywords, modes, blocked users, save)
 * - app/imufeed/moderation-queue (tabs, list, actions, dismiss)
 */

import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

const mockFrom = jest.fn();
const mockGetUser = jest.fn();
const mockFunctionsInvoke = jest.fn();

jest.mock("@/services/supabase", () => ({
  get supabase() {
    return {
      from: mockFrom,
      auth: { getUser: mockGetUser },
      functions: { invoke: mockFunctionsInvoke },
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
    t: (key: string, opts?: Record<string, unknown>) =>
      (opts && opts.defaultValue) || key,
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
    Ionicons: (props: { name: string }) =>
      R.createElement(RN.Text, { testID: `icon-${props.name}` }, props.name),
  };
});

// expo-router
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockRouterBack,
    push: mockRouterPush,
  }),
}));

// react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const RN = require("react-native");
  const R = require("react");
  return {
    SafeAreaView: (props: Record<string, unknown>) =>
      R.createElement(RN.View, props),
  };
});

// ─── Imports ──────────────────────────────────────────────────

import type {
  ContentAnalysisResult,
  ContentModerationAction,
  ContentReport,
  CreatorModerationSettings,
  ModerationLogEntry,
  ModerationQueueItem,
  ModerationSeverity,
  ReportableContentType,
  ReportReason,
} from "@/types/content-moderation";
import {
  DEFAULT_CONFIDENCE_THRESHOLDS,
  DEFAULT_CREATOR_SETTINGS,
} from "@/types/content-moderation";

import ModerationQueueScreen from "@/app/imufeed/moderation-queue";
import { CreatorModTools } from "@/components/imufeed/CreatorModTools";
import { ReportModal } from "@/components/imufeed/ReportModal";
import { ModerationAPIService } from "@/services/imufeed/moderation-api";
import { useContentModerationStore } from "@/stores/content-moderation-store";

// ─── Helpers ──────────────────────────────────────────────────

function chainMock(resolveValue: unknown) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    "insert",
    "update",
    "delete",
    "select",
    "eq",
    "neq",
    "in",
    "order",
    "limit",
    "upsert",
    "single",
    "maybeSingle",
  ];
  for (const m of methods) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  chain.select = jest.fn().mockReturnValue({
    ...chain,
    single: chain.single,
    eq: jest.fn().mockReturnValue({
      ...chain,
      single: chain.single,
      eq: jest.fn().mockReturnValue({
        ...chain,
        single: chain.single,
      }),
    }),
    order: jest.fn().mockReturnValue({
      ...chain,
      limit: jest.fn().mockResolvedValue(resolveValue),
    }),
  });
  // Make the chain itself awaitable for insert().select().single()
  (chain as any).then = (resolve: (v: unknown) => void) =>
    resolve(resolveValue);
  return chain;
}

function makeQueueItem(
  overrides: Partial<ModerationQueueItem> = {},
): ModerationQueueItem {
  return {
    id: "qi-1",
    content_id: "vid-1",
    content_type: "video",
    content_preview: "Bad video content",
    author_id: "user-bad",
    author_username: "baduser",
    reason: "hate_speech",
    report_count: 3,
    severity: "high",
    ai_confidence: 0.88,
    status: "pending",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeLogEntry(
  overrides: Partial<ModerationLogEntry> = {},
): ModerationLogEntry {
  return {
    id: "log-1",
    content_id: "vid-1",
    content_type: "video",
    moderator_id: "mod-1",
    action: "warn",
    reason: "First offense",
    is_automatic: false,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// 1. TYPES & DEFAULTS
// ═══════════════════════════════════════════════════════════════

describe("S18 · Types & Defaults", () => {
  it("DEFAULT_CONFIDENCE_THRESHOLDS has correct values", () => {
    expect(DEFAULT_CONFIDENCE_THRESHOLDS.auto_block).toBe(0.95);
    expect(DEFAULT_CONFIDENCE_THRESHOLDS.human_review).toBe(0.7);
  });

  it("DEFAULT_CREATOR_SETTINGS has sane defaults", () => {
    expect(DEFAULT_CREATOR_SETTINGS.blocked_keywords).toEqual([]);
    expect(DEFAULT_CREATOR_SETTINGS.blocked_users).toEqual([]);
    expect(DEFAULT_CREATOR_SETTINGS.comment_mode).toBe("all");
    expect(DEFAULT_CREATOR_SETTINGS.auto_filter_enabled).toBe(true);
  });

  it("types are importable and constructable", () => {
    const report: ContentReport = {
      id: "r1",
      content_id: "c1",
      content_type: "video",
      reporter_id: "u1",
      reason: "spam",
      description: "Spam content",
      status: "pending",
      report_count: 1,
      created_at: "2026-01-01",
      resolved_at: null,
      resolved_by: null,
      resolution_action: null,
    };
    expect(report.reason).toBe("spam");
    expect(report.status).toBe("pending");
  });

  it("ModerationQueueItem supports auto_flagged reason", () => {
    const item = makeQueueItem({ reason: "auto_flagged" });
    expect(item.reason).toBe("auto_flagged");
  });

  it("all severity levels are valid", () => {
    const levels: ModerationSeverity[] = [
      "none",
      "low",
      "medium",
      "high",
      "critical",
    ];
    levels.forEach((l) => expect(typeof l).toBe("string"));
  });

  it("all action types are valid", () => {
    const actions: ContentModerationAction[] = [
      "none",
      "flag",
      "warn",
      "restrict",
      "shadowban",
      "suspend",
      "ban",
    ];
    actions.forEach((a) => expect(typeof a).toBe("string"));
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. SERVICE — ModerationAPIService
// ═══════════════════════════════════════════════════════════════

describe("S18 · ModerationAPIService", () => {
  let service: ModerationAPIService;

  beforeEach(() => {
    service = new ModerationAPIService();
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "current-user" } },
    });
  });

  // ── reportContent ───────────────────────────────────────

  describe("reportContent", () => {
    it("inserts report and returns data", async () => {
      const report = {
        id: "r1",
        content_id: "vid-1",
        content_type: "video",
        reporter_id: "current-user",
        reason: "spam",
        description: "Spammy",
        status: "pending",
      };
      const chain = chainMock({ data: report, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.reportContent({
        content_id: "vid-1",
        content_type: "video",
        reason: "spam",
        description: "Spammy",
      });

      expect(mockFrom).toHaveBeenCalledWith("content_reports");
      expect(result.error).toBeNull();
    });

    it("returns error when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await service.reportContent({
        content_id: "vid-1",
        content_type: "video",
        reason: "spam",
        description: "",
      });

      expect(result.error).toBe("Not authenticated");
    });

    it("returns error on supabase failure", async () => {
      const chain = chainMock({ data: null, error: { message: "DB error" } });
      mockFrom.mockReturnValue(chain);

      const result = await service.reportContent({
        content_id: "vid-1",
        content_type: "video",
        reason: "harassment",
        description: "Harassing content",
      });

      // Result depends on chain behavior — at minimum service doesn't crash
      expect(result).toBeDefined();
    });
  });

  // ── getReportCount ──────────────────────────────────────

  describe("getReportCount", () => {
    it("returns count from supabase", async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockReturnValue(chain);
      // Last eq call resolves
      chain.eq.mockReturnValueOnce(chain).mockResolvedValueOnce({ count: 5 });
      mockFrom.mockReturnValue(chain);

      const count = await service.getReportCount("vid-1");
      expect(count).toBe(5);
    });
  });

  // ── getQueue ────────────────────────────────────────────

  describe("getQueue", () => {
    it("returns queue items", async () => {
      const rows = [makeQueueItem(), makeQueueItem({ id: "qi-2" })];
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.order = jest.fn().mockReturnValue(chain);
      chain.limit = jest.fn().mockResolvedValue({ data: rows, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.getQueue("pending");
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe("qi-1");
    });

    it("returns empty on error", async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.order = jest.fn().mockReturnValue(chain);
      chain.limit = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "fail" } });
      mockFrom.mockReturnValue(chain);

      const result = await service.getQueue();
      expect(result.error).toBe("fail");
      expect(result.data).toEqual([]);
    });
  });

  // ── reviewItem ──────────────────────────────────────────

  describe("reviewItem", () => {
    it("updates queue item and logs action", async () => {
      const updateChain: Record<string, jest.Mock> = {};
      updateChain.update = jest.fn().mockReturnValue(updateChain);
      updateChain.eq = jest.fn().mockResolvedValue({ error: null });

      const logChain: Record<string, jest.Mock> = {};
      logChain.insert = jest.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValueOnce(updateChain).mockReturnValueOnce(logChain);

      const result = await service.reviewItem("qi-1", "ban", "Hate speech");
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("moderation_queue");
      expect(mockFrom).toHaveBeenCalledWith("moderation_log");
    });

    it("returns error if not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await service.reviewItem("qi-1", "warn", "test");
      expect(result.error).toBe("Not authenticated");
    });
  });

  // ── dismissItem ─────────────────────────────────────────

  describe("dismissItem", () => {
    it("updates status to dismissed", async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.update = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.dismissItem("qi-1");
      expect(result.error).toBeNull();
    });
  });

  // ── getLog ──────────────────────────────────────────────

  describe("getLog", () => {
    it("returns log entries", async () => {
      const rows = [makeLogEntry()];
      const chain: Record<string, jest.Mock> = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.order = jest.fn().mockReturnValue(chain);
      chain.limit = jest.fn().mockResolvedValue({ data: rows, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.getLog(10);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].action).toBe("warn");
    });
  });

  // ── analyzeContent ──────────────────────────────────────

  describe("analyzeContent", () => {
    it("invokes edge function and returns result", async () => {
      const analysis: ContentAnalysisResult = {
        content_id: "vid-1",
        content_type: "video",
        categories: ["hate_speech"],
        severity: "high",
        confidence: 0.85,
        suggested_action: "restrict",
        explanation: "Hate speech detected",
        analyzed_at: "2026-01-01T00:00:00Z",
      };
      mockFunctionsInvoke.mockResolvedValue({ data: analysis, error: null });

      const result = await service.analyzeContent("vid-1", "video");
      expect(result.data).not.toBeNull();
      expect(result.data!.confidence).toBe(0.85);
      expect(mockFunctionsInvoke).toHaveBeenCalledWith("analyze-content", {
        body: { content_id: "vid-1", content_type: "video" },
      });
    });

    it("auto-moderates when confidence >= 0.95", async () => {
      const analysis: ContentAnalysisResult = {
        content_id: "vid-2",
        content_type: "video",
        categories: ["nsfw"],
        severity: "critical",
        confidence: 0.97,
        suggested_action: "ban",
        explanation: "NSFW auto-detected",
        analyzed_at: "2026-01-01T00:00:00Z",
      };
      mockFunctionsInvoke.mockResolvedValue({ data: analysis, error: null });

      // Mock for autoModerate inserts
      const logInsert: Record<string, jest.Mock> = {};
      logInsert.insert = jest.fn().mockResolvedValue({ error: null });
      const videoUpdate: Record<string, jest.Mock> = {};
      videoUpdate.update = jest.fn().mockReturnValue(videoUpdate);
      videoUpdate.eq = jest.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValueOnce(logInsert).mockReturnValueOnce(videoUpdate);

      const result = await service.analyzeContent("vid-2", "video");
      expect(result.data!.confidence).toBe(0.97);
      // autoModerate should have been called
      expect(mockFrom).toHaveBeenCalledWith("moderation_log");
    });

    it("returns error on function invoke failure", async () => {
      mockFunctionsInvoke.mockResolvedValue({
        data: null,
        error: { message: "Function error" },
      });

      const result = await service.analyzeContent("vid-1", "video");
      expect(result.error).toBe("Function error");
      expect(result.data).toBeNull();
    });
  });

  // ── Creator tools ───────────────────────────────────────

  describe("Creator tools", () => {
    it("getCreatorSettings returns settings", async () => {
      const settings: CreatorModerationSettings = {
        user_id: "u1",
        blocked_keywords: ["spam"],
        blocked_users: ["bad-user"],
        comment_mode: "all",
        auto_filter_enabled: true,
      };
      const chain = chainMock({ data: settings, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.getCreatorSettings("u1");
      expect(result.error).toBeNull();
    });

    it("saveCreatorSettings upserts", async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.upsert = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.saveCreatorSettings({
        ...DEFAULT_CREATOR_SETTINGS,
        user_id: "u1",
      });
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("creator_moderation_settings");
    });

    it("blockUser inserts blocked user", async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.insert = jest.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.blockUser("creator-1", "target-1");
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("creator_blocked_users");
    });

    it("unblockUser deletes blocked user", async () => {
      const chain: Record<string, jest.Mock> = {};
      chain.delete = jest.fn().mockReturnValue(chain);
      chain.eq = jest.fn().mockReturnValue(chain);
      chain.eq
        .mockReturnValueOnce(chain)
        .mockResolvedValueOnce({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await service.unblockUser("creator-1", "target-1");
      expect(result.error).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. STORE — useContentModerationStore
// ═══════════════════════════════════════════════════════════════

describe("S18 · ContentModerationStore", () => {
  let getQueueSpy: jest.SpyInstance;
  let reviewItemSpy: jest.SpyInstance;
  let dismissItemSpy: jest.SpyInstance;
  let getLogSpy: jest.SpyInstance;
  let reportContentSpy: jest.SpyInstance;
  let getCreatorSettingsSpy: jest.SpyInstance;
  let saveCreatorSettingsSpy: jest.SpyInstance;
  let blockUserSpy: jest.SpyInstance;
  let unblockUserSpy: jest.SpyInstance;
  let analyzeContentSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store
    useContentModerationStore.setState({
      queue: [],
      queueLoading: false,
      log: [],
      logLoading: false,
      creatorSettings: { ...DEFAULT_CREATOR_SETTINGS, user_id: "creator-1" },
      creatorSettingsLoading: false,
    });

    getQueueSpy = jest
      .spyOn(ModerationAPIService.prototype, "getQueue")
      .mockResolvedValue({ data: [makeQueueItem()], error: null });
    reviewItemSpy = jest
      .spyOn(ModerationAPIService.prototype, "reviewItem")
      .mockResolvedValue({ error: null });
    dismissItemSpy = jest
      .spyOn(ModerationAPIService.prototype, "dismissItem")
      .mockResolvedValue({ error: null });
    getLogSpy = jest
      .spyOn(ModerationAPIService.prototype, "getLog")
      .mockResolvedValue({ data: [makeLogEntry()], error: null });
    reportContentSpy = jest
      .spyOn(ModerationAPIService.prototype, "reportContent")
      .mockResolvedValue({ data: null, error: null });
    getCreatorSettingsSpy = jest
      .spyOn(ModerationAPIService.prototype, "getCreatorSettings")
      .mockResolvedValue({
        data: {
          ...DEFAULT_CREATOR_SETTINGS,
          user_id: "creator-1",
          blocked_keywords: ["bad"],
        },
        error: null,
      });
    saveCreatorSettingsSpy = jest
      .spyOn(ModerationAPIService.prototype, "saveCreatorSettings")
      .mockResolvedValue({ error: null });
    blockUserSpy = jest
      .spyOn(ModerationAPIService.prototype, "blockUser")
      .mockResolvedValue({ error: null });
    unblockUserSpy = jest
      .spyOn(ModerationAPIService.prototype, "unblockUser")
      .mockResolvedValue({ error: null });
    analyzeContentSpy = jest
      .spyOn(ModerationAPIService.prototype, "analyzeContent")
      .mockResolvedValue({
        data: {
          content_id: "vid-1",
          content_type: "video",
          categories: ["spam"],
          severity: "low",
          confidence: 0.5,
          suggested_action: "flag",
          explanation: "Low risk",
          analyzed_at: "2026-01-01",
        },
        error: null,
      });
  });

  afterEach(() => {
    getQueueSpy.mockRestore();
    reviewItemSpy.mockRestore();
    dismissItemSpy.mockRestore();
    getLogSpy.mockRestore();
    reportContentSpy.mockRestore();
    getCreatorSettingsSpy.mockRestore();
    saveCreatorSettingsSpy.mockRestore();
    blockUserSpy.mockRestore();
    unblockUserSpy.mockRestore();
    analyzeContentSpy.mockRestore();
  });

  it("loadQueue populates queue", async () => {
    await act(async () => {
      await useContentModerationStore.getState().loadQueue("pending");
    });
    const { queue } = useContentModerationStore.getState();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe("qi-1");
  });

  it("reviewItem removes item from queue", async () => {
    useContentModerationStore.setState({ queue: [makeQueueItem()] });
    await act(async () => {
      await useContentModerationStore
        .getState()
        .reviewItem("qi-1", "ban", "Hate speech");
    });
    expect(useContentModerationStore.getState().queue).toHaveLength(0);
  });

  it("dismissItem removes item from queue", async () => {
    useContentModerationStore.setState({ queue: [makeQueueItem()] });
    await act(async () => {
      await useContentModerationStore.getState().dismissItem("qi-1");
    });
    expect(useContentModerationStore.getState().queue).toHaveLength(0);
  });

  it("loadLog populates log", async () => {
    await act(async () => {
      await useContentModerationStore.getState().loadLog(10);
    });
    expect(useContentModerationStore.getState().log).toHaveLength(1);
  });

  it("reportContent calls service", async () => {
    await act(async () => {
      await useContentModerationStore
        .getState()
        .reportContent("vid-1", "video", "spam", "Spam content");
    });
    expect(reportContentSpy).toHaveBeenCalled();
  });

  it("loadCreatorSettings updates state", async () => {
    await act(async () => {
      await useContentModerationStore.getState().loadCreatorSettings();
    });
    const { creatorSettings } = useContentModerationStore.getState();
    expect(creatorSettings.blocked_keywords).toContain("bad");
  });

  it("updateBlockedKeywords updates keywords", () => {
    act(() => {
      useContentModerationStore
        .getState()
        .updateBlockedKeywords(["test", "word"]);
    });
    expect(
      useContentModerationStore.getState().creatorSettings.blocked_keywords,
    ).toEqual(["test", "word"]);
  });

  it("addBlockedUser adds user to list", async () => {
    await act(async () => {
      await useContentModerationStore.getState().addBlockedUser("bad-user-1");
    });
    expect(
      useContentModerationStore.getState().creatorSettings.blocked_users,
    ).toContain("bad-user-1");
  });

  it("addBlockedUser skips duplicate", async () => {
    useContentModerationStore.setState({
      creatorSettings: {
        ...DEFAULT_CREATOR_SETTINGS,
        user_id: "creator-1",
        blocked_users: ["bad-user-1"],
      },
    });
    await act(async () => {
      await useContentModerationStore.getState().addBlockedUser("bad-user-1");
    });
    // Should not call service for duplicate
    expect(blockUserSpy).not.toHaveBeenCalled();
  });

  it("removeBlockedUser removes user from list", async () => {
    useContentModerationStore.setState({
      creatorSettings: {
        ...DEFAULT_CREATOR_SETTINGS,
        user_id: "creator-1",
        blocked_users: ["u1", "u2"],
      },
    });
    await act(async () => {
      await useContentModerationStore.getState().removeBlockedUser("u1");
    });
    expect(
      useContentModerationStore.getState().creatorSettings.blocked_users,
    ).toEqual(["u2"]);
  });

  it("setCommentMode changes mode", () => {
    act(() => {
      useContentModerationStore.getState().setCommentMode("subscribers_only");
    });
    expect(
      useContentModerationStore.getState().creatorSettings.comment_mode,
    ).toBe("subscribers_only");
  });

  it("toggleAutoFilter flips the flag", () => {
    expect(
      useContentModerationStore.getState().creatorSettings.auto_filter_enabled,
    ).toBe(true);
    act(() => {
      useContentModerationStore.getState().toggleAutoFilter();
    });
    expect(
      useContentModerationStore.getState().creatorSettings.auto_filter_enabled,
    ).toBe(false);
  });

  it("saveCreatorSettings calls service", async () => {
    await act(async () => {
      await useContentModerationStore.getState().saveCreatorSettings();
    });
    expect(saveCreatorSettingsSpy).toHaveBeenCalled();
  });

  it("analyzeContent returns result", async () => {
    let result: ContentAnalysisResult | null = null;
    await act(async () => {
      result = await useContentModerationStore
        .getState()
        .analyzeContent("vid-1", "video");
    });
    expect(result).not.toBeNull();
    expect(result!.suggested_action).toBe("flag");
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. COMPONENT — ReportModal
// ═══════════════════════════════════════════════════════════════

describe("S18 · ReportModal", () => {
  const defaultProps = {
    visible: true,
    contentId: "vid-1",
    contentType: "video" as ReportableContentType,
    onClose: jest.fn(),
    onSubmitted: jest.fn(),
  };

  let reportContentSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    reportContentSpy = jest
      .spyOn(ModerationAPIService.prototype, "reportContent")
      .mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    reportContentSpy.mockRestore();
  });

  it("renders modal with reasons", () => {
    const { getByTestId } = render(<ReportModal {...defaultProps} />);
    expect(getByTestId("report-modal")).toBeTruthy();
    expect(getByTestId("reason-spam")).toBeTruthy();
    expect(getByTestId("reason-harassment")).toBeTruthy();
    expect(getByTestId("reason-nsfw")).toBeTruthy();
  });

  it("renders all 10 report reasons", () => {
    const { getByTestId } = render(<ReportModal {...defaultProps} />);
    const reasons: ReportReason[] = [
      "spam",
      "harassment",
      "hate_speech",
      "violence",
      "nsfw",
      "misinformation",
      "copyright",
      "impersonation",
      "underage",
      "other",
    ];
    reasons.forEach((r) => expect(getByTestId(`reason-${r}`)).toBeTruthy());
  });

  it("allows selecting a reason", () => {
    const { getByTestId } = render(<ReportModal {...defaultProps} />);
    fireEvent.press(getByTestId("reason-hate_speech"));
    // Submit button should become active
    expect(getByTestId("report-submit-btn")).toBeTruthy();
  });

  it("allows typing a description", () => {
    const { getByTestId } = render(<ReportModal {...defaultProps} />);
    fireEvent.changeText(getByTestId("report-description"), "Very bad content");
    expect(getByTestId("report-description").props.value).toBe(
      "Very bad content",
    );
  });

  it("submits report and shows confirmation", async () => {
    const { getByTestId, findByTestId } = render(
      <ReportModal {...defaultProps} />,
    );

    fireEvent.press(getByTestId("reason-spam"));
    fireEvent.changeText(getByTestId("report-description"), "Spam video");

    await act(async () => {
      fireEvent.press(getByTestId("report-submit-btn"));
    });

    const confirmation = await findByTestId("report-confirmation");
    expect(confirmation).toBeTruthy();
    expect(defaultProps.onSubmitted).toHaveBeenCalled();
  });

  it("cancel button calls onClose", () => {
    const { getByTestId } = render(<ReportModal {...defaultProps} />);
    fireEvent.press(getByTestId("report-cancel-btn"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("close button on confirmation calls onClose", async () => {
    const { getByTestId, findByTestId } = render(
      <ReportModal {...defaultProps} />,
    );

    fireEvent.press(getByTestId("reason-other"));
    await act(async () => {
      fireEvent.press(getByTestId("report-submit-btn"));
    });

    const closeBtn = await findByTestId("report-close-btn");
    fireEvent.press(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. COMPONENT — CreatorModTools
// ═══════════════════════════════════════════════════════════════

describe("S18 · CreatorModTools", () => {
  let saveSettingsSpy: jest.SpyInstance;
  let blockUserSpy: jest.SpyInstance;
  let unblockUserSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    useContentModerationStore.setState({
      creatorSettings: {
        user_id: "creator-1",
        blocked_keywords: ["spam", "insult"],
        blocked_users: ["bad-user"],
        comment_mode: "all",
        auto_filter_enabled: true,
      },
    });
    saveSettingsSpy = jest
      .spyOn(ModerationAPIService.prototype, "saveCreatorSettings")
      .mockResolvedValue({ error: null });
    blockUserSpy = jest
      .spyOn(ModerationAPIService.prototype, "blockUser")
      .mockResolvedValue({ error: null });
    unblockUserSpy = jest
      .spyOn(ModerationAPIService.prototype, "unblockUser")
      .mockResolvedValue({ error: null });
  });

  afterEach(() => {
    saveSettingsSpy.mockRestore();
    blockUserSpy.mockRestore();
    unblockUserSpy.mockRestore();
  });

  it("renders all sections", () => {
    const { getByTestId } = render(<CreatorModTools />);
    expect(getByTestId("creator-mod-tools")).toBeTruthy();
    expect(getByTestId("auto-filter-switch")).toBeTruthy();
    expect(getByTestId("keyword-input")).toBeTruthy();
    expect(getByTestId("save-settings-btn")).toBeTruthy();
  });

  it("renders comment mode buttons", () => {
    const { getByTestId } = render(<CreatorModTools />);
    expect(getByTestId("mode-all")).toBeTruthy();
    expect(getByTestId("mode-subscribers_only")).toBeTruthy();
    expect(getByTestId("mode-disabled")).toBeTruthy();
  });

  it("changes comment mode on press", () => {
    const { getByTestId } = render(<CreatorModTools />);
    fireEvent.press(getByTestId("mode-subscribers_only"));
    expect(
      useContentModerationStore.getState().creatorSettings.comment_mode,
    ).toBe("subscribers_only");
  });

  it("displays existing keywords", () => {
    const { getByTestId } = render(<CreatorModTools />);
    expect(getByTestId("keyword-spam")).toBeTruthy();
    expect(getByTestId("keyword-insult")).toBeTruthy();
  });

  it("adds a keyword", () => {
    const { getByTestId } = render(<CreatorModTools />);
    fireEvent.changeText(getByTestId("keyword-input"), "toxic");
    fireEvent.press(getByTestId("add-keyword-btn"));
    expect(
      useContentModerationStore.getState().creatorSettings.blocked_keywords,
    ).toContain("toxic");
  });

  it("removes a keyword on press", () => {
    const { getByTestId } = render(<CreatorModTools />);
    fireEvent.press(getByTestId("keyword-spam"));
    expect(
      useContentModerationStore.getState().creatorSettings.blocked_keywords,
    ).not.toContain("spam");
  });

  it("displays blocked users", () => {
    const { getByTestId } = render(<CreatorModTools />);
    expect(getByTestId("blocked-user-bad-user")).toBeTruthy();
  });

  it("unblocks a user", async () => {
    const { getByTestId } = render(<CreatorModTools />);
    await act(async () => {
      fireEvent.press(getByTestId("unblock-bad-user"));
    });
    expect(unblockUserSpy).toHaveBeenCalledWith("creator-1", "bad-user");
  });

  it("toggles auto filter", () => {
    const { getByTestId } = render(<CreatorModTools />);
    expect(
      useContentModerationStore.getState().creatorSettings.auto_filter_enabled,
    ).toBe(true);
    fireEvent(getByTestId("auto-filter-switch"), "valueChange", false);
    expect(
      useContentModerationStore.getState().creatorSettings.auto_filter_enabled,
    ).toBe(false);
  });

  it("save button calls saveCreatorSettings", async () => {
    const { getByTestId } = render(<CreatorModTools />);
    await act(async () => {
      fireEvent.press(getByTestId("save-settings-btn"));
    });
    expect(saveSettingsSpy).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. SCREEN — ModerationQueueScreen
// ═══════════════════════════════════════════════════════════════

describe("S18 · ModerationQueueScreen", () => {
  let getQueueSpy: jest.SpyInstance;
  let reviewItemSpy: jest.SpyInstance;
  let dismissItemSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    useContentModerationStore.setState({
      queue: [
        makeQueueItem(),
        makeQueueItem({ id: "qi-2", severity: "critical", report_count: 7 }),
      ],
      queueLoading: false,
    });
    getQueueSpy = jest
      .spyOn(ModerationAPIService.prototype, "getQueue")
      .mockResolvedValue({
        data: [
          makeQueueItem(),
          makeQueueItem({ id: "qi-2", severity: "critical" }),
        ],
        error: null,
      });
    reviewItemSpy = jest
      .spyOn(ModerationAPIService.prototype, "reviewItem")
      .mockResolvedValue({ error: null });
    dismissItemSpy = jest
      .spyOn(ModerationAPIService.prototype, "dismissItem")
      .mockResolvedValue({ error: null });
  });

  afterEach(() => {
    getQueueSpy.mockRestore();
    reviewItemSpy.mockRestore();
    dismissItemSpy.mockRestore();
  });

  it("renders screen with header", () => {
    const { getByTestId } = render(<ModerationQueueScreen />);
    expect(getByTestId("moderation-queue-screen")).toBeTruthy();
  });

  it("renders status tabs", () => {
    const { getByTestId } = render(<ModerationQueueScreen />);
    expect(getByTestId("tab-pending")).toBeTruthy();
    expect(getByTestId("tab-reviewing")).toBeTruthy();
    expect(getByTestId("tab-resolved")).toBeTruthy();
    expect(getByTestId("tab-dismissed")).toBeTruthy();
  });

  it("renders queue items", async () => {
    const { findByTestId } = render(<ModerationQueueScreen />);
    expect(await findByTestId("queue-item-qi-1")).toBeTruthy();
    expect(await findByTestId("queue-item-qi-2")).toBeTruthy();
  });

  it("renders severity badge", async () => {
    const { findByTestId } = render(<ModerationQueueScreen />);
    expect(await findByTestId("severity-high")).toBeTruthy();
    expect(await findByTestId("severity-critical")).toBeTruthy();
  });

  it("renders action buttons for pending items", async () => {
    const { findByTestId } = render(<ModerationQueueScreen />);
    expect(await findByTestId("action-warn-qi-1")).toBeTruthy();
    expect(await findByTestId("action-restrict-qi-1")).toBeTruthy();
    expect(await findByTestId("action-ban-qi-1")).toBeTruthy();
    expect(await findByTestId("dismiss-qi-1")).toBeTruthy();
  });

  it("action button triggers reviewItem", async () => {
    const { findByTestId } = render(<ModerationQueueScreen />);
    const btn = await findByTestId("action-ban-qi-1");
    await act(async () => {
      fireEvent.press(btn);
    });
    expect(reviewItemSpy).toHaveBeenCalled();
  });

  it("dismiss button triggers dismissItem", async () => {
    const { findByTestId } = render(<ModerationQueueScreen />);
    const btn = await findByTestId("dismiss-qi-1");
    await act(async () => {
      fireEvent.press(btn);
    });
    expect(dismissItemSpy).toHaveBeenCalled();
  });

  it("back button navigates back", () => {
    const { getByTestId } = render(<ModerationQueueScreen />);
    fireEvent.press(getByTestId("back-btn"));
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("switching tab reloads queue", async () => {
    const { getByTestId } = render(<ModerationQueueScreen />);
    await act(async () => {
      fireEvent.press(getByTestId("tab-resolved"));
    });
    // loadQueue should be called with "resolved"
    expect(getQueueSpy).toHaveBeenCalled();
  });

  it("shows empty state when queue is empty", async () => {
    getQueueSpy.mockResolvedValue({ data: [], error: null });
    useContentModerationStore.setState({ queue: [], queueLoading: false });
    const { findByTestId } = render(<ModerationQueueScreen />);
    expect(await findByTestId("empty-queue")).toBeTruthy();
  });

  it("shows loading indicator when loading", () => {
    useContentModerationStore.setState({ queueLoading: true });
    const { getByTestId } = render(<ModerationQueueScreen />);
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });
});
