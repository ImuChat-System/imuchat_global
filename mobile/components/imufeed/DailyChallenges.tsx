/**
 * DailyChallenges — Liste des défis quotidiens ImuFeed
 *
 * Affiche 5 défis avec barre de progression, XP reward, statut.
 * Sprint S12 Axe B — Gamification ImuFeed
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { DailyChallenge } from "@/types/gamification";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Emoji par type d'action ──────────────────────────────────

const ACTION_EMOJI: Record<string, string> = {
  publish: "📹",
  like: "❤️",
  comment: "💬",
  watch: "👀",
  share: "📤",
};

// ─── Props ────────────────────────────────────────────────────

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  onClaim: (challengeId: string) => void;
}

// ─── ChallengeItem ────────────────────────────────────────────

function ChallengeItem({
  challenge,
  onClaim,
  colors,
}: {
  challenge: DailyChallenge;
  onClaim: (id: string) => void;
  colors: any;
}) {
  const progress =
    challenge.target > 0
      ? Math.round((challenge.current / challenge.target) * 100)
      : 0;

  const handleClaim = useCallback(() => {
    onClaim(challenge.id);
  }, [onClaim, challenge.id]);

  return (
    <View
      testID={`challenge-${challenge.id}`}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.actionEmoji}>
          {ACTION_EMOJI[challenge.action_type] ?? "⭐"}
        </Text>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {challenge.title}
          </Text>
          <Text
            style={[styles.desc, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {challenge.description}
          </Text>
        </View>
        <Text style={[styles.xpLabel, { color: "#FFD700" }]}>
          +{challenge.xp_reward} XP
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            testID={`challenge-progress-${challenge.id}`}
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: challenge.completed
                  ? "#34C759"
                  : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {challenge.current}/{challenge.target}
        </Text>
      </View>

      {/* Claim button */}
      {challenge.completed && !challenge.claimed && (
        <TouchableOpacity
          testID={`claim-${challenge.id}`}
          style={styles.claimBtn}
          onPress={handleClaim}
        >
          <Ionicons name="gift" size={14} color="#fff" />
          <Text style={styles.claimText}>Réclamer</Text>
        </TouchableOpacity>
      )}

      {challenge.claimed && (
        <View testID={`claimed-${challenge.id}`} style={styles.claimedRow}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={[styles.claimedText, { color: "#34C759" }]}>
            Réclamé
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function DailyChallenges({
  challenges,
  onClaim,
}: DailyChallengesProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const renderItem = useCallback(
    ({ item }: { item: DailyChallenge }) => (
      <ChallengeItem challenge={item} onClaim={onClaim} colors={colors} />
    ),
    [onClaim, colors],
  );

  const keyExtractor = useCallback((item: DailyChallenge) => item.id, []);

  return (
    <View testID="daily-challenges" style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🎯 Défis du jour
      </Text>
      <FlatList
        data={challenges}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
      {challenges.length === 0 && (
        <Text
          testID="no-challenges"
          style={[styles.emptyText, { color: colors.textSecondary }]}
        >
          Aucun défi disponible aujourd'hui
        </Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionEmoji: {
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  desc: {
    fontSize: 11,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    width: 36,
    textAlign: "right",
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  claimText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  claimedRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 20,
  },
});
