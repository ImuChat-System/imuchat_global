/**
 * ScreenSkeletons — Skeletons spécifiques par écran
 *
 * Extend le système SkeletonBlock existant (Sprint S3)
 * pour fournir des skeletons dédiés à chaque écran principal.
 *
 * Sprint S14A — Skeleton Screens
 */

import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import SkeletonBlock, {
  CardSkeleton,
  CarouselSkeleton,
  GridSkeleton,
  SearchBarSkeleton,
} from "./SkeletonBlock";

// ─── ImuFeed Skeleton ──────────────────────────────────────

export function ImuFeedSkeleton() {
  return (
    <ScrollView style={styles.container} testID="imufeed-skeleton">
      {/* Header créateur */}
      <View style={styles.creatorHeader}>
        <SkeletonBlock width={80} height={80} borderRadius={40} />
        <View style={styles.creatorInfo}>
          <SkeletonBlock width={140} height={16} borderRadius={4} />
          <SkeletonBlock
            width={100}
            height={12}
            borderRadius={4}
            style={styles.mt4}
          />
        </View>
      </View>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <SkeletonBlock width={60} height={32} borderRadius={8} />
        <SkeletonBlock width={60} height={32} borderRadius={8} />
        <SkeletonBlock width={60} height={32} borderRadius={8} />
        <SkeletonBlock width={60} height={32} borderRadius={8} />
      </View>
      {/* Video grid */}
      <GridSkeleton columns={3} rows={4} itemSize={110} />
    </ScrollView>
  );
}

// ─── Chat List Skeleton ────────────────────────────────────

export function ChatListSkeleton() {
  return (
    <View style={styles.container} testID="chatlist-skeleton">
      <SearchBarSkeleton />
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={styles.chatRow}>
          <SkeletonBlock width={48} height={48} borderRadius={24} />
          <View style={styles.chatText}>
            <SkeletonBlock width={140} height={14} borderRadius={4} />
            <SkeletonBlock
              width={200}
              height={12}
              borderRadius={4}
              style={styles.mt4}
            />
          </View>
          <SkeletonBlock width={40} height={10} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

// ─── Profile Skeleton ──────────────────────────────────────

export function ProfileSkeleton() {
  return (
    <ScrollView style={styles.container} testID="profile-skeleton">
      {/* Avatar + nom */}
      <View style={styles.profileHeader}>
        <SkeletonBlock width={96} height={96} borderRadius={48} />
        <SkeletonBlock
          width={160}
          height={20}
          borderRadius={4}
          style={styles.mt8}
        />
        <SkeletonBlock
          width={120}
          height={14}
          borderRadius={4}
          style={styles.mt4}
        />
      </View>
      {/* Stats */}
      <View style={styles.statsRow}>
        <SkeletonBlock width={70} height={40} borderRadius={8} />
        <SkeletonBlock width={70} height={40} borderRadius={8} />
        <SkeletonBlock width={70} height={40} borderRadius={8} />
      </View>
      {/* Sections */}
      <CardSkeleton height={80} />
      <CardSkeleton height={80} />
      <CardSkeleton height={60} />
    </ScrollView>
  );
}

// ─── Store Skeleton ────────────────────────────────────────

export function StoreSkeleton() {
  return (
    <ScrollView style={styles.container} testID="store-skeleton">
      <SearchBarSkeleton />
      <CarouselSkeleton height={180} />
      {/* Catégories */}
      <View style={styles.categoriesRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} width={64} height={64} borderRadius={12} />
        ))}
      </View>
      {/* Product cards */}
      <GridSkeleton columns={2} rows={3} itemSize={150} />
    </ScrollView>
  );
}

// ─── Offline Banner Skeleton ───────────────────────────────

export function OfflineBannerSkeleton() {
  return (
    <View style={styles.offlineBanner} testID="offline-banner-skeleton">
      <SkeletonBlock width={20} height={20} borderRadius={10} />
      <SkeletonBlock
        width={180}
        height={14}
        borderRadius={4}
        style={styles.ml8}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  creatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  creatorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chatText: {
    flex: 1,
    marginLeft: 12,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mt4: {
    marginTop: 4,
  },
  mt8: {
    marginTop: 8,
  },
  ml8: {
    marginLeft: 8,
  },
});
