/**
 * Tests for Sprint S15A — Accessibilité & Polish
 *
 * - useReducedMotion (system pref, user override, combined, getAnimationDuration)
 * - useAccessibility (init, event subscriptions, scaledFontSize)
 * - contrast-checker (parseHexColor, relativeLuminance, contrastRatio,
 *   meetsWCAGAA, meetsWCAGAAA, getWCAGLevel, auditThemeContrast)
 */

import { act, renderHook, waitFor } from "@testing-library/react-native";

// ─── Mocks ────────────────────────────────────────────────────

// AccessibilityInfo mock
let mockReduceMotionEnabled = false;
let mockScreenReaderEnabled = false;
let mockBoldTextEnabled = false;
let mockInvertColorsEnabled = false;
let mockGrayscaleEnabled = false;
const eventListeners = {};

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Platform: { OS: "ios", select: (obj) => obj.ios },
    PixelRatio: {
      ...RN.PixelRatio,
      getFontScale: jest.fn(() => 1.0),
    },
    AccessibilityInfo: {
      isReduceMotionEnabled: jest.fn(() =>
        Promise.resolve(mockReduceMotionEnabled),
      ),
      isScreenReaderEnabled: jest.fn(() =>
        Promise.resolve(mockScreenReaderEnabled),
      ),
      isBoldTextEnabled: jest.fn(() => Promise.resolve(mockBoldTextEnabled)),
      isInvertColorsEnabled: jest.fn(() =>
        Promise.resolve(mockInvertColorsEnabled),
      ),
      isGrayscaleEnabled: jest.fn(() => Promise.resolve(mockGrayscaleEnabled)),
      addEventListener: jest.fn((eventName, handler) => {
        if (!eventListeners[eventName]) eventListeners[eventName] = [];
        eventListeners[eventName].push(handler);
        return {
          remove: jest.fn(() => {
            const idx = eventListeners[eventName]?.indexOf(handler);
            if (idx >= 0) eventListeners[eventName].splice(idx, 1);
          }),
        };
      }),
    },
  };
});

function fireAccessibilityEvent(eventName, value) {
  (eventListeners[eventName] || []).forEach((fn) => fn(value));
}

