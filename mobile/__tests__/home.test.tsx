/**
 * Tests pour HomeScreen — Parité web hometab
 */

import React from "react";

// === MOCKS ===

const mockUser = {
  id: "user-home-123",
  email: "home@test.com",
  user_metadata: { username: "homeuser" },
};

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
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
        primary: "#6A54A3",
        error: "#ef4444",
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
    primary: "#6A54A3",
    error: "#ef4444",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }),
}));

const mockConversations = [
  {
    id: "conv-1",
    is_group: false,
    group_name: null,
    last_message_at: new Date(Date.now() - 5 * 60000).toISOString(),
    last_message: { content: "Salut !" },
    participants: [{ profile: { username: "Alice" } }],
    unread_count: 3,
  },
  {
    id: "conv-2",
    is_group: true,
    group_name: "Dev Team",
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    last_message: { content: "Le build est OK" },
    participants: [],
    unread_count: 0,
  },
];

const mockGetConversations = jest.fn().mockResolvedValue(mockConversations);

jest.mock("@/services/messaging", () => ({
  getConversations: (...a: any[]) => mockGetConversations(...a),
}));

import HomeScreen from "@/app/(tabs)/index";
import { render, waitFor } from "@testing-library/react-native";

// ===================================================================

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConversations.mockResolvedValue(mockConversations);
  });

  // ---- Loading ----

  it("affiche un loader pendant le chargement", () => {
    mockGetConversations.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId("home-loading")).toBeTruthy();
  });

  it("affiche l'écran home après chargement", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("home-screen")).toBeTruthy();
    });
  });

  // ---- Header ----

  it("affiche le titre Accueil", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText(/home\.title/)).toBeTruthy();
    });
  });

  it("affiche le message de bienvenue avec le username", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText(/homeuser/)).toBeTruthy();
    });
  });

  // ---- Hero Carousel ----

  it("affiche le hero carousel avec les slides", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("hero-carousel")).toBeTruthy();
    });
  });

  it("affiche les dots du hero carousel", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("hero-dots")).toBeTruthy();
    });
  });

  // ---- Story Carousel ----

  it("affiche le story carousel", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("story-carousel")).toBeTruthy();
    });
  });

  it("affiche le titre Stories", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("home.stories")).toBeTruthy();
    });
  });

  // ---- Friends Card / Conversations ----

  it("affiche la section conversations récentes", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("friends-card")).toBeTruthy();
    });
  });

  it("charge les conversations via getConversations", async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalled();
    });
  });

  it("affiche les conversations récentes", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("friend-conv-0")).toBeTruthy();
      expect(getByTestId("friend-conv-1")).toBeTruthy();
    });
  });

  it("affiche Aucune conversation quand la liste est vide", async () => {
    mockGetConversations.mockResolvedValue([]);
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("no-conversations")).toBeTruthy();
    });
  });

  it("affiche le bouton Voir tout", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("btn-see-all-convs")).toBeTruthy();
    });
  });

  // ---- Explorer Grid ----

  it("affiche la grille explorer", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("explorer-grid")).toBeTruthy();
    });
  });

  it("affiche les 6 items explorer", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("explorer-e1")).toBeTruthy();
      expect(getByTestId("explorer-e2")).toBeTruthy();
      expect(getByTestId("explorer-e3")).toBeTruthy();
      expect(getByTestId("explorer-e4")).toBeTruthy();
      expect(getByTestId("explorer-e5")).toBeTruthy();
      expect(getByTestId("explorer-e6")).toBeTruthy();
    });
  });

  it("affiche les titres Worlds, Store, Games", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("home.worlds")).toBeTruthy();
      expect(getByText("home.storeLabel")).toBeTruthy();
      expect(getByText("home.games")).toBeTruthy();
    });
  });

  // ---- Podcast Widget ----

  it("affiche le widget podcasts", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("podcast-widget")).toBeTruthy();
    });
  });

  it("affiche les 3 podcasts", async () => {
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("podcast-p1")).toBeTruthy();
      expect(getByTestId("podcast-p2")).toBeTruthy();
      expect(getByTestId("podcast-p3")).toBeTruthy();
    });
  });

  it("affiche le titre Explorer", async () => {
    const { getAllByText } = render(<HomeScreen />);
    await waitFor(() => {
      const matches = getAllByText("Explorer");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("affiche le titre Podcasts", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("Podcasts")).toBeTruthy();
    });
  });

  // ---- Error handling ----

  it("gère les erreurs de chargement des conversations", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetConversations.mockRejectedValue(new Error("Network error"));
    const { getByTestId } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByTestId("home-screen")).toBeTruthy();
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[Home] load error:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
