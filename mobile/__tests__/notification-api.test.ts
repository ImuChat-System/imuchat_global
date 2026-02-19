/**
 * Tests pour notification-api (Mobile / React Native)
 */

import {
    getNotificationHistory,
    getNotificationPreferences,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    registerToken,
    sendPushNotification,
    unregisterToken,
    updateNotificationPreferences,
} from '../services/notification-api';

// === MOCKS ===

// jest.mock() is hoisted before const — inline values in factory
jest.mock('../services/supabase', () => {
    const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
            data: { enabled: true, categories: {} },
            error: null,
        }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
    }));

    return {
        supabase: {
            auth: {
                getSession: jest.fn().mockResolvedValue({
                    data: { session: { access_token: 'mock-supabase-access-token' } },
                    error: null,
                }),
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-mobile-123' } },
                    error: null,
                }),
            },
            from: mockFrom,
        },
    };
});

const mockAccessToken = 'mock-supabase-access-token';
const mockUserId = 'user-mobile-123';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Helper — successful JSON response
function mockJsonResponse(body: Record<string, unknown>, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(body),
    };
}

describe('notification-api (mobile)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
    });

    // ---- registerToken ----
    describe('registerToken', () => {
        it('envoie le token au backend avec le bon payload', async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ success: true, message: 'ok' }),
            );

            await registerToken('expo-push-token-xyz', 'ios');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/api/v1/notifications/register-token');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual({
                userId: mockUserId,
                token: 'expo-push-token-xyz',
                platform: 'ios',
            });
            expect(options.headers.Authorization).toBe(`Bearer ${mockAccessToken}`);
        });

        it('utilise la plateforme android par défaut', async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ success: true, message: 'ok' }),
            );

            await registerToken('token-123');

            const [, options] = mockFetch.mock.calls[0];
            expect(JSON.parse(options.body).platform).toBe('android');
        });

        it('lève une erreur si le backend répond 500', async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ error: 'Internal Server Error' }, 500),
            );

            await expect(registerToken('bad-token', 'ios')).rejects.toThrow(
                'Internal Server Error',
            );
        });
    });

    // ---- unregisterToken ----
    describe('unregisterToken', () => {
        it('envoie une requête DELETE avec le token', async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ success: true, message: 'ok' }),
            );

            await unregisterToken('expo-push-token-xyz');

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/api/v1/notifications/unregister-token');
            expect(options.method).toBe('DELETE');
            expect(JSON.parse(options.body)).toEqual({
                userId: mockUserId,
                token: 'expo-push-token-xyz',
            });
        });
    });

    // ---- sendPushNotification ----
    describe('sendPushNotification', () => {
        it('envoie une notification avec titre, body et data', async () => {
            const expectedResult = { success: true, successCount: 1, failureCount: 0 };
            mockFetch.mockResolvedValueOnce(mockJsonResponse(expectedResult));

            const result = await sendPushNotification(
                'recipient-456',
                'Hello',
                'World',
                { link: '/chat/1' },
            );

            expect(result).toEqual(expectedResult);

            const [, options] = mockFetch.mock.calls[0];
            expect(JSON.parse(options.body)).toEqual({
                userId: 'recipient-456',
                title: 'Hello',
                body: 'World',
                data: { link: '/chat/1' },
            });
        });

        it('fonctionne sans data optionnel', async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ success: true, successCount: 1, failureCount: 0 }),
            );

            await sendPushNotification('recipient-456', 'Title', 'Body');

            const [, options] = mockFetch.mock.calls[0];
            const body = JSON.parse(options.body);
            expect(body.data).toBeUndefined();
        });
    });

    // ---- getNotificationHistory ----
    describe('getNotificationHistory', () => {
        it('récupère l\'historique avec les paramètres de pagination', async () => {
            const historyData = {
                notifications: [
                    { id: 'n1', title: 'Test', body: 'Msg', read: false },
                ],
                total: 1,
            };
            mockFetch.mockResolvedValueOnce(mockJsonResponse(historyData));

            const result = await getNotificationHistory(20, 5);

            expect(result).toEqual(historyData);
            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('userId=user-mobile-123');
            expect(url).toContain('limit=20');
            expect(url).toContain('offset=5');
        });

        it('utilise les valeurs par défaut (limit=50, offset=0)', async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ notifications: [], total: 0 }),
            );

            await getNotificationHistory();

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('limit=50');
            expect(url).toContain('offset=0');
        });
    });

    // ---- markNotificationAsRead ----
    describe('markNotificationAsRead', () => {
        it('envoie la notification ID au backend', async () => {
            mockFetch.mockResolvedValueOnce(mockJsonResponse({ success: true }));

            await markNotificationAsRead('notif-789');

            const [, options] = mockFetch.mock.calls[0];
            expect(JSON.parse(options.body)).toEqual({
                userId: mockUserId,
                notificationId: 'notif-789',
            });
        });
    });

    // ---- markAllNotificationsAsRead ----
    describe('markAllNotificationsAsRead', () => {
        it('envoie la requête sans notificationId', async () => {
            mockFetch.mockResolvedValueOnce(mockJsonResponse({ success: true }));

            await markAllNotificationsAsRead();

            const [, options] = mockFetch.mock.calls[0];
            const body = JSON.parse(options.body);
            expect(body.userId).toBe(mockUserId);
            expect(body.notificationId).toBeUndefined();
        });
    });

    // ---- getNotificationPreferences ----
    describe('getNotificationPreferences', () => {
        it('retourne les préférences depuis Supabase', async () => {
            const result = await getNotificationPreferences();

            expect(result).toEqual({ enabled: true, categories: {} });
        });

        it('lève une erreur si Supabase répond une erreur', async () => {
            const { supabase } = require('../services/supabase');
            supabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Not found' },
                }),
            });

            await expect(getNotificationPreferences()).rejects.toThrow(
                'Failed to get notification preferences: Not found',
            );
        });
    });

    // ---- updateNotificationPreferences ----
    describe('updateNotificationPreferences', () => {
        it('upsert les préférences dans Supabase', async () => {
            const { supabase } = require('../services/supabase');

            await updateNotificationPreferences({ enabled: false });

            expect(supabase.from).toHaveBeenCalledWith('notification_preferences');
        });

        it('lève une erreur si Supabase échoue', async () => {
            const { supabase } = require('../services/supabase');
            supabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                upsert: jest.fn().mockResolvedValue({
                    error: { message: 'DB error' },
                }),
            });

            await expect(
                updateNotificationPreferences({ enabled: false }),
            ).rejects.toThrow('Failed to update notification preferences: DB error');
        });
    });

    // ---- Auth errors ----
    describe('gestion des erreurs d\'authentification', () => {
        it('lève une erreur si pas de session active', async () => {
            const { supabase } = require('../services/supabase');
            supabase.auth.getSession.mockResolvedValueOnce({
                data: { session: null },
                error: null,
            });

            await expect(registerToken('token', 'ios')).rejects.toThrow(
                'No active session',
            );
        });

        it('lève une erreur si pas d\'utilisateur authentifié', async () => {
            const { supabase } = require('../services/supabase');
            supabase.auth.getUser.mockResolvedValueOnce({
                data: { user: null },
                error: null,
            });

            await expect(registerToken('token', 'ios')).rejects.toThrow(
                'No authenticated user',
            );
        });
    });
});
