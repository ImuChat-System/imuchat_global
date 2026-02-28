/**
 * Comments Screen
 *
 * DEV-012: Commentaires sur les posts du feed social
 * - Liste des commentaires paginée
 * - Ajout de commentaires
 * - Suppression de ses propres commentaires
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  PostComment,
  addComment,
  deleteComment,
  fetchComments,
} from "@/services/social-feed";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CommentsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments
  const loadComments = useCallback(
    async (reset = false) => {
      if (!postId) return;

      if (reset) {
        setIsLoading(true);
        setComments([]);
        setNextCursor(null);
        setHasMore(true);
      }

      try {
        const result = await fetchComments(
          postId,
          reset ? undefined : (nextCursor ?? undefined),
        );
        setComments((prev) =>
          reset ? result.comments : [...prev, ...result.comments],
        );
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [postId, nextCursor],
  );

  // Initial load
  useEffect(() => {
    loadComments(true);
  }, [postId]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      loadComments(false);
    }
  }, [isLoadingMore, hasMore, isLoading, loadComments]);

  // Submit comment
  const handleSubmit = useCallback(async () => {
    if (!postId || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(postId, newComment.trim());
      if (comment) {
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("social.comments.addFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }, [postId, newComment, isSubmitting, t]);

  // Delete comment
  const handleDelete = useCallback(
    (commentId: string) => {
      Alert.alert(
        t("social.comments.deleteTitle"),
        t("social.comments.deleteMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: async () => {
              const success = await deleteComment(commentId, postId!);
              if (success) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
              }
            },
          },
        ],
      );
    },
    [t],
  );

  // Format time ago
  const formatTimeAgo = useCallback(
    (iso: string) => {
      const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
      if (mins < 1) return t("common.justNow");
      if (mins < 60) return t("common.minutesAgo", { count: mins });
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return t("common.hoursAgo", { count: hrs });
      return t("common.daysAgo", { count: Math.floor(hrs / 24) });
    },
    [t],
  );

  // Render comment
  const renderComment = ({ item }: { item: PostComment }) => {
    const authorName =
      item.author.displayName || item.author.username || "Anonyme";
    const authorInitial = authorName.charAt(0).toUpperCase();
    const isOwn = item.authorId === user?.id;

    return (
      <View
        testID={`comment-${item.id}`}
        style={[styles.commentCard, { backgroundColor: colors.surface }]}
      >
        <View style={styles.commentHeader}>
          {item.author.avatarUrl ? (
            <Image
              source={{ uri: item.author.avatarUrl }}
              style={styles.commentAvatar}
            />
          ) : (
            <View
              style={[
                styles.commentAvatarPlaceholder,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text
                style={[styles.commentAvatarText, { color: colors.primary }]}
              >
                {authorInitial}
              </Text>
            </View>
          )}
          <View style={styles.commentInfo}>
            <Text style={[styles.commentAuthor, { color: colors.text }]}>
              {authorName}
            </Text>
            <Text style={[styles.commentTime, { color: colors.textMuted }]}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          {isOwn && (
            <TouchableOpacity
              testID={`delete-comment-${item.id}`}
              onPress={() => handleDelete(item.id)}
              style={styles.deleteBtn}
            >
              <Text style={[styles.deleteBtnText, { color: colors.error }]}>
                {t("common.delete")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.commentContent, { color: colors.text }]}>
          {item.content}
        </Text>
      </View>
    );
  };

  // Footer loader
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  // Empty list
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("social.comments.empty")}
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
          {t("social.comments.beFirst")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={88}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <TouchableOpacity
            testID="btn-back"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("social.comments.title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Loading state */}
        {isLoading && comments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            testID="comments-list"
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ padding: spacing.md, flexGrow: 1 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <TextInput
            ref={inputRef}
            testID="input-comment"
            style={[
              styles.input,
              { backgroundColor: colors.background, color: colors.text },
            ]}
            placeholder={t("social.comments.placeholder")}
            placeholderTextColor={colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            maxLength={500}
            multiline
          />
          <TouchableOpacity
            testID="btn-send"
            onPress={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  newComment.trim() && !isSubmitting
                    ? colors.primary
                    : colors.primary + "40",
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Comment card
  commentCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Footer
  footerLoader: {
    padding: 16,
    alignItems: "center",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
