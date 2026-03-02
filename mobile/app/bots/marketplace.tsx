/**
 * Marketplace — Découvrir des bots (future extension)
 *
 * Pour le MVP, redirige vers le catalogue avec un message d'attente.
 * Version post-MVP : bots communautaires, notation, reviews.
 *
 * Phase 3 — DEV-025 Bots de groupe
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MarketplaceScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Ionicons name="storefront-outline" size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          {t("groupBots.marketplaceTitle")}
        </Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {t("groupBots.marketplaceDesc")}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>{t("groupBots.browseCatalog")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
