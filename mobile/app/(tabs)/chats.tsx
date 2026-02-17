import { useChat } from "@/hooks/useChat";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { Conversation } from "@/services/messaging";
import { Href, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatsScreen() {
  const { conversations, loading } = useChat({ autoLoad: true });
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.group_name || "Group Chat";
    }

    // For 1-on-1, show the other participant's name
    const otherParticipant = conversation.participants?.find(
      (p) => p.user_id !== conversation.participants?.[0]?.user_id,
    );

    return (
      otherParticipant?.profile?.username ||
      otherParticipant?.profile?.full_name ||
      "Unknown User"
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { borderBottomColor: colors.border }]}
      onPress={() => router.push(`/chat/${item.id}` as Href)}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>
          {getConversationName(item).charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, { color: colors.text }]}>
            {getConversationName(item)}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {formatTime(item.last_message_at)}
          </Text>
        </View>

        <Text
          style={[styles.lastMessage, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {item.last_message?.content || "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { padding: spacing.lg }]}>
        <Text style={[styles.title, { color: colors.text }]}>💬 Chats</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No conversations yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Start a new conversation to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
  header: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
