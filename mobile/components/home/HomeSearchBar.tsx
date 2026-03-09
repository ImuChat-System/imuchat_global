/**
 * HomeSearchBar — Barre de recherche en haut du Home Hub
 * Sprint S2 Axe A — Home Hub enrichi
 *
 * Fonctionnalités :
 * - Tap → navigation vers /search (barre non éditable sur Home)
 * - Filtres rapides inline (Tout, Chat, Social, Modules, ImuFeed)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Filter chips ─────────────────────────────────────────────

interface SearchFilter {
  id: string;
  labelKey: string;
  icon: string;
}

const FILTERS: SearchFilter[] = [
  { id: "all", labelKey: "search.all", icon: "grid-outline" },
  { id: "chat", labelKey: "search.chats", icon: "chatbubbles-outline" },
  { id: "social", labelKey: "search.social", icon: "people-outline" },
  { id: "modules", labelKey: "search.modules", icon: "cube-outline" },
  { id: "imufeed", labelKey: "search.imufeed", icon: "videocam-outline" },
];

// ─── Component ────────────────────────────────────────────────

export default function HomeSearchBar() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState("all");

  // Tap on search bar → navigate to search screen with filter
  const handleSearchPress = useCallback(() => {
    const params = activeFilter !== "all" ? `?filter=${activeFilter}` : "";
    router.push(`/search${params}` as any);
  }, [router, activeFilter]);

  const handleFilterPress = useCallback(
    (filterId: string) => {
      setActiveFilter(filterId);
      // Navigate directly if tapping a non-"all" filter
      if (filterId !== "all") {
        router.push(`/search?filter=${filterId}` as any);
      }
    },
    [router],
  );

  // ─── Render ───────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      {/* Search bar (tap target) */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: colors.surfaceHover }]}
        onPress={handleSearchPress}
        activeOpacity={0.7}
        accessibilityRole="search"
        accessibilityLabel={t("search.placeholder")}
      >
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.placeholder, { color: colors.textMuted }]}>
          {t("search.placeholder")}
        </Text>
        <Ionicons name="mic-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Filter chips */}
      <FlatList
        data={FILTERS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => {
          const isActive = item.id === activeFilter;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive
                    ? colors.primary + "20"
                    : colors.surfaceHover,
                  borderColor: isActive ? colors.primary : "transparent",
                },
              ]}
              onPress={() => handleFilterPress(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={item.icon as any}
                size={14}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: isActive ? colors.primary : colors.textSecondary },
                ]}
              >
                {t(item.labelKey)}
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
    gap: 10,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    gap: 10,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
  },
  filtersContainer: {
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
