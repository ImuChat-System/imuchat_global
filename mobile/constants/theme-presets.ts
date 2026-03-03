/**
 * Theme Presets
 * 6 predefined themes for the app: Light, Dark, Kawaii, Pro, Neon, Ocean
 * Each theme defines a complete color palette
 */

// Theme preset identifiers
export const THEME_PRESETS = [
    "light",
    "dark",
    "kawaii",
    "pro",
    "neon",
    "ocean",
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number];

// Color palette structure (matches ui-kit tokens)
export interface ThemeColors {
    // Backgrounds
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceHover: string;
    surfaceActive: string;

    // Primary accent
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryGradientEnd: string;

    // Secondary accent
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;

    // Semantic
    success: string;
    successHover: string;
    warning: string;
    warningHover: string;
    error: string;
    errorHover: string;
    danger: string;
    info: string;
    infoHover: string;

    // Surfaces
    card: string;

    // Text
    text: string;
    textMuted: string;
    textSecondary: string;
    secondaryText: string;
    textSubtle: string;
    textDisabled: string;

    // Borders
    border: string;
    borderHover: string;
    borderFocus: string;

    // Status
    online: string;
    away: string;
    busy: string;
    offline: string;

    // Overlay
    transparent: string;
    overlay: string;
    overlayDark: string;
}

export interface ThemePreset {
    id: ThemePresetId;
    name: string;
    description: string;
    emoji: string;
    isDark: boolean;
    colors: ThemeColors;
}

// ============ LIGHT THEME ============
const lightColors: ThemeColors = {
    // Backgrounds
    background: "#ffffff",
    backgroundSecondary: "#f8f9fa",
    surface: "rgba(0,0,0,0.03)",
    surfaceHover: "rgba(0,0,0,0.06)",
    surfaceActive: "rgba(0,0,0,0.09)",

    // Primary (Blue)
    primary: "#3b82f6",
    primaryHover: "#60a5fa",
    primaryActive: "#2563eb",
    primaryGradientEnd: "#8b5cf6",

    // Secondary (Teal)
    secondary: "#14b8a6",
    secondaryHover: "#2dd4bf",
    secondaryActive: "#0d9488",

    // Semantic
    success: "#22c55e",
    successHover: "#4ade80",
    warning: "#f59e0b",
    warningHover: "#fbbf24",
    error: "#ef4444",
    errorHover: "#f87171",
    danger: "#ef4444",
    info: "#3b82f6",
    infoHover: "#60a5fa",

    // Surfaces
    card: "#ffffff",

    // Text
    text: "#1f2937",
    textMuted: "rgba(31,41,55,0.7)",
    textSecondary: "rgba(31,41,55,0.6)",
    secondaryText: "rgba(31,41,55,0.6)",
    textSubtle: "rgba(31,41,55,0.5)",
    textDisabled: "rgba(31,41,55,0.35)",

    // Borders
    border: "rgba(0,0,0,0.1)",
    borderHover: "rgba(0,0,0,0.2)",
    borderFocus: "#3b82f6",

    // Status
    online: "#22c55e",
    away: "#f59e0b",
    busy: "#ef4444",
    offline: "rgba(31,41,55,0.4)",

    // Overlay
    transparent: "transparent",
    overlay: "rgba(0,0,0,0.3)",
    overlayDark: "rgba(0,0,0,0.6)",
};

// ============ DARK THEME ============
const darkColors: ThemeColors = {
    // Backgrounds
    background: "#0f0a1a",
    backgroundSecondary: "#1a1425",
    surface: "rgba(255,255,255,0.05)",
    surfaceHover: "rgba(255,255,255,0.1)",
    surfaceActive: "rgba(255,255,255,0.15)",

    // Primary (Pink)
    primary: "#ec4899",
    primaryHover: "#f472b6",
    primaryActive: "#db2777",
    primaryGradientEnd: "#a855f7",

    // Secondary (Cyan)
    secondary: "#06b6d4",
    secondaryHover: "#22d3ee",
    secondaryActive: "#0891b2",

    // Semantic
    success: "#22c55e",
    successHover: "#4ade80",
    warning: "#f59e0b",
    warningHover: "#fbbf24",
    error: "#ef4444",
    errorHover: "#f87171",
    danger: "#ef4444",
    info: "#3b82f6",
    infoHover: "#60a5fa",

    // Surfaces
    card: "#1a1425",

    // Text
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.6)",
    textSecondary: "rgba(255,255,255,0.55)",
    secondaryText: "rgba(255,255,255,0.55)",
    textSubtle: "rgba(255,255,255,0.4)",
    textDisabled: "rgba(255,255,255,0.25)",

    // Borders
    border: "rgba(255,255,255,0.1)",
    borderHover: "rgba(255,255,255,0.2)",
    borderFocus: "#ec4899",

    // Status
    online: "#22c55e",
    away: "#f59e0b",
    busy: "#ef4444",
    offline: "rgba(255,255,255,0.4)",

    // Overlay
    transparent: "transparent",
    overlay: "rgba(0,0,0,0.5)",
    overlayDark: "rgba(0,0,0,0.8)",
};

