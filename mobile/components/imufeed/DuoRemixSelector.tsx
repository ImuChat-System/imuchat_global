/**
 * DuoRemixSelector — Sélection du mode de co-création
 *
 * Permet de choisir entre les modes Normal, Duo, Remix et Green Screen
 * avant de démarrer l'enregistrement d'une vidéo.
 *
 * Sprint S11 Axe B — Remix, Duo & Effets Avancés
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
    MODE_ICONS,
    MODE_LABELS,
} from "@/services/imufeed/remix-service";
import type { VideoCreationMode } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface DuoRemixSelectorProps {
  activeMode: VideoCreationMode;
  onModeChange: (mode: VideoCreationMode) => void;
  /** Modes disponibles (par défaut tous si vidéo source fournie) */
  availableModes?: VideoCreationMode[];
  /** Info sur la source si mode duo/remix/green_screen */
  sourceName?: string;
}

const ALL_MODES: VideoCreationMode[] = ["normal", "duo", "remix", "green_screen"];

// ─── Component ────────────────────────────────────────────────

export default function DuoRemixSelector({
  activeMode,
  onModeChange,
  availableModes = ALL_MODES,
  sourceName,
}: DuoRemixSelectorProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const handlePress = useCallback(
    (mode: VideoCreationMode) => {
      onModeChange(mode);
    },
    [onModeChange],
  );

  return (
    <View testID="duo-remix-selector" style={styles.container}>
      {/* Mode buttons */}
      <View style={styles.modeRow}>
        {availableModes.map((mode) => {
          const isActive = mode === activeMode;
          return (
            <TouchableOpacity
              key={mode}
              testID={`mode-${mode}`}
              style={[
                styles.modeBtn,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handlePress(mode)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={MODE_ICONS[mode] as any}
                size={20}
                color={isActive ? "#fff" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeLabel,
                  { color: isActive ? "#fff" : colors.textSecondary },
                ]}
              >
                {MODE_LABELS[mode]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Source info */}
      {sourceName && activeMode !== "normal" && (
        <View
          testID="source-info"
          style={[styles.sourceInfo, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="link-outline" size={14} color={colors.textSecondary} />
          <Text
            style={[styles.sourceText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            Source : {sourceName}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 8,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  modeLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  sourceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sourceText: {
    fontSize: 12,
    flex: 1,
  },
});
