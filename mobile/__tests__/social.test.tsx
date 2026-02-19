/**
 * Tests pour SocialScreen — Parité web stories module
 */

import React from "react";

// === MOCKS ===

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

import SocialScreen from "@/app/(tabs)/social";
import { fireEvent, render } from "@testing-library/react-native";

// ===================================================================

describe("SocialScreen", () => {
  it("affiche l'écran social", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("social-screen")).toBeTruthy();
  });

  it("affiche le titre Social", () => {
    const { getByText } = render(<SocialScreen />);
    expect(getByText(/Social/)).toBeTruthy();
  });

  // ---- Story Carousel ----

  it("affiche le story carousel", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("social-story-carousel")).toBeTruthy();
  });

  it("affiche les avatars stories (Vous, Alice, Bob...)", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("story-user-su-me")).toBeTruthy();
    expect(getByTestId("story-user-su-1")).toBeTruthy();
    expect(getByTestId("story-user-su-2")).toBeTruthy();
  });

  // ---- Filters ----

  it("affiche les 3 filtres (Mixte, News, Stories)", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("filter-mixed")).toBeTruthy();
    expect(getByTestId("filter-news")).toBeTruthy();
    expect(getByTestId("filter-stories")).toBeTruthy();
  });

  it("filtre les posts par News au clic", () => {
    const { getByTestId, queryByTestId } = render(<SocialScreen />);
    fireEvent.press(getByTestId("filter-news"));
    // Only news posts should be shown
    expect(getByTestId("feed-post-fp-2")).toBeTruthy(); // news type
    expect(getByTestId("feed-post-fp-5")).toBeTruthy(); // news type
    expect(queryByTestId("feed-post-fp-1")).toBeNull(); // story type
  });

  it("filtre les posts par Stories au clic", () => {
    const { getByTestId, queryByTestId } = render(<SocialScreen />);
    fireEvent.press(getByTestId("filter-stories"));
    expect(getByTestId("feed-post-fp-1")).toBeTruthy(); // story type
    expect(queryByTestId("feed-post-fp-2")).toBeNull(); // news type
  });

  // ---- Feed ----

  it("affiche le feed avec les posts", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("social-feed")).toBeTruthy();
    expect(getByTestId("feed-post-fp-1")).toBeTruthy();
    expect(getByTestId("feed-post-fp-2")).toBeTruthy();
  });

  it("affiche les 5 posts en mode Mixte", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("feed-post-fp-1")).toBeTruthy();
    expect(getByTestId("feed-post-fp-2")).toBeTruthy();
    expect(getByTestId("feed-post-fp-3")).toBeTruthy();
    expect(getByTestId("feed-post-fp-4")).toBeTruthy();
    expect(getByTestId("feed-post-fp-5")).toBeTruthy();
  });

  it("affiche les boutons like, comment, partager", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("like-fp-1")).toBeTruthy();
    expect(getByTestId("comment-fp-1")).toBeTruthy();
    expect(getByTestId("share-fp-1")).toBeTruthy();
  });

  it("affiche le badge News sur les posts news", () => {
    const { getAllByText } = render(<SocialScreen />);
    // "News" appears in the filter button AND as a badge on news posts
    const matches = getAllByText(/News/);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  // ---- Create Story FAB ----

  it("affiche le bouton créer story", () => {
    const { getByTestId } = render(<SocialScreen />);
    expect(getByTestId("btn-create-story")).toBeTruthy();
  });

  // ---- Filter reset ----

  it("retourne au mode mixte au clic sur Mixte", () => {
    const { getByTestId } = render(<SocialScreen />);
    // Go to news
    fireEvent.press(getByTestId("filter-news"));
    // Back to mixed
    fireEvent.press(getByTestId("filter-mixed"));
    expect(getByTestId("feed-post-fp-1")).toBeTruthy();
    expect(getByTestId("feed-post-fp-2")).toBeTruthy();
  });
});