// ============ KAWAII THEME ============
const kawaiiColors: ThemeColors = {
    // Backgrounds (soft pink/cream)
    background: "#fff5f7",
    backgroundSecondary: "#ffe4ec",
    surface: "rgba(236,72,153,0.08)",
    surfaceHover: "rgba(236,72,153,0.12)",
    surfaceActive: "rgba(236,72,153,0.18)",

    // Primary (Soft Pink)
    primary: "#f472b6",
    primaryHover: "#f9a8d4",
    primaryActive: "#ec4899",
    primaryGradientEnd: "#c084fc",

    // Secondary (Lavender)
    secondary: "#a78bfa",
    secondaryHover: "#c4b5fd",
    secondaryActive: "#8b5cf6",

    // Semantic
    success: "#86efac",
    successHover: "#bbf7d0",
    warning: "#fcd34d",
    warningHover: "#fde68a",
    error: "#fca5a5",
    errorHover: "#fecaca",
    danger: "#fca5a5",
    info: "#93c5fd",
    infoHover: "#bfdbfe",

    // Surfaces
    card: "#fff0f3",

    // Text
    text: "#831843",
    textMuted: "rgba(131,24,67,0.7)",
    textSecondary: "rgba(131,24,67,0.6)",
    secondaryText: "rgba(131,24,67,0.6)",
    textSubtle: "rgba(131,24,67,0.5)",
    textDisabled: "rgba(131,24,67,0.35)",

    // Borders
    border: "rgba(236,72,153,0.2)",
    borderHover: "rgba(236,72,153,0.35)",
    borderFocus: "#f472b6",

    // Status
    online: "#86efac",
    away: "#fcd34d",
    busy: "#fca5a5",
    offline: "rgba(131,24,67,0.35)",

    // Overlay
    transparent: "transparent",
    overlay: "rgba(131,24,67,0.25)",
    overlayDark: "rgba(131,24,67,0.5)",
};

// ============ PRO THEME ============
const proColors: ThemeColors = {
    // Backgrounds (slate/gray professional)
    background: "#1e293b",
    backgroundSecondary: "#0f172a",
    surface: "rgba(148,163,184,0.08)",
    surfaceHover: "rgba(148,163,184,0.12)",
    surfaceActive: "rgba(148,163,184,0.18)",

    // Primary (Corporate Blue)
    primary: "#0ea5e9",
    primaryHover: "#38bdf8",
    primaryActive: "#0284c7",
    primaryGradientEnd: "#6366f1",

    // Secondary (Slate)
    secondary: "#64748b",
    secondaryHover: "#94a3b8",
    secondaryActive: "#475569",

    // Semantic
    success: "#10b981",
    successHover: "#34d399",
    warning: "#f59e0b",
    warningHover: "#fbbf24",
    error: "#ef4444",
    errorHover: "#f87171",
    danger: "#ef4444",
    info: "#0ea5e9",
    infoHover: "#38bdf8",

    // Surfaces
    card: "#1e293b",

    // Text
    text: "#f1f5f9",
    textMuted: "rgba(241,245,249,0.7)",
    textSecondary: "rgba(241,245,249,0.6)",
    secondaryText: "rgba(241,245,249,0.6)",
    textSubtle: "rgba(241,245,249,0.5)",
    textDisabled: "rgba(241,245,249,0.35)",

    // Borders
    border: "rgba(148,163,184,0.15)",
    borderHover: "rgba(148,163,184,0.25)",
    borderFocus: "#0ea5e9",

    // Status
    online: "#10b981",
    away: "#f59e0b",
    busy: "#ef4444",
    offline: "rgba(241,245,249,0.4)",

    // Overlay
    transparent: "transparent",
    overlay: "rgba(0,0,0,0.5)",
    overlayDark: "rgba(0,0,0,0.75)",
};

