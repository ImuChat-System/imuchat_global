/**
 * FloatingActionButton — Menu radial universel contextuel
 *
 * Bouton flottant bottom-right avec menu radial animé (spring).
 * Actions contextuelles selon le tab actif (S5).
 * 7 actions par défaut, overlay backdrop, rotation du "+" en "×".
 *
 * Sprint S4 Axe A — FAB
 * Sprint S5 Axe A — FAB Contextuel
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  AUTO_HIDE_ROUTE_PATTERNS,
  useFabStore,
  type FabAction,
  type FabTabContext,
} from "@/stores/fab-store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter, useSegments } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

const FAB_SIZE = 56;
const ACTION_SIZE = 48;
const SPRING_CONFIG = { damping: 12, stiffness: 150, mass: 0.8 };

export default function FloatingActionButton() {
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const { isOpen, isVisible, toggle, close, setActiveTab, setVisible } =
    useFabStore();
  const contextualActions = useFabStore((s) => s.getContextualActions());

  const progress = useSharedValue(0);

  // ─── Detect active tab ────────────────────
  useEffect(() => {
    // segments[0] = "(tabs)", segments[1] = tab name
    const tabName = (segments[0] === "(tabs)" ? segments[1] : undefined) as
      | FabTabContext
      | undefined;
    setActiveTab(tabName ?? "default");
  }, [segments, setActiveTab]);

  // ─── Auto-hide on fullscreen routes ───────
  useEffect(() => {
    const shouldHide = AUTO_HIDE_ROUTE_PATTERNS.some((pattern) =>
      pathname.startsWith(pattern),
    );
    setVisible(!shouldHide);
  }, [pathname, setVisible]);

  useEffect(() => {
    progress.value = withSpring(isOpen ? 1 : 0, SPRING_CONFIG);
  }, [isOpen, progress]);

  // ─── Handlers ─────────────────────────────
  const handleActionPress = useCallback(
    (action: FabAction) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      close();
      router.push(action.route as any);
    },
    [close, router],
  );

  const handleBackdropPress = useCallback(() => {
    close();
  }, [close]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggle();
  }, [toggle]);

  // ─── Animated Styles ──────────────────────

  const fabRotationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 45], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.5], Extrapolation.CLAMP),
    pointerEvents: progress.value > 0.1 ? "auto" : "none",
  }));

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
        />
      </Animated.View>

      <View
        style={[
          styles.container,
          { right: spacing.md, bottom: spacing.md + 65 },
        ]}
        pointerEvents="box-none"
      >
        {/* Action Items — radial arc */}
        {contextualActions.map((action, index) => (
          <FabActionItem
            key={action.id}
            action={action}
            index={index}
            total={contextualActions.length}
            progress={progress}
            onPress={handleActionPress}
            colors={colors}
          />
        ))}

        {/* Main FAB button */}
        <Pressable
          onPress={handleToggle}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityLabel="Menu de création"
          accessibilityRole="button"
        >
          <Animated.View style={fabRotationStyle}>
            <Ionicons name="add" size={28} color="#fff" />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}

// ─── Action Item ──────────────────────────────────────────────

interface FabActionItemProps {
  action: FabAction;
  index: number;
  total: number;
  progress: SharedValue<number>;
  onPress: (action: FabAction) => void;
  colors: ReturnType<typeof useColors>;
}

function FabActionItem({
  action,
  index,
  total,
  progress,
  onPress,
  colors,
}: FabActionItemProps) {
  // Fan out actions in an arc above the FAB
  const angle = interpolateAngle(index, total);
  const radius = 80;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolation.CLAMP,
    );
    const translateX = -Math.cos(angle) * radius * progress.value;
    const translateY = -Math.sin(angle) * radius * progress.value;

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.actionContainer, animatedStyle]}>
      <Pressable
        onPress={() => onPress(action)}
        style={[styles.actionButton, { backgroundColor: colors.card }]}
        accessibilityLabel={action.label}
        accessibilityRole="button"
      >
        <Text style={styles.actionEmoji}>{action.emoji}</Text>
      </Pressable>
      <Animated.View
        style={useAnimatedStyle(() => ({
          opacity: interpolate(
            progress.value,
            [0.6, 1],
            [0, 1],
            Extrapolation.CLAMP,
          ),
        }))}
      >
        <Text
          style={[styles.actionLabel, { color: colors.text }]}
          numberOfLines={1}
        >
          {action.label}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

/** Calcule l'angle pour l'item i dans un arc de 90° → 180° (quarter circle, left-upward) */
function interpolateAngle(index: number, total: number): number {
  const startAngle = Math.PI / 2; // 90° (straight up)
  const endAngle = Math.PI; // 180° (left)
  if (total <= 1) return startAngle;
  return startAngle + (index / (total - 1)) * (endAngle - startAngle);
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 998,
  },
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#6A54A3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  actionContainer: {
    position: "absolute",
    alignItems: "center",
  },
  actionButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
});
