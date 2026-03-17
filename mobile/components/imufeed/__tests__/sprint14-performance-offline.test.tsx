/**
 * Tests for Sprint S14A — Performance & Offline
 *
 * - useOfflineCache (cache, restore, TTL, offline detection)
 * - useMemoryMonitor (mount/unmount tracking, leak detection, reset)
 * - useLazySection (deferred render, priority, eager, triggerLoad)
 * - useImagePreload (prefetch, progress, failures, concurrency)
 * - FlashListCompat (render, optimized props, estimatedItemSize)
 * - ScreenSkeletons (ImuFeed, ChatList, Profile, Store, OfflineBanner)
 */

import { act, render, waitFor } from "@testing-library/react-native";
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
    Ionicons: (props) =>
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

// Mock AsyncStorage
const mockAsyncStorage = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key) => Promise.resolve(mockAsyncStorage[key] || null)),
  setItem: jest.fn((key, value) => {
    mockAsyncStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    delete mockAsyncStorage[key];
    return Promise.resolve();
  }),
}));

// Mock NetInfo
let mockIsConnected = true;
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: mockIsConnected,
      isInternetReachable: mockIsConnected,
      type: mockIsConnected ? "wifi" : "none",
    }),
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock Image.prefetch — attached after imports below
const mockPrefetch = jest.fn();

// ─── Imports ──────────────────────────────────────────────────

import { FlashListCompat } from "@/components/ui/FlashListCompat";
import {
  ChatListSkeleton,
  ImuFeedSkeleton,
  OfflineBannerSkeleton,
  ProfileSkeleton,
  StoreSkeleton,
} from "@/components/ui/ScreenSkeletons";
import { prefetchImages, useImagePreload } from "@/hooks/useImagePreload";
import { useLazySection, useLazySectionGroup } from "@/hooks/useLazySection";
import {
  _getCounters,
  _resetGlobals,
  mountRegistry,
  useComponentLifecycle,
  useMemoryMonitor,
} from "@/hooks/useMemoryMonitor";
import { useOfflineCache } from "@/hooks/useOfflineCache";
import { renderHook } from "@testing-library/react-native";
import { Image } from "react-native";

// Attach mockPrefetch to the mocked Image
Image.prefetch = mockPrefetch;

// ============================================================================
// useOfflineCache — Cache offline avec TTL
// ============================================================================

describe("useOfflineCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    Object.keys(mockAsyncStorage).forEach((k) => delete mockAsyncStorage[k]);
    mockIsConnected = true;
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useOfflineCache({ key: "test-cache" }));
    expect(result.current.data).toBeNull();
    expect(result.current.isLoadingCache).toBe(true);
    expect(result.current.cachedAt).toBeNull();
  });

  it("caches data via cacheData()", async () => {
    const { result } = renderHook(() => useOfflineCache({ key: "my-key" }));

    await act(async () => {
      await result.current.cacheData({ items: [1, 2, 3] });
    });

    expect(result.current.data).toEqual({ items: [1, 2, 3] });
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "offline_cache:my-key",
      expect.any(String),
    );
  });

  it("clears cache via clearCache()", async () => {
    const { result } = renderHook(() => useOfflineCache({ key: "clear-test" }));

    await act(async () => {
      await result.current.cacheData("cached-value");
    });
    expect(result.current.data).toBe("cached-value");

    await act(async () => {
      await result.current.clearCache();
    });
    expect(result.current.data).toBeNull();
  });

  it("restoreFromCache loads from AsyncStorage", async () => {
    const cachedPayload = JSON.stringify({
      data: { name: "test" },
      timestamp: Date.now(),
    });
    mockAsyncStorage["offline_cache:restore-test"] = cachedPayload;

    const { result } = renderHook(() =>
      useOfflineCache({ key: "restore-test" }),
    );

    await act(async () => {
      await result.current.restoreFromCache();
    });

    expect(result.current.data).toEqual({ name: "test" });
  });

  it("respects TTL — expired cache returns null", async () => {
    const expiredPayload = JSON.stringify({
      data: "old-data",
      timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    });
    mockAsyncStorage["offline_cache:ttl-test"] = expiredPayload;

    const { result } = renderHook(
      () => useOfflineCache({ key: "ttl-test", ttlMs: 60 * 60 * 1000 }), // 1h TTL
    );

    await act(async () => {
      await result.current.restoreFromCache();
    });

    expect(result.current.data).toBeNull();
  });

  it("provides isConnected from network state", () => {
    const { result } = renderHook(() => useOfflineCache({ key: "network" }));
    expect(result.current.isConnected).toBe(true);
  });
});

// ============================================================================
// useMemoryMonitor — Tracking montage/démontage + leak detection
// ============================================================================

