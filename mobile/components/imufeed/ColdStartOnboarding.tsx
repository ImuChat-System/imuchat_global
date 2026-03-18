/**
 * components/imufeed/ColdStartOnboarding.tsx — S19
 *
 * Écran d'onboarding pour les nouveaux utilisateurs :
 * sélection de catégories d'intérêt pour le cold start.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { useRecommendationStore } from "@/stores/recommendation-store";
import type { OnboardingCategory } from "@/types/recommendation";
import React, { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onComplete: () => void;
}

export default function ColdStartOnboarding({ onComplete }: Props) {
  const { t } = useI18n();
  const colors = useColors();
  const {
    availableCategories,
    onboardingCategories,
    loadAvailableCategories,
    selectOnboardingCategory,
    removeOnboardingCategory,
    completeOnboarding,
  } = useRecommendationStore();

  useEffect(() => {
    loadAvailableCategories();
  }, []);

  const handleToggle = (categoryId: string) => {
    if (onboardingCategories.includes(categoryId)) {
      removeOnboardingCategory(categoryId);
    } else {
      selectOnboardingCategory(categoryId);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    onComplete();
  };

  const canSubmit = onboardingCategories.length >= 3;

  const renderCategory = ({ item }: { item: OnboardingCategory }) => {
    const selected = onboardingCategories.includes(item.id);
    return (
      <TouchableOpacity
        testID={`category-${item.id}`}
        onPress={() => handleToggle(item.id)}
        style={{
          flex: 1,
          margin: 6,
          padding: 16,
          borderRadius: 14,
          backgroundColor: selected ? "#a855f7" : colors.card,
          alignItems: "center",
          borderWidth: selected ? 0 : 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</Text>
        <Text
          style={{
            color: selected ? "#fff" : colors.text,
            fontSize: 13,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {item.label}
        </Text>
        <Text
          style={{
            color: selected ? "rgba(255,255,255,0.7)" : colors.textSecondary,
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {item.video_count}{" "}
          {t("recommendation.videos", { defaultValue: "vidéos" })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      testID="cold-start-onboarding"
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 60 }}
    >
      {/* Title */}
      <Text
        style={{
          color: colors.text,
          fontSize: 24,
          fontWeight: "800",
          textAlign: "center",
          marginBottom: 8,
          paddingHorizontal: 20,
        }}
      >
        {t("recommendation.onboarding_title", {
          defaultValue: "Qu'est-ce qui t'intéresse ?",
        })}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: "center",
          marginBottom: 24,
          paddingHorizontal: 32,
        }}
      >
        {t("recommendation.onboarding_subtitle", {
          defaultValue:
            "Choisis au moins 3 catégories pour personnaliser ton feed",
        })}
      </Text>

      {/* Counter */}
      <Text
        testID="selection-counter"
        style={{
          color: canSubmit ? "#a855f7" : colors.textSecondary,
          fontSize: 13,
          fontWeight: "600",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        {onboardingCategories.length}/8{" "}
        {t("recommendation.selected", { defaultValue: "sélectionnées" })}
      </Text>

      {/* Category grid */}
      <FlatList
        testID="categories-grid"
        data={availableCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* Continue button */}
      <View
        style={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 }}
      >
        <TouchableOpacity
          testID="onboarding-continue-btn"
          onPress={handleComplete}
          disabled={!canSubmit}
          style={{
            backgroundColor: canSubmit ? "#a855f7" : "#333",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: canSubmit ? "#fff" : "#888",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {t("recommendation.continue", { defaultValue: "Continuer" })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
