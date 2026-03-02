/**
 * TopupScreen — DEV-028
 *
 * Top-up ImuCoins via Stripe checkout.
 * Displays packages, starts checkout, opens payment URL.
 * Route: /wallet/topup
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { formatPrice, getPackagePrice } from "@/services/payment-api";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { CurrencyCode, TopupPackage } from "@/types/wallet";

export default function TopupScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    balance,
    topupPackages,
    paymentLoading,
    paymentError,
    loadTopupPackages,
    startTopup,
    clearPaymentError,
  } = useWalletStore();

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [currency] = useState<CurrencyCode>("EUR");

  useEffect(() => {
    loadTopupPackages();
  }, [loadTopupPackages]);

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage) return;

    const session = await startTopup(selectedPackage, currency);
    if (session?.url) {
      await Linking.openURL(session.url);
    } else {
      Alert.alert(
        t("wallet.topupError") || "Erreur",
        t("wallet.topupErrorMsg") ||
          "Impossible de créer la session de paiement",
      );
    }
  }, [selectedPackage, currency, startTopup, t]);

  const renderPackage = (pkg: TopupPackage) => {
    const isSelected = selectedPackage === pkg.id;
    const price = getPackagePrice(pkg, currency);

    return (
      <TouchableOpacity
        key={pkg.id}
        testID={`pkg-${pkg.id}`}
        onPress={() => setSelectedPackage(pkg.id)}
        style={[
          styles.packageCard,
          {
            backgroundColor: isSelected
              ? colors.primary + "15"
              : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        {pkg.popular && (
          <View
            style={[styles.popularBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.popularText}>
              {t("wallet.popular") || "Populaire"}
            </Text>
          </View>
        )}

        <View style={styles.packageHeader}>
          <Text style={[styles.packageCoins, { color: colors.text }]}>
            {pkg.imucoins.toLocaleString()}
          </Text>
          <Text style={[styles.packageCoinLabel, { color: colors.textMuted }]}>
            IMC
          </Text>
        </View>

        <Text style={[styles.packagePrice, { color: colors.primary }]}>
          {formatPrice(price, currency)}
        </Text>

        {pkg.bonusPercent > 0 && (
          <View style={[styles.bonusBadge, { backgroundColor: "#22c55e20" }]}>
            <Text style={styles.bonusText}>
              +{pkg.bonusPercent}% {t("wallet.bonus") || "bonus"}
            </Text>
          </View>
        )}

        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={colors.primary}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      testID="topup-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Current balance */}
        <View
          style={[
            styles.balanceBanner,
            {
              backgroundColor: colors.primary + "10",
              borderColor: colors.primary + "30",
            },
          ]}
        >
          <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          <View style={styles.balanceInfo}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>
              {t("wallet.currentBalance") || "Solde actuel"}
            </Text>
            <Text style={[styles.balanceValue, { color: colors.text }]}>
              {balance ? `${balance.imucoins.toLocaleString()} IMC` : "---"}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("wallet.choosePackage") || "Choisissez un pack"}
        </Text>
        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          {t("wallet.topupDesc") ||
            "Rechargez votre portefeuille ImuCoin via un paiement sécurisé"}
        </Text>

        {/* Packages grid */}
        <View style={styles.packagesGrid}>
          {topupPackages.map(renderPackage)}
        </View>

        {/* Payment methods */}
        <View style={styles.paymentInfo}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={colors.textMuted}
          />
          <Text style={[styles.paymentInfoText, { color: colors.textMuted }]}>
            {t("wallet.securePayment") ||
              "Paiement sécurisé par Stripe — Cartes, Apple Pay, Google Pay"}
          </Text>
        </View>

        {/* Error */}
        {paymentError && (
          <TouchableOpacity
            testID="topup-error"
            style={styles.errorBanner}
            onPress={clearPaymentError}
          >
            <Text style={styles.errorText}>⚠️ {paymentError}</Text>
          </TouchableOpacity>
        )}

        {/* Purchase button */}
        <TouchableOpacity
          testID="btn-purchase"
          disabled={!selectedPackage || paymentLoading}
          onPress={handlePurchase}
          style={[
            styles.purchaseBtn,
            {
              backgroundColor: selectedPackage ? colors.primary : colors.border,
              opacity: paymentLoading ? 0.7 : 1,
            },
          ]}
        >
          {paymentLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card-outline" size={20} color="#fff" />
              <Text style={styles.purchaseBtnText}>
                {selectedPackage
                  ? `${t("wallet.payNow") || "Payer maintenant"}`
                  : t("wallet.selectPackage") || "Sélectionnez un pack"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},

  // Balance banner
  balanceBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  balanceInfo: { flex: 1 },
  balanceLabel: { fontSize: 12, fontWeight: "500" },
  balanceValue: { fontSize: 20, fontWeight: "bold", marginTop: 2 },

  // Section
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  sectionDesc: { fontSize: 14, lineHeight: 20, marginBottom: 20 },

  // Packages
  packagesGrid: { gap: 12, marginBottom: 20 },
  packageCard: {
    borderRadius: 16,
    padding: 18,
    position: "relative",
    overflow: "hidden",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 6,
  },
  packageCoins: { fontSize: 28, fontWeight: "bold" },
  packageCoinLabel: { fontSize: 14, fontWeight: "600" },
  packagePrice: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  bonusBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bonusText: { color: "#22c55e", fontSize: 12, fontWeight: "600" },
  checkIcon: { position: "absolute", top: 14, right: 14 },

  // Payment info
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  paymentInfoText: { fontSize: 12, flex: 1, lineHeight: 16 },

  // Error
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#ef4444", fontSize: 13 },

  // Purchase button
  purchaseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  purchaseBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
