/**
 * MusicWidgetContent — Contenu widget Musique en cours (2×1)
 * Affiche le titre et l'artiste de la track en cours de lecture
 *
 * Sprint S7 Axe A — Widgets Core
 */

import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: Record<string, unknown>;
}

export default function MusicWidgetContent({ data }: Props) {
  const colors = useColors();
  const nowPlaying = data.nowPlaying as {
    title?: string;
    artist?: string;
    isPlaying?: boolean;
  } | null;

  if (!nowPlaying) {
    return (
      <View style={styles.container} testID="widget-music-content">
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          Aucune lecture en cours
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="widget-music-content">
      <View style={styles.row}>
        <Ionicons
          name={nowPlaying.isPlaying ? "pause-circle" : "play-circle"}
          size={28}
          color={colors.primary}
        />
        <View style={styles.textCol}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {nowPlaying.title ?? "Titre inconnu"}
          </Text>
          <Text
            style={[styles.artist, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {nowPlaying.artist ?? "Artiste inconnu"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  artist: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
});
