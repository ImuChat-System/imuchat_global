/**
 * CreatorLevelBadge — Affichage niveau, tier, barre XP
 *
 * Composant compact affichant le rang du créateur :
 * emoji tier, numéro de niveau, barre de progression XP.
 *
 * Sprint S12 Axe B — Gamification ImuFeed
 */

import { useColors } from "@/providers/ThemeProvider";
import {
    getTierForLevel,
    levelProgress,
    type TierConfig,
} from "@/services/imufeed/gamification-service";
import type { CreatorLevel } from "@/types/gamification";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CreatorLevelBadgeProps {
  level: CreatorLevel;
  /** Affichage compact (inline) ou détaillé */
  variant?: "compact" | "detailed";
}

export default function CreatorLevelBadge({
  level,
  variant = "compact",
}: CreatorLevelBadgeProps) {
  const colors = useColors();
  const tierInfo: TierConfig = getTierForLevel(level.level);
  const progress = levelProgress(level.total_xp);

  if (variant === "compact") {
    return (
      <View testID="creator-level-badge" style={[styles.compactContainer, { borderColor: tierInfo.color }]}>
        <Text style={styles.tierEmoji}>{tierInfo.emoji}</Text>
        <Text style={[styles.levelText, { color: tierInfo.color }]}>
          Nv.{level.level}
        </Text>
      </View>
    );
  }

  return (
    <View testID="creator-level-badge" style={styles.detailedContainer}>
      {/* Tier & Level */}
      <View style={styles.tierRow}>
        <Text style={styles.detailedEmoji}>{tierInfo.emoji}</Text>
        <View>
          <Text style={[styles.tierLabel, { color: tierInfo.color }]}>
            {tierInfo.label}
          </Text>
          <Text style={[styles.detailedLevel, { color: colors.text }]}>
            Niveau {level.level}
          </Text>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            testID="xp-progress-bar"
            style={[
              styles.progressFill,
              {
                backgroundColor: tierInfo.color,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.xpText, { color: colors.textSecondary }]}>
          {level.current_xp_in_level} / {level.xp_for_next_level} XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Compact ─────────────────────────────────────────────────
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  tierEmoji: {
    fontSize: 14,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Detailed ────────────────────────────────────────────────
  detailedContainer: {
    gap: 8,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailedEmoji: {
    fontSize: 28,
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  detailedLevel: {
    fontSize: 13,
  },

  // ── Progress ────────────────────────────────────────────────
  progressContainer: {
    gap: 4,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  xpText: {
    fontSize: 11,
    textAlign: "right",
  },
});
