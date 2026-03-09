/**
 * SocialActivity — Snapshot de l'activité sociale sur le Home Hub
 * Sprint S2 Axe A — Home Hub enrichi
 *
 * Affiche :
 * - Bande de stories horizontale (via useStoriesStore, données réelles)
 * - 2-3 derniers posts du feed social (via fetchFeed)
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { Post } from "@/services/social-feed";
import { fetchFeed } from "@/services/social-feed";
import { useStoriesStore } from "@/stores/stories-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_STORIES_DISPLAY = 8;
const MAX_POSTS_DISPLAY = 3;

// ─── Component ────────────────────────────────────────────────

export default function SocialActivity() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  // Stories (données réelles)
  const { storyGroups, fetchStories } = useStoriesStore();

  // Posts récents
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchStories();
    loadRecentPosts();
  }, [fetchStories]);

  const loadRecentPosts = useCallback(async () => {
    try {
      const page = await fetchFeed(undefined, "all");
      setRecentPosts(page.posts.slice(0, MAX_POSTS_DISPLAY));
    } catch {
      // Silently fail — snapshot only
    }
  }, []);

  // ─── Handlers ─────────────────────────────────────────────

  const handleStoryPress = useCallback(
    (index: number) => {
      const { openViewer } = useStoriesStore.getState();
      openViewer(index);
      router.push("/stories/viewer" as any);
    },
    [router],
  );

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/social/post/${postId}` as any);
    },
    [router],
  );

  const handleSeeAll = useCallback(() => {
    router.push("/(tabs)/social" as any);
  }, [router]);

  // ─── Story Item ───────────────────────────────────────────

  const renderStoryItem = useCallback(
    ({ item, index }: { item: (typeof storyGroups)[0]; index: number }) => {
      const hasUnread = item.stories.some((s) => !s.is_viewed);
      return (
        <TouchableOpacity
          style={styles.storyItem}
          onPress={() => handleStoryPress(index)}
          accessibilityRole="button"
          accessibilityLabel={item.user.username || t("social.story")}
        >
          <View
            style={[
              styles.storyRing,
              {
                borderColor: hasUnread ? "#ec4899" : colors.border,
              },
            ]}
          >
            {item.user.avatar_url ? (
              <Image
                source={{ uri: item.user.avatar_url }}
                style={styles.storyAvatar}
              />
            ) : (
              <View
                style={[
                  styles.storyAvatar,
                  { backgroundColor: colors.surfaceHover },
                ]}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            )}
          </View>
          <Text
            style={[styles.storyUsername, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.user.username || "??"}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleStoryPress, colors, t],
  );

  // ─── Render ───────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Section header */}
      <View style={[styles.sectionHeader, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("home.social_activity")}
        </Text>
        <TouchableOpacity onPress={handleSeeAll} accessibilityRole="button">
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t("common.see_all")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stories carousel */}
      {storyGroups.length > 0 && (
        <FlatList
          data={storyGroups.slice(0, MAX_STORIES_DISPLAY)}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.user.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 12 }}
          style={styles.storiesList}
        />
      )}

      {/* Recent posts snapshot */}
      {recentPosts.length > 0 && (
        <View
          style={{
            paddingHorizontal: spacing.md,
            gap: 8,
            paddingBottom: spacing.sm,
          }}
        >
          {recentPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[
                styles.postCard,
                { backgroundColor: colors.surfaceHover },
              ]}
              onPress={() => handlePostPress(post.id)}
              accessibilityRole="button"
            >
              <View style={styles.postHeader}>
                {post.author.avatarUrl ? (
                  <Image
                    source={{ uri: post.author.avatarUrl }}
                    style={styles.postAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.postAvatar,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={12}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
                <Text
                  style={[styles.postAuthor, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {post.author.displayName || post.author.username}
                </Text>
              </View>
              <Text
                style={[styles.postContent, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {post.content}
              </Text>
              <View style={styles.postStats}>
                <Ionicons name="heart" size={12} color={colors.textMuted} />
                <Text style={[styles.statText, { color: colors.textMuted }]}>
                  {post.likesCount}
                </Text>
                <Ionicons
                  name="chatbubble"
                  size={12}
                  color={colors.textMuted}
                />
                <Text style={[styles.statText, { color: colors.textMuted }]}>
                  {post.commentsCount}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  storiesList: {
    marginBottom: 12,
  },
  storyItem: {
    alignItems: "center",
    width: 68,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  storyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  storyUsername: {
    fontSize: 11,
    textAlign: "center",
    width: 64,
  },
  postCard: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  postAuthor: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  postContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    marginRight: 8,
  },
});
