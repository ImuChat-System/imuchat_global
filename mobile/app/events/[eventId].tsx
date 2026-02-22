/**
 * Event Detail Screen
 *
 * DEV-013: Event details with RSVP
 * - Event info (title, date, location, description)
 * - RSVP buttons (Going, Interested, Decline)
 * - Participants list
 * - Edit/delete for organizer
 */

import { Ionicons } from "@expo/vector-icons";
import { format, isPast, parseISO } from "date-fns";
import { enUS, fr, ja } from "date-fns/locale";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  cancelEvent,
  deleteEvent,
  Event,
  EventParticipant,
  fetchEvent,
  fetchEventParticipants,
  ParticipantStatus,
  respondToEvent,
} from "@/services/events";
import i18n from "@/services/i18n";
import { supabase } from "@/services/supabase";

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isOrganizer = event?.creatorId === currentUserId;
  const isPastEvent = event ? isPast(parseISO(event.startsAt)) : false;
  const isCancelled = event?.status === "cancelled";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const loadEvent = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    const [eventData, participantsList] = await Promise.all([
      fetchEvent(eventId),
      fetchEventParticipants(eventId),
    ]);

    setEvent(eventData);
    setParticipants(participantsList);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const getDateLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith("fr")) return fr;
    if (lang.startsWith("ja")) return ja;
    return enUS;
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    const locale = getDateLocale();
    return format(date, "EEEE d MMMM yyyy", { locale });
  };

  const formatTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "HH:mm");
  };

  const handleRespond = async (status: ParticipantStatus) => {
    if (!event || responding) return;

    setResponding(true);
    const { success, newStatus } = await respondToEvent(event.id, status);

    if (success) {
      // Update local state
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              myStatus: newStatus,
              goingCount:
                status === "going"
                  ? prev.myStatus === "going"
                    ? prev.goingCount - 1
                    : prev.goingCount + 1
                  : prev.myStatus === "going"
                    ? prev.goingCount - 1
                    : prev.goingCount,
              interestedCount:
                status === "interested"
                  ? prev.myStatus === "interested"
                    ? prev.interestedCount - 1
                    : prev.interestedCount + 1
                  : prev.myStatus === "interested"
                    ? prev.interestedCount - 1
                    : prev.interestedCount,
            }
          : prev,
      );

      // Reload participants
      const participantsList = await fetchEventParticipants(event.id);
      setParticipants(participantsList);
    }

    setResponding(false);
  };

  const handleOpenLocation = () => {
    if (event?.locationUrl) {
      Linking.openURL(event.locationUrl);
    } else if (event?.location) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        title: event.title,
        message: `${event.title}\n${formatDate(event.startsAt)} ${t("events.at")} ${formatTime(event.startsAt)}\n${event.location || ""}`,
      });
    } catch (error) {
      console.error("Share error", error);
    }
  };

  const handleEdit = () => {
    router.push(`/events/edit/${event?.id}`);
  };

  const handleCancel = () => {
    Alert.alert(t("events.cancelEvent"), t("events.cancelEventConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("events.cancel"),
        style: "destructive",
        onPress: async () => {
          if (event && (await cancelEvent(event.id))) {
            loadEvent();
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(t("events.deleteEvent"), t("events.deleteEventConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("events.delete"),
        style: "destructive",
        onPress: async () => {
          if (event && (await deleteEvent(event.id))) {
            router.back();
          }
        },
      },
    ]);
  };

  const showOrganizerMenu = () => {
    Alert.alert(t("events.manageEvent"), undefined, [
      { text: t("events.edit"), onPress: handleEdit },
      {
        text: t("events.cancelEvent"),
        onPress: handleCancel,
        style: "destructive",
      },
      {
        text: t("events.deleteEvent"),
        onPress: handleDelete,
        style: "destructive",
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const renderRSVPButtons = () => {
    if (isPastEvent || isCancelled) return null;

    const buttons: {
      status: ParticipantStatus;
      icon: string;
      color: string;
    }[] = [
      { status: "going", icon: "checkmark-circle", color: "#34c759" },
      { status: "interested", icon: "star", color: "#ff9500" },
      { status: "declined", icon: "close-circle", color: "#ff3b30" },
    ];

    return (
      <View style={styles.rsvpContainer}>
        <Text
          style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
        >
          {t("events.yourResponse")}
        </Text>
        <View style={styles.rsvpButtons}>
          {buttons.map((btn) => {
            const isActive = event?.myStatus === btn.status;
            return (
              <TouchableOpacity
                key={btn.status}
                style={[
                  styles.rsvpButton,
                  {
                    backgroundColor: isActive
                      ? btn.color
                      : isDark
                        ? "#2c2c2e"
                        : "#e5e5ea",
                  },
                ]}
                onPress={() => handleRespond(btn.status)}
                disabled={responding}
              >
                <Ionicons
                  name={btn.icon as any}
                  size={24}
                  color={isActive ? "#fff" : isDark ? "#fff" : "#000"}
                />
                <Text
                  style={[
                    styles.rsvpButtonText,
                    { color: isActive ? "#fff" : isDark ? "#fff" : "#000" },
                  ]}
                >
                  {t(`events.status.${btn.status}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderParticipants = () => {
    const goingParticipants = participants.filter((p) => p.status === "going");
    const interestedParticipants = participants.filter(
      (p) => p.status === "interested",
    );

    if (goingParticipants.length === 0 && interestedParticipants.length === 0) {
      return null;
    }

    return (
      <View style={styles.participantsContainer}>
        {goingParticipants.length > 0 && (
          <>
            <Text
              style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              {t("events.going")} ({goingParticipants.length})
            </Text>
            <View style={styles.participantsList}>
              {goingParticipants.slice(0, 8).map((p) => (
                <View key={p.id} style={styles.participant}>
                  {p.user.avatarUrl ? (
                    <Image
                      source={{ uri: p.user.avatarUrl }}
                      style={styles.participantAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.participantAvatarPlaceholder,
                        { backgroundColor: "#007AFF" },
                      ]}
                    >
                      <Text style={styles.participantInitial}>
                        {(p.user.displayName ||
                          p.user.username ||
                          "?")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.participantName,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                    numberOfLines={1}
                  >
                    {p.user.displayName ||
                      p.user.username ||
                      t("common.anonymous")}
                  </Text>
                </View>
              ))}
              {goingParticipants.length > 8 && (
                <View style={styles.moreParticipants}>
                  <Text style={styles.moreParticipantsText}>
                    +{goingParticipants.length - 8}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {interestedParticipants.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#fff" : "#000", marginTop: 16 },
              ]}
            >
              {t("events.interested")} ({interestedParticipants.length})
            </Text>
            <View style={styles.participantsList}>
              {interestedParticipants.slice(0, 8).map((p) => (
                <View key={p.id} style={styles.participant}>
                  {p.user.avatarUrl ? (
                    <Image
                      source={{ uri: p.user.avatarUrl }}
                      style={styles.participantAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.participantAvatarPlaceholder,
                        { backgroundColor: "#ff9500" },
                      ]}
                    >
                      <Text style={styles.participantInitial}>
                        {(p.user.displayName ||
                          p.user.username ||
                          "?")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: "" }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  if (!event) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Stack.Screen options={{ title: t("events.error") }} />
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <Text style={[styles.errorText, { color: isDark ? "#fff" : "#000" }]}>
          {t("events.notFound")}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{t("common.goBack")}</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerButton}
              >
                <Ionicons name="share-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              {isOrganizer && (
                <TouchableOpacity
                  onPress={showOrganizerMenu}
                  style={styles.headerButton}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        {event.coverImageUrl ? (
          <Image
            source={{ uri: event.coverImageUrl }}
            style={styles.coverImage}
          />
        ) : (
          <View
            style={[
              styles.coverPlaceholder,
              { backgroundColor: isDark ? "#2c2c2e" : "#e5e5ea" },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={48}
              color={isDark ? "#8e8e93" : "#aeaeb2"}
            />
          </View>
        )}

        <View style={styles.content}>
          {/* Status badges */}
          {(isCancelled || isPastEvent) && (
            <View
              style={[
                styles.statusLabel,
                { backgroundColor: isCancelled ? "#ff3b30" : "#8e8e93" },
              ]}
            >
              <Text style={styles.statusLabelText}>
                {isCancelled ? t("events.cancelled") : t("events.past")}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            {event.title}
          </Text>

          {/* Organizer */}
          <View style={styles.organizerRow}>
            {event.organizer.avatarUrl ? (
              <Image
                source={{ uri: event.organizer.avatarUrl }}
                style={styles.organizerAvatar}
              />
            ) : (
              <View
                style={[
                  styles.organizerAvatarPlaceholder,
                  { backgroundColor: "#007AFF" },
                ]}
              >
                <Text style={styles.organizerInitial}>
                  {(event.organizer.displayName ||
                    event.organizer.username ||
                    "?")[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text
                style={[
                  styles.organizerLabel,
                  { color: isDark ? "#8e8e93" : "#666" },
                ]}
              >
                {t("events.organizedBy")}
              </Text>
              <Text
                style={[
                  styles.organizerName,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                {event.organizer.displayName ||
                  event.organizer.username ||
                  t("common.anonymous")}
              </Text>
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={22} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoTitle,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {formatDate(event.startsAt)}
                </Text>
                <Text
                  style={[
                    styles.infoSubtitle,
                    { color: isDark ? "#8e8e93" : "#666" },
                  ]}
                >
                  {formatTime(event.startsAt)}
                  {event.endsAt && ` - ${formatTime(event.endsAt)}`}
                </Text>
              </View>
            </View>

            {/* Location */}
            {event.location && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={handleOpenLocation}
              >
                <Ionicons name="location-outline" size={22} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text
                    style={[
                      styles.infoTitle,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                    numberOfLines={2}
                  >
                    {event.location}
                  </Text>
                  <Text style={[styles.infoSubtitle, { color: "#007AFF" }]}>
                    {t("events.openInMaps")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Stats */}
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={22} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoTitle,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {t("events.peopleGoing", { count: event.goingCount })}
                </Text>
                {event.interestedCount > 0 && (
                  <Text
                    style={[
                      styles.infoSubtitle,
                      { color: isDark ? "#8e8e93" : "#666" },
                    ]}
                  >
                    {t("events.peopleInterested", {
                      count: event.interestedCount,
                    })}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                {t("events.description")}
              </Text>
              <Text
                style={[
                  styles.descriptionText,
                  { color: isDark ? "#d1d1d6" : "#333" },
                ]}
              >
                {event.description}
              </Text>
            </View>
          )}

          {/* RSVP Buttons */}
          {renderRSVPButtons()}

          {/* Participants */}
          {renderParticipants()}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  coverImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  coverPlaceholder: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
    gap: 20,
  },
  statusLabel: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusLabelText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  organizerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  organizerAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  organizerInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  organizerLabel: {
    fontSize: 12,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  descriptionSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  rsvpContainer: {
    gap: 12,
  },
  rsvpButtons: {
    flexDirection: "row",
    gap: 10,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  participantsContainer: {
    gap: 12,
  },
  participantsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  participant: {
    alignItems: "center",
    width: 70,
    gap: 6,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  participantAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  participantInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  participantName: {
    fontSize: 12,
    textAlign: "center",
  },
  moreParticipants: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  moreParticipantsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
