/**
 * SectionManager — Rendu dynamique des sections du Home
 *
 * Lit la config du HomeConfigStore et rend les sections visibles
 * dans l'ordre configuré. Chaque section est lazy-importée.
 *
 * Sprint S1 Axe A — Home Hub Foundation
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useHomeConfigStore } from "@/stores/home-config-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────

export interface SectionRenderers {
  /** Map de sectionId → composant React à rendre */
  [key: string]: React.ReactNode;
}

interface SectionManagerProps {
  /** Composants à rendre pour chaque section ID */
  renderers: SectionRenderers;
  /** Afficher le header d'édition (drag poignée) */
  showEditControls?: boolean;
}

// ─── Component ────────────────────────────────────────────────

export default function SectionManager({
  renderers,
  showEditControls = false,
}: SectionManagerProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();
  const {
    getVisibleSections,
    isEditing,
    moveSectionUp,
    moveSectionDown,
    toggleSectionVisibility,
  } = useHomeConfigStore();

  const visibleSections = useMemo(() => {
    return getVisibleSections().filter((section) => {
      // Filtrer les sections qui nécessitent auth si pas connecté
      if (section.requiresAuth && !user) return false;
      // Filtrer les sections sans renderer
      if (!renderers[section.id]) return false;
      return true;
    });
  }, [getVisibleSections, user, renderers]);

  return (
    <View style={styles.container}>
      {visibleSections.map((section, index) => (
        <View key={section.id} style={styles.sectionWrapper}>
          {/* Header d'édition (visible en mode édition) */}
          {isEditing && showEditControls && (
            <View
              style={[
                styles.editBar,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.editLeft}>
                <Ionicons
                  name="reorder-three"
                  size={20}
                  color={colors.textMuted}
                />
                <Text style={[styles.editLabel, { color: colors.text }]}>
                  {t(section.titleKey)}
                </Text>
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={() => moveSectionUp(section.id)}
                  disabled={index === 0}
                  style={styles.editBtn}
                  accessibilityLabel={t("home.moveUp")}
                >
                  <Ionicons
                    name="chevron-up"
                    size={18}
                    color={index === 0 ? colors.border : colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveSectionDown(section.id)}
                  disabled={index === visibleSections.length - 1}
                  style={styles.editBtn}
                  accessibilityLabel={t("home.moveDown")}
                >
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={
                      index === visibleSections.length - 1
                        ? colors.border
                        : colors.text
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleSectionVisibility(section.id)}
                  style={styles.editBtn}
                  accessibilityLabel={t("home.hideSection")}
                >
                  <Ionicons
                    name="eye-off-outline"
                    size={18}
                    color={colors.error}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Contenu de la section */}
          {renderers[section.id]}
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionWrapper: {
    marginBottom: 4,
  },
  editBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  editLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editBtn: {
    padding: 4,
  },
});
