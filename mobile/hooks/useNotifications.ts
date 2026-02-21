/**
 * Hook React pour les notifications push — Bridge unifié
 *
 * Connecte trois couches :
 *  1. services/notifications.ts   — Expo Notifications (permissions, token, listeners)
 *  2. services/notification-api.ts — REST client vers platform-core
 *  3. stores/notifications-store.ts — Zustand (état global persisté)
 *
 * Usage:
 * ```tsx
 * const {
 *   hasPermission,
 *   requestPermission,
 *   notifications,
 *   unreadCount,
 *   markAsRead,
 *   markAllAsRead,
 *   refreshHistory,
 *   setBadge,
 * } = useNotifications();
 * ```
 */

import { createLogger } from '@/services/logger';
import {
    markAllNotificationsAsRead as apiMarkAllRead,
    markNotificationAsRead as apiMarkRead,
    registerToken as apiRegisterToken,
    unregisterToken as apiUnregisterToken,
    getNotificationHistory,
} from '@/services/notification-api';
import {
    addNotificationReceivedListener,
    addNotificationResponseListener,
    getBadgeCount,
    initializeNotifications,
    registerDeviceToken,
    requestNotificationsPermissions,
    setBadgeCount,
    unregisterDeviceToken,
    type NotificationResponse,
} from '@/services/notifications';
import {
    useNotificationsStore,
    type AppNotification,
} from '@/stores/notifications-store';
import type { Notification } from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

const logger = createLogger('useNotifications');

export interface UseNotificationsReturn {
    /** Permission accordée */
    hasPermission: boolean;
    /** Token FCM */
    fcmToken: string | null;
    /** Dernière notification reçue */
    lastNotification: Notification | null;
    /** Dernière interaction avec une notification */
    lastResponse: NotificationResponse | null;
    /** Nombre de notifications non lues */
    unreadCount: number;
    /** Liste des notifications */
    notifications: AppNotification[];
    /** En cours d'initialisation */
    loading: boolean;
    /** Demander la permission */
    requestPermission: () => Promise<boolean>;
    /** Marquer une notification comme lue (store + API) */
    markAsRead: (notificationId: string) => Promise<void>;
    /** Marquer toutes comme lues (store + API) */
    markAllAsRead: () => Promise<void>;
    /** Définir le badge */
    setBadge: (count: number) => Promise<void>;
    /** Rafraîchir l'historique depuis l'API */
    refreshHistory: () => Promise<void>;
    /** Rafraîchir le badge depuis le système */
    refreshBadge: () => Promise<void>;
}

/**
 * Hook pour gérer les notifications push — bridge unifié
 */
