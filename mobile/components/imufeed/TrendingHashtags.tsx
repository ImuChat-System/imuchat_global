/**
 * TrendingHashtags — Chips horizontaux de hashtags tendance
 *
 * Composant réutilisable pour l'écran ImuFeed : affiche
 * les tags trending en scroll horizontal avec compteur.
 *
 * Sprint S6 Axe B — Hashtags & Search
 */

import { useImuFeed } from "@/hooks/useImuFeed";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_TAGS = 15;

// ─── Component ────────────────────────────────────────────────

export default function TrendingHashtags() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { trendingHashtags, loadTrendingHashtags } = useImuFeed();

  useEffect(() => {
    loadTrendingHashtags();
  }, [loadTrendingHashtags]);

  const handlePress = useCallback(
    (tag: string) => {
      router.push(`/imufeed/hashtag/${encodeURIComponent(tag)}` as any);
    },
    [router],
  );

  if (trendingHashtags.length === 0) return null;

  return (
    <View testID="trending-hashtags">
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Ionicons name="flame-outline" size={16} color={colors.primary} />
        <Text
          style={[
            styles.headerText,
            { color: colors.text, marginLeft: spacing.xs },
          ]}
        >
          {t("imufeed.trending")}
        </Text>
      </View>

      <FlatList
        data={trendingHashtags.slice(0, MAX_TAGS)}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`hashtag-chip-${item.name}`}
            onPress={() => handlePress(item.name)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                backgroundColor: colors.primary + "15",
                borderRadius: spacing.md,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: colors.primary }]}>
              #{item.name}
            </Text>
            <Text style={[styles.chipCount, { color: colors.textSecondary }]}>
              {item.usage_count}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipCount: {
    fontSize: 11,
  },
});
