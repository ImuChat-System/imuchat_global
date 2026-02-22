/**
 * Create Event Screen
 *
 * DEV-013: Form to create a new event
 * - Title, description
 * - Date/time picker
 * - Location
 * - Max participants (optional)
 * - Public/private toggle
 */

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { enUS, fr, ja } from "date-fns/locale";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { createEvent, CreateEventParams } from "@/services/events";
import i18n from "@/services/i18n";

export default function CreateEventScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState(new Date(Date.now() + 3600000)); // +1h
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const getDateLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith("fr")) return fr;
    if (lang.startsWith("ja")) return ja;
    return enUS;
  };

  const formatDateDisplay = (date: Date) => {
    return format(date, "EEE d MMM yyyy", { locale: getDateLocale() });
  };

  const formatTimeDisplay = (date: Date) => {
    return format(date, "HH:mm", { locale: getDateLocale() });
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert(t("events.error"), t("events.titleRequired"));
      return;
    }

    if (startsAt < new Date()) {
      Alert.alert(t("events.error"), t("events.dateInPast"));
      return;
    }

    if (endsAt && endsAt <= startsAt) {
      Alert.alert(t("events.error"), t("events.endBeforeStart"));
      return;
    }

    setSubmitting(true);

    const params: CreateEventParams = {
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString(),
      maxParticipants: maxParticipants
        ? parseInt(maxParticipants, 10)
        : undefined,
      isPublic,
    };

    const event = await createEvent(params);

    setSubmitting(false);

    if (event) {
      router.replace(`/events/${event.id}`);
    } else {
      Alert.alert(t("events.error"), t("events.createFailed"));
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(startsAt);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartsAt(newDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(startsAt);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setStartsAt(newDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newDate = endsAt ? new Date(endsAt) : new Date(startsAt);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setEndsAt(newDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newDate = endsAt ? new Date(endsAt) : new Date(startsAt);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEndsAt(newDate);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? "#1c1c1e" : "#fff",
      color: isDark ? "#fff" : "#000",
      borderColor: isDark ? "#3a3a3c" : "#e5e5ea",
    },
  ];

  const labelStyle = [styles.label, { color: isDark ? "#fff" : "#000" }];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("events.createEvent"),
          headerRight: () =>
            submitting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
                <Text style={styles.submitButton}>{t("common.create")}</Text>
              </TouchableOpacity>
            ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.field}>
            <Text style={labelStyle}>{t("events.eventTitle")} *</Text>
            <TextInput
              style={inputStyle}
              value={title}
              onChangeText={setTitle}
              placeholder={t("events.eventTitlePlaceholder")}
              placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={labelStyle}>{t("events.eventDescription")}</Text>
            <TextInput
              style={[inputStyle, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={t("events.eventDescriptionPlaceholder")}
              placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={2000}
            />
          </View>

          {/* Start Date/Time */}
          <View style={styles.field}>
            <Text style={labelStyle}>{t("events.startsAt")} *</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
                ]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text
                  style={[
                    styles.dateButtonText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {formatDateDisplay(startsAt)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timeButton,
                  { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
                ]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text
                  style={[
                    styles.dateButtonText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {formatTimeDisplay(startsAt)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* End Date/Time */}
          <View style={styles.field}>
            <Text style={labelStyle}>{t("events.endsAt")}</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
                ]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text
                  style={[
                    styles.dateButtonText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {endsAt ? formatDateDisplay(endsAt) : t("events.optional")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timeButton,
                  { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
                ]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text
                  style={[
                    styles.dateButtonText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {endsAt ? formatTimeDisplay(endsAt) : "--:--"}
                </Text>
              </TouchableOpacity>
            </View>
            {endsAt && (
              <TouchableOpacity
                style={styles.clearEndDate}
                onPress={() => setEndsAt(null)}
              >
                <Text style={styles.clearEndDateText}>
                  {t("events.clearEndDate")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={labelStyle}>{t("events.location")}</Text>
            <TextInput
              style={inputStyle}
              value={location}
              onChangeText={setLocation}
              placeholder={t("events.locationPlaceholder")}
              placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
              maxLength={200}
            />
          </View>

          {/* Max Participants */}
          <View style={styles.field}>
            <Text style={labelStyle}>{t("events.maxParticipants")}</Text>
            <TextInput
              style={[inputStyle, styles.numberInput]}
              value={maxParticipants}
              onChangeText={(text) =>
                setMaxParticipants(text.replace(/[^0-9]/g, ""))
              }
              placeholder={t("events.unlimited")}
              placeholderTextColor={isDark ? "#8e8e93" : "#aeaeb2"}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {/* Public/Private */}
          <View style={styles.switchField}>
            <View style={styles.switchInfo}>
              <Text style={labelStyle}>{t("events.publicEvent")}</Text>
              <Text
                style={[
                  styles.switchDescription,
                  { color: isDark ? "#8e8e93" : "#666" },
                ]}
              >
                {isPublic
                  ? t("events.publicEventDescription")
                  : t("events.privateEventDescription")}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ true: "#34c759", false: "#8e8e93" }}
              thumbColor="#fff"
            />
          </View>

          {/* Submit Button (mobile) */}
          <TouchableOpacity
            style={[
              styles.createButton,
              submitting && styles.createButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>
                {t("events.createEvent")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startsAt}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          value={startsAt}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
          is24Hour={true}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endsAt || startsAt}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startsAt}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          value={endsAt || startsAt}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
          is24Hour={true}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  submitButton: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "600",
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  numberInput: {
    width: 120,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a3a3c",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a3a3c",
  },
  dateButtonText: {
    fontSize: 15,
  },
  clearEndDate: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  clearEndDateText: {
    color: "#ff3b30",
    fontSize: 14,
  },
  switchField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  switchInfo: {
    flex: 1,
    gap: 4,
  },
  switchDescription: {
    fontSize: 13,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
