/**
 * Tests for OfflineBanner component
 * Covers online/offline rendering, pending count display
 */

import { render } from "@testing-library/react-native";
import React from "react";

// --- Mocks ---

// Network state mock (mutable for per-test control)
const mockNetworkState = {
  isConnected: true,
  isInternetReachable: true,
  type: "wifi",
  isWifi: true,
  isCellular: false,
};

jest.mock("@/hooks/useNetworkState", () => ({
  useNetworkState: () => mockNetworkState,
}));

// Mock I18nProvider
jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts) return `${key}:${JSON.stringify(opts)}`;
      return key;
    },
    locale: "fr",
    setLocale: jest.fn(),
  }),
}));

// Mock ThemeProvider
jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#007AFF",
    surface: "#F5F5F5",
    background: "#FFFFFF",
    text: "#000000",
    border: "#E0E0E0",
    textMuted: "#999999",
    error: "#FF3B30",
    warning: "#FF9500",
  }),
  useSpacing: () => ({
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { OfflineBanner } from "../OfflineBanner";

beforeEach(() => {
  // Reset to online
  mockNetworkState.isConnected = true;
  mockNetworkState.isInternetReachable = true;
});

describe("OfflineBanner", () => {
  test("returns null when online and no pending count", () => {
    const { toJSON } = render(<OfflineBanner />);
    expect(toJSON()).toBeNull();
  });

  test("renders banner when offline (isConnected=false)", () => {
    mockNetworkState.isConnected = false;

    const { getByText } = render(<OfflineBanner />);
    expect(getByText("offline.noConnection")).toBeTruthy();
  });

  test("renders banner when offline (isInternetReachable=false)", () => {
    mockNetworkState.isInternetReachable = false;

    const { getByText } = render(<OfflineBanner />);
    expect(getByText("offline.noConnection")).toBeTruthy();
  });

  test("renders pending messages info when online with pending count", () => {
    // Online but has pending messages
    const { getByText } = render(<OfflineBanner showPendingCount={3} />);
    // t("offline.pendingMessages", { count: 3 }) returns key:opts string
    expect(getByText(/offline\.pendingMessages/)).toBeTruthy();
  });

  test("renders offline message (not pending) when both offline and has pending count", () => {
    mockNetworkState.isConnected = false;

    const { getByText } = render(<OfflineBanner showPendingCount={2} />);
    // When offline, shows the offline message
    expect(getByText("offline.noConnection")).toBeTruthy();
  });

  test("renders without crashing when showPendingCount is 0", () => {
    const { toJSON } = render(<OfflineBanner showPendingCount={0} />);
    // Online + no pending = null (0 is falsy)
    expect(toJSON()).toBeNull();
  });
});
