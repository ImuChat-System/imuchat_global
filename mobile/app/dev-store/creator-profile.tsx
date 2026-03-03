/**
 * CreatorProfileScreen — Developer Profile & KYC (DEV-034)
 *
 * Allows developers to manage their creator profile,
 * view verification status, and initiate KYC.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { DevKYCStatus } from "@/types/dev-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const KYC_CONFIG: Record<DevKYCStatus, { emoji: string; color: string }> = {
  not_started: { emoji: "⚠️", color: "#f5a623" },
  pending: { emoji: "⏳", color: "#3b82f6" },
  verified: { emoji: "✅", color: "#22c55e" },
  rejected: { emoji: "❌", color: "#ef4444" },
};

export default function CreatorProfileScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { profile, profileLoading, fetchProfile, updateProfile, startKYC } =
    useDevStore();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setWebsite(profile.website || "");
      setGithub(profile.github_url || "");
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: profile?.avatar_url || null,
        website: website.trim() || null,
        github_url: github.trim() || null,
      });
      Alert.alert(t("devStore.success"), t("devStore.profileSaved"));
    } catch (e) {
      Alert.alert(
        t("devStore.error"),
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setSaving(false);
    }
  }, [displayName, bio, website, github, profile, updateProfile, t]);

  const handleStartKYC = useCallback(async () => {
    Alert.alert(t("devStore.startKYC"), t("devStore.startKYCMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("devStore.proceed"),
        onPress: async () => {
          await startKYC();
        },
      },
    ]);
  }, [startKYC, t]);

  if (profileLoading && !profile) {
    return (
      <View
        testID="creator-profile-screen"
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const kycStatus = profile?.kyc_status || "not_started";
  const kycCfg = KYC_CONFIG[kycStatus];

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surface,
      color: colors.text,
      borderColor: colors.border,
    },
  ];

  return (
    <ScrollView
      testID="creator-profile-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Avatar & Name ──────────────────────────────────── */}
      <View style={[styles.avatarSection, { backgroundColor: colors.surface }]}>
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}
        >
          <Text style={{ fontSize: 40 }}>👨‍💻</Text>
        </View>
        <Text style={[styles.displayName, { color: colors.text }]}>
          {profile?.display_name || t("devStore.newCreator")}
        </Text>
        {profile?.is_verified && (
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "600" }}>
              {t("devStore.verified")}
            </Text>
          </View>
        )}
      </View>

      {/* ── KYC Status ─────────────────────────────────────── */}
      <View
        style={[
          styles.kycCard,
          {
            backgroundColor: kycCfg.color + "10",
            borderColor: kycCfg.color + "40",
          },
        ]}
      >
        <View style={styles.kycHeader}>
          <Text style={{ fontSize: 20 }}>{kycCfg.emoji}</Text>
          <Text style={[styles.kycTitle, { color: colors.text }]}>
            {t("devStore.kycStatus")}
          </Text>
        </View>
        <Text style={[styles.kycValue, { color: kycCfg.color }]}>
          {t(`devStore.kyc_${kycStatus}`)}
        </Text>
        {kycStatus === "not_started" && (
          <TouchableOpacity
            testID="btn-start-kyc"
            style={[styles.kycBtn, { backgroundColor: colors.primary }]}
            onPress={handleStartKYC}
          >
            <Text style={styles.kycBtnText}>{t("devStore.startKYC")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Stats ──────────────────────────────────────────── */}
      <View style={[styles.statsRow]}>
        <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {profile?.total_apps ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("devStore.totalApps")}
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {profile?.total_themes ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("devStore.totalThemes")}
          </Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {profile?.total_downloads ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {t("devStore.downloads")}
          </Text>
        </View>
      </View>

      {/* ── Edit Form ──────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("devStore.editProfile")}
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.displayName")}
      </Text>
      <TextInput
        testID="input-display-name"
        style={inputStyle}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={t("devStore.displayNamePlaceholder")}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.bio")}
      </Text>
      <TextInput
        style={[...inputStyle, { height: 80, textAlignVertical: "top" }]}
        value={bio}
        onChangeText={setBio}
        placeholder={t("devStore.bioPlaceholder")}
        placeholderTextColor={colors.textMuted}
        multiline
      />

      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.website")}
      </Text>
      <TextInput
        style={inputStyle}
        value={website}
        onChangeText={setWebsite}
        placeholder="https://..."
        placeholderTextColor={colors.textMuted}
        keyboardType="url"
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.github")}
      </Text>
      <TextInput
        style={inputStyle}
        value={github}
        onChangeText={setGithub}
        placeholder="https://github.com/..."
        placeholderTextColor={colors.textMuted}
        keyboardType="url"
        autoCapitalize="none"
      />

      {/* Commission info */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Ionicons name="information-circle" size={18} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          {t("devStore.commissionInfo", {
            rate: ((profile?.commission_rate ?? 0.3) * 100).toFixed(0),
          })}
        </Text>
      </View>

      {/* Save */}
      <TouchableOpacity
        testID="btn-save-profile"
        style={[
          styles.saveBtn,
          { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 },
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? t("devStore.saving") : t("devStore.saveProfile")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center" },
  avatarSection: {
    alignItems: "center",
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  displayName: { fontSize: 20, fontWeight: "800" },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  kycCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 14 },
  kycHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  kycTitle: { fontSize: 15, fontWeight: "700" },
  kycValue: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  kycBtn: { marginTop: 10, padding: 10, borderRadius: 8, alignItems: "center" },
  kycBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statItem: { flex: 1, alignItems: "center", padding: 12, borderRadius: 10 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  saveBtn: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
