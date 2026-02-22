/**
 * Profile Setup Screen — Post-signup onboarding (3 steps)
 *
 * Step 1: Display name + username with real-time validation
 * Step 2: Avatar selection (camera / gallery / skip)
 * Step 3: Theme selection (light / dark / system)
 *
 * Saves to Supabase profile + user-store + AsyncStorage flag
 */

import type { ThemePresetId } from "@/constants/theme-presets";
import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing, useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";
import { useUserStore } from "@/stores/user-store";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Href, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PROFILE_SETUP_COMPLETED_KEY = "profile_setup_completed";
const TOTAL_STEPS = 3;

type ThemeOption = ThemePresetId | "system";

export default function ProfileSetupScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();
  const { setPreset, setSystemMode } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { setPreferences, updateProfile } = useUserStore();

  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>("system");
  const [saving, setSaving] = useState(false);

  const usernameCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ─── Username validation ───
  const validateUsername = useCallback(
    (value: string) => {
      // Sanitize: lowercase, no spaces, alphanumeric + underscores
      const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");

      if (sanitized.length < 3) {
        setUsernameError(
          t("profileSetup.usernameTooShort", {
            defaultValue: "3 characters minimum",
          }),
        );
        return;
      }
      if (sanitized.length > 20) {
        setUsernameError(
          t("profileSetup.usernameTooLong", {
            defaultValue: "20 characters maximum",
          }),
        );
        return;
      }

      // Debounce uniqueness check
      setUsernameChecking(true);
      if (usernameCheckTimeout.current)
        clearTimeout(usernameCheckTimeout.current);

      usernameCheckTimeout.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", sanitized)
            .neq("id", user?.id ?? "")
            .maybeSingle();

          if (error) {
            console.error("Username check error:", error);
            setUsernameError(null);
          } else if (data) {
            setUsernameError(
              t("profileSetup.usernameTaken", {
                defaultValue: "Username already taken",
              }),
            );
          } else {
            setUsernameError(null);
          }
        } catch {
          setUsernameError(null);
        } finally {
          setUsernameChecking(false);
        }
      }, 500);
    },
    [user?.id, t],
  );

  const handleUsernameChange = useCallback(
    (text: string) => {
      const sanitized = text.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setUsername(sanitized);
      if (sanitized.length > 0) {
        validateUsername(sanitized);
      } else {
        setUsernameError(null);
        setUsernameChecking(false);
      }
    },
    [validateUsername],
  );

  // ─── Avatar picker ───
  const pickAvatar = useCallback(async (source: "camera" | "gallery") => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission needed", "Camera access is required.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission needed", "Photo library access is required.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
    }
  }, []);

  // ─── Theme selection ───
  const handleThemeSelect = useCallback(
    (theme: ThemeOption) => {
      setSelectedTheme(theme);
      // Live preview
      if (theme === "system") {
        setSystemMode();
      } else {
        setPreset(theme);
      }
    },
    [setPreset, setSystemMode],
  );

  // ─── Navigation ───
  const animateProgress = useCallback(
    (toStep: number) => {
      Animated.spring(progressAnim, {
        toValue: toStep / (TOTAL_STEPS - 1),
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    },
    [progressAnim],
  );

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      animateProgress(nextStep);
    }
  }, [currentStep, animateProgress]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      animateProgress(prevStep);
    }
  }, [currentStep, animateProgress]);

  // ─── Save & complete ───
  const uploadAvatar = useCallback(
    async (uri: string): Promise<string | null> => {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const ext = uri.split(".").pop() || "jpg";
        const filePath = `avatars/${user?.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, {
            contentType: `image/${ext}`,
            upsert: true,
          });

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
          return null;
        }

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        return data.publicUrl;
      } catch (error) {
        console.error("Avatar upload failed:", error);
        return null;
      }
    },
    [user?.id],
  );

  const handleComplete = useCallback(async () => {
    setSaving(true);

    try {
      // Upload avatar if selected
      let avatarUrl: string | null = null;
      if (avatarUri) {
        avatarUrl = await uploadAvatar(avatarUri);
      }

      // Update Supabase profile
      const updates: Record<string, string> = {};
      if (displayName.trim()) updates.display_name = displayName.trim();
      if (username.trim()) updates.username = username.trim();
      if (avatarUrl) updates.avatar_url = avatarUrl;

      if (Object.keys(updates).length > 0 && user?.id) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) {
          console.error("Profile update error:", error);
          // Don't block — continue anyway
        }
      }

      // Update user-store
      if (displayName.trim() || username.trim() || avatarUrl) {
        updateProfile({
          ...(displayName.trim() && { display_name: displayName.trim() }),
          ...(username.trim() && { username: username.trim() }),
          ...(avatarUrl && { avatar_url: avatarUrl }),
        });
      }

      // Save theme preference
      setPreferences({ theme: selectedTheme });
      if (selectedTheme === "system") {
        setSystemMode();
      } else {
        setPreset(selectedTheme);
      }

      // Mark profile setup as completed
      await AsyncStorage.setItem(PROFILE_SETUP_COMPLETED_KEY, "true");

      // Navigate to main app
      router.replace("/(tabs)" as Href);
    } catch (error) {
      console.error("Profile setup error:", error);
      Alert.alert(
        t("common.error"),
        t("profileSetup.saveError", {
          defaultValue: "Failed to save profile. Please try again.",
        }),
      );
    } finally {
      setSaving(false);
    }
  }, [
    avatarUri,
    displayName,
    username,
    selectedTheme,
    user?.id,
    uploadAvatar,
    updateProfile,
    setPreferences,
    setPreset,
    setSystemMode,
    router,
    t,
  ]);

  const handleSkip = useCallback(async () => {
    await AsyncStorage.setItem(PROFILE_SETUP_COMPLETED_KEY, "true");
    router.replace("/(tabs)" as Href);
  }, [router]);

  // ─── Step validation ───
  const canProceedStep0 =
    displayName.trim().length >= 2 &&
    username.length >= 3 &&
    !usernameError &&
    !usernameChecking;
  const canProceedStep1 = true; // Avatar is optional
  const canProceedStep2 = true; // Theme always has a selection

  // ─── Render steps ───
  const renderStep0 = () => (
    <ScrollView
      contentContainerStyle={styles.stepContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.stepHeader}>
        <Ionicons name="person" size={48} color={colors.primary} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {t("profileSetup.nameTitle", {
            defaultValue: "What should we call you?",
          })}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
          {t("profileSetup.nameSubtitle", {
            defaultValue: "Choose a display name and a unique username.",
          })}
        </Text>
      </View>

      {/* Display Name */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
          {t("profileSetup.displayName", { defaultValue: "Display Name" })}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t("profileSetup.displayNamePlaceholder", {
            defaultValue: "Your name",
          })}
          placeholderTextColor={colors.textMuted}
          maxLength={30}
          autoFocus
        />
      </View>

      {/* Username */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
          {t("profileSetup.username", { defaultValue: "Username" })}
        </Text>
        <View
          style={[
            styles.usernameContainer,
            {
              backgroundColor: colors.surface,
              borderColor: usernameError ? "#ef4444" : colors.border,
            },
          ]}
        >
          <Text style={[styles.usernamePrefix, { color: colors.textMuted }]}>
            @
          </Text>
          <TextInput
            style={[styles.usernameInput, { color: colors.text }]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder={t("profileSetup.usernamePlaceholder", {
              defaultValue: "username",
            })}
            placeholderTextColor={colors.textMuted}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {usernameChecking && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
          {!usernameChecking && username.length >= 3 && !usernameError && (
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          )}
          {!usernameChecking && usernameError && (
            <Ionicons name="close-circle" size={20} color="#ef4444" />
          )}
        </View>
        {usernameError && (
          <Text style={styles.usernameErrorText}>{usernameError}</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="camera" size={48} color={colors.primary} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {t("profileSetup.avatarTitle", {
            defaultValue: "Add a profile photo",
          })}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
          {t("profileSetup.avatarSubtitle", {
            defaultValue: "This helps your friends recognize you.",
          })}
        </Text>
      </View>

      {/* Avatar preview */}
      <View style={styles.avatarPreviewContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="person" size={64} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Picker buttons */}
      <View style={styles.avatarButtons}>
        <TouchableOpacity
          style={[styles.avatarButton, { backgroundColor: colors.primary }]}
          onPress={() => pickAvatar("camera")}
        >
          <Ionicons name="camera-outline" size={22} color="#fff" />
          <Text style={styles.avatarButtonText}>
            {t("profileSetup.takePhoto", { defaultValue: "Take Photo" })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.avatarButton,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
          onPress={() => pickAvatar("gallery")}
        >
          <Ionicons name="images-outline" size={22} color={colors.text} />
          <Text style={[styles.avatarButtonText, { color: colors.text }]}>
            {t("profileSetup.choosePhoto", { defaultValue: "Choose Photo" })}
          </Text>
        </TouchableOpacity>
      </View>

      {avatarUri && (
        <TouchableOpacity
          onPress={() => setAvatarUri(null)}
          style={styles.removeAvatar}
        >
          <Text style={{ color: "#ef4444", fontSize: 14 }}>
            {t("profileSetup.removePhoto", { defaultValue: "Remove photo" })}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep2 = () => {
    const themes: {
      key: ThemeOption;
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      desc: string;
    }[] = [
      {
        key: "light",
        icon: "sunny",
        label: t("profileSetup.themeLight", { defaultValue: "Light" }),
        desc: t("profileSetup.themeLightDesc", {
          defaultValue: "Clean and bright",
        }),
      },
      {
        key: "dark",
        icon: "moon",
        label: t("profileSetup.themeDark", { defaultValue: "Dark" }),
        desc: t("profileSetup.themeDarkDesc", {
          defaultValue: "Easy on the eyes",
        }),
      },
      {
        key: "system",
        icon: "phone-portrait",
        label: t("profileSetup.themeSystem", { defaultValue: "System" }),
        desc: t("profileSetup.themeSystemDesc", {
          defaultValue: "Follow device settings",
        }),
      },
    ];

    return (
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Ionicons name="color-palette" size={48} color={colors.primary} />
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("profileSetup.themeTitle", { defaultValue: "Choose your look" })}
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
            {t("profileSetup.themeSubtitle", {
              defaultValue: "You can change this later in settings.",
            })}
          </Text>
        </View>

        <View style={styles.themeOptions}>
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme.key;
            return (
              <TouchableOpacity
                key={theme.key}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleThemeSelect(theme.key)}
              >
                <Ionicons
                  name={theme.icon}
                  size={32}
                  color={isSelected ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.themeLabel, { color: colors.text }]}>
                  {theme.label}
                </Text>
                <Text style={[styles.themeDesc, { color: colors.textMuted }]}>
                  {theme.desc}
                </Text>
                {isSelected && (
                  <View
                    style={[
                      styles.themeCheck,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      default:
        return null;
    }
  };

  const canProceed = [canProceedStep0, canProceedStep1, canProceedStep2][
    currentStep
  ];
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header with progress */}
      <View style={[styles.header, { paddingTop: spacing.xl + 40 }]}>
        <View style={styles.headerRow}>
          {currentStep > 0 ? (
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>
            {currentStep + 1} / {TOTAL_STEPS}
          </Text>

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>
              {t("profileSetup.skip", { defaultValue: "Skip" })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: progressWidth },
            ]}
          />
        </View>
      </View>

      {/* Step content */}
      <View style={styles.content}>{renderCurrentStep()}</View>

      {/* Bottom action button */}
      <View style={[styles.bottomActions, { paddingBottom: spacing.xl + 20 }]}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor:
                canProceed || isLastStep ? colors.primary : colors.border,
            },
          ]}
          onPress={isLastStep ? handleComplete : goNext}
          disabled={(!canProceed && !isLastStep) || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>
              {isLastStep
                ? t("profileSetup.finish", { defaultValue: "Let's go!" })
                : t("onboarding.next", { defaultValue: "Next" })}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: "500",
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  stepSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  // ─── Step 0: Name/Username ───
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  usernamePrefix: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  usernameErrorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // ─── Step 1: Avatar ───
  avatarPreviewContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  avatarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  avatarButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  removeAvatar: {
    alignItems: "center",
    marginTop: 16,
  },
  // ─── Step 2: Theme ───
  themeOptions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  themeCard: {
    width: (SCREEN_WIDTH - 72) / 3,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 12,
    position: "relative",
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
  },
  themeDesc: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  themeCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  // ─── Bottom ───
  bottomActions: {
    paddingHorizontal: 24,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
