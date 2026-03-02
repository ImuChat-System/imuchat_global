/**
 * BotsHomeScreen — Écran principal du module Bots
 *
 * Deux onglets :
 *  - Catalogue (bots officiels + communautaires)
 *  - Installés (bots du groupe sélectionné)
 *
 * Phase 3 — DEV-025 Bots de groupe
 */

import { useBots } from "@/hooks/useBots";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { BotDefinition, BotInstance } from "@/types/bots";
import { BotStatus } from "@/types/bots";
import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Tab Types ───────────────────────────────────────────────
type TabId = "catalog" | "installed";

// ─── Component ───────────────────────────────────────────────
export default function BotsHomeScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const conversationId = params.conversationId;

  const {
    catalog,
    installedBots,
    installedBotsWithDefinition,
    isLoading,
    error,
    searchCatalog,
    install,
    getBotDefinition,
    loadCatalog,
  } = useBots(conversationId);

  const [activeTab, setActiveTab] = useState<TabId>("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ── Filtrer le catalogue ─────────────────────────────────────
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    return searchCatalog(searchQuery);
  }, [catalog, searchQuery, searchCatalog]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCatalog();
    setRefreshing(false);
  }, [loadCatalog]);

  const handleBotPress = useCallback(
    (botId: string) => {
      router.push(
        `/bots/${botId}${conversationId ? `?conversationId=${conversationId}` : ""}` as Href,
      );
    },
    [router, conversationId],
  );

  const handleInstall = useCallback(
    async (botId: string) => {
      if (!conversationId) return;
      await install(botId);
    },
    [conversationId, install],
  );

  // ── Status color ─────────────────────────────────────────────
  const getStatusColor = (status: BotStatus) => {
    switch (status) {
      case BotStatus.ACTIVE:
        return "#10B981";
      case BotStatus.PAUSED:
        return "#F59E0B";
      case BotStatus.DISABLED:
        return "#6B7280";
      case BotStatus.ERROR:
        return "#EF4444";
      default:
        return colors.textMuted;
    }
  };

  // ── Render Bot Card (Catalogue) ──────────────────────────────
  const renderCatalogItem = useCallback(
    ({ item }: { item: BotDefinition }) => {
      const isInstalled = installedBots.some((b) => b.botId === item.id);

      return (
        <TouchableOpacity
          style={[
            styles.botCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => handleBotPress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.botCardHeader}>
            <View
              style={[
                styles.botIcon,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.botCardInfo}>
              <View style={styles.botNameRow}>
                <Text style={[styles.botName, { color: colors.text }]}>
                  {item.name}
                </Text>
                {item.isOfficial && (
                  <View
                    style={[
                      styles.officialBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.officialBadgeText}>Officiel</Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.botDescription, { color: colors.textMuted }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            </View>
          </View>

          <View style={styles.botCardFooter}>
            <View style={styles.botStats}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={[styles.botStat, { color: colors.textMuted }]}>
                {item.rating}
              </Text>
              <Text style={[styles.botStatSep, { color: colors.textMuted }]}>
                ·
              </Text>
              <Text style={[styles.botStat, { color: colors.textMuted }]}>
                {item.commands.length} {t("groupBots.commands")}
              </Text>
            </View>

            {conversationId && !isInstalled && (
              <TouchableOpacity
                style={[
                  styles.installButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => handleInstall(item.id)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.installButtonText}>
                  {t("groupBots.install")}
                </Text>
              </TouchableOpacity>
            )}

            {isInstalled && (
              <View
                style={[
                  styles.installedBadge,
                  { backgroundColor: "#10B98120" },
                ]}
              >
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={[styles.installedText, { color: "#10B981" }]}>
                  {t("groupBots.installed")}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [colors, installedBots, conversationId, handleBotPress, handleInstall, t],
  );

  // ── Render Installed Bot ─────────────────────────────────────
  const renderInstalledItem = useCallback(
    ({
      item,
    }: {
      item: { instance: BotInstance; definition: BotDefinition | null };
    }) => {
      const { instance, definition } = item;
      if (!definition) return null;

      return (
        <TouchableOpacity
          style={[
            styles.botCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => handleBotPress(instance.botId)}
          activeOpacity={0.7}
        >
          <View style={styles.botCardHeader}>
            <View
              style={[
                styles.botIcon,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name={definition.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.botCardInfo}>
              <Text style={[styles.botName, { color: colors.text }]}>
                {definition.name}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(instance.status) },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.textMuted }]}>
                  {instance.status === BotStatus.ACTIVE
                    ? t("groupBots.active")
                    : instance.status}
                </Text>
                <Text style={[styles.botStatSep, { color: colors.textMuted }]}>
                  ·
                </Text>
                <Text style={[styles.botStat, { color: colors.textMuted }]}>
                  {instance.commandsExecuted} {t("groupBots.commandsExecuted")}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, handleBotPress, t],
  );

  // ── Tabs ─────────────────────────────────────────────────────
  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: "catalog", label: t("groupBots.catalog"), icon: "apps" },
    {
      id: "installed",
      label: `${t("groupBots.installed")} (${installedBots.length})`,
      icon: "checkmark-circle",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={activeTab === tab.id ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === tab.id ? colors.primary : colors.textMuted,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search (catalogue only) */}
      {activeTab === "catalog" && (
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("groupBots.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: "#EF444420" }]}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      )}

      {/* Catalogue Tab */}
      {activeTab === "catalog" && (
        <FlatList
          data={filteredCatalog}
          keyExtractor={(item) => item.id}
          renderItem={renderCatalogItem}
          contentContainerStyle={{ padding: spacing.md }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="cube-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {searchQuery
                    ? t("groupBots.noResults")
                    : t("groupBots.emptyDesc")}
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Installed Tab */}
      {activeTab === "installed" && (
        <FlatList
          data={installedBotsWithDefinition}
          keyExtractor={(item) => item.instance.id}
          renderItem={renderInstalledItem}
          contentContainerStyle={{ padding: spacing.md }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {t("groupBots.noInstalled")}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.installButton,
                    { backgroundColor: colors.primary, marginTop: 12 },
                  ]}
                  onPress={() => setActiveTab("catalog")}
                >
                  <Text style={styles.installButtonText}>
                    {t("groupBots.browseCatalog")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  botCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  botCardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  botIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botCardInfo: {
    flex: 1,
  },
  botNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  botName: {
    fontSize: 16,
    fontWeight: "600",
  },
  officialBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  officialBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  botDescription: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  botCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  botStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  botStat: {
    fontSize: 12,
  },
  botStatSep: {
    fontSize: 12,
  },
  installButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  installButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  installedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  installedText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
