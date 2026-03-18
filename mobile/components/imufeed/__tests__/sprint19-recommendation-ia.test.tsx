/**
 * Tests for Sprint S19 — IA Recommandation Avancée
 *
 * - types/recommendation (defaults & structures)
 * - services/imufeed/recommendation-engine (rerank, diversity, cold start, feedback)
 * - services/imufeed/alice-video (summarize, search)
 * - stores/recommendation-store (all actions)
 * - components/imufeed/ColdStartOnboarding (category selection, onboarding flow)
 * - components/imufeed/FeedbackMenu (8 reasons, submit, cancel)
 */

import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

// Static imports for types
import {
  DEFAULT_COLD_START_CONFIG,
  DEFAULT_DIVERSITY_CONFIG,
  DEFAULT_RERANK_CONFIG,
} from "@/types/recommendation";

// ─── Mocks ───────────────────────────────────────────────────

const mockFrom = jest.fn();
const mockGetUser = jest.fn();
const mockFunctionsInvoke = jest.fn();
const mockRpc = jest.fn();

jest.mock("@/services/supabase", () => ({
  get supabase() {
    return {
      from: mockFrom,
      auth: { getUser: mockGetUser },
      functions: { invoke: mockFunctionsInvoke },
      rpc: mockRpc,
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

jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      (opts && opts.defaultValue) || key,
    locale: "fr",
  }),
}));

jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock("@expo/vector-icons", () => {
  const RN = require("react-native");
  const R = require("react");
  return {
    Ionicons: (props: { name: string }) =>
      R.createElement(RN.Text, { testID: `icon-${props.name}` }, props.name),
  };
});

const mockRouterBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockRouterBack, push: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

// ─── Chain mock helper ───────────────────────────────────────

function chainMock(resolveValue: unknown) {
  const chain: Record<string, jest.Mock> = {};
  const handler = () => chain;
  chain.select = jest.fn().mockImplementation(handler);
  chain.insert = jest.fn().mockImplementation(handler);
  chain.upsert = jest.fn().mockImplementation(handler);
  chain.update = jest.fn().mockImplementation(handler);
  chain.delete = jest.fn().mockImplementation(handler);
  chain.eq = jest.fn().mockImplementation(handler);
  chain.neq = jest.fn().mockImplementation(handler);
  chain.in = jest.fn().mockImplementation(handler);
  chain.order = jest.fn().mockImplementation(handler);
  chain.limit = jest.fn().mockImplementation(handler);
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  chain.then = jest.fn().mockImplementation((resolve) => resolve(resolveValue));
  return chain;
}

// ─── Static imports (after mocks) ────────────────────────────

import ColdStartOnboarding from "@/components/imufeed/ColdStartOnboarding";
import FeedbackMenu from "@/components/imufeed/FeedbackMenu";
import { searchVideos, summarizeVideo } from "@/services/imufeed/alice-video";
import {
  applyReRankRules,
  computeFeedbackAdjustments,
  getColdStartFeed,
  getColdStartStatus,
  getOnboardingCategories,
  injectDiversity,
  recordFeedback,
  saveOnboardingCategories,
} from "@/services/imufeed/recommendation-engine";
import { useRecommendationStore } from "@/stores/recommendation-store";

// ─── Reset ───────────────────────────────────────────────────

const initialStoreState = useRecommendationStore.getState();

beforeEach(() => {
  jest.clearAllMocks();
  // Reset store to initial state
  useRecommendationStore.setState(initialStoreState, true);
  mockGetUser.mockResolvedValue({
    data: { user: { id: "user-1" } },
  });
});

// ═══════════════════════════════════════════════════════════════
// 1. TYPES & DEFAULTS
// ═══════════════════════════════════════════════════════════════

