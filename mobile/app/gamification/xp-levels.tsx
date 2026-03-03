/**
 * XP & Niveaux — Profil de progression
 *
 * Affiche le niveau actuel, la barre de progression XP,
 * l'historique des gains XP et les paliers de niveaux.
 *
 * Phase 3 — DEV-032
 */

import { useGamification } from "@/hooks/useGamification";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function XPLevelsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { userLevel, xpHistory, levelProgress } = useGamification();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Level card ──────────────────────────────────────────── */}
      <View style={[styles.levelCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.levelNumber}>
          {t("gamification.levelLabel", { level: userLevel.level })}
        </Text>
        <Text style={styles.levelTitleText}>{userLevel.title}</Text>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(levelProgress, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {userLevel.currentXP} / {userLevel.xpForNextLevel} XP ({levelProgress}
          %)
        </Text>
      </View>

      {/* ── Total XP ────────────────────────────────────────────── */}
      <View style={[styles.totalRow, { backgroundColor: colors.surface }]}>
        <Text style={[styles.totalLabel, { color: colors.textMuted }]}>
          {t("gamification.totalXP")}
        </Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {userLevel.totalXP} XP
        </Text>
      </View>

      {/* ── XP History ──────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("gamification.xpHistory")}
      </Text>

      {xpHistory.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("gamification.noXPHistory")}
        </Text>
      ) : (
        <FlatList
          data={xpHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View
              style={[styles.historyRow, { backgroundColor: colors.surface }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyAction, { color: colors.text }]}>
                  {item.action}
                </Text>
                <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.historyXP, { color: colors.primary }]}>
                +{item.xp} XP
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  levelCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  levelNumber: { fontSize: 32, fontWeight: "800", color: "#fff" },
  levelTitleText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  progressBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
    marginTop: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 16, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 24 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
  },
  historyAction: { fontSize: 14, fontWeight: "500" },
  historyDate: { fontSize: 12, marginTop: 2 },
  historyXP: { fontSize: 16, fontWeight: "700" },
});
