/**
 * Comments Modal Screen — /imufeed/comments
 *
 * Écran modal transparent qui enveloppe CommentSheet.
 * Reçoit videoId et commentsCount via les params de route.
 * presentation: "transparentModal" (configuré dans _layout.tsx)
 *
 * Sprint S5 Axe B — Commentaires Hiérarchisés
 */

import CommentSheet from "@/components/imufeed/CommentSheet";
import { useAuth } from "@/providers/AuthProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";

export default function CommentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    videoId: string;
    commentsCount?: string;
    videoAuthorId?: string;
  }>();

  const videoId = params.videoId ?? "";
  const commentsCount = parseInt(params.commentsCount ?? "0", 10);
  const videoAuthorId = params.videoAuthorId ?? undefined;

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  if (!videoId) {
    // Safety: no videoId → close
    handleClose();
    return null;
  }

  return (
    <View style={styles.container}>
      <CommentSheet
        videoId={videoId}
        commentsCount={commentsCount}
        onClose={handleClose}
        currentUserId={user?.id}
        videoAuthorId={videoAuthorId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