describe("types/recommendation — defaults", () => {
  it("DEFAULT_RERANK_CONFIG has 7 rules", () => {
    expect(DEFAULT_RERANK_CONFIG.rules).toHaveLength(7);
    expect(DEFAULT_RERANK_CONFIG.max_same_creator_in_top).toBe(2);
  });

  it("DEFAULT_RERANK_CONFIG includes safety_filter enabled", () => {
    const safety = DEFAULT_RERANK_CONFIG.rules.find(
      (r) => r.type === "safety_filter",
    );
    expect(safety).toBeDefined();
    expect(safety!.enabled).toBe(true);
    expect(safety!.multiplier).toBe(0);
  });

  it("DEFAULT_DIVERSITY_CONFIG has correct exploration_ratio", () => {
    expect(DEFAULT_DIVERSITY_CONFIG.exploration_ratio).toBe(0.12);
    expect(DEFAULT_DIVERSITY_CONFIG.min_distinct_categories).toBe(4);
    expect(DEFAULT_DIVERSITY_CONFIG.always_eligible_categories).toContain(
      "education",
    );
  });

  it("DEFAULT_COLD_START_CONFIG has correct thresholds", () => {
    expect(DEFAULT_COLD_START_CONFIG.min_views_to_exit).toBe(30);
    expect(DEFAULT_COLD_START_CONFIG.min_onboarding_categories).toBe(3);
    expect(DEFAULT_COLD_START_CONFIG.max_onboarding_categories).toBe(8);
    expect(DEFAULT_COLD_START_CONFIG.onboarding_weight).toBe(0.6);
    expect(DEFAULT_COLD_START_CONFIG.popular_weight).toBe(0.4);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. RECOMMENDATION ENGINE
// ═══════════════════════════════════════════════════════════════

describe("services/imufeed/recommendation-engine — applyReRankRules", () => {
  const makeVideo = (overrides: Record<string, unknown> = {}) => ({
    id: "v-1",
    author: {
      id: "a-1",
      username: "user1",
      display_name: null,
      avatar_url: null,
      is_verified: false,
      followers_count: 10,
      is_following: false,
    },
    video_url: "https://example.com/v.mp4",
    thumbnail_url: null,
    caption: "hello",
    duration_ms: 5000,
    width: 1080,
    height: 1920,
    sound: null,
    hashtags: [],
    category: "entertainment" as const,
    visibility: "public" as const,
    status: "published" as const,
    likes_count: 100,
    comments_count: 10,
    shares_count: 5,
    views_count: 1000,
    bookmarks_count: 0,
    is_liked: false,
    is_bookmarked: false,
    allow_comments: true,
    allow_duet: true,
    original_video_id: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  });

  it("filters out non-published videos via safety_filter", () => {
    const videos = [
      makeVideo({ id: "v-1", status: "published" }),
      makeVideo({ id: "v-2", status: "flagged" }),
      makeVideo({ id: "v-3", status: "published" }),
    ];
    const result = applyReRankRules(videos as any);
    const ids = result.map((v: { id: string }) => v.id);
    expect(ids[ids.length - 1]).toBe("v-2");
  });

  it("boosts original videos (no original_video_id)", () => {
    const original = makeVideo({ id: "v-orig", original_video_id: null });
    const repost = makeVideo({ id: "v-repost", original_video_id: "other" });
    const result = applyReRankRules([repost, original] as any);
    const ids = result.map((v: { id: string }) => v.id);
    expect(ids[0]).toBe("v-orig");
  });

  it("boosts verified creators", () => {
    const verified = makeVideo({
      id: "v-ver",
      author: { ...makeVideo().author, id: "a-ver", is_verified: true },
    });
    const normal = makeVideo({
      id: "v-norm",
      author: { ...makeVideo().author, id: "a-norm", is_verified: false },
    });
    const result = applyReRankRules([normal, verified] as any);
    const ids = result.map((v: { id: string }) => v.id);
    expect(ids[0]).toBe("v-ver");
  });

  it("penalizes clickbait (low like/view ratio)", () => {
    const clickbait = makeVideo({
      id: "v-cb",
      likes_count: 1,
      views_count: 50000,
    });
    const quality = makeVideo({
      id: "v-q",
      likes_count: 1000,
      views_count: 5000,
    });
    const result = applyReRankRules([clickbait, quality] as any);
    const ids = result.map((v: { id: string }) => v.id);
    expect(ids[0]).toBe("v-q");
  });

  it("enforces creator limit in top results", () => {
    const videos = [
      makeVideo({ id: "v1", author: { ...makeVideo().author, id: "a-same" } }),
      makeVideo({ id: "v2", author: { ...makeVideo().author, id: "a-same" } }),
      makeVideo({ id: "v3", author: { ...makeVideo().author, id: "a-same" } }),
      makeVideo({ id: "v4", author: { ...makeVideo().author, id: "a-other" } }),
    ];
    const result = applyReRankRules(videos as any);
    const topThree = result.slice(0, 3);
    const sameCreatorCount = topThree.filter(
      (v: { author: { id: string } }) => v.author.id === "a-same",
    ).length;
    expect(sameCreatorCount).toBeLessThanOrEqual(2);
  });

  it("returns all videos unchanged when no rules enabled", () => {
    const config = {
      rules: [
        {
          type: "safety_filter" as const,
          multiplier: 0,
          enabled: false,
          description: "",
        },
      ],
      max_same_creator_in_top: 10,
    };
    const videos = [makeVideo({ id: "v-1" }), makeVideo({ id: "v-2" })];
    const result = applyReRankRules(videos as any, config);
    expect(result).toHaveLength(2);
  });
});

describe("services/imufeed/recommendation-engine — injectDiversity", () => {
  it("returns original array if empty", async () => {
    const result = await injectDiversity([], ["entertainment"]);
    expect(result).toEqual([]);
  });

  it("returns original if exploration query fails", async () => {
    const chain = chainMock({ data: null, error: null });
    mockFrom.mockReturnValue(chain);
    const videos = [
      {
        id: "v1",
        author: { id: "a1" },
        status: "published",
        category: "gaming",
      },
    ];
    const result = await injectDiversity(videos as any, ["gaming"]);
    expect(result).toHaveLength(1);
  });
});

describe("services/imufeed/recommendation-engine — getColdStartStatus", () => {
  it("returns new_user when no prefs and no views", async () => {
    const prefsChain = chainMock({
      data: { onboarding_categories: null },
      error: null,
    });
    const viewsChain = chainMock({ count: 0, error: null });
    mockFrom.mockReturnValueOnce(prefsChain).mockReturnValueOnce(viewsChain);
    const status = await getColdStartStatus("user-1");
    expect(status).toBe("new_user");
  });

  it("returns onboarding when views > 0 but no onboarding done", async () => {
    const prefsChain = chainMock({
      data: { onboarding_categories: null },
      error: null,
    });
    const viewsChain = chainMock({ count: 5, error: null });
    mockFrom.mockReturnValueOnce(prefsChain).mockReturnValueOnce(viewsChain);
    const status = await getColdStartStatus("user-1");
    expect(status).toBe("onboarding");
  });

  it("returns warming when onboarding done but few views", async () => {
    const prefsChain = chainMock({
      data: { onboarding_categories: ["gaming", "music", "tech"] },
      error: null,
    });
    const viewsChain = chainMock({ count: 10, error: null });
    mockFrom.mockReturnValueOnce(prefsChain).mockReturnValueOnce(viewsChain);
    const status = await getColdStartStatus("user-1");
    expect(status).toBe("warming");
  });

  it("returns ready when onboarding done + enough views", async () => {
    const prefsChain = chainMock({
      data: { onboarding_categories: ["gaming", "music", "tech"] },
      error: null,
    });
    const viewsChain = chainMock({ count: 50, error: null });
    mockFrom.mockReturnValueOnce(prefsChain).mockReturnValueOnce(viewsChain);
    const status = await getColdStartStatus("user-1");
    expect(status).toBe("ready");
  });
});

describe("services/imufeed/recommendation-engine — getOnboardingCategories", () => {
  it("returns 13 categories with video counts from RPC", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [
        { category: "gaming", count: 42 },
        { category: "music", count: 100 },
      ],
      error: null,
    });
    const categories = await getOnboardingCategories();
    expect(categories).toHaveLength(13);
    const gaming = categories.find((c) => c.id === "gaming");
    expect(gaming!.video_count).toBe(42);
    const music = categories.find((c) => c.id === "music");
    expect(music!.video_count).toBe(100);
    const travel = categories.find((c) => c.id === "travel");
    expect(travel!.video_count).toBe(0);
  });

  it("returns 0 video_counts when RPC returns null", async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null });
    const categories = await getOnboardingCategories();
    expect(categories).toHaveLength(13);
    expect(categories.every((c) => c.video_count === 0)).toBe(true);
  });
});

