/**
 * CommentSheet — Bottom sheet commentaires hiérarchisés
 *
 * Container principal :
 * - BottomSheet (@gorhom/bottom-sheet)
 * - Header avec compteur + tri (Top / Récent)
 * - FlatList de CommentItem avec replies inline
 * - Input bar fixe en bas (texte + envoi)
 * - Loading / empty states
 *
 * Sprint S5 Axe B — Commentaires Hiérarchisés
 */

import CommentItem from "@/components/imufeed/CommentItem";
import { useColors } from "@/providers/ThemeProvider";
import { useImuFeedStore } from "@/stores/imufeed-store";
import type { FeedComment } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────

interface CommentSheetProps {
  videoId: string;
  commentsCount: number;
  onClose: () => void;
  /** Current user ID for own-comment detection */
  currentUserId?: string;
  /** Video author ID for pin privileges */
  videoAuthorId?: string;
}

// ─── Component ────────────────────────────────────────────────

export default function CommentSheet({
  videoId,
  commentsCount,
  onClose,
  currentUserId,
  videoAuthorId,
}: CommentSheetProps) {
  const colors = useColors();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);

  // Store
  const {
    activeVideoComments,
    isLoadingComments,
    commentsHasMore,
    commentSortMode,
    loadComments,
    loadMoreComments,
    addComment,
    deleteComment,
    toggleCommentLike,
    pinComment,
    unpinComment,
    reportComment,
    setCommentSortMode,
    clearComments,
  } = useImuFeedStore();

  const isVideoAuthor = currentUserId === videoAuthorId;

  // Local state
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<FeedComment | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [repliesMap, setRepliesMap] = useState<Record<string, FeedComment[]>>(
    {},
  );

  // Snap points
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  // ─── Load comments on mount ─────────────────────────────

  useEffect(() => {
    loadComments(videoId);
    return () => clearComments();
  }, [videoId, loadComments, clearComments]);

  // ─── Sort comments ──────────────────────────────────────

  const sortedComments = useMemo(() => {
    const rootComments = activeVideoComments.filter((c) => !c.parent_id);

    // Pin first if exists (from is_pinned field)
    const pinned = rootComments.filter((c) => c.is_pinned);
    const others = rootComments.filter((c) => !c.is_pinned);

    const sorted =
      commentSortMode === "top"
        ? [...others].sort((a, b) => b.likes_count - a.likes_count)
        : others; // Already sorted by `created_at desc` from API

    return [...pinned, ...sorted];
  }, [activeVideoComments, commentSortMode]);

  // ─── Handlers ───────────────────────────────────────────

  const handleLike = useCallback(
    (commentId: string) => {
      toggleCommentLike(commentId);
    },
    [toggleCommentLike],
  );

  const handleReply = useCallback((comment: FeedComment) => {
    setReplyTarget(comment);
    inputRef.current?.focus();
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const handleDelete = useCallback(
    (commentId: string) => {
      deleteComment(commentId);
    },
    [deleteComment],
  );

  const handleReport = useCallback(
    (commentId: string) => {
      reportComment(commentId, "spam");
    },
    [reportComment],
  );

  const handlePin = useCallback(
    (commentId: string) => {
      pinComment(commentId, videoId);
    },
    [pinComment, videoId],
  );

  const handleUnpin = useCallback(
    (commentId: string) => {
      unpinComment(commentId);
    },
    [unpinComment],
  );

  const handleSend = useCallback(async () => {
    const text = commentText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      await addComment(videoId, text, replyTarget?.id);
      setCommentText("");
      setReplyTarget(null);
      Keyboard.dismiss();
    } catch {
      // Error handled in store
    } finally {
      setIsSending(false);
    }
  }, [commentText, isSending, addComment, videoId, replyTarget]);

  const handleLoadMore = useCallback(() => {
    if (commentsHasMore && !isLoadingComments) {
      loadMoreComments(videoId);
    }
  }, [commentsHasMore, isLoadingComments, loadMoreComments, videoId]);

  const handleLoadReplies = useCallback(
    async (parentId: string) => {
      try {
        const { fetchVideoComments } = await import("@/services/imufeed-api");
        const result = await fetchVideoComments(videoId, parentId);
        setRepliesMap((prev) => ({ ...prev, [parentId]: result.comments }));
      } catch {
        // silently fail
      }
    },
    [videoId],
  );

  const toggleSort = useCallback(() => {
    setCommentSortMode(commentSortMode === "recent" ? "top" : "recent");
  }, [setCommentSortMode, commentSortMode]);

  // ─── Sheet callbacks ────────────────────────────────────

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    [],
  );

  // ─── Render item ────────────────────────────────────────

  const renderComment = useCallback(
    ({ item }: { item: FeedComment }) => (
      <CommentItem
        comment={item}
        isPinned={item.is_pinned}
        onLike={handleLike}
        onReply={handleReply}
        onDelete={handleDelete}
        onReport={handleReport}
        onPin={isVideoAuthor ? handlePin : undefined}
        onUnpin={isVideoAuthor ? handleUnpin : undefined}
        onLoadReplies={handleLoadReplies}
        replies={repliesMap[item.id]}
        isOwnComment={item.author.id === currentUserId}
      />
    ),
    [
      handleLike,
      handleReply,
      handleDelete,
      handleReport,
      handlePin,
      handleUnpin,
      handleLoadReplies,
      repliesMap,
      currentUserId,
      isVideoAuthor,
    ],
  );

  const keyExtractor = useCallback((item: FeedComment) => item.id, []);

  // ─── Empty / Loading states ─────────────────────────────

  const ListEmptyComponent = useMemo(() => {
    if (isLoadingComments) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="chatbubble-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Aucun commentaire
        </Text>
        <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
          Sois le premier à commenter !
        </Text>
      </View>
    );
  }, [isLoadingComments, colors]);

  const ListFooterComponent = useMemo(() => {
    if (!isLoadingComments || sortedComments.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingComments, sortedComments.length, colors]);

  // ─── Render ─────────────────────────────────────────────

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
      backgroundStyle={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {commentsCount} commentaire{commentsCount !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity onPress={toggleSort} style={styles.sortBtn}>
          <Ionicons
            name={commentSortMode === "top" ? "flame" : "time-outline"}
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.sortText, { color: colors.primary }]}>
            {commentSortMode === "top" ? "Top" : "Récents"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments list */}
      <BottomSheetFlatList
        data={sortedComments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
      />

      {/* Reply indicator */}
      {replyTarget && (
        <View style={[styles.replyBar, { backgroundColor: colors.card }]}>
          <Text
            style={[styles.replyBarText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            Réponse à{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {replyTarget.author.display_name || replyTarget.author.username}
            </Text>
          </Text>
          <TouchableOpacity onPress={handleCancelReply} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder={
            replyTarget ? "Répondre..." : "Ajouter un commentaire..."
          }
          placeholderTextColor={colors.textSecondary}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendBtn,
            {
              backgroundColor: commentText.trim()
                ? colors.primary
                : colors.card,
            },
          ]}
          disabled={!commentText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={commentText.trim() ? "#fff" : colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 13,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyBarText: {
    flex: 1,
    fontSize: 13,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
