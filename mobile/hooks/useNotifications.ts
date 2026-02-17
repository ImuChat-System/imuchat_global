/**
 * Hook React pour les notifications push sur mobile
 * 
 * Usage:
 * ```tsx
 * const { 
 *   hasPermission, 
 *   requestPermission, 
 *   badge, 
 *   setBadge 
 * } = useNotifications();
 * ```
 */

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
import type { Notification } from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

export interface UseNotificationsReturn {
    /** Permission accordée */
    hasPermission: boolean;
    /** Token FCM */
    fcmToken: string | null;
    /** Dernière notification reçue */
    lastNotification: Notification | null;
    /** Dernière interaction avec une notification */
    lastResponse: NotificationResponse | null;
    /** Nombre de badge */
    badge: number;
    /** En cours d'initialisation */
    loading: boolean;
    /** Demander la permission */
    requestPermission: () => Promise<boolean>;
    /** Définir le badge */
    setBadge: (count: number) => Promise<void>;
    /** Rafraîchir le badge depuis le système */
    refreshBadge: () => Promise<void>;
}

/**
 * Hook pour gérer les notifications push
 */
export function useNotifications(): UseNotificationsReturn {
    const { user } = useAuth();
    const [hasPermission, setHasPermission] = useState(false);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [lastNotification, setLastNotification] = useState<Notification | null>(null);
    const [lastResponse, setLastResponse] = useState<NotificationResponse | null>(null);
    const [badge, setBadgeState] = useState(0);
    const [loading, setLoading] = useState(true);
    const subscriptionsRef = useRef<any[]>([]);

    // Initialiser les notifications
    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                // Initialiser le service
                await initializeNotifications();

                // Récupérer le badge actuel
                const currentBadge = await getBadgeCount();
                if (mounted) {
                    setBadgeState(currentBadge);
                }

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de l\'initialisation:', error);
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    // Demander la permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            const token = await requestNotificationsPermissions();

            if (token) {
                setFcmToken(token);
                setHasPermission(true);

                // Enregistrer le token si l'utilisateur est connecté
                if (user?.id) {
                    await registerDeviceToken(user.id, token);
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur lors de la demande de permission:', error);
            return false;
        }
    }, [user]);

    // Écouter les notifications
    useEffect(() => {
        // Listener pour les notifications reçues
        const receivedSubscription = addNotificationReceivedListener((notification) => {
            console.log('Notification reçue:', notification);
            setLastNotification(notification);
        });

        // Listener pour les interactions avec les notifications
        const responseSubscription = addNotificationResponseListener((response) => {
            console.log('Interaction avec notification:', response);
            setLastResponse(response);
        });

        subscriptionsRef.current = [receivedSubscription, responseSubscription];

        return () => {
            subscriptionsRef.current.forEach(sub => sub.remove());
            subscriptionsRef.current = [];
        };
    }, []);

    // Gérer l'enregistrement/désenregistrement du token
    useEffect(() => {
        if (!user?.id || !fcmToken) return;

        // Enregistrer le token
        registerDeviceToken(user.id, fcmToken);

        return () => {
            // Désenregistrer le token lors de la déconnexion
            if (user?.id && fcmToken) {
                unregisterDeviceToken(user.id);
            }
        };
    }, [user?.id, fcmToken]);

    // Définir le badge
    const setBadge = useCallback(async (count: number) => {
        try {
            await setBadgeCount(count);
            setBadgeState(count);
        } catch (error) {
            console.error('Erreur lors de la définition du badge:', error);
        }
    }, []);

    // Rafraîchir le badge
    const refreshBadge = useCallback(async () => {
        try {
            const currentBadge = await getBadgeCount();
            setBadgeState(currentBadge);
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du badge:', error);
        }
    }, []);

    return {
        hasPermission,
        fcmToken,
        lastNotification,
        lastResponse,
        badge,
        loading,
        requestPermission,
        setBadge,
        refreshBadge,
    };
}
