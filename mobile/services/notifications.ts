/**
 * Service de notifications push pour mobile (Firebase Cloud Messaging via Expo)
 * 
 * Gère:
 * - Demande de permissions
 * - Enregistrement du token FCM
 * - Réception et affichage des notifications
 * - Gestion des actions sur notifications
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// === CONFIGURATION ===

/**
 * Configuration du comportement par défaut des notifications
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

// === TYPES ===

export interface PushNotificationData {
    title: string;
    body: string;
    data?: Record<string, any>;
    badge?: number;
    sound?: string;
    priority?: 'default' | 'high' | 'low';
}

export interface NotificationResponse {
    notification: Notifications.Notification;
    actionIdentifier: string;
}

// === PERMISSIONS ===

/**
 * Demande les permissions pour les notifications push
 * @returns Token FCM si succès, null sinon
 */
export async function requestNotificationsPermissions(): Promise<string | null> {
    if (!Device.isDevice) {
        console.warn('Les notifications push ne fonctionnent que sur un appareil physique');
        return null;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Permission de notifications refusée');
            return null;
        }

        // Récupérer le token FCM
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ??
            process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID;

        if (!projectId) {
            console.error('Project ID manquant pour FCM');
            return null;
        }

        const token = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        console.log('Token FCM obtenu:', token.data);
        return token.data;

    } catch (error) {
        console.error('Erreur lors de la demande de permissions:', error);
        return null;
    }
}

// === ENREGISTREMENT DU TOKEN ===

/**
 * Enregistre le token FCM dans Supabase pour l'utilisateur actuel
 * @param userId ID de l'utilisateur
 * @param token Token FCM
 * @returns true si succès
 */
export async function registerDeviceToken(userId: string, token: string): Promise<boolean> {
    try {
        const deviceId = Constants.deviceId || 'unknown';
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';

        // Upsert dans la table notification_tokens
        const { error } = await supabase
            .from('notification_tokens')
            .upsert({
                user_id: userId,
                token,
                platform,
                device_id: deviceId,
                last_used_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,device_id',
            });

        if (error) {
            console.error('Erreur lors de l\'enregistrement du token:', error);
            return false;
        }

        console.log('Token enregistré avec succès');
        return true;

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du token:', error);
        return false;
    }
}

/**
 * Supprime le token FCM de Supabase (lors de la déconnexion)
 * @param userId ID de l'utilisateur
 */
export async function unregisterDeviceToken(userId: string): Promise<void> {
    try {
        const deviceId = Constants.deviceId || 'unknown';

        const { error } = await supabase
            .from('notification_tokens')
            .delete()
            .eq('user_id', userId)
            .eq('device_id', deviceId);

        if (error) {
            console.error('Erreur lors de la suppression du token:', error);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du token:', error);
    }
}

// === LISTENERS ===

/**
 * Écoute les notifications reçues pendant que l'app est au premier plan
 * @param callback Fonction appelée lors de la réception
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Écoute les interactions avec les notifications (tap, actions)
 * @param callback Fonction appelée lors de l'interaction
 */
export function addNotificationResponseListener(
    callback: (response: NotificationResponse) => void
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

// === NOTIFICATIONS LOCALES ===

/**
 * Affiche une notification locale immédiate
 * @param notification Données de la notification
 */
export async function showLocalNotification(
    notification: PushNotificationData
): Promise<string> {
    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: notification.title,
                body: notification.body,
                data: notification.data,
                badge: notification.badge,
                sound: notification.sound || 'default',
                priority: notification.priority === 'high'
                    ? Notifications.AndroidNotificationPriority.HIGH
                    : Notifications.AndroidNotificationPriority.DEFAULT,
            },
            trigger: null, // Immédiate
        });

        return id;
    } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification:', error);
        throw error;
    }
}

/**
 * Planifie une notification pour plus tard
 * @param notification Données de la notification
 * @param triggerDate Date de déclenchement
 */
export async function scheduleNotification(
    notification: PushNotificationData,
    triggerDate: Date
): Promise<string> {
    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: notification.title,
                body: notification.body,
                data: notification.data,
                badge: notification.badge,
                sound: notification.sound || 'default',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });

        return id;
    } catch (error) {
        console.error('Erreur lors de la planification de la notification:', error);
        throw error;
    }
}

/**
 * Annule une notification planifiée
 * @param notificationId ID de la notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Annule toutes les notifications planifiées
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// === BADGE ===

/**
 * Définit le nombre de badge sur l'icône de l'app
 * @param count Nombre de notifications non lues
 */
export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

/**
 * Récupère le nombre de badge actuel
 */
export async function getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
}

// === UTILITAIRES ===

/**
 * Supprime toutes les notifications affichées
 */
export async function dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
}

/**
 * Récupère toutes les notifications actuellement affichées
 */
export async function getPresentedNotifications(): Promise<Notifications.Notification[]> {
    return await Notifications.getPresentedNotificationsAsync();
}

// === CONFIGURATION INITIALE ===

/**
 * Initialise le service de notifications
 * Configure les canaux Android et les catégories iOS
 */
export async function initializeNotifications(): Promise<void> {
    if (Platform.OS === 'android') {
        // Créer des canaux de notification Android
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });

        await Notifications.setNotificationChannelAsync('messages', {
            name: 'Messages',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#0088cc',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('calls', {
            name: 'Appels',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#00cc00',
            sound: 'default',
        });
    }

    // Catégories iOS (actions sur notifications)
    await Notifications.setNotificationCategoryAsync('message', [
        {
            identifier: 'reply',
            buttonTitle: 'Répondre',
            options: {
                opensAppToForeground: true,
            },
        },
        {
            identifier: 'mark_read',
            buttonTitle: 'Marquer lu',
            options: {
                opensAppToForeground: false,
            },
        },
    ]);

    await Notifications.setNotificationCategoryAsync('call', [
        {
            identifier: 'accept',
            buttonTitle: 'Accepter',
            options: {
                opensAppToForeground: true,
            },
        },
        {
            identifier: 'decline',
            buttonTitle: 'Refuser',
            options: {
                opensAppToForeground: false,
                isDestructive: true,
            },
        },
    ]);

    console.log('Service de notifications initialisé');
}
