/**
 * PostEffectsPanel — Panneau d'effets post-production
 *
 * Permet d'activer/désactiver et ajuster l'intensité des effets :
 * - Flou arrière-plan (détection IA)
 * - Stabilisation post
 * - Correction lumière auto
 * - Étalonnage couleurs (premium)
 *
 * Sprint S11 Axe B — Remix, Duo & Effets Avancés
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import {
    POST_EFFECTS_CATALOG,
    type PostEffectDefinition,
} from "@/services/imufeed/remix-service";
import type { AppliedPostEffect, PostEffectType } from "@/types/imufeed";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────

interface PostEffectsPanelProps {
  activeEffects: AppliedPostEffect[];
  onToggleEffect: (effectType: PostEffectType) => void;
  onIntensityChange: (effectType: PostEffectType, intensity: number) => void;
}

// ─── Intensity steps ──────────────────────────────────────────

const INTENSITY_STEPS = [0.25, 0.5, 0.75, 1.0];
const INTENSITY_LABELS = ["25%", "50%", "75%", "100%"];

// ─── Component ────────────────────────────────────────────────

export default function PostEffectsPanel({
  activeEffects,
  onToggleEffect,
  onIntensityChange,
}: PostEffectsPanelProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const isEffectActive = useCallback(
    (type: PostEffectType) =>
      activeEffects.some((e) => e.effectType === type),
    [activeEffects],
  );

  const getEffectIntensity = useCallback(
    (type: PostEffectType) =>
      activeEffects.find((e) => e.effectType === type)?.intensity ?? 0.5,
    [activeEffects],
  );

  const renderEffect = useCallback(
    (def: PostEffectDefinition) => {
      const active = isEffectActive(def.type);
      const intensity = getEffectIntensity(def.type);

      return (
        <View
          key={def.type}
          testID={`effect-${def.type}`}
          style={[
            styles.effectCard,
            {
              backgroundColor: active
                ? `${colors.primary}20`
                : colors.surface,
              borderColor: active ? colors.primary : colors.border,
            },
          ]}
        >
          {/* Header : toggle + info */}
          <TouchableOpacity
            testID={`effect-toggle-${def.type}`}
            style={styles.effectHeader}
            onPress={() => onToggleEffect(def.type)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={def.icon as any}
              size={20}
              color={active ? colors.primary : colors.textSecondary}
            />
            <View style={styles.effectInfo}>
              <View style={styles.nameRow}>
                <Text
                  style={[
                    styles.effectName,
                    { color: active ? colors.primary : colors.text },
                  ]}
                >
                  {def.name}
                </Text>
                {def.isPremium && (
                  <View
                    testID={`premium-badge-${def.type}`}
                    style={[styles.premiumBadge, { backgroundColor: "#F39C12" }]}
                  >
                    <Text style={styles.premiumText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.effectDesc, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {def.description}
              </Text>
            </View>
            <Ionicons
              name={active ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={active ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Intensity bar (visible quand actif) */}
          {active && (
            <View testID={`intensity-${def.type}`} style={styles.intensityRow}>
              <Text
                style={[styles.intensityLabel, { color: colors.textSecondary }]}
              >
                Intensité
              </Text>
              <View style={styles.intensitySteps}>
                {INTENSITY_STEPS.map((step, i) => {
                  const isSelected =
                    Math.abs(intensity - step) < 0.01;
                  return (
                    <TouchableOpacity
                      key={step}
                      testID={`intensity-step-${def.type}-${step}`}
                      style={[
                        styles.stepBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => onIntensityChange(def.type, step)}
                    >
                      <Text
                        style={[
                          styles.stepText,
                          { color: isSelected ? "#fff" : colors.textSecondary },
                        ]}
                      >
                        {INTENSITY_LABELS[i]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      );
    },
    [colors, activeEffects, isEffectActive, getEffectIntensity, onToggleEffect, onIntensityChange],
  );

  return (
    <View testID="post-effects-panel" style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Effets post-production
      </Text>
      {POST_EFFECTS_CATALOG.map(renderEffect)}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  effectCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  effectHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  effectInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  effectName: {
    fontSize: 13,
    fontWeight: "600",
  },
  premiumBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  premiumText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  effectDesc: {
    fontSize: 11,
  },
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  intensityLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  intensitySteps: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  stepBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 6,
  },
  stepText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
