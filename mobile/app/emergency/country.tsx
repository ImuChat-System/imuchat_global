/**
 * EmergencyCountryScreen — Détail des numéros d'urgence d'un pays
 *
 * Affiche tous les numéros d'urgence du pays sélectionné :
 *  - Numéro général en tête (gros bouton d'appel)
 *  - Filtrage par catégorie
 *  - Appel direct en un tap
 *  - Favori toggle
 *
 * Route : /emergency/country?code=FR
 *
 * Phase 3 — Groupe 7 Services utilitaires (Feature 7.3)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  callEmergencyNumber,
  getAvailableCategories,
  getCategoryIcon,
  getCountryByCode,
  getNumbersByCategory,
} from "@/services/emergency-api";
import { useEmergencyStore } from "@/stores/emergency-store";
import type { CountryEmergencyData, EmergencyNumber } from "@/types/emergency";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmergencyCountryScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { favorites, toggleFavorite, selectedCategory, setCategory } =
    useEmergencyStore();

  const [callingNumber, setCallingNumber] = useState<string | null>(null);

  const country: CountryEmergencyData | null = useMemo(
    () => (code ? getCountryByCode(code) : null),
    [code],
  );

  const categories = useMemo(
    () => (code ? getAvailableCategories(code) : []),
    [code],
  );

  const filteredNumbers: EmergencyNumber[] = useMemo(() => {
    if (!country) return [];
    if (selectedCategory) {
      return getNumbersByCategory(country.countryCode, selectedCategory);
    }
    return country.numbers;
  }, [country, selectedCategory]);

  const isFav = useMemo(
    () => favorites.some((f) => f.countryCode === code && f.isFavorite),
    [favorites, code],
  );

  const handleCall = useCallback(
    async (number: string, label: string) => {
      Alert.alert(
        t("emergency.callConfirmTitle"),
        `${t("emergency.callConfirmMessage")} ${label}\n📞 ${number}`,
        [
          { text: t("emergency.cancel"), style: "cancel" },
          {
            text: t("emergency.call"),
            style: "destructive",
            onPress: async () => {
              setCallingNumber(number);
              await callEmergencyNumber(number);
              setCallingNumber(null);
            },
          },
        ],
      );
    },
    [t],
  );

  if (!country) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, padding: spacing.xl },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t("emergency.countryNotFound")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {/* Header — Country + General Number */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: (colors.danger ?? colors.primary) + "10",
              padding: spacing.lg,
              marginHorizontal: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerFlag}>{country.flag}</Text>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerName, { color: colors.text }]}>
                {country.countryName}
              </Text>
              <Text
                style={[styles.headerCode, { color: colors.textSecondary }]}
              >
                {country.countryCode}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(country.countryCode)}
              accessibilityLabel={
                isFav
                  ? t("emergency.removeFavorite")
                  : t("emergency.addFavorite")
              }
            >
              <Ionicons
                name={isFav ? "star" : "star-outline"}
                size={28}
                color={isFav ? (colors.warning ?? "#EAB308") : colors.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Big Call Button */}
          <TouchableOpacity
            style={[
              styles.bigCallButton,
              {
                backgroundColor: colors.danger ?? colors.primary,
                marginTop: spacing.md,
                padding: spacing.md,
              },
            ]}
            onPress={() =>
              handleCall(country.generalNumber, t("emergency.generalEmergency"))
            }
            accessibilityRole="button"
            accessibilityLabel={`${t("emergency.call")} ${country.generalNumber}`}
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={styles.bigCallLabel}>
                {t("emergency.generalEmergency")}
              </Text>
              <Text style={styles.bigCallNumber}>{country.generalNumber}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <TouchableOpacity
            style={[
              styles.catChip,
              {
                backgroundColor: !selectedCategory
                  ? (colors.danger ?? colors.primary)
                  : colors.surface,
                borderColor: colors.border,
                marginRight: spacing.xs,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              },
            ]}
            onPress={() => setCategory(null)}
          >
            <Text
              style={{
                color: !selectedCategory ? "#FFFFFF" : colors.text,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {t("emergency.allCategories")}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    selectedCategory === cat
                      ? (colors.danger ?? colors.primary)
                      : colors.surface,
                  borderColor: colors.border,
                  marginRight: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={{
                  color: selectedCategory === cat ? "#FFFFFF" : colors.text,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                {getCategoryIcon(cat)} {t(`emergency.categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Numbers List */}
        {filteredNumbers.map((num, idx) => (
          <TouchableOpacity
            key={`${num.category}-${num.number}-${idx}`}
            style={[
              styles.numberCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: spacing.md,
                marginHorizontal: spacing.md,
                marginVertical: spacing.xs,
              },
            ]}
            onPress={() => handleCall(num.number, num.label)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${num.label} ${num.number}`}
          >
            <View style={styles.numberRow}>
              <Text style={styles.numberIcon}>
                {getCategoryIcon(num.category)}
              </Text>
              <View style={styles.numberInfo}>
                <Text style={[styles.numberLabel, { color: colors.text }]}>
                  {num.label}
                </Text>
                <Text
                  style={[
                    styles.numberValue,
                    { color: colors.danger ?? colors.primary },
                  ]}
                >
                  {num.number}
                </Text>
                <View style={styles.badges}>
                  {num.is24h && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.success + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.badgeText, { color: colors.success }]}
                      >
                        24/7
                      </Text>
                    </View>
                  )}
                  {num.isFree && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.badgeText, { color: colors.primary }]}
                      >
                        {t("emergency.free")}
                      </Text>
                    </View>
                  )}
                </View>
                {num.notes && (
                  <Text
                    style={[
                      styles.notes,
                      { color: colors.textSecondary, marginTop: 4 },
                    ]}
                  >
                    {num.notes}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.callBtn,
                  { backgroundColor: colors.danger ?? colors.primary },
                ]}
                onPress={() => handleCall(num.number, num.label)}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredNumbers.length === 0 && (
          <View style={[styles.emptyContainer, { padding: spacing.xl }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("emergency.noNumbersForCategory")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderRadius: 16 },
  headerTop: { flexDirection: "row", alignItems: "center" },
  headerFlag: { fontSize: 48, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 22, fontWeight: "700" },
  headerCode: { fontSize: 14 },
  bigCallButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
  },
  bigCallLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  bigCallNumber: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  catChip: {
    borderRadius: 20,
    borderWidth: 1,
  },
  numberCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberIcon: { fontSize: 28, marginRight: 12 },
  numberInfo: { flex: 1 },
  numberLabel: { fontSize: 15, fontWeight: "600" },
  numberValue: { fontSize: 20, fontWeight: "700", marginTop: 2 },
  badges: { flexDirection: "row", gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  notes: { fontSize: 12, fontStyle: "italic" },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: { alignItems: "center" },
  emptyText: { fontSize: 15 },
  errorText: { fontSize: 16, textAlign: "center" },
});
