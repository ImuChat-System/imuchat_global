/**
 * ModerationScreen — AI Moderation Config (DEV-035)
 *
 * Configure AI content moderation:
 *  - Global moderation toggle & level
 *  - Per-category rules (enable, level, action)
 *  - Log moderation events
 *  - Notify on block
 *
 * Spec §6.8: Modération IA configurable
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAIAdminStore } from "@/stores/ai-admin-store";
import type {
  ContentCategory,
  ModerationLevel,
  ModerationRule,
} from "@/types/ai-admin";
import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Category Config ──────────────────────────────────────────

const CATEGORY_UI: Record<ContentCategory, { emoji: string; label: string }> = {
  hate_speech: { emoji: "🚫", label: "Discours haineux" },
  violence: { emoji: "⚔️", label: "Violence" },
  sexual_content: { emoji: "🔞", label: "Contenu sexuel" },
  self_harm: { emoji: "⚠️", label: "Auto-mutilation" },
  dangerous_content: { emoji: "☢️", label: "Contenu dangereux" },
  spam: { emoji: "📧", label: "Spam" },
  misinformation: { emoji: "❌", label: "Désinformation" },
};

const MODERATION_LEVELS: ModerationLevel[] = [
  "off",
  "low",
  "medium",
  "high",
  "strict",
];
const ACTIONS = ["warn", "block", "flag"] as const;

// ─── Level Picker ─────────────────────────────────────────────

interface LevelPickerProps {
  selected: ModerationLevel;
  onSelect: (level: ModerationLevel) => void;
  colors: ReturnType<typeof useColors>;
}

function LevelPicker({ selected, onSelect, colors }: LevelPickerProps) {
  return (
    <View style={styles.levelRow}>
      {MODERATION_LEVELS.map((lvl) => (
        <TouchableOpacity
          key={lvl}
          style={[
            styles.levelChip,
            {
              backgroundColor:
                selected === lvl ? colors.primary : colors.background,
            },
          ]}
          onPress={() => onSelect(lvl)}
        >
          <Text
            style={{
              color: selected === lvl ? "#fff" : colors.textMuted,
              fontSize: 11,
              fontWeight: "600",
            }}
          >
            {lvl}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Rule Card ────────────────────────────────────────────────

interface RuleCardProps {
  rule: ModerationRule;
  onToggle: (enabled: boolean) => void;
  onLevelChange: (level: ModerationLevel) => void;
  onActionChange: (action: "warn" | "block" | "flag") => void;
  colors: ReturnType<typeof useColors>;
  t: (key: string) => string;
}

function RuleCard({
  rule,
  onToggle,
  onLevelChange,
  onActionChange,
  colors,
  t,
}: RuleCardProps) {
  const ui = CATEGORY_UI[rule.category];

  return (
    <View style={[styles.ruleCard, { backgroundColor: colors.surface }]}>
      <View style={styles.ruleHeader}>
        <Text style={styles.ruleEmoji}>{ui.emoji}</Text>
        <Text style={[styles.ruleLabel, { color: colors.text }]}>
          {ui.label}
        </Text>
        <Switch
          value={rule.enabled}
          onValueChange={onToggle}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>

      {rule.enabled && (
        <View style={styles.ruleOptions}>
          <Text style={[styles.optionLabel, { color: colors.textMuted }]}>
            {t("aiAdmin.level")}
          </Text>
          <LevelPicker
            selected={rule.level}
            onSelect={onLevelChange}
            colors={colors}
          />

          <Text style={[styles.optionLabel, { color: colors.textMuted }]}>
            {t("aiAdmin.action")}
          </Text>
          <View style={styles.actionRow}>
            {ACTIONS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[
                  styles.actionChip,
                  {
                    backgroundColor:
                      rule.action === a ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => onActionChange(a)}
              >
                <Text
                  style={{
                    color: rule.action === a ? "#fff" : colors.textMuted,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {t(`aiAdmin.action_${a}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function ModerationScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { moderation, updateModeration, updateModerationRule } =
    useAIAdminStore();

  const renderRule = useCallback(
    ({ item }: { item: ModerationRule }) => (
      <RuleCard
        rule={item}
        onToggle={(enabled) => updateModerationRule(item.category, { enabled })}
        onLevelChange={(level) =>
          updateModerationRule(item.category, { level })
        }
        onActionChange={(action) =>
          updateModerationRule(item.category, { action })
        }
        colors={colors}
        t={t}
      />
    ),
    [colors, t, updateModerationRule],
  );

  return (
    <View
      testID="moderation-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={moderation.rules}
        keyExtractor={(r) => r.category}
        renderItem={renderRule}
        contentContainerStyle={[styles.list, { padding: spacing.md }]}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Global toggle */}
            <View
              style={[styles.globalCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.globalRow}>
                <Text style={{ fontSize: 22 }}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.globalTitle, { color: colors.text }]}>
                    {t("aiAdmin.moderationGlobal")}
                  </Text>
                  <Text style={[styles.globalSub, { color: colors.textMuted }]}>
                    {t("aiAdmin.moderationGlobalDesc")}
                  </Text>
                </View>
                <Switch
                  testID="moderation-global-toggle"
                  value={moderation.globalEnabled}
                  onValueChange={(v) => updateModeration({ globalEnabled: v })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>

              <Text style={[styles.optionLabel, { color: colors.textMuted }]}>
                {t("aiAdmin.globalLevel")}
              </Text>
              <LevelPicker
                selected={moderation.globalLevel}
                onSelect={(v) => updateModeration({ globalLevel: v })}
                colors={colors}
              />
            </View>

            {/* Additional toggles */}
            <View
              style={[styles.toggleCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.toggleItemRow}>
                <Text style={[styles.toggleItemLabel, { color: colors.text }]}>
                  {t("aiAdmin.logModerationEvents")}
                </Text>
                <Switch
                  value={moderation.logModerationEvents}
                  onValueChange={(v) =>
                    updateModeration({ logModerationEvents: v })
                  }
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
              <View style={styles.toggleItemRow}>
                <Text style={[styles.toggleItemLabel, { color: colors.text }]}>
                  {t("aiAdmin.notifyOnBlock")}
                </Text>
                <Switch
                  value={moderation.notifyOnBlock}
                  onValueChange={(v) => updateModeration({ notifyOnBlock: v })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
              <View style={styles.toggleItemRow}>
                <Text style={[styles.toggleItemLabel, { color: colors.text }]}>
                  {t("aiAdmin.allowOverride")}
                </Text>
                <Switch
                  value={moderation.allowOverride}
                  onValueChange={(v) => updateModeration({ allowOverride: v })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("aiAdmin.categoryRules")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { gap: 10, paddingBottom: 40 },
  header: { gap: 12, marginBottom: 8 },
  globalCard: { padding: 16, borderRadius: 12, gap: 10 },
  globalRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  globalTitle: { fontSize: 15, fontWeight: "600" },
  globalSub: { fontSize: 12, marginTop: 2 },
  toggleCard: { borderRadius: 12, overflow: "hidden" },
  toggleItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  toggleItemLabel: { fontSize: 14, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  ruleCard: { borderRadius: 12, overflow: "hidden" },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  ruleEmoji: { fontSize: 20 },
  ruleLabel: { fontSize: 14, fontWeight: "600", flex: 1 },
  ruleOptions: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
  optionLabel: { fontSize: 12, fontWeight: "500" },
  levelRow: { flexDirection: "row", gap: 6 },
  levelChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
});
