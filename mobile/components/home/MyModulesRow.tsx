/**
 * MyModulesRow — Scroll horizontal des modules installés
 * Sprint S2 Axe A — Home Hub enrichi
 *
 * Fonctionnalités :
 * - Données réelles via useModulesStore (connecté Supabase)
 * - Tap → navigation vers miniapp/[id] ou écran natif
 * - Bouton "+" en fin de liste → navigation vers Store
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useModulesStore } from "@/stores/modules-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Component ────────────────────────────────────────────────

export default function MyModulesRow() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const { installedModules, catalog, fetchInstalled, fetchCatalog } =
    useModulesStore();

  useEffect(() => {
    fetchInstalled();
    fetchCatalog();
  }, [fetchInstalled, fetchCatalog]);

  // Merge installed modules with catalog data for display
  const activeModules = useMemo(() => {
    return installedModules
      .filter((m) => m.is_active)
      .map((installed) => {
        const catalogInfo = catalog.find((c) => c.id === installed.module_id);
        return {
          id: installed.module_id,
          name: catalogInfo?.name || installed.module_id,
          icon: catalogInfo?.icon || "cube-outline",
          color: catalogInfo?.color || colors.primary,
          type: catalogInfo?.type || "miniapp",
        };
      });
  }, [installedModules, catalog, colors.primary]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleModulePress = useCallback(
    (module: (typeof activeModules)[0]) => {
      // Native screens use a different route pattern
      if (module.type === "native") {
        router.push(`/${module.id}` as any);
      } else {
        router.push(`/miniapp/${module.id}` as any);
      }
    },
    [router],
  );

  const handleAddModule = useCallback(() => {
    router.push("/(tabs)/store" as any);
  }, [router]);

  // ─── Build data with "+" button appended ──────────────────

  type ListItem =
    | { type: "module"; data: (typeof activeModules)[0] }
    | { type: "add" };
  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = activeModules.map((m) => ({
      type: "module" as const,
      data: m,
    }));
    items.push({ type: "add" as const });
    return items;
  }, [activeModules]);

  // ─── Render ───────────────────────────────────────────────

  if (activeModules.length === 0) {
    return null; // Don't show section if no modules installed
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Section header */}
      <View style={[styles.sectionHeader, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("home.my_modules")}
        </Text>
      </View>

      {/* Horizontal scroll */}
      <FlatList
        data={listData}
        keyExtractor={(item, index) =>
          item.type === "module" ? item.data.id : `add-${index}`
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 12 }}
        renderItem={({ item }) => {
          if (item.type === "add") {
            return (
              <TouchableOpacity
                style={[
                  styles.moduleItem,
                  styles.addButton,
                  { borderColor: colors.border },
                ]}
                onPress={handleAddModule}
                accessibilityRole="button"
                accessibilityLabel={t("home.add_module")}
              >
                <Ionicons name="add" size={28} color={colors.primary} />
                <Text style={[styles.moduleLabel, { color: colors.primary }]}>
                  {t("common.add")}
                </Text>
              </TouchableOpacity>
            );
          }

          const mod = item.data;
          return (
            <TouchableOpacity
              style={styles.moduleItem}
              onPress={() => handleModulePress(mod)}
              accessibilityRole="button"
              accessibilityLabel={mod.name}
            >
              <View
                style={[
                  styles.moduleIconBg,
                  { backgroundColor: mod.color + "20" },
                ]}
              >
                <Ionicons name={mod.icon as any} size={26} color={mod.color} />
              </View>
              <Text
                style={[styles.moduleLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {mod.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderRadius: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  moduleItem: {
    alignItems: "center",
    width: 72,
    gap: 6,
  },
  moduleIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  addButton: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
});
