/**
 * PaymentMethodsScreen — DEV-028
 *
 * Manage saved payment methods (cards, Apple/Google Pay).
 * Add via Stripe SetupIntent, remove, set default.
 * Route: /wallet/payment-methods
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { PaymentMethod } from "@/types/wallet";

const BRAND_ICONS: Record<string, string> = {
  visa: "card-outline",
  mastercard: "card-outline",
  amex: "card-outline",
  apple_pay: "logo-apple",
  google_pay: "logo-google",
};

const BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  jcb: "JCB",
  unionpay: "UnionPay",
};

export default function PaymentMethodsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    paymentMethods,
    paymentLoading,
    paymentError,
    loadPaymentMethods,
    addPaymentMethod,
    removeMethod,
    setDefaultMethod,
    clearPaymentError,
  } = useWalletStore();

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const handleAdd = useCallback(async () => {
    const url = await addPaymentMethod();
    if (url) {
      // The SetupIntent client secret is returned — in production,
      // you'd present the Stripe payment sheet here.
      Alert.alert(
        t("wallet.addMethodTitle") || "Ajouter une carte",
        t("wallet.addMethodMsg") ||
          "L'interface Stripe s'ouvrira pour ajouter votre carte de manière sécurisée.",
      );
    }
  }, [addPaymentMethod, t]);

  const handleRemove = useCallback(
    (method: PaymentMethod) => {
      Alert.alert(
        t("wallet.removeMethodTitle") || "Supprimer",
        `${t("wallet.removeMethodConfirm") || "Supprimer"} ${method.label || ""} •••• ${method.last4 || ""}?`,
        [
          { text: t("common.cancel") || "Annuler", style: "cancel" },
          {
            text: t("common.delete") || "Supprimer",
            style: "destructive",
            onPress: () => removeMethod(method.id),
          },
        ],
      );
    },
    [removeMethod, t],
  );

  const handleSetDefault = useCallback(
    (method: PaymentMethod) => {
      if (method.isDefault) return;
      setDefaultMethod(method.id);
    },
    [setDefaultMethod],
  );

  const renderMethod = (method: PaymentMethod) => {
    const iconName = (BRAND_ICONS[method.brand || ""] ||
      BRAND_ICONS[method.type] ||
      "card-outline") as any;
    const brandLabel =
      BRAND_LABELS[method.brand || ""] || method.label || method.type;

    return (
      <View
        key={method.id}
        testID={`method-${method.id}`}
        style={[
          styles.methodCard,
          {
            backgroundColor: method.isDefault
              ? colors.primary + "10"
              : colors.surface,
            borderColor: method.isDefault ? colors.primary : colors.border,
            borderWidth: method.isDefault ? 2 : 1,
          },
        ]}
      >
        <View style={styles.methodLeft}>
          <Ionicons
            name={iconName}
            size={28}
            color={method.isDefault ? colors.primary : colors.textMuted}
          />
          <View style={styles.methodInfo}>
            <Text style={[styles.methodLabel, { color: colors.text }]}>
              {brandLabel}
              {method.last4 ? ` •••• ${method.last4}` : ""}
            </Text>
            {method.expiryMonth && method.expiryYear && (
              <Text style={[styles.methodExpiry, { color: colors.textMuted }]}>
                {t("wallet.expires") || "Expire"}{" "}
                {String(method.expiryMonth).padStart(2, "0")}/
                {method.expiryYear}
              </Text>
            )}
            {method.isDefault && (
              <Text style={[styles.defaultLabel, { color: colors.primary }]}>
                {t("wallet.defaultMethod") || "Par défaut"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.methodActions}>
          {!method.isDefault && (
            <TouchableOpacity
              testID={`btn-default-${method.id}`}
              onPress={() => handleSetDefault(method)}
              style={[styles.iconBtn, { borderColor: colors.border }]}
            >
              <Ionicons
                name="star-outline"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            testID={`btn-remove-${method.id}`}
            onPress={() => handleRemove(method)}
            style={[styles.iconBtn, { borderColor: "#ef444430" }]}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      testID="payment-methods-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("wallet.paymentMethods") || "Moyens de paiement"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t("wallet.paymentMethodsDesc") ||
            "Gérez vos cartes et modes de paiement sauvegardés"}
        </Text>

        {/* Error */}
        {paymentError && (
          <TouchableOpacity
            testID="methods-error"
            style={styles.errorBanner}
            onPress={clearPaymentError}
          >
            <Text style={styles.errorText}>⚠️ {paymentError}</Text>
          </TouchableOpacity>
        )}

        {/* Loading */}
        {paymentLoading && paymentMethods.length === 0 && (
          <ActivityIndicator style={{ marginTop: 40 }} />
        )}

        {/* Methods list */}
        <View style={styles.methodsList}>
          {paymentMethods.map(renderMethod)}
        </View>

        {/* Empty state */}
        {!paymentLoading && paymentMethods.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("wallet.noMethods") || "Aucun moyen de paiement"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              {t("wallet.noMethodsDesc") ||
                "Ajoutez une carte pour recharger facilement"}
            </Text>
          </View>
        )}

        {/* Add button */}
        <TouchableOpacity
          testID="btn-add-method"
          disabled={paymentLoading}
          onPress={handleAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          {paymentLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.addBtnText}>
                {t("wallet.addMethod") || "Ajouter une carte"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={[styles.securityText, { color: colors.textMuted }]}>
            {t("wallet.securityNote") ||
              "Vos données de paiement sont stockées de manière sécurisée par Stripe. ImuChat n'a jamais accès à vos numéros de carte."}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},

  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 20 },

  // Error
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#ef4444", fontSize: 13 },

  // Methods
  methodsList: { gap: 12, marginBottom: 20 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 16,
  },
  methodLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 15, fontWeight: "600" },
  methodExpiry: { fontSize: 12, marginTop: 2 },
  defaultLabel: { fontSize: 11, fontWeight: "700", marginTop: 3 },
  methodActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptyDesc: { fontSize: 13, textAlign: "center" },

  // Add button
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
  },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Security
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 12,
  },
  securityText: { fontSize: 11, flex: 1, lineHeight: 16 },
});
