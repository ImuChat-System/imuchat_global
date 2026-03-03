/**
 * APIKeysScreen — API Keys Management (DEV-034)
 *
 * List, create, and revoke developer API keys.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { DevAPIKey } from "@/types/dev-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function KeyCard({
  item,
  colors,
  t,
  onRevoke,
}: {
  item: DevAPIKey;
  colors: ReturnType<typeof useColors>;
  t: (k: string) => string;
  onRevoke: () => void;
}) {
  return (
    <View style={[styles.keyCard, { backgroundColor: colors.surface }]}>
      <View style={styles.keyHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.keyName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.keyPrefix, { color: colors.textMuted }]}>
            {item.key_prefix}••••••••
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.is_active ? "#22c55e" : "#ef4444" },
          ]}
        />
      </View>
      <View style={styles.keyMeta}>
        <Text style={[styles.keyDate, { color: colors.textMuted }]}>
          {t("devStore.created")}:{" "}
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.last_used_at && (
          <Text style={[styles.keyDate, { color: colors.textMuted }]}>
            {t("devStore.lastUsed")}:{" "}
            {new Date(item.last_used_at).toLocaleDateString()}
          </Text>
        )}
      </View>
      {item.permissions.length > 0 && (
        <View style={styles.permsRow}>
          {item.permissions.map((p) => (
            <View
              key={p}
              style={[
                styles.permBadge,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Text style={{ fontSize: 11, color: colors.primary }}>{p}</Text>
            </View>
          ))}
        </View>
      )}
      {item.is_active && (
        <TouchableOpacity
          style={[styles.revokeBtn, { borderColor: colors.error }]}
          onPress={onRevoke}
        >
          <Ionicons name="close-circle" size={14} color={colors.error} />
          <Text style={[styles.revokeBtnText, { color: colors.error }]}>
            {t("devStore.revoke")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function APIKeysScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { apiKeys, apiKeysLoading, fetchAPIKeys, createAPIKey, revokeAPIKey } =
    useDevStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAPIKeys();
  }, [fetchAPIKeys]);

  const onRefresh = useCallback(() => fetchAPIKeys(), [fetchAPIKeys]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) {
      Alert.alert(t("devStore.error"), t("devStore.nameRequired"));
      return;
    }
    setCreating(true);
    try {
      const key = await createAPIKey(newName.trim(), ["read", "write"]);
      Alert.alert(
        t("devStore.keyCreated"),
        `${t("devStore.keyCreatedMsg")}\n\n${key.key_prefix}••••••••`,
      );
      setNewName("");
      setShowCreate(false);
    } catch (e) {
      Alert.alert(
        t("devStore.error"),
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setCreating(false);
    }
  }, [newName, createAPIKey, t]);

  const handleRevoke = useCallback(
    (id: string) => {
      Alert.alert(t("devStore.revokeConfirm"), t("devStore.revokeConfirmMsg"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("devStore.revoke"),
          style: "destructive",
          onPress: () => revokeAPIKey(id),
        },
      ]);
    },
    [revokeAPIKey, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: DevAPIKey }) => (
      <KeyCard
        item={item}
        colors={colors}
        t={t}
        onRevoke={() => handleRevoke(item.id)}
      />
    ),
    [colors, t, handleRevoke],
  );

  return (
    <View
      testID="api-keys-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* ── Create button / form ───────────────────────────── */}
      {showCreate ? (
        <View style={[styles.createForm, { backgroundColor: colors.surface }]}>
          <TextInput
            testID="input-key-name"
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={newName}
            onChangeText={setNewName}
            placeholder={t("devStore.keyNamePlaceholder")}
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.createBtns}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => setShowCreate(false)}
            >
              <Text style={{ color: colors.text }}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-create-key"
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: creating ? 0.6 : 1,
                },
              ]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {creating ? "..." : t("devStore.create")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          testID="btn-show-create"
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreate(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            {t("devStore.newKey")}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={apiKeys}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={apiKeysLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          apiKeysLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 60 }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔑</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("devStore.noKeys")}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                {t("devStore.noKeysSub")}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },
  createForm: { margin: 16, padding: 14, borderRadius: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  createBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  confirmBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  keyCard: { borderRadius: 12, padding: 14, marginBottom: 10 },
  keyHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  keyName: { fontSize: 15, fontWeight: "700" },
  keyPrefix: { fontSize: 12, fontFamily: "monospace", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  keyMeta: { flexDirection: "row", gap: 16, marginTop: 8 },
  keyDate: { fontSize: 11 },
  permsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  permBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  revokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  revokeBtnText: { fontSize: 13, fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, marginTop: 4, textAlign: "center" },
});
