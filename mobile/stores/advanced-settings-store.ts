/**
 * Advanced Settings Store (Zustand + AsyncStorage persist)
 *
 * Gère les paramètres avancés globaux :
 * - Notifications granulaires
 * - Son & ambiances
 * - Performance (low mode)
 * - Données mobiles
 * - Accessibilité
 * - Région & fuseau horaire
 *
 * Les API keys, intégrations et webhooks sont gérés côté serveur (Supabase)
 * et non persistés localement.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
    AccessibilityPrefs,
    AmbientSound,
    ApiKey,
    ChannelNotificationConfig,
    ContrastMode,
    DataUsagePrefs,
    DateFormatStyle,
    FontSizeScale,
    GranularNotificationPrefs,
    Integration,
    MediaDownloadPolicy,
    NotificationChannel,
    PerformanceMode,
    PerformancePrefs,
    QuietHours,
    RegionPrefs,
    SoundPrefs,
    TimeFormatStyle,
    Webhook
} from "@/types/advanced-settings";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_CHANNEL_CONFIG: ChannelNotificationConfig = {
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
    delivery: ["push", "inApp"],
};

const DEFAULT_NOTIFICATION_PREFS: GranularNotificationPrefs = {
    channels: {
        messages: { ...DEFAULT_CHANNEL_CONFIG },
        mentions: { ...DEFAULT_CHANNEL_CONFIG },
        calls: { ...DEFAULT_CHANNEL_CONFIG, delivery: ["push", "inApp", "sms"] },
        groups: { ...DEFAULT_CHANNEL_CONFIG },
        stories: { ...DEFAULT_CHANNEL_CONFIG, sound: false },
        events: { ...DEFAULT_CHANNEL_CONFIG },
        system: { ...DEFAULT_CHANNEL_CONFIG, vibration: false },
        marketing: {
            enabled: false,
            sound: false,
            vibration: false,
            badge: false,
            delivery: ["email"],
        },
    },
    quietHours: {
        enabled: false,
        startHour: 22,
        startMinute: 0,
        endHour: 7,
        endMinute: 0,
        days: [0, 1, 2, 3, 4, 5, 6],
    },
    groupNotifications: true,
    showPreview: true,
};

const DEFAULT_SOUND_PREFS: SoundPrefs = {
    masterVolume: 80,
    notificationSound: true,
    uiSounds: true,
    ringtone: "default",
    messageTone: "default",
    ambientSound: "none",
    ambientVolume: 30,
    hapticEnabled: true,
};

const DEFAULT_PERFORMANCE_PREFS: PerformancePrefs = {
    mode: "auto",
    disableAnimations: false,
    reducedImageQuality: false,
    disableAutoPlayVideos: false,
    disableBackgroundSync: false,
    limitFps: false,
    cacheSizeLimitMb: 500,
};

const DEFAULT_DATA_USAGE_PREFS: DataUsagePrefs = {
    autoDownloadImages: "always",
    autoDownloadVideos: "wifi",
    autoDownloadAudio: "wifi",
    autoDownloadDocuments: "wifi",
    compressUploadsOnMobile: true,
    syncContactsWifiOnly: false,
    dataSaverEnabled: false,
    dataWarningMb: 0,
};

const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
    reduceMotion: false,
    contrastMode: "default",
    fontSizeScale: "default",
    boldText: false,
    screenReaderOptimized: false,
    colorBlindMode: "none",
    autoPlayCaptions: false,
    monoAudio: false,
};

const DEFAULT_REGION_PREFS: RegionPrefs = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris",
    autoTimezone: true,
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    firstDayOfWeek: 1,
    countryCode: "FR",
};

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface AdvancedSettingsStoreState {
    // State
    notifications: GranularNotificationPrefs;
    sound: SoundPrefs;
    performance: PerformancePrefs;
    dataUsage: DataUsagePrefs;
    accessibility: AccessibilityPrefs;
    region: RegionPrefs;
    apiKeys: ApiKey[];
    integrations: Integration[];
    webhooks: Webhook[];

    // Notification actions
    setChannelConfig: (
        channel: NotificationChannel,
        config: Partial<ChannelNotificationConfig>,
    ) => void;
    setQuietHours: (quietHours: Partial<QuietHours>) => void;
    setNotificationPref: (
        key: "groupNotifications" | "showPreview",
        value: boolean,
    ) => void;

    // Sound actions
    setSoundPref: (partial: Partial<SoundPrefs>) => void;
    setAmbientSound: (sound: AmbientSound) => void;

    // Performance actions
    setPerformanceMode: (mode: PerformanceMode) => void;
    setPerformancePref: (partial: Partial<PerformancePrefs>) => void;

    // Data usage actions
    setDataUsagePref: (partial: Partial<DataUsagePrefs>) => void;
    setMediaDownloadPolicy: (
        media: "autoDownloadImages" | "autoDownloadVideos" | "autoDownloadAudio" | "autoDownloadDocuments",
        policy: MediaDownloadPolicy,
    ) => void;

    // Accessibility actions
    setAccessibilityPref: (partial: Partial<AccessibilityPrefs>) => void;
    setFontSizeScale: (scale: FontSizeScale) => void;
    setContrastMode: (mode: ContrastMode) => void;

    // Region actions
    setRegionPref: (partial: Partial<RegionPrefs>) => void;
    setTimezone: (tz: string) => void;
    setDateFormat: (fmt: DateFormatStyle) => void;
    setTimeFormat: (fmt: TimeFormatStyle) => void;

    // API keys (server-fetched, stored in memory)
    setApiKeys: (keys: ApiKey[]) => void;
    addApiKey: (key: ApiKey) => void;
    removeApiKey: (keyId: string) => void;

    // Integrations
    setIntegrations: (integrations: Integration[]) => void;
    updateIntegration: (id: string, partial: Partial<Integration>) => void;

    // Webhooks
    setWebhooks: (webhooks: Webhook[]) => void;
    addWebhook: (webhook: Webhook) => void;
    updateWebhook: (id: string, partial: Partial<Webhook>) => void;
    removeWebhook: (webhookId: string) => void;

    // Reset
    reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAdvancedSettingsStore = create<AdvancedSettingsStoreState>()(
    persist(
        (set) => ({
            // Initial state
            notifications: DEFAULT_NOTIFICATION_PREFS,
            sound: DEFAULT_SOUND_PREFS,
            performance: DEFAULT_PERFORMANCE_PREFS,
            dataUsage: DEFAULT_DATA_USAGE_PREFS,
            accessibility: DEFAULT_ACCESSIBILITY_PREFS,
            region: DEFAULT_REGION_PREFS,
            apiKeys: [],
            integrations: [],
            webhooks: [],

            // -- Notifications --
            setChannelConfig: (channel, config) =>
                set((state) => ({
                    notifications: {
                        ...state.notifications,
                        channels: {
                            ...state.notifications.channels,
                            [channel]: {
                                ...state.notifications.channels[channel],
                                ...config,
                            },
                        },
                    },
                })),

            setQuietHours: (quietHours) =>
                set((state) => ({
                    notifications: {
                        ...state.notifications,
                        quietHours: {
                            ...state.notifications.quietHours,
                            ...quietHours,
                        },
                    },
                })),

            setNotificationPref: (key, value) =>
                set((state) => ({
                    notifications: {
                        ...state.notifications,
                        [key]: value,
                    },
                })),

            // -- Sound --
            setSoundPref: (partial) =>
                set((state) => ({
                    sound: { ...state.sound, ...partial },
                })),

            setAmbientSound: (ambientSound) =>
                set((state) => ({
                    sound: { ...state.sound, ambientSound },
                })),

            // -- Performance --
            setPerformanceMode: (mode) =>
                set((state) => ({
                    performance: { ...state.performance, mode },
                })),

            setPerformancePref: (partial) =>
                set((state) => ({
                    performance: { ...state.performance, ...partial },
                })),

            // -- Data Usage --
            setDataUsagePref: (partial) =>
                set((state) => ({
                    dataUsage: { ...state.dataUsage, ...partial },
                })),

            setMediaDownloadPolicy: (media, policy) =>
                set((state) => ({
                    dataUsage: { ...state.dataUsage, [media]: policy },
                })),

            // -- Accessibility --
            setAccessibilityPref: (partial) =>
                set((state) => ({
                    accessibility: { ...state.accessibility, ...partial },
                })),

            setFontSizeScale: (fontSizeScale) =>
                set((state) => ({
                    accessibility: { ...state.accessibility, fontSizeScale },
                })),

            setContrastMode: (contrastMode) =>
                set((state) => ({
                    accessibility: { ...state.accessibility, contrastMode },
                })),

            // -- Region --
            setRegionPref: (partial) =>
                set((state) => ({
                    region: { ...state.region, ...partial },
                })),

            setTimezone: (timezone) =>
                set((state) => ({
                    region: { ...state.region, timezone },
                })),

            setDateFormat: (dateFormat) =>
                set((state) => ({
                    region: { ...state.region, dateFormat },
                })),

            setTimeFormat: (timeFormat) =>
                set((state) => ({
                    region: { ...state.region, timeFormat },
                })),

            // -- API Keys (server-sourced, not persisted to disk) --
            setApiKeys: (apiKeys) => set({ apiKeys }),

            addApiKey: (key) =>
                set((state) => ({ apiKeys: [...state.apiKeys, key] })),

            removeApiKey: (keyId) =>
                set((state) => ({
                    apiKeys: state.apiKeys.filter((k) => k.id !== keyId),
                })),

            // -- Integrations --
            setIntegrations: (integrations) => set({ integrations }),

            updateIntegration: (id, partial) =>
                set((state) => ({
                    integrations: state.integrations.map((i) =>
                        i.id === id ? { ...i, ...partial } : i,
                    ),
                })),

            // -- Webhooks --
            setWebhooks: (webhooks) => set({ webhooks }),

            addWebhook: (webhook) =>
                set((state) => ({ webhooks: [...state.webhooks, webhook] })),

            updateWebhook: (id, partial) =>
                set((state) => ({
                    webhooks: state.webhooks.map((w) =>
                        w.id === id ? { ...w, ...partial } : w,
                    ),
                })),

            removeWebhook: (webhookId) =>
                set((state) => ({
                    webhooks: state.webhooks.filter((w) => w.id !== webhookId),
                })),

            // -- Reset --
            reset: () =>
                set({
                    notifications: DEFAULT_NOTIFICATION_PREFS,
                    sound: DEFAULT_SOUND_PREFS,
                    performance: DEFAULT_PERFORMANCE_PREFS,
                    dataUsage: DEFAULT_DATA_USAGE_PREFS,
                    accessibility: DEFAULT_ACCESSIBILITY_PREFS,
                    region: DEFAULT_REGION_PREFS,
                    apiKeys: [],
                    integrations: [],
                    webhooks: [],
                }),
        }),
        {
            name: "imuchat-advanced-settings",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist local preferences — API keys/integrations/webhooks come from server
                notifications: state.notifications,
                sound: state.sound,
                performance: state.performance,
                dataUsage: state.dataUsage,
                accessibility: state.accessibility,
                region: state.region,
            }),
        },
    ),
);
