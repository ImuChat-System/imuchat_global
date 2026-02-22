/**
 * SearchScreen - Global search for conversations and messages
 * Displays results organized by type with highlighting
 */

import { SearchBar } from "@/components/search/SearchBar";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  Conversation,
  globalSearch,
  Message,
  SearchResult,
} from "@/services/messaging";
import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// === HELPERS ===

function highlightText(
  text: string,
  query: string,
  highlightColor: string,
): React.ReactNode {
  if (!query || !text) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <Text
        key={i}
        style={{ backgroundColor: highlightColor, fontWeight: "600" }}
      >
        {part}
      </Text>
    ) : (
      <Text key={i}>{part}</Text>
    ),
  );
}

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}j`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

type SearchTab = "all" | "conversations" | "messages";

export default function SearchScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    conversations: [],
    messages: [],
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults({ conversations: [], messages: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await globalSearch(q, {
        conversationLimit: 10,
        messageLimit: 20,
      });
      setResults(data);
    } catch (error) {
      console.error("[SearchScreen] Error:", error);
      setResults({ conversations: [], messages: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const handleConversationPress = (conversation: Conversation) => {
    Keyboard.dismiss();
    router.push(`/chat/${conversation.id}` as Href);
  };

  const handleMessagePress = (message: Message) => {
    Keyboard.dismiss();
    router.push(`/chat/${message.conversation_id}` as Href);
  };

  // === RENDER ITEMS ===

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const name = item.is_group
      ? item.group_name || t("chat.groupChat")
      : item.participants?.[0]?.profile?.username || t("common.unknownUser");

    return (
      <TouchableOpacity
        style={[styles.resultItem, { borderBottomColor: colors.border }]}
        onPress={() => handleConversationPress(item)}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons
            name={item.is_group ? "people" : "person"}
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.resultContent}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {highlightText(name, query, "#FFE082")}
          </Text>
          {item.last_message?.content && (
            <Text
              style={[styles.resultSubtitle, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {item.last_message.content}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const senderName =
      item.sender?.username || item.sender?.display_name || "?";

    return (
      <TouchableOpacity
        style={[styles.resultItem, { borderBottomColor: colors.border }]}
        onPress={() => handleMessagePress(item)}
      >
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Ionicons name="chatbubble" size={18} color="#fff" />
        </View>
        <View style={styles.resultContent}>
          <View style={styles.messageHeader}>
            <Text style={[styles.senderName, { color: colors.text }]}>
              {senderName}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text
            style={[styles.messageContent, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {highlightText(item.content || "", query, "#FFE082")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // === FILTERED RESULTS ===

  const filteredConversations =
    activeTab === "messages" ? [] : results.conversations;
  const filteredMessages =
    activeTab === "conversations" ? [] : results.messages;

  const hasResults =
    filteredConversations.length > 0 || filteredMessages.length > 0;
  const hasQuery = query.trim().length > 0;

  // === RENDER ===

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("search.title"),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { padding: spacing.md }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t("search.placeholder")}
          isLoading={isLoading}
          autoFocus
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { paddingHorizontal: spacing.md }]}>
        {(["all", "conversations", "messages"] as SearchTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                backgroundColor: colors.primary,
                borderRadius: spacing.sm,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? "#fff" : colors.textMuted,
                },
              ]}
            >
              {t(`search.tab.${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {!hasQuery ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("search.startTyping")}
          </Text>
        </View>
      ) : !hasResults && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("search.noResults")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...filteredConversations.map((c) => ({
              type: "conv" as const,
              data: c,
            })),
            ...filteredMessages.map((m) => ({ type: "msg" as const, data: m })),
          ]}
          keyExtractor={(item, index) =>
            item.type === "conv"
              ? `conv-${item.data.id}`
              : `msg-${item.data.id}-${index}`
          }
          renderItem={({ item }) =>
            item.type === "conv"
              ? renderConversationItem({ item: item.data })
              : renderMessageItem({ item: item.data })
          }
          ListHeaderComponent={
            filteredConversations.length > 0 && activeTab !== "messages" ? (
              <Text
                style={[
                  styles.sectionHeader,
                  { color: colors.textMuted, paddingHorizontal: spacing.md },
                ]}
              >
                {t("search.conversations")} ({filteredConversations.length})
              </Text>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {},
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  senderName: {
    fontSize: 15,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
  },
  messageContent: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingVertical: 8,
  },
});
