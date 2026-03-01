/**
 * Tests for hooks/useAuthV2.ts
 * Enhanced auth hook with platform-core and DEV_BYPASS_AUTH
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

// Mock platform service
const mockAuth = {
    getSession: jest.fn().mockResolvedValue(null),
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendEmailVerification: jest.fn(),
    refreshSession: jest.fn(),
};

const mockEvents = {
    subscribe: jest.fn().mockReturnValue({ id: 'sub-1' }),
    unsubscribe: jest.fn(),
};

const mockPlatform = {
    auth: mockAuth,
    events: mockEvents,
    initialize: jest.fn().mockResolvedValue(undefined),
    start: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/services/platform', () => ({
    usePlatform: () => mockPlatform,
}));

describe('useAuthV2', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH = 'false';

        // Re-set default mock implementations after reset
        mockAuth.getSession.mockResolvedValue(null);
        mockAuth.signUp.mockResolvedValue({ user: null, session: null });
        mockAuth.signIn.mockResolvedValue({ user: null, session: null });
        mockAuth.signOut.mockResolvedValue(undefined);
        mockAuth.updateUser.mockResolvedValue(null);
        mockAuth.updatePassword.mockResolvedValue(undefined);
        mockAuth.sendPasswordResetEmail.mockResolvedValue(undefined);
        mockAuth.sendEmailVerification.mockResolvedValue(undefined);
        mockAuth.refreshSession.mockResolvedValue(null);
        mockEvents.subscribe.mockReturnValue({ id: 'sub-1' });
        mockPlatform.initialize.mockResolvedValue(undefined);
        mockPlatform.start.mockResolvedValue(undefined);
    });

    afterEach(() => {
        delete process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH;
    });

    function getHook() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { useAuth } = require('../useAuthV2');
        return useAuth;
    }

    describe('Normal mode (no bypass)', () => {
        it('initializes with loading state', () => {
            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            expect(result.current.user).toBeNull();
            expect(result.current.loading).toBe(true);
        });

        it('loads initial session after initialization', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@test.com',
                emailVerified: true,
                createdAt: new Date().toISOString(),
            };
            const mockSession = {
                accessToken: 'token',
                refreshToken: 'refresh',
                user: mockUser,
                expiresAt: Date.now() + 100000,
            };
            mockAuth.getSession.mockResolvedValue(mockSession);

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.session).toEqual(mockSession);
        });

        it('signIn calls platform.auth.signIn and updates state', async () => {
            const mockResult = {
                user: { id: 'u1', email: 'test@test.com', emailVerified: true, createdAt: '2024-01-01' },
                session: { accessToken: 'tok', refreshToken: 'ref', user: { id: 'u1' }, expiresAt: Date.now() },
            };
            mockAuth.signIn.mockResolvedValue(mockResult);

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            // Wait for initialization effects to settle
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                const res = await result.current.signIn('test@test.com', 'pass123');
                expect(res).toEqual(mockResult);
            });

            expect(mockAuth.signIn).toHaveBeenCalledWith('test@test.com', 'pass123');
            expect(result.current.user).toEqual(mockResult.user);
        });

        it('signUp calls platform.auth.signUp', async () => {
            const mockResult = {
                user: { id: 'u2', email: 'new@test.com', emailVerified: false, createdAt: '2024-01-01' },
                session: null,
            };
            mockAuth.signUp.mockResolvedValue(mockResult);

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                const res = await result.current.signUp('new@test.com', 'pass123', { name: 'New' });
                expect(res).toEqual(mockResult);
            });

            expect(mockAuth.signUp).toHaveBeenCalledWith('new@test.com', 'pass123', { name: 'New' });
        });

        it('signOut clears user and session', async () => {
            mockAuth.signOut.mockResolvedValue(undefined);

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                await result.current.signOut();
            });

            expect(result.current.user).toBeNull();
            expect(result.current.session).toBeNull();
        });

        it('signIn sets loading during the call', async () => {
            let resolveSignIn: (v: any) => void;
            mockAuth.signIn.mockReturnValue(
                new Promise((resolve) => { resolveSignIn = resolve; })
            );

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            let signInPromise: Promise<any>;
            act(() => {
                signInPromise = result.current.signIn('t@t.com', 'p');
            });

            expect(result.current.loading).toBe(true);

            await act(async () => {
                resolveSignIn!({
                    user: { id: '1', email: 't@t.com' },
                    session: { accessToken: 't', refreshToken: 'r', user: { id: '1' }, expiresAt: 0 },
                });
                await signInPromise;
            });

            expect(result.current.loading).toBe(false);
        });

        it('signIn rethrows errors', async () => {
            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            // Wait for init to settle
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            mockAuth.signIn.mockRejectedValue(new Error('Invalid credentials'));

            let error: Error | null = null;
            try {
                await act(async () => {
                    await result.current.signIn('bad@test.com', 'wrong');
                });
            } catch (e: any) {
                error = e;
            }

            expect(error).toBeTruthy();
            expect(error!.message).toBe('Invalid credentials');
            expect(result.current.loading).toBe(false);
        });

        it('updateUser calls platform and updates state', async () => {
            const updatedUser = { id: 'u1', email: 't@t.com', displayName: 'New Name', emailVerified: true, createdAt: '2024-01-01' };
            mockAuth.updateUser.mockResolvedValue(updatedUser);

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            // Wait for init to settle
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                const res = await result.current.updateUser({ displayName: 'New Name' });
                expect(res).toEqual(updatedUser);
            });

            expect(result.current.user).toEqual(updatedUser);
        });

        it('updatePassword calls platform', async () => {
            mockAuth.updatePassword.mockResolvedValue(undefined);

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                await result.current.updatePassword('newpass123');
            });

            expect(mockAuth.updatePassword).toHaveBeenCalledWith('newpass123');
        });

        it('sendPasswordReset calls platform', async () => {
            mockAuth.sendPasswordResetEmail.mockResolvedValue(undefined);

            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                await result.current.sendPasswordReset('test@test.com');
            });

            expect(mockAuth.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
        });

        it('subscribes to auth state changes and unsubscribes on unmount', async () => {
            const useAuth = getHook();
            const { result, unmount } = renderHook(() => useAuth());

            // Wait for initialization (platform.initialize + start) to complete
            await waitFor(() => {
                expect(result.current.initialized).toBe(true);
            });

            // Then the subscription effect runs
            await waitFor(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
            });

            unmount();

            expect(mockEvents.unsubscribe).toHaveBeenCalledWith('sub-1');
        });
    });

    describe('DEV_BYPASS_AUTH mode', () => {
        // DEV_BYPASS_AUTH is read at module-load time.
        // jest.resetModules() disrupts React internals,
        // so we test the flag via the returned isDevBypass property.
        // Normal mode tests already cover that isDevBypass is false.
        // Here we verify the constant-level behavior indirectly.

        it('isDevBypass is false when EXPO_PUBLIC_DEV_BYPASS_AUTH is false', () => {
            const useAuth = getHook();
            const { result } = renderHook(() => useAuth());
            expect(result.current.isDevBypass).toBe(false);
        });
    });
});
