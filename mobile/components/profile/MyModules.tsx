/**
 * MyModules — Section "Mes Modules" dans le profil
 *
 * Liste les modules installés avec actions toggle/open.
 *
 * Sprint S13 Axe A — Profil enrichi
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { UserInstalledModule } from "@/types/modules";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface MyModulesProps {
  modules: UserInstalledModule[];
  onOpenModule: (moduleId: string) => void;
  onToggleModule: (moduleId: string, active: boolean) => void;
  onManageModules: () => void;
}

// ─── Component ────────────────────────────────────────────────

export default function MyModules({
  modules,
  onOpenModule,
  onToggleModule,
  onManageModules,
}: MyModulesProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const renderModule = ({ item }: { item: UserInstalledModule }) => {
    const moduleName = item.module?.name ?? item.module_id;
    const moduleIcon = item.module?.icon ?? "📦";

    return (
      <View
        testID={`module-item-${item.module_id}`}
        style={[styles.moduleItem, { borderBottomColor: colors.border }]}
      >
        <TouchableOpacity
          testID={`module-open-${item.module_id}`}
          style={styles.moduleInfo}
          onPress={() => onOpenModule(item.module_id)}
        >
          <Text style={styles.moduleIcon}>{moduleIcon}</Text>
          <View style={styles.moduleText}>
            <Text
              style={[styles.moduleName, { color: colors.text }]}
              numberOfLines={1}
            >
              {moduleName}
            </Text>
            <Text style={[styles.moduleVersion, { color: colors.textMuted }]}>
              v{item.installed_version}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          testID={`module-toggle-${item.module_id}`}
          onPress={() => onToggleModule(item.module_id, !item.is_active)}
          style={[
            styles.toggleBtn,
            {
              backgroundColor: item.is_active ? colors.success : colors.border,
            },
          ]}
        >
          <Text style={styles.toggleText}>{item.is_active ? "ON" : "OFF"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      testID="my-modules-section"
      style={[
        styles.container,
        { backgroundColor: colors.surface, marginHorizontal: spacing.md },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          📦 Mes Modules
        </Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {modules.length}
        </Text>
      </View>

      {modules.length === 0 ? (
        <Text
          testID="modules-empty"
          style={[styles.emptyText, { color: colors.textMuted }]}
        >
          Aucun module installé
        </Text>
      ) : (
        <FlatList
          data={modules}
          keyExtractor={(item) => item.module_id}
          renderItem={renderModule}
          scrollEnabled={false}
        />
      )}

      <TouchableOpacity
        testID="modules-manage-btn"
        style={[styles.manageBtn, { borderColor: colors.border }]}
        onPress={onManageModules}
      >
        <Ionicons name="grid-outline" size={16} color={colors.primary} />
        <Text style={[styles.manageBtnText, { color: colors.primary }]}>
          Gérer les modules
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  count: {
    fontSize: 14,
    fontWeight: "600",
  },
  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  moduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  moduleIcon: {
    fontSize: 24,
  },
  moduleText: {
    flex: 1,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: "600",
  },
  moduleVersion: {
    fontSize: 12,
    marginTop: 1,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
