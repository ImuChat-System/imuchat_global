/**
 * PermissionsScreen — AI Tool Permissions (DEV-035)
 *
 * Manage which tools the AI assistant can access:
 *  - Toggle each tool on/off
 *  - Require confirmation before use
 *  - View usage stats per tool
 *
 * Spec §6.6: Gestion permissions outils IA
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAIAdminStore } from "@/stores/ai-admin-store";
import type { AITool, AIToolPermission } from "@/types/ai-admin";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Tool Config ──────────────────────────────────────────────

const TOOL_CONFIG: Record<
  AITool,
  { emoji: string; label: string; desc: string }
> = {
  web_search: {
    emoji: "🌐",
    label: "Recherche web",
    desc: "Accès à Internet pour rechercher des informations",
  },
  code_execution: {
    emoji: "💻",
    label: "Exécution de code",
    desc: "Exécuter du code dans un sandbox",
  },
  file_access: {
    emoji: "📁",
    label: "Accès fichiers",
    desc: "Lire et écrire dans vos fichiers",
  },
  calendar_access: {
    emoji: "📅",
    label: "Calendrier",
    desc: "Accéder à votre agenda",
  },
  contacts_access: {
    emoji: "👥",
    label: "Contacts",
    desc: "Accéder à votre liste de contacts",
  },
  location_access: {
    emoji: "📍",
    label: "Localisation",
    desc: "Accéder à votre position GPS",
  },
  media_generation: {
    emoji: "🎨",
    label: "Génération média",
    desc: "Créer des images, audio, vidéo",
  },
  translation: {
    emoji: "🌍",
    label: "Traduction",
    desc: "Traduire du texte entre langues",
  },
  summarization: {
    emoji: "📝",
    label: "Résumé",
    desc: "Résumer de longs textes ou conversations",
  },
};

// ─── Permission Card ──────────────────────────────────────────

interface PermCardProps {
  perm: AIToolPermission;
  onToggle: (enabled: boolean) => void;
  onConfirmToggle: (require: boolean) => void;
  colors: ReturnType<typeof useColors>;
  t: (key: string) => string;
}

function PermCard({
  perm,
  onToggle,
  onConfirmToggle,
  colors,
  t,
}: PermCardProps) {
  const cfg = TOOL_CONFIG[perm.tool];

  return (
    <View style={[styles.permCard, { backgroundColor: colors.surface }]}>
      <View style={styles.permHeader}>
        <Text style={styles.permEmoji}>{cfg.emoji}</Text>
        <View style={styles.permInfo}>
          <Text style={[styles.permLabel, { color: colors.text }]}>
            {cfg.label}
          </Text>
          <Text style={[styles.permDesc, { color: colors.textMuted }]}>
            {cfg.desc}
          </Text>
        </View>
        <Switch
          value={perm.enabled}
          onValueChange={onToggle}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>

      {perm.enabled && (
        <View style={styles.permOptions}>
          <TouchableOpacity
            style={[styles.confirmRow, { borderTopColor: colors.border }]}
            onPress={() => onConfirmToggle(!perm.requireConfirmation)}
          >
            <Ionicons
              name={perm.requireConfirmation ? "checkbox" : "square-outline"}
              size={18}
              color={
                perm.requireConfirmation ? colors.primary : colors.textMuted
              }
            />
            <Text style={[styles.confirmText, { color: colors.text }]}>
              {t("aiAdmin.requireConfirmation")}
            </Text>
          </TouchableOpacity>

          <View style={styles.usageRow}>
            <Text style={[styles.usageText, { color: colors.textMuted }]}>
              {t("aiAdmin.usageCount")}: {perm.usageCount}
            </Text>
            {perm.lastUsedAt && (
              <Text style={[styles.usageText, { color: colors.textMuted }]}>
                {t("aiAdmin.lastUsed")}:{" "}
                {new Date(perm.lastUsedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function PermissionsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { toolPermissions, toggleToolPermission, setToolConfirmation } =
    useAIAdminStore();

  const renderItem = useCallback(
    ({ item }: { item: AIToolPermission }) => (
      <PermCard
        perm={item}
        onToggle={(enabled) => toggleToolPermission(item.tool, enabled)}
        onConfirmToggle={(require) => setToolConfirmation(item.tool, require)}
        colors={colors}
        t={t}
      />
    ),
    [colors, t, toggleToolPermission, setToolConfirmation],
  );

  const enabled = toolPermissions.filter((tp) => tp.enabled).length;

  return (
    <View
      testID="permissions-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={toolPermissions}
        keyExtractor={(tp) => tp.tool}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { padding: spacing.md }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.textMuted }]}>
              {t("aiAdmin.permissionsDesc")}
            </Text>
            <Text style={[styles.counterText, { color: colors.text }]}>
              {enabled}/{toolPermissions.length} {t("aiAdmin.toolsEnabled")}
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
  header: { gap: 6, marginBottom: 8 },
  headerText: { fontSize: 13 },
  counterText: { fontSize: 14, fontWeight: "600" },
  permCard: { borderRadius: 12, overflow: "hidden" },
  permHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  permEmoji: { fontSize: 22 },
  permInfo: { flex: 1 },
  permLabel: { fontSize: 14, fontWeight: "600" },
  permDesc: { fontSize: 11, marginTop: 2 },
  permOptions: { paddingHorizontal: 14, paddingBottom: 12 },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  confirmText: { fontSize: 13 },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  usageText: { fontSize: 11 },
});
