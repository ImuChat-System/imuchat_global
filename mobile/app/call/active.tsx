import { useColors } from "@/providers/ThemeProvider";
import { endCall } from "@/services/call-signaling";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// Lazy load Stream Video components to avoid crash in Expo Go
let StreamVideoComponents: {
  StreamCall: any;
  CallContent: any;
  joinStreamCall: (callId: string, callType: "audio" | "video") => Promise<any>;
} | null = null;

let streamLoadError: Error | null = null;

// Try to load Stream Video SDK dynamically
async function loadStreamVideo() {
  if (StreamVideoComponents) return StreamVideoComponents;
  if (streamLoadError) throw streamLoadError;

  try {
    const [sdk, streamService] = await Promise.all([
      import("@stream-io/video-react-native-sdk"),
      import("@/services/stream-video"),
    ]);

    StreamVideoComponents = {
      StreamCall: sdk.StreamCall,
      CallContent: sdk.CallContent,
      joinStreamCall: streamService.joinStreamCall,
    };
    return StreamVideoComponents;
  } catch (error) {
    streamLoadError = error as Error;
    throw error;
  }
}

export default function ActiveCallScreen() {
  const { callId, callEventId, callType } = useLocalSearchParams<{
    callId: string;
    callEventId: string;
    callType: "audio" | "video";
  }>();
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streamReady, setStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colors = useColors();
  const router = useRouter();

  useEffect(() => {
    if (!callId || !callType) return;

    initializeCall();

    return () => {
      // Cleanup on unmount
      if (call) {
        call.leave();
      }
    };
  }, [callId, callType]);

  async function initializeCall() {
    try {
      // First, try to load Stream Video SDK
      const components = await loadStreamVideo();
      if (!components) {
        throw new Error("Stream Video SDK not available");
      }
      setStreamReady(true);

      const streamCall = await components.joinStreamCall(callId!, callType!);
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
      if (call) {
        await call.leave();
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

  if (!call || !streamReady || !StreamVideoComponents) {
    return null;
  }

  const { StreamCall, CallContent } = StreamVideoComponents;

  return (
    <StreamCall call={call}>
      <View style={styles.container}>
        <CallContent onHangupCallHandler={handleEndCall} />
      </View>
    </StreamCall>
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
