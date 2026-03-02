/**
 * AliceChatScreen — Écran de conversation avec Alice
 *
 * Interface de chat :
 *  - Liste de messages scrollable (bulles user / assistant)
 *  - Barre de saisie avec bouton envoi
 *  - Indicateur de chargement pendant la réponse
 *  - Nom du persona actif en sous-titre
 *  - Accès rapide aux settings
 *
 * Phase 3 — DEV-024 Module IA
 */

import { useAlice } from "@/hooks/useAlice";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { AliceMessage } from "@/services/alice";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Persona Display Info ─────────────────────────────────────
const PERSONA_INFO: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  general: { label: "Alice", color: "#8B5CF6", icon: "sparkles" },
  health: { label: "Santé", color: "#EF4444", icon: "heart" },
  study: { label: "Études", color: "#3B82F6", icon: "school" },
  style: { label: "Style", color: "#EC4899", icon: "shirt" },
  pro: { label: "Pro", color: "#F59E0B", icon: "briefcase" },
  code: { label: "Code", color: "#10B981", icon: "code-slash" },
  creative: { label: "Créatif", color: "#6366F1", icon: "color-palette" },
};

// ─── Component ────────────────────────────────────────────────
export default function AliceChatScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");

  const {
    isLoading,
    error,
    currentConversation,
    selectedPersona,
    providerSettings,
    sendMessage,
    retryLastMessage,
    clearError,
  } = useAlice();

  const persona = PERSONA_INFO[selectedPersona] || PERSONA_INFO.general;
  const messages = currentConversation?.messages || [];

  // ─── Navigation Header ───────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerCenter}>
          <Ionicons
            name={persona.icon as keyof typeof Ionicons.glyphMap}
            size={16}
            color={persona.color}
          />
          <Text style={[styles.headerName, { color: colors.text }]}>
            Alice — {persona.label}
          </Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push("/alice/settings")}
          style={styles.headerBtn}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, persona, colors, router]);

  // ─── Auto-scroll on new message ──────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // ─── Send Message ────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText("");
    await sendMessage(text);
  }, [inputText, isLoading, sendMessage]);

  // ─── Render Message Bubble ───────────────────────────────
  const renderMessage = useCallback(
    ({ item }: { item: AliceMessage }) => {
      const isUser = item.role === "user";
      return (
        <View
          style={[
            styles.messageBubbleWrapper,
            isUser
              ? styles.messageBubbleWrapperUser
              : styles.messageBubbleWrapperAssistant,
          ]}
        >
          {!isUser && (
            <View
              style={[
                styles.avatarBubble,
                { backgroundColor: persona.color + "20" },
              ]}
            >
              <Ionicons
                name={persona.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={persona.color}
              />
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isUser
                ? [
                    styles.messageBubbleUser,
                    { backgroundColor: colors.primary },
                  ]
                : [
                    styles.messageBubbleAssistant,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ],
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: isUser ? "#fff" : colors.text,
                },
              ]}
            >
              {item.content}
            </Text>
            {item.timestamp && (
              <Text
                style={[
                  styles.messageTime,
                  {
                    color: isUser ? "rgba(255,255,255,0.6)" : colors.textMuted,
                  },
                ]}
              >
                {new Date(item.timestamp).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [colors, persona],
  );

  // ─── Empty State ─────────────────────────────────────────
  const EmptyChat = () => (
    <View style={styles.emptyChatContainer}>
      <View
        style={[
          styles.emptyChatIcon,
          { backgroundColor: persona.color + "15" },
        ]}
      >
        <Ionicons
          name={persona.icon as keyof typeof Ionicons.glyphMap}
          size={40}
          color={persona.color}
        />
      </View>
      <Text style={[styles.emptyChatTitle, { color: colors.text }]}>
        {t("alice.chatEmptyTitle") || `Parlez avec Alice — ${persona.label}`}
      </Text>
      <Text style={[styles.emptyChatSubtitle, { color: colors.textMuted }]}>
        {t("alice.chatEmptySubtitle") ||
          "Posez une question, demandez un conseil ou explorez un sujet."}
      </Text>
      <Text style={[styles.emptyChatProvider, { color: colors.textMuted }]}>
        {providerSettings.provider.toUpperCase()} · {providerSettings.model}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* ─── Messages List ─── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => `msg_${index}`}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.messagesListEmpty,
        ]}
        ListEmptyComponent={<EmptyChat />}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      {/* ─── Loading Indicator ─── */}
      {isLoading && (
        <View style={[styles.loadingRow, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={persona.color} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {t("alice.thinking") || "Alice réfléchit…"}
          </Text>
        </View>
      )}

      {/* ─── Error Banner ─── */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity onPress={retryLastMessage}>
              <Text style={styles.errorAction}>
                {t("common.retry") || "Réessayer"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── Input Bar ─── */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t("alice.inputPlaceholder") || "Écrivez à Alice…"}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={4000}
          returnKeyType="default"
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                inputText.trim() && !isLoading ? colors.primary : colors.border,
            },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.7}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputText.trim() && !isLoading ? "#fff" : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerName: { fontSize: 16, fontWeight: "600" },
  headerBtn: { paddingHorizontal: 8, paddingVertical: 4 },

  // Messages
  messagesList: { paddingHorizontal: 12, paddingVertical: 16 },
  messagesListEmpty: { flex: 1, justifyContent: "center" },

  messageBubbleWrapper: {
    flexDirection: "row",
    marginBottom: 12,
    maxWidth: "85%",
  },
  messageBubbleWrapperUser: { alignSelf: "flex-end" },
  messageBubbleWrapperAssistant: { alignSelf: "flex-start" },

  avatarBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 4,
  },

  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: "100%",
  },
  messageBubbleUser: {
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  // Empty Chat
  emptyChatContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyChatTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  emptyChatSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyChatProvider: {
    fontSize: 12,
    marginTop: 12,
  },

  // Loading
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: { fontSize: 13 },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: { color: "#fff", fontSize: 13, flex: 1, marginRight: 8 },
  errorActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  errorAction: { color: "#fff", fontWeight: "600", fontSize: 13 },

  // Input Bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
