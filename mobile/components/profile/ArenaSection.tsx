/**
 * ArenaSection — Section Arena dans le profil
 *
 * Affiche le rang, la barre de progression et un lien classements.
 *
 * Sprint S13 Axe A — Profil enrichi
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { LevelTier } from "@/types/gamification";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Tier display config ──────────────────────────────────────

const TIER_DISPLAY: Record<
  LevelTier,
  { emoji: string; label: string; color: string }
> = {
  bronze: { emoji: "🥉", label: "Bronze", color: "#CD7F32" },
  silver: { emoji: "🥈", label: "Argent", color: "#C0C0C0" },
  gold: { emoji: "🥇", label: "Or", color: "#FFD700" },
  platinum: { emoji: "💎", label: "Platine", color: "#E5E4E2" },
  diamond: { emoji: "💠", label: "Diamant", color: "#B9F2FF" },
  legend: { emoji: "👑", label: "Légende", color: "#FF6EC7" },
};

// ─── Props ────────────────────────────────────────────────────

interface ArenaSectionProps {
  tier: LevelTier;
  level: number;
  currentXP: number;
  xpForNext: number;
  rank?: number;
  onViewLeaderboard: () => void;
}

// ─── Component ────────────────────────────────────────────────

export default function ArenaSection({
  tier,
  level,
  currentXP,
  xpForNext,
  rank,
  onViewLeaderboard,
}: ArenaSectionProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const tierInfo = TIER_DISPLAY[tier];
  const progress = xpForNext > 0 ? Math.min(currentXP / xpForNext, 1) : 0;

  return (
    <View
      testID="arena-section"
      style={[
        styles.container,
        { backgroundColor: colors.surface, marginHorizontal: spacing.md },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🏆 Arena</Text>
        {rank != null && (
          <Text
            testID="arena-rank"
            style={[styles.rankBadge, { color: tierInfo.color }]}
          >
            #{rank}
          </Text>
        )}
      </View>

      {/* Tier + Level */}
      <View style={styles.tierRow}>
        <Text style={styles.tierEmoji}>{tierInfo.emoji}</Text>
        <View style={styles.tierInfo}>
          <Text style={[styles.tierLabel, { color: tierInfo.color }]}>
            {tierInfo.label}
          </Text>
          <Text style={[styles.levelText, { color: colors.textMuted }]}>
            Niveau {level}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.background }]}
        >
          <View
            testID="arena-progress-bar"
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: tierInfo.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.xpText, { color: colors.textMuted }]}>
          {currentXP} / {xpForNext} XP
        </Text>
      </View>

      {/* Leaderboard Link */}
      <TouchableOpacity
        testID="arena-leaderboard-btn"
        style={[styles.leaderboardBtn, { borderColor: colors.border }]}
        onPress={onViewLeaderboard}
      >
        <Ionicons name="podium-outline" size={16} color={colors.primary} />
        <Text style={[styles.leaderboardText, { color: colors.primary }]}>
          Voir les classements
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  rankBadge: {
    fontSize: 18,
    fontWeight: "800",
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  tierEmoji: {
    fontSize: 32,
  },
  tierInfo: {
    gap: 2,
  },
  tierLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  levelText: {
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    textAlign: "right",
  },
  leaderboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  leaderboardText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
