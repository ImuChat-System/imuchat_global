/**
 * Notification API Service — Mobile (React Native / Expo)
 *
 * Couche de communication entre l'app mobile et les endpoints
 * de notifications du backend (platform-core).
 *
 * Endpoints consommés :
 *  - POST   /api/v1/notifications/register-token
 *  - DELETE  /api/v1/notifications/unregister-token
 *  - POST   /api/v1/notifications/send
 *  - GET    /api/v1/notifications/history
 *  - POST   /api/v1/notifications/mark-read
 *
 * Utilise le token Supabase comme Bearer token pour l'autorisation.
 */

import { supabase } from './supabase';

// === CONFIGURATION ===

const API_BASE_URL =
    (process.env as Record<string, string | undefined>)['EXPO_PUBLIC_API_URL'] || 'http://localhost:3001';

// === TYPES ===

export interface NotificationPreferences {
    enabled: boolean;
    categories: {
        [key: string]: {
            enabled: boolean;
            sound: boolean;
            badge: boolean;
            push: boolean;
        };
    };
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
    digest: {
        enabled: boolean;
        frequency: 'daily' | 'weekly';
        time: string;
    };
}

export interface NotificationHistoryItem {
    id: string;
    userId: string;
    title: string;
    body: string;
    data: Record<string, string>;
    type: string;
    read: boolean;
    createdAt: string;
}

export interface SendResult {
    success: boolean;
    successCount?: number;
    failureCount?: number;
    errors?: string[];
}

export interface NotificationHistoryResponse {
    notifications: NotificationHistoryItem[];
    total: number;
}

// === HELPERS ===

/**
 * Récupère le token d'authentification Supabase de l'utilisateur courant
 */
async function getAuthToken(): Promise<string> {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
        throw new Error('No active session — user must be authenticated');
    }

    return data.session.access_token;
}

/**
 * Récupère l'ID de l'utilisateur courant
 */
async function getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        throw new Error('No authenticated user');
    }

    return data.user.id;
}

/**
 * Effectue un appel API authentifié vers le backend
 */
async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
            body.error || `API error ${response.status}: ${response.statusText}`,
        );
    }

    return response.json() as Promise<T>;
}

// === API FUNCTIONS ===

/**
 * Enregistre un token FCM auprès du backend pour recevoir des notifications push
 *
 * @param token    - Token FCM / Expo Push Token de l'appareil
 * @param platform - Plateforme d'origine ('ios' | 'android')
 */
export async function registerToken(
    token: string,
    platform: 'ios' | 'android' | 'web' = 'android',
): Promise<void> {
    const userId = await getCurrentUserId();

    await apiRequest<{ success: boolean; message: string }>(
        '/api/v1/notifications/register-token',
        {
            method: 'POST',
            body: JSON.stringify({ userId, token, platform }),
        },
    );
}

/**
 * Supprime un token FCM du backend (ex : lors de la déconnexion)
 *
 * @param token - Token à supprimer
 */
export async function unregisterToken(token: string): Promise<void> {
    const userId = await getCurrentUserId();

    await apiRequest<{ success: boolean; message: string }>(
        '/api/v1/notifications/unregister-token',
        {
            method: 'DELETE',
            body: JSON.stringify({ userId, token }),
        },
    );
}

/**
 * Envoie une notification push à un utilisateur via le backend
 *
 * @param recipientId - ID de l'utilisateur destinataire
 * @param title       - Titre de la notification
 * @param body        - Corps du message
 * @param data        - Données personnalisées optionnelles
 */
export async function sendPushNotification(
    recipientId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
): Promise<SendResult> {
    return apiRequest<SendResult>('/api/v1/notifications/send', {
        method: 'POST',
        body: JSON.stringify({ userId: recipientId, title, body, data }),
    });
}

/**
 * Récupère l'historique des notifications de l'utilisateur courant
 *
 * @param limit  - Nombre max de résultats (défaut 50)
 * @param offset - Position de départ pour la pagination
 */
export async function getNotificationHistory(
    limit = 50,
    offset = 0,
): Promise<NotificationHistoryResponse> {
    const userId = await getCurrentUserId();
    const params = new URLSearchParams({
        userId,
        limit: String(limit),
        offset: String(offset),
    });

    return apiRequest<NotificationHistoryResponse>(
        `/api/v1/notifications/history?${params.toString()}`,
    );
}

/**
 * Marque une notification spécifique comme lue
 *
 * @param notificationId - ID de la notification
 */
export async function markNotificationAsRead(
    notificationId: string,
): Promise<void> {
    const userId = await getCurrentUserId();

    await apiRequest<{ success: boolean }>(
        '/api/v1/notifications/mark-read',
        {
            method: 'POST',
            body: JSON.stringify({ userId, notificationId }),
        },
    );
}

/**
 * Marque toutes les notifications de l'utilisateur comme lues
 */
export async function markAllNotificationsAsRead(): Promise<void> {
    const userId = await getCurrentUserId();

    await apiRequest<{ success: boolean }>(
        '/api/v1/notifications/mark-read',
        {
            method: 'POST',
            body: JSON.stringify({ userId }),
        },
    );
}

/**
 * Récupère les préférences de notification de l'utilisateur courant.
 * Lit directement depuis Supabase (table `notification_preferences`).
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        throw new Error(`Failed to get notification preferences: ${error.message}`);
    }

    return data as unknown as NotificationPreferences;
}

/**
 * Met à jour partiellement les préférences de notification de l'utilisateur
 *
 * @param prefs - Champs de préférences à mettre à jour
 */
export async function updateNotificationPreferences(
    prefs: Partial<NotificationPreferences>,
): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
        .from('notification_preferences')
        .upsert(
            {
                user_id: userId,
                ...prefs,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
        );

    if (error) {
        throw new Error(`Failed to update notification preferences: ${error.message}`);
    }
}
