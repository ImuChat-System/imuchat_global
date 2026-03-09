/**
 * CommentItem — Commentaire individuel avec support hiérarchique
 *
 * Affiche un commentaire avec avatar, contenu, likes, reply,
 * et gère l'indentation pour les réponses (1 niveau).
 * Supporte : pin indicator, like animé, report.
 *
 * Sprint S5 Axe B — Commentaires Hiérarchisés
 */

import { useColors } from "@/providers/ThemeProvider";
import type { FeedComment } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

// ─── Props ────────────────────────────────────────────────────

interface CommentItemProps {
  comment: FeedComment;
  isReply?: boolean;
  isPinned?: boolean;
  onLike: (commentId: string) => void;
  onReply: (comment: FeedComment) => void;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  onUnpin?: (commentId: string) => void;
  onLoadReplies?: (commentId: string) => void;
  replies?: FeedComment[];
  isOwnComment?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  const weeks = Math.floor(days / 7);
  return `${weeks}sem`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n === 0) return "";
  return String(n);
}

// ─── Component ────────────────────────────────────────────────

const CommentItem = React.memo(function CommentItem({
  comment,
  isReply = false,
  isPinned = false,
  onLike,
  onReply,
  onDelete,
  onReport,
  onPin,
  onUnpin,
  onLoadReplies,
  replies,
  isOwnComment = false,
}: CommentItemProps) {
  const colors = useColors();
  const [showActions, setShowActions] = useState(false);

  // Like animation
  const likeScale = useSharedValue(1);
  const likeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    likeScale.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 400 }),
      withSpring(1),
    );
    onLike(comment.id);
  }, [comment.id, onLike, likeScale]);

  const handleReply = useCallback(() => {
    onReply(comment);
  }, [comment, onReply]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions(true);
  }, []);

  const handleDismissActions = useCallback(() => {
    setShowActions(false);
  }, []);

  const handleDelete = useCallback(() => {
    setShowActions(false);
    onDelete?.(comment.id);
  }, [comment.id, onDelete]);

  const handleReport = useCallback(() => {
    setShowActions(false);
    onReport?.(comment.id);
  }, [comment.id, onReport]);

  const handlePin = useCallback(() => {
    setShowActions(false);
    onPin?.(comment.id);
  }, [comment.id, onPin]);

  const handleUnpin = useCallback(() => {
    setShowActions(false);
    onUnpin?.(comment.id);
  }, [comment.id, onUnpin]);

  const handleLoadReplies = useCallback(() => {
    onLoadReplies?.(comment.id);
  }, [comment.id, onLoadReplies]);

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      {/* Pin indicator */}
      {isPinned && (
        <View style={styles.pinnedBanner}>
          <Ionicons name="pin" size={12} color={colors.primary} />
          <Text style={[styles.pinnedText, { color: colors.primary }]}>
            Épinglé
          </Text>
        </View>
      )}

      <View style={styles.row}>
        {/* Avatar */}
        <View style={[styles.avatarWrap, isReply && styles.avatarSmall]}>
          {comment.author.avatar_url ? (
            <Image
              source={{ uri: comment.author.avatar_url }}
              style={[styles.avatar, isReply && styles.avatarImgSmall]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                isReply && styles.avatarImgSmall,
                { backgroundColor: colors.border },
              ]}
            >
              <Ionicons
                name="person"
                size={isReply ? 12 : 16}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.8}>
            <View style={styles.header}>
              <Text
                style={[styles.username, { color: colors.text }]}
                numberOfLines={1}
              >
                {comment.author.display_name || comment.author.username}
              </Text>
              <Text style={[styles.time, { color: colors.textSecondary }]}>
                {timeAgo(comment.created_at)}
              </Text>
            </View>

            <Text style={[styles.body, { color: colors.text }]}>
              {comment.content}
            </Text>
          </TouchableOpacity>

          {/* Actions row */}
          <View style={styles.actionsRow}>
            {/* Like */}
            <Animated.View style={likeAnimStyle}>
              <TouchableOpacity
                onPress={handleLike}
                style={styles.actionBtn}
                hitSlop={8}
              >
                <Ionicons
                  name={comment.is_liked ? "heart" : "heart-outline"}
                  size={14}
                  color={comment.is_liked ? "#ff2d55" : colors.textSecondary}
                />
                <Text
                  style={[styles.actionText, { color: colors.textSecondary }]}
                >
                  {formatCount(comment.likes_count)}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Reply */}
            <TouchableOpacity
              onPress={handleReply}
              style={styles.actionBtn}
              hitSlop={8}
            >
              <Text style={[styles.replyBtn, { color: colors.textSecondary }]}>
                Répondre
              </Text>
            </TouchableOpacity>
          </View>

          {/* Load replies */}
          {!isReply && comment.replies_count > 0 && !replies?.length && (
            <TouchableOpacity
              onPress={handleLoadReplies}
              style={styles.loadReplies}
            >
              <View
                style={[
                  styles.repliesLine,
                  { backgroundColor: colors.textSecondary },
                ]}
              />
              <Text
                style={[
                  styles.loadRepliesText,
                  { color: colors.textSecondary },
                ]}
              >
                Voir {comment.replies_count} réponse
                {comment.replies_count > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          )}

          {/* Inline replies */}
          {replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              onReport={onReport}
              onPin={onPin}
              onUnpin={onUnpin}
            />
          ))}
        </View>
      </View>

      {/* Long-press action sheet */}
      {showActions && (
        <TouchableOpacity
          style={styles.actionsOverlay}
          activeOpacity={1}
          onPress={handleDismissActions}
        >
          <View style={[styles.actionsPopup, { backgroundColor: colors.card }]}>
            {/* Pin / Unpin (creator only) */}
            {onPin && !isPinned && !isReply && (
              <TouchableOpacity onPress={handlePin} style={styles.popupAction}>
                <Ionicons name="pin-outline" size={18} color={colors.primary} />
                <Text style={[styles.popupText, { color: colors.text }]}>
                  Épingler
                </Text>
              </TouchableOpacity>
            )}
            {onUnpin && isPinned && (
              <TouchableOpacity
                onPress={handleUnpin}
                style={styles.popupAction}
              >
                <Ionicons name="pin" size={18} color={colors.primary} />
                <Text style={[styles.popupText, { color: colors.text }]}>
                  Désépingler
                </Text>
              </TouchableOpacity>
            )}
            {isOwnComment && onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.popupAction}
              >
                <Ionicons name="trash-outline" size={18} color="#ff3b30" />
                <Text style={[styles.popupText, { color: "#ff3b30" }]}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            )}
            {onReport && !isOwnComment && (
              <TouchableOpacity
                onPress={handleReport}
                style={styles.popupAction}
              >
                <Ionicons
                  name="flag-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={[styles.popupText, { color: colors.text }]}>
                  Signaler
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default CommentItem;

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyContainer: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    marginLeft: 8,
  },
  pinnedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
    marginLeft: 48,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  avatarWrap: {
    width: 36,
    height: 36,
  },
  avatarSmall: {
    width: 28,
    height: 28,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarImgSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    fontWeight: "700",
  },
  time: {
    fontSize: 11,
  },
  body: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  replyBtn: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadReplies: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  repliesLine: {
    width: 24,
    height: 1,
  },
  loadRepliesText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  actionsPopup: {
    position: "absolute",
    right: 16,
    top: 8,
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 150,
  },
  popupAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  popupText: {
    fontSize: 15,
  },
});
