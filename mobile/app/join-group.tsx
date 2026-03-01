/**
 * Join Group by Invite Screen
 *
 * DEV-014: Join a group using invite code
 */

import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import {
  getInviteInfo,
  GroupInvite,
  joinByInviteCode,
} from "@/services/groups";

export default function JoinGroupScreen() {
  const { code: initialCode } = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();
  const { theme, mode } = useTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const isDark = mode === "dark";

  const [code, setCode] = useState(initialCode || "");
  const [inviteInfo, setInviteInfo] = useState<GroupInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      checkInvite(initialCode);
    }
  }, [initialCode]);

  const checkInvite = async (inviteCode: string) => {
    if (!inviteCode.trim()) return;

    setChecking(true);
    setError(null);
    setInviteInfo(null);

    const info = await getInviteInfo(inviteCode.trim().toUpperCase());

    if (info) {
      setInviteInfo(info);
    } else {
      setError(t("groups.inviteNotFound"));
    }

    setChecking(false);
  };

  const handleJoin = async () => {
    if (!code.trim()) return;

    setJoining(true);

    const conversationId = await joinByInviteCode(code.trim().toUpperCase());

    if (conversationId) {
      router.replace(`/chat/${conversationId}`);
    } else {
      showToast(t("groups.joinFailed"), "error");
      setJoining(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setCode(cleaned);
    setInviteInfo(null);
    setError(null);
  };

  const handleLookup = () => {
    if (code.length >= 6) {
      checkInvite(code);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t("groups.joinGroup") }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="people-circle" size={80} color="#007AFF" />
          </View>

          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            {t("groups.joinWithCode")}
          </Text>

          <Text
            style={[styles.subtitle, { color: isDark ? "#8e8e93" : "#666" }]}
          >
            {t("groups.enterInviteCode")}
          </Text>

          {/* Code Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              value={code}
              onChangeText={handleCodeChange}
              placeholder="ABCD1234"
              placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
              onSubmitEditing={handleLookup}
            />

            <TouchableOpacity
              style={[
                styles.lookupButton,
                code.length < 6 && styles.lookupButtonDisabled,
              ]}
              onPress={handleLookup}
              disabled={code.length < 6 || checking}
            >
              {checking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="search" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Invite Preview */}
          {inviteInfo && (
            <View
              style={[
                styles.previewCard,
                { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
              ]}
            >
              {inviteInfo.avatarUrl ? (
                <Image
                  source={{ uri: inviteInfo.avatarUrl }}
                  style={styles.previewAvatar}
                />
              ) : (
                <View
                  style={[
                    styles.previewAvatarPlaceholder,
                    { backgroundColor: "#007AFF" },
                  ]}
                >
                  <Ionicons name="people" size={32} color="#fff" />
                </View>
              )}

              <Text
                style={[
                  styles.previewName,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                {inviteInfo.groupName}
              </Text>

              <Text
                style={[
                  styles.previewMembers,
                  { color: isDark ? "#8e8e93" : "#666" },
                ]}
              >
                {t("groups.memberCount", { count: inviteInfo.memberCount })}
              </Text>

              <TouchableOpacity
                style={[
                  styles.joinButton,
                  joining && styles.joinButtonDisabled,
                ]}
                onPress={handleJoin}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.joinButtonText}>{t("groups.join")}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 320,
  },
  codeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "monospace",
    textAlign: "center",
    letterSpacing: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  lookupButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  lookupButtonDisabled: {
    backgroundColor: "#8e8e93",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 15,
  },
  previewCard: {
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 16,
  },
  previewAvatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  previewName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  previewMembers: {
    fontSize: 14,
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: "#34c759",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
