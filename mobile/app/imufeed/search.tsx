/**
 * ImuFeed Search — Recherche vidéos, hashtags et créateurs
 *
 * Route : /imufeed/search
 * Barre de recherche + résultats triés par pertinence.
 *
 * Sprint S6 Axe B — Hashtags & Search
 */

import TrendingHashtags from "@/components/imufeed/TrendingHashtags";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { searchFeed } from "@/services/imufeed-api";
import { createLogger } from "@/services/logger";
import type {
  FeedSearchResult,
  ImuFeedVideo,
  VideoAuthor,
  VideoHashtag,
} from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const logger = createLogger("ImuFeedSearch");

type ResultItem =
  | { kind: "hashtag"; data: VideoHashtag }
  | { kind: "author"; data: VideoAuthor }
  | { kind: "video"; data: ImuFeedVideo };

// ─── Component ────────────────────────────────────────────────

export default function SearchScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Search ─────────────────────────────────────────────

  const performSearch = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const data: FeedSearchResult = await searchFeed(text.trim());

      const items: ResultItem[] = [
        ...data.hashtags.map((h) => ({ kind: "hashtag" as const, data: h })),
        ...data.authors.map((a) => ({ kind: "author" as const, data: a })),
        ...data.videos.map((v) => ({ kind: "video" as const, data: v })),
      ];

      setResults(items);
      setHasSearched(true);
    } catch (err) {
      logger.error("search failed", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => performSearch(text), 400);
    },
    [performSearch],
  );

  // ─── Navigation handlers ────────────────────────────────

  const handleHashtagPress = useCallback(
    (tag: string) => {
      router.push(`/imufeed/hashtag/${encodeURIComponent(tag)}` as any);
    },
    [router],
  );

  const handleAuthorPress = useCallback(
    (authorId: string) => {
      router.push(`/imufeed/profile/${authorId}` as any);
    },
    [router],
  );

  // ─── Render item ────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: ResultItem }) => {
      if (item.kind === "hashtag") {
        return (
          <TouchableOpacity
            style={[styles.row, { paddingHorizontal: spacing.md }]}
            onPress={() => handleHashtagPress(item.data.name)}
          >
            <Ionicons
              name="pricetag-outline"
              size={20}
              color={colors.primary}
            />
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                #{item.data.name}
              </Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                {item.data.usage_count} {t("imufeed.videos")}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }

      if (item.kind === "author") {
        return (
          <TouchableOpacity
            style={[styles.row, { paddingHorizontal: spacing.md }]}
            onPress={() => handleAuthorPress(item.data.id)}
          >
            {item.data.avatar_url ? (
              <Image
                source={{ uri: item.data.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={32}
                color={colors.textSecondary}
              />
            )}
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {item.data.display_name ?? item.data.username}
              </Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                @{item.data.username}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }

      // video
      return (
        <TouchableOpacity
          style={[styles.row, { paddingHorizontal: spacing.md }]}
          onPress={() => {
            /* navigate to video player */
          }}
        >
          {item.data.thumbnail_url ? (
            <Image
              source={{ uri: item.data.thumbnail_url }}
              style={styles.thumbnail}
            />
          ) : (
            <View
              style={[styles.thumbnail, { backgroundColor: colors.surface }]}
            />
          )}
          <View style={styles.rowText}>
            <Text
              style={[styles.rowTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.data.caption ?? t("imufeed.video")}
            </Text>
            <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
              {item.data.author.display_name ?? item.data.author.username}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, spacing, t, handleHashtagPress, handleAuthorPress],
  );

  const keyExtractor = useCallback(
    (item: ResultItem, index: number) => `${item.kind}-${index}`,
    [],
  );

  // ─── Render ─────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          {
            paddingTop: insets.top + spacing.xs,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderRadius: spacing.md,
              marginLeft: spacing.sm,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("imufeed.search_placeholder")}
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleChangeText}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleChangeText("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isSearching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="search-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("common.no_results")}
          </Text>
        </View>
      ) : hasSearched ? (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
        />
      ) : (
        /* Show trending when no active search */
        <View style={{ paddingTop: spacing.md }}>
          <TrendingHashtags />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
  },
});
