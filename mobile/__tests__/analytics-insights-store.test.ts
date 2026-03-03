/**
 * Analytics Insights Store — Tests (DEV-036)
 *
 * 38 tests covering all store actions & mock generators.
 */
import { useAnalyticsInsightsStore } from "../stores/analytics-insights-store";

// ── helpers ───────────────────────────────────────────────
function resetStore() {
    const s = useAnalyticsInsightsStore.getState();
    s.setPeriod("30d");
    useAnalyticsInsightsStore.setState({
        overview: null,
        engagement: null,
        communication: null,
        social: null,
        storage: null,
        heatmap: null,
        exports: [],
        isLoading: false,
    });
}

beforeEach(resetStore);

const getState = () => useAnalyticsInsightsStore.getState();

// ============================================================================
// PERIOD
// ============================================================================

describe("AnalyticsInsightsStore — period", () => {
    it("has default period 30d", () => {
        expect(getState().period).toBe("30d");
    });

    it.each(["7d", "90d", "6m", "1y", "all"] as const)(
        "setPeriod(%s) updates period",
        (p) => {
            getState().setPeriod(p);
            expect(getState().period).toBe(p);
        },
    );
});

// ============================================================================
// FETCH OVERVIEW
// ============================================================================

describe("AnalyticsInsightsStore — fetchOverview", () => {
    it("populates overview data", () => {
        getState().fetchOverview();
        const { overview, isLoading } = getState();
        expect(isLoading).toBe(false);
        expect(overview).not.toBeNull();
        expect(overview!.totalMessages).toBeGreaterThan(0);
        expect(overview!.totalCalls).toBeGreaterThan(0);
        expect(overview!.totalMediaShared).toBeGreaterThan(0);
        expect(overview!.totalFriends).toBeGreaterThan(0);
        expect(overview!.averageSessionMinutes).toBeGreaterThan(0);
        expect(overview!.activeStreak).toBeGreaterThan(0);
    });

    it("overview.metrics is an array of MetricCards", () => {
        getState().fetchOverview();
        const m = getState().overview!.metrics;
        expect(Array.isArray(m)).toBe(true);
        expect(m.length).toBeGreaterThanOrEqual(1);
        expect(m[0]).toHaveProperty("label");
        expect(m[0]).toHaveProperty("value");
        expect(m[0]).toHaveProperty("trend");
    });
});

// ============================================================================
// FETCH ENGAGEMENT
// ============================================================================

describe("AnalyticsInsightsStore — fetchEngagement", () => {
    it("populates engagement data", () => {
        getState().fetchEngagement();
        const { engagement } = getState();
        expect(engagement).not.toBeNull();
        expect(engagement!.averageSessionLength).toBeGreaterThan(0);
        expect(engagement!.peakHour).toBeGreaterThanOrEqual(0);
        expect(engagement!.peakDay).toBeTruthy();
    });

    it("dailyActiveMinutes has correct length for period 7d", () => {
        getState().setPeriod("7d");
        getState().fetchEngagement();
        expect(getState().engagement!.dailyActiveMinutes.length).toBe(7);
    });

    it("dailyActiveMinutes has correct length for period 90d", () => {
        getState().setPeriod("90d");
        getState().fetchEngagement();
        expect(getState().engagement!.dailyActiveMinutes.length).toBe(90);
    });

    it("sessionsPerDay is an array of DataPoint", () => {
        getState().fetchEngagement();
        const sp = getState().engagement!.sessionsPerDay;
        expect(Array.isArray(sp)).toBe(true);
        expect(sp[0]).toHaveProperty("date");
        expect(sp[0]).toHaveProperty("value");
    });
});

// ============================================================================
// FETCH COMMUNICATION
// ============================================================================

describe("AnalyticsInsightsStore — fetchCommunication", () => {
    it("populates communication data", () => {
        getState().fetchCommunication();
        const c = getState().communication!;
        expect(c).not.toBeNull();
        expect(c.messagesSent).toBeGreaterThan(0);
        expect(c.messagesReceived).toBeGreaterThan(0);
        expect(c.callsMade).toBeGreaterThan(0);
        expect(c.callsReceived).toBeGreaterThan(0);
        expect(c.totalCallMinutes).toBeGreaterThan(0);
    });

    it("messagesByType contains expected types", () => {
        getState().fetchCommunication();
        const mbt = getState().communication!.messagesByType;
        expect(mbt.text).toBeGreaterThan(0);
        expect(mbt.image).toBeGreaterThan(0);
    });

    it("topContacts has at least 1 entry", () => {
        getState().fetchCommunication();
        const tc = getState().communication!.topContacts;
        expect(tc.length).toBeGreaterThanOrEqual(1);
        expect(tc[0]).toHaveProperty("id");
        expect(tc[0]).toHaveProperty("name");
        expect(tc[0]).toHaveProperty("messagesCount");
    });
});

// ============================================================================
// FETCH SOCIAL
// ============================================================================

