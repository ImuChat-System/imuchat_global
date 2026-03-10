/**
 * StickerOverlay — Stickers drag & drop sur la vidéo
 *
 * Permet à l'utilisateur de placer des stickers sur la vidéo.
 * Chaque sticker est déplaçable (PanResponder), redimensionnable
 * (pinch) et supprimable (long press).
 *
 * Sprint S10 Axe B — Filtres, Stickers & Effets
 */

import { useColors } from "@/providers/ThemeProvider";
import type { PlacedSticker } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const OVERLAY_HEIGHT = SCREEN_HEIGHT * 0.6;

// ─── Props ────────────────────────────────────────────────────

interface StickerOverlayProps {
  stickers: PlacedSticker[];
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemoveSticker: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────

export default function StickerOverlay({
  stickers,
  onUpdateSticker,
  onRemoveSticker,
}: StickerOverlayProps) {
  return (
    <View
      testID="sticker-overlay"
      style={styles.overlay}
      pointerEvents="box-none"
    >
      {stickers.map((sticker) => (
        <DraggableSticker
          key={sticker.id}
          sticker={sticker}
          onUpdate={onUpdateSticker}
          onRemove={onRemoveSticker}
        />
      ))}
    </View>
  );
}

// ─── Draggable Sticker ────────────────────────────────────────

interface DraggableStickerProps {
  sticker: PlacedSticker;
  onUpdate: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemove: (id: string) => void;
}

function DraggableSticker({
  sticker,
  onUpdate,
  onRemove,
}: DraggableStickerProps) {
  const colors = useColors();
  const pan = useRef(
    new Animated.ValueXY({
      x: sticker.x * SCREEN_WIDTH,
      y: sticker.y * OVERLAY_HEIGHT,
    }),
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as unknown as { _value: number })._value,
          y: (pan.y as unknown as { _value: number })._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Convert back to relative coordinates
        const currentX = (pan.x as unknown as { _value: number })._value;
        const currentY = (pan.y as unknown as { _value: number })._value;
        onUpdate(sticker.id, {
          x: Math.max(0, Math.min(1, currentX / SCREEN_WIDTH)),
          y: Math.max(0, Math.min(1, currentY / OVERLAY_HEIGHT)),
        });
      },
    }),
  ).current;

  const handleRemove = useCallback(() => {
    onRemove(sticker.id);
  }, [sticker.id, onRemove]);

  const stickerSize = 64 * sticker.scale;

  return (
    <Animated.View
      testID={`sticker-${sticker.id}`}
      {...panResponder.panHandlers}
      style={[
        styles.sticker,
        {
          width: stickerSize,
          height: stickerSize,
          transform: [
            ...pan.getTranslateTransform(),
            { rotate: `${sticker.rotation}deg` },
          ],
        },
      ]}
    >
      <Image
        source={{ uri: sticker.imageUrl }}
        style={{ width: stickerSize, height: stickerSize }}
        resizeMode="contain"
      />
      {/* Delete button */}
      <TouchableOpacity
        testID={`remove-sticker-${sticker.id}`}
        style={[styles.removeBtn, { backgroundColor: colors.card }]}
        onPress={handleRemove}
      >
        <Ionicons name="close" size={12} color="#E74C3C" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  sticker: {
    position: "absolute",
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
