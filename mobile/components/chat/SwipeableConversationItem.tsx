/**
 * SwipeableConversationItem Component
 * Conversation item with swipe actions (archive, mute, delete)
 */

import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, type ReactElement } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface SwipeableConversationItemProps {
  children: ReactElement;
  onArchive?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
  isMuted?: boolean;
}

export function SwipeableConversationItem({
  children,
  onArchive,
  onMute,
  onDelete,
  isMuted = false,
}: SwipeableConversationItemProps) {
  const colors = useColors();
  const swipeableRef = useRef<Swipeable>(null);

  const close = () => {
    swipeableRef.current?.close();
  };

  const handleArchive = () => {
    close();
    onArchive?.();
  };

  const handleMute = () => {
    close();
    onMute?.();
  };

  const handleDelete = () => {
    close();
    onDelete?.();
  };

  // Right swipe actions (archive, mute)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [160, 0],
    });

    return (
      <Animated.View
        style={[styles.rightActionsContainer, { transform: [{ translateX }] }]}
      >
        {/* Archive button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleArchive}
          activeOpacity={0.8}
        >
          <Ionicons name="archive-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionText}>Archive</Text>
        </TouchableOpacity>

        {/* Mute/Unmute button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isMuted ? colors.secondary : colors.textMuted },
          ]}
          onPress={handleMute}
          activeOpacity={0.8}
        >
          <Ionicons
            name={
              isMuted ? "notifications-outline" : "notifications-off-outline"
            }
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.actionText}>{isMuted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Left swipe action (delete)
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 0],
    });

    return (
      <Animated.View
        style={[styles.leftActionsContainer, { transform: [{ translateX }] }]}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={40}
      leftThreshold={40}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.childrenContainer}>{children}</View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  childrenContainer: {
    backgroundColor: "transparent",
  },
  rightActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default SwipeableConversationItem;
