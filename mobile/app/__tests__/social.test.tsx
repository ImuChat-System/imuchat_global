/**
 * Phase 5 — Tests écran SocialScreen
 * Couvre : stories carousel, feed posts, filtres, FAB, like/share/comment, infinite scroll
 */

// ─── Mock FlatList pour rendre correctement les items en test ────
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

  return {
    ...actual,
    FlatList: MockFlatList,
  };
});

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockFetchStories = jest.fn();
const mockRefreshStories = jest.fn();
const mockOpenViewer = jest.fn();
const mockFetchFeed = jest.fn();
const mockToggleLike = jest.fn();
const mockSharePost = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  Href: jest.fn(),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    background: "#0f0a1a",
    text: "#ffffff",
    textMuted: "#999",
    primary: "#6A54A3",
    surface: "#1a1a2e",
    border: "#333",
  }),
  useSpacing: () => ({ sm: 4, md: 8, lg: 16, xl: 24 }),
}));

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-me", email: "me@test.com" },
  }),
}));

jest.mock("@/stores/stories-store", () => ({
  useStoriesStore: jest.fn(() => ({
    storyGroups: [],
    isLoading: false,
    fetchStories: mockFetchStories,
    refreshStories: mockRefreshStories,
    openViewer: mockOpenViewer,
  })),
}));

jest.mock("@/services/social-feed", () => ({
  fetchFeed: (...args: unknown[]) => mockFetchFeed(...args),
  toggleLike: (...args: unknown[]) => mockToggleLike(...args),
  sharePost: (...args: unknown[]) => mockSharePost(...args),
}));

// ─── Helpers ──────────────────────────────────────────────────────

import { useStoriesStore } from "@/stores/stories-store";
const mockUseStoriesStore = useStoriesStore as unknown as jest.Mock;

function createPost(overrides: Record<string, unknown> = {}) {
  return {
    id: "post-1",
    authorId: "author-1",
    content: "Hello world!",
    mediaUrls: [],
    type: "post",
    likesCount: 5,
    commentsCount: 2,
    sharesCount: 1,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: "author-1",
      username: "alice",
      displayName: "Alice",
      avatarUrl: null,
    },
    ...overrides,
  };
}

function createStoryGroup(overrides: Record<string, unknown> = {}) {
  return {
    user_id: "story-user-1",
    username: "bob",
    display_name: "Bob",
    avatar_url: null,
    stories: [{ id: "s1" }],
    has_unread: true,
    // Code accesses item.user.id / item.user.avatar_url etc.
    user: {
      id: "story-user-1",
      display_name: "Bob",
      username: "bob",
      avatar_url: null,
    },
    ...overrides,
  };
}

import SocialScreen from "../(tabs)/social";

// ─── Helpers for rendering ────────────────────────────────────────

