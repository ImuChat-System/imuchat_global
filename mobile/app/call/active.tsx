import { useColors } from "@/providers/ThemeProvider";
import { endCall } from "@/services/call-signaling";
import { joinStreamCall } from "@/services/stream-video";
import {
  Call,
  CallContent,
  StreamCall,
} from "@stream-io/video-react-native-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function ActiveCallScreen() {
  const { callId, callEventId, callType } = useLocalSearchParams<{
    callId: string;
    callEventId: string;
    callType: "audio" | "video";
  }>();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
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
      const streamCall = await joinStreamCall(callId!, callType!);
      setCall(streamCall);
    } catch (error) {
      console.error("Error joining call:", error);
      router.back();
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
      </View>
    );
  }

  if (!call) {
    return null;
  }

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
  },
});
