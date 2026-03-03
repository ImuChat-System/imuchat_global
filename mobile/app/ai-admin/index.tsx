/**
 * AIAdminHub — AI Administration Dashboard (DEV-035)
 *
 * Main hub for AI admin portal.
 * Shows: global toggle, stats overview, quick navigation cards.
 *
 * Spec: docs/OTHERS_SCREENS_FONCTIONNALITIES.md §6
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAIAdminStore } from "@/stores/ai-admin-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Navigation Card ──────────────────────────────────────────

interface NavCardProps {
  emoji: string;
  label: string;
  subtitle: string;
  badge?: number;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}

function NavCard({
  emoji,
  label,
  subtitle,
  badge,
  onPress,
  colors,
}: NavCardProps) {
  return (
    <TouchableOpacity
      style={[styles.navCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.navEmoji}>{emoji}</Text>
      <View style={styles.navContent}>
        <Text style={[styles.navLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.navSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.navRight}>
        {badge != null && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Stat ─────────────────────────────────────────────────────

interface StatProps {
  label: string;
  value: string | number;
  colors: ReturnType<typeof useColors>;
}

function Stat({ label, value, colors }: StatProps) {
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function AIAdminHub() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const {
    assistantEnabled,
    toggleAssistant,
    personas,
    memoryEntries,
    auditLog,
    toolPermissions,
    moderation,
    autoSummary,
  } = useAIAdminStore();

  const activePersonas = personas.filter((p) => p.isActive).length;
  const enabledTools = toolPermissions.filter((tp) => tp.enabled).length;
  const recentAudit = auditLog.length;

  return (
    <ScrollView
      testID="ai-admin-hub-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { padding: spacing.md }]}
    >
      {/* ── Global Toggle ─────────────────────────────────── */}
      <View style={[styles.toggleCard, { backgroundColor: colors.surface }]}>
        <View style={styles.toggleLeft}>
          <Text style={{ fontSize: 24 }}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              {t("aiAdmin.assistantGlobal")}
            </Text>
            <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
              {assistantEnabled
                ? t("aiAdmin.assistantEnabled")
                : t("aiAdmin.assistantDisabled")}
            </Text>
          </View>
        </View>
        <Switch
          testID="assistant-toggle"
          value={assistantEnabled}
          onValueChange={toggleAssistant}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>

      {/* ── Stats Row ─────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <Stat
          label={t("aiAdmin.personas")}
          value={activePersonas}
          colors={colors}
        />
        <Stat
          label={t("aiAdmin.memories")}
          value={memoryEntries.length}
          colors={colors}
        />
        <Stat
          label={t("aiAdmin.auditEntries")}
          value={recentAudit}
          colors={colors}
        />
      </View>

      {/* ── Navigation Cards ──────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("aiAdmin.management")}
      </Text>

      <NavCard
        emoji="🎭"
        label={t("aiAdmin.personasTitle")}
        subtitle={t("aiAdmin.personasSubtitle", { count: activePersonas })}
        badge={personas.filter((p) => !p.isBuiltIn).length}
        onPress={() => router.push("/ai-admin/personas" as any)}
        colors={colors}
      />

      <NavCard
        emoji="🧠"
        label={t("aiAdmin.memoryTitle")}
        subtitle={t("aiAdmin.memorySubtitle", { count: memoryEntries.length })}
        badge={memoryEntries.length}
        onPress={() => router.push("/ai-admin/memory" as any)}
        colors={colors}
      />

      <NavCard
        emoji="📋"
        label={t("aiAdmin.auditTitle")}
        subtitle={t("aiAdmin.auditSubtitle")}
        badge={
          auditLog.filter(
            (a) => a.severity === "warning" || a.severity === "error",
          ).length
        }
        onPress={() => router.push("/ai-admin/audit-log" as any)}
        colors={colors}
      />

      <NavCard
        emoji="🔐"
        label={t("aiAdmin.permissionsTitle")}
        subtitle={t("aiAdmin.permissionsSubtitle", { count: enabledTools })}
        onPress={() => router.push("/ai-admin/permissions" as any)}
        colors={colors}
      />

      <NavCard
        emoji="📝"
        label={t("aiAdmin.autoSummaryTitle")}
        subtitle={
          autoSummary.enabled
            ? t("aiAdmin.autoSummaryEnabled")
            : t("aiAdmin.autoSummaryDisabled")
        }
        onPress={() => router.push("/ai-admin/auto-summary" as any)}
        colors={colors}
      />

      <NavCard
        emoji="🛡️"
        label={t("aiAdmin.moderationTitle")}
        subtitle={t("aiAdmin.moderationLevel_" + moderation.globalLevel)}
        onPress={() => router.push("/ai-admin/moderation" as any)}
        colors={colors}
      />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 12, paddingBottom: 40 },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: "600" },
  toggleSub: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, alignItems: "center", padding: 12, borderRadius: 10 },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  navEmoji: { fontSize: 24 },
  navContent: { flex: 1 },
  navLabel: { fontSize: 15, fontWeight: "600" },
  navSubtitle: { fontSize: 12, marginTop: 2 },
  navRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