// ============ NEON THEME ============
const neonColors: ThemeColors = {
    // Backgrounds (deep purple/black)
    background: "#0c0015",
    backgroundSecondary: "#15002a",
    surface: "rgba(168,85,247,0.1)",
    surfaceHover: "rgba(168,85,247,0.18)",
    surfaceActive: "rgba(168,85,247,0.25)",

    // Primary (Neon Green)
    primary: "#4ade80",
    primaryHover: "#86efac",
    primaryActive: "#22c55e",
    primaryGradientEnd: "#f472b6",

    // Secondary (Hot Pink)
    secondary: "#f472b6",
    secondaryHover: "#f9a8d4",
    secondaryActive: "#ec4899",

    // Semantic
    success: "#4ade80",
    successHover: "#86efac",
    warning: "#facc15",
    warningHover: "#fde047",
    error: "#f87171",
    errorHover: "#fca5a5",
    danger: "#f87171",
    info: "#60a5fa",
    infoHover: "#93c5fd",

    // Surfaces
    card: "#15002a",

    // Text
    text: "#f0fdf4",
    textMuted: "rgba(240,253,244,0.75)",
    textSecondary: "rgba(240,253,244,0.65)",
    secondaryText: "rgba(240,253,244,0.65)",
    textSubtle: "rgba(240,253,244,0.5)",
    textDisabled: "rgba(240,253,244,0.3)",

    // Borders
    border: "rgba(168,85,247,0.3)",
    borderHover: "rgba(168,85,247,0.5)",
    borderFocus: "#4ade80",

    // Status
    online: "#4ade80",
    away: "#facc15",
    busy: "#f87171",
    offline: "rgba(240,253,244,0.35)",

    // Overlay
    transparent: "transparent",
    overlay: "rgba(12,0,21,0.6)",
    overlayDark: "rgba(12,0,21,0.85)",
};

// ============ OCEAN THEME ============
const oceanColors: ThemeColors = {
    // Backgrounds (deep blue-green)
    background: "#042f2e",
    backgroundSecondary: "#022c22",
    surface: "rgba(20,184,166,0.1)",
    surfaceHover: "rgba(20,184,166,0.15)",
    surfaceActive: "rgba(20,184,166,0.22)",

    // Primary (Teal)
    primary: "#14b8a6",
    primaryHover: "#2dd4bf",
    primaryActive: "#0d9488",
    primaryGradientEnd: "#06b6d4",

    // Secondary (Cyan)
    secondary: "#06b6d4",
    secondaryHover: "#22d3ee",
    secondaryActive: "#0891b2",

    // Semantic
    success: "#34d399",
    successHover: "#6ee7b7",
    warning: "#fbbf24",
    warningHover: "#fcd34d",
    error: "#f87171",
    errorHover: "#fca5a5",
    danger: "#f87171",
    info: "#38bdf8",
    infoHover: "#7dd3fc",

    // Surfaces
    card: "#022c22",

    // Text
    text: "#f0fdfa",
    textMuted: "rgba(240,253,250,0.75)",
    textSecondary: "rgba(240,253,250,0.65)",
    secondaryText: "rgba(240,253,250,0.65)",
    textSubtle: "rgba(240,253,250,0.5)",
    textDisabled: "rgba(240,253,250,0.3)",

    // Borders
    border: "rgba(20,184,166,0.25)",
    borderHover: "rgba(20,184,166,0.4)",
    borderFocus: "#14b8a6",

    // Status
    online: "#34d399",
    away: "#fbbf24",
    busy: "#f87171",
    offline: "rgba(240,253,250,0.35)",

    // Overlay
    transparent: "transparent",
    overlay: "rgba(4,47,46,0.6)",
    overlayDark: "rgba(4,47,46,0.85)",
};

// ============ THEME PRESETS MAP ============
export const themePresets: Record<ThemePresetId, ThemePreset> = {
    light: {
        id: "light",
        name: "Light",
        description: "Clean and bright",
        emoji: "☀️",
        isDark: false,
        colors: lightColors,
    },
    dark: {
        id: "dark",
        name: "Dark",
        description: "Easy on the eyes",
        emoji: "🌙",
        isDark: true,
        colors: darkColors,
    },
    kawaii: {
        id: "kawaii",
        name: "Kawaii",
        description: "Cute & pastel pink",
        emoji: "🌸",
        isDark: false,
        colors: kawaiiColors,
    },
    pro: {
        id: "pro",
        name: "Pro",
        description: "Professional & focused",
        emoji: "💼",
        isDark: true,
        colors: proColors,
    },
    neon: {
        id: "neon",
        name: "Neon",
        description: "Vibrant cyberpunk",
        emoji: "⚡",
        isDark: true,
        colors: neonColors,
    },
    ocean: {
        id: "ocean",
        name: "Ocean",
        description: "Calm & aquatic",
        emoji: "🌊",
        isDark: true,
        colors: oceanColors,
    },
};

// Helper to get preset by ID
export function getThemePreset(id: ThemePresetId): ThemePreset {
    return themePresets[id] || themePresets.dark;
}

// Get all presets as array
export function getAllThemePresets(): ThemePreset[] {
    return THEME_PRESETS.map((id) => themePresets[id]);
}
