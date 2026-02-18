/**
 * ReactionPicker Component - Mobile
 * Affiche un picker de réactions rapides en popup
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { QUICK_REACTIONS } from "@/services/reactions";
import React, { useCallback } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position?: { x: number; y: number };
}

export function ReactionPicker({
  visible,
  onClose,
  onSelect,
  position,
}: ReactionPickerProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      onClose();
    },
    [onSelect, onClose],
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.emojiRow}>
            {QUICK_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleSelect(emoji)}
                style={[
                  styles.emojiButton,
                  { backgroundColor: colors.background },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

interface ReactionBadgeProps {
  emoji: string;
  count: number;
  isOwn: boolean;
  onPress: () => void;
}

export function ReactionBadge({
  emoji,
  count,
  isOwn,
  onPress,
}: ReactionBadgeProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.badge,
        {
          backgroundColor: isOwn ? colors.primary + "20" : colors.surface,
          borderColor: isOwn ? colors.primary : colors.border,
        },
      ]}
      activeOpacity={0.7}
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

interface ReactionBarProps {
  reactions: Array<{ emoji: string; count: number; isOwn: boolean }>;
  onReactionPress: (emoji: string) => void;
  onAddPress: () => void;
}

export function ReactionBar({
  reactions,
  onReactionPress,
  onAddPress,
}: ReactionBarProps) {
  const colors = useColors();

  if (reactions.length === 0) return null;

  return (
    <View style={styles.reactionBar}>
      {reactions.map((reaction) => (
        <ReactionBadge
          key={reaction.emoji}
          emoji={reaction.emoji}
          count={reaction.count}
          isOwn={reaction.isOwn}
          onPress={() => onReactionPress(reaction.emoji)}
        />
      ))}
      <TouchableOpacity
        onPress={onAddPress}
        style={[
          styles.addButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.addIcon, { color: colors.textMuted }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emojiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  reactionBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  addButton: {
    width: 28,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 16,
    fontWeight: "600",
  },
});
