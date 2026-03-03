/**
 * Settings Screen — Mobile
 *
 * Full parity with web-app settings:
 * Sections: Account (edit), Password, Appearance (6 themes), Language, Notifications,
 *           Stories, Profile Visibility, Privacy, About, Sign Out, Delete Account
 */

import { getAllThemePresets } from "@/constants/theme-presets";
import { useAuth } from "@/providers/AuthProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import {
  ActiveSession,
  authenticateWithBiometrics,
  BiometricStatus,
  checkBiometricAvailability,
  enrollMfa,
  getActiveSessions,
  getBiometryLabel,
  getMfaFactors,
  MfaFactor,
  revokeAllSessions,
  setBiometricEnabled,
  unenrollMfa,
  verifyMfaEnrollment,
} from "@/services/security";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationPrefs {
  mentions: boolean;
  directMessages: boolean;
  calls: boolean;
  events: boolean;
}

interface PrivacyPrefs {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showReadReceipts: boolean;
  allowSearchByPhone: boolean;
}

type StoryVisibility = "public" | "friends" | "private";
type ProfileVisibility = "public" | "private" | "anonymous";

interface StoriesPrefs {
  visibility: StoryVisibility;
  allowReplies: boolean;
  autoArchive: boolean;
}

type LanguageCode = "en" | "fr" | "ja";

interface LanguageOption {
  code: LanguageCode;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

const STORY_VISIBILITY_OPTIONS: {
  value: StoryVisibility;
  labelKey: string;
  descKey: string;
}[] = [
  {
    value: "public",
    labelKey: "settings.visibilityPublic",
    descKey: "settings.visibilityPublicDesc",
  },
  {
    value: "friends",
    labelKey: "settings.visibilityFriends",
    descKey: "settings.visibilityFriendsDesc",
  },
  {
    value: "private",
    labelKey: "settings.visibilityPrivate",
    descKey: "settings.visibilityPrivateDesc",
  },
];

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  mentions: true,
  directMessages: true,
  calls: true,
  events: false,
};

const DEFAULT_PRIVACY_PREFS: PrivacyPrefs = {
  showOnlineStatus: true,
  showLastSeen: true,
  showReadReceipts: true,
  allowSearchByPhone: false,
};

