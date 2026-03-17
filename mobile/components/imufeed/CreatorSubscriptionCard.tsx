/**
 * CreatorSubscriptionCard — Carte d'abonnement premium créateur
 *
 * Affiche les 3 tiers (Basic, Pro, VIP) avec perks
 * et permet de s'abonner ou gérer l'abonnement existant.
 *
 * Sprint S14B — Abonnement Premium
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
  SUBSCRIPTION_TIERS,
  type CreatorSubscription,
  type SubscriptionTier,
  type SubscriptionTierInfo,
} from "@/types/creator-monetization";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

export interface CreatorSubscriptionCardProps {
  /** ID du créateur */
  creatorId: string;
  /** Abonnement actuel de l'utilisateur (null si non abonné) */
  currentSubscription: CreatorSubscription | null;
  /** Callback quand un tier est sélectionné */
  onSubscribe?: (tier: SubscriptionTier) => Promise<void>;
  /** Callback pour annuler */
  onCancel?: () => Promise<void>;
  /** Style container */
  style?: ViewStyle;
}

export default function CreatorSubscriptionCard({
  creatorId: _creatorId,
  currentSubscription,
  onSubscribe,
  onCancel,
  style,
}: CreatorSubscriptionCardProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    currentSubscription?.tier || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setIsLoading(true);
    try {
      await onSubscribe?.(tier);
      setSelectedTier(tier);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel?.();
      setSelectedTier(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = currentSubscription?.status === "active";

  return (
    <View
      testID="subscription-card"
      style={[styles.container, { backgroundColor: colors.card }, style]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Abonnement Premium
      </Text>

      {/* Tiers */}
      <View style={styles.tiersRow}>
        {SUBSCRIPTION_TIERS.map((tierInfo) => (
          <TierCard
            key={tierInfo.tier}
            tierInfo={tierInfo}
            isSelected={selectedTier === tierInfo.tier}
            isCurrentTier={currentSubscription?.tier === tierInfo.tier}
            onSelect={() => setSelectedTier(tierInfo.tier)}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isSubscribed ? (
          <View style={styles.subscribedRow}>
            <Text style={[styles.subscribedText, { color: colors.success }]}>
              ✅ Abonné{" "}
              {SUBSCRIPTION_TIERS.find(
                (t) => t.tier === currentSubscription.tier,
              )?.emoji || ""}
            </Text>
            <TouchableOpacity
              testID="subscription-cancel"
              style={[styles.cancelBtn, { borderColor: colors.error }]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.error}
                  testID="subscription-loading"
                />
              ) : (
                <Text style={{ color: colors.error, fontWeight: "600" }}>
                  Annuler
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            testID="subscription-subscribe"
            style={[
              styles.subscribeBtn,
              {
                backgroundColor: selectedTier ? colors.primary : colors.border,
              },
            ]}
            onPress={() => selectedTier && handleSubscribe(selectedTier)}
            disabled={!selectedTier || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="#fff"
                testID="subscription-loading"
              />
            ) : (
              <Text style={styles.subscribeBtnText}>
                {selectedTier
                  ? `S'abonner (${(
                      (SUBSCRIPTION_TIERS.find((t) => t.tier === selectedTier)
                        ?.price_cents || 0) / 100
                    ).toFixed(2)}€/mois)`
                  : "Choisir un tier"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── TierCard ──────────────────────────────────────────────────

function TierCard({
  tierInfo,
  isSelected,
  isCurrentTier,
  onSelect,
}: {
  tierInfo: SubscriptionTierInfo;
  isSelected: boolean;
  isCurrentTier: boolean;
  onSelect: () => void;
}) {
  const colors = useColors();

  return (
    <TouchableOpacity
      testID={`tier-${tierInfo.tier}`}
      style={[
        styles.tierCard,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isCurrentTier
            ? colors.success
            : isSelected
              ? colors.primary
              : colors.border,
        },
      ]}
      onPress={onSelect}
    >
      <Text style={styles.tierEmoji}>{tierInfo.emoji}</Text>
      <Text
        style={[styles.tierLabel, { color: isSelected ? "#fff" : colors.text }]}
      >
        {tierInfo.label}
      </Text>
      <Text
        style={[
          styles.tierPrice,
          { color: isSelected ? "#fff" : colors.textSecondary },
        ]}
      >
        {(tierInfo.price_cents / 100).toFixed(2)}€
      </Text>

      {/* Perks */}
      {tierInfo.perks.slice(0, 3).map((perk, i) => (
        <Text
          key={i}
          style={[
            styles.tierPerk,
            { color: isSelected ? "rgba(255,255,255,0.8)" : colors.textMuted },
          ]}
        >
          • {perk}
        </Text>
      ))}

      {isCurrentTier && (
        <View
          style={[styles.currentBadge, { backgroundColor: colors.success }]}
        >
          <Text style={styles.currentBadgeText}>Actuel</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  tiersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tierCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  tierEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  tierPrice: {
    fontSize: 12,
    marginBottom: 6,
  },
  tierPerk: {
    fontSize: 9,
    textAlign: "center",
  },
  currentBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  actions: {
    marginTop: 4,
  },
  subscribedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subscribedText: {
    fontWeight: "600",
    fontSize: 14,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subscribeBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  subscribeBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
