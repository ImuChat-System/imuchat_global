/**
 * MyAppsScreen — List of submitted apps (DEV-034)
 *
 * Shows all apps submitted by the developer with status badges,
 * quick actions, and navigation to app detail.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { AppSubmission, SubmissionStatus } from "@/types/dev-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Status Badge ─────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { emoji: string; color: string }
> = {
  draft: { emoji: "📝", color: "#888" },
  pending_review: { emoji: "⏳", color: "#f5a623" },
  in_review: { emoji: "🔍", color: "#3b82f6" },
  approved: { emoji: "✅", color: "#22c55e" },
  rejected: { emoji: "❌", color: "#ef4444" },
  published: { emoji: "🚀", color: "#8b5cf6" },
  suspended: { emoji: "⛔", color: "#ef4444" },
};

function StatusBadge({
  status,
  t,
}: {
  status: SubmissionStatus;
  t: (k: string) => string;
}) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.color + "20" }]}>
      <Text style={{ fontSize: 12 }}>{cfg.emoji}</Text>
      <Text style={[styles.badgeText, { color: cfg.color }]}>
        {t(`devStore.status_${status}`)}
      </Text>
    </View>
  );
}

// ─── App Card ─────────────────────────────────────────────────

interface AppCardProps {
  item: AppSubmission;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  t: (k: string) => string;
}

function AppCard({ item, onPress, colors, t }: AppCardProps) {
  return (
    <TouchableOpacity
      style={[styles.appCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.appCardHeader}>
        <Text style={styles.appIcon}>{item.icon_url || "📦"}</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.appName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name || t("devStore.untitled")}
          </Text>
          <Text style={[styles.appVersion, { color: colors.textMuted }]}>
            v{item.version} · {item.category}
          </Text>
        </View>
        <StatusBadge status={item.status} t={t} />
      </View>
      <Text
        style={[styles.appDesc, { color: colors.textMuted }]}
        numberOfLines={2}
      >
        {item.short_description ||
          item.description ||
          t("devStore.noDescription")}
      </Text>
      <View style={styles.appCardFooter}>
        <Text style={[styles.appDate, { color: colors.textMuted }]}>
          {new Date(item.updated_at).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function MyAppsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const { submissions, submissionsLoading, fetchSubmissions } = useDevStore();

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const onRefresh = useCallback(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const renderItem = useCallback(
    ({ item }: { item: AppSubmission }) => (
      <AppCard
        item={item}
        onPress={() =>
          router.push({
            pathname: "/dev-store/app-detail" as any,
            params: { id: item.id },
          })
        }
        colors={colors}
        t={t}
      />
    ),
    [colors, t, router],
  );

  return (
    <View
      testID="my-apps-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* ── FAB: Submit App ──────────────────────────────── */}
      <FlatList
        data={submissions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={submissionsLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          submissionsLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 60 }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📱</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("devStore.noApps")}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                {t("devStore.noAppsSub")}
              </Text>
            </View>
          )
        }
      />

      {/* ── FAB ────────────────────────────────────────────── */}
      <TouchableOpacity
        testID="fab-submit-app"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/dev-store/submit-app" as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  appCard: { borderRadius: 12, padding: 14, marginBottom: 10 },
  appCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  appIcon: { fontSize: 28 },
  appName: { fontSize: 16, fontWeight: "700" },
  appVersion: { fontSize: 12, marginTop: 1 },
  appDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  appCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appDate: { fontSize: 11 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, marginTop: 4, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