function renderScreen() {
  return render(<SocialScreen />);
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

beforeEach(() => {
  jest.clearAllMocks();

  // Default: feed returns empty
  mockFetchFeed.mockResolvedValue({
    posts: [],
    nextCursor: null,
    hasMore: false,
  });
});

describe("SocialScreen", () => {
  // ─── Basic rendering ─────────────────────────────────────────

  it("affiche le titre de l'écran", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("social.title")).toBeTruthy();
    });
  });

  it("affiche le sous-titre", async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("social.subtitle")).toBeTruthy();
    });
  });

  it("affiche le conteneur principal avec testID", async () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId("social-screen")).toBeTruthy();
  });

  // ─── Loading state ───────────────────────────────────────────

  it("affiche le loader quand le feed charge", async () => {
    // fetchFeed never resolves → stays in loading state
    mockFetchFeed.mockReturnValue(new Promise(() => {}));

    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("common.loading")).toBeTruthy();
    });
  });

  // ─── Empty feed ──────────────────────────────────────────────

  it("affiche l'état vide quand aucun post", async () => {
    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("empty-feed")).toBeTruthy();
    });
  });

  // ─── Filter tabs ─────────────────────────────────────────────

  it("affiche les 3 filtres (mixed, news, following)", async () => {
    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("filter-mixed")).toBeTruthy();
      expect(getByTestId("filter-news")).toBeTruthy();
      expect(getByTestId("filter-following")).toBeTruthy();
    });
  });

  it("change de filtre quand on appuie sur un tab", async () => {
    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByTestId("filter-news")).toBeTruthy();
    });

    fireEvent.press(getByTestId("filter-news"));

    // fetchFeed should be called again with reset
    await waitFor(() => {
      // Called at least twice: initial load + filter change
      expect(mockFetchFeed.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── Posts rendering ─────────────────────────────────────────

  it("affiche les posts du feed", async () => {
    const post = createPost({ id: "post-42", content: "Test content" });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });

    const { getByTestId, getByText } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("feed-post-post-42")).toBeTruthy();
    });
    expect(getByText("Test content")).toBeTruthy();
  });

  it("affiche le nom de l'auteur sur un post", async () => {
    const post = createPost({
      author: {
        id: "a1",
        username: "charlie",
        displayName: "Charlie",
        avatarUrl: null,
      },
    });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });

    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("Charlie")).toBeTruthy();
    });
  });

  it("affiche l'initiale quand pas d'avatar", async () => {
    const post = createPost({
      author: {
        id: "a1",
        username: "diana",
        displayName: "Diana",
        avatarUrl: null,
      },
    });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });

    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("D")).toBeTruthy();
    });
  });

  it("affiche un badge news pour les posts de type news", async () => {
    const post = createPost({ type: "news" });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });

    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText("social.newsBadge")).toBeTruthy();
    });
  });

  // ─── Actions (like, comment, share) ──────────────────────────

  it("like un post quand on appuie sur le bouton like", async () => {
    const post = createPost({ id: "post-like" });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });
    mockToggleLike.mockResolvedValue(true);

    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("like-post-like")).toBeTruthy();
    });

    fireEvent.press(getByTestId("like-post-like"));

    await waitFor(() => {
      expect(mockToggleLike).toHaveBeenCalledWith("post-like", false);
    });
  });

  it("navigue vers les commentaires quand on appuie", async () => {
    const post = createPost({ id: "post-comment" });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });

    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("comment-post-comment")).toBeTruthy();
    });

    fireEvent.press(getByTestId("comment-post-comment"));

    expect(mockPush).toHaveBeenCalledWith("/social/comments/post-comment");
  });

  it("partage un post quand on appuie sur share", async () => {
    const post = createPost({ id: "post-share" });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });
    mockSharePost.mockResolvedValue(true);

    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("share-post-share")).toBeTruthy();
    });

    fireEvent.press(getByTestId("share-post-share"));

    await waitFor(() => {
      expect(mockSharePost).toHaveBeenCalledWith("post-share");
    });
  });

  // ─── Create Post FAB ────────────────────────────────────────

  it("affiche le bouton FAB de création", async () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId("btn-create-post")).toBeTruthy();
  });

  it("navigue vers la création de post via FAB", async () => {
    const { getByTestId } = renderScreen();

    fireEvent.press(getByTestId("btn-create-post"));

    expect(mockPush).toHaveBeenCalledWith("/social/create-post");
  });

  // ─── Story Carousel ─────────────────────────────────────────

  it("affiche le bouton 'ajouter story'", async () => {
    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("story-add-btn")).toBeTruthy();
    });
  });

  it("navigue vers la création de story quand on appuie sur add", async () => {
    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("story-add-btn")).toBeTruthy();
    });

    fireEvent.press(getByTestId("story-add-btn"));

    expect(mockPush).toHaveBeenCalledWith("/stories/create");
  });

  it("affiche les stories des utilisateurs", async () => {
    const storyGroup = createStoryGroup({
      user_id: "sg-1",
      user: {
        id: "sg-1",
        display_name: "Bob",
        username: "bob",
        avatar_url: null,
      },
    });
    mockUseStoriesStore.mockReturnValue({
      storyGroups: [storyGroup],
      isLoading: false,
      fetchStories: mockFetchStories,
      refreshStories: mockRefreshStories,
      openViewer: mockOpenViewer,
    });

    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("story-user-sg-1")).toBeTruthy();
    });
  });

  it("ouvre le viewer quand on appuie sur une story", async () => {
    const storyGroup = createStoryGroup({
      user_id: "sg-2",
      user: {
        id: "sg-2",
        display_name: "Bob",
        username: "bob",
        avatar_url: null,
      },
    });
    mockUseStoriesStore.mockReturnValue({
      storyGroups: [storyGroup],
      isLoading: false,
      fetchStories: mockFetchStories,
      refreshStories: mockRefreshStories,
      openViewer: mockOpenViewer,
    });

    const { getByTestId } = renderScreen();
    await waitFor(() => {
      expect(getByTestId("story-user-sg-2")).toBeTruthy();
    });

    fireEvent.press(getByTestId("story-user-sg-2"));

    expect(mockOpenViewer).toHaveBeenCalledWith(0);
  });

  // ─── Feed interactions ───────────────────────────────────────

  it("charge les stories au montage", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockFetchStories).toHaveBeenCalled();
    });
  });

  it("charge le feed au montage", async () => {
    renderScreen();
    await waitFor(() => {
      expect(mockFetchFeed).toHaveBeenCalled();
    });
  });

  it("affiche le compteur de likes sur un post", async () => {
    const post = createPost({ likesCount: 42 });
    mockFetchFeed.mockResolvedValue({
      posts: [post],
      nextCursor: null,
      hasMore: false,
    });

    const { getByText } = renderScreen();
    await waitFor(() => {
      // "🤍 42" for unliked post
      expect(getByText(/42/)).toBeTruthy();
    });
  });
});
