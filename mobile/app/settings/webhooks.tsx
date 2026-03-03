/**
 * Webhooks Management Screen
 *
 * Create, edit, disable, and delete webhooks with event selection.
 */

import { useAdvancedSettings } from "@/hooks/useAdvancedSettings";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { Webhook, WebhookEvent } from "@/types/advanced-settings";
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

const ALL_EVENTS: { value: WebhookEvent; emoji: string; labelKey: string }[] = [
  {
    value: "message.new",
    emoji: "💬",
    labelKey: "advancedSettings.eventNewMessage",
  },
  {
    value: "message.edited",
    emoji: "✏️",
    labelKey: "advancedSettings.eventEditedMessage",
  },
  {
    value: "message.deleted",
    emoji: "🗑️",
    labelKey: "advancedSettings.eventDeletedMessage",
  },
  {
    value: "user.joined",
    emoji: "👋",
    labelKey: "advancedSettings.eventUserJoined",
  },
  {
    value: "user.left",
    emoji: "🚪",
    labelKey: "advancedSettings.eventUserLeft",
  },
  {
    value: "call.started",
    emoji: "📞",
    labelKey: "advancedSettings.eventCallStarted",
  },
  {
    value: "call.ended",
    emoji: "📴",
    labelKey: "advancedSettings.eventCallEnded",
  },
  {
    value: "bot.command",
    emoji: "🤖",
    labelKey: "advancedSettings.eventBotCommand",
  },
  {
    value: "file.uploaded",
    emoji: "📎",
    labelKey: "advancedSettings.eventFileUploaded",
  },
];

