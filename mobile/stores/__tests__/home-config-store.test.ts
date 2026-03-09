/**
 * Tests for stores/home-config-store.ts
 * Zustand store tested via getState()/setState()
 */

jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock("../../services/logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

import { DEFAULT_QUICK_ACTIONS, DEFAULT_SECTIONS } from "../../types/home-hub";
import { useHomeConfigStore } from "../home-config-store";

describe("useHomeConfigStore", () => {
    beforeEach(() => {
        useHomeConfigStore.getState().resetToDefaults();
    });

    // ─── Initial State ────────────────────────────────

    it("should have default sections", () => {
        const { layout } = useHomeConfigStore.getState();
        expect(layout.sections.length).toBe(DEFAULT_SECTIONS.length);
    });

    it("should have default quick actions", () => {
        const { layout } = useHomeConfigStore.getState();
        expect(layout.quickActions.length).toBe(DEFAULT_QUICK_ACTIONS.length);
    });

    it("should not be in editing mode by default", () => {
        expect(useHomeConfigStore.getState().isEditing).toBe(false);
    });

    // ─── Section Visibility ───────────────────────────

    it("getVisibleSections returns only visible sections sorted by order", () => {
        const visible = useHomeConfigStore.getState().getVisibleSections();
        expect(visible.length).toBeGreaterThan(0);
        for (const s of visible) {
            expect(s.visible).toBe(true);
        }
        // Check sorted by order
        for (let i = 1; i < visible.length; i++) {
            expect(visible[i].order).toBeGreaterThanOrEqual(visible[i - 1].order);
        }
    });

    it("toggleSectionVisibility hides a visible section", () => {
        const firstSection = useHomeConfigStore.getState().getVisibleSections()[0];
        useHomeConfigStore.getState().toggleSectionVisibility(firstSection.id);

        const section = useHomeConfigStore
            .getState()
            .layout.sections.find((s) => s.id === firstSection.id);
        expect(section?.visible).toBe(false);
    });

    it("toggleSectionVisibility shows a hidden section", () => {
        const firstSection = useHomeConfigStore.getState().getVisibleSections()[0];
        // Hide then show
        useHomeConfigStore.getState().toggleSectionVisibility(firstSection.id);
        useHomeConfigStore.getState().toggleSectionVisibility(firstSection.id);

        const section = useHomeConfigStore
            .getState()
            .layout.sections.find((s) => s.id === firstSection.id);
        expect(section?.visible).toBe(true);
    });

    // ─── Section Reorder ──────────────────────────────

    it("moveSectionDown swaps order with next section", () => {
        const visible = useHomeConfigStore.getState().getVisibleSections();
        const first = visible[0];
        const second = visible[1];
        const firstOrder = first.order;
        const secondOrder = second.order;

        useHomeConfigStore.getState().moveSectionDown(first.id);

        const sections = useHomeConfigStore.getState().layout.sections;
        const updatedFirst = sections.find((s) => s.id === first.id)!;
        const updatedSecond = sections.find((s) => s.id === second.id)!;

        expect(updatedFirst.order).toBe(secondOrder);
        expect(updatedSecond.order).toBe(firstOrder);
    });

    it("moveSectionUp swaps order with previous section", () => {
        const visible = useHomeConfigStore.getState().getVisibleSections();
        const first = visible[0];
        const second = visible[1];
        const firstOrder = first.order;
        const secondOrder = second.order;

        useHomeConfigStore.getState().moveSectionUp(second.id);

        const sections = useHomeConfigStore.getState().layout.sections;
        const updatedFirst = sections.find((s) => s.id === first.id)!;
        const updatedSecond = sections.find((s) => s.id === second.id)!;

        expect(updatedSecond.order).toBe(firstOrder);
        expect(updatedFirst.order).toBe(secondOrder);
    });

    it("moveSectionUp on first section does nothing", () => {
        const visible = useHomeConfigStore.getState().getVisibleSections();
        const first = visible[0];
        const originalOrder = first.order;

        useHomeConfigStore.getState().moveSectionUp(first.id);

        const section = useHomeConfigStore
            .getState()
            .layout.sections.find((s) => s.id === first.id)!;
        expect(section.order).toBe(originalOrder);
    });

    it("reorderSections reassigns orders", () => {
        const visible = useHomeConfigStore.getState().getVisibleSections();
        const reversed = [...visible].reverse().map((s) => s.id);

        useHomeConfigStore.getState().reorderSections(reversed);

        const sections = useHomeConfigStore.getState().layout.sections;
        expect(sections.find((s) => s.id === reversed[0])?.order).toBe(0);
        expect(sections.find((s) => s.id === reversed[1])?.order).toBe(1);
    });

    // ─── Quick Actions ────────────────────────────────

    it("getActiveQuickActions returns enabled actions sorted by position", () => {
        const active = useHomeConfigStore.getState().getActiveQuickActions();
        expect(active.length).toBeGreaterThan(0);
        for (const a of active) {
            expect(a.enabled).toBe(true);
        }
        for (let i = 1; i < active.length; i++) {
            expect(active[i].position).toBeGreaterThanOrEqual(active[i - 1].position);
        }
    });

    it("toggleQuickAction disables an enabled action", () => {
        const first = useHomeConfigStore.getState().getActiveQuickActions()[0];
        useHomeConfigStore.getState().toggleQuickAction(first.id);

        const action = useHomeConfigStore
            .getState()
            .layout.quickActions.find((a) => a.id === first.id);
        expect(action?.enabled).toBe(false);
    });

    it("reorderQuickActions updates positions", () => {
        const actions = useHomeConfigStore.getState().layout.quickActions;
        const ids = actions.map((a) => a.id).reverse();

        useHomeConfigStore.getState().reorderQuickActions(ids);

        const qa = useHomeConfigStore.getState().layout.quickActions;
        expect(qa.find((a) => a.id === ids[0])?.position).toBe(0);
        expect(qa.find((a) => a.id === ids[1])?.position).toBe(1);
    });

    it("updateQuickActionBadge sets badge value", () => {
        const first = useHomeConfigStore.getState().layout.quickActions[0];
        useHomeConfigStore.getState().updateQuickActionBadge(first.id, 5);

        const action = useHomeConfigStore
            .getState()
            .layout.quickActions.find((a) => a.id === first.id);
        expect(action?.badge).toBe(5);
    });

    // ─── Widgets ──────────────────────────────────────

    it("addWidget adds a widget to layout", () => {
        useHomeConfigStore.getState().addWidget({
            id: "test-widget",
            type: "weather",
            title: "Météo",
            size: "small",
            visible: true,
            position: 0,
        });

        expect(useHomeConfigStore.getState().layout.widgets).toHaveLength(1);
        expect(useHomeConfigStore.getState().layout.widgets[0].id).toBe("test-widget");
    });

    it("removeWidget removes a widget", () => {
        useHomeConfigStore.getState().addWidget({
            id: "w1",
            type: "calendar",
            title: "Cal",
            size: "medium",
            visible: true,
            position: 0,
        });
        useHomeConfigStore.getState().removeWidget("w1");
        expect(useHomeConfigStore.getState().layout.widgets).toHaveLength(0);
    });

    it("toggleWidgetVisibility toggles widget visible flag", () => {
        useHomeConfigStore.getState().addWidget({
            id: "w2",
            type: "weather",
            title: "Météo",
            size: "small",
            visible: true,
            position: 0,
        });
        useHomeConfigStore.getState().toggleWidgetVisibility("w2");
        expect(
            useHomeConfigStore.getState().layout.widgets.find((w) => w.id === "w2")?.visible,
        ).toBe(false);
    });

    // ─── Editing ──────────────────────────────────────

    it("setEditing toggles editing mode", () => {
        useHomeConfigStore.getState().setEditing(true);
        expect(useHomeConfigStore.getState().isEditing).toBe(true);
        useHomeConfigStore.getState().setEditing(false);
        expect(useHomeConfigStore.getState().isEditing).toBe(false);
    });

    // ─── Reset ────────────────────────────────────────

    it("resetToDefaults restores initial layout", () => {
        // Modify state
        useHomeConfigStore.getState().setEditing(true);
        useHomeConfigStore.getState().toggleSectionVisibility("hero_carousel");
        useHomeConfigStore.getState().addWidget({
            id: "temp",
            type: "weather",
            title: "T",
            size: "small",
            visible: true,
            position: 0,
        });

        // Reset
        useHomeConfigStore.getState().resetToDefaults();

        const state = useHomeConfigStore.getState();
        expect(state.isEditing).toBe(false);
        expect(state.layout.widgets).toHaveLength(0);
        expect(state.layout.sections.length).toBe(DEFAULT_SECTIONS.length);

        // hero_carousel should be visible again
        const hero = state.layout.sections.find((s) => s.id === "hero_carousel");
        expect(hero?.visible).toBe(true);
    });
});
