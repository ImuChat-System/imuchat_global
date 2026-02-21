import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import ConversationPickerModal from "@/components/chat/ConversationPickerModal";
import { useChat } from "@/hooks/useChat";
import { useReactions } from "@/hooks/useReactions";
import { useTheme } from "@/providers/ThemeProvider";
import { initiateCall } from "@/services/call-signaling";
import {
  deleteMessage,
  editMessage,
  forwardMessage,
} from "@/services/messaging";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatRoomScreen() {
  const { id, recipientId } = useLocalSearchParams<{
    id: string;
    recipientId?: string;
  }>();
  const {
    messages,
    loading,
    sending,
    currentUserId,
    typingUsers,
    sendMessage: handleSendMessage,
    sendTypingIndicator,
    isMessageRead,
  } = useChat({ conversationId: id, autoLoad: true });

  // Extraire les IDs des messages pour les réactions
  const messageIds = useMemo(() => messages.map((m) => m.id), [messages]);

  // Hook pour les réactions
  const { reactionsByMessage, toggle: toggleReaction } = useReactions({
    conversationId: id || "",
    messageIds,
  });

  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [initiatingCall, setInitiatingCall] = useState(false);

  // Forward message state
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [messageToForward, setMessageToForward] = useState<{
    id: string;
    text: string;
  } | null>(null);

  // Edit message state
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    text: string;
  } | null>(null);

  // Reply message state
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    text: string;
    senderName: string;
  } | null>(null);

  // Handle reply action
  const handleReply = useCallback(
    (messageId: string, messageText: string, senderName: string) => {
      setReplyingTo({ id: messageId, text: messageText, senderName });
    },
    [],
  );

  // Cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Handle copy action
  const handleCopy = useCallback(
    async (messageText: string) => {
      await Clipboard.setStringAsync(messageText);
      Alert.alert(
        t("common.success"),
        t("chat.messageCopied") || "Message copied",
      );
    },
    [t],
  );

  // Handle edit action - enter edit mode
  const handleEdit = useCallback((messageId: string, messageText: string) => {
    setEditingMessage({ id: messageId, text: messageText });
  }, []);

  // Cancel edit mode
  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  // Confirm edit with new text
  const handleConfirmEdit = useCallback(
    async (newText: string) => {
      if (!editingMessage) return;

      try {
        await editMessage(editingMessage.id, newText);
        setEditingMessage(null);
      } catch (error) {
        console.error("Error editing message:", error);
        Alert.alert(t("common.error"), t("common.genericError"));
      }
    },
    [editingMessage, t],
  );

  // Handle delete action
  const handleDelete = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
        Alert.alert(t("common.error"), t("common.genericError"));
      }
    },
    [t],
  );

  // Handle forward action from MessageBubble
  const handleForward = useCallback(
    (messageId: string, messageText: string) => {
      setMessageToForward({ id: messageId, text: messageText });
      setForwardModalVisible(true);
    },
    [],
  );

  // Confirm forward to selected conversation
  const handleForwardConfirm = useCallback(
    async (targetConversation: { id: string }) => {
      if (!messageToForward) return;

      try {
        await forwardMessage(
          targetConversation.id,
          messageToForward.text,
          messageToForward.id,
        );
        setForwardModalVisible(false);
        setMessageToForward(null);
        Alert.alert(t("common.success"), t("chat.messageForwarded"));
      } catch (error) {
        console.error("Error forwarding message:", error);
        Alert.alert(t("common.error"), t("common.genericError"));
      }
    },
    [messageToForward, t],
  );

  // Callback pour toggle une réaction sur un message
  const handleReactionToggle = useCallback(
    (messageId: string) => (emoji: string) => {
      toggleReaction(messageId, emoji);
    },
    [toggleReaction],
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  async function handleInitiateCall(callType: "audio" | "video") {
    if (!recipientId) {
      console.error("No recipient ID for call");
      return;
    }

    if (initiatingCall) return;
    setInitiatingCall(true);

    try {
      // Dynamically load Stream Video to avoid crash in Expo Go
      const streamVideo = await import("@/services/stream-video").catch((e) => {
        console.error("Stream Video not available:", e);
        return null;
      });

      if (!streamVideo) {
        Alert.alert(
          "Appels non disponibles",
          "Les appels vidéo nécessitent un build de développement. Expo Go n'est pas supporté.",
        );
        setInitiatingCall(false);
        return;
      }

      // Generate unique call ID
      const streamCallId = `call-${Date.now()}`;

      // Create Stream call
      await streamVideo.createStreamCall(streamCallId, callType);

      // Create call event in Supabase
      const callEvent = await initiateCall(recipientId, callType, streamCallId);

      // Navigate to outgoing call screen (showing "Calling...")
      router.push({
        pathname: "/call/outgoing",
        params: {
          callId: streamCallId,
          callEventId: callEvent.id,
          callType,
          calleeId: recipientId,
          calleeName: "User", // TODO: Get from conversation
          calleeAvatar: undefined, // TODO: Get from conversation
        },
      } as any);
    } catch (error) {
      console.error("Error initiating call:", error);
      Alert.alert("Erreur", "Impossible d'initier l'appel");
    } finally {
      setInitiatingCall(false);
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Stack.Screen options={{ title: "Chat" }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      testID="chat-room-container"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: "Chat",
          headerRight: () => (
            <View
              testID="channel-header"
              style={{ flexDirection: "row", gap: 16, marginRight: 8 }}
            >
              <TouchableOpacity
                testID="call-button"
                onPress={() => handleInitiateCall("audio")}
              >
                <Ionicons name="call" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                testID="video-call-button"
                onPress={() => handleInitiateCall("video")}
              >
                <Ionicons
                  name="videocam"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <FlatList
        testID="message-list"
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.sender_id === currentUserId}
            reactions={reactionsByMessage[item.id] || []}
            onReactionToggle={handleReactionToggle(item.id)}
            onForward={handleForward}
            onReply={(messageId, text) =>
              handleReply(messageId, text, item.sender?.username || "User")
            }
            onCopy={handleCopy}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isRead={isMessageRead(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <View
          testID="typing-indicator-container"
          style={styles.typingContainer}
        >
          <Text style={[styles.typingText, { color: theme.colors.textMuted }]}>
            Someone is typing...
          </Text>
        </View>
      )}

      <MessageInput
        onSend={(message, mediaUrl, mediaType) =>
          handleSendMessage(message, mediaUrl, mediaType)
        }
        onTyping={sendTypingIndicator}
        disabled={sending}
      />

      {/* Forward message modal */}
      <ConversationPickerModal
        visible={forwardModalVisible}
        onClose={() => {
          setForwardModalVisible(false);
          setMessageToForward(null);
        }}
        onSelect={handleForwardConfirm}
        excludeConversationId={id}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingVertical: 16,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
