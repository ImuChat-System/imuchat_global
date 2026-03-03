/**
 * Beta Features Toggle Screen
 *
 * Features:
 * - List of beta features with descriptions
 * - Stability indicator (experimental, beta, stable)
 * - Toggle switch for user-toggleable features
 * - Locked indicator for non-toggleable features
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { BetaFeature } from "@/types/support";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

const STABILITY_CONFIG: Record<
  BetaFeature["stability"],
  { color: string; emoji: string }
> = {
  experimental: { color: "#EF4444", emoji: "🧪" },
  beta: { color: "#F59E0B", emoji: "⚡" },
  stable: { color: "#10B981", emoji: "✅" },
};

export default function BetaFeaturesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { betaFeatures, toggleBetaFeature, enabledBetaCount } = useSupport();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.headerDesc, { color: colors.textMuted }]}>
        {t("support.betaDesc")}
      </Text>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.surface }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {betaFeatures.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("support.totalFeatures")}
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: "#10B981" }]}>
            {enabledBetaCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("support.enabledFeatures")}
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: "#EF4444" }]}>
            {betaFeatures.length - enabledBetaCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("support.disabledFeatures")}
          </Text>
        </View>
      </View>

      {/* Feature list */}
      {betaFeatures.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 32 }}>🧪</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("support.noBetaFeatures")}
          </Text>
        </View>
      ) : (
        betaFeatures.map((feature) => {
          const stability = STABILITY_CONFIG[feature.stability];
          return (
            <View
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.featureHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.featureName, { color: colors.text }]}>
                      {feature.name}
                    </Text>
                    <View
                      style={[
                        styles.stabilityBadge,
                        { backgroundColor: stability.color + "20" },
                      ]}
                    >
                      <Text style={{ fontSize: 10 }}>{stability.emoji}</Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: stability.color,
                          fontWeight: "600",
                        }}
                      >
                        {t(`support.stability.${feature.stability}`)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.featureDesc, { color: colors.textMuted }]}
                  >
                    {feature.description}
                  </Text>
                  <Text
                    style={[styles.featureDate, { color: colors.textMuted }]}
                  >
                    {t("support.addedOn", {
                      date: new Date(feature.addedAt).toLocaleDateString(),
                    })}
                  </Text>
                </View>

                {feature.userToggleable ? (
                  <Switch
                    value={feature.enabled}
                    onValueChange={() => toggleBetaFeature(feature.id)}
                    trackColor={{
                      false: colors.border,
                      true: colors.primary + "60",
                    }}
                    thumbColor={feature.enabled ? colors.primary : "#f4f3f4"}
                  />
                ) : (
                  <View style={styles.lockedContainer}>
                    <Ionicons
                      name={
                        feature.enabled
                          ? "lock-open-outline"
                          : "lock-closed-outline"
                      }
                      size={18}
                      color={colors.textMuted}
                    />
                    <Text
                      style={[styles.lockedText, { color: colors.textMuted }]}
                    >
                      {feature.enabled
                        ? t("support.forcedOn")
                        : t("support.forcedOff")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* Warning */}
      <View style={[styles.warningCard, { backgroundColor: "#F59E0B" + "15" }]}>
        <Text style={{ fontSize: 16 }}>⚠️</Text>
        <Text style={[styles.warningText, { color: "#F59E0B" }]}>
          {t("support.betaWarning")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  headerDesc: { fontSize: 14, lineHeight: 20 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 32 },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  featureCard: { borderRadius: 12, padding: 14 },
  featureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  featureName: { fontSize: 14, fontWeight: "600" },
  stabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  featureDesc: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  featureDate: { fontSize: 11, marginTop: 6 },
  lockedContainer: { alignItems: "center", gap: 2 },
  lockedText: { fontSize: 10 },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  warningText: { fontSize: 13, lineHeight: 18, flex: 1, fontWeight: "500" },
});
