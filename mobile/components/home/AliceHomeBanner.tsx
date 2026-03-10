/**
 * AliceHomeBanner — Suggestions proactives Alice sur le Home
 *
 * Affiche un carrousel horizontal de suggestions : rappels d'événements,
 * messages non lus, modules oubliés, tips du jour.
 * Chaque carte peut être ignorée (swipe) ou tapée (action contextuelle).
 *
 * Sprint S10 Axe A — Alice IA dans le Home
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import type { ProactiveSuggestion } from "@/services/alice-home";
import { dismissSuggestion, getActiveSuggestions } from "@/services/alice-home";
import { createLogger } from "@/services/logger";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logger = createLogger("AliceHomeBanner");

// ─── Suggestion icons ─────────────────────────────────────────

const SUGGESTION_ICONS: Record<
  ProactiveSuggestion["type"],
  keyof typeof Ionicons.glyphMap
> = {
  event: "calendar-outline",
  unread: "chatbubble-outline",
  module: "grid-outline",
  reminder: "alarm-outline",
  tip: "bulb-outline",
};

const SUGGESTION_COLORS: Record<ProactiveSuggestion["type"], string> = {
  event: "#4A90D9",
  unread: "#E74C3C",
  module: "#27AE60",
  reminder: "#F39C12",
  tip: "#9B59B6",
};

// ─── Component ────────────────────────────────────────────────

export default function AliceHomeBanner() {
  const colors = useColors();
  const spacing = useSpacing();
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getActiveSuggestions();
      setSuggestions(data);
    } catch (err) {
      logger.error("loadSuggestions failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDismiss = useCallback(async (id: string) => {
    const ok = await dismissSuggestion(id);
    if (ok) {
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    }
  }, []);

  if (loading || suggestions.length === 0) return null;

  return (
    <View style={[styles.container, { marginHorizontal: spacing.md }]}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text
          style={[
            styles.headerText,
            { color: colors.text, marginLeft: spacing.xs },
          ]}
        >
          Alice suggère
        </Text>
      </View>

      <FlatList
        testID="alice-suggestions-list"
        horizontal
        showsHorizontalScrollIndicator={false}
        data={suggestions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <SuggestionCard suggestion={item} onDismiss={handleDismiss} />
        )}
      />
    </View>
  );
}

// ─── Suggestion Card ──────────────────────────────────────────

interface SuggestionCardProps {
  suggestion: ProactiveSuggestion;
  onDismiss: (id: string) => void;
}

function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  const colors = useColors();
  const accentColor = SUGGESTION_COLORS[suggestion.type];
  const iconName = SUGGESTION_ICONS[suggestion.type];

  return (
    <View
      testID={`suggestion-${suggestion.id}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderLeftColor: accentColor,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Ionicons name={iconName} size={20} color={accentColor} />
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {suggestion.title}
        </Text>
        <TouchableOpacity
          testID={`dismiss-${suggestion.id}`}
          onPress={() => onDismiss(suggestion.id)}
          style={styles.dismissBtn}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text
        style={[styles.cardBody, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {suggestion.body}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    width: 220,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  dismissBtn: {
    padding: 2,
  },
  cardBody: {
    fontSize: 12,
    lineHeight: 16,
  },
});
