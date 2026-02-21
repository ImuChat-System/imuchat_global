/**
 * StoreScreen — Parité web store page
 * Sections : DynamicHero, Tabs (All/Apps/Contents/Services/Bundles),
 *            SearchBar, StoreFilterBar, MixedContentGrid, PurchaseModal
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────
type StoreTab = "all" | "apps" | "contents" | "services" | "bundles";
type SortOption = "popular" | "newest" | "price-asc" | "price-desc";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: StoreTab;
  price: number | null; // null = free
  rating: number;
  downloads: number;
  icon: string;
  badge?: string;
}

const STORE_TABS: { key: StoreTab; label: string; icon: string }[] = [
  { key: "all", label: "store.all", icon: "🏪" },
  { key: "apps", label: "store.apps", icon: "📱" },
  { key: "contents", label: "store.contents", icon: "🎨" },
  { key: "services", label: "store.services", icon: "⚡" },
  { key: "bundles", label: "store.bundles", icon: "📦" },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "popular", label: "store.popular" },
  { key: "newest", label: "store.newest" },
  { key: "price-asc", label: "store.priceAsc" },
  { key: "price-desc", label: "store.priceDesc" },
];

// ─── Mock catalog (parité web fetchCatalogItems) ─────────────────
const MOCK_CATALOG: StoreItem[] = [
  {
    id: "si-1",
    name: "Thème Aurora",
    description: "Un thème sombre avec des accents néon",
    category: "contents",
    price: null,
    rating: 4.8,
    downloads: 1240,
    icon: "🌌",
    badge: "⭐ Top",
  },
  {
    id: "si-2",
    name: "Music Player Pro",
    description: "Lecteur musical intégré avec playlists",
    category: "apps",
    price: 2.99,
    rating: 4.5,
    downloads: 876,
    icon: "🎵",
  },
  {
    id: "si-3",
    name: "Anime Sticker Pack",
    description: "200+ stickers anime pour vos chats",
    category: "contents",
    price: 0.99,
    rating: 4.9,
    downloads: 3420,
    icon: "🎌",
    badge: "🔥 Hot",
  },
  {
    id: "si-4",
    name: "Bot Assistant",
    description: "Assistant IA pour vos serveurs",
    category: "services",
    price: 4.99,
    rating: 4.2,
    downloads: 562,
    icon: "🤖",
  },
  {
    id: "si-5",
    name: "Starter Bundle",
    description: "Thème + Stickers + Bot — économisez 30%",
    category: "bundles",
    price: 6.99,
    rating: 4.7,
    downloads: 328,
    icon: "📦",
    badge: "💰 -30%",
  },
  {
    id: "si-6",
    name: "Pixel Art Pack",
    description: "Emojis et avatars pixel art",
    category: "contents",
    price: 1.49,
    rating: 4.6,
    downloads: 1820,
    icon: "👾",
  },
  {
    id: "si-7",
    name: "Translator Bot",
    description: "Traduction en temps réel dans les chats",
    category: "services",
    price: null,
    rating: 4.4,
    downloads: 2150,
    icon: "🌐",
  },
  {
    id: "si-8",
    name: "Games Hub",
    description: "Mini-jeux multijoueurs intégrés",
    category: "apps",
    price: 3.99,
    rating: 4.3,
    downloads: 945,
    icon: "🎮",
  },
  {
    id: "si-9",
    name: "Premium Theme Pack",
    description: "10 thèmes premium exclusifs",
    category: "bundles",
    price: 9.99,
    rating: 4.8,
    downloads: 215,
    icon: "💎",
  },
  {
    id: "si-10",
    name: "Voice Changer",
    description: "Modifiez votre voix en appel",
    category: "apps",
    price: 1.99,
    rating: 4.1,
    downloads: 1560,
    icon: "🎭",
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────
export default function StoreScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const [tab, setTab] = useState<StoreTab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showPurchase, setShowPurchase] = useState(false);

  // ─── Filtering & sorting ──────────────────────────────────────
  const filtered = MOCK_CATALOG.filter((item) => {
    if (tab !== "all" && item.category !== tab) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  }).sort((a, b) => {
    switch (sort) {
      case "popular":
        return b.downloads - a.downloads;
      case "newest":
        return 0; // mock — no createdAt
      case "price-asc":
        return (a.price ?? 0) - (b.price ?? 0);
      case "price-desc":
        return (b.price ?? 0) - (a.price ?? 0);
      default:
        return 0;
    }
  });

  // ─── Hero banner ──────────────────────────────────────────────
  const heroItem = MOCK_CATALOG.find((i) => i.badge?.includes("Top"));

  // ─── Store item card ──────────────────────────────────────────
  const renderItem = (item: StoreItem) => (
    <TouchableOpacity
      key={item.id}
      testID={`store-item-${item.id}`}
      style={[
        styles.itemCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() => {
        setSelectedItem(item);
        setShowPurchase(true);
      }}
    >
      <View style={styles.itemIconWrap}>
        <Text style={styles.itemIcon}>{item.icon}</Text>
        {item.badge && (
          <Text style={[styles.itemBadge, { color: colors.primary }]}>
            {item.badge}
          </Text>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text
          style={[styles.itemName, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.itemDesc, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={[styles.itemRating, { color: colors.primary }]}>
            ⭐ {item.rating}
          </Text>
          <Text style={[styles.itemDownloads, { color: colors.textMuted }]}>
            ⬇ {item.downloads}
          </Text>
        </View>
      </View>
      <View style={styles.itemPriceWrap}>
        <Text
          style={[
            styles.itemPrice,
            { color: item.price ? colors.text : colors.primary },
          ]}
        >
          {item.price ? `${item.price.toFixed(2)}€` : t("common.free")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <View
      testID="store-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={[styles.content, { padding: spacing.lg }]}>
          {/* Header */}
          <Text style={[styles.title, { color: colors.text }]}>
            {t("store.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t("store.subtitle")}
          </Text>

          {/* ── Hero Banner ───────────────────────────────────── */}
          {heroItem && (
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
                setSelectedItem(heroItem);
                setShowPurchase(true);
              }}
            >
              <Text style={styles.heroIcon}>{heroItem.icon}</Text>
              <View style={styles.heroInfo}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {heroItem.badge} {heroItem.name}
                </Text>
                <Text style={[styles.heroDesc, { color: colors.textMuted }]}>
                  {heroItem.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ── Search bar ────────────────────────────────────── */}
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
              placeholder={t("common.searchPlaceholder")}
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

          {/* ── Tabs ──────────────────────────────────────────── */}
          <ScrollView
            testID="store-tabs"
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabRow}
          >
            {STORE_TABS.map((tabItem) => {
              const active = tab === tabItem.key;
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
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Sort bar ──────────────────────────────────────── */}
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

          {/* ── Product grid ──────────────────────────────────── */}
          <View testID="store-grid">
            {filtered.length === 0 ? (
              <Text
                testID="no-results"
                style={[styles.emptyText, { color: colors.textMuted }]}
              >
                {t("common.noResults")}
              </Text>
            ) : (
              filtered.map(renderItem)
            )}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* ═══ Purchase Modal ═══════════════════════════════════════ */}
      <Modal
        testID="purchase-modal"
        visible={showPurchase}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPurchase(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            {selectedItem && (
              <>
                <Text style={styles.modalIcon}>{selectedItem.icon}</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedItem.name}
                </Text>
                <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
                  {selectedItem.description}
                </Text>
                <View style={styles.modalMeta}>
                  <Text style={[styles.modalRating, { color: colors.primary }]}>
                    ⭐ {selectedItem.rating}
                  </Text>
                  <Text
                    style={[styles.modalDownloads, { color: colors.textMuted }]}
                  >
                    ⬇ {selectedItem.downloads} {t("store.downloads")}
                  </Text>
                </View>
                <TouchableOpacity
                  testID="btn-purchase"
                  style={[
                    styles.purchaseBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.purchaseBtnText}>
                    {selectedItem.price
                      ? t("store.buy", { price: selectedItem.price.toFixed(2) })
                      : t("store.installFree")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              testID="btn-close-modal"
              style={styles.closeBtn}
              onPress={() => setShowPurchase(false)}
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
  heroDesc: { fontSize: 13 },

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

  // Sort
  sortRow: { flexDirection: "row", marginBottom: 16, gap: 12 },
  sortBtn: { paddingBottom: 6, borderBottomWidth: 2 },
  sortText: { fontSize: 13, fontWeight: "500" },

  // Item card
  itemCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  itemIconWrap: { alignItems: "center", marginRight: 12, width: 48 },
  itemIcon: { fontSize: 32 },
  itemBadge: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  itemMeta: { flexDirection: "row", gap: 12, marginTop: 4 },
  itemRating: { fontSize: 12, fontWeight: "600" },
  itemDownloads: { fontSize: 12 },
  itemPriceWrap: { marginLeft: 8, minWidth: 60, alignItems: "flex-end" },
  itemPrice: { fontSize: 14, fontWeight: "700" },

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
  },
  modalIcon: { fontSize: 56, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  modalDesc: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalMeta: { flexDirection: "row", gap: 16, marginBottom: 24 },
  modalRating: { fontSize: 14, fontWeight: "600" },
  modalDownloads: { fontSize: 14 },
  purchaseBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  purchaseBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  closeBtn: { marginTop: 16, paddingVertical: 12 },
  closeBtnText: { fontSize: 14 },
});
