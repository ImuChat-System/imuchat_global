/**
 * Granular Notification Settings Screen
 *
 * Per-channel toggle + delivery methods, quiet hours, preview options.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { NotificationChannel } from "@/types/advanced-settings";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CHANNELS: {
  key: NotificationChannel;
  emoji: string;
  labelKey: string;
}[] = [
  {
    key: "messages",
    emoji: "💬",
    labelKey: "advancedSettings.channelMessages",
  },
  {
    key: "mentions",
    emoji: "📢",
    labelKey: "advancedSettings.channelMentions",
  },
  { key: "calls", emoji: "📞", labelKey: "advancedSettings.channelCalls" },
  { key: "groups", emoji: "👥", labelKey: "advancedSettings.channelGroups" },
  { key: "stories", emoji: "📖", labelKey: "advancedSettings.channelStories" },
  { key: "events", emoji: "📅", labelKey: "advancedSettings.channelEvents" },
  { key: "system", emoji: "⚙️", labelKey: "advancedSettings.channelSystem" },
  {
    key: "marketing",
    emoji: "📣",
    labelKey: "advancedSettings.channelMarketing",
  },
];

export default function NotificationSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    notifications,
    setChannelConfig,
    setQuietHours,
    setNotificationPref,
  } = useAdvancedSettings();

  return (
    <ScrollView
      testID="notif-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── Per-channel toggles ─────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.channels")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {CHANNELS.map((ch, idx) => {
          const config = notifications.channels[ch.key];
          return (
            <View key={ch.key}>
              <View style={styles.row}>
                <Text style={styles.emoji}>{ch.emoji}</Text>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {t(ch.labelKey)}
                  </Text>
                  <View style={styles.subToggles}>
                    {config.enabled && (
                      <>
                        <MiniToggle
                          label={t("advancedSettings.toggleSound")}
                          value={config.sound}
                          onValueChange={(v) =>
                            setChannelConfig(ch.key, { sound: v })
                          }
                          colors={colors}
                        />
                        <MiniToggle
                          label={t("advancedSettings.toggleVibration")}
                          value={config.vibration}
                          onValueChange={(v) =>
                            setChannelConfig(ch.key, { vibration: v })
                          }
                          colors={colors}
                        />
                        <MiniToggle
                          label={t("advancedSettings.toggleBadge")}
                          value={config.badge}
                          onValueChange={(v) =>
                            setChannelConfig(ch.key, { badge: v })
                          }
                          colors={colors}
                        />
                      </>
                    )}
                  </View>
                </View>
                <Switch
                  testID={`switch-channel-${ch.key}`}
                  value={config.enabled}
                  onValueChange={(v) =>
                    setChannelConfig(ch.key, { enabled: v })
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              {idx < CHANNELS.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* ─── Quiet Hours ─────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.quietHours")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>🌙</Text>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("advancedSettings.quietHoursEnabled")}
            </Text>
            {notifications.quietHours.enabled && (
              <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                {`${String(notifications.quietHours.startHour).padStart(2, "0")}:${String(notifications.quietHours.startMinute).padStart(2, "0")} → ${String(notifications.quietHours.endHour).padStart(2, "0")}:${String(notifications.quietHours.endMinute).padStart(2, "0")}`}
              </Text>
            )}
          </View>
          <Switch
            testID="switch-quiet-hours"
            value={notifications.quietHours.enabled}
            onValueChange={(v) => setQuietHours({ enabled: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* ─── General prefs ───────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.general")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>📦</Text>
          <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
            {t("advancedSettings.groupNotifications")}
          </Text>
          <Switch
            testID="switch-group-notif"
            value={notifications.groupNotifications}
            onValueChange={(v) => setNotificationPref("groupNotifications", v)}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={styles.emoji}>👁️</Text>
          <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
            {t("advancedSettings.showPreview")}
          </Text>
          <Switch
            testID="switch-preview"
            value={notifications.showPreview}
            onValueChange={(v) => setNotificationPref("showPreview", v)}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function MiniToggle({
  label,
  value,
  onValueChange,
  colors,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.miniToggle,
        {
          backgroundColor: value ? colors.primary + "20" : colors.background,
          borderColor: value ? colors.primary : colors.border,
        },
      ]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.miniToggleText,
          { color: value ? colors.primary : colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  subToggles: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  miniToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  miniToggleText: { fontSize: 11, fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 46 },
});
