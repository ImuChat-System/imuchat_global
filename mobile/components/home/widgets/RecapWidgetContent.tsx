/**
 * RecapWidgetContent — Contenu widget Recap Notifications (2×2)
 * Affiche le résumé des notifications : non-lues + 3 dernières
 *
 * Sprint S7 Axe A — Widgets Core
 */

import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: Record<string, unknown>;
}

interface NotificationItem {
  id: string;
  title: string;
  icon: string;
  time: string;
}

export default function RecapWidgetContent({ data }: Props) {
  const colors = useColors();
  const unreadCount =
    typeof data.unreadCount === "number" ? data.unreadCount : 0;
  const recent = Array.isArray(data.recent)
    ? (data.recent as NotificationItem[])
    : [];

  return (
    <View style={styles.container} testID="widget-recap-content">
      {/* Badge non-lues */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
        <Text style={[styles.badgeLabel, { color: colors.text }]}>
          non-lue{unreadCount !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Liste récente */}
      {recent.length > 0 ? (
        <View style={styles.list}>
          {recent.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.item}>
              <Ionicons
                name={
                  (item.icon ||
                    "notifications-outline") as keyof typeof Ionicons.glyphMap
                }
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.itemTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.itemTime, { color: colors.textSecondary }]}>
                {item.time}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          Aucune notification récente
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    gap: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemTitle: {
    flex: 1,
    fontSize: 12,
  },
  itemTime: {
    fontSize: 10,
  },
  empty: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
});
