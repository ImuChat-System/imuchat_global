/**
 * Language Settings Screen (Advanced)
 *
 * Detailed language/i18n management with per-feature language overrides,
 * auto-translation settings, and content language preferences.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { useUserStore } from "@/stores/user-store";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type LanguageCode = "fr" | "en" | "ja";

const LANGUAGES: {
  code: LanguageCode;
  label: string;
  flag: string;
  native: string;
}[] = [
  { code: "fr", label: "French", flag: "🇫🇷", native: "Français" },
  { code: "en", label: "English", flag: "🇺🇸", native: "English" },
  { code: "ja", label: "Japanese", flag: "🇯🇵", native: "日本語" },
];

export default function LanguageSettingsScreen() {
  const colors = useColors();
  const { t, locale, setLocale } = useI18n();
  const preferences = useUserStore((s) => s.preferences);
  const setPreferences = useUserStore((s) => s.setPreferences);

  return (
    <ScrollView
      testID="language-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ─── App Language ────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.appLanguage")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {LANGUAGES.map((lang, idx) => {
          const isActive = locale === lang.code;
          return (
            <View key={lang.code}>
              <TouchableOpacity
                testID={`lang-${lang.code}`}
                style={[
                  styles.row,
                  isActive && { backgroundColor: colors.primary + "10" },
                ]}
                onPress={() => {
                  setLocale(lang.code);
                  setPreferences({ locale: lang.code });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rowLabel,
                      { color: isActive ? colors.primary : colors.text },
                    ]}
                  >
                    {lang.native}
                  </Text>
                  <Text
                    style={[styles.rowSubtitle, { color: colors.textMuted }]}
                  >
                    {lang.label}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    { borderColor: isActive ? colors.primary : colors.border },
                  ]}
                >
                  {isActive && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {idx < LANGUAGES.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* ─── Translation ─────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.translation")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.flag}>🌐</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("advancedSettings.autoTranslate")}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {t("advancedSettings.autoTranslateDesc")}
            </Text>
          </View>
          <Switch
            testID="switch-auto-translate"
            value={preferences.autoTranslateEnabled}
            onValueChange={(v) => setPreferences({ autoTranslateEnabled: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* ─── Content language preferences ────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("advancedSettings.contentLanguages")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={styles.flag}>📖</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t("advancedSettings.contentLanguagesDesc")}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {t("advancedSettings.contentLanguagesHint")}
            </Text>
          </View>
        </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  flag: { fontSize: 28 },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
});
