/**
 * WatchScreen — Parité web watch hub
 * Sections : FeaturedCarousel, CategoryFilter, WatchPartyCards, UpcomingSection, CTA
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────
type WatchCategory = "all" | "anime" | "movie" | "series" | "documentary";

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  viewers: number;
}

interface WatchParty {
  id: string;
  title: string;
  host: string;
  category: WatchCategory;
  viewers: number;
  startedAt: string;
  isLive: boolean;
}

interface UpcomingParty {
  id: string;
  title: string;
  host: string;
  scheduledFor: string;
  attendees: number;
}

// ─── Mock data (parité avec web MOCK_UPCOMING_PARTIES) ───────────
const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: "f1",
    title: "Anime Night: One Piece",
    subtitle: "Épisode 1122 — Egg Head Arc",
    badge: "🔴 LIVE",
    viewers: 142,
  },
  {
    id: "f2",
    title: "Ciné Club: Inception",
    subtitle: "Christopher Nolan — 2h28",
    badge: "⭐ Top",
    viewers: 89,
  },
  {
    id: "f3",
    title: "Docu: Notre Planète",
    subtitle: "Saison 2, Ép. 4",
    badge: "🌍 Nature",
    viewers: 56,
  },
];

const WATCH_PARTIES: WatchParty[] = [
  {
    id: "wp1",
    title: "Dragon Ball Super: Broly",
    host: "Alice",
    category: "anime",
    viewers: 23,
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    isLive: true,
  },
  {
    id: "wp2",
    title: "Breaking Bad S5 Marathon",
    host: "Bob",
    category: "series",
    viewers: 67,
    startedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    isLive: true,
  },
  {
    id: "wp3",
    title: "Interstellar",
    host: "David",
    category: "movie",
    viewers: 34,
    startedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    isLive: true,
  },
  {
    id: "wp4",
    title: "Cosmos: A Spacetime Odyssey",
    host: "Emma",
    category: "documentary",
    viewers: 18,
    startedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    isLive: true,
  },
  {
    id: "wp5",
    title: "Attack on Titan Final",
    host: "François",
    category: "anime",
    viewers: 95,
    startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    isLive: true,
  },
];

const UPCOMING_PARTIES: UpcomingParty[] = [
  {
    id: "up1",
    title: "Marvel Movie Night",
    host: "Chloé",
    scheduledFor: new Date(Date.now() + 3 * 3600000).toISOString(),
    attendees: 12,
  },
  {
    id: "up2",
    title: "Anime Friday: Jujutsu Kaisen",
    host: "Alice",
    scheduledFor: new Date(Date.now() + 24 * 3600000).toISOString(),
    attendees: 28,
  },
  {
    id: "up3",
    title: "Documentary Sunday",
    host: "Bob",
    scheduledFor: new Date(Date.now() + 48 * 3600000).toISOString(),
    attendees: 8,
  },
];

const CATEGORIES: { key: WatchCategory; label: string; icon: string }[] = [
  { key: "all", label: "Tout", icon: "🎬" },
  { key: "anime", label: "Anime", icon: "⛩️" },
  { key: "movie", label: "Films", icon: "🎥" },
  { key: "series", label: "Séries", icon: "📺" },
  { key: "documentary", label: "Docu", icon: "🌍" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────
export default function WatchScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const [category, setCategory] = useState<WatchCategory>("all");

  const filteredParties =
    category === "all"
      ? WATCH_PARTIES
      : WATCH_PARTIES.filter((p) => p.category === category);

  // ─── Featured carousel item ───────────────────────────────────
  const renderFeatured = ({ item }: { item: FeaturedItem }) => (
    <TouchableOpacity
      testID={`featured-${item.id}`}
      style={[
        styles.featuredCard,
        {
          width: SCREEN_WIDTH - spacing.lg * 2 - 24,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.featuredTop}>
        <Text style={[styles.featuredBadge, { color: colors.primary }]}>
          {item.badge}
        </Text>
        <Text style={[styles.featuredViewers, { color: colors.textMuted }]}>
          👁 {item.viewers}
        </Text>
      </View>
      <Text style={[styles.featuredTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.featuredSub, { color: colors.textMuted }]}>
        {item.subtitle}
      </Text>
      <TouchableOpacity
        testID={`join-featured-${item.id}`}
        style={[styles.joinBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.joinBtnText}>Rejoindre</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ─── Watch party card ─────────────────────────────────────────
  const renderParty = (p: WatchParty) => (
    <TouchableOpacity
      key={p.id}
      testID={`party-${p.id}`}
      style={[
        styles.partyCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.partyHeader}>
        <View
          style={[
            styles.liveDot,
            { backgroundColor: p.isLive ? "#ef4444" : colors.border },
          ]}
        />
        <Text
          style={[styles.partyTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {p.title}
        </Text>
      </View>
      <Text style={[styles.partyHost, { color: colors.textMuted }]}>
        👤 {p.host}
      </Text>
      <View style={styles.partyMeta}>
        <Text style={[styles.partyViewers, { color: colors.primary }]}>
          👁 {p.viewers}
        </Text>
        <TouchableOpacity
          testID={`join-party-${p.id}`}
          style={[styles.partyJoin, { borderColor: colors.primary }]}
        >
          <Text style={[styles.partyJoinText, { color: colors.primary }]}>
            Rejoindre
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ─── Upcoming card ────────────────────────────────────────────
  const renderUpcoming = (u: UpcomingParty) => {
    const date = new Date(u.scheduledFor);
    const timeStr = `${date.getHours()}h${date.getMinutes().toString().padStart(2, "0")}`;
    const dayDiff = Math.floor((date.getTime() - Date.now()) / (24 * 3600000));
    const dayLabel =
      dayDiff === 0
        ? "Aujourd'hui"
        : dayDiff === 1
          ? "Demain"
          : `Dans ${dayDiff}j`;

    return (
      <TouchableOpacity
        key={u.id}
        testID={`upcoming-${u.id}`}
        style={[
          styles.upcomingCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.upcomingLeft}>
          <Text style={[styles.upcomingDay, { color: colors.primary }]}>
            {dayLabel}
          </Text>
          <Text style={[styles.upcomingTime, { color: colors.textMuted }]}>
            {timeStr}
          </Text>
        </View>
        <View style={styles.upcomingInfo}>
          <Text
            style={[styles.upcomingTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {u.title}
          </Text>
          <Text style={[styles.upcomingHost, { color: colors.textMuted }]}>
            👤 {u.host} · {u.attendees} inscrits
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <ScrollView
      testID="watch-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>📺 Watch</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          VOD et Watch Party
        </Text>

        {/* ── Featured Carousel ───────────────────────────────── */}
        <FlatList
          testID="featured-carousel"
          data={FEATURED_ITEMS}
          renderItem={renderFeatured}
          keyExtractor={(i) => i.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.featuredList}
        />

        {/* ── Category Filter ─────────────────────────────────── */}
        <View testID="category-filter" style={styles.categoryRow}>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                testID={`category-${c.key}`}
                onPress={() => setCategory(c.key)}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={styles.categoryIcon}>{c.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: active ? "#fff" : colors.textMuted },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Watch Parties ───────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🔴 En direct
        </Text>
        <View testID="parties-list">
          {filteredParties.length === 0 ? (
            <Text
              testID="no-parties"
              style={[styles.emptyText, { color: colors.textMuted }]}
            >
              Aucune party dans cette catégorie
            </Text>
          ) : (
            filteredParties.map(renderParty)
          )}
        </View>

        {/* ── Upcoming ────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📅 À venir
        </Text>
        <View testID="upcoming-list">
          {UPCOMING_PARTIES.map(renderUpcoming)}
        </View>

        {/* ── Create CTA ──────────────────────────────────────── */}
        <TouchableOpacity
          testID="btn-create-party"
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.createBtnText}>🎉 Créer une Watch Party</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },

  // Featured
  featuredList: { marginBottom: 16 },
  featuredCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    borderWidth: 1,
    minHeight: 160,
  },
  featuredTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  featuredBadge: { fontSize: 13, fontWeight: "700" },
  featuredViewers: { fontSize: 13 },
  featuredTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  featuredSub: { fontSize: 14, marginBottom: 16 },
  joinBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  joinBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  // Categories
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: 13, fontWeight: "500" },

  // Party cards
  partyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  partyHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  partyTitle: { fontSize: 15, fontWeight: "600", flex: 1 },
  partyHost: { fontSize: 13, marginBottom: 8 },
  partyMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partyViewers: { fontSize: 13, fontWeight: "600" },
  partyJoin: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  partyJoinText: { fontSize: 13, fontWeight: "500" },

  // Upcoming
  upcomingCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  upcomingLeft: { alignItems: "center", marginRight: 14, minWidth: 70 },
  upcomingDay: { fontSize: 13, fontWeight: "700" },
  upcomingTime: { fontSize: 12, marginTop: 2 },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { fontSize: 15, fontWeight: "600" },
  upcomingHost: { fontSize: 13, marginTop: 4 },

  // Create CTA
  createBtn: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Empty
  emptyText: { textAlign: "center", padding: 30, fontSize: 14 },
});
