import { useAuth } from "@/hooks/useAuth";
import { useColors } from "@/providers/ThemeProvider";
import { endCall } from "@/services/call-signaling";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// Types for dynamically loaded SDK components
interface StreamSDKComponents {
  StreamVideo: any;
  StreamCall: any;
  CallContent: any;
}

export default function ActiveCallScreen() {
  const { callId, callEventId, callType } = useLocalSearchParams<{
    callId: string;
    callEventId: string;
    callType: "audio" | "video";
  }>();
  const { user } = useAuth();
  const [call, setCall] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [sdkComponents, setSdkComponents] =
    useState<StreamSDKComponents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useColors();
  const router = useRouter();
  const callRef = useRef<any>(null);

  useEffect(() => {
    if (!callId || !callType || !user) return;

    initializeCall();

    return () => {
      // Cleanup on unmount
      if (callRef.current) {
        callRef.current.leave().catch(console.error);
      }
    };
  }, [callId, callType, user]);

  async function initializeCall() {
    try {
      // Dynamic imports for Expo Go safety
      const [sdk, callsModule, tokenModule] = await Promise.all([
        import("@stream-io/video-react-native-sdk"),
        import("@/services/calls"),
        import("@/services/stream-token"),
      ]);

      setSdkComponents({
        StreamVideo: sdk.StreamVideo,
        StreamCall: sdk.StreamCall,
        CallContent: sdk.CallContent,
      });

      // Get existing client or create new one with real backend token
      let streamClient = callsModule.getStreamClient();
      if (!streamClient && user) {
        const userName =
          user.user_metadata?.display_name || user.email || "Utilisateur";
        const userImage = user.user_metadata?.avatar_url;

        const tokenData = await tokenModule.generateStreamToken({
          userId: user.id,
          userName,
          userImage,
        });

        streamClient = await callsModule.initializeStreamClient(
          { id: user.id, name: userName, image: userImage },
          tokenData.token,
        );
      }

      if (!streamClient) {
        throw new Error("Impossible d'initialiser le client Stream");
      }

      setClient(streamClient);

      // Join the call
      const streamCallType = callType === "video" ? "default" : "audio";
      const streamCall = streamClient.call(streamCallType, callId);
      await streamCall.join({ create: true });

      callRef.current = streamCall;
      setCall(streamCall);
    } catch (error: any) {
      console.error("Error joining call:", error);
      if (error.message?.includes("native module")) {
        setError(
          "Les appels vidéo nécessitent un build de développement. Expo Go n'est pas supporté.",
        );
      } else {
        setError("Impossible de rejoindre l'appel");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEndCall() {
    try {
      if (callRef.current) {
        await callRef.current.leave();
        callRef.current = null;
      }

      if (callEventId) {
        await endCall(callEventId);
      }

      router.back();
    } catch (error) {
      console.error("Error ending call:", error);
      router.back();
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Connexion à l'appel...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <Text
          style={[styles.backButton, { color: colors.primary }]}
          onPress={() => router.back()}
        >
          Retour
        </Text>
      </View>
    );
  }

  if (!call || !client || !sdkComponents) {
    return null;
  }

  const { StreamVideo, StreamCall, CallContent } = sdkComponents;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <View style={styles.container}>
          <CallContent onHangupCallHandler={handleEndCall} />
        </View>
      </StreamCall>
    </StreamVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    padding: 12,
  },
});
