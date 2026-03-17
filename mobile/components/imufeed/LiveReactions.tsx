/**
 * LiveReactions — Réactions flottantes animées
 *
 * Affiche des emojis qui flottent de bas en haut quand les viewers
 * envoient des réactions (❤️ 🔥 😂 😮 👏 ⭐).
 *
 * Sprint S16 — Live UI Streamer & Viewer
 */

import type { LiveReaction, LiveReactionType } from "@/types/live-streaming";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Emoji Map ────────────────────────────────────────────────

export const REACTION_EMOJI: Record<LiveReactionType, string> = {
  heart: "❤️",
  fire: "🔥",
  laugh: "😂",
  wow: "😮",
  clap: "👏",
  star: "⭐",
};

// ─── Floating Reaction ───────────────────────────────────────

interface FloatingReactionProps {
  reaction: LiveReaction;
  onComplete: (id: string) => void;
}

function FloatingReaction({ reaction, onComplete }: FloatingReactionProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(
    new Animated.Value((Math.random() - 0.5) * 40),
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const targetX = (Math.random() - 0.5) * 80;
    const duration = 2000 + Math.random() * 1000;

    Animated.parallel([
      // Float up
      Animated.timing(translateY, {
        toValue: -(SCREEN_HEIGHT * 0.35),
        duration,
        useNativeDriver: true,
      }),
      // Horizontal drift
      Animated.timing(translateX, {
        toValue: targetX,
        duration,
        useNativeDriver: true,
      }),
      // Fade in → fade out
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration - 800),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Scale in → scale down
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.delay(duration - 800),
        Animated.timing(scale, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete(reaction.id);
    });
  }, []);

  const emoji = REACTION_EMOJI[reaction.type] || "❤️";

  return (
    <Animated.View
      testID={`floating-reaction-${reaction.id}`}
      style={[
        styles.floatingReaction,
        {
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
}

// ─── Props ────────────────────────────────────────────────────

export interface LiveReactionsProps {
  reactions: LiveReaction[];
  onReactionComplete: (reactionId: string) => void;
}

// ─── Main Component ───────────────────────────────────────────

export default function LiveReactions({
  reactions,
  onReactionComplete,
}: LiveReactionsProps) {
  const handleComplete = useCallback(
    (id: string) => {
      onReactionComplete(id);
    },
    [onReactionComplete],
  );

  return (
    <View testID="live-reactions" style={styles.container} pointerEvents="none">
      {reactions.map((reaction) => (
        <FloatingReaction
          key={reaction.id}
          reaction={reaction}
          onComplete={handleComplete}
        />
      ))}
    </View>
  );
}

// ─── Reaction Buttons Bar ─────────────────────────────────────

export interface ReactionButtonsProps {
  onReaction: (type: LiveReactionType) => void;
}

export function ReactionButtons({ onReaction }: ReactionButtonsProps) {
  const types: LiveReactionType[] = [
    "heart",
    "fire",
    "laugh",
    "wow",
    "clap",
    "star",
  ];

  return (
    <View testID="reaction-buttons" style={styles.buttonsBar}>
      {types.map((type) => (
        <Animated.View key={type}>
          <Text
            testID={`reaction-btn-${type}`}
            style={styles.reactionBtn}
            onPress={() => onReaction(type)}
          >
            {REACTION_EMOJI[type]}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    right: 12,
    width: 80,
    height: SCREEN_HEIGHT * 0.4,
  },
  floatingReaction: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
  emoji: {
    fontSize: 28,
  },
  buttonsBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 24,
  },
  reactionBtn: {
    fontSize: 24,
    padding: 4,
  },
});
