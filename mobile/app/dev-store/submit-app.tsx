/**
 * SubmitAppScreen — App Submission Form (DEV-034)
 *
 * Multi-step form for submitting a new app to the store:
 * name, description, category, permissions, icon, screenshots, pricing.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useDevStore } from "@/stores/dev-store-store";
import type { ModuleCategory } from "@/types/modules";
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

const CATEGORIES: ModuleCategory[] = [
  "social",
  "media",
  "productivity",
  "entertainment",
  "education",
  "lifestyle",
  "finance",
  "services",
  "creativity",
  "communication",
  "other",
];

const COMMON_PERMISSIONS = [
  "storage",
  "camera",
  "notifications",
  "contacts",
  "location",
  "microphone",
];

export default function SubmitAppScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { createSubmission } = useDevStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState<ModuleCategory>("other");
  const [version, setVersion] = useState("1.0.0");
  const [changelog, setChangelog] = useState("");
  const [entryUrl, setEntryUrl] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const togglePerm = useCallback((perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert(t("devStore.error"), t("devStore.nameRequired"));
      return;
    }
    if (!entryUrl.trim()) {
      Alert.alert(t("devStore.error"), t("devStore.urlRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await createSubmission({
        name: name.trim(),
        description: description.trim(),
        short_description: shortDesc.trim(),
        category,
        icon_url: "",
        screenshots: [],
        version: version.trim() || "1.0.0",
        changelog: changelog.trim(),
        entry_url: entryUrl.trim(),
        permissions: selectedPerms,
        price: priceStr ? parseFloat(priceStr) : null,
      });
      router.back();
    } catch (e) {
      Alert.alert(
        t("devStore.error"),
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    name,
    description,
    shortDesc,
    category,
    version,
    changelog,
    entryUrl,
    selectedPerms,
    priceStr,
    createSubmission,
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        testID="submit-app-screen"
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.appName")}
        </Text>
        <TextInput
          testID="input-name"
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder={t("devStore.appNamePlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        {/* Short description */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.shortDesc")}
        </Text>
        <TextInput
          style={inputStyle}
          value={shortDesc}
          onChangeText={setShortDesc}
          placeholder={t("devStore.shortDescPlaceholder")}
          placeholderTextColor={colors.textMuted}
          maxLength={120}
        />

        {/* Description */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.description")}
        </Text>
        <TextInput
          style={[...inputStyle, { height: 100, textAlignVertical: "top" }]}
          value={description}
          onChangeText={setDescription}
          placeholder={t("devStore.descriptionPlaceholder")}
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {/* Category */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.category")}
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    category === cat ? colors.primary + "20" : colors.surface,
                  borderColor:
                    category === cat ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: category === cat ? colors.primary : colors.text },
                ]}
              >
                {t(`devStore.cat_${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Entry URL */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.entryUrl")}
        </Text>
        <TextInput
          testID="input-entry-url"
          style={inputStyle}
          value={entryUrl}
          onChangeText={setEntryUrl}
          placeholder="https://..."
          placeholderTextColor={colors.textMuted}
          keyboardType="url"
          autoCapitalize="none"
        />

        {/* Version */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.version")}
        </Text>
        <TextInput
          style={inputStyle}
          value={version}
          onChangeText={setVersion}
          placeholder="1.0.0"
          placeholderTextColor={colors.textMuted}
        />

        {/* Changelog */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.changelog")}
        </Text>
        <TextInput
          style={[...inputStyle, { height: 80, textAlignVertical: "top" }]}
          value={changelog}
          onChangeText={setChangelog}
          placeholder={t("devStore.changelogPlaceholder")}
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {/* Permissions */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.permissions")}
        </Text>
        <View style={styles.permsGrid}>
          {COMMON_PERMISSIONS.map((perm) => (
            <TouchableOpacity
              key={perm}
              style={[
                styles.permChip,
                {
                  backgroundColor: selectedPerms.includes(perm)
                    ? colors.primary + "20"
                    : colors.surface,
                  borderColor: selectedPerms.includes(perm)
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={() => togglePerm(perm)}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: selectedPerms.includes(perm)
                    ? colors.primary
                    : colors.text,
                }}
              >
                {perm}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("devStore.price")}
        </Text>
        <TextInput
          style={inputStyle}
          value={priceStr}
          onChangeText={setPriceStr}
          placeholder={t("devStore.pricePlaceholder")}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />

        {/* Submit */}
        <TouchableOpacity
          testID="btn-submit-app"
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? t("devStore.submitting") : t("devStore.createDraft")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 13, fontWeight: "500" },
  permsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  permChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  submitBtn: {
    marginTop: 28,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
