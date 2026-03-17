/**
 * TipButton — Bouton "💰 Soutenir" pour envoyer des ImuCoins
 *
 * Affiche un sélecteur de montants prédéfinis (TIP_PRESETS)
 * et un champ message optionnel.
 *
 * Sprint S14B — Pourboires Créateur
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { TIP_PRESETS, type TipPreset } from "@/types/creator-monetization";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

export interface TipButtonProps {
  /** ID du créateur */
  creatorId: string;
  /** Nom du créateur (affichage) */
  creatorName: string;
  /** Callback quand le tip est envoyé */
  onTipSent?: (amount: number, message: string) => void;
  /** Callback quand le tip échoue */
  onTipError?: (error: string) => void;
  /** Callback de soumission (remplace le service par défaut) */
  onSubmit?: (
    creatorId: string,
    amount: number,
    message: string,
  ) => Promise<void>;
  /** Si le panneau est ouvert */
  expanded?: boolean;
  /** Style container */
  style?: ViewStyle;
}

export default function TipButton({
  creatorId,
  creatorName,
  onTipSent,
  onTipError,
  onSubmit,
  expanded: initialExpanded = false,
  style,
}: TipButtonProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const [expanded, setExpanded] = useState(initialExpanded);
  const [selectedPreset, setSelectedPreset] = useState<TipPreset | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendTip = async () => {
    if (!selectedPreset) return;

    setIsSending(true);
    try {
      if (onSubmit) {
        await onSubmit(creatorId, selectedPreset.amount, message);
      }
      onTipSent?.(selectedPreset.amount, message);
      setSelectedPreset(null);
      setMessage("");
      setExpanded(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
      onTipError?.(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (!expanded) {
    return (
      <TouchableOpacity
        testID="tip-button-trigger"
        style={[
          styles.trigger,
          { backgroundColor: colors.primary, borderRadius: spacing.sm },
          style,
        ]}
        onPress={() => setExpanded(true)}
        accessibilityLabel={`Soutenir ${creatorName}`}
      >
        <Text style={styles.triggerText}>💰 Soutenir</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      testID="tip-panel"
      style={[
        styles.panel,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Soutenir {creatorName}
      </Text>

      {/* Presets */}
      <View style={styles.presetsRow} testID="tip-presets">
        {TIP_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.amount}
            testID={`tip-preset-${preset.amount}`}
            style={[
              styles.presetChip,
              {
                backgroundColor:
                  selectedPreset?.amount === preset.amount
                    ? colors.primary
                    : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedPreset(preset)}
          >
            <Text style={styles.presetEmoji}>{preset.emoji}</Text>
            <Text
              style={[
                styles.presetAmount,
                {
                  color:
                    selectedPreset?.amount === preset.amount
                      ? "#fff"
                      : colors.text,
                },
              ]}
            >
              {preset.amount}
            </Text>
            <Text
              style={[
                styles.presetLabel,
                {
                  color:
                    selectedPreset?.amount === preset.amount
                      ? "#fff"
                      : colors.textMuted,
                },
              ]}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message */}
      <TextInput
        testID="tip-message-input"
        style={[
          styles.messageInput,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Message (optionnel)..."
        placeholderTextColor={colors.textMuted}
        value={message}
        onChangeText={setMessage}
        maxLength={200}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          testID="tip-cancel"
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={() => {
            setExpanded(false);
            setSelectedPreset(null);
            setMessage("");
          }}
        >
          <Text style={{ color: colors.textMuted }}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="tip-send"
          style={[
            styles.sendBtn,
            {
              backgroundColor: selectedPreset ? colors.primary : colors.border,
            },
          ]}
          onPress={handleSendTip}
          disabled={!selectedPreset || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" testID="tip-loading" />
          ) : (
            <Text style={styles.sendText}>
              {selectedPreset
                ? `Envoyer ${selectedPreset.amount} IC`
                : "Choisir un montant"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  triggerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 60,
  },
  presetEmoji: {
    fontSize: 20,
  },
  presetAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  presetLabel: {
    fontSize: 10,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  sendBtn: {
    flex: 2,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
