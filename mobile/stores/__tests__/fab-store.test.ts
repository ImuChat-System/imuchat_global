/**
 * Tests for stores/fab-store.ts
 * Sprint S4 Axe A — FAB Store
 */

jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

import { DEFAULT_FAB_ACTIONS, useFabStore } from "../fab-store";

beforeEach(() => {
    useFabStore.setState({
        isOpen: false,
        isVisible: true,
        actions: DEFAULT_FAB_ACTIONS.map((a) => ({ ...a })),
    });
});

// ─── Open / Close ─────────────────────────────────────────────

describe("open / close / toggle", () => {
    it("toggle flips isOpen", () => {
        expect(useFabStore.getState().isOpen).toBe(false);
        useFabStore.getState().toggle();
        expect(useFabStore.getState().isOpen).toBe(true);
        useFabStore.getState().toggle();
        expect(useFabStore.getState().isOpen).toBe(false);
    });

    it("open() sets isOpen true", () => {
        useFabStore.getState().open();
        expect(useFabStore.getState().isOpen).toBe(true);
    });

    it("close() sets isOpen false", () => {
        useFabStore.getState().open();
        useFabStore.getState().close();
        expect(useFabStore.getState().isOpen).toBe(false);
    });
});

// ─── Visibility ───────────────────────────────────────────────

describe("visibility", () => {
    it("setVisible(false) hides FAB", () => {
        useFabStore.getState().setVisible(false);
        expect(useFabStore.getState().isVisible).toBe(false);
    });

    it("setVisible(true) shows FAB", () => {
        useFabStore.getState().setVisible(false);
        useFabStore.getState().setVisible(true);
        expect(useFabStore.getState().isVisible).toBe(true);
    });
});

// ─── getEnabledActions ────────────────────────────────────────

describe("getEnabledActions", () => {
    it("returns all 7 enabled actions by default", () => {
        const enabled = useFabStore.getState().getEnabledActions();
        expect(enabled).toHaveLength(7);
    });

    it("returns actions sorted by order", () => {
        const enabled = useFabStore.getState().getEnabledActions();
        for (let i = 1; i < enabled.length; i++) {
            expect(enabled[i].order).toBeGreaterThanOrEqual(enabled[i - 1].order);
        }
    });

    it("excludes disabled actions", () => {
        useFabStore.getState().toggleAction("story");
        const enabled = useFabStore.getState().getEnabledActions();
        expect(enabled).toHaveLength(6);
        expect(enabled.find((a) => a.id === "story")).toBeUndefined();
    });
});

// ─── toggleAction ─────────────────────────────────────────────

describe("toggleAction", () => {
    it("disables an enabled action", () => {
        useFabStore.getState().toggleAction("video");
        const action = useFabStore.getState().actions.find((a) => a.id === "video");
        expect(action?.enabled).toBe(false);
    });

    it("re-enables a disabled action", () => {
        useFabStore.getState().toggleAction("video");
        useFabStore.getState().toggleAction("video");
        const action = useFabStore.getState().actions.find((a) => a.id === "video");
        expect(action?.enabled).toBe(true);
    });

    it("does not affect other actions", () => {
        useFabStore.getState().toggleAction("call");
        const others = useFabStore
            .getState()
            .actions.filter((a) => a.id !== "call");
        others.forEach((a) => expect(a.enabled).toBe(true));
    });
});

// ─── reorderActions ───────────────────────────────────────────

describe("reorderActions", () => {
    it("updates order based on provided ids array", () => {
        const newOrder = [
            "call",
            "video",
            "message",
            "story",
            "post",
            "event",
            "document",
        ];
        useFabStore.getState().reorderActions(newOrder);

        const { actions } = useFabStore.getState();
        expect(actions.find((a) => a.id === "call")?.order).toBe(0);
        expect(actions.find((a) => a.id === "video")?.order).toBe(1);
        expect(actions.find((a) => a.id === "message")?.order).toBe(2);
    });

    it("getEnabledActions reflects new order", () => {
        const newOrder = [
            "document",
            "call",
            "event",
            "post",
            "story",
            "video",
            "message",
        ];
        useFabStore.getState().reorderActions(newOrder);

        const enabled = useFabStore.getState().getEnabledActions();
        expect(enabled[0].id).toBe("document");
        expect(enabled[6].id).toBe("message");
    });
});

// ─── resetActions ─────────────────────────────────────────────

