/**
 * ManageSubscriptionsScreen — DEV-033
 *
 * Gestion des abonnements actifs : voir détails, changer de plan,
 * gérer le renouvellement, historique.
 * Route: /wallet/manage-subscriptions
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TIER_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  free: { icon: "person-outline", color: "#9ca3af", label: "Free" },
  pro: { icon: "star", color: "#f59e0b", label: "Pro" },
  premium: { icon: "diamond", color: "#8b5cf6", label: "Premium" },
};

export default function ManageSubscriptionsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const {
    subscription,
    availablePlans,
    paymentLoading,
    loadSubscription,
    loadPlans,
    cancelSub,
    resumeSub,
    changeSub,
  } = useWalletStore();

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, [loadSubscription, loadPlans]);

  const currentTier = subscription?.tier || "free";
  const tierInfo = TIER_CONFIG[currentTier] || TIER_CONFIG.free;
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isCancelling = subscription?.cancelAtPeriodEnd === true;

  const handleCancel = useCallback(() => {
    Alert.alert(
      t("wallet.cancelSubTitle") || "Annuler l'abonnement",
      t("wallet.cancelSubMsg") ||
        "Vous conserverez l'accès jusqu'à la fin de la période en cours. Aucun remboursement ne sera effectué.",
      [
        { text: t("common.back") || "Retour", style: "cancel" },
        {
          text: t("wallet.confirmCancelSub") || "Confirmer l'annulation",
          style: "destructive",
          onPress: () => cancelSub(),
        },
      ],
    );
  }, [cancelSub, t]);

  const handleResume = useCallback(() => {
    resumeSub();
  }, [resumeSub]);

  const handleChangePlan = useCallback(
    (planId: string) => {
      Alert.alert(
        t("wallet.changePlanTitle") || "Changer de plan",
        t("wallet.changePlanMsg") ||
          "Le changement sera effectif immédiatement. La différence de prix sera calculée au prorata.",
        [
          { text: t("common.cancel") || "Annuler", style: "cancel" },
          {
            text: t("wallet.changePlanConfirm") || "Changer",
            onPress: () => changeSub(planId, subscription?.interval),
          },
        ],
      );
    },
    [changeSub, subscription, t],
  );

  const handleUpgrade = useCallback(() => {
    router.push("/wallet/subscription" as any);
  }, [router]);

  const daysRemaining = subscription?.currentPeriodEnd
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) /
            86400000,
        ),
      )
    : 0;

  return (
    <ScrollView
      testID="manage-subscriptions-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Current plan card */}
      <View
        testID="current-plan"
        style={[
          styles.planCard,
          { backgroundColor: colors.surface, borderColor: tierInfo.color },
        ]}
      >
        <View style={styles.planHeader}>
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: tierInfo.color + "20" },
            ]}
          >
            <Ionicons
              name={tierInfo.icon as any}
              size={28}
              color={tierInfo.color}
            />
          </View>
          <View style={styles.planInfo}>
            <Text style={[styles.planName, { color: colors.text }]}>
              ImuChat {tierInfo.label}
            </Text>
            <Text style={[styles.planStatus, { color: tierInfo.color }]}>
              {isActive
                ? isCancelling
                  ? t("wallet.subCancelling") || "Annulation programmée"
                  : t("wallet.subActive") || "Actif"
                : t("wallet.subInactive") || "Inactif"}
            </Text>
          </View>
        </View>

        {subscription && currentTier !== "free" && (
          <>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            {/* Period info */}
            <View style={styles.periodRow}>
              <View style={styles.periodItem}>
                <Text style={[styles.periodLabel, { color: colors.textMuted }]}>
                  {t("wallet.subInterval") || "Facturation"}
                </Text>
                <Text style={[styles.periodValue, { color: colors.text }]}>
                  {subscription.interval === "month"
                    ? t("wallet.monthly") || "Mensuel"
                    : t("wallet.yearly") || "Annuel"}
                </Text>
              </View>
              <View style={styles.periodItem}>
                <Text style={[styles.periodLabel, { color: colors.textMuted }]}>
                  {t("wallet.subNextBilling") || "Prochain paiement"}
                </Text>
                <Text style={[styles.periodValue, { color: colors.text }]}>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "numeric",
                      month: "short",
                    },
                  )}
                </Text>
              </View>
              <View style={styles.periodItem}>
                <Text style={[styles.periodLabel, { color: colors.textMuted }]}>
                  {t("wallet.subDaysLeft") || "Jours restants"}
                </Text>
                <Text style={[styles.periodValue, { color: colors.text }]}>
                  {daysRemaining}
                </Text>
              </View>
            </View>

            {/* Trial info */}
            {subscription.status === "trialing" && subscription.trialEnd && (
              <View
                style={[styles.trialBanner, { backgroundColor: "#3b82f615" }]}
              >
                <Ionicons name="time-outline" size={18} color="#3b82f6" />
                <Text style={[styles.trialText, { color: "#3b82f6" }]}>
                  {t("wallet.trialEnds") || "Période d'essai jusqu'au"}{" "}
                  {new Date(subscription.trialEnd).toLocaleDateString("fr-FR")}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsRow}>
              {isCancelling ? (
                <TouchableOpacity
                  testID="resume-btn"
                  onPress={handleResume}
                  disabled={paymentLoading}
                  style={[styles.actionBtn, { backgroundColor: "#22c55e" }]}
                >
                  <Ionicons name="play" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>
                    {t("wallet.resumeSub") || "Reprendre"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  testID="cancel-btn"
                  onPress={handleCancel}
                  disabled={paymentLoading}
                  style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
                >
                  <Ionicons name="close-circle" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>
                    {t("wallet.cancelSub") || "Annuler"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {/* Other plans */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {currentTier === "free"
          ? t("wallet.upgradePlans") || "Passer à un plan supérieur"
          : t("wallet.otherPlans") || "Autres plans"}
      </Text>

      {availablePlans
        .filter((p) => p.tier !== currentTier)
        .map((plan) => {
          const info = TIER_CONFIG[plan.tier] || TIER_CONFIG.free;
          return (
            <TouchableOpacity
              key={plan.id}
              testID={`plan-${plan.tier}`}
              onPress={() =>
                currentTier === "free"
                  ? handleUpgrade()
                  : handleChangePlan(plan.id)
              }
              style={[
                styles.otherPlanCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name={info.icon as any} size={22} color={info.color} />
              <View style={styles.otherPlanInfo}>
                <Text style={[styles.otherPlanName, { color: colors.text }]}>
                  {plan.name}
                </Text>
                <Text
                  style={[styles.otherPlanDesc, { color: colors.textMuted }]}
                >
                  {plan.description}
                </Text>
              </View>
              <View style={styles.otherPlanPrice}>
                <Text
                  style={[styles.otherPlanPriceText, { color: info.color }]}
                >
                  {plan.priceMonthlyEur.toFixed(2)} €
                </Text>
                <Text
                  style={[
                    styles.otherPlanInterval,
                    { color: colors.textMuted },
                  ]}
                >
                  /{t("wallet.month") || "mois"}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}

      {/* Features list for current plan */}
      {subscription && currentTier !== "free" && (
        <>
          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
          >
            {t("wallet.includedFeatures") || "Fonctionnalités incluses"}
          </Text>
          {availablePlans
            .find((p) => p.tier === currentTier)
            ?.features.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  {feature}
                </Text>
              </View>
            ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  planCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginBottom: 24,
  },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  tierBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: "700" },
  planStatus: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  divider: { height: 1, marginVertical: 16 },
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  periodItem: { alignItems: "center" },
  periodLabel: { fontSize: 11, marginBottom: 4 },
  periodValue: { fontSize: 14, fontWeight: "600" },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  trialText: { fontSize: 13, fontWeight: "500" },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  otherPlanCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  otherPlanInfo: { flex: 1 },
  otherPlanName: { fontSize: 14, fontWeight: "600" },
  otherPlanDesc: { fontSize: 12, marginTop: 2 },
  otherPlanPrice: { alignItems: "flex-end" },
  otherPlanPriceText: { fontSize: 15, fontWeight: "700" },
  otherPlanInterval: { fontSize: 11 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  featureText: { fontSize: 14 },
});
