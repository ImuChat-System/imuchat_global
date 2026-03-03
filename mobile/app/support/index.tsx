/**
 * Support & Assistance — Hub Index
 *
 * Navigation hub linking to all 8 support sub-screens with
 * dynamic subtitles from store state.
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
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

interface SupportLinkProps {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  badge?: number;
  colors: ReturnType<typeof useColors>;
}

function SupportLink({
  icon,
  label,
  subtitle,
  onPress,
  badge,
  colors,
}: SupportLinkProps) {
  return (
    <TouchableOpacity
      style={[styles.linkCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.linkIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.linkLabel, { color: colors.text }]}>
            {label}
          </Text>
          {badge !== undefined && badge > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.linkSubtitle, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SupportIndex() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const {
    helpArticles,
    faqItems,
    openTicketsCount,
    isChatActive,
    activeIncidentsCount,
    roadmapItems,
    feedbackHistory,
    enabledBetaCount,
  } = useSupport();

  const links = [
    {
      icon: "📚",
      label: t("support.helpCenter"),
      subtitle: t("support.helpCenterSub", { count: helpArticles.length }),
      route: "/support/help-center",
    },
    {
      icon: "❓",
      label: t("support.faq"),
      subtitle: t("support.faqSub", { count: faqItems.length }),
      route: "/support/faq",
    },
    {
      icon: "🎫",
      label: t("support.tickets"),
      subtitle: t("support.ticketsSub", { count: openTicketsCount }),
      route: "/support/tickets",
      badge: openTicketsCount,
    },
    {
      icon: "💬",
      label: t("support.chatSupport"),
      subtitle: isChatActive ? t("support.chatActive") : t("support.chatSub"),
      route: "/support/chat-support",
    },
    {
      icon: "🔔",
      label: t("support.incidents"),
      subtitle: t("support.incidentsSub", { count: activeIncidentsCount }),
      route: "/support/incidents",
      badge: activeIncidentsCount,
    },
    {
      icon: "🗺️",
      label: t("support.roadmap"),
      subtitle: t("support.roadmapSub", { count: roadmapItems.length }),
      route: "/support/roadmap",
    },
    {
      icon: "📝",
      label: t("support.feedback"),
      subtitle: t("support.feedbackSub", { count: feedbackHistory.length }),
      route: "/support/feedback",
    },
    {
      icon: "🧪",
      label: t("support.betaFeatures"),
      subtitle: t("support.betaSub", { count: enabledBetaCount }),
      route: "/support/beta-features",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.headerDesc, { color: colors.textMuted }]}>
        {t("support.description")}
      </Text>

      {links.map((link) => (
        <SupportLink
          key={link.route}
          icon={link.icon}
          label={link.label}
          subtitle={link.subtitle}
          badge={link.badge}
          onPress={() => router.push(link.route as any)}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  headerDesc: { fontSize: 14, marginBottom: 8 },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  linkIcon: { fontSize: 24 },
  linkLabel: { fontSize: 15, fontWeight: "600" },
  linkSubtitle: { fontSize: 12, marginTop: 2 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
