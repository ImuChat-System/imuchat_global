/**
 * Missions quotidiennes / hebdomadaires / spéciales
 *
 * Liste des missions avec progression, filtres par fréquence,
 * et bouton de réclamation de récompense.
 *
 * Phase 3 — DEV-032
 */

import { useGamification } from "@/hooks/useGamification";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { MissionFrequency } from "@/types/gamification";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FREQUENCY_TABS: (MissionFrequency | "all")[] = [
  "all",
  "daily",
  "weekly",
  "special",
];

export default function MissionsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { missions, claimMissionReward, claimableMissionsCount } =
    useGamification();
  const [tab, setTab] = useState<MissionFrequency | "all">("all");

  const filteredMissions = useMemo(
    () =>
      tab === "all" ? missions : missions.filter((m) => m.frequency === tab),
    [missions, tab],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <View style={styles.tabRow}>
        {FREQUENCY_TABS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setTab(f)}
            style={[
              styles.tab,
              {
                backgroundColor: tab === f ? colors.primary : colors.surface,
              },
            ]}
          >
            <Text
              style={{
                color: tab === f ? "#fff" : colors.text,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {t(`gamification.freq_${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Claimable banner ─────────────────────────────────────── */}
      {claimableMissionsCount > 0 && (
        <View
          style={[
            styles.claimBanner,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Text style={[styles.claimBannerText, { color: colors.primary }]}>
            {t("gamification.claimableCount", {
              count: claimableMissionsCount,
            })}
          </Text>
        </View>
      )}

      {/* ── Mission list ─────────────────────────────────────────── */}
      <FlatList
        data={filteredMissions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View
            style={[styles.missionCard, { backgroundColor: colors.surface }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.missionTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.missionDesc, { color: colors.textMuted }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>

              {/* Progress bar */}
              <View
                style={[styles.progressBg, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.progress}%`,
                      backgroundColor:
                        item.status === "completed" || item.status === "claimed"
                          ? "#4caf50"
                          : colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>
                {item.current}/{item.target} ({item.progress}%)
              </Text>
            </View>

            {/* Reward + Claim */}
            <View style={styles.rewardCol}>
              <Text style={[styles.rewardLabel, { color: colors.primary }]}>
                {item.reward.label}
              </Text>

              {item.status === "completed" && (
                <TouchableOpacity
                  style={[styles.claimBtn, { backgroundColor: colors.primary }]}
                  onPress={() => claimMissionReward(item.id)}
                >
                  <Text style={styles.claimBtnText}>
                    {t("gamification.claim")}
                  </Text>
                </TouchableOpacity>
              )}
              {item.status === "claimed" && (
                <Text style={[styles.claimedText, { color: "#4caf50" }]}>
                  ✓ {t("gamification.claimed")}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("gamification.noMissions")}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimBanner: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  claimBannerText: { fontSize: 14, fontWeight: "600" },
  missionCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  missionTitle: { fontSize: 15, fontWeight: "600" },
  missionDesc: { fontSize: 13, marginTop: 2 },
  progressBg: {
    height: 6,
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 11, marginTop: 4 },
  rewardCol: { alignItems: "center", justifyContent: "center", minWidth: 80 },
  rewardLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  claimBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  claimBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  claimedText: { marginTop: 6, fontSize: 12, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
});
