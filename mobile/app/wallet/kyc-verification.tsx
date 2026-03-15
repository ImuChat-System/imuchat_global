/**
 * KYC Verification Screen — Sprint M-F2
 *
 * Parcours KYC step-by-step : document → selfie → validation.
 * Stepper de progression, upload de documents, capture selfie.
 * Route : /wallet/kyc-verification (Expo Router)
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useKycVerificationStore } from "@/stores/kyc-verification-store";
import type { KycTier, VerificationStep } from "@/types/kyc-verification";
import {
  VERIFICATION_STEP_CONFIG,
  VERIFICATION_STEP_STATUS_CONFIG,
} from "@/types/kyc-verification";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STEPS_ORDER: VerificationStep[] = [
  "identity",
  "address",
  "selfie",
  "review",
];

export default function KycVerificationScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const router = useRouter();

  const {
    profile,
    currentAttempt,
    currentStep,
    progress,
    isLoading,
    error,
    loadProfile,
    startVerification,
    refreshStatus,
    cancelAttempt,
    clearError,
  } = useKycVerificationStore();

  const [targetTier] = useState<KycTier>(2);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("kycVerification.error") || "Erreur", error, [
        { text: "OK", onPress: clearError },
      ]);
    }
  }, [error, clearError, t]);

  const handleStart = useCallback(async () => {
    await startVerification(targetTier);
  }, [startVerification, targetTier]);

  const handleRefresh = useCallback(async () => {
    if (currentAttempt) {
      await refreshStatus(currentAttempt.id);
    }
  }, [currentAttempt, refreshStatus]);

  const handleCancel = useCallback(() => {
    if (!currentAttempt) return;
    Alert.alert(
      t("kycVerification.cancelTitle") || "Annuler la vérification",
      t("kycVerification.cancelConfirm") ||
        "Voulez-vous annuler cette vérification ?",
      [
        { text: t("common.no") || "Non", style: "cancel" },
        {
          text: t("common.yes") || "Oui",
          style: "destructive",
          onPress: () => cancelAttempt(currentAttempt.id),
        },
      ],
    );
  }, [currentAttempt, cancelAttempt, t]);

  // ── Stepper ───────────────────────────────────────────────
  const renderStepper = () => {
    const steps = currentAttempt?.steps ?? [];
    return (
      <View testID="kyc-stepper" style={styles.stepper}>
        {STEPS_ORDER.map((stepKey, index) => {
          const stepDetail = steps.find((s) => s.step === stepKey);
          const status = stepDetail?.status ?? "pending";
          const config = VERIFICATION_STEP_CONFIG[stepKey];
          const statusConfig = VERIFICATION_STEP_STATUS_CONFIG[status];
          const isActive = currentStep === stepKey;

          return (
            <View key={stepKey} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : statusConfig.color,
                    borderColor: isActive ? colors.primary : statusConfig.color,
                  },
                ]}
              >
                <Text style={styles.stepCircleText}>
                  {status === "approved" ? "✓" : `${index + 1}`}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? "700" : "400",
                  },
                ]}
              >
                {config.label}
              </Text>
              {index < STEPS_ORDER.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        status === "approved" ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // ── Progress Bar ──────────────────────────────────────────
  const renderProgress = () => (
    <View testID="kyc-progress" style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {progress}%
      </Text>
    </View>
  );

  // ── Step Content ──────────────────────────────────────────
  const renderStepContent = () => {
    if (!currentAttempt) return null;

    if (!currentStep) {
      const allApproved =
        currentAttempt.steps.length > 0 &&
        currentAttempt.steps.every((s) => s.status === "approved");
      if (allApproved) {
        return (
          <View
            testID="kyc-complete"
            style={[styles.infoCard, { backgroundColor: colors.surface }]}
          >
            <Text style={styles.infoEmoji}>🎉</Text>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              {t("kycVerification.allStepsComplete") ||
                "Toutes les étapes sont terminées"}
            </Text>
            <Text
              style={[styles.infoSubtitle, { color: colors.textSecondary }]}
            >
              {t("kycVerification.reviewInProgress") ||
                "Votre dossier est en cours de vérification"}
            </Text>
          </View>
        );
      }
    }

    const config = currentStep ? VERIFICATION_STEP_CONFIG[currentStep] : null;

    return (
      <View
        testID="kyc-step-content"
        style={[styles.infoCard, { backgroundColor: colors.surface }]}
      >
        <Text style={styles.infoEmoji}>{config?.icon ?? "📝"}</Text>
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          {config?.label ?? ""}
        </Text>
        <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
          {config?.description ?? ""}
        </Text>

        {currentStep === "identity" && (
          <TouchableOpacity
            testID="kyc-upload-identity"
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              // placeholder — expo-image-picker integration
            }}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>
              {t("kycVerification.uploadDocument") || "Télécharger un document"}
            </Text>
          </TouchableOpacity>
        )}

        {currentStep === "address" && (
          <TouchableOpacity
            testID="kyc-upload-address"
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              // placeholder — expo-image-picker integration
            }}
          >
            <Ionicons name="document-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>
              {t("kycVerification.uploadProof") ||
                "Télécharger un justificatif"}
            </Text>
          </TouchableOpacity>
        )}

        {currentStep === "selfie" && (
          <TouchableOpacity
            testID="kyc-take-selfie"
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              // placeholder — expo-camera integration
            }}
          >
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>
              {t("kycVerification.takeSelfie") || "Prendre un selfie"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ── Main Render ───────────────────────────────────────────
  if (isLoading && !currentAttempt) {
    return (
      <View
        testID="kyc-loading"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="kyc-verification-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md }}
    >
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>
        {t("kycVerification.title") || "Vérification d'identité"}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t("kycVerification.subtitle") ||
          "Vérifiez votre identité pour augmenter vos limites"}
      </Text>

      {/* No attempt → Start button */}
      {!currentAttempt && (
        <View
          testID="kyc-start-section"
          style={[styles.infoCard, { backgroundColor: colors.surface }]}
        >
          <Text style={styles.infoEmoji}>🔐</Text>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t("kycVerification.startTitle") || "Commencer la vérification"}
          </Text>
          <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
            {t("kycVerification.startDesc") ||
              "3 étapes simples pour vérifier votre identité"}
          </Text>
          <TouchableOpacity
            testID="kyc-start-btn"
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={handleStart}
          >
            <Text style={styles.actionBtnText}>
              {t("kycVerification.start") || "Commencer"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active attempt */}
      {currentAttempt && (
        <>
          {renderProgress()}
          {renderStepper()}
          {renderStepContent()}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              testID="kyc-refresh-btn"
              style={[styles.secondaryBtn, { borderColor: colors.primary }]}
              onPress={handleRefresh}
            >
              <Text
                style={[styles.secondaryBtnText, { color: colors.primary }]}
              >
                {t("kycVerification.refresh") || "Actualiser"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="kyc-cancel-btn"
              style={[styles.secondaryBtn, { borderColor: colors.error }]}
              onPress={handleCancel}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.error }]}>
                {t("kycVerification.cancel") || "Annuler"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* View Status Link */}
      <TouchableOpacity
        testID="kyc-view-status"
        style={[
          styles.linkBtn,
          { borderColor: colors.border, marginTop: spacing.lg },
        ]}
        onPress={() => router.push("/wallet/kyc-status" as any)}
      >
        <Text style={[styles.linkBtnText, { color: colors.primary }]}>
          {t("kycVerification.viewStatus") || "Voir mon statut KYC"}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },

  // Stepper
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 16,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepCircleText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  stepLabel: { fontSize: 11, textAlign: "center" },
  stepLine: { position: "absolute", top: 18, right: -20, width: 40, height: 2 },

  // Progress
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { marginLeft: 8, fontSize: 13, fontWeight: "600" },

  // Info card
  infoCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginVertical: 12,
  },
  infoEmoji: { fontSize: 40, marginBottom: 12 },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  infoSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },

  // Buttons
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "600" },

  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    gap: 6,
  },
  linkBtnText: { fontSize: 15, fontWeight: "600" },
});
