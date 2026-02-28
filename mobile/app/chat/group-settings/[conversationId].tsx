/**
 * Group Settings Screen
 *
 * DEV-014: Advanced group management
 * - Edit group info (name, description, rules, avatar)
 * - Member management (roles, kick, ban, mute)
 * - Invite link management
 * - Leave/delete group
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {
  banMember,
  fetchGroupMembers,
  fetchGroupSettings,
  generateInviteLink,
  getMyRole,
  GroupMember,
  GroupRole,
  GroupSettings,
  kickMember,
  leaveGroup,
  muteMember,
  revokeInviteLink,
  transferOwnership,
  unmuteMember,
  updateGroupSettings,
  updateMemberRole,
} from "@/services/groups";
import { supabase } from "@/services/supabase";

const ROLE_LABELS: Record<GroupRole, string> = {
  owner: "groups.roles.owner",
  admin: "groups.roles.admin",
  moderator: "groups.roles.moderator",
  member: "groups.roles.member",
};

const ROLE_COLORS: Record<GroupRole, string> = {
  owner: "#ff9500",
  admin: "#5856d6",
  moderator: "#34c759",
  member: "#8e8e93",
};

export default function GroupSettingsScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { mode } = useTheme();
  const { t } = useI18n();
  const isDark = mode === "dark";

  const [settings, setSettings] = useState<GroupSettings | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [myRole, setMyRole] = useState<GroupRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRules, setEditRules] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = myRole === "owner" || myRole === "admin";
  const canModerate = canManage || myRole === "moderator";
  const isOwner = myRole === "owner";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    const [settingsData, membersData, role] = await Promise.all([
      fetchGroupSettings(conversationId),
      fetchGroupMembers(conversationId),
      getMyRole(conversationId),
    ]);

    setSettings(settingsData);
    setMembers(membersData);
    setMyRole(role);

    if (settingsData) {
      setEditName(settingsData.name);
      setEditDescription(settingsData.description || "");
      setEditRules(settingsData.rules || "");
    }

    setLoading(false);
  }, [conversationId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleSaveSettings = async () => {
    if (!conversationId) return;

    setSaving(true);
    const success = await updateGroupSettings(conversationId, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      rules: editRules.trim() || undefined,
    });
    setSaving(false);

    if (success) {
      setEditing(false);
      loadData();
    } else {
      Alert.alert(t("groups.error"), t("groups.saveFailed"));
    }
  };

  const handleGenerateInvite = async () => {
    if (!conversationId) return;

    const code = await generateInviteLink(conversationId);
    if (code) {
      loadData();
      Alert.alert(t("groups.inviteGenerated"), code);
    }
  };

  const handleRevokeInvite = async () => {
    if (!conversationId) return;

    Alert.alert(t("groups.revokeInvite"), t("groups.revokeInviteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("groups.revoke"),
        style: "destructive",
        onPress: async () => {
          await revokeInviteLink(conversationId);
          loadData();
        },
      },
    ]);
  };

  const handleCopyInvite = () => {
    if (settings?.inviteCode) {
      Clipboard.setString(settings.inviteCode);
      Alert.alert(t("groups.copied"), settings.inviteCode);
    }
  };

  const handleShareInvite = async () => {
    if (settings?.inviteCode) {
      try {
        await Share.share({
          message: t("groups.inviteMessage", {
            name: settings.name,
            code: settings.inviteCode,
          }),
        });
      } catch (error) {
        console.error("Share error", error);
      }
    }
  };

  const showMemberActions = (member: GroupMember) => {
    if (member.userId === currentUserId) return;

    const memberRole = member.role;
    const actions: {
      text: string;
      style?: "destructive" | "cancel";
      onPress?: () => void;
    }[] = [];

    // Role changes (owner/admin only)
    if (canManage && memberRole !== "owner") {
      if (isOwner) {
        // Owner can change any role
        if (memberRole === "member") {
          actions.push({
            text: t("groups.promoteToModerator"),
            onPress: () => handleChangeRole(member, "moderator"),
          });
          actions.push({
            text: t("groups.promoteToAdmin"),
            onPress: () => handleChangeRole(member, "admin"),
          });
        } else if (memberRole === "moderator") {
          actions.push({
            text: t("groups.promoteToAdmin"),
            onPress: () => handleChangeRole(member, "admin"),
          });
          actions.push({
            text: t("groups.demoteToMember"),
            onPress: () => handleChangeRole(member, "member"),
          });
        } else if (memberRole === "admin") {
          actions.push({
            text: t("groups.demoteToModerator"),
            onPress: () => handleChangeRole(member, "moderator"),
          });
          actions.push({
            text: t("groups.demoteToMember"),
            onPress: () => handleChangeRole(member, "member"),
          });
        }
        actions.push({
          text: t("groups.transferOwnership"),
          onPress: () => handleTransferOwnership(member),
        });
      } else if (myRole === "admin" && memberRole === "member") {
        actions.push({
          text: t("groups.promoteToModerator"),
          onPress: () => handleChangeRole(member, "moderator"),
        });
      }
    }

    // Moderation actions
    if (canModerate && memberRole !== "owner" && memberRole !== "admin") {
      if (member.isMuted) {
        actions.push({
          text: t("groups.unmute"),
          onPress: () => handleUnmute(member),
        });
      } else {
        actions.push({
          text: t("groups.mute"),
          onPress: () => showMuteOptions(member),
        });
      }

      actions.push({
        text: t("groups.kick"),
        style: "destructive",
        onPress: () => handleKick(member),
      });
    }

    if (canManage && memberRole !== "owner") {
      actions.push({
        text: t("groups.ban"),
        style: "destructive",
        onPress: () => handleBan(member),
      });
    }

    actions.push({ text: t("common.cancel"), style: "cancel" });

    if (actions.length > 1) {
      Alert.alert(
        member.user.displayName || member.user.username || t("common.member"),
        undefined,
        actions,
      );
    }
  };

  const handleChangeRole = async (member: GroupMember, newRole: GroupRole) => {
    if (!conversationId) return;

    const success = await updateMemberRole(
      conversationId,
      member.userId,
      newRole,
    );
    if (success) {
      loadData();
    } else {
      Alert.alert(t("groups.error"), t("groups.roleChangeFailed"));
    }
  };

  const handleTransferOwnership = (member: GroupMember) => {
    if (!conversationId) return;

    Alert.alert(
      t("groups.transferOwnership"),
      t("groups.transferOwnershipConfirm", {
        name: member.user.displayName || member.user.username,
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("groups.transfer"),
          style: "destructive",
          onPress: async () => {
            const success = await transferOwnership(
              conversationId,
              member.userId,
            );
            if (success) {
              loadData();
            } else {
              Alert.alert(t("groups.error"), t("groups.transferFailed"));
            }
          },
        },
      ],
    );
  };

  const handleKick = (member: GroupMember) => {
    if (!conversationId) return;

    Alert.alert(
      t("groups.kickMember"),
      t("groups.kickMemberConfirm", {
        name: member.user.displayName || member.user.username,
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("groups.kick"),
          style: "destructive",
          onPress: async () => {
            await kickMember(conversationId, member.userId);
            loadData();
          },
        },
      ],
    );
  };

  const handleBan = (member: GroupMember) => {
    if (!conversationId) return;

    Alert.alert(
      t("groups.banMember"),
      t("groups.banMemberConfirm", {
        name: member.user.displayName || member.user.username,
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("groups.ban"),
          style: "destructive",
          onPress: async () => {
            await banMember(conversationId, member.userId);
            loadData();
          },
        },
      ],
    );
  };

  const showMuteOptions = (member: GroupMember) => {
    if (!conversationId) return;

    Alert.alert(t("groups.muteDuration"), undefined, [
      {
        text: t("groups.mute15min"),
        onPress: () => handleMute(member, 15),
      },
      {
        text: t("groups.mute1hour"),
        onPress: () => handleMute(member, 60),
      },
      {
        text: t("groups.mute24hours"),
        onPress: () => handleMute(member, 1440),
      },
      {
        text: t("groups.muteIndefinitely"),
        onPress: () => handleMute(member),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleMute = async (member: GroupMember, minutes?: number) => {
    if (!conversationId) return;

    await muteMember(conversationId, member.userId, minutes);
    loadData();
  };

  const handleUnmute = async (member: GroupMember) => {
    if (!conversationId) return;

    await unmuteMember(conversationId, member.userId);
    loadData();
  };

  const handleLeaveGroup = () => {
    if (!conversationId) return;

    const message = isOwner
      ? t("groups.leaveAsOwnerConfirm")
      : t("groups.leaveGroupConfirm");

    Alert.alert(t("groups.leaveGroup"), message, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("groups.leave"),
        style: "destructive",
        onPress: async () => {
          if (isOwner && members.length > 1) {
            Alert.alert(t("groups.error"), t("groups.mustTransferFirst"));
            return;
          }
          const success = await leaveGroup(conversationId);
          if (success) {
            router.replace("/(tabs)/chats" as any);
          }
        },
      },
    ]);
  };

  const renderMember = (member: GroupMember) => {
    const isMe = member.userId === currentUserId;
    const displayName =
      member.user.displayName || member.user.username || t("common.anonymous");

    return (
      <TouchableOpacity
        key={member.id}
        style={[
          styles.memberRow,
          { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
        ]}
        onPress={() => showMemberActions(member)}
        disabled={isMe}
      >
        {member.user.avatarUrl ? (
          <Image
            source={{ uri: member.user.avatarUrl }}
            style={styles.memberAvatar}
          />
        ) : (
          <View
            style={[
              styles.memberAvatarPlaceholder,
              { backgroundColor: ROLE_COLORS[member.role] },
            ]}
          >
            <Text style={styles.memberInitial}>
              {displayName[0].toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text
              style={[styles.memberName, { color: isDark ? "#fff" : "#000" }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {isMe && (
              <Text
                style={[
                  styles.youLabel,
                  { color: isDark ? "#8e8e93" : "#666" },
                ]}
              >
                ({t("groups.you")})
              </Text>
            )}
          </View>

          <View style={styles.memberBadges}>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: ROLE_COLORS[member.role] + "20" },
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  { color: ROLE_COLORS[member.role] },
                ]}
              >
                {t(ROLE_LABELS[member.role])}
              </Text>
            </View>

            {member.isMuted && (
              <View style={styles.mutedBadge}>
                <Ionicons name="volume-mute" size={12} color="#ff3b30" />
              </View>
            )}
          </View>
        </View>

        {!isMe && canModerate && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#8e8e93" : "#c7c7cc"}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: t("groups.settings") }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  if (!settings) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Stack.Screen options={{ title: t("groups.error") }} />
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <Text style={[styles.errorText, { color: isDark ? "#fff" : "#000" }]}>
          {t("groups.notFound")}
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("groups.settings"),
          headerRight: () =>
            editing ? (
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <Text style={styles.cancelButton}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Text style={styles.saveButton}>{t("common.save")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : canManage ? (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editButton}>{t("common.edit")}</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Group Header */}
        <View style={styles.header}>
          {settings.avatarUrl ? (
            <Image
              source={{ uri: settings.avatarUrl }}
              style={styles.groupAvatar}
            />
          ) : (
            <View
              style={[
                styles.groupAvatarPlaceholder,
                { backgroundColor: "#007AFF" },
              ]}
            >
              <Ionicons name="people" size={40} color="#fff" />
            </View>
          )}

          {editing ? (
            <TextInput
              style={[
                styles.groupNameInput,
                {
                  color: isDark ? "#fff" : "#000",
                  borderColor: isDark ? "#3a3a3c" : "#e5e5ea",
                },
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholder={t("groups.groupName")}
              placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
            />
          ) : (
            <Text
              style={[styles.groupName, { color: isDark ? "#fff" : "#000" }]}
            >
              {settings.name}
            </Text>
          )}

          <Text
            style={[styles.memberCount, { color: isDark ? "#8e8e93" : "#666" }]}
          >
            {t("groups.memberCount", { count: settings.memberCount })}
          </Text>
        </View>

        {/* Description & Rules */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            {t("groups.description")}
          </Text>
          {editing ? (
            <TextInput
              style={[
                styles.textArea,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1c1c1e" : "#fff",
                  borderColor: isDark ? "#3a3a3c" : "#e5e5ea",
                },
              ]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder={t("groups.descriptionPlaceholder")}
              placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
              multiline
              numberOfLines={3}
            />
          ) : settings.description ? (
            <Text
              style={[
                styles.descriptionText,
                { color: isDark ? "#d1d1d6" : "#333" },
              ]}
            >
              {settings.description}
            </Text>
          ) : (
            <Text
              style={[
                styles.emptyText,
                { color: isDark ? "#8e8e93" : "#aeaeb2" },
              ]}
            >
              {t("groups.noDescription")}
            </Text>
          )}
        </View>

        {(editing || settings.rules) && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              {t("groups.rules")}
            </Text>
            {editing ? (
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: isDark ? "#fff" : "#000",
                    backgroundColor: isDark ? "#1c1c1e" : "#fff",
                    borderColor: isDark ? "#3a3a3c" : "#e5e5ea",
                  },
                ]}
                value={editRules}
                onChangeText={setEditRules}
                placeholder={t("groups.rulesPlaceholder")}
                placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
                multiline
                numberOfLines={4}
              />
            ) : settings.rules ? (
              <Text
                style={[
                  styles.descriptionText,
                  { color: isDark ? "#d1d1d6" : "#333" },
                ]}
              >
                {settings.rules}
              </Text>
            ) : null}
          </View>
        )}

        {/* Invite Link */}
        {canManage && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              {t("groups.inviteLink")}
            </Text>

            {settings.inviteCode ? (
              <View style={styles.inviteContainer}>
                <View
                  style={[
                    styles.inviteCodeBox,
                    { backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7" },
                  ]}
                >
                  <Text
                    style={[
                      styles.inviteCode,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                  >
                    {settings.inviteCode}
                  </Text>
                </View>

                <View style={styles.inviteActions}>
                  <TouchableOpacity
                    style={styles.inviteAction}
                    onPress={handleCopyInvite}
                  >
                    <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    <Text style={styles.inviteActionText}>
                      {t("groups.copy")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.inviteAction}
                    onPress={handleShareInvite}
                  >
                    <Ionicons name="share-outline" size={20} color="#007AFF" />
                    <Text style={styles.inviteActionText}>
                      {t("groups.share")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.inviteAction}
                    onPress={handleRevokeInvite}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                    <Text
                      style={[styles.inviteActionText, { color: "#ff3b30" }]}
                    >
                      {t("groups.revoke")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.generateInviteButton}
                onPress={handleGenerateInvite}
              >
                <Ionicons name="link" size={20} color="#007AFF" />
                <Text style={styles.generateInviteText}>
                  {t("groups.generateInvite")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Members */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            {t("groups.members")} ({members.length})
          </Text>

          <View style={styles.membersList}>{members.map(renderMember)}</View>
        </View>

        {/* Leave Group */}
        <TouchableOpacity
          style={[
            styles.leaveButton,
            { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
          ]}
          onPress={handleLeaveGroup}
        >
          <Ionicons name="exit-outline" size={22} color="#ff3b30" />
          <Text style={styles.leaveButtonText}>{t("groups.leaveGroup")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 18,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 16,
  },
  editButton: {
    color: "#007AFF",
    fontSize: 17,
  },
  cancelButton: {
    color: "#ff3b30",
    fontSize: 17,
  },
  saveButton: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  groupAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  groupAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  groupName: {
    fontSize: 24,
    fontWeight: "700",
  },
  groupNameInput: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 200,
  },
  memberCount: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
  },
  inviteContainer: {
    gap: 12,
  },
  inviteCodeBox: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 4,
  },
  inviteActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  inviteAction: {
    alignItems: "center",
    gap: 4,
  },
  inviteActionText: {
    fontSize: 13,
    color: "#007AFF",
  },
  generateInviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  generateInviteText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  membersList: {
    gap: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  youLabel: {
    fontSize: 14,
  },
  memberBadges: {
    flexDirection: "row",
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  mutedBadge: {
    backgroundColor: "#ff3b3020",
    padding: 4,
    borderRadius: 4,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  leaveButtonText: {
    color: "#ff3b30",
    fontSize: 17,
    fontWeight: "500",
  },
});
