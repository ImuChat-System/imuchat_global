/**
 * HomeScreen — Parité web hometab
 * Sections : HeroCarousel, Stories, FriendsCard, ExplorerGrid, PodcastWidget
 */

import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Conversation, getConversations } from "@/services/messaging";
import { openMiniApp } from "@/services/miniapp-deeplink";
import { fetchFeed, toggleLike, type Post } from "@/services/social-feed";
import { useModulesStore } from "@/stores/modules-store";
import { useStoriesStore } from "@/stores/stories-store";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
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
];

// Fallback when store is empty
const EMPTY_STORIES: StoryUser[] = [];

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

  // ─── Stories store ─────────────────────────────────────────
  const {
    storyGroups,
    fetchStories,
    isLoading: storiesLoading,
  } = useStoriesStore();

  const stories: StoryUser[] = useMemo(() => {
    // "You" entry always first
    const me: StoryUser = {
      id: user?.id ?? "me",
      username: t("stories.you", { defaultValue: "Vous" }),
      avatar: null,
      hasNew: false,
    };

    const mapped: StoryUser[] = storyGroups
      .filter((g) => g.user_id !== user?.id)
      .map((g) => ({
        id: g.user_id,
        username: g.display_name || g.username,
        avatar: g.avatar_url,
        hasNew: g.has_unread,
      }));

    return [me, ...mapped];
  }, [storyGroups, user?.id, t]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<FlatList>(null);

  // ─── Module store – installed mini-apps ──────────────────────
  const { installedModules, fetchInstalled } = useModulesStore();

  const myApps = installedModules
    .filter((um) => um.module && !um.module.is_core && um.module.entry_url)
    .map((um) => um.module!)
    .slice(0, 8); // max 8 on home

  // ─── Load conversations ──────────────────────────────────────
  useEffect(() => {
    fetchInstalled();
    fetchStories();
  }, [fetchInstalled, fetchStories]);

  // ─── Load feed posts ─────────────────────────────────────────
  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const result = await fetchFeed(undefined, "all");
      setFeedPosts(result.posts.slice(0, 5)); // top 5 on home
    } catch (e) {
      console.warn("[Home] feed error:", e);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [convData] = await Promise.all([getConversations(), loadFeed()]);
        if (mounted) setConversations(convData.slice(0, 3));
      } catch (e) {
        console.error("[Home] load error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadFeed]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [convData] = await Promise.all([
        getConversations(),
        loadFeed(),
        fetchStories(),
      ]);
      setConversations(convData.slice(0, 3));
    } catch (e) {
      console.warn("[Home] refresh error:", e);
    } finally {
      setRefreshing(false);
    }
  }, [loadFeed]);

  // Like/unlike a post
  const handleToggleLike = useCallback(async (post: Post) => {
    try {
      await toggleLike(post.id, post.isLiked);
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
              }
            : p,
        ),
      );
    } catch (e) {
      console.warn("[Home] like error:", e);
    }
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
  const isMyStoryEntry = useCallback(
    (id: string) => id === (user?.id ?? "me"),
    [user?.id],
  );

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
            {isMyStoryEntry(item.id) ? "➕" : item.username.charAt(0)}
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
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
          data={stories}
          renderItem={renderStoryAvatar}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storyList}
        />

        {/* ── 2b. My Mini-Apps ───────────────────────────────── */}
        {myApps.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("home.myApps")}
              </Text>
              <TouchableOpacity
                testID="btn-see-all-apps"
                onPress={() => openMiniApp("")}
              >
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {t("home.seeAll")}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              testID="my-apps-row"
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.myAppsRow}
            >
              {myApps.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  testID={`home-app-${app.id}`}
                  style={[
                    styles.myAppCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => openMiniApp(app.id)}
                >
                  <Text style={styles.myAppIcon}>{app.icon || "📦"}</Text>
                  <Text
                    style={[styles.myAppName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {app.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

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

        {/* ── 4. Social Feed (real Supabase data) ────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("home.feed") || "Feed"}
          </Text>
          <TouchableOpacity testID="btn-see-all-feed">
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              {t("home.seeAll")}
            </Text>
          </TouchableOpacity>
        </View>
        <View testID="social-feed">
          {feedLoading && feedPosts.length === 0 ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ padding: 20 }}
            />
          ) : feedPosts.length === 0 ? (
            <Text
              testID="no-feed"
              style={[styles.emptyText, { color: colors.textMuted }]}
            >
              {t("home.noFeed") || "Aucun post pour le moment"}
            </Text>
          ) : (
            feedPosts.map((post) => {
              const authorName =
                post.author.displayName ||
                post.author.username ||
                t("common.user");
              return (
                <View
                  key={post.id}
                  testID={`feed-post-${post.id}`}
                  style={[
                    styles.feedCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.feedHeader}>
                    <View
                      style={[
                        styles.feedAvatar,
                        { backgroundColor: colors.primary + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.feedAvatarText,
                          { color: colors.primary },
                        ]}
                      >
                        {authorName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.feedAuthorInfo}>
                      <Text
                        style={[styles.feedAuthorName, { color: colors.text }]}
                      >
                        {authorName}
                      </Text>
                      <Text
                        style={[styles.feedTime, { color: colors.textMuted }]}
                      >
                        {formatTime(post.createdAt)}
                      </Text>
                    </View>
                    {post.type !== "post" && (
                      <View
                        style={[
                          styles.feedTypeBadge,
                          { backgroundColor: colors.primary + "15" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.feedTypeBadgeText,
                            { color: colors.primary },
                          ]}
                        >
                          {post.type === "news" ? "📰" : "📢"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.feedContent, { color: colors.text }]}
                    numberOfLines={4}
                  >
                    {post.content}
                  </Text>
                  <View style={styles.feedActions}>
                    <TouchableOpacity
                      testID={`like-post-${post.id}`}
                      style={styles.feedActionBtn}
                      onPress={() => handleToggleLike(post)}
                    >
                      <Ionicons
                        name={post.isLiked ? "heart" : "heart-outline"}
                        size={18}
                        color={post.isLiked ? "#ef4444" : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.feedActionText,
                          {
                            color: post.isLiked ? "#ef4444" : colors.textMuted,
                          },
                        ]}
                      >
                        {post.likesCount}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedActionBtn}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={16}
                        color={colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.feedActionText,
                          { color: colors.textMuted },
                        ]}
                      >
                        {post.commentsCount}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedActionBtn}>
                      <Ionicons
                        name="share-outline"
                        size={16}
                        color={colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.feedActionText,
                          { color: colors.textMuted },
                        ]}
                      >
                        {post.sharesCount}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── 5. Explorer Grid ───────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Explorer
        </Text>
        <View testID="explorer-grid" style={styles.explorerGrid}>
          {EXPLORER_ITEMS.map(renderExplorerItem)}
        </View>

        {/* ── 6. Podcasts ────────────────────────────────────── */}
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

  // My Apps
  myAppsRow: { marginBottom: 16 },
  myAppCard: {
    width: 72,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  myAppIcon: { fontSize: 28, marginBottom: 4 },
  myAppName: { fontSize: 10, fontWeight: "600", textAlign: "center" },

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

  // Feed
  feedCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  feedAvatarText: { fontSize: 16, fontWeight: "600" },
  feedAuthorInfo: { flex: 1, marginLeft: 10 },
  feedAuthorName: { fontSize: 14, fontWeight: "600" },
  feedTime: { fontSize: 11, marginTop: 1 },
  feedTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  feedTypeBadgeText: { fontSize: 12 },
  feedContent: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  feedActions: {
    flexDirection: "row",
    gap: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
    paddingTop: 10,
  },
  feedActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  feedActionText: { fontSize: 13, fontWeight: "500" },

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
