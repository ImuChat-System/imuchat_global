/**
 * FilterSelector — Sélecteur de filtres vidéo avec onglets par catégorie
 *
 * 22 filtres built-in, organisés en 3 catégories (classic, manga, ambiance).
 * Chaque filtre montre un aperçu coloré. Les filtres manga/anime portent
 * un badge "IA" car ils nécessitent un processing serveur.
 *
 * Sprint S10 Axe B — Filtres, Stickers & Effets
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  FILTER_CATEGORIES,
  getFiltersByCategory,
} from "@/services/imufeed/filter-service";
import type { VideoFilter, VideoFilterCategory } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface FilterSelectorProps {
  selectedFilterId: string | null;
  onSelectFilter: (filter: VideoFilter) => void;
}

// ─── Component ────────────────────────────────────────────────

export default function FilterSelector({
  selectedFilterId,
  onSelectFilter,
}: FilterSelectorProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const [activeCategory, setActiveCategory] =
    useState<VideoFilterCategory>("classic");

  const filters = getFiltersByCategory(activeCategory);

  const renderFilterItem = useCallback(
    ({ item }: { item: VideoFilter }) => {
      const isSelected = item.id === selectedFilterId;
      return (
        <TouchableOpacity
          testID={`filter-${item.id}`}
          style={[
            styles.filterItem,
            isSelected && { borderColor: colors.primary, borderWidth: 2 },
          ]}
          onPress={() => onSelectFilter(item)}
        >
          <View
            style={[
              styles.filterPreview,
              { backgroundColor: item.thumbnailColor },
            ]}
          >
            {item.requiresAI && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>IA</Text>
              </View>
            )}
            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#FFF"
                style={styles.checkIcon}
              />
            )}
          </View>
          <Text
            style={[
              styles.filterName,
              { color: isSelected ? colors.primary : colors.text },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedFilterId, colors, onSelectFilter],
  );

  return (
    <View testID="filter-selector" style={styles.container}>
      {/* Category tabs */}
      <View style={[styles.tabs, { gap: spacing.sm }]}>
        {FILTER_CATEGORIES.map((cat) => {
          const isActive = cat.key === activeCategory;
          return (
            <TouchableOpacity
              key={cat.key}
              testID={`filter-tab-${cat.key}`}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? "#FFF" : colors.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter grid */}
      <FlatList
        testID="filter-grid"
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(item) => item.id}
        renderItem={renderFilterItem}
        contentContainerStyle={{
          paddingHorizontal: spacing.sm,
          gap: spacing.sm,
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterItem: {
    alignItems: "center",
    width: 68,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 4,
  },
  filterPreview: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  aiBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#9B59B6",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  aiBadgeText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "800",
  },
  checkIcon: {
    position: "absolute",
  },
  filterName: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
});
