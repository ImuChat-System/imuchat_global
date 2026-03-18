/**
 * components/imufeed/VideoCard.tsx — S21 · Carte vidéo inline chat
 *
 * Affiche un aperçu compact d'une vidéo ImuFeed partagée dans le chat :
 * thumbnail, caption, auteur, compteurs, lien « Voir sur ImuFeed ».
 */

import { useI18n } from "@/providers/I18nProvider";
import type { VideoCardData } from "@/types/video-sharing";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface VideoCardProps {
  data: VideoCardData;
  onOpen?: (videoId: string) => void;
  onPreview?: (videoId: string) => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoCard({ data, onOpen, onPreview }: VideoCardProps) {
  const { t } = useI18n();

  return (
    <View testID="video-card" style={styles.container}>
      {/* Thumbnail + durée */}
      <Pressable
        testID="video-card-thumbnail"
        style={styles.thumbnailWrapper}
        onPress={() => onPreview?.(data.videoId)}
      >
        <Image
          source={{ uri: data.thumbnailUrl ?? undefined }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {data.durationMs > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(data.durationMs)}
            </Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <Ionicons
            name="play-circle"
            size={36}
            color="rgba(255,255,255,0.85)"
          />
        </View>
      </Pressable>

      {/* Infos */}
      <View style={styles.info}>
        {/* Auteur */}
        <View testID="video-card-author" style={styles.authorRow}>
          {data.author.avatarUrl ? (
            <Image
              source={{ uri: data.author.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
          <Text style={styles.authorName} numberOfLines={1}>
            {data.author.displayName || data.author.username}
          </Text>
        </View>

        {/* Caption */}
        {data.caption ? (
          <Text
            testID="video-card-caption"
            style={styles.caption}
            numberOfLines={2}
          >
            {data.caption}
          </Text>
        ) : null}

        {/* Compteurs */}
        <View style={styles.counters}>
          <View style={styles.counter}>
            <Ionicons name="eye-outline" size={14} color="#888" />
            <Text style={styles.counterText}>
              {formatCount(data.viewsCount)}
            </Text>
          </View>
          <View style={styles.counter}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            <Text style={styles.counterText}>
              {formatCount(data.likesCount)}
            </Text>
          </View>
          <View style={styles.counter}>
            <Ionicons name="chatbubble-outline" size={14} color="#888" />
            <Text style={styles.counterText}>
              {formatCount(data.commentsCount)}
            </Text>
          </View>
        </View>

        {/* Bouton ouvrir */}
        <Pressable
          testID="video-card-open-button"
          style={styles.openButton}
          onPress={() => onOpen?.(data.videoId)}
        >
          <Ionicons name="play" size={14} color="#fff" />
          <Text style={styles.openButtonText}>
            {t("videoSharing.openOnImuFeed", {
              defaultValue: "Voir sur ImuFeed",
            })}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    overflow: "hidden",
    width: 260,
  },
  thumbnailWrapper: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
  },
  avatarPlaceholder: {
    backgroundColor: "#444",
  },
  authorName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  caption: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 6,
  },
  counters: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  counterText: {
    color: "#888",
    fontSize: 11,
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#6C63FF",
    borderRadius: 8,
    paddingVertical: 7,
  },
  openButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
