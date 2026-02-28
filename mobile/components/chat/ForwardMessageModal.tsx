/**
 * ForwardMessageModal - Mobile
 * Modal to select conversation for forwarding a message
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Conversation, getConversations } from "@/services/messaging";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

export interface ForwardMessageModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Close the modal */
  onClose: () => void;
  /** Message content to forward */
  messageText: string;
  /** Message ID being forwarded */
  messageId: string;
  /** Callback when forward is confirmed */
  onForward: (
    targetConversationId: string,
    messageText: string,
    originalMessageId: string,
  ) => Promise<void>;
}

export function ForwardMessageModal({
  visible,
  onClose,
  messageText,
  messageId,
  onForward,
}: ForwardMessageModalProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load conversations when modal opens
  useEffect(() => {
    if (visible) {
      loadConversations();
    } else {
      setSearch("");
      setSelectedId(null);
    }
  }, [visible]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error("[ForwardModal] Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((conv) => {
      const name = conv.is_group
        ? conv.group_name
        : conv.participants?.[0]?.profile?.username;
      return name?.toLowerCase().includes(q);
    });
  }, [conversations, search]);

  const getConversationName = (conv: Conversation) => {
    if (conv.is_group) {
      return conv.group_name || t("chat.groupChat");
    }
    return (
      conv.participants?.[0]?.profile?.username ||
      conv.participants?.[0]?.profile?.display_name ||
      t("common.unknownUser")
    );
  };

  const handleForward = useCallback(async () => {
    if (!selectedId) return;

    setForwarding(true);
    try {
      await onForward(selectedId, messageText, messageId);
      onClose();
    } catch (err) {
      console.error("[ForwardModal] Forward failed:", err);
    } finally {
      setForwarding(false);
    }
  }, [selectedId, messageText, messageId, onForward, onClose]);

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isSelected = item.id === selectedId;
    const name = getConversationName(item);

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: isSelected ? colors.primary + "20" : "transparent",
            borderColor: isSelected ? colors.primary : "transparent",
          },
        ]}
        onPress={() => setSelectedId(isSelected ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons
            name={item.is_group ? "people" : "person"}
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.conversationInfo}>
          <Text
            style={[styles.conversationName, { color: colors.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          {item.last_message?.content && (
            <Text
              style={[styles.lastMessage, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {item.last_message.content}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.backdropFill, { backgroundColor: colors.overlayDark }]}
        />
      </Pressable>

      {/* Modal Content */}
      <View style={styles.modalContainer} pointerEvents="box-none">
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.springify().damping(20)}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: spacing.lg,
              borderTopRightRadius: spacing.lg,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
            <Ionicons name="arrow-redo" size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {t("chat.forwardMessage")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Message preview */}
          <View
            style={[
              styles.previewContainer,
              {
                backgroundColor: colors.surfaceActive,
                marginHorizontal: spacing.md,
                padding: spacing.sm,
                borderRadius: spacing.sm,
              },
            ]}
          >
            <Text
              style={[styles.previewText, { color: colors.textMuted }]}
              numberOfLines={2}
            >
              « {messageText} »
            </Text>
          </View>

          {/* Search */}
          <View
            style={[styles.searchContainer, { paddingHorizontal: spacing.md }]}
          >
            <View
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.surfaceActive,
                  borderRadius: spacing.sm,
                },
              ]}
            >
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchText, { color: colors.text }]}
                placeholder={t("search.placeholder")}
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Conversations list */}
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredConversations.length === 0 ? (
              <View style={styles.centerContent}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {t("chat.noConversations")}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversationItem}
                contentContainerStyle={{ paddingHorizontal: spacing.md }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Footer with forward button */}
          <View
            style={[
              styles.footer,
              {
                paddingHorizontal: spacing.md,
                paddingBottom: spacing.xl,
                borderTopColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.forwardButton,
                {
                  backgroundColor: selectedId
                    ? colors.primary
                    : colors.surfaceActive,
                  borderRadius: spacing.md,
                },
              ]}
              onPress={handleForward}
              disabled={!selectedId || forwarding}
            >
              {forwarding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="arrow-redo"
                    size={20}
                    color={selectedId ? "#fff" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.forwardButtonText,
                      { color: selectedId ? "#fff" : colors.textMuted },
                    ]}
                  >
                    {t("chat.forward")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "80%",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  previewContainer: {
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  searchContainer: {
    paddingVertical: 8,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
  },
  listContainer: {
    flex: 1,
    minHeight: 200,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  lastMessage: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  forwardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  forwardButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ForwardMessageModal;
