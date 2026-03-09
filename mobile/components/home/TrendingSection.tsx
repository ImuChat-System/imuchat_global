/**
 * TrendingSection — Hashtags tendances et éléments populaires
 * Sprint S2 Axe A — Home Hub enrichi (Sprint 3 dans NAV_HUB)
 *
 * Affiche :
 * - Hashtags trending (via imufeed store)
 * - Modules populaires du Store
 */

import { useImuFeed } from "@/hooks/useImuFeed";
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

const MAX_HASHTAGS = 10;
const MAX_MODULES = 6;

// ─── Component ────────────────────────────────────────────────

export default function TrendingSection() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  // Trending hashtags
  const { trendingHashtags, loadTrendingHashtags } = useImuFeed();

  // Popular modules from catalog
  const { catalog, fetchCatalog } = useModulesStore();

  useEffect(() => {
    loadTrendingHashtags();
    fetchCatalog();
  }, [loadTrendingHashtags, fetchCatalog]);

  // Top modules (par popularité)
  const trendingModules = useMemo(() => {
    return [...catalog]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, MAX_MODULES);
  }, [catalog]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleHashtagPress = useCallback(
    (tag: string) => {
      router.push(`/search?q=%23${encodeURIComponent(tag)}` as any);
    },
    [router],
  );

  const handleModulePress = useCallback(
    (moduleId: string) => {
      router.push(`/dev-store/${moduleId}` as any);
    },
    [router],
  );

  const handleSeeAllHashtags = useCallback(() => {
    router.push("/imufeed" as any);
  }, [router]);

  // ─── Render ───────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Section header */}
      <View style={[styles.sectionHeader, { paddingHorizontal: spacing.md }]}>
        <View style={styles.titleRow}>
          <Ionicons name="trending-up" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("home.trending")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSeeAllHashtags}
          accessibilityRole="button"
        >
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t("common.see_all")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trending hashtags — chips horizontaux */}
      {trendingHashtags.length > 0 && (
        <FlatList
          data={trendingHashtags.slice(0, MAX_HASHTAGS)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.hashtagChip,
                { backgroundColor: colors.surfaceHover },
              ]}
              onPress={() => handleHashtagPress(item.name)}
              accessibilityRole="button"
              accessibilityLabel={`#${item.name}`}
            >
              <Text style={[styles.hashtagText, { color: colors.primary }]}>
                #{item.name}
              </Text>
              <Text style={[styles.hashtagCount, { color: colors.textMuted }]}>
                {formatCount(item.usage_count)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Popular modules */}
      {trendingModules.length > 0 && (
        <View style={{ paddingHorizontal: spacing.md, marginTop: 12 }}>
          <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
            {t("home.popular_modules")}
          </Text>
          <FlatList
            data={trendingModules}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingTop: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.moduleCard,
                  { backgroundColor: colors.surfaceHover },
                ]}
                onPress={() => handleModulePress(item.id)}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.moduleIcon,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Ionicons
                    name={(item.icon as any) || "cube-outline"}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[styles.moduleName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  hashtagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: "600",
  },
  hashtagCount: {
    fontSize: 12,
  },
  moduleCard: {
    width: 90,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
