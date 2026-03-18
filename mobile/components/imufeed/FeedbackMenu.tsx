/**
 * components/imufeed/FeedbackMenu.tsx — S19
 *
 * Bottom sheet de feedback enrichi : 8 raisons détaillées
 * pour signaler une vidéo non intéressante.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { useRecommendationStore } from "@/stores/recommendation-store";
import type { NegativeFeedbackReason } from "@/types/recommendation";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  videoId: string;
  onClose: () => void;
}

const REASONS: {
  key: NegativeFeedbackReason;
  icon: string;
  labelKey: string;
  fallback: string;
}[] = [
  {
    key: "not_interested",
    icon: "🚫",
    labelKey: "recommendation.reason_not_interested",
    fallback: "Pas intéressé",
  },
  {
    key: "repetitive",
    icon: "🔁",
    labelKey: "recommendation.reason_repetitive",
    fallback: "Contenu répétitif",
  },
  {
    key: "inappropriate",
    icon: "⚠️",
    labelKey: "recommendation.reason_inappropriate",
    fallback: "Contenu inapproprié",
  },
  {
    key: "misleading",
    icon: "🎭",
    labelKey: "recommendation.reason_misleading",
    fallback: "Trompeur / clickbait",
  },
  {
    key: "low_quality",
    icon: "👎",
    labelKey: "recommendation.reason_low_quality",
    fallback: "Mauvaise qualité",
  },
  {
    key: "already_seen",
    icon: "👁️",
    labelKey: "recommendation.reason_already_seen",
    fallback: "Déjà vu",
  },
  {
    key: "too_long",
    icon: "⏱️",
    labelKey: "recommendation.reason_too_long",
    fallback: "Trop long",
  },
  {
    key: "not_my_language",
    icon: "🌐",
    labelKey: "recommendation.reason_not_my_language",
    fallback: "Pas dans ma langue",
  },
];

export default function FeedbackMenu({ visible, videoId, onClose }: Props) {
  const { t } = useI18n();
  const colors = useColors();
  const { submitFeedback } = useRecommendationStore();

  const handleSelect = async (reason: NegativeFeedbackReason) => {
    await submitFeedback(videoId, reason);
    onClose();
  };

  return (
    <Modal
      testID="feedback-menu"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 16,
            paddingBottom: 40,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 17,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {t("recommendation.feedback_title", {
              defaultValue: "Pourquoi cette vidéo ne te plaît pas ?",
            })}
          </Text>

          {REASONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              testID={`feedback-${r.key}`}
              onPress={() => handleSelect(r.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 13,
                paddingHorizontal: 8,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 14 }}>{r.icon}</Text>
              <Text style={{ color: colors.text, fontSize: 15 }}>
                {t(r.labelKey, { defaultValue: r.fallback })}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Cancel */}
          <TouchableOpacity
            testID="feedback-cancel"
            onPress={onClose}
            style={{
              marginTop: 12,
              paddingVertical: 14,
              alignItems: "center",
              borderRadius: 12,
              backgroundColor: colors.background,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              {t("common.cancel", { defaultValue: "Annuler" })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
