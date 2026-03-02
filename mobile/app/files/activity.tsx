/**
 * Files Activity — DEV-020
 *
 * Timeline des activités récentes : création, modification,
 * partage, déplacement, suppression…
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useFilesStore } from "@/stores/files-store";

const ACTION_ICONS: Record<string, string> = {
  created: "add-circle-outline",
  updated: "create-outline",
  deleted: "trash-outline",
  shared: "share-outline",
  moved: "arrow-forward-outline",
  renamed: "text-outline",
  restored: "arrow-undo-outline",
  downloaded: "download-outline",
};

const ACTION_COLORS: Record<string, string> = {
  created: "#66BB6A",
  updated: "#29B6F6",
  deleted: "#EF5350",
  shared: "#AB47BC",
  moved: "#FFA726",
  renamed: "#78909C",
  restored: "#26A69A",
  downloaded: "#42A5F5",
};

export default function FilesActivityScreen() {
  const { t } = useI18n();
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();

  const activities = useFilesStore((s) => s.activities);
  const loadActivities = useFilesStore((s) => s.loadActivities);
  const isLoading = useFilesStore((s) => s.isLoading);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof activities> = {};
    for (const act of activities) {
      const dateKey = new Date(act.created_at).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(act);
    }
    return Object.entries(groups);
  }, [activities]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xl + 20,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: spacing.sm,
        },
        headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
        dateHeader: {
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.xs,
        },
        dateText: {
          fontSize: 14,
          fontWeight: "600",
          color: colors.textSecondary,
        },
        item: {
          flexDirection: "row",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
        },
        timeline: { alignItems: "center", width: 32 },
        dot: {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
        },
        line: { flex: 1, width: 2, backgroundColor: colors.border },
        content: { flex: 1, paddingBottom: spacing.sm },
        action: { fontSize: 14, fontWeight: "500", color: colors.text },
        fileName: { fontWeight: "600", color: colors.primary },
        details: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
        time: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
        empty: { alignItems: "center", paddingTop: 80 },
        emptyText: {
          fontSize: 15,
          color: colors.textSecondary,
          marginTop: spacing.md,
        },
      }),
    [colors, spacing],
  );

  const renderActivity = (
    activity: (typeof activities)[0],
    isLast: boolean,
  ) => {
    const icon = ACTION_ICONS[activity.action] || "ellipse-outline";
    const color = ACTION_COLORS[activity.action] || colors.textSecondary;
    const time = new Date(activity.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View key={activity.id} style={styles.item}>
        <View style={styles.timeline}>
          <View style={[styles.dot, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon as any} size={16} color={color} />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>
        <View style={styles.content}>
          <Text style={styles.action}>
            {t(`files.action_${activity.action}`)}{" "}
            <Text style={styles.fileName}>{activity.item_name || ""}</Text>
          </Text>
          {activity.details && (
            <Text style={styles.details}>{activity.details}</Text>
          )}
          <Text style={styles.time}>
            {time}
            {activity.actor_name ? ` · ${activity.actor_name}` : ""}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("files.activityTitle")}</Text>
      </View>

      {activities.length > 0 ? (
        <FlatList
          data={grouped}
          keyExtractor={([date]) => date}
          renderItem={({ item: [date, acts] }) => (
            <View>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{date}</Text>
              </View>
              {acts.map((act, idx) =>
                renderActivity(act, idx === acts.length - 1),
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons
            name="time-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            {isLoading ? t("files.loading") : t("files.noActivity")}
          </Text>
        </View>
      )}
    </View>
  );
}
