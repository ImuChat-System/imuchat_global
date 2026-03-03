/**
 * Performance Settings Screen
 *
 * Performance mode selector, animation toggle, image quality,
 * auto-play, background sync, cache limits.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { PerformanceMode } from "@/types/advanced-settings";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MODES: {
  value: PerformanceMode;
  emoji: string;
  labelKey: string;
  descKey: string;
}[] = [
  {
    value: "auto",
    emoji: "🤖",
    labelKey: "advancedSettings.modeAuto",
    descKey: "advancedSettings.modeAutoDesc",
  },
  {
    value: "high",
    emoji: "🚀",
    labelKey: "advancedSettings.modeHigh",
    descKey: "advancedSettings.modeHighDesc",
  },
  {
    value: "balanced",
    emoji: "⚖️",
    labelKey: "advancedSettings.modeBalanced",
    descKey: "advancedSettings.modeBalancedDesc",
  },
  {
    value: "low",
    emoji: "🔋",
    labelKey: "advancedSettings.modeLow",
    descKey: "advancedSettings.modeLowDesc",
  },
];

export default function PerformanceSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { performance, setPerformanceMode, setPerformancePref } =
    useAdvancedSettings();

  const handleClearCache = () => {
    Alert.alert(
      t("advancedSettings.clearCache"),
      t("advancedSettings.clearCacheConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("advancedSettings.clearCache"),
          style: "destructive",
          onPress: () => {
            // TODO: Actual cache clear
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      testID="performance-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── Mode selector ──────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.performanceMode")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {MODES.map((mode, idx) => {
          const isSelected = performance.mode === mode.value;
          return (
            <View key={mode.value}>
              <TouchableOpacity
                testID={`perf-mode-${mode.value}`}
                style={[
                  styles.modeRow,
                  isSelected && { backgroundColor: colors.primary + "10" },
                ]}
                onPress={() => setPerformanceMode(mode.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{mode.emoji}</Text>
                <View style={styles.modeContent}>
                  <Text
                    style={[
                      styles.modeLabel,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {t(mode.labelKey)}
                  </Text>
                  <Text style={[styles.modeDesc, { color: colors.textMuted }]}>
                    {t(mode.descKey)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {idx < MODES.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* ─── Detailed toggles ───────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.detailedOptions")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ToggleRow
          emoji="✨"
          label={t("advancedSettings.disableAnimations")}
          value={performance.disableAnimations}
          onValueChange={(v) => setPerformancePref({ disableAnimations: v })}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="🖼️"
          label={t("advancedSettings.reducedImageQuality")}
          value={performance.reducedImageQuality}
          onValueChange={(v) => setPerformancePref({ reducedImageQuality: v })}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="▶️"
          label={t("advancedSettings.disableAutoPlay")}
          value={performance.disableAutoPlayVideos}
          onValueChange={(v) =>
            setPerformancePref({ disableAutoPlayVideos: v })
          }
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="🔄"
          label={t("advancedSettings.disableBackgroundSync")}
          value={performance.disableBackgroundSync}
          onValueChange={(v) =>
            setPerformancePref({ disableBackgroundSync: v })
          }
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="🎞️"
          label={t("advancedSettings.limitFps")}
          value={performance.limitFps}
          onValueChange={(v) => setPerformancePref({ limitFps: v })}
          colors={colors}
        />
      </View>

      {/* ─── Cache ──────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.cache")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>💾</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("advancedSettings.cacheSizeLimit")}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {performance.cacheSizeLimitMb} MB
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          testID="btn-clear-cache"
          style={styles.row}
          onPress={handleClearCache}
        >
          <Text style={styles.emoji}>🗑️</Text>
          <Text style={[styles.rowLabel, { color: colors.error, flex: 1 }]}>
            {t("advancedSettings.clearCache")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ToggleRow({
  emoji,
  label,
  value,
  onValueChange,
  colors,
}: {
  emoji: string;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: 12, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  emoji: { fontSize: 20 },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 46 },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  modeContent: { flex: 1 },
  modeLabel: { fontSize: 15, fontWeight: "600" },
  modeDesc: { fontSize: 12, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
});
