import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Message } from "@/services/messaging";
import { ReactionGroup } from "@/services/reactions";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MessageContextMenu } from "./chat/MessageContextMenu";
import { MediaPreview, MediaViewer } from "./MediaComponents";
import { ReactionBar, ReactionPicker } from "./ReactionPicker";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  /** Réactions groupées pour ce message */
  reactions?: ReactionGroup[];
  /** Callback lors d'un toggle de réaction */
  onReactionToggle?: (emoji: string) => void;
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
}

export default function MessageBubble({
  message,
  isOwnMessage,
  reactions = [],
  onReactionToggle,
  onReply,
  onCopy,
  onEdit,
  onDelete,
  onForward,
}: MessageBubbleProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [showPicker, setShowPicker] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Check if message is deleted
  const isDeleted = Boolean(message.deleted_at);
  // Check if message is edited
  const isEdited = Boolean(message.is_edited);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleLongPress = useCallback(() => {
    // Show context menu for message actions
    setShowContextMenu(true);
  }, []);

  const handleReactionPickerOpen = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleReactionSelect = useCallback(
    (emoji: string) => {
      onReactionToggle?.(emoji);
      setShowPicker(false);
    },
    [onReactionToggle],
  );

  const handleReactionPress = useCallback(
    (emoji: string) => {
      onReactionToggle?.(emoji);
    },
    [onReactionToggle],
  );

  // Determine media type from mime type
  const getMediaType = (
    mimeType: string | null,
  ): "image" | "video" | "voice" | "file" => {
    if (!mimeType) return "file";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "voice";
    return "file";
  };

  const hasMedia = message.media_url && message.media_type;
  const mediaType = getMediaType(message.media_type);
  const hasText = message.content && message.content.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!isOwnMessage && message.sender && (
        <Text style={[styles.senderName, { color: colors.primary }]}>
          {message.sender.username ||
            message.sender.full_name ||
            t("common.unknown")}
        </Text>
      )}

      <Pressable onLongPress={handleLongPress} delayLongPress={300}>
        <View
          style={[
            styles.bubble,
            isOwnMessage
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.surface },
            hasMedia && !hasText && styles.mediaBubble,
          ]}
        >
          {/* Reply quote - show the message being replied to */}
          {message.replied_message && !isDeleted && (
            <View
              style={[
                styles.replyQuote,
                {
                  backgroundColor: isOwnMessage
                    ? "rgba(255,255,255,0.15)"
                    : colors.background,
                  borderLeftColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.replyAuthor,
                  {
                    color: isOwnMessage
                      ? "rgba(255,255,255,0.9)"
                      : colors.primary,
                  },
                ]}
                numberOfLines={1}
              >
                {message.replied_message.sender?.username ||
                  message.replied_message.sender?.full_name ||
                  t("common.unknownUser")}
              </Text>
              <Text
                style={[
                  styles.replyContent,
                  {
                    color: isOwnMessage
                      ? "rgba(255,255,255,0.7)"
                      : colors.textMuted,
                  },
                ]}
                numberOfLines={2}
              >
                {message.replied_message.content || t("chat.mediaAttachment")}
              </Text>
            </View>
          )}

          {/* Média */}
          {hasMedia && message.media_url && (
            <MediaPreview
              uri={message.media_url}
              type={mediaType}
              thumbnailSize={200}
              onPress={() => {
                if (mediaType === "image" || mediaType === "video") {
                  setShowMediaViewer(true);
                }
              }}
              style={hasText ? styles.mediaWithText : undefined}
            />
          )}

          {/* Texte - Show deleted message or regular content */}
          {isDeleted ? (
            <Text
              style={[
                styles.messageText,
                styles.deletedText,
                {
                  color: isOwnMessage
                    ? "rgba(255,255,255,0.6)"
                    : colors.textMuted,
                },
              ]}
            >
              {t("chat.messageDeleted")}
            </Text>
          ) : hasText ? (
            <Text
              style={[
                styles.messageText,
                { color: isOwnMessage ? "#FFFFFF" : colors.text },
              ]}
            >
              {message.content}
            </Text>
          ) : null}

          {/* Timestamp + edited indicator */}
          <View style={styles.timestampRow}>
            {isEdited && !isDeleted && (
              <Text
                style={[
                  styles.editedText,
                  {
                    color: isOwnMessage
                      ? "rgba(255,255,255,0.6)"
                      : colors.textMuted,
                  },
                ]}
              >
                {t("chat.messageEdited")} •{" "}
              </Text>
            )}
            <Text
              style={[
                styles.timestamp,
                {
                  color: isOwnMessage
                    ? "rgba(255,255,255,0.7)"
                    : colors.textMuted,
                },
              ]}
            >
              {formatTime(message.created_at)}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* MediaViewer plein écran */}
      {hasMedia &&
        message.media_url &&
        (mediaType === "image" || mediaType === "video") && (
          <MediaViewer
            uri={message.media_url}
            type={mediaType}
            visible={showMediaViewer}
            onClose={() => setShowMediaViewer(false)}
          />
        )}

      {/* Réactions - hide for deleted messages */}
      {!isDeleted && (reactions.length > 0 || onReactionToggle) && (
        <ReactionBar
          reactions={reactions}
          onReactionPress={handleReactionPress}
          onAddPress={handleReactionPickerOpen}
        />
      )}

      {/* Picker de réactions */}
      <ReactionPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleReactionSelect}
      />

      {/* Context menu for message actions */}
      <MessageContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        messageId={message.id}
        messageText={message.content}
        isOwnMessage={isOwnMessage}
        messageCreatedAt={message.created_at}
        isDeleted={isDeleted}
        onReply={onReply}
        onCopy={onCopy}
        onEdit={onEdit}
        onDelete={onDelete}
        onForward={onForward}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mediaBubble: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    overflow: "hidden",
  },
  mediaWithText: {
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  deletedText: {
    fontStyle: "italic",
  },
  replyQuote: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 8,
    borderRadius: 4,
    paddingRight: 8,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  replyContent: {
    fontSize: 13,
    lineHeight: 16,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  editedText: {
    fontSize: 11,
    fontStyle: "italic",
  },
  timestamp: {
    fontSize: 11,
  },
});
