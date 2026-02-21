import { SwipeableConversationItem } from "@/components/chat/SwipeableConversationItem";
import { useChat } from "@/hooks/useChat";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  archiveConversation,
  deleteConversation,
  muteConversation,
  type Conversation,
} from "@/services/messaging";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function ChatsScreen() {
  const { conversations, loading, refresh } = useChat({ autoLoad: true });
  const { t } = useI18n();
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();
  const [mutedConversations, setMutedConversations] = useState<Set<string>>(
    new Set(),
  );

  const handleSearchPress = () => {
    router.push("/search" as Href);
  };

  // Swipe action handlers
  const handleArchive = useCallback(
    async (conversationId: string) => {
      try {
        await archiveConversation(conversationId);
        refresh?.();
        Alert.alert(t("common.success"), t("chat.conversationArchived"));
      } catch (error) {
        console.error("Archive error:", error);
        Alert.alert(t("common.error"), t("common.genericError"));
      }
    },
    [refresh, t],
  );

  const handleMute = useCallback(
    async (conversationId: string) => {
      const isMuted = mutedConversations.has(conversationId);
      try {
        await muteConversation(conversationId, !isMuted);
        setMutedConversations((prev) => {
          const next = new Set(prev);
          if (isMuted) {
            next.delete(conversationId);
          } else {
            next.add(conversationId);
          }
          return next;
        });
      } catch (error) {
        console.error("Mute error:", error);
        Alert.alert(t("common.error"), t("common.genericError"));
      }
    },
    [mutedConversations, t],
  );

  const handleDelete = useCallback(
    (conversationId: string, conversationName: string) => {
      Alert.alert(
        t("chat.deleteConversation"),
        t("chat.deleteConversationConfirm", { name: conversationName }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: async () => {
              try {
                await deleteConversation(conversationId);
                refresh?.();
              } catch (error) {
                console.error("Delete error:", error);
                Alert.alert(t("common.error"), t("common.genericError"));
              }
            },
          },
        ],
      );
    },
    [refresh, t],
  );

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
      return t("common.yesterday");
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.group_name || t("chat.groupChat");
    }

    // For 1-on-1, show the other participant's name
    const otherParticipant = conversation.participants?.find(
      (p) => p.user_id !== conversation.participants?.[0]?.user_id,
    );

    return (
      otherParticipant?.profile?.username ||
      otherParticipant?.profile?.full_name ||
      t("common.unknownUser")
    );
  };

  const renderConversation = ({
    item,
    index,
  }: {
    item: Conversation;
    index: number;
  }) => {
    const conversationName = getConversationName(item);
    const isMuted = mutedConversations.has(item.id);

    return (
      <SwipeableConversationItem
        onArchive={() => handleArchive(item.id)}
        onMute={() => handleMute(item.id)}
        onDelete={() => handleDelete(item.id, conversationName)}
        isMuted={isMuted}
      >
        <TouchableOpacity
          testID={`conversation-item-${index}`}
          style={[styles.conversationItem, { borderBottomColor: colors.border }]}
          onPress={() => router.push(`/chat/${item.id}` as Href)}
        >
          <View
            testID={`conversation-avatar-${index}`}
            style={[styles.avatar, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {conversationName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <View style={styles.nameContainer}>
                <Text
                  testID={`conversation-name-${index}`}
                  style={[styles.conversationName, { color: colors.text }]}
                >
                  {conversationName}
                </Text>
                {isMuted && (
                  <Ionicons
                    name="notifications-off"
                    size={14}
                    color={colors.textMuted}
                    style={styles.mutedIcon}
                  />
                )}
              </View>
              <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                {formatTime(item.last_message_at)}
              </Text>
            </View>

            <Text
              testID={`conversation-last-message-${index}`}
              style={[styles.lastMessage, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {item.last_message?.content || t("chat.noMessagesYet")}
            </Text>
          </View>
        </TouchableOpacity>
      </SwipeableConversationItem>
    );
  };

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { padding: spacing.lg }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("chat.title")}
          </Text>
          <TouchableOpacity
            onPress={handleSearchPress}
            style={styles.searchButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("chat.noConversations")}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              {t("chat.noConversationsSubtext")}
            </Text>
          </View>
        ) : (
          <FlatList
            testID="conversations-list"
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </GestureHandlerRootView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  searchButton: {
    padding: 8,
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
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mutedIcon: {
    marginLeft: 6,
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
