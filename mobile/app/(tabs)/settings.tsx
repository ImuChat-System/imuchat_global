/**
 * Settings Screen — Mobile
 *
 * Full parity with web-app settings:
 * Sections: Account (edit), Password, Appearance, Language, Notifications,
 *           Stories, Privacy, About, Sign Out, Delete Account
 */

import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  label: string;
  desc: string;
}[] = [
  { value: "public", label: "Public", desc: "Tout le monde" },
  { value: "friends", label: "Amis", desc: "Vos amis uniquement" },
  { value: "private", label: "Privé", desc: "Vous seulement" },
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
  const { theme, mode, toggleMode } = useTheme();

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
            "username, notification_prefs, privacy_show_online, privacy_show_last_seen, privacy_read_receipts, privacy_search_phone, language, stories_visibility, stories_allow_replies, stories_auto_archive",
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
      Alert.alert("Succès", "Profil mis à jour avec succès.");
    } catch (err: any) {
      Alert.alert("Erreur", err.message ?? "Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Password change
  // -----------------------------------------------------------------------

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert(
        "Erreur",
        "Le nouveau mot de passe doit faire au moins 6 caractères.",
      );
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
      Alert.alert("Succès", "Mot de passe mis à jour.");
    } catch (err: any) {
      Alert.alert(
        "Erreur",
        err.message ?? "Impossible de changer le mot de passe.",
      );
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Language save
  // -----------------------------------------------------------------------

  async function handleLanguageChange(code: LanguageCode) {
    setLanguage(code);
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
  // Sign out & delete account
  // -----------------------------------------------------------------------

  function handleSignOut() {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Toutes vos données seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Bientôt",
              "Cette fonctionnalité sera disponible prochainement.",
            );
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
        Paramètres
      </Text>

      {saving && (
        <View testID="settings-saving" style={styles.savingBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.savingText}>Enregistrement...</Text>
        </View>
      )}

      {/* ===== ACCOUNT (editable) ===== */}
      <SectionHeader title="Compte" color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Identifiant
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
            placeholder="Votre identifiant"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
          />
        </View>

        <Divider color={theme.colors.border} />

        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Email
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
            placeholder="votre@email.com"
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
            <Text style={styles.saveBtnText}>Sauvegarder</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== PASSWORD ===== */}
      <SectionHeader title="Mot de passe" color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Mot de passe actuel
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
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
          />
        </View>

        <Divider color={theme.colors.border} />

        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Nouveau mot de passe
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
            placeholder="Min. 6 caractères"
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
          <Text style={styles.saveBtnText}>Changer le mot de passe</Text>
        </TouchableOpacity>
      </View>

      {/* ===== APPEARANCE ===== */}
      <SectionHeader title="Apparence" color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <SettingRow label="Mode sombre" color={theme.colors.text}>
          <Switch
            testID="switch-dark-mode"
            value={mode === "dark"}
            onValueChange={toggleMode}
            trackColor={{ false: "#767577", true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </SettingRow>
      </View>

      {/* ===== LANGUAGE ===== */}
      <SectionHeader title="Langue" color={theme.colors.text} />

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

      {/* ===== NOTIFICATIONS ===== */}
      <SectionHeader title="Notifications" color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {(
          [
            ["mentions", "Mentions"],
            ["directMessages", "Messages directs"],
            ["calls", "Appels"],
            ["events", "Événements"],
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
      <SectionHeader title="Stories" color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Visibilité
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
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider color={theme.colors.border} />

        <SettingRow label="Autoriser les réponses" color={theme.colors.text}>
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

        <SettingRow label="Archivage automatique" color={theme.colors.text}>
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

      {/* ===== PRIVACY ===== */}
      <SectionHeader title="Confidentialité" color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {(
          [
            ["showOnlineStatus", "Afficher statut en ligne"],
            ["showLastSeen", "Afficher dernière connexion"],
            ["showReadReceipts", "Confirmations de lecture"],
            ["allowSearchByPhone", "Recherche par téléphone"],
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

      {/* ===== ABOUT ===== */}
      <SectionHeader title="À propos" color={theme.colors.text} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <SettingRow label="Version" color={theme.colors.text}>
          <Text style={[styles.valueText, { color: theme.colors.textMuted }]}>
            1.0.0 (MVP)
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
          Déconnexion
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
          Supprimer le compte
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
});
