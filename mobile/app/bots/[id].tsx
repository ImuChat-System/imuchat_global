/**
 * BotDetailScreen — Détail et configuration d'un bot
 *
 * Affiche :
 *  - Infos du bot (nom, description, catégorie)
 *  - Commandes disponibles
 *  - Configuration (si installé)
 *  - Bouton installer / désinstaller
 *  - Logs de modération (si bot modération)
 *  - Événements récents
 *
 * Phase 3 — DEV-025 Bots de groupe
 */

import { useBots } from "@/hooks/useBots";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { BotStatus } from "@/types/bots";
import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BotDetailScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const { id, conversationId } = useLocalSearchParams<{
    id: string;
    conversationId?: string;
  }>();

  const {
    installedBots,
    getBotDefinition,
    install,
    uninstall,
    updateConfig,
    changeStatus,
    loadBotEvents,
    botEvents,
    loadModerationLogs,
    moderationLogs,
    isLoading,
  } = useBots(conversationId);

  const [actionLoading, setActionLoading] = useState(false);

  // ── Données du bot ───────────────────────────────────────────
  const botDefinition = useMemo(
    () => getBotDefinition(id),
    [id, getBotDefinition],
  );
  const instance = useMemo(
    () => installedBots.find((b) => b.botId === id),
    [installedBots, id],
  );
  const isInstalled = !!instance;

  // ── Handlers ─────────────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (!conversationId || !botDefinition) return;
    setActionLoading(true);
    const success = await install(botDefinition.id);
    setActionLoading(false);
    if (success) {
      Alert.alert("✅", `${botDefinition.name} installé avec succès !`);
    }
  }, [conversationId, botDefinition, install]);

  const handleUninstall = useCallback(async () => {
    if (!instance || !botDefinition) return;
    Alert.alert(
      t("groupBots.confirmUninstall"),
      `${t("groupBots.confirmUninstallDesc")} ${botDefinition.name} ?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("groupBots.uninstall"),
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            await uninstall(instance.id);
            setActionLoading(false);
          },
        },
      ],
    );
  }, [instance, botDefinition, uninstall, t]);

  const handleToggleStatus = useCallback(async () => {
    if (!instance) return;
    const newStatus =
      instance.status === BotStatus.ACTIVE
        ? BotStatus.PAUSED
        : BotStatus.ACTIVE;
    await changeStatus(instance.id, newStatus);
  }, [instance, changeStatus]);

  // ── Guard ────────────────────────────────────────────────────
  if (!botDefinition) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("groupBots.botNotFound")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View
          style={[styles.botIcon, { backgroundColor: colors.primary + "20" }]}
        >
          <Ionicons
            name={botDefinition.icon as keyof typeof Ionicons.glyphMap}
            size={36}
            color={colors.primary}
          />
        </View>
        <Text style={[styles.botName, { color: colors.text }]}>
          {botDefinition.name}
        </Text>
        <Text style={[styles.botAuthor, { color: colors.textMuted }]}>
          {t("groupBots.by")} {botDefinition.author} · v{botDefinition.version}
        </Text>
        <Text style={[styles.botDescription, { color: colors.textMuted }]}>
          {botDefinition.description}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {botDefinition.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: colors.primary + "15" }]}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {botDefinition.rating}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="download-outline"
              size={16}
              color={colors.textMuted}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {botDefinition.installCount}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="terminal-outline"
              size={16}
              color={colors.textMuted}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {botDefinition.commands.length} {t("groupBots.commands")}
            </Text>
          </View>
        </View>
      </View>

      {/* Install / Status */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        {!isInstalled && conversationId && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleInstall}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {t("groupBots.installBot")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isInstalled && instance && (
          <View style={styles.installedActions}>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                {t("groupBots.botActive")}
              </Text>
              <Switch
                value={instance.status === BotStatus.ACTIVE}
                onValueChange={handleToggleStatus}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "60",
                }}
                thumbColor={
                  instance.status === BotStatus.ACTIVE
                    ? colors.primary
                    : "#f4f3f4"
                }
              />
            </View>

            <View style={styles.instanceStats}>
              <Text
                style={[styles.instanceStatText, { color: colors.textMuted }]}
              >
                📊 {instance.commandsExecuted} {t("groupBots.commandsExecuted")}
              </Text>
              <Text
                style={[styles.instanceStatText, { color: colors.textMuted }]}
              >
                📅 {new Date(instance.installedAt).toLocaleDateString()}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.uninstallButton, { borderColor: "#EF4444" }]}
              onPress={handleUninstall}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.uninstallText}>
                {t("groupBots.uninstall")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!conversationId && (
          <View style={styles.noGroupWarning}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.textMuted}
            />
            <Text style={[styles.noGroupText, { color: colors.textMuted }]}>
              {t("groupBots.selectGroupFirst")}
            </Text>
          </View>
        )}
      </View>

      {/* Commands */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("groupBots.commands")}
        </Text>
        {botDefinition.commands.map((cmd) => (
          <View
            key={cmd.name}
            style={[styles.commandItem, { borderBottomColor: colors.border }]}
          >
            <View style={styles.commandHeader}>
              <Text style={[styles.commandName, { color: colors.primary }]}>
                /{cmd.name}
              </Text>
              <Text
                style={[styles.commandPermission, { color: colors.textMuted }]}
              >
                {cmd.permission}
              </Text>
            </View>
            <Text
              style={[styles.commandDescription, { color: colors.textMuted }]}
            >
              {cmd.description}
            </Text>
            <Text style={[styles.commandUsage, { color: colors.textMuted }]}>
              {cmd.usage}
            </Text>
          </View>
        ))}
      </View>

      {/* Moderation Logs (if moderation bot) */}
      {isInstalled && botDefinition.id === "official-moderation" && (
        <TouchableOpacity
          style={[styles.section, { backgroundColor: colors.surface }]}
          onPress={() =>
            router.push(
              `/bots/moderation?conversationId=${conversationId}` as Href,
            )
          }
        >
          <View style={styles.linkRow}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.linkText, { color: colors.text }]}>
              {t("groupBots.viewModLogs")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </View>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  botIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  botName: {
    fontSize: 22,
    fontWeight: "700",
  },
  botAuthor: {
    fontSize: 13,
  },
  botDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  installedActions: {
    gap: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  instanceStats: {
    flexDirection: "row",
    gap: 16,
  },
  instanceStatText: {
    fontSize: 13,
  },
  uninstallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  uninstallText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  noGroupWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  noGroupText: {
    fontSize: 13,
    flex: 1,
  },
  commandItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commandName: {
    fontSize: 15,
    fontWeight: "600",
  },
  commandPermission: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  commandDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  commandUsage: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
