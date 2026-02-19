/**
 * MessageReactions Component - Mobile
 * Affiche les réactions sous un message avec modal pour voir les utilisateurs
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { ReactionGroup } from "@/services/reactions";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface MessageReactionsProps {
  /** ID du message */
  messageId: string;
  /** Réactions groupées par emoji */
  reactions: ReactionGroup[];
  /** Callback quand on tap sur une réaction */
  onReactionPress: (emoji: string) => void;
  /** Callback pour ouvrir le picker */
  onAddReaction: () => void;
  /** Données utilisateurs pour afficher dans le modal */
  users?: Record<string, User>;
}

/**
 * Composant pour afficher les réactions sous un message
 * Tap sur compteur → voir qui a réagi (modal)
 */
export function MessageReactions({
  messageId,
  reactions,
  onReactionPress,
  onAddReaction,
  users = {},
}: MessageReactionsProps) {
  const colors = useColors();
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleReactionTap = useCallback(
    (emoji: string) => {
      onReactionPress(emoji);
    },
    [onReactionPress],
  );

  const handleReactionLongPress = useCallback((emoji: string) => {
    setSelectedEmoji(emoji);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedEmoji(null);
  }, []);

  const selectedReaction = reactions.find((r) => r.emoji === selectedEmoji);

  if (reactions.length === 0) return null;

  return (
    <>
      <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
        {reactions.map((reaction) => (
          <ReactionBadge
            key={reaction.emoji}
            emoji={reaction.emoji}
            count={reaction.count}
            isOwn={reaction.isOwn}
            onPress={() => handleReactionTap(reaction.emoji)}
            onLongPress={() => handleReactionLongPress(reaction.emoji)}
          />
        ))}
        <TouchableOpacity
          onPress={onAddReaction}
          style={[
            styles.addButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
          accessibilityLabel="Ajouter une réaction"
          accessibilityRole="button"
        >
          <Text style={[styles.addIcon, { color: colors.textMuted }]}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal pour voir qui a réagi */}
      <ReactorsModal
        visible={modalVisible}
        onClose={closeModal}
        emoji={selectedEmoji || ""}
        users={
          selectedReaction?.users?.map(
            (userId) => users[userId] || { id: userId, name: "Utilisateur" },
          ) || []
        }
        totalCount={selectedReaction?.count || 0}
      />
    </>
  );
}

interface ReactionBadgeProps {
  emoji: string;
  count: number;
  isOwn: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function ReactionBadge({
  emoji,
  count,
  isOwn,
  onPress,
  onLongPress,
}: ReactionBadgeProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={[
        styles.badge,
        {
          backgroundColor: isOwn ? colors.primary + "20" : colors.surface,
          borderColor: isOwn ? colors.primary : colors.border,
        },
      ]}
      activeOpacity={0.7}
      accessibilityLabel={`${emoji} ${count} réaction${count > 1 ? "s" : ""}`}
      accessibilityRole="button"
      accessibilityHint="Appuyez pour réagir, maintenez pour voir qui a réagi"
    >
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.badgeCount,
          { color: isOwn ? colors.primary : colors.text },
        ]}
      >
        {count}
      </Text>
    </TouchableOpacity>
  );
}

/** Composant Avatar simple pour afficher les utilisateurs */
interface SimpleAvatarProps {
  uri?: string;
  name: string;
  size: number;
}

function SimpleAvatar({ uri, name, size }: SimpleAvatarProps) {
  const colors = useColors();
  const [imageError, setImageError] = useState(false);

  if (uri && !imageError) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surface,
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary + "30",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: colors.primary,
          fontSize: size * 0.4,
          fontWeight: "600",
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

interface ReactorsModalProps {
  visible: boolean;
  onClose: () => void;
  emoji: string;
  users: User[];
  totalCount: number;
}

function ReactorsModal({
  visible,
  onClose,
  emoji,
  users,
  totalCount,
}: ReactorsModalProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const renderUser = useCallback(
    ({ item }: { item: User }) => (
      <View style={styles.userRow}>
        <SimpleAvatar uri={item.avatar} name={item.name} size={40} />
        <Text style={[styles.userName, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>
    ),
    [colors.text],
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>{emoji}</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {totalCount} réaction{totalCount > 1 ? "s" : ""}
              </Text>
            </View>

            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUser}
              style={styles.userList}
              contentContainerStyle={{ paddingVertical: spacing.sm }}
              ItemSeparatorComponent={() => (
                <View style={{ height: spacing.sm }} />
              )}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  addButton: {
    width: 30,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    maxHeight: 400,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalEmoji: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  userList: {
    maxHeight: 200,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: "500",
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default MessageReactions;
