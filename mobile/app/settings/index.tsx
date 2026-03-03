/**
 * Advanced Settings — Index / Overview
 *
 * Navigation hub linking to all advanced settings sub-screens.
 * Each row shows the section name, icon, and a brief summary.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingsLinkProps {
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}

function SettingsLink({
  emoji,
  label,
  subtitle,
  onPress,
  colors,
}: SettingsLinkProps) {
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function AdvancedSettingsIndex() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const {
    activeChannelCount,
    sound,
    performance,
    accessibility,
    dataUsage,
    region,
  } = useAdvancedSettings();

  const sections = [
    {
      icon: "notifications-outline" as const,
      emoji: "🔔",
      label: t("advancedSettings.notifications"),
      subtitle: t("advancedSettings.notificationsSubtitle", {
        count: activeChannelCount,
      }),
      route: "/settings/notifications",
    },
    {
      icon: "volume-high-outline" as const,
      emoji: "🔊",
      label: t("advancedSettings.sound"),
      subtitle:
        sound.ambientSound !== "none"
          ? t("advancedSettings.soundAmbientActive", {
              sound: sound.ambientSound,
            })
          : t("advancedSettings.soundSubtitle"),
      route: "/settings/sound",
    },
    {
      icon: "speedometer-outline" as const,
      emoji: "⚡",
      label: t("advancedSettings.performance"),
      subtitle: t("advancedSettings.performanceMode_" + performance.mode),
      route: "/settings/performance",
    },
    {
      icon: "cellular-outline" as const,
      emoji: "📶",
      label: t("advancedSettings.dataUsage"),
      subtitle: dataUsage.dataSaverEnabled
        ? t("advancedSettings.dataSaverOn")
        : t("advancedSettings.dataUsageSubtitle"),
      route: "/settings/data-usage",
    },
    {
      icon: "accessibility-outline" as const,
      emoji: "♿",
      label: t("advancedSettings.accessibility"),
      subtitle: accessibility.reduceMotion
        ? t("advancedSettings.reduceMotionOn")
        : t("advancedSettings.accessibilitySubtitle"),
      route: "/settings/accessibility",
    },
    {
      icon: "language-outline" as const,
      emoji: "🌐",
      label: t("advancedSettings.languages"),
      subtitle: t("advancedSettings.languagesSubtitle"),
      route: "/settings/languages",
    },
    {
      icon: "globe-outline" as const,
      emoji: "🕐",
      label: t("advancedSettings.region"),
      subtitle: `${region.timezone} · ${region.dateFormat}`,
      route: "/settings/region",
    },
    {
      icon: "key-outline" as const,
      emoji: "🔑",
      label: t("advancedSettings.integrations"),
      subtitle: t("advancedSettings.integrationsSubtitle"),
      route: "/settings/integrations",
    },
    {
      icon: "link-outline" as const,
      emoji: "🪝",
      label: t("advancedSettings.webhooks"),
      subtitle: t("advancedSettings.webhooksSubtitle"),
      route: "/settings/webhooks",
    },
  ];

  return (
    <ScrollView
      testID="advanced-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.description, { color: colors.textMuted }]}>
        {t("advancedSettings.description")}
      </Text>

      <View style={styles.list}>
        {sections.map((section, idx) => (
          <SettingsLink
            key={section.route}
            icon={section.icon}
            emoji={section.emoji}
            label={section.label}
            subtitle={section.subtitle}
            onPress={() => router.push(section.route as any)}
            colors={colors}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  emoji: { fontSize: 24 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "600" },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
});