export function useNotifications(): UseNotificationsReturn {
    const { user } = useAuth();

    // Zustand store
    const store = useNotificationsStore();

    // Local UI state (non persisté)
    const [lastNotification, setLastNotification] = useState<Notification | null>(null);
    const [lastResponse, setLastResponse] = useState<NotificationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const subscriptionsRef = useRef<any[]>([]);

    // ─── Initialisation ──────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                await initializeNotifications();

                const currentBadge = await getBadgeCount();
                if (mounted) {
                    store.setUnreadCount(currentBadge);
                }
            } catch (error) {
                logger.error('Erreur initialisation notifications', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        init();
        return () => { mounted = false; };
    }, []);

    // ─── Demander la permission ──────────────────────────────────
    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            const token = await requestNotificationsPermissions();
            if (!token) return false;

            store.setPushToken(token);
            store.setPermissionGranted(true);

            // Enregistrer le token dans Supabase (direct) ET via l'API backend
            if (user?.id) {
                await registerDeviceToken(user.id, token);

                // Enregistrement parallèle côté platform-core (fire & forget)
                const platform = Platform.OS === 'ios' ? 'ios' : 'android';
                apiRegisterToken(token, platform).catch((err) =>
                    logger.warn('API registerToken échoué (non bloquant)', err),
                );
            }

            return true;
        } catch (error) {
            logger.error('Erreur demande permission', error);
            return false;
        }
    }, [user, store]);

    // ─── Écouter les notifications ───────────────────────────────
    useEffect(() => {
        const receivedSub = addNotificationReceivedListener((notification) => {
            logger.info('Notification reçue', notification.request.identifier);
            setLastNotification(notification);

            // Ajouter dans le store Zustand
            const data = notification.request.content.data as Record<string, unknown> | undefined;
            const appNotification: AppNotification = {
                id: notification.request.identifier,
                title: notification.request.content.title || '',
                body: notification.request.content.body || '',
                type: inferNotificationType(data),
                data,
                read: false,
                createdAt: new Date().toISOString(),
            };
            store.addNotification(appNotification);

            // Mettre à jour le badge système
            setBadgeCount(store.unreadCount + 1).catch(() => { /* noop */ });
        });

        const responseSub = addNotificationResponseListener((response) => {
            logger.info('Interaction notification', response.actionIdentifier);
            setLastResponse(response);
        });

        subscriptionsRef.current = [receivedSub, responseSub];

        return () => {
            subscriptionsRef.current.forEach((sub) => sub.remove());
            subscriptionsRef.current = [];
        };
    }, [store]);

    // ─── Token lifecycle ─────────────────────────────────────────
    useEffect(() => {
        if (!user?.id || !store.pushToken) return;

        registerDeviceToken(user.id, store.pushToken);

        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        apiRegisterToken(store.pushToken, platform).catch((err) =>
            logger.warn('API registerToken échoué', err),
        );

        return () => {
            if (user?.id && store.pushToken) {
                unregisterDeviceToken(user.id);
                apiUnregisterToken(store.pushToken).catch(() => { /* noop */ });
            }
        };
    }, [user?.id, store.pushToken]);

    // ─── Sync historique au montage ──────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        refreshHistory().catch((err) =>
            logger.warn('Sync historique initial échoué', err),
        );
    }, [user?.id]);

    // ─── Actions bridge ──────────────────────────────────────────

    /** Marquer comme lu : store Zustand + API backend + badge système */
    const markAsRead = useCallback(
        async (notificationId: string) => {
            store.markAsRead(notificationId);

            // Badge système
            const newCount = Math.max(0, store.unreadCount - 1);
            setBadgeCount(newCount).catch(() => { /* noop */ });

            // API backend (fire & forget)
            apiMarkRead(notificationId).catch((err) =>
                logger.warn('API markRead échoué', err),
            );
        },
        [store],
    );

    /** Marquer toutes comme lues */
    const markAllAsRead = useCallback(async () => {
        store.markAllAsRead();
        setBadgeCount(0).catch(() => { /* noop */ });

        apiMarkAllRead().catch((err) =>
            logger.warn('API markAllRead échoué', err),
        );
    }, [store]);

    /** Rafraîchir l'historique depuis platform-core */
    const refreshHistory = useCallback(async () => {
        try {
            const { notifications: history } = await getNotificationHistory(50, 0);

            // Réinitialiser la liste avec les données du backend
            store.clearAll();
            let unread = 0;

            for (const item of history) {
                const appNotif: AppNotification = {
                    id: item.id,
                    title: item.title,
                    body: item.body,
                    type: (item.type as AppNotification['type']) || 'system',
                    data: item.data,
                    read: item.read,
                    createdAt: item.createdAt,
                };
                store.addNotification(appNotif);
                if (!item.read) unread++;
            }

            store.setUnreadCount(unread);
            await setBadgeCount(unread);
        } catch (error) {
            logger.warn('Erreur refreshHistory', error);
        }
    }, [store]);

    /** Définir le badge */
    const setBadge = useCallback(
        async (count: number) => {
            try {
                await setBadgeCount(count);
                store.setUnreadCount(count);
            } catch (error) {
                logger.error('Erreur setBadge', error);
            }
        },
        [store],
    );

    /** Rafraîchir le badge depuis le système */
    const refreshBadge = useCallback(async () => {
        try {
            const current = await getBadgeCount();
            store.setUnreadCount(current);
        } catch (error) {
            logger.error('Erreur refreshBadge', error);
        }
    }, [store]);

    return {
        hasPermission: store.permissionGranted,
        fcmToken: store.pushToken,
        lastNotification,
        lastResponse,
        unreadCount: store.unreadCount,
        notifications: store.notifications,
        loading,
        requestPermission,
        markAsRead,
        markAllAsRead,
        setBadge,
        refreshHistory,
        refreshBadge,
    };
}

// ─── Helpers ─────────────────────────────────────────────────────

function inferNotificationType(
    data?: Record<string, unknown>,
): AppNotification['type'] {
    if (!data) return 'system';
    const t = data.type as string | undefined;
    if (t === 'message' || t === 'call' || t === 'contact') return t;
    if (data.conversationId || data.messageId) return 'message';
    if (data.callId) return 'call';
    return 'system';
}
