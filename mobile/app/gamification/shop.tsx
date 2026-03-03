/**
 * Boutique Skins Avatar — Shop
 *
 * Sections de boutique, filtre par catégorie, achat de skins
 * avec ImuCoins, onglet "Possédés".
 *
 * Phase 3 — DEV-032
 */

import { useGamification } from "@/hooks/useGamification";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { SkinRarity } from "@/types/gamification";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RARITY_COLORS: Record<SkinRarity, string> = {
  common: "#9e9e9e",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
};

type ShopTab = "all" | "featured" | "owned";
const TABS: ShopTab[] = ["all", "featured", "owned"];

export default function ShopScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { shopSections, purchaseSkin } = useGamification();
  const [tab, setTab] = useState<ShopTab>("all");

  const allItems = useMemo(
    () => shopSections.flatMap((s) => s.items),
    [shopSections],
  );

  const displayedItems = useMemo(() => {
    switch (tab) {
      case "featured":
        return shopSections.filter((s) => s.featured).flatMap((s) => s.items);
      case "owned":
        return allItems.filter((i) => i.owned);
      default:
        return allItems;
    }
  }, [tab, shopSections, allItems]);

  const handlePurchase = (skinId: string, name: string, price: number) => {
    Alert.alert(
      t("gamification.confirmPurchase"),
      t("gamification.confirmPurchaseMsg", { name, price }),
      [
        { text: t("gamification.cancel"), style: "cancel" },
        {
          text: t("gamification.buy"),
          onPress: () => purchaseSkin(skinId),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <View style={styles.tabRow}>
        {TABS.map((t2) => (
          <TouchableOpacity
            key={t2}
            onPress={() => setTab(t2)}
            style={[
              styles.tab,
              {
                backgroundColor: tab === t2 ? colors.primary : colors.surface,
              },
            ]}
          >
            <Text
              style={{
                color: tab === t2 ? "#fff" : colors.text,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {t(`gamification.shopTab_${t2}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Items grid ───────────────────────────────────────────── */}
      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.surface,
                borderColor: RARITY_COLORS[item.rarity],
                borderWidth: 1,
              },
            ]}
          >
            <Text style={{ fontSize: 40 }}>🎭</Text>
            <Text
              style={[styles.itemName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: RARITY_COLORS[item.rarity],
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {t(`gamification.rarity_${item.rarity}`)}
            </Text>

            {item.owned ? (
              <Text style={[styles.ownedLabel, { color: "#4caf50" }]}>
                ✓ {t("gamification.owned")}
              </Text>
            ) : (
              <TouchableOpacity
                style={[styles.buyBtn, { backgroundColor: colors.primary }]}
                onPress={() => handlePurchase(item.id, item.name, item.price)}
              >
                <Text style={styles.buyBtnText}>
                  {item.price} {item.currency === "coins" ? "🪙" : "💎"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("gamification.shopEmpty")}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  itemCard: {
    flex: 1,
    maxWidth: "48%",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  itemName: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  ownedLabel: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  buyBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buyBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
});
