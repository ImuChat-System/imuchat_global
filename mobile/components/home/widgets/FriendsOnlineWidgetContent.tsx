/**
 * FriendsOnlineWidgetContent — Contenu widget Amis en ligne (2×1)
 * Affiche le nombre d'amis connectés avec indicateur visuel
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

export default function FriendsOnlineWidgetContent({ data }: Props) {
  const colors = useColors();
  const onlineCount =
    typeof data.onlineCount === "number" ? data.onlineCount : 0;

  return (
    <View style={styles.container} testID="widget-friends-content">
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: "#34C759" }]} />
        <Text style={[styles.count, { color: colors.text }]}>
          {onlineCount}
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {onlineCount === 1 ? "ami en ligne" : "amis en ligne"}
        </Text>
      </View>
      {onlineCount === 0 && (
        <View style={styles.emptyRow}>
          <Ionicons
            name="moon-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Personne pour le moment
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  count: {
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