jest.mock("@/providers/ThemeProvider", () => ({
  useColors: () => ({
    primary: "#6A54A3",
    card: "#1a1a2e",
    surface: "#1a1a2e",
    background: "#0f0a1a",
    text: "#ffffff",
    textMuted: "#888888",
    textSecondary: "#999999",
    border: "#333",
    error: "#FF3B30",
    success: "#34C759",
  }),
  useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// ─── Imports ──────────────────────────────────────────────────

import { scaledFontSize, useAccessibility } from "@/hooks/useAccessibility";
import {
  getAnimationDuration,
  useReducedMotion,
} from "@/hooks/useReducedMotion";
import {
  auditThemeContrast,
  contrastRatio,
  getWCAGLevel,
  meetsWCAGAA,
  meetsWCAGAAA,
  parseHexColor,
  relativeLuminance,
} from "@/utils/contrast-checker";
import { PixelRatio } from "react-native";

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  mockReduceMotionEnabled = false;
  mockScreenReaderEnabled = false;
  mockBoldTextEnabled = false;
  mockInvertColorsEnabled = false;
  mockGrayscaleEnabled = false;
  // Clear event listeners
  Object.keys(eventListeners).forEach((key) => {
    eventListeners[key] = [];
  });
});

// ═══════════════════════════════════════════════════════════════
// useReducedMotion
// ═══════════════════════════════════════════════════════════════

describe("useReducedMotion", () => {
  it("returns false when system preference is off", async () => {
    const { result } = renderHook(() => useReducedMotion());
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("returns true when system preference is on", async () => {
    mockReduceMotionEnabled = true;
    const { result } = renderHook(() => useReducedMotion());
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("returns true when user pref override is true", async () => {
    mockReduceMotionEnabled = false;
    const { result } = renderHook(() => useReducedMotion(true));
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("returns true when both system and user pref are true", async () => {
    mockReduceMotionEnabled = true;
    const { result } = renderHook(() => useReducedMotion(true));
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("responds to system change events", async () => {
    const { result } = renderHook(() => useReducedMotion());
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
    await act(async () => {
      fireAccessibilityEvent("reduceMotionChanged", true);
    });
    expect(result.current).toBe(true);
  });

  it("cleans up subscription on unmount", async () => {
    const { unmount } = renderHook(() => useReducedMotion());
    // One listener for reduceMotionChanged
    expect(eventListeners["reduceMotionChanged"]?.length).toBe(1);
    unmount();
    expect(eventListeners["reduceMotionChanged"]?.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// getAnimationDuration
// ═══════════════════════════════════════════════════════════════

describe("getAnimationDuration", () => {
  it("returns base duration when not reduced", () => {
    expect(getAnimationDuration(300, false)).toBe(300);
  });

  it("returns 0 when reduced and no minDuration", () => {
    expect(getAnimationDuration(300, true)).toBe(0);
  });

  it("returns minDuration when reduced", () => {
    expect(getAnimationDuration(300, true, 50)).toBe(50);
  });

  it("returns base when not reduced regardless of minDuration", () => {
    expect(getAnimationDuration(300, false, 50)).toBe(300);
  });
});

// ═══════════════════════════════════════════════════════════════
// useAccessibility
// ═══════════════════════════════════════════════════════════════

describe("useAccessibility", () => {
  it("returns default state initially", () => {
    const { result } = renderHook(() => useAccessibility());
    expect(result.current.isReducedMotion).toBe(false);
    expect(result.current.isScreenReaderEnabled).toBe(false);
    expect(result.current.fontScale).toBe(1);
    expect(result.current.isBoldTextEnabled).toBe(false);
    expect(result.current.isInvertColorsEnabled).toBe(false);
    expect(result.current.isGrayscaleEnabled).toBe(false);
  });

  it("initializes from system values", async () => {
    mockReduceMotionEnabled = true;
    mockScreenReaderEnabled = true;
    mockBoldTextEnabled = true;
    (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.5);

    const { result } = renderHook(() => useAccessibility());
    await waitFor(() => {
      expect(result.current.isReducedMotion).toBe(true);
    });
    expect(result.current.isScreenReaderEnabled).toBe(true);
    expect(result.current.isBoldTextEnabled).toBe(true);
    expect(result.current.fontScale).toBe(1.5);
  });

  it("responds to reduceMotionChanged event", async () => {
    const { result } = renderHook(() => useAccessibility());
    await waitFor(() => {
      expect(result.current.isReducedMotion).toBe(false);
    });
    await act(async () => {
      fireAccessibilityEvent("reduceMotionChanged", true);
    });
    expect(result.current.isReducedMotion).toBe(true);
  });

  it("responds to screenReaderChanged event", async () => {
    const { result } = renderHook(() => useAccessibility());
    await waitFor(() => {
      expect(result.current.isScreenReaderEnabled).toBe(false);
    });
    await act(async () => {
      fireAccessibilityEvent("screenReaderChanged", true);
    });
    expect(result.current.isScreenReaderEnabled).toBe(true);
  });

  it("responds to invertColorsChanged event (iOS)", async () => {
    const { result } = renderHook(() => useAccessibility());
    await waitFor(() => {
      expect(result.current.isInvertColorsEnabled).toBe(false);
    });
    await act(async () => {
      fireAccessibilityEvent("invertColorsChanged", true);
    });
    expect(result.current.isInvertColorsEnabled).toBe(true);
  });

  it("responds to grayscaleChanged event (iOS)", async () => {
    const { result } = renderHook(() => useAccessibility());
    await waitFor(() => {
      expect(result.current.isGrayscaleEnabled).toBe(false);
    });
    await act(async () => {
      fireAccessibilityEvent("grayscaleChanged", true);
    });
    expect(result.current.isGrayscaleEnabled).toBe(true);
  });

  it("responds to boldTextChanged event (iOS)", async () => {
    const { result } = renderHook(() => useAccessibility());
    await waitFor(() => {
      expect(result.current.isBoldTextEnabled).toBe(false);
    });
    await act(async () => {
      fireAccessibilityEvent("boldTextChanged", true);
    });
    expect(result.current.isBoldTextEnabled).toBe(true);
  });

  it("cleans up all subscriptions on unmount", async () => {
    const { unmount } = renderHook(() => useAccessibility());
    await waitFor(() => {});
    // iOS: reduceMotionChanged, screenReaderChanged, invertColorsChanged, grayscaleChanged, boldTextChanged
    expect(
      eventListeners["reduceMotionChanged"]?.length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      eventListeners["screenReaderChanged"]?.length,
    ).toBeGreaterThanOrEqual(1);
    unmount();
    expect(eventListeners["reduceMotionChanged"]?.length).toBe(0);
    expect(eventListeners["screenReaderChanged"]?.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// scaledFontSize
// ═══════════════════════════════════════════════════════════════

describe("scaledFontSize", () => {
  it("returns base size when scale is 1", () => {
    expect(scaledFontSize(16, 1)).toBe(16);
  });

  it("scales up proportionally", () => {
    expect(scaledFontSize(16, 1.5)).toBe(24);
  });

  it("caps at maxScale", () => {
    expect(scaledFontSize(16, 3.0, 2.0)).toBe(32);
  });

  it("rounds to nearest integer", () => {
    expect(scaledFontSize(15, 1.3)).toBe(20); // 15 * 1.3 = 19.5 → 20
  });
});

// ═══════════════════════════════════════════════════════════════
// parseHexColor
// ═══════════════════════════════════════════════════════════════

describe("parseHexColor", () => {
  it("parses #RRGGBB", () => {
    expect(parseHexColor("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHexColor("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(parseHexColor("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("parses #RGB shorthand", () => {
    expect(parseHexColor("#F00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHexColor("#0F0")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("parses #RRGGBBAA (strips alpha)", () => {
    expect(parseHexColor("#FF000080")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses without # prefix", () => {
    expect(parseHexColor("FF0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns black for invalid hex", () => {
    expect(parseHexColor("#ZZZZZZ")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("parses white correctly", () => {
    expect(parseHexColor("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("parses black correctly", () => {
    expect(parseHexColor("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

// ═══════════════════════════════════════════════════════════════
// relativeLuminance
// ═══════════════════════════════════════════════════════════════

describe("relativeLuminance", () => {
  it("returns 0 for black", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 3);
  });

  it("returns 1 for white", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 3);
  });

  it("returns ~0.2126 for pure red", () => {
    expect(relativeLuminance("#FF0000")).toBeCloseTo(0.2126, 3);
  });

  it("returns ~0.7152 for pure green", () => {
    expect(relativeLuminance("#00FF00")).toBeCloseTo(0.7152, 3);
  });

  it("returns ~0.0722 for pure blue", () => {
    expect(relativeLuminance("#0000FF")).toBeCloseTo(0.0722, 3);
  });
});

// ═══════════════════════════════════════════════════════════════
// contrastRatio
// ═══════════════════════════════════════════════════════════════

describe("contrastRatio", () => {
  it("returns 21 for black vs white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });

  it("returns 1 for same color", () => {
    expect(contrastRatio("#FF0000", "#FF0000")).toBeCloseTo(1, 0);
  });

  it("is commutative", () => {
    const ratio1 = contrastRatio("#333333", "#FFFFFF");
    const ratio2 = contrastRatio("#FFFFFF", "#333333");
    expect(ratio1).toBeCloseTo(ratio2, 5);
  });

  it("returns meaningful value for mid-gray vs white", () => {
    const ratio = contrastRatio("#767676", "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

// ═══════════════════════════════════════════════════════════════
// meetsWCAGAA & meetsWCAGAAA
// ═══════════════════════════════════════════════════════════════

describe("meetsWCAGAA", () => {
  it("passes for black on white (21:1)", () => {
    expect(meetsWCAGAA("#000000", "#FFFFFF")).toBe(true);
  });

  it("fails for light gray on white", () => {
    expect(meetsWCAGAA("#CCCCCC", "#FFFFFF")).toBe(false);
  });

  it("uses relaxed ratio (3:1) for large text", () => {
    // #767676 on white ≈ 4.54:1 → passes normal & large
    expect(meetsWCAGAA("#767676", "#FFFFFF", true)).toBe(true);
  });

  it("fails when ratio is below 4.5:1 for normal text", () => {
    // #888888 on white ≈ 3.54:1 → fails normal text
    expect(meetsWCAGAA("#888888", "#FFFFFF", false)).toBe(false);
  });
});

describe("meetsWCAGAAA", () => {
  it("passes for black on white (21:1)", () => {
    expect(meetsWCAGAAA("#000000", "#FFFFFF")).toBe(true);
  });

  it("fails for medium contrast pair", () => {
    // #767676 on white ≈ 4.54:1 → fails AAA (needs 7:1)
    expect(meetsWCAGAAA("#767676", "#FFFFFF")).toBe(false);
  });

  it("uses relaxed ratio (4.5:1) for large text AAA", () => {
    expect(meetsWCAGAAA("#767676", "#FFFFFF", true)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// getWCAGLevel
// ═══════════════════════════════════════════════════════════════

describe("getWCAGLevel", () => {
  it("returns AAA for black on white", () => {
    expect(getWCAGLevel("#000000", "#FFFFFF")).toBe("AAA");
  });

  it("returns AA for mid-contrast pair", () => {
    // #767676 on white ≈ 4.54:1 → AA but not AAA
    expect(getWCAGLevel("#767676", "#FFFFFF")).toBe("AA");
  });

  it("returns fail for low contrast", () => {
    expect(getWCAGLevel("#CCCCCC", "#FFFFFF")).toBe("fail");
  });

  it("returns AAA for high contrast with large text flag", () => {
    // #767676 on white ≈ 4.54:1 → AAA for large text (threshold 4.5)
    expect(getWCAGLevel("#767676", "#FFFFFF", true)).toBe("AAA");
  });
});

// ═══════════════════════════════════════════════════════════════
// auditThemeContrast
// ═══════════════════════════════════════════════════════════════

describe("auditThemeContrast", () => {
  it("audits a high-contrast theme (white text on dark bg)", () => {
    const colors = {
      text: "#FFFFFF",
      textMuted: "#AAAAAA",
      textSecondary: "#BBBBBB",
      background: "#000000",
      card: "#111111",
      primary: "#6A54A3",
      error: "#FF3B30",
      success: "#34C759",
    };

    const results = auditThemeContrast(colors);
    expect(results.length).toBeGreaterThanOrEqual(6);

    // text/background: white on black → 21:1 → AAA
    const textBg = results.find((r) => r.name === "text/background");
    expect(textBg).toBeDefined();
    expect(textBg!.level).toBe("AAA");
    expect(textBg!.passes).toBe(true);
    expect(textBg!.ratio).toBeCloseTo(21, 0);
  });

  it("returns entries with correct structure", () => {
    const colors = {
      text: "#FFFFFF",
      textMuted: "#AAAAAA",
      textSecondary: "#999999",
      background: "#000000",
      card: "#1a1a2e",
      primary: "#6A54A3",
      error: "#FF3B30",
      success: "#34C759",
    };

    const results = auditThemeContrast(colors);
    for (const entry of results) {
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("fg");
      expect(entry).toHaveProperty("bg");
      expect(entry).toHaveProperty("ratio");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("passes");
      expect(typeof entry.ratio).toBe("number");
      expect(["AAA", "AA", "fail"]).toContain(entry.level);
    }
  });

  it("skips pairs with missing colors", () => {
    const colors = {
      text: "#FFFFFF",
      background: "#000000",
      // Missing: textMuted, textSecondary, card, primary, error, success
    };

    const results = auditThemeContrast(colors);
    // Only text/background should be present
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("text/background");
  });

  it("detects failing pairs in a low-contrast theme", () => {
    const colors = {
      text: "#CCCCCC",
      textMuted: "#BBBBBB",
      textSecondary: "#AAAAAA",
      background: "#EEEEEE",
      card: "#DDDDDD",
      primary: "#CCCCCC",
      error: "#DDDDDD",
      success: "#CCCCCC",
    };

    const results = auditThemeContrast(colors);
    const hasFailures = results.some((r) => !r.passes);
    expect(hasFailures).toBe(true);
  });
});
