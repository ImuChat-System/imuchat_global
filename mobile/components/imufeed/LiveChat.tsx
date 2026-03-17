/**
 * LiveChat — Chat overlay transparent pour le live streaming
 *
 * Affiche les messages en temps réel sur le flux live.
 * Scroll auto, messages éphémères, indicateur de rôle (host/mod/sub).
 *
 * Sprint S16 — Live UI Streamer & Viewer
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { LiveChatMessage, LiveUserRole } from "@/types/live-streaming";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Role Badges ──────────────────────────────────────────────

const ROLE_BADGES: Record<
  LiveUserRole,
  { label: string; color: string } | null
> = {
  host: { label: "HOST", color: "#FF4444" },
  cohost: { label: "CO-HOST", color: "#FF8800" },
  moderator: { label: "MOD", color: "#44BB44" },
  subscriber: { label: "SUB", color: "#AA44FF" },
  viewer: null,
};

// ─── Props ────────────────────────────────────────────────────

export interface LiveChatProps {
  messages: LiveChatMessage[];
  pinnedMessage: LiveChatMessage | null;
  onSendMessage: (content: string) => void;
  onPinMessage?: (messageId: string) => void;
  isHost: boolean;
  chatEnabled: boolean;
  /** Max visible height as percentage of screen */
  maxHeightPercent?: number;
}

// ─── Chat Message Item ────────────────────────────────────────

interface ChatMessageItemProps {
  message: LiveChatMessage;
  isHost: boolean;
  onPinMessage?: (messageId: string) => void;
}

const ChatMessageItem = React.memo(function ChatMessageItem({
  message,
  isHost,
  onPinMessage,
}: ChatMessageItemProps) {
  const badge = ROLE_BADGES[message.role];

  return (
    <TouchableOpacity
      testID={`chat-message-${message.id}`}
      style={styles.messageRow}
      onLongPress={() => isHost && onPinMessage?.(message.id)}
      activeOpacity={0.7}
    >
      {badge && (
        <View
          testID={`role-badge-${message.role}`}
          style={[styles.roleBadge, { backgroundColor: badge.color }]}
        >
          <Text style={styles.roleBadgeText}>{badge.label}</Text>
        </View>
      )}
      <Text style={styles.messageText}>
        <Text style={styles.userName}>{message.userName} </Text>
        {message.type === "donation" && message.donationAmount ? (
          <Text style={styles.donationText}>
            💰 {message.donationAmount} IC — {message.content}
          </Text>
        ) : (
          message.content
        )}
      </Text>
    </TouchableOpacity>
  );
});

// ─── Pinned Message ───────────────────────────────────────────

function PinnedMessage({
  message,
  onUnpin,
  isHost,
}: {
  message: LiveChatMessage;
  onUnpin: () => void;
  isHost: boolean;
}) {
  return (
    <View testID="pinned-message" style={styles.pinnedContainer}>
      <Ionicons name="pin" size={14} color="#FFD700" />
      <Text style={styles.pinnedText} numberOfLines={2}>
        <Text style={styles.pinnedUserName}>{message.userName}: </Text>
        {message.content}
      </Text>
      {isHost && (
        <TouchableOpacity testID="unpin-button" onPress={onUnpin}>
          <Ionicons name="close-circle" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function LiveChat({
  messages,
  pinnedMessage,
  onSendMessage,
  onPinMessage,
  isHost,
  chatEnabled,
  maxHeightPercent = 40,
}: LiveChatProps) {
  const colors = useColors();
  const { t } = useI18n();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText("");
  }, [inputText, onSendMessage]);

  const renderItem = useCallback(
    ({ item }: { item: LiveChatMessage }) => (
      <ChatMessageItem
        message={item}
        isHost={isHost}
        onPinMessage={onPinMessage}
      />
    ),
    [isHost, onPinMessage],
  );

  const keyExtractor = useCallback((item: LiveChatMessage) => item.id, []);

  return (
    <KeyboardAvoidingView
      testID="live-chat"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { maxHeight: `${maxHeightPercent}%` as any }]}
    >
      {/* Pinned message */}
      {pinnedMessage && (
        <PinnedMessage
          message={pinnedMessage}
          onUnpin={() => onPinMessage?.("")}
          isHost={isHost}
        />
      )}

      {/* Message list */}
      <FlatList
        ref={flatListRef}
        testID="chat-message-list"
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted={false}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        style={styles.messageList}
      />

      {/* Input bar */}
      {chatEnabled ? (
        <View testID="chat-input-bar" style={styles.inputBar}>
          <TextInput
            testID="chat-input"
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("live.chatPlaceholder", {
              defaultValue: "Dire quelque chose...",
            })}
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={200}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            testID="chat-send-button"
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View testID="chat-disabled" style={styles.chatDisabled}>
          <Text style={styles.chatDisabledText}>
            {t("live.chatDisabled", { defaultValue: "Le chat est désactivé" })}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  messageList: {
    flexGrow: 0,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    gap: 4,
  },
  roleBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexShrink: 1,
  },
  userName: {
    fontWeight: "700",
    color: "#fff",
  },
  donationText: {
    color: "#FFD700",
    fontWeight: "600",
  },
  pinnedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    gap: 6,
  },
  pinnedText: {
    color: "#fff",
    fontSize: 13,
    flex: 1,
  },
  pinnedUserName: {
    fontWeight: "700",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 4,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  chatDisabled: {
    alignItems: "center",
    paddingVertical: 8,
  },
  chatDisabledText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontStyle: "italic",
  },
});