describe("AnalyticsInsightsStore — fetchSocial", () => {
    it("populates social data", () => {
        getState().fetchSocial();
        const s = getState().social!;
        expect(s.followersCount).toBeGreaterThan(0);
        expect(s.followingCount).toBeGreaterThan(0);
        expect(s.postsCount).toBeGreaterThan(0);
        expect(s.engagementRate).toBeGreaterThan(0);
    });

    it("topPosts is an array", () => {
        getState().fetchSocial();
        const tp = getState().social!.topPosts;
        expect(Array.isArray(tp)).toBe(true);
        expect(tp.length).toBeGreaterThanOrEqual(1);
        expect(tp[0]).toHaveProperty("id");
        expect(tp[0]).toHaveProperty("likes");
    });
});

// ============================================================================
// FETCH STORAGE
// ============================================================================

describe("AnalyticsInsightsStore — fetchStorage", () => {
    it("populates storage data", () => {
        getState().fetchStorage();
        const st = getState().storage!;
        expect(st.totalUsedMB).toBeGreaterThan(0);
        expect(st.totalLimitMB).toBeGreaterThan(0);
        expect(st.usagePercent).toBeGreaterThan(0);
    });

    it("breakdown covers 5 categories", () => {
        getState().fetchStorage();
        expect(getState().storage!.breakdown.length).toBe(5);
    });

    it("storageTrend is an array", () => {
        getState().fetchStorage();
        const trend = getState().storage!.storageTrend;
        expect(Array.isArray(trend)).toBe(true);
        expect(trend.length).toBeGreaterThan(0);
    });
});

// ============================================================================
// FETCH HEATMAP
// ============================================================================

describe("AnalyticsInsightsStore — fetchHeatmap", () => {
    it("populates heatmap data", () => {
        getState().fetchHeatmap();
        const h = getState().heatmap!;
        expect(h).not.toBeNull();
        expect(h.cells.length).toBe(7 * 24);
    });

    it("cells have valid day/hour ranges", () => {
        getState().fetchHeatmap();
        const cells = getState().heatmap!.cells;
        cells.forEach((c) => {
            expect(c.day).toBeGreaterThanOrEqual(0);
            expect(c.day).toBeLessThanOrEqual(6);
            expect(c.hour).toBeGreaterThanOrEqual(0);
            expect(c.hour).toBeLessThanOrEqual(23);
            expect(c.intensity).toBeGreaterThanOrEqual(0);
            expect(c.intensity).toBeLessThanOrEqual(1);
        });
    });

    it("mostActiveDay is a string", () => {
        getState().fetchHeatmap();
        expect(typeof getState().heatmap!.mostActiveDay).toBe("string");
    });
});

// ============================================================================
// FETCH ALL
// ============================================================================

describe("AnalyticsInsightsStore — fetchAll", () => {
    it("populates all sections", () => {
        getState().fetchAll();
        const s = getState();
        expect(s.overview).not.toBeNull();
        expect(s.engagement).not.toBeNull();
        expect(s.communication).not.toBeNull();
        expect(s.social).not.toBeNull();
        expect(s.storage).not.toBeNull();
        expect(s.heatmap).not.toBeNull();
    });
});

// ============================================================================
// EXPORTS
// ============================================================================

describe("AnalyticsInsightsStore — exports", () => {
    it("requestExport creates a record", () => {
        const rec = getState().requestExport({
            format: "csv",
            scope: "all",
            period: "30d",
            includePersonalData: false,
        });
        expect(rec).toHaveProperty("id");
        expect(rec.format).toBe("csv");
        expect(rec.scope).toBe("all");
        expect(rec.status).toBe("completed");
        expect(getState().exports.length).toBe(1);
    });

    it("requestExport prepends to the list", () => {
        getState().requestExport({ format: "csv", scope: "overview", period: "7d", includePersonalData: false });
        getState().requestExport({ format: "json", scope: "social", period: "90d", includePersonalData: true });
        const exps = getState().exports;
        expect(exps.length).toBe(2);
        expect(exps[0].format).toBe("json");
        expect(exps[1].format).toBe("csv");
    });

    it("deleteExport removes specific record", () => {
        const rec = getState().requestExport({ format: "csv", scope: "all", period: "30d", includePersonalData: false });
        expect(getState().exports.length).toBe(1);
        getState().deleteExport(rec.id);
        expect(getState().exports.length).toBe(0);
    });

    it("clearExports removes all records", () => {
        getState().requestExport({ format: "csv", scope: "all", period: "30d", includePersonalData: false });
        getState().requestExport({ format: "json", scope: "storage", period: "7d", includePersonalData: false });
        expect(getState().exports.length).toBe(2);
        getState().clearExports();
        expect(getState().exports.length).toBe(0);
    });

    it("exports are capped at 50", () => {
        for (let i = 0; i < 55; i++) {
            getState().requestExport({ format: "csv", scope: "all", period: "30d", includePersonalData: false });
        }
        expect(getState().exports.length).toBe(50);
    });
});

// ============================================================================
// LOADING
// ============================================================================

describe("AnalyticsInsightsStore — loading", () => {
    it("setLoading updates isLoading flag", () => {
        getState().setLoading(true);
        expect(getState().isLoading).toBe(true);
        getState().setLoading(false);
        expect(getState().isLoading).toBe(false);
    });
});
