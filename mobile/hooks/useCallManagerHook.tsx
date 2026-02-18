import IncomingCallModal from "@/components/IncomingCallModal";
import {
  acceptCall,
  CallEvent,
  rejectCall,
  subscribeToIncomingCalls,
} from "@/services/call-signaling";
import { safeInitializeStreamVideo } from "@/services/stream-video-safe";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export function useCallManager() {
  const [incomingCall, setIncomingCall] = useState<CallEvent | null>(null);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [streamAvailable, setStreamAvailable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize Stream Video client safely (won't crash in Expo Go)
    safeInitializeStreamVideo()
      .then((client) => {
        if (client) {
          setStreamAvailable(true);
          console.log("[CallManager] Stream Video initialized successfully");
        } else {
          console.warn(
            "[CallManager] Stream Video not available - calls disabled",
          );
        }
      })
      .catch((error) => {
        console.error("Error initializing Stream Video:", error);
      });

    // Subscribe to incoming calls
    let unsubscribeRef: (() => void) | null = null;

    subscribeToIncomingCalls((call) => {
      setIncomingCall(call);
      setShowIncomingCallModal(true);
    }).then((unsub) => {
      unsubscribeRef = unsub;
    });

    return () => {
      unsubscribeRef?.();
    };
  }, []);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Accept the call in Supabase
      await acceptCall(incomingCall.id);

      // Navigate to active call screen
      router.push({
        pathname: "/call/active" as Href,
        params: {
          callId: incomingCall.stream_call_id!,
          callEventId: incomingCall.id,
          callType: incomingCall.call_type,
        },
      } as any);

      // Close modal
      setShowIncomingCallModal(false);
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
      setShowIncomingCallModal(false);
      setIncomingCall(null);
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;

    try {
      await rejectCall(incomingCall.id);
    } catch (error) {
      console.error("Error rejecting call:", error);
    } finally {
      setShowIncomingCallModal(false);
      setIncomingCall(null);
    }
  };

  const CallModalComponent = () => (
    <IncomingCallModal
      visible={showIncomingCallModal}
      call={incomingCall}
      onAccept={handleAcceptCall}
      onReject={handleRejectCall}
    />
  );

  return {
    incomingCall,
    showIncomingCallModal,
    handleAcceptCall,
    handleRejectCall,
    IncomingCallModal: CallModalComponent,
  };
}
