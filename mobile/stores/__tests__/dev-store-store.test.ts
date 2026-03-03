/**
 * Tests — Dev Store (DEV-034)
 *
 * Couvre les actions du store Zustand DevStore :
 * - Submissions CRUD + submitForReview
 * - Themes CRUD + publish
 * - Profile + KYC
 * - Analytics
 * - API Keys + revoke
 * - Webhooks
 * - Dashboard + reset
 */

import { useDevStore } from "../dev-store-store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetStore() {
    useDevStore.getState().reset();
}

beforeEach(resetStore);

// ---------------------------------------------------------------------------
// Submissions
// ---------------------------------------------------------------------------

describe("Submissions", () => {
    it("should start with empty submissions", () => {
        var s = useDevStore.getState();
        expect(s.submissions).toEqual([]);
        expect(s.submissionsLoading).toBe(false);
    });

    it("createSubmission should add a submission", async () => {
        var created = await useDevStore.getState().createSubmission({
            name: "Test App",
            short_description: "Short desc",
            description: "Full description",
            category: "social",
            entry_url: "https://example.com",
            version: "1.0.0",
            changelog: "Initial",
            permissions: ["camera"],
            price: 0,
        });

        var s = useDevStore.getState();
        expect(s.submissions).toHaveLength(1);
        expect(s.submissions[0].name).toBe("Test App");
        expect(s.submissions[0].status).toBe("draft");
        expect(s.submissions[0].category).toBe("social");
        expect(created.name).toBe("Test App");
    });

    it("updateSubmission should modify a submission", async () => {
        var created = await useDevStore.getState().createSubmission({
            name: "App",
            short_description: "s",
            description: "d",
            category: "media",
            entry_url: "https://a.com",
            version: "1.0.0",
            changelog: "",
            permissions: [],
            price: 0,
        });

        await useDevStore.getState().updateSubmission(created.id, { name: "Updated App" });
        var s = useDevStore.getState();
        expect(s.submissions[0].name).toBe("Updated App");
    });

    it("deleteSubmission should remove a submission", async () => {
        var created = await useDevStore.getState().createSubmission({
            name: "ToDelete",
            short_description: "s",
            description: "d",
            category: "games",
            entry_url: "https://x.com",
            version: "1.0.0",
            changelog: "",
            permissions: [],
            price: 0,
        });

        expect(useDevStore.getState().submissions).toHaveLength(1);
        await useDevStore.getState().deleteSubmission(created.id);
        expect(useDevStore.getState().submissions).toHaveLength(0);
    });

    it("submitForReview should update status to pending_review", async () => {
        var created = await useDevStore.getState().createSubmission({
            name: "ReviewApp",
            short_description: "s",
            description: "d",
            category: "productivity",
            entry_url: "https://r.com",
            version: "1.0.0",
            changelog: "",
            permissions: [],
            price: 5,
        });

        await useDevStore.getState().submitForReview(created.id);
        var sub = useDevStore.getState().submissions[0];
        expect(sub.status).toBe("pending_review");
    });
});

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

describe("Themes", () => {
    it("should start with empty themes", () => {
        expect(useDevStore.getState().themes).toEqual([]);
    });

    it("createTheme should add a theme", async () => {
        var created = await useDevStore.getState().createTheme({
            name: "Ocean",
            description: "Blue theme",
            mode: "light",
            colors: {
                primary: "#0077cc",
                secondary: "#005fa3",
                background: "#ffffff",
                surface: "#f0f0f0",
                text: "#111111",
                textMuted: "#777777",
                border: "#cccccc",
                error: "#ff0000",
                success: "#00cc00",
                warning: "#ffaa00",
                accent: "#ff5500",
            },
            borderRadius: 8,
            fontFamily: "System",
        });

        var s = useDevStore.getState();
        expect(s.themes).toHaveLength(1);
        expect(s.themes[0].name).toBe("Ocean");
        expect(s.themes[0].status).toBe("draft");
        expect(created.name).toBe("Ocean");
    });

    it("updateTheme should modify a theme", async () => {
        var created = await useDevStore.getState().createTheme({
            name: "Dark",
            description: "Dark theme",
            mode: "dark",
            colors: {
                primary: "#bb86fc",
                secondary: "#03dac6",
                background: "#121212",
                surface: "#1e1e1e",
                text: "#ffffff",
                textMuted: "#888888",
                border: "#333333",
                error: "#cf6679",
                success: "#00cc00",
                warning: "#ffaa00",
                accent: "#ff5500",
            },
            borderRadius: 12,
            fontFamily: "System",
        });

        await useDevStore.getState().updateTheme(created.id, { name: "Dark Pro" });
        expect(useDevStore.getState().themes[0].name).toBe("Dark Pro");
    });

    it("deleteTheme should remove a theme", async () => {
        var created = await useDevStore.getState().createTheme({
            name: "ToDelete",
            description: "",
            mode: "light",
            colors: {
                primary: "#000", secondary: "#000", background: "#fff",
                surface: "#eee", text: "#000", textMuted: "#666",
                border: "#ccc", error: "#f00", success: "#0c0",
                warning: "#fa0", accent: "#f50",
            },
            borderRadius: 8,
            fontFamily: "System",
        });

        await useDevStore.getState().deleteTheme(created.id);
        expect(useDevStore.getState().themes).toHaveLength(0);
    });

    it("publishTheme should update status to published", async () => {
        var created = await useDevStore.getState().createTheme({
            name: "Publish Me",
            description: "p",
            mode: "light",
            colors: {
                primary: "#000", secondary: "#000", background: "#fff",
                surface: "#eee", text: "#000", textMuted: "#666",
                border: "#ccc", error: "#f00", success: "#0c0",
                warning: "#fa0", accent: "#f50",
            },
            borderRadius: 8,
            fontFamily: "System",
        });

        await useDevStore.getState().publishTheme(created.id);
        expect(useDevStore.getState().themes[0].status).toBe("published");
    });
});

