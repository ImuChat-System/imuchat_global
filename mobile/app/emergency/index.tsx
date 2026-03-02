/**
 * EmergencyIndexScreen — Numéros d'urgence géolocalisés
 *
 * Liste des pays avec détection automatique du pays courant.
 * Géolocalisation, recherche, filtrage par continent, favoris.
 * Route : /emergency
 *
 * Phase 3 — Groupe 7 Services utilitaires (Feature 7.3)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  getAllCountries,
  getCountriesByContinent,
  searchCountries,
} from "@/services/emergency-api";
import { useEmergencyStore } from "@/stores/emergency-store";
import type { CountryEmergencyData } from "@/types/emergency";
import { Continent } from "@/types/emergency";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Continent Labels ────────────────────────────────────────────
const CONTINENT_OPTIONS: { value: Continent | null; labelKey: string }[] = [
  { value: null, labelKey: "emergency.allCountries" },
  { value: Continent.EUROPE, labelKey: "emergency.continents.europe" },
  {
    value: Continent.NORTH_AMERICA,
    labelKey: "emergency.continents.northAmerica",
  },
  {
    value: Continent.SOUTH_AMERICA,
    labelKey: "emergency.continents.southAmerica",
  },
  { value: Continent.ASIA, labelKey: "emergency.continents.asia" },
  { value: Continent.AFRICA, labelKey: "emergency.continents.africa" },
  { value: Continent.OCEANIA, labelKey: "emergency.continents.oceania" },
];

// ─── Component ────────────────────────────────────────────────────
export default function EmergencyIndexScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const {
    currentCountryCode,
    isLocating,
    error,
    searchQuery,
    favorites,
    detectCountry,
    setSearchQuery,
    selectCountry,
  } = useEmergencyStore();

  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(
    null,
  );

  // Auto-detect on mount if no country saved
  useEffect(() => {
    if (!currentCountryCode) {
      detectCountry();
    }
  }, [currentCountryCode, detectCountry]);

  // Filter countries
  const filteredCountries = useMemo(() => {
    let list: CountryEmergencyData[];

    if (searchQuery.trim().length > 0) {
      list = searchCountries(searchQuery);
    } else if (selectedContinent) {
      list = getCountriesByContinent(selectedContinent);
    } else {
      list = getAllCountries();
    }

    // Sort: current country first, then favorites, then alphabetical
    const favoriteSet = new Set(
      favorites.filter((f) => f.isFavorite).map((f) => f.countryCode),
    );

    return list.sort((a, b) => {
      if (a.countryCode === currentCountryCode) return -1;
      if (b.countryCode === currentCountryCode) return 1;
      const aFav = favoriteSet.has(a.countryCode);
      const bFav = favoriteSet.has(b.countryCode);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.countryName.localeCompare(b.countryName);
    });
  }, [searchQuery, selectedContinent, currentCountryCode, favorites]);

  const handleCountryPress = useCallback(
    (countryCode: string) => {
      selectCountry(countryCode);
      router.push({
        pathname: "/emergency/country",
        params: { code: countryCode },
      });
    },
    [selectCountry, router],
  );

  const isFavorite = useCallback(
    (code: string) => {
      return favorites.some((f) => f.countryCode === code && f.isFavorite);
    },
    [favorites],
  );

  // ─── Render ────────────────────────────────────────────────────
  const renderCountryItem = useCallback(
    ({ item }: { item: CountryEmergencyData }) => {
      const isCurrent = item.countryCode === currentCountryCode;
      const fav = isFavorite(item.countryCode);

      return (
        <TouchableOpacity
          style={[
            styles.countryCard,
            {
              backgroundColor: isCurrent
                ? (colors.danger ?? colors.primary) + "15"
                : colors.surface,
              borderColor: isCurrent
                ? (colors.danger ?? colors.primary)
                : colors.border,
              padding: spacing.md,
              marginHorizontal: spacing.md,
              marginVertical: spacing.xs,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => handleCountryPress(item.countryCode)}
          accessibilityLabel={`${item.countryName} - ${t("emergency.tapToView")}`}
          accessibilityRole="button"
        >
          <View style={styles.countryRow}>
            <Text style={styles.flag}>{item.flag}</Text>
            <View style={styles.countryInfo}>
              <Text
                style={[
                  styles.countryName,
                  { color: colors.text, fontSize: 16 },
                ]}
              >
                {item.countryName}
                {isCurrent ? ` 📍` : ""}
              </Text>
              <Text
                style={[
                  styles.generalNumber,
                  {
                    color: colors.danger ?? colors.primary,
                    fontSize: 20,
                    fontWeight: "700",
                  },
                ]}
              >
                {item.generalNumber}
              </Text>
            </View>
            <View style={styles.countryMeta}>
              {fav && (
                <Ionicons
                  name="star"
                  size={16}
                  color={colors.warning ?? "#EAB308"}
                />
              )}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, spacing, currentCountryCode, handleCountryPress, isFavorite, t],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Geolocation Banner */}
      {isLocating && (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: (colors.danger ?? colors.primary) + "20",
              padding: spacing.sm,
            },
          ]}
        >
          <ActivityIndicator
            size="small"
            color={colors.danger ?? colors.primary}
          />
          <Text
            style={[
              styles.bannerText,
              { color: colors.text, marginLeft: spacing.sm },
            ]}
          >
            {t("emergency.detecting")}
          </Text>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View
          style={[
            styles.banner,
            { backgroundColor: colors.error + "20", padding: spacing.sm },
          ]}
        >
          <Ionicons name="warning" size={16} color={colors.error} />
          <Text
            style={[
              styles.bannerText,
              { color: colors.error, marginLeft: spacing.sm },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Search */}
      <View style={[styles.searchContainer, { padding: spacing.md }]}>
        <View
          style={[
            styles.searchInputWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: spacing.sm,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[
              styles.searchInput,
              { color: colors.text, marginLeft: spacing.xs },
            ]}
            placeholder={t("emergency.searchPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Continent Chips */}
      <FlatList
        data={CONTINENT_OPTIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        }}
        keyExtractor={(item) => item.value ?? "all"}
        renderItem={({ item: opt }) => (
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedContinent === opt.value
                    ? (colors.danger ?? colors.primary)
                    : colors.surface,
                borderColor:
                  selectedContinent === opt.value
                    ? (colors.danger ?? colors.primary)
                    : colors.border,
                marginRight: spacing.xs,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              },
            ]}
            onPress={() => setSelectedContinent(opt.value)}
          >
            <Text
              style={{
                color:
                  selectedContinent === opt.value ? "#FFFFFF" : colors.text,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {t(opt.labelKey)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Country List */}
      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.countryCode}
        renderItem={renderCountryItem}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { padding: spacing.xl }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("emergency.noResults")}
            </Text>
          </View>
        }
      />

      {/* Locate Me FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.danger ?? colors.primary,
            bottom: spacing.xl,
            right: spacing.md,
          },
        ]}
        onPress={detectCountry}
        disabled={isLocating}
        accessibilityLabel={t("emergency.locateMe")}
        accessibilityRole="button"
      >
        <Ionicons name="locate" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerText: { fontSize: 13 },
  searchContainer: {},
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 44,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
  },
  countryCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: { fontSize: 32, marginRight: 12 },
  countryInfo: { flex: 1 },
  countryName: { fontWeight: "600" },
  generalNumber: { marginTop: 2 },
  countryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyContainer: { alignItems: "center" },
  emptyText: { fontSize: 15 },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
