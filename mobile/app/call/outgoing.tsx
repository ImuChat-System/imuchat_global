/**
 * Écran d'appel sortant
 * Affiche l'écran fullscreen lorsqu'on initie un appel
 * Utilise les composants UI-Kit pour un design cohérent
 */

import { useCalls } from "@/hooks/useCalls";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, KawaiiButton } from "@imuchat/ui-kit/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function OutgoingCallScreen() {
  const router = useRouter();
  const colors = useColors();
  const spacing = useSpacing();

  // Récupérer les paramètres de l'appel depuis la route
  const params = useLocalSearchParams<{
    callId: string;
    calleeId: string;
    calleeName: string;
    calleeAvatar?: string;
    callType: "audio" | "video";
  }>();

  const { call, leaveCall } = useCalls();
  const [canceling, setCanceling] = useState(false);

  // Animation de pulsation pour l'avatar
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Animation de pulsation continue
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  // Annuler l'appel
  const handleCancel = useCallback(async () => {
    if (canceling) return;

    setCanceling(true);
    try {
      // Quitter l'appel
      await leaveCall();

      // Retourner à l'écran précédent
      router.back();
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'appel:", error);
      router.back();
    } finally {
      setCanceling(false);
    }
  }, [leaveCall, canceling, router]);

  // Rediriger vers l'écran actif si l'appel est accepté
  useEffect(() => {
    if (call?.state?.callingState === "joined") {
      router.replace({
        pathname: "/call/active",
        params: {
          callId: params.callId,
          callType: params.callType,
        },
      });
    }
  }, [call?.state?.callingState, params.callId, params.callType, router]);

  // Déterminer le texte selon le type d'appel
  const callTypeText =
    params.callType === "video"
      ? "Appel vidéo en cours..."
      : "Appel audio en cours...";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Status bar */}
      <StatusBar barStyle="light-content" />

      {/* Info destinataire */}
      <View style={styles.callerInfo}>
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Avatar
            src={params.calleeAvatar}
            alt={params.calleeName}
            size="xl"
            style={styles.avatar}
          />
        </Animated.View>

        <Text style={[styles.callerName, { color: colors.text }]}>
          {params.calleeName}
        </Text>

        <Text style={[styles.callType, { color: colors.textMuted }]}>
          {callTypeText}
        </Text>
      </View>

      {/* Message d'appel */}
      <View style={styles.messageContainer}>
        <View style={styles.callMessageContainer}>
          <Ionicons
            name={params.callType === "video" ? "videocam" : "call"}
            size={32}
            color={colors.text}
            style={styles.callIcon}
          />
          <Text style={[styles.callMessage, { color: colors.text }]}>
            Connexion en cours...
          </Text>
        </View>
      </View>

      {/* Bouton annuler */}
      <View style={[styles.buttonsContainer, { paddingBottom: spacing.xl }]}>
        <KawaiiButton
          variant="secondary"
          size="lg"
          onPress={handleCancel}
          disabled={canceling}
          loading={canceling}
          style={styles.cancelButton}
        >
          <Text style={styles.buttonText}>Annuler</Text>
        </KawaiiButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight || 30,
  },
  callerInfo: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  avatar: {
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  callerName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  callType: {
    fontSize: 18,
    marginBottom: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  callMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  callIcon: {
    marginRight: 8,
  },
  callMessage: {
    fontSize: 20,
    textAlign: "center",
  },
  buttonsContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#EF4444",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
