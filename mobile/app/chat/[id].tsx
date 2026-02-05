import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { useTheme } from "@/providers/ThemeProvider";
import { initiateCall } from "@/services/call-signaling";
import {
  getMessages,
  markConversationAsRead,
  Message,
  sendMessage,
  subscribeToConversation,
} from "@/services/messaging";
import { createStreamCall } from "@/services/stream-video";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatRoomScreen() {
  const { id, recipientId } = useLocalSearchParams<{
    id: string;
    recipientId?: string;
  }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!id) return;

    loadMessages();
    markConversationAsRead(id);

    // Subscribe to new messages
    const unsubscribe = subscribeToConversation(id, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  async function loadMessages() {
    if (!id) return;

    try {
      const data = await getMessages(id);
      setMessages(data);
      // Scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(content: string) {
    if (!id || !content.trim()) return;

    try {
      setSending(true);

      // Optimistic UI update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: id,
        sender_id: currentUserId || "",
        content: content.trim(),
        media_url: null,
        media_type: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        is_edited: false,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send to server
      await sendMessage(id, content.trim());

      // Remove temp message (real one will come via subscription)
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")));
    } finally {
      setSending(false);
    }
  }

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

      // Navigate to active call screen
      router.push({
        pathname: "/call/active",
        params: {
          callId: streamCallId,
          callEventId: callEvent.id,
          callType,
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

      <MessageInput onSend={handleSendMessage} disabled={sending} />
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
});
