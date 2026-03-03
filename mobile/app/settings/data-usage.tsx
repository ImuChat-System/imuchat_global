/**
 * Data Usage Settings Screen
 *
 * Media download policies, data saver mode, compression settings.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { MediaDownloadPolicy } from "@/types/advanced-settings";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MEDIA_TYPES: {
  key:
    | "autoDownloadImages"
    | "autoDownloadVideos"
    | "autoDownloadAudio"
    | "autoDownloadDocuments";
  emoji: string;
  labelKey: string;
}[] = [
  {
    key: "autoDownloadImages",
    emoji: "🖼️",
    labelKey: "advancedSettings.images",
  },
  {
    key: "autoDownloadVideos",
    emoji: "🎬",
    labelKey: "advancedSettings.videos",
  },
  { key: "autoDownloadAudio", emoji: "🎵", labelKey: "advancedSettings.audio" },
  {
    key: "autoDownloadDocuments",
    emoji: "📄",
    labelKey: "advancedSettings.documents",
  },
];

const POLICIES: { value: MediaDownloadPolicy; labelKey: string }[] = [
  { value: "always", labelKey: "advancedSettings.always" },
  { value: "wifi", labelKey: "advancedSettings.wifiOnly" },
  { value: "never", labelKey: "advancedSettings.never" },
];

export default function DataUsageSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { dataUsage, setDataUsagePref, setMediaDownloadPolicy } =
    useAdvancedSettings();

  return (
    <ScrollView
      testID="data-usage-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── Data saver ──────────────────────────────────── */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>📶</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("advancedSettings.dataSaver")}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {t("advancedSettings.dataSaverDesc")}
            </Text>
          </View>
          <Switch
            testID="switch-data-saver"
            value={dataUsage.dataSaverEnabled}
            onValueChange={(v) => setDataUsagePref({ dataSaverEnabled: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* ─── Auto-download policies ──────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.autoDownload")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {MEDIA_TYPES.map((media, idx) => (
          <View key={media.key}>
            <View style={styles.mediaRow}>
              <Text style={styles.emoji}>{media.emoji}</Text>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t(media.labelKey)}
              </Text>
            </View>
            <View style={styles.policyRow}>
              {POLICIES.map((policy) => {
                const isActive = dataUsage[media.key] === policy.value;
                return (
                  <TouchableOpacity
                    key={policy.value}
                    testID={`policy-${media.key}-${policy.value}`}
                    style={[
                      styles.policyBtn,
                      {
                        backgroundColor: isActive
                          ? colors.primary
                          : colors.background,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setMediaDownloadPolicy(media.key, policy.value)
                    }
                  >
                    <Text
                      style={[
                        styles.policyText,
                        { color: isActive ? "#fff" : colors.text },
                      ]}
                    >
                      {t(policy.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {idx < MEDIA_TYPES.length - 1 && (
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
            )}
          </View>
        ))}
      </View>

      {/* ─── Other data options ──────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.otherDataOptions")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ToggleRow
          emoji="📦"
          label={t("advancedSettings.compressUploads")}
          subtitle={t("advancedSettings.compressUploadsDesc")}
          value={dataUsage.compressUploadsOnMobile}
          onValueChange={(v) =>
            setDataUsagePref({ compressUploadsOnMobile: v })
          }
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          emoji="📇"
          label={t("advancedSettings.syncContactsWifi")}
          subtitle={t("advancedSettings.syncContactsWifiDesc")}
          value={dataUsage.syncContactsWifiOnly}
          onValueChange={(v) => setDataUsagePref({ syncContactsWifiOnly: v })}
          colors={colors}
        />
      </View>

      {/* ─── Data warning ────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.dataWarning")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("advancedSettings.dataWarningThreshold")}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {dataUsage.dataWarningMb === 0
                ? t("advancedSettings.disabled")
                : `${dataUsage.dataWarningMb} MB`}
            </Text>
          </View>
        </View>
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
  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 12,
  },
  policyRow: {
    flexDirection: "row",
    paddingHorizontal: 46,
    paddingBottom: 14,
    gap: 8,
  },
  policyBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  policyText: { fontSize: 12, fontWeight: "600" },
});
