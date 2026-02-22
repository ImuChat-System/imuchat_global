/**
 * Profile Screen — DEV-008 Advanced Profiles
 *
 * Extended profile page with:
 * - Avatar with online status indicator
 * - Display name & @username
 * - Bio (formatted)
 * - Enriched status (emoji + text + expiration)
 * - Stats (contacts, conversations)
 * - Verification badge
 * - Quick actions (edit, share, settings)
 */

import Avatar from "@/components/Avatar";
import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";
import {
  OnlineStatus,
  ProfileVisibility,
  useUserStore,
} from "@/stores/user-store";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileData {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  status: OnlineStatus;
  status_emoji: string | null;
  status_expires_at: string | null;
  visibility: ProfileVisibility;
  is_verified: boolean;
  is_online: boolean;
  last_seen: string | null;
  contacts_count: number;
  conversations_count: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfileScreen() {
  const { user, session } = useAuth();
  const { theme } = useTheme();
  const { t } = useI18n();
  const { profile: storeProfile, setProfile } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfileData] = useState<ProfileData | null>(null);

  // -----------------------------------------------------------------------
  // Load profile from Supabase
  // -----------------------------------------------------------------------

  const loadProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          display_name,
          avatar_url,
          bio,
          website,
          status,
          status_emoji,
          status_expires_at,
          visibility,
          is_verified,
          is_online,
          last_seen,
          contacts_count,
          conversations_count
        `
        )
        .eq("id", session.user.id)
        .single();

      if (error && (error as any).code !== "PGRST116") {
        console.error("[Profile] Load error:", error);
        return;
      }

      if (data) {
        // Handle default values for columns that might not exist yet
        const profileData: ProfileData = {
          id: data.id,
          username: data.username,
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          website: data.website ?? null,
          status: (data.status as OnlineStatus) || "online",
          status_emoji: (data as any).status_emoji ?? null,
          status_expires_at: (data as any).status_expires_at ?? null,
          visibility:
            ((data as any).visibility as ProfileVisibility) || "public",
          is_verified: (data as any).is_verified ?? false,
          is_online: data.is_online ?? false,
          last_seen: data.last_seen ?? null,
          contacts_count: (data as any).contacts_count ?? 0,
          conversations_count: (data as any).conversations_count ?? 0,
        };

        setProfileData(profileData);

        // Sync to user-store
        setProfile({
          id: profileData.id,
          username: profileData.username,
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          website: profileData.website,
          status: profileData.status,
          status_emoji: profileData.status_emoji,
          status_expires_at: profileData.status_expires_at,
          visibility: profileData.visibility,
          is_verified: profileData.is_verified,
          contacts_count: profileData.contacts_count,
          conversations_count: profileData.conversations_count,
        });
      }
    } catch (err) {
      console.error("[Profile] Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, setProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleGoToSettings = () => {
    router.push("/(tabs)/settings");
  };

  const handleSignOut = () => {
    Alert.alert(t("profile.signOut"), t("profile.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.signOut"),
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  const handleShareProfile = () => {
    Alert.alert(t("common.comingSoon"), t("profile.shareComingSoon"));
  };

  // -----------------------------------------------------------------------
  // Status expiration check
  // -----------------------------------------------------------------------

  const isStatusExpired = useCallback(() => {
    if (!profile?.status_expires_at) return false;
    return new Date(profile.status_expires_at) < new Date();
  }, [profile?.status_expires_at]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <Ionicons name="person-outline" size={64} color={theme.colors.border} />
        <Text
          style={[styles.emptyText, { color: theme.colors.textMuted }]}
        >
          {t("profile.noSession")}
        </Text>
      </View>
    );
  }

  const displayName = profile.display_name || profile.username || t("common.user");
  const statusText =
    profile.status_emoji && !isStatusExpired()
      ? `${profile.status_emoji} ${profile.status || ""}`
      : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header with settings button */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t("tabs.profile")}
        </Text>
        <TouchableOpacity
          onPress={handleGoToSettings}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Avatar
            size={120}
            url={profile.avatar_url}
            onUpload={async (url) => {
              // Update avatar
              await supabase
                .from("profiles")
                .update({ avatar_url: url, updated_at: new Date().toISOString() })
                .eq("id", profile.id);
              await loadProfile();
            }}
            showEditButton
          />
          {/* Online status indicator */}
          {profile.is_online && (
            <View
              style={[
                styles.onlineIndicator,
                { borderColor: theme.colors.background },
              ]}
            />
          )}
        </View>
      </View>

      {/* Name & Verification Badge */}
      <View style={styles.nameSection}>
        <View style={styles.nameRow}>
          <Text style={[styles.displayName, { color: theme.colors.text }]}>
            {displayName}
          </Text>
          {profile.is_verified && (
            <MaterialIcons
              name="verified"
              size={22}
              color={theme.colors.primary}
              style={styles.verifiedBadge}
            />
          )}
        </View>
        {profile.username && (
          <Text style={[styles.username, { color: theme.colors.textMuted }]}>
            @{profile.username}
          </Text>
        )}
      </View>

      {/* Enriched Status */}
      {statusText && (
        <View
          style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {statusText}
          </Text>
        </View>
      )}

      {/* Bio */}
      {profile.bio && (
        <View style={styles.bioSection}>
          <Text style={[styles.bioText, { color: theme.colors.text }]}>
            {profile.bio}
          </Text>
        </View>
      )}

      {/* Website */}
      {profile.website && (
        <TouchableOpacity style={styles.websiteRow}>
          <Ionicons name="link-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.websiteText, { color: theme.colors.primary }]}>
            {profile.website.replace(/^https?:\/\//, "")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Stats Row */}
      <View
        style={[styles.statsRow, { borderColor: theme.colors.border }]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {profile.contacts_count}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
            {t("profile.contacts")}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {profile.conversations_count}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
            {t("profile.conversations")}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <View style={styles.visibilityIcon}>
            <FontAwesome5
              name={
                profile.visibility === "public"
                  ? "globe"
                  : profile.visibility === "private"
                  ? "lock"
                  : "user-secret"
              }
              size={16}
              color={theme.colors.textMuted}
            />
          </View>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
            {t(`profile.visibility${profile.visibility.charAt(0).toUpperCase() + profile.visibility.slice(1)}`)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>{t("profile.editProfile")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtnSecondary, { borderColor: theme.colors.border }]}
          onPress={handleShareProfile}
        >
          <Ionicons name="share-outline" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Email (readonly) */}
      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
            {t("profile.email")}
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {session?.user?.email || "-"}
          </Text>
        </View>
        {profile.last_seen && !profile.is_online && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
              {t("profile.lastSeen")}
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {new Date(profile.last_seen).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutBtn, { borderColor: theme.colors.error }]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={[styles.signOutText, { color: theme.colors.error }]}>
          {t("profile.signOut")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22c55e",
    borderWidth: 3,
  },
  nameSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  username: {
    fontSize: 16,
    marginTop: 2,
  },
  statusCard: {
    marginHorizontal: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 15,
  },
  bioSection: {
    paddingHorizontal: 30,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  websiteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 16,
  },
  websiteText: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    textTransform: "uppercase",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
  },
  visibilityIcon: {
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  actionBtnSecondary: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  infoCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  signOutBtn: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
