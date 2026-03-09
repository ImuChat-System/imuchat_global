/**
 * SkeletonBlock — Bloc placeholder animé (shimmer)
 *
 * Utilisé pour le loading skeleton du Home Hub et autres écrans.
 * Utilise RN Animated pour un effet pulse simple.
 *
 * Sprint S3 Axe A — Skeleton Loading
 */

import { useColors } from "@/providers/ThemeProvider";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, type ViewStyle } from "react-native";

interface SkeletonBlockProps {
  /** Largeur (nombre ou pourcentage) */
  width?: number | string;
  /** Hauteur en pixels */
  height: number;
  /** border-radius */
  borderRadius?: number;
  /** Style additionnel */
  style?: ViewStyle;
}

export default function SkeletonBlock({
  width = "100%",
  height,
  borderRadius = 8,
  style,
}: SkeletonBlockProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Preset skeletons ────────────────────────────────────────

/** Skeleton pour la barre de recherche */
export function SearchBarSkeleton() {
  return <SkeletonBlock height={44} borderRadius={22} style={styles.row} />;
}

/** Skeleton pour un carousel horizontal (stories, hero) */
export function CarouselSkeleton({ height = 160 }: { height?: number }) {
  return (
    <Animated.View style={[styles.row, styles.carouselRow]}>
      <SkeletonBlock width={240} height={height} borderRadius={12} />
      <SkeletonBlock width={240} height={height} borderRadius={12} />
    </Animated.View>
  );
}

/** Skeleton pour une grille (quick actions, modules) */
export function GridSkeleton({
  columns = 3,
  rows = 2,
  itemSize = 56,
}: {
  columns?: number;
  rows?: number;
  itemSize?: number;
}) {
  const items = Array.from({ length: columns * rows });
  return (
    <Animated.View style={[styles.row, styles.gridContainer]}>
      {items.map((_, i) => (
        <SkeletonBlock
          key={i}
          width={itemSize}
          height={itemSize}
          borderRadius={12}
          style={styles.gridItem}
        />
      ))}
    </Animated.View>
  );
}

/** Skeleton pour une carte (friends, podcast, feed preview) */
export function CardSkeleton({ height = 120 }: { height?: number }) {
  return <SkeletonBlock height={height} borderRadius={12} style={styles.row} />;
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  carouselRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    marginBottom: 4,
  },
});
