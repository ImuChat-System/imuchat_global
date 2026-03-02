/**
 * Files Share — DEV-020
 *
 * Modal de gestion du partage : partages utilisateur,
 * liens de partage, permissions.
 */

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { useFilesStore } from "@/stores/files-store";

const PERMISSIONS = ["view", "comment", "edit", "admin"] as const;

const PERMISSION_ICONS: Record<string, string> = {
  view: "eye-outline",
  comment: "chatbubble-outline",
  edit: "create-outline",
  admin: "shield-outline",
};

const PERMISSION_COLORS: Record<string, string> = {
  view: "#78909C",
  comment: "#29B6F6",
  edit: "#66BB6A",
  admin: "#FF7043",
};

export default function FileShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const colors = useColors();
  const spacing = useSpacing();
  const router = useRouter();
  const { showToast } = useToast();

  const shares = useFilesStore((s) => s.shares);
  const shareLinks = useFilesStore((s) => s.shareLinks);
  const files = useFilesStore((s) => s.files);
  const loadShares = useFilesStore((s) => s.loadShares);
  const loadShareLinks = useFilesStore((s) => s.loadShareLinks);
  const shareFile = useFilesStore((s) => s.shareFile);
  const removeShare = useFilesStore((s) => s.removeShare);
  const createShareLink = useFilesStore((s) => s.createShareLink);
  const deactivateShareLink = useFilesStore((s) => s.deactivateShareLink);

  const [email, setEmail] = useState("");
  const [selectedPermission, setSelectedPermission] =
    useState<(typeof PERMISSIONS)[number]>("view");

  const file = files.find((f) => f.id === id);

  useEffect(() => {
    if (id) {
      loadShares(id);
      loadShareLinks(id);
    }
  }, [id, loadShares, loadShareLinks]);

  const handleAddShare = useCallback(async () => {
    if (!email.trim() || !id) return;
    await shareFile(id, email.trim(), email.trim(), selectedPermission);
    setEmail("");
    showToast(t("files.shareAdded"), "success");
  }, [id, email, selectedPermission, shareFile, showToast, t]);

  const handleRemoveShare = useCallback(
    async (shareId: string) => {
      Alert.alert(t("files.removeShareTitle"), t("files.removeShareMessage"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            await removeShare(shareId);
            showToast(t("files.shareRemoved"), "success");
          },
        },
      ]);
    },
    [removeShare, showToast, t],
  );

  const handleCreateLink = useCallback(async () => {
    if (!id) return;
    await createShareLink(id);
    showToast(t("files.linkCreated"), "success");
  }, [id, createShareLink, showToast, t]);

  const handleDeactivateLink = useCallback(
    async (linkId: string) => {
      await deactivateShareLink(linkId);
      showToast(t("files.linkDeactivated"), "success");
    },
    [deactivateShareLink, showToast, t],
  );

  const handleCopyLink = useCallback(
    (token: string) => {
      showToast(t("files.linkCopied"), "success");
    },
    [showToast, t],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xl + 20,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
        section: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
          marginBottom: spacing.sm,
        },
        addRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          marginBottom: spacing.sm,
        },
        emailInput: {
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: spacing.sm,
          color: colors.text,
          fontSize: 14,
        },
        addBtn: {
          backgroundColor: colors.primary,
          borderRadius: 10,
          padding: spacing.sm,
        },
        permRow: {
          flexDirection: "row",
          gap: spacing.xs,
          marginBottom: spacing.md,
        },
        permChip: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          borderRadius: 20,
          gap: 4,
        },
        permChipText: { fontSize: 12, fontWeight: "600" },
        shareItem: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: spacing.sm,
          marginBottom: spacing.xs,
        },
        shareInfo: { flex: 1 },
        shareUser: { fontSize: 14, fontWeight: "500", color: colors.text },
        sharePerm: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
        badge: {
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: 12,
        },
        badgeText: { fontSize: 11, fontWeight: "600" },
        linkItem: {
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: spacing.sm,
          marginBottom: spacing.xs,
        },
        linkTopRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        linkToken: {
          fontSize: 12,
          fontFamily: "monospace",
          color: colors.primary,
        },
        linkStatus: { fontSize: 11, fontWeight: "600" },
        linkMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
        linkActions: {
          flexDirection: "row",
          gap: spacing.sm,
          marginTop: spacing.xs,
        },
        linkBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          padding: spacing.xs,
        },
        linkBtnText: { fontSize: 12, color: colors.primary },
        empty: { alignItems: "center", padding: spacing.lg },
        emptyText: { fontSize: 13, color: colors.textSecondary },
        divider: {
          height: 1,
          backgroundColor: colors.border,
          marginVertical: spacing.md,
        },
      }),
    [colors, spacing],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("files.shareFile")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Add share */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("files.addPeople")}</Text>
              <View style={styles.addRow}>
                <TextInput
                  style={styles.emailInput}
                  placeholder={t("files.emailPlaceholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Pressable style={styles.addBtn} onPress={handleAddShare}>
                  <Ionicons name="add" size={22} color="#FFF" />
                </Pressable>
              </View>

              {/* Permission selector */}
              <View style={styles.permRow}>
                {PERMISSIONS.map((perm) => {
                  const active = selectedPermission === perm;
                  const col = PERMISSION_COLORS[perm];
                  return (
                    <Pressable
                      key={perm}
                      style={[
                        styles.permChip,
                        {
                          backgroundColor: active ? col + "30" : colors.surface,
                        },
                      ]}
                      onPress={() => setSelectedPermission(perm)}
                    >
                      <Ionicons
                        name={PERMISSION_ICONS[perm] as any}
                        size={14}
                        color={active ? col : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.permChipText,
                          { color: active ? col : colors.textSecondary },
                        ]}
                      >
                        {t(`files.perm_${perm}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Current shares */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("files.currentShares")}
              </Text>
              {shares.length > 0 ? (
                shares.map((share) => {
                  const col = PERMISSION_COLORS[share.permission];
                  return (
                    <View key={share.id} style={styles.shareItem}>
                      <View style={styles.shareInfo}>
                        <Text style={styles.shareUser}>
                          {share.shared_with_name || share.shared_with}
                        </Text>
                        <Text style={styles.sharePerm}>
                          {t("files.sharedBy")} {share.shared_by || ""}
                        </Text>
                      </View>
                      <View
                        style={[styles.badge, { backgroundColor: col + "20" }]}
                      >
                        <Text style={[styles.badgeText, { color: col }]}>
                          {t(`files.perm_${share.permission}`)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleRemoveShare(share.id)}
                        style={{ paddingLeft: spacing.sm }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={colors.error}
                        />
                      </Pressable>
                    </View>
                  );
                })
              ) : (
                <View style={styles.empty}>
                  <Ionicons
                    name="people-outline"
                    size={32}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>{t("files.noShares")}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Share links */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("files.shareLinks")}</Text>
              {shareLinks.map((link) => {
                const isActive = link.is_active;
                return (
                  <View key={link.id} style={styles.linkItem}>
                    <View style={styles.linkTopRow}>
                      <Text style={styles.linkToken}>
                        {link.token.substring(0, 16)}...
                      </Text>
                      <Text
                        style={[
                          styles.linkStatus,
                          {
                            color: isActive ? "#66BB6A" : colors.textSecondary,
                          },
                        ]}
                      >
                        {isActive
                          ? t("files.linkActive")
                          : t("files.linkInactive")}
                      </Text>
                    </View>
                    <Text style={styles.linkMeta}>
                      {t(`files.perm_${link.permission}`)}
                      {link.expires_at
                        ? ` · ${t("files.expiresAt")} ${new Date(link.expires_at).toLocaleDateString()}`
                        : ""}
                      {link.max_downloads
                        ? ` · ${link.download_count}/${link.max_downloads} DL`
                        : ""}
                    </Text>
                    <View style={styles.linkActions}>
                      <Pressable
                        style={styles.linkBtn}
                        onPress={() => handleCopyLink(link.token)}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.linkBtnText}>
                          {t("files.copyLink")}
                        </Text>
                      </Pressable>
                      {isActive && (
                        <Pressable
                          style={styles.linkBtn}
                          onPress={() => handleDeactivateLink(link.id)}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={16}
                            color={colors.error}
                          />
                          <Text
                            style={[
                              styles.linkBtnText,
                              { color: colors.error },
                            ]}
                          >
                            {t("files.deactivate")}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}

              <Pressable
                style={[
                  styles.addBtn,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.xs,
                    alignSelf: "flex-start",
                    marginTop: spacing.sm,
                  },
                ]}
                onPress={handleCreateLink}
              >
                <Ionicons name="link" size={18} color="#FFF" />
                <Text
                  style={{ color: "#FFF", fontWeight: "600", fontSize: 13 }}
                >
                  {t("files.createLink")}
                </Text>
              </Pressable>
            </View>
          </>
        }
      />
    </View>
  );
}
