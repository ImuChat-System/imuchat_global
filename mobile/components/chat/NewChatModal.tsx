/**
 * NewChatModal Component
 * Modal to select contacts and create a new conversation
 */

import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { createConversation } from "@/services/messaging";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Friend {
  id: string;
  user_id: string;
  contact_id: string;
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface NewChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NewChatModal({ visible, onClose }: NewChatModalProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const colors = useColors();
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load friends list
  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("contacts")
        .select(
          `
          id,
          user_id,
          contact_id,
          profile:profiles!contacts_contact_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `,
        )
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (error) throw error;

      // Transform data - profile comes as array from Supabase join
      const transformedFriends = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        contact_id: item.contact_id,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile,
      }));

      setFriends(transformedFriends);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (visible) {
      loadFriends();
      setSelectedIds([]);
      setSearchQuery("");
    }
  }, [visible, loadFriends]);

  // Filter friends by search query
  const filteredFriends = friends.filter((friend) => {
    const name = friend.profile?.display_name || friend.profile?.username || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Toggle selection
  const toggleSelection = (contactId: string) => {
    setSelectedIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  };

  // Create conversation
  const handleCreate = async () => {
    if (selectedIds.length === 0) return;
    setCreating(true);

    try {
      const isGroup = selectedIds.length > 1;
      const conversation = await createConversation(
        selectedIds,
        isGroup,
        isGroup ? t("chat.newGroupChat") : undefined,
      );

      onClose();
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setCreating(false);
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => {
    const isSelected = selectedIds.includes(item.contact_id);
    const name =
      item.profile?.display_name || item.profile?.username || t("common.user");

    return (
      <TouchableOpacity
        style={[
          styles.friendItem,
          { borderBottomColor: colors.border },
          isSelected && { backgroundColor: colors.surfaceActive },
        ]}
        onPress={() => toggleSelection(item.contact_id)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: colors.text }]}>
            {name}
          </Text>
          {item.profile?.username && (
            <Text style={[styles.friendUsername, { color: colors.textMuted }]}>
              @{item.profile.username}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.checkbox,
            {
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: isSelected ? colors.primary : "transparent",
            },
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>
            {t("chat.newChat")}
          </Text>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={selectedIds.length === 0 || creating}
            style={[
              styles.createButton,
              {
                backgroundColor:
                  selectedIds.length > 0 ? colors.primary : colors.border,
              },
            ]}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>
                {selectedIds.length > 1
                  ? t("chat.createGroup")
                  : t("common.create")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("common.search")}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selected count */}
        {selectedIds.length > 0 && (
          <View
            style={[styles.selectedBanner, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.selectedText, { color: colors.text }]}>
              {t("chat.selectedContacts", { count: selectedIds.length })}
            </Text>
          </View>
        )}

        {/* Friends list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredFriends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {searchQuery ? t("contacts.noResults") : t("contacts.noFriends")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredFriends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  selectedBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
  },
  friendUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NewChatModal;
