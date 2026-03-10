import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Message } from "@/services/messaging";
import { ReactionGroup } from "@/services/reactions";
import {
  hasMarkdown,
  parseMarkdown,
  type TextSegment,
} from "@/utils/markdown-parser";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MessageContextMenu } from "./chat/MessageContextMenu";
import { MediaPreview, MediaViewer } from "./MediaComponents";
import { ReactionBar, ReactionPicker } from "./ReactionPicker";

/** Translation data for a message (from useMessageTranslation hook) */
export interface MessageTranslationData {
  translatedText: string;
  detectedLanguage: string;
  detectedLanguageName: string;
}

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
  /** Callback for translate action */
  onTranslate?: (messageId: string, messageText: string) => void;
  /** Translation data (if translated) */
  translation?: MessageTranslationData | null;
  /** Whether translation is in progress */
  isTranslating?: boolean;
  /** Read receipt status for own messages */
  isRead?: boolean;
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
  onTranslate,
  translation,
  isTranslating = false,
  isRead,
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

  // Parse markdown segments (memoized)
  const markdownSegments = useMemo<TextSegment[] | null>(() => {
    if (!hasText || isDeleted) return null;
    if (!hasMarkdown(message.content!)) return null;
    return parseMarkdown(message.content!);
  }, [message.content, hasText, isDeleted]);

  /** Renders message content with Markdown formatting */
  const renderContent = () => {
    // Both chat bubbles are pastel — always use dark text
    const textColor = "#1a1a2e";
    const codeColor = "rgba(26,26,46,0.85)";
    const codeBg = isOwnMessage ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.04)";
    const linkColor = isOwnMessage ? "#3E2C63" : colors.primary;

    if (!markdownSegments) {
      // Plain text — no markdown
      return (
        <Text style={[styles.messageText, { color: textColor }]}>
          {message.content}
        </Text>
      );
    }

    return (
      <Text style={[styles.messageText, { color: textColor }]}>
        {markdownSegments.map((seg, i) => {
          switch (seg.type) {
            case "bold":
              return (
                <Text key={i} style={{ fontWeight: "700" }}>
                  {seg.content}
                </Text>
              );
            case "italic":
              return (
                <Text key={i} style={{ fontStyle: "italic" }}>
                  {seg.content}
                </Text>
              );
            case "code":
              return (
                <Text
                  key={i}
                  style={{
                    fontFamily: "monospace",
                    backgroundColor: codeBg,
                    color: codeColor,
                    paddingHorizontal: 4,
                    borderRadius: 3,
                    fontSize: 14,
                  }}
                >
                  {seg.content}
                </Text>
              );
            case "strikethrough":
              return (
                <Text key={i} style={{ textDecorationLine: "line-through" }}>
                  {seg.content}
                </Text>
              );
            case "link":
              return (
                <Text
                  key={i}
                  style={{ color: linkColor, textDecorationLine: "underline" }}
                  onPress={() => seg.url && Linking.openURL(seg.url)}
                >
                  {seg.content}
                </Text>
              );
            default:
              return <Text key={i}>{seg.content}</Text>;
          }
        })}
      </Text>
    );
  };

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
            message.sender.display_name ||
            t("common.unknown")}
        </Text>
      )}

      <Pressable onLongPress={handleLongPress} delayLongPress={300}>
        <View
          style={[
            styles.bubble,
            isOwnMessage
              ? { backgroundColor: colors.chatSent }
              : { backgroundColor: colors.chatReceived },
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
                    ? "rgba(0,0,0,0.06)"
                    : colors.background,
                  borderLeftColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.replyAuthor,
                  {
                    color: colors.primary,
                  },
                ]}
                numberOfLines={1}
              >
                {message.replied_message.sender?.username ||
                  message.replied_message.sender?.display_name ||
                  t("common.unknownUser")}
              </Text>
              <Text
                style={[
                  styles.replyContent,
                  {
                    color: isOwnMessage
                      ? "rgba(26,26,46,0.6)"
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
                  color: isOwnMessage ? "rgba(26,26,46,0.5)" : colors.textMuted,
                },
              ]}
            >
              {t("chat.messageDeleted")}
            </Text>
          ) : hasText ? (
            renderContent()
          ) : null}

          {/* Translation display */}
          {!isDeleted && translation && (
            <View
              style={[
                styles.translationContainer,
                {
                  borderTopColor: isOwnMessage
                    ? "rgba(0,0,0,0.1)"
                    : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: isOwnMessage ? "#1a1a2e" : colors.text,
                  },
                ]}
              >
                {translation.translatedText}
              </Text>
              <Text
                style={[
                  styles.translatedIndicator,
                  {
                    color: isOwnMessage
                      ? "rgba(26,26,46,0.5)"
                      : colors.textMuted,
                  },
                ]}
              >
                {t("chat.translatedFrom", {
                  language: translation.detectedLanguageName,
                })}
              </Text>
            </View>
          )}

          {/* Translation loading indicator */}
          {!isDeleted && isTranslating && !translation && (
            <View style={styles.translationLoading}>
              <ActivityIndicator
                size="small"
                color={isOwnMessage ? "rgba(26,26,46,0.6)" : colors.primary}
              />
              <Text
                style={[
                  styles.translatingText,
                  {
                    color: isOwnMessage
                      ? "rgba(26,26,46,0.5)"
                      : colors.textMuted,
                  },
                ]}
              >
                {t("chat.translating")}
              </Text>
            </View>
          )}

          {/* Timestamp + edited indicator + read receipt */}
          <View style={styles.timestampRow}>
            {isEdited && !isDeleted && (
              <Text
                style={[
                  styles.editedText,
                  {
                    color: isOwnMessage
                      ? "rgba(26,26,46,0.5)"
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
                  color: isOwnMessage ? "rgba(26,26,46,0.6)" : colors.textMuted,
                },
              ]}
            >
              {formatTime(message.created_at)}
            </Text>
            {/* Read receipt indicator for own messages */}
            {isOwnMessage && !isDeleted && (
              <Text
                style={[
                  styles.readReceipt,
                  {
                    color: isRead ? "rgba(26,26,46,0.8)" : "rgba(26,26,46,0.4)",
                  },
                ]}
              >
                {isRead ? " ✓✓" : " ✓"}
              </Text>
            )}
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
        onTranslate={onTranslate}
        isTranslated={!!translation}
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
  readReceipt: {
    fontSize: 11,
    fontWeight: "600",
  },
  translationContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingTop: 8,
  },
  translatedIndicator: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 4,
  },
  translationLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  translatingText: {
    fontSize: 11,
    fontStyle: "italic",
  },
});
