/**
 * app/imufeed/live/replays.tsx — Page des replays
 *
 * Affiche les lives passés du créateur avec replay disponible.
 * Permet de visionner ou supprimer un replay.
 *
 * Sprint S17 — Co-host, Replay, Modération, Sondages
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { LiveStreamingService } from "@/services/imufeed/live-api";
import type { LiveReplay } from "@/types/live-streaming";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────

const liveService = new LiveStreamingService();

// ─── Helpers ──────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Category icons ───────────────────────────────────────────

const CATEGORY_ICONS: Record<
  string,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  gaming: "game-controller",
  music: "musical-notes",
  art: "color-palette",
  education: "school",
  chat: "chatbubbles",
  cooking: "restaurant",
  tech: "hardware-chip",
  fitness: "fitness",
  other: "ellipsis-horizontal",
};

// ─── Replay Card ──────────────────────────────────────────────

interface ReplayCardProps {
  replay: LiveReplay;
  colors: ReturnType<typeof useColors>;
  t: (key: string, opts?: Record<string, unknown>) => string;
  onWatch: () => void;
  onDelete: () => void;
}

const ReplayCard = React.memo(function ReplayCard({
  replay,
  colors,
  t,
  onWatch,
  onDelete,
}: ReplayCardProps) {
  return (
    <View
      testID={`replay-card-${replay.id}`}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      {/* Thumbnail placeholder */}
      <TouchableOpacity
        testID={`replay-watch-${replay.id}`}
        style={styles.thumbnail}
        onPress={onWatch}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailInner}>
          <Ionicons
            name={CATEGORY_ICONS[replay.category] || "play-circle"}
            size={32}
            color="rgba(255,255,255,0.5)"
          />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(replay.duration)}
            </Text>
          </View>
        </View>
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={36} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {replay.title}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="eye" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatViewCount(replay.viewCount)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="trending-up"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {t("live.replay.peak", { defaultValue: "Pic" })}:{" "}
              {formatViewCount(replay.peakViewerCount)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="heart" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatViewCount(replay.likeCount)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(replay.createdAt)}
          </Text>
          <TouchableOpacity
            testID={`replay-delete-${replay.id}`}
            style={styles.deleteButton}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────

export default function ReplaysScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();

  const [replays, setReplays] = useState<LiveReplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadReplays = useCallback(async () => {
    const { data, error } = await liveService.getReplaysByHost("current-user");
    if (data) setReplays(data);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadReplays();
  }, [loadReplays]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadReplays();
  }, [loadReplays]);

  const handleWatch = useCallback(
    (replay: LiveReplay) => {
      // Navigate to a replay viewer (reuse live/[id] screen)
      router.push(`/imufeed/live/${replay.liveId}` as any);
    },
    [router],
  );

  const handleDelete = useCallback(
    (replay: LiveReplay) => {
      Alert.alert(
        t("live.replay.deleteTitle", { defaultValue: "Supprimer le replay ?" }),
        t("live.replay.deleteMessage", {
          defaultValue: "Cette action est irréversible.",
        }),
        [
          {
            text: t("common.cancel", { defaultValue: "Annuler" }),
            style: "cancel",
          },
          {
            text: t("live.replay.delete", { defaultValue: "Supprimer" }),
            style: "destructive",
            onPress: async () => {
              await liveService.deleteReplay(replay.liveId);
              setReplays((prev) => prev.filter((r) => r.id !== replay.id));
            },
          },
        ],
      );
    },
    [t],
  );

  const renderItem = useCallback(
    ({ item }: { item: LiveReplay }) => (
      <ReplayCard
        replay={item}
        colors={colors}
        t={t}
        onWatch={() => handleWatch(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [colors, t, handleWatch, handleDelete],
  );

  const keyExtractor = useCallback((item: LiveReplay) => item.id, []);

  return (
    <SafeAreaView
      testID="replays-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="replays-back" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("live.replay.title", { defaultValue: "Mes replays" })}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View testID="replays-loading" style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : replays.length === 0 ? (
        <View testID="replays-empty" style={styles.emptyContainer}>
          <Ionicons
            name="videocam-off-outline"
            size={56}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t("live.replay.emptyTitle", { defaultValue: "Aucun replay" })}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("live.replay.emptyDesc", {
              defaultValue:
                "Active l'enregistrement dans les paramètres de ton live pour créer des replays automatiquement.",
            })}
          </Text>
        </View>
      ) : (
        <FlatList
          testID="replays-list"
          data={replays}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
  },
  thumbnail: {
    height: 160,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: -50,
    right: -50,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardInfo: {
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
