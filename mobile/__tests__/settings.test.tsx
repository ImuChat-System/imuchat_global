/**
 * Tests pour l'écran Settings mobile — Full parity
 */

import React from "react";

// === MOCKS ===

const mockUser = {
  id: "user-settings-123",
  email: "test@imuchat.com",
  user_metadata: { username: "testuser" },
};

const mockToggleMode = jest.fn();

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
        primary: "#ec4899",
        error: "#ef4444",
      },
    },
    mode: "dark",
    toggleMode: mockToggleMode,
    setMode: jest.fn(),
  }),
}));

// Supabase mock
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({
  data: {
    username: "testuser",
    notification_prefs: {
      mentions: true,
      directMessages: false,
      calls: true,
      events: false,
    },
    privacy_show_online: true,
    privacy_show_last_seen: false,
    privacy_read_receipts: true,
    privacy_search_phone: false,
    language: "fr",
    stories_visibility: "friends",
    stories_allow_replies: true,
    stories_auto_archive: true,
  },
  error: null,
});

const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn().mockReturnValue({
  eq: mockUpdateEq,
});

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  update: mockUpdate,
}));

const mockUpdateUser = jest.fn().mockResolvedValue({ error: null });

jest.mock("@/services/supabase", () => ({
  supabase: {
    auth: {
      signOut: jest.fn().mockResolvedValue({}),
      updateUser: (...a: any[]) => mockUpdateUser(...a),
    },
    from: (...a: any[]) => mockFrom.apply(null, a),
  },
}));

jest.mock("@/services/security", () => ({
  checkBiometricAvailability: jest.fn().mockResolvedValue({
    isAvailable: false,
    biometryType: null,
    isEnabled: false,
  }),
  authenticateWithBiometrics: jest.fn().mockResolvedValue({ success: false }),
  setBiometricEnabled: jest.fn().mockResolvedValue(undefined),
  getBiometryLabel: jest.fn().mockReturnValue("Biometric"),
  getMfaFactors: jest.fn().mockResolvedValue([]),
  enrollMfa: jest.fn().mockResolvedValue({ success: false }),
  verifyMfaEnrollment: jest.fn().mockResolvedValue({ success: false }),
  unenrollMfa: jest.fn().mockResolvedValue(false),
  getActiveSessions: jest.fn().mockResolvedValue([]),
  revokeAllSessions: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/constants/theme-presets", () => ({
  getAllThemePresets: () => [
    {
      id: "default",
      emoji: "🌙",
      colors: {
        background: "#0f0a1a",
        surface: "#1a1525",
        text: "#fff",
        textMuted: "#aaa",
        border: "#333",
        primary: "#ec4899",
        secondary: "#8b5cf6",
        success: "#22c55e",
        error: "#ef4444",
      },
    },
  ],
}));

// Alert spy
const { Alert } = require("react-native");
const alertSpy = jest.spyOn(Alert, "alert");

const mockShowToast = jest.fn();
jest.mock("@/providers/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast, hideToast: jest.fn() }),
}));

import SettingsScreen from "@/app/(tabs)/settings";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

