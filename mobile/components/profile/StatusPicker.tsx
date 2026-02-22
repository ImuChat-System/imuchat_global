/**
 * StatusPicker Component — DEV-008
 *
 * Allows users to set an enriched status with:
 * - Emoji picker
 * - Custom text
 * - Expiration time selection
 */

import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";
import { useUserStore } from "@/stores/user-store";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatusPickerProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface ExpirationOption {
  label: string;
  value: number | null; // minutes, null = no expiration
  labelKey: string;
}

// Common status emojis
const STATUS_EMOJIS = [
  "😊",
  "😎",
  "🎉",
  "💼",
  "🏠",
  "✈️",
  "🎮",
  "📚",
  "🎵",
  "☕",
  "🌙",
  "🔕",
  "💪",
  "🤔",
  "😴",
  "🎬",
  "🏃",
  "🍕",
  "🎂",
  "❤️",
  "🔥",
  "⭐",
  "🌈",
  "🎯",
];

const EXPIRATION_OPTIONS: ExpirationOption[] = [
  { label: "30 min", value: 30, labelKey: "statusPicker.duration30min" },
  { label: "1h", value: 60, labelKey: "statusPicker.duration1h" },
  { label: "4h", value: 240, labelKey: "statusPicker.duration4h" },
  { label: "24h", value: 1440, labelKey: "statusPicker.duration24h" },
  { label: "7d", value: 10080, labelKey: "statusPicker.duration7d" },
  { label: "∞", value: null, labelKey: "statusPicker.durationForever" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StatusPicker({
  visible,
  onClose,
  onSave,
}: StatusPickerProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { profile, updateProfile } = useUserStore();

  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(
    profile?.status_emoji || null,
  );
  const [statusText, setStatusText] = useState(profile?.status || "");
  const [expiration, setExpiration] = useState<number | null>(60); // default 1h
  const [saving, setSaving] = useState(false);

  // -----------------------------------------------------------------------
  // Save status
  // -----------------------------------------------------------------------

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert(t("common.error"), t("statusPicker.noProfile"));
      return;
    }

    setSaving(true);

    try {
      // Calculate expiration timestamp
      let expiresAt: string | null = null;
      if (expiration !== null) {
        const date = new Date();
        date.setMinutes(date.getMinutes() + expiration);
        expiresAt = date.toISOString();
      }

      // Update in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          status: statusText.trim() || null,
          status_emoji: selectedEmoji,
          status_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Update local store
      updateProfile({
        status: statusText.trim() ? (statusText.trim() as any) : "online",
        status_emoji: selectedEmoji,
        status_expires_at: expiresAt,
      });

      onSave?.();
      onClose();
    } catch (err: any) {
      Alert.alert(
        t("common.error"),
        err.message || t("statusPicker.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // Clear status
  // -----------------------------------------------------------------------

  const handleClear = async () => {
    if (!profile?.id) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: null,
          status_emoji: null,
          status_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      updateProfile({
        status: "online",
        status_emoji: null,
        status_expires_at: null,
      });

      setSelectedEmoji(null);
      setStatusText("");
      onClose();
    } catch (err) {
      console.error("[StatusPicker] Clear error:", err);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t("statusPicker.title")}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text
                style={[
                  styles.saveBtn,
                  {
                    color: saving
                      ? theme.colors.textMuted
                      : theme.colors.primary,
                  },
                ]}
              >
                {saving ? t("common.saving") : t("common.save")}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Preview */}
            <View
              style={[
                styles.previewCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text style={styles.previewEmoji}>{selectedEmoji || "😊"}</Text>
              <Text
                style={[
                  styles.previewText,
                  {
                    color: statusText
                      ? theme.colors.text
                      : theme.colors.textMuted,
                  },
                ]}
              >
                {statusText || t("statusPicker.placeholder")}
              </Text>
            </View>

            {/* Emoji Grid */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t("statusPicker.selectEmoji")}
            </Text>
            <View style={styles.emojiGrid}>
              {STATUS_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiBtn,
                    {
                      backgroundColor:
                        selectedEmoji === emoji
                          ? theme.colors.primary + "30"
                          : theme.colors.surface,
                      borderColor:
                        selectedEmoji === emoji
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status Text */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t("statusPicker.statusText")}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              value={statusText}
              onChangeText={setStatusText}
              placeholder={t("statusPicker.textPlaceholder")}
              placeholderTextColor={theme.colors.textMuted}
              maxLength={80}
            />
            <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>
              {statusText.length}/80
            </Text>

            {/* Expiration */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t("statusPicker.clearAfter")}
            </Text>
            <View style={styles.expirationRow}>
              {EXPIRATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.expirationBtn,
                    {
                      backgroundColor:
                        expiration === opt.value
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor:
                        expiration === opt.value
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setExpiration(opt.value)}
                >
                  <Text
                    style={[
                      styles.expirationText,
                      {
                        color:
                          expiration === opt.value ? "#fff" : theme.colors.text,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clear Button */}
            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: theme.colors.error }]}
              onPress={handleClear}
              disabled={saving}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={theme.colors.error}
              />
              <Text style={[styles.clearText, { color: theme.colors.error }]}>
                {t("statusPicker.clearStatus")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveBtn: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  previewEmoji: {
    fontSize: 32,
  },
  previewText: {
    fontSize: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  emoji: {
    fontSize: 24,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
    marginBottom: 24,
  },
  expirationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  expirationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  expirationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 30,
  },
  clearText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
