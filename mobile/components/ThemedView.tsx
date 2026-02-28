/**
 * ThemedView Component
 *
 * A View component that automatically applies the current theme's background color.
 */

import { useTheme } from "@/providers/ThemeProvider";
import React from "react";
import { View, ViewProps } from "react-native";

interface ThemedViewProps extends ViewProps {
  /**
   * If true, use the secondary background color
   */
  secondary?: boolean;
  /**
   * If true, use the surface color
   */
  surface?: boolean;
}

export function ThemedView({
  style,
  secondary,
  surface,
  ...props
}: ThemedViewProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const backgroundColor = surface
    ? colors.surface
    : secondary
      ? colors.backgroundSecondary
      : colors.background;

  return <View style={[{ backgroundColor }, style]} {...props} />;
}

export default ThemedView;
