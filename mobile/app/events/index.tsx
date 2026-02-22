/**
 * Events List Screen
 *
 * DEV-013: List of upcoming events with filters
 * - Upcoming events
 * - Going / Interested
 * - Past events
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { enUS, fr, ja } from "date-fns/locale";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Event, EventsPage, fetchEvents } from "@/services/events";
import i18n from "@/services/i18n";

type EventFilter = "all" | "going" | "interested" | "past";

const FILTERS: { key: EventFilter; labelKey: string }[] = [
  { key: "all", labelKey: "events.filters.all" },
  { key: "going", labelKey: "events.filters.going" },
  { key: "interested", labelKey: "events.filters.interested" },
  { key: "past", labelKey: "events.filters.past" },
];

export default function EventsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<EventFilter>("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadEvents = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
      }

      const page: EventsPage = await fetchEvents(
        reset ? undefined : (cursor ?? undefined),
        filter,
      );

      if (reset) {
        setEvents(page.events);
      } else {
        setEvents((prev) => [...prev, ...page.events]);
      }
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    },
    [filter, cursor],
  );

  useFocusEffect(
    useCallback(() => {
      loadEvents(true);
    }, [filter]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents(true);
  }, [loadEvents]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      loadEvents(false);
    }
  }, [hasMore, loadingMore, loading, loadEvents]);

  const navigateToEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const navigateToCreate = () => {
    router.push("/events/create");
  };

  const getDateLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith("fr")) return fr;
    if (lang.startsWith("ja")) return ja;
    return enUS;
  };

  const formatEventDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    const locale = getDateLocale();

    if (isToday(date)) {
      return t("events.today") + ", " + format(date, "HH:mm", { locale });
    }
    if (isTomorrow(date)) {
      return t("events.tomorrow") + ", " + format(date, "HH:mm", { locale });
    }
    return format(date, "EEE d MMM, HH:mm", { locale });
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const goingLabel =
      item.goingCount === 1
        ? t("events.oneGoing")
        : t("events.peopleGoing", { count: item.goingCount });

    return (
      <TouchableOpacity
        style={[
          styles.eventCard,
          { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
        ]}
        onPress={() => navigateToEvent(item.id)}
        activeOpacity={0.7}
      >
        {item.coverImageUrl ? (
          <Image
            source={{ uri: item.coverImageUrl }}
            style={styles.eventCover}
          />
        ) : (
          <View
            style={[
              styles.eventCoverPlaceholder,
              { backgroundColor: isDark ? "#2c2c2e" : "#e5e5ea" },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={32}
              color={isDark ? "#8e8e93" : "#aeaeb2"}
            />
          </View>
        )}

        <View style={styles.eventInfo}>
          <Text
            style={[styles.eventDate, { color: "#007AFF" }]}
            numberOfLines={1}
          >
            {formatEventDate(item.startsAt)}
          </Text>

          <Text
            style={[styles.eventTitle, { color: isDark ? "#fff" : "#000" }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {item.location && (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={isDark ? "#8e8e93" : "#666"}
              />
              <Text
                style={[
                  styles.locationText,
                  { color: isDark ? "#8e8e93" : "#666" },
                ]}
                numberOfLines={1}
              >
                {item.location}
              </Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <Text
              style={[styles.statsText, { color: isDark ? "#8e8e93" : "#666" }]}
            >
              {goingLabel}
            </Text>
            {item.myStatus && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.myStatus === "going"
                        ? "#34c759"
                        : item.myStatus === "interested"
                          ? "#ff9500"
                          : "#8e8e93",
                  },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {t(`events.status.${item.myStatus}`)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                filter === f.key ? "#007AFF" : isDark ? "#2c2c2e" : "#e5e5ea",
            },
          ]}
          onPress={() => {
            setFilter(f.key);
            setCursor(null);
          }}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === f.key ? "#fff" : isDark ? "#fff" : "#000" },
            ]}
          >
            {t(f.labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="calendar-outline"
          size={64}
          color={isDark ? "#3a3a3c" : "#d1d1d6"}
        />
        <Text
          style={[styles.emptyText, { color: isDark ? "#8e8e93" : "#666" }]}
        >
          {t("events.noEvents")}
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={navigateToCreate}
        >
          <Text style={styles.createButtonText}>{t("events.createFirst")}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("events.title"),
          headerRight: () => (
            <TouchableOpacity
              onPress={navigateToCreate}
              style={styles.headerButton}
            >
              <Ionicons name="add-circle" size={28} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      {renderFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            events.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
  eventCard: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCover: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  eventCoverPlaceholder: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  eventInfo: {
    padding: 14,
    gap: 6,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statsText: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
