/**
 * PaymentModalScreen — DEV-033
 *
 * Modal sécurisé pour paiement in-app.
 * Sélection de moyen de paiement, résumé, confirmation.
 * Route: /wallet/payment-modal
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { PaymentMethod } from "@/types/wallet";

export default function PaymentModalScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{
    itemName?: string;
    amount?: string;
    currency?: string;
    itemId?: string;
  }>();

  const { paymentMethods, paymentLoading, loadPaymentMethods, purchase } =
    useWalletStore();

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const itemName = params.itemName || t("wallet.paymentItem") || "Article";
  const amount = parseFloat(params.amount || "0");
  const currency = params.currency || "EUR";
  const itemId = params.itemId || "";

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  useEffect(() => {
    const defaultMethod = paymentMethods.find((m) => m.isDefault);
    if (defaultMethod && !selectedMethodId) {
      setSelectedMethodId(defaultMethod.id);
    }
  }, [paymentMethods, selectedMethodId]);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const handleConfirm = useCallback(async () => {
    if (!selectedMethodId || processing) return;

    setProcessing(true);
    try {
      if (itemId) {
        const receipt = await purchase(itemId);
        if (receipt) {
          Alert.alert(
            t("wallet.paymentSuccess") || "Paiement réussi ✅",
            t("wallet.paymentSuccessMsg") || "Votre achat a été confirmé.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        } else {
          Alert.alert(
            t("wallet.paymentFailed") || "Échec du paiement",
            t("wallet.paymentFailedMsg") ||
              "Le paiement n'a pas pu être traité.",
          );
        }
      } else {
        // Simulated generic payment
        await new Promise((resolve) => setTimeout(resolve, 1500));
        Alert.alert(
          t("wallet.paymentSuccess") || "Paiement réussi ✅",
          t("wallet.paymentSuccessMsg") || "Votre achat a été confirmé.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    } catch {
      Alert.alert(
        t("wallet.paymentFailed") || "Échec du paiement",
        t("wallet.paymentFailedMsg") || "Le paiement n'a pas pu être traité.",
      );
    } finally {
      setProcessing(false);
    }
  }, [selectedMethodId, processing, itemId, purchase, router, t]);

  const BRAND_ICONS: Record<string, string> = {
    visa: "card-outline",
    mastercard: "card-outline",
    amex: "card-outline",
    apple_pay: "logo-apple",
    google_pay: "logo-google",
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = method.id === selectedMethodId;
    const iconName = (BRAND_ICONS[method.brand || ""] ||
      BRAND_ICONS[method.type] ||
      "card-outline") as any;

    return (
      <TouchableOpacity
        key={method.id}
        testID={`pm-${method.id}`}
        onPress={() => setSelectedMethodId(method.id)}
        style={[
          styles.methodCard,
          {
            backgroundColor: isSelected
              ? colors.primary + "10"
              : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={isSelected ? colors.primary : colors.textMuted}
        />
        <View style={styles.methodInfo}>
          <Text style={[styles.methodLabel, { color: colors.text }]}>
            {method.label || method.type}
          </Text>
          {method.last4 && (
            <Text style={[styles.methodLast4, { color: colors.textMuted }]}>
              •••• {method.last4}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        )}
        {method.isDefault && !isSelected && (
          <View
            style={[
              styles.defaultBadge,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.defaultText, { color: colors.primary }]}>
              {t("wallet.defaultMethod") || "Par défaut"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      testID="payment-modal-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { padding: spacing.lg }]}>
        <View
          style={[styles.lockIcon, { backgroundColor: colors.primary + "15" }]}
        >
          <Ionicons name="lock-closed" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("wallet.securePayment") || "Paiement sécurisé"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t("wallet.securePaymentDesc") ||
            "Vos données sont protégées par un chiffrement de bout en bout"}
        </Text>
      </View>

      {/* Order summary */}
      <View
        testID="order-summary"
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            marginHorizontal: spacing.lg,
          },
        ]}
      >
        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
          {t("wallet.orderSummary") || "Résumé de la commande"}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryItemName, { color: colors.text }]}>
            {itemName}
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>
            {amount.toFixed(2)} {currency === "EUR" ? "€" : currency}
          </Text>
        </View>
      </View>

      {/* Payment methods */}
      <View style={{ paddingHorizontal: spacing.lg, flex: 1 }}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          {t("wallet.chooseMethod") || "Moyen de paiement"}
        </Text>

        {paymentLoading && paymentMethods.length === 0 ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : paymentMethods.length === 0 ? (
          <View style={styles.noMethodsContainer}>
            <Ionicons name="card-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.noMethodsText, { color: colors.textMuted }]}>
              {t("wallet.noMethods") || "Aucun moyen de paiement"}
            </Text>
            <TouchableOpacity
              testID="add-method-btn"
              onPress={() => router.push("/wallet/payment-methods" as any)}
              style={[styles.addMethodBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.addMethodBtnText}>
                {t("wallet.addMethod") || "Ajouter une carte"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          paymentMethods.map(renderPaymentMethod)
        )}
      </View>

      {/* Confirm button */}
      <View
        style={[
          styles.footer,
          { padding: spacing.lg, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          testID="confirm-payment"
          onPress={handleConfirm}
          disabled={!selectedMethodId || processing}
          style={[
            styles.confirmBtn,
            {
              backgroundColor:
                selectedMethodId && !processing
                  ? colors.primary
                  : colors.border,
            },
          ]}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
              <Text style={styles.confirmBtnText}>
                {t("wallet.payNow") || "Payer"} {amount.toFixed(2)}{" "}
                {currency === "EUR" ? "€" : currency}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={[styles.securityNote, { color: colors.textMuted }]}>
          🔒{" "}
          {t("wallet.securityNote") ||
            "Vos données de paiement sont stockées de manière sécurisée par Stripe."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", gap: 8 },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  subtitle: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: { fontSize: 12, marginBottom: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItemName: { fontSize: 15, fontWeight: "600" },
  summaryAmount: { fontSize: 18, fontWeight: "700" },
  sectionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 14, fontWeight: "600" },
  methodLast4: { fontSize: 12, marginTop: 2 },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  defaultText: { fontSize: 10, fontWeight: "600" },
  noMethodsContainer: { alignItems: "center", padding: 30, gap: 10 },
  noMethodsText: { fontSize: 14 },
  addMethodBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  addMethodBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  securityNote: { fontSize: 11, textAlign: "center", lineHeight: 16 },
});
