/**
 * AnimatedTextOverlay — Textes animés positionnés sur la vidéo
 *
 * Affiche les textes placés par l'utilisateur avec 12 styles
 * d'animation. Chaque texte est positionné relativement (0-1)
 * et peut être déplacé, redimensionné, pivoté.
 *
 * Sprint S10 Axe B — Filtres, Stickers & Effets
 */

import { useColors } from "@/providers/ThemeProvider";
import type { AnimatedTextStyle, PlacedText } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const OVERLAY_HEIGHT = SCREEN_HEIGHT * 0.6;

// ─── Animation style configs ─────────────────────────────────

const ANIMATION_LABELS: Record<AnimatedTextStyle, string> = {
  typewriter: "Typewriter",
  fade_in: "Fade In",
  slide_up: "Slide Up",
  bounce: "Bounce",
  glow: "Glow",
  shake: "Shake",
  zoom_in: "Zoom In",
  glitch: "Glitch",
  wave: "Wave",
  rainbow: "Rainbow",
  outline: "Outline",
  shadow_pop: "Shadow Pop",
};

export const ANIMATED_TEXT_STYLES: AnimatedTextStyle[] = [
  "typewriter",
  "fade_in",
  "slide_up",
  "bounce",
  "glow",
  "shake",
  "zoom_in",
  "glitch",
  "wave",
  "rainbow",
  "outline",
  "shadow_pop",
];

// ─── Props ────────────────────────────────────────────────────

interface AnimatedTextOverlayProps {
  texts: PlacedText[];
  onUpdateText: (id: string, updates: Partial<PlacedText>) => void;
  onRemoveText: (id: string) => void;
  currentTimeMs: number;
}

// ─── Component ────────────────────────────────────────────────

export default function AnimatedTextOverlay({
  texts,
  onUpdateText,
  onRemoveText,
  currentTimeMs,
}: AnimatedTextOverlayProps) {
  const visibleTexts = texts.filter((t) => {
    if (t.durationMs === 0) return true; // Visible toute la vidéo
    return (
      currentTimeMs >= t.startMs && currentTimeMs < t.startMs + t.durationMs
    );
  });

  return (
    <View testID="text-overlay" style={styles.overlay} pointerEvents="box-none">
      {visibleTexts.map((textItem) => (
        <DraggableText
          key={textItem.id}
          textItem={textItem}
          onUpdate={onUpdateText}
          onRemove={onRemoveText}
        />
      ))}
    </View>
  );
}

// ─── Draggable Text ───────────────────────────────────────────

interface DraggableTextProps {
  textItem: PlacedText;
  onUpdate: (id: string, updates: Partial<PlacedText>) => void;
  onRemove: (id: string) => void;
}

function DraggableText({ textItem, onUpdate, onRemove }: DraggableTextProps) {
  const colors = useColors();
  const animValue = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    new Animated.ValueXY({
      x: textItem.x * SCREEN_WIDTH,
      y: textItem.y * OVERLAY_HEIGHT,
    }),
  ).current;

  useEffect(() => {
    // Trigger entrance animation
    Animated.timing(animValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [animValue]);

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
        const currentX = (pan.x as unknown as { _value: number })._value;
        const currentY = (pan.y as unknown as { _value: number })._value;
        onUpdate(textItem.id, {
          x: Math.max(0, Math.min(1, currentX / SCREEN_WIDTH)),
          y: Math.max(0, Math.min(1, currentY / OVERLAY_HEIGHT)),
        });
      },
    }),
  ).current;

  const animatedStyle = getAnimatedStyle(textItem.style, animValue);

  return (
    <Animated.View
      testID={`text-${textItem.id}`}
      {...panResponder.panHandlers}
      style={[
        styles.textContainer,
        {
          transform: [
            ...pan.getTranslateTransform(),
            { rotate: `${textItem.rotation}deg` },
            { scale: textItem.scale },
            ...(animatedStyle.transform ?? []),
          ],
          opacity: animatedStyle.opacity ?? 1,
        },
      ]}
    >
      <Text
        style={[
          styles.textContent,
          {
            color: textItem.color,
            fontSize: 18 * textItem.scale,
          },
          getTextDecorationStyle(textItem.style, textItem.color),
        ]}
      >
        {textItem.text}
      </Text>
      <TouchableOpacity
        testID={`remove-text-${textItem.id}`}
        style={[styles.removeBtn, { backgroundColor: colors.card }]}
        onPress={() => onRemove(textItem.id)}
      >
        <Ionicons name="close" size={10} color="#E74C3C" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Animation helpers ────────────────────────────────────────

function getAnimatedStyle(
  style: AnimatedTextStyle,
  animValue: Animated.Value,
): {
  transform?: Array<
    Record<string, Animated.AnimatedInterpolation<string | number>>
  >;
  opacity?: Animated.AnimatedInterpolation<string | number>;
} {
  switch (style) {
    case "fade_in":
      return { opacity: animValue };
    case "slide_up":
      return {
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      };
    case "zoom_in":
      return {
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ],
        opacity: animValue,
      };
    case "bounce":
      return {
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 0.4, 0.6, 0.8, 1],
              outputRange: [40, -10, 5, -3, 0],
            }),
          },
        ],
      };
    default:
      return { opacity: animValue };
  }
}

function getTextDecorationStyle(
  style: AnimatedTextStyle,
  color: string,
): Record<string, unknown> {
  switch (style) {
    case "outline":
      return {
        textShadowColor: color,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      };
    case "shadow_pop":
      return {
        textShadowColor: "#00000080",
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 4,
      };
    case "glow":
      return {
        textShadowColor: color,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      };
    default:
      return {};
  }
}

// ─── Exports (label helper) ──────────────────────────────────

export function getAnimationLabel(style: AnimatedTextStyle): string {
  return ANIMATION_LABELS[style];
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 11,
  },
  textContainer: {
    position: "absolute",
    padding: 4,
  },
  textContent: {
    fontWeight: "700",
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
