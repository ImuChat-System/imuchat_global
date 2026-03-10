/**
 * StoriesGrid — Grille de stories sous-onglet Stories
 *
 * Affiche les stories en mode grille (highlights) avec vignettes,
 * avatar de l'auteur, et indicateur de vue.
 *
 * Sprint S11 Axe A — Refonte Social (sous-onglet Stories)
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { createLogger } from "@/services/logger";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const logger = createLogger("StoriesGrid");
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 4;
const NUM_COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

// ─── Types ────────────────────────────────────────────────────

export interface StoryGridItem {
  id: string;
  thumbnailUrl: string | null;
  authorName: string;
  authorAvatar: string | null;
  isViewed: boolean;
  storyCount: number;
  createdAt: string;
}

interface StoriesGridProps {
  stories: StoryGridItem[];
  onStoryPress: (storyId: string) => void;
  onCreatePress?: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

// ─── Component ────────────────────────────────────────────────

export default function StoriesGrid({
  stories,
  onStoryPress,
  onCreatePress,
  isLoading = false,
  onRefresh,
}: StoriesGridProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const renderItem = useCallback(
    ({ item }: { item: StoryGridItem }) => (
      <TouchableOpacity
        testID={`story-grid-${item.id}`}
        style={[
          styles.gridItem,
          {
            width: ITEM_SIZE,
            height: ITEM_SIZE * 1.4,
            backgroundColor: colors.surface,
          },
        ]}
        onPress={() => onStoryPress(item.id)}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.placeholder, { backgroundColor: colors.border }]}
          >
            <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
          </View>
        )}

        {/* Ring non vu */}
        {!item.isViewed && (
          <View
            testID={`story-unviewed-${item.id}`}
            style={[styles.unviewedRing, { borderColor: colors.primary }]}
          />
        )}

        {/* Story count badge */}
        {item.storyCount > 1 && (
          <View
            testID={`story-count-${item.id}`}
            style={[styles.countBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.countText}>{item.storyCount}</Text>
          </View>
        )}

        {/* Author info */}
        <View style={styles.authorRow}>
          {item.authorAvatar ? (
            <Image
              source={{ uri: item.authorAvatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
              <Ionicons name="person" size={10} color={colors.textSecondary} />
            </View>
          )}
          <Text
            style={[styles.authorName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.authorName}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [colors, onStoryPress],
  );

  const ListHeader = onCreatePress ? (
    <TouchableOpacity
      testID="stories-create-btn"
      style={[
        styles.gridItem,
        styles.createCard,
        {
          width: ITEM_SIZE,
          height: ITEM_SIZE * 1.4,
          backgroundColor: colors.surface,
          borderColor: colors.primary,
        },
      ]}
      onPress={onCreatePress}
    >
      <Ionicons name="add-circle" size={40} color={colors.primary} />
      <Text style={[styles.createLabel, { color: colors.primary }]}>
        Créer
      </Text>
    </TouchableOpacity>
  ) : null;

  if (stories.length === 0 && !isLoading) {
    return (
      <View testID="stories-grid-empty" style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Aucune story pour le moment
        </Text>
        {onCreatePress && (
          <TouchableOpacity
            testID="stories-create-empty"
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={onCreatePress}
          >
            <Text style={styles.createButtonText}>Créer une story</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <FlatList
      testID="stories-grid"
      data={stories}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={[styles.listContent, { padding: GRID_GAP }]}
      refreshing={isLoading}
      onRefresh={onRefresh}
      ListHeaderComponent={ListHeader}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  gridItem: {
    borderRadius: 12,
    overflow: "hidden",
    margin: GRID_GAP / 2,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unviewedRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 2,
  },
  countBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  countText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  authorRow: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  avatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  createCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  columnWrapper: {
    justifyContent: "flex-start",
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
