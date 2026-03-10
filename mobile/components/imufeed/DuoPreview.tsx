/**
 * DuoPreview — Prévisualisation du mode Duo (split-screen)
 *
 * Affiche côte à côte (ou dessus/dessous) la vidéo source
 * et le flux caméra de l'utilisateur.
 *
 * Sprint S11 Axe B — Remix, Duo & Effets Avancés
 */

import { useColors } from "@/providers/ThemeProvider";
import type { DuoLayout } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_HEIGHT = SCREEN_WIDTH * (16 / 9) * 0.6;

// ─── Props ────────────────────────────────────────────────────

interface DuoPreviewProps {
  layout: DuoLayout;
  onLayoutChange: (layout: DuoLayout) => void;
  sourceThumbnail: string | null;
}

// ─── Component ────────────────────────────────────────────────

export default function DuoPreview({
  layout,
  onLayoutChange,
  sourceThumbnail,
}: DuoPreviewProps) {
  const colors = useColors();

  const isVertical = layout.orientation === "vertical";

  const toggleOrientation = useCallback(() => {
    onLayoutChange({
      ...layout,
      orientation: isVertical ? "horizontal" : "vertical",
    });
  }, [layout, isVertical, onLayoutChange]);

  const toggleOrder = useCallback(() => {
    onLayoutChange({
      ...layout,
      sourceFirst: !layout.sourceFirst,
    });
  }, [layout, onLayoutChange]);

  // Calcul des dimensions
  const sourceSize = isVertical
    ? { width: SCREEN_WIDTH * layout.sourceRatio, height: PREVIEW_HEIGHT }
    : { width: SCREEN_WIDTH, height: PREVIEW_HEIGHT * layout.sourceRatio };

  const cameraSize = isVertical
    ? {
        width: SCREEN_WIDTH * (1 - layout.sourceRatio),
        height: PREVIEW_HEIGHT,
      }
    : {
        width: SCREEN_WIDTH,
        height: PREVIEW_HEIGHT * (1 - layout.sourceRatio),
      };

  const sourcePanel = (
    <View
      testID="duo-source-panel"
      style={[
        styles.panel,
        sourceSize,
        { backgroundColor: colors.surface },
      ]}
    >
      {sourceThumbnail ? (
        <Image
          source={{ uri: sourceThumbnail }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="videocam" size={24} color={colors.textSecondary} />
      )}
      <View style={styles.panelLabel}>
        <Text style={styles.panelLabelText}>Source</Text>
      </View>
    </View>
  );

  const cameraPanel = (
    <View
      testID="duo-camera-panel"
      style={[
        styles.panel,
        cameraSize,
        { backgroundColor: colors.border },
      ]}
    >
      <Ionicons name="camera" size={28} color={colors.textSecondary} />
      <Text style={[styles.cameraText, { color: colors.textSecondary }]}>
        Caméra
      </Text>
    </View>
  );

  return (
    <View testID="duo-preview" style={styles.container}>
      {/* Preview panels */}
      <View
        style={[
          styles.previewArea,
          {
            flexDirection: isVertical ? "row" : "column",
            height: PREVIEW_HEIGHT,
          },
        ]}
      >
        {layout.sourceFirst ? (
          <>
            {sourcePanel}
            {cameraPanel}
          </>
        ) : (
          <>
            {cameraPanel}
            {sourcePanel}
          </>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          testID="duo-toggle-orientation"
          style={[styles.controlBtn, { backgroundColor: colors.surface }]}
          onPress={toggleOrientation}
        >
          <Ionicons
            name={isVertical ? "swap-horizontal" : "swap-vertical"}
            size={18}
            color={colors.text}
          />
          <Text style={[styles.controlLabel, { color: colors.text }]}>
            {isVertical ? "Vertical" : "Horizontal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="duo-toggle-order"
          style={[styles.controlBtn, { backgroundColor: colors.surface }]}
          onPress={toggleOrder}
        >
          <Ionicons name="git-compare-outline" size={18} color={colors.text} />
          <Text style={[styles.controlLabel, { color: colors.text }]}>
            Inverser
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  previewArea: {
    overflow: "hidden",
    borderRadius: 12,
    marginHorizontal: 16,
  },
  panel: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  panelLabel: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  panelLabelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cameraText: {
    fontSize: 12,
    marginTop: 4,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
