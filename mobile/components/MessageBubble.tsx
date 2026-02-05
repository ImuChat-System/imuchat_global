import { useColors } from "@/providers/ThemeProvider";
import { Message } from "@/services/messaging";
import { StyleSheet, Text, View } from "react-native";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage,
}: MessageBubbleProps) {
  const colors = useColors();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
          {message.sender.username || message.sender.full_name || "Unknown"}
        </Text>
      )}

      <View
        style={[
          styles.bubble,
          isOwnMessage
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.surface },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isOwnMessage ? "#FFFFFF" : colors.text },
          ]}
        >
          {message.content}
        </Text>

        <Text
          style={[
            styles.timestamp,
            {
              color: isOwnMessage ? "rgba(255,255,255,0.7)" : colors.textMuted,
            },
          ]}
        >
          {formatTime(message.created_at)}
        </Text>
      </View>
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
