/**
 * AITipsWidgetContent — Contenu widget IA Tips / Alice (1×1)
 * Affiche un conseil quotidien généré par Alice
 *
 * Sprint S7 Axe A — Widgets Core
 */

import { useColors } from "@/providers/ThemeProvider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: Record<string, unknown>;
}

export default function AITipsWidgetContent({ data }: Props) {
  const colors = useColors();
  const tip = typeof data.tip === "string" ? data.tip : null;

  return (
    <View style={styles.container} testID="widget-aitips-content">
      {tip ? (
        <Text style={[styles.tip, { color: colors.text }]} numberOfLines={3}>
          {tip}
        </Text>
      ) : (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>💡</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tip: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  empty: {
    fontSize: 24,
  },
});