// ---------------------------------------------------------------------------
// Profile & KYC
// ---------------------------------------------------------------------------

describe("Profile & KYC", () => {
    it("should start with null profile", () => {
        expect(useDevStore.getState().profile).toBeNull();
    });

    it("updateProfile should set profile", async () => {
        await useDevStore.getState().updateProfile({
            display_name: "DevUser",
            bio: "Hello",
            website: "https://dev.com",
            github: "devuser",
        });

        var p = useDevStore.getState().profile;
        expect(p).not.toBeNull();
        expect(p!.display_name).toBe("DevUser");
        expect(p!.bio).toBe("Hello");
    });

    it("startKYC should set kyc_status to pending", async () => {
        // first create profile
        await useDevStore.getState().updateProfile({
            display_name: "KYC User",
            bio: "",
            website: "",
            github: "",
        });

        await useDevStore.getState().startKYC();
        var p = useDevStore.getState().profile;
        expect(p!.kyc_status).toBe("pending");
    });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("Analytics", () => {
    it("should start with null analyticsOverview", () => {
        expect(useDevStore.getState().analyticsOverview).toBeNull();
    });

    it("setAnalyticsPeriod should update the period", () => {
        useDevStore.getState().setAnalyticsPeriod("90d");
        expect(useDevStore.getState().analyticsPeriod).toBe("90d");
    });

    it("fetchAnalyticsOverview should populate overview", async () => {
        await useDevStore.getState().fetchAnalyticsOverview("30d");
        var ov = useDevStore.getState().analyticsOverview;
        expect(ov).not.toBeNull();
        expect(ov).toHaveProperty("total_downloads");
        expect(ov).toHaveProperty("total_revenue");
    });
});

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------

describe("API Keys", () => {
    it("should start with empty apiKeys", () => {
        expect(useDevStore.getState().apiKeys).toEqual([]);
    });

    it("createAPIKey should add a key", async () => {
        var key = await useDevStore.getState().createAPIKey("Test Key", ["read"]);
        expect(useDevStore.getState().apiKeys).toHaveLength(1);
        expect(key.name).toBe("Test Key");
        expect(key.is_active).toBe(true);
    });

    it("createAPIKey multiple times should accumulate", async () => {
        await useDevStore.getState().createAPIKey("Key 1", ["read"]);
        await useDevStore.getState().createAPIKey("Key 2", ["write"]);
        expect(useDevStore.getState().apiKeys).toHaveLength(2);
    });

    it("revokeAPIKey should deactivate a key", async () => {
        var key = await useDevStore.getState().createAPIKey("Revoke Me", ["read"]);
        await useDevStore.getState().revokeAPIKey(key.id);
        var k = useDevStore.getState().apiKeys.find(function (x) { return x.id === key.id; });
        expect(k!.is_active).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

describe("Webhooks", () => {
    it("should start with empty webhooks", () => {
        expect(useDevStore.getState().webhooks).toEqual([]);
    });

    it("createWebhook should add a webhook", async () => {
        await useDevStore.getState().createWebhook("https://hook.example.com/test", [
            "app.installed",
            "review.created",
        ]);

        expect(useDevStore.getState().webhooks).toHaveLength(1);
        expect(useDevStore.getState().webhooks[0].url).toBe("https://hook.example.com/test");
    });

    it("deleteWebhook should remove a webhook", async () => {
        await useDevStore.getState().createWebhook("https://hook.example.com/del", ["app.installed"]);
        var id = useDevStore.getState().webhooks[0].id;
        await useDevStore.getState().deleteWebhook(id);
        expect(useDevStore.getState().webhooks).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

describe("Dashboard", () => {
    it("fetchDashboard should populate stats and activity", async () => {
        await useDevStore.getState().fetchDashboard();
        var s = useDevStore.getState();
        expect(s.dashboardStats).not.toBeNull();
        expect(s.dashboardStats).toHaveProperty("total_apps");
        expect(s.dashboardStats).toHaveProperty("total_themes");
        expect(Array.isArray(s.recentActivity)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

describe("Reset", () => {
    it("reset should restore initial state", async () => {
        await useDevStore.getState().createSubmission({
            name: "X",
            short_description: "s",
            description: "d",
            category: "games",
            entry_url: "https://x.com",
            version: "1.0.0",
            changelog: "",
            permissions: [],
            price: 0,
        });
        await useDevStore.getState().createAPIKey("K", ["read"]);

        expect(useDevStore.getState().submissions).toHaveLength(1);
        expect(useDevStore.getState().apiKeys).toHaveLength(1);

        useDevStore.getState().reset();

        expect(useDevStore.getState().submissions).toEqual([]);
        expect(useDevStore.getState().apiKeys).toEqual([]);
        expect(useDevStore.getState().profile).toBeNull();
        expect(useDevStore.getState().themes).toEqual([]);
    });
});