describe("services/imufeed/recommendation-engine — saveOnboardingCategories", () => {
  it("upserts preferences and returns no error", async () => {
    const chain = chainMock({ data: null, error: null });
    mockFrom.mockReturnValue(chain);
    const result = await saveOnboardingCategories("user-1", [
      "gaming",
      "music",
      "tech",
    ]);
    expect(result.error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("user_preferences");
  });

  it("returns error when upsert fails", async () => {
    const chain = chainMock({
      data: null,
      error: { message: "conflict" },
    });
    mockFrom.mockReturnValue(chain);
    const result = await saveOnboardingCategories("user-1", ["gaming"]);
    expect(result.error).toBe("conflict");
  });
});

describe("services/imufeed/recommendation-engine — getColdStartFeed", () => {
  it("returns up to 20 video ids from onboarding + popular", async () => {
    const onboardingChain = chainMock({
      data: [{ id: "v1" }, { id: "v2" }, { id: "v3" }],
      error: null,
    });
    const popularChain = chainMock({
      data: [{ id: "v4" }, { id: "v5" }],
      error: null,
    });
    mockFrom
      .mockReturnValueOnce(onboardingChain)
      .mockReturnValueOnce(popularChain);
    const ids = await getColdStartFeed("user-1", ["gaming", "music"]);
    expect(ids).toContain("v1");
    expect(ids).toContain("v4");
    expect(ids.length).toBeLessThanOrEqual(20);
  });
});

describe("services/imufeed/recommendation-engine — recordFeedback", () => {
  it("inserts feedback and not-interested record", async () => {
    const feedbackChain = chainMock({ data: null, error: null });
    const notInterestedChain = chainMock({ data: null, error: null });
    mockFrom
      .mockReturnValueOnce(feedbackChain)
      .mockReturnValueOnce(notInterestedChain);
    const result = await recordFeedback("vid-1", "not_interested", 1500);
    expect(result.error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("imufeed_feedback");
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await recordFeedback("vid-1", "low_quality");
    expect(result.error).toBe("Not authenticated");
  });
});

describe("services/imufeed/recommendation-engine — computeFeedbackAdjustments", () => {
  it("returns category adjustments from negative feedbacks", async () => {
    const chain = chainMock({
      data: [
        { reason: "not_interested", imufeed_videos: { category: "gaming" } },
        { reason: "low_quality", imufeed_videos: { category: "gaming" } },
        { reason: "inappropriate", imufeed_videos: { category: "news" } },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(chain);
    const adjustments = await computeFeedbackAdjustments("user-1");
    expect(adjustments.length).toBeGreaterThanOrEqual(1);
    const gaming = adjustments.find((a) => a.category === "gaming");
    expect(gaming).toBeDefined();
    expect(gaming!.delta).toBeLessThan(0);
  });

  it("returns empty array when no feedbacks", async () => {
    const chain = chainMock({ data: [], error: null });
    mockFrom.mockReturnValue(chain);
    const adjustments = await computeFeedbackAdjustments("user-1");
    expect(adjustments).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. ALICE VIDEO SERVICE
// ═══════════════════════════════════════════════════════════════

describe("services/imufeed/alice-video — summarizeVideo", () => {
  it("returns AliceVideoSummary on success", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: {
        summary: "Résumé de la vidéo",
        key_points: ["point 1", "point 2"],
        original_duration_ms: 120000,
        read_time_ms: 30000,
        language: "fr",
      },
      error: null,
    });
    const { data, error } = await summarizeVideo("vid-1");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.summary).toBe("Résumé de la vidéo");
    expect(data!.key_points).toHaveLength(2);
    expect(data!.video_id).toBe("vid-1");
  });

  it("returns error when invoke fails", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: "timeout" },
    });
    const { data, error } = await summarizeVideo("vid-1");
    expect(data).toBeNull();
    expect(error).toBe("timeout");
  });

  it("returns error when response is empty", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: {},
      error: null,
    });
    const { data, error } = await summarizeVideo("vid-1");
    expect(data).toBeNull();
    expect(error).toBe("Empty response from Alice");
  });
});

