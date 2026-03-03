/**
 * MyThemesScreen — List of creator themes (DEV-034)
 *
 * Shows all themes created by the user with preview, status, install count.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { CreatorTheme } from "@/types/dev-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function ThemeCard({
  item,
  colors,
  t,
  onPress,
}: {
  item: CreatorTheme;
  colors: ReturnType<typeof useColors>;
  t: (k: string) => string;
  onPress: () => void;
}) {
  const previewColors = item.config?.colors;
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Color preview strip */}
      {previewColors && (
        <View style={styles.colorStrip}>
          {[
            previewColors.primary,
            previewColors.secondary,
            previewColors.accent,
            previewColors.background,
            previewColors.surface,
          ].map((c, i) => (
            <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
          ))}
        </View>
      )}
      <Text style={[styles.themeName, { color: colors.text }]}>
        {item.name}
      </Text>
      <Text
        style={[styles.themeDesc, { color: colors.textMuted }]}
        numberOfLines={2}
      >
        {item.description || t("devStore.noDescription")}
      </Text>
      <View style={styles.themeFooter}>
        <Text style={[styles.themeStats, { color: colors.textMuted }]}>
          📥 {item.install_count} · ⭐ {item.rating.toFixed(1)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "published" ? "#8b5cf620" : "#88888820",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: item.status === "published" ? "#8b5cf6" : "#888",
            }}
          >
            {t(`devStore.status_${item.status}`)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyThemesScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const { themes, themesLoading, fetchThemes } = useDevStore();

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const onRefresh = useCallback(() => fetchThemes(), [fetchThemes]);

  const renderItem = useCallback(
    ({ item }: { item: CreatorTheme }) => (
      <ThemeCard
        item={item}
        colors={colors}
        t={t}
        onPress={() => router.push("/dev-store/theme-editor" as any)}
      />
    ),
    [colors, t, router],
  );

  return (
    <View
      testID="my-themes-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={themes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={themesLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          themesLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 60 }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎨</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("devStore.noThemes")}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                {t("devStore.noThemesSub")}
              </Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        testID="fab-create-theme"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/dev-store/theme-editor" as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  colorStrip: { flexDirection: "row", gap: 4, marginBottom: 8 },
  colorDot: { width: 20, height: 20, borderRadius: 10 },
  themeName: { fontSize: 15, fontWeight: "700" },
  themeDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  themeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  themeStats: { fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, marginTop: 4, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
