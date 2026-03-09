/**
 * HomeSkeleton — Skeleton loading pour le Home Hub
 *
 * Affiche un placeholder animé pendant le chargement initial.
 * Utilise les presets de SkeletonBlock pour simuler la mise en page.
 *
 * Sprint S3 Axe A — Skeleton Loading
 */

import {
  CardSkeleton,
  CarouselSkeleton,
  GridSkeleton,
  SearchBarSkeleton,
} from "@/components/ui/SkeletonBlock";
import { useColors } from "@/providers/ThemeProvider";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function HomeSkeleton() {
  const colors = useColors();

  return (
    <ScrollView
      testID="home-loading"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      scrollEnabled={false}
    >
      {/* Search bar */}
      <SearchBarSkeleton />

      {/* Hero carousel */}
      <CarouselSkeleton height={180} />

      {/* Stories */}
      <CarouselSkeleton height={80} />

      {/* Quick actions grid */}
      <GridSkeleton columns={3} rows={2} itemSize={56} />

      {/* Social activity / friends card */}
      <CardSkeleton height={140} />

      {/* Trending */}
      <CarouselSkeleton height={100} />

      {/* Feed preview */}
      <CardSkeleton height={160} />

      {/* Modules row */}
      <CarouselSkeleton height={80} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
    gap: 4,
  },
});
