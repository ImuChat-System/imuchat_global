/**
 * AutoModerationScreen — Configuration de l'auto-modération
 *
 * Interface admin pour configurer les filtres automatiques :
 * - Filtre de mots (bannedWords)
 * - Filtre de liens (whitelist/blocklist)
 * - Anti-spam (messages/min)
 * - Anti-flood (messages identiques)
 * - Modération IA (toggle)
 * - Actions par type de violation
 *
 * Phase 3 — Groupe 9 fonc. #4 : Détection spam / toxicité
 */

import { useBots } from "@/hooks/useBots";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { ModerationAction } from "@/types/bots";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Action options ──────────────────────────────────────────
const ACTION_OPTIONS: Array<{
  value: ModerationAction;
  label: string;
  icon: string;
}> = [
  { value: ModerationAction.DELETE_MESSAGE, label: "Supprimer", icon: "trash" },
  { value: ModerationAction.WARN, label: "Avertir", icon: "warning" },
  { value: ModerationAction.MUTE, label: "Muter", icon: "volume-mute" },
  { value: ModerationAction.KICK, label: "Expulser", icon: "exit-outline" },
  { value: ModerationAction.BAN, label: "Bannir", icon: "ban" },
];

export default function AutoModerationScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  const {
    autoModConfig,
    autoModStats,
    isAutoModActive,
    updateAutoModConfig,
    resetAutoMod,
  } = useBots(conversationId);

  // Local state for text inputs
  const [newBannedWord, setNewBannedWord] = useState("");
  const [newAllowedDomain, setNewAllowedDomain] = useState("");

  // ── Handlers ─────────────────────────────────────────────────

  const handleToggleWordFilter = useCallback(
    (value: boolean) => {
      updateAutoModConfig({ wordFilterEnabled: value });
    },
    [updateAutoModConfig],
  );

  const handleToggleLinkFilter = useCallback(
    (value: boolean) => {
      updateAutoModConfig({ linkFilterEnabled: value });
    },
    [updateAutoModConfig],
  );

  const handleToggleWarnBefore = useCallback(
    (value: boolean) => {
      updateAutoModConfig({ warnBeforeAction: value });
    },
    [updateAutoModConfig],
  );

  const handleToggleAI = useCallback(
    (value: boolean) => {
      updateAutoModConfig({ aiModerationEnabled: value });
    },
    [updateAutoModConfig],
  );

  const handleAddBannedWord = useCallback(() => {
    const word = newBannedWord.trim();
    if (!word) return;
    const current = autoModConfig.bannedWords || [];
    if (current.includes(word.toLowerCase())) return;
    updateAutoModConfig({ bannedWords: [...current, word.toLowerCase()] });
    setNewBannedWord("");
  }, [newBannedWord, autoModConfig.bannedWords, updateAutoModConfig]);

  const handleRemoveBannedWord = useCallback(
    (word: string) => {
      const current = autoModConfig.bannedWords || [];
      updateAutoModConfig({ bannedWords: current.filter((w) => w !== word) });
    },
    [autoModConfig.bannedWords, updateAutoModConfig],
  );

  const handleAddAllowedDomain = useCallback(() => {
    const domain = newAllowedDomain.trim().toLowerCase();
    if (!domain) return;
    const current = autoModConfig.allowedDomains || [];
    if (current.includes(domain)) return;
    updateAutoModConfig({ allowedDomains: [...current, domain] });
    setNewAllowedDomain("");
  }, [newAllowedDomain, autoModConfig.allowedDomains, updateAutoModConfig]);

  const handleRemoveAllowedDomain = useCallback(
    (domain: string) => {
      const current = autoModConfig.allowedDomains || [];
      updateAutoModConfig({
        allowedDomains: current.filter((d) => d !== domain),
      });
    },
    [autoModConfig.allowedDomains, updateAutoModConfig],
  );

  const handleSpamLimitChange = useCallback(
    (text: string) => {
      const num = parseInt(text, 10);
      if (!isNaN(num) && num >= 0) {
        updateAutoModConfig({ spamLimitPerMinute: num });
      }
    },
    [updateAutoModConfig],
  );

  const handleFloodThresholdChange = useCallback(
    (text: string) => {
      const num = parseInt(text, 10);
      if (!isNaN(num) && num >= 0) {
        updateAutoModConfig({ floodThreshold: num });
      }
    },
    [updateAutoModConfig],
  );

  const handleMaxWarningsChange = useCallback(
    (text: string) => {
      const num = parseInt(text, 10);
      if (!isNaN(num) && num >= 1) {
        updateAutoModConfig({ maxWarnings: num });
      }
    },
    [updateAutoModConfig],
  );

  const handleMuteDurationChange = useCallback(
    (text: string) => {
      const num = parseInt(text, 10);
      if (!isNaN(num) && num >= 1) {
        updateAutoModConfig({ muteDurationMinutes: num });
      }
    },
    [updateAutoModConfig],
  );

  const handleResetConfig = useCallback(() => {
    Alert.alert(
      t("groupBots.autoMod.resetTitle"),
      t("groupBots.autoMod.resetConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          onPress: resetAutoMod,
          style: "destructive",
        },
      ],
    );
  }, [resetAutoMod, t]);

  // ── Action Selector ──────────────────────────────────────────
  const ActionSelector = useCallback(
    ({
      currentAction,
      onSelect,
    }: {
      currentAction: ModerationAction;
      onSelect: (action: ModerationAction) => void;
    }) => (
      <View style={styles.actionSelector}>
        {ACTION_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.actionOption,
              {
                backgroundColor:
                  currentAction === opt.value
                    ? colors.primary + "20"
                    : colors.surface,
                borderColor:
                  currentAction === opt.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(opt.value)}
          >
            <Ionicons
              name={opt.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={
                currentAction === opt.value ? colors.primary : colors.textMuted
              }
            />
            <Text
              style={[
                styles.actionOptionText,
                {
                  color:
                    currentAction === opt.value
                      ? colors.primary
                      : colors.textMuted,
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
    [colors],
  );

  // ── Chip list (for banned words / allowed domains) ───────────
  const ChipList = useCallback(
    ({
      items,
      onRemove,
    }: {
      items: string[];
      onRemove: (item: string) => void;
    }) => (
      <View style={styles.chipContainer}>
        {items.map((item) => (
          <View
            key={item}
            style={[
              styles.chip,
              {
                backgroundColor: colors.primary + "15",
                borderColor: colors.primary + "40",
              },
            ]}
          >
            <Text style={[styles.chipText, { color: colors.primary }]}>
              {item}
            </Text>
            <TouchableOpacity onPress={() => onRemove(item)} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    ),
    [colors],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
    >
      {/* ── Status Banner ────────────────────────────────────── */}
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: isAutoModActive ? "#10B98120" : colors.surface,
            borderColor: isAutoModActive ? "#10B981" : colors.border,
          },
        ]}
      >
        <Ionicons
          name={isAutoModActive ? "shield-checkmark" : "shield-outline"}
          size={24}
          color={isAutoModActive ? "#10B981" : colors.textMuted}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.statusTitle,
              {
                color: isAutoModActive ? "#10B981" : colors.textMuted,
              },
            ]}
          >
            {t(
              isAutoModActive
                ? "groupBots.autoMod.active"
                : "groupBots.autoMod.inactive",
            )}
          </Text>
          {isAutoModActive && (
            <Text style={[styles.statusStats, { color: colors.textMuted }]}>
              {t("groupBots.autoMod.statsBlocked", {
                count: autoModStats.blocked,
              })}{" "}
              ·{" "}
              {t("groupBots.autoMod.statsWarned", {
                count: autoModStats.warned,
              })}
            </Text>
          )}
        </View>
      </View>

      {/* ── Section : Filtre de mots ─────────────────────────── */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="text" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("groupBots.autoMod.wordFilter")}
            </Text>
          </View>
          <Switch
            value={autoModConfig.wordFilterEnabled}
            onValueChange={handleToggleWordFilter}
            trackColor={{ false: colors.border, true: colors.primary + "60" }}
            thumbColor={
              autoModConfig.wordFilterEnabled ? colors.primary : "#f4f3f4"
            }
          />
        </View>

        {autoModConfig.wordFilterEnabled && (
          <>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              {t("groupBots.autoMod.bannedWords")}
            </Text>
            <ChipList
              items={autoModConfig.bannedWords || []}
              onRemove={handleRemoveBannedWord}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={t("groupBots.autoMod.addWord")}
                placeholderTextColor={colors.textMuted}
                value={newBannedWord}
                onChangeText={setNewBannedWord}
                onSubmitEditing={handleAddBannedWord}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddBannedWord}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.fieldLabel,
                { color: colors.textMuted, marginTop: 12 },
              ]}
            >
              {t("groupBots.autoMod.actionLabel")}
            </Text>
            <ActionSelector
              currentAction={autoModConfig.wordFilterAction}
              onSelect={(action) =>
                updateAutoModConfig({ wordFilterAction: action })
              }
            />
          </>
        )}
      </View>

      {/* ── Section : Filtre de liens ────────────────────────── */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="link" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("groupBots.autoMod.linkFilter")}
            </Text>
          </View>
          <Switch
            value={autoModConfig.linkFilterEnabled}
            onValueChange={handleToggleLinkFilter}
            trackColor={{ false: colors.border, true: colors.primary + "60" }}
            thumbColor={
              autoModConfig.linkFilterEnabled ? colors.primary : "#f4f3f4"
            }
          />
        </View>

        {autoModConfig.linkFilterEnabled && (
          <>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              {t("groupBots.autoMod.allowedDomains")}
            </Text>
            <ChipList
              items={autoModConfig.allowedDomains || []}
              onRemove={handleRemoveAllowedDomain}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={t("groupBots.autoMod.addDomain")}
                placeholderTextColor={colors.textMuted}
                value={newAllowedDomain}
                onChangeText={setNewAllowedDomain}
                onSubmitEditing={handleAddAllowedDomain}
                returnKeyType="done"
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddAllowedDomain}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.fieldLabel,
                { color: colors.textMuted, marginTop: 12 },
              ]}
            >
              {t("groupBots.autoMod.actionLabel")}
            </Text>
            <ActionSelector
              currentAction={autoModConfig.linkFilterAction}
              onSelect={(action) =>
                updateAutoModConfig({ linkFilterAction: action })
              }
            />
          </>
        )}
      </View>

      {/* ── Section : Anti-spam / Anti-flood ─────────────────── */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="flash" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("groupBots.autoMod.spamFlood")}
          </Text>
        </View>

        <View style={styles.numberRow}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            {t("groupBots.autoMod.spamLimit")}
          </Text>
          <TextInput
            style={[
              styles.numberInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={String(autoModConfig.spamLimitPerMinute)}
            onChangeText={handleSpamLimitChange}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.numberRow}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            {t("groupBots.autoMod.floodThreshold")}
          </Text>
          <TextInput
            style={[
              styles.numberInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={String(autoModConfig.floodThreshold)}
            onChangeText={handleFloodThresholdChange}
            keyboardType="number-pad"
          />
        </View>

        <Text
          style={[styles.fieldLabel, { color: colors.textMuted, marginTop: 8 }]}
        >
          {t("groupBots.autoMod.spamAction")}
        </Text>
        <ActionSelector
          currentAction={autoModConfig.spamAction}
          onSelect={(action) => updateAutoModConfig({ spamAction: action })}
        />
      </View>

      {/* ── Section : Avertissements ─────────────────────────── */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("groupBots.autoMod.warnings")}
            </Text>
          </View>
          <Switch
            value={autoModConfig.warnBeforeAction}
            onValueChange={handleToggleWarnBefore}
            trackColor={{ false: colors.border, true: "#F59E0B60" }}
            thumbColor={autoModConfig.warnBeforeAction ? "#F59E0B" : "#f4f3f4"}
          />
        </View>

        {autoModConfig.warnBeforeAction && (
          <>
            <View style={styles.numberRow}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {t("groupBots.autoMod.maxWarnings")}
              </Text>
              <TextInput
                style={[
                  styles.numberInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={String(autoModConfig.maxWarnings)}
                onChangeText={handleMaxWarningsChange}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.numberRow}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {t("groupBots.autoMod.muteDuration")}
              </Text>
              <TextInput
                style={[
                  styles.numberInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={String(autoModConfig.muteDurationMinutes)}
                onChangeText={handleMuteDurationChange}
                keyboardType="number-pad"
              />
            </View>
          </>
        )}
      </View>

      {/* ── Section : IA Modération ──────────────────────────── */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="hardware-chip" size={20} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("groupBots.autoMod.aiModeration")}
            </Text>
          </View>
          <Switch
            value={autoModConfig.aiModerationEnabled}
            onValueChange={handleToggleAI}
            trackColor={{ false: colors.border, true: "#8B5CF660" }}
            thumbColor={
              autoModConfig.aiModerationEnabled ? "#8B5CF6" : "#f4f3f4"
            }
          />
        </View>
        <Text style={[styles.fieldHint, { color: colors.textMuted }]}>
          {t("groupBots.autoMod.aiDescription")}
        </Text>
      </View>

      {/* ── Bouton reset ─────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.resetButton, { borderColor: "#EF444460" }]}
        onPress={handleResetConfig}
      >
        <Ionicons name="refresh" size={18} color="#EF4444" />
        <Text style={[styles.resetButtonText, { color: "#EF4444" }]}>
          {t("groupBots.autoMod.reset")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  statusStats: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  numberInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: "center",
  },
  actionSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  actionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
