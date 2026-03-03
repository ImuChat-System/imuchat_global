/**
 * Region & Timezone Settings Screen
 *
 * Timezone, date format, time format, first day of week, country.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type {
  DateFormatStyle,
  TimeFormatStyle,
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

const DATE_FORMATS: { value: DateFormatStyle; label: string }[] = [
  { value: "DD/MM/YYYY", label: "31/12/2025" },
  { value: "MM/DD/YYYY", label: "12/31/2025" },
  { value: "YYYY-MM-DD", label: "2025-12-31" },
];

const TIME_FORMATS: { value: TimeFormatStyle; label: string; desc: string }[] =
  [
    { value: "24h", label: "14:30", desc: "24 heures" },
    { value: "12h", label: "2:30 PM", desc: "12 heures" },
  ];

const COMMON_TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function RegionSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { region, setRegionPref, setTimezone, setDateFormat, setTimeFormat } =
    useAdvancedSettings();

  return (
    <ScrollView
      testID="region-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── Timezone ────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.timezone")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>🕐</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("advancedSettings.autoTimezone")}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {region.timezone}
            </Text>
          </View>
          <Switch
            testID="switch-auto-tz"
            value={region.autoTimezone}
            onValueChange={(v) => setRegionPref({ autoTimezone: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {!region.autoTimezone && (
          <>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            {COMMON_TIMEZONES.map((tz) => {
              const isActive = region.timezone === tz;
              return (
                <TouchableOpacity
                  key={tz}
                  testID={`tz-${tz}`}
                  style={[
                    styles.tzRow,
                    isActive && { backgroundColor: colors.primary + "10" },
                  ]}
                  onPress={() => setTimezone(tz)}
                >
                  <Text
                    style={[
                      styles.tzLabel,
                      { color: isActive ? colors.primary : colors.text },
                    ]}
                  >
                    {tz.replace("_", " ")}
                  </Text>
                  {isActive && (
                    <View
                      style={[
                        styles.checkDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>

      {/* ─── Date Format ─────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.dateFormatTitle")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {DATE_FORMATS.map((fmt, idx) => {
          const isActive = region.dateFormat === fmt.value;
          return (
            <View key={fmt.value}>
              <TouchableOpacity
                testID={`date-${fmt.value}`}
                style={[
                  styles.row,
                  isActive && { backgroundColor: colors.primary + "10" },
                ]}
                onPress={() => setDateFormat(fmt.value)}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    { color: isActive ? colors.primary : colors.text, flex: 1 },
                  ]}
                >
                  {fmt.label}
                </Text>
                <Text style={[styles.fmtType, { color: colors.textMuted }]}>
                  {fmt.value}
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
              {idx < DATE_FORMATS.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* ─── Time Format ─────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.timeFormatTitle")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {TIME_FORMATS.map((fmt, idx) => {
          const isActive = region.timeFormat === fmt.value;
          return (
            <View key={fmt.value}>
              <TouchableOpacity
                testID={`time-${fmt.value}`}
                style={[
                  styles.row,
                  isActive && { backgroundColor: colors.primary + "10" },
                ]}
                onPress={() => setTimeFormat(fmt.value)}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    { color: isActive ? colors.primary : colors.text, flex: 1 },
                  ]}
                >
                  {fmt.label}
                </Text>
                <Text style={[styles.fmtType, { color: colors.textMuted }]}>
                  {fmt.desc}
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
              {idx < TIME_FORMATS.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* ─── First Day of Week ───────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.firstDayOfWeek")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {[
          { value: 1 as const, labelKey: "advancedSettings.monday" },
          { value: 0 as const, labelKey: "advancedSettings.sunday" },
        ].map((opt, idx) => {
          const isActive = region.firstDayOfWeek === opt.value;
          return (
            <View key={opt.value}>
              <TouchableOpacity
                testID={`fdow-${opt.value}`}
                style={[
                  styles.row,
                  isActive && { backgroundColor: colors.primary + "10" },
                ]}
                onPress={() => setRegionPref({ firstDayOfWeek: opt.value })}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    { color: isActive ? colors.primary : colors.text, flex: 1 },
                  ]}
                >
                  {t(opt.labelKey)}
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
              {idx === 0 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
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
  fmtType: { fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 14 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  tzRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tzLabel: { fontSize: 14 },
  checkDot: { width: 8, height: 8, borderRadius: 4 },
});
