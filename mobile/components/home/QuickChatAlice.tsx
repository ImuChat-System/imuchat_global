/**
 * QuickChatAlice — Mini-chat Alice inline dans le Home
 *
 * Permet un échange rapide avec Alice directement depuis la barre
 * du Home : saisie → envoi → réponse courte affichée en bulle.
 * Pas d'historique complet — juste un Q&R rapide.
 *
 * Sprint S10 Axe A — Alice IA dans le Home
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { sendQuickChat } from "@/services/alice-home";
import { createLogger } from "@/services/logger";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const logger = createLogger("QuickChatAlice");

// ─── Component ────────────────────────────────────────────────

export default function QuickChatAlice() {
  const colors = useColors();
  const spacing = useSpacing();
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    Keyboard.dismiss();
    setLoading(true);
    setReply(null);

    try {
      const result = await sendQuickChat(text);
      if (result) {
        setReply(result.reply);
      } else {
        setReply("Désolé, je n'ai pas pu répondre. Réessaie !");
      }
    } catch (err) {
      logger.error("handleSend failed", err);
      setReply("Oups, une erreur est survenue.");
    } finally {
      setLoading(false);
      setInput("");
    }
  }, [input, loading]);

  if (!expanded) {
    return (
      <TouchableOpacity
        testID="quick-chat-trigger"
        style={[
          styles.trigger,
          { backgroundColor: colors.card, margin: spacing.md },
        ]}
        onPress={() => setExpanded(true)}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={[styles.triggerText, { color: colors.textSecondary }]}>
          Demande quelque chose à Alice…
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      testID="quick-chat-container"
      style={[
        styles.container,
        { backgroundColor: colors.card, margin: spacing.md },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
        <Text style={[styles.headerText, { color: colors.text }]}>
          Quick Chat Alice
        </Text>
        <TouchableOpacity
          testID="quick-chat-close"
          onPress={() => {
            setExpanded(false);
            setReply(null);
          }}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Reply bubble */}
      {reply && (
        <View
          testID="quick-chat-reply"
          style={[styles.replyBubble, { backgroundColor: colors.background }]}
        >
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={[styles.replyText, { color: colors.text }]}>
            {reply}
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          testID="quick-chat-input"
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Pose une question rapide…"
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!loading}
        />
        <TouchableOpacity
          testID="quick-chat-send"
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Ionicons name="send" size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  triggerText: {
    fontSize: 13,
  },
  container: {
    borderRadius: 16,
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  replyBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  replyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
