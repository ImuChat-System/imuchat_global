/**
 * Composant CallControls - Contrôles d'appel vidéo/audio
 *
 * Affiche les boutons de contrôle pendant un appel:
 * - Toggle Micro (mute/unmute)
 * - Toggle Caméra (on/off)
 * - Flip Caméra (avant/arrière)
 * - Raccrocher (end call)
 */

import { KawaiiButton } from "@imuchat/ui-kit/native";
import React from "react";
import { StyleSheet, View } from "react-native";

export interface CallControlsProps {
  /** Micro activé */
  isMicOn: boolean;
  /** Caméra activée */
  isCameraOn: boolean;
  /** Toggle micro */
  onToggleMic: () => void;
  /** Toggle caméra */
  onToggleCamera: () => void;
  /** Flip caméra (avant/arrière) */
  onFlipCamera: () => void;
  /** Raccrocher */
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMicOn,
  isCameraOn,
  onToggleMic,
  onToggleCamera,
  onFlipCamera,
  onEndCall,
}) => {
  return (
    <View style={styles.container}>
      {/* Row 1: Micro + Caméra + Flip */}
      <View style={styles.row}>
        {/* Toggle Micro */}
        <KawaiiButton
          emoji={isMicOn ? "🎤" : "🔇"}
          onPress={onToggleMic}
          variant={isMicOn ? "secondary" : "outline"}
          style={styles.button}
        >
          {isMicOn ? "Mute" : "Unmute"}
        </KawaiiButton>

        {/* Toggle Caméra */}
        <KawaiiButton
          emoji={isCameraOn ? "📹" : "🚫"}
          onPress={onToggleCamera}
          variant={isCameraOn ? "secondary" : "outline"}
          style={styles.button}
        >
          {isCameraOn ? "Caméra" : "Caméra Off"}
        </KawaiiButton>

        {/* Flip Caméra */}
        <KawaiiButton
          emoji="🔄"
          onPress={onFlipCamera}
          variant="secondary"
          style={styles.button}
          disabled={!isCameraOn}
        >
          Flip
        </KawaiiButton>
      </View>

      {/* Row 2: Raccrocher (centré) */}
      <View style={styles.row}>
        <KawaiiButton
          emoji="📞"
          onPress={onEndCall}
          variant="primary"
          style={styles.endCallButton}
        >
          Raccrocher
        </KawaiiButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  endCallButton: {
    minWidth: 200,
  },
});
