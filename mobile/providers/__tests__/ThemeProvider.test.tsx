/**
 * Tests for ThemeProvider
 * Covers theme context, preset switching, system mode, convenience hooks
 */

import { act, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

// --- Mocks ---

// Mock AsyncStorage for Zustand persist
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock useColorScheme from react-native
let mockColorScheme: "light" | "dark" = "light";
jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  return {
    ...actual,
    useColorScheme: () => mockColorScheme,
  };
});

// Mock ui-kit tokens
jest.mock("@imuchat/ui-kit/native/tokens", () => ({
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { h1: { fontSize: 32 }, body: { fontSize: 16 } },
  borderRadius: { sm: 4, md: 8, lg: 16 },
  shadows: { sm: { elevation: 2 } },
}));

// Mock theme presets
jest.mock("@/constants/theme-presets", () => ({
  THEME_PRESETS: ["light", "dark", "kawaii", "pro", "neon", "ocean"],
  getThemePreset: (id: string) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    isDark: id === "dark" || id === "neon",
    colors: {
      background: id === "dark" ? "#000" : "#FFF",
      primary: "#007AFF",
      surface: "#F5F5F5",
      text: id === "dark" ? "#FFF" : "#000",
      border: "#E0E0E0",
      textMuted: "#999",
      error: "#FF3B30",
      warning: "#FF9500",
    },
  }),
}));

// Mock user-store
const mockPreferences = { theme: "light" as string };
const mockSetPreferences = jest.fn((partial: any) => {
  Object.assign(mockPreferences, partial);
});

jest.mock("@/stores/user-store", () => ({
  useUserStore: () => ({
    preferences: mockPreferences,
    setPreferences: mockSetPreferences,
  }),
}));

import {
  ThemeProvider,
  useColors,
  useSpacing,
  useTheme,
  useTypography,
} from "../ThemeProvider";

// Test consumer that reads theme context
function ThemeConsumer() {
  const { mode, presetId, isSystemMode } = useTheme();
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();

  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="presetId">{presetId}</Text>
      <Text testID="isSystemMode">{String(isSystemMode)}</Text>
      <Text testID="bgColor">{colors.background}</Text>
      <Text testID="spacingMd">{String(spacing.md)}</Text>
      <Text testID="typographyBody">
        {String((typography as any).body?.fontSize)}
      </Text>
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockColorScheme = "light";
  mockPreferences.theme = "light";
});

describe("ThemeProvider", () => {
  test("provides light theme by default", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId("mode").children[0]).toBe("light");
    expect(getByTestId("presetId").children[0]).toBe("light");
    expect(getByTestId("bgColor").children[0]).toBe("#FFF");
    expect(getByTestId("isSystemMode").children[0]).toBe("false");
  });

  test("provides dark theme when preference is dark", () => {
    mockPreferences.theme = "dark";

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId("mode").children[0]).toBe("dark");
    expect(getByTestId("presetId").children[0]).toBe("dark");
    expect(getByTestId("bgColor").children[0]).toBe("#000");
  });

  test("provides spacing from ui-kit tokens", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId("spacingMd").children[0]).toBe("16");
  });

  test("provides typography from ui-kit tokens", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId("typographyBody").children[0]).toBe("16");
  });

  test("system mode resolves to system color scheme", () => {
    mockPreferences.theme = "system";
    mockColorScheme = "dark";

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId("isSystemMode").children[0]).toBe("true");
    expect(getByTestId("mode").children[0]).toBe("dark");
  });

  test("system mode resolves to light when system is light", () => {
    mockPreferences.theme = "system";
    mockColorScheme = "light";

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId("isSystemMode").children[0]).toBe("true");
    expect(getByTestId("mode").children[0]).toBe("light");
  });

  test("setPreset changes the preset and persists", () => {
    function PresetChanger() {
      const { setPreset, presetId } = useTheme();
      return (
        <>
          <Text testID="presetId">{presetId}</Text>
          <Text testID="change" onPress={() => setPreset("neon")}>
            change
          </Text>
        </>
      );
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <PresetChanger />
      </ThemeProvider>,
    );

    expect(getByTestId("presetId").children[0]).toBe("light");

    act(() => {
      getByTestId("change").props.onPress();
    });

    expect(mockSetPreferences).toHaveBeenCalledWith({ theme: "neon" });
  });

  test("setSystemMode sets preference to system", () => {
    function SystemToggler() {
      const { setSystemMode, isSystemMode } = useTheme();
      return (
        <>
          <Text testID="isSystem">{String(isSystemMode)}</Text>
          <Text testID="toggle" onPress={() => setSystemMode()}>
            toggle
          </Text>
        </>
      );
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <SystemToggler />
      </ThemeProvider>,
    );

    act(() => {
      getByTestId("toggle").props.onPress();
    });

    expect(mockSetPreferences).toHaveBeenCalledWith({ theme: "system" });
  });

  test("toggleMode switches between light and dark", () => {
    function ModeToggler() {
      const { toggleMode, presetId } = useTheme();
      return (
        <>
          <Text testID="presetId">{presetId}</Text>
          <Text testID="toggle" onPress={() => toggleMode()}>
            toggle
          </Text>
        </>
      );
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <ModeToggler />
      </ThemeProvider>,
    );

    expect(getByTestId("presetId").children[0]).toBe("light");

    act(() => {
      getByTestId("toggle").props.onPress();
    });

    // light → dark
    expect(mockSetPreferences).toHaveBeenCalledWith({ theme: "dark" });
  });
});

describe("useTheme outside provider", () => {
  test("throws error when used outside ThemeProvider", () => {
    function Bad() {
      useTheme();
      return null;
    }

    // Suppress console.error for the expected error
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(
      "useTheme must be used within ThemeProvider",
    );
    spy.mockRestore();
  });
});
