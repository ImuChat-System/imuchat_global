/**
 * ThemeQuickSwitch — Sélection rapide de thème dans le profil
 *
 * Affiche les 6 thèmes sous forme de pastilles colorées.
 *
 * Sprint S13 Axe A — Profil enrichi
 */

import {
  THEME_PRESETS,
  themePresets,
  type ThemePresetId,
} from "@/constants/theme-presets";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface ThemeQuickSwitchProps {
  activeTheme: ThemePresetId;
  onSelectTheme: (themeId: ThemePresetId) => void;
}

// ─── Component ────────────────────────────────────────────────

export default function ThemeQuickSwitch({
  activeTheme,
  onSelectTheme,
}: ThemeQuickSwitchProps) {
  const colors = useColors();
  const spacing = useSpacing();

  return (
    <View
      testID="theme-quick-switch"
      style={[
        styles.container,
        { backgroundColor: colors.surface, marginHorizontal: spacing.md },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>🎨 Thème</Text>

      <View style={styles.dotsRow}>
        {THEME_PRESETS.map((presetId) => {
          const preset = themePresets[presetId];
          const isActive = presetId === activeTheme;

          return (
            <TouchableOpacity
              key={presetId}
              testID={`theme-dot-${presetId}`}
              style={[
                styles.dot,
                { backgroundColor: preset.colors.primary },
                isActive && styles.dotActive,
                isActive && { borderColor: colors.text },
              ]}
              onPress={() => onSelectTheme(presetId)}
            >
              <Text style={styles.dotEmoji}>{preset.emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.activeName, { color: colors.textMuted }]}>
        {themePresets[activeTheme].name}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  dotActive: {
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  dotEmoji: {
    fontSize: 18,
  },
  activeName: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
