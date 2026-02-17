/**
 * Écran d'appel entrant
 * Affiche l'écran fullscreen lorsqu'un appel arrive
 * Utilise les composants UI-Kit pour un design cohérent
 */

import { useCalls } from "@/hooks/useCalls";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, KawaiiButton } from "@imuchat/ui-kit/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";

export default function IncomingCallScreen() {
  const router = useRouter();
  const colors = useColors();
  const spacing = useSpacing();

  // Récupérer les paramètres de l'appel depuis la route
  const params = useLocalSearchParams<{
    callId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    callType: "audio" | "video";
  }>();

  const { joinCall, leaveCall, isConnecting } = useCalls();
  const [rejecting, setRejecting] = useState(false);

  // Accepter l'appel
  const handleAccept = useCallback(async () => {
    if (!params.callId || isConnecting) return;

    try {
      await joinCall(params.callId, {
        videoEnabled: params.callType === "video",
        audioEnabled: true,
      });

      // Naviguer vers l'écran d'appel actif
      router.replace({
        pathname: "/call/active",
        params: {
          callId: params.callId,
          callType: params.callType,
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'appel:", error);
      router.back();
    }
  }, [params.callId, params.callType, joinCall, isConnecting, router]);

  // Refuser l'appel
  const handleReject = useCallback(async () => {
    if (rejecting) return;

    setRejecting(true);
    try {
      // Quitter l'appel (refuser)
      await leaveCall();

      // Retourner à l'écran précédent
      router.back();
    } catch (error) {
      console.error("Erreur lors du refus de l'appel:", error);
      router.back();
    } finally {
      setRejecting(false);
    }
  }, [leaveCall, rejecting, router]);

  // Déterminer le texte selon le type d'appel
  const callTypeText =
    params.callType === "video" ? "Appel vidéo" : "Appel audio";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Info appelant */}
      <View style={styles.callerInfo}>
        <View style={styles.avatarContainer}>
          <Avatar
            src={params.callerAvatar}
            alt={params.callerName || "Inconnu"}
            size="xl"
            style={styles.avatar}
          />
        </View>

        <Text style={[styles.callerName, { color: colors.text }]}>
          {params.callerName || "Inconnu"}
        </Text>

        <Text style={[styles.callType, { color: colors.textMuted }]}>
          {callTypeText} entrant...
        </Text>
      </View>

      {/* Message d'appel */}
      <View style={styles.messageContainer}>
        <View style={styles.callMessageContainer}>
          <Ionicons
            name="call-outline"
            size={32}
            color={colors.text}
            style={styles.callIcon}
          />
          <Text style={[styles.callMessage, { color: colors.text }]}>
            Un appel arrive !
          </Text>
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={[styles.actions, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.buttonRow}>
          {/* Bouton Refuser */}
          <KawaiiButton
            variant="secondary"
            size="lg"
            onPress={handleReject}
            disabled={rejecting || isConnecting}
            loading={rejecting}
            style={styles.rejectButton}
          >
            <Text style={styles.buttonText}>Refuser</Text>
          </KawaiiButton>

          {/* Bouton Accepter */}
          <KawaiiButton
            variant="primary"
            size="lg"
            onPress={handleAccept}
            disabled={rejecting || isConnecting}
            loading={isConnecting}
            style={styles.acceptButton}
          >
            <Text style={styles.buttonText}>Accepter</Text>
          </KawaiiButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight || 40,
  },
  callerInfo: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  callType: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: "center",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
  },
  callMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  callIcon: {
    marginRight: 8,
  },
  callMessage: {
    fontSize: 24,
    textAlign: "center",
  },
  actions: {
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  rejectButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#f87171",
  },
  acceptButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#34d399",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
