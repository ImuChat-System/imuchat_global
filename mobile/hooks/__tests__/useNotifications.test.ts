/**
 * Tests for hooks/useNotifications.ts
 * Unified notification bridge: Expo Notifications + API + Zustand store
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

// Mock logger
jest.mock('@/services/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

// Mock auth
const mockUser = { id: 'user-123' };
jest.mock('../useAuth', () => ({
    useAuth: () => ({ user: mockUser }),
}));

// Mock notification API
const mockApiRegisterToken = jest.fn().mockResolvedValue(undefined);
const mockApiUnregisterToken = jest.fn().mockResolvedValue(undefined);
const mockApiMarkRead = jest.fn().mockResolvedValue(undefined);
const mockApiMarkAllRead = jest.fn().mockResolvedValue(undefined);
const mockGetHistory = jest.fn().mockResolvedValue({ notifications: [] });

jest.mock('@/services/notification-api', () => ({
    registerToken: (...a: any[]) => mockApiRegisterToken(...a),
    unregisterToken: (...a: any[]) => mockApiUnregisterToken(...a),
    markNotificationAsRead: (...a: any[]) => mockApiMarkRead(...a),
    markAllNotificationsAsRead: (...a: any[]) => mockApiMarkAllRead(...a),
    getNotificationHistory: (...a: any[]) => mockGetHistory(...a),
}));

// Mock notifications service
const mockInitialize = jest.fn().mockResolvedValue(undefined);
const mockGetBadgeCount = jest.fn().mockResolvedValue(0);
const mockSetBadgeCount = jest.fn().mockResolvedValue(undefined);
const mockRegisterDeviceToken = jest.fn().mockResolvedValue(undefined);
const mockUnregisterDeviceToken = jest.fn().mockResolvedValue(undefined);
const mockRequestPermissions = jest.fn().mockResolvedValue('test-push-token');

let receivedListener: ((n: any) => void) | null = null;
let responseListener: ((r: any) => void) | null = null;

jest.mock('@/services/notifications', () => ({
    initializeNotifications: (...a: any[]) => mockInitialize(...a),
    getBadgeCount: (...a: any[]) => mockGetBadgeCount(...a),
    setBadgeCount: (...a: any[]) => mockSetBadgeCount(...a),
    registerDeviceToken: (...a: any[]) => mockRegisterDeviceToken(...a),
    unregisterDeviceToken: (...a: any[]) => mockUnregisterDeviceToken(...a),
    requestNotificationsPermissions: (...a: any[]) => mockRequestPermissions(...a),
    addNotificationReceivedListener: (cb: any) => {
        receivedListener = cb;
        return { remove: jest.fn() };
    },
    addNotificationResponseListener: (cb: any) => {
        responseListener = cb;
        return { remove: jest.fn() };
    },
}));

// Mock Zustand store
const mockStoreState = {
    notifications: [] as any[],
    unreadCount: 0,
    pushToken: null as string | null,
    permissionGranted: false,
    addNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    setUnreadCount: jest.fn(),
    setPushToken: jest.fn(),
    setPermissionGranted: jest.fn(),
    clearAll: jest.fn(),
};

jest.mock('@/stores/notifications-store', () => ({
    useNotificationsStore: () => mockStoreState,
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}));

import { useNotifications } from '../useNotifications';

describe('useNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        receivedListener = null;
        responseListener = null;
        mockStoreState.notifications = [];
        mockStoreState.unreadCount = 0;
        mockStoreState.pushToken = null;
        mockStoreState.permissionGranted = false;
    });

    describe('Initialization', () => {
        it('initializes notifications on mount', async () => {
            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockInitialize).toHaveBeenCalled();
            expect(mockGetBadgeCount).toHaveBeenCalled();
        });

        it('sets loading false after init', async () => {
            const { result } = renderHook(() => useNotifications());

            expect(result.current.loading).toBe(true);

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('handles init error gracefully', async () => {
            mockInitialize.mockRejectedValueOnce(new Error('Init fail'));

            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe('requestPermission', () => {
        it('requests permission and registers token', async () => {
            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            let granted: boolean;
            await act(async () => {
                granted = await result.current.requestPermission();
            });

            expect(granted!).toBe(true);
            expect(mockRequestPermissions).toHaveBeenCalled();
            expect(mockStoreState.setPushToken).toHaveBeenCalledWith('test-push-token');
            expect(mockStoreState.setPermissionGranted).toHaveBeenCalledWith(true);
            expect(mockRegisterDeviceToken).toHaveBeenCalledWith('user-123', 'test-push-token');
        });

        it('returns false when no token returned', async () => {
            mockRequestPermissions.mockResolvedValueOnce(null);

            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            let granted: boolean;
            await act(async () => {
                granted = await result.current.requestPermission();
            });

            expect(granted!).toBe(false);
        });
    });

    describe('Notification listeners', () => {
        it('registers received and response listeners', async () => {
            renderHook(() => useNotifications());

            await waitFor(() => {
                expect(receivedListener).not.toBeNull();
                expect(responseListener).not.toBeNull();
            });
        });

        it('adds notification to store when received', async () => {
            renderHook(() => useNotifications());

            await waitFor(() => {
                expect(receivedListener).not.toBeNull();
            });

            act(() => {
                receivedListener!({
                    request: {
                        identifier: 'notif-1',
                        content: {
                            title: 'Hello',
                            body: 'World',
                            data: { type: 'message', conversationId: 'conv-1' },
                        },
                    },
                });
            });

            expect(mockStoreState.addNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'notif-1',
                    title: 'Hello',
                    body: 'World',
                    type: 'message',
                    read: false,
                })
            );
        });

        it('infers notification type from data', async () => {
            renderHook(() => useNotifications());

            await waitFor(() => {
                expect(receivedListener).not.toBeNull();
            });

            // Call type
            act(() => {
                receivedListener!({
                    request: {
                        identifier: 'notif-2',
                        content: { title: 'Call', body: '', data: { type: 'call' } },
                    },
                });
            });

            expect(mockStoreState.addNotification).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'call' })
            );
        });
    });

    describe('markAsRead', () => {
        it('marks notification in store and calls API', async () => {
            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.markAsRead('notif-1');
            });

            expect(mockStoreState.markAsRead).toHaveBeenCalledWith('notif-1');
            expect(mockApiMarkRead).toHaveBeenCalledWith('notif-1');
        });
    });

    describe('markAllAsRead', () => {
        it('marks all in store and calls API', async () => {
            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.markAllAsRead();
            });

            expect(mockStoreState.markAllAsRead).toHaveBeenCalled();
            expect(mockSetBadgeCount).toHaveBeenCalledWith(0);
            expect(mockApiMarkAllRead).toHaveBeenCalled();
        });
    });

    describe('refreshHistory', () => {
        it('fetches history from API and updates store', async () => {
            mockGetHistory.mockResolvedValue({
                notifications: [
                    { id: 'h-1', title: 'Old', body: 'msg', type: 'message', read: true, createdAt: '2024-01-01', data: {} },
                    { id: 'h-2', title: 'New', body: 'msg', type: 'system', read: false, createdAt: '2024-01-02', data: {} },
                ],
            });

            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Clear counts from the mount-triggered refreshHistory
            mockStoreState.addNotification.mockClear();
            mockStoreState.clearAll.mockClear();
            mockStoreState.setUnreadCount.mockClear();
            mockGetHistory.mockClear();

            await act(async () => {
                await result.current.refreshHistory();
            });

            expect(mockGetHistory).toHaveBeenCalledWith(50, 0);
            expect(mockStoreState.clearAll).toHaveBeenCalled();
            expect(mockStoreState.addNotification).toHaveBeenCalledTimes(2);
            expect(mockStoreState.setUnreadCount).toHaveBeenCalledWith(1);
        });
    });

    describe('setBadge', () => {
        it('sets badge count in system and store', async () => {
            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.setBadge(5);
            });

            expect(mockSetBadgeCount).toHaveBeenCalledWith(5);
            expect(mockStoreState.setUnreadCount).toHaveBeenCalledWith(5);
        });
    });

    describe('refreshBadge', () => {
        it('reads badge from system and updates store', async () => {
            mockGetBadgeCount.mockResolvedValue(3);

            const { result } = renderHook(() => useNotifications());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.refreshBadge();
            });

            expect(mockStoreState.setUnreadCount).toHaveBeenCalledWith(3);
        });
    });

    describe('Return values', () => {
        it('exposes store state', () => {
            mockStoreState.permissionGranted = true;
            mockStoreState.pushToken = 'token-abc';
            mockStoreState.unreadCount = 5;
            mockStoreState.notifications = [{ id: 'n1' }] as any;

            const { result } = renderHook(() => useNotifications());

            expect(result.current.hasPermission).toBe(true);
            expect(result.current.fcmToken).toBe('token-abc');
            expect(result.current.unreadCount).toBe(5);
            expect(result.current.notifications).toHaveLength(1);
        });
    });
});
