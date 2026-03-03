/**
 * Personnalisation Avatar — Skins & accessoires
 *
 * Aperçu de l'avatar actuel, sélection de catégorie (hair, outfit,
 * accessory, background, effect, frame), et équipement de skins.
 *
 * Phase 3 — DEV-032
 */

import { useGamification } from "@/hooks/useGamification";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { SkinCategory } from "@/types/gamification";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES: SkinCategory[] = [
  "hair",
  "outfit",
  "accessory",
  "background",
  "effect",
  "frame",
];

export default function AvatarScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { shopSections, equippedSkins, equipSkin } = useGamification();
  const [activeCategory, setActiveCategory] = useState<SkinCategory>("hair");

  const skinsForCategory = useMemo(
    () =>
      shopSections.flatMap((s) =>
        s.items.filter((i) => i.category === activeCategory && i.owned),
      ),
    [shopSections, activeCategory],
  );

  const equippedId = equippedSkins[activeCategory];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Equipped overview ───────────────────────────────────── */}
      <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
        <Text style={styles.previewEmoji}>🧑‍🎨</Text>
        <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
          {t("gamification.avatarPreview")}
        </Text>
        <View style={styles.equippedRow}>
          {CATEGORIES.map((cat) => (
            <View key={cat} style={styles.equippedChip}>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                {t(`gamification.cat_${cat}`)}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: equippedSkins[cat] ? colors.primary : colors.textMuted,
                }}
              >
                {equippedSkins[cat] ? "✓" : "—"}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Category tabs ───────────────────────────────────────── */}
      <View style={styles.tabRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeCategory === cat ? colors.primary : colors.surface,
              },
            ]}
          >
            <Text
              style={{
                color: activeCategory === cat ? "#fff" : colors.text,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {t(`gamification.cat_${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Owned skins list ────────────────────────────────────── */}
      <FlatList
        data={skinsForCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const isEquipped = item.id === equippedId;
          return (
            <TouchableOpacity
              style={[
                styles.skinCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isEquipped ? colors.primary : "transparent",
                  borderWidth: isEquipped ? 2 : 0,
                },
              ]}
              onPress={() =>
                equipSkin(activeCategory, isEquipped ? null : item.id)
              }
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 36 }}>🎭</Text>
              <Text
                style={[styles.skinName, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {isEquipped && (
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {t("gamification.equipped")}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("gamification.noOwnedSkins")}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  previewCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  previewEmoji: { fontSize: 64 },
  previewLabel: { fontSize: 13, marginTop: 6 },
  equippedRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  equippedChip: { alignItems: "center" },
  tabRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  skinCard: {
    flex: 1,
    maxWidth: "48%",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  skinName: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
});
