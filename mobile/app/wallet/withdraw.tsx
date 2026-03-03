/**
 * WithdrawScreen — DEV-033
 *
 * Retrait de fonds vers compte bancaire ou PayPal.
 * Vérification KYC requise, calcul des frais, confirmation.
 * Route: /wallet/withdraw
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { WithdrawalRequest } from "@/types/wallet";

type WithdrawMethod = "bank_transfer" | "paypal";

export default function WithdrawScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    balance,
    kycInfo,
    withdrawals,
    paymentLoading,
    loadKYC,
    loadWithdrawals,
    requestWithdrawal,
  } = useWalletStore();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WithdrawMethod>("bank_transfer");
  const [details, setDetails] = useState("");

  useEffect(() => {
    loadKYC();
    loadWithdrawals();
  }, [loadKYC, loadWithdrawals]);

  const fee = method === "bank_transfer" ? 2.5 : 1.0;
  const numericAmount = parseFloat(amount) || 0;
  const netAmount = Math.max(0, numericAmount - fee);
  const canWithdraw =
    numericAmount >= 10 &&
    numericAmount <= (balance?.fiatBalance || 0) &&
    details.length > 3 &&
    kycInfo?.status === "verified";

  const handleSubmit = useCallback(() => {
    if (!canWithdraw) return;
    Alert.alert(
      t("wallet.withdrawConfirmTitle") || "Confirmer le retrait",
      `${numericAmount.toFixed(2)} € → ${details}\n${t("wallet.withdrawFee") || "Frais"}: ${fee.toFixed(2)} €\n${t("wallet.withdrawNet") || "Net"}: ${netAmount.toFixed(2)} €`,
      [
        { text: t("common.cancel") || "Annuler", style: "cancel" },
        {
          text: t("wallet.withdrawConfirm") || "Confirmer",
          onPress: async () => {
            const ok = await requestWithdrawal(numericAmount, method, details);
            if (ok) {
              setAmount("");
              setDetails("");
              Alert.alert(
                t("wallet.withdrawSuccess") || "Demande envoyée",
                t("wallet.withdrawSuccessMsg") ||
                  "Votre retrait sera traité sous 2-5 jours ouvrés.",
              );
            }
          },
        },
      ],
    );
  }, [
    canWithdraw,
    numericAmount,
    details,
    fee,
    netAmount,
    method,
    requestWithdrawal,
    t,
  ]);

  const renderKYCBanner = () => {
    if (kycInfo?.status === "verified") return null;
    const statusColors: Record<string, string> = {
      not_started: "#f59e0b",
      pending: "#3b82f6",
      rejected: "#ef4444",
    };
    const statusColor =
      statusColors[kycInfo?.status || "not_started"] || "#f59e0b";
    return (
      <View
        testID="kyc-banner"
        style={[
          styles.kycBanner,
          { backgroundColor: statusColor + "15", borderColor: statusColor },
        ]}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={24}
          color={statusColor}
        />
        <View style={styles.kycBannerInfo}>
          <Text style={[styles.kycBannerTitle, { color: statusColor }]}>
            {t("wallet.kycRequired") || "Vérification KYC requise"}
          </Text>
          <Text style={[styles.kycBannerDesc, { color: colors.textMuted }]}>
            {kycInfo?.status === "pending"
              ? t("wallet.kycPending") || "Vérification en cours..."
              : kycInfo?.status === "rejected"
                ? kycInfo.rejectionReason ||
                  t("wallet.kycRejected") ||
                  "Vérification refusée"
                : t("wallet.kycNotStarted") ||
                  "Veuillez vérifier votre identité pour effectuer des retraits"}
          </Text>
        </View>
      </View>
    );
  };

  const renderWithdrawalHistory = (wd: WithdrawalRequest) => {
    const statusColors: Record<string, string> = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      completed: "#22c55e",
      rejected: "#ef4444",
    };
    return (
      <View
        key={wd.id}
        testID={`wd-${wd.id}`}
        style={[
          styles.historyRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.historyInfo}>
          <Text style={[styles.historyAmount, { color: colors.text }]}>
            {wd.amount.toFixed(2)} €
          </Text>
          <Text style={[styles.historyMethod, { color: colors.textMuted }]}>
            {wd.targetMethod === "bank_transfer" ? "🏦 Virement" : "💳 PayPal"}{" "}
            · {wd.targetDetails}
          </Text>
          <Text style={[styles.historyDate, { color: colors.textMuted }]}>
            {new Date(wd.requestedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: (statusColors[wd.status] || "#999") + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusColors[wd.status] || "#999" },
            ]}
          >
            {t(`wallet.wdStatus_${wd.status}`) || wd.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      testID="withdraw-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("wallet.withdrawTitle") || "Retirer des fonds"}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {t("wallet.withdrawSubtitle") ||
          "Transférez vos gains vers votre compte"}
      </Text>

      {/* KYC */}
      {renderKYCBanner()}

      {/* Available balance */}
      <View
        style={[
          styles.balanceCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>
          {t("wallet.availableBalance") || "Solde disponible"}
        </Text>
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          {(balance?.fiatBalance || 0).toFixed(2)} €
        </Text>
      </View>

      {/* Method selection */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        {t("wallet.withdrawMethod") || "Méthode de retrait"}
      </Text>
      <View style={styles.methodRow}>
        {[
          {
            key: "bank_transfer" as WithdrawMethod,
            label: "🏦 Virement bancaire",
            fee: "2.50 €",
          },
          {
            key: "paypal" as WithdrawMethod,
            label: "💳 PayPal",
            fee: "1.00 €",
          },
        ].map((m) => (
          <TouchableOpacity
            key={m.key}
            testID={`method-${m.key}`}
            onPress={() => setMethod(m.key)}
            style={[
              styles.methodCard,
              {
                backgroundColor:
                  method === m.key ? colors.primary + "15" : colors.surface,
                borderColor: method === m.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.methodLabel, { color: colors.text }]}>
              {m.label}
            </Text>
            <Text style={[styles.methodFee, { color: colors.textMuted }]}>
              {t("wallet.withdrawFee") || "Frais"}: {m.fee}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        {t("wallet.withdrawAmount") || "Montant"}
      </Text>
      <View
        style={[
          styles.amountInput,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.currencyLabel, { color: colors.textMuted }]}>
          €
        </Text>
        <TextInput
          testID="amount-input"
          style={[styles.amountText, { color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Details */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        {method === "bank_transfer"
          ? t("wallet.withdrawIBAN") || "IBAN"
          : t("wallet.withdrawPaypalEmail") || "Email PayPal"}
      </Text>
      <TextInput
        testID="details-input"
        style={[
          styles.detailsInput,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder={
          method === "bank_transfer"
            ? "FR76 XXXX XXXX XXXX"
            : "email@example.com"
        }
        placeholderTextColor={colors.textMuted}
        value={details}
        onChangeText={setDetails}
        autoCapitalize="none"
      />

      {/* Summary */}
      {numericAmount > 0 && (
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              {t("wallet.withdrawAmount") || "Montant"}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {numericAmount.toFixed(2)} €
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              {t("wallet.withdrawFee") || "Frais"}
            </Text>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              -{fee.toFixed(2)} €
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text
              style={[
                styles.summaryLabel,
                { color: colors.text, fontWeight: "700" },
              ]}
            >
              {t("wallet.withdrawNet") || "Net à recevoir"}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: "#22c55e", fontWeight: "700" },
              ]}
            >
              {netAmount.toFixed(2)} €
            </Text>
          </View>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        testID="submit-withdraw"
        onPress={handleSubmit}
        disabled={!canWithdraw || paymentLoading}
        style={[
          styles.submitBtn,
          {
            backgroundColor: canWithdraw ? colors.primary : colors.border,
            opacity: paymentLoading ? 0.6 : 1,
          },
        ]}
      >
        <Text style={styles.submitBtnText}>
          {paymentLoading
            ? t("common.loading") || "Chargement..."
            : t("wallet.withdrawSubmit") || "Demander le retrait"}
        </Text>
      </TouchableOpacity>

      {/* History */}
      {withdrawals.length > 0 && (
        <>
          <Text
            style={[styles.sectionLabel, { color: colors.text, marginTop: 24 }]}
          >
            {t("wallet.withdrawHistory") || "Historique des retraits"}
          </Text>
          {withdrawals.map(renderWithdrawalHistory)}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  kycBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  kycBannerInfo: { flex: 1 },
  kycBannerTitle: { fontSize: 14, fontWeight: "600" },
  kycBannerDesc: { fontSize: 12, marginTop: 2 },
  balanceCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: { fontSize: 13, marginBottom: 4 },
  balanceAmount: { fontSize: 28, fontWeight: "bold" },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 4,
  },
  methodRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  methodCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  methodLabel: { fontSize: 13, fontWeight: "600" },
  methodFee: { fontSize: 11 },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  currencyLabel: { fontSize: 18, fontWeight: "600" },
  amountText: { flex: 1, fontSize: 18, fontWeight: "600" },
  detailsInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    marginTop: 4,
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: "600" },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  historyInfo: { flex: 1 },
  historyAmount: { fontSize: 15, fontWeight: "600" },
  historyMethod: { fontSize: 12, marginTop: 2 },
  historyDate: { fontSize: 11, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
});
