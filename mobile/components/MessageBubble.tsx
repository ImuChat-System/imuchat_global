import { useColors } from "@/providers/ThemeProvider";
import { Message } from "@/services/messaging";
import { ReactionGroup } from "@/services/reactions";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MediaPreview, MediaViewer } from "./MediaComponents";
import { ReactionBar, ReactionPicker } from "./ReactionPicker";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  /** Réactions groupées pour ce message */
  reactions?: ReactionGroup[];
  /** Callback lors d'un toggle de réaction */
  onReactionToggle?: (emoji: string) => void;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  reactions = [],
  onReactionToggle,
}: MessageBubbleProps) {
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleLongPress = useCallback(() => {
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
          {message.sender.username || message.sender.full_name || "Unknown"}
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

          {/* Texte */}
          {hasText && (
            <Text
              style={[
                styles.messageText,
                { color: isOwnMessage ? "#FFFFFF" : colors.text },
              ]}
            >
              {message.content}
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

      {/* Réactions */}
      {(reactions.length > 0 || onReactionToggle) && (
        <ReactionBar
          reactions={reactions}
          onReactionPress={handleReactionPress}
          onAddPress={() => setShowPicker(true)}
        />
      )}

      {/* Picker de réactions */}
      <ReactionPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleReactionSelect}
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
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
});
