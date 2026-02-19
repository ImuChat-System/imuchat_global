/**
 * TypingIndicator Component - Mobile (React Native)
 * Affiche une animation de typing avec 3 dots qui pulsent
 * Style kawaii avec couleurs violet/rose
 */

import { useColors } from "@/providers/ThemeProvider";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export interface TypingIndicatorProps {
  /** Liste des noms d'utilisateurs en train d'écrire */
  userNames: string[];
  /** Couleur principale (défaut: #8B5CF6 - violet kawaii) */
  primaryColor?: string;
}

interface DotProps {
  delay: number;
  color: string;
}

function AnimatedDot({ delay, color }: DotProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -4,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200), // Pause avant de recommencer
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
}

export function TypingIndicator({
  userNames,
  primaryColor = "#8B5CF6",
}: TypingIndicatorProps) {
  const colors = useColors();

  if (userNames.length === 0) {
    return null;
  }

  const displayText =
    userNames.length === 1
      ? `${userNames[0]} est en train d'écrire...`
      : userNames.length === 2
        ? `${userNames[0]} et ${userNames[1]} sont en train d'écrire...`
        : `${userNames.length} personnes sont en train d'écrire...`;

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <AnimatedDot delay={0} color={primaryColor} />
        <AnimatedDot delay={150} color={primaryColor} />
        <AnimatedDot delay={300} color={primaryColor} />
      </View>
      <Text style={[styles.text, { color: colors?.secondary || "#6B7280" }]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default TypingIndicator;