describe("resetActions", () => {
    it("resets to default actions and closes menu", () => {
        useFabStore.getState().open();
        useFabStore.getState().toggleAction("message");
        useFabStore.getState().reorderActions([
            "call",
            "video",
            "message",
            "story",
            "post",
            "event",
            "document",
        ]);

        useFabStore.getState().resetActions();

        const { actions, isOpen } = useFabStore.getState();
        expect(isOpen).toBe(false);
        expect(actions).toEqual(DEFAULT_FAB_ACTIONS);
    });
});

// ─── Default actions structure ────────────────────────────────

describe("DEFAULT_FAB_ACTIONS", () => {
    it("contains exactly 7 actions", () => {
        expect(DEFAULT_FAB_ACTIONS).toHaveLength(7);
    });

    it("each action has required fields", () => {
        DEFAULT_FAB_ACTIONS.forEach((a) => {
            expect(a).toHaveProperty("id");
            expect(a).toHaveProperty("label");
            expect(a).toHaveProperty("icon");
            expect(a).toHaveProperty("route");
            expect(a).toHaveProperty("emoji");
            expect(typeof a.enabled).toBe("boolean");
            expect(typeof a.order).toBe("number");
        });
    });

    it("has unique ids", () => {
        const ids = DEFAULT_FAB_ACTIONS.map((a) => a.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("has sequential orders 0-6", () => {
        const orders = DEFAULT_FAB_ACTIONS.map((a) => a.order).sort();
        expect(orders).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ─── S5: Contextual FAB ─────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("S5 — setActiveTab & getContextualActions", () => {
    beforeEach(() => {
        const { useFabStore } = require("@/stores/fab-store");
        useFabStore.getState().resetActions();
    });

    it("activeTab defaults to 'default'", () => {
        const { useFabStore } = require("@/stores/fab-store");
        expect(useFabStore.getState().activeTab).toBe("default");
    });

    it("setActiveTab updates activeTab and closes FAB", () => {
        const { useFabStore } = require("@/stores/fab-store");
        useFabStore.getState().open();
        expect(useFabStore.getState().isOpen).toBe(true);

        useFabStore.getState().setActiveTab("chats");
        expect(useFabStore.getState().activeTab).toBe("chats");
        expect(useFabStore.getState().isOpen).toBe(false);
    });

    it("getContextualActions returns all enabled actions for 'default' tab", () => {
        const { useFabStore } = require("@/stores/fab-store");
        useFabStore.getState().setActiveTab("default");
        const actions = useFabStore.getState().getContextualActions();
        expect(actions).toHaveLength(7);
    });

    it("getContextualActions prioritizes chats tab actions", () => {
        const { useFabStore } = require("@/stores/fab-store");
        useFabStore.getState().setActiveTab("chats");
        const actions = useFabStore.getState().getContextualActions();
        // chats priorities: message, call, document
        expect(actions[0].id).toBe("message");
        expect(actions[1].id).toBe("call");
        expect(actions[2].id).toBe("document");
    });

    it("getContextualActions prioritizes watch tab actions", () => {
        const { useFabStore } = require("@/stores/fab-store");
        useFabStore.getState().setActiveTab("watch");
        const actions = useFabStore.getState().getContextualActions();
        // watch priorities: video, story
        expect(actions[0].id).toBe("video");
        expect(actions[1].id).toBe("story");
    });

    it("getContextualActions excludes disabled actions", () => {
        const { useFabStore } = require("@/stores/fab-store");
        useFabStore.getState().toggleAction("message"); // disable
        useFabStore.getState().setActiveTab("chats");
        const actions = useFabStore.getState().getContextualActions();
        expect(actions.find((a: { id: string }) => a.id === "message")).toBeUndefined();
    });
});

describe("S5 — AUTO_HIDE_ROUTE_PATTERNS", () => {
    it("exports AUTO_HIDE_ROUTE_PATTERNS array", () => {
        const { AUTO_HIDE_ROUTE_PATTERNS } = require("@/stores/fab-store");
        expect(Array.isArray(AUTO_HIDE_ROUTE_PATTERNS)).toBe(true);
        expect(AUTO_HIDE_ROUTE_PATTERNS.length).toBeGreaterThanOrEqual(3);
    });

    it("includes imufeed and stories routes", () => {
        const { AUTO_HIDE_ROUTE_PATTERNS } = require("@/stores/fab-store");
        expect(AUTO_HIDE_ROUTE_PATTERNS).toContain("/imufeed");
        expect(AUTO_HIDE_ROUTE_PATTERNS).toContain("/stories/");
    });
});
