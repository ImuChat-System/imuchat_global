/**
 * Classements — Global / Amis rankings
 *
 * Leaderboard avec onglets scope (global, amis, communauté),
 * sélecteur de période, et liste de classement.
 *
 * Phase 3 — DEV-032
 */

import { useGamification } from "@/hooks/useGamification";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { LeaderboardPeriod, LeaderboardScope } from "@/types/gamification";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SCOPES: LeaderboardScope[] = ["global", "friends", "community"];
const PERIODS: LeaderboardPeriod[] = ["daily", "weekly", "monthly", "all-time"];

export default function LeaderboardsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { leaderboard, setLeaderboardFilter } = useGamification();

  const currentScope = leaderboard?.scope ?? "global";
  const currentPeriod = leaderboard?.period ?? "weekly";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Scope tabs ──────────────────────────────────────────── */}
      <View style={styles.tabRow}>
        {SCOPES.map((scope) => (
          <TouchableOpacity
            key={scope}
            onPress={() => setLeaderboardFilter(scope, currentPeriod)}
            style={[
              styles.tab,
              {
                backgroundColor:
                  currentScope === scope ? colors.primary : colors.surface,
              },
            ]}
          >
            <Text
              style={{
                color: currentScope === scope ? "#fff" : colors.text,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {t(`gamification.scope_${scope}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Period selector ─────────────────────────────────────── */}
      <View style={styles.periodRow}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setLeaderboardFilter(currentScope, period)}
          >
            <Text
              style={[
                styles.periodText,
                {
                  color:
                    currentPeriod === period
                      ? colors.primary
                      : colors.textMuted,
                  fontWeight: currentPeriod === period ? "700" : "400",
                },
              ]}
            >
              {t(`gamification.period_${period}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── User rank banner ────────────────────────────────────── */}
      {leaderboard?.userRank && (
        <View
          style={[
            styles.userRankCard,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Text style={[styles.userRankNumber, { color: colors.primary }]}>
            #{leaderboard.userRank.rank}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userRankName, { color: colors.text }]}>
              {leaderboard.userRank.username}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Lv.{leaderboard.userRank.level} · {leaderboard.userRank.xp} XP
            </Text>
          </View>
        </View>
      )}

      {/* ── Ranking list ────────────────────────────────────────── */}
      {leaderboard && leaderboard.entries.length > 0 ? (
        <FlatList
          data={leaderboard.entries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ gap: 6, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isTop3 = item.rank <= 3;
            const medal =
              item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉";
            return (
              <View
                style={[
                  styles.entryRow,
                  {
                    backgroundColor: item.isCurrentUser
                      ? colors.primary + "10"
                      : colors.surface,
                  },
                ]}
              >
                <Text style={[styles.rank, { color: colors.text }]}>
                  {isTop3 ? medal : `#${item.rank}`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.entryName,
                      {
                        color: colors.text,
                        fontWeight: item.isCurrentUser ? "700" : "500",
                      },
                    ]}
                  >
                    {item.username}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Lv.{item.level}
                  </Text>
                </View>
                <Text style={[styles.entryXP, { color: colors.primary }]}>
                  {item.xp} XP
                </Text>
              </View>
            );
          }}
        />
      ) : (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("gamification.noLeaderboard")}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  periodRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  periodText: { fontSize: 13 },
  userRankCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  userRankNumber: { fontSize: 22, fontWeight: "800" },
  userRankName: { fontSize: 15, fontWeight: "600" },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  rank: { fontSize: 16, fontWeight: "700", width: 40, textAlign: "center" },
  entryName: { fontSize: 14 },
  entryXP: { fontSize: 14, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
});
