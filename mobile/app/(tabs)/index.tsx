/**
 * HomeScreen — Parité web hometab
 * Sections : HeroCarousel, Stories, FriendsCard, ExplorerGrid, PodcastWidget
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Conversation, getConversations } from "@/services/messaging";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────
interface HeroSlide {
  id: string;
  type: "world" | "contest" | "promo";
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  cta: string;
}

interface StoryUser {
  id: string;
  username: string;
  avatar: string | null;
  hasNew: boolean;
}

interface ExplorerItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  route: string;
}

interface PodcastItem {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  duration: string;
}

// ─── Mock data (parité web — toutes les sections web utilisent du mock) ───
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "h1",
    type: "world",
    title: "home.worldTitle",
    subtitle: "home.worldSubtitle",
    badge: "home.worldBadge",
    image: "",
    cta: "home.explore",
  },
  {
    id: "h2",
    type: "contest",
    title: "home.contestTitle",
    subtitle: "home.contestSubtitle",
    badge: "home.contestBadge",
    image: "",
    cta: "home.participate",
  },
  {
    id: "h3",
    type: "promo",
    title: "home.themesTitle",
    subtitle: "home.themesSubtitle",
    badge: "home.themesBadge",
    image: "",
    cta: "home.see",
  },
];

const MOCK_STORIES: StoryUser[] = [
  { id: "s1", username: "Vous", avatar: null, hasNew: false },
  { id: "s2", username: "Alice", avatar: null, hasNew: true },
  { id: "s3", username: "Bob", avatar: null, hasNew: true },
  { id: "s4", username: "Chloé", avatar: null, hasNew: false },
  { id: "s5", username: "David", avatar: null, hasNew: true },
  { id: "s6", username: "Emma", avatar: null, hasNew: false },
];

const EXPLORER_ITEMS: ExplorerItem[] = [
  {
    id: "e1",
    icon: "🌍",
    title: "home.worlds",
    description: "home.worldsDesc",
    route: "worlds",
  },
  {
    id: "e2",
    icon: "🏆",
    title: "home.contests",
    description: "home.contestsDesc",
    route: "contests",
  },
  {
    id: "e3",
    icon: "🛒",
    title: "home.storeLabel",
    description: "home.storeDesc",
    route: "store",
  },
  {
    id: "e4",
    icon: "🎮",
    title: "home.games",
    description: "home.gamesDesc",
    route: "games",
  },
  {
    id: "e5",
    icon: "🎵",
    title: "home.music",
    description: "home.musicDesc",
    route: "music",
  },
  {
    id: "e6",
    icon: "📚",
    title: "home.resources",
    description: "home.resourcesDesc",
    route: "resources",
  },
];

const MOCK_PODCASTS: PodcastItem[] = [
  {
    id: "p1",
    title: "ImuChat Weekly",
    author: "Équipe Imu",
    cover: null,
    duration: "32 min",
  },
  {
    id: "p2",
    title: "Tech & Community",
    author: "Alice Martin",
    cover: null,
    duration: "18 min",
  },
  {
    id: "p3",
    title: "Creative Corner",
    author: "Bob Design",
    cover: null,
    duration: "25 min",
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Component ────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<FlatList>(null);

  // ─── Load conversations ──────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getConversations();
        if (mounted) setConversations(data.slice(0, 3));
      } catch (e) {
        console.error("[Home] conversations error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ─── Hero auto-scroll ────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────
  const formatTime = useCallback((iso: string | null | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("common.justNow");
    if (mins < 60) return t("common.minutesAgo", { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("common.hoursAgo", { count: hrs });
    return t("common.daysAgo", { count: Math.floor(hrs / 24) });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // SUB-COMPONENTS (inline for test simplicity)
  // ═══════════════════════════════════════════════════════════════

  // ─── Hero Carousel ────────────────────────────────────────────
  const renderHeroSlide = ({ item }: { item: HeroSlide }) => (
    <View
      testID={`hero-slide-${item.id}`}
      style={[
        styles.heroSlide,
        {
          width: SCREEN_WIDTH - spacing.lg * 2,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.heroBadge, { color: colors.primary }]}>
        {t(item.badge)}
      </Text>
      <Text style={[styles.heroTitle, { color: colors.text }]}>
        {t(item.title)}
      </Text>
      <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
        {t(item.subtitle)}
      </Text>
      <TouchableOpacity
        testID={`hero-cta-${item.id}`}
        style={[styles.heroCta, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.heroCtaText}>{t(item.cta)}</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Story Carousel ───────────────────────────────────────────
  const renderStoryAvatar = ({ item }: { item: StoryUser }) => (
    <TouchableOpacity
      testID={`story-avatar-${item.id}`}
      style={styles.storyItem}
    >
      <View
        style={[
          styles.storyRing,
          {
            borderColor: item.hasNew ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={[styles.storyAvatar, { backgroundColor: colors.surface }]}>
          <Text style={styles.storyAvatarEmoji}>
            {item.id === "s1" ? "➕" : item.username.charAt(0)}
          </Text>
        </View>
      </View>
      <Text
        style={[styles.storyUsername, { color: colors.textMuted }]}
        numberOfLines={1}
      >
        {item.username}
      </Text>
    </TouchableOpacity>
  );

  // ─── Friends / Recent Conversations Card ──────────────────────
  const renderConversation = (conv: Conversation, idx: number) => {
    const name = conv.is_group
      ? conv.group_name || t("chat.group")
      : conv.participants?.[0]?.profile?.username || t("common.user");
    const lastMsg = conv.last_message?.content || t("chat.noMessage");
    const time = formatTime(conv.last_message_at);
    const unread = conv.unread_count || 0;

    return (
      <TouchableOpacity
        key={conv.id}
        testID={`friend-conv-${idx}`}
        style={[styles.friendRow, { borderBottomColor: colors.border }]}
      >
        <View
          style={[
            styles.friendAvatar,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Text style={[styles.friendAvatarText, { color: colors.primary }]}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.friendInfo}>
          <Text
            style={[styles.friendName, { color: colors.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={[styles.friendMsg, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {lastMsg}
          </Text>
        </View>
        <View style={styles.friendMeta}>
          <Text style={[styles.friendTime, { color: colors.textMuted }]}>
            {time}
          </Text>
          {unread > 0 && (
            <View
              style={[styles.unreadBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Explorer Grid ────────────────────────────────────────────
  const renderExplorerItem = (item: ExplorerItem) => (
    <TouchableOpacity
      key={item.id}
      testID={`explorer-${item.id}`}
      style={[
        styles.explorerCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={styles.explorerIcon}>{item.icon}</Text>
      <Text style={[styles.explorerTitle, { color: colors.text }]}>
        {t(item.title)}
      </Text>
      <Text style={[styles.explorerDesc, { color: colors.textMuted }]}>
        {t(item.description)}
      </Text>
    </TouchableOpacity>
  );

  // ─── Podcast Widget ───────────────────────────────────────────
  const renderPodcast = (p: PodcastItem) => (
    <TouchableOpacity
      key={p.id}
      testID={`podcast-${p.id}`}
      style={[styles.podcastCard, { backgroundColor: colors.surface }]}
    >
      <View
        style={[
          styles.podcastCover,
          { backgroundColor: colors.primary + "15" },
        ]}
      >
        <Text style={styles.podcastCoverIcon}>🎧</Text>
      </View>
      <View style={styles.podcastInfo}>
        <Text
          style={[styles.podcastTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {p.title}
        </Text>
        <Text
          style={[styles.podcastAuthor, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {p.author}
        </Text>
      </View>
      <Text style={[styles.podcastDuration, { color: colors.textMuted }]}>
        {p.duration}
      </Text>
    </TouchableOpacity>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <View
        testID="home-loading"
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="home-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          {t("home.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t("home.welcome")}
          {user?.user_metadata?.username
            ? `, ${user.user_metadata.username}`
            : ""}{" "}
          {t("home.welcomeSuffix")}
        </Text>

        {/* ── 1. Hero Carousel ───────────────────────────────── */}
        <View testID="hero-carousel" style={styles.heroContainer}>
          <FlatList
            ref={heroRef}
            data={HERO_SLIDES}
            renderItem={renderHeroSlide}
            keyExtractor={(i) => i.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH - spacing.lg * 2 + 12}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x /
                  (SCREEN_WIDTH - spacing.lg * 2 + 12),
              );
              setHeroIndex(idx);
            }}
          />
          {/* Dots */}
          <View testID="hero-dots" style={styles.heroDots}>
            {HERO_SLIDES.map((s, i) => (
              <View
                key={s.id}
                style={[
                  styles.heroDot,
                  {
                    backgroundColor:
                      i === heroIndex ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── 2. Stories Carousel ────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("home.stories")}
        </Text>
        <FlatList
          testID="story-carousel"
          data={MOCK_STORIES}
          renderItem={renderStoryAvatar}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storyList}
        />

        {/* ── 3. Friends / Recent Conversations ─────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("home.recentConversations")}
          </Text>
          <TouchableOpacity testID="btn-see-all-convs">
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              {t("home.seeAll")}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          testID="friends-card"
          style={[
            styles.friendsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {conversations.length === 0 ? (
            <Text
              testID="no-conversations"
              style={[styles.emptyText, { color: colors.textMuted }]}
            >
              {t("chat.noConversation")}
            </Text>
          ) : (
            conversations.map((c, i) => renderConversation(c, i))
          )}
        </View>

        {/* ── 4. Explorer Grid ───────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Explorer
        </Text>
        <View testID="explorer-grid" style={styles.explorerGrid}>
          {EXPLORER_ITEMS.map(renderExplorerItem)}
        </View>

        {/* ── 5. Podcasts ────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Podcasts
        </Text>
        <View testID="podcast-widget">{MOCK_PODCASTS.map(renderPodcast)}</View>

        {/* Bottom spacer */}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {},
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  seeAll: { fontSize: 14, fontWeight: "500" },

  // Hero
  heroContainer: { marginBottom: 20 },
  heroSlide: {
    borderRadius: 16,
    padding: 24,
    marginRight: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 180,
  },
  heroBadge: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  heroSubtitle: { fontSize: 14, marginBottom: 16 },
  heroCta: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  heroCtaText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  heroDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  heroDot: { width: 8, height: 8, borderRadius: 4 },

  // Stories
  storyList: { marginBottom: 16 },
  storyItem: { alignItems: "center", marginRight: 14, width: 64 },
  storyRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatarEmoji: { fontSize: 20 },
  storyUsername: { fontSize: 11, marginTop: 4, textAlign: "center" },

  // Friends card
  friendsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  friendAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  friendAvatarText: { fontSize: 18, fontWeight: "600" },
  friendInfo: { flex: 1, marginLeft: 12 },
  friendName: { fontSize: 15, fontWeight: "600" },
  friendMsg: { fontSize: 13, marginTop: 2 },
  friendMeta: { alignItems: "flex-end" },
  friendTime: { fontSize: 11 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 6,
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  emptyText: { padding: 20, textAlign: "center", fontSize: 14 },

  // Explorer
  explorerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  explorerCard: {
    width: "48%" as unknown as number,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 90,
  },
  explorerIcon: { fontSize: 28, marginBottom: 6 },
  explorerTitle: { fontSize: 14, fontWeight: "600" },
  explorerDesc: { fontSize: 12, marginTop: 2, textAlign: "center" },

  // Podcasts
  podcastCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  podcastCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  podcastCoverIcon: { fontSize: 22 },
  podcastInfo: { flex: 1, marginLeft: 12 },
  podcastTitle: { fontSize: 14, fontWeight: "600" },
  podcastAuthor: { fontSize: 12, marginTop: 2 },
  podcastDuration: { fontSize: 12 },
});
