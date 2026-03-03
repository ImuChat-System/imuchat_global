import MessageBubble from "@/components/MessageBubble";
import MessageInput, { MessageInputHandle } from "@/components/MessageInput";
import { BotCommandSuggestions } from "@/components/chat/BotCommandSuggestions";
import ConversationPickerModal from "@/components/chat/ConversationPickerModal";
import { useBots } from "@/hooks/useBots";
import { useChat } from "@/hooks/useChat";
import { useReactions } from "@/hooks/useReactions";
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
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
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
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
    loadMessages,
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
  const messageInputRef = useRef<MessageInputHandle>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [initiatingCall, setInitiatingCall] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Bots de groupe (DEV-025) ───────────────────────────────
  const {
    availableCommands,
    handleMessage: handleBotMessage,
    isCommand,
  } = useBots(id);

  const [inputText, setInputText] = useState("");
  const showCommandSuggestions =
    inputText.startsWith("/") && availableCommands.length > 0;

  /** Intercepte les commandes bot avant l'envoi normal */
  const handleSendWithBots = useCallback(
    async (message: string, mediaUrl?: string, mediaType?: string) => {
      if (isCommand(message) && currentUserId) {
        // Envoyer la commande dans le chat pour la visibilité
        handleSendMessage(message, mediaUrl, mediaType);
        // Exécuter le bot
        const result = await handleBotMessage(message, currentUserId, "User");
        if (result) {
          if (result.success && result.response) {
            // Le bot a répondu — afficher via toast ou message système
            showToast(`🤖 ${result.response}`, "info");
          } else if (result.error) {
            showToast(`⚠️ ${result.error}`, "warning");
          }
        }
      } else {
        handleSendMessage(message, mediaUrl, mediaType);
      }
      setInputText("");
    },
    [isCommand, currentUserId, handleSendMessage, handleBotMessage, showToast],
  );

  /** Quand l'utilisateur sélectionne une commande dans les suggestions */
  const handleCommandSelect = useCallback((command: string) => {
    messageInputRef.current?.setText(command);
    messageInputRef.current?.focus();
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMessages?.();
    } finally {
      setRefreshing(false);
    }
  }, [loadMessages]);

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
      showToast(t("chat.messageCopied") || "Message copied", "success");
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
        showToast(t("common.genericError"), "error");
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
        showToast(t("common.genericError"), "error");
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
        showToast(t("chat.messageForwarded"), "success");
      } catch (error) {
        console.error("Error forwarding message:", error);
        showToast(t("common.genericError"), "error");
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
      // Use safe calls module (handles Expo Go gracefully)
      const callsSafe = await import("@/services/calls-safe").catch((e) => {
        console.error("Calls service not available:", e);
        return null;
      });

      if (!callsSafe) {
        showToast(
          "Les appels vidéo nécessitent un build de développement. Expo Go n'est pas supporté.",
          "warning",
        );
        setInitiatingCall(false);
        return;
      }

      // Ensure Stream client is initialized with real backend token
      const client = await callsSafe.safeEnsureStreamClient({
        id: currentUserId || "",
        name: undefined,
        image: undefined,
      });

      if (!client) {
        showToast(
          "Impossible d'initialiser le service d'appels. Vérifiez votre connexion.",
          "warning",
        );
        setInitiatingCall(false);
        return;
      }

      // Generate unique call ID and create the Stream call
      const streamCallId = await callsSafe.safeGenerateCallId();
      const streamCallType = callType === "video" ? "default" : "audio";
      await callsSafe.safeCreateCall(
        streamCallId,
        streamCallType as "audio" | "default",
        [currentUserId || "", recipientId],
      );

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
      showToast("Impossible d'initier l'appel", "error");
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
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

      {/* Bot command suggestions overlay */}
      <BotCommandSuggestions
        inputText={inputText}
        commands={availableCommands}
        onSelect={handleCommandSelect}
        visible={showCommandSuggestions}
      />

      <MessageInput
        ref={messageInputRef}
        onSend={handleSendWithBots}
        onTyping={sendTypingIndicator}
        onTextChange={setInputText}
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
