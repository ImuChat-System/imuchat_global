/**
 * LiveBadge — Badge "LIVE" réutilisable
 *
 * Indicateur visuel pulsant pour les Watch Parties en direct.
 * Sprint S12 Axe A — Watch enrichi
 */

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface LiveBadgeProps {
  /** Taille: sm (compact) ou md (standard) */
  size?: "sm" | "md";
  /** Désactiver l'animation pulsante */
  animated?: boolean;
}

export default function LiveBadge({
  size = "md",
  animated = true,
}: LiveBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [animated, pulseAnim]);

  const isSmall = size === "sm";

  return (
    <View testID="live-badge" style={[styles.container, isSmall && styles.containerSm]}>
      <Animated.View
        testID="live-dot"
        style={[
          styles.dot,
          isSmall && styles.dotSm,
          animated ? { transform: [{ scale: pulseAnim }] } : undefined,
        ]}
      />
      <Text style={[styles.label, isSmall && styles.labelSm]}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  containerSm: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  dotSm: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  labelSm: {
    fontSize: 10,
  },
});