describe("services/imufeed/alice-video — searchVideos", () => {
  it("returns search results on success", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: {
        results: [
          {
            video_id: "v-1",
            relevance_score: 0.9,
            match_excerpt: "cuisine japonaise",
            title: "Ramen maison",
            author_username: "chef42",
            thumbnail_url: null,
            category: "cooking",
          },
        ],
      },
      error: null,
    });
    const { data, error } = await searchVideos({
      query: "cuisine japonaise",
      limit: 10,
    });
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].video_id).toBe("v-1");
    expect(data[0].relevance_score).toBe(0.9);
  });

  it("returns empty array when invoke fails", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: "network error" },
    });
    const { data, error } = await searchVideos({
      query: "test",
      limit: 5,
    });
    expect(data).toEqual([]);
    expect(error).toBe("network error");
  });

  it("returns empty array when no results", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: { results: null },
      error: null,
    });
    const { data, error } = await searchVideos({
      query: "xyz",
      limit: 5,
    });
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. RECOMMENDATION STORE
// ═══════════════════════════════════════════════════════════════

describe("stores/recommendation-store", () => {
  it("has correct initial state", () => {
    const state = useRecommendationStore.getState();
    expect(state.coldStartStatus).toBe("ready");
    expect(state.onboardingCategories).toEqual([]);
    expect(state.availableCategories).toEqual([]);
    expect(state.currentSummary).toBeNull();
    expect(state.summaryLoading).toBe(false);
    expect(state.searchResults).toEqual([]);
    expect(state.searchLoading).toBe(false);
  });

  it("selectOnboardingCategory adds a category", () => {
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("gaming"),
    );
    expect(useRecommendationStore.getState().onboardingCategories).toContain(
      "gaming",
    );
  });

  it("selectOnboardingCategory respects max 8 limit", () => {
    const cats = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
    for (const c of cats) {
      act(() => useRecommendationStore.getState().selectOnboardingCategory(c));
    }
    expect(useRecommendationStore.getState().onboardingCategories).toHaveLength(
      8,
    );
    act(() => useRecommendationStore.getState().selectOnboardingCategory("c9"));
    expect(useRecommendationStore.getState().onboardingCategories).toHaveLength(
      8,
    );
  });

  it("removeOnboardingCategory removes a category", () => {
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("gaming"),
    );
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("music"),
    );
    act(() =>
      useRecommendationStore.getState().removeOnboardingCategory("gaming"),
    );
    expect(useRecommendationStore.getState().onboardingCategories).toEqual([
      "music",
    ]);
  });

  it("loadAvailableCategories fetches categories from engine", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ category: "gaming", count: 50 }],
      error: null,
    });
    await act(async () => {
      await useRecommendationStore.getState().loadAvailableCategories();
    });
    expect(useRecommendationStore.getState().availableCategories).toHaveLength(
      13,
    );
  });

  it("completeOnboarding sets status to warming", async () => {
    const chain = chainMock({ data: null, error: null });
    mockFrom.mockReturnValue(chain);
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("gaming"),
    );
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("music"),
    );
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("tech"),
    );
    await act(async () => {
      await useRecommendationStore.getState().completeOnboarding();
    });
    expect(useRecommendationStore.getState().coldStartStatus).toBe("warming");
  });

  it("submitFeedback calls recordFeedback service", async () => {
    const feedbackChain = chainMock({ data: null, error: null });
    const notInterestedChain = chainMock({ data: null, error: null });
    mockFrom
      .mockReturnValueOnce(feedbackChain)
      .mockReturnValueOnce(notInterestedChain);
    await act(async () => {
      await useRecommendationStore
        .getState()
        .submitFeedback("vid-1", "low_quality");
    });
    expect(mockFrom).toHaveBeenCalledWith("imufeed_feedback");
  });

  it("summarizeVideo sets summary and loading states", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: {
        summary: "Un résumé",
        key_points: ["a"],
        original_duration_ms: 60000,
        read_time_ms: 10000,
        language: "fr",
      },
      error: null,
    });
    await act(async () => {
      await useRecommendationStore.getState().summarizeVideo("vid-1");
    });
    const state = useRecommendationStore.getState();
    expect(state.summaryLoading).toBe(false);
    expect(state.currentSummary).not.toBeNull();
    expect(state.currentSummary!.summary).toBe("Un résumé");
  });

  it("searchVideos sets results and loading states", async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: {
        results: [
          {
            video_id: "v-1",
            relevance_score: 0.8,
            match_excerpt: "match",
            title: "Video 1",
            author_username: "user1",
            thumbnail_url: null,
            category: "gaming",
          },
        ],
      },
      error: null,
    });
    await act(async () => {
      await useRecommendationStore.getState().searchVideos("recherche test");
    });
    const state = useRecommendationStore.getState();
    expect(state.searchLoading).toBe(false);
    expect(state.searchResults).toHaveLength(1);
    expect(state.searchResults[0].video_id).toBe("v-1");
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. COLD START ONBOARDING COMPONENT
// ═══════════════════════════════════════════════════════════════

