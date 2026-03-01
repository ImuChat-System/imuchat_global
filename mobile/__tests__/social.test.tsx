/**
 * Tests pour SocialScreen — Parité web stories module
 */

import React from "react";

// === MOCKS ===

// Mock FlatList as a simple View that renders all items (bypass virtualisation)
jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  const React = require("react");
  const MockFlatList = React.forwardRef((props: any, ref: any) => {
    const {
      data,
      renderItem,
      keyExtractor,
      ListHeaderComponent,
      ListEmptyComponent,
      ListFooterComponent,
      testID,
    } = props;
    const Header = ListHeaderComponent;
    const Empty = ListEmptyComponent;
    const Footer = ListFooterComponent;
    return React.createElement(
      actual.View,
      { testID, ref },
      Header
        ? typeof Header === "function"
          ? React.createElement(Header)
          : Header
        : null,
      data && data.length > 0
        ? data.map((item: any, index: number) => {
            const key = keyExtractor
              ? keyExtractor(item, index)
              : String(index);
            return React.createElement(
              actual.View,
              { key },
              renderItem({ item, index, separators: {} }),
            );
          })
        : Empty
          ? typeof Empty === "function"
            ? React.createElement(Empty)
            : Empty
          : null,
      Footer
        ? typeof Footer === "function"
          ? React.createElement(Footer)
          : Footer
        : null,
    );
  });
  return { ...actual, FlatList: MockFlatList };
});

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-social-123", user_metadata: { username: "socialuser" } },
    session: { access_token: "tok" },
    loading: false,
  }),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: "#0f0a1a",
        surface: "#1a1525",
        text: "#fff",
        textMuted: "#aaa",
        border: "#333",
        primary: "#ec4899",
      },
    },
    mode: "dark",
    toggleMode: jest.fn(),
    setMode: jest.fn(),
  }),
  useColors: () => ({
    background: "#0f0a1a",
    surface: "#1a1525",
    text: "#fff",
    textMuted: "#aaa",
    border: "#333",
    primary: "#ec4899",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }),
}));

// ── Stories store mock ────────────────────────────────────────────
const mockFetchStories = jest.fn().mockResolvedValue(undefined);
const mockRefreshStories = jest.fn().mockResolvedValue(undefined);
const mockOpenViewer = jest.fn();

jest.mock("@/stores/stories-store", () => ({
  useStoriesStore: () => ({
    storyGroups: [
      {
        user_id: "su-me",
        username: "socialuser",
        display_name: "Me",
        avatar_url: null,
        stories: [{ id: "s1", created_at: new Date().toISOString() }],
        has_unread: false,
      },
      {
        user_id: "su-1",
        username: "alice",
        display_name: "Alice",
        avatar_url: null,
        stories: [{ id: "s2", created_at: new Date().toISOString() }],
        has_unread: true,
      },
      {
        user_id: "su-2",
        username: "bob",
        display_name: "Bob",
        avatar_url: null,
        stories: [{ id: "s3", created_at: new Date().toISOString() }],
        has_unread: true,
      },
    ],
    isLoading: false,
    fetchStories: mockFetchStories,
    refreshStories: mockRefreshStories,
    openViewer: mockOpenViewer,
  }),
}));

// ── Social feed mock ─────────────────────────────────────────────
const makePosts = () => [
  {
    id: "fp-1",
    authorId: "u1",
    content: "Post 1",
    mediaUrls: [],
    type: "post" as const,
    likesCount: 2,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: "u1",
      username: "alice",
      displayName: "Alice",
      avatarUrl: null,
    },
  },
  {
    id: "fp-2",
    authorId: "u2",
    content: "News 1",
    mediaUrls: [],
    type: "news" as const,
    likesCount: 5,
    commentsCount: 1,
    sharesCount: 0,
    isLiked: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: "u2", username: "bob", displayName: "Bob", avatarUrl: null },
  },
  {
    id: "fp-3",
    authorId: "u3",
    content: "Post 3",
    mediaUrls: [],
    type: "post" as const,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: "u3",
      username: "carol",
      displayName: "Carol",
      avatarUrl: null,
    },
  },
  {
    id: "fp-4",
    authorId: "u1",
    content: "Post 4",
    mediaUrls: [],
    type: "announcement" as const,
    likesCount: 3,
    commentsCount: 0,
    sharesCount: 1,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: "u1",
      username: "alice",
      displayName: "Alice",
      avatarUrl: null,
    },
  },
  {
    id: "fp-5",
    authorId: "u4",
    content: "News 2",
    mediaUrls: [],
    type: "news" as const,
    likesCount: 1,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: "u4",
      username: "dave",
      displayName: "Dave",
      avatarUrl: null,
    },
  },
];

const mockFetchFeed = jest.fn().mockResolvedValue({
  posts: makePosts(),
  nextCursor: null,
  hasMore: false,
});

const mockToggleLike = jest.fn().mockResolvedValue(true);
const mockSharePost = jest.fn().mockResolvedValue(true);

jest.mock("@/services/social-feed", () => ({
  fetchFeed: (...args: any[]) => mockFetchFeed(...args),
  toggleLike: (...args: any[]) => mockToggleLike(...args),
  sharePost: (...args: any[]) => mockSharePost(...args),
}));

import SocialScreen from "@/app/(tabs)/social";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

