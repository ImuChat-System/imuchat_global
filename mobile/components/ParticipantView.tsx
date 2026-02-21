/**
 * Composant ParticipantView - Affichage vidéo d'un participant
 *
 * Affiche la vidéo (ou avatar si caméra off) d'un participant avec:
 * - Nom du participant
 * - Indicateur micro (muted/unmuted)
 * - Indicateur caméra (on/off)
 */

import { useI18n } from "@/providers/I18nProvider";
import type { CallParticipant } from "@/services/calls";
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Avatar from "./Avatar";

export interface ParticipantViewProps {
  /** Participant à afficher */
  participant: CallParticipant;
  /** Style personnalisé */
  style?: ViewStyle;
  /** Vue locale (caméra de l'utilisateur) */
  isLocal?: boolean;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  participant,
  style,
  isLocal = false,
}) => {
  const { t } = useI18n();
  const { userId, name, isAudioEnabled, isVideoEnabled } = participant;

  return (
    <View style={[styles.container, style]} testID="participant-container">
      {/* Vidéo ou Avatar */}
      {!isVideoEnabled ? (
        // Caméra off: afficher l'avatar
        <View style={styles.avatarContainer} testID="participant-avatar">
          <Avatar size={80} url={null} onUpload={() => {}} />
        </View>
      ) : (
        // TODO: Intégrer le composant vidéo de Stream SDK
        // Pour l'instant, placeholder
        <View style={styles.videoPlaceholder} testID="video-placeholder">
          <Text style={styles.videoPlaceholderText}>
            📹 {isLocal ? t("common.you") : name}
          </Text>
        </View>
      )}

      {/* Overlay avec nom et indicateurs */}
      <View style={styles.overlay} testID="participant-overlay">
        {/* Nom */}
        <View style={styles.nameContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {isLocal ? t("common.you") : name || t("common.user")}
          </Text>
        </View>

        {/* Indicateurs (micro/caméra) */}
        <View style={styles.indicators}>
          {!isAudioEnabled && (
            <View style={styles.indicator}>
              <Text style={styles.indicatorText}>🔇</Text>
            </View>
          )}
          {!isVideoEnabled && (
            <View style={styles.indicator}>
              <Text style={styles.indicatorText}>🚫</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2D2D44",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  avatarContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F3460",
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  indicators: {
    flexDirection: "row",
    gap: 4,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 107, 157, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorText: {
    fontSize: 12,
  },
});
