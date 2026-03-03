/**
 * Accessibility Settings Screen
 *
 * Reduce motion, contrast, font size, bold text, screen reader,
 * color blind mode, captions, mono audio.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type {
  ColorBlindMode,
  ContrastMode,
  FontSizeScale,
} from "@/types/advanced-settings";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

const FONT_SIZES: {
  value: FontSizeScale;
  labelKey: string;
  preview: number;
}[] = [
  { value: "small", labelKey: "advancedSettings.fontSmall", preview: 13 },
  { value: "default", labelKey: "advancedSettings.fontDefault", preview: 16 },
  { value: "large", labelKey: "advancedSettings.fontLarge", preview: 19 },
  {
    value: "extraLarge",
    labelKey: "advancedSettings.fontExtraLarge",
    preview: 22,
  },
];

const CONTRAST_MODES: {
  value: ContrastMode;
  labelKey: string;
  emoji: string;
}[] = [
  {
    value: "default",
    labelKey: "advancedSettings.contrastDefault",
    emoji: "🌗",
  },
  { value: "high", labelKey: "advancedSettings.contrastHigh", emoji: "🌓" },
  {
    value: "extraHigh",
    labelKey: "advancedSettings.contrastExtraHigh",
    emoji: "🌑",
  },
];

const COLOR_BLIND_MODES: { value: ColorBlindMode; labelKey: string }[] = [
  { value: "none", labelKey: "advancedSettings.colorBlindNone" },
  { value: "protanopia", labelKey: "advancedSettings.protanopia" },
  { value: "deuteranopia", labelKey: "advancedSettings.deuteranopia" },
  { value: "tritanopia", labelKey: "advancedSettings.tritanopia" },
];

export default function AccessibilitySettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    accessibility,
    setAccessibilityPref,
    setFontSizeScale,
    setContrastMode,
  } = useAdvancedSettings();

  return (
    <ScrollView
      testID="accessibility-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── Motion ──────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.motion")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ToggleRow
          emoji="✨"
          label={t("advancedSettings.reduceMotion")}
          subtitle={t("advancedSettings.reduceMotionDesc")}
          value={accessibility.reduceMotion}
          onValueChange={(v) => setAccessibilityPref({ reduceMotion: v })}
          colors={colors}
        />
      </View>

      {/* ─── Font Size ───────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.fontSize")}
      </Text>
      <View
        style={[styles.card, { backgroundColor: colors.surface, padding: 14 }]}
      >
        <View style={styles.fontGrid}>
          {FONT_SIZES.map((fs) => {
            const isActive = accessibility.fontSizeScale === fs.value;
            return (
              <TouchableOpacity
                key={fs.value}
                testID={`font-${fs.value}`}
                style={[
                  styles.fontCard,
                  {
                    backgroundColor: isActive
                      ? colors.primary + "15"
                      : colors.background,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFontSizeScale(fs.value)}
              >
                <Text
                  style={{
                    fontSize: fs.preview,
                    fontWeight: "600",
                    color: isActive ? colors.primary : colors.text,
                  }}
                >
                  Aa
                </Text>
                <Text
                  style={[
                    styles.fontLabel,
                    { color: isActive ? colors.primary : colors.textMuted },
                  ]}
                >
                  {t(fs.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 12 }}>
          <ToggleRow
            emoji="𝐁"
            label={t("advancedSettings.boldText")}
            value={accessibility.boldText}
            onValueChange={(v) => setAccessibilityPref({ boldText: v })}
            colors={colors}
          />
        </View>
      </View>

      {/* ─── Contrast ────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.contrast")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {CONTRAST_MODES.map((cm, idx) => {
          const isActive = accessibility.contrastMode === cm.value;
          return (
            <View key={cm.value}>
              <TouchableOpacity
                testID={`contrast-${cm.value}`}
                style={[
                  styles.row,
                  isActive && { backgroundColor: colors.primary + "10" },
                ]}
                onPress={() => setContrastMode(cm.value)}
              >
                <Text style={styles.emoji}>{cm.emoji}</Text>
                <Text
                  style={[
                    styles.rowLabel,
                    { color: isActive ? colors.primary : colors.text, flex: 1 },
                  ]}
                >
                  {t(cm.labelKey)}
                </Text>
                <View
                  style={[
                    styles.radio,
                    { borderColor: isActive ? colors.primary : colors.border },
                  ]}
                >
                  {isActive && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {idx < CONTRAST_MODES.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* ─── Color Blind ─────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.colorBlind")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {COLOR_BLIND_MODES.map((cb, idx) => {
          const isActive = accessibility.colorBlindMode === cb.value;
          return (
            <View key={cb.value}>
              <TouchableOpacity
                testID={`colorblind-${cb.value}`}
                style={[
                  styles.row,
                  isActive && { backgroundColor: colors.primary + "10" },
                ]}
                onPress={() =>
                  setAccessibilityPref({ colorBlindMode: cb.value })
                }
              >
                <Text
                  style={[
                    styles.rowLabel,
                    { color: isActive ? colors.primary : colors.text, flex: 1 },
                  ]}
                >
                  {t(cb.labelKey)}
                </Text>
                <View
                  style={[
                    styles.radio,
                    { borderColor: isActive ? colors.primary : colors.border },
                  ]}
                >
                  {isActive && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {idx < COLOR_BLIND_MODES.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* ─── Other a11y settings ─────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.otherA11y")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ToggleRow
          emoji="🗣️"
          label={t("advancedSettings.screenReader")}
          value={accessibility.screenReaderOptimized}
          onValueChange={(v) =>
            setAccessibilityPref({ screenReaderOptimized: v })
          }
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="📝"
          label={t("advancedSettings.autoPlayCaptions")}
          value={accessibility.autoPlayCaptions}
          onValueChange={(v) => setAccessibilityPref({ autoPlayCaptions: v })}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="🔈"
          label={t("advancedSettings.monoAudio")}
          value={accessibility.monoAudio}
          onValueChange={(v) => setAccessibilityPref({ monoAudio: v })}
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

function ToggleRow({
  emoji,
  label,
  subtitle,
  value,
  onValueChange,
  colors,
}: {
  emoji: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
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
  fontGrid: { flexDirection: "row", gap: 8 },
  fontCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  fontLabel: { fontSize: 10, marginTop: 4, fontWeight: "600" },
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
