/**
 * Tests for stores/notifications-store.ts
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

import { AppNotification, useNotificationsStore } from "../notifications-store";

const makeNotification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
    id: `notif-${Date.now()}-${Math.random()}`,
    title: "New message",
    body: "Hello",
    type: "message",
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides,
});

describe("useNotificationsStore", () => {
    beforeEach(() => {
        useNotificationsStore.getState().clearAll();
        useNotificationsStore.setState({
            pushToken: null,
            permissionGranted: false,
            unreadCount: 0,
        });
    });

    // ── Push token ──────────────────────────
    describe("setPushToken", () => {
        it("should store the push token", () => {
            useNotificationsStore.getState().setPushToken("expo-token-abc");
            expect(useNotificationsStore.getState().pushToken).toBe("expo-token-abc");
        });

        it("should clear push token with null", () => {
            useNotificationsStore.getState().setPushToken("token");
            useNotificationsStore.getState().setPushToken(null);
            expect(useNotificationsStore.getState().pushToken).toBeNull();
        });
    });

    // ── Permission ──────────────────────────
    describe("setPermissionGranted", () => {
        it("should set permission granted", () => {
            useNotificationsStore.getState().setPermissionGranted(true);
            expect(useNotificationsStore.getState().permissionGranted).toBe(true);
        });
    });

    // ── Add notification ────────────────────
    describe("addNotification", () => {
        it("should add a notification and increment unread", () => {
            const n = makeNotification({ id: "n-1" });
            useNotificationsStore.getState().addNotification(n);

            const state = useNotificationsStore.getState();
            expect(state.notifications).toHaveLength(1);
            expect(state.notifications[0].id).toBe("n-1");
            expect(state.unreadCount).toBe(1);
        });

        it("should prepend new notifications", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "first" }));
            useNotificationsStore.getState().addNotification(makeNotification({ id: "second" }));

            expect(useNotificationsStore.getState().notifications[0].id).toBe("second");
            expect(useNotificationsStore.getState().notifications[1].id).toBe("first");
        });

        it("should cap notifications at 50", () => {
            for (let i = 0; i < 55; i++) {
                useNotificationsStore.getState().addNotification(
                    makeNotification({ id: `n-${i}` }),
                );
            }
            expect(useNotificationsStore.getState().notifications).toHaveLength(50);
        });
    });

    // ── Mark as read ────────────────────────
    describe("markAsRead", () => {
        it("should mark a notification as read and decrement unread", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-1" }));
            expect(useNotificationsStore.getState().unreadCount).toBe(1);

            useNotificationsStore.getState().markAsRead("n-1");

            const state = useNotificationsStore.getState();
            expect(state.notifications[0].read).toBe(true);
            expect(state.unreadCount).toBe(0);
        });

        it("should not decrement if already read", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-1" }));
            useNotificationsStore.getState().markAsRead("n-1");
            useNotificationsStore.getState().markAsRead("n-1"); // second call

            expect(useNotificationsStore.getState().unreadCount).toBe(0);
        });

        it("should do nothing for unknown id", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-1" }));
            useNotificationsStore.getState().markAsRead("unknown");
            expect(useNotificationsStore.getState().unreadCount).toBe(1);
        });
    });

    // ── Mark all as read ────────────────────
    describe("markAllAsRead", () => {
        it("should mark all notifications as read", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-1" }));
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-2" }));

            useNotificationsStore.getState().markAllAsRead();

            const state = useNotificationsStore.getState();
            expect(state.unreadCount).toBe(0);
            expect(state.notifications.every((n) => n.read)).toBe(true);
        });
    });

    // ── Remove notification ─────────────────
    describe("removeNotification", () => {
        it("should remove the notification", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-1" }));
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-2" }));

            useNotificationsStore.getState().removeNotification("n-1");

            expect(useNotificationsStore.getState().notifications).toHaveLength(1);
            expect(useNotificationsStore.getState().notifications[0].id).toBe("n-2");
        });

        it("should decrement unread when removing unread notification", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-1" }));
            useNotificationsStore.getState().removeNotification("n-1");
            expect(useNotificationsStore.getState().unreadCount).toBe(0);
        });

        it("should not decrement unread when removing read notification", () => {
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-1" }));
            useNotificationsStore.getState().addNotification(makeNotification({ id: "n-2" }));
            useNotificationsStore.getState().markAsRead("n-1");
            useNotificationsStore.getState().removeNotification("n-1");
            expect(useNotificationsStore.getState().unreadCount).toBe(1);
        });
    });

    // ── Clear all ───────────────────────────
    describe("clearAll", () => {
        it("should clear all notifications and reset count", () => {
            useNotificationsStore.getState().addNotification(makeNotification());
            useNotificationsStore.getState().addNotification(makeNotification());
            useNotificationsStore.getState().clearAll();

            expect(useNotificationsStore.getState().notifications).toEqual([]);
            expect(useNotificationsStore.getState().unreadCount).toBe(0);
        });
    });

    // ── Unread count operations ─────────────
    describe("unread count", () => {
        it("setUnreadCount sets the count", () => {
            useNotificationsStore.getState().setUnreadCount(42);
            expect(useNotificationsStore.getState().unreadCount).toBe(42);
        });

        it("incrementUnread increments by 1", () => {
            useNotificationsStore.getState().setUnreadCount(5);
            useNotificationsStore.getState().incrementUnread();
            expect(useNotificationsStore.getState().unreadCount).toBe(6);
        });

        it("decrementUnread decrements by 1", () => {
            useNotificationsStore.getState().setUnreadCount(5);
            useNotificationsStore.getState().decrementUnread();
            expect(useNotificationsStore.getState().unreadCount).toBe(4);
        });

        it("decrementUnread does not go below 0", () => {
            useNotificationsStore.getState().setUnreadCount(0);
            useNotificationsStore.getState().decrementUnread();
            expect(useNotificationsStore.getState().unreadCount).toBe(0);
        });
    });
});
