/**
 * SpeedControl — Sélecteur de vitesse de lecture vidéo
 *
 * Barre horizontale avec 7 paliers : 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x, 3x.
 * Le palier actif est mis en surbrillance.
 *
 * Sprint S10 Axe B — Filtres, Stickers & Effets
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { PlaybackSpeed } from "@/types/imufeed";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Constants ────────────────────────────────────────────────

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];

function formatSpeed(speed: PlaybackSpeed): string {
  if (speed === 1) return "1x";
  return `${speed}x`;
}

// ─── Props ────────────────────────────────────────────────────

interface SpeedControlProps {
  selectedSpeed: PlaybackSpeed;
  onSelectSpeed: (speed: PlaybackSpeed) => void;
}

// ─── Component ────────────────────────────────────────────────

export default function SpeedControl({
  selectedSpeed,
  onSelectSpeed,
}: SpeedControlProps) {
  const colors = useColors();
  const spacing = useSpacing();

  return (
    <View
      testID="speed-control"
      style={[styles.container, { gap: spacing.xs }]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Vitesse
      </Text>
      <View style={styles.speedRow}>
        {SPEEDS.map((speed) => {
          const isActive = speed === selectedSpeed;
          return (
            <TouchableOpacity
              key={speed}
              testID={`speed-${speed}`}
              style={[
                styles.speedBtn,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                },
              ]}
              onPress={() => onSelectSpeed(speed)}
            >
              <Text
                style={[
                  styles.speedText,
                  { color: isActive ? "#FFF" : colors.textSecondary },
                ]}
              >
                {formatSpeed(speed)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  speedRow: {
    flexDirection: "row",
    gap: 6,
  },
  speedBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  speedText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
