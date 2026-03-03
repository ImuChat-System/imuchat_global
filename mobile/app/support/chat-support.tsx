/**
 * Chat Support Humain Screen
 *
 * Features:
 * - Live chat with support agent
 * - Waiting queue indicator
 * - Message list
 * - Send text messages
 * - Satisfaction rating after session ends
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RATINGS = [
  { value: 1, emoji: "😡" },
  { value: 2, emoji: "😞" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "😊" },
  { value: 5, emoji: "🤩" },
];

export default function ChatSupportScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const {
    chatSession,
    startChatSession,
    addChatMessage,
    endChatSession,
    setChatRating,
    isChatActive,
  } = useSupport();

  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const handleStartChat = () => {
    startChatSession({
      id: `chat-${Date.now()}`,
      userId: "current-user",
      status: "waiting",
      messages: [],
      startedAt: new Date().toISOString(),
    });
  };

  const handleSend = () => {
    if (!messageText.trim() || !chatSession) return;
    addChatMessage({
      id: `cmsg-${Date.now()}`,
      senderId: "current-user",
      senderName: "Moi",
      isAgent: false,
      body: messageText.trim(),
      createdAt: new Date().toISOString(),
    });
    setMessageText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEndChat = () => {
    Alert.alert(t("support.endChatTitle"), t("support.endChatMessage"), [
      { text: t("support.cancel"), style: "cancel" },
      {
        text: t("support.confirm"),
        onPress: endChatSession,
        style: "destructive",
      },
    ]);
  };

  const handleRate = (rating: number) => {
    setChatRating(rating);
    Alert.alert(t("support.thankYou"), t("support.ratingThanks"));
  };

  // ── No active session ────────────────────────────────────────
  if (!chatSession) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={{ fontSize: 48 }}>💬</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {t("support.chatSupportTitle")}
        </Text>
        <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
          {t("support.chatSupportDesc")}
        </Text>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={handleStartChat}
        >
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.startBtnText}>{t("support.startChat")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Session ended — Rating ───────────────────────────────────
  if (chatSession.status === "ended") {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={{ fontSize: 48 }}>✅</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {t("support.chatEnded")}
        </Text>

        {chatSession.rating == null ? (
          <>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              {t("support.rateExperience")}
            </Text>
            <View style={styles.ratingRow}>
              {RATINGS.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => handleRate(r.value)}
                >
                  <Text style={{ fontSize: 36 }}>{r.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            {t("support.ratingSubmitted", { rating: chatSession.rating })}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.startBtn,
            { backgroundColor: colors.primary, marginTop: 16 },
          ]}
          onPress={handleStartChat}
        >
          <Text style={styles.startBtnText}>{t("support.newChat")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Active / Waiting session ─────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Status bar */}
      <View style={[styles.statusBar, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                chatSession.status === "connected" ? "#10B981" : "#F59E0B",
            },
          ]}
        />
        <Text style={[styles.statusLabel, { color: colors.text }]}>
          {chatSession.status === "waiting"
            ? t("support.waitingForAgent")
            : t("support.connectedTo", {
                name: chatSession.agentName || "Agent",
              })}
        </Text>
        <TouchableOpacity onPress={handleEndChat}>
          <Ionicons
            name="close-circle"
            size={24}
            color={colors.error || "#EF4444"}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={chatSession.messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              {chatSession.status === "waiting"
                ? t("support.waitingMessage")
                : t("support.startConversation")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.msgBubble,
              {
                backgroundColor: item.isAgent
                  ? colors.surface
                  : colors.primary + "20",
                alignSelf: item.isAgent ? "flex-start" : "flex-end",
              },
            ]}
          >
            {item.isAgent && (
              <Text style={[styles.agentName, { color: colors.primary }]}>
                {item.senderName}
              </Text>
            )}
            <Text style={[styles.msgText, { color: colors.text }]}>
              {item.body}
            </Text>
            <Text style={[styles.msgTime, { color: colors.textMuted }]}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[
            styles.msgInput,
            { color: colors.text, backgroundColor: colors.background },
          ]}
          placeholder={t("support.typeMessage")}
          placeholderTextColor={colors.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity onPress={handleSend} disabled={!messageText.trim()}>
          <Ionicons
            name="send"
            size={24}
            color={messageText.trim() ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  startBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  ratingRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  messageList: { padding: 16, gap: 8, flexGrow: 1 },
  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  msgBubble: {
    maxWidth: "80%",
    borderRadius: 12,
    padding: 10,
    gap: 2,
    marginBottom: 6,
  },
  agentName: { fontSize: 12, fontWeight: "600" },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTime: { fontSize: 10, alignSelf: "flex-end" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#0001",
  },
  msgInput: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    maxHeight: 100,
    fontSize: 14,
  },
});
