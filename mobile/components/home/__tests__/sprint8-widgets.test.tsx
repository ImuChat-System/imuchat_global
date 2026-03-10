/**
 * Tests for Sprint S8A — Widget Content Renderers (Agenda, Arena, Gaming, Weather, Tasks)
 * + WidgetManagerModal
 */

import { fireEvent, render } from "@testing-library/react-native";
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
    Ionicons: (props) =>
      React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
  };
});

jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({ t: (k) => k }),
}));

const mockAddWidget = jest.fn();
const mockRemoveWidget = jest.fn();
const mockToggleVisibility = jest.fn();
const mockWidgets = [
  {
    id: "w_wallet",
    type: "wallet",
    titleKey: "w",
    size: "1x1",
    icon: "wallet",
    order: 0,
    visible: true,
  },
  {
    id: "w_music",
    type: "music",
    titleKey: "m",
    size: "2x1",
    icon: "musical-notes",
    order: 1,
    visible: true,
  },
];

jest.mock("@/stores/home-config-store", () => ({
  useHomeConfigStore: (selector) =>
    selector({
      layout: { widgets: mockWidgets },
      addWidget: mockAddWidget,
      removeWidget: mockRemoveWidget,
      toggleWidgetVisibility: mockToggleVisibility,
    }),
}));

import { WIDGET_CONTENT_MAP } from "../widgets";
import AgendaWidgetContent from "../widgets/AgendaWidgetContent";
import ArenaWidgetContent from "../widgets/ArenaWidgetContent";
import GamingWidgetContent from "../widgets/GamingWidgetContent";
import TasksWidgetContent from "../widgets/TasksWidgetContent";
import WeatherWidgetContent from "../widgets/WeatherWidgetContent";

// ──────────────────────────────────────────────────────────────
// Suite 1: AgendaWidgetContent
// ──────────────────────────────────────────────────────────────

