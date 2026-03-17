/**
 * LiveDonationAlert — Alerte de donation animée
 *
 * Affiche une animation plein écran quand un viewer envoie une donation.
 * L'animation varie selon le tier (bronze → legendary).
 *
 * Sprint S16 — Live UI Streamer & Viewer
 */

import type { DonationTier, LiveDonation } from "@/types/live-streaming";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Tier Config ──────────────────────────────────────────────

export interface TierConfig {
  emoji: string;
  color: string;
  glowColor: string;
  scale: number;
  label: string;
}

export const TIER_CONFIGS: Record<DonationTier, TierConfig> = {
  bronze: {
    emoji: "🪙",
    color: "#CD7F32",
    glowColor: "rgba(205,127,50,0.3)",
    scale: 1,
    label: "Bronze",
  },
  silver: {
    emoji: "💎",
    color: "#C0C0C0",
    glowColor: "rgba(192,192,192,0.3)",
    scale: 1.1,
    label: "Silver",
  },
  gold: {
    emoji: "🏆",
    color: "#FFD700",
    glowColor: "rgba(255,215,0,0.3)",
    scale: 1.2,
    label: "Gold",
  },
  diamond: {
    emoji: "💠",
    color: "#B9F2FF",
    glowColor: "rgba(185,242,255,0.3)",
    scale: 1.4,
    label: "Diamond",
  },
  legendary: {
    emoji: "👑",
    color: "#FF4500",
    glowColor: "rgba(255,69,0,0.4)",
    scale: 1.6,
    label: "Legendary",
  },
};

// ─── Props ────────────────────────────────────────────────────

export interface LiveDonationAlertProps {
  donation: LiveDonation | null;
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────

export default function LiveDonationAlert({
  donation,
  onComplete,
}: LiveDonationAlertProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!donation) {
      opacity.setValue(0);
      scale.setValue(0.3);
      translateY.setValue(30);
      return;
    }

    const config = TIER_CONFIGS[donation.tier];
    const holdDuration =
      donation.tier === "legendary"
        ? 3000
        : donation.tier === "diamond"
          ? 2500
          : 2000;

    Animated.sequence([
      // Enter: scale + fade in + slide up
      Animated.parallel([
        Animated.spring(scale, {
          toValue: config.scale,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      // Hold
      Animated.delay(holdDuration),
      // Exit: fade out + slide up
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -40,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });
  }, [donation]);

  if (!donation) return null;

  const config = TIER_CONFIGS[donation.tier];

  return (
    <Animated.View
      testID="donation-alert"
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <View
        testID={`donation-tier-${donation.tier}`}
        style={[
          styles.alertBox,
          { borderColor: config.color, backgroundColor: config.glowColor },
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <View style={styles.info}>
          <Text style={[styles.userName, { color: config.color }]}>
            {donation.userName}
          </Text>
          <Text style={styles.amount}>{donation.amount} IC</Text>
          {donation.message && (
            <Text style={styles.message} numberOfLines={2}>
              {donation.message}
            </Text>
          )}
        </View>
        <Text style={[styles.tierLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: SCREEN_WIDTH * 0.85,
    gap: 12,
  },
  emoji: {
    fontSize: 36,
  },
  info: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
  },
  amount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFD700",
  },
  message: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
