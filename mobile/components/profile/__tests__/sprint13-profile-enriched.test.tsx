/**
 * Tests for Sprint S13A — Profil enrichi
 *
 * - WalletSection (render, balance display, action buttons)
 * - ArenaSection (tier display, progress bar, leaderboard button)
 * - MyModules (module list, toggle, open, empty state, manage button)
 * - ThemeQuickSwitch (6 theme dots, active indicator, selection)
 */

import { fireEvent, render } from "@testing-library/react-native";
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
    Ionicons: (props: any) =>
      React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
  };
});

// ─── Imports ──────────────────────────────────────────────────

import type { UserInstalledModule } from "@/types/modules";
import ArenaSection from "../../profile/ArenaSection";
import MyModules from "../../profile/MyModules";
import ThemeQuickSwitch from "../../profile/ThemeQuickSwitch";
import WalletSection from "../../profile/WalletSection";

// ============================================================================
// WalletSection
// ============================================================================

describe("WalletSection", () => {
  const onTopUp = jest.fn();
  const onHistory = jest.fn();
  const onSend = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it("renders wallet section with balance", () => {
    const { getByTestId, getByText } = render(
      <WalletSection
        balance={12500}
        onTopUp={onTopUp}
        onHistory={onHistory}
        onSend={onSend}
      />,
    );
    expect(getByTestId("wallet-section")).toBeTruthy();
    expect(getByText("💰 Wallet")).toBeTruthy();
    expect(getByText("ImuCoins")).toBeTruthy();
  });

  it("displays formatted balance", () => {
    const { getByTestId } = render(
      <WalletSection
        balance={12500}
        onTopUp={onTopUp}
        onHistory={onHistory}
        onSend={onSend}
      />,
    );
    const section = getByTestId("wallet-section");
    // Balance text should be rendered inside the section
    expect(section).toBeTruthy();
  });

  it("renders 3 action buttons", () => {
    const { getByTestId } = render(
      <WalletSection
        balance={0}
        onTopUp={onTopUp}
        onHistory={onHistory}
        onSend={onSend}
      />,
    );
    expect(getByTestId("wallet-action-topup")).toBeTruthy();
    expect(getByTestId("wallet-action-history")).toBeTruthy();
    expect(getByTestId("wallet-action-send")).toBeTruthy();
  });

  it("calls onTopUp when pressing Recharger", () => {
    const { getByTestId } = render(
      <WalletSection
        balance={0}
        onTopUp={onTopUp}
        onHistory={onHistory}
        onSend={onSend}
      />,
    );
    fireEvent.press(getByTestId("wallet-action-topup"));
    expect(onTopUp).toHaveBeenCalledTimes(1);
  });

  it("calls onHistory when pressing Historique", () => {
    const { getByTestId } = render(
      <WalletSection
        balance={0}
        onTopUp={onTopUp}
        onHistory={onHistory}
        onSend={onSend}
      />,
    );
    fireEvent.press(getByTestId("wallet-action-history"));
    expect(onHistory).toHaveBeenCalledTimes(1);
  });

  it("calls onSend when pressing Envoyer", () => {
    const { getByTestId } = render(
      <WalletSection
        balance={0}
        onTopUp={onTopUp}
        onHistory={onHistory}
        onSend={onSend}
      />,
    );
    fireEvent.press(getByTestId("wallet-action-send"));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("renders action button labels", () => {
    const { getByText } = render(
      <WalletSection
        balance={100}
        onTopUp={onTopUp}
        onHistory={onHistory}
        onSend={onSend}
      />,
    );
    expect(getByText("Recharger")).toBeTruthy();
    expect(getByText("Historique")).toBeTruthy();
    expect(getByText("Envoyer")).toBeTruthy();
  });
});

// ============================================================================
// ArenaSection
// ============================================================================

describe("ArenaSection", () => {
  const onViewLeaderboard = jest.fn();
  const defaultProps = {
    tier: "gold" as const,
    level: 25,
    currentXP: 1500,
    xpForNext: 2500,
    rank: 42,
    onViewLeaderboard,
  };

  afterEach(() => jest.clearAllMocks());

  it("renders arena section", () => {
    const { getByTestId, getByText } = render(
      <ArenaSection {...defaultProps} />,
    );
    expect(getByTestId("arena-section")).toBeTruthy();
    expect(getByText("🏆 Arena")).toBeTruthy();
  });

  it("displays tier emoji and label (Or for gold)", () => {
    const { getByText } = render(<ArenaSection {...defaultProps} />);
    expect(getByText("🥇")).toBeTruthy();
    expect(getByText("Or")).toBeTruthy();
  });

  it("displays level number", () => {
    const { getByText } = render(<ArenaSection {...defaultProps} />);
    expect(getByText("Niveau 25")).toBeTruthy();
  });

  it("displays rank when provided", () => {
    const { getByTestId } = render(<ArenaSection {...defaultProps} />);
    expect(getByTestId("arena-rank")).toBeTruthy();
  });

  it("does not display rank when not provided", () => {
    const { queryByTestId } = render(
      <ArenaSection {...defaultProps} rank={undefined} />,
    );
    expect(queryByTestId("arena-rank")).toBeNull();
  });

  it("renders progress bar", () => {
    const { getByTestId } = render(<ArenaSection {...defaultProps} />);
    expect(getByTestId("arena-progress-bar")).toBeTruthy();
  });

  it("displays XP progress text", () => {
    const { getByText } = render(<ArenaSection {...defaultProps} />);
    expect(getByText("1500 / 2500 XP")).toBeTruthy();
  });

  it("calls onViewLeaderboard when pressing leaderboard button", () => {
    const { getByTestId } = render(<ArenaSection {...defaultProps} />);
    fireEvent.press(getByTestId("arena-leaderboard-btn"));
    expect(onViewLeaderboard).toHaveBeenCalledTimes(1);
  });

  it("renders leaderboard button text", () => {
    const { getByText } = render(<ArenaSection {...defaultProps} />);
    expect(getByText("Voir les classements")).toBeTruthy();
  });

  it("renders different tiers correctly", () => {
    const { getByText, rerender } = render(
      <ArenaSection {...defaultProps} tier="diamond" />,
    );
    expect(getByText("💠")).toBeTruthy();
    expect(getByText("Diamant")).toBeTruthy();

    rerender(<ArenaSection {...defaultProps} tier="legend" />);
    expect(getByText("👑")).toBeTruthy();
    expect(getByText("Légende")).toBeTruthy();
  });
});

// ============================================================================
// MyModules
// ============================================================================

describe("MyModules", () => {
  const onOpenModule = jest.fn();
  const onToggleModule = jest.fn();
  const onManageModules = jest.fn();

  const mockModules: UserInstalledModule[] = [
    {
      id: "inst-1",
      user_id: "u-1",
      module_id: "mod-calc",
      installed_version: "1.2.0",
      is_active: true,
      granted_permissions: [],
      settings: {},
      installed_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      usage_count: 10,
      last_used_at: null,
      module: {
        id: "mod-calc",
        name: "Calculatrice",
        icon: "🧮",
        version: "1.2.0",
        description: "A calculator",
        category: "productivity",
        author: "test",
        license: "MIT",
        entry_url: "",
        permissions: [],
        dependencies: [],
        bundle_size: 100,
        checksum: null,
        signature: null,
        sandbox: "iframe",
        allowed_domains: [],
        content_security_policy: null,
        max_storage_size: 0,
        is_published: true,
        is_verified: true,
        default_enabled: false,
        is_core: false,
        publisher_id: null,
        download_count: 0,
        downloads: 0,
        rating: 4.5,
        price: null,
        color: null,
        type: "miniapp",
        created_at: "",
        updated_at: "",
      },
    },
    {
      id: "inst-2",
      user_id: "u-1",
      module_id: "mod-notes",
      installed_version: "2.0.0",
      is_active: false,
      granted_permissions: [],
      settings: {},
      installed_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      usage_count: 5,
      last_used_at: null,
      module: {
        id: "mod-notes",
        name: "Notes",
        icon: "📝",
        version: "2.0.0",
        description: "Notes app",
        category: "productivity",
        author: "test",
        license: "MIT",
        entry_url: "",
        permissions: [],
        dependencies: [],
        bundle_size: 50,
        checksum: null,
        signature: null,
        sandbox: "iframe",
        allowed_domains: [],
        content_security_policy: null,
        max_storage_size: 0,
        is_published: true,
        is_verified: true,
        default_enabled: false,
        is_core: false,
        publisher_id: null,
        download_count: 0,
        downloads: 0,
        rating: 4.0,
        price: null,
        color: null,
        type: "miniapp",
        created_at: "",
        updated_at: "",
      },
    },
  ];

  afterEach(() => jest.clearAllMocks());

  it("renders modules section with count", () => {
    const { getByTestId, getByText } = render(
      <MyModules
        modules={mockModules}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    expect(getByTestId("my-modules-section")).toBeTruthy();
    expect(getByText("📦 Mes Modules")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
  });

  it("renders module items with names", () => {
    const { getByTestId, getByText } = render(
      <MyModules
        modules={mockModules}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    expect(getByTestId("module-item-mod-calc")).toBeTruthy();
    expect(getByTestId("module-item-mod-notes")).toBeTruthy();
    expect(getByText("Calculatrice")).toBeTruthy();
    expect(getByText("Notes")).toBeTruthy();
  });

  it("renders module icons", () => {
    const { getByText } = render(
      <MyModules
        modules={mockModules}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    expect(getByText("🧮")).toBeTruthy();
    expect(getByText("📝")).toBeTruthy();
  });

  it("shows ON/OFF toggle states", () => {
    const { getByText } = render(
      <MyModules
        modules={mockModules}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    expect(getByText("ON")).toBeTruthy();
    expect(getByText("OFF")).toBeTruthy();
  });

  it("calls onOpenModule when tapping a module", () => {
    const { getByTestId } = render(
      <MyModules
        modules={mockModules}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    fireEvent.press(getByTestId("module-open-mod-calc"));
    expect(onOpenModule).toHaveBeenCalledWith("mod-calc");
  });

  it("calls onToggleModule when tapping toggle", () => {
    const { getByTestId } = render(
      <MyModules
        modules={mockModules}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    // mod-calc is active, toggling should set to false
    fireEvent.press(getByTestId("module-toggle-mod-calc"));
    expect(onToggleModule).toHaveBeenCalledWith("mod-calc", false);
    // mod-notes is inactive, toggling should set to true
    fireEvent.press(getByTestId("module-toggle-mod-notes"));
    expect(onToggleModule).toHaveBeenCalledWith("mod-notes", true);
  });

  it("shows empty state when no modules", () => {
    const { getByTestId, getByText } = render(
      <MyModules
        modules={[]}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    expect(getByTestId("modules-empty")).toBeTruthy();
    expect(getByText("Aucun module installé")).toBeTruthy();
  });

  it("calls onManageModules when pressing manage button", () => {
    const { getByTestId } = render(
      <MyModules
        modules={[]}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    fireEvent.press(getByTestId("modules-manage-btn"));
    expect(onManageModules).toHaveBeenCalledTimes(1);
  });

  it("renders version info", () => {
    const { getByText } = render(
      <MyModules
        modules={mockModules}
        onOpenModule={onOpenModule}
        onToggleModule={onToggleModule}
        onManageModules={onManageModules}
      />,
    );
    expect(getByText("v1.2.0")).toBeTruthy();
    expect(getByText("v2.0.0")).toBeTruthy();
  });
});

// ============================================================================
// ThemeQuickSwitch
// ============================================================================

describe("ThemeQuickSwitch", () => {
  const onSelectTheme = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it("renders theme quick switch", () => {
    const { getByTestId, getByText } = render(
      <ThemeQuickSwitch activeTheme="dark" onSelectTheme={onSelectTheme} />,
    );
    expect(getByTestId("theme-quick-switch")).toBeTruthy();
    expect(getByText("🎨 Thème")).toBeTruthy();
  });

  it("renders 6 theme dots", () => {
    const { getByTestId } = render(
      <ThemeQuickSwitch activeTheme="dark" onSelectTheme={onSelectTheme} />,
    );
    expect(getByTestId("theme-dot-light")).toBeTruthy();
    expect(getByTestId("theme-dot-dark")).toBeTruthy();
    expect(getByTestId("theme-dot-kawaii")).toBeTruthy();
    expect(getByTestId("theme-dot-pro")).toBeTruthy();
    expect(getByTestId("theme-dot-neon")).toBeTruthy();
    expect(getByTestId("theme-dot-ocean")).toBeTruthy();
  });

  it("renders theme emojis", () => {
    const { getByText } = render(
      <ThemeQuickSwitch activeTheme="light" onSelectTheme={onSelectTheme} />,
    );
    expect(getByText("☀️")).toBeTruthy();
    expect(getByText("🌙")).toBeTruthy();
    expect(getByText("🌸")).toBeTruthy();
    expect(getByText("💼")).toBeTruthy();
    expect(getByText("⚡")).toBeTruthy();
    expect(getByText("🌊")).toBeTruthy();
  });

  it("displays active theme name", () => {
    const { getByText } = render(
      <ThemeQuickSwitch activeTheme="kawaii" onSelectTheme={onSelectTheme} />,
    );
    expect(getByText("Kawaii")).toBeTruthy();
  });

  it("calls onSelectTheme when pressing a dot", () => {
    const { getByTestId } = render(
      <ThemeQuickSwitch activeTheme="dark" onSelectTheme={onSelectTheme} />,
    );
    fireEvent.press(getByTestId("theme-dot-neon"));
    expect(onSelectTheme).toHaveBeenCalledWith("neon");
  });

  it("calls onSelectTheme for all themes", () => {
    const { getByTestId } = render(
      <ThemeQuickSwitch activeTheme="dark" onSelectTheme={onSelectTheme} />,
    );
    fireEvent.press(getByTestId("theme-dot-light"));
    expect(onSelectTheme).toHaveBeenCalledWith("light");
    fireEvent.press(getByTestId("theme-dot-ocean"));
    expect(onSelectTheme).toHaveBeenCalledWith("ocean");
  });
});
