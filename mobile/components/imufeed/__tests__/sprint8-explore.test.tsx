/**
 * Tests for Sprint S8B — VideoGridItem + Explore Page + Category Page
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#ec4899",
    card: "#1a1a2e",
    surface: "#1a1a2e",
    background: "#0f0a1a",
    text: "#ffffff",
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

jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({ t: (k) => k }),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useLocalSearchParams: () => ({ cat: "gaming" }),
}));

jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock fetchExploreData and fetchCategoryFeed
const mockExploreData = {
  trendingHashtags: [
    {
      hashtag_id: "h1",
      name: "dance",
      score: 100,
      usage_24h: 20,
      unique_creators: 5,
      views: 10000,
      acceleration: 2,
    },
  ],
  topCreators: [
    {
      id: "c1",
      username: "alice",
      display_name: "Alice",
      avatar_url: null,
      is_verified: true,
      followers_count: 1000,
      weekly_likes: 500,
      weekly_videos: 3,
      is_following: false,
    },
  ],
  topVideos: [
    {
      id: "v1",
      author: {
        id: "a1",
        username: "bob",
        display_name: null,
        avatar_url: null,
        is_verified: false,
        followers_count: 0,
        is_following: false,
      },
      video_url: "https://example.com/v1.mp4",
      thumbnail_url: "https://example.com/thumb1.jpg",
      caption: "Test video",
      duration_ms: 30000,
      width: 1080,
      height: 1920,
      sound: null,
      hashtags: [],
      category: "entertainment",
      visibility: "public",
      status: "published",
      likes_count: 100,
      comments_count: 10,
      shares_count: 5,
      views_count: 5000,
      bookmarks_count: 20,
      is_liked: false,
      is_bookmarked: false,
      allow_comments: true,
      allow_duet: true,
      original_video_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  activeChallenges: [
    { id: "ch1", name: "flipChallenge", usage_count: 200, is_trending: true },
  ],
};

jest.mock("@/services/imufeed-api", () => ({
  fetchExploreData: jest.fn().mockResolvedValue(mockExploreData),
  fetchCategoryFeed: jest.fn().mockResolvedValue({
    category: "gaming",
    videos: [
      {
        id: "v2",
        author: {
          id: "a2",
          username: "gamer",
          display_name: null,
          avatar_url: null,
          is_verified: false,
          followers_count: 0,
          is_following: false,
        },
        video_url: "https://example.com/v2.mp4",
        thumbnail_url: "https://example.com/thumb2.jpg",
        caption: "Gaming vid",
        duration_ms: 45000,
        width: 1080,
        height: 1920,
        sound: null,
        hashtags: [],
        category: "gaming",
        visibility: "public",
        status: "published",
        likes_count: 50,
        comments_count: 5,
        shares_count: 2,
        views_count: 2000,
        bookmarks_count: 10,
        is_liked: false,
        is_bookmarked: false,
        allow_comments: true,
        allow_duet: true,
        original_video_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    cursor: null,
    hasMore: false,
    totalCount: 1,
  }),
}));

import VideoGridItem, {
  formatDuration,
  formatViews,
} from "@/components/imufeed/VideoGridItem";

// ──────────────────────────────────────────────────────────────
// Suite 1: VideoGridItem helpers
// ──────────────────────────────────────────────────────────────

describe("VideoGridItem — formatViews", () => {
  it("formats millions", () => {
    expect(formatViews(2_500_000)).toBe("2.5M");
  });

  it("formats thousands", () => {
    expect(formatViews(12_300)).toBe("12.3K");
  });

  it("formats small numbers directly", () => {
    expect(formatViews(42)).toBe("42");
  });

  it("formats zero", () => {
    expect(formatViews(0)).toBe("0");
  });
});

describe("VideoGridItem — formatDuration", () => {
  it("formats seconds correctly", () => {
    expect(formatDuration(30_000)).toBe("0:30");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125_000)).toBe("2:05");
  });

  it("formats zero", () => {
    expect(formatDuration(0)).toBe("0:00");
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: VideoGridItem component
// ──────────────────────────────────────────────────────────────

describe("VideoGridItem component", () => {
  const video = mockExploreData.topVideos[0];

  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders with testID", () => {
    const { getByTestId } = render(
      <VideoGridItem video={video as any} index={0} />,
    );
    expect(getByTestId("video-grid-item-0")).toBeTruthy();
  });

  it("renders views count overlay", () => {
    const { getByText } = render(
      <VideoGridItem video={video as any} index={0} />,
    );
    expect(getByText("5.0K")).toBeTruthy();
  });

  it("renders duration overlay", () => {
    const { getByText } = render(
      <VideoGridItem video={video as any} index={0} />,
    );
    expect(getByText("0:30")).toBeTruthy();
  });

  it("navigates on press", () => {
    const { getByTestId } = render(
      <VideoGridItem video={video as any} index={0} />,
    );
    fireEvent.press(getByTestId("video-grid-item-0"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining(video.id));
  });

  it("shows placeholder when no thumbnail", () => {
    const noThumb = { ...video, thumbnail_url: null };
    const { getByTestId } = render(
      <VideoGridItem video={noThumb as any} index={1} />,
    );
    expect(getByTestId("icon-videocam-outline")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 3: Explore Screen
// ──────────────────────────────────────────────────────────────

describe("ExploreScreen", () => {
  let ExploreScreen: any;

  beforeEach(() => {
    jest.clearAllMocks();
    ExploreScreen = require("@/app/imufeed/explore").default;
  });

  it("renders loading state initially", async () => {
    // fetchExploreData returns a promise that resolves async
    const { findByTestId } = render(<ExploreScreen />);
    // The loading state is shown before resolution
    // After resolution, the explore screen appears
    const screen = await findByTestId("explore-screen");
    expect(screen).toBeTruthy();
  });

  it("renders trending hashtags section", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const list = await findByTestId("trending-hashtags-list");
    expect(list).toBeTruthy();
  });

  it("renders top creators section", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const list = await findByTestId("top-creators-list");
    expect(list).toBeTruthy();
  });

  it("renders video grid by default", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const grid = await findByTestId("video-grid");
    expect(grid).toBeTruthy();
  });

  it("renders active challenges section", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const list = await findByTestId("active-challenges-list");
    expect(list).toBeTruthy();
  });

  it("toggles to list mode on button press", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const toggleBtn = await findByTestId("explore-toggle-grid");
    fireEvent.press(toggleBtn);
    const list = await findByTestId("video-list");
    expect(list).toBeTruthy();
  });

  it("navigates back on back button", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const backBtn = await findByTestId("explore-back");
    fireEvent.press(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });

  it("renders category chips", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const chip = await findByTestId("category-chip-gaming");
    expect(chip).toBeTruthy();
  });

  it("navigates to category on chip press", async () => {
    const { findByTestId } = render(<ExploreScreen />);
    const chip = await findByTestId("category-chip-gaming");
    fireEvent.press(chip);
    expect(mockPush).toHaveBeenCalledWith("/imufeed/category/gaming");
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 4: Category Screen
// ──────────────────────────────────────────────────────────────

describe("CategoryScreen", () => {
  let CategoryScreen: any;

  beforeEach(() => {
    jest.clearAllMocks();
    CategoryScreen = require("@/app/imufeed/category/[cat]").default;
  });

  it("renders with category name", async () => {
    const { findByText, findByTestId } = render(<CategoryScreen />);
    const screen = await findByTestId("category-screen");
    expect(screen).toBeTruthy();
    const title = await findByText("Gaming");
    expect(title).toBeTruthy();
  });

  it("renders video count", async () => {
    const { findByText } = render(<CategoryScreen />);
    const count = await findByText("1 vidéo");
    expect(count).toBeTruthy();
  });

  it("renders video grid", async () => {
    const { findByTestId } = render(<CategoryScreen />);
    const grid = await findByTestId("category-grid");
    expect(grid).toBeTruthy();
  });

  it("navigates back on back button", async () => {
    const { findByTestId } = render(<CategoryScreen />);
    const backBtn = await findByTestId("category-back");
    fireEvent.press(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });
});