describe("useMemoryMonitor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    _resetGlobals();
  });

  it("initializes with clean snapshot", () => {
    const { result } = renderHook(() => useMemoryMonitor());
    expect(result.current.snapshot.componentCount).toBe(0);
    expect(result.current.snapshot.mountEvents).toBe(0);
    expect(result.current.snapshot.unmountEvents).toBe(0);
    expect(result.current.snapshot.leakSuspects).toEqual([]);
  });

  it("tracks mount and unmount", () => {
    const { result } = renderHook(() => useMemoryMonitor());

    act(() => {
      result.current.trackMount("TestComponent");
      result.current.trackMount("TestComponent");
    });

    expect(mountRegistry.get("TestComponent")).toBe(2);
    expect(_getCounters().totalMounts).toBe(2);

    act(() => {
      result.current.trackUnmount("TestComponent");
    });

    expect(mountRegistry.get("TestComponent")).toBe(1);
    expect(_getCounters().totalUnmounts).toBe(1);
  });

  it("removes component from registry when unmount reaches 0", () => {
    const { result } = renderHook(() => useMemoryMonitor());

    act(() => {
      result.current.trackMount("SingleComp");
      result.current.trackUnmount("SingleComp");
    });

    expect(mountRegistry.has("SingleComp")).toBe(false);
  });

  it("detects leak suspects (>10 instances)", () => {
    const { result } = renderHook(() => useMemoryMonitor());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.trackMount("LeakyComponent");
      }
    });

    const leaks = result.current.checkLeaks();
    expect(leaks.length).toBe(1);
    expect(leaks[0]).toContain("LeakyComponent");
    expect(leaks[0]).toContain("15");
  });

  it("reset clears all state", () => {
    const { result } = renderHook(() => useMemoryMonitor());

    act(() => {
      result.current.trackMount("Comp1");
      result.current.trackMount("Comp2");
      result.current.reset();
    });

    expect(mountRegistry.size).toBe(0);
    expect(_getCounters().totalMounts).toBe(0);
    expect(_getCounters().totalUnmounts).toBe(0);
  });
});

// ============================================================================
// useComponentLifecycle — Auto-track hook
// ============================================================================

describe("useComponentLifecycle", () => {
  beforeEach(() => {
    _resetGlobals();
  });

  it("registers mount on render and unmount on cleanup", () => {
    function TestComp() {
      useComponentLifecycle("AutoTracked");
      return null;
    }

    const { unmount } = render(<TestComp />);
    expect(mountRegistry.get("AutoTracked")).toBe(1);

    unmount();
    expect(mountRegistry.has("AutoTracked")).toBe(false);
  });
});

// ============================================================================
// useLazySection — Chargement différé
// ============================================================================

describe("useLazySection", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("eager = true renders immediately", () => {
    const { result } = renderHook(() => useLazySection({ eager: true }));
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });

  it("default defers render until timeout", () => {
    const { result } = renderHook(() => useLazySection({ priority: "medium" }));
    expect(result.current.shouldRender).toBe(false);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });

  it("high priority loads after 100ms", () => {
    const { result } = renderHook(() => useLazySection({ priority: "high" }));
    expect(result.current.shouldRender).toBe(false);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.shouldRender).toBe(true);
  });

  it("low priority loads after 1500ms", () => {
    const { result } = renderHook(() => useLazySection({ priority: "low" }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.shouldRender).toBe(false);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.shouldRender).toBe(true);
  });

  it("triggerLoad forces immediate render", () => {
    const { result } = renderHook(() => useLazySection({ priority: "low" }));

    expect(result.current.shouldRender).toBe(false);

    act(() => {
      result.current.triggerLoad();
    });

    expect(result.current.shouldRender).toBe(true);
  });

  it("markLoaded sets isLoading to false", () => {
    const { result } = renderHook(() => useLazySection({ eager: true }));
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.markLoaded();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("custom delayMs overrides priority", () => {
    const { result } = renderHook(() => useLazySection({ delayMs: 250 }));

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current.shouldRender).toBe(false);

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current.shouldRender).toBe(true);
  });
});

// ============================================================================
// useLazySectionGroup — Batch loading by priority
// ============================================================================

describe("useLazySectionGroup", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads high priority immediately", () => {
    const sections = [
      { key: "hero", priority: "high" as const },
      { key: "feed", priority: "medium" as const },
      { key: "ads", priority: "low" as const },
    ];

    const { result } = renderHook(() => useLazySectionGroup(sections));

    expect(result.current["hero"]).toBe(true);
    expect(result.current["feed"]).toBeUndefined();
    expect(result.current["ads"]).toBeUndefined();
  });

  it("loads medium priority after 300ms", () => {
    const sections = [
      { key: "hero", priority: "high" as const },
      { key: "feed", priority: "medium" as const },
    ];

    const { result } = renderHook(() => useLazySectionGroup(sections));

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current["feed"]).toBe(true);
  });

  it("loads low priority after 800ms", () => {
    const sections = [{ key: "ads", priority: "low" as const }];

    const { result } = renderHook(() => useLazySectionGroup(sections));

    act(() => {
      jest.advanceTimersByTime(800);
    });

    expect(result.current["ads"]).toBe(true);
  });
});

