import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/providers/ThemeProvider";
import { initiateCall } from "@/services/call-signaling";
import { createStreamCall } from "@/services/stream-video";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
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
  } = useChat({ conversationId: id, autoLoad: true });
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const router = useRouter();

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

    try {
      // Generate unique call ID
      const streamCallId = `call-${Date.now()}`;

      // Create Stream call
      await createStreamCall(streamCallId, callType);

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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: "Chat",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 16, marginRight: 8 }}>
              <TouchableOpacity onPress={() => handleInitiateCall("audio")}>
                <Ionicons name="call" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleInitiateCall("video")}>
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
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.sender_id === currentUserId}
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
        <View style={styles.typingContainer}>
          <Text style={[styles.typingText, { color: theme.colors.textMuted }]}>
            Someone is typing...
          </Text>
        </View>
      )}

      <MessageInput
        onSend={handleSendMessage}
        onTyping={sendTypingIndicator}
        disabled={sending}
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
