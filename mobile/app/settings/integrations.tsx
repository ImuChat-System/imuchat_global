/**
 * API & Integrations Settings Screen
 *
 * Manage third-party integrations, API keys, and connected services.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { IntegrationProvider } from "@/types/advanced-settings";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PROVIDERS: {
  id: IntegrationProvider;
  name: string;
  emoji: string;
  desc: string;
}[] = [
  {
    id: "google",
    name: "Google",
    emoji: "🔵",
    desc: "Drive, Calendar, Contacts",
  },
  {
    id: "github",
    name: "GitHub",
    emoji: "🐙",
    desc: "Repos, Issues, Notifications",
  },
  { id: "notion", name: "Notion", emoji: "📓", desc: "Pages, Databases" },
  { id: "slack", name: "Slack", emoji: "💬", desc: "Messages, Channels" },
  { id: "discord", name: "Discord", emoji: "🎮", desc: "Servers, Channels" },
  { id: "trello", name: "Trello", emoji: "📋", desc: "Boards, Cards" },
  { id: "jira", name: "Jira", emoji: "🔷", desc: "Issues, Sprints" },
  { id: "openai", name: "OpenAI", emoji: "🤖", desc: "GPT, DALL-E" },
  { id: "spotify", name: "Spotify", emoji: "🎵", desc: "Music, Playlists" },
  { id: "custom", name: "Custom", emoji: "🔧", desc: "Custom REST API" },
];

export default function IntegrationsSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    apiKeys,
    integrations,
    addApiKey,
    removeApiKey,
    addIntegration,
    removeIntegration,
    toggleIntegration,
  } = useAdvancedSettings();

  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");

  const handleAddKey = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) return;
    addApiKey({
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      key: newKeyValue.trim(),
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      expiresAt: null,
      scopes: [],
      isActive: true,
    });
    setNewKeyName("");
    setNewKeyValue("");
    setShowAddKey(false);
  };

  const confirmRemoveKey = (id: string, name: string) => {
    Alert.alert(
      t("advancedSettings.removeApiKey"),
      `${t("advancedSettings.removeApiKeyConfirm")} "${name}" ?`,
      [
        { text: t("advancedSettings.cancel"), style: "cancel" },
        {
          text: t("advancedSettings.remove"),
          style: "destructive",
          onPress: () => removeApiKey(id),
        },
      ],
    );
  };

  const handleConnectProvider = (provider: IntegrationProvider) => {
    const existing = integrations.find((i) => i.provider === provider);
    if (existing) {
      toggleIntegration(existing.id, !existing.isConnected);
      return;
    }
    addIntegration({
      id: `int-${Date.now()}`,
      provider,
      name: PROVIDERS.find((p) => p.id === provider)?.name ?? provider,
      isConnected: true,
      connectedAt: new Date().toISOString(),
      scopes: [],
      avatarUrl: null,
    });
  };

  const confirmDisconnect = (id: string, name: string) => {
    Alert.alert(
      t("advancedSettings.disconnectIntegration"),
      `${t("advancedSettings.disconnectConfirm")} ${name} ?`,
      [
        { text: t("advancedSettings.cancel"), style: "cancel" },
        {
          text: t("advancedSettings.disconnect"),
          style: "destructive",
          onPress: () => removeIntegration(id),
        },
      ],
    );
  };

  return (
    <ScrollView
      testID="integrations-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── API Keys ────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.apiKeys")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {apiKeys.length === 0 && !showAddKey && (
          <View style={styles.emptyRow}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("advancedSettings.noApiKeys")}
            </Text>
          </View>
        )}

        {apiKeys.map((key) => (
          <View key={key.id} style={styles.keyRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.keyName, { color: colors.text }]}>
                {key.name}
              </Text>
              <Text style={[styles.keyValue, { color: colors.textMuted }]}>
                {key.key.substring(0, 8)}••••••••
              </Text>
            </View>
            <TouchableOpacity
              testID={`remove-key-${key.id}`}
              onPress={() => confirmRemoveKey(key.id, key.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.removeBtn, { color: colors.error }]}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {showAddKey ? (
          <View style={styles.addForm}>
            <TextInput
              testID="input-key-name"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder={t("advancedSettings.keyName")}
              placeholderTextColor={colors.textMuted}
              value={newKeyName}
              onChangeText={setNewKeyName}
            />
            <TextInput
              testID="input-key-value"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder={t("advancedSettings.keyValue")}
              placeholderTextColor={colors.textMuted}
              value={newKeyValue}
              onChangeText={setNewKeyValue}
              secureTextEntry
            />
            <View style={styles.addFormBtns}>
              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: colors.border }]}
                onPress={() => setShowAddKey(false)}
              >
                <Text style={{ color: colors.text }}>
                  {t("advancedSettings.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-save-key"
                style={[styles.formBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddKey}
              >
                <Text style={{ color: "#fff" }}>
                  {t("advancedSettings.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            testID="btn-add-key"
            style={[styles.addBtn, { borderColor: colors.border }]}
            onPress={() => setShowAddKey(true)}
          >
            <Text style={[styles.addBtnText, { color: colors.primary }]}>
              + {t("advancedSettings.addApiKey")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Connected integrations ──────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.integrations")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {PROVIDERS.map((p, idx) => {
          const connected = integrations.find((i) => i.provider === p.id);
          return (
            <View key={p.id}>
              <View style={styles.providerRow}>
                <Text style={styles.providerEmoji}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.providerName, { color: colors.text }]}>
                    {p.name}
                  </Text>
                  <Text
                    style={[styles.providerDesc, { color: colors.textMuted }]}
                  >
                    {p.desc}
                  </Text>
                </View>
                {connected ? (
                  <View style={styles.providerActions}>
                    <Switch
                      value={connected.isConnected}
                      onValueChange={(v) => toggleIntegration(connected.id, v)}
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                    />
                    <TouchableOpacity
                      testID={`disconnect-${p.id}`}
                      onPress={() => confirmDisconnect(connected.id, p.name)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text
                        style={[styles.disconnectText, { color: colors.error }]}
                      >
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    testID={`connect-${p.id}`}
                    style={[styles.connectBtn, { borderColor: colors.primary }]}
                    onPress={() => handleConnectProvider(p.id)}
                  >
                    <Text
                      style={[styles.connectText, { color: colors.primary }]}
                    >
                      {t("advancedSettings.connect")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {idx < PROVIDERS.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: 12, overflow: "hidden" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  emptyRow: { padding: 14 },
  emptyText: { fontSize: 14, fontStyle: "italic" },
  keyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  keyName: { fontSize: 15, fontWeight: "500" },
  keyValue: { fontSize: 12, fontFamily: "monospace", marginTop: 2 },
  removeBtn: { fontSize: 16, fontWeight: "700" },
  addBtn: {
    margin: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
  addBtnText: { fontSize: 14, fontWeight: "600" },
  addForm: { padding: 14, gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  addFormBtns: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  formBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  providerEmoji: { fontSize: 24 },
  providerName: { fontSize: 15, fontWeight: "500" },
  providerDesc: { fontSize: 12, marginTop: 2 },
  providerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  disconnectText: { fontSize: 16, fontWeight: "700" },
  connectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  connectText: { fontSize: 13, fontWeight: "600" },
});
