/**
 * SocialScreen — Parité web stories module
 * Sections : StoryCarousel, StoryGrid, CreateStoryFAB, filtres (Mixte/News/Stories)
 */

import { useAuth } from "@/providers/AuthProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────
type FeedFilter = "mixed" | "news" | "stories";

interface StoryUser {
  id: string;
  username: string;
  avatar: string | null;
  hasNew: boolean;
}

interface StoryPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likes: number;
  comments: number;
  type: "story" | "news";
}

// ─── Mock data (parité avec web MOCK_STORIES) ────────────────────
const MOCK_STORY_USERS: StoryUser[] = [
  { id: "su-me", username: "Vous", avatar: null, hasNew: false },
  { id: "su-1", username: "Alice", avatar: null, hasNew: true },
  { id: "su-2", username: "Bob", avatar: null, hasNew: true },
  { id: "su-3", username: "Chloé", avatar: null, hasNew: false },
  { id: "su-4", username: "David", avatar: null, hasNew: true },
  { id: "su-5", username: "Emma", avatar: null, hasNew: true },
  { id: "su-6", username: "François", avatar: null, hasNew: false },
];

const MOCK_FEED: StoryPost[] = [
  {
    id: "fp-1",
    authorId: "su-1",
    authorName: "Alice",
    content: "Nouveau monde créé dans ImuVerse ! Venez explorer 🌍",
    imageUrl: null,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    likes: 12,
    comments: 3,
    type: "story",
  },
  {
    id: "fp-2",
    authorId: "su-2",
    authorName: "Bob",
    content:
      "Le concours créatif est maintenant ouvert. Participez avant vendredi !",
    imageUrl: null,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    likes: 34,
    comments: 8,
    type: "news",
  },
  {
    id: "fp-3",
    authorId: "su-4",
    authorName: "David",
    content:
      "Watch party ce soir à 21h — on regarde le dernier épisode ensemble 🎬",
    imageUrl: null,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    likes: 22,
    comments: 15,
    type: "story",
  },
  {
    id: "fp-4",
    authorId: "su-5",
    authorName: "Emma",
    content:
      "J'ai publié un nouveau thème sombre dans le Store — dites-moi ce que vous en pensez !",
    imageUrl: null,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    likes: 45,
    comments: 7,
    type: "story",
  },
  {
    id: "fp-5",
    authorId: "su-3",
    authorName: "Chloé",
    content:
      "Mise à jour : les appels vidéo de groupe supportent maintenant jusqu'à 8 participants 📹",
    imageUrl: null,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    likes: 89,
    comments: 21,
    type: "news",
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────
export default function SocialScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { user } = useAuth();

  const [filter, setFilter] = useState<FeedFilter>("mixed");

  // ─── Helpers ──────────────────────────────────────────────────
  const formatTimeAgo = useCallback((iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Il y a ${hrs}h`;
    return `Il y a ${Math.floor(hrs / 24)}j`;
  }, []);

  const filteredFeed =
    filter === "mixed"
      ? MOCK_FEED
      : MOCK_FEED.filter(
          (p) => p.type === (filter === "news" ? "news" : "story"),
        );

  // ─── Story carousel ──────────────────────────────────────────
  const renderStoryUser = ({ item }: { item: StoryUser }) => (
    <TouchableOpacity testID={`story-user-${item.id}`} style={styles.storyItem}>
      <View
        style={[
          styles.storyRing,
          { borderColor: item.hasNew ? colors.primary : colors.border },
        ]}
      >
        <View style={[styles.storyAvatar, { backgroundColor: colors.surface }]}>
          <Text style={styles.storyEmoji}>
            {item.id === "su-me" ? "➕" : item.username.charAt(0)}
          </Text>
        </View>
      </View>
      <Text
        style={[styles.storyUsername, { color: colors.textMuted }]}
        numberOfLines={1}
      >
        {item.username}
      </Text>
    </TouchableOpacity>
  );

  // ─── Feed post ────────────────────────────────────────────────
  const renderPost = ({ item }: { item: StoryPost }) => (
    <View
      testID={`feed-post-${item.id}`}
      style={[
        styles.postCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Author header */}
      <View style={styles.postHeader}>
        <View
          style={[
            styles.postAvatar,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Text style={[styles.postAvatarText, { color: colors.primary }]}>
            {item.authorName.charAt(0)}
          </Text>
        </View>
        <View style={styles.postHeaderInfo}>
          <Text style={[styles.postAuthor, { color: colors.text }]}>
            {item.authorName}
          </Text>
          <Text style={[styles.postTime, { color: colors.textMuted }]}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        {item.type === "news" && (
          <View
            style={[
              styles.newsBadge,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.newsBadgeText, { color: colors.primary }]}>
              📰 News
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={[styles.postContent, { color: colors.text }]}>
        {item.content}
      </Text>

      {/* Actions */}
      <View style={[styles.postActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity testID={`like-${item.id}`} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: colors.textMuted }]}>
            ❤️ {item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`comment-${item.id}`}
          style={styles.actionBtn}
        >
          <Text style={[styles.actionText, { color: colors.textMuted }]}>
            💬 {item.comments}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity testID={`share-${item.id}`} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: colors.textMuted }]}>
            🔗 Partager
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <ScrollView
      testID="social-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>🌐 Social</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Stories, feed et mur social
        </Text>

        {/* ── Story Carousel ──────────────────────────────────── */}
        <FlatList
          testID="social-story-carousel"
          data={MOCK_STORY_USERS}
          renderItem={renderStoryUser}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storyCarousel}
        />

        {/* ── Filters ─────────────────────────────────────────── */}
        <View testID="feed-filters" style={styles.filterRow}>
          {(["mixed", "news", "stories"] as FeedFilter[]).map((f) => {
            const labels: Record<FeedFilter, string> = {
              mixed: "Mixte",
              news: "News",
              stories: "Stories",
            };
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                testID={`filter-${f}`}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? "#fff" : colors.textMuted },
                  ]}
                >
                  {labels[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Feed ────────────────────────────────────────────── */}
        <View testID="social-feed">
          {filteredFeed.map((post) => (
            <View key={post.id}>{renderPost({ item: post })}</View>
          ))}
          {filteredFeed.length === 0 && (
            <Text
              testID="empty-feed"
              style={[styles.emptyText, { color: colors.textMuted }]}
            >
              Aucun post pour ce filtre
            </Text>
          )}
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 80 }} />
      </View>

      {/* ── Create Story FAB ──────────────────────────────────── */}
      <TouchableOpacity
        testID="btn-create-story"
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 16 },

  // Story carousel
  storyCarousel: { marginBottom: 16 },
  storyItem: { alignItems: "center", marginRight: 14, width: 64 },
  storyRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  storyEmoji: { fontSize: 20 },
  storyUsername: { fontSize: 11, marginTop: 4, textAlign: "center" },

  // Filters
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "500" },

  // Post card
  postCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  postAvatarText: { fontSize: 16, fontWeight: "600" },
  postHeaderInfo: { flex: 1, marginLeft: 10 },
  postAuthor: { fontSize: 14, fontWeight: "600" },
  postTime: { fontSize: 12, marginTop: 2 },
  newsBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  newsBadgeText: { fontSize: 11, fontWeight: "600" },
  postContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  actionBtn: { flex: 1, alignItems: "center" },
  actionText: { fontSize: 13 },

  // Empty
  emptyText: { textAlign: "center", padding: 40, fontSize: 14 },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: { fontSize: 24 },
});
