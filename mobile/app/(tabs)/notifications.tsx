/**
 * NotificationsScreen — Centre de notifications in-app
 *
 * Parité avec web-app notification-center.tsx :
 * - Liste filtrée par catégorie (all, messages, calls, social, system)
 * - Recherche textuelle
 * - Filtre lu/non-lu/tous
 * - Mark as read / Mark all read
 * - Pull to refresh
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  getNotificationHistory,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationHistoryItem,
} from "@/services/notification-api";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────
type NotifCategory = "all" | "messages" | "calls" | "social" | "system";
type ReadFilter = "all" | "unread" | "read";

const CATEGORIES: { key: NotifCategory; label: string; icon: string }[] = [
  { key: "all", label: "notifications.all", icon: "📋" },
  { key: "messages", label: "notifications.messages", icon: "💬" },
  { key: "calls", label: "notifications.callsCategory", icon: "📞" },
  { key: "social", label: "notifications.social", icon: "🌐" },
  { key: "system", label: "notifications.system", icon: "⚙️" },
];

// ─── Mock notifications for offline/demo ──────────────────────────
const MOCK_NOTIFICATIONS: NotificationHistoryItem[] = [
  {
    id: "n-1",
    userId: "u1",
    title: "Nouveau message",
    body: "Alice vous a envoyé un message : Salut ! Tu viens ce soir ?",
    data: { conversationId: "conv-1" },
    type: "messages",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "n-2",
    userId: "u1",
    title: "Appel manqué",
    body: "Bob a essayé de vous appeler",
    data: {},
    type: "calls",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "n-3",
    userId: "u1",
    title: "Nouvelle story",
    body: "Chloé a publié une nouvelle story",
    data: {},
    type: "social",
    read: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "n-4",
    userId: "u1",
    title: "Mise à jour disponible",
    body: "ImuChat v2.5 est disponible avec de nouvelles fonctionnalités",
    data: {},
    type: "system",
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "n-5",
    userId: "u1",
    title: "Mention dans un groupe",
    body: "David vous a mentionné dans Dev Team",
    data: { conversationId: "conv-3" },
    type: "messages",
    read: false,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "n-6",
    userId: "u1",
    title: "Nouveau contact",
    body: "Emma a accepté votre demande de contact",
    data: {},
    type: "social",
    read: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "n-7",
    userId: "u1",
    title: "Watch Party",
    body: "François lance une Watch Party : Film du vendredi",
    data: {},
    type: "social",
    read: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "n-8",
    userId: "u1",
    title: "Appel vidéo",
    body: "Appel de groupe avec 3 participants",
    data: {},
    type: "calls",
    read: true,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: "n-9",
    userId: "u1",
    title: "Bienvenue !",
    body: "Bienvenue sur ImuChat. Explorez les fonctionnalités !",
    data: {},
    type: "system",
    read: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: "n-10",
    userId: "u1",
    title: "Like sur votre story",
    body: "Alice et 3 autres ont aimé votre story",
    data: {},
    type: "social",
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function NotificationsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<NotifCategory>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [search, setSearch] = useState("");

  // ─── Data loading ─────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    try {
      const response = await getNotificationHistory(50, 0);
      setNotifications(response.notifications);
    } catch {
      // Fallback to mock data when API is unavailable
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  // ─── Actions ──────────────────────────────────────────────────
  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch {
      // Optimistic update even if API fails
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
    } catch {
      // Optimistic update
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ─── Filtering ────────────────────────────────────────────────
  const filteredNotifications = notifications
    .filter((n) => category === "all" || n.type === category)
    .filter((n) => {
      if (readFilter === "unread") return !n.read;
      if (readFilter === "read") return n.read;
      return true;
    })
    .filter((n) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─── Time formatting ─────────────────────────────────────────
  const formatTime = useCallback(
    (iso: string) => {
      const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
      if (mins < 1) return t("common.justNow");
      if (mins < 60) return t("common.minutesAgo", { count: mins });
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return t("common.hoursAgo", { count: hrs });
      return t("common.daysAgo", { count: Math.floor(hrs / 24) });
    },
    [t],
  );

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "messages":
        return "💬";
      case "calls":
        return "📞";
      case "social":
        return "🌐";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  // ─── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <View
        testID="notif-loading"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ─── Render notification item ─────────────────────────────────
  const renderItem = ({ item }: { item: NotificationHistoryItem }) => (
    <TouchableOpacity
      testID={`notif-item-${item.id}`}
      style={[
        styles.notifCard,
        {
          backgroundColor: item.read ? colors.surface : colors.primary + "10",
          borderColor: item.read ? colors.border : colors.primary + "40",
        },
      ]}
      onPress={() => handleMarkRead(item.id)}
    >
      <View style={styles.notifRow}>
        <View
          style={[
            styles.notifIconContainer,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Text style={styles.notifIcon}>{getNotifIcon(item.type)}</Text>
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text
              style={[
                styles.notifTitle,
                { color: colors.text, fontWeight: item.read ? "500" : "700" },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.notifTime, { color: colors.textMuted }]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
          <Text
            style={[styles.notifBody, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {item.body}
          </Text>
        </View>
        {!item.read && (
          <View
            testID={`unread-dot-${item.id}`}
            style={[styles.unreadDot, { backgroundColor: colors.primary }]}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <View
      testID="notifications-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.content, { padding: spacing.lg }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t("notifications.title")}
              </Text>
              {unreadCount > 0 && (
                <Text
                  testID="unread-badge"
                  style={[styles.unreadBadge, { color: colors.primary }]}
                >
                  {t("notifications.unreadCount", { count: unreadCount })}
                </Text>
              )}
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity
                testID="btn-mark-all-read"
                onPress={handleMarkAllRead}
                style={[styles.markAllBtn, { borderColor: colors.primary }]}
              >
                <Text style={[styles.markAllText, { color: colors.primary }]}>
                  {t("notifications.markAllRead")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search */}
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              testID="notif-search"
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t("common.searchPlaceholder")}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity
                testID="search-clear"
                onPress={() => setSearch("")}
              >
                <Text style={[styles.clearBtn, { color: colors.textMuted }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter */}
          <ScrollView
            testID="category-filter"
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => {
              const active = category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  testID={`cat-${cat.key}`}
                  onPress={() => setCategory(cat.key)}
                  style={[
                    styles.categoryBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: active ? "#fff" : colors.textMuted },
                    ]}
                  >
                    {t(cat.label)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Read Filter */}
          <View testID="read-filter" style={styles.readFilterRow}>
            {(["all", "unread", "read"] as ReadFilter[]).map((rf) => {
              const labels: Record<ReadFilter, string> = {
                all: t("notifications.allFilter"),
                unread: t("notifications.unread"),
                read: t("notifications.read"),
              };
              const active = readFilter === rf;
              return (
                <TouchableOpacity
                  key={rf}
                  testID={`filter-${rf}`}
                  onPress={() => setReadFilter(rf)}
                  style={[
                    styles.readFilterBtn,
                    {
                      backgroundColor: active
                        ? colors.primary + "20"
                        : "transparent",
                      borderBottomColor: active
                        ? colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.readFilterText,
                      { color: active ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {labels[rf]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Notification List */}
          <View testID="notif-list">
            {filteredNotifications.map((notif) => (
              <View key={notif.id}>{renderItem({ item: notif })}</View>
            ))}
            {filteredNotifications.length === 0 && (
              <View testID="empty-notif" style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔕</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {t("notifications.empty")}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom spacer */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  content: {},
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "bold" },
  unreadBadge: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  markAllBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: { fontSize: 12, fontWeight: "600" },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 14 },
  clearBtn: { fontSize: 16, padding: 4 },

  // Category filter
  categoryRow: { marginBottom: 12 },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryIcon: { fontSize: 14, marginRight: 6 },
  categoryLabel: { fontSize: 13, fontWeight: "500" },

  // Read filter
  readFilterRow: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  readFilterBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  readFilterText: { fontSize: 13, fontWeight: "600" },

  // Notification card
  notifCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  notifRow: { flexDirection: "row", alignItems: "flex-start" },
  notifIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notifIcon: { fontSize: 18 },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: { fontSize: 14, flex: 1, marginRight: 8 },
  notifTime: { fontSize: 11 },
  notifBody: { fontSize: 13, lineHeight: 18 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginLeft: 8,
  },

  // Empty state
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16 },
});