describe("components/imufeed/ColdStartOnboarding", () => {
  beforeEach(() => {
    mockRpc.mockResolvedValue({
      data: [
        { category: "gaming", count: 50 },
        { category: "music", count: 100 },
      ],
      error: null,
    });
  });

  it("renders onboarding screen with title", async () => {
    const onComplete = jest.fn();
    const { findByTestId, getByText } = render(
      <ColdStartOnboarding onComplete={onComplete} />,
    );
    const screen = await findByTestId("cold-start-onboarding");
    expect(screen).toBeTruthy();
    expect(getByText("Qu'est-ce qui t'intéresse ?")).toBeTruthy();
  });

  it("shows selection counter initially at 0/8", async () => {
    const { findByTestId } = render(
      <ColdStartOnboarding onComplete={jest.fn()} />,
    );
    const counter = await findByTestId("selection-counter");
    expect(counter.props.children.join("")).toContain("0/8");
  });

  it("toggling a category updates selection", async () => {
    // Pre-load available categories into store
    await act(async () => {
      await useRecommendationStore.getState().loadAvailableCategories();
    });
    const { findByTestId } = render(
      <ColdStartOnboarding onComplete={jest.fn()} />,
    );
    await findByTestId("cold-start-onboarding");
    const gamingBtn = await findByTestId("category-gaming");
    await act(async () => {
      fireEvent.press(gamingBtn);
    });
    expect(useRecommendationStore.getState().onboardingCategories).toContain(
      "gaming",
    );
  });

  it("continue button is disabled with fewer than 3 selections", async () => {
    const onComplete = jest.fn();
    const { findByTestId } = render(
      <ColdStartOnboarding onComplete={onComplete} />,
    );
    const btn = await findByTestId("onboarding-continue-btn");
    expect(
      btn.props.accessibilityState?.disabled ?? btn.props.disabled,
    ).toBeTruthy();
  });

  it("continue button triggers completeOnboarding and calls onComplete", async () => {
    // Pre-select 3 categories
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("gaming"),
    );
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("music"),
    );
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("tech"),
    );

    const upsertChain = chainMock({ data: null, error: null });
    mockFrom.mockReturnValue(upsertChain);

    const onComplete = jest.fn();
    const { findByTestId } = render(
      <ColdStartOnboarding onComplete={onComplete} />,
    );
    const btn = await findByTestId("onboarding-continue-btn");
    await act(async () => {
      fireEvent.press(btn);
    });
    expect(useRecommendationStore.getState().coldStartStatus).toBe("warming");
    expect(onComplete).toHaveBeenCalled();
  });

  it("deselecting a category removes it from selections", async () => {
    // Pre-load categories and select gaming
    await act(async () => {
      await useRecommendationStore.getState().loadAvailableCategories();
    });
    act(() =>
      useRecommendationStore.getState().selectOnboardingCategory("gaming"),
    );

    const { findByTestId } = render(
      <ColdStartOnboarding onComplete={jest.fn()} />,
    );
    await findByTestId("cold-start-onboarding");
    const gamingBtn = await findByTestId("category-gaming");
    await act(async () => {
      fireEvent.press(gamingBtn);
    });
    expect(
      useRecommendationStore.getState().onboardingCategories,
    ).not.toContain("gaming");
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. FEEDBACK MENU COMPONENT
// ═══════════════════════════════════════════════════════════════

describe("components/imufeed/FeedbackMenu", () => {
  it("renders feedback menu with all 8 reasons", () => {
    const { getByTestId } = render(
      <FeedbackMenu visible={true} videoId="vid-1" onClose={jest.fn()} />,
    );
    expect(getByTestId("feedback-menu")).toBeTruthy();
    expect(getByTestId("feedback-not_interested")).toBeTruthy();
    expect(getByTestId("feedback-repetitive")).toBeTruthy();
    expect(getByTestId("feedback-inappropriate")).toBeTruthy();
    expect(getByTestId("feedback-misleading")).toBeTruthy();
    expect(getByTestId("feedback-low_quality")).toBeTruthy();
    expect(getByTestId("feedback-already_seen")).toBeTruthy();
    expect(getByTestId("feedback-too_long")).toBeTruthy();
    expect(getByTestId("feedback-not_my_language")).toBeTruthy();
  });

  it("renders title text", () => {
    const { getByText } = render(
      <FeedbackMenu visible={true} videoId="vid-1" onClose={jest.fn()} />,
    );
    expect(getByText("Pourquoi cette vidéo ne te plaît pas ?")).toBeTruthy();
  });

  it("renders cancel button", () => {
    const { getByTestId } = render(
      <FeedbackMenu visible={true} videoId="vid-1" onClose={jest.fn()} />,
    );
    expect(getByTestId("feedback-cancel")).toBeTruthy();
  });

  it("pressing a reason calls submitFeedback and onClose", async () => {
    const feedbackChain = chainMock({ data: null, error: null });
    const notInterestedChain = chainMock({ data: null, error: null });
    mockFrom
      .mockReturnValueOnce(feedbackChain)
      .mockReturnValueOnce(notInterestedChain);
    const onClose = jest.fn();
    const { getByTestId } = render(
      <FeedbackMenu visible={true} videoId="vid-1" onClose={onClose} />,
    );
    await act(async () => {
      fireEvent.press(getByTestId("feedback-low_quality"));
    });
    expect(mockFrom).toHaveBeenCalledWith("imufeed_feedback");
    expect(onClose).toHaveBeenCalled();
  });

  it("pressing cancel calls onClose without submitting", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <FeedbackMenu visible={true} videoId="vid-1" onClose={onClose} />,
    );
    fireEvent.press(getByTestId("feedback-cancel"));
    expect(onClose).toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("renders each reason with its label text", () => {
    const { getByText } = render(
      <FeedbackMenu visible={true} videoId="vid-1" onClose={jest.fn()} />,
    );
    expect(getByText("Pas intéressé")).toBeTruthy();
    expect(getByText("Contenu répétitif")).toBeTruthy();
    expect(getByText("Contenu inapproprié")).toBeTruthy();
    expect(getByText("Trompeur / clickbait")).toBeTruthy();
    expect(getByText("Mauvaise qualité")).toBeTruthy();
    expect(getByText("Déjà vu")).toBeTruthy();
    expect(getByText("Trop long")).toBeTruthy();
    expect(getByText("Pas dans ma langue")).toBeTruthy();
  });

  it("pressing not_interested reason calls with correct reason", async () => {
    const feedbackChain = chainMock({ data: null, error: null });
    const niChain = chainMock({ data: null, error: null });
    mockFrom.mockReturnValueOnce(feedbackChain).mockReturnValueOnce(niChain);
    const onClose = jest.fn();
    const { getByTestId } = render(
      <FeedbackMenu visible={true} videoId="vid-99" onClose={onClose} />,
    );
    await act(async () => {
      fireEvent.press(getByTestId("feedback-not_interested"));
    });
    expect(onClose).toHaveBeenCalled();
  });
});
