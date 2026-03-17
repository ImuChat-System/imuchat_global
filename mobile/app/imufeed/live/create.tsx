/**
 * app/imufeed/live/create.tsx — Lancer un live stream
 *
 * Écran de configuration avant de lancer un live :
 * titre, catégorie, options (donations, replay, 18+), preview caméra.
 *
 * Sprint S16 — Live UI Streamer & Viewer
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { LiveStreamingService } from "@/services/imufeed/live-api";
import { useLiveStreamingStore } from "@/stores/live-streaming-store";
import type { LiveCategory } from "@/types/live-streaming";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────

const CATEGORIES: { key: LiveCategory; icon: string; label: string }[] = [
  { key: "gaming", icon: "game-controller", label: "Gaming" },
  { key: "music", icon: "musical-notes", label: "Musique" },
  { key: "art", icon: "color-palette", label: "Art" },
  { key: "education", icon: "school", label: "Éducation" },
  { key: "chat", icon: "chatbubbles", label: "Discussion" },
  { key: "cooking", icon: "restaurant", label: "Cuisine" },
  { key: "tech", icon: "hardware-chip", label: "Tech" },
  { key: "fitness", icon: "fitness", label: "Fitness" },
  { key: "other", icon: "ellipsis-horizontal", label: "Autre" },
];

const liveService = new LiveStreamingService();

// ─── Screen ───────────────────────────────────────────────────

export default function CreateLiveScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const setCurrentLive = useLiveStreamingStore((s) => s.setCurrentLive);
  const setIsHosting = useLiveStreamingStore((s) => s.setIsHosting);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LiveCategory>("chat");
  const [donationsEnabled, setDonationsEnabled] = useState(true);
  const [autoRecord, setAutoRecord] = useState(true);
  const [isAdultOnly, setIsAdultOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canGoLive = title.trim().length >= 3;

  // ─── Go Live ─────────────────────────────────────

  const handleGoLive = useCallback(async () => {
    if (!canGoLive || isLoading) return;
    setIsLoading(true);

    const { data, error } = await liveService.createLive({
      title: title.trim(),
      description: description.trim(),
      category,
      settings: {
        donationsEnabled,
        autoRecord,
      },
      isAdultOnly,
    });

    setIsLoading(false);

    if (error || !data) {
      Alert.alert(
        t("live.error", "Erreur"),
        error || t("live.createFailed", "Impossible de lancer le live"),
      );
      return;
    }

    setCurrentLive(data);
    setIsHosting(true);
    router.replace(`/imufeed/live/${data.id}` as any);
  }, [
    title,
    description,
    category,
    donationsEnabled,
    autoRecord,
    isAdultOnly,
    canGoLive,
    isLoading,
  ]);

  // ─── UI ──────────────────────────────────────────

  return (
    <SafeAreaView
      testID="create-live-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="close-button" onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("live.createTitle", "Lancer un live")}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        {/* Title */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("live.titleLabel", "Titre du live")}
        </Text>
        <TextInput
          testID="live-title-input"
          style={[
            styles.textInput,
            { color: colors.text, borderColor: colors.border },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder={t("live.titlePlaceholder", "De quoi parle ton live ?")}
          placeholderTextColor={colors.textSecondary}
          maxLength={100}
        />

        {/* Description */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("live.descLabel", "Description (optionnel)")}
        </Text>
        <TextInput
          testID="live-description-input"
          style={[
            styles.textInput,
            styles.textArea,
            { color: colors.text, borderColor: colors.border },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder={t(
            "live.descPlaceholder",
            "Dis-en plus à tes viewers...",
          )}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={300}
          numberOfLines={3}
        />

        {/* Category */}
        <Text style={[styles.label, { color: colors.text }]}>
          {t("live.categoryLabel", "Catégorie")}
        </Text>
        <View testID="category-grid" style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              testID={`category-${cat.key}`}
              style={[
                styles.categoryChip,
                {
                  borderColor:
                    category === cat.key ? colors.primary : colors.border,
                  backgroundColor:
                    category === cat.key
                      ? `${colors.primary}20`
                      : "transparent",
                },
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={
                  category === cat.key ? colors.primary : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color:
                      category === cat.key
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Toggles */}
        <View style={styles.settingsSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="gift" size={20} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("live.donations", "Donations")}
              </Text>
            </View>
            <Switch
              testID="donations-toggle"
              value={donationsEnabled}
              onValueChange={setDonationsEnabled}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="videocam" size={20} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("live.autoRecord", "Enregistrer le replay")}
              </Text>
            </View>
            <Switch
              testID="record-toggle"
              value={autoRecord}
              onValueChange={setAutoRecord}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="warning" size={20} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("live.adultOnly", "Contenu 18+")}
              </Text>
            </View>
            <Switch
              testID="adult-toggle"
              value={isAdultOnly}
              onValueChange={setIsAdultOnly}
              trackColor={{ true: "#FF4444" }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Go Live Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          testID="go-live-button"
          style={[
            styles.goLiveButton,
            { backgroundColor: canGoLive ? "#FF0000" : "#666" },
          ]}
          onPress={handleGoLive}
          disabled={!canGoLive || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator testID="loading-indicator" color="#fff" />
          ) : (
            <>
              <Ionicons name="radio" size={22} color="#fff" />
              <Text style={styles.goLiveText}>
                {t("live.goLive", "Passer en live")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  settingsSection: {
    marginTop: 20,
    gap: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 24,
  },
  goLiveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    paddingVertical: 16,
    gap: 10,
  },
  goLiveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});
