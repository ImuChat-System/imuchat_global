/**
 * WatchPartyCard — Carte Watch Party avec badge LIVE et bouton Rejoindre
 *
 * Affiche les informations d'une Watch Party active :
 * hôte, titre, spectateurs, miniature, badge LIVE si en direct.
 *
 * Sprint S12 Axe A — Watch enrichi
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { WatchParty } from "@/types/watch";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LiveBadge from "./LiveBadge";

interface WatchPartyCardProps {
  party: WatchParty;
  onJoin: (partyId: string) => void;
  onPress?: (partyId: string) => void;
}

export default function WatchPartyCard({
  party,
  onJoin,
  onPress,
}: WatchPartyCardProps) {
  const colors = useColors();
  const spacing = useSpacing();

  const handleJoin = useCallback(() => {
    onJoin(party.id);
  }, [onJoin, party.id]);

  const handlePress = useCallback(() => {
    onPress?.(party.id);
  }, [onPress, party.id]);

  const isLive = party.status === "live";

  return (
    <TouchableOpacity
      testID={`watch-party-card-${party.id}`}
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {party.video?.thumbnail_url ? (
          <Image
            source={{ uri: party.video.thumbnail_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.thumbnail, styles.placeholderThumbnail]}
          >
            <Ionicons name="videocam" size={32} color={colors.textSecondary} />
          </View>
        )}

        {/* LIVE badge overlay */}
        {isLive && (
          <View style={styles.liveBadgeOverlay}>
            <LiveBadge size="sm" />
          </View>
        )}

        {/* Viewer count overlay */}
        <View style={styles.viewerOverlay}>
          <Ionicons name="eye" size={12} color="#fff" />
          <Text style={styles.viewerCount}>{party.viewer_count}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={[styles.info, { padding: spacing.sm }]}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
        >
          {party.title}
        </Text>

        <Text
          style={[styles.host, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          Hébergé par {party.host_username}
        </Text>

        <View style={styles.footer}>
          <View style={styles.attendeeRow}>
            <Ionicons name="people" size={14} color={colors.textSecondary} />
            <Text style={[styles.attendeeCount, { color: colors.textSecondary }]}>
              {party.attendee_count}
            </Text>
          </View>

          {isLive ? (
            <TouchableOpacity
              testID={`join-party-${party.id}`}
              style={[styles.joinButton, { backgroundColor: colors.primary }]}
              onPress={handleJoin}
            >
              <Text style={styles.joinText}>Rejoindre</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.scheduledText, { color: colors.textSecondary }]}>
              Programmée
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    width: 240,
    marginRight: 12,
  },
  thumbnailContainer: {
    position: "relative",
    height: 135,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  placeholderThumbnail: {
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadgeOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  viewerOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  viewerCount: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  info: {
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  host: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attendeeCount: {
    fontSize: 12,
  },
  joinButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  joinText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  scheduledText: {
    fontSize: 11,
    fontStyle: "italic",
  },
});
