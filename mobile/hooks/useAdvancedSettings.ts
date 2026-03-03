/**
 * Hook useAdvancedSettings — Façade React pour les paramètres avancés
 *
 * Expose toutes les préférences avancées via un hook unique, avec
 * des actions mémorisées (useCallback) pour éviter les re-renders.
 *
 * Usage:
 * ```tsx
 * const {
 *   notifications, sound, performance, dataUsage,
 *   accessibility, region, setChannelConfig, ...
 * } = useAdvancedSettings();
 * ```
 */

import { useAdvancedSettingsStore } from "@/stores/advanced-settings-store";
import type {
    AccessibilityPrefs,
    AmbientSound,
    ApiKey,
    ChannelNotificationConfig,
    ContrastMode,
    DataUsagePrefs,
    DateFormatStyle,
    FontSizeScale,
    Integration,
    MediaDownloadPolicy,
    NotificationChannel,
    PerformanceMode,
    PerformancePrefs,
    QuietHours,
    RegionPrefs,
    SoundPrefs,
    TimeFormatStyle,
    Webhook,
} from "@/types/advanced-settings";
import { useCallback, useMemo } from "react";

export function useAdvancedSettings() {
    const store = useAdvancedSettingsStore();

    // ─── Notification actions ────────────────────────────────────
    const setChannelConfig = useCallback(
        (channel: NotificationChannel, config: Partial<ChannelNotificationConfig>) =>
            store.setChannelConfig(channel, config),
        [store.setChannelConfig],
    );

    const setQuietHours = useCallback(
        (quietHours: Partial<QuietHours>) => store.setQuietHours(quietHours),
        [store.setQuietHours],
    );

    const setNotificationPref = useCallback(
        (key: "groupNotifications" | "showPreview", value: boolean) =>
            store.setNotificationPref(key, value),
        [store.setNotificationPref],
    );

    // ─── Sound actions ──────────────────────────────────────────
    const setSoundPref = useCallback(
        (partial: Partial<SoundPrefs>) => store.setSoundPref(partial),
        [store.setSoundPref],
    );

    const setAmbientSound = useCallback(
        (sound: AmbientSound) => store.setAmbientSound(sound),
        [store.setAmbientSound],
    );

    // ─── Performance actions ────────────────────────────────────
    const setPerformanceMode = useCallback(
        (mode: PerformanceMode) => store.setPerformanceMode(mode),
        [store.setPerformanceMode],
    );

    const setPerformancePref = useCallback(
        (partial: Partial<PerformancePrefs>) => store.setPerformancePref(partial),
        [store.setPerformancePref],
    );

    // ─── Data usage actions ─────────────────────────────────────
    const setDataUsagePref = useCallback(
        (partial: Partial<DataUsagePrefs>) => store.setDataUsagePref(partial),
        [store.setDataUsagePref],
    );

    const setMediaDownloadPolicy = useCallback(
        (
            media: "autoDownloadImages" | "autoDownloadVideos" | "autoDownloadAudio" | "autoDownloadDocuments",
            policy: MediaDownloadPolicy,
        ) => store.setMediaDownloadPolicy(media, policy),
        [store.setMediaDownloadPolicy],
    );

    // ─── Accessibility actions ──────────────────────────────────
    const setAccessibilityPref = useCallback(
        (partial: Partial<AccessibilityPrefs>) => store.setAccessibilityPref(partial),
        [store.setAccessibilityPref],
    );

    const setFontSizeScale = useCallback(
        (scale: FontSizeScale) => store.setFontSizeScale(scale),
        [store.setFontSizeScale],
    );

    const setContrastMode = useCallback(
        (mode: ContrastMode) => store.setContrastMode(mode),
        [store.setContrastMode],
    );

    // ─── Region actions ─────────────────────────────────────────
    const setRegionPref = useCallback(
        (partial: Partial<RegionPrefs>) => store.setRegionPref(partial),
        [store.setRegionPref],
    );

    const setTimezone = useCallback(
        (tz: string) => store.setTimezone(tz),
        [store.setTimezone],
    );

    const setDateFormat = useCallback(
        (fmt: DateFormatStyle) => store.setDateFormat(fmt),
        [store.setDateFormat],
    );

    const setTimeFormat = useCallback(
        (fmt: TimeFormatStyle) => store.setTimeFormat(fmt),
        [store.setTimeFormat],
    );

    // ─── API keys ───────────────────────────────────────────────
    const setApiKeys = useCallback(
        (keys: ApiKey[]) => store.setApiKeys(keys),
        [store.setApiKeys],
    );

    const addApiKey = useCallback(
        (key: ApiKey) => store.addApiKey(key),
        [store.addApiKey],
    );

    const removeApiKey = useCallback(
        (keyId: string) => store.removeApiKey(keyId),
        [store.removeApiKey],
    );

    // ─── Integrations ──────────────────────────────────────────
    const setIntegrations = useCallback(
        (integrations: Integration[]) => store.setIntegrations(integrations),
        [store.setIntegrations],
    );

    const addIntegration = useCallback(
        (integration: Integration) =>
            store.setIntegrations([...store.integrations, integration]),
        [store.setIntegrations, store.integrations],
    );

    const removeIntegration = useCallback(
        (id: string) =>
            store.setIntegrations(store.integrations.filter((i) => i.id !== id)),
        [store.setIntegrations, store.integrations],
    );

    const toggleIntegration = useCallback(
        (id: string, enabled: boolean) =>
            store.updateIntegration(id, { enabled }),
        [store.updateIntegration],
    );

    const updateIntegration = useCallback(
        (id: string, partial: Partial<Integration>) =>
            store.updateIntegration(id, partial),
        [store.updateIntegration],
    );

    // ─── Webhooks ───────────────────────────────────────────────
    const setWebhooks = useCallback(
        (webhooks: Webhook[]) => store.setWebhooks(webhooks),
        [store.setWebhooks],
    );

    const addWebhook = useCallback(
        (webhook: Webhook) => store.addWebhook(webhook),
        [store.addWebhook],
    );

    const updateWebhook = useCallback(
        (id: string, partial: Partial<Webhook>) => store.updateWebhook(id, partial),
        [store.updateWebhook],
    );

    const removeWebhook = useCallback(
        (webhookId: string) => store.removeWebhook(webhookId),
        [store.removeWebhook],
    );

    const toggleWebhook = useCallback(
        (id: string, enabled: boolean) => store.updateWebhook(id, { enabled }),
        [store.updateWebhook],
    );

    const updateWebhookEvents = useCallback(
        (id: string, events: import("@/types/advanced-settings").WebhookEvent[]) =>
            store.updateWebhook(id, { events }),
        [store.updateWebhook],
    );

    const reset = useCallback(() => store.reset(), [store.reset]);

    // ─── Computed helpers ───────────────────────────────────────
    const isLowPerformanceMode = useMemo(
        () => store.performance.mode === "low",
        [store.performance.mode],
    );

    const isDataSaverActive = useMemo(
        () => store.dataUsage.dataSaverEnabled,
        [store.dataUsage.dataSaverEnabled],
    );

    const activeChannelCount = useMemo(() => {
        return Object.values(store.notifications.channels).filter((c) => c.enabled)
            .length;
    }, [store.notifications.channels]);

    return {
        // State
        notifications: store.notifications,
        sound: store.sound,
        performance: store.performance,
        dataUsage: store.dataUsage,
        accessibility: store.accessibility,
        region: store.region,
        apiKeys: store.apiKeys,
        integrations: store.integrations,
        webhooks: store.webhooks,

        // Computed
        isLowPerformanceMode,
        isDataSaverActive,
        activeChannelCount,

        // Actions
        setChannelConfig,
        setQuietHours,
        setNotificationPref,
        setSoundPref,
        setAmbientSound,
        setPerformanceMode,
        setPerformancePref,
        setDataUsagePref,
        setMediaDownloadPolicy,
        setAccessibilityPref,
        setFontSizeScale,
        setContrastMode,
        setRegionPref,
        setTimezone,
        setDateFormat,
        setTimeFormat,
        setApiKeys,
        addApiKey,
        removeApiKey,
        setIntegrations,
        addIntegration,
        removeIntegration,
        toggleIntegration,
        updateIntegration,
        setWebhooks,
        addWebhook,
        updateWebhook,
        removeWebhook,
        toggleWebhook,
        updateWebhookEvents,
        reset,
    };
}
