/**
 * Tests for WidgetCard & WidgetGrid — Sprint S6 Axe A
 */

import { render } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#6A54A3",
    card: "#1a1a2e",
    surface: "#1a1a2e",
    background: "#0f0a1a",
    text: "#ffffff",
    textSecondary: "#999",
    border: "#333",
    error: "#FF3B30",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: any; }) =>
      React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
  };
});

import WidgetCard from "../WidgetCard";
import WidgetGrid from "../WidgetGrid";

// ─── Fixtures ─────────────────────────────────────────────────

const makeWidget = (overrides = {}) => ({
  id: "w-1",
  type: "wallet",
  titleKey: "home.widget.wallet",
  size: "1x1",
  icon: "wallet-outline",
  order: 1,
  visible: true,
  ...overrides,
});

// ──────────────────────────────────────────────────────────────
// Suite 1: WidgetCard
// ──────────────────────────────────────────────────────────────

describe("WidgetCard", () => {
  it("renders widget title and icon", () => {
    const widget = makeWidget();
    const { getByText, getByTestId } = render(<WidgetCard widget={widget} />);

    expect(getByText("home.widget.wallet")).toBeTruthy();
    expect(getByTestId("icon-wallet-outline")).toBeTruthy();
    expect(getByTestId("widget-card-wallet")).toBeTruthy();
  });

  it("renders custom children content", () => {
    const widget = makeWidget();
    const { getByText } = render(
      <WidgetCard widget={widget}>
        <>{/* use Text from RN */}</>
      </WidgetCard>,
    );
    // With children, placeholder "—" should not appear
    expect(() => getByText("—")).toThrow();
  });

  it("renders placeholder when no children", () => {
    const widget = makeWidget();
    const { getByText } = render(<WidgetCard widget={widget} />);
    expect(getByText("—")).toBeTruthy();
  });

  it("calls onPress with widget", () => {
    const widget = makeWidget();
    const onPress = jest.fn();
    const { getByTestId } = render(
      <WidgetCard widget={widget} onPress={onPress} />,
    );

    const card = getByTestId("widget-card-wallet");
    // TouchableOpacity fires onPress
    card.props.onPress?.();
    // Since we mock it via props.onPress, let's check via fireEvent
    expect(onPress).toHaveBeenCalledWith(widget);
  });

  it("is disabled when no onPress", () => {
    const widget = makeWidget();
    const { getByTestId } = render(<WidgetCard widget={widget} />);
    const card = getByTestId("widget-card-wallet");
    expect(
      card.props.accessibilityState?.disabled ?? card.props.disabled,
    ).toBeTruthy();
  });

  it("handles all 3 sizes without crash", () => {
    for (const size of ["1x1", "2x1", "2x2"]) {
      const widget = makeWidget({ size, id: `w-${size}` });
      const { getByTestId } = render(<WidgetCard widget={widget} />);
      expect(getByTestId("widget-card-wallet")).toBeTruthy();
    }
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: WidgetGrid
// ──────────────────────────────────────────────────────────────

describe("WidgetGrid", () => {
  it("renders nothing when widgets is empty", () => {
    const { queryByTestId } = render(<WidgetGrid widgets={[]} />);
    expect(queryByTestId("widget-grid")).toBeNull();
  });

  it("renders nothing when all widgets are hidden", () => {
    const widgets = [makeWidget({ visible: false })];
    const { queryByTestId } = render(<WidgetGrid widgets={widgets} />);
    expect(queryByTestId("widget-grid")).toBeNull();
  });

  it("renders visible widgets", () => {
    const widgets = [
      makeWidget({ id: "w-1", type: "wallet", order: 1, visible: true }),
      makeWidget({ id: "w-2", type: "tasks", order: 2, visible: true }),
    ];
    const { getByTestId } = render(<WidgetGrid widgets={widgets} />);
    expect(getByTestId("widget-grid")).toBeTruthy();
    expect(getByTestId("widget-card-wallet")).toBeTruthy();
    expect(getByTestId("widget-card-tasks")).toBeTruthy();
  });

  it("groups two 1x1 widgets into single row", () => {
    const widgets = [
      makeWidget({ id: "w-1", type: "wallet", size: "1x1", order: 1 }),
      makeWidget({ id: "w-2", type: "tasks", size: "1x1", order: 2 }),
    ];
    const { getByTestId } = render(<WidgetGrid widgets={widgets} />);
    const grid = getByTestId("widget-grid");
    // One row containing both cards
    expect(grid.children.length).toBe(1);
  });

  it("places 2x1 widget on its own row", () => {
    const widgets = [
      makeWidget({ id: "w-1", type: "wallet", size: "1x1", order: 1 }),
      makeWidget({ id: "w-2", type: "friends_online", size: "2x1", order: 2 }),
      makeWidget({ id: "w-3", type: "tasks", size: "1x1", order: 3 }),
    ];
    const { getByTestId } = render(<WidgetGrid widgets={widgets} />);
    const grid = getByTestId("widget-grid");
    // 1×1 alone (orphan before 2×1), 2×1 row, 1×1 alone = 3 rows
    expect(grid.children.length).toBe(3);
  });

  it("sorts widgets by order", () => {
    const widgets = [
      makeWidget({ id: "w-2", type: "tasks", order: 2 }),
      makeWidget({ id: "w-1", type: "wallet", order: 1 }),
    ];
    const { getByTestId } = render(<WidgetGrid widgets={widgets} />);
    const grid = getByTestId("widget-grid");
    // Both sorted and paired in single row
    expect(grid.children.length).toBe(1);
  });

  it("passes renderContent to WidgetCard", () => {
    const widgets = [makeWidget({ id: "w-1" })];
    const renderContent = jest.fn(() => null);
    render(<WidgetGrid widgets={widgets} renderContent={renderContent} />);
    expect(renderContent).toHaveBeenCalledWith(widgets[0]);
  });
});
