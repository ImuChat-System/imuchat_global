/**
 * WatchPartyQueue — File d'attente collaborative de vidéos
 * Sprint S22 — Watch Party & Social Cross-Post
 *
 * Affiche la queue de vidéos, permet d'ajouter/voter/supprimer.
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWatchPartySocialStore } from "@/stores/watch-party-social-store";
import type { QueueItem } from "@/types/watch-party-social";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WatchPartyQueueProps {
  partyId: string;
  onPlayVideo?: (videoId: string) => void;
}

export default function WatchPartyQueue({
  partyId,
  onPlayVideo,
}: WatchPartyQueueProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { queue, isLoadingQueue, voteQueueItem, removeFromQueue } =
    useWatchPartySocialStore();

  const handleVote = useCallback(
    (itemId: string) => voteQueueItem(itemId),
    [voteQueueItem],
  );

  const handleRemove = useCallback(
    (itemId: string) => removeFromQueue(itemId),
    [removeFromQueue],
  );

  const handlePlay = useCallback(
    (videoId: string) => onPlayVideo?.(videoId),
    [onPlayVideo],
  );

  const renderItem = useCallback(
    ({ item }: { item: QueueItem }) => (
      <View
        testID={`queue-item-${item.id}`}
        style={[styles.row, { backgroundColor: colors.card }]}
      >
        {/* Thumbnail */}
        <TouchableOpacity
          testID={`queue-play-${item.id}`}
          onPress={() => handlePlay(item.video.id)}
          style={styles.thumbWrapper}
        >
          <Image
            source={{ uri: item.video.thumbnail_url ?? undefined }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Info */}
        <View style={[styles.info, { marginLeft: spacing.sm }]}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.video.caption ?? item.video.id}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Ajouté par {item.addedByUsername}
          </Text>
        </View>

        {/* Vote button */}
        <TouchableOpacity
          testID={`queue-vote-${item.id}`}
          onPress={() => handleVote(item.id)}
          style={[styles.voteBtn, item.hasVoted && { opacity: 0.5 }]}
          disabled={item.hasVoted}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={item.hasVoted ? colors.textSecondary : colors.primary}
          />
          <Text style={[styles.voteCount, { color: colors.text }]}>
            {item.upvotes}
          </Text>
        </TouchableOpacity>

        {/* Remove */}
        <TouchableOpacity
          testID={`queue-remove-${item.id}`}
          onPress={() => handleRemove(item.id)}
          style={styles.removeBtn}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    ),
    [colors, spacing, handleVote, handleRemove, handlePlay],
  );

  if (isLoadingQueue) {
    return (
      <View testID="queue-loading" style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View testID="watch-party-queue" style={styles.container}>
      <Text
        style={[
          styles.header,
          { color: colors.text, marginBottom: spacing.sm },
        ]}
      >
        File d'attente ({queue.length})
      </Text>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            testID="queue-empty"
            style={[styles.empty, { color: colors.textSecondary }]}
          >
            Aucune vidéo dans la file
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: { fontSize: 16, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  thumbWrapper: {
    position: "relative",
    width: 64,
    height: 40,
    borderRadius: 6,
    overflow: "hidden",
  },
  thumb: { width: 64, height: 40 },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: "600" },
  sub: { fontSize: 11, marginTop: 2 },
  voteBtn: { alignItems: "center", paddingHorizontal: 8 },
  voteCount: { fontSize: 11, marginTop: 2 },
  removeBtn: { paddingLeft: 6 },
  empty: { textAlign: "center", paddingVertical: 20, fontSize: 13 },
});
