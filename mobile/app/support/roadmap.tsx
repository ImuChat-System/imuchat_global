/**
 * Roadmap Publique Screen
 *
 * Features:
 * - Public roadmap items with status
 * - Vote/unvote on items
 * - Category filter chips
 * - Status columns (planned, in-progress, completed)
 *
 * Phase 3 — DEV-031
 */

import { useSupport } from "@/hooks/useSupport";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { RoadmapCategory, RoadmapItemStatus } from "@/types/support";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_CONFIG: Record<
  RoadmapItemStatus,
  { color: string; icon: string; emoji: string }
> = {
  planned: { color: "#6B7280", icon: "calendar-outline", emoji: "📋" },
  "in-progress": { color: "#3B82F6", icon: "construct-outline", emoji: "🔨" },
  completed: {
    color: "#10B981",
    icon: "checkmark-circle-outline",
    emoji: "✅",
  },
  cancelled: { color: "#EF4444", icon: "close-circle-outline", emoji: "❌" },
};

const CATEGORY_EMOJIS: Record<RoadmapCategory, string> = {
  messaging: "💬",
  calls: "📞",
  communities: "👥",
  ai: "🤖",
  store: "🏪",
  security: "🔒",
  ux: "🎨",
  other: "📋",
};

const STATUS_ORDER: RoadmapItemStatus[] = [
  "in-progress",
  "planned",
  "completed",
  "cancelled",
];

export default function RoadmapScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { roadmapItems, toggleVote } = useSupport();
  const [selectedCategory, setSelectedCategory] =
    useState<RoadmapCategory | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<RoadmapItemStatus | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(roadmapItems.map((i) => i.category));
    return Array.from(cats);
  }, [roadmapItems]);

  const filteredItems = useMemo(() => {
    let items = roadmapItems;
    if (selectedCategory) {
      items = items.filter((i) => i.category === selectedCategory);
    }
    if (selectedStatus) {
      items = items.filter((i) => i.status === selectedStatus);
    }
    // Sort: in-progress first, then by votes desc
    return items.sort((a, b) => {
      const statusA = STATUS_ORDER.indexOf(a.status);
      const statusB = STATUS_ORDER.indexOf(b.status);
      if (statusA !== statusB) return statusA - statusB;
      return b.votes - a.votes;
    });
  }, [roadmapItems, selectedCategory, selectedStatus]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.headerDesc, { color: colors.textMuted }]}>
        {t("support.roadmapDesc")}
      </Text>

      {/* Status filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedStatus === null ? colors.primary : colors.surface,
            },
          ]}
          onPress={() => setSelectedStatus(null)}
        >
          <Text
            style={{
              color: selectedStatus === null ? "#fff" : colors.text,
              fontSize: 13,
            }}
          >
            {t("support.allStatuses")}
          </Text>
        </TouchableOpacity>
        {STATUS_ORDER.filter((s) => s !== "cancelled").map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedStatus === status
                    ? STATUS_CONFIG[status].color
                    : colors.surface,
              },
            ]}
            onPress={() =>
              setSelectedStatus(selectedStatus === status ? null : status)
            }
          >
            <Text style={{ fontSize: 12 }}>{STATUS_CONFIG[status].emoji}</Text>
            <Text
              style={{
                color: selectedStatus === status ? "#fff" : colors.text,
                fontSize: 13,
              }}
            >
              {t(`support.roadmapStatus.${status}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ flexGrow: 0 }}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedCategory === null ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={{
                color: selectedCategory === null ? "#fff" : colors.text,
                fontSize: 13,
              }}
            >
              {t("support.allCategories")}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedCategory === cat ? colors.primary : colors.surface,
                },
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              <Text style={{ fontSize: 12 }}>{CATEGORY_EMOJIS[cat]}</Text>
              <Text
                style={{
                  color: selectedCategory === cat ? "#fff" : colors.text,
                  fontSize: 13,
                }}
              >
                {t(`support.roadmapCategory.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Items */}
      <Text style={[styles.countLabel, { color: colors.textMuted }]}>
        {t("support.roadmapCount", { count: filteredItems.length })}
      </Text>

      {filteredItems.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 32 }}>🗺️</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("support.noRoadmapItems")}
          </Text>
        </View>
      ) : (
        filteredItems.map((item) => {
          const statusCfg = STATUS_CONFIG[item.status];
          return (
            <View
              key={item.id}
              style={[styles.roadmapCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                  </View>
                  <Text
                    style={[styles.cardDesc, { color: colors.textMuted }]}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>

                {/* Vote button */}
                <TouchableOpacity
                  style={[
                    styles.voteBtn,
                    {
                      backgroundColor: item.hasVoted
                        ? colors.primary + "20"
                        : colors.background,
                      borderColor: item.hasVoted
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => toggleVote(item.id)}
                >
                  <Ionicons
                    name={item.hasVoted ? "arrow-up" : "arrow-up-outline"}
                    size={18}
                    color={item.hasVoted ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.voteCount,
                      {
                        color: item.hasVoted
                          ? colors.primary
                          : colors.textMuted,
                      },
                    ]}
                  >
                    {item.votes}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Badges */}
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: statusCfg.color + "20" },
                  ]}
                >
                  <Text style={{ fontSize: 10 }}>{statusCfg.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: statusCfg.color,
                      fontWeight: "600",
                    }}
                  >
                    {t(`support.roadmapStatus.${item.status}`)}
                  </Text>
                </View>
                <View
                  style={[styles.badge, { backgroundColor: colors.background }]}
                >
                  <Text style={{ fontSize: 10 }}>
                    {CATEGORY_EMOJIS[item.category]}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    {t(`support.roadmapCategory.${item.category}`)}
                  </Text>
                </View>
                {item.targetQuarter && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      🎯 {item.targetQuarter}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  headerDesc: { fontSize: 14, lineHeight: 20 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  countLabel: { fontSize: 13, fontWeight: "600" },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  roadmapCard: { borderRadius: 12, padding: 14, gap: 10 },
  cardHeader: { flexDirection: "row", gap: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: "600", flex: 1 },
  cardDesc: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  voteBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 48,
    gap: 2,
  },
  voteCount: { fontSize: 13, fontWeight: "700" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
});
