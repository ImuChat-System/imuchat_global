/**
 * Badges & Trophées — Collection de badges
 *
 * Grille de badges avec filtre par rareté, progression,
 * et détail au tap.
 *
 * Phase 3 — DEV-032
 */

import { useGamification } from "@/hooks/useGamification";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { BadgeRarity } from "@/types/gamification";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "#9e9e9e",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
};

const RARITY_FILTERS: (BadgeRarity | "all")[] = [
  "all",
  "common",
  "rare",
  "epic",
  "legendary",
];

export default function BadgesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { badges, unlockedBadgesCount } = useGamification();
  const [filter, setFilter] = useState<BadgeRarity | "all">("all");
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const filteredBadges = useMemo(
    () =>
      filter === "all" ? badges : badges.filter((b) => b.rarity === filter),
    [badges, filter],
  );

  const selectedBadge = useMemo(
    () => badges.find((b) => b.id === selectedBadgeId) ?? null,
    [badges, selectedBadgeId],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Stats ───────────────────────────────────────────────── */}
      <Text style={[styles.statsText, { color: colors.textMuted }]}>
        {t("gamification.badgesProgress", {
          unlocked: unlockedBadgesCount,
          total: badges.length,
        })}
      </Text>

      {/* ── Rarity filter ───────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {RARITY_FILTERS.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setFilter(r)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === r ? colors.primary : colors.surface,
              },
            ]}
          >
            <Text
              style={{
                color: filter === r ? "#fff" : colors.text,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {t(`gamification.rarity_${r}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Badge detail overlay ─────────────────────────────────  */}
      {selectedBadge && (
        <TouchableOpacity
          style={[styles.detailCard, { backgroundColor: colors.surface }]}
          onPress={() => setSelectedBadgeId(null)}
          activeOpacity={0.9}
        >
          <Text style={{ fontSize: 48 }}>{selectedBadge.icon}</Text>
          <Text style={[styles.detailName, { color: colors.text }]}>
            {selectedBadge.name}
          </Text>
          <Text style={[styles.detailDesc, { color: colors.textMuted }]}>
            {selectedBadge.description}
          </Text>
          <View style={styles.detailMeta}>
            <Text
              style={{
                color: RARITY_COLORS[selectedBadge.rarity],
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {t(`gamification.rarity_${selectedBadge.rarity}`)}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {selectedBadge.requirement}
            </Text>
          </View>
          {!selectedBadge.unlocked && (
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBg, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${selectedBadge.progress}%`,
                      backgroundColor: RARITY_COLORS[selectedBadge.rarity],
                    },
                  ]}
                />
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {selectedBadge.progress}%
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* ── Badge grid ──────────────────────────────────────────── */}
      <FlatList
        data={filteredBadges}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.badgeCell,
              {
                backgroundColor: colors.surface,
                opacity: item.unlocked ? 1 : 0.5,
                borderColor: RARITY_COLORS[item.rarity],
                borderWidth: item.unlocked ? 2 : 0,
              },
            ]}
            onPress={() => setSelectedBadgeId(item.id)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 32 }}>{item.icon}</Text>
            <Text
              style={[styles.badgeName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("gamification.noBadges")}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  statsText: { fontSize: 14, marginBottom: 12 },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeCell: {
    flex: 1,
    maxWidth: "31%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },

  // Detail card
  detailCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  detailName: { fontSize: 18, fontWeight: "700" },
  detailDesc: { fontSize: 14, textAlign: "center" },
  detailMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  progressContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
});