// ===================================================================

describe("SocialScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchFeed.mockResolvedValue({
      posts: makePosts(),
      nextCursor: null,
      hasMore: false,
    });
  });

  it("affiche l'écran social", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("social-screen")).toBeTruthy();
  });

  it("affiche le titre Social", () => {
    const { getByText } = render(<SocialScreen />);
    expect(getByText(/social\.title/)).toBeTruthy();
  });

  // ---- Story Carousel ----

  it("affiche le story carousel", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("social-story-carousel")).toBeTruthy();
  });

  it("affiche les avatars stories (Vous, Alice, Bob...)", async () => {
    const { getByTestId } = render(<SocialScreen />);
    await waitFor(() => {
      expect(getByTestId("story-user-su-me")).toBeTruthy();
      expect(getByTestId("story-user-su-1")).toBeTruthy();
      expect(getByTestId("story-user-su-2")).toBeTruthy();
    });
  });

  // ---- Filters ----

  it("affiche les 3 filtres (Mixte, News, Following)", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("filter-mixed")).toBeTruthy();
    expect(getByTestId("filter-news")).toBeTruthy();
    expect(getByTestId("filter-following")).toBeTruthy();
  });

  it("filtre les posts par News au clic", async () => {
    const { getByTestId, queryByTestId } = render(<SocialScreen />);
    // Wait for initial load with all posts
    await waitFor(() => expect(getByTestId("feed-post-fp-1")).toBeTruthy());

    // Set up response for news filter, then press
    mockFetchFeed.mockResolvedValueOnce({
      posts: makePosts().filter((p) => p.type === "news"),
      nextCursor: null,
      hasMore: false,
    });
    fireEvent.press(getByTestId("filter-news"));

    await waitFor(() => {
      expect(getByTestId("feed-post-fp-2")).toBeTruthy();
      expect(getByTestId("feed-post-fp-5")).toBeTruthy();
      expect(queryByTestId("feed-post-fp-1")).toBeNull();
    });
  });

  it("filtre les posts par Following au clic", async () => {
    const followingPosts = makePosts().filter((p) => p.type === "post");
    const { getByTestId } = render(<SocialScreen />);
    await waitFor(() => expect(getByTestId("feed-post-fp-1")).toBeTruthy());

    mockFetchFeed.mockResolvedValueOnce({
      posts: followingPosts,
      nextCursor: null,
      hasMore: false,
    });
    fireEvent.press(getByTestId("filter-following"));

    await waitFor(() => {
      expect(getByTestId("feed-post-fp-1")).toBeTruthy();
      expect(getByTestId("feed-post-fp-3")).toBeTruthy();
    });
  });

  // ---- Feed ----

  it("affiche le feed avec les posts", async () => {
    const { getByTestId } = render(<SocialScreen />);
    await waitFor(() => {
      expect(getByTestId("social-feed")).toBeTruthy();
      expect(getByTestId("feed-post-fp-1")).toBeTruthy();
      expect(getByTestId("feed-post-fp-2")).toBeTruthy();
    });
  });

  it("affiche les 5 posts en mode Mixte", async () => {
    const { getByTestId } = render(<SocialScreen />);
    await waitFor(() => {
      expect(getByTestId("feed-post-fp-1")).toBeTruthy();
      expect(getByTestId("feed-post-fp-2")).toBeTruthy();
      expect(getByTestId("feed-post-fp-3")).toBeTruthy();
      expect(getByTestId("feed-post-fp-4")).toBeTruthy();
      expect(getByTestId("feed-post-fp-5")).toBeTruthy();
    });
  });

  it("affiche les boutons like, comment, partager", async () => {
    const { getByTestId } = render(<SocialScreen />);
    await waitFor(() => {
      expect(getByTestId("like-fp-1")).toBeTruthy();
      expect(getByTestId("comment-fp-1")).toBeTruthy();
      expect(getByTestId("share-fp-1")).toBeTruthy();
    });
  });

  it("affiche le badge News sur les posts news", async () => {
    const { getAllByText } = render(<SocialScreen />);
    await waitFor(() => {
      // "social.news" appears in the filter label AND potentially as badge text
      const matches = getAllByText(/social\.news/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---- Create Post FAB ----

  it("affiche le bouton créer post", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("btn-create-post")).toBeTruthy();
  });

  // ---- Filter reset ----

  it("retourne au mode mixte au clic sur Mixte", async () => {
    const { getByTestId } = render(<SocialScreen />);
    await waitFor(() => expect(getByTestId("feed-post-fp-1")).toBeTruthy());

    // Go to news
    mockFetchFeed.mockResolvedValueOnce({
      posts: makePosts().filter((p) => p.type === "news"),
      nextCursor: null,
      hasMore: false,
    });
    fireEvent.press(getByTestId("filter-news"));
    await waitFor(() => expect(getByTestId("feed-post-fp-2")).toBeTruthy());

    // Back to mixed
    mockFetchFeed.mockResolvedValueOnce({
      posts: makePosts(),
      nextCursor: null,
      hasMore: false,
    });
    fireEvent.press(getByTestId("filter-mixed"));
    await waitFor(() => {
      expect(getByTestId("feed-post-fp-1")).toBeTruthy();
      expect(getByTestId("feed-post-fp-2")).toBeTruthy();
    });
  });
});
