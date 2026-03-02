/**
 * store-notifications.ts — Service de notifications pour le Store.
 *
 * Utilise expo-notifications pour :
 * - Enregistrer le push token
 * - Envoyer des notifications locales (nouveaux modules, mises à jour)
 * - Gérer les réponses (deep-link vers le store ou miniapp)
 */

import { createLogger } from '@/services/logger';
import type { StoreNotification } from '@/types/modules';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const logger = createLogger('StoreNotifications');

// ─── Configuration ────────────────────────────────────────────

/**
 * Configure le handler de notification en foreground.
 */
export function configureNotificationHandler(): void {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
    logger.info('Notification handler configured');
}

// ─── Permissions ──────────────────────────────────────────────

/**
 * Demande la permission de notifications push.
 * Retourne true si accordée.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        logger.warn('Notification permissions not granted');
        return false;
    }

    logger.info('Notification permissions granted');
    return true;
}

/**
 * Vérifie si les permissions de notifications sont déjà accordées.
 */
export async function hasNotificationPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
}

// ─── Push Token ───────────────────────────────────────────────

/**
 * Récupère le push token Expo pour les notifications.
 * Retourne null si non disponible (simulateur, permissions refusées, etc.).
 */
export async function getExpoPushToken(): Promise<string | null> {
    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('store', {
                name: 'Store & Modules',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250],
                lightColor: '#3b82f6',
            });
        }

        const token = await Notifications.getExpoPushTokenAsync();
        logger.info('Push token obtained');
        return token.data;
    } catch (error) {
        logger.warn('Failed to get push token:', error);
        return null;
    }
}

// ─── Notifications locales ────────────────────────────────────

/**
 * Planifie une notification locale pour un événement du Store.
 */
export async function scheduleStoreNotification(
    notification: StoreNotification,
): Promise<string | null> {
    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: getNotificationTitle(notification),
                body: notification.message,
                data: {
                    type: notification.type,
                    moduleId: notification.moduleId,
                    notificationId: notification.id,
                },
                sound: true,
            },
            trigger: null, // Immédiate
        });
        logger.info(`Notification scheduled: ${notification.type} for ${notification.moduleId}`);
        return id;
    } catch (error) {
        logger.error('Failed to schedule notification:', error);
        return null;
    }
}

/**
 * Notifie qu'un nouveau module est disponible.
 */
export async function notifyNewModule(
    moduleId: string,
    moduleName: string,
    moduleIcon: string,
): Promise<void> {
    await scheduleStoreNotification({
        id: `new-${moduleId}-${Date.now()}`,
        type: 'new_module',
        moduleId,
        moduleName,
        moduleIcon,
        message: `${moduleName} est maintenant disponible sur le Store !`,
        read: false,
        createdAt: new Date().toISOString(),
    });
}

/**
 * Notifie qu'une mise à jour est disponible pour un module installé.
 */
export async function notifyModuleUpdate(
    moduleId: string,
    moduleName: string,
    moduleIcon: string,
    newVersion: string,
): Promise<void> {
    await scheduleStoreNotification({
        id: `update-${moduleId}-${Date.now()}`,
        type: 'module_update',
        moduleId,
        moduleName,
        moduleIcon,
        message: `${moduleName} v${newVersion} est disponible. Mettez à jour !`,
        read: false,
        createdAt: new Date().toISOString(),
    });
}

// ─── Helpers ──────────────────────────────────────────────────

function getNotificationTitle(notification: StoreNotification): string {
    switch (notification.type) {
        case 'new_module':
            return `${notification.moduleIcon} Nouveau : ${notification.moduleName}`;
        case 'module_update':
            return `↑ Mise à jour : ${notification.moduleName}`;
        case 'review_reply':
            return `💬 Réponse à votre avis`;
        case 'price_drop':
            return `🏷️ Baisse de prix : ${notification.moduleName}`;
        default:
            return 'ImuChat Store';
    }
}

// ─── Listeners ────────────────────────────────────────────────

/**
 * Enregistre un callback quand l'utilisateur appuie sur une notification.
 * Retourne une fonction pour retirer le listener.
 */
export function addNotificationResponseListener(
    callback: (moduleId: string, type: string) => void,
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.moduleId) {
            callback(data.moduleId as string, (data.type as string) || 'unknown');
        }
    });
}

/**
 * Récupère le nombre de notifications en attente (badge).
 */
export async function getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
}

/**
 * Remet le badge à zéro.
 */
export async function clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
}