// ===================================================================

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset chain
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockSingle.mockResolvedValue({
      data: {
        username: "testuser",
        notification_prefs: {
          mentions: true,
          directMessages: false,
          calls: true,
          events: false,
        },
        privacy_show_online: true,
        privacy_show_last_seen: false,
        privacy_read_receipts: true,
        privacy_search_phone: false,
        language: "fr",
        stories_visibility: "friends",
        stories_allow_replies: true,
        stories_auto_archive: true,
      },
      error: null,
    });
    mockUpdateEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
    mockUpdateUser.mockResolvedValue({ error: null });
  });

  // ---- Loading ----

  it("affiche un loader pendant le chargement", () => {
    mockSingle.mockReturnValue(new Promise(() => {}));

    const { getByTestId } = render(<SettingsScreen />);
    expect(getByTestId("settings-loading")).toBeTruthy();
  });

  it("affiche l'écran settings après chargement", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("settings-screen")).toBeTruthy();
    });
  });

  // ---- Sections ----

  it("affiche toutes les sections", async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText("settings.account")).toBeTruthy();
      expect(getByText("settings.password")).toBeTruthy();
      expect(getByText("settings.appearance")).toBeTruthy();
      expect(getByText("settings.language")).toBeTruthy();
      expect(getByText("settings.notifications")).toBeTruthy();
      expect(getByText("settings.stories")).toBeTruthy();
      expect(getByText("settings.privacy")).toBeTruthy();
      expect(getByText("settings.about")).toBeTruthy();
    });
  });

  it("affiche le titre Paramètres", async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText("settings.title")).toBeTruthy();
    });
  });

  it("affiche la version", async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText("settings.versionValue")).toBeTruthy();
    });
  });

  // ---- Account editing ----

  it("affiche les champs username et email éditables", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("input-username")).toBeTruthy();
      expect(getByTestId("input-email")).toBeTruthy();
    });
  });

  it("pré-remplit username et email", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("input-username").props.value).toBe("testuser");
      expect(getByTestId("input-email").props.value).toBe("test@imuchat.com");
    });
  });

  it("affiche le bouton Sauvegarder quand un champ est modifié", async () => {
    const { getByTestId, queryByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("input-username")).toBeTruthy();
    });
    // Before edit, no save button
    expect(queryByTestId("btn-save-account")).toBeNull();
    // Edit username
    fireEvent.changeText(getByTestId("input-username"), "newuser");
    expect(getByTestId("btn-save-account")).toBeTruthy();
  });

  it("sauvegarde le profil via Supabase au clic Sauvegarder", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("input-username")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("input-username"), "newuser");
    fireEvent.press(getByTestId("btn-save-account"));
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("profiles");
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  // ---- Password ----

  it("affiche les champs mot de passe", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("input-current-password")).toBeTruthy();
      expect(getByTestId("input-new-password")).toBeTruthy();
      expect(getByTestId("btn-change-password")).toBeTruthy();
    });
  });

  it("refuse un mot de passe trop court", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("input-new-password")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("input-new-password"), "ab");
    fireEvent.press(getByTestId("btn-change-password"));
    expect(mockShowToast).toHaveBeenCalledWith(
      "settings.passwordMinLength",
      "warning",
    );
  });

  it("change le mot de passe via Supabase auth", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("input-new-password")).toBeTruthy();
    });
    fireEvent.changeText(getByTestId("input-new-password"), "newpassword123");
    fireEvent.press(getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: "newpassword123",
      });
    });
  });

  // ---- Language ----

  it("affiche les 3 langues", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("lang-fr")).toBeTruthy();
      expect(getByTestId("lang-en")).toBeTruthy();
      expect(getByTestId("lang-ja")).toBeTruthy();
    });
  });

  it("sélectionne FR par défaut", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      // FR radio should have inner dot (children)
      const radioFr = getByTestId("lang-radio-fr");
      expect(radioFr.props.children).toBeTruthy();
    });
  });

  it("change de langue au clic", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("lang-en")).toBeTruthy();
    });
    fireEvent.press(getByTestId("lang-en"));
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });
  });

  // ---- Stories ----

  it("affiche les boutons de visibilité stories", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("stories-visibility-public")).toBeTruthy();
      expect(getByTestId("stories-visibility-friends")).toBeTruthy();
      expect(getByTestId("stories-visibility-private")).toBeTruthy();
    });
  });

  it("affiche les switches stories", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("switch-stories-replies")).toBeTruthy();
      expect(getByTestId("switch-stories-archive")).toBeTruthy();
    });
  });

  it("change la visibilité stories au clic", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("stories-visibility-private")).toBeTruthy();
    });
    fireEvent.press(getByTestId("stories-visibility-private"));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  // ---- Appearance ----

  it("affiche le switch mode sombre", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("switch-system-theme")).toBeTruthy();
    });
  });

  // ---- Notifications ----

  it("affiche les switches de notifications", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("switch-notif-mentions")).toBeTruthy();
      expect(getByTestId("switch-notif-directMessages")).toBeTruthy();
      expect(getByTestId("switch-notif-calls")).toBeTruthy();
      expect(getByTestId("switch-notif-events")).toBeTruthy();
    });
  });

  // ---- Privacy ----

  it("affiche les switches de confidentialité", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("switch-privacy-showOnlineStatus")).toBeTruthy();
      expect(getByTestId("switch-privacy-showLastSeen")).toBeTruthy();
      expect(getByTestId("switch-privacy-showReadReceipts")).toBeTruthy();
      expect(getByTestId("switch-privacy-allowSearchByPhone")).toBeTruthy();
    });
  });

  // ---- Supabase load ----

  it("charge les paramètres depuis Supabase", async () => {
    render(<SettingsScreen />);
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });
  });

  // ---- Actions ----

  it("affiche les boutons Déconnexion et Supprimer", async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText("settings.signOut")).toBeTruthy();
      expect(getByText("settings.deleteAccount")).toBeTruthy();
    });
  });

  it("ouvre une alerte au clic sur Déconnexion", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("btn-sign-out")).toBeTruthy();
    });
    fireEvent.press(getByTestId("btn-sign-out"));
    expect(alertSpy).toHaveBeenCalledWith(
      "settings.signOut",
      expect.any(String),
      expect.any(Array),
    );
  });

  it("ouvre une alerte au clic sur Supprimer le compte", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("btn-delete-account")).toBeTruthy();
    });
    fireEvent.press(getByTestId("btn-delete-account"));
    expect(alertSpy).toHaveBeenCalledWith(
      "settings.deleteAccount",
      expect.any(String),
      expect.any(Array),
    );
  });

  // ---- Error handling ----

  it("gère une erreur de chargement", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error", code: "42P01" },
    });

    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("settings-screen")).toBeTruthy();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Settings] load error:",
      expect.objectContaining({ message: "DB error" }),
    );
    consoleSpy.mockRestore();
  });
});
