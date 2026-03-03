/**
 * Sound & Ambiance Settings Screen
 *
 * Volume controls, notification sounds, UI sounds, ambient background,
 * haptic feedback.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { AmbientSound } from "@/types/advanced-settings";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AMBIENT_OPTIONS: {
  value: AmbientSound;
  emoji: string;
  labelKey: string;
}[] = [
  { value: "none", emoji: "🔇", labelKey: "advancedSettings.ambientNone" },
  { value: "rain", emoji: "🌧️", labelKey: "advancedSettings.ambientRain" },
  { value: "forest", emoji: "🌲", labelKey: "advancedSettings.ambientForest" },
  { value: "ocean", emoji: "🌊", labelKey: "advancedSettings.ambientOcean" },
  { value: "cafe", emoji: "☕", labelKey: "advancedSettings.ambientCafe" },
  {
    value: "fireplace",
    emoji: "🔥",
    labelKey: "advancedSettings.ambientFireplace",
  },
  { value: "lofi", emoji: "🎵", labelKey: "advancedSettings.ambientLofi" },
  { value: "space", emoji: "🚀", labelKey: "advancedSettings.ambientSpace" },
];

export default function SoundSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { sound, setSoundPref, setAmbientSound } = useAdvancedSettings();

  return (
    <ScrollView
      testID="sound-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── Volume ──────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.volume")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>🔊</Text>
          <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
            {t("advancedSettings.masterVolume")}
          </Text>
          <Text style={[styles.valueText, { color: colors.textMuted }]}>
            {sound.masterVolume}%
          </Text>
        </View>
        {/* Simple +/- buttons for volume */}
        <View style={styles.volumeControls}>
          <TouchableOpacity
            testID="btn-vol-down"
            style={[styles.volBtn, { borderColor: colors.border }]}
            onPress={() =>
              setSoundPref({
                masterVolume: Math.max(0, sound.masterVolume - 10),
              })
            }
          >
            <Text style={{ color: colors.text, fontSize: 18 }}>−</Text>
          </TouchableOpacity>
          <View style={[styles.volumeBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.volumeFill,
                {
                  width: `${sound.masterVolume}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <TouchableOpacity
            testID="btn-vol-up"
            style={[styles.volBtn, { borderColor: colors.border }]}
            onPress={() =>
              setSoundPref({
                masterVolume: Math.min(100, sound.masterVolume + 10),
              })
            }
          >
            <Text style={{ color: colors.text, fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Toggles ─────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.soundOptions")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ToggleRow
          emoji="🔔"
          label={t("advancedSettings.notificationSound")}
          value={sound.notificationSound}
          onValueChange={(v) => setSoundPref({ notificationSound: v })}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="🎹"
          label={t("advancedSettings.uiSounds")}
          value={sound.uiSounds}
          onValueChange={(v) => setSoundPref({ uiSounds: v })}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="📳"
          label={t("advancedSettings.hapticFeedback")}
          value={sound.hapticEnabled}
          onValueChange={(v) => setSoundPref({ hapticEnabled: v })}
          colors={colors}
        />
      </View>

      {/* ─── Ambient Sound ───────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.ambientSound")}
      </Text>
      <View
        style={[styles.card, { backgroundColor: colors.surface, padding: 12 }]}
      >
        <View style={styles.ambientGrid}>
          {AMBIENT_OPTIONS.map((opt) => {
            const isActive = sound.ambientSound === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                testID={`ambient-${opt.value}`}
                style={[
                  styles.ambientCard,
                  {
                    backgroundColor: isActive
                      ? colors.primary + "20"
                      : colors.background,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setAmbientSound(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.ambientEmoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.ambientLabel,
                    { color: isActive ? colors.primary : colors.text },
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {sound.ambientSound !== "none" && (
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.emoji}>🎚️</Text>
            <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
              {t("advancedSettings.ambientVolume")}
            </Text>
            <Text style={[styles.valueText, { color: colors.textMuted }]}>
              {sound.ambientVolume}%
            </Text>
          </View>
        )}
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
  valueText: { fontSize: 14 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 46 },
  volumeControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  volBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  volumeBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  volumeFill: {
    height: "100%",
    borderRadius: 3,
  },
  ambientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ambientCard: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  ambientEmoji: { fontSize: 24, marginBottom: 4 },
  ambientLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
});
