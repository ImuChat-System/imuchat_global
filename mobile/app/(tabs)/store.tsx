/**
 * StoreScreen — Connecté au backend Supabase (Phase M1)
 *
 * Remplace le MOCK_CATALOG par le catalogue réel depuis la table `modules`.
 * Sections : DynamicHero, Tabs (All/Apps/Installed/Services/Bundles),
 *            SearchBar, SortBar, ModuleGrid, InstallModal
 */

import { useNetworkState } from "@/hooks/useNetworkState";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { useModulesStore } from "@/stores/modules-store";
import type {
  SortOption,
  StoredModuleManifest,
  StoreTab,
} from "@/types/modules";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────
const STORE_TABS: { key: StoreTab; label: string; icon: string }[] = [
  { key: "all", label: "store.all", icon: "🏪" },
  { key: "apps", label: "store.apps", icon: "📱" },
  { key: "installed", label: "store.installed", icon: "✅" },
  { key: "contents", label: "store.contents", icon: "🎨" },
  { key: "services", label: "store.services", icon: "⚡" },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "popular", label: "store.popular" },
  { key: "newest", label: "store.newest" },
  { key: "rating", label: "store.rating" },
  { key: "price-asc", label: "store.priceAsc" },
];

// Map catégorie module → tab du store
const CATEGORY_TAB_MAP: Record<string, StoreTab> = {
  core: "apps",
  social: "apps",
  media: "contents",
  productivity: "apps",
  entertainment: "contents",
  education: "contents",
  lifestyle: "services",
  finance: "services",
  services: "services",
  creativity: "contents",
  communication: "apps",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────
export default function StoreScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { showToast } = useToast();
  const router = useRouter();
  const { isConnected: isOnline } = useNetworkState();

  // State
  const [tab, setTab] = useState<StoreTab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [selectedModule, setSelectedModule] =
    useState<StoredModuleManifest | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Store Zustand
  const {
    catalog,
    catalogLoading,
    catalogError,
    installedModules,
    fetchCatalog,
    fetchInstalled,
    install,
    uninstall,
    isInstalled,
    isActive,
    runAutoInstall,
  } = useModulesStore();

  // ─── Initial fetch ────────────────────────────────────────
  useEffect(() => {
    fetchCatalog();
    fetchInstalled();
    runAutoInstall();
  }, []);

  // ─── Pull-to-refresh ─────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchCatalog(true), fetchInstalled(true)]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCatalog, fetchInstalled]);

  // ─── Filtering & sorting ──────────────────────────────────
  const filtered = useMemo(() => {
    let items: StoredModuleManifest[];

    if (tab === "installed") {
      items = installedModules
        .filter((um) => um.module)
        .map((um) => um.module!)
        .filter((m) => !m.is_core);
    } else {
      items = [...catalog];
    }

    // Filtre par tab (catégorie)
    if (tab !== "all" && tab !== "installed") {
      items = items.filter((item) => {
        const mappedTab = CATEGORY_TAB_MAP[item.category] || "apps";
        return mappedTab === tab;
      });
    }

    // Filtre par recherche
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.description.toLowerCase().includes(lowerSearch) ||
          item.author.toLowerCase().includes(lowerSearch),
      );
    }

    // Tri
    items.sort((a, b) => {
      switch (sort) {
        case "popular":
          return b.download_count - a.download_count;
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "rating":
          return b.rating - a.rating;
        case "price-asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price-desc":
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return 0;
      }
    });

    return items;
  }, [catalog, installedModules, tab, search, sort]);

  // ─── Hero banner ──────────────────────────────────────────
  const heroModule = useMemo(() => {
    if (catalog.length === 0) return null;
    return (
      catalog
        .filter((m) => !m.is_core && m.is_verified)
        .sort((a, b) => b.rating - a.rating)[0] ?? null
    );
  }, [catalog]);

  // ─── Install handler ────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (!selectedModule) return;
    setInstalling(true);
    try {
      await install(selectedModule.id, selectedModule.permissions);
      setShowInstallModal(false);
      setSelectedModule(null);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t("store.installFailed"),
        "error",
      );
    } finally {
      setInstalling(false);
    }
  }, [selectedModule, install, t]);

  // ─── Uninstall handler ──────────────────────────────────────
  const handleUninstall = useCallback(async () => {
    if (!selectedModule) return;
    Alert.alert(
      t("store.confirmUninstall"),
      t("store.confirmUninstallDesc", { name: selectedModule.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("store.uninstall"),
          style: "destructive",
          onPress: async () => {
            try {
              await uninstall(selectedModule.id);
              setShowInstallModal(false);
              setSelectedModule(null);
            } catch (error) {
              showToast(
                error instanceof Error
                  ? error.message
                  : t("store.uninstallFailed"),
                "error",
              );
            }
          },
        },
      ],
    );
  }, [selectedModule, uninstall, t]);

  // ─── Open mini-app ────────────────────────────────────────
  const handleOpenModule = useCallback(
    (module: StoredModuleManifest) => {
      if (module.is_core) return;
      router.push({
        pathname: "/miniapp/[id]",
        params: { id: module.id },
      } as never);
    },
    [router],
  );

  // ─── Format helpers ───────────────────────────────────────
  const formatDownloads = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return `${count}`;
  };

  const formatSize = (bytes: number): string => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  // ─── Module card ──────────────────────────────────────────
  const renderModuleCard = (module: StoredModuleManifest) => {
    const installed = isInstalled(module.id);
    const active = isActive(module.id);
    const userMod = installed
      ? installedModules.find((um) => um.module_id === module.id)
      : undefined;
    const hasUpdate =
      installed &&
      userMod?.installed_version &&
      userMod.installed_version !== module.version;

    return (
      <TouchableOpacity
        key={module.id}
        testID={`store-item-${module.id}`}
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.surface,
            borderColor: installed ? colors.primary + "40" : colors.border,
            borderWidth: installed ? 1.5 : 1,
          },
        ]}
        onPress={() => {
          setSelectedModule(module);
          setShowInstallModal(true);
        }}
        onLongPress={() => {
          if (installed && !module.is_core) {
            handleOpenModule(module);
          }
        }}
      >
        <View style={styles.itemIconWrap}>
          <Text style={styles.itemIcon}>{module.icon || "📦"}</Text>
          {module.is_verified && <Text style={styles.itemBadge}>✓</Text>}
          {installed && (
            <View
              style={[
                styles.installedDot,
                { backgroundColor: active ? colors.primary : colors.textMuted },
              ]}
            />
          )}
          {hasUpdate && (
            <View style={[styles.updateDot, { backgroundColor: "#f59e0b" }]}>
              <Text style={styles.updateDotText}>↑</Text>
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemName, { color: colors.text }]}
            numberOfLines={1}
          >
            {module.name}
          </Text>
          <Text
            style={[styles.itemDesc, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {module.description}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.itemRating, { color: colors.primary }]}>
              ⭐ {module.rating.toFixed(1)}
            </Text>
            <Text style={[styles.itemDownloads, { color: colors.textMuted }]}>
              ⬇ {formatDownloads(module.download_count)}
            </Text>
            {module.bundle_size > 0 && (
              <Text style={[styles.itemSize, { color: colors.textMuted }]}>
                {formatSize(module.bundle_size)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.itemPriceWrap}>
          {installed ? (
            hasUpdate ? (
              <Text style={[styles.updateLabel, { color: "#f59e0b" }]}>
                {t("store.updateAvailable")}
              </Text>
            ) : (
              <Text style={[styles.installedLabel, { color: colors.primary }]}>
                {t("store.installed_label")}
              </Text>
            )
          ) : (
            <Text
              style={[
                styles.itemPrice,
                { color: module.price ? colors.text : colors.primary },
              ]}
            >
              {module.price ? `${module.price.toFixed(2)}€` : t("common.free")}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ═════════════════════════════════════════════════════════
  // LOADING STATE
  // ═════════════════════════════════════════════════════════
  const isLoading = catalogLoading && catalog.length === 0;

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════
  return (
    <View
      testID="store-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.content, { padding: spacing.lg }]}>
          {/* Header */}
          <Text style={[styles.title, { color: colors.text }]}>
            {t("store.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t("store.subtitle")}
            {catalog.length > 0 && (
              <Text style={{ fontSize: 12 }}>
                {" "}
                — {catalog.length} {t("store.modules")}
              </Text>
            )}
          </Text>

          {/* ── Offline Banner ──────────────────────────────────── */}
          {isOnline === false && (
            <View
              testID="offline-banner"
              style={[
                styles.offlineBanner,
                { backgroundColor: "#f59e0b20", borderColor: "#f59e0b50" },
              ]}
            >
              <Text style={styles.offlineIcon}>📡</Text>
              <Text style={[styles.offlineText, { color: "#f59e0b" }]}>
                {t("store.offlineWarning")}
              </Text>
            </View>
          )}

          {/* ── Hero Banner ─────────────────────────────────────── */}
          {heroModule && (
            <TouchableOpacity
              testID="store-hero"
              style={[
                styles.heroBanner,
                {
                  backgroundColor: colors.primary + "15",
                  borderColor: colors.primary + "30",
                },
              ]}
              onPress={() => {
                setSelectedModule(heroModule);
                setShowInstallModal(true);
              }}
            >
              <Text style={styles.heroIcon}>{heroModule.icon || "⭐"}</Text>
              <View style={styles.heroInfo}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {heroModule.is_verified ? "✓ " : ""}
                  {heroModule.name}
                </Text>
                <Text style={[styles.heroDesc, { color: colors.textMuted }]}>
                  {heroModule.description}
                </Text>
                <Text style={[styles.heroMeta, { color: colors.primary }]}>
                  ⭐ {heroModule.rating.toFixed(1)} · ⬇{" "}
                  {formatDownloads(heroModule.download_count)}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ── Search bar ──────────────────────────────────────── */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              testID="store-search"
              value={search}
              onChangeText={setSearch}
              placeholder={t("store.searchPlaceholder")}
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {search.length > 0 && (
              <TouchableOpacity
                testID="search-clear"
                onPress={() => setSearch("")}
              >
                <Text style={[styles.clearBtn, { color: colors.textMuted }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Tabs ────────────────────────────────────────────── */}
          <ScrollView
            testID="store-tabs"
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabRow}
          >
            {STORE_TABS.map((tabItem) => {
              const active = tab === tabItem.key;
              const count =
                tabItem.key === "installed"
                  ? installedModules.filter(
                      (m) => m.module && !m.module.is_core,
                    ).length
                  : undefined;
              return (
                <TouchableOpacity
                  key={tabItem.key}
                  testID={`tab-${tabItem.key}`}
                  onPress={() => setTab(tabItem.key)}
                  style={[
                    styles.tabBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.tabIcon}>{tabItem.icon}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? "#fff" : colors.textMuted },
                    ]}
                  >
                    {t(tabItem.label)}
                  </Text>
                  {count !== undefined && count > 0 && (
                    <View
                      style={[
                        styles.tabBadge,
                        { backgroundColor: active ? "#fff" : colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          { color: active ? colors.primary : "#fff" },
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Sort bar ────────────────────────────────────────── */}
          <View testID="sort-bar" style={styles.sortRow}>
            {SORT_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                testID={`sort-${s.key}`}
                onPress={() => setSort(s.key)}
                style={[
                  styles.sortBtn,
                  {
                    borderBottomColor:
                      sort === s.key ? colors.primary : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortText,
                    {
                      color: sort === s.key ? colors.primary : colors.textMuted,
                    },
                  ]}
                >
                  {t(s.label)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Loading state ────────────────────────────────────── */}
          {isLoading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                {t("store.loading")}
              </Text>
            </View>
          )}

          {/* ── Error state ─────────────────────────────────────── */}
          {catalogError && !isLoading && (
            <View style={styles.errorWrap}>
              <Text
                style={[styles.errorText, { color: colors.error || "#ef4444" }]}
              >
                {t("store.loadError")}
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { borderColor: colors.primary }]}
                onPress={() => fetchCatalog(true)}
              >
                <Text style={[styles.retryText, { color: colors.primary }]}>
                  {t("common.retry")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Product grid ────────────────────────────────────── */}
          {!isLoading && (
            <View testID="store-grid">
              {filtered.length === 0 ? (
                <Text
                  testID="no-results"
                  style={[styles.emptyText, { color: colors.textMuted }]}
                >
                  {tab === "installed"
                    ? t("store.noInstalled")
                    : t("common.noResults")}
                </Text>
              ) : (
                filtered.map(renderModuleCard)
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* ═══ Install / Detail Modal ═════════════════════════════════ */}
      <Modal
        testID="install-modal"
        visible={showInstallModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInstallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            {selectedModule && (
              <>
                <Text style={styles.modalIcon}>
                  {selectedModule.icon || "📦"}
                </Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedModule.name}
                </Text>
                {selectedModule.is_verified && (
                  <Text
                    style={[styles.verifiedBadge, { color: colors.primary }]}
                  >
                    ✓ {t("store.verified")}
                  </Text>
                )}
                <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
                  {selectedModule.description}
                </Text>

                {/* Meta info */}
                <View style={styles.modalMeta}>
                  <Text style={[styles.modalRating, { color: colors.primary }]}>
                    ⭐ {selectedModule.rating.toFixed(1)}
                  </Text>
                  <Text
                    style={[styles.modalDownloads, { color: colors.textMuted }]}
                  >
                    ⬇ {formatDownloads(selectedModule.download_count)}{" "}
                    {t("store.downloads")}
                  </Text>
                  {selectedModule.bundle_size > 0 && (
                    <Text
                      style={[styles.modalSize, { color: colors.textMuted }]}
                    >
                      📦 {formatSize(selectedModule.bundle_size)}
                    </Text>
                  )}
                </View>

                {/* Author & version */}
                <View style={styles.modalInfoRow}>
                  <Text
                    style={[styles.modalInfoLabel, { color: colors.textMuted }]}
                  >
                    {t("store.author")}: {selectedModule.author}
                  </Text>
                  <Text
                    style={[styles.modalInfoLabel, { color: colors.textMuted }]}
                  >
                    v{selectedModule.version}
                  </Text>
                </View>

                {/* Permissions (si non-core) */}
                {!selectedModule.is_core &&
                  selectedModule.permissions.length > 0 &&
                  !isInstalled(selectedModule.id) && (
                    <View style={styles.permissionsWrap}>
                      <Text
                        style={[
                          styles.permissionsTitle,
                          { color: colors.text },
                        ]}
                      >
                        {t("store.permissions")}
                      </Text>
                      {selectedModule.permissions.map((perm) => (
                        <Text
                          key={perm}
                          style={[
                            styles.permissionItem,
                            { color: colors.textMuted },
                          ]}
                        >
                          • {perm}
                        </Text>
                      ))}
                    </View>
                  )}

                {/* Action buttons */}
                {isInstalled(selectedModule.id) ? (
                  <View style={styles.modalActions}>
                    {!selectedModule.is_core && (
                      <TouchableOpacity
                        testID="btn-open"
                        style={[
                          styles.purchaseBtn,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() => {
                          setShowInstallModal(false);
                          handleOpenModule(selectedModule);
                        }}
                      >
                        <Text style={styles.purchaseBtnText}>
                          {t("store.open")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!selectedModule.is_core && (
                      <TouchableOpacity
                        testID="btn-uninstall"
                        style={[
                          styles.uninstallBtn,
                          { borderColor: "#ef4444" },
                        ]}
                        onPress={handleUninstall}
                      >
                        <Text
                          style={[
                            styles.uninstallBtnText,
                            { color: "#ef4444" },
                          ]}
                        >
                          {t("store.uninstall")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {selectedModule.is_core && (
                      <Text
                        style={[styles.coreLabel, { color: colors.textMuted }]}
                      >
                        {t("store.coreModule")}
                      </Text>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    testID="btn-install"
                    style={[
                      styles.purchaseBtn,
                      {
                        backgroundColor: colors.primary,
                        opacity: installing || isOnline === false ? 0.6 : 1,
                      },
                    ]}
                    onPress={handleInstall}
                    disabled={installing || isOnline === false}
                  >
                    {installing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.purchaseBtnText}>
                        {isOnline === false
                          ? t("store.offlineInstall")
                          : selectedModule.price
                            ? t("store.buy", {
                                price: selectedModule.price.toFixed(2),
                              })
                            : t("store.installFree")}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
            <TouchableOpacity
              testID="btn-close-modal"
              style={styles.closeBtn}
              onPress={() => setShowInstallModal(false)}
            >
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>
                {t("common.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 16 },

  // Hero
  heroBanner: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "center",
  },
  heroIcon: { fontSize: 40, marginRight: 14 },
  heroInfo: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  heroDesc: { fontSize: 13, marginBottom: 4 },
  heroMeta: { fontSize: 12, fontWeight: "600" },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  clearBtn: { fontSize: 16, paddingLeft: 8 },

  // Tabs
  tabRow: { marginBottom: 12 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 13, fontWeight: "500" },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "700" },

  // Sort
  sortRow: { flexDirection: "row", marginBottom: 16, gap: 12 },
  sortBtn: { paddingBottom: 6, borderBottomWidth: 2 },
  sortText: { fontSize: 13, fontWeight: "500" },

  // Item card
  itemCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  itemIconWrap: { alignItems: "center", marginRight: 12, width: 48 },
  itemIcon: { fontSize: 32 },
  itemBadge: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
    color: "#3b82f6",
  },
  installedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  updateDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  updateDotText: { color: "#fff", fontSize: 10, fontWeight: "700" as const },
  updateLabel: { fontSize: 11, fontWeight: "700" as const },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  itemMeta: { flexDirection: "row", gap: 12, marginTop: 4 },
  itemRating: { fontSize: 12, fontWeight: "600" },
  itemDownloads: { fontSize: 12 },
  itemSize: { fontSize: 11 },
  itemPriceWrap: { marginLeft: 8, minWidth: 60, alignItems: "flex-end" },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  installedLabel: { fontSize: 11, fontWeight: "700" },

  // Loading
  loadingWrap: { alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },

  // Error
  errorWrap: { alignItems: "center", padding: 40 },
  errorText: { fontSize: 14, marginBottom: 12, textAlign: "center" },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: { fontSize: 14, fontWeight: "600" },

  // Empty
  emptyText: { textAlign: "center", padding: 40, fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
    maxHeight: "80%",
  },
  modalIcon: { fontSize: 56, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  verifiedBadge: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  modalDesc: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  modalRating: { fontSize: 14, fontWeight: "600" },
  modalDownloads: { fontSize: 14 },
  modalSize: { fontSize: 14 },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalInfoLabel: { fontSize: 12 },
  permissionsWrap: {
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  permissionsTitle: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  permissionItem: { fontSize: 12, marginBottom: 2, paddingLeft: 4 },
  modalActions: { width: "100%", gap: 10 },
  purchaseBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  purchaseBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  uninstallBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  uninstallBtnText: { fontSize: 14, fontWeight: "600" },
  coreLabel: {
    textAlign: "center",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
  },
  closeBtn: { marginTop: 16, paddingVertical: 12 },
  closeBtnText: { fontSize: 14 },

  // Offline
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  offlineIcon: { fontSize: 18 },
  offlineText: { fontSize: 13, fontWeight: "600", flex: 1 },
});
