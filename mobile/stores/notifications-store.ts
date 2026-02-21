/**
 * Notifications Store (Zustand + AsyncStorage persist)
 *
 * Gère l'état global des notifications :
 * - Badge count (unread)
 * - Permissions status
 * - Push token
 * - Dernières notifications en mémoire
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AppNotification {
    id: string;
    title: string;
    body: string;
    type: "message" | "call" | "contact" | "system";
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: string;
}

interface NotificationsState {
    // State
    pushToken: string | null;
    permissionGranted: boolean;
    unreadCount: number;
    notifications: AppNotification[];

    // Actions
    setPushToken: (token: string | null) => void;
    setPermissionGranted: (granted: boolean) => void;
    addNotification: (notification: AppNotification) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAll: () => void;
    setUnreadCount: (count: number) => void;
    incrementUnread: () => void;
    decrementUnread: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
    persist(
        (set, get) => ({
            // Initial state
            pushToken: null,
            permissionGranted: false,
            unreadCount: 0,
            notifications: [],

            // Actions
            setPushToken: (token) => set({ pushToken: token }),

            setPermissionGranted: (granted) => set({ permissionGranted: granted }),

            addNotification: (notification) =>
                set((state) => ({
                    notifications: [notification, ...state.notifications].slice(0, 50), // keep last 50
                    unreadCount: state.unreadCount + 1,
                })),

            markAsRead: (notificationId) =>
                set((state) => {
                    const notification = state.notifications.find(
                        (n) => n.id === notificationId,
                    );
                    if (!notification || notification.read) return state;

                    return {
                        notifications: state.notifications.map((n) =>
                            n.id === notificationId ? { ...n, read: true } : n,
                        ),
                        unreadCount: Math.max(0, state.unreadCount - 1),
                    };
                }),

            markAllAsRead: () =>
                set((state) => ({
                    notifications: state.notifications.map((n) => ({
                        ...n,
                        read: true,
                    })),
                    unreadCount: 0,
                })),

            removeNotification: (notificationId) =>
                set((state) => {
                    const notification = state.notifications.find(
                        (n) => n.id === notificationId,
                    );
                    return {
                        notifications: state.notifications.filter(
                            (n) => n.id !== notificationId,
                        ),
                        unreadCount:
                            notification && !notification.read
                                ? Math.max(0, state.unreadCount - 1)
                                : state.unreadCount,
                    };
                }),

            clearAll: () => set({ notifications: [], unreadCount: 0 }),

            setUnreadCount: (count) => set({ unreadCount: count }),
            incrementUnread: () =>
                set((state) => ({ unreadCount: state.unreadCount + 1 })),
            decrementUnread: () =>
                set((state) => ({
                    unreadCount: Math.max(0, state.unreadCount - 1),
                })),
        }),
        {
            name: "imuchat-notifications",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                pushToken: state.pushToken,
                permissionGranted: state.permissionGranted,
                unreadCount: state.unreadCount,
                // On ne persiste que les 20 dernières notifications
                notifications: state.notifications.slice(0, 20),
            }),
        },
    ),
);
