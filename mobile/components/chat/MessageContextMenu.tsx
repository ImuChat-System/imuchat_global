/**
 * MessageContextMenu Component - Mobile
 * ActionSheet-style menu for message actions: Reply, Copy, Edit, Delete
 * Only appears on long-press of own messages or for copy/reply on others' messages
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";

const EDIT_TIME_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

export interface MessageContextMenuProps {
  /** Whether the menu is visible */
  visible: boolean;
  /** Close the menu */
  onClose: () => void;
  /** Message ID */
  messageId: string;
  /** Message text content */
  messageText: string | null;
  /** Whether this is the current user's message */
  isOwnMessage: boolean;
  /** When the message was created */
  messageCreatedAt: string;
  /** Whether the message is already deleted */
  isDeleted?: boolean;
  /** Callback for reply action */
  onReply?: (messageId: string, messageText: string) => void;
  /** Callback for copy action */
  onCopy?: (messageText: string) => void;
  /** Callback for edit action */
  onEdit?: (messageId: string, currentText: string) => void;
  /** Callback for delete action */
  onDelete?: (messageId: string) => void;
  /** Callback for forward action */
  onForward?: (messageId: string, messageText: string) => void;
  /** Callback for translate action */
  onTranslate?: (messageId: string, messageText: string) => void;
  /** Whether this message is already translated */
  isTranslated?: boolean;
}

interface MenuAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function MessageContextMenu({
  visible,
  onClose,
  messageId,
  messageText,
  isOwnMessage,
  messageCreatedAt,
  isDeleted = false,
  onReply,
  onCopy,
  onEdit,
  onDelete,
  onForward,
  onTranslate,
  isTranslated = false,
}: MessageContextMenuProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  // Check if edit is still allowed (within 15 min)
  const isEditExpired = useMemo(() => {
    const created = new Date(messageCreatedAt).getTime();
    if (Number.isNaN(created)) return true;
    return Date.now() - created > EDIT_TIME_LIMIT_MS;
  }, [messageCreatedAt]);

  const handleReply = useCallback(() => {
    if (messageText) {
      onReply?.(messageId, messageText);
    }
    onClose();
  }, [messageId, messageText, onReply, onClose]);

  const handleCopy = useCallback(() => {
    if (messageText) {
      onCopy?.(messageText);
    }
    onClose();
  }, [messageText, onCopy, onClose]);

  const handleEdit = useCallback(() => {
    if (messageText) {
      onEdit?.(messageId, messageText);
    }
    onClose();
  }, [messageId, messageText, onEdit, onClose]);

  const handleDelete = useCallback(() => {
    Alert.alert(t("chat.deleteMessage"), t("chat.deleteMessageConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          onDelete?.(messageId);
          onClose();
        },
      },
    ]);
  }, [messageId, onDelete, onClose, t]);

  const handleForward = useCallback(() => {
    if (messageText) {
      onForward?.(messageId, messageText);
    }
    onClose();
  }, [messageId, messageText, onForward, onClose]);

  const handleTranslate = useCallback(() => {
    if (messageText) {
      onTranslate?.(messageId, messageText);
    }
    onClose();
  }, [messageId, messageText, onTranslate, onClose]);

  // Build actions list based on message ownership
  const actions: MenuAction[] = useMemo(() => {
    const items: MenuAction[] = [];

    // Reply - available for all messages with content
    if (messageText && !isDeleted && onReply) {
      items.push({
        id: "reply",
        label: t("chat.reply"),
        icon: "arrow-undo-outline",
        onPress: handleReply,
      });
    }

    // Copy - available for all messages with content
    if (messageText && !isDeleted && onCopy) {
      items.push({
        id: "copy",
        label: t("common.copy"),
        icon: "copy-outline",
        onPress: handleCopy,
      });
    }

    // Forward - available for all messages with content
    if (messageText && !isDeleted && onForward) {
      items.push({
        id: "forward",
        label: t("chat.forward"),
        icon: "arrow-redo-outline",
        onPress: handleForward,
      });
    }

    // Translate - available for all messages with text content
    if (messageText && !isDeleted && onTranslate) {
      items.push({
        id: "translate",
        label: isTranslated ? t("chat.showOriginal") : t("chat.translate"),
        icon: isTranslated ? "eye-outline" : "globe-outline",
        onPress: handleTranslate,
      });
    }

    // Edit - only for own messages within time limit
    if (isOwnMessage && !isDeleted && !isEditExpired && onEdit) {
      items.push({
        id: "edit",
        label: t("chat.editMessage"),
        icon: "pencil-outline",
        onPress: handleEdit,
      });
    }

    // Delete - only for own messages
    if (isOwnMessage && !isDeleted && onDelete) {
      items.push({
        id: "delete",
        label: t("common.delete"),
        icon: "trash-outline",
        onPress: handleDelete,
        destructive: true,
      });
    }

    return items;
  }, [
    messageText,
    isDeleted,
    isOwnMessage,
    isEditExpired,
    onReply,
    onCopy,
    onEdit,
    onDelete,
    onForward,
    onTranslate,
    isTranslated,
    handleReply,
    handleCopy,
    handleEdit,
    handleDelete,
    handleForward,
    handleTranslate,
    t,
  ]);

  if (!visible || actions.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.backdropOverlay,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
        />
      </Pressable>

      {/* Menu */}
      <Animated.View
        entering={SlideInDown.springify().damping(20)}
        style={[
          styles.menuContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingBottom: spacing.xl,
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Actions */}
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionRow,
              index < actions.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
            activeOpacity={0.7}
          >
            <Ionicons
              name={action.icon}
              size={22}
              color={action.destructive ? "#EF4444" : colors.text}
              style={styles.actionIcon}
            />
            <Text
              style={[
                styles.actionLabel,
                {
                  color: action.destructive ? "#EF4444" : colors.text,
                  opacity: action.disabled ? 0.5 : 1,
                },
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Cancel button */}
        <TouchableOpacity
          style={[
            styles.cancelButton,
            { backgroundColor: colors.background, marginTop: spacing.md },
          ]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: colors.primary }]}>
            {t("common.cancel")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MessageContextMenu;
