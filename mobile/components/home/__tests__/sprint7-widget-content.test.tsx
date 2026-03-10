/**
 * Tests for Sprint S7A — Widget Content Renderers + Registry
 */

import { render } from "@testing-library/react-native";
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
    Ionicons: (props: { name: string }) =>
      React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
  };
});

import { renderWidgetContent, WIDGET_CONTENT_MAP } from "../widgets";
import AITipsWidgetContent from "../widgets/AITipsWidgetContent";
import FriendsOnlineWidgetContent from "../widgets/FriendsOnlineWidgetContent";
import MusicWidgetContent from "../widgets/MusicWidgetContent";
import RecapWidgetContent from "../widgets/RecapWidgetContent";
import ScreenTimeWidgetContent from "../widgets/ScreenTimeWidgetContent";
import WalletWidgetContent from "../widgets/WalletWidgetContent";

// ──────────────────────────────────────────────────────────────
// Suite 1: WalletWidgetContent
// ──────────────────────────────────────────────────────────────

describe("WalletWidgetContent", () => {
  it("renders balance and currency", () => {
    const { getByText, getByTestId } = render(
      <WalletWidgetContent data={{ balance: 1250.5, currency: "EUR" }} />,
    );
    expect(getByTestId("widget-wallet-content")).toBeTruthy();
    expect(getByText("EUR")).toBeTruthy();
  });

  it("formats large balance with K suffix", () => {
    const { getByText } = render(
      <WalletWidgetContent data={{ balance: 5400, currency: "USD" }} />,
    );
    expect(getByText(/5\.4K/)).toBeTruthy();
  });

  it("formats million balance with M suffix", () => {
    const { getByText } = render(
      <WalletWidgetContent data={{ balance: 2300000, currency: "XOF" }} />,
    );
    expect(getByText(/2\.3M/)).toBeTruthy();
  });

  it("handles zero balance", () => {
    const { getByText } = render(
      <WalletWidgetContent data={{ balance: 0, currency: "EUR" }} />,
    );
    expect(getByText("0")).toBeTruthy();
  });

  it("handles empty data gracefully", () => {
    const { getByTestId } = render(<WalletWidgetContent data={{}} />);
    expect(getByTestId("widget-wallet-content")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: MusicWidgetContent
// ──────────────────────────────────────────────────────────────

describe("MusicWidgetContent", () => {
  it("shows now playing track", () => {
    const { getByText, getByTestId } = render(
      <MusicWidgetContent
        data={{
          nowPlaying: {
            title: "Blinding Lights",
            artist: "The Weeknd",
            isPlaying: true,
          },
        }}
      />,
    );
    expect(getByTestId("widget-music-content")).toBeTruthy();
    expect(getByText("Blinding Lights")).toBeTruthy();
    expect(getByText("The Weeknd")).toBeTruthy();
  });

  it("shows pause-circle icon when playing", () => {
    const { getByTestId } = render(
      <MusicWidgetContent
        data={{ nowPlaying: { title: "A", artist: "B", isPlaying: true } }}
      />,
    );
    expect(getByTestId("icon-pause-circle")).toBeTruthy();
  });

  it("shows play-circle icon when paused", () => {
    const { getByTestId } = render(
      <MusicWidgetContent
        data={{ nowPlaying: { title: "A", artist: "B", isPlaying: false } }}
      />,
    );
    expect(getByTestId("icon-play-circle")).toBeTruthy();
  });

  it("shows empty state when no track", () => {
    const { getByTestId } = render(
      <MusicWidgetContent data={{ nowPlaying: null }} />,
    );
    expect(getByTestId("widget-music-content")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<MusicWidgetContent data={{}} />);
    expect(getByTestId("widget-music-content")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 3: FriendsOnlineWidgetContent
// ──────────────────────────────────────────────────────────────

describe("FriendsOnlineWidgetContent", () => {
  it("shows online count and indicator", () => {
    const { getByText, getByTestId } = render(
      <FriendsOnlineWidgetContent data={{ onlineCount: 5 }} />,
    );
    expect(getByTestId("widget-friends-content")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
  });

  it("shows singular form for 1 friend", () => {
    const { getByText } = render(
      <FriendsOnlineWidgetContent data={{ onlineCount: 1 }} />,
    );
    expect(getByText("1")).toBeTruthy();
  });

  it("shows empty state when no friends online", () => {
    const { getByTestId } = render(
      <FriendsOnlineWidgetContent data={{ onlineCount: 0 }} />,
    );
    expect(getByTestId("widget-friends-content")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<FriendsOnlineWidgetContent data={{}} />);
    expect(getByTestId("widget-friends-content")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 4: RecapWidgetContent
// ──────────────────────────────────────────────────────────────

describe("RecapWidgetContent", () => {
  const sampleData = {
    unreadCount: 3,
    recent: [
      { id: "n1", title: "Msg from Alice", icon: "chatbubble", time: "2m" },
      { id: "n2", title: "Missed call", icon: "call", time: "1h" },
    ],
  };

  it("shows unread badge and recent items", () => {
    const { getByText, getByTestId } = render(
      <RecapWidgetContent data={sampleData} />,
    );
    expect(getByTestId("widget-recap-content")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("Msg from Alice")).toBeTruthy();
    expect(getByText("Missed call")).toBeTruthy();
  });

  it("shows zero badge with no unread", () => {
    const { getByTestId } = render(
      <RecapWidgetContent data={{ unreadCount: 0, recent: [] }} />,
    );
    expect(getByTestId("widget-recap-content")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<RecapWidgetContent data={{}} />);
    expect(getByTestId("widget-recap-content")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 5: ScreenTimeWidgetContent
// ──────────────────────────────────────────────────────────────

describe("ScreenTimeWidgetContent", () => {
  it("formats hours correctly", () => {
    const { getByText, getByTestId } = render(
      <ScreenTimeWidgetContent data={{ todayMinutes: 125 }} />,
    );
    expect(getByTestId("widget-screentime-content")).toBeTruthy();
    expect(getByText(/2h05/)).toBeTruthy();
  });

  it("formats minutes under an hour", () => {
    const { getByText } = render(
      <ScreenTimeWidgetContent data={{ todayMinutes: 45 }} />,
    );
    expect(getByText(/45/)).toBeTruthy();
  });

  it("formats exact hours", () => {
    const { getByText } = render(
      <ScreenTimeWidgetContent data={{ todayMinutes: 60 }} />,
    );
    expect(getByText(/1h/)).toBeTruthy();
  });

  it("handles zero minutes", () => {
    const { getByTestId } = render(
      <ScreenTimeWidgetContent data={{ todayMinutes: 0 }} />,
    );
    expect(getByTestId("widget-screentime-content")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<ScreenTimeWidgetContent data={{}} />);
    expect(getByTestId("widget-screentime-content")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 6: AITipsWidgetContent
// ──────────────────────────────────────────────────────────────

describe("AITipsWidgetContent", () => {
  it("shows tip text", () => {
    const { getByText, getByTestId } = render(
      <AITipsWidgetContent data={{ tip: "Prends une pause toutes les 2h" }} />,
    );
    expect(getByTestId("widget-aitips-content")).toBeTruthy();
    expect(getByText("Prends une pause toutes les 2h")).toBeTruthy();
  });

  it("shows fallback when no tip", () => {
    const { getByTestId } = render(
      <AITipsWidgetContent data={{ tip: null }} />,
    );
    expect(getByTestId("widget-aitips-content")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<AITipsWidgetContent data={{}} />);
    expect(getByTestId("widget-aitips-content")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 7: Widget Content Registry
// ──────────────────────────────────────────────────────────────

describe("Widget Content Registry", () => {
  it("has entries for all 6 widget types", () => {
    expect(WIDGET_CONTENT_MAP.wallet).toBeDefined();
    expect(WIDGET_CONTENT_MAP.music).toBeDefined();
    expect(WIDGET_CONTENT_MAP.friends_online).toBeDefined();
    expect(WIDGET_CONTENT_MAP.recap).toBeDefined();
    expect(WIDGET_CONTENT_MAP.screen_time).toBeDefined();
    expect(WIDGET_CONTENT_MAP.ai_tips).toBeDefined();
  });

  it("renderWidgetContent returns content for known widget", () => {
    const widget = {
      id: "w-1",
      type: "wallet" as const,
      titleKey: "home.widget.wallet",
      size: "1x1" as const,
      icon: "wallet-outline",
      order: 1,
      visible: true,
      data: { balance: 100, currency: "EUR" },
    };
    const result = renderWidgetContent(widget);
    expect(result).not.toBeNull();
  });

  it("renderWidgetContent returns null for unknown widget type", () => {
    const widget = {
      id: "w-x",
      type: "unknown_type_xyz" as any,
      titleKey: "home.widget.unknown",
      size: "1x1" as const,
      icon: "help-outline",
      order: 1,
      visible: true,
    };
    const result = renderWidgetContent(widget);
    expect(result).toBeNull();
  });

  it("renderWidgetContent handles widget without data", () => {
    const widget = {
      id: "w-1",
      type: "wallet" as const,
      titleKey: "home.widget.wallet",
      size: "1x1" as const,
      icon: "wallet-outline",
      order: 1,
      visible: true,
    };
    const result = renderWidgetContent(widget);
    expect(result).not.toBeNull();
  });
});
