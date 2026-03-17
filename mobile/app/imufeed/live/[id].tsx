/**
 * app/imufeed/live/[id].tsx — Viewer / Host Live Screen
 *
 * Écran principal d'un live stream : flux vidéo, chat overlay,
 * réactions flottantes, alertes donation, compteur viewers.
 * Sert à la fois au host et au viewer.
 *
 * Sprint S16 — Live UI Streamer & Viewer
 */

import LiveChat from "@/components/imufeed/LiveChat";
import LiveDonationAlert from "@/components/imufeed/LiveDonationAlert";
import LiveReactions, {
  ReactionButtons,
} from "@/components/imufeed/LiveReactions";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { LiveStreamingService } from "@/services/imufeed/live-api";
import { useLiveStreamingStore } from "@/stores/live-streaming-store";
import type { LiveReactionType } from "@/types/live-streaming";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Service ──────────────────────────────────────────────────

const liveService = new LiveStreamingService();

// ─── Screen ───────────────────────────────────────────────────

export default function LiveViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();

  // Store
  const currentLive = useLiveStreamingStore((s) => s.currentLive);
  const chatMessages = useLiveStreamingStore((s) => s.chatMessages);
  const pinnedMessage = useLiveStreamingStore((s) => s.pinnedMessage);
  const viewerCount = useLiveStreamingStore((s) => s.viewerCount);
  const isHosting = useLiveStreamingStore((s) => s.isHosting);
  const connectionStatus = useLiveStreamingStore((s) => s.connectionStatus);
  const reactionQueue = useLiveStreamingStore((s) => s.reactionQueue);
  const donationQueue = useLiveStreamingStore((s) => s.donationQueue);
  const setCurrentLive = useLiveStreamingStore((s) => s.setCurrentLive);
  const addChatMessage = useLiveStreamingStore((s) => s.addChatMessage);
  const pinMessage = useLiveStreamingStore((s) => s.pinMessage);
  const unpinMessage = useLiveStreamingStore((s) => s.unpinMessage);
  const updateViewerCount = useLiveStreamingStore((s) => s.updateViewerCount);
  const addReaction = useLiveStreamingStore((s) => s.addReaction);
  const removeReaction = useLiveStreamingStore((s) => s.removeReaction);
  const addDonation = useLiveStreamingStore((s) => s.addDonation);
  const shiftDonation = useLiveStreamingStore((s) => s.shiftDonation);
  const setConnectionStatus = useLiveStreamingStore(
    (s) => s.setConnectionStatus,
  );
  const reset = useLiveStreamingStore((s) => s.reset);

  // Local state
  const [isLoadingLive, setIsLoadingLive] = useState(!currentLive);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const unsubChatRef = useRef<(() => void) | null>(null);
  const unsubReactionsRef = useRef<(() => void) | null>(null);

  // ─── Load Live Data ──────────────────────────────

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadLive() {
      if (currentLive?.id === id) {
        setIsLoadingLive(false);
        return;
      }
      setIsLoadingLive(true);
      const { data, error } = await liveService.getLive(id);
      if (cancelled) return;
      if (data) {
        setCurrentLive(data);
        updateViewerCount(data.viewerCount);
      }
      setIsLoadingLive(false);
    }

    loadLive();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ─── Subscribe to Realtime ───────────────────────

  useEffect(() => {
    if (!id) return;
    setConnectionStatus("connecting");

    // Chat subscription
    unsubChatRef.current = liveService.subscribeToChatChannel(id, (msg) =>
      addChatMessage(msg),
    );

    // Reactions subscription
    unsubReactionsRef.current = liveService.subscribeToReactions(
      id,
      (reaction) => addReaction(reaction),
    );

    setConnectionStatus("connected");

    return () => {
      unsubChatRef.current?.();
      unsubReactionsRef.current?.();
      setConnectionStatus("disconnected");
    };
  }, [id]);

  // ─── Handlers ────────────────────────────────────

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!id) return;
      await liveService.sendChatMessage(id, content);
    },
    [id],
  );

  const handlePinMessage = useCallback(
    (messageId: string) => {
      if (!messageId) {
        unpinMessage();
      } else {
        pinMessage(messageId);
      }
    },
    [pinMessage, unpinMessage],
  );

  const handleSendReaction = useCallback(
    async (type: LiveReactionType) => {
      if (!id) return;
      await liveService.sendReaction(id, type);
    },
    [id],
  );

  const handleReactionComplete = useCallback(
    (reactionId: string) => {
      removeReaction(reactionId);
    },
    [removeReaction],
  );

  const handleDonationComplete = useCallback(() => {
    shiftDonation();
  }, [shiftDonation]);

  const handleEndLive = useCallback(async () => {
    if (!id) return;
    Alert.alert(
      t("live.endTitle", { defaultValue: "Terminer le live ?" }),
      t("live.endMessage", {
        defaultValue:
          "Ton live sera terminé et tes viewers seront déconnectés.",
      }),
      [
        {
          text: t("common.cancel", { defaultValue: "Annuler" }),
          style: "cancel",
        },
        {
          text: t("live.endConfirm", { defaultValue: "Terminer" }),
          style: "destructive",
          onPress: async () => {
            await liveService.endLive(id);
            reset();
            router.back();
          },
        },
      ],
    );
  }, [id, reset, router]);

  const handleLeaveLive = useCallback(() => {
    reset();
    router.back();
  }, [reset, router]);

  // ─── Loading State ───────────────────────────────

  if (isLoadingLive) {
    return (
      <View testID="live-loading" style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>
          {t("live.connecting", { defaultValue: "Connexion au live..." })}
        </Text>
      </View>
    );
  }

  // ─── UI ──────────────────────────────────────────

  const currentDonation = donationQueue.length > 0 ? donationQueue[0] : null;
  const chatEnabled = currentLive?.settings?.chatEnabled ?? true;

  return (
    <View testID="live-viewer-screen" style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Video placeholder (Stream SDK would render here) */}
      <View testID="video-container" style={styles.videoContainer}>
        <Text style={styles.videoPlaceholder}>
          {currentLive?.title || "Live"}
        </Text>
      </View>

      {/* Top bar overlay */}
      <View testID="top-bar" style={styles.topBar}>
        {/* Host info */}
        <View style={styles.hostInfo}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <Text style={styles.hostName} numberOfLines={1}>
            {currentLive?.hostName || ""}
          </Text>
        </View>

        {/* Viewer count */}
        <View testID="viewer-count" style={styles.viewerCount}>
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.viewerCountText}>{viewerCount}</Text>
        </View>

        {/* Close / End button */}
        {isHosting ? (
          <TouchableOpacity
            testID="end-live-button"
            style={styles.endButton}
            onPress={handleEndLive}
          >
            <Text style={styles.endButtonText}>
              {t("live.end", { defaultValue: "Terminer" })}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity testID="leave-button" onPress={handleLeaveLive}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Connection status indicator */}
      {connectionStatus !== "connected" && (
        <View testID="connection-status" style={styles.connectionBanner}>
          <Text style={styles.connectionText}>
            {connectionStatus === "connecting"
              ? t("live.connecting", { defaultValue: "Connexion..." })
              : t("live.disconnected", { defaultValue: "Déconnecté" })}
          </Text>
        </View>
      )}

      {/* Floating reactions */}
      <LiveReactions
        reactions={reactionQueue}
        onReactionComplete={handleReactionComplete}
      />

      {/* Donation alert */}
      <LiveDonationAlert
        donation={currentDonation}
        onComplete={handleDonationComplete}
      />

      {/* Chat overlay */}
      <LiveChat
        messages={chatMessages}
        pinnedMessage={pinnedMessage}
        onSendMessage={handleSendMessage}
        onPinMessage={isHosting ? handlePinMessage : undefined}
        isHost={isHosting}
        chatEnabled={chatEnabled}
      />

      {/* Reaction buttons bar (bottom right) */}
      {!isHosting && (
        <View style={styles.reactionBarContainer}>
          <ReactionButtons onReaction={handleSendReaction} />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  videoPlaceholder: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 20,
    fontWeight: "600",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  liveBadge: {
    backgroundColor: "#FF0000",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  hostName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    maxWidth: 120,
  },
  viewerCount: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  viewerCountText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  endButton: {
    backgroundColor: "#FF0000",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  endButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  connectionBanner: {
    backgroundColor: "rgba(255,150,0,0.9)",
    alignItems: "center",
    paddingVertical: 4,
  },
  connectionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  reactionBarContainer: {
    position: "absolute",
    bottom: 20,
    right: 12,
  },
});
