/**
 * Tests pour NotificationsScreen — Centre de notifications in-app
 */

import React from "react";

// === MOCKS ===

const mockUser = {
  id: "user-notif-123",
  email: "notif@test.com",
  user_metadata: { username: "notifuser" },
};

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
    session: { access_token: "tok" },
    loading: false,
  }),
}));

jest.mock("@/providers/ThemeProvider", () => ({
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

const mockGetHistory = jest.fn();
const mockMarkRead = jest.fn().mockResolvedValue(undefined);
const mockMarkAllRead = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/notification-api", () => ({
  getNotificationHistory: (...a: any[]) => mockGetHistory(...a),
  markNotificationAsRead: (...a: any[]) => mockMarkRead(...a),
  markAllNotificationsAsRead: (...a: any[]) => mockMarkAllRead(...a),
}));

import NotificationsScreen from "@/app/(tabs)/notifications";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

// ===================================================================

describe("NotificationsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // API fails → fallback to mock notifications
    mockGetHistory.mockRejectedValue(new Error("offline"));
  });

  // ---- Loading ----

  it("affiche un loader pendant le chargement", () => {
    mockGetHistory.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<NotificationsScreen />);
    expect(getByTestId("notif-loading")).toBeTruthy();
  });

  it("affiche l'écran après chargement", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notifications-screen")).toBeTruthy();
    });
  });

  // ---- Header ----

  it("affiche le titre Notifications", async () => {
    const { getAllByText } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(
        getAllByText(/notifications\.title/).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it("affiche le badge non-lues", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("unread-badge")).toBeTruthy();
    });
  });

  it("affiche le bouton Tout marquer lu", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("btn-mark-all-read")).toBeTruthy();
    });
  });

  // ---- Search ----

  it("affiche la barre de recherche", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-search")).toBeTruthy();
    });
  });

  it("filtre par recherche textuelle", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("notif-search"), "Alice");
    expect(getByTestId("notif-item-n-1")).toBeTruthy(); // "Alice vous a envoyé..."
    expect(queryByTestId("notif-item-n-2")).toBeNull(); // "Bob a essayé..."
  });

  it("affiche le bouton clear pour la recherche", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("notif-search"), "test");
    expect(getByTestId("search-clear")).toBeTruthy();
  });

  // ---- Category filter ----

  it("affiche les 5 catégories", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("cat-all")).toBeTruthy();
    });
    expect(getByTestId("cat-messages")).toBeTruthy();
    expect(getByTestId("cat-calls")).toBeTruthy();
    expect(getByTestId("cat-social")).toBeTruthy();
    expect(getByTestId("cat-system")).toBeTruthy();
  });

  it("filtre par catégorie Messages", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("cat-messages"));
    expect(getByTestId("notif-item-n-1")).toBeTruthy(); // messages
    expect(getByTestId("notif-item-n-5")).toBeTruthy(); // messages
    expect(queryByTestId("notif-item-n-2")).toBeNull(); // calls
    expect(queryByTestId("notif-item-n-3")).toBeNull(); // social
  });

  it("filtre par catégorie Appels", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("cat-calls"));
    expect(getByTestId("notif-item-n-2")).toBeTruthy(); // calls
    expect(getByTestId("notif-item-n-8")).toBeTruthy(); // calls
    expect(queryByTestId("notif-item-n-1")).toBeNull(); // messages
  });

  it("filtre par catégorie Social", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("cat-social"));
    expect(getByTestId("notif-item-n-3")).toBeTruthy(); // social
    expect(getByTestId("notif-item-n-6")).toBeTruthy(); // social
    expect(queryByTestId("notif-item-n-1")).toBeNull(); // messages
  });

  it("filtre par catégorie Système", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("cat-system"));
    expect(getByTestId("notif-item-n-4")).toBeTruthy(); // system
    expect(getByTestId("notif-item-n-9")).toBeTruthy(); // system
    expect(queryByTestId("notif-item-n-1")).toBeNull();
  });

  // ---- Read filter ----

  it("affiche les filtres lu/non-lu", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("filter-all")).toBeTruthy();
    });
    expect(getByTestId("filter-unread")).toBeTruthy();
    expect(getByTestId("filter-read")).toBeTruthy();
  });

  it("filtre les non-lues uniquement", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("filter-unread"));
    expect(getByTestId("notif-item-n-1")).toBeTruthy(); // unread
    expect(getByTestId("notif-item-n-2")).toBeTruthy(); // unread
    expect(queryByTestId("notif-item-n-3")).toBeNull(); // read
    expect(queryByTestId("notif-item-n-4")).toBeNull(); // read
  });

  it("filtre les lues uniquement", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("filter-read"));
    expect(getByTestId("notif-item-n-3")).toBeTruthy(); // read
    expect(getByTestId("notif-item-n-4")).toBeTruthy(); // read
    expect(queryByTestId("notif-item-n-1")).toBeNull(); // unread
  });

  // ---- Notification list ----

  it("affiche les 10 notifications mock", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-list")).toBeTruthy();
    });
    for (let i = 1; i <= 10; i++) {
      expect(getByTestId(`notif-item-n-${i}`)).toBeTruthy();
    }
  });

  it("affiche les dots non-lu sur les items non-lus", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("unread-dot-n-1")).toBeTruthy();
    });
    expect(getByTestId("unread-dot-n-2")).toBeTruthy();
  });

  it("affiche Aucune notification quand tout est filtré", async () => {
    const { getByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("notif-search"), "xyzinexistant");
    expect(getByTestId("empty-notif")).toBeTruthy();
  });

  // ---- Actions ----

  it("marque comme lu au clic", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    fireEvent.press(getByTestId("notif-item-n-1"));
    await waitFor(() => {
      expect(queryByTestId("unread-dot-n-1")).toBeNull();
    });
  });

  it("marque tout comme lu", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("btn-mark-all-read")).toBeTruthy();
    });
    fireEvent.press(getByTestId("btn-mark-all-read"));
    await waitFor(() => {
      expect(queryByTestId("unread-dot-n-1")).toBeNull();
      expect(queryByTestId("unread-dot-n-2")).toBeNull();
    });
  });

  // ---- Combined filters ----

  it("combine catégorie + filtre lu/non-lu", async () => {
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-n-1")).toBeTruthy();
    });
    // Social + Unread
    fireEvent.press(getByTestId("cat-social"));
    fireEvent.press(getByTestId("filter-unread"));
    expect(getByTestId("notif-item-n-6")).toBeTruthy(); // social + unread
    expect(getByTestId("notif-item-n-10")).toBeTruthy(); // social + unread
    expect(queryByTestId("notif-item-n-3")).toBeNull(); // social but read
    expect(queryByTestId("notif-item-n-7")).toBeNull(); // social but read
  });

  // ---- API integration ----

  it("charge depuis l'API quand disponible", async () => {
    mockGetHistory.mockResolvedValue({
      notifications: [
        {
          id: "api-1",
          userId: "u1",
          title: "API Notif",
          body: "From API",
          data: {},
          type: "messages",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    });
    const { getByTestId, queryByTestId } = render(<NotificationsScreen />);
    await waitFor(() => {
      expect(getByTestId("notif-item-api-1")).toBeTruthy();
    });
    expect(queryByTestId("notif-item-n-1")).toBeNull(); // mock not used
  });
});
