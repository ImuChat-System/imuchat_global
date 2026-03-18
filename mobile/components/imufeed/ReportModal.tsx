/**
 * S18 — ReportModal
 *
 * Modal de signalement de contenu avec raisons prédéfinies
 * et champ description optionnel.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useContentModerationStore } from "@/stores/content-moderation-store";
import type {
  ReportableContentType,
  ReportReason,
} from "@/types/content-moderation";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Constants ──────────────────────────────────────────────────────────────

const REPORT_REASONS: { key: ReportReason; labelKey: string }[] = [
  { key: "spam", labelKey: "report.reason.spam" },
  { key: "harassment", labelKey: "report.reason.harassment" },
  { key: "hate_speech", labelKey: "report.reason.hate_speech" },
  { key: "violence", labelKey: "report.reason.violence" },
  { key: "nsfw", labelKey: "report.reason.nsfw" },
  { key: "misinformation", labelKey: "report.reason.misinformation" },
  { key: "copyright", labelKey: "report.reason.copyright" },
  { key: "impersonation", labelKey: "report.reason.impersonation" },
  { key: "underage", labelKey: "report.reason.underage" },
  { key: "other", labelKey: "report.reason.other" },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface ReportModalProps {
  visible: boolean;
  contentId: string;
  contentType: ReportableContentType;
  onClose: () => void;
  onSubmitted?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ReportModal({
  visible,
  contentId,
  contentType,
  onClose,
  onSubmitted,
}: ReportModalProps) {
  const { t } = useI18n();
  const reportContent = useContentModerationStore((s) => s.reportContent);

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    await reportContent(contentId, contentType, selectedReason, description);
    setSubmitting(false);
    setSubmitted(true);
    onSubmitted?.();
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription("");
    setSubmitted(false);
    onClose();
  };

  // ── Confirmation screen ─────────────────────────────────────
  if (submitted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View
          testID="report-modal"
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#1a1a2e",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text
              testID="report-confirmation"
              style={{ color: "#4ade80", fontSize: 18, fontWeight: "700" }}
            >
              {t("report.submitted", { defaultValue: "Signalement envoyé" })}
            </Text>
            <Text style={{ color: "#ccc", marginTop: 8, textAlign: "center" }}>
              {t("report.thank_you", {
                defaultValue:
                  "Merci. Notre équipe examinera ce contenu rapidement.",
              })}
            </Text>
            <TouchableOpacity
              testID="report-close-btn"
              onPress={handleClose}
              style={{
                marginTop: 20,
                backgroundColor: "#333",
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>
                {t("common.close", { defaultValue: "Fermer" })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Main form ───────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        testID="report-modal"
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#1a1a2e",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {t("report.title", { defaultValue: "Signaler ce contenu" })}
          </Text>

          {/* Reasons */}
          <ScrollView style={{ maxHeight: 300 }}>
            {REPORT_REASONS.map((r) => (
              <TouchableOpacity
                key={r.key}
                testID={`reason-${r.key}`}
                onPress={() => setSelectedReason(r.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor:
                    selectedReason === r.key ? "#2a2a4a" : "transparent",
                  borderRadius: 8,
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedReason === r.key ? "#a855f7" : "#555",
                    backgroundColor:
                      selectedReason === r.key ? "#a855f7" : "transparent",
                    marginRight: 12,
                  }}
                />
                <Text style={{ color: "#fff", fontSize: 15 }}>
                  {t(r.labelKey, { defaultValue: r.key })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Description */}
          <TextInput
            testID="report-description"
            placeholder={t("report.description_placeholder", {
              defaultValue: "Détails supplémentaires (optionnel)",
            })}
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            style={{
              backgroundColor: "#16162a",
              color: "#fff",
              borderRadius: 8,
              padding: 12,
              marginTop: 12,
              minHeight: 60,
            }}
          />

          {/* Actions */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              testID="report-cancel-btn"
              onPress={handleClose}
              style={{
                flex: 1,
                marginRight: 8,
                paddingVertical: 14,
                borderRadius: 8,
                backgroundColor: "#333",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>
                {t("common.cancel", { defaultValue: "Annuler" })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="report-submit-btn"
              onPress={handleSubmit}
              disabled={!selectedReason || submitting}
              style={{
                flex: 1,
                marginLeft: 8,
                paddingVertical: 14,
                borderRadius: 8,
                backgroundColor:
                  selectedReason && !submitting ? "#a855f7" : "#555",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {submitting
                  ? t("common.sending", { defaultValue: "Envoi..." })
                  : t("report.submit", { defaultValue: "Signaler" })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
