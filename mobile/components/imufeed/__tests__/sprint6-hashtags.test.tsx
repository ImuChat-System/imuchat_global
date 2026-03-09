/**
 * Tests for TrendingHashtags component — Sprint S6 Axe B
 */

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  const React = require("react");

  const MockFlatList = React.forwardRef((props, ref) => {
    const {
      data,
      renderItem,
      keyExtractor,
      ListHeaderComponent,
      ListEmptyComponent,
      testID,
    } = props;
    const Header = ListHeaderComponent;
    const Empty = ListEmptyComponent;
    return React.createElement(
      actual.View,
      { testID, ref },
      Header
        ? typeof Header === "function"
          ? React.createElement(Header)
          : Header
        : null,
      data && data.length > 0
        ? data.map((item, index) => {
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
    );
  });

  return { ...actual, FlatList: MockFlatList };
});

import { render, waitFor } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#ec4899",
    surface: "#1a1a2e",
    background: "#0f0a1a",
    text: "#ffffff",
    textSecondary: "#999",
    border: "#333",
    error: "#FF3B30",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({ t: (k) => k, locale: "fr" }),
}));

const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn() }),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props) =>
      React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
  };
});

// Mock useImuFeed
const mockLoadTrendingHashtags = jest.fn();
const mockTrendingHashtags = [
  { id: "h1", name: "dance", usage_count: 5000, is_trending: true },
  { id: "h2", name: "comedy", usage_count: 3200, is_trending: true },
  { id: "h3", name: "music", usage_count: 1800, is_trending: true },
];

jest.mock("@/hooks/useImuFeed", () => ({
  useImuFeed: () => ({
    trendingHashtags: mockTrendingHashtags,
    loadTrendingHashtags: mockLoadTrendingHashtags,
  }),
}));

import TrendingHashtags from "../TrendingHashtags";

// ─── Tests ────────────────────────────────────────────────────

describe("TrendingHashtags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls loadTrendingHashtags on mount", () => {
    render(<TrendingHashtags />);
    expect(mockLoadTrendingHashtags).toHaveBeenCalled();
  });

  it("renders trending hashtag chips", async () => {
    const { getByText, getByTestId } = render(<TrendingHashtags />);

    await waitFor(() => {
      expect(getByTestId("trending-hashtags")).toBeTruthy();
    });

    expect(getByText("#dance")).toBeTruthy();
    expect(getByText("#comedy")).toBeTruthy();
    expect(getByText("#music")).toBeTruthy();
  });

  it("renders usage counts", async () => {
    const { getByText } = render(<TrendingHashtags />);

    await waitFor(() => {
      expect(getByText("5000")).toBeTruthy();
      expect(getByText("3200")).toBeTruthy();
    });
  });

  it("renders header with flame icon", () => {
    const { getByTestId, getByText } = render(<TrendingHashtags />);
    expect(getByTestId("icon-flame-outline")).toBeTruthy();
    expect(getByText("imufeed.trending")).toBeTruthy();
  });

  it("navigates to hashtag page on chip press", () => {
    const { getByTestId } = render(<TrendingHashtags />);

    const chip = getByTestId("hashtag-chip-dance");
    chip.props.onPress?.();

    expect(mockRouterPush).toHaveBeenCalledWith("/imufeed/hashtag/dance");
  });

  it("returns null when no trending hashtags", () => {
    // Override mock to return empty
    jest.spyOn(require("@/hooks/useImuFeed"), "useImuFeed").mockReturnValue({
      trendingHashtags: [],
      loadTrendingHashtags: mockLoadTrendingHashtags,
    });

    const { queryByTestId } = render(<TrendingHashtags />);
    // Component returns null => nothing rendered
    expect(queryByTestId("trending-hashtags")).toBeNull();
  });
});
