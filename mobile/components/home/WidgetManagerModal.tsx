/**
 * WidgetManagerModal — Interface de gestion des widgets Home
 *
 * Permet d'ajouter, retirer et prévisualiser les widgets.
 * Affiche le catalogue complet (WIDGET_CATALOG) avec toggle on/off.
 *
 * Sprint S8 Axe A — Widgets Modules + Gestion
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useHomeConfigStore } from "@/stores/home-config-store";
import type { HomeWidget } from "@/types/home-hub";
import { WIDGET_CATALOG } from "@/types/home-hub";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Props ────────────────────────────────────────────────────

interface WidgetManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Size labels ──────────────────────────────────────────────

const SIZE_LABELS: Record<string, string> = {
  "1x1": "Petit",
  "2x1": "Moyen",
  "2x2": "Grand",
};

// ─── Component ────────────────────────────────────────────────

export default function WidgetManagerModal({
  visible,
  onClose,
}: WidgetManagerModalProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const insets = useSafeAreaInsets();

  const widgets = useHomeConfigStore((s) => s.layout.widgets);
  const addWidget = useHomeConfigStore((s) => s.addWidget);
  const removeWidget = useHomeConfigStore((s) => s.removeWidget);
  const toggleWidgetVisibility = useHomeConfigStore(
    (s) => s.toggleWidgetVisibility,
  );

  // Map of active widget IDs
  const activeWidgetIds = useMemo(
    () => new Set(widgets.map((w) => w.id)),
    [widgets],
  );

  const handleToggle = useCallback(
    (catalogWidget: HomeWidget) => {
      if (activeWidgetIds.has(catalogWidget.id)) {
        removeWidget(catalogWidget.id);
      } else {
        addWidget({ ...catalogWidget, visible: true });
      }
    },
    [activeWidgetIds, addWidget, removeWidget],
  );

  const renderItem = useCallback(
    ({ item }: { item: HomeWidget }) => {
      const isActive = activeWidgetIds.has(item.id);
      const currentWidget = widgets.find((w) => w.id === item.id);
      const isVisible = currentWidget?.visible ?? false;

      return (
        <View
          style={[
            styles.item,
            {
              backgroundColor: colors.card,
              borderRadius: spacing.md,
              marginBottom: spacing.sm,
              padding: spacing.md,
            },
          ]}
          testID={`widget-manager-item-${item.type}`}
        >
          <View style={styles.itemLeft}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {item.titleKey}
              </Text>
              <Text style={[styles.itemSize, { color: colors.textSecondary }]}>
                {SIZE_LABELS[item.size] ?? item.size}
              </Text>
            </View>
          </View>
          <View style={styles.itemRight}>
            {isActive && (
              <TouchableOpacity
                onPress={() => toggleWidgetVisibility(item.id)}
                style={styles.visibilityBtn}
                testID={`widget-visibility-${item.type}`}
              >
                <Ionicons
                  name={isVisible ? "eye" : "eye-off"}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            <Switch
              value={isActive}
              onValueChange={() => handleToggle(item)}
              testID={`widget-switch-${item.type}`}
            />
          </View>
        </View>
      );
    },
    [
      activeWidgetIds,
      widgets,
      colors,
      spacing,
      handleToggle,
      toggleWidgetVisibility,
    ],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID="widget-manager-modal"
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingHorizontal: spacing.md, marginBottom: spacing.md },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Gérer les widgets
          </Text>
          <TouchableOpacity onPress={onClose} testID="widget-manager-close">
            <Ionicons
              name="close-circle"
              size={28}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          Activez ou désactivez les widgets affichés sur votre Home.
        </Text>

        {/* Widget list */}
        <FlatList
          data={WIDGET_CATALOG}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
          showsVerticalScrollIndicator={false}
          testID="widget-manager-list"
        />
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13, lineHeight: 18 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { marginLeft: 12, flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600" },
  itemSize: { fontSize: 11, marginTop: 2 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  visibilityBtn: { padding: 4 },
});
