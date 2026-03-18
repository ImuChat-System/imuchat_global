/**
 * components/imufeed/PipOverlay.tsx — S20 · Picture-in-Picture flottant
 *
 * Overlay draggable affichant la vidéo en cours en mini-lecteur.
 * Gère : positions (4 coins), mute, fermeture, tap → retour plein écran.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useVideoPerformanceStore } from "@/stores/video-performance-store";
import type { PipPosition } from "@/types/video-performance";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

// ─── Positions absolues ─────────────────────────────────────

const POSITION_STYLES: Record<
  PipPosition,
  { top?: number; bottom?: number; left?: number; right?: number }
> = {
  "top-left": { top: 60, left: 12 },
  "top-right": { top: 60, right: 12 },
  "bottom-left": { bottom: 100, left: 12 },
  "bottom-right": { bottom: 100, right: 12 },
};

interface PipOverlayProps {
  onTapToRestore?: () => void;
}

export function PipOverlay({ onTapToRestore }: PipOverlayProps) {
  const { t } = useI18n();
  const pip = useVideoPerformanceStore((s) => s.pip);
  const pipConfig = useVideoPerformanceStore((s) => s.pipConfig);
  const closePip = useVideoPerformanceStore((s) => s.closePip);
  const togglePipMute = useVideoPerformanceStore((s) => s.togglePipMute);
  const movePip = useVideoPerformanceStore((s) => s.movePip);

  const handleClose = useCallback(() => {
    closePip();
  }, [closePip]);

  const handleMuteToggle = useCallback(() => {
    togglePipMute();
  }, [togglePipMute]);

  const handleCyclePosition = useCallback(() => {
    const positions: PipPosition[] = [
      "top-right",
      "bottom-right",
      "bottom-left",
      "top-left",
    ];
    const currentIdx = positions.indexOf(pip.position);
    const nextIdx = (currentIdx + 1) % positions.length;
    movePip(positions[nextIdx]);
  }, [pip.position, movePip]);

  const handleRestore = useCallback(() => {
    if (onTapToRestore) {
      onTapToRestore();
    }
  }, [onTapToRestore]);

  // ─── Ne rien rendre si PiP inactif ──────────────────────

  if (pip.status !== "active" || !pip.videoId) {
    return null;
  }

  const posStyle =
    POSITION_STYLES[pip.position] ?? POSITION_STYLES["bottom-right"];

  return (
    <View
      testID="pip-overlay"
      style={[styles.container, posStyle]}
      accessibilityLabel={t("pip.overlay", {
        defaultValue: "Mini lecteur vidéo",
      })}
      accessibilityRole="none"
    >
      {/* Zone vidéo — tap pour restaurer */}
      <Pressable
        testID="pip-video-area"
        style={styles.videoArea}
        onPress={handleRestore}
        accessibilityLabel={t("pip.restore", {
          defaultValue: "Revenir au plein écran",
        })}
        accessibilityRole="button"
      >
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle-outline" size={32} color="#fff" />
        </View>
      </Pressable>

      {/* Contrôles */}
      <View style={styles.controls}>
        {/* Bouton mute */}
        <Pressable
          testID="pip-mute-button"
          onPress={handleMuteToggle}
          style={styles.controlButton}
          accessibilityLabel={
            pip.isMuted
              ? t("pip.unmute", { defaultValue: "Activer le son" })
              : t("pip.mute", { defaultValue: "Couper le son" })
          }
          accessibilityRole="button"
        >
          <Ionicons
            name={pip.isMuted ? "volume-mute" : "volume-high"}
            size={16}
            color="#fff"
          />
        </Pressable>

        {/* Bouton déplacer */}
        <Pressable
          testID="pip-move-button"
          onPress={handleCyclePosition}
          style={styles.controlButton}
          accessibilityLabel={t("pip.move", { defaultValue: "Déplacer" })}
          accessibilityRole="button"
        >
          <Ionicons name="move-outline" size={16} color="#fff" />
        </Pressable>

        {/* Bouton fermer */}
        <Pressable
          testID="pip-close-button"
          onPress={handleClose}
          style={styles.controlButton}
          accessibilityLabel={t("pip.close", {
            defaultValue: "Fermer le mini lecteur",
          })}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 160,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#000",
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  videoArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    width: "100%",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  controlButton: {
    padding: 6,
  },
});
