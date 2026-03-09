/**
 * app/imufeed/editor.tsx — Écran éditeur vidéo basique
 *
 * Reçoit l'URI vidéo via route params, affiche VideoEditor,
 * renvoie le résultat (trim + volumes) à l'écran create.
 *
 * Sprint S4 Axe B — Éditeur Basique
 */

import VideoEditor, {
  type EditorResult,
} from "@/components/imufeed/VideoEditor";
import { useColors } from "@/providers/ThemeProvider";
import type { VideoPickResult } from "@/services/imufeed/video-upload";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditorScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    uri: string;
    width: string;
    height: string;
    duration: string;
    fileSize: string;
    mimeType: string;
  }>();

  const video: VideoPickResult | null = useMemo(() => {
    if (!params.uri) return null;
    return {
      uri: params.uri,
      width: Number(params.width) || 1080,
      height: Number(params.height) || 1920,
      duration: Number(params.duration) || 0,
      fileSize: Number(params.fileSize) || 0,
      mimeType: params.mimeType || "video/mp4",
    };
  }, [params]);

  const handleDone = useCallback(
    (result: EditorResult) => {
      // Navigate back to create screen with edited params
      router.back();
      // The create screen should pick up the edited result via global state or params
      // For now we store the trim info in a simple way — the create screen
      // will re-read the same video URI with the trim metadata
      router.setParams({
        trimStart: String(result.trimRange.startMs),
        trimEnd: String(result.trimRange.endMs),
        videoVolume: String(result.videoVolume),
        musicVolume: String(result.musicVolume),
      });
    },
    [router],
  );

  const handleCancel = useCallback(() => {
    Alert.alert(
      "Annuler les modifications ?",
      "Les changements seront perdus.",
      [
        { text: "Continuer", style: "cancel" },
        { text: "Annuler", style: "destructive", onPress: () => router.back() },
      ],
    );
  }, [router]);

  if (!video) {
    router.back();
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <VideoEditor video={video} onDone={handleDone} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