export default function WebhooksSettingsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    webhooks,
    addWebhook,
    removeWebhook,
    toggleWebhook,
    updateWebhookEvents,
  } = useAdvancedSettings();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<WebhookEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim() || newEvents.length === 0) return;
    addWebhook({
      id: `wh-${Date.now()}`,
      name: newName.trim(),
      url: newUrl.trim(),
      events: newEvents,
      enabled: true,
      createdAt: new Date().toISOString(),
    });
    setNewName("");
    setNewUrl("");
    setNewEvents([]);
    setShowAdd(false);
  };

  const toggleEvent = (event: WebhookEvent) => {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const confirmDelete = (wh: Webhook) => {
    Alert.alert(
      t("advancedSettings.deleteWebhook"),
      `${t("advancedSettings.deleteWebhookConfirm")} "${wh.name}" ?`,
      [
        { text: t("advancedSettings.cancel"), style: "cancel" },
        {
          text: t("advancedSettings.delete"),
          style: "destructive",
          onPress: () => removeWebhook(wh.id),
        },
      ],
    );
  };

  return (
    <ScrollView
      testID="webhooks-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── Webhook List ────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.webhooksList")}
      </Text>

      {webhooks.length === 0 && !showAdd && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.emptyRow}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("advancedSettings.noWebhooks")}
            </Text>
          </View>
        </View>
      )}

      {webhooks.map((wh) => {
        const isExpanded = expandedId === wh.id;
        return (
          <View
            key={wh.id}
            style={[
              styles.card,
              { backgroundColor: colors.surface, marginBottom: 10 },
            ]}
          >
            <TouchableOpacity
              testID={`wh-${wh.id}`}
              style={styles.whRow}
              onPress={() => setExpandedId(isExpanded ? null : wh.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.whName, { color: colors.text }]}>
                  {wh.name}
                </Text>
                <Text
                  style={[styles.whUrl, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {wh.url}
                </Text>
                <Text style={[styles.whEvents, { color: colors.textMuted }]}>
                  {wh.events.length} {t("advancedSettings.events")}
                </Text>
              </View>
              <Switch
                value={wh.enabled}
                onValueChange={(v) => toggleWebhook(wh.id, v)}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.expandedSection}>
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
                <Text style={[styles.expandLabel, { color: colors.text }]}>
                  {t("advancedSettings.subscribedEvents")}
                </Text>
                <View style={styles.eventsGrid}>
                  {ALL_EVENTS.map((evt) => {
                    const isSubscribed = wh.events.includes(evt.value);
                    return (
                      <TouchableOpacity
                        key={evt.value}
                        testID={`wh-evt-${wh.id}-${evt.value}`}
                        style={[
                          styles.eventChip,
                          {
                            backgroundColor: isSubscribed
                              ? colors.primary + "20"
                              : colors.background,
                            borderColor: isSubscribed
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => {
                          const updated = isSubscribed
                            ? wh.events.filter((e) => e !== evt.value)
                            : [...wh.events, evt.value];
                          updateWebhookEvents(wh.id, updated);
                        }}
                      >
                        <Text style={{ fontSize: 12 }}>{evt.emoji}</Text>
                        <Text
                          style={[
                            styles.eventChipText,
                            {
                              color: isSubscribed
                                ? colors.primary
                                : colors.text,
                            },
                          ]}
                        >
                          {t(evt.labelKey)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity
                  testID={`delete-wh-${wh.id}`}
                  style={[styles.deleteBtn, { borderColor: colors.error }]}
                  onPress={() => confirmDelete(wh)}
                >
                  <Text style={[styles.deleteBtnText, { color: colors.error }]}>
                    {t("advancedSettings.deleteWebhook")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {/* ─── Add Webhook Form ────────────────────────────── */}
      {showAdd ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.addForm}>
            <Text style={[styles.addFormTitle, { color: colors.text }]}>
              {t("advancedSettings.newWebhook")}
            </Text>
            <TextInput
              testID="input-wh-name"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder={t("advancedSettings.webhookName")}
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              testID="input-wh-url"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="https://example.com/webhook"
              placeholderTextColor={colors.textMuted}
              value={newUrl}
              onChangeText={setNewUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.eventsSectionLabel, { color: colors.text }]}>
              {t("advancedSettings.selectEvents")}
            </Text>
            <View style={styles.eventsGrid}>
              {ALL_EVENTS.map((evt) => {
                const isSelected = newEvents.includes(evt.value);
                return (
                  <TouchableOpacity
                    key={evt.value}
                    testID={`new-evt-${evt.value}`}
                    style={[
                      styles.eventChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + "20"
                          : colors.background,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => toggleEvent(evt.value)}
                  >
                    <Text style={{ fontSize: 12 }}>{evt.emoji}</Text>
                    <Text
                      style={[
                        styles.eventChipText,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {t(evt.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.addFormBtns}>
              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowAdd(false);
                  setNewName("");
                  setNewUrl("");
                  setNewEvents([]);
                }}
              >
                <Text style={{ color: colors.text }}>
                  {t("advancedSettings.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-save-webhook"
                style={[styles.formBtn, { backgroundColor: colors.primary }]}
                onPress={handleAdd}
              >
                <Text style={{ color: "#fff" }}>
                  {t("advancedSettings.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          testID="btn-add-webhook"
          style={[
            styles.addCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setShowAdd(true)}
        >
          <Text style={[styles.addCardText, { color: colors.primary }]}>
            + {t("advancedSettings.addWebhook")}
          </Text>
        </TouchableOpacity>
      )}
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
  divider: { height: StyleSheet.hairlineWidth },
  emptyRow: { padding: 14 },
  emptyText: { fontSize: 14, fontStyle: "italic" },
  whRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  whName: { fontSize: 15, fontWeight: "600" },
  whUrl: { fontSize: 12, fontFamily: "monospace", marginTop: 2 },
  whEvents: { fontSize: 11, marginTop: 4 },
  expandedSection: { padding: 14, paddingTop: 0 },
  expandLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  eventsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  eventChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  eventChipText: { fontSize: 11, fontWeight: "500" },
  deleteBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  deleteBtnText: { fontSize: 14, fontWeight: "600" },
  addCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addCardText: { fontSize: 14, fontWeight: "600" },
  addForm: { padding: 14, gap: 10 },
  addFormTitle: { fontSize: 16, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  eventsSectionLabel: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  addFormBtns: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 4,
  },
  formBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
