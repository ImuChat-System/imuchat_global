/**
 * ReplyPreview Component - Mobile
 * Shows a preview of the message being replied to above the chat input
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Message } from "@/services/messaging";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ReplyPreviewProps {
  /** The message being replied to */
  message: Message;
  /** Callback to cancel the reply */
  onCancel: () => void;
  /** Current user ID to determine "You" display */
  currentUserId?: string | null;
}

export function ReplyPreview({
  message,
  onCancel,
  currentUserId,
}: ReplyPreviewProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  // Determine the sender name
  const senderName =
    message.sender_id === currentUserId
      ? t("common.you")
      : message.sender?.username ||
        message.sender?.full_name ||
        t("common.unknownUser");

  // Truncate message content
  const content = message.content
    ? message.content.length > 80
      ? message.content.substring(0, 80) + "..."
      : message.content
    : message.media_url
      ? "📎 " + t("chat.mediaAttachment")
      : "";

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderLeftColor: colors.primary,
          marginHorizontal: spacing.md,
          marginBottom: spacing.xs,
        },
      ]}
    >
      <Ionicons
        name="arrow-undo-outline"
        size={16}
        color={colors.primary}
        style={styles.icon}
      />

      <View style={styles.content}>
        <Text
          style={[styles.senderName, { color: colors.primary }]}
          numberOfLines={1}
        >
          {senderName}
        </Text>
        <Text
          style={[styles.messageContent, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {content}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onCancel}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  senderName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  messageContent: {
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ReplyPreview;
