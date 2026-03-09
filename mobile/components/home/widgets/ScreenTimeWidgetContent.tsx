/**
 * ScreenTimeWidgetContent — Contenu widget Screen Time (1×1)
 * Affiche le temps d'écran du jour en heures/minutes
 *
 * Sprint S7 Axe A — Widgets Core
 */

import { useColors } from "@/providers/ThemeProvider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: Record<string, unknown>;
}

function formatMinutes(minutes: number): { value: string; unit: string } {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return {
      value: m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`,
      unit: "",
    };
  }
  return { value: `${minutes}`, unit: "min" };
}

export default function ScreenTimeWidgetContent({ data }: Props) {
  const colors = useColors();
  const todayMinutes =
    typeof data.todayMinutes === "number" ? data.todayMinutes : 0;
  const { value, unit } = formatMinutes(todayMinutes);

  return (
    <View style={styles.container} testID="widget-screentime-content">
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {unit ? (
        <Text style={[styles.unit, { color: colors.textSecondary }]}>
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
  },
  unit: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
