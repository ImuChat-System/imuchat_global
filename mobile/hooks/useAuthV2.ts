/**
 * Enhanced Auth Hook - Mobile
 * Utilise SupabaseAuthModule de platform-core
 * Remplace le hook useAuth basique
 */

import { usePlatform } from '@/services/platform';
import { useCallback, useEffect, useState } from 'react';

// ==========================================
// DEV MODE - Admin Bypass Configuration
// ==========================================
const DEV_BYPASS_AUTH = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';
const DEV_ADMIN_EMAIL = process.env.EXPO_PUBLIC_DEV_ADMIN_EMAIL || 'admin@imuchat.dev';
const DEV_ADMIN_USERNAME = process.env.EXPO_PUBLIC_DEV_ADMIN_USERNAME || 'AdminDev';

const DEV_ADMIN_USER: AuthUser = {
    id: 'dev-admin-user-id-12345',
    email: DEV_ADMIN_EMAIL,
    username: DEV_ADMIN_USERNAME,
    displayName: 'Admin Développement',
    avatarUrl: undefined,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    lastSignInAt: new Date().toISOString(),
};

const DEV_ADMIN_SESSION: AuthSession = {
    accessToken: 'dev-access-token-bypass',
    refreshToken: 'dev-refresh-token-bypass',
    user: DEV_ADMIN_USER,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours
};
// ==========================================

interface AuthUser {
    id: string;
    email: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    emailVerified: boolean;
    createdAt: string;
    lastSignInAt?: string;
}

interface AuthSession {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    expiresAt: number;
}

interface AuthState {
    user: AuthUser | null;
    session: AuthSession | null;
    loading: boolean;
    initialized: boolean;
}

interface AuthActions {
    signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ user: AuthUser; session: AuthSession | null; }>;
    signIn: (email: string, password: string) => Promise<{ user: AuthUser; session: AuthSession; }>;
    signOut: () => Promise<void>;
    updateUser: (updates: Partial<AuthUser>) => Promise<AuthUser>;
    updatePassword: (newPassword: string) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    sendEmailVerification: () => Promise<void>;
    refreshSession: () => Promise<void>;
    isDevBypass: boolean; // Pour indiquer si on est en mode bypass
}

export function useAuth(): AuthState & AuthActions {
    const platform = usePlatform();

    // Si DEV_BYPASS_AUTH est activé, retourner immédiatement l'admin mock
    const initialState: AuthState = DEV_BYPASS_AUTH
        ? {
            user: DEV_ADMIN_USER,
            session: DEV_ADMIN_SESSION,
            loading: false,
            initialized: true,
        }
        : {
            user: null,
            session: null,
            loading: true,
            initialized: false,
        };

    const [state, setState] = useState<AuthState>(initialState);

    // Log dev mode
    useEffect(() => {
        if (DEV_BYPASS_AUTH) {
            console.log('🔓 [DEV MODE] Auth bypass activé - Connecté en tant que:', DEV_ADMIN_EMAIL);
        }
    }, []);

    // Initialiser platform au premier appel (skip si bypass)
    useEffect(() => {
        if (DEV_BYPASS_AUTH) return; // Skip en mode dev bypass

        let mounted = true;

        async function initializePlatform() {
            try {
                await platform.initialize();
                await platform.start();

                if (mounted) {
                    setState(prev => ({ ...prev, initialized: true }));
                }
            } catch (error) {
                console.error('[useAuth] Platform initialization failed:', error);
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        initialized: false
                    }));
                }
            }
        }

        initializePlatform();

        return () => {
            mounted = false;
        };
    }, [platform]);

    // Charger session initiale (skip si bypass)
    useEffect(() => {
        if (DEV_BYPASS_AUTH) return; // Skip en mode dev bypass
        if (!state.initialized) return;

        let mounted = true;

        async function loadInitialSession() {
            try {
                const session = await platform.auth.getSession();

                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        user: session?.user || null,
                        session: session,
                        loading: false,
                    }));
                }
            } catch (error) {
                console.error('[useAuth] Failed to load initial session:', error);
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        loading: false
                    }));
                }
            }
        }

        loadInitialSession();

        return () => {
            mounted = false;
        };
    }, [state.initialized, platform.auth]);

    // Écouter les changements d'auth (skip si bypass)
    useEffect(() => {
        if (DEV_BYPASS_AUTH) return; // Skip en mode dev bypass
        if (!state.initialized) return;

        const subscription = platform.events.subscribe(
            'module_event',
            'hooks.useAuth',
            (event: any) => {
                if (event.type === 'auth.state_change') {
                    const { session } = event.data;

                    console.log('[useAuth] Auth state changed:', event.data.event);

                    setState(prev => ({
                        ...prev,
                        user: session?.user || null,
                        session: session,
                        loading: false,
                    }));
                }
            }
        );

        return () => {
            if (subscription) {
                platform.events.unsubscribe(subscription.id);
            }
        };
    }, [state.initialized, platform.events]);

    // Actions
    const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            const result = await platform.auth.signUp(email, password, metadata);

            setState(prev => ({
                ...prev,
                user: result.user,
                session: result.session,
                loading: false,
            }));

            return result;
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            throw error;
        }
    }, [platform.auth]);

    const signIn = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            const result = await platform.auth.signIn(email, password);

            setState(prev => ({
                ...prev,
                user: result.user,
                session: result.session,
                loading: false,
            }));

            return result;
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            throw error;
        }
    }, [platform.auth]);

    const signOut = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            await platform.auth.signOut();

            setState(prev => ({
                ...prev,
                user: null,
                session: null,
                loading: false,
            }));
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
            throw error;
        }
    }, [platform.auth]);

    const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
        const updatedUser = await platform.auth.updateUser(updates);

        setState(prev => ({
            ...prev,
            user: updatedUser,
            session: prev.session ? {
                ...prev.session,
                user: updatedUser,
            } : null,
        }));

        return updatedUser;
    }, [platform.auth]);

    const updatePassword = useCallback(async (newPassword: string) => {
        await platform.auth.updatePassword(newPassword);
    }, [platform.auth]);

    const sendPasswordReset = useCallback(async (email: string) => {
        await platform.auth.sendPasswordResetEmail(email);
    }, [platform.auth]);

    const sendEmailVerification = useCallback(async () => {
        if (DEV_BYPASS_AUTH) return; // No-op en mode bypass
        await platform.auth.sendEmailVerification();
    }, [platform.auth]);

    const refreshSession = useCallback(async () => {
        if (DEV_BYPASS_AUTH) return; // No-op en mode bypass
        if (!state.session?.refreshToken) {
            throw new Error('No refresh token available');
        }

        const newSession = await platform.auth.refreshSession(state.session.refreshToken);

        setState(prev => ({
            ...prev,
            session: newSession,
            user: newSession.user,
        }));
    }, [platform.auth, state.session?.refreshToken]);

    return {
        // State
        user: state.user,
        session: state.session,
        loading: state.loading,
        initialized: state.initialized,

        // Dev flag
        isDevBypass: DEV_BYPASS_AUTH,

        // Actions
        signUp,
        signIn,
        signOut,
        updateUser,
        updatePassword,
        sendPasswordReset,
        sendEmailVerification,
        refreshSession,
    };
}