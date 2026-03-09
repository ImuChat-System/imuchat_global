/**
 * WidgetCard — Conteneur générique pour widgets Home
 *
 * Supporte 3 tailles : 1×1, 2×1, 2×2 sur grille 2 colonnes.
 * Chaque taille correspond à un nombre de « cellules » visuelles.
 *
 * Sprint S6 Axe A — Infrastructure Widgets
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { HomeWidget, WidgetSize } from "@/types/home-hub";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface WidgetCardProps {
  widget: HomeWidget;
  onPress?: (widget: HomeWidget) => void;
  children?: React.ReactNode;
}

// ─── Size helpers ─────────────────────────────────────────────

const GRID_COLUMNS = 2;
const GRID_GAP = 12;
const GRID_PADDING = 16;

function useWidgetDimensions(size: WidgetSize) {
  const { width: screenWidth } = useWindowDimensions();
  const availableWidth = screenWidth - GRID_PADDING * 2 - GRID_GAP;
  const cellWidth = availableWidth / GRID_COLUMNS;

  switch (size) {
    case "1x1":
      return { width: cellWidth, height: cellWidth };
    case "2x1":
      return { width: availableWidth + GRID_GAP, height: cellWidth };
    case "2x2":
      return {
        width: availableWidth + GRID_GAP,
        height: cellWidth * 2 + GRID_GAP,
      };
  }
}

// ─── Component ────────────────────────────────────────────────

export default function WidgetCard({
  widget,
  onPress,
  children,
}: WidgetCardProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const dimensions = useWidgetDimensions(widget.size);

  return (
    <TouchableOpacity
      testID={`widget-card-${widget.type}`}
      activeOpacity={0.8}
      onPress={() => onPress?.(widget)}
      disabled={!onPress}
      style={[
        styles.card,
        {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: colors.card,
          borderRadius: spacing.md,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={widget.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={colors.primary}
        />
        <Text
          style={[styles.title, { color: colors.text, marginLeft: spacing.xs }]}
          numberOfLines={1}
        >
          {widget.titleKey}
        </Text>
      </View>

      {/* Content slot */}
      <View style={styles.content}>
        {children ?? (
          <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
            —
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    padding: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  placeholder: {
    fontSize: 14,
    textAlign: "center",
  },
});
