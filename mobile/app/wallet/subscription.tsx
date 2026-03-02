/**
 * SubscriptionScreen — DEV-028
 *
 * Manage ImuChat Pro / Premium subscriptions.
 * Compares plans, toggle monthly/yearly, subscribe/cancel/resume.
 * Route: /wallet/subscription
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  getDaysRemaining,
  getPlanPrice,
  getYearlySavings,
  isInTrial,
  isSubscriptionActive,
} from "@/services/subscription-api";
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

import type {
  BillingInterval,
  CurrencyCode,
  SubscriptionPlan,
} from "@/types/wallet";

export default function SubscriptionScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    subscription,
    availablePlans,
    paymentLoading,
    paymentError,
    loadSubscription,
    loadPlans,
    subscribe,
    cancelSub,
    resumeSub,
    clearPaymentError,
  } = useWalletStore();

  const [interval, setInterval] = useState<BillingInterval>("month");
  const [currency] = useState<CurrencyCode>("EUR");

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, [loadSubscription, loadPlans]);

  const currentTier = subscription?.tier || "free";
  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const inTrial = subscription ? isInTrial(subscription) : false;
  const daysLeft = subscription ? getDaysRemaining(subscription) : 0;

  const handleSubscribe = useCallback(
    async (plan: SubscriptionPlan) => {
      if (plan.tier === "free") return;
      if (plan.tier === currentTier && isActive) return;

      const url = await subscribe(plan.id, interval, currency);
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t("wallet.subscriptionError") || "Erreur",
          t("wallet.subscriptionErrorMsg") ||
            "Impossible de lancer l'abonnement",
        );
      }
    },
    [currentTier, isActive, interval, currency, subscribe, t],
  );

  const handleCancel = useCallback(() => {
    Alert.alert(
      t("wallet.cancelTitle") || "Annuler l'abonnement",
      t("wallet.cancelConfirm") ||
        "Vous conserverez l'accès jusqu'à la fin de la période en cours.",
      [
        { text: t("common.back") || "Retour", style: "cancel" },
        {
          text: t("wallet.confirmCancel") || "Confirmer",
          style: "destructive",
          onPress: () => cancelSub(),
        },
      ],
    );
  }, [t, cancelSub]);

  const renderTierBadge = (tier: string) => {
    const badges: Record<string, { icon: string; color: string }> = {
      free: { icon: "person-outline", color: colors.textMuted },
      pro: { icon: "star", color: "#f59e0b" },
      premium: { icon: "diamond", color: "#8b5cf6" },
    };
    const b = badges[tier] || badges.free;
    return <Ionicons name={b.icon as any} size={20} color={b.color} />;
  };

  const renderPlan = (plan: SubscriptionPlan) => {
    const isCurrent = plan.tier === currentTier && isActive;
    const price = getPlanPrice(plan, interval, currency);
    const yearlySaving =
      interval === "year" ? getYearlySavings(plan, currency) : 0;
    const isFree = plan.tier === "free";

    return (
      <View
        key={plan.id}
        testID={`plan-${plan.tier}`}
        style={[
          styles.planCard,
          {
            backgroundColor: isCurrent ? colors.primary + "10" : colors.surface,
            borderColor: isCurrent ? colors.primary : colors.border,
            borderWidth: isCurrent ? 2 : 1,
          },
        ]}
      >
        {plan.popular && (
          <View
            style={[styles.popularRibbon, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.popularRibbonText}>
              {t("wallet.recommended") || "Recommandé"}
            </Text>
          </View>
        )}

        <View style={styles.planHeader}>
          {renderTierBadge(plan.tier)}
          <Text style={[styles.planName, { color: colors.text }]}>
            {plan.name}
          </Text>
          {isCurrent && (
            <View
              style={[styles.currentBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.currentBadgeText}>
                {t("wallet.currentPlan") || "Actuel"}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.planDesc, { color: colors.textMuted }]}>
          {plan.description}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={[styles.planPrice, { color: colors.text }]}>
            {isFree ? t("wallet.free") || "Gratuit" : `${price.toFixed(2)}€`}
          </Text>
          {!isFree && (
            <Text style={[styles.priceInterval, { color: colors.textMuted }]}>
              /
              {interval === "month"
                ? t("wallet.month") || "mois"
                : t("wallet.year") || "an"}
            </Text>
          )}
        </View>

        {yearlySaving > 0 && (
          <Text style={styles.savingText}>
            🎉 {t("wallet.saveYearly") || "Économisez"}{" "}
            {yearlySaving.toFixed(2)}€/{t("wallet.year") || "an"}
          </Text>
        )}

        {/* Features */}
        <View style={styles.featureList}>
          {plan.features.map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {feat}
              </Text>
            </View>
          ))}
        </View>

        {/* Action button */}
        {isCurrent ? (
          subscription?.cancelAtPeriodEnd ? (
            <TouchableOpacity
              testID="btn-resume"
              onPress={() => resumeSub()}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.actionBtnText}>
                {t("wallet.resumeSub") || "Reprendre"}
              </Text>
            </TouchableOpacity>
          ) : !isFree ? (
            <TouchableOpacity
              testID="btn-cancel"
              onPress={handleCancel}
              style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
            >
              <Text style={styles.actionBtnText}>
                {t("wallet.cancelSub") || "Annuler"}
              </Text>
            </TouchableOpacity>
          ) : null
        ) : !isFree ? (
          <TouchableOpacity
            testID={`btn-subscribe-${plan.tier}`}
            disabled={paymentLoading}
            onPress={() => handleSubscribe(plan)}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            {paymentLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>
                {t("wallet.subscribe") || "S'abonner"}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <ScrollView
      testID="subscription-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Trial info */}
        {inTrial && (
          <View
            style={[
              styles.trialBanner,
              { backgroundColor: "#fef3c720", borderColor: "#f59e0b40" },
            ]}
          >
            <Ionicons name="time-outline" size={20} color="#f59e0b" />
            <Text style={[styles.trialText, { color: colors.text }]}>
              {t("wallet.trialActive") || "Période d'essai"} — {daysLeft}{" "}
              {t("wallet.daysLeft") || "jours restants"}
            </Text>
          </View>
        )}

        {/* Interval toggle */}
        <View
          style={[
            styles.toggleRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            testID="toggle-month"
            onPress={() => setInterval("month")}
            style={[
              styles.toggleBtn,
              interval === "month" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: interval === "month" ? "#fff" : colors.text },
              ]}
            >
              {t("wallet.monthly") || "Mensuel"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="toggle-year"
            onPress={() => setInterval("year")}
            style={[
              styles.toggleBtn,
              interval === "year" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: interval === "year" ? "#fff" : colors.text },
              ]}
            >
              {t("wallet.yearly") || "Annuel"} 🏷️ -20%
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {paymentError && (
          <TouchableOpacity
            testID="sub-error"
            style={styles.errorBanner}
            onPress={clearPaymentError}
          >
            <Text style={styles.errorText}>⚠️ {paymentError}</Text>
          </TouchableOpacity>
        )}

        {/* Plans */}
        <View style={styles.plansList}>
          {availablePlans.length > 0 ? (
            availablePlans.map(renderPlan)
          ) : (
            <ActivityIndicator style={{ marginTop: 40 }} />
          )}
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},

  // Trial banner
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  trialText: { fontSize: 14, fontWeight: "600", flex: 1 },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleText: { fontSize: 14, fontWeight: "600" },

  // Error
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#ef4444", fontSize: 13 },

  // Plans
  plansList: { gap: 16 },
  planCard: {
    borderRadius: 16,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  planName: { fontSize: 20, fontWeight: "bold", flex: 1 },
  planDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  popularRibbon: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularRibbonText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currentBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  planPrice: { fontSize: 28, fontWeight: "bold" },
  priceInterval: { fontSize: 14, marginLeft: 2 },
  savingText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  featureList: { marginVertical: 12, gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, flex: 1, lineHeight: 18 },

  // Action button
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
