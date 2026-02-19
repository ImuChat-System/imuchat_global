import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// === TYPES ===

interface UserSearchResult {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: string | null;
  is_online: boolean;
}

interface Friend {
  id: string;
  user_id: string;
  contact_id: string;
  status: string;
  created_at: string;
  profile: UserSearchResult;
}

interface FriendRequest {
  id: string;
  user_id: string;
  contact_id: string;
  status: string;
  created_at: string;
  sender_profile: UserSearchResult;
  receiver_profile: UserSearchResult;
}

type TabType = "friends" | "requests" | "search";

// === COMPONENT ===

export default function ContactsScreen() {
  const { user } = useAuth();
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // === DATA LOADING ===

  const loadContacts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Amis (sent direction)
      const { data: sentContacts } = await supabase
        .from("contacts")
        .select(
          `
          id, user_id, contact_id, status, created_at,
          profile:profiles!contacts_contact_id_fkey(id, username, display_name, avatar_url, bio, status, is_online)
        `,
        )
        .eq("user_id", userId)
        .eq("status", "accepted");

      // Amis (received direction)
      const { data: receivedContacts } = await supabase
        .from("contacts")
        .select(
          `
          id, user_id, contact_id, status, created_at,
          profile:profiles!contacts_user_id_fkey(id, username, display_name, avatar_url, bio, status, is_online)
        `,
        )
        .eq("contact_id", userId)
        .eq("status", "accepted");

      setFriends([
        ...(sentContacts || []).map((c: any) => ({
          ...c,
          profile: c.profile || {},
        })),
        ...(receivedContacts || []).map((c: any) => ({
          ...c,
          profile: c.profile || {},
        })),
      ]);

      // Demandes reçues
      const { data: pending } = await supabase
        .from("contacts")
        .select(
          `
          id, user_id, contact_id, status, created_at,
          sender_profile:profiles!contacts_user_id_fkey(id, username, display_name, avatar_url, bio, status, is_online),
          receiver_profile:profiles!contacts_contact_id_fkey(id, username, display_name, avatar_url, bio, status, is_online)
        `,
        )
        .eq("contact_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setPendingRequests((pending || []) as any);

      // Demandes envoyées
      const { data: sent } = await supabase
        .from("contacts")
        .select(
          `
          id, user_id, contact_id, status, created_at,
          sender_profile:profiles!contacts_user_id_fkey(id, username, display_name, avatar_url, bio, status, is_online),
          receiver_profile:profiles!contacts_contact_id_fkey(id, username, display_name, avatar_url, bio, status, is_online)
        `,
        )
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setSentRequests((sent || []) as any);
    } catch (err) {
      console.error("[Contacts] Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // === ACTIONS ===

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearchLoading(true);
    try {
      const searchTerm = `%${searchQuery.trim()}%`;
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, bio, status, is_online",
        )
        .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
        .limit(20);

      setSearchResults((data || []).filter((u: any) => u.id !== userId));
    } catch (err) {
      Alert.alert("Erreur", "La recherche a échoué");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .insert({ contact_id: contactId, status: "pending" });

      if (error) throw error;
      Alert.alert("Succès", "Demande envoyée !");
      loadContacts();
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible d'envoyer la demande");
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await supabase
        .from("contacts")
        .update({ status: "accepted" })
        .eq("id", requestId);
      loadContacts();
    } catch {
      Alert.alert("Erreur", "Impossible d'accepter la demande");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await supabase.from("contacts").delete().eq("id", requestId);
      loadContacts();
    } catch {
      Alert.alert("Erreur", "Impossible de rejeter la demande");
    }
  };

  const handleRemoveFriend = async (contactId: string) => {
    Alert.alert("Supprimer cet ami ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase
              .from("contacts")
              .delete()
              .eq("user_id", userId!)
              .eq("contact_id", contactId);
            await supabase
              .from("contacts")
              .delete()
              .eq("user_id", contactId)
              .eq("contact_id", userId!);
            loadContacts();
          } catch {
            Alert.alert("Erreur", "Impossible de supprimer l'ami");
          }
        },
      },
    ]);
  };

  // === HELPERS ===

  const getInitials = (name: string | null, username: string | null) => {
    const display = name || username || "?";
    return display.charAt(0).toUpperCase();
  };

  // === RENDER ITEMS ===

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getInitials(item.profile.display_name, item.profile.username)}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.name}>
          {item.profile.display_name || item.profile.username || "Utilisateur"}
        </Text>
        {item.profile.username && (
          <Text style={styles.username}>@{item.profile.username}</Text>
        )}
        <View
          style={[
            styles.statusBadge,
            item.profile.is_online ? styles.online : styles.offline,
          ]}
        >
          <Text style={styles.statusText}>
            {item.profile.is_online ? "En ligne" : "Hors ligne"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveFriend(item.contact_id)}
      >
        <Text style={styles.removeBtnText}>Retirer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPendingRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getInitials(
            item.sender_profile.display_name,
            item.sender_profile.username,
          )}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.name}>
          {item.sender_profile.display_name ||
            item.sender_profile.username ||
            "Utilisateur"}
        </Text>
        {item.sender_profile.username && (
          <Text style={styles.username}>@{item.sender_profile.username}</Text>
        )}
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleAccept(item.id)}
        >
          <Text style={styles.acceptBtnText}>Accepter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.rejectBtnText}>Refuser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getInitials(
            item.receiver_profile.display_name,
            item.receiver_profile.username,
          )}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.name}>
          {item.receiver_profile.display_name ||
            item.receiver_profile.username ||
            "Utilisateur"}
        </Text>
        <Text style={styles.pendingLabel}>En attente...</Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleReject(item.id)}
      >
        <Text style={styles.removeBtnText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: UserSearchResult }) => {
    const isFriend = friends.some((f) => f.profile.id === item.id);
    const isPending = sentRequests.some((r) => r.contact_id === item.id);

    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(item.display_name, item.username)}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name}>
            {item.display_name || item.username || "Utilisateur"}
          </Text>
          {item.username && (
            <Text style={styles.username}>@{item.username}</Text>
          )}
        </View>
        {isFriend ? (
          <View style={[styles.statusBadge, styles.online]}>
            <Text style={styles.statusText}>Ami</Text>
          </View>
        ) : isPending ? (
          <View style={[styles.statusBadge, styles.offline]}>
            <Text style={styles.statusText}>Envoyé</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleSendRequest(item.id)}
          >
            <Text style={styles.acceptBtnText}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // === TABS ===

  const renderTab = (tab: TabType, label: string, count?: number) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
        {count !== undefined && count > 0 ? ` (${count})` : ""}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Contacts</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {renderTab("friends", "Amis", friends.length)}
        {renderTab("requests", "Demandes", pendingRequests.length)}
        {renderTab("search", "Rechercher")}
      </View>

      {/* Friends Tab */}
      {activeTab === "friends" && (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun ami pour le moment</Text>
              <Text style={styles.emptySubtext}>
                Recherchez des utilisateurs pour ajouter des amis
              </Text>
            </View>
          }
        />
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <FlatList
          data={[
            ...pendingRequests.map((r) => ({
              ...r,
              _type: "incoming" as const,
            })),
            ...sentRequests.map((r) => ({ ...r, _type: "outgoing" as const })),
          ]}
          renderItem={({ item }) =>
            item._type === "incoming"
              ? renderPendingRequest({ item })
              : renderSentRequest({ item })
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune demande</Text>
            </View>
          }
        />
      )}

      {/* Search Tab */}
      {activeTab === "search" && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par nom ou pseudo..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>

          {searchLoading ? (
            <ActivityIndicator
              size="large"
              color="#ec4899"
              style={{ marginTop: 32 }}
            />
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Tapez un nom pour rechercher
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

// === STYLES ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0a1a",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0a1a",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#ec4899",
  },
  tabText: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    fontSize: 13,
  },
  activeTabText: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ec4899",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardContent: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  username: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  online: {
    backgroundColor: "rgba(34,197,94,0.2)",
  },
  offline: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  rejectBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  removeBtn: {
    backgroundColor: "rgba(239,68,68,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeBtnText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 13,
  },
  pendingLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  searchContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: "#ec4899",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    fontSize: 18,
  },
});
