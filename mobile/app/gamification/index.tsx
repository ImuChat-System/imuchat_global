/**
 * Gamification — Hub Index
 *
 * Navigation hub showing level overview card plus 6 navigation
 * cards linking to gamification sub-screens.
 *
 * Phase 3 — DEV-032
 */

import { useGamification } from "@/hooks/useGamification";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Link card component
// ---------------------------------------------------------------------------

interface GamificationLinkProps {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  badge?: number;
  colors: ReturnType<typeof useColors>;
}

function GamificationLink({
  icon,
  label,
  subtitle,
  onPress,
  badge,
  colors,
}: GamificationLinkProps) {
  return (
    <TouchableOpacity
      style={[styles.linkCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.linkIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.linkLabel, { color: colors.text }]}>
            {label}
          </Text>
          {badge !== undefined && badge > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.linkSubtitle, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Hub screen
// ---------------------------------------------------------------------------

export default function GamificationIndex() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const {
    userLevel,
    levelProgress,
    unlockedBadgesCount,
    badges,
    activeMissionsCount,
    claimableMissionsCount,
    ownedSkinsCount,
  } = useGamification();

  const links = [
    {
      icon: "⭐",
      label: t("gamification.xpLevels"),
      subtitle: t("gamification.xpLevelsSub", {
        level: userLevel.level,
        xp: userLevel.totalXP,
      }),
      route: "/gamification/xp-levels",
    },
    {
      icon: "🏆",
      label: t("gamification.badges"),
      subtitle: t("gamification.badgesSub", {
        unlocked: unlockedBadgesCount,
        total: badges.length,
      }),
      route: "/gamification/badges",
    },
    {
      icon: "🎯",
      label: t("gamification.missions"),
      subtitle: t("gamification.missionsSub", {
        active: activeMissionsCount,
      }),
      route: "/gamification/missions",
      badge: claimableMissionsCount,
    },
    {
      icon: "🏅",
      label: t("gamification.leaderboards"),
      subtitle: t("gamification.leaderboardsSub"),
      route: "/gamification/leaderboards",
    },
    {
      icon: "🎨",
      label: t("gamification.avatar"),
      subtitle: t("gamification.avatarSub", { count: ownedSkinsCount }),
      route: "/gamification/avatar",
    },
    {
      icon: "🛍️",
      label: t("gamification.shop"),
      subtitle: t("gamification.shopSub"),
      route: "/gamification/shop",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ── Level overview card ─────────────────────────────────── */}
      <View style={[styles.levelCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.levelTitle}>
          {t("gamification.levelLabel", { level: userLevel.level })}
        </Text>
        <Text style={styles.levelSubtitle}>{userLevel.title}</Text>

        {/* XP progress bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(levelProgress, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {userLevel.currentXP} / {userLevel.xpForNextLevel} XP
        </Text>
      </View>

      {/* ── Quick stats ─────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.statValue}>{userLevel.totalXP}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("gamification.totalXP")}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.statValue}>{unlockedBadgesCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("gamification.badgesUnlocked")}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.statValue}>{activeMissionsCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("gamification.activeMissions")}
          </Text>
        </View>
      </View>

      {/* ── Navigation links ────────────────────────────────────── */}
      {links.map((link) => (
        <GamificationLink
          key={link.route}
          icon={link.icon}
          label={link.label}
          subtitle={link.subtitle}
          badge={link.badge}
          onPress={() => router.push(link.route as any)}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },

  // Level card
  levelCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 4,
  },
  levelTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  levelSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  progressBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
    marginTop: 14,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },

  // Link card
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  linkIcon: { fontSize: 28 },
  linkLabel: { fontSize: 16, fontWeight: "600" },
  linkSubtitle: { fontSize: 13, marginTop: 2 },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
