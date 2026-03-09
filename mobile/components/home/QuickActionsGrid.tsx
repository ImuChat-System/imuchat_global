/**
 * QuickActionsGrid — Grille 3×3 d'actions rapides
 *
 * Affiche les 9 raccourcis configurables du Home Hub.
 * Chaque action mène à un écran via expo-router.
 *
 * Sprint S1 Axe A — Home Hub Foundation
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useHomeConfigStore } from "@/stores/home-config-store";
import type { QuickAction } from "@/types/home-hub";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Constants ────────────────────────────────────────────────

const GRID_COLUMNS = 3;
const MAX_ITEMS = 9;

// ─── Component ────────────────────────────────────────────────

export default function QuickActionsGrid() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const getActiveQuickActions = useHomeConfigStore(
    (s) => s.getActiveQuickActions,
  );

  const actions = useMemo(() => {
    return getActiveQuickActions().slice(0, MAX_ITEMS);
  }, [getActiveQuickActions]);

  const handlePress = useCallback(
    (action: QuickAction) => {
      router.push(action.route as any);
    },
    [router],
  );

  // Remplir la grille à 9 éléments (cellules vides si < 9 actions)
  const gridItems = useMemo(() => {
    const items: (QuickAction | null)[] = [...actions];
    while (items.length < MAX_ITEMS) {
      items.push(null);
    }
    return items;
  }, [actions]);

  // Découper en rangées de 3
  const rows = useMemo(() => {
    const result: (QuickAction | null)[][] = [];
    for (let i = 0; i < gridItems.length; i += GRID_COLUMNS) {
      result.push(gridItems.slice(i, i + GRID_COLUMNS));
    }
    return result;
  }, [gridItems]);

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      {rows.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.row}>
          {row.map((action, colIdx) => {
            if (!action) {
              return (
                <View key={`empty-${rowIdx}-${colIdx}`} style={styles.cell} />
              );
            }

            return (
              <TouchableOpacity
                key={action.id}
                style={styles.cell}
                onPress={() => handlePress(action)}
                activeOpacity={0.7}
                accessibilityLabel={t(action.labelKey)}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: action.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                  {action.badge != null && action.badge > 0 && (
                    <View
                      style={[styles.badge, { backgroundColor: colors.error }]}
                    >
                      <Text style={styles.badgeText}>
                        {action.badge > 99 ? "99+" : action.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.label, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {t(action.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    justifyContent: "space-around",
    marginBottom: 12,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