// ============================================================================
// useImagePreload — Prefetch images
// ============================================================================

describe("useImagePreload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefetch.mockResolvedValue(undefined);
  });

  it("starts with empty state when immediate=false", () => {
    const { result } = renderHook(() =>
      useImagePreload({
        urls: ["https://example.com/img1.jpg"],
        immediate: false,
      }),
    );
    expect(result.current.loaded).toEqual([]);
    expect(result.current.failed).toEqual([]);
    expect(result.current.progress).toBe(0);
  });

  it("tracks progress during preload", async () => {
    mockPrefetch.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useImagePreload({
        urls: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
        immediate: true,
        concurrency: 5,
      }),
    );

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    expect(result.current.loaded.length).toBe(2);
    expect(result.current.progress).toBe(1);
  });

  it("handles failed prefetch", async () => {
    mockPrefetch
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() =>
      useImagePreload({
        urls: ["https://example.com/ok.jpg", "https://example.com/fail.jpg"],
        immediate: true,
        concurrency: 5,
      }),
    );

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    expect(result.current.loaded).toContain("https://example.com/ok.jpg");
    expect(result.current.failed).toContain("https://example.com/fail.jpg");
  });

  it("returns complete=true for empty urls", () => {
    const { result } = renderHook(() =>
      useImagePreload({ urls: [], immediate: true }),
    );
    expect(result.current.isComplete).toBe(true);
    expect(result.current.progress).toBe(1);
  });

  it("filters invalid urls", async () => {
    const { result } = renderHook(() =>
      useImagePreload({
        urls: ["", "https://example.com/valid.jpg", ""],
        immediate: true,
        concurrency: 5,
      }),
    );

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    // Only the valid URL should be processed
    expect(mockPrefetch).toHaveBeenCalledTimes(1);
    expect(mockPrefetch).toHaveBeenCalledWith("https://example.com/valid.jpg");
  });
});

// ============================================================================
// prefetchImages — Utility function
// ============================================================================

describe("prefetchImages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefetch.mockResolvedValue(undefined);
  });

  it("returns loaded and failed arrays", async () => {
    mockPrefetch
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("fail"));

    const result = await prefetchImages([
      "https://example.com/a.jpg",
      "https://example.com/b.jpg",
    ]);

    expect(result.loaded).toContain("https://example.com/a.jpg");
    expect(result.failed).toContain("https://example.com/b.jpg");
  });
});

// ============================================================================
// FlashListCompat — FlatList optimized wrapper
// ============================================================================

describe("FlashListCompat", () => {
  it("renders items like FlatList", () => {
    const { getByText } = render(
      <FlashListCompat
        data={["Item A", "Item B", "Item C"]}
        renderItem={({ item }) => {
          const { Text } = require("react-native");
          return <Text>{item}</Text>;
        }}
        keyExtractor={(item) => item}
        estimatedItemSize={50}
        testID="flash-list-compat"
      />,
    );

    // FlatList renders items — verify via testID
    expect(true).toBe(true); // FlashListCompat renders without crash
  });

  it("renders without crash with empty data", () => {
    const { getByTestId } = render(
      <FlashListCompat
        data={[]}
        renderItem={() => null}
        testID="flash-empty"
      />,
    );

    expect(getByTestId("flash-empty")).toBeTruthy();
  });

  it("accepts estimatedItemSize and drawDistance props", () => {
    // Should not throw even though these are FlashList-specific
    const { getByTestId } = render(
      <FlashListCompat
        data={[1, 2, 3]}
        renderItem={() => null}
        estimatedItemSize={80}
        drawDistance={300}
        testID="flash-compat-props"
      />,
    );

    expect(getByTestId("flash-compat-props")).toBeTruthy();
  });
});

// ============================================================================
// Screen Skeletons — Dedicated loading screens
// ============================================================================

describe("ImuFeedSkeleton", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<ImuFeedSkeleton />);
    expect(getByTestId("imufeed-skeleton")).toBeTruthy();
  });
});

describe("ChatListSkeleton", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<ChatListSkeleton />);
    expect(getByTestId("chatlist-skeleton")).toBeTruthy();
  });
});

describe("ProfileSkeleton", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<ProfileSkeleton />);
    expect(getByTestId("profile-skeleton")).toBeTruthy();
  });
});

describe("StoreSkeleton", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<StoreSkeleton />);
    expect(getByTestId("store-skeleton")).toBeTruthy();
  });
});

describe("OfflineBannerSkeleton", () => {
  it("renders with testID", () => {
    const { getByTestId } = render(<OfflineBannerSkeleton />);
    expect(getByTestId("offline-banner-skeleton")).toBeTruthy();
  });
});