describe("AgendaWidgetContent", () => {
  it("renders upcoming events", () => {
    const data = {
      upcoming: [
        {
          id: "1",
          title: "Réunion",
          start_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Cours",
          start_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };
    const { getByText, getByTestId } = render(
      <AgendaWidgetContent data={data} />,
    );
    expect(getByTestId("widget-agenda-content")).toBeTruthy();
    expect(getByText("Réunion")).toBeTruthy();
    expect(getByText("Cours")).toBeTruthy();
  });

  it("renders empty state when no events", () => {
    const { getByText, getByTestId } = render(
      <AgendaWidgetContent data={{ upcoming: [] }} />,
    );
    expect(getByTestId("widget-agenda-content")).toBeTruthy();
    expect(getByText("Aucun événement")).toBeTruthy();
  });

  it("handles empty data object", () => {
    const { getByTestId } = render(<AgendaWidgetContent data={{}} />);
    expect(getByTestId("widget-agenda-content")).toBeTruthy();
  });

  it("limits display to 3 events", () => {
    const upcoming = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      title: `Event ${i}`,
      start_at: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
    }));
    const { queryByText } = render(<AgendaWidgetContent data={{ upcoming }} />);
    expect(queryByText("Event 0")).toBeTruthy();
    expect(queryByText("Event 2")).toBeTruthy();
    expect(queryByText("Event 3")).toBeNull();
  });

  it('shows "passé" for past events', () => {
    const data = {
      upcoming: [
        {
          id: "1",
          title: "Passé",
          start_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ],
    };
    const { getByText } = render(<AgendaWidgetContent data={data} />);
    expect(getByText("passé")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: ArenaWidgetContent
// ──────────────────────────────────────────────────────────────

describe("ArenaWidgetContent", () => {
  it("renders rank and points", () => {
    const data = {
      rank: 5,
      points: 1200,
      activeTournaments: 2,
      nextContest: "Battle Royale",
    };
    const { getByText, getByTestId } = render(
      <ArenaWidgetContent data={data} />,
    );
    expect(getByTestId("widget-arena-content")).toBeTruthy();
    expect(getByText("#5")).toBeTruthy();
    expect(getByText("1200")).toBeTruthy();
  });

  it("renders empty state when no data", () => {
    const { getByText, getByTestId } = render(<ArenaWidgetContent data={{}} />);
    expect(getByTestId("widget-arena-content")).toBeTruthy();
    expect(getByText("Aucun concours")).toBeTruthy();
  });

  it("shows stats when activeTournaments > 0", () => {
    const data = {
      rank: null,
      points: 0,
      activeTournaments: 3,
      nextContest: null,
    };
    const { getByText } = render(<ArenaWidgetContent data={data} />);
    expect(getByText("—")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();
  });

  it("handles rank null gracefully", () => {
    const data = {
      rank: null,
      points: 500,
      activeTournaments: 1,
      nextContest: "Quiz",
    };
    const { getByTestId } = render(<ArenaWidgetContent data={data} />);
    expect(getByTestId("widget-arena-content")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 3: GamingWidgetContent
// ──────────────────────────────────────────────────────────────

describe("GamingWidgetContent", () => {
  it("renders recent game info", () => {
    const data = {
      recentGame: {
        name: "Chess",
        score: 1500,
        played_at: new Date(Date.now() - 3600000).toISOString(),
      },
      totalGames: 42,
    };
    const { getByText, getByTestId } = render(
      <GamingWidgetContent data={data} />,
    );
    expect(getByTestId("widget-gaming-content")).toBeTruthy();
    expect(getByText("Chess")).toBeTruthy();
    expect(getByText("1500 pts")).toBeTruthy();
  });

  it("renders empty state when no recent game", () => {
    const data = { recentGame: null, totalGames: 0 };
    const { getByText, getByTestId } = render(
      <GamingWidgetContent data={data} />,
    );
    expect(getByTestId("widget-gaming-content")).toBeTruthy();
    expect(getByText("Aucune partie")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<GamingWidgetContent data={{}} />);
    expect(getByTestId("widget-gaming-content")).toBeTruthy();
  });

  it("displays total games", () => {
    const data = {
      recentGame: {
        name: "Tetris",
        score: 300,
        played_at: new Date().toISOString(),
      },
      totalGames: 100,
    };
    const { getByText } = render(<GamingWidgetContent data={data} />);
    expect(getByText(/100/)).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 4: WeatherWidgetContent
// ──────────────────────────────────────────────────────────────

describe("WeatherWidgetContent", () => {
  it("renders temperature and city", () => {
    const data = { temp: 22, condition: "sunny", city: "Paris" };
    const { getByText, getByTestId } = render(
      <WeatherWidgetContent data={data} />,
    );
    expect(getByTestId("widget-weather-content")).toBeTruthy();
    expect(getByText("22°")).toBeTruthy();
    expect(getByText("Paris")).toBeTruthy();
  });

  it("renders empty state when temp is null", () => {
    const { getByText, getByTestId } = render(
      <WeatherWidgetContent data={{ temp: null }} />,
    );
    expect(getByTestId("widget-weather-content")).toBeTruthy();
    expect(getByText("Indisponible")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<WeatherWidgetContent data={{}} />);
    expect(getByTestId("widget-weather-content")).toBeTruthy();
  });

  it("shows correct weather icon for rain", () => {
    const data = { temp: 12, condition: "rainy", city: "Lyon" };
    const { getByTestId } = render(<WeatherWidgetContent data={data} />);
    expect(getByTestId("icon-rainy")).toBeTruthy();
  });

  it("shows correct weather icon for snow", () => {
    const data = { temp: -2, condition: "snowy", city: "Méribel" };
    const { getByTestId } = render(<WeatherWidgetContent data={data} />);
    expect(getByTestId("icon-snow")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 5: TasksWidgetContent
// ──────────────────────────────────────────────────────────────

describe("TasksWidgetContent", () => {
  it("renders pending count", () => {
    const { getByText, getByTestId } = render(
      <TasksWidgetContent data={{ pendingCount: 5 }} />,
    );
    expect(getByTestId("widget-tasks-content")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
    expect(getByText("tâches en attente")).toBeTruthy();
  });

  it("renders zero state", () => {
    const { getByText, getByTestId } = render(
      <TasksWidgetContent data={{ pendingCount: 0 }} />,
    );
    expect(getByTestId("widget-tasks-content")).toBeTruthy();
    expect(getByText("Tout est fait !")).toBeTruthy();
  });

  it("handles empty data", () => {
    const { getByTestId } = render(<TasksWidgetContent data={{}} />);
    expect(getByTestId("widget-tasks-content")).toBeTruthy();
  });

  it("handles single task", () => {
    const { getByText } = render(
      <TasksWidgetContent data={{ pendingCount: 1 }} />,
    );
    expect(getByText("1")).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 6: WIDGET_CONTENT_MAP Registry
// ──────────────────────────────────────────────────────────────

describe("WIDGET_CONTENT_MAP Registry (S8A)", () => {
  it("has entries for all 5 new widget types", () => {
    expect(WIDGET_CONTENT_MAP.agenda).toBeDefined();
    expect(WIDGET_CONTENT_MAP.arena).toBeDefined();
    expect(WIDGET_CONTENT_MAP.gaming).toBeDefined();
    expect(WIDGET_CONTENT_MAP.weather).toBeDefined();
    expect(WIDGET_CONTENT_MAP.tasks).toBeDefined();
  });

  it("has 11 total entries", () => {
    const keys = Object.keys(WIDGET_CONTENT_MAP);
    expect(keys.length).toBe(11);
  });

  it("all entries are React components", () => {
    for (const [key, component] of Object.entries(WIDGET_CONTENT_MAP)) {
      expect(typeof component).toBe("function");
    }
  });
});

// ──────────────────────────────────────────────────────────────
// Suite 7: WidgetManagerModal
// ──────────────────────────────────────────────────────────────

describe("WidgetManagerModal", () => {
  // Need to import after the mock setup
  let WidgetManagerModal: any;

  beforeAll(() => {
    WidgetManagerModal = require("../WidgetManagerModal").default;
  });

  it("renders when visible", () => {
    const { getByTestId } = render(
      <WidgetManagerModal visible={true} onClose={jest.fn()} />,
    );
    expect(getByTestId("widget-manager-modal")).toBeTruthy();
  });

  it("renders list of widgets", () => {
    const { getByTestId } = render(
      <WidgetManagerModal visible={true} onClose={jest.fn()} />,
    );
    expect(getByTestId("widget-manager-list")).toBeTruthy();
  });

  it("calls onClose when close button pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <WidgetManagerModal visible={true} onClose={onClose} />,
    );
    fireEvent.press(getByTestId("widget-manager-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows switch for each catalog widget", () => {
    const { getByTestId } = render(
      <WidgetManagerModal visible={true} onClose={jest.fn()} />,
    );
    // wallet is in the mock widgets, so its switch should be "on"
    expect(getByTestId("widget-switch-wallet")).toBeTruthy();
  });
});
