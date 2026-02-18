import { CallHistoryItem, useCallHistory } from "@/hooks/useCallHistory";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CallsScreen() {
  const { calls, loading, error, refresh, deleteCall } = useCallHistory();
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();

  const getStatusIcon = (item: CallHistoryItem) => {
    if (item.status === "missed") {
      return { name: "call-outline" as const, color: colors.error };
    }
    if (item.status === "rejected") {
      return { name: "close-circle-outline" as const, color: colors.error };
    }
    if (item.isOutgoing) {
      return { name: "arrow-up-outline" as const, color: colors.success };
    }
    return { name: "arrow-down-outline" as const, color: colors.success };
  };

  const getCallTypeIcon = (item: CallHistoryItem) => {
    return item.call_type === "video" ? "videocam" : "call";
  };

  const handleCallPress = (item: CallHistoryItem) => {
    // Navigate to call screen with the other user
    router.push(
      `/call/outgoing?userId=${item.otherUser.id}&type=${item.call_type}`,
    );
  };

  const renderCallItem = ({ item }: { item: CallHistoryItem }) => {
    const statusIcon = getStatusIcon(item);
    const isMissed = item.status === "missed" || item.status === "rejected";

    return (
      <TouchableOpacity
        style={[styles.callItem, { borderBottomColor: colors.border }]}
        onPress={() => handleCallPress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {item.otherUser.avatar_url ? (
            <Text style={styles.avatarText}>
              {(item.otherUser.username || item.otherUser.full_name || "?")
                .charAt(0)
                .toUpperCase()}
            </Text>
          ) : (
            <Text style={styles.avatarText}>
              {(item.otherUser.username || item.otherUser.full_name || "?")
                .charAt(0)
                .toUpperCase()}
            </Text>
          )}
        </View>

        {/* Call info */}
        <View style={styles.callContent}>
          <View style={styles.callHeader}>
            <Text
              style={[
                styles.userName,
                { color: isMissed ? colors.error : colors.text },
              ]}
            >
              {item.otherUser.full_name ||
                item.otherUser.username ||
                "Utilisateur inconnu"}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
              {item.formattedTime}
            </Text>
          </View>

          <View style={styles.callDetails}>
            <Ionicons
              name={statusIcon.name}
              size={14}
              color={statusIcon.color}
              style={styles.statusIcon}
            />
            <Ionicons
              name={getCallTypeIcon(item)}
              size={14}
              color={colors.textMuted}
              style={styles.typeIcon}
            />
            <Text style={[styles.callStatus, { color: colors.textMuted }]}>
              {item.status === "missed" && "Appel manqué"}
              {item.status === "rejected" && "Appel refusé"}
              {item.status === "ended" && item.formattedDuration}
              {item.status === "accepted" && "En cours..."}
              {item.status === "ringing" && "Sonnerie..."}
            </Text>
          </View>
        </View>

        {/* Call button */}
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: colors.success }]}
          onPress={() => handleCallPress(item)}
        >
          <Ionicons name={getCallTypeIcon(item)} size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="call-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Aucun appel
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
        Votre historique d'appels apparaîtra ici
      </Text>
    </View>
  );

  if (loading && calls.length === 0) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={refresh}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={calls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          calls.length === 0 ? styles.emptyList : undefined
        }
      />
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
    padding: 20,
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  callContent: {
    flex: 1,
    marginLeft: 12,
  },
  callHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
  },
  callDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  typeIcon: {
    marginRight: 6,
  },
  callStatus: {
    fontSize: 13,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyList: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
