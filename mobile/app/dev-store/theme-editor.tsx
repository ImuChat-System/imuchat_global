/**
 * ThemeEditorScreen — Visual Theme Editor (DEV-034)
 *
 * Allows creators to design themes by editing color tokens,
 * border radius, font family, and see a live preview.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { ThemeColors } from "@/types/dev-store";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_COLORS: ThemeColors = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  background: "#ffffff",
  surface: "#f5f5f5",
  text: "#1a1a1a",
  textMuted: "#888888",
  border: "#e0e0e0",
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f5a623",
  accent: "#06b6d4",
};

const COLOR_KEYS: (keyof ThemeColors)[] = [
  "primary",
  "secondary",
  "background",
  "surface",
  "text",
  "textMuted",
  "border",
  "error",
  "success",
  "warning",
  "accent",
];

export default function ThemeEditorScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { createTheme } = useDevStore();

  const [themeName, setThemeName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    ...DEFAULT_COLORS,
  });
  const [borderRadius, setBorderRadius] = useState("12");
  const [fontFamily, setFontFamily] = useState("System");
  const [saving, setSaving] = useState(false);

  const updateColor = useCallback((key: keyof ThemeColors, value: string) => {
    setThemeColors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!themeName.trim()) {
      Alert.alert(t("devStore.error"), t("devStore.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      await createTheme({
        name: themeName.trim(),
        description: description.trim(),
        config: {
          name: themeName.trim(),
          mode,
          colors: themeColors,
          borderRadius: parseInt(borderRadius, 10) || 12,
          fontFamily: fontFamily.trim() || "System",
          preview_url: null,
        },
        icon_url: "",
        screenshots: [],
        price: null,
      });
      router.back();
    } catch (e) {
      Alert.alert(
        t("devStore.error"),
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setSaving(false);
    }
  }, [
    themeName,
    description,
    mode,
    themeColors,
    borderRadius,
    fontFamily,
    createTheme,
    router,
    t,
  ]);

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surface,
      color: colors.text,
      borderColor: colors.border,
    },
  ];

  return (
    <ScrollView
      testID="theme-editor-screen"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* Theme name */}
      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.themeName")}
      </Text>
      <TextInput
        testID="input-theme-name"
        style={inputStyle}
        value={themeName}
        onChangeText={setThemeName}
        placeholder={t("devStore.themeNamePlaceholder")}
        placeholderTextColor={colors.textMuted}
      />

      {/* Description */}
      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.description")}
      </Text>
      <TextInput
        style={[...inputStyle, { height: 80, textAlignVertical: "top" }]}
        value={description}
        onChangeText={setDescription}
        placeholder={t("devStore.themeDescPlaceholder")}
        placeholderTextColor={colors.textMuted}
        multiline
      />

      {/* Mode toggle */}
      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.themeMode")}
      </Text>
      <View style={styles.modeRow}>
        {(["light", "dark"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.modeBtn,
              {
                backgroundColor:
                  mode === m ? colors.primary + "20" : colors.surface,
                borderColor: mode === m ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setMode(m)}
          >
            <Text
              style={{
                color: mode === m ? colors.primary : colors.text,
                fontWeight: "600",
              }}
            >
              {m === "light" ? "☀️ Light" : "🌙 Dark"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color tokens */}
      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
        {t("devStore.colorTokens")}
      </Text>
      {COLOR_KEYS.map((key) => (
        <View key={key} style={styles.colorRow}>
          <View
            style={[styles.colorSwatch, { backgroundColor: themeColors[key] }]}
          />
          <Text style={[styles.colorKey, { color: colors.text }]}>{key}</Text>
          <TextInput
            style={[
              styles.colorInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={themeColors[key]}
            onChangeText={(v) => updateColor(key, v)}
            placeholder="#000000"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
        </View>
      ))}

      {/* Border radius */}
      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.borderRadius")}
      </Text>
      <TextInput
        style={inputStyle}
        value={borderRadius}
        onChangeText={setBorderRadius}
        keyboardType="number-pad"
        placeholder="12"
        placeholderTextColor={colors.textMuted}
      />

      {/* Font family */}
      <Text style={[styles.label, { color: colors.text }]}>
        {t("devStore.fontFamily")}
      </Text>
      <TextInput
        style={inputStyle}
        value={fontFamily}
        onChangeText={setFontFamily}
        placeholder="System"
        placeholderTextColor={colors.textMuted}
      />

      {/* ── Live Preview ───────────────────────────────────── */}
      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
        {t("devStore.preview")}
      </Text>
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
            borderRadius: parseInt(borderRadius, 10) || 12,
          },
        ]}
      >
        <Text style={[styles.previewTitle, { color: themeColors.text }]}>
          {themeName || "Theme Preview"}
        </Text>
        <Text style={[styles.previewMuted, { color: themeColors.textMuted }]}>
          {t("devStore.previewSubtitle")}
        </Text>
        <View style={styles.previewBtns}>
          <View
            style={[
              styles.previewBtn,
              {
                backgroundColor: themeColors.primary,
                borderRadius: Math.round(
                  (parseInt(borderRadius, 10) || 12) / 2,
                ),
              },
            ]}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
              {t("devStore.previewAction")}
            </Text>
          </View>
          <View
            style={[
              styles.previewBtn,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                borderWidth: 1,
                borderRadius: Math.round(
                  (parseInt(borderRadius, 10) || 12) / 2,
                ),
              },
            ]}
          >
            <Text
              style={{
                color: themeColors.text,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              {t("common.cancel")}
            </Text>
          </View>
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity
        testID="btn-save-theme"
        style={[
          styles.saveBtn,
          { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 },
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? t("devStore.saving") : t("devStore.saveTheme")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modeRow: { flexDirection: "row", gap: 10 },
  modeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  colorSwatch: { width: 28, height: 28, borderRadius: 14 },
  colorKey: { flex: 1, fontSize: 13, fontWeight: "500" },
  colorInput: {
    width: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
  },
  previewCard: { borderWidth: 1, padding: 16, marginBottom: 8 },
  previewTitle: { fontSize: 18, fontWeight: "700" },
  previewMuted: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  previewBtns: { flexDirection: "row", gap: 10 },
  previewBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  saveBtn: {
    marginTop: 28,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
