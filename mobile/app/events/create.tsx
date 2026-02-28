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
import { format } from "date-fns";
import { enUS, fr, ja } from "date-fns/locale";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { createEvent, CreateEventParams } from "@/services/events";

export default function CreateEventScreen() {
  const router = useRouter();
  const { theme, mode } = useTheme();
  const { t, locale: appLocale } = useI18n();
  const isDark = mode === "dark";

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
    const lang = appLocale;
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

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(startsAt);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartsAt(newDate);
    }
  };

  const handleStartTimeChange = (_event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(startsAt);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setStartsAt(newDate);
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newDate = endsAt ? new Date(endsAt) : new Date(startsAt);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setEndsAt(newDate);
    }
  };

  const handleEndTimeChange = (_event: any, selectedTime?: Date) => {
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

      {/* Date/Time Pickers - Simple version */}
      {showStartDatePicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
          <Text style={[styles.pickerTitle, { color: isDark ? '#fff' : '#000' }]}>{t("events.startsAt")} - {t("events.date") || "Date"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {Array.from({ length: 30 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() + i);
              const isSelected = startsAt.toDateString() === d.toDateString();
              return (
                <TouchableOpacity key={i} style={[styles.pickerOption, { backgroundColor: isSelected ? '#007AFF' : (isDark ? '#2c2c2e' : '#f2f2f7'), borderColor: isSelected ? '#007AFF' : (isDark ? '#3a3a3c' : '#e5e5ea') }]} onPress={() => handleStartDateChange(null, d)}>
                  <Text style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : '#000'), fontWeight: '600', fontSize: 13 }}>{format(d, 'EEE', { locale: getDateLocale() })}</Text>
                  <Text style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : '#000'), fontSize: 15, fontWeight: '700' }}>{d.getDate()}</Text>
                  <Text style={{ color: isSelected ? '#ddd' : (isDark ? '#8e8e93' : '#aeaeb2'), fontSize: 11 }}>{format(d, 'MMM', { locale: getDateLocale() })}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowStartDatePicker(false)} style={styles.pickerClose}>
            <Text style={{ color: '#007AFF' }}>{t("common.done") || "OK"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {showStartTimePicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
          <Text style={[styles.pickerTitle, { color: isDark ? '#fff' : '#000' }]}>{t("events.startsAt")} - {t("events.time") || "Heure"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {Array.from({ length: 48 }, (_, i) => {
              const h = Math.floor(i / 2); const m = (i % 2) * 30;
              const isSelected = startsAt.getHours() === h && Math.abs(startsAt.getMinutes() - m) < 15;
              const d = new Date(startsAt); d.setHours(h, m, 0, 0);
              return (
                <TouchableOpacity key={i} style={[styles.pickerOption, { backgroundColor: isSelected ? '#007AFF' : (isDark ? '#2c2c2e' : '#f2f2f7'), borderColor: isSelected ? '#007AFF' : (isDark ? '#3a3a3c' : '#e5e5ea') }]} onPress={() => handleStartTimeChange(null, d)}>
                  <Text style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : '#000'), fontSize: 15, fontWeight: '600' }}>{`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowStartTimePicker(false)} style={styles.pickerClose}>
            <Text style={{ color: '#007AFF' }}>{t("common.done") || "OK"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {showEndDatePicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
          <Text style={[styles.pickerTitle, { color: isDark ? '#fff' : '#000' }]}>{t("events.endsAt")} - {t("events.date") || "Date"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {Array.from({ length: 30 }, (_, i) => {
              const d = new Date(startsAt); d.setDate(d.getDate() + i);
              const base = endsAt || startsAt;
              const isSelected = base.toDateString() === d.toDateString();
              return (
                <TouchableOpacity key={i} style={[styles.pickerOption, { backgroundColor: isSelected ? '#007AFF' : (isDark ? '#2c2c2e' : '#f2f2f7'), borderColor: isSelected ? '#007AFF' : (isDark ? '#3a3a3c' : '#e5e5ea') }]} onPress={() => handleEndDateChange(null, d)}>
                  <Text style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : '#000'), fontWeight: '600', fontSize: 13 }}>{format(d, 'EEE', { locale: getDateLocale() })}</Text>
                  <Text style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : '#000'), fontSize: 15, fontWeight: '700' }}>{d.getDate()}</Text>
                  <Text style={{ color: isSelected ? '#ddd' : (isDark ? '#8e8e93' : '#aeaeb2'), fontSize: 11 }}>{format(d, 'MMM', { locale: getDateLocale() })}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowEndDatePicker(false)} style={styles.pickerClose}>
            <Text style={{ color: '#007AFF' }}>{t("common.done") || "OK"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {showEndTimePicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
          <Text style={[styles.pickerTitle, { color: isDark ? '#fff' : '#000' }]}>{t("events.endsAt")} - {t("events.time") || "Heure"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {Array.from({ length: 48 }, (_, i) => {
              const h = Math.floor(i / 2); const m = (i % 2) * 30;
              const base = endsAt || startsAt;
              const isSelected = base.getHours() === h && Math.abs(base.getMinutes() - m) < 15;
              const d = new Date(base); d.setHours(h, m, 0, 0);
              return (
                <TouchableOpacity key={i} style={[styles.pickerOption, { backgroundColor: isSelected ? '#007AFF' : (isDark ? '#2c2c2e' : '#f2f2f7'), borderColor: isSelected ? '#007AFF' : (isDark ? '#3a3a3c' : '#e5e5ea') }]} onPress={() => handleEndTimeChange(null, d)}>
                  <Text style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : '#000'), fontSize: 15, fontWeight: '600' }}>{`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowEndTimePicker(false)} style={styles.pickerClose}>
            <Text style={{ color: '#007AFF' }}>{t("common.done") || "OK"}</Text>
          </TouchableOpacity>
        </View>
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
  pickerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  pickerScroll: {
    maxHeight: 80,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    alignItems: "center",
    minWidth: 56,
  },
  pickerClose: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});
