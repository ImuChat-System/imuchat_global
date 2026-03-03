/**
 * Tickets Support Screen
 *
 * Features:
 * - List open/closed tickets with status badges
 * - Create new ticket form
 * - View ticket detail with message thread
 * - Add reply to ticket
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/support";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "#3B82F6",
  "in-progress": "#F59E0B",
  waiting: "#8B5CF6",
  resolved: "#10B981",
  closed: "#6B7280",
};

const STATUS_ICONS: Record<TicketStatus, string> = {
  open: "ellipse-outline",
  "in-progress": "time-outline",
  waiting: "hourglass-outline",
  resolved: "checkmark-circle-outline",
  closed: "close-circle-outline",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: "#6B7280",
  medium: "#3B82F6",
  high: "#F59E0B",
  urgent: "#EF4444",
};

const CATEGORIES: { key: TicketCategory; label: string }[] = [
  { key: "bug", label: "🐛 Bug" },
  { key: "feature-request", label: "💡 Feature" },
  { key: "account", label: "👤 Compte" },
  { key: "billing", label: "💳 Paiement" },
  { key: "security", label: "🔒 Sécurité" },
  { key: "other", label: "📋 Autre" },
];

const PRIORITIES: { key: TicketPriority; label: string }[] = [
  { key: "low", label: "Basse" },
  { key: "medium", label: "Moyenne" },
  { key: "high", label: "Haute" },
  { key: "urgent", label: "Urgente" },
];

export default function TicketsScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    tickets,
    addTicket,
    currentTicket,
    setCurrentTicket,
    addTicketMessage,
  } = useSupport();

  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<TicketCategory>("bug");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [replyText, setReplyText] = useState("");

  const handleCreateTicket = () => {
    if (!subject.trim() || !body.trim()) {
      Alert.alert(t("support.error"), t("support.fillAllFields"));
      return;
    }
    const now = new Date().toISOString();
    const newTicket = {
      id: `ticket-${Date.now()}`,
      userId: "current-user",
      subject: subject.trim(),
      category,
      priority,
      status: "open" as const,
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: `ticket-${Date.now()}`,
          senderId: "current-user",
          senderName: "Moi",
          isStaff: false,
          body: body.trim(),
          attachments: [],
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    addTicket(newTicket);
    setSubject("");
    setBody("");
    setShowCreate(false);
  };

  const handleReply = () => {
    if (!replyText.trim() || !currentTicket) return;
    addTicketMessage(currentTicket.id, {
      id: `msg-${Date.now()}`,
      ticketId: currentTicket.id,
      senderId: "current-user",
      senderName: "Moi",
      isStaff: false,
      body: replyText.trim(),
      attachments: [],
      createdAt: new Date().toISOString(),
    });
    setReplyText("");
  };

  // ── Ticket Detail View ───────────────────────────────────────
  if (currentTicket) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <TouchableOpacity
            style={[styles.backRow, { backgroundColor: colors.surface }]}
            onPress={() => setCurrentTicket(null)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 14 }}>
              {t("support.backToTickets")}
            </Text>
          </TouchableOpacity>

          <View
            style={[styles.ticketDetail, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.ticketDetailSubject, { color: colors.text }]}>
              {currentTicket.subject}
            </Text>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: STATUS_COLORS[currentTicket.status] + "20",
                  },
                ]}
              >
                <Ionicons
                  name={STATUS_ICONS[currentTicket.status] as any}
                  size={14}
                  color={STATUS_COLORS[currentTicket.status]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[currentTicket.status] },
                  ]}
                >
                  {t(`support.status.${currentTicket.status}`)}
                </Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      PRIORITY_COLORS[currentTicket.priority] + "20",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: PRIORITY_COLORS[currentTicket.priority],
                  }}
                >
                  {t(`support.priority.${currentTicket.priority}`)}
                </Text>
              </View>
            </View>
          </View>

          {/* Messages */}
          {currentTicket.messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.msgBubble,
                {
                  backgroundColor: msg.isStaff
                    ? colors.primary + "15"
                    : colors.surface,
                  alignSelf: msg.isStaff ? "flex-start" : "flex-end",
                },
              ]}
            >
              <Text
                style={[
                  styles.msgSender,
                  { color: msg.isStaff ? colors.primary : colors.text },
                ]}
              >
                {msg.senderName} {msg.isStaff ? "👤 Staff" : ""}
              </Text>
              <Text style={[styles.msgBody, { color: colors.text }]}>
                {msg.body}
              </Text>
              <Text style={[styles.msgTime, { color: colors.textMuted }]}>
                {new Date(msg.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Reply input */}
        {currentTicket.status !== "closed" &&
          currentTicket.status !== "resolved" && (
            <View
              style={[styles.replyBar, { backgroundColor: colors.surface }]}
            >
              <TextInput
                style={[
                  styles.replyInput,
                  { color: colors.text, backgroundColor: colors.background },
                ]}
                placeholder={t("support.typeReply")}
                placeholderTextColor={colors.textMuted}
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />
              <TouchableOpacity
                onPress={handleReply}
                disabled={!replyText.trim()}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={replyText.trim() ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  }

  // ── Ticket List View ─────────────────────────────────────────
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Create button */}
      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreate(!showCreate)}
      >
        <Ionicons name={showCreate ? "close" : "add"} size={20} color="#fff" />
        <Text style={styles.createBtnText}>
          {showCreate ? t("support.cancel") : t("support.newTicket")}
        </Text>
      </TouchableOpacity>

      {/* Create form */}
      {showCreate && (
        <View style={[styles.createForm, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder={t("support.ticketSubject")}
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />

          {/* Category */}
          <Text style={[styles.formLabel, { color: colors.text }]}>
            {t("support.ticketCategory")}
          </Text>
          <View style={styles.optionGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      category === cat.key ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: category === cat.key ? "#fff" : colors.text,
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority */}
          <Text style={[styles.formLabel, { color: colors.text }]}>
            {t("support.ticketPriority")}
          </Text>
          <View style={styles.optionGrid}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      priority === p.key
                        ? PRIORITY_COLORS[p.key]
                        : colors.background,
                  },
                ]}
                onPress={() => setPriority(p.key)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: priority === p.key ? "#fff" : colors.text,
                  }}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Body */}
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder={t("support.ticketDescription")}
            placeholderTextColor={colors.textMuted}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={5}
          />

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleCreateTicket}
          >
            <Text style={styles.submitBtnText}>
              {t("support.submitTicket")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Ticket list */}
      {tickets.length === 0 && !showCreate ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 32 }}>🎫</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("support.noTickets")}
          </Text>
        </View>
      ) : (
        tickets.map((ticket) => (
          <TouchableOpacity
            key={ticket.id}
            style={[styles.ticketCard, { backgroundColor: colors.surface }]}
            onPress={() => setCurrentTicket(ticket)}
            activeOpacity={0.7}
          >
            <View style={styles.ticketHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ticketSubject, { color: colors.text }]}>
                  {ticket.subject}
                </Text>
                <Text style={[styles.ticketMeta, { color: colors.textMuted }]}>
                  {new Date(ticket.createdAt).toLocaleDateString()} ·{" "}
                  {ticket.messages.length} {t("support.messages")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[ticket.status] + "20" },
                  ]}
                >
                  <Ionicons
                    name={STATUS_ICONS[ticket.status] as any}
                    size={12}
                    color={STATUS_COLORS[ticket.status]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[ticket.status] },
                    ]}
                  >
                    {t(`support.status.${ticket.status}`)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor: PRIORITY_COLORS[ticket.priority] + "20",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: PRIORITY_COLORS[ticket.priority],
                    }}
                  >
                    {t(`support.priority.${ticket.priority}`)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  createBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  createForm: { borderRadius: 12, padding: 16, gap: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  formLabel: { fontSize: 13, fontWeight: "600" },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  submitBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  ticketCard: { borderRadius: 12, padding: 14 },
  ticketHeader: { flexDirection: "row", gap: 10 },
  ticketSubject: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  ticketMeta: { fontSize: 12 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  ticketDetail: { borderRadius: 12, padding: 14, gap: 8 },
  ticketDetailSubject: { fontSize: 16, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: 8 },
  msgBubble: {
    maxWidth: "85%",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  msgSender: { fontSize: 12, fontWeight: "600" },
  msgBody: { fontSize: 14, lineHeight: 20 },
  msgTime: { fontSize: 11, alignSelf: "flex-end" },
  replyBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#0001",
  },
  replyInput: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    maxHeight: 100,
    fontSize: 14,
  },
});
