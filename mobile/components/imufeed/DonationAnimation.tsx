/**
 * DonationAnimation — Animation flottante pour les pourboires
 *
 * Anime des ImuCoins qui s'élèvent de bas en haut avec un effet fade
 * quand un tip est envoyé avec succès.
 *
 * Sprint S14B — Animation Donation
 */

import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface DonationAnimationProps {
  /** Montant du tip */
  amount: number;
  /** Emoji associé au preset */
  emoji?: string;
  /** Si l'animation doit jouer */
  visible: boolean;
  /** Callback quand l'animation est terminée */
  onComplete?: () => void;
}

export default function DonationAnimation({
  amount,
  emoji = "💰",
  visible,
  onComplete,
}: DonationAnimationProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!visible) {
      translateY.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);
      return;
    }

    // Animation séquentielle : apparition → montée → disparition
    Animated.sequence([
      // Apparition avec scale
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      // Pause
      Animated.delay(300),
      // Montée avec fade out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -SCREEN_HEIGHT * 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  }, [visible, translateY, opacity, scale, onComplete]);

  if (!visible) return null;

  return (
    <View
      style={styles.container}
      pointerEvents="none"
      testID="donation-animation"
    >
      <Animated.View
        style={[
          styles.bubble,
          {
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.amount} testID="donation-amount">
          +{amount} IC
        </Text>
      </Animated.View>

      {/* Particules décoratives */}
      {[...Array(4)].map((_, i) => (
        <FloatingParticle key={i} index={i} visible={visible} />
      ))}
    </View>
  );
}

// ─── Particule flottante ───────────────────────────────────────

function FloatingParticle({
  index,
  visible,
}: {
  index: number;
  visible: boolean;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const xOffset = (index % 2 === 0 ? -1 : 1) * (20 + index * 15);
    const delay = index * 150;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100 - index * 30,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: xOffset,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, index, translateY, translateX, opacity]);

  const emojis = ["✨", "💫", "⭐", "🪙"];
  return (
    <Animated.Text
      style={[
        styles.particle,
        {
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      {emojis[index % emojis.length]}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  bubble: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
  },
  emoji: {
    fontSize: 36,
  },
  amount: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  particle: {
    position: "absolute",
    fontSize: 20,
  },
});
