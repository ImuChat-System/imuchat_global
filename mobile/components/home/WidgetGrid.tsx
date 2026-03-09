/**
 * WidgetGrid — Grille responsive 2 colonnes pour les widgets Home
 *
 * Pose les HomeWidget[] dans un layout 2-col.
 * Les widgets 2×1 et 2×2 occupent toute la largeur.
 *
 * Sprint S6 Axe A — Infrastructure Widgets
 */

import { useSpacing } from "@/providers/ThemeProvider";
import type { HomeWidget } from "@/types/home-hub";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import WidgetCard from "./WidgetCard";

// ─── Props ────────────────────────────────────────────────────

interface WidgetGridProps {
  widgets: HomeWidget[];
  onWidgetPress?: (widget: HomeWidget) => void;
  /** Rendu personnalisé du contenu d'un widget */
  renderContent?: (widget: HomeWidget) => React.ReactNode;
}

// ─── Layout helpers ───────────────────────────────────────────

/**
 * Organise les widgets en « lignes » de layout.
 * Les 1×1 sont regroupés par paires ; les 2×1 / 2×2 prennent une ligne seule.
 */
function buildRows(widgets: HomeWidget[]): HomeWidget[][] {
  const visible = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);
  const rows: HomeWidget[][] = [];
  let pendingSmall: HomeWidget | null = null;

  for (const w of visible) {
    if (w.size === "1x1") {
      if (pendingSmall) {
        rows.push([pendingSmall, w]);
        pendingSmall = null;
      } else {
        pendingSmall = w;
      }
    } else {
      // Flush un éventuel 1×1 orphelin avant le wide widget
      if (pendingSmall) {
        rows.push([pendingSmall]);
        pendingSmall = null;
      }
      rows.push([w]);
    }
  }
  // Dernier 1×1 orphelin
  if (pendingSmall) {
    rows.push([pendingSmall]);
  }

  return rows;
}

// ─── Component ────────────────────────────────────────────────

export default function WidgetGrid({
  widgets,
  onWidgetPress,
  renderContent,
}: WidgetGridProps) {
  const spacing = useSpacing();
  const rows = useMemo(() => buildRows(widgets), [widgets]);

  if (rows.length === 0) return null;

  return (
    <View
      style={[styles.container, { paddingHorizontal: spacing.md }]}
      testID="widget-grid"
    >
      {rows.map((row, rowIdx) => (
        <View
          key={`wrow-${rowIdx}`}
          style={[styles.row, { marginBottom: spacing.sm }]}
        >
          {row.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} onPress={onWidgetPress}>
              {renderContent?.(widget)}
            </WidgetCard>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
