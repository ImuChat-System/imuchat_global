/**
 * Theme Provider
 * Provides theme context using ui-kit tokens
 */

import { borderRadius, colors, shadows, spacing, typography } from '@imuchat/ui-kit/native';
import { createContext, ReactNode, useContext, useState } from 'react';

// Theme type
export type ThemeMode = 'light' | 'dark';

export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  mode: ThemeMode;
}

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const theme: Theme = {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    mode,
  };

  const toggleMode = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
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
