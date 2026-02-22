/**
 * Theme Provider
 * Provides theme context using 6 predefined theme presets
 * Persists theme choice via user-store (Zustand + AsyncStorage)
 */

import {
  getThemePreset,
  ThemeColors,
  ThemePreset,
  ThemePresetId,
} from "@/constants/theme-presets";
import { ThemePreference, useUserStore } from "@/stores/user-store";
import {
  borderRadius,
  shadows,
  spacing,
  typography,
} from "@imuchat/ui-kit/native/tokens";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

// Theme type
export type ThemeMode = "light" | "dark";

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  mode: ThemeMode;
  preset: ThemePreset;
}

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  presetId: ThemePresetId;
  setPreset: (id: ThemePresetId) => void;
  setSystemMode: () => void;
  isSystemMode: boolean;
  // Backward-compat aliases for tests
  setMode: (mode: "light" | "dark") => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { preferences, setPreferences } = useUserStore();

  // Resolve effective preset from preference (which may be "system")
  const resolvePreset = (pref: ThemePreference): ThemePresetId => {
    if (pref === "system") {
      return systemColorScheme === "light" ? "light" : "dark";
    }
    return pref;
  };

  const [presetId, setPresetIdState] = useState<ThemePresetId>(() =>
    resolvePreset(preferences.theme),
  );

  // Sync with system color scheme changes when preference is "system"
  useEffect(() => {
    if (preferences.theme === "system") {
      setPresetIdState(systemColorScheme === "light" ? "light" : "dark");
    }
  }, [systemColorScheme, preferences.theme]);

  // Update preset when preference changes
  useEffect(() => {
    if (preferences.theme !== "system") {
      setPresetIdState(preferences.theme);
    }
  }, [preferences.theme]);

  const setPreset = (newPresetId: ThemePresetId) => {
    setPresetIdState(newPresetId);
    setPreferences({ theme: newPresetId });
  };

  const setSystemMode = () => {
    setPreferences({ theme: "system" });
    setPresetIdState(systemColorScheme === "light" ? "light" : "dark");
  };

  // Backward-compat aliases
  const setMode = (mode: "light" | "dark") => setPreset(mode);
  const toggleMode = () => setPreset(presetId === "dark" ? "light" : "dark");

  const preset = getThemePreset(presetId);

  const theme: Theme = {
    colors: preset.colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    mode: preset.isDark ? "dark" : "light",
    preset,
  };

  const isSystemMode = preferences.theme === "system";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode: theme.mode,
        presetId,
        setPreset,
        setSystemMode,
        isSystemMode,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Convenience hooks
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}

export function useSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

export function useTypography() {
  const { theme } = useTheme();
  return theme.typography;
}
