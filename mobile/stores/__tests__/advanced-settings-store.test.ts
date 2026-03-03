/**
 * Tests pour advanced-settings-store (Zustand)
 *
 * Couvre : notifications, sound, performance, data usage,
 *          accessibility, region, API keys, integrations, webhooks, reset.
 *
 * Paramètres avancés — 9 domaines
 */

import { useAdvancedSettingsStore } from "../advanced-settings-store";

// ─── Mocks ────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
}));

// ─── Helpers ──────────────────────────────────────────────────

function resetStore() {
    useAdvancedSettingsStore.getState().reset();
}

// ═══════════════════════════════════════════════════════════════
// Test suites
// ═══════════════════════════════════════════════════════════════

describe("advanced-settings-store", () => {
    beforeEach(resetStore);

    // ─── Initial State ────────────────────────────────────────
    describe("initial state", () => {
        it("has correct default notifications", () => {
            const s = useAdvancedSettingsStore.getState();
            expect(s.notifications.groupNotifications).toBe(true);
            expect(s.notifications.showPreview).toBe(true);
            expect(s.notifications.channels.messages.enabled).toBe(true);
            expect(s.notifications.channels.marketing.enabled).toBe(false);
            expect(s.notifications.quietHours.enabled).toBe(false);
            expect(s.notifications.quietHours.startHour).toBe(22);
        });

        it("has correct default sound prefs", () => {
            const s = useAdvancedSettingsStore.getState();
            expect(s.sound.masterVolume).toBe(80);
            expect(s.sound.notificationSound).toBe(true);
            expect(s.sound.ambientSound).toBe("none");
            expect(s.sound.hapticEnabled).toBe(true);
        });

        it("has correct default performance prefs", () => {
            const s = useAdvancedSettingsStore.getState();
            expect(s.performance.mode).toBe("auto");
            expect(s.performance.disableAnimations).toBe(false);
            expect(s.performance.cacheSizeLimitMb).toBe(500);
        });

        it("has correct default data usage prefs", () => {
            const s = useAdvancedSettingsStore.getState();
            expect(s.dataUsage.autoDownloadImages).toBe("always");
            expect(s.dataUsage.autoDownloadVideos).toBe("wifi");
            expect(s.dataUsage.dataSaverEnabled).toBe(false);
        });

        it("has correct default accessibility prefs", () => {
            const s = useAdvancedSettingsStore.getState();
            expect(s.accessibility.reduceMotion).toBe(false);
            expect(s.accessibility.fontSizeScale).toBe("default");
            expect(s.accessibility.contrastMode).toBe("default");
            expect(s.accessibility.colorBlindMode).toBe("none");
        });

        it("has correct default region prefs", () => {
            const s = useAdvancedSettingsStore.getState();
            expect(s.region.autoTimezone).toBe(true);
            expect(s.region.dateFormat).toBe("DD/MM/YYYY");
            expect(s.region.timeFormat).toBe("24h");
            expect(s.region.firstDayOfWeek).toBe(1);
        });

        it("has empty server-sourced collections", () => {
            const s = useAdvancedSettingsStore.getState();
            expect(s.apiKeys).toEqual([]);
            expect(s.integrations).toEqual([]);
            expect(s.webhooks).toEqual([]);
        });
    });

    // ─── Notification Actions ─────────────────────────────────
    describe("notification actions", () => {
        it("setChannelConfig – updates a single channel", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setChannelConfig("messages", { enabled: false, sound: false });

            const s = useAdvancedSettingsStore.getState();
            expect(s.notifications.channels.messages.enabled).toBe(false);
            expect(s.notifications.channels.messages.sound).toBe(false);
            // other channels untouched
            expect(s.notifications.channels.calls.enabled).toBe(true);
        });

        it("setQuietHours – merges partial quiet hours", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setQuietHours({ enabled: true, startHour: 23 });

            const s = useAdvancedSettingsStore.getState();
            expect(s.notifications.quietHours.enabled).toBe(true);
            expect(s.notifications.quietHours.startHour).toBe(23);
            expect(s.notifications.quietHours.endHour).toBe(7); // unchanged
        });

        it("setNotificationPref – toggles groupNotifications", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setNotificationPref("groupNotifications", false);

            expect(useAdvancedSettingsStore.getState().notifications.groupNotifications).toBe(false);
        });

        it("setNotificationPref – toggles showPreview", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setNotificationPref("showPreview", false);

            expect(useAdvancedSettingsStore.getState().notifications.showPreview).toBe(false);
        });
    });

    // ─── Sound Actions ────────────────────────────────────────
    describe("sound actions", () => {
        it("setSoundPref – partial merge", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setSoundPref({ masterVolume: 50, uiSounds: false });

            const s = useAdvancedSettingsStore.getState();
            expect(s.sound.masterVolume).toBe(50);
            expect(s.sound.uiSounds).toBe(false);
            expect(s.sound.notificationSound).toBe(true); // unchanged
        });

        it("setAmbientSound – changes ambient", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setAmbientSound("rain");

            expect(useAdvancedSettingsStore.getState().sound.ambientSound).toBe("rain");
        });
    });

    // ─── Performance Actions ──────────────────────────────────
    describe("performance actions", () => {
        it("setPerformanceMode – sets mode", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setPerformanceMode("low");

            expect(useAdvancedSettingsStore.getState().performance.mode).toBe("low");
        });

        it("setPerformancePref – partial merge", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setPerformancePref({ disableAnimations: true, limitFps: true });

            const s = useAdvancedSettingsStore.getState();
            expect(s.performance.disableAnimations).toBe(true);
            expect(s.performance.limitFps).toBe(true);
            expect(s.performance.mode).toBe("auto"); // unchanged
        });
    });

    // ─── Data Usage Actions ───────────────────────────────────
    describe("data usage actions", () => {
        it("setDataUsagePref – partial merge", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setDataUsagePref({ dataSaverEnabled: true, dataWarningMb: 100 });

            const s = useAdvancedSettingsStore.getState();
            expect(s.dataUsage.dataSaverEnabled).toBe(true);
            expect(s.dataUsage.dataWarningMb).toBe(100);
        });

        it("setMediaDownloadPolicy – changes per-media policy", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setMediaDownloadPolicy("autoDownloadImages", "never");

            expect(useAdvancedSettingsStore.getState().dataUsage.autoDownloadImages).toBe("never");
        });
    });

    // ─── Accessibility Actions ────────────────────────────────
    describe("accessibility actions", () => {
        it("setAccessibilityPref – partial merge", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setAccessibilityPref({ reduceMotion: true, boldText: true });

            const s = useAdvancedSettingsStore.getState();
            expect(s.accessibility.reduceMotion).toBe(true);
            expect(s.accessibility.boldText).toBe(true);
        });

        it("setFontSizeScale", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setFontSizeScale("large");

            expect(useAdvancedSettingsStore.getState().accessibility.fontSizeScale).toBe("large");
        });

        it("setContrastMode", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setContrastMode("high");

            expect(useAdvancedSettingsStore.getState().accessibility.contrastMode).toBe("high");
        });
    });

    // ─── Region Actions ───────────────────────────────────────
    describe("region actions", () => {
        it("setRegionPref – partial merge", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setRegionPref({ autoTimezone: false, firstDayOfWeek: 0 });

            const s = useAdvancedSettingsStore.getState();
            expect(s.region.autoTimezone).toBe(false);
            expect(s.region.firstDayOfWeek).toBe(0);
        });

        it("setTimezone", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setTimezone("America/New_York");

            expect(useAdvancedSettingsStore.getState().region.timezone).toBe("America/New_York");
        });

        it("setDateFormat", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setDateFormat("YYYY-MM-DD");

            expect(useAdvancedSettingsStore.getState().region.dateFormat).toBe("YYYY-MM-DD");
        });

        it("setTimeFormat", () => {
            const store = useAdvancedSettingsStore.getState();
            store.setTimeFormat("12h");

            expect(useAdvancedSettingsStore.getState().region.timeFormat).toBe("12h");
        });
    });

    // ─── API Keys ─────────────────────────────────────────────
    describe("api keys", () => {
        const KEY1 = { id: "k1", name: "OpenAI", key: "sk-123", createdAt: "2025-01-01" };
        const KEY2 = { id: "k2", name: "Stripe", key: "sk-456", createdAt: "2025-01-02" };

        it("addApiKey – appends key", () => {
            useAdvancedSettingsStore.getState().addApiKey(KEY1);

            expect(useAdvancedSettingsStore.getState().apiKeys).toEqual([KEY1]);
        });

        it("addApiKey – multiple", () => {
            useAdvancedSettingsStore.getState().addApiKey(KEY1);
            useAdvancedSettingsStore.getState().addApiKey(KEY2);

            expect(useAdvancedSettingsStore.getState().apiKeys).toHaveLength(2);
        });

        it("removeApiKey – removes by id", () => {
            useAdvancedSettingsStore.getState().addApiKey(KEY1);
            useAdvancedSettingsStore.getState().addApiKey(KEY2);
            useAdvancedSettingsStore.getState().removeApiKey("k1");

            expect(useAdvancedSettingsStore.getState().apiKeys).toEqual([KEY2]);
        });

        it("setApiKeys – replaces all", () => {
            useAdvancedSettingsStore.getState().addApiKey(KEY1);
            useAdvancedSettingsStore.getState().setApiKeys([KEY2]);

            expect(useAdvancedSettingsStore.getState().apiKeys).toEqual([KEY2]);
        });
    });

    // ─── Integrations ────────────────────────────────────────
    describe("integrations", () => {
        const INT1 = {
            id: "int-1",
            provider: "github" as const,
            enabled: true,
            connectedAt: "2025-01-01",
        };
        const INT2 = {
            id: "int-2",
            provider: "notion" as const,
            enabled: false,
            connectedAt: "2025-01-02",
        };

        it("setIntegrations – sets list", () => {
            useAdvancedSettingsStore.getState().setIntegrations([INT1, INT2]);

            expect(useAdvancedSettingsStore.getState().integrations).toHaveLength(2);
        });

        it("updateIntegration – partial update", () => {
            useAdvancedSettingsStore.getState().setIntegrations([INT1, INT2]);
            useAdvancedSettingsStore.getState().updateIntegration("int-2", { enabled: true });

            const found = useAdvancedSettingsStore.getState().integrations.find((i) => i.id === "int-2");
            expect(found?.enabled).toBe(true);
        });
    });

    // ─── Webhooks ─────────────────────────────────────────────
    describe("webhooks", () => {
        const WH1 = {
            id: "wh-1",
            name: "Slack Notifier",
            url: "https://hooks.slack.com/xxx",
            events: ["message.new" as const],
            enabled: true,
            createdAt: "2025-01-01",
        };
        const WH2 = {
            id: "wh-2",
            name: "Analytics",
            url: "https://analytics.example.com",
            events: ["user.joined" as const, "user.left" as const],
            enabled: true,
            createdAt: "2025-01-02",
        };

        it("addWebhook – appends", () => {
            useAdvancedSettingsStore.getState().addWebhook(WH1);

            expect(useAdvancedSettingsStore.getState().webhooks).toEqual([WH1]);
        });

        it("removeWebhook – removes by id", () => {
            useAdvancedSettingsStore.getState().addWebhook(WH1);
            useAdvancedSettingsStore.getState().addWebhook(WH2);
            useAdvancedSettingsStore.getState().removeWebhook("wh-1");

            expect(useAdvancedSettingsStore.getState().webhooks).toEqual([WH2]);
        });

        it("updateWebhook – partial update (toggle enabled)", () => {
            useAdvancedSettingsStore.getState().addWebhook(WH1);
            useAdvancedSettingsStore.getState().updateWebhook("wh-1", { enabled: false });

            expect(useAdvancedSettingsStore.getState().webhooks[0].enabled).toBe(false);
        });

        it("updateWebhook – update events", () => {
            useAdvancedSettingsStore.getState().addWebhook(WH1);
            useAdvancedSettingsStore.getState().updateWebhook("wh-1", {
                events: ["message.new", "message.edited"],
            });

            expect(useAdvancedSettingsStore.getState().webhooks[0].events).toEqual([
                "message.new",
                "message.edited",
            ]);
        });

        it("setWebhooks – replaces all", () => {
            useAdvancedSettingsStore.getState().addWebhook(WH1);
            useAdvancedSettingsStore.getState().setWebhooks([WH2]);

            expect(useAdvancedSettingsStore.getState().webhooks).toEqual([WH2]);
        });
    });

    // ─── Reset ────────────────────────────────────────────────
    describe("reset", () => {
        it("reset – restores all defaults", () => {
            const store = useAdvancedSettingsStore.getState();

            // Modify everything
            store.setPerformanceMode("high");
            store.setSoundPref({ masterVolume: 10 });
            store.setAccessibilityPref({ reduceMotion: true });
            store.setDataUsagePref({ dataSaverEnabled: true });
            store.setRegionPref({ autoTimezone: false });
            store.setNotificationPref("showPreview", false);
            store.addApiKey({ id: "x", name: "x", key: "x", createdAt: "now" });
            store.addWebhook({
                id: "w",
                name: "w",
                url: "u",
                events: ["message.new"],
                enabled: true,
                createdAt: "now",
            });

            // Reset
            store.reset();

            const s = useAdvancedSettingsStore.getState();
            expect(s.performance.mode).toBe("auto");
            expect(s.sound.masterVolume).toBe(80);
            expect(s.accessibility.reduceMotion).toBe(false);
            expect(s.dataUsage.dataSaverEnabled).toBe(false);
            expect(s.region.autoTimezone).toBe(true);
            expect(s.notifications.showPreview).toBe(true);
            expect(s.apiKeys).toEqual([]);
            expect(s.webhooks).toEqual([]);
        });
    });
});