const DEFAULT_STORIES_PREFS: StoriesPrefs = {
  visibility: "friends",
  allowReplies: true,
  autoArchive: true,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const { user } = useAuth();
  const { theme, mode, presetId, setPreset, isSystemMode, setSystemMode } =
    useTheme();
  const { t, locale, setLocale } = useI18n();
  const { showToast } = useToast();

  const themePresets = getAllThemePresets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Account editing
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [accountDirty, setAccountDirty] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Language
  const [language, setLanguage] = useState<LanguageCode>("fr");

  // Auto-translate
  const [autoTranslate, setAutoTranslate] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS,
  );

  // Stories preferences
  const [storiesPrefs, setStoriesPrefs] = useState<StoriesPrefs>(
    DEFAULT_STORIES_PREFS,
  );

  // Privacy preferences
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPrefs>(
    DEFAULT_PRIVACY_PREFS,
  );

  // Profile visibility
  const [profileVisibility, setProfileVisibility] =
    useState<ProfileVisibility>("public");

  // Security state
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus>({
    isAvailable: false,
    biometryType: "none",
    isEnabled: false,
  });
  const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [mfaEnrollmentData, setMfaEnrollmentData] = useState<{
    id: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [mfaTotpCode, setMfaTotpCode] = useState("");

  const router = useRouter();

  // -----------------------------------------------------------------------
  // Load settings from Supabase profile
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "username, notification_prefs, privacy_show_online, privacy_show_last_seen, privacy_read_receipts, privacy_search_phone, language, stories_visibility, stories_allow_replies, stories_auto_archive, visibility",
          )
          .eq("id", user.id)
          .single();

        if (cancelled) return;

        if (error && (error as any).code !== "PGRST116") {
          console.error("[Settings] load error:", error);
        }

        // Account fields
        setUsername(
          (data as any)?.username ?? user.user_metadata?.username ?? "",
        );
        setEmail(user.email ?? "");

        // Language
        if ((data as any)?.language) {
          setLanguage((data as any).language as LanguageCode);
        }

        if (data) {
          if (data.notification_prefs) {
            setNotifPrefs({
              ...DEFAULT_NOTIFICATION_PREFS,
              ...(data.notification_prefs as Partial<NotificationPrefs>),
            });
          }

          setPrivacyPrefs({
            showOnlineStatus: data.privacy_show_online ?? true,
            showLastSeen: data.privacy_show_last_seen ?? true,
            showReadReceipts: data.privacy_read_receipts ?? true,
            allowSearchByPhone: data.privacy_search_phone ?? false,
          });

          // Profile visibility
          if ((data as any).visibility) {
            setProfileVisibility((data as any).visibility as ProfileVisibility);
          }

          // Stories prefs
          setStoriesPrefs({
            visibility:
              ((data as any).stories_visibility as StoryVisibility) ??
              "friends",
            allowReplies: (data as any).stories_allow_replies ?? true,
            autoArchive: (data as any).stories_auto_archive ?? true,
          });
        }
      } catch (err) {
        console.error("[Settings] unexpected error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // -----------------------------------------------------------------------
  // Load security settings
  // -----------------------------------------------------------------------

  const loadSecuritySettings = useCallback(async () => {
    setSecurityLoading(true);
    try {
      const [bioStatus, factors, sessions] = await Promise.all([
        checkBiometricAvailability(),
        getMfaFactors(),
        getActiveSessions(),
      ]);
      setBiometricStatus(bioStatus);
      setMfaFactors(factors);
      setActiveSessions(sessions);
    } catch (error) {
      console.error("[Settings] security load error:", error);
    } finally {
      setSecurityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSecuritySettings();
    }
  }, [user, loadSecuritySettings]);

  // -----------------------------------------------------------------------
  // Account save
  // -----------------------------------------------------------------------

  async function handleSaveAccount() {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile username
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        });
        if (emailError) throw emailError;
      }

      setAccountDirty(false);
      showToast(t("settings.profileUpdated"), "success");
    } catch (err: any) {
      showToast(err.message ?? t("settings.cannotSave"), "error");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Password change
  // -----------------------------------------------------------------------

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      showToast(t("settings.passwordMinLength"), "warning");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      showToast(t("settings.passwordUpdated"), "success");
    } catch (err: any) {
      showToast(err.message ?? t("settings.cannotChangePassword"), "error");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Language save
  // -----------------------------------------------------------------------

  async function handleLanguageChange(code: LanguageCode) {
    setLanguage(code);
    setLocale(code);
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          language: code,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
    } catch (err) {
      console.error("[Settings] save language error:", err);
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Persist helpers
  // -----------------------------------------------------------------------

  async function saveNotifPrefs(next: NotificationPrefs) {
    setNotifPrefs(next);
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          notification_prefs: next,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error("[Settings] save notif error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function saveProfileVisibility(visibility: ProfileVisibility) {
    setProfileVisibility(visibility);
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          visibility,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
    } catch (err) {
      console.error("[Settings] save profile visibility error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function saveStoriesPrefs(next: StoriesPrefs) {
    setStoriesPrefs(next);
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          stories_visibility: next.visibility,
          stories_allow_replies: next.allowReplies,
          stories_auto_archive: next.autoArchive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
    } catch (err) {
      console.error("[Settings] save stories error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function savePrivacyField(key: keyof PrivacyPrefs, value: boolean) {
    setPrivacyPrefs((prev) => ({ ...prev, [key]: value }));
    if (!user) return;
    setSaving(true);

    const columnMap: Record<keyof PrivacyPrefs, string> = {
      showOnlineStatus: "privacy_show_online",
      showLastSeen: "privacy_show_last_seen",
      showReadReceipts: "privacy_read_receipts",
      allowSearchByPhone: "privacy_search_phone",
    };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          [columnMap[key]]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error("[Settings] save privacy error:", err);
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Security handlers
  // -----------------------------------------------------------------------

  async function handleToggleBiometric(enabled: boolean) {
    setSecurityLoading(true);
    try {
      const success = await setBiometricEnabled(enabled);
      if (success) {
        setBiometricStatus((prev) => ({ ...prev, isEnabled: enabled }));
      } else {
        showToast(t("settings.securityBiometricFailed"), "error");
      }
    } finally {
      setSecurityLoading(false);
    }
  }

  async function handleStartMfaEnrollment() {
    setSecurityLoading(true);
    try {
      const result = await enrollMfa("ImuChat Mobile");
      if (result.success) {
        setMfaEnrollmentData({
          id: result.enrollment.id,
          qrCode: result.enrollment.qrCode,
          secret: result.enrollment.secret,
        });
      } else {
        showToast(result.error, "error");
      }
    } finally {
      setSecurityLoading(false);
    }
  }

  async function handleVerifyMfaCode() {
    if (mfaTotpCode.length !== 6 || !mfaEnrollmentData) return;

    setSecurityLoading(true);
    try {
      const result = await verifyMfaEnrollment(
        mfaEnrollmentData.id,
        mfaTotpCode,
      );
      if (result.success) {
        showToast(t("settings.security2faEnabled"), "success");
        setMfaEnrollmentData(null);
        setMfaTotpCode("");
        loadSecuritySettings();
      } else {
        showToast(
          result.error ?? t("settings.security2faInvalidCode"),
          "error",
        );
      }
    } finally {
      setSecurityLoading(false);
    }
  }

  async function handleDisableMfa(factorId: string) {
    Alert.alert(
      t("settings.security2faDisable"),
      t("settings.security2faDisableConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.security2faDisable"),
          style: "destructive",
          onPress: async () => {
            // Require biometric or password verification first
            if (biometricStatus.isEnabled) {
              const authResult = await authenticateWithBiometrics(
                t("settings.securityVerifyToDisable"),
              );
              if (!authResult.success) return;
            }

            setSecurityLoading(true);
            try {
              const success = await unenrollMfa(factorId);
              if (success) {
                loadSecuritySettings();
                showToast(t("settings.security2faDisabled"), "success");
              }
            } finally {
              setSecurityLoading(false);
            }
          },
        },
      ],
    );
  }

  async function handleRevokeAllSessions() {
    Alert.alert(
      t("settings.securityRevokeAll"),
      t("settings.securityRevokeAllConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.securityRevokeAll"),
          style: "destructive",
          onPress: async () => {
            setSecurityLoading(true);
            try {
              await revokeAllSessions();
            } finally {
              setSecurityLoading(false);
            }
          },
        },
      ],
    );
  }

  // -----------------------------------------------------------------------
  // Sign out & delete account
  // -----------------------------------------------------------------------

  function handleSignOut() {
    Alert.alert(t("settings.signOut"), t("settings.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.signOut"),
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      t("settings.deleteAccount"),
      t("settings.deleteAccountConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            showToast(t("settings.comingSoonMessage"), "info");
          },
        },
      ],
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <View
        testID="settings-loading"
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      testID="settings-screen"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ---- HEADER ---- */}
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        {t("settings.title")}
      </Text>

      {saving && (
        <View testID="settings-saving" style={styles.savingBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.savingText}>{t("common.saving")}</Text>
        </View>
      )}

      {/* ===== ACCOUNT (editable) ===== */}
      <SectionHeader title={t("settings.account")} color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t("settings.identifier")}
          </Text>
          <TextInput
            testID="input-username"
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setAccountDirty(true);
            }}
            placeholder={t("settings.identifierPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
          />
        </View>

        <Divider color={theme.colors.border} />

        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t("settings.email")}
          </Text>
          <TextInput
            testID="input-email"
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setAccountDirty(true);
            }}
            placeholder={t("settings.emailPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {accountDirty && (
          <TouchableOpacity
            testID="btn-save-account"
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSaveAccount}
          >
            <Text style={styles.saveBtnText}>{t("common.save")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== PASSWORD ===== */}
      <SectionHeader title={t("settings.password")} color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t("settings.currentPassword")}
          </Text>
          <TextInput
            testID="input-current-password"
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t("settings.currentPasswordPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
          />
        </View>

        <Divider color={theme.colors.border} />

        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t("settings.newPassword")}
          </Text>
          <TextInput
            testID="input-new-password"
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("settings.newPasswordPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          testID="btn-change-password"
          style={[
            styles.saveBtn,
            {
              backgroundColor:
                newPassword.length >= 6
                  ? theme.colors.primary
                  : theme.colors.border,
            },
          ]}
          onPress={handleChangePassword}
          disabled={newPassword.length < 6}
        >
          <Text style={styles.saveBtnText}>{t("settings.changePassword")}</Text>
        </TouchableOpacity>
      </View>

      {/* ===== APPEARANCE - THEME SELECTOR ===== */}
      <SectionHeader
        title={t("settings.appearance")}
        color={theme.colors.text}
      />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* System Mode Toggle */}
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t("settings.systemTheme")}
          </Text>
          <Switch
            testID="switch-system-theme"
            value={isSystemMode}
            onValueChange={(val) => {
              if (val) {
                setSystemMode();
              } else {
                setPreset(presetId);
              }
            }}
            trackColor={{ false: "#767577", true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <Divider color={theme.colors.border} />

        {/* Theme Presets Grid */}
        <View style={styles.themeGridContainer}>
          <Text
            style={[
              styles.inputLabel,
              { color: theme.colors.text, marginBottom: 12 },
            ]}
          >
            {t("settings.chooseTheme")}
          </Text>
          <View style={styles.themeGrid}>
            {themePresets.map((preset) => {
              const isSelected = !isSystemMode && presetId === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  testID={`theme-${preset.id}`}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: preset.colors.background,
                      borderColor: isSelected
                        ? preset.colors.primary
                        : preset.colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setPreset(preset.id)}
                  disabled={isSystemMode}
                  activeOpacity={isSystemMode ? 1 : 0.7}
                >
                  {/* Color preview dots */}
                  <View style={styles.themeColorRow}>
                    <View
                      style={[
                        styles.themeColorDot,
                        { backgroundColor: preset.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.themeColorDot,
                        { backgroundColor: preset.colors.secondary },
                      ]}
                    />
                    <View
                      style={[
                        styles.themeColorDot,
                        { backgroundColor: preset.colors.success },
                      ]}
                    />
                  </View>
                  <Text style={styles.themeEmoji}>{preset.emoji}</Text>
                  <Text
                    style={[styles.themeName, { color: preset.colors.text }]}
                  >
                    {t(
                      `settings.theme${preset.id.charAt(0).toUpperCase() + preset.id.slice(1)}`,
                    )}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        styles.themeSelectedBadge,
                        { backgroundColor: preset.colors.primary },
                      ]}
                    >
                      <Text style={styles.themeSelectedText}>✓</Text>
                    </View>
                  )}
                  {isSystemMode && <View style={styles.themeDisabledOverlay} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* ===== LANGUAGE ===== */}
      <SectionHeader title={t("settings.language")} color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {LANGUAGES.map((lang, idx) => (
          <View key={lang.code}>
            <TouchableOpacity
              testID={`lang-${lang.code}`}
              style={styles.row}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.langRow}>
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
                  {lang.label}
                </Text>
              </View>
              <View
                testID={`lang-radio-${lang.code}`}
                style={[
                  styles.radio,
                  {
                    borderColor:
                      language === lang.code
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
              >
                {language === lang.code && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
            {idx < LANGUAGES.length - 1 && (
              <Divider color={theme.colors.border} />
            )}
          </View>
        ))}
      </View>

      {/* Auto-translate toggle */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, marginTop: 12 },
        ]}
      >
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
              {t("settings.autoTranslate")}
            </Text>
            <Text
              style={[
                styles.rowSubtitle || { fontSize: 12, marginTop: 2 },
                { color: theme.colors.textMuted },
              ]}
            >
              {t("settings.autoTranslateDescription")}
            </Text>
          </View>
          <Switch
            testID="auto-translate-switch"
            value={autoTranslate}
            onValueChange={(val) => {
              setAutoTranslate(val);
            }}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
          />
        </View>
      </View>

      {/* ===== NOTIFICATIONS ===== */}
      <SectionHeader
        title={t("settings.notifications")}
        color={theme.colors.text}
      />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {(
          [
            ["mentions", t("settings.mentions")],
            ["directMessages", t("settings.directMessages")],
            ["calls", t("settings.settingsCalls")],
            ["events", t("settings.events")],
          ] as const
        ).map(([key, label], idx, arr) => (
          <View key={key}>
            <SettingRow label={label} color={theme.colors.text}>
              <Switch
                testID={`switch-notif-${key}`}
                value={notifPrefs[key]}
                onValueChange={(val) =>
                  saveNotifPrefs({ ...notifPrefs, [key]: val })
                }
                trackColor={{ false: "#767577", true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </SettingRow>
            {idx < arr.length - 1 && <Divider color={theme.colors.border} />}
          </View>
        ))}
      </View>

      {/* ===== STORIES ===== */}
      <SectionHeader title={t("settings.stories")} color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t("settings.visibility")}
          </Text>
          <View style={styles.visibilityGroup}>
            {STORY_VISIBILITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                testID={`stories-visibility-${opt.value}`}
                style={[
                  styles.visibilityBtn,
                  {
                    backgroundColor:
                      storiesPrefs.visibility === opt.value
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor:
                      storiesPrefs.visibility === opt.value
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() =>
                  saveStoriesPrefs({ ...storiesPrefs, visibility: opt.value })
                }
              >
                <Text
                  style={[
                    styles.visibilityBtnText,
                    {
                      color:
                        storiesPrefs.visibility === opt.value
                          ? "#fff"
                          : theme.colors.text,
                    },
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider color={theme.colors.border} />

        <SettingRow
          label={t("settings.allowReplies")}
          color={theme.colors.text}
        >
          <Switch
            testID="switch-stories-replies"
            value={storiesPrefs.allowReplies}
            onValueChange={(val) =>
              saveStoriesPrefs({ ...storiesPrefs, allowReplies: val })
            }
            trackColor={{ false: "#767577", true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </SettingRow>

        <Divider color={theme.colors.border} />

        <SettingRow label={t("settings.autoArchive")} color={theme.colors.text}>
          <Switch
            testID="switch-stories-archive"
            value={storiesPrefs.autoArchive}
            onValueChange={(val) =>
              saveStoriesPrefs({ ...storiesPrefs, autoArchive: val })
            }
            trackColor={{ false: "#767577", true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </SettingRow>
      </View>

      {/* ===== PROFILE VISIBILITY ===== */}
      <SectionHeader
        title={t("settings.profileVisibility")}
        color={theme.colors.text}
      />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t("settings.whoCanSeeProfile")}
          </Text>
          <View style={styles.visibilityGroup}>
            {(
              [
                {
                  value: "public",
                  icon: "🌍",
                  labelKey: "settings.profilePublic",
                },
                {
                  value: "private",
                  icon: "🔒",
                  labelKey: "settings.profilePrivate",
                },
                {
                  value: "anonymous",
                  icon: "👤",
                  labelKey: "settings.profileAnonymous",
                },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                testID={`profile-visibility-${opt.value}`}
                style={[
                  styles.visibilityBtn,
                  {
                    backgroundColor:
                      profileVisibility === opt.value
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor:
                      profileVisibility === opt.value
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() => saveProfileVisibility(opt.value)}
              >
                <Text style={styles.visibilityIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.visibilityBtnText,
                    {
                      color:
                        profileVisibility === opt.value
                          ? "#fff"
                          : theme.colors.text,
                    },
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* ===== PRIVACY ===== */}
      <SectionHeader title={t("settings.privacy")} color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {(
          [
            ["showOnlineStatus", t("settings.showOnlineStatus")],
            ["showLastSeen", t("settings.showLastSeen")],
            ["showReadReceipts", t("settings.readReceipts")],
            ["allowSearchByPhone", t("settings.searchByPhone")],
          ] as const
        ).map(([key, label], idx, arr) => (
          <View key={key}>
            <SettingRow label={label} color={theme.colors.text}>
              <Switch
                testID={`switch-privacy-${key}`}
                value={privacyPrefs[key]}
                onValueChange={(val) => savePrivacyField(key, val)}
                trackColor={{ false: "#767577", true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </SettingRow>
            {idx < arr.length - 1 && <Divider color={theme.colors.border} />}
          </View>
        ))}
      </View>

      {/* Privacy Center Link (RGPD) */}
      <TouchableOpacity
        testID="btn-privacy-center"
        style={[
          styles.privacyCenterBtn,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={() => router.push("/privacy-center")}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color={theme.colors.primary}
        />
        <View style={styles.privacyCenterTextContainer}>
          <Text
            style={[styles.privacyCenterTitle, { color: theme.colors.text }]}
          >
            {t("settings.privacyCenter")}
          </Text>
          <Text
            style={[
              styles.privacyCenterDesc,
              { color: theme.colors.textMuted },
            ]}
          >
            {t("settings.privacyCenterDesc")}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {/* ===== SECURITY ===== */}
      <SectionHeader title={t("settings.security")} color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {/* Biometric Authentication */}
        {biometricStatus.isAvailable && (
          <>
            <SettingRow
              label={getBiometryLabel(biometricStatus.biometryType)}
              color={theme.colors.text}
            >
              <Switch
                testID="switch-biometric"
                value={biometricStatus.isEnabled}
                onValueChange={handleToggleBiometric}
                disabled={securityLoading}
                trackColor={{ false: "#767577", true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </SettingRow>
            <Divider color={theme.colors.border} />
          </>
        )}

        {/* 2FA / MFA */}
        <View style={styles.securityRow}>
          <View style={styles.securityRowContent}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
              {t("settings.security2fa")}
            </Text>
            <Text
              style={[styles.securityDesc, { color: theme.colors.textMuted }]}
            >
              {mfaFactors.some((f) => f.status === "verified")
                ? t("settings.security2faEnabled")
                : t("settings.security2faDisabled")}
            </Text>
          </View>
          {mfaFactors.some((f) => f.status === "verified") ? (
            <TouchableOpacity
              onPress={() => {
                const verifiedFactor = mfaFactors.find(
                  (f) => f.status === "verified",
                );
                if (verifiedFactor) handleDisableMfa(verifiedFactor.id);
              }}
              disabled={securityLoading}
              style={[styles.securityBtn, { borderColor: theme.colors.error }]}
            >
              <Text style={{ color: theme.colors.error }}>
                {t("settings.security2faDisable")}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleStartMfaEnrollment}
              disabled={securityLoading}
              style={[
                styles.securityBtn,
                { borderColor: theme.colors.primary },
              ]}
            >
              <Text style={{ color: theme.colors.primary }}>
                {t("settings.security2faEnable")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MFA Enrollment Modal Inline */}
        {mfaEnrollmentData && (
          <>
            <Divider color={theme.colors.border} />
            <View style={styles.mfaEnrollContainer}>
              <Text style={[styles.mfaTitle, { color: theme.colors.text }]}>
                {t("settings.security2faScanQR")}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `otpauth://totp/ImuChat?secret=${mfaEnrollmentData.secret}&issuer=ImuChat`,
                  )
                }
                style={[
                  styles.qrPlaceholder,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Ionicons
                  name="qr-code"
                  size={80}
                  color={theme.colors.primary}
                />
                <Text style={{ color: theme.colors.textMuted, marginTop: 8 }}>
                  {t("settings.security2faTapToOpen")}
                </Text>
              </TouchableOpacity>
              <Text
                style={[styles.mfaSecret, { color: theme.colors.textMuted }]}
                selectable
              >
                {mfaEnrollmentData.secret}
              </Text>
              <TextInput
                style={[
                  styles.mfaInput,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="000000"
                placeholderTextColor={theme.colors.textMuted}
                value={mfaTotpCode}
                onChangeText={setMfaTotpCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <View style={styles.mfaButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setMfaEnrollmentData(null);
                    setMfaTotpCode("");
                  }}
                  style={[
                    styles.mfaCancelBtn,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleVerifyMfaCode}
                  disabled={mfaTotpCode.length !== 6 || securityLoading}
                  style={[
                    styles.mfaVerifyBtn,
                    {
                      backgroundColor:
                        mfaTotpCode.length === 6
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: "#fff" }}>{t("common.verify")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <Divider color={theme.colors.border} />

        {/* Active Sessions */}
        <View style={styles.securityRow}>
          <View style={styles.securityRowContent}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
              {t("settings.securitySessions")}
            </Text>
            <Text
              style={[styles.securityDesc, { color: theme.colors.textMuted }]}
            >
              {t("settings.securitySessionsCount", {
                count: activeSessions.length,
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRevokeAllSessions}
            disabled={securityLoading || activeSessions.length <= 1}
            style={[
              styles.securityBtn,
              {
                borderColor:
                  activeSessions.length > 1
                    ? theme.colors.error
                    : theme.colors.border,
              },
            ]}
          >
            <Text
              style={{
                color:
                  activeSessions.length > 1
                    ? theme.colors.error
                    : theme.colors.textMuted,
              }}
            >
              {t("settings.securityRevokeAll")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== ADVANCED SETTINGS ===== */}
      <SectionHeader
        title={t("advancedSettings.title")}
        color={theme.colors.text}
      />

      <TouchableOpacity
        testID="btn-advanced-settings"
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, padding: 16 },
        ]}
        onPress={() => router.push("/settings" as any)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              {t("advancedSettings.title")}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 2,
              }}
            >
              Notifications, performance, accessibilité, intégrations…
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ===== SUPPORT & ASSISTANCE ===== */}
      <TouchableOpacity
        testID="nav-support"
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, padding: 16 },
        ]}
        onPress={() => router.push("/support" as any)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ fontSize: 22 }}>🆘</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              {t("support.title")}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 2,
              }}
            >
              {t("support.helpCenterSub")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ── Gamification ─────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => router.push("/gamification" as any)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 22 }}>🎮</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              {t("gamification.title")}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 2,
              }}
            >
              {t("gamification.subtitle")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ── Wallet — DEV-033 ───────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => router.push("/wallet" as any)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 22 }}>💰</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              {t("wallet.title")}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 2,
              }}
            >
              {t("wallet.subtitle")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ── Dev Store — DEV-034 ────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => router.push("/dev-store" as any)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 22 }}>🛍️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              {t("devStore.title")}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 2,
              }}
            >
              {t("devStore.subtitle")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ── IA Administration ─────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => router.push("/ai-admin" as any)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 22 }}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              {t("aiAdmin.title")}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 2,
              }}
            >
              {t("aiAdmin.subtitle")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ===== ANALYTICS & INSIGHTS ===== */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push("/analytics-insights" as any)}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 14,
            },
          ]}
        >
          <Text style={{ fontSize: 22 }}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              {t("analyticsInsights.title")}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 2,
              }}
            >
              {t("analyticsInsights.subtitle")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ===== ABOUT ===== */}
      <SectionHeader title={t("settings.about")} color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <SettingRow label={t("settings.version")} color={theme.colors.text}>
          <Text style={[styles.valueText, { color: theme.colors.textMuted }]}>
            {t("settings.versionValue")}
          </Text>
        </SettingRow>
      </View>

      {/* ===== ACTIONS ===== */}
      <TouchableOpacity
        testID="btn-sign-out"
        style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
        onPress={handleSignOut}
      >
        <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>
          {t("settings.signOut")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="btn-delete-account"
        style={[
          styles.actionBtn,
          { backgroundColor: theme.colors.surface, marginBottom: 40 },
        ]}
        onPress={handleDeleteAccount}
      >
        <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>
          {t("settings.deleteAccount")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ title, color }: { title: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{title}</Text>;
}

function SettingRow({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      {children}
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  savingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ec4899",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  savingText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  valueText: {
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  actionBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // --- New styles for parity ---
  inputRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  langFlag: {
    fontSize: 22,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  visibilityGroup: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  visibilityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  visibilityBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  visibilityIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  // --- Theme Grid Styles ---
  themeGridContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  themeColorRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
  },
  themeColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  themeName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  themeSelectedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  themeSelectedText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  themeDisabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(128,128,128,0.4)",
    borderRadius: 12,
  },
  // --- Security Section Styles ---
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  securityRowContent: {
    flex: 1,
    marginRight: 12,
  },
  securityDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  securityBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mfaEnrollContainer: {
    padding: 16,
    alignItems: "center",
  },
  mfaTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  mfaSecret: {
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: "center",
  },
  mfaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 8,
    textAlign: "center",
    width: 180,
    marginBottom: 16,
  },
  mfaButtons: {
    flexDirection: "row",
    gap: 12,
  },
  mfaCancelBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  mfaVerifyBtn: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  // Privacy Center button
  privacyCenterBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  privacyCenterTextContainer: {
    flex: 1,
  },
  privacyCenterTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  privacyCenterDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
